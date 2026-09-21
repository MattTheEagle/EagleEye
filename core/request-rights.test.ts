import { describe, expect, it, vi } from "vitest";
import { createRightsGate, effectiveLevel, REFUSE_ALL, type OwnershipKind, type RightsEnvironment } from "./request-rights";
import { serializeRightsTable, type RightsTable } from "./rights-table";

// mod-a: p1 may act on own targets, p2 on all; p3 has no entry.
const TABLE: RightsTable["modules"] = { "mod-a": { p1: "own", p2: "all" } };
const text = (modules: RightsTable["modules"] = TABLE) => serializeRightsTable({ version: 1, modules });

interface Setup {
  // The stored text, or a function that gives it (and may throw).
  table?: string | undefined | (() => string | undefined);
  gms?: string[];
  players?: string[];
  // How the targets relate to the user, by UUID; a UUID that is not listed is "unknown".
  ownership?: Record<string, OwnershipKind>;
}

function makeGate(setup: Setup = {}) {
  const gms = setup.gms ?? ["gm", "assistant"];
  const players = setup.players ?? ["p1", "p2", "p3"];
  const table = "table" in setup ? setup.table : text();
  const storedTable = vi.fn(() => (typeof table === "function" ? table() : table));
  const isGm = vi.fn((userId: string) => (gms.includes(userId) ? true : players.includes(userId) ? false : undefined));
  const ownership = vi.fn(async (uuid: string): Promise<OwnershipKind> => setup.ownership?.[uuid] ?? "unknown");
  const environment: RightsEnvironment = { storedTable, isGm, ownership };
  const log = { warn: vi.fn() };
  return { gate: createRightsGate(environment, log), environment, storedTable, isGm, ownership, log };
}

const ask = (gate: ReturnType<typeof makeGate>["gate"], userId: string | undefined, targets: string[] = [], module = "mod-a") =>
  gate.check({ module, user: userId === undefined ? undefined : { id: userId }, targets });

const DENIED = 'module "mod-a" may not be used by this user';
const ONLY_OWN = 'module "mod-a" may act only on targets this user owns';

describe("createRightsGate", () => {
  it("allows a Gamemaster and an Assistant without a table, with a broken one, and without asking who owns the targets", async () => {
    for (const table of [undefined, "", "not json", () => { throw new Error("no setting"); }]) {
      const { gate, ownership } = makeGate({ table, ownership: { "Actor.a": "foreign" } });

      for (const userId of ["gm", "assistant"]) {
        expect(await ask(gate, userId, ["Actor.a"]), `${userId} with ${String(table)}`).toEqual({ ok: true });
      }
      expect(ownership).not.toHaveBeenCalled();
    }
  });

  it("decides for a player by level and target: no entry, own and all, own targets, foreign and unknown ones", async () => {
    const ownership: Record<string, OwnershipKind> = { mine: "own", mine2: "own", theirs: "foreign", lost: "unknown" };
    const cases: Array<[string, string, string[], string, boolean]> = [
      ["no entry for the user", "p3", [], "mod-a", false],
      ["no entry for the module", "p1", [], "mod-b", false],
      ["own without a target", "p1", [], "mod-a", true],
      ["own with an own target", "p1", ["mine"], "mod-a", true],
      ["own with two own targets", "p1", ["mine", "mine2"], "mod-a", true],
      ["own with a foreign target", "p1", ["theirs"], "mod-a", false],
      ["own with an unknown target", "p1", ["lost"], "mod-a", false],
      ["own with an own and a foreign target", "p1", ["mine", "theirs"], "mod-a", false],
      ["own with a foreign and an own target", "p1", ["theirs", "mine"], "mod-a", false],
      ["all without a target", "p2", [], "mod-a", true],
      ["all with a foreign target", "p2", ["theirs"], "mod-a", true],
      ["all with an unknown target", "p2", ["lost"], "mod-a", true],
    ];
    for (const [name, userId, targets, module, allowed] of cases) {
      const { gate } = makeGate({ ownership });
      const verdict = await ask(gate, userId, targets, module);

      expect(verdict.ok, name).toBe(allowed);
      if (!verdict.ok) expect(verdict.detail, name).toBe(module === "mod-b" || userId === "p3" ? `module "${module}" may not be used by this user` : ONLY_OWN);
    }
  });

  it("asks who owns a target only for an own level with targets: once per target, for the user, and not any more after the first that is not owned", async () => {
    const ownership: Record<string, OwnershipKind> = { a: "own", b: "foreign", c: "own" };
    const { gate, ownership: asked } = makeGate({ ownership });

    expect(await ask(gate, "p1", ["a", "b", "c"])).toMatchObject({ ok: false });
    expect(asked.mock.calls).toEqual([["a", "p1"], ["b", "p1"]]);

    asked.mockClear();
    expect(await ask(gate, "p1", ["a", "c"])).toEqual({ ok: true });
    expect(asked.mock.calls).toEqual([["a", "p1"], ["c", "p1"]]);

    asked.mockClear();
    await ask(gate, "p2", ["a", "b"]); // all
    await ask(gate, "p3", ["a", "b"]); // no entry
    await ask(gate, "p1", []); // no target
    await ask(gate, "gm", ["a", "b"]);
    expect(asked).not.toHaveBeenCalled();
  });

  it("refuses a request without a user and one for a user nobody knows, even when the table has an entry for that id", async () => {
    const { gate } = makeGate({ table: text({ "mod-a": { ghost: "all" } }) });

    const expected = { ok: false, detail: "the user of this request is not known" };
    expect(await ask(gate, undefined)).toEqual(expected);
    expect(await ask(gate, "ghost")).toEqual(expected);

    // an environment that cannot say whether the user has a Gamemaster role
    const unclear = createRightsGate({ storedTable: () => text(), isGm: () => null as never, ownership: async () => "own" });
    expect(await ask(unclear, "p1")).toEqual(expected);
  });

  it("refuses every player and allows a Gamemaster when the table cannot be read", async () => {
    const broken: Array<[string, Setup["table"]]> = [
      ["not JSON", "{oops"],
      ["wrong version", '{"version":2,"modules":{}}'],
      ["a level that does not exist", '{"version":1,"modules":{"mod-a":{"p2":"root"}}}'],
      ["reading throws", () => { throw new Error("settings not ready"); }],
    ];
    for (const [name, table] of broken) {
      const { gate } = makeGate({ table });

      expect(await ask(gate, "p2"), name).toEqual({
        ok: false,
        detail: "the rights could not be read, so nothing is allowed until they can",
      });
      expect(await ask(gate, "gm"), name).toEqual({ ok: true });
    }
  });

  it("warns once about a table that cannot be read, and again only after it could be read in between", async () => {
    let stored: string | undefined = "{oops";
    const { gate, log } = makeGate({ table: () => stored });

    await ask(gate, "p2");
    await ask(gate, "p1");
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(String(log.warn.mock.calls[0][0])).toContain("not valid JSON");

    stored = text();
    expect(await ask(gate, "p2")).toEqual({ ok: true });
    expect(log.warn).toHaveBeenCalledTimes(1);

    stored = "{oops";
    await ask(gate, "p2");
    expect(log.warn).toHaveBeenCalledTimes(2);
  });

  it("refuses instead of throwing when the environment fails, and treats an answer that is not 'own' as not owned", async () => {
    const failing: Array<[string, Partial<RightsEnvironment>]> = [
      ["isGm throws", { isGm: () => { throw new Error("users gone"); } }],
      ["ownership throws", { ownership: () => { throw new Error("no such document class"); } }],
      ["ownership rejects", { ownership: () => Promise.reject(new Error("pack offline")) }],
    ];
    for (const [name, override] of failing) {
      const gate = createRightsGate({
        storedTable: () => text(),
        isGm: (id) => (id === "gm" ? true : id.startsWith("p") ? false : undefined),
        ownership: async () => "own",
        ...override,
      });

      // p1 has the level "own", so a target sends the check to the environment
      expect(await ask(gate, "p1", ["Actor.a"]), name).toEqual({ ok: false, detail: "the rights could not be checked" });
    }

    for (const answer of ["maybe", undefined, null, true, 1]) {
      const gate = createRightsGate({ storedTable: () => text(), isGm: () => false, ownership: async () => answer as never });
      expect(await ask(gate, "p1", ["Actor.a"]), String(answer)).toMatchObject({ ok: false });
    }
  });

  it("gives the same reason for a target that belongs to someone else and one that cannot be found", async () => {
    const { gate } = makeGate({ ownership: { theirs: "foreign", lost: "unknown" } });

    const foreign = await ask(gate, "p1", ["theirs"]);
    const unknown = await ask(gate, "p1", ["lost"]);

    expect(foreign).toEqual({ ok: false, detail: ONLY_OWN });
    expect(unknown).toEqual(foreign);
    expect(await ask(gate, "p3")).toEqual({ ok: false, detail: DENIED });
  });
});

describe("createRightsGate: a request type for a Gamemaster or Assistant only", () => {
  const ONLY_GM = "this request may only be made by a Gamemaster or Assistant";
  const askGmOnly = (gate: ReturnType<typeof makeGate>["gate"], userId: string | undefined, targets: string[] = []) =>
    gate.check({ module: "mod-a", user: userId === undefined ? undefined : { id: userId }, targets, gmOnly: true });

  it("allows a Gamemaster and an Assistant, whatever the table says", async () => {
    for (const table of [undefined, "not json", text({})]) {
      const { gate } = makeGate({ table });
      for (const userId of ["gm", "assistant"]) {
        expect(await askGmOnly(gate, userId), `${userId} with ${String(table)}`).toEqual({ ok: true });
      }
    }
  });

  it("refuses a player of every level, also the one that would be allowed for an ordinary request", async () => {
    const { gate, ownership, storedTable } = makeGate();
    // p1 has "own", p2 has "all", p3 has no entry: all three are refused with the same text.
    for (const userId of ["p1", "p2", "p3"]) {
      expect(await askGmOnly(gate, userId), userId).toEqual({ ok: false, detail: ONLY_GM });
    }
    // ... and the same request without the flag is what it was before.
    expect(await ask(gate, "p2")).toEqual({ ok: true });
    expect(await ask(gate, "p1")).toEqual({ ok: true });
    expect(ownership).not.toHaveBeenCalled();
    // The refusal does not depend on the stored rights, so they are not read for it.
    storedTable.mockClear();
    await askGmOnly(gate, "p2");
    expect(storedTable).not.toHaveBeenCalled();
  });

  it("refuses a player when the rights cannot be read, with the same text, and a user nobody knows with the known text", async () => {
    const { gate } = makeGate({ table: "not json" });
    expect(await askGmOnly(gate, "p1")).toEqual({ ok: false, detail: ONLY_GM });
    expect(await askGmOnly(gate, undefined)).toEqual({ ok: false, detail: "the user of this request is not known" });
    expect(await askGmOnly(gate, "stranger")).toEqual({ ok: false, detail: "the user of this request is not known" });
  });

  it("does not change what a request without the flag does (gmOnly false or missing)", async () => {
    const { gate } = makeGate();
    expect(await gate.check({ module: "mod-a", user: { id: "p3" }, targets: [], gmOnly: false })).toEqual({ ok: false, detail: DENIED });
    expect(await gate.check({ module: "mod-a", user: { id: "p2" }, targets: [], gmOnly: false })).toEqual({ ok: true });
  });
});

describe("effectiveLevel", () => {
  it("is all for a Gamemaster or Assistant, the stored level for a player, and denied for anyone who is not known or when the table cannot be read", () => {
    const { environment } = makeGate();

    expect(effectiveLevel(environment, "mod-a", "gm")).toBe("all");
    expect(effectiveLevel(environment, "mod-b", "assistant")).toBe("all");
    expect(effectiveLevel(environment, "mod-a", "p1")).toBe("own");
    expect(effectiveLevel(environment, "mod-a", "p2")).toBe("all");
    expect(effectiveLevel(environment, "mod-a", "p3")).toBe("denied");
    expect(effectiveLevel(environment, "mod-b", "p1")).toBe("denied");
    expect(effectiveLevel(environment, "mod-a", "ghost")).toBe("denied");
    expect(effectiveLevel(environment, "mod-a", undefined)).toBe("denied");

    const broken = makeGate({ table: "{oops" }).environment;
    expect(effectiveLevel(broken, "mod-a", "p2")).toBe("denied");
    expect(effectiveLevel(broken, "mod-a", "gm")).toBe("all");

    const failing = { ...environment, isGm: () => { throw new Error("users gone"); } };
    expect(effectiveLevel(failing, "mod-a", "p2")).toBe("denied");
  });
});

describe("REFUSE_ALL", () => {
  it("refuses everybody, also a Gamemaster, so a failed set-up never opens anything", async () => {
    for (const user of [{ id: "gm" }, { id: "p2" }, undefined]) {
      expect(await REFUSE_ALL.check({ module: "mod-a", user, targets: [] })).toEqual({
        ok: false,
        detail: "the rights could not be set up, so nothing is allowed",
      });
    }
  });
});

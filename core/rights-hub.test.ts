import { describe, expect, it, vi } from "vitest";
import { applyRightsInput, listRights, type RightsHubSource, type RightsHubUser } from "./rights-hub";
import { parseRightsTable, serializeRightsTable, type RightsTable } from "./rights-table";

const PLAYERS: RightsHubUser[] = [
  { id: "p1", name: "Anna" },
  { id: "p2", name: "Ben" },
  { id: "p3", name: "Cleo" },
];
const MODULES = ["mod-a", "mod-b"];
const text = (modules: RightsTable["modules"]) => serializeRightsTable({ version: 1, modules });

interface Setup {
  canEdit?: boolean;
  players?: () => readonly RightsHubUser[];
  // What is stored: a text, nothing, or a function that gives it (and may throw).
  stored?: string | undefined | (() => string | undefined);
  store?: (text: string) => Promise<unknown>;
}

function makeSource(setup: Setup = {}) {
  let stored = setup.stored;
  const store = vi.fn(
    setup.store ??
      (async (value: string) => {
        stored = value;
      }),
  );
  const source: RightsHubSource = {
    canEdit: () => setup.canEdit ?? true,
    players: setup.players ?? (() => PLAYERS),
    storedTable: () => (typeof stored === "function" ? stored() : stored),
    store,
  };
  return { source, store, stored: () => (typeof stored === "function" ? stored() : stored) };
}

// The table that is stored after a write, read back the way the rights check reads it.
function tableOf(value: string | undefined): RightsTable {
  const parsed = parseRightsTable(value);
  if (!parsed.ok) throw new Error(`test setup: ${parsed.detail}`);
  return parsed.value;
}

describe("listRights", () => {
  it("lists the players with their level for the module, denied without an entry, and neither a Gamemaster nor a user who is gone", () => {
    const { source } = makeSource({
      stored: text({ "mod-a": { p1: "own", p2: "all", gm: "all", gone: "own" }, "mod-b": { p3: "own" } }),
    });

    expect(listRights("mod-a", source)).toEqual({
      rows: [
        { userId: "p1", name: "Anna", level: "own" },
        { userId: "p2", name: "Ben", level: "all" },
        { userId: "p3", name: "Cleo", level: "denied" },
      ],
      unreadable: false,
    });
    expect(listRights("mod-b", source).rows.map((row) => row.level)).toEqual(["denied", "denied", "own"]);
    expect(listRights("mod-c", makeSource().source)).toMatchObject({ unreadable: false });
    expect(listRights("mod-c", makeSource().source).rows.every((row) => row.level === "denied")).toBe(true);
  });

  it("shows every player as denied and says so when the stored rights cannot be read, and never throws", () => {
    const broken: Array<[string, Setup]> = [
      ["not JSON", { stored: "{oops" }],
      ["a level that does not exist", { stored: '{"version":1,"modules":{"mod-a":{"p1":"root"}}}' }],
      [
        "reading throws",
        {
          stored: () => {
            throw new Error("settings not ready");
          },
        },
      ],
    ];
    for (const [name, setup] of broken) {
      const listing = listRights("mod-a", makeSource(setup).source);

      expect(listing.unreadable, name).toBe(true);
      expect(listing.rows.map((row) => row.level), name).toEqual(["denied", "denied", "denied"]);
    }

    const noUsers = makeSource({
      players: () => {
        throw new Error("users gone");
      },
    });
    expect(listRights("mod-a", noUsers.source)).toEqual({ rows: [], unreadable: false });
  });
});

describe("applyRightsInput", () => {
  it("stores the level of a player as a table the rights check reads back, and replaces an earlier level", async () => {
    const setup = makeSource();

    expect(await applyRightsInput("mod-a", "p1", "own", MODULES, setup.source)).toEqual({ ok: true, value: "own" });
    expect(setup.store).toHaveBeenCalledTimes(1);
    expect(tableOf(setup.stored())).toEqual({ version: 1, modules: { "mod-a": { p1: "own" } } });

    expect(await applyRightsInput("mod-a", "p1", "all", MODULES, setup.source)).toEqual({ ok: true, value: "all" });
    expect(await applyRightsInput("mod-b", "p2", "own", MODULES, setup.source)).toEqual({ ok: true, value: "own" });
    expect(tableOf(setup.stored())).toEqual({ version: 1, modules: { "mod-a": { p1: "all" }, "mod-b": { p2: "own" } } });
  });

  it("removes the entry for denied and keeps every other entry", async () => {
    const setup = makeSource({ stored: text({ "mod-a": { p1: "own", p2: "all" }, "mod-b": { p1: "all" } }) });

    expect(await applyRightsInput("mod-a", "p1", "denied", MODULES, setup.source)).toEqual({ ok: true, value: "denied" });

    expect(tableOf(setup.stored())).toEqual({ version: 1, modules: { "mod-a": { p2: "all" }, "mod-b": { p1: "all" } } });
  });

  it("drops the entries of users who are gone from the module it writes, and replaces a stored text that is not a table", async () => {
    const stale = makeSource({ stored: text({ "mod-a": { p2: "all", gone: "own" }, "mod-b": { gone: "own" } }) });

    await applyRightsInput("mod-a", "p1", "own", MODULES, stale.source);

    expect(tableOf(stale.stored())).toEqual({ version: 1, modules: { "mod-b": { gone: "own" }, "mod-a": { p2: "all", p1: "own" } } });

    const garbage = makeSource({ stored: "{oops" });
    expect(await applyRightsInput("mod-a", "p1", "own", MODULES, garbage.source)).toEqual({ ok: true, value: "own" });
    expect(tableOf(garbage.stored())).toEqual({ version: 1, modules: { "mod-a": { p1: "own" } } });
  });

  it("refuses without writing: not the Gamemaster, a module that is not registered, a user who is not a player, a level that does not exist", async () => {
    const refusals: Array<[string, Setup, unknown[], string]> = [
      ["not the Gamemaster", { canEdit: false }, ["mod-a", "p1", "own"], "not-permitted"],
      ["module not registered", {}, ["stranger", "p1", "own"], "not-allowed"],
      ["user unknown", {}, ["mod-a", "ghost", "own"], "unknown-user"],
      ["user is a Gamemaster", {}, ["mod-a", "gm", "all"], "unknown-user"],
      ["level foreign", {}, ["mod-a", "p1", "foreign"], "invalid-value"],
      ["level in capitals", {}, ["mod-a", "p1", "OWN"], "invalid-value"],
      ["level empty", {}, ["mod-a", "p1", ""], "invalid-value"],
      ["level a number", {}, ["mod-a", "p1", 2], "invalid-value"],
      ["level missing", {}, ["mod-a", "p1", undefined], "invalid-value"],
    ];
    for (const [name, setup, [moduleId, userId, level], reason] of refusals) {
      const { source, store } = makeSource(setup);

      const result = await applyRightsInput(moduleId as string, userId as string, level, MODULES, source);

      expect(result, name).toMatchObject({ ok: false, reason });
      expect(store, name).not.toHaveBeenCalled();
    }
  });

  it("returns write-failed instead of rejecting, and leaves the stored rights alone when they cannot be read", async () => {
    const failing = makeSource({ store: () => Promise.reject(new Error("no permission")) });
    expect(await applyRightsInput("mod-a", "p1", "own", MODULES, failing.source)).toEqual({
      ok: false,
      reason: "write-failed",
      detail: "no permission",
    });

    const unreadable = makeSource({
      stored: () => {
        throw new Error("settings not ready");
      },
    });
    expect(await applyRightsInput("mod-a", "p1", "own", MODULES, unreadable.source)).toMatchObject({
      ok: false,
      reason: "write-failed",
      detail: "settings not ready",
    });
    expect(unreadable.store).not.toHaveBeenCalled();

    const noUsers = makeSource({
      players: () => {
        throw new Error("users gone");
      },
    });
    expect(await applyRightsInput("mod-a", "p1", "own", MODULES, noUsers.source)).toMatchObject({ ok: false, reason: "write-failed" });
    expect(noUsers.store).not.toHaveBeenCalled();
  });
});

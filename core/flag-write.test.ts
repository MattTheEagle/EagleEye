import { describe, expect, it, vi } from "vitest";
import { createFlagHandler, FLAG_DOCUMENT_TYPES, MAX_FLAG_VALUE_LENGTH, NO_FLAGS, type FlagEnvironment, type FlagTarget } from "./flag-write";
import type { JsonValue } from "./json-value";
import type { RegisteredModule } from "./module-registry";
import { createRightsGate } from "./request-rights";
import { serializeRightsTable } from "./rights-table";

const MODULE: RegisteredModule = { id: "mod-a", title: "Module A", version: "1.0.0", apiVersion: "0.12.0" };
const PACK = "world.eagle-species-2014";
const ID = "AAAAAAAAAAAAAAAA";

// A world with one compendium; `flags` holds "<namespace>.<key>" per document id.
function makeWorld(over: { target?: Partial<FlagTarget> | null; flags?: Record<string, JsonValue>; ids?: string[] } = {}) {
  const flags = new Map<string, JsonValue>(Object.entries(over.flags ?? {}));
  const ids = new Set(over.ids ?? [ID]);
  const target: FlagTarget | undefined =
    over.target === null ? undefined : { collection: PACK, documentName: "Item", world: true, locked: false, has: (id) => ids.has(id), ...over.target };
  const set = vi.fn(async (_collection: string, id: string, namespace: string, key: string, value: JsonValue | null) => {
    if (value === null) flags.delete(`${id}.${namespace}.${key}`);
    else flags.set(`${id}.${namespace}.${key}`, value);
  });
  const environment: FlagEnvironment = {
    target: vi.fn(async () => target),
    get: vi.fn(async (_c, id, namespace, key) => flags.get(`${id}.${namespace}.${key}`)),
    set,
  };
  return { flags, set, environment, handler: createFlagHandler(environment) };
}

const payload = (over: Record<string, unknown> = {}) => ({ pack: PACK, id: ID, key: "subspecies", value: { species: "Elf" }, ...over });
const run = (handler: ReturnType<typeof makeWorld>["handler"], p: unknown, module = MODULE) => {
  const checked = handler.validate(p);
  if (!checked.ok) throw new Error(`test setup: ${checked.detail}`);
  return handler.run(checked.value, { module, user: { id: "gm" } });
};

describe("compendium.flag: the definition", () => {
  it("is version 1, runs on the Gamemaster's client, is for a Gamemaster or Assistant only and names no target", () => {
    const { handler } = makeWorld();
    expect(handler.type).toBe("compendium.flag");
    expect(handler.versions).toEqual([1]);
    expect(handler.runsOn).toBe("gm");
    expect(handler.gmOnly).toBe(true);
    expect(handler.targets).toBeUndefined();
    expect([...FLAG_DOCUMENT_TYPES]).toEqual(["Actor", "Item", "JournalEntry", "RollTable"]);
  });
});

describe("compendium.flag: the payload", () => {
  const { handler } = makeWorld();

  it("accepts a world compendium, an id, a key and a JSON value or null, and hands on the checked values only", () => {
    expect(handler.validate({ ...payload(), extra: 1 })).toEqual({ ok: true, value: { pack: PACK, id: ID, key: "subspecies", value: { species: "Elf" } } });
    for (const value of [null, 5, "text", true, [], [1, "x"], {}, { a: { b: null } }]) {
      expect(handler.validate(payload({ value })), JSON.stringify(value)).toMatchObject({ ok: true });
    }
    for (const key of ["a", "sub-species", "a1-b2", "x".repeat(100)]) expect(handler.validate(payload({ key })), key).toMatchObject({ ok: true });
  });

  it("rejects a payload that is not an object", () => {
    for (const bad of [undefined, null, "text", 5, true, [], [payload()]]) expect(handler.validate(bad), JSON.stringify(bad)).toMatchObject({ ok: false });
  });

  it("rejects a pack that is not a world compendium, an id that is not 16 letters and digits, a key with a period or capital, and names the field", () => {
    for (const pack of [undefined, "eagle-species", "dnd5e.items", "world.", "world.A", 5]) {
      expect(handler.validate(payload({ pack })), String(pack)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.pack") });
    }
    for (const id of [undefined, "", "short", "A".repeat(17), "AAAAAAAAAAAAAAA-", 5]) {
      expect(handler.validate(payload({ id })), String(id)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.id") });
    }
    for (const key of [undefined, "", "Sub", "a.b", "a b", "-a", "a-", "a--b", "eagle-library.x", "x".repeat(101), 5, null]) {
      expect(handler.validate(payload({ key })), String(key)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.key") });
    }
  });

  it("rejects a value that is missing, not JSON or too long", () => {
    const missing = { pack: PACK, id: ID, key: "k" };
    expect(handler.validate(missing)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.value") });
    expect(handler.validate(payload({ value: () => 1 }))).toMatchObject({ ok: false, detail: expect.stringContaining("payload.value") });
    expect(handler.validate(payload({ value: { a: undefined } }))).toMatchObject({ ok: false });
    const long = "x".repeat(MAX_FLAG_VALUE_LENGTH - 2);
    expect(handler.validate(payload({ value: long }))).toMatchObject({ ok: true });
    expect(handler.validate(payload({ value: long + "xx" }))).toMatchObject({ ok: false, detail: expect.stringContaining(String(MAX_FLAG_VALUE_LENGTH)) });
  });
});

describe("compendium.flag: running", () => {
  it("sets the flag of the module that asks and says it changed", async () => {
    const { handler, set, flags } = makeWorld();
    expect(await run(handler, payload())).toEqual({ pack: PACK, id: ID, key: "subspecies", changed: true });
    expect(set).toHaveBeenCalledWith(PACK, ID, "mod-a", "subspecies", { species: "Elf" });
    expect(flags.get(`${ID}.mod-a.subspecies`)).toEqual({ species: "Elf" });
  });

  it("writes the namespace of the asking module, whichever module that is: a module reaches its own flags only", async () => {
    const { handler, set } = makeWorld();
    await run(handler, payload(), { ...MODULE, id: "mod-b" });
    expect(set).toHaveBeenCalledWith(PACK, ID, "mod-b", "subspecies", expect.anything());
    expect(set).not.toHaveBeenCalledWith(PACK, ID, "mod-a", expect.anything(), expect.anything());
  });

  it("is safe to ask again: the same value changes nothing and writes nothing", async () => {
    const { handler, set } = makeWorld({ flags: { [`${ID}.mod-a.subspecies`]: { species: "Elf" } } });
    expect(await run(handler, payload())).toMatchObject({ changed: false });
    expect(set).not.toHaveBeenCalled();
  });

  it("changes a flag that holds another value", async () => {
    const { handler, flags } = makeWorld({ flags: { [`${ID}.mod-a.subspecies`]: { species: "Dwarf" } } });
    expect(await run(handler, payload())).toMatchObject({ changed: true });
    expect(flags.get(`${ID}.mod-a.subspecies`)).toEqual({ species: "Elf" });
  });

  it("removes a flag with null, and removing a flag that is not there changes nothing", async () => {
    const held = makeWorld({ flags: { [`${ID}.mod-a.subspecies`]: { species: "Elf" } } });
    expect(await run(held.handler, payload({ value: null }))).toMatchObject({ changed: true });
    expect(held.flags.has(`${ID}.mod-a.subspecies`)).toBe(false);
    const none = makeWorld();
    expect(await run(none.handler, payload({ value: null }))).toMatchObject({ changed: false });
    expect(none.set).not.toHaveBeenCalled();
  });

  it("refuses a compendium that does not exist, is not a world compendium, is locked, holds another type, or has no such document", async () => {
    const cases: Array<[Parameters<typeof makeWorld>[0], string]> = [
      [{ target: null }, "does not exist"],
      [{ target: { world: false } }, "is not a world compendium"],
      [{ target: { locked: true } }, "is locked"],
      [{ target: { documentName: "Scene" } }, "cannot be changed"],
      [{ ids: [] }, "has no document"],
    ];
    for (const [over, message] of cases) {
      const { handler, set } = makeWorld(over);
      await expect(run(handler, payload())).rejects.toThrow(message);
      expect(set).not.toHaveBeenCalled();
    }
  });

  it("lets the message of Foundry through when writing fails", async () => {
    const { handler, environment } = makeWorld();
    (environment.set as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("permission denied"));
    await expect(run(handler, payload())).rejects.toThrow("permission denied");
  });
});

describe("compendium.flag: the rights", () => {
  const table = serializeRightsTable({ version: 1, modules: { "mod-a": { p1: "own", p2: "all" } } });
  const gate = createRightsGate({
    storedTable: () => table,
    isGm: (userId) => (["gm", "assistant"].includes(userId) ? true : ["p1", "p2", "p3"].includes(userId) ? false : undefined),
    ownership: async () => "own",
  });
  const { handler } = makeWorld();
  const check = (userId: string) => gate.check({ module: "mod-a", user: { id: userId }, targets: [], gmOnly: handler.gmOnly });

  it("refuses a player whatever the level and allows a Gamemaster and an Assistant", async () => {
    for (const userId of ["p1", "p2", "p3"]) expect(await check(userId), userId).toEqual({ ok: false, detail: "this request may only be made by a Gamemaster or Assistant" });
    for (const userId of ["gm", "assistant"]) expect(await check(userId), userId).toEqual({ ok: true });
  });
});

describe("NO_FLAGS", () => {
  it("knows no compendium and cannot write", async () => {
    expect(await NO_FLAGS.target("world.x")).toBeUndefined();
    expect(await NO_FLAGS.get("world.x", ID, "a", "b")).toBeUndefined();
    await expect(NO_FLAGS.set("world.x", ID, "a", "b", null)).rejects.toThrow("without Foundry");
    expect(Object.isFrozen(NO_FLAGS)).toBe(true);
  });
});

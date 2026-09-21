import { describe, expect, it, vi } from "vitest";
import {
  createImportHandler,
  IMPORTABLE_DOCUMENT_TYPES,
  MAX_IMPORT_SOURCES,
  NO_IMPORTS,
  type ImportEntry,
  type ImportEnvironment,
  type ImportSource,
  type ImportTarget,
} from "./document-import";
import { isJsonValue } from "./json-value";
import type { RegisteredModule } from "./module-registry";
import { createRightsGate } from "./request-rights";
import { serializeRightsTable } from "./rights-table";

const MODULE: RegisteredModule = { id: "mod-a", title: "Module A", version: "1.0.0", apiVersion: "0.9.0" };
const GM = { id: "gm-1" };
const PACK = "world.eagle-weapons-2014";

const source = (id: string, over: Partial<ImportSource> = {}): ImportSource => ({
  uuid: `Compendium.dnd5e.items.Item.${id}`,
  id,
  name: `Item ${id}`,
  documentName: "Item",
  primary: true,
  pack: "dnd5e.items",
  ...over,
});

// A world with one target compendium and some documents. `copy` puts the documents in the compendium as Foundry would.
function makeWorld(over: { target?: Partial<ImportTarget> | null; sources?: ImportSource[]; existing?: string[] } = {}) {
  const sources = new Map((over.sources ?? []).map((s) => [s.uuid, s]));
  const inside = new Set(over.existing ?? []);
  const target: ImportTarget | undefined =
    over.target === null
      ? undefined
      : { collection: PACK, documentName: "Item", world: true, locked: false, has: (id) => inside.has(id), ...over.target };
  const copy = vi.fn(async (collection: string, entries: readonly ImportEntry[]) =>
    entries.map((entry) => {
      const s = sources.get(entry.source)!;
      const id = entry.id ?? s.id;
      inside.add(id);
      return { uuid: `Compendium.${collection}.${s.documentName}.${id}`, id, name: entry.name ?? s.name };
    }),
  );
  const environment: ImportEnvironment = {
    target: vi.fn(async () => target),
    source: vi.fn(async (uuid: string) => sources.get(uuid)),
    copy,
  };
  return { copy, inside, environment, handler: createImportHandler(environment) };
}

const uuids = (...ids: string[]) => ids.map((id) => `Compendium.dnd5e.items.Item.${id}`);
const payload = (over: Record<string, unknown> = {}) => ({ pack: PACK, sources: uuids("a1"), ...over });
const entries = (...uuidList: string[]): ImportEntry[] => uuidList.map((source) => ({ source }));
const run = (handler: ReturnType<typeof makeWorld>["handler"], p: { pack: string; sources: readonly (string | ImportEntry)[] }) => {
  const checked = handler.validate(p);
  if (!checked.ok) throw new Error(`test setup: ${checked.detail}`);
  return handler.run(checked.value, { module: MODULE, user: GM });
};

describe("compendium.import: the definition", () => {
  it("is version 1, runs on the Gamemaster's client, is for a Gamemaster or Assistant only and names its sources as targets", () => {
    const { handler } = makeWorld();
    expect(handler.type).toBe("compendium.import");
    expect(handler.versions).toEqual([1]);
    expect(handler.runsOn).toBe("gm");
    expect(handler.gmOnly).toBe(true);
    expect(handler.targets?.({ pack: PACK, sources: entries(...uuids("a", "b")) })).toEqual(uuids("a", "b"));
  });

  it("copies the four document types of the Eagle catalog", () => {
    expect([...IMPORTABLE_DOCUMENT_TYPES]).toEqual(["Actor", "Item", "JournalEntry", "RollTable"]);
    expect(MAX_IMPORT_SOURCES).toBe(100);
  });
});

describe("compendium.import: the payload", () => {
  const { handler } = makeWorld();

  it("accepts a world compendium and one to 100 different UUIDs, and hands on the checked values only", () => {
    expect(handler.validate({ ...payload(), extra: 1 })).toEqual({ ok: true, value: { pack: PACK, sources: entries(...uuids("a1")) } });
    const many = Array.from({ length: 100 }, (_, i) => `Compendium.dnd5e.items.Item.id${i}`);
    expect(handler.validate(payload({ sources: many }))).toMatchObject({ ok: true });
    for (const pack of ["world.a", "world.eagle_x-1", `world.${"x".repeat(100)}`]) {
      expect(handler.validate(payload({ pack })), pack).toMatchObject({ ok: true });
    }
  });

  it("rejects a payload that is not an object", () => {
    for (const bad of [undefined, null, "text", 5, true, [], [payload()]]) {
      expect(handler.validate(bad), JSON.stringify(bad)).toMatchObject({ ok: false });
    }
  });

  it("rejects a pack that is not the id of a world compendium, and names the field", () => {
    for (const pack of [undefined, null, 5, "", "eagle-weapons", "dnd5e.items", "module.x", "world.", "world.Eagle", "world.a b",
      "world.a.b", "world.-a", "world.a--b", `world.${"x".repeat(200)}`, {}]) {
      const check = handler.validate(payload({ pack }));
      expect(check, JSON.stringify(pack)).toMatchObject({ ok: false });
      expect(check).toMatchObject({ detail: expect.stringContaining("payload.pack") });
    }
  });

  it("rejects sources that are missing, not a list, empty, too many, not text, empty, too long or repeated, and names the field", () => {
    const tooMany = Array.from({ length: 101 }, (_, i) => `u${i}`);
    for (const sources of [undefined, null, "uuid", {}, [], tooMany, [5], [""], [null], ["x".repeat(201)], ["a", "a"], ["a", ["b"]]]) {
      const check = handler.validate(payload({ sources }));
      expect(check, JSON.stringify(sources)?.slice(0, 40)).toMatchObject({ ok: false });
      expect(check).toMatchObject({ detail: expect.stringContaining("payload.sources") });
    }
    expect(handler.validate(payload({ sources: ["x".repeat(200)] }))).toMatchObject({ ok: true });
  });
});

describe("compendium.import: copying", () => {
  it("copies the documents in one operation, in the order of the sources, and answers with the new documents", async () => {
    const { handler, copy } = makeWorld({ sources: [source("a1"), source("b2")] });

    const result = await run(handler, { pack: PACK, sources: uuids("b2", "a1") });

    expect(copy).toHaveBeenCalledTimes(1);
    expect(copy).toHaveBeenCalledWith(PACK, entries(...uuids("b2", "a1")));
    expect(result).toEqual({
      pack: PACK,
      created: [
        { source: uuids("b2")[0], uuid: `Compendium.${PACK}.Item.b2`, id: "b2", name: "Item b2" },
        { source: uuids("a1")[0], uuid: `Compendium.${PACK}.Item.a1`, id: "a1", name: "Item a1" },
      ],
      existed: [],
    });
    expect(isJsonValue(result)).toBe(true);
  });

  it("does not write a document whose id is in the compendium already, and answers it as existing", async () => {
    const { handler, copy } = makeWorld({ sources: [source("a1"), source("b2"), source("c3")], existing: ["b2"] });

    const result = await run(handler, { pack: PACK, sources: uuids("a1", "b2", "c3") });

    expect(copy).toHaveBeenCalledWith(PACK, entries(...uuids("a1", "c3")));
    expect(result).toMatchObject({
      created: [{ id: "a1" }, { id: "c3" }],
      existed: [{ source: uuids("b2")[0], uuid: `Compendium.${PACK}.Item.b2`, id: "b2", name: "Item b2" }],
    });
  });

  it("is safe to ask again: the second time nothing is written", async () => {
    const { handler, copy, inside } = makeWorld({ sources: [source("a1"), source("b2")] });
    await run(handler, { pack: PACK, sources: uuids("a1", "b2") });
    const again = await run(handler, { pack: PACK, sources: uuids("a1", "b2") });

    expect(copy).toHaveBeenCalledTimes(1);
    expect(again).toMatchObject({ created: [], existed: [{ id: "a1" }, { id: "b2" }] });
    expect(inside.size).toBe(2);
  });

  it("does not call copy at all when every document is there", async () => {
    const { handler, copy } = makeWorld({ sources: [source("a1")], existing: ["a1"] });
    await run(handler, { pack: PACK, sources: uuids("a1") });
    expect(copy).not.toHaveBeenCalled();
  });

  it("copies documents of each catalog type into a compendium of that type", async () => {
    for (const documentName of IMPORTABLE_DOCUMENT_TYPES) {
      const { handler } = makeWorld({
        target: { documentName },
        sources: [source("a1", { documentName, uuid: `Compendium.x.y.${documentName}.a1` })],
      });
      const result = await run(handler, { pack: PACK, sources: [`Compendium.x.y.${documentName}.a1`] });
      expect(result, documentName).toMatchObject({ created: [{ uuid: `Compendium.${PACK}.${documentName}.a1` }] });
    }
  });

  it("takes a document of the world as a source as well, only not one that is inside another document", async () => {
    const world = source("w1", { uuid: "Item.w1", pack: undefined });
    const { handler } = makeWorld({ sources: [world] });
    expect(await run(handler, { pack: PACK, sources: ["Item.w1"] })).toMatchObject({ created: [{ id: "w1" }] });
  });
});

describe("compendium.import: what is checked before anything is written", () => {
  async function refused(over: Parameters<typeof makeWorld>[0], sources: string[], message: string | RegExp) {
    const { handler, copy } = makeWorld(over);
    await expect(run(handler, { pack: PACK, sources })).rejects.toThrow(message);
    expect(copy).not.toHaveBeenCalled();
  }

  it("refuses a compendium that does not exist", async () => {
    await refused({ target: null, sources: [source("a1")] }, uuids("a1"), `the compendium ${PACK} does not exist`);
  });

  it("refuses a compendium that is not a world compendium", async () => {
    await refused({ target: { world: false }, sources: [source("a1")] }, uuids("a1"), "is not a world compendium");
  });

  it("refuses a locked compendium and does not unlock it", async () => {
    await refused({ target: { locked: true }, sources: [source("a1")] }, uuids("a1"), "is locked");
  });

  it("refuses a compendium of a type that is not copied", async () => {
    for (const documentName of ["Scene", "Macro", "Playlist", "Cards", "Adventure"]) {
      await refused({ target: { documentName }, sources: [source("a1", { documentName })] }, uuids("a1"), "cannot be copied");
    }
  });

  it("refuses a source that cannot be read", async () => {
    await refused({ sources: [source("a1")] }, uuids("a1", "zz"), "the source Compendium.dnd5e.items.Item.zz cannot be read");
  });

  it("refuses a source that lives inside another document", async () => {
    await refused({ sources: [source("a1", { primary: false })] }, uuids("a1"), "lives inside another document");
  });

  it("refuses a source that is in the target compendium already", async () => {
    await refused({ sources: [source("a1", { pack: PACK })] }, uuids("a1"), `is in the compendium ${PACK} already`);
  });

  it("refuses a source of another document type than the compendium holds", async () => {
    await refused({ sources: [source("a1", { documentName: "Actor" })] }, uuids("a1"), "is a Actor, the compendium world.eagle-weapons-2014 holds Item");
  });

  it("refuses two sources with the same id, and writes none of the documents even when the first ones are fine", async () => {
    const other = source("a1", { uuid: "Compendium.other.items.Item.a1", pack: "other.items" });
    await refused({ sources: [source("a1"), other, source("b2")] }, [...uuids("b2", "a1"), other.uuid], "two copies would have the id a1");
  });

  it("names the first problem of a list and writes nothing, whichever document is the bad one", async () => {
    await refused({ sources: [source("a1"), source("b2", { primary: false })] }, uuids("a1", "b2"), "lives inside another document");
  });
});

describe("compendium.import: when Foundry does not do as asked", () => {
  it("fails when Foundry answers another number of documents than were to be copied", async () => {
    const { handler, environment } = makeWorld({ sources: [source("a1"), source("b2")] });
    (environment.copy as ReturnType<typeof vi.fn>).mockResolvedValueOnce([{ uuid: "u", id: "a1", name: "n" }]);
    await expect(run(handler, { pack: PACK, sources: uuids("a1", "b2") })).rejects.toThrow("2 documents were to be copied, Foundry answered 1");
  });

  it("lets the message of Foundry through when writing fails", async () => {
    const { handler, environment } = makeWorld({ sources: [source("a1")] });
    (environment.copy as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("permission denied"));
    await expect(run(handler, { pack: PACK, sources: uuids("a1") })).rejects.toThrow("permission denied");
  });

  it("lets the message of Foundry through when the compendium cannot be looked up", async () => {
    const { handler, environment } = makeWorld({ sources: [source("a1")] });
    (environment.target as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("index failed"));
    await expect(run(handler, { pack: PACK, sources: uuids("a1") })).rejects.toThrow("index failed");
  });
});

describe("NO_IMPORTS", () => {
  it("knows no compendium and no document, and cannot copy", async () => {
    expect(await NO_IMPORTS.target("world.x")).toBeUndefined();
    expect(await NO_IMPORTS.source("Item.x")).toBeUndefined();
    await expect(NO_IMPORTS.copy("world.x", [{ source: "Item.x" }])).rejects.toThrow("without Foundry");
    expect(Object.isFrozen(NO_IMPORTS)).toBe(true);
  });
});

describe("compendium.import: the rights", () => {
  const table = serializeRightsTable({ version: 1, modules: { "mod-a": { p1: "own", p2: "all" } } });
  const gate = createRightsGate({
    storedTable: () => table,
    isGm: (userId) => (["gm", "assistant"].includes(userId) ? true : ["p1", "p2", "p3"].includes(userId) ? false : undefined),
    ownership: async () => "own",
  });
  const { handler } = makeWorld();
  const check = (userId: string) =>
    gate.check({ module: "mod-a", user: { id: userId }, targets: handler.targets!({ pack: PACK, sources: entries(...uuids("a1")) }), gmOnly: handler.gmOnly });

  it("refuses a player whatever the level, even one who owns every source, and allows a Gamemaster and an Assistant", async () => {
    for (const userId of ["p1", "p2", "p3"]) {
      expect(await check(userId), userId).toEqual({ ok: false, detail: "this request may only be made by a Gamemaster or Assistant" });
    }
    for (const userId of ["gm", "assistant"]) expect(await check(userId), userId).toEqual({ ok: true });
  });
});

const ID_A = "AAAAAAAAAAAAAAAA";
const ID_B = "BBBBBBBBBBBBBBBB";

describe("compendium.import: entries with an id, a name and changes (a copy that is not the source as it is)", () => {
  const { handler } = makeWorld();
  const one = (entry: Record<string, unknown>) => handler.validate(payload({ sources: [{ source: uuids("a1")[0], ...entry }] }));

  it("accepts an entry as an object with only a source, and with an id, a name and changes, and hands the checked values on", () => {
    expect(one({})).toEqual({ ok: true, value: { pack: PACK, sources: [{ source: uuids("a1")[0] }] } });
    expect(one({ id: ID_A, name: "  Longsword (Duplicate) ", changes: { "system.container": null }, extra: 1 })).toEqual({
      ok: true,
      value: { pack: PACK, sources: [{ source: uuids("a1")[0], id: ID_A, name: "Longsword (Duplicate)", changes: { "system.container": null } }] },
    });
  });

  it("accepts strings and objects side by side", () => {
    expect(handler.validate(payload({ sources: [uuids("a1")[0], { source: uuids("b2")[0] }] }))).toMatchObject({ ok: true });
  });

  it("rejects an object without a usable source, an id that is not 16 letters and digits, a name that is empty or too long", () => {
    for (const bad of [{ source: undefined }, { source: "" }, { source: 5 }, { source: "x".repeat(201) }]) {
      expect(handler.validate(payload({ sources: [bad] })), JSON.stringify(bad)).toMatchObject({ ok: false });
    }
    for (const id of ["", "short", "A".repeat(17), "AAAAAAAAAAAAAAA-", 5, null]) {
      const check = one({ id });
      expect(check, JSON.stringify(id)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.sources[].id") });
    }
    for (const name of ["", "   ", "x".repeat(201), 5, null]) {
      expect(one({ name }), JSON.stringify(name)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.sources[].name") });
    }
    expect(one({ name: "x".repeat(200) })).toMatchObject({ ok: true });
  });

  it("rejects changes that are not an object, have too many paths, a path that is not allowed or a value that is not JSON", () => {
    for (const changes of [null, "x", 5, [], [1]]) {
      expect(one({ changes }), JSON.stringify(changes)).toMatchObject({ ok: false, detail: expect.stringContaining("changes") });
    }
    const many = Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`f${i}`, 1]));
    expect(one({ changes: many })).toMatchObject({ ok: false });
    expect(one({ changes: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [`f${i}`, 1])) })).toMatchObject({ ok: true });
    for (const path of ["", "1a", "a..b", ".a", "a.", "a b", "_id", "_id.x", "_stats", "_stats.compendiumSource", "a/b", "$x"]) {
      expect(one({ changes: { [path]: 1 } }), path).toMatchObject({ ok: false, detail: expect.stringContaining("path") });
    }
    for (const path of ["name", "system.container", "system.a-b.c1", "flags.eagle-library.x", "_other"]) {
      expect(one({ changes: { [path]: "v" } }), path).toMatchObject({ ok: true });
    }
    expect(one({ changes: { a: undefined } })).toMatchObject({ ok: false });
    expect(one({ changes: { a: () => 1 } })).toMatchObject({ ok: false });
    expect(one({ changes: { a: { b: [1, "x", null] } } })).toMatchObject({ ok: true });
  });

  it("lets the same document be copied twice under two ids, and rejects it twice under the same id or with none", () => {
    const u = uuids("a1")[0];
    expect(handler.validate(payload({ sources: [{ source: u, id: ID_A }, { source: u, id: ID_B }] }))).toMatchObject({ ok: true });
    for (const sources of [
      [{ source: u, id: ID_A }, { source: u, id: ID_A }],
      [u, u],
      [u, { source: u }],
      [{ source: u }, { source: u }],
    ]) {
      expect(handler.validate(payload({ sources })), JSON.stringify(sources)).toMatchObject({ ok: false, detail: expect.stringContaining("twice") });
    }
  });
});

describe("compendium.import: running with entries", () => {
  it("gives the copy the id, the name and the changes of the entry, and names the entry's values in the answer", async () => {
    const { handler, copy } = makeWorld({ sources: [source("a1")] });
    const entry = { source: uuids("a1")[0]!, id: ID_A, name: "Name a1 (Duplicate)", changes: { "system.container": null } };

    const result = await run(handler, { pack: PACK, sources: [entry] });

    expect(copy).toHaveBeenCalledWith(PACK, [entry]);
    expect(result).toEqual({
      pack: PACK,
      created: [{ source: uuids("a1")[0], uuid: `Compendium.${PACK}.Item.${ID_A}`, id: ID_A, name: "Name a1 (Duplicate)" }],
      existed: [],
    });
  });

  it("is safe to ask again for a copy with its own id: it is found by that id, not by the id of the source", async () => {
    const { handler, copy } = makeWorld({ sources: [source("a1")] });
    const request = { pack: PACK, sources: [{ source: uuids("a1")[0]!, id: ID_A, name: "Copy" }] };
    await run(handler, request);
    const again = await run(handler, request);

    expect(copy).toHaveBeenCalledTimes(1);
    expect(again).toEqual({
      pack: PACK,
      created: [],
      existed: [{ source: uuids("a1")[0], uuid: `Compendium.${PACK}.Item.${ID_A}`, id: ID_A, name: "Copy" }],
    });
  });

  it("copies the source as it is and, next to it, a copy with its own id; and neither counts as the other", async () => {
    const { handler, copy } = makeWorld({ sources: [source("a1")] });
    await run(handler, { pack: PACK, sources: [uuids("a1")[0]!] });
    const forced = await run(handler, { pack: PACK, sources: [{ source: uuids("a1")[0]!, id: ID_A, name: "Copy" }] });

    expect(copy).toHaveBeenCalledTimes(2);
    expect(forced).toMatchObject({ created: [{ id: ID_A }], existed: [] });
  });

  it("copies one document twice in one request under two ids, reading the source once", async () => {
    const { handler, copy, environment } = makeWorld({ sources: [source("a1")] });
    const u = uuids("a1")[0]!;
    const result = await run(handler, { pack: PACK, sources: [{ source: u, id: ID_A }, { source: u, id: ID_B }] });

    expect(copy).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({ created: [{ id: ID_A }, { id: ID_B }] });
    expect(environment.source).toHaveBeenCalledTimes(1);
  });

  it("refuses two copies with the same final id, also when one is the id of the source and the other an id given", async () => {
    const long = "CCCCCCCCCCCCCCCC";
    const { handler, copy } = makeWorld({ sources: [source(long), source("b2")] });
    await expect(run(handler, { pack: PACK, sources: [uuids(long)[0]!, { source: uuids("b2")[0]!, id: long }] })).rejects.toThrow(
      `two copies would have the id ${long}`,
    );
    expect(copy).not.toHaveBeenCalled();
  });

  it("checks a source that is used twice once for what it is, and still refuses a source inside another document", async () => {
    const { handler, copy } = makeWorld({ sources: [source("a1", { primary: false })] });
    const u = uuids("a1")[0]!;
    await expect(run(handler, { pack: PACK, sources: [{ source: u, id: ID_A }, { source: u, id: ID_B }] })).rejects.toThrow("lives inside another document");
    expect(copy).not.toHaveBeenCalled();
  });

  it("names the sources of the entries as its targets, each once", () => {
    const { handler } = makeWorld();
    const u = uuids("a1")[0]!;
    expect(handler.targets!({ pack: PACK, sources: [{ source: u, id: ID_A }, { source: u, id: ID_B }, { source: uuids("b2")[0]! }] })).toEqual([u, uuids("b2")[0]]);
  });
});

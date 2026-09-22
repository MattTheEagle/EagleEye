import { describe, expect, it, vi } from "vitest";
import {
  createDocumentCreateHandler,
  CREATABLE_DOCUMENT_TYPES,
  NO_DOCUMENTS,
  type CreatedDocument,
  type CreateTarget,
  type DocumentCreateEnvironment,
} from "./document-create";
import type { JsonValue } from "./json-value";
import type { RegisteredModule } from "./module-registry";
import { createRightsGate } from "./request-rights";
import { serializeRightsTable } from "./rights-table";

const MODULE: RegisteredModule = { id: "eagle-homebrew", title: "Eagle Homebrew", version: "0.0.1", apiVersion: "0.13.0" };
const PACK = "world.eagle-loot-2014";
const ID = "AAAAAAAAAAAAAAAA";

// A world with one pack target (or, with `world: true`, the world's own Item collection instead); `docs` holds the
// names of documents that already exist there, by id.
function makeWorld(
  over: {
    target?: Partial<CreateTarget> | null;
    world?: boolean;
    docs?: Record<string, string>;
    createName?: (data: Readonly<Record<string, JsonValue>>) => string;
  } = {},
) {
  const docs = new Map(Object.entries(over.docs ?? {}));
  const target: CreateTarget | undefined =
    over.target === null
      ? undefined
      : {
          kind: over.world ? "world" : "pack",
          collection: over.world ? "Item" : PACK,
          documentName: "Item",
          locked: false,
          has: (id) => docs.has(id),
          ...over.target,
        };
  const create = vi.fn(async (_target: CreateTarget, id: string, data: Readonly<Record<string, JsonValue>>): Promise<CreatedDocument> => {
    const name = over.createName ? over.createName(data) : (data.name as string);
    docs.set(id, name);
    return { name };
  });
  const environment: DocumentCreateEnvironment = {
    target: vi.fn(async () => target),
    nameOf: vi.fn(async (_t, id) => docs.get(id)),
    create,
  };
  return { docs, create, environment, handler: createDocumentCreateHandler(environment) };
}

const payload = (over: Record<string, unknown> = {}) => ({ target: { pack: PACK }, id: ID, data: { name: "Rope, 50 feet" }, ...over });
const run = (handler: ReturnType<typeof makeWorld>["handler"], p: unknown, module = MODULE) => {
  const checked = handler.validate(p);
  if (!checked.ok) throw new Error(`test setup: ${checked.detail}`);
  return handler.run(checked.value, { module, user: { id: "gm" } });
};

describe("document.create: the definition", () => {
  it("is version 1, runs on the Gamemaster's client, is for a Gamemaster or Assistant only and names no target", () => {
    const { handler } = makeWorld();
    expect(handler.type).toBe("document.create");
    expect(handler.versions).toEqual([1]);
    expect(handler.runsOn).toBe("gm");
    expect(handler.gmOnly).toBe(true);
    expect(handler.targets).toBeUndefined();
    expect([...CREATABLE_DOCUMENT_TYPES]).toEqual(["Actor", "Item", "JournalEntry", "RollTable"]);
  });
});

describe("document.create: the payload", () => {
  const { handler } = makeWorld();

  it("accepts a pack target or a world target, an id and data with a name, and hands on the checked values only", () => {
    expect(handler.validate({ ...payload(), extra: 1 })).toEqual({
      ok: true,
      value: { target: { pack: PACK }, id: ID, data: { name: "Rope, 50 feet" } },
    });
    for (const world of CREATABLE_DOCUMENT_TYPES) {
      expect(handler.validate(payload({ target: { world } })), world).toMatchObject({ ok: true, value: { target: { world } } });
    }
    expect(handler.validate(payload({ data: { name: "  Rope  " } }))).toMatchObject({ ok: true, value: { data: { name: "Rope" } } });
    expect(handler.validate(payload({ data: { name: "Rope", "system.weight": 10, flags: { "eagle-homebrew": { pair: { world: ID } } } } }))).toMatchObject({
      ok: true,
    });
  });

  it("rejects a payload that is not an object", () => {
    for (const bad of [undefined, null, "text", 5, true, [], [payload()]]) expect(handler.validate(bad), JSON.stringify(bad)).toMatchObject({ ok: false });
  });

  it("rejects a target that names both pack and world, neither, or an invalid one", () => {
    for (const target of [undefined, {}, { pack: PACK, world: "Item" }, { pack: "eagle-loot" }, { pack: "dnd5e.items" }, { world: "Scene" }, { world: 5 }, "world.x"]) {
      expect(handler.validate(payload({ target })), JSON.stringify(target)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.target") });
    }
  });

  it("rejects an id that is not 16 letters and digits", () => {
    for (const id of [undefined, "", "short", "A".repeat(17), "AAAAAAAAAAAAAAA-", 5]) {
      expect(handler.validate(payload({ id })), String(id)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.id") });
    }
  });

  it("rejects data that is not an object, has no name, or holds _id or _stats", () => {
    for (const data of [undefined, null, "text", 5, [], {}, { name: "" }, { name: "  " }, { name: "x".repeat(201) }]) {
      expect(handler.validate(payload({ data })), JSON.stringify(data)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.data") });
    }
    expect(handler.validate(payload({ data: { name: "Rope", _id: ID } }))).toMatchObject({ ok: false, detail: expect.stringContaining("_id") });
    expect(handler.validate(payload({ data: { name: "Rope", _stats: {} } }))).toMatchObject({ ok: false, detail: expect.stringContaining("_stats") });
    expect(handler.validate(payload({ data: { name: "Rope", bad: () => 1 } }))).toMatchObject({ ok: false, detail: expect.stringContaining("payload.data") });
  });
});

describe("document.create: running", () => {
  it("creates the document at a pack target and answers with its UUID", async () => {
    const { handler, create, docs } = makeWorld();
    expect(await run(handler, payload())).toEqual({
      target: { pack: PACK },
      created: true,
      uuid: `Compendium.${PACK}.Item.${ID}`,
      id: ID,
      name: "Rope, 50 feet",
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ kind: "pack" }), ID, { name: "Rope, 50 feet" });
    expect(docs.get(ID)).toBe("Rope, 50 feet");
  });

  it("creates the document at a world target and answers with a UUID that names no compendium", async () => {
    const { handler } = makeWorld({ world: true });
    expect(await run(handler, payload({ target: { world: "Item" } }))).toEqual({
      target: { world: "Item" },
      created: true,
      uuid: `Item.${ID}`,
      id: ID,
      name: "Rope, 50 feet",
    });
  });

  it("is safe to ask again: a document of that id at the target that exists already is not written", async () => {
    const { handler, create } = makeWorld({ docs: { [ID]: "Rope, 50 feet" } });
    expect(await run(handler, payload())).toEqual({
      target: { pack: PACK },
      created: false,
      uuid: `Compendium.${PACK}.Item.${ID}`,
      id: ID,
      name: "Rope, 50 feet",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("refuses a target that does not exist, is locked, or holds another document type", async () => {
    const cases: Array<[Parameters<typeof makeWorld>[0], string]> = [
      [{ target: null }, "does not exist"],
      [{ target: { locked: true } }, "is locked"],
      [{ target: { documentName: "Scene" } }, "cannot be created"],
    ];
    for (const [over, message] of cases) {
      const { handler, create } = makeWorld(over);
      await expect(run(handler, payload())).rejects.toThrow(message);
      expect(create).not.toHaveBeenCalled();
    }
  });

  it("names a missing world collection in the failure, for a target given as { world }", async () => {
    const { handler } = makeWorld({ target: null });
    await expect(run(handler, payload({ target: { world: "Actor" } }))).rejects.toThrow("world collection of Actor");
  });

  it("lets the message of Foundry through when creating fails", async () => {
    const { handler, environment } = makeWorld();
    (environment.create as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("permission denied"));
    await expect(run(handler, payload())).rejects.toThrow("permission denied");
  });
});

describe("document.create: the rights", () => {
  const table = serializeRightsTable({ version: 1, modules: { "eagle-homebrew": { p1: "own", p2: "all" } } });
  const gate = createRightsGate({
    storedTable: () => table,
    isGm: (userId) => (["gm", "assistant"].includes(userId) ? true : ["p1", "p2", "p3"].includes(userId) ? false : undefined),
    ownership: async () => "own",
  });
  const { handler } = makeWorld();
  const check = (userId: string) => gate.check({ module: "eagle-homebrew", user: { id: userId }, targets: [], gmOnly: handler.gmOnly });

  it("refuses a player whatever the level and allows a Gamemaster and an Assistant", async () => {
    for (const userId of ["p1", "p2", "p3"]) expect(await check(userId), userId).toEqual({ ok: false, detail: "this request may only be made by a Gamemaster or Assistant" });
    for (const userId of ["gm", "assistant"]) expect(await check(userId), userId).toEqual({ ok: true });
  });
});

describe("NO_DOCUMENTS", () => {
  it("knows no target and cannot create", async () => {
    expect(await NO_DOCUMENTS.target({ pack: "world.x" })).toBeUndefined();
    expect(await NO_DOCUMENTS.nameOf({ kind: "pack", collection: "world.x", documentName: "Item", locked: false, has: () => false }, ID)).toBeUndefined();
    await expect(
      NO_DOCUMENTS.create({ kind: "pack", collection: "world.x", documentName: "Item", locked: false, has: () => false }, ID, { name: "x" }),
    ).rejects.toThrow("without Foundry");
    expect(Object.isFrozen(NO_DOCUMENTS)).toBe(true);
  });
});

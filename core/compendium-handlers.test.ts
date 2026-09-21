import { describe, expect, it, vi } from "vitest";
import {
  COMPENDIUM_DOCUMENT_TYPES,
  createCompendiumHandler,
  NO_COMPENDIUMS,
  type CompendiumEnvironment,
  type CompendiumInfo,
  type CompendiumMetadata,
} from "./compendium-handlers";
import { isJsonValue } from "./json-value";
import type { RegisteredModule } from "./module-registry";

const MODULE: RegisteredModule = { id: "mod-a", title: "Module A", version: "1.0.0", apiVersion: "0.10.0" };
const GM = { id: "gm-1" };

// A world with compendia in a table; `create` puts a new one in it as Foundry would, with the state Foundry gives it.
function makeWorld(initial: CompendiumInfo[] = [], state: Partial<CompendiumInfo> = {}) {
  const packs = new Map<string, CompendiumInfo>(initial.map((info) => [info.name, info]));
  const create = vi.fn(async (metadata: CompendiumMetadata): Promise<CompendiumInfo> => {
    const info: CompendiumInfo = {
      name: metadata.name,
      collection: `world.${metadata.name}`,
      label: metadata.label,
      type: metadata.type,
      locked: false,
      ownership: { PLAYER: "OBSERVER", ASSISTANT: "OWNER" },
      ...state,
    };
    packs.set(info.name, info);
    return info;
  });
  const find = vi.fn((name: string) => packs.get(name));
  const environment: CompendiumEnvironment = { find, create };
  return { packs, create, find, handler: createCompendiumHandler(environment) };
}

const payload = (over: Record<string, unknown> = {}) => ({ type: "Item", label: "Eagle Spells (2014)", name: "eagle-spells-2014", ...over });

describe("compendium.create: the definition", () => {
  it("is version 1, runs on the Gamemaster's client, is for a Gamemaster or Assistant only and names no target", () => {
    const { handler } = makeWorld();
    expect(handler.type).toBe("compendium.create");
    expect(handler.versions).toEqual([1]);
    expect(handler.runsOn).toBe("gm");
    expect(handler.gmOnly).toBe(true);
    expect(handler.targets).toBeUndefined();
  });

  it("lists the nine document types of a compendium", () => {
    expect([...COMPENDIUM_DOCUMENT_TYPES]).toEqual([
      "Actor",
      "Adventure",
      "Cards",
      "Item",
      "JournalEntry",
      "Macro",
      "Playlist",
      "RollTable",
      "Scene",
    ]);
  });
});

describe("compendium.create: the payload", () => {
  const { handler } = makeWorld();

  it("accepts every document type and a name of lower case letters and digits joined by hyphens or underscores", () => {
    for (const type of COMPENDIUM_DOCUMENT_TYPES) {
      expect(handler.validate(payload({ type })), type).toMatchObject({ ok: true });
    }
    for (const name of ["a", "eagle", "eagle-spells-2014", "eagle_spells_2014", "a1-b2_c3", "2014", "x".repeat(100)]) {
      expect(handler.validate(payload({ name })), name).toMatchObject({ ok: true });
    }
  });

  it("hands on the checked values: the label without white space at its ends, other fields dropped", () => {
    expect(handler.validate({ ...payload(), label: "  Eagle Spells  ", extra: 1 })).toEqual({
      ok: true,
      value: { type: "Item", label: "Eagle Spells", name: "eagle-spells-2014" },
    });
  });

  it("rejects a payload that is not an object", () => {
    for (const bad of [undefined, null, "text", 5, true, [], [payload()]]) {
      expect(handler.validate(bad), JSON.stringify(bad)).toMatchObject({ ok: false });
    }
  });

  it("rejects a type that is not a document type of a compendium, or not text, and names the fields", () => {
    for (const type of ["item", "Actors", "Folder", "", "World", 5, null, undefined, {}]) {
      const check = handler.validate(payload({ type }));
      expect(check, JSON.stringify(type)).toMatchObject({ ok: false });
      expect(check).toMatchObject({ detail: expect.stringContaining("payload.type") });
    }
  });

  it("rejects a label that is missing, not text, empty, only white space or too long", () => {
    for (const label of [undefined, null, 5, "", "   ", "\n\t", "x".repeat(201), {}]) {
      const check = handler.validate(payload({ label }));
      expect(check, JSON.stringify(label)).toMatchObject({ ok: false });
      expect(check).toMatchObject({ detail: expect.stringContaining("payload.label") });
    }
    expect(handler.validate(payload({ label: "x".repeat(200) }))).toMatchObject({ ok: true });
  });

  it("rejects a name that is missing, not text, empty, too long or outside the safe part of Foundry's rule", () => {
    const names: unknown[] = [
      undefined, null, 5, "", {}, "x".repeat(101),
      "Eagle-Spells", "eagle spells", "eagle.spells", "world.eagle-spells", "eagle/spells", "eagle-", "-eagle", "eagle--spells",
      "_eagle", "eagle__spells", "eagle-_spells", "eagle-spélls", "eagle\n", " eagle", "eagle-spells ", "../eagle",
    ];
    for (const name of names) {
      const check = handler.validate(payload({ name }));
      expect(check, JSON.stringify(name)).toMatchObject({ ok: false });
      expect(check).toMatchObject({ detail: expect.stringContaining("payload.name") });
    }
  });
});

describe("compendium.create: running", () => {
  it("creates a compendium that does not exist and answers with its state", async () => {
    const { handler, create, packs } = makeWorld();

    const result = await handler.run({ type: "Item", label: "Eagle Spells (2014)", name: "eagle-spells-2014" }, { module: MODULE, user: GM });

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({ type: "Item", label: "Eagle Spells (2014)", name: "eagle-spells-2014" });
    expect(packs.has("eagle-spells-2014")).toBe(true);
    expect(result).toEqual({
      created: true,
      collection: "world.eagle-spells-2014",
      name: "eagle-spells-2014",
      label: "Eagle Spells (2014)",
      type: "Item",
      locked: false,
      ownership: { PLAYER: "OBSERVER", ASSISTANT: "OWNER" },
    });
  });

  it("reports the state Foundry gave the new compendium, whatever it is, and changes nothing about it", async () => {
    const { handler, create } = makeWorld([], { locked: true, ownership: { PLAYER: "NONE" } });
    const result = await handler.run({ type: "Actor", label: "L", name: "n" }, { module: MODULE });
    expect(result).toMatchObject({ created: true, locked: true, ownership: { PLAYER: "NONE" } });
    // only createCompendium is called, with three fields: no lock, no ownership, nothing else
    expect(create).toHaveBeenCalledTimes(1);
    expect(Object.keys(create.mock.calls[0]?.[0] ?? {}).sort()).toEqual(["label", "name", "type"]);
  });

  it("is safe to repeat: a compendium of that name and type that exists is left alone and answered with created: false", async () => {
    const { handler, create } = makeWorld();
    const input = { type: "Item" as const, label: "Eagle Spells (2014)", name: "eagle-spells-2014" };

    const first = await handler.run(input, { module: MODULE });
    const second = await handler.run(input, { module: MODULE });
    const third = await handler.run({ ...input, label: "A different label" }, { module: MODULE });

    expect(create).toHaveBeenCalledTimes(1);
    expect(first).toMatchObject({ created: true });
    expect(second).toEqual({ ...(first as object), created: false });
    // an existing compendium is described as it is, not as asked for
    expect(third).toMatchObject({ created: false, label: "Eagle Spells (2014)" });
  });

  it("fails without touching anything when the name is taken by a compendium of another document type", async () => {
    const taken: CompendiumInfo = {
      name: "eagle-spells-2014",
      collection: "world.eagle-spells-2014",
      label: "Mine",
      type: "Actor",
      locked: false,
      ownership: {},
    };
    const { handler, create, packs } = makeWorld([taken]);

    await expect(handler.run({ type: "Item", label: "L", name: "eagle-spells-2014" }, { module: MODULE })).rejects.toThrow(
      "the compendium world.eagle-spells-2014 exists with the document type Actor, not Item",
    );
    expect(create).not.toHaveBeenCalled();
    expect(packs.get("eagle-spells-2014")).toBe(taken);
  });

  it("lets Foundry's failure through, so the kernel answers handler-failed with Foundry's message", async () => {
    const environment: CompendiumEnvironment = {
      find: () => undefined,
      create: async () => {
        throw new Error("You do not have permission to create a compendium");
      },
    };
    const handler = createCompendiumHandler(environment);
    await expect(handler.run({ type: "Item", label: "L", name: "n" }, { module: MODULE })).rejects.toThrow("permission");

    const failingFind = createCompendiumHandler({ find: () => { throw new Error("packs not ready"); }, create: environment.create });
    await expect(failingFind.run({ type: "Item", label: "L", name: "n" }, { module: MODULE })).rejects.toThrow("packs not ready");
  });

  it("answers plain JSON, and drops ownership levels that are not text", async () => {
    const { handler } = makeWorld([], { ownership: { PLAYER: "OBSERVER", ASSISTANT: undefined as never, TRUSTED: 3 as never } });
    const result = await handler.run({ type: "Item", label: "L", name: "n" }, { module: MODULE });
    expect(isJsonValue(result)).toBe(true);
    expect(result).toMatchObject({ ownership: { PLAYER: "OBSERVER" } });
    expect((result as { ownership: object }).ownership).not.toHaveProperty("ASSISTANT");
    expect((result as { ownership: object }).ownership).not.toHaveProperty("TRUSTED");
  });

  it("does not look at the module or the user: who may ask is decided by the rights", async () => {
    const { handler } = makeWorld();
    expect(await handler.run({ type: "Item", label: "L", name: "n1" }, { module: MODULE })).toMatchObject({ created: true });
    expect(await handler.run({ type: "Item", label: "L", name: "n2" }, { module: { ...MODULE, id: "other" }, user: { id: "p1" } })).toMatchObject({
      created: true,
    });
  });
});

describe("NO_COMPENDIUMS", () => {
  it("has no compendium and cannot create one", async () => {
    expect(NO_COMPENDIUMS.find("anything")).toBeUndefined();
    await expect(NO_COMPENDIUMS.create({ type: "Item", label: "L", name: "n" })).rejects.toThrow("without Foundry");
    expect(Object.isFrozen(NO_COMPENDIUMS)).toBe(true);
  });
});

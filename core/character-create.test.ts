import { describe, expect, it, vi } from "vitest";
import {
  CHARACTER_CREATE_MARKER_VERSION,
  CHARACTER_CREATE_MODULE_ID,
  CHARACTER_CREATE_TYPE,
  createCharacterCreateHandler,
  validateCharacterCreate,
  type CharacterCreateEnvironment,
  type CharacterCreateInput,
  type CharacterCreateRecord,
} from "./character-create";
import { ModuleRegistry, type ModuleInfo, type ModuleInfoSource, type RegisteredModule } from "./module-registry";
import { createRequestKernel } from "./request-kernel";
import { createRightsGate } from "./request-rights";

const ID = "AbCdEfGhIjKlMnOp";
const PLAYER = "player-1";
const API = "0.15.0";

const characterModule: RegisteredModule = {
  id: CHARACTER_CREATE_MODULE_ID,
  title: "Eagle Character Edit",
  version: "0.1.0",
  apiVersion: API,
};

function record(input: CharacterCreateInput): CharacterCreateRecord {
  return {
    id: input.id,
    name: input.name,
    type: "character",
    ownership: {
      default: "none",
      ...(input.ownership === "requester" ? { [input.requesterId]: "owner" } : {}),
    },
    marker: input.marker,
  };
}

function makeEnvironment(): CharacterCreateEnvironment & { records: Map<string, CharacterCreateRecord>; create: ReturnType<typeof vi.fn> } {
  const records = new Map<string, CharacterCreateRecord>();
  const create = vi.fn(async (input: CharacterCreateInput) => {
    const created = record(input);
    records.set(input.id, created);
    return created;
  });
  return {
    records,
    isGm: (id) => (id === "gm" || id === "assistant" ? true : id === PLAYER || id === "player-2" ? false : undefined),
    get: async (id) => records.get(id),
    ownershipMatches: (candidate, id, ownership) => {
      if (candidate.ownership.default !== "none") return false;
      const entries = Object.entries(candidate.ownership).filter(([key]) => key !== "default");
      return ownership === "none" ? entries.length === 0 : entries.length === 1 && entries[0]?.[0] === id && entries[0]?.[1] === "owner";
    },
    legacyOwnershipMatches: (candidate, id, ownership) => {
      if (candidate.ownership.default !== "none") return false;
      const entries = Object.entries(candidate.ownership).filter(([key]) => key !== "default");
      if (ownership === "requester") return entries.length === 1 && entries[0]?.[0] === id && entries[0]?.[1] === "owner";
      return entries.length === 0 || (entries.length === 1 && entries[0]?.[0] === id && entries[0]?.[1] === "owner");
    },
    repairOwnership: async (candidate, id, ownership) => {
      const repaired = {
        ...candidate,
        ownership: { default: "none", ...(ownership === "requester" ? { [id]: "owner" } : {}) },
        marker: { version: CHARACTER_CREATE_MARKER_VERSION, requesterId: id, operationId: candidate.id },
      };
      records.set(candidate.id, repaired);
      return repaired;
    },
    create,
  };
}

function context(userId = PLAYER, module = characterModule) {
  return { module, user: { id: userId } };
}

describe("character.create payload", () => {
  it("accepts only the trimmed name and a 16-character operation id", () => {
    expect(validateCharacterCreate({ name: "  New hero  ", operationId: ID })).toEqual({
      ok: true,
      value: { name: "New hero", operationId: ID },
    });
    for (const value of [
      undefined,
      null,
      [],
      {},
      { name: "", operationId: ID },
      { name: " ", operationId: ID },
      { name: "x".repeat(201), operationId: ID },
      { name: "Name", operationId: "too-short" },
      { name: "Name", operationId: ID, owner: PLAYER },
      { name: "Name", operationId: ID, requester: PLAYER },
      { name: "Name", operationId: ID, type: "npc" },
      { name: "Name", operationId: ID, data: {} },
      JSON.parse('{"name":"Name","operationId":"AbCdEfGhIjKlMnOp","flags":{}}'),
    ]) {
      expect(validateCharacterCreate(value), JSON.stringify(value)).toMatchObject({ ok: false });
    }
  });
});

describe("character.create handler", () => {
  it("creates exactly the bounded Player-owned World Actor and returns no actor data", async () => {
    const environment = makeEnvironment();
    const handler = createCharacterCreateHandler(environment);

    expect(handler.type).toBe(CHARACTER_CREATE_TYPE);
    expect(handler.runsOn).toBe("gm");
    expect(handler.gmOnly).toBeUndefined();
    expect(handler.targets).toBeUndefined();
    await expect(handler.run({ name: "New hero", operationId: ID }, context())).resolves.toEqual({
      id: ID,
      name: "New hero",
      created: true,
    });
    expect(environment.create).toHaveBeenCalledWith({
      id: ID,
      name: "New hero",
      requesterId: PLAYER,
      ownership: "requester",
      marker: { version: CHARACTER_CREATE_MARKER_VERSION, requesterId: PLAYER, operationId: ID },
    });
  });

  it("accepts only Character Edit and a known requester, with no owner for GM/Assistant creates", async () => {
    const handler = createCharacterCreateHandler(makeEnvironment());
    const payload = { name: "New hero", operationId: ID };
    const authorize = handler.authorize!;
    expect(authorize(payload, context())).toEqual({ ok: true });
    expect(authorize(payload, { module: characterModule })).toMatchObject({ ok: false });
    expect(authorize(payload, context("gm"))).toEqual({ ok: true });
    expect(authorize(payload, context("assistant"))).toEqual({ ok: true });
    expect(authorize(payload, context("unknown"))).toMatchObject({ ok: false });
    expect(authorize(payload, context(PLAYER, { ...characterModule, id: "eagle-library" }))).toMatchObject({ ok: false });

    const gmEnvironment = makeEnvironment();
    const gmHandler = createCharacterCreateHandler(gmEnvironment);
    await expect(gmHandler.run(payload, context("gm"))).resolves.toEqual({ id: ID, name: "New hero", created: true });
    expect(gmEnvironment.create).toHaveBeenCalledWith({
      id: ID,
      name: "New hero",
      requesterId: "gm",
      ownership: "none",
      marker: { version: CHARACTER_CREATE_MARKER_VERSION, requesterId: "gm", operationId: ID },
    });
    await expect(gmHandler.run(payload, context("gm"))).resolves.toEqual({ id: ID, name: "New hero", created: false });

    const assistantEnvironment = makeEnvironment();
    const assistantHandler = createCharacterCreateHandler(assistantEnvironment);
    await expect(assistantHandler.run(payload, context("assistant"))).resolves.toEqual({ id: ID, name: "New hero", created: true });
    expect(assistantEnvironment.create.mock.calls[0]?.[0]).toMatchObject({ requesterId: "assistant", ownership: "none" });
  });

  it("returns a matching retry without a second write, while every collision remains opaque and unwritten", async () => {
    const environment = makeEnvironment();
    const handler = createCharacterCreateHandler(environment);
    const payload = { name: "New hero", operationId: ID };
    await handler.run(payload, context());
    await expect(handler.run(payload, context())).resolves.toEqual({ id: ID, name: "New hero", created: false });
    expect(environment.create).toHaveBeenCalledOnce();

    environment.records.set(ID, {
      id: ID,
      name: "Other name",
      type: "character",
      ownership: { [PLAYER]: "owner" },
      marker: { version: CHARACTER_CREATE_MARKER_VERSION, requesterId: PLAYER, operationId: ID },
    });
    await expect(handler.run(payload, context())).rejects.toThrow("unavailable");
    expect(environment.create).toHaveBeenCalledOnce();
  });

  it("repairs ownership on a matching marked Actor left by an earlier normalized create", async () => {
    const environment = makeEnvironment();
    environment.records.set(ID, {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: "none", gm: "owner" },
      marker: { version: CHARACTER_CREATE_MARKER_VERSION, requesterId: "gm", operationId: ID },
    });
    const handler = createCharacterCreateHandler(environment);
    await expect(handler.run({ name: "New hero", operationId: ID }, context("gm"))).resolves.toEqual({
      id: ID,
      name: "New hero",
      created: false,
    });
    expect(environment.create).not.toHaveBeenCalled();
    expect(environment.records.get(ID)?.ownership).toEqual({ default: "none" });
  });

  it("recovers the exact unmarked Actor left by a v13 create normalization", async () => {
    const environment = makeEnvironment();
    environment.records.set(ID, {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: "none" },
      marker: undefined,
    });
    const handler = createCharacterCreateHandler(environment);
    await expect(handler.run({ name: "New hero", operationId: ID }, context("gm"))).resolves.toEqual({
      id: ID,
      name: "New hero",
      created: false,
    });
    expect(environment.create).not.toHaveBeenCalled();
    expect(environment.records.get(ID)?.marker).toEqual({
      version: CHARACTER_CREATE_MARKER_VERSION,
      requesterId: "gm",
      operationId: ID,
    });
  });

  it("removes a creating GM's direct Owner entry when recovering an unmarked legacy Actor", async () => {
    const environment = makeEnvironment();
    environment.records.set(ID, {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: "none", gm: "owner" },
      marker: null,
    });
    const handler = createCharacterCreateHandler(environment);
    await expect(handler.run({ name: "New hero", operationId: ID }, context("gm"))).resolves.toEqual({
      id: ID,
      name: "New hero",
      created: false,
    });
    expect(environment.create).not.toHaveBeenCalled();
    expect(environment.records.get(ID)?.ownership).toEqual({ default: "none" });
    expect(environment.records.get(ID)?.marker).toEqual({
      version: CHARACTER_CREATE_MARKER_VERSION,
      requesterId: "gm",
      operationId: ID,
    });
  });

  it("keeps an unmarked Actor with a foreign owner fail-closed", async () => {
    const environment = makeEnvironment();
    environment.records.set(ID, {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: "none", "other-user": "owner" },
      marker: undefined,
    });
    const handler = createCharacterCreateHandler(environment);
    await expect(handler.run({ name: "New hero", operationId: ID }, context("gm"))).rejects.toThrow("unavailable");
    expect(environment.records.get(ID)?.marker).toBeUndefined();
  });

  it("keeps legacy Actors with any foreign grant or malformed marker fail-closed", async () => {
    const environment = makeEnvironment();
    const handler = createCharacterCreateHandler(environment);
    environment.records.set(ID, {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: "none", gm: "owner", observer: "observer" },
      marker: undefined,
    });
    await expect(handler.run({ name: "New hero", operationId: ID }, context("gm"))).rejects.toThrow("unavailable");

    environment.records.set(ID, {
      id: ID,
      name: "New hero",
      type: "character",
      ownership: { default: "none", gm: "owner" },
      marker: {},
    });
    await expect(handler.run({ name: "New hero", operationId: ID }, context("gm"))).rejects.toThrow("unavailable");
    expect(environment.create).not.toHaveBeenCalled();
  });

  it("coalesces concurrent equal operations and recognizes a matching create race as a retry", async () => {
    const environment = makeEnvironment();
    let release: (() => void) | undefined;
    const waiting = new Promise<void>((resolve) => { release = resolve; });
    environment.create.mockImplementationOnce(async (input: CharacterCreateInput) => {
      await waiting;
      const created = record(input);
      environment.records.set(input.id, created);
      return created;
    });
    const handler = createCharacterCreateHandler(environment);
    const payload = { name: "New hero", operationId: ID };
    const first = handler.run(payload, context());
    const second = handler.run(payload, context());
    await Promise.resolve();
    await Promise.resolve();
    expect(environment.create).toHaveBeenCalledOnce();
    release?.();
    await expect(Promise.all([first, second])).resolves.toEqual([
      { id: ID, name: "New hero", created: true },
      { id: ID, name: "New hero", created: true },
    ]);

    const raceId = "QwErTyUiOpAsDfGh";
    environment.create.mockImplementationOnce(async (input: CharacterCreateInput) => {
      environment.records.set(input.id, record(input));
      throw new Error("duplicate id");
    });
    await expect(handler.run({ name: "Race hero", operationId: raceId }, context())).resolves.toEqual({
      id: raceId,
      name: "Race hero",
      created: false,
    });
  });
});

describe("character.create rights integration", () => {
  function registry(): ModuleRegistry {
    const modules = new Map<string, ModuleInfo>([
      [CHARACTER_CREATE_MODULE_ID, { id: CHARACTER_CREATE_MODULE_ID, title: "Character Edit", version: "0.1.0", active: true }],
      ["eagle-library", { id: "eagle-library", title: "Library", version: "1.0.0", active: true }],
    ]);
    const source: ModuleInfoSource = { get: (id) => modules.get(id) };
    const result = new ModuleRegistry(source, API);
    result.registerModule({ id: CHARACTER_CREATE_MODULE_ID, apiVersion: API });
    result.registerModule({ id: "eagle-library", apiVersion: API });
    return result;
  }

  async function execute(level: "denied" | "own" | "all", userId = PLAYER, module = CHARACTER_CREATE_MODULE_ID) {
    const environment = makeEnvironment();
    const rights = createRightsGate({
      storedTable: () => JSON.stringify({ version: 1, modules: { [CHARACTER_CREATE_MODULE_ID]: { [PLAYER]: level } } }),
      isGm: environment.isGm,
      ownership: async () => "unknown",
    });
    const kernel = createRequestKernel(registry(), [createCharacterCreateHandler(environment)], { rights });
    const result = await kernel.execute({ module, type: CHARACTER_CREATE_TYPE, payload: { name: "New hero", operationId: ID } }, { user: { id: userId } });
    return { result, environment };
  }

  it("refuses denied before the handler and gives own and all the same requester-owned actor", async () => {
    const denied = await execute("denied");
    expect(denied.result).toMatchObject({ ok: false, reason: "not-permitted" });
    expect(denied.environment.create).not.toHaveBeenCalled();

    for (const level of ["own", "all"] as const) {
      const allowed = await execute(level);
      expect(allowed.result).toEqual({ ok: true, value: { id: ID, name: "New hero", created: true } });
      expect(allowed.environment.create.mock.calls[0]?.[0]).toMatchObject({ requesterId: PLAYER });
    }
  });

  it("refuses an unconfirmed, unknown, or different registered sender without writing", async () => {
    for (const [user, module] of [[undefined, CHARACTER_CREATE_MODULE_ID], ["unknown", CHARACTER_CREATE_MODULE_ID], [PLAYER, "eagle-library"]] as const) {
      const environment = makeEnvironment();
      const rights = createRightsGate({
        storedTable: () => JSON.stringify({ version: 1, modules: { [CHARACTER_CREATE_MODULE_ID]: { [PLAYER]: "all" } } }),
        isGm: environment.isGm,
        ownership: async () => "unknown",
      });
      const kernel = createRequestKernel(registry(), [createCharacterCreateHandler(environment)], { rights });
      const result = await kernel.execute(
        { module, type: CHARACTER_CREATE_TYPE, payload: { name: "New hero", operationId: ID } },
        user ? { user: { id: user } } : undefined,
      );
      expect(result).toMatchObject({ ok: false, reason: "not-permitted" });
      expect(environment.create).not.toHaveBeenCalled();
    }
  });

  it("allows GM/Assistant through the common rights gate without assigning ownership", async () => {
    for (const user of ["gm", "assistant"] as const) {
      const environment = makeEnvironment();
      const rights = createRightsGate({
        storedTable: () => JSON.stringify({ version: 1, modules: {} }),
        isGm: environment.isGm,
        ownership: async () => "unknown",
      });
      const kernel = createRequestKernel(registry(), [createCharacterCreateHandler(environment)], { rights });
      const result = await kernel.execute(
        { module: CHARACTER_CREATE_MODULE_ID, type: CHARACTER_CREATE_TYPE, payload: { name: "New hero", operationId: ID } },
        { user: { id: user } },
      );
      expect(result).toEqual({ ok: true, value: { id: ID, name: "New hero", created: true } });
      expect(environment.create.mock.calls[0]?.[0]).toMatchObject({ requesterId: user, ownership: "none" });
    }
  });
});

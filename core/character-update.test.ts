import { describe, expect, it, vi } from "vitest";
import {
  ABILITY_KEYS,
  CHARACTER_UPDATE_MODULE_ID,
  CHARACTER_UPDATE_TYPE,
  createCharacterUpdateHandler,
  type AbilityKey,
  type CharacterUpdateEnvironment,
  type CharacterUpdateMarker,
  type CharacterUpdatePayload,
  type CharacterUpdateRecord,
  validateCharacterUpdate,
} from "./character-update";
import type { JsonValue } from "./json-value";
import type { RegisteredModule } from "./module-registry";
import { createRequestKernel, type RequestContext } from "./request-kernel";
import { createRightsGate } from "./request-rights";

const ID = "AbCdEfGhIjKlMnOp";
const UUID = `Actor.${ID}`;
const OP = "QwErTyUiOpAsDfGh";
const PLAYER = "player";
const MODULE: RegisteredModule = {
  id: CHARACTER_UPDATE_MODULE_ID,
  title: "Character Edit",
  version: "0.4.0",
  apiVersion: "0.16.0",
};

function payload(overrides: Partial<CharacterUpdatePayload> = {}): CharacterUpdatePayload {
  return { uuid: UUID, operationId: OP, revision: 0, abilities: { str: { from: 10, to: 12 } }, ...overrides };
}

function context(user = PLAYER, module = MODULE): RequestContext {
  return { module, user: { id: user } };
}

function baseAbilities(): Record<AbilityKey, number> {
  return Object.fromEntries(ABILITY_KEYS.map((key) => [key, 10])) as Record<AbilityKey, number>;
}

function environment(options: { owner?: string; type?: string; uuid?: string; mutateOwnership?: boolean } = {}) {
  let record: CharacterUpdateRecord = {
    id: ID,
    uuid: options.uuid ?? UUID,
    type: options.type ?? "character",
    abilities: baseAbilities(),
    ownership: { default: 0, ...(options.owner ? { [options.owner]: 3 } : {}) },
    marker: undefined,
  };
  const update = vi.fn(async (_uuid: string, changes: Readonly<Record<string, JsonValue>>) => {
    const abilities = { ...record.abilities };
    for (const key of ABILITY_KEYS) {
      const value = changes[`system.abilities.${key}.value`];
      if (typeof value === "number") abilities[key] = value;
    }
    record = {
      ...record,
      abilities,
      ownership: options.mutateOwnership ? { default: 3 } : record.ownership,
      marker: changes["flags.eagle-character-edit.characterWrite"],
    };
  });
  const value: CharacterUpdateEnvironment = {
    systemId: () => "dnd5e",
    isGm: (id) => ({ gm: true, assistant: true, [PLAYER]: false } as Record<string, boolean | undefined>)[id],
    get: async (uuid) => uuid === UUID && record.uuid === UUID ? record : undefined,
    owns: (_record, id) => options.owner === id,
    update,
  };
  return { value, update, get record() { return record; } };
}

describe("character.update payload", () => {
  it("accepts only the exact whitelisted shape and canonicalizes abilities", () => {
    expect(validateCharacterUpdate(payload({ abilities: { cha: { from: 8, to: 9 }, str: { from: 10, to: 12 } } }))).toEqual({
      ok: true,
      value: payload({ abilities: { str: { from: 10, to: 12 }, cha: { from: 8, to: 9 } } }),
    });
    for (const invalid of [
      { ...payload(), system: {} },
      { ...payload(), uuid: `Compendium.pack.Actor.${ID}` },
      { ...payload(), uuid: `Scene.${ID}.Token.${ID}.Actor.${ID}` },
      { ...payload(), operationId: "short" },
      { ...payload(), revision: -1 },
      { ...payload(), revision: 1.5 },
      { ...payload(), abilities: {} },
      { ...payload(), abilities: { hp: { from: 1, to: 2 } } },
      { ...payload(), abilities: { str: { from: 10, to: 10 } } },
      { ...payload(), abilities: { str: { from: 10, to: 31 } } },
      { ...payload(), abilities: { str: { from: 10, to: 11, path: "ownership" } } },
    ]) expect(validateCharacterUpdate(invalid).ok, JSON.stringify(invalid)).toBe(false);
  });
});

describe("character.update handler", () => {
  it("updates owned characters, advances the marker and preserves ownership", async () => {
    const env = environment({ owner: PLAYER });
    const handler = createCharacterUpdateHandler(env.value);
    await expect(handler.authorize!(payload(), context())).resolves.toEqual({ ok: true });
    await expect(handler.run(payload(), context())).resolves.toEqual({
      uuid: UUID, revision: 1, applied: true, changed: ["str"],
    });
    expect(env.update).toHaveBeenCalledTimes(1);
    expect(env.record.ownership).toEqual({ default: 0, [PLAYER]: 3 });
    expect(env.record.marker).toMatchObject({ version: 1, revision: 1, last: { operationId: OP, requesterId: PLAYER } });
  });

  it("returns an exact retry without another write", async () => {
    const env = environment({ owner: PLAYER });
    const handler = createCharacterUpdateHandler(env.value);
    await handler.run(payload(), context());
    await expect(handler.run(payload(), context())).resolves.toEqual({
      uuid: UUID, revision: 1, applied: false, changed: ["str"],
    });
    expect(env.update).toHaveBeenCalledTimes(1);
  });

  it("returns conflict for stale revision or from values", async () => {
    for (const candidate of [payload({ revision: 1 }), payload({ abilities: { str: { from: 9, to: 12 } } })]) {
      const env = environment({ owner: PLAYER });
      const kernel = createRequestKernel({ list: () => [MODULE] }, [createCharacterUpdateHandler(env.value)]);
      await expect(kernel.execute({ module: MODULE.id, type: CHARACTER_UPDATE_TYPE, payload: candidate }, { user: { id: PLAYER } }))
        .resolves.toMatchObject({ ok: false, reason: "conflict" });
      expect(env.update).not.toHaveBeenCalled();
    }
  });

  it("coalesces parallel copies into one write", async () => {
    const env = environment({ owner: PLAYER });
    const handler = createCharacterUpdateHandler(env.value);
    const [first, second] = await Promise.all([handler.run(payload(), context()), handler.run(payload(), context())]);
    expect(first).toEqual(second);
    expect(env.update).toHaveBeenCalledTimes(1);
  });

  it("rejects a reused in-flight operation id with a different intent", async () => {
    const env = environment({ owner: PLAYER });
    let release!: () => void;
    const wait = new Promise<void>((resolve) => { release = resolve; });
    env.update.mockImplementationOnce(async (_uuid, changes) => {
      await wait;
      const marker = changes["flags.eagle-character-edit.characterWrite"] as unknown as CharacterUpdateMarker;
      Object.assign(env.record.abilities, { str: 12 });
      Object.assign(env.record, { marker });
    });
    const handler = createCharacterUpdateHandler(env.value);
    const first = handler.run(payload(), context());
    await vi.waitFor(() => expect(env.update).toHaveBeenCalledTimes(1));
    await expect(handler.run(payload({ abilities: { str: { from: 10, to: 13 } } }), context())).rejects.toMatchObject({ reason: "conflict" });
    release();
    await first;
  });

  it("admits GM and Assistant without ownership, but denies players without OWNER", async () => {
    for (const user of ["gm", "assistant"] as const) {
      const env = environment();
      const handler = createCharacterUpdateHandler(env.value);
      await expect(handler.authorize!(payload(), context(user))).resolves.toEqual({ ok: true });
    }
    for (const options of [{}, { owner: "other" }, { type: "npc" }, { uuid: `Actor.${"Z".repeat(16)}` }]) {
      const env = environment(options);
      const handler = createCharacterUpdateHandler(env.value);
      await expect(handler.authorize!(payload(), context())).resolves.toMatchObject({ ok: false });
      expect(env.update).not.toHaveBeenCalled();
    }
  });

  it("denies another sender and detects ownership mutation after the write", async () => {
    const env = environment({ owner: PLAYER });
    const handler = createCharacterUpdateHandler(env.value);
    const other = { ...MODULE, id: "eagle-library" };
    await expect(handler.authorize!(payload(), context(PLAYER, other))).resolves.toMatchObject({ ok: false });

    const hostile = environment({ owner: PLAYER, mutateOwnership: true });
    await expect(createCharacterUpdateHandler(hostile.value).run(payload(), context())).rejects.toThrow(
      "Foundry did not preserve the character update values, marker and ownership",
    );
  });

  it("denies the operation outside dnd5e", async () => {
    const env = environment({ owner: PLAYER });
    env.value.systemId = () => "pf2e";
    const handler = createCharacterUpdateHandler(env.value);
    await expect(handler.authorize!(payload(), context())).resolves.toMatchObject({ ok: false });
    expect(env.update).not.toHaveBeenCalled();
  });

  it("binds denied, own and all to the narrower Player ownership rule", async () => {
    for (const [level, owner, allowed] of [
      ["denied", PLAYER, false],
      ["own", PLAYER, true],
      ["own", "other", false],
      ["all", "other", false],
    ] as const) {
      const env = environment({ owner });
      const rights = createRightsGate({
        storedTable: () => JSON.stringify({ version: 1, modules: { [CHARACTER_UPDATE_MODULE_ID]: { [PLAYER]: level } } }),
        isGm: env.value.isGm,
        ownership: async () => owner === PLAYER ? "own" : "foreign",
      });
      const kernel = createRequestKernel({ list: () => [MODULE] }, [createCharacterUpdateHandler(env.value)], { rights });
      const answer = await kernel.execute(
        { module: MODULE.id, type: CHARACTER_UPDATE_TYPE, payload: payload() },
        { user: { id: PLAYER } },
      );
      expect(answer.ok, `${level}/${owner}`).toBe(allowed);
      expect(env.update).toHaveBeenCalledTimes(allowed ? 1 : 0);
      if (!allowed) expect(answer).toMatchObject({ reason: "not-permitted" });
    }
  });
});

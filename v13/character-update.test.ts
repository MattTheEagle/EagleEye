import { afterEach, describe, expect, it, vi } from "vitest";
import { foundryCharacterUpdateEnvironment } from "./character-update";
import { createCharacterUpdateHandler } from "../core/character-update";

const ID = "AbCdEfGhIjKlMnOp";
const UUID = `Actor.${ID}`;
const MODULE = { id: "eagle-character-edit", title: "Character Edit", version: "0.5.0", apiVersion: "0.16.1" };

// An Active Effect on an ability score, applied like Foundry's ADD (2), UPGRADE (4) and OVERRIDE (5) modes.
interface AbilityEffect {
  readonly key: "str" | "dex" | "con" | "int" | "wis" | "cha";
  readonly mode: 2 | 4 | 5;
  readonly value: number;
}

function setPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  let node = target;
  for (const part of parts.slice(0, -1)) node = (node[part] ??= {}) as Record<string, unknown>;
  node[parts.at(-1)!] = structuredClone(value);
}

// Models a Foundry Actor: _source holds the stored data that update() writes, system is the prepared data after
// Active Effects. Only the prepared side carries the effects, as in Foundry.
function actor(effects: readonly AbilityEffect[] = []) {
  const source = {
    system: { abilities: { str: { value: 10 }, dex: { value: 11 }, con: { value: 12 }, int: { value: 13 }, wis: { value: 14 }, cha: { value: 15 } } },
    ownership: { default: 0, player: 3 },
    flags: { "eagle-character-edit": { characterWrite: { version: 1, revision: 2, last: { operationId: "QwErTyUiOpAsDfGh", requesterId: "player", intent: "x" } } } } as Record<string, unknown>,
    items: [] as unknown[],
    effects: [] as unknown[],
    opaque: undefined as unknown,
  };
  const document = {
    id: ID,
    uuid: UUID,
    type: "character",
    _source: source as typeof source | undefined,
    system: { abilities: {} as Record<string, { value: number }> },
    ownership: source.ownership,
    flags: structuredClone(source.flags),
    testUserPermission: vi.fn((_user: unknown, permission: string) => permission === "OWNER"),
    update: vi.fn(async (changes?: Record<string, unknown>) => {
      for (const [path, value] of Object.entries(changes ?? {})) setPath(source as unknown as Record<string, unknown>, path, value);
      prepare();
      return undefined;
    }),
  };
  function prepare(): void {
    const abilities = structuredClone(source.system.abilities) as Record<string, { value: number }>;
    for (const effect of effects) {
      const ability = abilities[effect.key]!;
      if (effect.mode === 2) ability.value += effect.value;
      else if (effect.mode === 4) ability.value = Math.max(ability.value, effect.value);
      else ability.value = effect.value;
    }
    document.system = { abilities };
    document.flags = structuredClone(source.flags);
  }
  prepare();
  return document;
}

function stubWorld(stored: ReturnType<typeof actor>) {
  const player = { id: "player", isGM: false };
  vi.stubGlobal("game", { system: { id: "dnd5e" }, actors: new Map([[ID, stored]]), users: new Map([["player", player]]) });
  return player;
}

describe("foundryCharacterUpdateEnvironment", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("resolves only the exact primary world Actor and snapshots its bounded stored state", async () => {
    const stored = actor();
    const player = stubWorld(stored);
    const environment = foundryCharacterUpdateEnvironment();
    const record = await environment.get(UUID);
    expect(record).toMatchObject({ id: ID, uuid: UUID, type: "character", abilities: { str: 10, cha: 15 }, ownership: { default: 0, player: 3 } });
    expect(environment.owns(record!, "player")).toBe(true);
    expect(stored.testUserPermission).toHaveBeenCalledWith(player, "OWNER");
    await expect(environment.get(`Compendium.world.pack.Actor.${ID}`)).resolves.toBeUndefined();
    await expect(environment.get(`Scene.${ID}.Token.${ID}.Actor.${ID}`)).resolves.toBeUndefined();
  });

  it("snapshots stored ability values, ownership and marker, not the values prepared by Active Effects", async () => {
    const stored = actor([{ key: "str", mode: 4, value: 21 }, { key: "con", mode: 2, value: 2 }]);
    stored.flags = { "eagle-character-edit": { characterWrite: { version: 1, revision: 99, last: { operationId: "ZzZzZzZzZzZzZzZz", requesterId: "player", intent: "y" } } } };
    stubWorld(stored);
    const record = await foundryCharacterUpdateEnvironment().get(UUID);
    expect(stored.system.abilities.str!.value).toBe(21);
    expect(record?.abilities).toMatchObject({ str: 10, con: 12 });
    expect(record?.marker).toMatchObject({ revision: 2 });
  });

  it("fails before any write when Foundry returns no readable stored data", async () => {
    const stored = actor();
    stored._source = undefined;
    stubWorld(stored);
    await expect(foundryCharacterUpdateEnvironment().get(UUID)).rejects.toThrow("readable character data");
    const handler = createCharacterUpdateHandler(foundryCharacterUpdateEnvironment());
    await expect(handler.run(
      { uuid: UUID, operationId: "PoIuYtReWqLkJhGf", revision: 2, abilities: { str: { from: 10, to: 12 } } },
      { module: MODULE, user: { id: "player" } },
    )).rejects.toThrow();
    expect(stored.update).not.toHaveBeenCalled();
  });

  it("re-resolves from game.actors immediately before the one update call", async () => {
    const stale = actor();
    const current = actor();
    const actors = new Map([[ID, stale]]);
    vi.stubGlobal("game", { system: { id: "dnd5e" }, actors, users: new Map() });
    const environment = foundryCharacterUpdateEnvironment();
    actors.set(ID, current);
    const changes = { "system.abilities.str.value": 12, "flags.eagle-character-edit.characterWrite": { version: 1 } };
    await environment.update(UUID, changes);
    expect(stale.update).not.toHaveBeenCalled();
    expect(current.update).toHaveBeenCalledWith(changes);
  });

  it("rejects an Actor whose canonical uuid does not match its collection id", async () => {
    const stored = { ...actor(), uuid: `Actor.${"Z".repeat(16)}` };
    vi.stubGlobal("game", { system: { id: "dnd5e" }, actors: new Map([[ID, stored]]), users: new Map() });
    await expect(foundryCharacterUpdateEnvironment().get(UUID)).resolves.toBeUndefined();
  });

  it("preserves ownership, external items, advancements and opaque fields through the bounded handler", async () => {
    const stored = actor();
    const source = stored._source!;
    source.items = [{ _id: "ItemItemItemItem", flags: { external: { payload: [1, 2, 3] } }, system: { advancement: [{ type: "ScaleValue" }] } }];
    source.effects = [{ _id: "EffectEffectEff1", changes: [{ key: "system.attributes.ac.bonus", value: "1" }] }];
    source.opaque = { nested: ["leave", "alone"] };
    stubWorld(stored);
    const preserved = JSON.parse(JSON.stringify({ ownership: source.ownership, items: source.items, effects: source.effects, opaque: source.opaque }));
    const handler = createCharacterUpdateHandler(foundryCharacterUpdateEnvironment());
    await expect(handler.run(
      { uuid: UUID, operationId: "QwErTyUiOpAsDfGh", revision: 2, abilities: { str: { from: 10, to: 12 } } },
      { module: MODULE, user: { id: "player" } },
    )).resolves.toMatchObject({ uuid: UUID, revision: 3, applied: true, changed: ["str"] });
    expect(stored.update).toHaveBeenCalledWith({
      "system.abilities.str.value": 12,
      "flags.eagle-character-edit.characterWrite": expect.objectContaining({ version: 1, revision: 3 }),
    });
    expect({ ownership: source.ownership, items: source.items, effects: source.effects, opaque: source.opaque }).toEqual(preserved);
  });

  for (const [name, effect, prepared] of [
    ["ADD", { key: "str", mode: 2, value: 2 }, 14],
    ["UPGRADE", { key: "str", mode: 4, value: 21 }, 21],
    ["OVERRIDE", { key: "str", mode: 5, value: 19 }, 19],
  ] as const) {
    it(`writes and confirms the stored value while an ${name} effect changes the prepared value`, async () => {
      const stored = actor([effect]);
      stubWorld(stored);
      const handler = createCharacterUpdateHandler(foundryCharacterUpdateEnvironment());
      const payload = { uuid: UUID, operationId: "MnBvCxZaSdFgHjKl", revision: 2, abilities: { str: { from: 10, to: 12 } } };
      await expect(handler.run(payload, { module: MODULE, user: { id: "player" } }))
        .resolves.toMatchObject({ uuid: UUID, revision: 3, applied: true, changed: ["str"] });
      expect(stored._source!.system.abilities.str.value).toBe(12);
      expect(stored.system.abilities.str!.value).toBe(prepared);
      await expect(handler.run(structuredClone(payload), { module: MODULE, user: { id: "player" } }))
        .resolves.toMatchObject({ revision: 3, applied: false });
      expect(stored.update).toHaveBeenCalledTimes(1);
    });
  }

  it("answers conflict without a write when from names the prepared instead of the stored value", async () => {
    const stored = actor([{ key: "str", mode: 4, value: 21 }]);
    stubWorld(stored);
    const handler = createCharacterUpdateHandler(foundryCharacterUpdateEnvironment());
    await expect(handler.run(
      { uuid: UUID, operationId: "LkJhGfDsApOiUyTr", revision: 2, abilities: { str: { from: 21, to: 22 } } },
      { module: MODULE, user: { id: "player" } },
    )).rejects.toMatchObject({ reason: "conflict" });
    expect(stored.update).not.toHaveBeenCalled();
  });
});

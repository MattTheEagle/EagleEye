import { afterEach, describe, expect, it, vi } from "vitest";
import { foundryCharacterUpdateEnvironment } from "./character-update";
import { createCharacterUpdateHandler } from "../core/character-update";

const ID = "AbCdEfGhIjKlMnOp";
const UUID = `Actor.${ID}`;

function actor() {
  return {
    id: ID,
    uuid: UUID,
    type: "character",
    system: { abilities: { str: { value: 10 }, dex: { value: 11 }, con: { value: 12 }, int: { value: 13 }, wis: { value: 14 }, cha: { value: 15 } } },
    ownership: { default: 0, player: 3 },
    flags: { "eagle-character-edit": { characterWrite: { version: 1, revision: 2, last: { operationId: "QwErTyUiOpAsDfGh", requesterId: "player", intent: "x" } } } },
    testUserPermission: vi.fn((_user: unknown, permission: string) => permission === "OWNER"),
    update: vi.fn(async (_changes?: Record<string, unknown>) => undefined),
  };
}

describe("foundryCharacterUpdateEnvironment", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("resolves only the exact primary world Actor and snapshots its bounded state", async () => {
    const stored = actor();
    const player = { id: "player", isGM: false };
    vi.stubGlobal("game", { system: { id: "dnd5e" }, actors: new Map([[ID, stored]]), users: new Map([["player", player]]) });
    const environment = foundryCharacterUpdateEnvironment();
    const record = await environment.get(UUID);
    expect(record).toMatchObject({ id: ID, uuid: UUID, type: "character", abilities: { str: 10, cha: 15 }, ownership: { default: 0, player: 3 } });
    expect(environment.owns(record!, "player")).toBe(true);
    expect(stored.testUserPermission).toHaveBeenCalledWith(player, "OWNER");
    await expect(environment.get(`Compendium.world.pack.Actor.${ID}`)).resolves.toBeUndefined();
    await expect(environment.get(`Scene.${ID}.Token.${ID}.Actor.${ID}`)).resolves.toBeUndefined();
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
    const stored = actor() as ReturnType<typeof actor> & {
      items: unknown[];
      effects: unknown[];
      opaque: unknown;
    };
    stored.items = [{ _id: "ItemItemItemItem", flags: { external: { payload: [1, 2, 3] } }, system: { advancement: [{ type: "ScaleValue" }] } }];
    stored.effects = [{ _id: "EffectEffectEff1", changes: [{ key: "system.attributes.ac.bonus", value: "1" }] }];
    stored.opaque = { nested: ["leave", "alone"] };
    stored.update.mockImplementation(async (changes?: Record<string, unknown>) => {
      changes ??= {};
      const value = changes["system.abilities.str.value"];
      if (typeof value === "number") stored.system.abilities.str.value = value;
      const marker = changes["flags.eagle-character-edit.characterWrite"];
      if (marker !== undefined) stored.flags["eagle-character-edit"].characterWrite = marker as never;
      return undefined;
    });
    const player = { id: "player", isGM: false };
    vi.stubGlobal("game", { system: { id: "dnd5e" }, actors: new Map([[ID, stored]]), users: new Map([["player", player]]) });
    const preserved = JSON.parse(JSON.stringify({ ownership: stored.ownership, items: stored.items, effects: stored.effects, opaque: stored.opaque }));
    const handler = createCharacterUpdateHandler(foundryCharacterUpdateEnvironment());
    const module = { id: "eagle-character-edit", title: "Character Edit", version: "0.4.0", apiVersion: "0.16.0" };
    await expect(handler.run(
      { uuid: UUID, operationId: "QwErTyUiOpAsDfGh", revision: 2, abilities: { str: { from: 10, to: 12 } } },
      { module, user: { id: "player" } },
    )).resolves.toMatchObject({ uuid: UUID, revision: 3, applied: true, changed: ["str"] });
    expect(stored.update).toHaveBeenCalledWith({
      "system.abilities.str.value": 12,
      "flags.eagle-character-edit.characterWrite": expect.objectContaining({ version: 1, revision: 3 }),
    });
    expect({ ownership: stored.ownership, items: stored.items, effects: stored.effects, opaque: stored.opaque }).toEqual(preserved);
  });
});

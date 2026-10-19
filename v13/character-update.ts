import type {
  AbilityKey,
  CharacterUpdateEnvironment,
  CharacterUpdateRecord,
} from "../core/character-update";
import { ABILITY_KEYS } from "../core/character-update";
import type { JsonValue } from "../core/json-value";

const WORLD_ACTOR_UUID = /^Actor\.([A-Za-z0-9]{16})$/;

interface RawActor {
  id?: unknown;
  uuid?: unknown;
  type?: unknown;
  system?: unknown;
  ownership?: unknown;
  flags?: unknown;
  testUserPermission?: (user: unknown, permission: string) => boolean;
  update?: (changes: Record<string, unknown>) => Promise<unknown>;
}

function object(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function jsonSnapshot(value: unknown): JsonValue {
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

function worldActor(uuid: string): RawActor | undefined {
  const id = WORLD_ACTOR_UUID.exec(uuid)?.[1];
  if (!id) return undefined;
  const actor = game.actors?.get(id) as unknown as RawActor | undefined;
  return actor?.id === id && actor.uuid === uuid ? actor : undefined;
}

function snapshot(actor: RawActor): CharacterUpdateRecord {
  if (typeof actor.id !== "string" || typeof actor.uuid !== "string" || typeof actor.type !== "string") {
    throw new Error("Foundry did not return a readable Actor");
  }
  const system = object(actor.system);
  const rawAbilities = object(system?.abilities);
  const ownership = jsonSnapshot(actor.ownership);
  if (!rawAbilities || typeof ownership !== "object" || ownership === null || Array.isArray(ownership)) {
    throw new Error("Foundry did not return readable character data");
  }
  const abilities = {} as Record<AbilityKey, unknown>;
  for (const key of ABILITY_KEYS) abilities[key] = object(rawAbilities[key])?.value;
  const moduleFlags = object(object(actor.flags)?.["eagle-character-edit"]);
  return {
    id: actor.id,
    uuid: actor.uuid,
    type: actor.type,
    abilities,
    ownership,
    marker: moduleFlags?.characterWrite,
  };
}

export function foundryCharacterUpdateEnvironment(): CharacterUpdateEnvironment {
  return {
    systemId: () => game.system?.id,
    isGm: (userId) => game.users?.get(userId)?.isGM,
    get: async (uuid) => {
      const actor = worldActor(uuid);
      return actor ? snapshot(actor) : undefined;
    },
    owns: (record, userId) => {
      const actor = worldActor(record.uuid);
      const user = game.users?.get(userId);
      return Boolean(actor && user && actor.testUserPermission?.(user, "OWNER"));
    },
    update: async (uuid, changes) => {
      const actor = worldActor(uuid);
      if (!actor || typeof actor.update !== "function") throw new Error("Foundry did not return an updateable Actor");
      await actor.update({ ...changes });
    },
  };
}

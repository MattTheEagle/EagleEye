import type {
  CharacterCreateEnvironment,
  CharacterCreateInput,
  CharacterCreateRecord,
} from "../core/character-create";
import { CHARACTER_CREATE_MARKER_VERSION } from "../core/character-create";

interface RawActor {
  id?: unknown;
  name?: unknown;
  type?: unknown;
  ownership?: unknown;
  flags?: unknown;
  getFlag?: (scope: string, key: string) => unknown;
  setFlag?: (scope: string, key: string, value: unknown) => Promise<unknown>;
  update?: (changes: Record<string, unknown>, operation?: Record<string, unknown>) => Promise<unknown>;
}

interface ActorDocumentClass {
  createDocuments(data: object[], operation: Record<string, unknown>): Promise<unknown[]>;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function snapshot(value: unknown): CharacterCreateRecord {
  const actor = value as RawActor;
  if (typeof actor.id !== "string" || typeof actor.name !== "string" || typeof actor.type !== "string") {
    throw new Error("Foundry did not return a readable Actor");
  }
  const ownership = asRecord(actor.ownership);
  if (!ownership) throw new Error("Foundry did not return Actor ownership");
  const flags = asRecord(actor.flags);
  const moduleFlags = flags ? asRecord(flags["eagle-character-edit"]) : undefined;
  let marker = moduleFlags?.playerCreate;
  if ((marker === undefined || marker === null) && typeof actor.getFlag === "function") {
    marker = actor.getFlag("eagle-character-edit", "playerCreate");
  }
  return {
    id: actor.id,
    name: actor.name,
    type: actor.type,
    ownership,
    marker,
  };
}

function markerMatches(value: unknown, expected: CharacterCreateInput["marker"]): boolean {
  const marker = asRecord(value);
  return marker?.version === expected.version && marker.requesterId === expected.requesterId && marker.operationId === expected.operationId;
}

function ownershipMatches(
  record: CharacterCreateRecord,
  userId: string,
  ownership: CharacterCreateInput["ownership"],
): boolean {
  if (record.ownership.default !== CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE) return false;
  const entries = Object.entries(record.ownership).filter(([key]) => key !== "default");
  if (ownership === "none") return entries.length === 0;
  return entries.length === 1 && entries[0]?.[0] === userId && entries[0]?.[1] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
}

function legacyOwnershipMatches(
  record: CharacterCreateRecord,
  userId: string,
  ownership: CharacterCreateInput["ownership"],
): boolean {
  if (record.ownership.default !== CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE) return false;
  const entries = Object.entries(record.ownership).filter(([key]) => key !== "default");
  if (ownership === "requester") {
    return entries.length === 1 && entries[0]?.[0] === userId && entries[0]?.[1] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
  }
  return (
    entries.length === 0 ||
    (entries.length === 1 && entries[0]?.[0] === userId && entries[0]?.[1] === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)
  );
}

function ownershipData(userId: string, ownership: CharacterCreateInput["ownership"]): Record<string, unknown> {
  return {
    default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
    ...(ownership === "requester" ? { [userId]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER } : {}),
  };
}

function markerData(userId: string, operationId: string): CharacterCreateInput["marker"] {
  return { version: CHARACTER_CREATE_MARKER_VERSION, requesterId: userId, operationId };
}

function actorClass(): ActorDocumentClass {
  return CONFIG.Actor.documentClass as unknown as ActorDocumentClass;
}

function worldActor(id: string): RawActor | undefined {
  return game.actors?.get(id) as unknown as RawActor | undefined;
}

function requiredWorldActor(id: string): RawActor {
  const actor = worldActor(id);
  if (!actor) throw new Error("Foundry did not persist the Actor");
  return actor;
}

// The only Foundry-specific write used by character.create. All values except
// name and operationId are fixed by the core handler before reaching this file.
export function foundryCharacterCreateEnvironment(): CharacterCreateEnvironment {
  return {
    isGm: (userId) => game.users?.get(userId)?.isGM,
    get: async (id) => {
      const actor = worldActor(id);
      return actor ? snapshot(actor) : undefined;
    },
    ownershipMatches,
    legacyOwnershipMatches,
    repairOwnership: async (record, userId, ownership) => {
      const actor = game.actors?.get(record.id) as unknown as RawActor | undefined;
      if (!actor || typeof actor.update !== "function") throw new Error("Foundry did not return a repairable Actor");
      await actor.update({ ownership: ownershipData(userId, ownership) }, { recursive: false });
      const repaired = requiredWorldActor(record.id);
      if (typeof repaired.setFlag !== "function") throw new Error("Foundry did not return a repairable Actor");
      await repaired.setFlag("eagle-character-edit", "playerCreate", markerData(userId, record.id));
      return snapshot(requiredWorldActor(record.id));
    },
    create: async (input: CharacterCreateInput) => {
      const data = {
        _id: input.id,
        name: input.name,
        type: "character",
        ownership: ownershipData(input.requesterId, input.ownership),
        flags: {
          "eagle-character-edit": {
            playerCreate: markerData(input.requesterId, input.id),
          },
        },
      };
      const [created] = await actorClass().createDocuments([data], { keepId: true });
      if (!created) throw new Error("Foundry did not create the Actor");
      const returned = created as RawActor;
      if (typeof returned.id !== "string") throw new Error("Foundry did not return a readable Actor");
      if (returned.id !== input.id) throw new Error("Foundry did not preserve the Actor id");
      let actor = requiredWorldActor(input.id);
      let record = snapshot(actor);
      if (!ownershipMatches(record, input.requesterId, input.ownership) && typeof actor.update === "function") {
        await actor.update({ ownership: ownershipData(input.requesterId, input.ownership) }, { recursive: false });
        actor = requiredWorldActor(input.id);
        record = snapshot(actor);
      }
      if (!markerMatches(record.marker, input.marker)) {
        if (typeof actor.setFlag !== "function") throw new Error("Foundry did not return a repairable Actor");
        await actor.setFlag("eagle-character-edit", "playerCreate", markerData(input.requesterId, input.id));
        actor = requiredWorldActor(input.id);
        record = snapshot(actor);
      }
      return snapshot(requiredWorldActor(input.id));
    },
  };
}

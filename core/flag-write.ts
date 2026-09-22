import { isJsonValue, type JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

// The document types compendium.flag works on: the four of the Eagle catalog.
export const FLAG_DOCUMENT_TYPES = ["Actor", "Item", "JournalEntry", "RollTable"] as const;
export const MAX_FLAG_VALUE_LENGTH = 2000;
const MAX_KEY_LENGTH = 100;
const KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PACK_PATTERN = /^world\.[a-z0-9]+([-_][a-z0-9]+)*$/;
const ID_PATTERN = /^[A-Za-z0-9]{16}$/;

// The compendium a request writes to, as far as the handler needs to know.
export interface FlagTarget {
  readonly collection: string;
  readonly documentName: string;
  readonly world: boolean;
  readonly locked: boolean;
  has(id: string): boolean;
}

// What the handler needs from Foundry (v13/flag-write.ts). Every call may throw or reject; the kernel turns that into
// `handler-failed`.
export interface FlagEnvironment {
  target(collection: string): Promise<FlagTarget | undefined>;
  // The flag of a document; undefined when there is none.
  get(collection: string, id: string, namespace: string, key: string): Promise<JsonValue | undefined>;
  // Sets the flag, or removes it for `null`.
  set(collection: string, id: string, namespace: string, key: string, value: JsonValue | null): Promise<void>;
}

// For callers without Foundry (the default kernel of createEagleApi, tests): no compendium is known.
export const NO_FLAGS: FlagEnvironment = Object.freeze({
  target: async () => undefined,
  get: async () => undefined,
  set: async () => {
    throw new Error("flags cannot be written without Foundry");
  },
});

export interface FlagPayload {
  readonly pack: string;
  readonly id: string;
  readonly key: string;
  readonly value: JsonValue | null;
}

// The payload of compendium.flag: { pack, id, key, value }; a value of null removes the flag.
function validateFlag(payload: unknown): PayloadCheck<FlagPayload> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { pack, id, key, value }" };
  }
  const { pack, id, key, value } = payload as Record<string, unknown>;
  if (typeof pack !== "string" || !PACK_PATTERN.test(pack) || pack.length > 200) {
    return { ok: false, detail: "payload.pack must be the id of a world compendium like world.<name>" };
  }
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return { ok: false, detail: "payload.id must be 16 letters and digits" };
  if (typeof key !== "string" || key === "" || key.length > MAX_KEY_LENGTH || !KEY_PATTERN.test(key)) {
    return { ok: false, detail: `payload.key must be lower case letters and digits joined by single hyphens, at most ${MAX_KEY_LENGTH} characters` };
  }
  if (value === undefined) return { ok: false, detail: "payload.value must be a JSON value, or null to remove the flag" };
  if (value !== null) {
    if (!isJsonValue(value)) return { ok: false, detail: "payload.value must hold JSON values only" };
    if (JSON.stringify(value).length > MAX_FLAG_VALUE_LENGTH) {
      return { ok: false, detail: `payload.value must not be longer than ${MAX_FLAG_VALUE_LENGTH} characters as JSON` };
    }
  }
  return { ok: true, value: { pack, id, key, value: value as JsonValue | null } };
}

// compendium.flag (version 1): sets or removes one flag of the module that asks, on one document that exists in a world compendium.
// The namespace of the flag is the id of the asking module and not part of the payload, so a module reaches its own flags only
// (never the flags of the core, the game system or Flight Control) and no other field of the document. The compendium must be a
// world compendium that is not locked and holds Actors, Items, journal entries or roll tables. It runs on the Gamemaster's
// client for a Gamemaster or Assistant only and is safe to repeat: the same value changes nothing.
export function createFlagHandler(environment: FlagEnvironment): RequestHandler<FlagPayload> {
  return {
    type: "compendium.flag",
    versions: [1],
    runsOn: "gm",
    gmOnly: true,
    validate: validateFlag,
    async run(payload, context): Promise<JsonValue> {
      const namespace = context.module.id;
      const target = await environment.target(payload.pack);
      if (!target) throw new Error(`the compendium ${payload.pack} does not exist`);
      if (!target.world) throw new Error(`the compendium ${target.collection} is not a world compendium`);
      if (target.locked) throw new Error(`the compendium ${target.collection} is locked`);
      if (!(FLAG_DOCUMENT_TYPES as readonly string[]).includes(target.documentName)) {
        throw new Error(`flags of ${target.documentName} documents cannot be changed (only ${FLAG_DOCUMENT_TYPES.join(", ")})`);
      }
      if (!target.has(payload.id)) throw new Error(`the compendium ${target.collection} has no document ${payload.id}`);
      const current = await environment.get(target.collection, payload.id, namespace, payload.key);
      const same = payload.value === null ? current === undefined || current === null : JSON.stringify(current) === JSON.stringify(payload.value);
      if (!same) await environment.set(target.collection, payload.id, namespace, payload.key, payload.value);
      return { pack: target.collection, id: payload.id, key: payload.key, changed: !same };
    },
  };
}

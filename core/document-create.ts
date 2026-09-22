import { isJsonValue, type JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

// The document types document.create works on: the same four of the Eagle catalog as compendium.import and
// compendium.flag. Another type is refused until a milestone needs it.
export const CREATABLE_DOCUMENT_TYPES = ["Actor", "Item", "JournalEntry", "RollTable"] as const;
export type CreatableDocumentType = (typeof CREATABLE_DOCUMENT_TYPES)[number];

const ID_PATTERN = /^[A-Za-z0-9]{16}$/;
const PACK_PATTERN = /^world\.[a-z0-9]+([-_][a-z0-9]+)*$/;
const MAX_PACK_LENGTH = 200;
const MAX_NAME_LENGTH = 200;
const FORBIDDEN_KEYS = ["_id", "_stats"];

// The target of a request: a world compendium, or the world's own collection of one of the four document types. Exactly
// one of the two fields is given.
export type CreateTargetSpec = { readonly pack: string } | { readonly world: CreatableDocumentType };

// What the handler needs to know about a target, whichever kind it is.
export interface CreateTarget {
  // "pack": a world compendium (`collection` is its id, `world.<name>`). "world": the world's own collection
  // (`collection` is the document type name, only used to build the UUID).
  readonly kind: "pack" | "world";
  readonly collection: string;
  readonly documentName: string;
  // Always false for a "world" target: the world's own collections cannot be locked.
  readonly locked: boolean;
  has(id: string): boolean;
}

export interface CreatedDocument {
  readonly name: string;
}

// What the handler needs from Foundry (v13/document-create.ts). Every call may throw or reject; the kernel turns that
// into `handler-failed`.
export interface DocumentCreateEnvironment {
  target(spec: CreateTargetSpec): Promise<CreateTarget | undefined>;
  // The name of the document with this id at the target, if one exists already (for the "asking again" answer).
  nameOf(target: CreateTarget, id: string): Promise<string | undefined>;
  // Creates the document with the given id and data. The id is kept, as compendium.import keeps the id of a copy.
  create(target: CreateTarget, id: string, data: Readonly<Record<string, JsonValue>>): Promise<CreatedDocument>;
}

// For callers without Foundry (the default kernel of createEagleApi, tests): nothing can be created.
export const NO_DOCUMENTS: DocumentCreateEnvironment = Object.freeze({
  target: async () => undefined,
  nameOf: async () => undefined,
  create: async () => {
    throw new Error("documents cannot be created without Foundry");
  },
});

export interface CreatePayload {
  readonly target: CreateTargetSpec;
  readonly id: string;
  readonly data: Readonly<Record<string, JsonValue>>;
}

function validateTarget(value: unknown): PayloadCheck<CreateTargetSpec> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, detail: "payload.target must be an object like { pack } or { world }" };
  }
  const { pack, world } = value as Record<string, unknown>;
  if ((pack !== undefined) === (world !== undefined)) {
    return { ok: false, detail: "payload.target must have exactly one of pack or world" };
  }
  if (pack !== undefined) {
    if (typeof pack !== "string" || pack.length > MAX_PACK_LENGTH || !PACK_PATTERN.test(pack)) {
      return { ok: false, detail: "payload.target.pack must be the id of a world compendium like world.<name>" };
    }
    return { ok: true, value: { pack } };
  }
  if (typeof world !== "string" || !(CREATABLE_DOCUMENT_TYPES as readonly string[]).includes(world)) {
    return { ok: false, detail: `payload.target.world must be one of ${CREATABLE_DOCUMENT_TYPES.join(", ")}` };
  }
  return { ok: true, value: { world: world as CreatableDocumentType } };
}

function validateData(value: unknown): PayloadCheck<Record<string, JsonValue>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { ok: false, detail: "payload.data must be an object of document fields" };
  }
  const data = value as Record<string, unknown>;
  const { name } = data;
  if (typeof name !== "string" || name.trim() === "" || name.length > MAX_NAME_LENGTH) {
    return { ok: false, detail: `payload.data.name must be a non-empty string of at most ${MAX_NAME_LENGTH} characters` };
  }
  for (const key of Object.keys(data)) {
    if (FORBIDDEN_KEYS.includes(key)) return { ok: false, detail: `payload.data must not set ${key}: the id has payload.id, the origin is not settable` };
    if (!isJsonValue(data[key])) return { ok: false, detail: `payload.data must hold JSON values only (${key})` };
  }
  return { ok: true, value: { ...(data as Record<string, JsonValue>), name: name.trim() } };
}

// The payload of document.create: { target, id, data }.
function validateCreate(payload: unknown): PayloadCheck<CreatePayload> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { target, id, data }" };
  }
  const { target, id, data } = payload as Record<string, unknown>;
  const targetCheck = validateTarget(target);
  if (!targetCheck.ok) return targetCheck;
  if (typeof id !== "string" || !ID_PATTERN.test(id)) return { ok: false, detail: "payload.id must be 16 letters and digits" };
  const dataCheck = validateData(data);
  if (!dataCheck.ok) return dataCheck;
  return { ok: true, value: { target: targetCheck.value, id, data: dataCheck.value } };
}

function uuidOf(target: CreateTarget, id: string): string {
  return target.kind === "pack" ? `Compendium.${target.collection}.${target.documentName}.${id}` : `${target.documentName}.${id}`;
}

// document.create (version 1, since API 0.13.0): creates a document with given data at a given id, either in a world
// compendium that exists or directly in the world's own collection. It runs on the Gamemaster's client and is for a
// Gamemaster or Assistant only. Unlike every earlier request type it carries a document's data, because a document that
// does not exist yet has no UUID to name instead (see the contract, section 4, "Documents"). The id is given by the
// caller (there is no source to take it from) and is kept, the same way compendium.import keeps the id of a copy. Safe
// to repeat: a document of that id at the target that exists already is not written and is answered as existing.
export function createDocumentCreateHandler(environment: DocumentCreateEnvironment): RequestHandler<CreatePayload> {
  return {
    type: "document.create",
    versions: [1],
    runsOn: "gm",
    gmOnly: true,
    validate: validateCreate,
    async run(payload): Promise<JsonValue> {
      const target = await environment.target(payload.target);
      if (!target) {
        const where = "pack" in payload.target ? `the compendium ${payload.target.pack}` : `the world collection of ${payload.target.world}`;
        throw new Error(`${where} does not exist`);
      }
      if (target.locked) throw new Error(`the compendium ${target.collection} is locked`);
      if (!(CREATABLE_DOCUMENT_TYPES as readonly string[]).includes(target.documentName)) {
        throw new Error(`documents of type ${target.documentName} cannot be created (only ${CREATABLE_DOCUMENT_TYPES.join(", ")})`);
      }
      if (target.has(payload.id)) {
        const name = await environment.nameOf(target, payload.id);
        return { target: payload.target, created: false, uuid: uuidOf(target, payload.id), id: payload.id, name: name ?? payload.data.name };
      }
      const created = await environment.create(target, payload.id, payload.data);
      return { target: payload.target, created: true, uuid: uuidOf(target, payload.id), id: payload.id, name: created.name };
    },
  };
}

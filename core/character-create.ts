import type { JsonValue } from "./json-value";
import type { PayloadCheck, RequestContext, RequestHandler, RightsVerdict } from "./request-kernel";

export const CHARACTER_CREATE_TYPE = "character.create";
export const CHARACTER_CREATE_VERSION = 1;
export const CHARACTER_CREATE_MODULE_ID = "eagle-character-edit";
export const CHARACTER_CREATE_MARKER_VERSION = 1;

const ID_PATTERN = /^[A-Za-z0-9]{16}$/;
const MAX_NAME_LENGTH = 200;
const ALLOWED_KEYS = new Set(["name", "operationId"]);

export interface CharacterCreatePayload {
  readonly name: string;
  readonly operationId: string;
}

export interface CharacterCreateMarker {
  readonly version: number;
  readonly requesterId: string;
  readonly operationId: string;
}

export interface CharacterCreateRecord {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly ownership: Readonly<Record<string, unknown>>;
  readonly marker: unknown;
}

export interface CharacterCreateInput {
  readonly id: string;
  readonly name: string;
  readonly requesterId: string;
  readonly ownership: "requester" | "none";
  readonly marker: CharacterCreateMarker;
}

// The Foundry adapter owns the raw document shape. The core asks it only for
// the checks needed to recognize a safe retry and for one bounded create.
export interface CharacterCreateEnvironment {
  isGm(userId: string): boolean | undefined;
  get(id: string): Promise<CharacterCreateRecord | undefined>;
  ownershipMatches(record: CharacterCreateRecord, userId: string, ownership: CharacterCreateInput["ownership"]): boolean;
  legacyOwnershipMatches(record: CharacterCreateRecord, userId: string, ownership: CharacterCreateInput["ownership"]): boolean;
  // Repairs ownership and writes the operation marker for an exact, otherwise
  // recoverable record. The adapter remains responsible for the Foundry write.
  repairOwnership(record: CharacterCreateRecord, userId: string, ownership: CharacterCreateInput["ownership"]): Promise<CharacterCreateRecord>;
  create(input: CharacterCreateInput): Promise<CharacterCreateRecord>;
}

// For the API object used without Foundry. A request is refused before a
// document write can occur.
export const NO_CHARACTERS: CharacterCreateEnvironment = Object.freeze({
  isGm: () => undefined,
  get: async () => undefined,
  ownershipMatches: () => false,
  legacyOwnershipMatches: () => false,
  repairOwnership: async () => {
    throw new Error("characters cannot be repaired without Foundry");
  },
  create: async () => {
    throw new Error("characters cannot be created without Foundry");
  },
});

function fail(detail: string): PayloadCheck<CharacterCreatePayload> {
  return { ok: false, detail };
}

export function validateCharacterCreate(payload: unknown): PayloadCheck<CharacterCreatePayload> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return fail("payload must be an object with name and operationId");
  }
  const record = payload as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) return fail("payload must contain only name and operationId");
  }

  const { name, operationId } = record;
  if (typeof name !== "string") return fail("payload.name must be a string");
  const trimmed = name.trim();
  if (trimmed === "" || trimmed.length > MAX_NAME_LENGTH) {
    return fail("payload.name must be a non-empty string of at most 200 characters");
  }
  if (typeof operationId !== "string" || !ID_PATTERN.test(operationId)) {
    return fail("payload.operationId must be 16 letters and digits");
  }
  return { ok: true, value: { name: trimmed, operationId } };
}

function hasMarker(value: unknown, requesterId: string, operationId: string): boolean {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const marker = value as Record<string, unknown>;
  return (
    marker.version === CHARACTER_CREATE_MARKER_VERSION &&
    marker.requesterId === requesterId &&
    marker.operationId === operationId
  );
}

function markerIsAbsent(value: unknown): boolean {
  return value === undefined || value === null;
}

function isRetryRecord(
  environment: CharacterCreateEnvironment,
  record: CharacterCreateRecord,
  payload: CharacterCreatePayload,
  requesterId: string,
  ownership: CharacterCreateInput["ownership"],
): boolean {
  return (
    record.id === payload.operationId &&
    record.name === payload.name &&
    record.type === "character" &&
    environment.ownershipMatches(record, requesterId, ownership) &&
    hasMarker(record.marker, requesterId, payload.operationId)
  );
}

function createResult(record: CharacterCreateRecord, created: boolean): JsonValue {
  return { id: record.id, name: record.name, created };
}

function authorizationOf(context: RequestContext, environment: CharacterCreateEnvironment): RightsVerdict {
  if (context.module.id !== CHARACTER_CREATE_MODULE_ID) {
    return { ok: false, detail: "character.create is available only to eagle-character-edit" };
  }
  const requesterId = context.user?.id;
  if (!requesterId) return { ok: false, detail: "the requester is not known" };
  if (environment.isGm(requesterId) === undefined) {
    return { ok: false, detail: "the requester's role is not known" };
  }
  return { ok: true };
}

function requestIdentityOf(
  context: RequestContext,
  environment: CharacterCreateEnvironment,
): { requesterId: string; ownership: CharacterCreateInput["ownership"] } {
  const verdict = authorizationOf(context, environment);
  if (verdict.ok !== true) throw new Error(verdict.detail);
  const requesterId = context.user?.id;
  if (!requesterId) throw new Error("the requester is not known");
  return { requesterId, ownership: environment.isGm(requesterId) ? "none" : "requester" };
}

// This special request intentionally has no target: the Character does not
// exist before it is created. The normal rights gate still decides denied,
// own and all. The checks below constrain every successful request to the
// confirmed requester and to this one Actor shape. Players receive direct
// ownership; GM/Assistant-created Actors keep default NONE ownership.
export function createCharacterCreateHandler(environment: CharacterCreateEnvironment): RequestHandler<CharacterCreatePayload> {
  const inFlight = new Map<string, Promise<JsonValue>>();

  async function createOrRetry(
    payload: CharacterCreatePayload,
    requesterId: string,
    ownership: CharacterCreateInput["ownership"],
  ): Promise<JsonValue> {
    const present = await environment.get(payload.operationId);
    if (present) {
      if (isRetryRecord(environment, present, payload, requesterId, ownership)) return createResult(present, false);
      const exactShape = present.id === payload.operationId && present.name === payload.name && present.type === "character";
      const markedRetry = exactShape && hasMarker(present.marker, requesterId, payload.operationId);
      // A v13 create can persist the Actor while dropping the module flag and
      // assigning the creating GM as its direct Owner. Recover only the exact
      // pending id/name/type when it is unmarked and is either already in the
      // requested state or is owned solely by this privileged requester.
      // Malformed markers and foreign owners stay opaque.
      const legacyRetry = exactShape && markerIsAbsent(present.marker) && environment.legacyOwnershipMatches(present, requesterId, ownership);
      if (markedRetry || legacyRetry) {
        const repaired = await environment.repairOwnership(present, requesterId, ownership);
        if (isRetryRecord(environment, repaired, payload, requesterId, ownership)) return createResult(repaired, false);
      }
      throw new Error("the character create operation is unavailable");
    }

    const input: CharacterCreateInput = {
      id: payload.operationId,
      name: payload.name,
      requesterId,
      ownership,
      marker: {
        version: CHARACTER_CREATE_MARKER_VERSION,
        requesterId,
        operationId: payload.operationId,
      },
    };

    try {
      const created = await environment.create(input);
      if (!isRetryRecord(environment, created, payload, requesterId, ownership)) {
        throw new Error("Foundry did not preserve the character create ownership and marker");
      }
      return createResult(created, true);
    } catch (error) {
      // A second GM-side operation can win the document-id race. Reading the
      // exact id again is safe only when it proves this same requester and
      // operation; every other collision remains a refusal without data leak.
      const afterFailure = await environment.get(payload.operationId);
      if (afterFailure && isRetryRecord(environment, afterFailure, payload, requesterId, ownership)) {
        return createResult(afterFailure, false);
      }
      throw error;
    }
  }

  return {
    type: CHARACTER_CREATE_TYPE,
    versions: [CHARACTER_CREATE_VERSION],
    runsOn: "gm",
    validate: validateCharacterCreate,
    authorize: (_payload, context) => authorizationOf(context, environment),
    async run(payload, context): Promise<JsonValue> {
      const { requesterId, ownership } = requestIdentityOf(context, environment);
      const key = requesterId + ":" + ownership + ":" + payload.operationId;
      const waiting = inFlight.get(key);
      if (waiting) return waiting;

      const work = createOrRetry(payload, requesterId, ownership);
      inFlight.set(key, work);
      try {
        return await work;
      } finally {
        if (inFlight.get(key) === work) inFlight.delete(key);
      }
    },
  };
}

import type { JsonValue } from "./json-value";
import {
  RequestExecutionError,
  type PayloadCheck,
  type RequestContext,
  type RequestHandler,
  type RightsVerdict,
} from "./request-kernel";

export const CHARACTER_UPDATE_TYPE = "character.update";
export const CHARACTER_UPDATE_VERSION = 1;
export const CHARACTER_UPDATE_MARKER_VERSION = 1;
export const CHARACTER_UPDATE_MODULE_ID = "eagle-character-edit";

export const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"] as const;
export type AbilityKey = (typeof ABILITY_KEYS)[number];

export interface AbilityChange {
  readonly from: number;
  readonly to: number;
}

export interface CharacterUpdatePayload {
  readonly uuid: string;
  readonly operationId: string;
  readonly revision: number;
  readonly abilities: Readonly<Partial<Record<AbilityKey, AbilityChange>>>;
}

export interface CharacterUpdateMarker {
  readonly version: 1;
  readonly revision: number;
  readonly last: {
    readonly operationId: string;
    readonly requesterId: string;
    readonly intent: string;
  };
}

export interface CharacterUpdateRecord {
  readonly id: string;
  readonly uuid: string;
  readonly type: string;
  readonly abilities: Readonly<Record<AbilityKey, unknown>>;
  readonly ownership: JsonValue;
  readonly marker: unknown;
}

export interface CharacterUpdateEnvironment {
  systemId(): string | undefined;
  isGm(userId: string): boolean | undefined;
  get(uuid: string): Promise<CharacterUpdateRecord | undefined>;
  owns(record: CharacterUpdateRecord, userId: string): boolean;
  update(uuid: string, changes: Readonly<Record<string, JsonValue>>): Promise<void>;
}

export const NO_CHARACTER_UPDATES: CharacterUpdateEnvironment = {
  systemId: () => undefined,
  isGm: () => undefined,
  get: async () => undefined,
  owns: () => false,
  update: async () => {
    throw new Error("character updates are unavailable");
  },
};

const WORLD_ACTOR_UUID = /^Actor\.([A-Za-z0-9]{16})$/;
const OPERATION_ID = /^[A-Za-z0-9]{16}$/;
const TOP_LEVEL_FIELDS = new Set(["uuid", "operationId", "revision", "abilities"]);
const CHANGE_FIELDS = new Set(["from", "to"]);

function object(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function invalid(detail: string): PayloadCheck<CharacterUpdatePayload> {
  return { ok: false, detail };
}

function exactFields(value: Record<string, unknown>, fields: ReadonlySet<string>): boolean {
  const keys = Object.keys(value);
  return keys.length === fields.size && keys.every((key) => fields.has(key));
}

export function validateCharacterUpdate(payload: unknown): PayloadCheck<CharacterUpdatePayload> {
  const source = object(payload);
  if (!source || !exactFields(source, TOP_LEVEL_FIELDS)) {
    return invalid("payload must contain exactly uuid, operationId, revision and abilities");
  }
  const { uuid, operationId, revision } = source;
  if (typeof uuid !== "string" || !WORLD_ACTOR_UUID.test(uuid)) {
    return invalid("payload.uuid must be an exact primary world Actor UUID");
  }
  if (typeof operationId !== "string" || !OPERATION_ID.test(operationId)) {
    return invalid("payload.operationId must be 16 letters and digits");
  }
  if (typeof revision !== "number" || !Number.isSafeInteger(revision) || revision < 0) {
    return invalid("payload.revision must be a non-negative safe integer");
  }
  const rawAbilities = object(source.abilities);
  if (!rawAbilities) return invalid("payload.abilities must be an object");
  const keys = Object.keys(rawAbilities);
  if (keys.length < 1 || keys.length > ABILITY_KEYS.length || keys.some((key) => !ABILITY_KEYS.includes(key as AbilityKey))) {
    return invalid("payload.abilities must contain one to six D&D ability keys");
  }
  const abilities: Partial<Record<AbilityKey, AbilityChange>> = {};
  for (const key of ABILITY_KEYS) {
    if (!(key in rawAbilities)) continue;
    const change = object(rawAbilities[key]);
    if (!change || !exactFields(change, CHANGE_FIELDS)) {
      return invalid(`payload.abilities.${key} must contain exactly from and to`);
    }
    const { from, to } = change;
    if (
      typeof from !== "number" ||
      typeof to !== "number" ||
      !Number.isFinite(from) ||
      !Number.isFinite(to) ||
      !Number.isInteger(from) ||
      !Number.isInteger(to) ||
      from < 0 ||
      from > 30 ||
      to < 0 ||
      to > 30 ||
      from === to
    ) {
      return invalid(`payload.abilities.${key}.from and .to must be different integers from 0 to 30`);
    }
    abilities[key] = { from, to };
  }
  return { ok: true, value: { uuid, operationId, revision, abilities } };
}

function marker(value: unknown): CharacterUpdateMarker | undefined {
  const raw = object(value);
  const last = object(raw?.last);
  if (
    !raw ||
    !exactFields(raw, new Set(["version", "revision", "last"])) ||
    raw?.version !== CHARACTER_UPDATE_MARKER_VERSION ||
    typeof raw.revision !== "number" ||
    !Number.isSafeInteger(raw.revision) ||
    raw.revision < 0 ||
    !last ||
    !exactFields(last, new Set(["operationId", "requesterId", "intent"])) ||
    typeof last.operationId !== "string" ||
    typeof last.requesterId !== "string" ||
    typeof last.intent !== "string"
  ) return undefined;
  return raw as unknown as CharacterUpdateMarker;
}

function intent(payload: CharacterUpdatePayload): string {
  const abilities: Partial<Record<AbilityKey, AbilityChange>> = {};
  for (const key of ABILITY_KEYS) if (payload.abilities[key]) abilities[key] = payload.abilities[key];
  return JSON.stringify({ uuid: payload.uuid, revision: payload.revision, abilities });
}

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

function changedKeys(payload: CharacterUpdatePayload): AbilityKey[] {
  return ABILITY_KEYS.filter((key) => payload.abilities[key] !== undefined);
}

function desiredValuesMatch(record: CharacterUpdateRecord, payload: CharacterUpdatePayload): boolean {
  return changedKeys(payload).every((key) => record.abilities[key] === payload.abilities[key]!.to);
}

function canonical(record: CharacterUpdateRecord, payload: CharacterUpdatePayload): boolean {
  return record.uuid === payload.uuid && record.id === WORLD_ACTOR_UUID.exec(payload.uuid)?.[1] && record.type === "character";
}

function result(payload: CharacterUpdatePayload, revision: number, applied: boolean): JsonValue {
  return { uuid: payload.uuid, revision, applied, changed: changedKeys(payload) };
}

function conflict(detail = "the character changed; read it again before retrying"): never {
  throw new RequestExecutionError("conflict", detail);
}

function deny(): never {
  throw new RequestExecutionError("not-permitted", "the character update is not permitted");
}

async function authorizedRecord(
  environment: CharacterUpdateEnvironment,
  payload: CharacterUpdatePayload,
  requesterId: string,
  isGm: boolean,
): Promise<CharacterUpdateRecord> {
  const record = await environment.get(payload.uuid);
  if (!record || !canonical(record, payload)) deny();
  if (!isGm && !environment.owns(record, requesterId)) deny();
  return record;
}

function authorizationOf(context: RequestContext, environment: CharacterUpdateEnvironment): RightsVerdict {
  if (context.module.id !== CHARACTER_UPDATE_MODULE_ID) {
    return { ok: false, detail: "character.update is available only to eagle-character-edit" };
  }
  if (environment.systemId() !== "dnd5e") return { ok: false, detail: "character.update requires the dnd5e system" };
  const requesterId = context.user?.id;
  if (!requesterId || environment.isGm(requesterId) === undefined) {
    return { ok: false, detail: "the requester is not known" };
  }
  return { ok: true };
}

export function createCharacterUpdateHandler(environment: CharacterUpdateEnvironment): RequestHandler<CharacterUpdatePayload> {
  const actorQueues = new Map<string, Promise<void>>();
  const inFlight = new Map<string, { intent: string; work: Promise<JsonValue> }>();

  async function serialized<T>(uuid: string, action: () => Promise<T>): Promise<T> {
    const previous = actorQueues.get(uuid) ?? Promise.resolve();
    let release!: () => void;
    const current = new Promise<void>((resolve) => { release = resolve; });
    const tail = previous.then(() => current);
    actorQueues.set(uuid, tail);
    await previous;
    try {
      return await action();
    } finally {
      release();
      if (actorQueues.get(uuid) === tail) actorQueues.delete(uuid);
    }
  }

  async function apply(payload: CharacterUpdatePayload, requesterId: string, isGm: boolean, requestIntent: string): Promise<JsonValue> {
    return serialized(payload.uuid, async () => {
      const before = await authorizedRecord(environment, payload, requesterId, isGm);
      const presentMarker = marker(before.marker);
      if (before.marker !== undefined && before.marker !== null && !presentMarker) conflict();
      if (
        presentMarker?.last.operationId === payload.operationId &&
        presentMarker.last.requesterId === requesterId &&
        presentMarker.last.intent === requestIntent &&
        desiredValuesMatch(before, payload)
      ) return result(payload, presentMarker.revision, false);

      const revision = presentMarker?.revision ?? 0;
      if (payload.revision !== revision) conflict();
      for (const key of changedKeys(payload)) {
        if (before.abilities[key] !== payload.abilities[key]!.from) conflict();
      }

      const nextMarker: CharacterUpdateMarker = {
        version: CHARACTER_UPDATE_MARKER_VERSION,
        revision: revision + 1,
        last: { operationId: payload.operationId, requesterId, intent: requestIntent },
      };
      const changes: Record<string, JsonValue> = {
        "flags.eagle-character-edit.characterWrite": nextMarker as unknown as JsonValue,
      };
      for (const key of changedKeys(payload)) changes[`system.abilities.${key}.value`] = payload.abilities[key]!.to;
      const ownership = stable(before.ownership);
      await environment.update(payload.uuid, changes);

      const after = await environment.get(payload.uuid);
      if (!after || !canonical(after, payload) || !desiredValuesMatch(after, payload) || stable(after.ownership) !== ownership || stable(after.marker as JsonValue) !== stable(nextMarker as unknown as JsonValue)) {
        throw new Error("Foundry did not preserve the character update values, marker and ownership");
      }
      return result(payload, nextMarker.revision, true);
    });
  }

  return {
    type: CHARACTER_UPDATE_TYPE,
    versions: [CHARACTER_UPDATE_VERSION],
    runsOn: "gm",
    validate: validateCharacterUpdate,
    targets: (payload) => [payload.uuid],
    authorize: async (payload, context) => {
      const base = authorizationOf(context, environment);
      if (!base.ok) return base;
      const requesterId = context.user!.id;
      const isGm = environment.isGm(requesterId)!;
      try {
        await authorizedRecord(environment, payload, requesterId, isGm);
        return { ok: true };
      } catch {
        return { ok: false, detail: "the character update is not permitted" };
      }
    },
    async run(payload, context): Promise<JsonValue> {
      const base = authorizationOf(context, environment);
      if (!base.ok) deny();
      const requesterId = context.user!.id;
      const isGm = environment.isGm(requesterId)!;
      const requestIntent = intent(payload);
      const key = `${payload.uuid}:${requesterId}:${payload.operationId}`;
      const waiting = inFlight.get(key);
      if (waiting) {
        if (waiting.intent !== requestIntent) conflict("the operation id is already in use for another character update");
        return waiting.work;
      }
      const work = apply(payload, requesterId, isGm, requestIntent);
      inFlight.set(key, { intent: requestIntent, work });
      try {
        return await work;
      } finally {
        if (inFlight.get(key)?.work === work) inFlight.delete(key);
      }
    },
  };
}

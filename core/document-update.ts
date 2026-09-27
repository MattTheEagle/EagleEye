import { isJsonValue, type JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

// The document types document.update works on: the same four as document.create, compendium.import and
// compendium.flag. A primary document only (not an effect, not an Item embedded in an Actor) — same rule as
// compendium.import's sources; an embedded document is reached through its parent's own `effects`/`items` path
// instead (M6 Apply, section 1).
export const UPDATABLE_DOCUMENT_TYPES = ["Actor", "Item", "JournalEntry", "RollTable"] as const;
export type UpdatableDocumentType = (typeof UPDATABLE_DOCUMENT_TYPES)[number];

const MAX_CHANGES = 50;
const MAX_UUID_LENGTH = 200;
// `_id`/`_stats` for the same reason as document.create (the id is not settable this way, the origin is not settable);
// `type` because changing a document's subtype after creation is a structural operation, not an ordinary field change
// (M6 Discover, the one open point Apply resolved).
const FORBIDDEN_FIRST_SEGMENTS = ["_id", "_stats", "type"];
// Same shape as compendium.import's own path pattern (document-import.ts): a plain dotted path, no leading digit.
const PATH_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*(\.[A-Za-z0-9_-]+)*$/;

// What the handler needs to know about the target, resolved from its UUID.
export interface UpdateTarget {
  readonly documentName: string;
  readonly locked: boolean;
  // False for an embedded document (an effect, an Item of an Actor) or anything `fromUuid` cannot classify as one of
  // the primary Eagle catalog types.
  readonly primary: boolean;
}

// What the handler needs from Foundry (v13/document-update.ts). Every call may throw or reject; the kernel turns that
// into `handler-failed`.
export interface DocumentUpdateEnvironment {
  target(uuid: string): Promise<UpdateTarget | undefined>;
  // Applies the changes to the document at this UUID. Always safe to call again with the same changes: unlike
  // creating a document, writing the same field value twice has no further effect, so no read-compare-write dance is
  // needed here the way compendium.flag needs one for a single flag (M6 Apply, section 1).
  update(uuid: string, changes: Readonly<Record<string, JsonValue>>): Promise<void>;
}

// For callers without Foundry (the default kernel of createEagleApi, tests): nothing can be updated.
export const NO_UPDATES: DocumentUpdateEnvironment = Object.freeze({
  target: async () => undefined,
  update: async () => {
    throw new Error("documents cannot be updated without Foundry");
  },
});

export interface UpdatePayload {
  readonly uuid: string;
  readonly changes: Readonly<Record<string, JsonValue>>;
}

// The payload of document.update: { uuid, changes }. `changes` is a path-keyed object like compendium.import's own
// `changes` (document-import.ts), applied here to an independently named, already existing document instead of a
// copy the same request is creating.
function validateUpdate(payload: unknown): PayloadCheck<UpdatePayload> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { uuid, changes }" };
  }
  const { uuid, changes } = payload as Record<string, unknown>;
  if (typeof uuid !== "string" || uuid === "" || uuid.length > MAX_UUID_LENGTH) {
    return { ok: false, detail: `payload.uuid must be a non-empty string of at most ${MAX_UUID_LENGTH} characters` };
  }
  if (typeof changes !== "object" || changes === null || Array.isArray(changes)) {
    return { ok: false, detail: "payload.changes must be an object from a path to a value" };
  }
  const paths = Object.keys(changes);
  if (paths.length === 0) return { ok: false, detail: "payload.changes must name at least one path" };
  if (paths.length > MAX_CHANGES) {
    return { ok: false, detail: `payload.changes must not have more than ${MAX_CHANGES} paths` };
  }
  for (const path of paths) {
    if (!PATH_PATTERN.test(path) || FORBIDDEN_FIRST_SEGMENTS.includes(path.split(".")[0]!)) {
      return { ok: false, detail: `payload.changes has a path that is not allowed: ${path.slice(0, 60)}` };
    }
    if (!isJsonValue((changes as Record<string, unknown>)[path])) {
      return { ok: false, detail: `payload.changes must hold JSON values only (${path})` };
    }
  }
  return { ok: true, value: { uuid, changes: changes as Record<string, JsonValue> } };
}

// document.update (version 1, since API 0.14.0): changes named fields of a document that already exists, named by
// UUID. It runs on the Gamemaster's client and is for a Gamemaster or Assistant only. Unlike document.create it names
// its target the ordinary way (a UUID, not a { pack } | { world } choice) — the UUID already says where the document
// is (M6 Discover, Befund 5).
export function createDocumentUpdateHandler(environment: DocumentUpdateEnvironment): RequestHandler<UpdatePayload> {
  return {
    type: "document.update",
    versions: [1],
    runsOn: "gm",
    gmOnly: true,
    validate: validateUpdate,
    targets: (payload) => [payload.uuid],
    async run(payload): Promise<JsonValue> {
      const target = await environment.target(payload.uuid);
      if (!target) throw new Error(`the document ${payload.uuid} does not exist`);
      if (!target.primary) throw new Error(`the document ${payload.uuid} is not a primary document`);
      if (target.locked) throw new Error(`the compendium of ${payload.uuid} is locked`);
      if (!(UPDATABLE_DOCUMENT_TYPES as readonly string[]).includes(target.documentName)) {
        throw new Error(`documents of type ${target.documentName} cannot be updated (only ${UPDATABLE_DOCUMENT_TYPES.join(", ")})`);
      }
      // Captured before the write: Foundry's own `Document#update` was found live (M6 live check) to mutate the
      // `changes` object it is given in place, expanding it into the document's own full diff shape (`_id`, `type`,
      // `system`, ...) — reading the requested paths only *after* the write reported that shape back, not what was
      // actually asked for.
      const requestedPaths = Object.keys(payload.changes);
      await environment.update(payload.uuid, payload.changes);
      return { uuid: payload.uuid, changed: requestedPaths };
    },
  };
}

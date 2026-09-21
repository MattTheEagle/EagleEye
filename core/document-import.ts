import { isJsonValue, type JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

// The document types compendium.import copies: the four of the Eagle catalog. Another type is refused until a milestone
// needs it (the other types have their own rules when they are stored in a compendium).
export const IMPORTABLE_DOCUMENT_TYPES = ["Actor", "Item", "JournalEntry", "RollTable"] as const;
export type ImportableDocumentType = (typeof IMPORTABLE_DOCUMENT_TYPES)[number];

export const MAX_IMPORT_SOURCES = 100;
export const MAX_IMPORT_CHANGES = 50;
const MAX_UUID_LENGTH = 200;
const MAX_NAME_LENGTH = 200;
const ID_PATTERN = /^[A-Za-z0-9]{16}$/;
// A path into the data of a document, like "system.container"; the id and the origin (`_stats`) have their own ways.
const PATH_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*(\.[A-Za-z0-9_-]+)*$/;
const FORBIDDEN_FIRST_SEGMENTS = ["_id", "_stats"];
const PACK_PATTERN = /^world\.[a-z0-9]+([-_][a-z0-9]+)*$/;

// The compendium a request writes to, as far as the handler needs to know.
export interface ImportTarget {
  readonly collection: string;
  readonly documentName: string;
  // Only a world compendium is written to.
  readonly world: boolean;
  readonly locked: boolean;
  // Whether a document of this id is in the compendium.
  has(id: string): boolean;
}

// A document a request names as a source, as far as the handler needs to know.
export interface ImportSource {
  readonly uuid: string;
  readonly id: string;
  readonly name: string;
  readonly documentName: string;
  // A primary document (an Item, an Actor), not one that lives inside another (an effect, an embedded Item).
  readonly primary: boolean;
  // The collection id of the compendium it is in; undefined for a document of the world.
  readonly pack: string | undefined;
}

// One document to copy. `id`, `name` and `changes` are for a copy that is not the source as it is (a forced copy of the
// Library): the id of the copy, its name and fields of its data to set after the copy was made.
export interface ImportEntry {
  readonly source: string;
  readonly id?: string;
  readonly name?: string;
  readonly changes?: Readonly<Record<string, JsonValue>>;
}

export interface ImportedDocument {
  readonly uuid: string;
  readonly id: string;
  readonly name: string;
}

// What the handler needs from Foundry (v13/document-import.ts). Every call may throw or reject; the kernel turns that
// into `handler-failed`.
export interface ImportEnvironment {
  // The compendium with this collection id, if Foundry knows one; its index is loaded.
  target(collection: string): Promise<ImportTarget | undefined>;
  // The document of a UUID; undefined when there is none or it cannot be read.
  source(uuid: string): Promise<ImportSource | undefined>;
  // Copies the documents into the compendium and answers the new documents, in the order of the entries. One database
  // operation; the id of a copy is the one the entry gives or else that of the source, the sources stay as they are.
  copy(collection: string, entries: readonly ImportEntry[]): Promise<readonly ImportedDocument[]>;
}

// For callers without Foundry (the default kernel of createEagleApi, tests): nothing can be copied.
export const NO_IMPORTS: ImportEnvironment = Object.freeze({
  target: async () => undefined,
  source: async () => undefined,
  copy: async () => {
    throw new Error("documents cannot be copied without Foundry");
  },
});

export interface ImportPayload {
  readonly pack: string;
  readonly sources: readonly ImportEntry[];
}

function validateEntry(entry: unknown): { ok: true; value: ImportEntry } | { ok: false; detail: string } {
  const sourceCheck = (uuid: unknown) => {
    if (typeof uuid !== "string" || uuid === "") return "payload.sources must hold non-empty strings or objects with a source";
    if (uuid.length > MAX_UUID_LENGTH) return `payload.sources must not hold a UUID longer than ${MAX_UUID_LENGTH} characters`;
    return undefined;
  };
  if (typeof entry === "string") {
    const problem = sourceCheck(entry);
    return problem ? { ok: false, detail: problem } : { ok: true, value: { source: entry } };
  }
  if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
    return { ok: false, detail: "payload.sources must hold non-empty strings or objects with a source" };
  }
  const { source, id, name, changes } = entry as Record<string, unknown>;
  const problem = sourceCheck(source);
  if (problem) return { ok: false, detail: problem };
  if (id !== undefined && (typeof id !== "string" || !ID_PATTERN.test(id))) {
    return { ok: false, detail: "payload.sources[].id must be 16 letters and digits" };
  }
  if (name !== undefined && (typeof name !== "string" || name.trim() === "" || name.length > MAX_NAME_LENGTH)) {
    return { ok: false, detail: `payload.sources[].name must be a non-empty string of at most ${MAX_NAME_LENGTH} characters` };
  }
  let checked: Record<string, JsonValue> | undefined;
  if (changes !== undefined) {
    if (typeof changes !== "object" || changes === null || Array.isArray(changes)) {
      return { ok: false, detail: "payload.sources[].changes must be an object from a path to a value" };
    }
    const paths = Object.keys(changes);
    if (paths.length > MAX_IMPORT_CHANGES) {
      return { ok: false, detail: `payload.sources[].changes must not have more than ${MAX_IMPORT_CHANGES} paths` };
    }
    for (const path of paths) {
      if (!PATH_PATTERN.test(path) || FORBIDDEN_FIRST_SEGMENTS.includes(path.split(".")[0]!)) {
        return { ok: false, detail: `payload.sources[].changes has a path that is not allowed: ${path.slice(0, 60)}` };
      }
      if (!isJsonValue((changes as Record<string, unknown>)[path])) {
        return { ok: false, detail: `payload.sources[].changes must hold JSON values only (${path})` };
      }
    }
    checked = { ...(changes as Record<string, JsonValue>) };
  }
  return {
    ok: true,
    value: {
      source: source as string,
      ...(id === undefined ? {} : { id: id as string }),
      ...(name === undefined ? {} : { name: (name as string).trim() }),
      ...(checked === undefined ? {} : { changes: checked }),
    },
  };
}

// The payload of compendium.import: { pack, sources }. An entry of `sources` is a UUID or an object { source, id?, name?, changes? }.
function validateImport(payload: unknown): PayloadCheck<ImportPayload> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { pack, sources }" };
  }
  const { pack, sources } = payload as Record<string, unknown>;
  if (typeof pack !== "string" || !PACK_PATTERN.test(pack) || pack.length > MAX_UUID_LENGTH) {
    return { ok: false, detail: "payload.pack must be the id of a world compendium like world.<name>" };
  }
  if (!Array.isArray(sources) || sources.length === 0) {
    return { ok: false, detail: "payload.sources must be a list of at least one UUID" };
  }
  if (sources.length > MAX_IMPORT_SOURCES) {
    return { ok: false, detail: `payload.sources must not have more than ${MAX_IMPORT_SOURCES} UUIDs` };
  }
  const entries: ImportEntry[] = [];
  const seen = new Set<string>();
  for (const raw of sources) {
    const check = validateEntry(raw);
    if (!check.ok) return check;
    // The same document may be copied twice only under two ids.
    const key = `${check.value.source}\u0000${check.value.id ?? ""}`;
    if (seen.has(key)) return { ok: false, detail: "payload.sources must not hold a UUID twice" };
    seen.add(key);
    entries.push(check.value);
  }
  return { ok: true, value: { pack, sources: entries } };
}

const uuidInPack = (target: ImportTarget, id: string): string => `Compendium.${target.collection}.${target.documentName}.${id}`;

// compendium.import (version 1): copies documents, named by UUID, into a world compendium that exists. It runs on the
// Gamemaster's client and is for a Gamemaster or Assistant only. Everything is checked before anything is written; then one
// database operation copies all documents. The id of every document stays, and so does where it came from (Foundry's
// toCompendium would clear that). A document whose id (that of the entry, or else that of the source) is in the compendium
// already is not written and is answered as existing, so asking again is safe. The sources are read only; nothing is deleted, overwritten, locked or unlocked. The
// handler knows nothing of the rules of the module that asks (which compendium, which version, what belongs together).
export function createImportHandler(environment: ImportEnvironment): RequestHandler<ImportPayload> {
  return {
    type: "compendium.import",
    versions: [1],
    runsOn: "gm",
    gmOnly: true,
    validate: validateImport,
    targets: (payload) => [...new Set(payload.sources.map((entry) => entry.source))],
    async run(payload): Promise<JsonValue> {
      const target = await environment.target(payload.pack);
      if (!target) throw new Error(`the compendium ${payload.pack} does not exist`);
      if (!target.world) throw new Error(`the compendium ${target.collection} is not a world compendium`);
      if (target.locked) throw new Error(`the compendium ${target.collection} is locked`);
      if (!(IMPORTABLE_DOCUMENT_TYPES as readonly string[]).includes(target.documentName)) {
        throw new Error(`documents of type ${target.documentName} cannot be copied (only ${IMPORTABLE_DOCUMENT_TYPES.join(", ")})`);
      }

      const documents = new Map<string, ImportSource>();
      const finalIds = new Set<string>();
      const planned: { entry: ImportEntry; source: ImportSource; id: string }[] = [];
      for (const entry of payload.sources) {
        const uuid = entry.source;
        let source = documents.get(uuid);
        if (!source) {
          source = await environment.source(uuid);
          if (!source) throw new Error(`the source ${uuid} cannot be read`);
          if (!source.primary) throw new Error(`the source ${uuid} lives inside another document; only primary documents are copied`);
          if (source.pack === target.collection) throw new Error(`the source ${uuid} is in the compendium ${target.collection} already`);
          if (source.documentName !== target.documentName) {
            throw new Error(`the source ${uuid} is a ${source.documentName}, the compendium ${target.collection} holds ${target.documentName}`);
          }
          documents.set(uuid, source);
        }
        const id = entry.id ?? source.id;
        if (finalIds.has(id)) throw new Error(`two copies would have the id ${id}`);
        finalIds.add(id);
        planned.push({ entry, source, id });
      }

      const existing = planned.filter((item) => target.has(item.id));
      const missing = planned.filter((item) => !target.has(item.id));
      const copied = missing.length > 0 ? await environment.copy(target.collection, missing.map((item) => item.entry)) : [];
      if (copied.length !== missing.length) {
        throw new Error(`${missing.length} documents were to be copied, Foundry answered ${copied.length}`);
      }

      const created = missing.map((item, index) => ({
        source: item.entry.source,
        uuid: copied[index]!.uuid,
        id: copied[index]!.id,
        name: copied[index]!.name,
      }));
      const existed = existing.map((item) => ({
        source: item.entry.source,
        uuid: uuidInPack(target, item.id),
        id: item.id,
        name: item.entry.name ?? item.source.name,
      }));
      return { pack: target.collection, created, existed };
    },
  };
}

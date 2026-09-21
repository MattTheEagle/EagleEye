import type { JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

// The document types a compendium can have (CONST.COMPENDIUM_DOCUMENT_TYPES of Foundry v13).
export const COMPENDIUM_DOCUMENT_TYPES = [
  "Actor",
  "Adventure",
  "Cards",
  "Item",
  "JournalEntry",
  "Macro",
  "Playlist",
  "RollTable",
  "Scene",
] as const;
export type CompendiumDocumentType = (typeof COMPENDIUM_DOCUMENT_TYPES)[number];

const MAX_NAME_LENGTH = 100;
const MAX_LABEL_LENGTH = 200;
// A safe part of what Foundry accepts as a compendium name (Foundry says: no spaces or special characters, no period):
// lower case letters and digits in groups that are joined by a hyphen or an underscore.
const NAME_PATTERN = /^[a-z0-9]+([-_][a-z0-9]+)*$/;

// What Flight Control knows about a world compendium: the name without the package, the collection id (`world.<name>`),
// the label, the document type, whether it is locked and the ownership per role as Foundry gives it.
export interface CompendiumInfo {
  readonly name: string;
  readonly collection: string;
  readonly label: string;
  readonly type: string;
  readonly locked: boolean;
  readonly ownership: Readonly<Record<string, string>>;
}

export interface CompendiumMetadata {
  readonly type: CompendiumDocumentType;
  readonly label: string;
  readonly name: string;
}

// What the handler needs from Foundry (v13/compendium.ts). Both may throw or reject; the kernel turns that into
// `handler-failed`.
export interface CompendiumEnvironment {
  // The world compendium of this name, if there is one.
  find(name: string): CompendiumInfo | undefined;
  // Creates a world compendium. Foundry's own rules and rights apply.
  create(metadata: CompendiumMetadata): Promise<CompendiumInfo>;
}

// For callers without Foundry (the default kernel of createEagleApi, tests): there is no compendium, and none can be made.
export const NO_COMPENDIUMS: CompendiumEnvironment = Object.freeze({
  find: () => undefined,
  create: async () => {
    throw new Error("compendia cannot be created without Foundry");
  },
});

// The payload of compendium.create: { type, label, name }.
function validateCreate(payload: unknown): PayloadCheck<CompendiumMetadata> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { type, label, name }" };
  }
  const { type, label, name } = payload as Record<string, unknown>;
  if (typeof type !== "string" || !(COMPENDIUM_DOCUMENT_TYPES as readonly string[]).includes(type)) {
    return { ok: false, detail: `payload.type must be one of ${COMPENDIUM_DOCUMENT_TYPES.join(", ")}` };
  }
  if (typeof label !== "string" || label.trim() === "") return { ok: false, detail: "payload.label must be a non-empty string" };
  if (label.length > MAX_LABEL_LENGTH) {
    return { ok: false, detail: `payload.label must not be longer than ${MAX_LABEL_LENGTH} characters` };
  }
  if (typeof name !== "string" || name === "") return { ok: false, detail: "payload.name must be a non-empty string" };
  if (name.length > MAX_NAME_LENGTH) {
    return { ok: false, detail: `payload.name must not be longer than ${MAX_NAME_LENGTH} characters` };
  }
  if (!NAME_PATTERN.test(name)) {
    return {
      ok: false,
      detail: "payload.name may only have lower case letters and digits, joined by single hyphens or underscores",
    };
  }
  return { ok: true, value: { type: type as CompendiumDocumentType, label: label.trim(), name } };
}

// The result as plain JSON: only text from the ownership, whatever Foundry put there.
function describe(info: CompendiumInfo, created: boolean): JsonValue {
  const ownership: { [role: string]: string } = {};
  for (const [role, level] of Object.entries(info.ownership)) {
    if (typeof level === "string") ownership[role] = level;
  }
  return {
    created,
    collection: info.collection,
    name: info.name,
    label: info.label,
    type: info.type,
    locked: info.locked === true,
    ownership,
  };
}

// compendium.create (version 1): creates a world compendium (`createCompendium`) and changes nothing else about it (no lock,
// no ownership: it keeps what Foundry gives a new compendium). It runs on the Gamemaster's client, is for a Gamemaster or
// Assistant only and has no target: it acts on no existing document. It is safe to repeat: a compendium of that name and
// document type that exists already is answered with `created: false` and left alone; one of another document type fails and
// is not touched. Nothing is deleted, renamed or filled.
export function createCompendiumHandler(environment: CompendiumEnvironment): RequestHandler<CompendiumMetadata> {
  return {
    type: "compendium.create",
    versions: [1],
    runsOn: "gm",
    gmOnly: true,
    validate: validateCreate,
    async run(metadata): Promise<JsonValue> {
      const existing = environment.find(metadata.name);
      if (existing) {
        if (existing.type !== metadata.type) {
          throw new Error(
            `the compendium ${existing.collection} exists with the document type ${existing.type}, not ${metadata.type}`,
          );
        }
        return describe(existing, false);
      }
      return describe(await environment.create(metadata), true);
    },
  };
}

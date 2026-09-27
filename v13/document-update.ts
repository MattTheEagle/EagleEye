import type { DocumentUpdateEnvironment, UpdateTarget } from "../core/document-update";
import type { JsonValue } from "../core/json-value";

// A resolved Foundry document, as far as this file uses it. Its shape matches what `fromUuid` gives back for a
// primary document (Actor, Item, JournalEntry or RollTable): `documentName`, `pack` (only set when it lives in a
// compendium) and `isEmbedded` (true for an effect or an Item inside an Actor — a fresh cast, the same style
// v13/document-create.ts and v13/document-import.ts already use for `fromUuid` results).
interface ResolvedDocument {
  readonly documentName: string;
  readonly pack?: string;
  readonly isEmbedded: boolean;
  update(data: Record<string, unknown>): Promise<unknown>;
}

// The type of fromUuid only takes UUIDs it can check at compile time; the UUID here is not statically known, so the
// cast is needed (same pattern as v13/document-import.ts and v13/rights.ts).
async function resolve(uuid: string): Promise<ResolvedDocument | null> {
  return (await foundry.utils.fromUuid(uuid as never)) as unknown as ResolvedDocument | null;
}

// Foundry's side of document.update: resolving a document by UUID and applying the changes. Whether Foundry accepts a
// dotted-path `changes` object directly on `Document#update` (without expanding it first) is checked in a running
// Foundry (M6 live check) — `compendium.import`'s own `changes` already relies on Foundry's path handling for
// creation data, this is the same expectation for an update.
export function foundryDocumentUpdateEnvironment(): DocumentUpdateEnvironment {
  return {
    target: async (uuid: string): Promise<UpdateTarget | undefined> => {
      const document = await resolve(uuid);
      if (!document) return undefined;
      const locked = document.pack ? game.packs?.get(document.pack)?.locked === true : false;
      return { documentName: document.documentName, locked, primary: !document.isEmbedded };
    },
    update: async (uuid: string, changes: Readonly<Record<string, JsonValue>>): Promise<void> => {
      const document = await resolve(uuid);
      if (!document) throw new Error(`the document ${uuid} does not exist`);
      await document.update(changes as Record<string, unknown>);
    },
  };
}

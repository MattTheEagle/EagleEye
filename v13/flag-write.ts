import type { JsonValue } from "../core/json-value";
import type { FlagEnvironment, FlagTarget } from "../core/flag-write";

// The parts of a document that are used here.
interface FlaggedDocument {
  getFlag(scope: string, key: string): unknown;
  setFlag(scope: string, key: string, value: unknown): Promise<unknown>;
  unsetFlag(scope: string, key: string): Promise<unknown>;
}

// Foundry's side of compendium.flag. Whether the Gamemaster's client (and an Assistant's) may set a flag on a document of a world
// compendium this way is checked in a running Foundry (Library milestone M8 live check; the contract lists it as not verified).
export function foundryFlagEnvironment(): FlagEnvironment {
  const documentOf = async (collection: string, id: string): Promise<FlaggedDocument> => {
    const pack = game.packs?.get(collection);
    const document = (await pack?.getDocument(id)) as unknown as FlaggedDocument | null | undefined;
    if (!document) throw new Error(`the compendium ${collection} has no document ${id}`);
    return document;
  };
  return {
    target: async (collection): Promise<FlagTarget | undefined> => {
      const pack = game.packs?.get(collection);
      if (!pack) return undefined;
      const index = await pack.getIndex();
      return {
        collection: pack.collection,
        documentName: pack.documentName,
        world: pack.metadata.packageType === "world",
        locked: pack.locked === true,
        has: (id) => index.has(id),
      };
    },
    get: async (collection, id, namespace, key): Promise<JsonValue | undefined> => {
      const value = (await documentOf(collection, id)).getFlag(namespace, key);
      return value === undefined ? undefined : (JSON.parse(JSON.stringify(value)) as JsonValue);
    },
    set: async (collection, id, namespace, key, value): Promise<void> => {
      const document = await documentOf(collection, id);
      if (value === null) await document.unsetFlag(namespace, key);
      else await document.setFlag(namespace, key, value);
    },
  };
}

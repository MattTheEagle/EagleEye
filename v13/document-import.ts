import type { ImportedDocument, ImportEntry, ImportEnvironment, ImportSource, ImportTarget } from "../core/document-import";

// All that is used of a document here. The type of fromUuid only takes UUIDs it can check at compile time, and the
// documents come in many classes; what is read is the same for all of them.
interface CopyableDocument {
  readonly uuid: string;
  readonly id: string | null;
  readonly name: string | null;
  readonly documentName: string;
  readonly isEmbedded: boolean;
  readonly pack: string | null;
  toCompendium(pack: CompendiumCollection.Any, options: Record<string, boolean>): object;
}

async function documentOf(uuid: string): Promise<CopyableDocument | undefined> {
  try {
    const document = (await foundry.utils.fromUuid(uuid as never)) as unknown as CopyableDocument | null;
    return document && typeof document.id === "string" ? document : undefined;
  } catch {
    return undefined;
  }
}

// The options of toCompendium for a copy: the id stays (the acceptance of the milestone and what makes the links between
// documents of a compendium hold), where the document came from stays (decision N10; Foundry clears it by default), and a
// folder of the source is cleared because the target has no such folder. Foundry's own defaults hold for the rest: sort
// order, ownership and state are cleared, flags stay.
const COPY_OPTIONS = { clearSource: false, keepId: true, clearFolder: true } as const;

// Foundry's side of compendium.import: which compendium, which documents, and copying them. Whether Foundry lets the
// Gamemaster's client write into a world compendium this way, whether the ids of embedded documents and where they came
// from stay, and what dnd5e changes when it creates a document are checked in a running Foundry (M4 live check).
export function foundryImportEnvironment(): ImportEnvironment {
  return {
    target: async (collection): Promise<ImportTarget | undefined> => {
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
    source: async (uuid): Promise<ImportSource | undefined> => {
      const document = await documentOf(uuid);
      if (!document) return undefined;
      return {
        uuid: document.uuid,
        id: document.id as string,
        name: document.name ?? "",
        documentName: document.documentName,
        primary: !document.isEmbedded,
        pack: document.pack ?? undefined,
      };
    },
    copy: async (collection, entries: readonly ImportEntry[]): Promise<readonly ImportedDocument[]> => {
      const pack = game.packs?.get(collection);
      if (!pack) throw new Error(`the compendium ${collection} does not exist`);
      const data: object[] = [];
      for (const entry of entries) {
        const document = await documentOf(entry.source);
        if (!document) throw new Error(`the source ${entry.source} cannot be read`);
        const copy = document.toCompendium(pack, COPY_OPTIONS) as Record<string, unknown>;
        // What makes the copy something other than the source (a forced copy of the Library): its id, its name, fields of its data.
        if (entry.id !== undefined) copy._id = entry.id;
        if (entry.name !== undefined) copy.name = entry.name;
        for (const [path, value] of Object.entries(entry.changes ?? {})) foundry.utils.setProperty(copy, path, value);
        data.push(copy);
      }
      // The document class of the compendium's type; it makes the documents in the compendium (`pack`).
      const documentClass = CONFIG[pack.documentName as "Item"].documentClass as unknown as {
        createDocuments(data: object[], operation: Record<string, unknown>): Promise<Array<{ uuid: string; id: string | null; name: string | null }>>;
      };
      const created = await documentClass.createDocuments(data, { pack: collection, keepId: true, keepEmbeddedIds: true });
      return created.map((document) => ({ uuid: document.uuid, id: document.id ?? "", name: document.name ?? "" }));
    },
  };
}

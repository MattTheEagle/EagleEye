import type { CreatableDocumentType, CreatedDocument, CreateTarget, CreateTargetSpec, DocumentCreateEnvironment } from "../core/document-create";
import type { JsonValue } from "../core/json-value";

// The parts of a world collection this file uses. `game.actors`, `game.items`, `game.journal` and `game.tables` all
// have them, whichever document class they hold; a fresh cast (not a stored type) is what fromUuid-style code does
// elsewhere in this repo (see v13/document-import.ts).
interface WorldCollection {
  has(id: string): boolean;
  get(id: string): unknown;
}

// The world's own collection for each creatable document type (Discover, M2): `game.actors`, `game.items` and
// `game.tables` are what dnd5e Homebrew objects need; `game.journal` is kept for parity with compendium.import and
// compendium.flag, which cover the same four types.
function worldCollection(type: CreatableDocumentType): WorldCollection {
  switch (type) {
    case "Actor":
      return game.actors! as unknown as WorldCollection;
    case "Item":
      return game.items! as unknown as WorldCollection;
    case "JournalEntry":
      return game.journal! as unknown as WorldCollection;
    case "RollTable":
      return game.tables! as unknown as WorldCollection;
  }
}

// The document class that creates documents of a type, whichever collection they go in (`CONFIG[type].documentClass`,
// the same lookup document-import.ts uses).
function documentClassOf(type: CreatableDocumentType) {
  return CONFIG[type as "Item"].documentClass as unknown as {
    createDocuments(data: object[], operation: Record<string, unknown>): Promise<Array<{ name: string | null }>>;
  };
}

// Foundry's side of document.create: resolving a target (a world compendium or the world's own collection), reading
// whether a document exists there already, and creating one. Whether Foundry accepts a document created this way, in
// both kinds of target, and whether a given id is kept are checked in a running Foundry (M2 live check).
export function foundryDocumentCreateEnvironment(): DocumentCreateEnvironment {
  return {
    target: async (spec: CreateTargetSpec): Promise<CreateTarget | undefined> => {
      if ("pack" in spec) {
        const pack = game.packs?.get(spec.pack);
        if (!pack) return undefined;
        const index = await pack.getIndex();
        return {
          kind: "pack",
          collection: pack.collection,
          documentName: pack.documentName as CreatableDocumentType,
          locked: pack.locked === true,
          has: (id) => index.has(id),
        };
      }
      const collection = worldCollection(spec.world);
      return {
        kind: "world",
        collection: spec.world,
        documentName: spec.world,
        locked: false,
        has: (id) => collection.has(id),
      };
    },
    nameOf: async (target, id): Promise<string | undefined> => {
      if (target.kind === "pack") {
        const pack = game.packs?.get(target.collection);
        const document = (await pack?.getDocument(id)) as unknown as { name?: string | null } | null | undefined;
        return document?.name ?? undefined;
      }
      const document = worldCollection(target.documentName as CreatableDocumentType).get(id) as { name?: string | null } | null | undefined;
      return document?.name ?? undefined;
    },
    create: async (target, id, data: Readonly<Record<string, JsonValue>>): Promise<CreatedDocument> => {
      const operation: Record<string, unknown> = target.kind === "pack" ? { pack: target.collection, keepId: true } : { keepId: true };
      const [created] = await documentClassOf(target.documentName as CreatableDocumentType).createDocuments([{ ...data, _id: id }], operation);
      if (!created) throw new Error("Foundry did not create the document");
      return { name: created.name ?? (data.name as string) };
    },
  };
}

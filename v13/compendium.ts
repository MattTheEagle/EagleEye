import type { CompendiumEnvironment, CompendiumInfo, CompendiumMetadata } from "../core/compendium-handlers";

// What Flight Control reads from a compendium that Foundry knows. Ownership is kept as Foundry gives it (a record from
// role name to level name); the handler passes on only text.
function describe(pack: CompendiumCollection.Any): CompendiumInfo {
  const { metadata } = pack;
  return {
    name: metadata.name,
    collection: pack.collection,
    label: metadata.label,
    type: metadata.type,
    locked: pack.locked === true,
    ownership: { ...(pack.ownership as Record<string, string | undefined>) } as Record<string, string>,
  };
}

// Foundry's side of compendium.create: the world compendium of a name, and creating one (`createCompendium` makes a world
// compendium; the Gamemaster's client runs it). Whether Foundry accepts a name, what it needs for the call and what a new
// compendium looks like are checked in a running Foundry (M3 live check).
export function foundryCompendiumEnvironment(): CompendiumEnvironment {
  return {
    find: (name) => {
      const pack = game.packs?.get(`world.${name}`);
      return pack ? describe(pack) : undefined;
    },
    create: async (metadata: CompendiumMetadata) => {
      const pack = await foundry.documents.collections.CompendiumCollection.createCompendium({
        type: metadata.type,
        label: metadata.label,
        name: metadata.name,
      });
      return describe(pack);
    },
  };
}

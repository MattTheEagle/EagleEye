import type { SystemSource } from "../core/system-guard";

// What Foundry says about the game system of this world, read when asked (see core/system-guard.ts).
export function foundrySystemSource(): SystemSource {
  return {
    id: () => game.system?.id,
    version: () => game.system?.version,
  };
}

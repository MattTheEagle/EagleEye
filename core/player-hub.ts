import { startModule } from "./hub-model";
import type { ModuleRegistry } from "./module-registry";

export const PLAYER_CHARACTER_EDIT_MODULE_ID = "eagle-character-edit";

export type PlayerCharacterStartResult = { readonly ok: true } | { readonly ok: false };

// The Player hub has one intentionally fixed action. It never receives an id
// from the DOM and it deliberately hides registry/open failure details from the
// Player-facing branch.
export async function startPlayerCharacterCreate(
  registry: Pick<ModuleRegistry, "list">,
): Promise<PlayerCharacterStartResult> {
  const characterEdit = registry.list().find((module) => module.id === PLAYER_CHARACTER_EDIT_MODULE_ID);
  if (!characterEdit) return { ok: false };
  const result = await startModule(characterEdit);
  return result.ok ? { ok: true } : { ok: false };
}

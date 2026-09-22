import { FLIGHT_CONTROL_ID } from "../core/index";
import type { OwnershipKind, RightsEnvironment } from "../core/request-rights";
import type { RightsHubSource } from "../core/rights-hub";

// The rights per module and user are stored as one JSON text in a world setting (see core/rights-table.ts). Players can
// read it, only the hub writes it. It is not a setting to edit by hand, so it never shows in Foundry's configuration.
export const RIGHTS_SETTING = "rights";

declare global {
  interface SettingConfig {
    "eagle-flight-control.rights": string;
  }
}

export function registerRightsSetting(): void {
  game.settings!.register(FLIGHT_CONTROL_ID, RIGHTS_SETTING, { scope: "world", config: false, type: String, default: "" });
}

// The stored text; undefined when nothing is stored. Anything that is not text is handed on as text, so the check finds
// out that it is not a table.
function readStored(): string | undefined {
  const value: unknown = game.settings!.get(FLIGHT_CONTROL_ID, RIGHTS_SETTING);
  return value === undefined || value === null || value === "" ? undefined : String(value);
}

// All that is used of a document here. The type of fromUuid only takes UUIDs it can check at compile time; the UUID
// in a request is only known at run time.
interface OwnableDocument {
  testUserPermission(user: unknown, permission: "OWNER"): boolean;
}

export function foundryRightsEnvironment(): RightsEnvironment {
  return {
    storedTable: readStored,
    isGm: (userId) => game.users?.get(userId)?.isGM,
    ownership: async (uuid, userId): Promise<OwnershipKind> => {
      try {
        const user = game.users?.get(userId);
        if (!user) return "unknown";
        const document = (await foundry.utils.fromUuid(uuid as never)) as unknown as OwnableDocument | null;
        if (!document) return "unknown";
        return document.testUserPermission(user, "OWNER") ? "own" : "foreign";
      } catch {
        return "unknown";
      }
    },
  };
}

export function foundryRightsHubSource(): RightsHubSource {
  return {
    canEdit: () => game.user?.role === CONST.USER_ROLES.GAMEMASTER,
    players: () =>
      (game.users?.contents ?? [])
        .filter((user) => !user.isGM && Boolean(user.id))
        .map((user) => ({ id: user.id as string, name: user.name || (user.id as string) })),
    storedTable: readStored,
    store: (text) => game.settings!.set(FLIGHT_CONTROL_ID, RIGHTS_SETTING, text),
  };
}

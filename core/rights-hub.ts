import {
  emptyRights,
  levelOf,
  parseRightsTable,
  serializeRightsTable,
  withLevel,
  type RightsLevel,
  type RightsTable,
} from "./rights-table";

// What the Gamemaster sees and does in the rights block of the hub, as logic: which users are listed with which level,
// and how a change is checked and written. The hub is the only writer of the rights table.

export interface RightsHubUser {
  readonly id: string;
  readonly name: string;
}

export interface RightsHubSource {
  // The user of this client has the Gamemaster role. An Assistant has not: rights are set by the Gamemaster only.
  canEdit(): boolean;
  // The users the table governs: everyone without a Gamemaster role (Gamemaster or Assistant).
  players(): readonly RightsHubUser[];
  // The stored rights as text; undefined when nothing has been stored yet. Throws when they cannot be read.
  storedTable(): string | undefined;
  store(text: string): Promise<unknown>;
}

export interface RightsRow {
  readonly userId: string;
  readonly name: string;
  readonly level: RightsLevel;
}

export interface RightsListing {
  readonly rows: readonly RightsRow[];
  // The stored rights could not be read, so every level shown is "denied" (the rights check does the same).
  readonly unreadable: boolean;
}

// The players with their level for one module. Never throws.
export function listRights(moduleId: string, source: RightsHubSource): RightsListing {
  let players: readonly RightsHubUser[] = [];
  try {
    players = source.players();
  } catch {
    // no users known: nothing to list
  }

  let table: RightsTable | undefined;
  try {
    const parsed = parseRightsTable(source.storedTable());
    table = parsed.ok ? parsed.value : undefined;
  } catch {
    table = undefined;
  }

  return {
    rows: players.map(({ id, name }) => ({ userId: id, name, level: table ? levelOf(table, moduleId, id) : "denied" })),
    unreadable: table === undefined,
  };
}

export type RightsWriteFailure = "not-permitted" | "not-allowed" | "unknown-user" | "invalid-value" | "write-failed";

export type RightsWriteResult =
  | { readonly ok: true; readonly value: RightsLevel }
  | { readonly ok: false; readonly reason: RightsWriteFailure; readonly detail: string };

function refuse(reason: RightsWriteFailure, detail: string): RightsWriteResult {
  return { ok: false, reason, detail };
}

// The only way the hub writes the rights. Never rejects; every failure comes back as a result and writes nothing.
export async function applyRightsInput(
  moduleId: string,
  userId: string,
  rawLevel: unknown,
  allowedModules: readonly string[],
  source: RightsHubSource,
): Promise<RightsWriteResult> {
  try {
    if (!source.canEdit()) return refuse("not-permitted", "only the Gamemaster can change rights");
    if (!allowedModules.includes(moduleId)) return refuse("not-allowed", `"${moduleId}" is not a registered Eagle module`);
    const players = source.players();
    if (!players.some((player) => player.id === userId)) {
      return refuse("unknown-user", `"${userId}" is not a player of this world`);
    }
    if (rawLevel !== "denied" && rawLevel !== "own" && rawLevel !== "all") {
      return refuse("invalid-value", 'the level must be "denied", "own" or "all"');
    }

    // A stored text that is not a valid table allows nothing anyway, so it is replaced. A text that cannot be read at
    // all (this throws) is left alone: writing over it could destroy rights that are only out of reach right now.
    const parsed = parseRightsTable(source.storedTable());
    const table = parsed.ok ? parsed.value : emptyRights();
    const next = withLevel(table, moduleId, userId, rawLevel, new Set(players.map((player) => player.id)));
    await source.store(serializeRightsTable(next));
    return { ok: true, value: rawLevel };
  } catch (error) {
    return refuse("write-failed", error instanceof Error ? error.message : String(error));
  }
}

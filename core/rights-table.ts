// The rights per module and user, as data. The table is stored as JSON text (a world setting), so everything that comes
// out of the text is checked here. A text that does not check out is an error, never a partial table.

export type RightsLevel = "denied" | "own" | "all";

// The levels that are stored. "denied" is what a missing entry means, so it is never stored.
export type StoredLevel = "own" | "all";

export interface RightsTable {
  readonly version: 1;
  // module id -> user id -> level
  readonly modules: Readonly<Record<string, Readonly<Record<string, StoredLevel>>>>;
}

export type ParsedRights =
  | { readonly ok: true; readonly value: RightsTable }
  | { readonly ok: false; readonly detail: string };

export function emptyRights(): RightsTable {
  return { version: 1, modules: {} };
}

// Module and user ids are keys of plain objects: only a property of the object itself counts, never one it inherits
// (a module called "constructor" must not find Object.prototype.constructor).
const hasOwn = (object: object, key: string): boolean => Object.prototype.hasOwnProperty.call(object, key);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// undefined, null and the empty text are "nothing stored yet": the empty table.
export function parseRightsTable(text: unknown): ParsedRights {
  const invalid = (detail: string): ParsedRights => ({ ok: false, detail });

  if (text === undefined || text === null || text === "") return { ok: true, value: emptyRights() };
  if (typeof text !== "string") return invalid("the stored rights are not text");

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return invalid("the stored rights are not valid JSON");
  }
  if (!isPlainObject(data)) return invalid("the stored rights must be an object");
  if (data.version !== 1) return invalid("the stored rights have a version this Flight Control does not know");
  if (!isPlainObject(data.modules)) return invalid("the stored rights must have a modules object");

  // Built with Object.fromEntries: an id such as "__proto__" becomes a property of its own, it never changes a prototype.
  const modules: Array<[string, Record<string, StoredLevel>]> = [];
  for (const [moduleId, users] of Object.entries(data.modules)) {
    if (!isPlainObject(users)) return invalid(`the rights of module "${moduleId}" must be an object`);
    const levels: Array<[string, StoredLevel]> = [];
    for (const [userId, level] of Object.entries(users)) {
      if (userId === "") return invalid(`the rights of module "${moduleId}" name a user without an id`);
      if (level !== "own" && level !== "all") {
        return invalid(`the level of user "${userId}" for module "${moduleId}" must be "own" or "all"`);
      }
      levels.push([userId, level]);
    }
    modules.push([moduleId, Object.fromEntries(levels)]);
  }
  return { ok: true, value: { version: 1, modules: Object.fromEntries(modules) } };
}

export function serializeRightsTable(table: RightsTable): string {
  return JSON.stringify(table);
}

function usersOf(table: RightsTable, moduleId: string): Readonly<Record<string, StoredLevel>> {
  return hasOwn(table.modules, moduleId) ? table.modules[moduleId] : {};
}

// A user without an entry is "denied".
export function levelOf(table: RightsTable, moduleId: string, userId: string): RightsLevel {
  const users = usersOf(table, moduleId);
  if (!hasOwn(users, userId)) return "denied";
  const level = users[userId];
  return level === "own" || level === "all" ? level : "denied";
}

// A new table with the level of one user for one module. "denied" removes the entry, and a module without entries
// disappears. The entries of this module that name a user who is not in `knownUserIds` (anyone deleted since) go as well.
// Other modules stay as they are; the table that goes in is not changed.
export function withLevel(
  table: RightsTable,
  moduleId: string,
  userId: string,
  level: RightsLevel,
  knownUserIds: ReadonlySet<string>,
): RightsTable {
  const users = Object.entries(usersOf(table, moduleId)).filter(([id]) => id !== userId && knownUserIds.has(id));
  if (level !== "denied") users.push([userId, level]);
  const others = Object.entries(table.modules).filter(([id]) => id !== moduleId);
  const modules = users.length > 0 ? [...others, [moduleId, Object.fromEntries(users)] as const] : others;
  return { version: 1, modules: Object.fromEntries(modules) };
}

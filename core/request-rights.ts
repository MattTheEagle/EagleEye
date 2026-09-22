import type { RightsCheck, RightsGate, RightsVerdict } from "./request-kernel";
import { levelOf, parseRightsTable, type ParsedRights, type RightsLevel } from "./rights-table";

// How a target relates to the user a request runs for.
export type OwnershipKind = "own" | "foreign" | "unknown";

// What the rights check needs to know and cannot know itself: the stored table, who has a Gamemaster role and who
// owns a document. Foundry provides these (v13/rights.ts); tests provide their own.
export interface RightsEnvironment {
  // The stored rights as text; undefined when nothing has been stored yet. Throws when they cannot be read.
  storedTable(): string | undefined;
  // Whether the user has a Gamemaster role (Gamemaster or Assistant); undefined when nobody knows that user.
  isGm(userId: string): boolean | undefined;
  // Whether the user owns the document the UUID names. "unknown" when the document cannot be found or the answer is
  // not clear; that is not an error.
  ownership(uuid: string, userId: string): Promise<OwnershipKind>;
}

export interface RightsLog {
  warn(message: string): void;
}

const allow = (): RightsVerdict => ({ ok: true });
const refuse = (detail: string): RightsVerdict => ({ ok: false, detail });

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// The stored table, or why it cannot be read. Reading may throw, parsing may not accept what it finds.
function readRights(environment: RightsEnvironment): ParsedRights {
  try {
    return parseRightsTable(environment.storedTable());
  } catch (error) {
    return { ok: false, detail: `the stored rights cannot be read: ${describeError(error)}` };
  }
}

// The rule, in this order; every doubt is a "no":
//  1. a user who is not known is refused;
//  2. a Gamemaster or Assistant is allowed;
//  3. a request type that is for a Gamemaster or Assistant only refuses everybody else, whatever level they have;
//  4. rights that cannot be read refuse everybody else;
//  5. a module the user has no entry for is refused;
//  6. "all" allows everything; "own" allows requests without a target and requests whose targets the user all owns.
// The check never rejects and never throws: whatever goes wrong is a refusal.
export function createRightsGate(environment: RightsEnvironment, log?: RightsLog): RightsGate {
  let warned = false;

  function readTable() {
    const parsed = readRights(environment);
    if (parsed.ok) {
      warned = false;
      return parsed.value;
    }
    if (!warned) {
      warned = true;
      log?.warn(`eagle-flight-control | ${parsed.detail}; nothing is allowed for players until the rights can be read`);
    }
    return undefined;
  }

  return Object.freeze({
    async check({ module, user, targets, gmOnly }: RightsCheck): Promise<RightsVerdict> {
      try {
        if (!user) return refuse("the user of this request is not known");
        const gm = environment.isGm(user.id);
        if (gm === true) return allow();
        if (gm !== false) return refuse("the user of this request is not known");
        if (gmOnly === true) return refuse("this request may only be made by a Gamemaster or Assistant");

        const table = readTable();
        if (!table) return refuse("the rights could not be read, so nothing is allowed until they can");

        const level = levelOf(table, module, user.id);
        if (level === "denied") return refuse(`module "${module}" may not be used by this user`);
        if (level === "all" || targets.length === 0) return allow();

        for (const uuid of targets) {
          if ((await environment.ownership(uuid, user.id)) !== "own") {
            return refuse(`module "${module}" may act only on targets this user owns`);
          }
        }
        return allow();
      } catch {
        return refuse("the rights could not be checked");
      }
    },
  });
}

// What a user may do with a module: "all" for a Gamemaster or Assistant, otherwise what the table says. Anything that
// cannot be found out is "denied". Never throws.
export function effectiveLevel(environment: RightsEnvironment, moduleId: string, userId: string | undefined): RightsLevel {
  try {
    if (userId === undefined) return "denied";
    const gm = environment.isGm(userId);
    if (gm === true) return "all";
    if (gm !== false) return "denied";
    const parsed = readRights(environment);
    return parsed.ok ? levelOf(parsed.value, moduleId, userId) : "denied";
  } catch {
    return "denied";
  }
}

// The gate for the case that the rights could not be set up at all: nothing is allowed, not even for a Gamemaster.
export const REFUSE_ALL: RightsGate = Object.freeze({
  check: async (): Promise<RightsVerdict> => refuse("the rights could not be set up, so nothing is allowed"),
});

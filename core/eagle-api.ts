import { NO_COMPENDIUMS } from "./compendium-handlers";
import { NO_IMPORTS } from "./document-import";
import { NO_SETTINGS } from "./setting-write";
import type { ModuleRegistry, RegistrationResult } from "./module-registry";
import { defaultRequestHandlers, type Executor } from "./request-handlers";
import { createRequestKernel, type RequestKernel, type RequestResult } from "./request-kernel";
import type { RightsLevel } from "./rights-table";
import type { SystemInfo } from "./system-guard";

// The answer to "what may the user of this client do with this module?" (see the API contract, part 6).
export type RightsQueryResult =
  | { readonly ok: true; readonly value: { readonly level: RightsLevel } }
  | {
      readonly ok: false;
      readonly reason: "invalid-request" | "not-registered" | "internal-error";
      readonly detail: string;
    };

// Where getRights gets its answer: the level the user of this client has for a module.
export interface RightsSource {
  levelFor(moduleId: string): RightsLevel;
}

// The answer to "which game system runs, and was it tested?" (see the API contract, part 7).
export type SystemInfoResult =
  | { readonly ok: true; readonly value: SystemInfo }
  | { readonly ok: false; readonly reason: "internal-error"; readonly detail: string };

export interface EagleFlightControlApi {
  readonly version: string;
  registerModule(descriptor: unknown): RegistrationResult;
  request(request: unknown): Promise<RequestResult>;
  getRights(moduleId: unknown): RightsQueryResult;
  getSystemInfo(): SystemInfoResult;
}

export interface ApiLogger {
  info(message: string): void;
  warn(message: string): void;
}

const consoleLogger: ApiLogger = {
  info: (message) => console.log(message),
  warn: (message) => console.warn(message),
};

// Never throws: a request or descriptor with a throwing getter must not break the API.
function describeField(value: unknown, field: string): string {
  try {
    if (typeof value === "object" && value !== null) {
      const text = (value as Record<string, unknown>)[field];
      if (typeof text === "string" && text !== "") return text;
    }
  } catch {
    // fall through
  }
  return "?";
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// For callers without Foundry (the default kernel below, tests). The Foundry wiring in v13/module.ts passes the real one.
const NO_EXECUTOR = (): Executor => ({ userId: "", isGm: false });
const NO_RIGHTS: RightsSource = { levelFor: () => "denied" };
const NO_SYSTEM = (): SystemInfo => ({ id: null, version: null, status: "unknown", testedVersions: [] });

// The public surface other modules see: exactly `version`, `registerModule`, `request`, `getRights` and `getSystemInfo`.
export function createEagleApi(
  registry: ModuleRegistry,
  log: ApiLogger = consoleLogger,
  kernel: RequestKernel = createRequestKernel(registry, defaultRequestHandlers(registry.apiVersion, NO_EXECUTOR, NO_COMPENDIUMS, NO_IMPORTS, NO_SETTINGS)),
  rights: RightsSource = NO_RIGHTS,
  systemInfo: () => SystemInfo = NO_SYSTEM,
): Readonly<EagleFlightControlApi> {
  const registerModule = (descriptor: unknown): RegistrationResult => {
    let result: RegistrationResult;
    try {
      result = registry.registerModule(descriptor);
    } catch (error) {
      result = { ok: false, reason: "internal-error", detail: describeError(error) };
    }

    if (result.ok) {
      log.info(`eagleeye | registered module ${result.module.id} (api ${result.module.apiVersion})`);
    } else {
      log.warn(
        `eagleeye | registration rejected for ${describeField(descriptor, "id")}: ${result.reason} - ${result.detail}`,
      );
    }
    return result;
  };

  // Never rejects. A failure is logged, a success is not (requests can be frequent).
  const request = async (envelope: unknown): Promise<RequestResult> => {
    let result: RequestResult;
    try {
      result = await kernel.execute(envelope);
    } catch (error) {
      result = { ok: false, reason: "internal-error", detail: describeError(error) };
    }

    if (!result.ok) {
      log.warn(
        `eagleeye | request rejected for ${describeField(envelope, "module")} (${describeField(envelope, "type")}): ${result.reason} - ${result.detail}`,
      );
    }
    return result;
  };

  // Never throws. Only a registered, active module is asked about, so the answer is about a module Flight Control knows.
  const getRights = (moduleId: unknown): RightsQueryResult => {
    if (typeof moduleId !== "string" || moduleId === "") {
      return { ok: false, reason: "invalid-request", detail: "moduleId must be a non-empty string" };
    }
    try {
      if (!registry.list().some((module) => module.id === moduleId)) {
        return {
          ok: false,
          reason: "not-registered",
          detail: `module "${moduleId}" is not registered with Flight Control or is not active`,
        };
      }
      return { ok: true, value: { level: rights.levelFor(moduleId) } };
    } catch (error) {
      log.warn(`eagleeye | getRights failed for ${moduleId}: ${describeError(error)}`);
      return { ok: false, reason: "internal-error", detail: describeError(error) };
    }
  };

  // Never throws. Asks for the system every time, so the answer is the state of this client right now.
  const getSystemInfo = (): SystemInfoResult => {
    try {
      return { ok: true, value: systemInfo() };
    } catch (error) {
      log.warn(`eagleeye | getSystemInfo failed: ${describeError(error)}`);
      return { ok: false, reason: "internal-error", detail: describeError(error) };
    }
  };

  return Object.freeze({ version: registry.apiVersion, registerModule, request, getRights, getSystemInfo });
}

import type { ModuleRegistry, RegistrationResult } from "./module-registry";
import { defaultRequestHandlers, type Executor } from "./request-handlers";
import { createRequestKernel, type RequestKernel, type RequestResult } from "./request-kernel";

export interface EagleFlightControlApi {
  readonly version: string;
  registerModule(descriptor: unknown): RegistrationResult;
  request(request: unknown): Promise<RequestResult>;
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

// The public surface other modules see: exactly `version`, `registerModule` and `request`.
export function createEagleApi(
  registry: ModuleRegistry,
  log: ApiLogger = consoleLogger,
  kernel: RequestKernel = createRequestKernel(registry, defaultRequestHandlers(registry.apiVersion, NO_EXECUTOR)),
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

  return Object.freeze({ version: registry.apiVersion, registerModule, request });
}

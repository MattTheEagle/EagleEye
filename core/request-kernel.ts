import { isJsonValue, type JsonValue } from "./json-value";
import type { ModuleRegistry, RegisteredModule } from "./module-registry";

// One request from an Eagle module to Flight Control. Additional fields are ignored (forward compatibility).
export interface RequestEnvelope {
  module: string;
  type: string;
  version?: number;
  payload?: unknown;
}

export type RequestFailure =
  | "invalid-request"
  | "not-registered"
  | "unknown-request"
  | "unsupported-version"
  | "invalid-payload"
  | "handler-failed"
  | "internal-error";

export type RequestResult =
  | { readonly ok: true; readonly value: JsonValue }
  | { readonly ok: false; readonly reason: RequestFailure; readonly detail: string };

export type PayloadCheck<P> = { readonly ok: true; readonly value: P } | { readonly ok: false; readonly detail: string };

export interface RequestContext {
  readonly module: RegisteredModule;
}

export interface RequestHandler<P = unknown> {
  // "<area>.<verb>", lower case, dot separated
  readonly type: string;
  // The request versions this handler understands, for example [1]
  readonly versions: readonly number[];
  validate(payload: unknown): PayloadCheck<P>;
  run(payload: P, context: RequestContext): Promise<JsonValue>;
}

export interface RequestKernel {
  // Never rejects; every outcome comes back as a result.
  execute(request: unknown): Promise<RequestResult>;
}

export const REQUEST_TYPE_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

const TYPE_HINT = 'must look like "<area>.<verb>" in lower case';

function fail(reason: RequestFailure, detail: string): RequestResult {
  return { ok: false, reason, detail };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Throws on an invalid handler definition; that is a programming error, not a runtime condition.
export function createRequestKernel(
  registry: Pick<ModuleRegistry, "list">,
  handlers: readonly RequestHandler[],
): RequestKernel {
  const byType = new Map<string, RequestHandler>();
  for (const handler of handlers) {
    if (!REQUEST_TYPE_PATTERN.test(handler.type)) {
      throw new Error(`request handler type "${handler.type}" ${TYPE_HINT}`);
    }
    if (handler.versions.length === 0 || !handler.versions.every((v) => Number.isInteger(v) && v >= 1)) {
      throw new Error(`request handler "${handler.type}" needs a non-empty list of positive integer versions`);
    }
    if (byType.has(handler.type)) {
      throw new Error(`request handler "${handler.type}" is defined twice`);
    }
    byType.set(handler.type, handler);
  }

  async function execute(request: unknown): Promise<RequestResult> {
    try {
      // 1. envelope
      if (typeof request !== "object" || request === null || Array.isArray(request)) {
        return fail("invalid-request", "request must be an object");
      }
      const { module: moduleId, type, version, payload } = request as Record<string, unknown>;
      if (typeof moduleId !== "string" || moduleId === "") {
        return fail("invalid-request", "request.module must be a non-empty string");
      }
      if (typeof type !== "string" || !REQUEST_TYPE_PATTERN.test(type)) {
        return fail("invalid-request", `request.type ${TYPE_HINT}`);
      }
      if (version !== undefined && !(typeof version === "number" && Number.isInteger(version) && version >= 1)) {
        return fail("invalid-request", "request.version must be a positive integer when given");
      }
      if (payload !== undefined && !isJsonValue(payload)) {
        return fail("invalid-request", "request.payload must be JSON-serializable when given");
      }

      // 2. sender
      const caller = registry.list().find((entry) => entry.id === moduleId);
      if (!caller) {
        return fail("not-registered", `module "${moduleId}" is not registered with Flight Control or is not active`);
      }

      // 3. handler
      const handler = byType.get(type);
      if (!handler) return fail("unknown-request", `no request type "${type}" is offered`);

      // 4. version
      const requested = version ?? 1;
      if (!handler.versions.includes(requested)) {
        return fail(
          "unsupported-version",
          `request type "${type}" supports version ${handler.versions.join(", ")}, not ${requested}`,
        );
      }

      // 5. payload and 6. execution
      let value: unknown;
      try {
        const check = handler.validate(payload);
        if (!check.ok) return fail("invalid-payload", check.detail);
        value = await handler.run(check.value, { module: caller });
      } catch (error) {
        return fail("handler-failed", describeError(error));
      }

      // 7. result
      if (!isJsonValue(value)) return fail("handler-failed", `the result of "${type}" is not JSON-serializable`);
      return { ok: true, value };
    } catch (error) {
      return fail("internal-error", describeError(error));
    }
  }

  return Object.freeze({ execute });
}

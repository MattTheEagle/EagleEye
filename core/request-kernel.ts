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
  | "internal-error"
  // added with the Gamemaster relay (request-relay.ts)
  | "no-gm"
  | "relay-timeout"
  | "relay-failed"
  | "not-permitted";

export type RequestResult =
  | { readonly ok: true; readonly value: JsonValue }
  | { readonly ok: false; readonly reason: RequestFailure; readonly detail: string };

export type RequestFailureResult = Extract<RequestResult, { readonly ok: false }>;

// The outcome of one check: the checked value, or the failure to hand back to the caller.
export type Checked<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly failure: RequestFailureResult };

export type PayloadCheck<P> = { readonly ok: true; readonly value: P } | { readonly ok: false; readonly detail: string };

// The user a request runs for. Where the request runs in the caller's client this is the user of that client; on the
// Gamemaster's client it is the user who confirmed the request (see request-identity.ts).
export interface RequestUser {
  readonly id: string;
}

export interface RequestContext {
  readonly module: RegisteredModule;
  // Unknown when the kernel was given no way to tell (tests, code without Foundry).
  readonly user?: RequestUser;
}

// Where a request type runs: in the client of the caller, or on the Gamemaster's client.
export type RunsOn = "caller" | "gm";

export interface RequestHandler<P = unknown> {
  // "<area>.<verb>", lower case, dot separated
  readonly type: string;
  // The request versions this handler understands, for example [1]
  readonly versions: readonly number[];
  // Defaults to "caller". A request for a "gm" handler that comes from a client without a Gamemaster role is
  // forwarded to the Gamemaster (see request-relay.ts); the kernel itself never looks at this value.
  readonly runsOn?: RunsOn;
  validate(payload: unknown): PayloadCheck<P>;
  run(payload: P, context: RequestContext): Promise<JsonValue>;
}

export interface ExecuteOptions {
  // The user to run the request for; wins over the kernel's own idea of the current user.
  readonly user?: RequestUser;
}

export interface RequestKernel {
  // Never rejects; every outcome comes back as a result.
  execute(request: unknown, options?: ExecuteOptions): Promise<RequestResult>;
}

export interface KernelOptions {
  // The user of this client, for requests that run here.
  readonly currentUser?: () => RequestUser | undefined;
}

export const REQUEST_TYPE_PATTERN = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

const TYPE_HINT = 'must look like "<area>.<verb>" in lower case';

function fail(reason: RequestFailure, detail: string): RequestFailureResult {
  return { ok: false, reason, detail };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Step 1 of a request: the envelope is an object with a module, a request type, an optional version and an optional
// JSON payload. The checked value holds exactly these four fields; anything else is dropped.
export function parseEnvelope(request: unknown): Checked<RequestEnvelope> {
  const invalid = (detail: string): Checked<RequestEnvelope> => ({ ok: false, failure: fail("invalid-request", detail) });

  if (typeof request !== "object" || request === null || Array.isArray(request)) {
    return invalid("request must be an object");
  }
  const { module: moduleId, type, version, payload } = request as Record<string, unknown>;
  if (typeof moduleId !== "string" || moduleId === "") return invalid("request.module must be a non-empty string");
  if (typeof type !== "string" || !REQUEST_TYPE_PATTERN.test(type)) return invalid(`request.type ${TYPE_HINT}`);
  if (version !== undefined && !(typeof version === "number" && Number.isInteger(version) && version >= 1)) {
    return invalid("request.version must be a positive integer when given");
  }
  if (payload !== undefined && !isJsonValue(payload)) {
    return invalid("request.payload must be JSON-serializable when given");
  }

  const envelope: RequestEnvelope = { module: moduleId, type };
  if (version !== undefined) envelope.version = version;
  if (payload !== undefined) envelope.payload = payload;
  return { ok: true, value: envelope };
}

// Step 2 of a request: the sender must be registered and active.
export function findSender(registry: Pick<ModuleRegistry, "list">, moduleId: string): Checked<RegisteredModule> {
  const sender = registry.list().find((entry) => entry.id === moduleId);
  if (!sender) {
    return {
      ok: false,
      failure: fail("not-registered", `module "${moduleId}" is not registered with Flight Control or is not active`),
    };
  }
  return { ok: true, value: sender };
}

// Throws on an invalid handler definition; that is a programming error, not a runtime condition.
export function createRequestKernel(
  registry: Pick<ModuleRegistry, "list">,
  handlers: readonly RequestHandler[],
  options: KernelOptions = {},
): RequestKernel {
  const byType = new Map<string, RequestHandler>();
  for (const handler of handlers) {
    if (!REQUEST_TYPE_PATTERN.test(handler.type)) {
      throw new Error(`request handler type "${handler.type}" ${TYPE_HINT}`);
    }
    if (handler.versions.length === 0 || !handler.versions.every((v) => Number.isInteger(v) && v >= 1)) {
      throw new Error(`request handler "${handler.type}" needs a non-empty list of positive integer versions`);
    }
    if (handler.runsOn !== undefined && handler.runsOn !== "caller" && handler.runsOn !== "gm") {
      throw new Error(`request handler "${handler.type}" must run on "caller" or "gm"`);
    }
    if (byType.has(handler.type)) {
      throw new Error(`request handler "${handler.type}" is defined twice`);
    }
    byType.set(handler.type, handler);
  }

  async function execute(request: unknown, executeOptions?: ExecuteOptions): Promise<RequestResult> {
    try {
      // 1. envelope
      const parsed = parseEnvelope(request);
      if (!parsed.ok) return parsed.failure;
      const { module: moduleId, type, version, payload } = parsed.value;

      // 2. sender
      const sender = findSender(registry, moduleId);
      if (!sender.ok) return sender.failure;
      const caller = sender.value;

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
        const user = executeOptions?.user ?? options.currentUser?.();
        value = await handler.run(check.value, user ? { module: caller, user } : { module: caller });
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

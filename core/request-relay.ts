import type { ApiLogger } from "./eagle-api";
import { isJsonValue } from "./json-value";
import type { ModuleRegistry } from "./module-registry";
import {
  findSender,
  parseEnvelope,
  type RequestEnvelope,
  type RequestFailure,
  type RequestHandler,
  type RequestKernel,
  type RequestResult,
} from "./request-kernel";

// How long the caller waits for the Gamemaster's client, and how large a forwarded request may be (JSON text).
export const RELAY_TIMEOUT_MS = 15_000;
export const MAX_RELAY_SIZE = 65_536;

const GENERIC_DETAIL = "the request failed on the Gamemaster's client; the details are in the Gamemaster's console";

// What the relay needs from Foundry. The Foundry side lives in v13/relay.ts.
export interface RelayEnvironment {
  // The user of this client has a Gamemaster or Assistant role.
  isGm(): boolean;
  // From the point of view of this client, a Gamemaster is connected.
  hasGm(): boolean;
  // Sends the envelope to the Gamemaster's client and resolves with the answer. Rejects on any failure.
  send(envelope: RequestEnvelope, timeoutMs: number): Promise<unknown>;
}

export interface RequestRelayOptions {
  // Runs requests in this client.
  kernel: RequestKernel;
  // The same list the kernel was built from.
  handlers: readonly RequestHandler[];
  registry: Pick<ModuleRegistry, "list">;
  environment: RelayEnvironment;
  log: ApiLogger;
  timeoutMs?: number;
}

export interface RequestRelay extends RequestKernel {
  // The Gamemaster's side of the relay. Never rejects.
  receive(data: unknown): Promise<RequestResult>;
}

const TIMED_OUT = Symbol("timed out");

function fail(reason: RequestFailure, detail: string): RequestResult {
  return { ok: false, reason, detail };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// What a Gamemaster's client answered, or undefined when it is not a request result.
function toResult(answer: unknown): RequestResult | undefined {
  if (typeof answer !== "object" || answer === null || Array.isArray(answer)) return undefined;
  const { ok, value, reason, detail } = answer as Record<string, unknown>;
  if (ok === true) return isJsonValue(value) ? { ok: true, value } : undefined;
  if (ok === false && typeof reason === "string" && typeof detail === "string") {
    return { ok: false, reason: reason as RequestFailure, detail };
  }
  return undefined;
}

function tooLarge(value: unknown): boolean {
  return JSON.stringify(value).length > MAX_RELAY_SIZE;
}

// Decides where a request runs. A request type that runs on the Gamemaster's client is forwarded when the caller has
// no Gamemaster role; everything else runs in this client, exactly as without a relay. The Gamemaster's side checks
// everything again and trusts nothing the sender says about itself.
export function createRequestRelay(options: RequestRelayOptions): RequestRelay {
  const { kernel, registry, environment, log } = options;
  const timeoutMs = options.timeoutMs ?? RELAY_TIMEOUT_MS;
  const byType = new Map<string, RequestHandler>(options.handlers.map((handler) => [handler.type, handler] as const));

  async function forward(envelope: RequestEnvelope): Promise<RequestResult> {
    let sending: Promise<unknown>;
    try {
      sending = Promise.resolve(environment.send(envelope, timeoutMs));
    } catch (error) {
      return fail("relay-failed", `the request could not be sent: ${describeError(error)}`);
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timedOut = new Promise<typeof TIMED_OUT>((resolve) => {
      timer = setTimeout(() => resolve(TIMED_OUT), timeoutMs);
    });
    try {
      // The race keeps listening to `sending`, so an answer or a rejection after the timeout is handled and changes nothing.
      const outcome = await Promise.race([sending, timedOut]);
      if (outcome === TIMED_OUT) {
        return fail(
          "relay-timeout",
          `the Gamemaster's client did not answer within ${Math.round(timeoutMs / 1000)} seconds; the request may still run`,
        );
      }
      return (
        toResult(outcome) ??
        fail("relay-failed", "the Gamemaster's client answered with something that is not a request result")
      );
    } catch (error) {
      return fail("relay-failed", `the request could not be delivered or answered: ${describeError(error)}`);
    } finally {
      clearTimeout(timer);
    }
  }

  async function execute(request: unknown): Promise<RequestResult> {
    try {
      const parsed = parseEnvelope(request);
      if (!parsed.ok) return parsed.failure;
      const envelope = parsed.value;

      // Unknown types and types that run in the caller's client are none of the relay's business; a Gamemaster runs
      // every type itself.
      if (byType.get(envelope.type)?.runsOn !== "gm" || environment.isGm()) return await kernel.execute(envelope);

      const sender = findSender(registry, envelope.module);
      if (!sender.ok) return sender.failure;
      if (!environment.hasGm()) return fail("no-gm", "no Gamemaster is connected, so this request cannot run");
      if (tooLarge(envelope)) return fail("invalid-request", `the request is larger than ${MAX_RELAY_SIZE} characters`);
      return await forward(envelope);
    } catch (error) {
      return fail("internal-error", describeError(error));
    }
  }

  async function receive(data: unknown): Promise<RequestResult> {
    // What the log line names; filled in as soon as the envelope is readable.
    let module = "?";
    let type = "?";

    async function run(): Promise<RequestResult> {
      if (!environment.isGm()) return fail("not-permitted", "only a Gamemaster's client runs relayed requests");
      if (!isJsonValue(data) || tooLarge(data)) {
        return fail("invalid-request", `a relayed request must be JSON and at most ${MAX_RELAY_SIZE} characters`);
      }
      const parsed = parseEnvelope(data);
      if (!parsed.ok) return parsed.failure;
      const envelope = parsed.value;
      module = envelope.module;
      type = envelope.type;

      const handler = byType.get(type);
      if (handler && handler.runsOn !== "gm") {
        return fail("not-permitted", `request type "${type}" is not run for other clients`);
      }
      return kernel.execute(envelope);
    }

    let result: RequestResult;
    try {
      result = await run();
    } catch (error) {
      result = fail("internal-error", describeError(error));
    }

    if (result.ok) return result;
    // Failures are reported here in full; what goes back to the sender keeps no text from this client.
    log.warn(`eagleeye | relayed request rejected for ${module} (${type}): ${result.reason} - ${result.detail}`);
    if (result.reason === "handler-failed" || result.reason === "internal-error") {
      return fail(result.reason, GENERIC_DETAIL);
    }
    return result;
  }

  return Object.freeze({ execute, receive });
}

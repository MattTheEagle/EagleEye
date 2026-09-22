import type { ApiLogger } from "./eagle-api";
import { isJsonValue } from "./json-value";
import type { ModuleRegistry } from "./module-registry";
import {
  CONFIRM_TIMEOUT_MS,
  createPendingRequests,
  isConfirmed,
  parseRelayMessage,
  type Claim,
  type ConfirmationAnswer,
  type RelayMessage,
} from "./request-identity";
import {
  findSender,
  parseEnvelope,
  type ExecuteOptions,
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
  // The id of the user of this client; empty when it is not known.
  currentUserId(): string;
  // A new identifier that nobody else can guess.
  newId(): string;
  // Sends the message to the Gamemaster's client and resolves with the answer. Rejects on any failure.
  send(message: RelayMessage, timeoutMs: number): Promise<unknown>;
  // Asks the client of the given user whether it sent the request with this identifier. Rejects on any failure.
  confirm(userId: string, requestId: string, timeoutMs: number): Promise<unknown>;
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
  // This client's answer to the Gamemaster's question whether it sent a request. Never throws.
  answerConfirmation(data: unknown): ConfirmationAnswer;
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
// everything again, trusts nothing the sender says about itself and runs a request only after the user it names has
// confirmed that the request is theirs.
export function createRequestRelay(options: RequestRelayOptions): RequestRelay {
  const { kernel, registry, environment, log } = options;
  const timeoutMs = options.timeoutMs ?? RELAY_TIMEOUT_MS;
  const byType = new Map<string, RequestHandler>(options.handlers.map((handler) => [handler.type, handler] as const));
  const pending = createPendingRequests(() => environment.newId());

  async function forward(message: RelayMessage): Promise<RequestResult> {
    let sending: Promise<unknown>;
    try {
      sending = Promise.resolve(environment.send(message, timeoutMs));
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

  async function execute(request: unknown, executeOptions?: ExecuteOptions): Promise<RequestResult> {
    try {
      const parsed = parseEnvelope(request);
      if (!parsed.ok) return parsed.failure;
      const envelope = parsed.value;

      // Unknown types and types that run in the caller's client are none of the relay's business; a Gamemaster runs
      // every type itself.
      if (byType.get(envelope.type)?.runsOn !== "gm" || environment.isGm()) {
        return await kernel.execute(envelope, executeOptions);
      }

      const sender = findSender(registry, envelope.module);
      if (!sender.ok) return sender.failure;
      if (!environment.hasGm()) return fail("no-gm", "no Gamemaster is connected, so this request cannot run");

      // The request is remembered under an identifier only this client knows, until it ends. The Gamemaster's client
      // asks this client about that identifier before it runs anything.
      const userId = environment.currentUserId();
      if (userId === "") return fail("relay-failed", "this client does not know its user, so the request cannot be confirmed");
      const requestId = pending.open();
      try {
        const message: RelayMessage = { request: envelope, claim: { userId, requestId } };
        if (tooLarge(message)) return fail("invalid-request", `the request is larger than ${MAX_RELAY_SIZE} characters`);
        return await forward(message);
      } finally {
        pending.close(requestId);
      }
    } catch (error) {
      return fail("internal-error", describeError(error));
    }
  }

  // Undefined when the user the request names confirmed it; otherwise why not (for the Gamemaster's console).
  async function confirmClaim(claim: Claim): Promise<string | undefined> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timedOut = new Promise<typeof TIMED_OUT>((resolve) => {
      timer = setTimeout(() => resolve(TIMED_OUT), CONFIRM_TIMEOUT_MS);
    });
    try {
      const asking = Promise.resolve(environment.confirm(claim.userId, claim.requestId, CONFIRM_TIMEOUT_MS));
      const outcome = await Promise.race([asking, timedOut]);
      if (outcome === TIMED_OUT) return `no answer within ${CONFIRM_TIMEOUT_MS / 1000} seconds`;
      return isConfirmed(outcome, claim) ? undefined : "the answer is not a confirmation from that user";
    } catch (error) {
      return `the question failed: ${describeError(error)}`;
    } finally {
      clearTimeout(timer);
    }
  }

  async function receive(data: unknown): Promise<RequestResult> {
    // What the log line names; filled in as soon as the request is readable.
    let module = "?";
    let type = "?";
    let note = "";

    async function run(): Promise<RequestResult> {
      if (!environment.isGm()) return fail("not-permitted", "only a Gamemaster's client runs relayed requests");
      if (!isJsonValue(data) || tooLarge(data)) {
        return fail("invalid-request", `a relayed request must be JSON and at most ${MAX_RELAY_SIZE} characters`);
      }
      const message = parseRelayMessage(data);
      if (!message.ok) return message.failure;
      const parsed = parseEnvelope(message.value.request);
      if (!parsed.ok) return parsed.failure;
      const envelope = parsed.value;
      const { claim } = message.value;
      module = envelope.module;
      type = envelope.type;

      // A type nobody offers is answered by the kernel; no handler runs, so nobody needs to be asked.
      const handler = byType.get(type);
      if (!handler) return kernel.execute(envelope);
      if (handler.runsOn !== "gm") return fail("not-permitted", `request type "${type}" is not run for other clients`);

      const sender = findSender(registry, module);
      if (!sender.ok) return sender.failure;

      // Nothing runs before the user the request names has confirmed it. Anything else is a refusal.
      const problem = await confirmClaim(claim);
      if (problem !== undefined) {
        note = `claimed user ${claim.userId}: ${problem}`;
        return fail("not-permitted", "the asking user could not be confirmed");
      }
      return kernel.execute(envelope, { user: { id: claim.userId } });
    }

    let result: RequestResult;
    try {
      result = await run();
    } catch (error) {
      result = fail("internal-error", describeError(error));
    }

    if (result.ok) return result;
    // Failures are reported here in full; what goes back to the sender keeps no text from this client.
    log.warn(
      `eagle-flight-control | relayed request rejected for ${module} (${type}): ${result.reason} - ${result.detail}${note ? ` (${note})` : ""}`,
    );
    if (result.reason === "handler-failed" || result.reason === "internal-error") {
      return fail(result.reason, GENERIC_DETAIL);
    }
    return result;
  }

  // The question comes from a Gamemaster's client: did this client send the request with this identifier?
  function answerConfirmation(data: unknown): ConfirmationAnswer {
    let userId = "";
    try {
      userId = environment.currentUserId();
      const requestId = typeof data === "object" && data !== null ? (data as Record<string, unknown>).requestId : undefined;
      if (userId !== "" && typeof requestId === "string" && pending.has(requestId)) return { confirmed: true, userId };
    } catch {
      // An unreadable question is not confirmed.
    }
    return { confirmed: false, userId };
  }

  return Object.freeze({ execute, receive, answerConfirmation });
}

import type { Checked } from "./request-kernel";

// The Gamemaster's client asks the client of the user a forwarded request names whether that user really sent it.
// Only a positive answer from that client lets the request run; everything else is a refusal.
// How long the Gamemaster's client waits for the answer.
export const CONFIRM_TIMEOUT_MS = 5_000;

const REQUEST_ID_MIN_LENGTH = 16;
const REQUEST_ID_MAX_LENGTH = 128;

// Who a forwarded request says it comes from, and the identifier under which the asking client remembers it.
export interface Claim {
  readonly userId: string;
  readonly requestId: string;
}

// What travels to the Gamemaster's client: the request and the claim.
export interface RelayMessage {
  readonly request: unknown;
  readonly claim: Claim;
}

// The answer of the asking user's client to the Gamemaster's question.
export interface ConfirmationAnswer {
  readonly confirmed: boolean;
  readonly userId: string;
}

// The identifiers of the requests this client has sent and that have not finished yet.
export interface PendingRequests {
  // Remembers a new request and returns its identifier.
  open(): string;
  has(requestId: string): boolean;
  close(requestId: string): void;
}

// `newId` must hand out identifiers that nobody else can guess.
export function createPendingRequests(newId: () => string): PendingRequests {
  const open = new Set<string>();
  return {
    open() {
      const requestId = newId();
      open.add(requestId);
      return requestId;
    },
    has: (requestId) => open.has(requestId),
    close(requestId) {
      open.delete(requestId);
    },
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// The data of a forwarded request, checked for its shape. The request itself is checked later, like any other.
export function parseRelayMessage(data: unknown): Checked<RelayMessage> {
  const invalid = (detail: string): Checked<RelayMessage> => ({
    ok: false,
    failure: { ok: false, reason: "invalid-request", detail },
  });

  if (!isPlainObject(data)) return invalid("a relayed request must be an object like { request, claim }");
  const { request, claim } = data;
  if (!isPlainObject(claim)) return invalid("a relayed request must name the asking user in claim");
  const { userId, requestId } = claim;
  if (typeof userId !== "string" || userId === "") return invalid("claim.userId must be a non-empty string");
  if (
    typeof requestId !== "string" ||
    requestId.length < REQUEST_ID_MIN_LENGTH ||
    requestId.length > REQUEST_ID_MAX_LENGTH
  ) {
    return invalid(`claim.requestId must be a string of ${REQUEST_ID_MIN_LENGTH} to ${REQUEST_ID_MAX_LENGTH} characters`);
  }
  return { ok: true, value: { request, claim: { userId, requestId } } };
}

// True only for an answer that confirms and comes from the user the request names.
export function isConfirmed(answer: unknown, claim: Claim): boolean {
  if (!isPlainObject(answer)) return false;
  return answer.confirmed === true && answer.userId === claim.userId;
}

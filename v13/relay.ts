import type { ConfirmationAnswer, RelayMessage } from "../core/request-identity";
import type { RequestResult, RequestUser } from "../core/request-kernel";
import type { Executor } from "../core/request-handlers";
import type { RelayEnvironment, RequestRelay } from "../core/request-relay";

// Foundry's rule for module queries: the name starts with the module's own prefix (see CONFIG.queries).
// The first query carries a forwarded request to the Gamemaster's client, the second is the Gamemaster's question to
// a user's client whether that user sent the request.
export const RELAY_QUERY = "eagle-flight-control.request";
export const CONFIRM_QUERY = "eagle-flight-control.confirm";

// Foundry stops waiting for a query after its own timeout; ours (the relay's) must run out first, so this is longer.
const FOUNDRY_TIMEOUT_GRACE_MS = 2_000;

declare global {
  namespace CONFIG {
    interface Queries {
      "eagle-flight-control.request": (data: unknown) => Promise<RequestResult>;
      "eagle-flight-control.confirm": (data: unknown) => Promise<ConfirmationAnswer>;
    }
  }
}

// Who runs a handler in this client (used by flightcontrol.gmping).
export function foundryExecutor(): Executor {
  const user = game.user;
  return { userId: user?.id ?? "", isGm: user?.isGM === true };
}

// The user of this client, for requests that run here.
export function foundryCurrentUser(): RequestUser | undefined {
  const id = game.user?.id;
  return id ? { id } : undefined;
}

// 128 random bits as 32 hexadecimal characters; nobody else can guess them.
function newIdentifier(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function foundryRelayEnvironment(): RelayEnvironment {
  return {
    isGm: () => game.user?.isGM === true,
    hasGm: () => game.users?.activeGM != null,
    currentUserId: () => game.user?.id ?? "",
    newId: newIdentifier,
    send: (message: RelayMessage, timeoutMs: number) => {
      const gm = game.users?.activeGM;
      if (!gm) throw new Error("no Gamemaster is connected");
      return gm.query(RELAY_QUERY, message, { timeout: timeoutMs + FOUNDRY_TIMEOUT_GRACE_MS });
    },
    confirm: (userId: string, requestId: string, timeoutMs: number) => {
      const user = game.users?.get(userId);
      if (!user) throw new Error(`no user with the id ${userId}`);
      return user.query(CONFIRM_QUERY, { requestId }, { timeout: timeoutMs + FOUNDRY_TIMEOUT_GRACE_MS });
    },
  };
}

// Foundry hands a query handler only the query data and the query options ({ timeout }; live check of 2026-09-20), so a
// handler cannot tell which user asked. That is why the Gamemaster's client asks the named user's client to confirm.
// Every client answers both queries. The relay refuses the first unless this client's user has a Gamemaster role and
// answers the second only for a request this client has sent itself.
export function registerRelayQueries(relay: RequestRelay): void {
  CONFIG.queries[RELAY_QUERY] = (data: unknown) => relay.receive(data);
  CONFIG.queries[CONFIRM_QUERY] = async (data: unknown) => relay.answerConfirmation(data);
}

import type { ApiLogger } from "../core/eagle-api";
import type { RequestEnvelope, RequestResult } from "../core/request-kernel";
import type { Executor } from "../core/request-handlers";
import type { RelayEnvironment, RequestRelay } from "../core/request-relay";

// Foundry's rule for module queries: the name starts with the module's own prefix (see CONFIG.queries).
export const RELAY_QUERY = "eagleeye.request";

// Foundry stops waiting for a query after its own timeout; ours (the relay's) must run out first, so this is longer.
const FOUNDRY_TIMEOUT_GRACE_MS = 2_000;

declare global {
  namespace CONFIG {
    interface Queries {
      "eagleeye.request": (data: unknown) => Promise<RequestResult>;
    }
  }
}

// Who runs a handler in this client (used by flightcontrol.gmping).
export function foundryExecutor(): Executor {
  const user = game.user;
  return { userId: user?.id ?? "", isGm: user?.isGM === true };
}

export function foundryRelayEnvironment(): RelayEnvironment {
  return {
    isGm: () => game.user?.isGM === true,
    hasGm: () => game.users?.activeGM != null,
    send: (envelope: RequestEnvelope, timeoutMs: number) => {
      const gm = game.users?.activeGM;
      if (!gm) throw new Error("no Gamemaster is connected");
      return gm.query(RELAY_QUERY, envelope, { timeout: timeoutMs + FOUNDRY_TIMEOUT_GRACE_MS });
    },
  };
}

// What Foundry hands to a query handler beyond the query data is not documented. The first query that arrives tells
// the Gamemaster's console what it is (nothing is decided from it), so the live check can settle that question.
function describeExtraArguments(extra: unknown[]): string {
  if (extra.length === 0) return "none";
  try {
    return `${extra.length}: ${JSON.stringify(extra).slice(0, 300)}`;
  } catch {
    return `${extra.length}: not printable`;
  }
}

// The Gamemaster's side: every client answers this query through the relay, which refuses it unless this client's
// user has a Gamemaster role.
export function registerRelayQuery(relay: RequestRelay, log: ApiLogger): void {
  let diagnosed = false;
  CONFIG.queries[RELAY_QUERY] = (data: unknown, ...extra: unknown[]) => {
    if (!diagnosed) {
      diagnosed = true;
      log.info(`eagleeye | relay: first query received, extra handler arguments: ${describeExtraArguments(extra)}`);
    }
    return relay.receive(data);
  };
}

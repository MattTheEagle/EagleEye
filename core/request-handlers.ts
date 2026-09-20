import type { JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

const MAX_ECHO_LENGTH = 200;

// The client a handler runs on, as far as a handler may tell: the user id and whether that user has a Gamemaster role.
export interface Executor {
  readonly userId: string;
  readonly isGm: boolean;
}

interface EchoPayload {
  readonly echo: string | null;
}

// The payload of both ping requests: nothing, or { echo?: string }.
function validateEcho(payload: unknown): PayloadCheck<EchoPayload> {
  if (payload === undefined || payload === null) return { ok: true, value: { echo: null } };
  if (typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { echo?: string }" };
  }
  const { echo } = payload as Record<string, unknown>;
  if (echo === undefined || echo === null) return { ok: true, value: { echo: null } };
  if (typeof echo !== "string") return { ok: false, detail: "payload.echo must be a string" };
  if (echo.length > MAX_ECHO_LENGTH) {
    return { ok: false, detail: `payload.echo must not be longer than ${MAX_ECHO_LENGTH} characters` };
  }
  return { ok: true, value: { echo } };
}

// flightcontrol.ping (version 1): the proof that the request channel works. It checks the envelope, the sender and the
// payload and answers with plain data; it does not touch Foundry. It runs in the client of the caller.
function createPingHandler(apiVersion: string): RequestHandler<EchoPayload> {
  return {
    type: "flightcontrol.ping",
    versions: [1],
    validate: validateEcho,
    async run(payload, context): Promise<JsonValue> {
      return { apiVersion, module: context.module.id, echo: payload.echo };
    },
  };
}

// flightcontrol.gmping (version 1): the proof that a request reaches the Gamemaster's client. It runs there and says
// who ran it (`ranBy`) and for whom (`askedBy`: the user who confirmed the request, null when that is not known).
// It only reads; the user ids of the Gamemaster and of the players are visible to everyone in the world anyway.
function createGmPingHandler(apiVersion: string, executor: () => Executor): RequestHandler<EchoPayload> {
  return {
    type: "flightcontrol.gmping",
    versions: [1],
    runsOn: "gm",
    validate: validateEcho,
    async run(payload, context): Promise<JsonValue> {
      const { userId, isGm } = executor();
      return {
        apiVersion,
        module: context.module.id,
        echo: payload.echo,
        ranBy: { userId, isGm },
        askedBy: context.user?.id ?? null,
      };
    },
  };
}

// Everything Flight Control offers as a request. Every further request type needs the Apply of the milestone that
// brings it (Flight Control stays narrow and generic); the test for this list guards against unnoticed growth.
// A handler that runs on the Gamemaster's client ("gm") must not change data or pass on Gamemaster-only knowledge
// before the rights per module and user exist (milestone M6).
export function defaultRequestHandlers(apiVersion: string, executor: () => Executor): RequestHandler[] {
  return [createPingHandler(apiVersion) as RequestHandler, createGmPingHandler(apiVersion, executor) as RequestHandler];
}

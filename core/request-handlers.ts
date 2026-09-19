import type { JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

const MAX_ECHO_LENGTH = 200;

interface PingPayload {
  readonly echo: string | null;
}

// flightcontrol.ping (version 1): the proof that the request channel works. It checks the envelope, the sender and the
// payload and answers with plain data; it does not touch Foundry.
function createPingHandler(apiVersion: string): RequestHandler<PingPayload> {
  return {
    type: "flightcontrol.ping",
    versions: [1],
    validate(payload: unknown): PayloadCheck<PingPayload> {
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
    },
    async run(payload, context): Promise<JsonValue> {
      return { apiVersion, module: context.module.id, echo: payload.echo };
    },
  };
}

// Everything Flight Control offers as a request. Every further request type needs the Apply of the milestone that
// brings it (Flight Control stays narrow and generic); the test for this list guards against unnoticed growth.
export function defaultRequestHandlers(apiVersion: string): RequestHandler[] {
  return [createPingHandler(apiVersion) as RequestHandler];
}

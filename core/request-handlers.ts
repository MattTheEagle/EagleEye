import { createCompendiumHandler, type CompendiumEnvironment } from "./compendium-handlers";
import { createImportHandler, type ImportEnvironment } from "./document-import";
import { createFlagHandler, type FlagEnvironment } from "./flag-write";
import { createSettingWriteHandler, type SettingsEnvironment } from "./setting-write";
import type { JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

const MAX_ECHO_LENGTH = 200;
const MAX_UUID_LENGTH = 200;

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

interface TargetPayload {
  readonly uuid: string;
}

// The payload of flightcontrol.targetping: { uuid: string }, the UUID of the document that is the request's target.
function validateTarget(payload: unknown): PayloadCheck<TargetPayload> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { uuid: string }" };
  }
  const { uuid } = payload as Record<string, unknown>;
  if (typeof uuid !== "string" || uuid === "") return { ok: false, detail: "payload.uuid must be a non-empty string" };
  if (uuid.length > MAX_UUID_LENGTH) {
    return { ok: false, detail: `payload.uuid must not be longer than ${MAX_UUID_LENGTH} characters` };
  }
  return { ok: true, value: { uuid } };
}

// flightcontrol.targetping (version 1): the proof of the rights for own and foreign targets. It runs on the Gamemaster's
// client and names a document as its target, so the rights per module and user decide before it runs. It does nothing
// with the document and tells nothing about it: it only answers with the target it was given and the user it ran for.
function createTargetPingHandler(apiVersion: string): RequestHandler<TargetPayload> {
  return {
    type: "flightcontrol.targetping",
    versions: [1],
    runsOn: "gm",
    validate: validateTarget,
    targets: (payload) => [payload.uuid],
    async run(payload, context): Promise<JsonValue> {
      return { apiVersion, module: context.module.id, uuid: payload.uuid, askedBy: context.user?.id ?? null };
    },
  };
}

// Everything Flight Control offers as a request. Every further request type needs the Apply of the milestone that
// brings it (Flight Control stays narrow and generic); the test for this list guards against unnoticed growth.
// A handler that runs on the Gamemaster's client ("gm") must name the documents it acts on (`targets`), so the rights
// per module and user decide before it runs. One that changes data or hands out Gamemaster-only knowledge also needs
// the Apply of its milestone to say how (see the rules in the API contract, section 4); a type that changes the world is
// marked `gmOnly`.
export function defaultRequestHandlers(
  apiVersion: string,
  executor: () => Executor,
  compendiums: CompendiumEnvironment,
  imports: ImportEnvironment,
  settings: SettingsEnvironment,
  flags: FlagEnvironment,
): RequestHandler[] {
  return [
    createPingHandler(apiVersion) as RequestHandler,
    createGmPingHandler(apiVersion, executor) as RequestHandler,
    createTargetPingHandler(apiVersion) as RequestHandler,
    createCompendiumHandler(compendiums) as RequestHandler,
    createImportHandler(imports) as RequestHandler,
    createSettingWriteHandler(settings) as RequestHandler,
    createFlagHandler(flags) as RequestHandler,
  ];
}

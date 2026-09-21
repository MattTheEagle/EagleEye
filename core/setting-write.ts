import type { JsonValue } from "./json-value";
import type { PayloadCheck, RequestHandler } from "./request-kernel";

export const MAX_SETTING_LENGTH = 262_144;
const MAX_KEY_LENGTH = 100;
const KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// How a setting is registered, as far as the handler needs to know (Foundry's `game.settings.settings` entry).
export interface SettingInfo {
  readonly scope: string;
  // "String" for a setting of type String; anything else is "other".
  readonly type: string;
  readonly config: boolean;
}

// What the handler needs from Foundry (v13/setting-write.ts). Every call may throw or reject; the kernel turns that into
// `handler-failed`.
export interface SettingsEnvironment {
  // The registration of `<namespace>.<key>`, if there is one.
  info(namespace: string, key: string): SettingInfo | undefined;
  get(namespace: string, key: string): unknown;
  set(namespace: string, key: string, value: string): Promise<void>;
}

// For callers without Foundry (the default kernel of createEagleApi, tests): no setting is registered.
export const NO_SETTINGS: SettingsEnvironment = Object.freeze({
  info: () => undefined,
  get: () => undefined,
  set: async () => {
    throw new Error("settings cannot be written without Foundry");
  },
});

export interface SettingWritePayload {
  readonly key: string;
  readonly value: string;
  readonly previous?: string;
}

// The payload of setting.write: { key, value, previous? }.
function validateWrite(payload: unknown): PayloadCheck<SettingWritePayload> {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { ok: false, detail: "payload must be an object like { key, value, previous? }" };
  }
  const { key, value, previous } = payload as Record<string, unknown>;
  if (typeof key !== "string" || key === "" || key.length > MAX_KEY_LENGTH || !KEY_PATTERN.test(key)) {
    return { ok: false, detail: `payload.key must be lower case letters and digits joined by single hyphens, at most ${MAX_KEY_LENGTH} characters` };
  }
  if (typeof value !== "string") return { ok: false, detail: "payload.value must be a string" };
  if (value.length > MAX_SETTING_LENGTH) {
    return { ok: false, detail: `payload.value must not be longer than ${MAX_SETTING_LENGTH} characters` };
  }
  if (previous !== undefined) {
    if (typeof previous !== "string") return { ok: false, detail: "payload.previous must be a string" };
    if (previous.length > MAX_SETTING_LENGTH) {
      return { ok: false, detail: `payload.previous must not be longer than ${MAX_SETTING_LENGTH} characters` };
    }
  }
  return { ok: true, value: { key, value, ...(previous === undefined ? {} : { previous }) } };
}

const textOf = (stored: unknown): string => (typeof stored === "string" ? stored : stored === undefined || stored === null ? "" : String(stored));

// setting.write (version 1): writes a world setting of the module that asks. The namespace is the id of the asking module
// and not part of the payload, so a module writes its own settings only (the settings of Flight Control, of the game system
// and of the core are out of reach). The setting must be registered by that module with the scope "world", the type String
// and `config: false`: what the hub shows is the hub's to change. `previous` is what the caller read; if the setting is
// something else now, nothing is written (so two clients that add to the same text do not overwrite each other). It runs on
// the Gamemaster's client for a Gamemaster or Assistant only. Writing the same text again changes nothing.
export function createSettingWriteHandler(environment: SettingsEnvironment): RequestHandler<SettingWritePayload> {
  return {
    type: "setting.write",
    versions: [1],
    runsOn: "gm",
    gmOnly: true,
    validate: validateWrite,
    async run(payload, context): Promise<JsonValue> {
      const namespace = context.module.id;
      const name = `${namespace}.${payload.key}`;
      const info = environment.info(namespace, payload.key);
      if (!info) throw new Error(`the setting ${name} is not registered`);
      if (info.scope !== "world") throw new Error(`the setting ${name} is not a world setting`);
      if (info.type !== "String") throw new Error(`the setting ${name} is not of the type String`);
      if (info.config) throw new Error(`the setting ${name} is shown in the hub (config: true) and is not written by request`);
      const current = textOf(environment.get(namespace, payload.key));
      if (payload.previous !== undefined && payload.previous !== current) {
        throw new Error(`the setting ${name} changed since it was read`);
      }
      if (current === payload.value) return { key: payload.key, changed: false };
      await environment.set(namespace, payload.key, payload.value);
      return { key: payload.key, changed: true };
    },
  };
}

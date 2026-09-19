// Used by the Eagle hub. The hub reads only the settings of registered Eagle modules and writes only through
// applySettingInput (registered modules only, canWrite() is the Gamemaster until M6 brings per-module rights).
// updateSetting is the unguarded low-level write; the hub does not use it.

export interface SettingEntry {
  namespace: string;
  key: string;
  name: string;
  hint?: string;
  scope: "world" | "client" | "user";
  value: unknown;
}

export interface RawSettingConfig {
  namespace: string;
  key: string;
  name?: string;
  hint?: string;
  scope?: "world" | "client" | "user";
  config?: boolean;
  type?: unknown;
  choices?: unknown;
  range?: unknown;
  requiresReload?: boolean;
}

export interface SettingsRegistrySource {
  entries(): Iterable<[string, RawSettingConfig]>;
  get(namespace: string, key: string): unknown;
  set(namespace: string, key: string, value: unknown): Promise<unknown>;
  localize(stringId: string): string;
}

function defaultSource(): SettingsRegistrySource {
  // game.settings is the ClientSettings instance; the registry Map lives at
  // game.settings.settings, not on the instance itself.
  const clientSettings = game.settings!;
  const i18n = game.i18n!;
  return {
    entries: () => clientSettings.settings.entries() as Iterable<[string, RawSettingConfig]>,
    get: (namespace, key) => clientSettings.get(namespace as never, key as never),
    set: (namespace, key, value) => clientSettings.set(namespace as never, key as never, value as never),
    localize: (stringId) => i18n.localize(stringId),
  };
}

export function listSettings(source: SettingsRegistrySource = defaultSource()): SettingEntry[] {
  const results: SettingEntry[] = [];
  for (const [, config] of source.entries()) {
    const rawName = config.name ?? config.key;
    results.push({
      namespace: config.namespace,
      key: config.key,
      name: source.localize(rawName) || rawName,
      hint: config.hint ? source.localize(config.hint) : undefined,
      scope: config.scope ?? "client",
      value: source.get(config.namespace, config.key),
    });
  }
  return results;
}

export function updateSetting(
  namespace: string,
  key: string,
  value: unknown,
  source: SettingsRegistrySource = defaultSource(),
): Promise<unknown> {
  return source.set(namespace, key, value);
}

// --- Hub settings: what the hub shows and how it writes ---------------------------------------------------------

export type SettingKind = "boolean" | "string" | "number" | "unsupported";

export interface HubSettingChoice {
  readonly value: string;
  readonly label: string;
}

export interface HubSettingRange {
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
}

export interface HubSetting {
  readonly namespace: string;
  readonly key: string;
  readonly label: string;
  readonly hint?: string;
  readonly scope: "world" | "client" | "user";
  readonly kind: SettingKind;
  readonly value: unknown;
  readonly choices?: readonly HubSettingChoice[];
  readonly range?: HubSettingRange;
  readonly requiresReload: boolean;
  // Name of the registered type, for diagnostics only.
  readonly typeName: string;
}

export interface HubSettingsSource extends SettingsRegistrySource {
  kindOf(type: unknown): SettingKind;
  canWrite(): boolean;
}

function describeType(type: unknown): string {
  if (typeof type === "function") return type.name || "function";
  if (typeof type === "object" && type !== null) {
    return (type as { constructor?: { name?: string } }).constructor?.name || "object";
  }
  return typeof type;
}

function toChoices(raw: unknown, localize: (stringId: string) => string): HubSettingChoice[] | undefined {
  const label = (text: string) => localize(text) || text;
  if (Array.isArray(raw)) {
    return raw.map((value) => ({ value: String(value), label: label(String(value)) }));
  }
  if (typeof raw === "object" && raw !== null) {
    return Object.entries(raw as Record<string, unknown>).map(([value, text]) => ({
      value,
      label: label(String(text)),
    }));
  }
  return undefined;
}

function toRange(raw: unknown): HubSettingRange | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const { min, max, step } = raw as Record<string, unknown>;
  const finite = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);
  const range = { min: finite(min), max: finite(max), step: finite(step) };
  return range.min === undefined && range.max === undefined && range.step === undefined ? undefined : range;
}

function toHubSetting(config: RawSettingConfig, source: HubSettingsSource): HubSetting {
  const kind = source.kindOf(config.type);
  const rawName = config.name ?? config.key;
  return {
    namespace: config.namespace,
    key: config.key,
    label: source.localize(rawName) || rawName,
    hint: config.hint ? source.localize(config.hint) : undefined,
    scope: config.scope ?? "client",
    kind,
    value: source.get(config.namespace, config.key),
    choices: kind === "string" ? toChoices(config.choices, source.localize) : undefined,
    range: kind === "number" ? toRange(config.range) : undefined,
    requiresReload: config.requiresReload === true,
    typeName: describeType(config.type),
  };
}

// The settings of one namespace that Foundry itself would show in its configuration (`config: true`).
export function listHubSettings(namespace: string, source: HubSettingsSource): HubSetting[] {
  const results: HubSetting[] = [];
  for (const [, config] of source.entries()) {
    if (config.namespace !== namespace || config.config !== true) continue;
    results.push(toHubSetting(config, source));
  }
  return results;
}

export function coerceSettingInput(
  setting: HubSetting,
  raw: unknown,
): { ok: true; value: boolean | string | number } | { ok: false; detail: string } {
  switch (setting.kind) {
    case "boolean": {
      if (typeof raw === "boolean") return { ok: true, value: raw };
      if (raw === "true") return { ok: true, value: true };
      if (raw === "false") return { ok: true, value: false };
      return { ok: false, detail: "expected true or false" };
    }
    case "string": {
      if (typeof raw !== "string") return { ok: false, detail: "expected text" };
      if (setting.choices && !setting.choices.some((choice) => choice.value === raw)) {
        return { ok: false, detail: `"${raw}" is not one of the allowed choices` };
      }
      return { ok: true, value: raw };
    }
    case "number": {
      const value = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
      if (!Number.isFinite(value)) return { ok: false, detail: "expected a number" };
      const { min, max } = setting.range ?? {};
      if (min !== undefined && value < min) return { ok: false, detail: `must not be below ${min}` };
      if (max !== undefined && value > max) return { ok: false, detail: `must not be above ${max}` };
      return { ok: true, value };
    }
    default:
      return { ok: false, detail: "this setting cannot be edited here" };
  }
}

export type SettingWriteFailure =
  | "not-permitted"
  | "not-allowed"
  | "unknown-setting"
  | "not-editable"
  | "invalid-value"
  | "write-failed";

export type SettingWriteResult =
  | { readonly ok: true; readonly value: unknown }
  | { readonly ok: false; readonly reason: SettingWriteFailure; readonly detail: string };

function refuse(reason: SettingWriteFailure, detail: string): SettingWriteResult {
  return { ok: false, reason, detail };
}

// The only way the hub writes a setting. Never rejects; every failure comes back as a result and writes nothing.
export async function applySettingInput(
  namespace: string,
  key: string,
  raw: unknown,
  allowedNamespaces: readonly string[],
  source: HubSettingsSource,
): Promise<SettingWriteResult> {
  try {
    if (!source.canWrite()) return refuse("not-permitted", "only a Gamemaster can change settings in the hub");
    if (!allowedNamespaces.includes(namespace)) {
      return refuse("not-allowed", `"${namespace}" is not a registered Eagle module`);
    }

    let config: RawSettingConfig | undefined;
    for (const [, candidate] of source.entries()) {
      if (candidate.namespace === namespace && candidate.key === key) {
        config = candidate;
        break;
      }
    }
    if (!config) return refuse("unknown-setting", `no setting ${namespace}.${key} is registered`);
    if (config.config !== true) return refuse("not-editable", `${namespace}.${key} is not a configurable setting`);

    const setting = toHubSetting(config, source);
    if (setting.kind === "unsupported") {
      return refuse("not-editable", `${namespace}.${key} has a type the hub cannot edit (${setting.typeName})`);
    }
    const coerced = coerceSettingInput(setting, raw);
    if (!coerced.ok) return refuse("invalid-value", coerced.detail);

    await source.set(namespace, key, coerced.value);
    return { ok: true, value: coerced.value };
  } catch (error) {
    return refuse("write-failed", error instanceof Error ? error.message : String(error));
  }
}

function isInstanceOf(value: unknown, constructor: unknown): boolean {
  return typeof constructor === "function" && value instanceof (constructor as new (...args: never[]) => unknown);
}

// Foundry may hand out the registered constructor (Boolean, String, Number) or a DataField instance; both are
// recognised, everything else is "unsupported".
function defaultKindOf(type: unknown): SettingKind {
  if (type === Boolean) return "boolean";
  if (type === String) return "string";
  if (type === Number) return "number";
  const dataFields = (globalThis as { foundry?: { data?: { fields?: Record<string, unknown> } } }).foundry?.data
    ?.fields;
  if (dataFields) {
    if (isInstanceOf(type, dataFields.BooleanField)) return "boolean";
    if (isInstanceOf(type, dataFields.NumberField)) return "number";
    if (isInstanceOf(type, dataFields.StringField)) return "string";
  }
  return "unsupported";
}

export function defaultHubSettingsSource(): HubSettingsSource {
  return {
    ...defaultSource(),
    kindOf: defaultKindOf,
    canWrite: () => game.user?.isGM === true,
  };
}

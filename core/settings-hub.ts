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

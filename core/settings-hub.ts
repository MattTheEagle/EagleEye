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
}

function defaultSource(): SettingsRegistrySource {
  // game.settings is the ClientSettings instance; the registry Map lives at
  // game.settings.settings, not on the instance itself.
  const clientSettings = game.settings!;
  return {
    entries: () => clientSettings.settings.entries() as Iterable<[string, RawSettingConfig]>,
    get: (namespace, key) => clientSettings.get(namespace as never, key as never),
    set: (namespace, key, value) => clientSettings.set(namespace as never, key as never, value as never),
  };
}

export function listSettings(source: SettingsRegistrySource = defaultSource()): SettingEntry[] {
  const results: SettingEntry[] = [];
  for (const [, config] of source.entries()) {
    results.push({
      namespace: config.namespace,
      key: config.key,
      name: config.name ?? config.key,
      hint: config.hint,
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

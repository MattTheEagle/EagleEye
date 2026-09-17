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
  return game.settings as unknown as SettingsRegistrySource;
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

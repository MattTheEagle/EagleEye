import type { SettingInfo, SettingsEnvironment } from "../core/setting-write";

// The registration of a setting as Foundry keeps it: `game.settings.settings` maps "<namespace>.<key>" to the data the module
// registered. Only what is read here is typed.
interface RegisteredSetting {
  readonly scope?: string;
  readonly type?: unknown;
  readonly config?: boolean;
}

// Foundry's side of setting.write. Whether an Assistant may write a world setting is checked in a running Foundry (the
// Library milestone M5 live check; the contract lists it as not verified).
export function foundrySettingsEnvironment(): SettingsEnvironment {
  const registry = () => (game.settings as unknown as { settings: Map<string, RegisteredSetting> }).settings;
  return {
    info: (namespace, key): SettingInfo | undefined => {
      const registered = registry().get(`${namespace}.${key}`);
      if (!registered) return undefined;
      return { scope: registered.scope ?? "", type: registered.type === String ? "String" : "other", config: registered.config === true };
    },
    get: (namespace, key) => (game.settings as unknown as { get(namespace: string, key: string): unknown }).get(namespace, key),
    set: async (namespace, key, value) => {
      await (game.settings as unknown as { set(namespace: string, key: string, value: string): Promise<unknown> }).set(namespace, key, value);
    },
  };
}

import { describe, expect, it, vi } from "vitest";
import { listSettings, updateSetting, type RawSettingConfig, type SettingsRegistrySource } from "./settings-hub";

function makeSource(configs: RawSettingConfig[], values: Record<string, unknown>): SettingsRegistrySource {
  const map = new Map<string, RawSettingConfig>(configs.map((c) => [`${c.namespace}.${c.key}`, c]));
  const store = new Map(Object.entries(values));
  return {
    entries: () => map.entries(),
    get: (namespace, key) => store.get(`${namespace}.${key}`),
    set: vi.fn((namespace: string, key: string, value: unknown) => {
      store.set(`${namespace}.${key}`, value);
      return Promise.resolve(value);
    }),
  };
}

describe("listSettings", () => {
  it("reads settings across different scopes from the registry", () => {
    const source = makeSource(
      [
        { namespace: "eagleeye-dummy-a", key: "enabled", name: "Enabled", scope: "client" },
        { namespace: "eagleeye-dummy-b", key: "label", name: "Label", scope: "world" },
      ],
      { "eagleeye-dummy-a.enabled": true, "eagleeye-dummy-b.label": "hello" },
    );

    const entries = listSettings(source);

    expect(entries).toHaveLength(2);
    expect(entries.find((e) => e.namespace === "eagleeye-dummy-a")).toMatchObject({
      scope: "client",
      value: true,
    });
    expect(entries.find((e) => e.namespace === "eagleeye-dummy-b")).toMatchObject({
      scope: "world",
      value: "hello",
    });
  });
});

describe("updateSetting", () => {
  it("writes a value into a namespace it does not own", async () => {
    const source = makeSource([{ namespace: "eagleeye-dummy-a", key: "enabled", scope: "client" }], {
      "eagleeye-dummy-a.enabled": false,
    });

    await updateSetting("eagleeye-dummy-a", "enabled", true, source);

    expect(source.set).toHaveBeenCalledWith("eagleeye-dummy-a", "enabled", true);
    expect(source.get("eagleeye-dummy-a", "enabled")).toBe(true);
  });
});

describe("defaultSource (real game.settings shape)", () => {
  it("adapts game.settings (ClientSettings instance) instead of confusing it with game.settings.settings", () => {
    const registry = new Map<string, RawSettingConfig>([
      ["eagleeye-dummy-a.enabled", { namespace: "eagleeye-dummy-a", key: "enabled", scope: "client" }],
    ]);
    const fakeClientSettings = {
      settings: registry,
      get: vi.fn(() => true),
      set: vi.fn((_ns: string, _key: string, value: unknown) => Promise.resolve(value)),
    };
    vi.stubGlobal("game", { settings: fakeClientSettings });

    const entries = listSettings();

    expect(entries).toHaveLength(1);
    expect(fakeClientSettings.get).toHaveBeenCalledWith("eagleeye-dummy-a", "enabled");

    vi.unstubAllGlobals();
  });
});

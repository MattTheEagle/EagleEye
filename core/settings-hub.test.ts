import { describe, expect, it, vi } from "vitest";
import {
  applySettingInput,
  coerceSettingInput,
  defaultHubSettingsSource,
  listHubSettings,
  listSettings,
  updateSetting,
  type HubSettingsSource,
  type RawSettingConfig,
  type SettingsRegistrySource,
} from "./settings-hub";

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
    localize: (stringId: string) => stringId,
  };
}

describe("listSettings", () => {
  it("reads settings across different scopes from the registry", () => {
    const source = makeSource(
      [
        { namespace: "eagle-flight-control-dummy-a", key: "enabled", name: "Enabled", scope: "client" },
        { namespace: "eagle-flight-control-dummy-b", key: "label", name: "Label", scope: "world" },
      ],
      { "eagle-flight-control-dummy-a.enabled": true, "eagle-flight-control-dummy-b.label": "hello" },
    );

    const entries = listSettings(source);

    expect(entries).toHaveLength(2);
    expect(entries.find((e) => e.namespace === "eagle-flight-control-dummy-a")).toMatchObject({
      scope: "client",
      value: true,
    });
    expect(entries.find((e) => e.namespace === "eagle-flight-control-dummy-b")).toMatchObject({
      scope: "world",
      value: "hello",
    });
  });
});

describe("updateSetting", () => {
  it("writes a value into a namespace it does not own", async () => {
    const source = makeSource([{ namespace: "eagle-flight-control-dummy-a", key: "enabled", scope: "client" }], {
      "eagle-flight-control-dummy-a.enabled": false,
    });

    await updateSetting("eagle-flight-control-dummy-a", "enabled", true, source);

    expect(source.set).toHaveBeenCalledWith("eagle-flight-control-dummy-a", "enabled", true);
    expect(source.get("eagle-flight-control-dummy-a", "enabled")).toBe(true);
  });
});

describe("defaultSource (real game.settings shape)", () => {
  it("adapts game.settings (ClientSettings instance) instead of confusing it with game.settings.settings", () => {
    const registry = new Map<string, RawSettingConfig>([
      ["eagle-flight-control-dummy-a.enabled", { namespace: "eagle-flight-control-dummy-a", key: "enabled", scope: "client" }],
    ]);
    const fakeClientSettings = {
      settings: registry,
      get: vi.fn(() => true),
      set: vi.fn((_ns: string, _key: string, value: unknown) => Promise.resolve(value)),
    };
    const fakeI18n = { localize: (stringId: string) => stringId };
    vi.stubGlobal("game", { settings: fakeClientSettings, i18n: fakeI18n });

    const entries = listSettings();

    expect(entries).toHaveLength(1);
    expect(fakeClientSettings.get).toHaveBeenCalledWith("eagle-flight-control-dummy-a", "enabled");

    vi.unstubAllGlobals();
  });
});

// --- Hub settings -------------------------------------------------------------------------------------------------

type HubTestSource = HubSettingsSource & { store: Map<string, unknown>; setMock: ReturnType<typeof vi.fn> };

function makeHubSource(
  configs: RawSettingConfig[],
  values: Record<string, unknown> = {},
  options: { canWrite?: boolean; failSet?: boolean } = {},
): HubTestSource {
  const map = new Map<string, RawSettingConfig>(configs.map((c) => [`${c.namespace}.${c.key}`, c]));
  const store = new Map(Object.entries(values));
  const setMock = vi.fn((namespace: string, key: string, value: unknown) => {
    if (options.failSet) return Promise.reject(new Error("disk full"));
    store.set(`${namespace}.${key}`, value);
    return Promise.resolve(value);
  });
  return {
    entries: () => map.entries(),
    get: (namespace, key) => store.get(`${namespace}.${key}`),
    set: setMock,
    localize: (stringId) => (stringId.startsWith("L.") ? `<${stringId}>` : stringId),
    kindOf: (type) =>
      type === Boolean ? "boolean" : type === String ? "string" : type === Number ? "number" : "unsupported",
    canWrite: () => options.canWrite ?? true,
    store,
    setMock,
  };
}

const HUB_CONFIGS: RawSettingConfig[] = [
  { namespace: "mod-a", key: "flag", name: "L.flag", hint: "L.flagHint", config: true, type: Boolean, scope: "world", requiresReload: true },
  { namespace: "mod-a", key: "mode", name: "Mode", config: true, type: String, choices: { alpha: "L.alpha", beta: "Beta" } },
  { namespace: "mod-a", key: "level", name: "Level", config: true, type: Number, range: { min: 0, max: 10, step: 1 } },
  { namespace: "mod-a", key: "free", name: "Free", config: true, type: String },
  { namespace: "mod-a", key: "blob", name: "Blob", config: true, type: Object },
  { namespace: "mod-a", key: "hidden", name: "Hidden", config: false, type: Boolean },
  { namespace: "mod-a", key: "noflag", name: "No flag", type: Boolean },
  { namespace: "other", key: "flag", name: "Other", config: true, type: Boolean },
];

describe("listHubSettings", () => {
  it("lists only the given namespace and only settings with config true, localized, with scope and value", () => {
    const source = makeHubSource(HUB_CONFIGS, { "mod-a.flag": true });

    const settings = listHubSettings("mod-a", source);

    expect(settings.map((s) => s.key)).toEqual(["flag", "mode", "level", "free", "blob"]);
    expect(settings[0]).toMatchObject({
      namespace: "mod-a",
      label: "<L.flag>",
      hint: "<L.flagHint>",
      scope: "world",
      value: true,
    });
    expect(settings[1].scope).toBe("client"); // default scope
  });

  it("derives kind, choices, range, reload flag and type name", () => {
    const fieldLike = new (class BooleanField {})();
    const source = makeHubSource([
      ...HUB_CONFIGS,
      { namespace: "mod-a", key: "field", name: "Field", config: true, type: fieldLike },
    ]);

    const byKey = Object.fromEntries(listHubSettings("mod-a", source).map((s) => [s.key, s]));

    expect(byKey.flag).toMatchObject({ kind: "boolean", requiresReload: true, typeName: "Boolean" });
    expect(byKey.mode.kind).toBe("string");
    expect(byKey.mode.choices).toEqual([
      { value: "alpha", label: "<L.alpha>" },
      { value: "beta", label: "Beta" },
    ]);
    expect(byKey.free.choices).toBeUndefined();
    expect(byKey.level.kind).toBe("number");
    expect(byKey.level.range).toEqual({ min: 0, max: 10, step: 1 });
    expect(byKey.blob).toMatchObject({ kind: "unsupported", typeName: "Object" });
    expect(byKey.field).toMatchObject({ kind: "unsupported", typeName: "BooleanField" });
    expect(byKey.flag.requiresReload).toBe(true);
    expect(byKey.mode.requiresReload).toBe(false);
  });
});

describe("coerceSettingInput", () => {
  const source = makeHubSource(HUB_CONFIGS);
  const byKey = Object.fromEntries(listHubSettings("mod-a", source).map((s) => [s.key, s]));

  it("converts and validates input per kind", () => {
    expect(coerceSettingInput(byKey.flag, true)).toEqual({ ok: true, value: true });
    expect(coerceSettingInput(byKey.flag, "false")).toEqual({ ok: true, value: false });
    expect(coerceSettingInput(byKey.flag, "yes").ok).toBe(false);
    expect(coerceSettingInput(byKey.flag, 1).ok).toBe(false);

    expect(coerceSettingInput(byKey.mode, "alpha")).toEqual({ ok: true, value: "alpha" });
    expect(coerceSettingInput(byKey.mode, "gamma").ok).toBe(false);
    expect(coerceSettingInput(byKey.mode, 5).ok).toBe(false);
    expect(coerceSettingInput(byKey.free, "anything")).toEqual({ ok: true, value: "anything" });

    expect(coerceSettingInput(byKey.level, 5)).toEqual({ ok: true, value: 5 });
    expect(coerceSettingInput(byKey.level, " 8 ")).toEqual({ ok: true, value: 8 });
    expect(coerceSettingInput(byKey.level, 0)).toEqual({ ok: true, value: 0 });
    expect(coerceSettingInput(byKey.level, 10)).toEqual({ ok: true, value: 10 });
    for (const bad of ["", "abc", Number.NaN, 11, -1, null, undefined]) {
      expect(coerceSettingInput(byKey.level, bad).ok, `input ${String(bad)}`).toBe(false);
    }

    expect(coerceSettingInput(byKey.blob, {}).ok).toBe(false);
  });
});

describe("applySettingInput", () => {
  it("writes a valid value through the source and returns the converted value", async () => {
    const source = makeHubSource(HUB_CONFIGS, { "mod-a.level": 1 });

    const result = await applySettingInput("mod-a", "level", "7", ["mod-a"], source);

    expect(result).toEqual({ ok: true, value: 7 });
    expect(source.setMock).toHaveBeenCalledWith("mod-a", "level", 7);
    expect(source.store.get("mod-a.level")).toBe(7);
  });

  it("refuses without writing: not permitted, namespace not allowed, unknown, not editable, invalid; and reports a failing write", async () => {
    const denied = makeHubSource(HUB_CONFIGS, {}, { canWrite: false });
    expect(await applySettingInput("mod-a", "level", 7, ["mod-a"], denied)).toMatchObject({ reason: "not-permitted" });
    expect(denied.setMock).not.toHaveBeenCalled();

    const source = makeHubSource(HUB_CONFIGS);
    const cases: Array<[string, string, unknown, readonly string[], string]> = [
      ["mod-a", "level", 7, ["other"], "not-allowed"],
      ["mod-a", "nope", 7, ["mod-a"], "unknown-setting"],
      ["mod-a", "hidden", true, ["mod-a"], "not-editable"], // config: false
      ["mod-a", "noflag", true, ["mod-a"], "not-editable"], // config missing
      ["mod-a", "blob", {}, ["mod-a"], "not-editable"], // unsupported type
      ["mod-a", "level", "abc", ["mod-a"], "invalid-value"],
      ["mod-a", "level", 11, ["mod-a"], "invalid-value"],
      ["mod-a", "mode", "gamma", ["mod-a"], "invalid-value"],
    ];
    for (const [namespace, key, raw, allowed, reason] of cases) {
      const result = await applySettingInput(namespace, key, raw, allowed, source);
      expect(result, `${namespace}.${key} <- ${String(raw)}`).toMatchObject({ ok: false, reason });
    }
    expect(source.setMock).not.toHaveBeenCalled();

    const failing = makeHubSource(HUB_CONFIGS, {}, { failSet: true });
    expect(await applySettingInput("mod-a", "level", 7, ["mod-a"], failing)).toEqual({
      ok: false,
      reason: "write-failed",
      detail: "disk full",
    });
  });
});

describe("defaultHubSettingsSource (real game shape)", () => {
  it("adapts game.settings.settings, get/set, game.i18n and game.user.isGM", async () => {
    const registry = new Map<string, RawSettingConfig>([
      [
        "mod-a.level",
        { namespace: "mod-a", key: "level", name: "Level", config: true, type: Number, scope: "client", range: { min: 0, max: 10, step: 1 }, requiresReload: false },
      ],
    ]);
    const get = vi.fn(() => 5);
    const set = vi.fn((_namespace: string, _key: string, value: unknown) => Promise.resolve(value));
    vi.stubGlobal("game", {
      settings: { settings: registry, get, set },
      i18n: { localize: (stringId: string) => stringId },
      user: { isGM: true },
    });
    try {
      const source = defaultHubSettingsSource();

      const [setting] = listHubSettings("mod-a", source);
      expect(setting).toMatchObject({ kind: "number", value: 5, range: { min: 0, max: 10, step: 1 } });
      expect(get).toHaveBeenCalledWith("mod-a", "level");
      expect(source.canWrite()).toBe(true);

      expect(await applySettingInput("mod-a", "level", "3", ["mod-a"], source)).toEqual({ ok: true, value: 3 });
      expect(set).toHaveBeenCalledWith("mod-a", "level", 3);

      vi.stubGlobal("game", { settings: { settings: registry, get, set }, i18n: { localize: (id: string) => id }, user: { isGM: false } });
      expect(defaultHubSettingsSource().canWrite()).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("recognises constructors and DataField instances as kinds and everything else as unsupported", () => {
    class BooleanField {}
    class StringField {}
    class NumberField {}
    class SomeOtherField {}
    vi.stubGlobal("game", { settings: { settings: new Map() }, i18n: { localize: (id: string) => id }, user: null });
    try {
      const { kindOf } = defaultHubSettingsSource();
      expect(kindOf(Boolean)).toBe("boolean");
      expect(kindOf(String)).toBe("string");
      expect(kindOf(Number)).toBe("number");
      expect(kindOf(Object)).toBe("unsupported");
      expect(kindOf(new BooleanField())).toBe("unsupported"); // no foundry.data.fields available yet

      vi.stubGlobal("foundry", { data: { fields: { BooleanField, StringField, NumberField } } });
      expect(kindOf(new BooleanField())).toBe("boolean");
      expect(kindOf(new StringField())).toBe("string");
      expect(kindOf(new NumberField())).toBe("number");
      expect(kindOf(new SomeOtherField())).toBe("unsupported");
      expect(kindOf(undefined)).toBe("unsupported");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

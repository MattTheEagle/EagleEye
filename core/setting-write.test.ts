import { describe, expect, it, vi } from "vitest";
import {
  createSettingWriteHandler,
  MAX_SETTING_LENGTH,
  NO_SETTINGS,
  type SettingInfo,
  type SettingsEnvironment,
} from "./setting-write";
import type { RegisteredModule } from "./module-registry";
import { createRightsGate } from "./request-rights";
import { serializeRightsTable } from "./rights-table";

const MODULE: RegisteredModule = { id: "mod-a", title: "Module A", version: "1.0.0", apiVersion: "0.12.0" };
const GM = { id: "gm-1" };
const GOOD: SettingInfo = { scope: "world", type: "String", config: false };

// A world with settings in a table "<namespace>.<key>"; `registered` says how each is registered.
function makeWorld(registered: Record<string, SettingInfo> = { "mod-a.protocol": GOOD }, values: Record<string, unknown> = {}) {
  const stored = new Map<string, unknown>(Object.entries(values));
  const set = vi.fn(async (namespace: string, key: string, value: string) => void stored.set(`${namespace}.${key}`, value));
  const environment: SettingsEnvironment = {
    info: vi.fn((namespace, key) => registered[`${namespace}.${key}`]),
    get: vi.fn((namespace, key) => stored.get(`${namespace}.${key}`)),
    set,
  };
  return { stored, set, environment, handler: createSettingWriteHandler(environment) };
}

const payload = (over: Record<string, unknown> = {}) => ({ key: "protocol", value: "{}", ...over });
const write = (handler: ReturnType<typeof makeWorld>["handler"], p: unknown, module = MODULE) => {
  const checked = handler.validate(p);
  if (!checked.ok) throw new Error(`test setup: ${checked.detail}`);
  return handler.run(checked.value, { module, user: GM });
};

describe("setting.write: the definition", () => {
  it("is version 1, runs on the Gamemaster's client, is for a Gamemaster or Assistant only and names no target", () => {
    const { handler } = makeWorld();
    expect(handler.type).toBe("setting.write");
    expect(handler.versions).toEqual([1]);
    expect(handler.runsOn).toBe("gm");
    expect(handler.gmOnly).toBe(true);
    expect(handler.targets).toBeUndefined();
  });
});

describe("setting.write: the payload", () => {
  const { handler } = makeWorld();

  it("accepts a key of lower case letters and digits joined by hyphens, a text value and an optional previous text", () => {
    for (const key of ["a", "protocol", "a-b-c", "a1-2b", "x".repeat(100)]) {
      expect(handler.validate(payload({ key })), key).toMatchObject({ ok: true });
    }
    expect(handler.validate(payload({ value: "" }))).toMatchObject({ ok: true });
    expect(handler.validate(payload({ value: "x".repeat(MAX_SETTING_LENGTH) }))).toMatchObject({ ok: true });
    expect(handler.validate({ ...payload({ previous: "old" }), extra: 1 })).toEqual({ ok: true, value: { key: "protocol", value: "{}", previous: "old" } });
    expect(handler.validate(payload({ previous: "" }))).toEqual({ ok: true, value: { key: "protocol", value: "{}", previous: "" } });
  });

  it("rejects a payload that is not an object", () => {
    for (const bad of [undefined, null, "text", 5, true, [], [payload()]]) {
      expect(handler.validate(bad), JSON.stringify(bad)).toMatchObject({ ok: false });
    }
  });

  it("rejects a key with a period, a capital, a space, a leading or double hyphen, a namespace or an empty or long key, and names the field", () => {
    for (const key of [undefined, null, 5, "", "Protocol", "a.b", "eagle-library.protocol", "a b", "-a", "a-", "a--b", "a_b", "x".repeat(101), "../a"]) {
      const check = handler.validate(payload({ key }));
      expect(check, JSON.stringify(key)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.key") });
    }
  });

  it("rejects a value that is not text or too long, and a previous that is not text or too long, and names the field", () => {
    for (const value of [undefined, null, 5, {}, ["x"], "x".repeat(MAX_SETTING_LENGTH + 1)]) {
      expect(handler.validate(payload({ value })), JSON.stringify(value)?.slice(0, 20)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.value") });
    }
    for (const previous of [null, 5, {}, "x".repeat(MAX_SETTING_LENGTH + 1)]) {
      expect(handler.validate(payload({ previous })), JSON.stringify(previous)?.slice(0, 20)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.previous") });
    }
  });
});

describe("setting.write: running", () => {
  it("writes the setting of the module that asks and says it changed", async () => {
    const { handler, set, stored } = makeWorld();
    expect(await write(handler, payload({ value: '{"a":1}' }))).toEqual({ key: "protocol", changed: true });
    expect(set).toHaveBeenCalledWith("mod-a", "protocol", '{"a":1}');
    expect(stored.get("mod-a.protocol")).toBe('{"a":1}');
  });

  it("writes the namespace of the asking module, whichever module that is: a module reaches its own settings only", async () => {
    const other: RegisteredModule = { ...MODULE, id: "mod-b" };
    const { handler, set } = makeWorld({ "mod-a.protocol": GOOD, "mod-b.protocol": GOOD });
    await write(handler, payload({ value: "b" }), other);
    expect(set).toHaveBeenCalledWith("mod-b", "protocol", "b");
    expect(set).not.toHaveBeenCalledWith("mod-a", expect.anything(), expect.anything());
  });

  it("cannot reach a setting of another package: one that the module did not register is not registered for it", async () => {
    const { handler, set } = makeWorld({ "eagleeye.rights": GOOD });
    await expect(write(handler, payload({ key: "rights" }))).rejects.toThrow("the setting mod-a.rights is not registered");
    expect(set).not.toHaveBeenCalled();
  });

  it("is safe to ask again: the same text changes nothing and writes nothing", async () => {
    const { handler, set } = makeWorld({ "mod-a.protocol": GOOD }, { "mod-a.protocol": "same" });
    expect(await write(handler, payload({ value: "same" }))).toEqual({ key: "protocol", changed: false });
    expect(set).not.toHaveBeenCalled();
  });

  it("reads a setting that holds no text as empty, so an empty previous matches and an empty value changes nothing", async () => {
    for (const held of [undefined, null, ""]) {
      const { handler, set } = makeWorld({ "mod-a.protocol": GOOD }, { "mod-a.protocol": held });
      expect(await write(handler, payload({ value: "", previous: "" })), String(held)).toEqual({ key: "protocol", changed: false });
      expect(await write(handler, payload({ value: "new", previous: "" })), String(held)).toEqual({ key: "protocol", changed: true });
      expect(set).toHaveBeenCalledTimes(1);
    }
  });

  it("writes only when the setting is what the caller read", async () => {
    const { handler, set, stored } = makeWorld({ "mod-a.protocol": GOOD }, { "mod-a.protocol": "now" });
    await expect(write(handler, payload({ value: "new", previous: "before" }))).rejects.toThrow("the setting mod-a.protocol changed since it was read");
    expect(set).not.toHaveBeenCalled();
    expect(await write(handler, payload({ value: "new", previous: "now" }))).toEqual({ key: "protocol", changed: true });
    expect(stored.get("mod-a.protocol")).toBe("new");
  });

  it("without previous it writes whatever is there", async () => {
    const { handler, stored } = makeWorld({ "mod-a.protocol": GOOD }, { "mod-a.protocol": "now" });
    await write(handler, payload({ value: "new" }));
    expect(stored.get("mod-a.protocol")).toBe("new");
  });

  it("refuses a setting that is not a registered world setting of the type String without config", async () => {
    const cases: Array<[SettingInfo | undefined, string]> = [
      [undefined, "is not registered"],
      [{ scope: "client", type: "String", config: false }, "is not a world setting"],
      [{ scope: "world", type: "other", config: false }, "is not of the type String"],
      [{ scope: "world", type: "String", config: true }, "is shown in the hub"],
    ];
    for (const [info, message] of cases) {
      const { handler, set } = makeWorld(info ? { "mod-a.protocol": info } : {});
      await expect(write(handler, payload())).rejects.toThrow(message);
      expect(set).not.toHaveBeenCalled();
    }
  });

  it("lets the message of Foundry through when writing fails", async () => {
    const { handler, environment } = makeWorld();
    (environment.set as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("permission denied"));
    await expect(write(handler, payload({ value: "x" }))).rejects.toThrow("permission denied");
  });
});

describe("setting.write: the rights", () => {
  const table = serializeRightsTable({ version: 1, modules: { "mod-a": { p1: "own", p2: "all" } } });
  const gate = createRightsGate({
    storedTable: () => table,
    isGm: (userId) => (["gm", "assistant"].includes(userId) ? true : ["p1", "p2", "p3"].includes(userId) ? false : undefined),
    ownership: async () => "own",
  });
  const { handler } = makeWorld();
  const check = (userId: string) => gate.check({ module: "mod-a", user: { id: userId }, targets: [], gmOnly: handler.gmOnly });

  it("refuses a player whatever the level and allows a Gamemaster and an Assistant", async () => {
    for (const userId of ["p1", "p2", "p3"]) {
      expect(await check(userId), userId).toEqual({ ok: false, detail: "this request may only be made by a Gamemaster or Assistant" });
    }
    for (const userId of ["gm", "assistant"]) expect(await check(userId), userId).toEqual({ ok: true });
  });
});

describe("NO_SETTINGS", () => {
  it("knows no setting and cannot write", async () => {
    expect(NO_SETTINGS.info("a", "b")).toBeUndefined();
    expect(NO_SETTINGS.get("a", "b")).toBeUndefined();
    await expect(NO_SETTINGS.set("a", "b", "c")).rejects.toThrow("without Foundry");
    expect(Object.isFrozen(NO_SETTINGS)).toBe(true);
  });
});

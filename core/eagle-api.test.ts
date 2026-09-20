import { describe, expect, it, vi } from "vitest";
import { createEagleApi } from "./eagle-api";
import { ModuleRegistry, type ModuleInfo, type ModuleInfoSource } from "./module-registry";
import { createRequestKernel, type RequestHandler, type RequestKernel } from "./request-kernel";
import { createRequestRelay, type RelayEnvironment } from "./request-relay";
import type { RightsLevel } from "./rights-table";
import type { SystemInfo } from "./system-guard";

const API = "0.1.0";

function makeSource(): ModuleInfoSource {
  const modules = new Map<string, ModuleInfo>([
    ["mod-a", { id: "mod-a", title: "Module A", version: "1.2.3", active: true }],
  ]);
  return { get: (id) => modules.get(id) };
}

function makeLogger() {
  return { info: vi.fn(), warn: vi.fn() };
}

describe("createEagleApi", () => {
  it("is frozen and exposes exactly version, registerModule, request, getRights and getSystemInfo", () => {
    const api = createEagleApi(new ModuleRegistry(makeSource(), API), makeLogger());

    expect(Object.isFrozen(api)).toBe(true);
    expect(Object.keys(api).sort()).toEqual(["getRights", "getSystemInfo", "registerModule", "request", "version"]);
  });

  it("reports the API version of the registry", () => {
    const registry = new ModuleRegistry(makeSource(), API);
    const api = createEagleApi(registry, makeLogger());

    expect(api.version).toBe(registry.apiVersion);
    expect(api.version).toBe("0.1.0");
  });

  it("logs success via info and rejection via warn, and passes results through unchanged", () => {
    const log = makeLogger();
    const api = createEagleApi(new ModuleRegistry(makeSource(), API), log);
    const reference = new ModuleRegistry(makeSource(), API);
    const descriptor = { id: "mod-a", apiVersion: API };

    const first = api.registerModule(descriptor);
    expect(first).toEqual(reference.registerModule(descriptor));
    expect(log.info).toHaveBeenCalledTimes(1);
    expect(log.info.mock.calls[0][0]).toContain("mod-a");
    expect(log.warn).not.toHaveBeenCalled();

    const second = api.registerModule(descriptor);
    expect(second).toEqual(reference.registerModule(descriptor));
    expect(second).toMatchObject({ ok: false, reason: "already-registered" });
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn.mock.calls[0][0]).toContain("already-registered");
  });

  it("never throws: unexpected errors become internal-error and are logged", () => {
    const log = makeLogger();
    const failingSource: ModuleInfoSource = {
      get: () => {
        throw new Error("boom");
      },
    };
    const api = createEagleApi(new ModuleRegistry(failingSource, API), log);

    const result = api.registerModule({ id: "mod-a", apiVersion: API });
    expect(result).toEqual({ ok: false, reason: "internal-error", detail: "boom" });
    expect(log.warn).toHaveBeenCalledTimes(1);

    const throwingGetter = {
      get id(): string {
        throw new Error("getter");
      },
      apiVersion: API,
    };
    const second = api.registerModule(throwingGetter);
    expect(second).toMatchObject({ ok: false, reason: "internal-error", detail: "getter" });
    expect(log.warn).toHaveBeenCalledTimes(2);
  });

  it("returns the kernel's result for a request, logs a failure via warn but not a success, and never rejects", async () => {
    const log = makeLogger();
    const registry = new ModuleRegistry(makeSource(), API);
    registry.registerModule({ id: "mod-a", apiVersion: API });
    const api = createEagleApi(registry, log);

    const ok = await api.request({ module: "mod-a", type: "flightcontrol.ping", payload: { echo: "x" } });
    expect(ok).toEqual({ ok: true, value: { apiVersion: API, module: "mod-a", echo: "x" } });
    expect(log.warn).not.toHaveBeenCalled();
    expect(log.info).not.toHaveBeenCalled();

    const unknown = await api.request({ module: "mod-a", type: "nope.nothing" });
    expect(unknown).toMatchObject({ ok: false, reason: "unknown-request" });
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn.mock.calls[0][0]).toContain("unknown-request");
    expect(log.warn.mock.calls[0][0]).toContain("mod-a");

    const throwingKernel: RequestKernel = {
      execute: () => {
        throw new Error("kernel down");
      },
    };
    const rejectingKernel: RequestKernel = { execute: () => Promise.reject(new Error("kernel later")) };
    for (const [kernel, detail] of [
      [throwingKernel, "kernel down"],
      [rejectingKernel, "kernel later"],
    ] as const) {
      const failing = createEagleApi(registry, log, kernel);
      await expect(failing.request({ module: "mod-a", type: "flightcontrol.ping" })).resolves.toEqual({
        ok: false,
        reason: "internal-error",
        detail,
      });
    }
    expect(log.warn).toHaveBeenCalledTimes(3);

    const throwingGetter = {
      get module(): string {
        throw new Error("getter");
      },
      type: "flightcontrol.ping",
    };
    await expect(api.request(throwingGetter)).resolves.toMatchObject({ ok: false });
  });

  it("works with the relay as its kernel: a relayed result comes back, and no-gm, relay-failed and relay-timeout are logged via warn but a success is not", async () => {
    const log = makeLogger();
    const registry = new ModuleRegistry(makeSource(), API);
    registry.registerModule({ id: "mod-a", apiVersion: API });
    const handlers: RequestHandler[] = [
      {
        type: "test.gm",
        versions: [1],
        runsOn: "gm",
        validate: (payload) => ({ ok: true, value: payload }),
        run: async () => ({ ran: "on the gm" }),
      },
    ];
    const apiFor = (environment: RelayEnvironment, timeoutMs?: number) => {
      const kernel = createRequestKernel(registry, handlers);
      return createEagleApi(registry, log, createRequestRelay({ kernel, handlers, registry, environment, log, timeoutMs }));
    };
    const player = (over: Partial<RelayEnvironment>): RelayEnvironment => ({
      isGm: () => false,
      hasGm: () => true,
      currentUserId: () => "p-1",
      newId: () => "request-id-0123456789",
      send: async () => ({ ok: true, value: { relayed: true } }),
      confirm: async (userId) => ({ confirmed: true, userId }),
      ...over,
    });
    const request = { module: "mod-a", type: "test.gm" };

    // a relayed success comes back and is not logged
    await expect(apiFor(player({})).request(request)).resolves.toEqual({ ok: true, value: { relayed: true } });
    expect(log.warn).not.toHaveBeenCalled();

    // the three relay failures come back with their reason and are logged
    const failures: Array<[string, RelayEnvironment, number | undefined]> = [
      ["no-gm", player({ hasGm: () => false }), undefined],
      ["relay-failed", player({ send: () => Promise.reject(new Error("socket closed")) }), undefined],
      ["relay-timeout", player({ send: () => new Promise(() => undefined) }), 10],
    ];
    for (const [reason, environment, timeoutMs] of failures) {
      await expect(apiFor(environment, timeoutMs).request(request), reason).resolves.toMatchObject({ ok: false, reason });
    }
    expect(log.warn).toHaveBeenCalledTimes(3);
    expect(log.warn.mock.calls.map((call) => String(call[0]))).toEqual([
      expect.stringContaining("no-gm"),
      expect.stringContaining("relay-failed"),
      expect.stringContaining("relay-timeout"),
    ]);
  });
});

describe("getRights", () => {
  function registeredModules() {
    const modules = new Map<string, ModuleInfo>([
      ["mod-a", { id: "mod-a", title: "Module A", version: "1.2.3", active: true }],
      ["mod-b", { id: "mod-b", title: "Module B", version: "0.4.0", active: true }],
    ]);
    const registry = new ModuleRegistry({ get: (id) => modules.get(id) }, API);
    registry.registerModule({ id: "mod-a", apiVersion: API });
    registry.registerModule({ id: "mod-b", apiVersion: API });
    return { registry, modules };
  }

  it("gives the level the rights source names for a registered module, whatever the level is", () => {
    const { registry } = registeredModules();
    for (const level of ["denied", "own", "all"] as const) {
      const levelFor = vi.fn((): RightsLevel => level);
      const api = createEagleApi(registry, makeLogger(), undefined, { levelFor });

      expect(api.getRights("mod-a"), level).toEqual({ ok: true, value: { level } });
      expect(levelFor).toHaveBeenCalledWith("mod-a");
    }
  });

  it("answers invalid-request for a module id that is not text or is empty, and not-registered for a module that is unknown or no longer active, without asking the rights source", () => {
    const { registry, modules } = registeredModules();
    const levelFor = vi.fn((): RightsLevel => "all");
    const api = createEagleApi(registry, makeLogger(), undefined, { levelFor });
    modules.get("mod-b")!.active = false;

    for (const moduleId of [undefined, null, "", 5, {}, ["mod-a"]]) {
      expect(api.getRights(moduleId), JSON.stringify(moduleId)).toMatchObject({ ok: false, reason: "invalid-request" });
    }
    for (const moduleId of ["stranger", "mod-b"]) {
      expect(api.getRights(moduleId), moduleId).toMatchObject({ ok: false, reason: "not-registered" });
    }
    expect(levelFor).not.toHaveBeenCalled();
  });

  it("returns internal-error and logs a warning instead of throwing when the rights source fails, and answers denied when there is none", () => {
    const { registry } = registeredModules();
    const log = makeLogger();
    const failing = createEagleApi(registry, log, undefined, {
      levelFor: () => {
        throw new Error("settings not ready");
      },
    });

    expect(failing.getRights("mod-a")).toEqual({ ok: false, reason: "internal-error", detail: "settings not ready" });
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(String(log.warn.mock.calls[0][0])).toContain("settings not ready");

    expect(createEagleApi(registry, makeLogger()).getRights("mod-a")).toEqual({ ok: true, value: { level: "denied" } });
  });
});

describe("getSystemInfo", () => {
  const info = (over: Partial<SystemInfo> = {}): SystemInfo => ({
    id: "dnd5e",
    version: "5.3.3",
    status: "tested",
    testedVersions: ["5.3.3"],
    ...over,
  });
  const makeApi = (systemInfo?: () => SystemInfo, log = makeLogger()) =>
    createEagleApi(new ModuleRegistry(makeSource(), API), log, undefined, undefined, systemInfo);

  it("gives what the system function says as a result, asked again every time, and needs no registered module", () => {
    const answers = [info(), info({ version: "5.4.0", status: "untested" })];
    let asked = 0;
    const systemInfo = vi.fn(() => answers[asked++]);
    const api = makeApi(systemInfo);

    expect(api.getSystemInfo()).toEqual({ ok: true, value: info() });
    expect(api.getSystemInfo()).toEqual({ ok: true, value: info({ version: "5.4.0", status: "untested" }) });
    expect(systemInfo).toHaveBeenCalledTimes(2);
  });

  it("returns internal-error and logs a warning instead of throwing when the system function fails", () => {
    const log = makeLogger();
    const api = makeApi(() => {
      throw new Error("system not ready");
    }, log);

    expect(api.getSystemInfo()).toEqual({ ok: false, reason: "internal-error", detail: "system not ready" });
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(String(log.warn.mock.calls[0][0])).toContain("system not ready");
  });

  it("answers unknown when there is no system function", () => {
    expect(makeApi().getSystemInfo()).toEqual({
      ok: true,
      value: { id: null, version: null, status: "unknown", testedVersions: [] },
    });
  });
});

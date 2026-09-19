import { describe, expect, it, vi } from "vitest";
import { createEagleApi } from "./eagle-api";
import { ModuleRegistry, type ModuleInfo, type ModuleInfoSource } from "./module-registry";
import type { RequestKernel } from "./request-kernel";

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
  it("is frozen and exposes exactly version, registerModule and request", () => {
    const api = createEagleApi(new ModuleRegistry(makeSource(), API), makeLogger());

    expect(Object.isFrozen(api)).toBe(true);
    expect(Object.keys(api).sort()).toEqual(["registerModule", "request", "version"]);
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
});

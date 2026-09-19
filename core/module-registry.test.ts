import { describe, expect, it, vi } from "vitest";
import { defaultModuleInfoSource, ModuleRegistry, type ModuleInfo, type ModuleInfoSource } from "./module-registry";

const API = "0.1.0";

type TestSource = ModuleInfoSource & { setActive(id: string, active: boolean): void };

function makeSource(): TestSource {
  const modules = new Map<string, ModuleInfo>(
    [
      { id: "mod-a", title: "Module A", version: "1.2.3", active: true },
      { id: "mod-b", title: "Module B", version: "0.4.0", active: true },
      { id: "mod-off", title: "Module Off", version: "1.0.0", active: false },
    ].map((m) => [m.id, m]),
  );
  return {
    get: (id) => modules.get(id),
    setActive: (id, active) => {
      const entry = modules.get(id);
      if (entry) entry.active = active;
    },
  };
}

describe("ModuleRegistry.registerModule", () => {
  it("registers a compatible active module and takes title and version from the source", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    const result = registry.registerModule({ id: "mod-a", apiVersion: API });

    expect(result).toEqual({
      ok: true,
      module: { id: "mod-a", title: "Module A", version: "1.2.3", apiVersion: API },
    });
    expect(registry.list().map((m) => m.id)).toEqual(["mod-a"]);
  });

  it("rejects a second registration of the same id and keeps the first", () => {
    const registry = new ModuleRegistry(makeSource(), API);
    const first = registry.registerModule({ id: "mod-a", apiVersion: API });

    const second = registry.registerModule({ id: "mod-a", apiVersion: API });

    expect(second).toMatchObject({ ok: false, reason: "already-registered" });
    expect(registry.list()).toHaveLength(1);
    expect(registry.list()[0]).toEqual(first.ok ? first.module : undefined);
  });

  it("rejects an unknown module id and stores nothing", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    expect(registry.registerModule({ id: "nope", apiVersion: API })).toMatchObject({
      ok: false,
      reason: "unknown-module",
    });
    expect(registry.list()).toEqual([]);
  });

  it("rejects an inactive module and stores nothing", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    expect(registry.registerModule({ id: "mod-off", apiVersion: API })).toMatchObject({
      ok: false,
      reason: "inactive-module",
    });
    expect(registry.list()).toEqual([]);
  });

  it("rejects invalid descriptors", () => {
    const registry = new ModuleRegistry(makeSource(), API);
    const invalid: unknown[] = [
      null,
      undefined,
      "mod-a",
      42,
      {},
      { id: "", apiVersion: API },
      { id: 5, apiVersion: API },
      { id: "mod-a" },
      { id: "mod-a", apiVersion: 1 },
    ];

    for (const descriptor of invalid) {
      expect(registry.registerModule(descriptor), `descriptor ${JSON.stringify(descriptor)}`).toMatchObject({
        ok: false,
        reason: "invalid-descriptor",
      });
    }
    expect(registry.list()).toEqual([]);
  });

  it("rejects malformed apiVersion strings, and the constructor refuses a malformed provided version", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    for (const apiVersion of ["1.2", "latest", "0.1.0-beta"]) {
      expect(registry.registerModule({ id: "mod-a", apiVersion }), `apiVersion ${apiVersion}`).toMatchObject({
        ok: false,
        reason: "invalid-api-version",
      });
    }
    expect(() => new ModuleRegistry(makeSource(), "latest")).toThrow();
  });

  it("rejects an incompatible apiVersion, stores nothing and allows a later compatible registration", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    for (const apiVersion of ["9.0.0", "0.2.0", "0.1.1"]) {
      expect(registry.registerModule({ id: "mod-a", apiVersion }), `apiVersion ${apiVersion}`).toMatchObject({
        ok: false,
        reason: "incompatible-api-version",
      });
    }
    expect(registry.list()).toEqual([]);

    expect(registry.registerModule({ id: "mod-a", apiVersion: API })).toMatchObject({ ok: true });
  });

  it("lists in registration order, only modules that are active right now, and returns a copy", () => {
    const source = makeSource();
    const registry = new ModuleRegistry(source, API);
    registry.registerModule({ id: "mod-a", apiVersion: API });
    registry.registerModule({ id: "mod-b", apiVersion: API });
    expect(registry.list().map((m) => m.id)).toEqual(["mod-a", "mod-b"]);

    source.setActive("mod-a", false);
    expect(registry.list().map((m) => m.id)).toEqual(["mod-b"]);

    registry.list().push({ id: "x", title: "x", version: "0", apiVersion: API });
    expect(registry.list().map((m) => m.id)).toEqual(["mod-b"]);

    source.setActive("mod-a", true);
    expect(registry.list().map((m) => m.id)).toEqual(["mod-a", "mod-b"]);
  });

  it("ignores additional descriptor fields", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    const result = registry.registerModule({ id: "mod-a", apiVersion: API, ui: { tab: true }, extra: 1 });

    expect(result.ok).toBe(true);
    expect(result.ok ? Object.keys(result.module) : []).toEqual(["id", "title", "version", "apiVersion"]);
  });
});

describe("ModuleRegistry open action", () => {
  it("accepts an optional open function and exposes it on the registered module and in list()", () => {
    const registry = new ModuleRegistry(makeSource(), API);
    const open = () => undefined;

    const result = registry.registerModule({ id: "mod-a", apiVersion: API, open });

    expect(result.ok).toBe(true);
    expect(result.ok ? result.module.open : undefined).toBe(open);
    expect(registry.list()[0].open).toBe(open);
  });

  it("rejects an open value that is not a function and stores nothing", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    for (const open of ["go", {}, 42, null]) {
      expect(registry.registerModule({ id: "mod-a", apiVersion: API, open }), `open ${JSON.stringify(open)}`).toMatchObject({
        ok: false,
        reason: "invalid-descriptor",
      });
    }
    expect(registry.list()).toEqual([]);
  });

  it("leaves entries without open free of an open property", () => {
    const registry = new ModuleRegistry(makeSource(), API);

    registry.registerModule({ id: "mod-a", apiVersion: API });
    registry.registerModule({ id: "mod-b", apiVersion: API, open: undefined });

    for (const entry of registry.list()) {
      expect("open" in entry).toBe(false);
      expect(Object.keys(entry)).toEqual(["id", "title", "version", "apiVersion"]);
    }
  });
});

describe("defaultModuleInfoSource (real game.modules shape)", () => {
  it("adapts a Collection-like game.modules.get and reports missing modules as undefined", () => {
    const packages: Record<string, { id: string; title: string; version: string; active: boolean }> = {
      "mod-a": { id: "mod-a", title: "Module A", version: "1.0.0", active: true },
      "mod-b": { id: "mod-b", title: "Module B", version: "2.0.0", active: false },
    };
    vi.stubGlobal("game", { modules: { get: (id: string) => packages[id] } });
    try {
      const source = defaultModuleInfoSource();

      expect(source.get("mod-a")).toEqual({ id: "mod-a", title: "Module A", version: "1.0.0", active: true });
      expect(source.get("mod-b")).toEqual({ id: "mod-b", title: "Module B", version: "2.0.0", active: false });
      expect(source.get("missing")).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

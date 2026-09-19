import { describe, expect, it, vi } from "vitest";
import { buildHubModel, startModule } from "./hub-model";
import { ModuleRegistry, type ModuleInfo, type ModuleInfoSource, type RegisteredModule } from "./module-registry";

const API = "0.2.0";

type TestSource = ModuleInfoSource & { setActive(id: string, active: boolean): void };

function makeSource(): TestSource {
  const modules = new Map<string, ModuleInfo>(
    [
      { id: "mod-a", title: "Module A", version: "1.2.3", active: true },
      { id: "mod-b", title: "Module B", version: "0.4.0", active: true },
      { id: "mod-c", title: "", version: "2.0.0", active: true },
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

function entry(registry: ModuleRegistry, id: string, open?: () => void | Promise<void>): RegisteredModule {
  const result = registry.registerModule({ id, apiVersion: API, open });
  if (!result.ok) throw new Error(`test setup: ${result.reason}`);
  return result.module;
}

describe("buildHubModel", () => {
  it("builds one tab per registered module in registration order, labelled with the module title", () => {
    const registry = new ModuleRegistry(makeSource(), API);
    entry(registry, "mod-a");
    entry(registry, "mod-b");
    entry(registry, "mod-c");

    const model = buildHubModel(registry.list());

    expect(model.tabs).toEqual([
      { id: "mod-a", label: "Module A" },
      { id: "mod-b", label: "Module B" },
      { id: "mod-c", label: "mod-c" }, // empty title falls back to the id
    ]);
    expect(model.empty).toBe(false);
  });

  it("gives no tab to a module that is not active any more", () => {
    const source = makeSource();
    const registry = new ModuleRegistry(source, API);
    entry(registry, "mod-a");
    entry(registry, "mod-b");
    expect(buildHubModel(registry.list()).tabs.map((t) => t.id)).toEqual(["mod-a", "mod-b"]);

    source.setActive("mod-a", false);

    expect(buildHubModel(registry.list()).tabs.map((t) => t.id)).toEqual(["mod-b"]);
  });

  it("keeps the previous active tab if it still exists, otherwise the first, and reports an empty hub", () => {
    const registry = new ModuleRegistry(makeSource(), API);
    entry(registry, "mod-a");
    entry(registry, "mod-b");
    const modules = registry.list();

    expect(buildHubModel(modules, "mod-b").activeTabId).toBe("mod-b");
    expect(buildHubModel(modules, "gone").activeTabId).toBe("mod-a");
    expect(buildHubModel(modules, null).activeTabId).toBe("mod-a");
    expect(buildHubModel(modules).activeTabId).toBe("mod-a");

    const empty = buildHubModel([], "mod-a");
    expect(empty).toEqual({ tabs: [], activeTabId: null, empty: true });
  });
});

describe("startModule", () => {
  it("calls the open action exactly once without arguments and reports ok, for sync and async actions", async () => {
    const registry = new ModuleRegistry(makeSource(), API);
    const syncOpen = vi.fn();
    const asyncOpen = vi.fn(async () => {
      await Promise.resolve();
    });

    expect(await startModule(entry(registry, "mod-a", syncOpen))).toEqual({ ok: true });
    expect(syncOpen).toHaveBeenCalledTimes(1);
    expect(syncOpen).toHaveBeenCalledWith();

    expect(await startModule(entry(registry, "mod-b", asyncOpen))).toEqual({ ok: true });
    expect(asyncOpen).toHaveBeenCalledTimes(1);
  });

  it("reports no-open-action for a module without an open action", async () => {
    const registry = new ModuleRegistry(makeSource(), API);

    const result = await startModule(entry(registry, "mod-a"));

    expect(result).toMatchObject({ ok: false, reason: "no-open-action" });
  });

  it("never rejects: a throwing or rejecting open action becomes open-failed with a detail", async () => {
    const registry = new ModuleRegistry(makeSource(), API);
    const throwing = entry(registry, "mod-a", () => {
      throw new Error("boom");
    });
    const rejecting = entry(registry, "mod-b", () => Promise.reject(new Error("later")));
    const oddThrow = entry(registry, "mod-c", () => {
      throw "plain text";
    });

    expect(await startModule(throwing)).toEqual({ ok: false, reason: "open-failed", detail: "boom" });
    expect(await startModule(rejecting)).toEqual({ ok: false, reason: "open-failed", detail: "later" });
    expect(await startModule(oddThrow)).toEqual({ ok: false, reason: "open-failed", detail: "plain text" });
  });
});

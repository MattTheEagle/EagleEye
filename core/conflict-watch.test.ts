import { describe, expect, it, vi } from "vitest";
import { watchForConflicts, isLibWrapperActive, type HooksLike, type ModulesLike } from "./conflict-watch";

function makeModules(active: boolean): ModulesLike {
  return { get: () => (active ? { active: true } : undefined) };
}

function makeHooks(): HooksLike & { trigger(hook: string, ...args: unknown[]): void } {
  const listeners = new Map<string, ((...args: unknown[]) => void)[]>();
  return {
    on(hook, callback) {
      listeners.set(hook, [...(listeners.get(hook) ?? []), callback]);
      return undefined;
    },
    trigger(hook, ...args) {
      for (const cb of listeners.get(hook) ?? []) cb(...args);
    },
  };
}

describe("isLibWrapperActive", () => {
  it("is true only when lib-wrapper module is active", () => {
    expect(isLibWrapperActive(makeModules(true))).toBe(true);
    expect(isLibWrapperActive(makeModules(false))).toBe(false);
  });
});

describe("watchForConflicts", () => {
  it("reports a simulated libWrapper.ConflictDetected event correctly", () => {
    const hooks = makeHooks();
    const onConflict = vi.fn();

    watchForConflicts(onConflict, { hooks, modules: makeModules(true) });
    hooks.trigger("libWrapper.ConflictDetected", "module-a", "module-b", "Actor.prototype.rollAbilityTest", [
      "Actor.prototype.rollAbilityTest",
    ]);

    expect(onConflict).toHaveBeenCalledWith({
      source: "libWrapper.ConflictDetected",
      packageA: "module-a",
      packageB: "module-b",
      wrapperName: "Actor.prototype.rollAbilityTest",
      targets: ["Actor.prototype.rollAbilityTest"],
    });
  });

  it("registers nothing and does not throw when lib-wrapper is absent", () => {
    const hooks = makeHooks();
    const onConflict = vi.fn();

    expect(() => watchForConflicts(onConflict, { hooks, modules: makeModules(false) })).not.toThrow();
    hooks.trigger("libWrapper.ConflictDetected", "a", "b", "x", ["x"]);

    expect(onConflict).not.toHaveBeenCalled();
  });
});

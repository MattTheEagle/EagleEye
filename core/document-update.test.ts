import { describe, expect, it, vi } from "vitest";
import {
  createDocumentUpdateHandler,
  UPDATABLE_DOCUMENT_TYPES,
  NO_UPDATES,
  type DocumentUpdateEnvironment,
  type UpdateTarget,
} from "./document-update";
import type { JsonValue } from "./json-value";
import type { RegisteredModule } from "./module-registry";
import { createRightsGate } from "./request-rights";
import { serializeRightsTable } from "./rights-table";

const MODULE: RegisteredModule = { id: "eagle-homebrew", title: "Eagle Homebrew", version: "0.0.1", apiVersion: "0.14.0" };
const UUID = "Item.AAAAAAAAAAAAAAAA";

function makeWorld(over: { target?: Partial<UpdateTarget> | null; mutateChangesTo?: Record<string, JsonValue> } = {}) {
  const target: UpdateTarget | undefined =
    over.target === null ? undefined : { documentName: "Item", locked: false, primary: true, ...over.target };
  // `mutateChangesTo`, when given, replaces the contents of the `changes` object in place — the same thing Foundry's
  // own `Document#update` was found to do live (M6 live check): it expands the given partial update into the
  // document's full diff shape (`_id`, `type`, `system`, ...), mutating the object the handler passed in.
  const update = vi.fn(async (_uuid: string, changes: Readonly<Record<string, JsonValue>>): Promise<void> => {
    if (!over.mutateChangesTo) return;
    const mutable = changes as Record<string, JsonValue>;
    for (const key of Object.keys(mutable)) delete mutable[key];
    Object.assign(mutable, over.mutateChangesTo);
  });
  const environment: DocumentUpdateEnvironment = {
    target: vi.fn(async () => target),
    update,
  };
  return { update, environment, handler: createDocumentUpdateHandler(environment) };
}

const payload = (over: Record<string, unknown> = {}) => ({ uuid: UUID, changes: { name: "Renamed" }, ...over });
const run = (handler: ReturnType<typeof makeWorld>["handler"], p: unknown, module = MODULE) => {
  const checked = handler.validate(p);
  if (!checked.ok) throw new Error(`test setup: ${checked.detail}`);
  return handler.run(checked.value, { module, user: { id: "gm" } });
};

describe("document.update: the definition", () => {
  it("is version 1, runs on the Gamemaster's client, is for a Gamemaster or Assistant only and names its target", () => {
    const { handler } = makeWorld();
    expect(handler.type).toBe("document.update");
    expect(handler.versions).toEqual([1]);
    expect(handler.runsOn).toBe("gm");
    expect(handler.gmOnly).toBe(true);
    expect([...UPDATABLE_DOCUMENT_TYPES]).toEqual(["Actor", "Item", "JournalEntry", "RollTable"]);
    const checked = handler.validate(payload());
    if (!checked.ok) throw new Error("unreachable");
    expect(handler.targets?.(checked.value)).toEqual([UUID]);
  });
});

describe("document.update: the payload", () => {
  const { handler } = makeWorld();

  it("accepts a uuid and changes, and hands on the checked values only", () => {
    expect(handler.validate({ ...payload(), extra: 1 })).toEqual({ ok: true, value: { uuid: UUID, changes: { name: "Renamed" } } });
    expect(handler.validate(payload({ changes: { "system.activities.abc.attack.ability": "str", name: "X" } }))).toMatchObject({ ok: true });
  });

  it("rejects a payload that is not an object", () => {
    for (const bad of [undefined, null, "text", 5, true, [], [payload()]]) expect(handler.validate(bad), JSON.stringify(bad)).toMatchObject({ ok: false });
  });

  it("rejects a uuid that is empty, not a string, or too long", () => {
    for (const uuid of [undefined, "", 5, "x".repeat(201)]) {
      expect(handler.validate(payload({ uuid })), String(uuid)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.uuid") });
    }
  });

  it("rejects changes that are not an object, are empty, or hold too many paths", () => {
    for (const changes of [undefined, null, "text", 5, [], {}]) {
      expect(handler.validate(payload({ changes })), JSON.stringify(changes)).toMatchObject({ ok: false, detail: expect.stringContaining("payload.changes") });
    }
    const many = Object.fromEntries(Array.from({ length: 51 }, (_, i) => [`field${i}`, "x"]));
    expect(handler.validate(payload({ changes: many }))).toMatchObject({ ok: false, detail: expect.stringContaining("50 paths") });
  });

  it("rejects a path whose first segment is _id, _stats or type", () => {
    for (const key of ["_id", "_stats", "type"]) {
      expect(handler.validate(payload({ changes: { [key]: "x" } })), key).toMatchObject({ ok: false, detail: expect.stringContaining("not allowed") });
      // A deeper path under a forbidden first segment is refused the same way.
      expect(handler.validate(payload({ changes: { [`${key}.nested`]: "x" } })), `${key}.nested`).toMatchObject({ ok: false });
    }
    // A path that only contains the word, not as its first segment, stays allowed.
    expect(handler.validate(payload({ changes: { "system.type.value": "martialM" } }))).toMatchObject({ ok: true });
  });

  it("rejects a change value that is not a JSON value", () => {
    expect(handler.validate(payload({ changes: { name: () => 1 } }))).toMatchObject({ ok: false, detail: expect.stringContaining("payload.changes") });
  });
});

describe("document.update: running", () => {
  it("applies the changes and answers with the uuid and the changed paths", async () => {
    const { handler, update } = makeWorld();
    expect(await run(handler, payload({ changes: { name: "Renamed", "system.activities.abc.attack.ability": "str" } }))).toEqual({
      uuid: UUID,
      changed: ["name", "system.activities.abc.attack.ability"],
    });
    expect(update).toHaveBeenCalledWith(UUID, { name: "Renamed", "system.activities.abc.attack.ability": "str" });
  });

  it("answers with the originally requested paths even when the environment mutates the changes object in place (M6 live-check finding)", async () => {
    const { handler } = makeWorld({ mutateChangesTo: { _id: "x", type: "loot", system: { weight: { value: 12 } } } });
    expect(await run(handler, payload({ changes: { "system.weight.value": 12 } }))).toEqual({
      uuid: UUID,
      changed: ["system.weight.value"],
    });
  });

  it("is safe to ask again: applying the same changes twice calls update twice, with no separate outcome", async () => {
    const { handler, update } = makeWorld();
    await run(handler, payload());
    await run(handler, payload());
    expect(update).toHaveBeenCalledTimes(2);
  });

  it("refuses a document that does not exist, is not primary, is locked, or holds another document type", async () => {
    const cases: Array<[Parameters<typeof makeWorld>[0], string]> = [
      [{ target: null }, "does not exist"],
      [{ target: { primary: false } }, "not a primary document"],
      [{ target: { locked: true } }, "is locked"],
      [{ target: { documentName: "Scene" } }, "cannot be updated"],
    ];
    for (const [over, message] of cases) {
      const { handler, update } = makeWorld(over);
      await expect(run(handler, payload())).rejects.toThrow(message);
      expect(update).not.toHaveBeenCalled();
    }
  });

  it("lets the message of Foundry through when updating fails", async () => {
    const { handler, environment } = makeWorld();
    (environment.update as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("permission denied"));
    await expect(run(handler, payload())).rejects.toThrow("permission denied");
  });
});

describe("document.update: the rights", () => {
  const table = serializeRightsTable({ version: 1, modules: { "eagle-homebrew": { p1: "own", p2: "all" } } });
  const gate = createRightsGate({
    storedTable: () => table,
    isGm: (userId) => (["gm", "assistant"].includes(userId) ? true : ["p1", "p2", "p3"].includes(userId) ? false : undefined),
    ownership: async () => "own",
  });
  const { handler } = makeWorld();
  const check = (userId: string) => gate.check({ module: "eagle-homebrew", user: { id: userId }, targets: [], gmOnly: handler.gmOnly });

  it("refuses a player whatever the level and allows a Gamemaster and an Assistant", async () => {
    for (const userId of ["p1", "p2", "p3"]) expect(await check(userId), userId).toEqual({ ok: false, detail: "this request may only be made by a Gamemaster or Assistant" });
    for (const userId of ["gm", "assistant"]) expect(await check(userId), userId).toEqual({ ok: true });
  });
});

describe("NO_UPDATES", () => {
  it("knows no target and cannot update", async () => {
    expect(await NO_UPDATES.target(UUID)).toBeUndefined();
    await expect(NO_UPDATES.update(UUID, { name: "x" })).rejects.toThrow("without Foundry");
    expect(Object.isFrozen(NO_UPDATES)).toBe(true);
  });
});

import { describe, expect, it, vi } from "vitest";
import { NO_COMPENDIUMS } from "./compendium-handlers";
import { NO_DOCUMENTS } from "./document-create";
import { NO_IMPORTS } from "./document-import";
import { NO_FLAGS } from "./flag-write";
import { NO_SETTINGS } from "./setting-write";
import type { RegisteredModule } from "./module-registry";
import { defaultRequestHandlers, type Executor } from "./request-handlers";

const API = "0.6.0";
const MODULE: RegisteredModule = { id: "mod-a", title: "Module A", version: "1.0.0", apiVersion: API };
const GM: Executor = { userId: "gm-1", isGm: true };

function find(type: string, executor: () => Executor = () => GM) {
  const handler = defaultRequestHandlers(API, executor, NO_COMPENDIUMS, NO_IMPORTS, NO_SETTINGS, NO_FLAGS, NO_DOCUMENTS).find((h) => h.type === type);
  if (!handler) throw new Error(`test setup: ${type} is missing`);
  return handler;
}

describe("flightcontrol.ping", () => {
  it("validates the payload and answers with apiVersion, module and echo", async () => {
    const handler = find("flightcontrol.ping");

    // accepted payloads
    for (const payload of [undefined, null, {}, { echo: null }, { echo: undefined }]) {
      expect(handler.validate(payload), `payload ${JSON.stringify(payload)}`).toEqual({ ok: true, value: { echo: null } });
    }
    const check = handler.validate({ echo: "hello", ignored: 1 });
    expect(check).toEqual({ ok: true, value: { echo: "hello" } });
    expect(handler.validate({ echo: "x".repeat(200) })).toMatchObject({ ok: true });

    // rejected payloads: not an object, echo not text, echo too long
    for (const payload of ["text", 5, true, [], { echo: 5 }, { echo: {} }, { echo: "x".repeat(201) }]) {
      expect(handler.validate(payload), `payload ${JSON.stringify(payload)}`).toMatchObject({ ok: false });
    }

    // the answer
    if (!check.ok) throw new Error("unreachable");
    expect(await handler.run(check.value, { module: MODULE })).toEqual({ apiVersion: API, module: "mod-a", echo: "hello" });
    expect(await handler.run({ echo: null }, { module: MODULE })).toEqual({ apiVersion: API, module: "mod-a", echo: null });
  });
});

describe("flightcontrol.gmping", () => {
  it("runs on the Gamemaster's client, validates like ping and says who ran it", async () => {
    const executor = vi.fn(() => GM);
    const handler = find("flightcontrol.gmping", executor);
    const ping = find("flightcontrol.ping");

    expect(handler.runsOn).toBe("gm");
    expect(handler.versions).toEqual([1]);

    // the same payload rules as ping
    for (const payload of [undefined, null, {}, { echo: "x" }, { echo: "x".repeat(200) }]) {
      expect(handler.validate(payload), `payload ${JSON.stringify(payload)}`).toEqual(ping.validate(payload));
    }
    for (const payload of ["text", 5, [], { echo: 5 }, { echo: "x".repeat(201) }]) {
      expect(handler.validate(payload), `payload ${JSON.stringify(payload)}`).toMatchObject({ ok: false });
    }

    // the answer names the client that ran it, not the sender
    const check = handler.validate({ echo: "hello" });
    if (!check.ok) throw new Error("unreachable");
    expect(await handler.run(check.value, { module: MODULE })).toEqual({
      apiVersion: API,
      module: "mod-a",
      echo: "hello",
      ranBy: { userId: "gm-1", isGm: true },
      askedBy: null,
    });
    expect(executor).toHaveBeenCalledTimes(1);
  });

  it("names in askedBy the user the request runs for, and null when that user is not known", async () => {
    const handler = find("flightcontrol.gmping");

    const known = await handler.run({ echo: null }, { module: MODULE, user: { id: "p-7" } });
    const unknown = await handler.run({ echo: null }, { module: MODULE });

    expect(known).toMatchObject({ askedBy: "p-7", ranBy: { userId: "gm-1", isGm: true } });
    expect(unknown).toMatchObject({ askedBy: null });
  });
});

describe("flightcontrol.targetping", () => {
  const UUID = "Actor.abc123";

  it("runs on the Gamemaster's client, needs a text as uuid, and names that uuid as its only target", () => {
    const handler = find("flightcontrol.targetping");

    expect(handler.runsOn).toBe("gm");
    expect(handler.versions).toEqual([1]);

    expect(handler.validate({ uuid: UUID })).toEqual({ ok: true, value: { uuid: UUID } });
    expect(handler.validate({ uuid: UUID, ignored: 1 })).toEqual({ ok: true, value: { uuid: UUID } });
    expect(handler.validate({ uuid: "x".repeat(200) })).toMatchObject({ ok: true });
    for (const payload of [undefined, null, "text", 5, [], {}, { uuid: "" }, { uuid: 5 }, { uuid: null }, { uuid: "x".repeat(201) }]) {
      expect(handler.validate(payload), `payload ${JSON.stringify(payload)}`).toMatchObject({ ok: false });
    }

    const check = handler.validate({ uuid: UUID });
    if (!check.ok) throw new Error("unreachable");
    expect(handler.targets?.(check.value)).toEqual([UUID]);
  });

  it("answers with the target it was given and the user it ran for, and nothing about the document", async () => {
    const handler = find("flightcontrol.targetping");

    expect(await handler.run({ uuid: UUID }, { module: MODULE, user: { id: "p-7" } })).toEqual({
      apiVersion: API,
      module: "mod-a",
      uuid: UUID,
      askedBy: "p-7",
    });
    expect(await handler.run({ uuid: UUID }, { module: MODULE })).toEqual({
      apiVersion: API,
      module: "mod-a",
      uuid: UUID,
      askedBy: null,
    });
  });
});

describe("defaultRequestHandlers", () => {
  it("offers exactly eight request types; the two that run on the Gamemaster's client and name no or a target are the proofs, compendium.create, compendium.import, setting.write, compendium.flag and document.create are for a Gamemaster or Assistant only", () => {
    const handlers = defaultRequestHandlers(API, () => GM, NO_COMPENDIUMS, NO_IMPORTS, NO_SETTINGS, NO_FLAGS, NO_DOCUMENTS);

    expect(handlers.map((h) => [h.type, h.versions, h.runsOn ?? "caller"])).toEqual([
      ["flightcontrol.ping", [1], "caller"],
      ["flightcontrol.gmping", [1], "gm"],
      ["flightcontrol.targetping", [1], "gm"],
      ["compendium.create", [1], "gm"],
      ["compendium.import", [1], "gm"],
      ["setting.write", [1], "gm"],
      ["compendium.flag", [1], "gm"],
      ["document.create", [1], "gm"],
    ]);
    // A handler that runs with Gamemaster rights needs the Apply of its milestone; one that acts on documents names them.
    expect(handlers.filter((h) => h.runsOn === "gm").map((h) => h.type)).toEqual([
      "flightcontrol.gmping",
      "flightcontrol.targetping",
      "compendium.create",
      "compendium.import",
      "setting.write",
      "compendium.flag",
      "document.create",
    ]);
    expect(handlers.filter((h) => h.targets !== undefined).map((h) => h.type)).toEqual(["flightcontrol.targetping", "compendium.import"]);
    // Only a type that changes the world is for a Gamemaster or Assistant only.
    expect(handlers.filter((h) => h.gmOnly === true).map((h) => h.type)).toEqual([
      "compendium.create",
      "compendium.import",
      "setting.write",
      "compendium.flag",
      "document.create",
    ]);
  });
});

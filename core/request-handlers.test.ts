import { describe, expect, it, vi } from "vitest";
import type { RegisteredModule } from "./module-registry";
import { defaultRequestHandlers, type Executor } from "./request-handlers";

const API = "0.4.0";
const MODULE: RegisteredModule = { id: "mod-a", title: "Module A", version: "1.0.0", apiVersion: API };
const GM: Executor = { userId: "gm-1", isGm: true };

function find(type: string, executor: () => Executor = () => GM) {
  const handler = defaultRequestHandlers(API, executor).find((h) => h.type === type);
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
    });
    expect(executor).toHaveBeenCalledTimes(1);
  });
});

describe("defaultRequestHandlers", () => {
  it("offers exactly two request types, and only flightcontrol.gmping runs on the Gamemaster's client", () => {
    const handlers = defaultRequestHandlers(API, () => GM);

    expect(handlers.map((h) => [h.type, h.versions, h.runsOn ?? "caller"])).toEqual([
      ["flightcontrol.ping", [1], "caller"],
      ["flightcontrol.gmping", [1], "gm"],
    ]);
    // A handler that runs with Gamemaster rights needs the Apply of its milestone and, if it changes data, milestone M6.
    expect(handlers.filter((h) => h.runsOn === "gm").map((h) => h.type)).toEqual(["flightcontrol.gmping"]);
  });
});

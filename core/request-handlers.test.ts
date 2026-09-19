import { describe, expect, it } from "vitest";
import type { RegisteredModule } from "./module-registry";
import { defaultRequestHandlers } from "./request-handlers";

const MODULE: RegisteredModule = { id: "mod-a", title: "Module A", version: "1.0.0", apiVersion: "0.3.0" };

function ping() {
  const handler = defaultRequestHandlers("0.3.0").find((h) => h.type === "flightcontrol.ping");
  if (!handler) throw new Error("test setup: flightcontrol.ping is missing");
  return handler;
}

describe("flightcontrol.ping", () => {
  it("validates the payload and answers with apiVersion, module and echo", async () => {
    const handler = ping();

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
    expect(await handler.run(check.value, { module: MODULE })).toEqual({ apiVersion: "0.3.0", module: "mod-a", echo: "hello" });
    expect(await handler.run({ echo: null }, { module: MODULE })).toEqual({ apiVersion: "0.3.0", module: "mod-a", echo: null });
  });
});

describe("defaultRequestHandlers", () => {
  it("offers exactly one request type, flightcontrol.ping in version 1", () => {
    const handlers = defaultRequestHandlers("0.3.0");

    expect(handlers.map((h) => [h.type, h.versions])).toEqual([["flightcontrol.ping", [1]]]);
  });
});

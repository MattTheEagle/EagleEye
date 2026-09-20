import { describe, expect, it, vi } from "vitest";
import type { JsonValue } from "./json-value";
import { ModuleRegistry, type ModuleInfo, type ModuleInfoSource } from "./module-registry";
import {
  createRequestKernel,
  findSender,
  parseEnvelope,
  type PayloadCheck,
  type RequestHandler,
  type RightsCheck,
} from "./request-kernel";

const API = "0.3.0";

type TestSource = ModuleInfoSource & { setActive(id: string, active: boolean): void };

function makeSource(): TestSource {
  const modules = new Map<string, ModuleInfo>(
    [
      { id: "mod-a", title: "Module A", version: "1.2.3", active: true },
      { id: "mod-b", title: "Module B", version: "0.4.0", active: true },
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

function makeRegistry(source: TestSource = makeSource()): ModuleRegistry {
  const registry = new ModuleRegistry(source, API);
  registry.registerModule({ id: "mod-a", apiVersion: API });
  registry.registerModule({ id: "mod-b", apiVersion: API });
  return registry;
}

function handler(overrides: Partial<RequestHandler<string>> = {}): RequestHandler<string> {
  return {
    type: "test.echo",
    versions: [1],
    validate: (payload): PayloadCheck<string> =>
      typeof payload === "string" ? { ok: true, value: payload.toUpperCase() } : { ok: false, detail: "expected text" },
    run: async (payload, context): Promise<JsonValue> => ({ shout: payload, by: context.module.id }),
    ...overrides,
  };
}

const envelope = (over: Record<string, unknown> = {}) => ({ module: "mod-a", type: "test.echo", payload: "hi", ...over });

describe("createRequestKernel", () => {
  it("throws on an invalid handler definition", () => {
    const registry = makeRegistry();
    const bad: Array<[string, RequestHandler[]]> = [
      ["type with upper case", [handler({ type: "Test.echo" })]],
      ["type without a dot", [handler({ type: "echo" })]],
      ["type with a dash", [handler({ type: "test.my-echo" })]],
      ["empty versions", [handler({ versions: [] })]],
      ["version zero", [handler({ versions: [0] })]],
      ["fractional version", [handler({ versions: [1.5] })]],
      ["negative version", [handler({ versions: [-1] })]],
      ["duplicate type", [handler(), handler()]],
      ["runsOn nowhere", [handler({ runsOn: "nowhere" as never })]],
    ];
    for (const [name, handlers] of bad) {
      expect(() => createRequestKernel(registry, handlers), name).toThrow();
    }
    expect(() => createRequestKernel(registry, [handler(), handler({ type: "test.other" })])).not.toThrow();
    expect(() =>
      createRequestKernel(registry, [handler({ runsOn: "caller" }), handler({ type: "test.other", runsOn: "gm" })]),
    ).not.toThrow();
  });
});

describe("parseEnvelope", () => {
  it("keeps exactly the four known fields and rejects a malformed envelope with invalid-request", () => {
    const full = parseEnvelope({ module: "mod-a", type: "test.echo", version: 2, payload: { a: [1] }, extra: () => 1 });
    expect(full).toEqual({ ok: true, value: { module: "mod-a", type: "test.echo", version: 2, payload: { a: [1] } } });

    // a version or payload that is given as undefined counts as absent
    const bare = parseEnvelope({ module: "mod-a", type: "test.echo", version: undefined, payload: undefined });
    if (!bare.ok) throw new Error("test setup: the bare envelope should be valid");
    expect(Object.keys(bare.value)).toEqual(["module", "type"]);

    const invalid: unknown[] = [
      null,
      "text",
      42,
      [],
      {},
      { module: "", type: "test.echo" },
      { module: "mod-a", type: "Test" },
      { module: "mod-a", type: "test.echo", version: 0 },
      { module: "mod-a", type: "test.echo", payload: () => 1 },
    ];
    for (const request of invalid) {
      expect(parseEnvelope(request), JSON.stringify(request)).toMatchObject({
        ok: false,
        failure: { ok: false, reason: "invalid-request" },
      });
    }
  });
});

describe("findSender", () => {
  it("finds a registered active sender and reports not-registered for an unknown or inactive one", () => {
    const source = makeSource();
    const registry = makeRegistry(source);

    expect(findSender(registry, "mod-a")).toMatchObject({ ok: true, value: { id: "mod-a" } });
    expect(findSender(registry, "stranger")).toMatchObject({ ok: false, failure: { ok: false, reason: "not-registered" } });

    source.setActive("mod-b", false);
    expect(findSender(registry, "mod-b")).toMatchObject({ ok: false, failure: { ok: false, reason: "not-registered" } });
  });
});

describe("RequestKernel.execute", () => {
  it("runs a valid request: validate sees the payload, run gets the checked value and the sender", async () => {
    const registry = makeRegistry();
    const validate = vi.fn(handler().validate);
    const run = vi.fn(handler().run);
    const kernel = createRequestKernel(registry, [handler({ validate, run })]);

    const result = await kernel.execute(envelope());

    expect(result).toEqual({ ok: true, value: { shout: "HI", by: "mod-a" } });
    expect(validate).toHaveBeenCalledWith("hi");
    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][0]).toBe("HI");
    expect(run.mock.calls[0][1].module).toMatchObject({ id: "mod-a", title: "Module A" });
  });

  it("rejects an invalid envelope with invalid-request", async () => {
    const kernel = createRequestKernel(makeRegistry(), [handler()]);
    const invalid: Array<[string, unknown]> = [
      ["null", null],
      ["text", "text"],
      ["number", 42],
      ["array", []],
      ["no module", { type: "test.echo" }],
      ["empty module", envelope({ module: "" })],
      ["module not text", envelope({ module: 5 })],
      ["no type", { module: "mod-a" }],
      ["type not text", envelope({ type: 5 })],
      ["type upper case", envelope({ type: "Test.echo" })],
      ["type without dot", envelope({ type: "test" })],
      ["version zero", envelope({ version: 0 })],
      ["version fractional", envelope({ version: 1.5 })],
      ["version text", envelope({ version: "1" })],
      ["version NaN", envelope({ version: Number.NaN })],
      ["payload function", envelope({ payload: () => 1 })],
      ["payload NaN", envelope({ payload: { a: Number.NaN } })],
      ["payload class instance", envelope({ payload: new Date() })],
    ];
    for (const [name, request] of invalid) {
      expect(await kernel.execute(request), name).toMatchObject({ ok: false, reason: "invalid-request" });
    }
  });

  it("reports not-registered for an unknown or inactive sender, before it looks at the request type", async () => {
    const source = makeSource();
    const kernel = createRequestKernel(makeRegistry(source), [handler()]);

    expect(await kernel.execute(envelope({ module: "stranger" }))).toMatchObject({ ok: false, reason: "not-registered" });
    expect(await kernel.execute(envelope({ module: "stranger", type: "nope.nothing" }))).toMatchObject({
      ok: false,
      reason: "not-registered",
    });

    source.setActive("mod-b", false);
    expect(await kernel.execute(envelope({ module: "mod-b" }))).toMatchObject({ ok: false, reason: "not-registered" });
  });

  it("reports unknown-request for a request type nobody offers", async () => {
    const kernel = createRequestKernel(makeRegistry(), [handler()]);

    expect(await kernel.execute(envelope({ type: "nope.nothing" }))).toMatchObject({ ok: false, reason: "unknown-request" });
  });

  it("treats a missing version as 1 and rejects unsupported versions with the supported ones named", async () => {
    const kernel = createRequestKernel(makeRegistry(), [handler({ versions: [1, 3] })]);

    expect((await kernel.execute(envelope())).ok).toBe(true);
    expect((await kernel.execute(envelope({ version: 1 }))).ok).toBe(true);
    expect((await kernel.execute(envelope({ version: 3 }))).ok).toBe(true);

    const result = await kernel.execute(envelope({ version: 2 }));
    expect(result).toMatchObject({ ok: false, reason: "unsupported-version" });
    expect(result.ok ? "" : result.detail).toContain("1, 3");
  });

  it("reports invalid-payload with the handler's detail and does not run the handler", async () => {
    const run = vi.fn(handler().run);
    const kernel = createRequestKernel(makeRegistry(), [handler({ run })]);

    const result = await kernel.execute(envelope({ payload: 5 }));

    expect(result).toEqual({ ok: false, reason: "invalid-payload", detail: "expected text" });
    expect(run).not.toHaveBeenCalled();
  });

  it("turns a throwing or rejecting validate or run into handler-failed and never rejects", async () => {
    const registry = makeRegistry();
    const cases: Array<[string, Partial<RequestHandler<string>>, string]> = [
      ["run throws", { run: () => { throw new Error("boom"); } }, "boom"],
      ["run rejects", { run: () => Promise.reject(new Error("later")) }, "later"],
      ["run throws text", { run: () => { throw "plain text"; } }, "plain text"],
      ["validate throws", { validate: () => { throw new Error("check failed"); } }, "check failed"],
    ];
    for (const [name, overrides, detail] of cases) {
      const kernel = createRequestKernel(registry, [handler(overrides)]);
      expect(await kernel.execute(envelope()), name).toEqual({ ok: false, reason: "handler-failed", detail });
    }
  });

  it("reports handler-failed when the handler's result is not a JSON value", async () => {
    const registry = makeRegistry();
    const results: unknown[] = [undefined, () => 1, Number.NaN, new Date(), { a: undefined }];
    for (const result of results) {
      const kernel = createRequestKernel(registry, [handler({ run: async () => result as JsonValue })]);
      const outcome = await kernel.execute(envelope());
      expect(outcome, String(result)).toMatchObject({ ok: false, reason: "handler-failed" });
      expect(outcome.ok ? "" : outcome.detail).toContain("JSON");
    }
  });

  it("reports internal-error instead of rejecting when the registry fails", async () => {
    const failingRegistry = {
      list: () => {
        throw new Error("registry down");
      },
    };
    const kernel = createRequestKernel(failingRegistry, [handler()]);

    expect(await kernel.execute(envelope())).toEqual({ ok: false, reason: "internal-error", detail: "registry down" });
  });

  it("gives the handler the user it runs for: the option wins over currentUser, and without either the user is unknown", async () => {
    const seen: unknown[] = [];
    const spy = handler({
      run: async (payload, context) => {
        seen.push(context.user);
        return { got: payload };
      },
    });
    const currentUser = () => ({ id: "local" });

    await createRequestKernel(makeRegistry(), [spy]).execute(envelope());
    await createRequestKernel(makeRegistry(), [spy], { currentUser }).execute(envelope());
    await createRequestKernel(makeRegistry(), [spy], { currentUser }).execute(envelope(), { user: { id: "asked" } });
    await createRequestKernel(makeRegistry(), [spy], { currentUser: () => undefined }).execute(envelope());

    expect(seen).toEqual([undefined, { id: "local" }, { id: "asked" }, undefined]);
  });
});

describe("RequestKernel rights", () => {
  const allow = { ok: true as const };
  const refuse = (detail: string) => ({ ok: false as const, detail });

  it("refuses a request the gate refuses with its detail, after the payload was checked and without running the handler", async () => {
    const validate = vi.fn(handler().validate);
    const run = vi.fn(handler().run);
    const refusing = createRequestKernel(makeRegistry(), [handler({ validate, run })], {
      rights: { check: async () => refuse('module "mod-a" may not be used by this user') },
    });

    expect(await refusing.execute(envelope())).toEqual({
      ok: false,
      reason: "not-permitted",
      detail: 'module "mod-a" may not be used by this user',
    });
    expect(validate).toHaveBeenCalledTimes(1);
    expect(run).not.toHaveBeenCalled();

    const allowing = createRequestKernel(makeRegistry(), [handler({ validate, run })], { rights: { check: async () => allow } });
    expect(await allowing.execute(envelope())).toEqual({ ok: true, value: { shout: "HI", by: "mod-a" } });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("gives the gate the module, the user and the targets the handler names, and none when it names none", async () => {
    const check = vi.fn(async (_request: RightsCheck) => allow);
    const targeted = handler({ type: "test.target", targets: (payload) => [`Actor.${payload}`, "Item.x"] });
    const kernel = createRequestKernel(makeRegistry(), [handler(), targeted], { rights: { check }, currentUser: () => ({ id: "local" }) });

    await kernel.execute(envelope({ module: "mod-b" }));
    await kernel.execute(envelope({ type: "test.target" }));

    // the targets are computed from the checked payload ("hi" became "HI")
    expect(check.mock.calls.map((call) => call[0])).toEqual([
      { module: "mod-b", user: { id: "local" }, targets: [] },
      { module: "mod-a", user: { id: "local" }, targets: ["Actor.HI", "Item.x"] },
    ]);
  });

  it("asks the gate about the user the request runs for: the option wins over currentUser, and without either the user is unknown", async () => {
    const seen: unknown[] = [];
    const check = vi.fn(async (request: { user: unknown }) => {
      seen.push(request.user);
      return allow;
    });
    const currentUser = () => ({ id: "local" });

    await createRequestKernel(makeRegistry(), [handler()], { rights: { check } }).execute(envelope());
    await createRequestKernel(makeRegistry(), [handler()], { rights: { check }, currentUser }).execute(envelope());
    await createRequestKernel(makeRegistry(), [handler()], { rights: { check }, currentUser }).execute(envelope(), {
      user: { id: "asked" },
    });

    expect(seen).toEqual([undefined, { id: "local" }, { id: "asked" }]);
  });

  it("refuses when the gate throws, rejects or answers with anything but { ok: true }, and never runs the handler", async () => {
    const answers: Array<[string, () => unknown, string]> = [
      ["throws", () => { throw new Error("gate down"); }, "the rights could not be checked"],
      ["rejects", () => Promise.reject(new Error("later")), "the rights could not be checked"],
      ["undefined", () => undefined, "the rights could not be checked"],
      ["null", () => null, "the rights could not be checked"],
      ["empty object", () => ({}), "the rights could not be checked"],
      ["ok as text", () => ({ ok: "yes" }), "the rights could not be checked"],
      ["ok as number", () => ({ ok: 1 }), "the rights could not be checked"],
      ["refusal without a detail", () => ({ ok: false }), "the rights could not be checked"],
      ["refusal with a detail that is not text", () => ({ ok: false, detail: 5 }), "the rights could not be checked"],
      ["refusal with a detail", () => ({ ok: false, detail: "no" }), "no"],
    ];
    for (const [name, answer, detail] of answers) {
      const run = vi.fn(handler().run);
      const kernel = createRequestKernel(makeRegistry(), [handler({ run })], { rights: { check: answer as never } });

      expect(await kernel.execute(envelope()), name).toEqual({ ok: false, reason: "not-permitted", detail });
      expect(run, name).not.toHaveBeenCalled();
    }
  });

  it("reports handler-failed without running the handler when targets throws or does not return a list of UUIDs, and refuses a targets that is not a function", async () => {
    const answers: Array<[string, () => unknown, string]> = [
      ["throws", () => { throw new Error("no targets"); }, "no targets"],
      ["text", () => "Actor.x", 'the targets of "test.echo" are not a list of UUIDs'],
      ["number in the list", () => [1], 'the targets of "test.echo" are not a list of UUIDs'],
      ["empty text in the list", () => [""], 'the targets of "test.echo" are not a list of UUIDs'],
      ["null", () => null, 'the targets of "test.echo" are not a list of UUIDs'],
      ["undefined", () => undefined, 'the targets of "test.echo" are not a list of UUIDs'],
    ];
    for (const [name, targets, detail] of answers) {
      const run = vi.fn(handler().run);
      const check = vi.fn(async () => allow);
      const kernel = createRequestKernel(makeRegistry(), [handler({ run, targets: targets as never })], { rights: { check } });

      expect(await kernel.execute(envelope()), name).toEqual({ ok: false, reason: "handler-failed", detail });
      expect(run, name).not.toHaveBeenCalled();
      expect(check, name).not.toHaveBeenCalled();
    }

    expect(() => createRequestKernel(makeRegistry(), [handler({ targets: "Actor.x" as never })])).toThrow("targets");
  });

  it("asks the gate only about requests that are otherwise valid: every earlier failure is answered without it", async () => {
    const source = makeSource();
    const check = vi.fn(async () => allow);
    const kernel = createRequestKernel(makeRegistry(source), [handler()], { rights: { check } });
    const earlier: Array<[string, unknown, string]> = [
      ["invalid envelope", { type: "test.echo" }, "invalid-request"],
      ["unknown sender", envelope({ module: "stranger" }), "not-registered"],
      ["unknown request type", envelope({ type: "nope.nothing" }), "unknown-request"],
      ["unsupported version", envelope({ version: 2 }), "unsupported-version"],
      ["invalid payload", envelope({ payload: 5 }), "invalid-payload"],
    ];

    for (const [name, request, reason] of earlier) {
      expect(await kernel.execute(request), name).toMatchObject({ ok: false, reason });
    }
    expect(check).not.toHaveBeenCalled();
  });
});

import { afterEach, describe, expect, it, vi } from "vitest";
import { ModuleRegistry, type ModuleInfo, type ModuleInfoSource } from "./module-registry";
import {
  createRequestKernel,
  type PayloadCheck,
  type RequestContext,
  type RequestHandler,
  type RequestKernel,
} from "./request-kernel";
import { createRequestRelay, MAX_RELAY_SIZE, RELAY_TIMEOUT_MS, type RelayEnvironment } from "./request-relay";

const API = "0.4.0";

function makeRegistry(): ModuleRegistry {
  const modules = new Map<string, ModuleInfo>([
    ["mod-a", { id: "mod-a", title: "Module A", version: "1.2.3", active: true }],
  ]);
  const source: ModuleInfoSource = { get: (id) => modules.get(id) };
  const registry = new ModuleRegistry(source, API);
  registry.registerModule({ id: "mod-a", apiVersion: API });
  return registry;
}

function handler(overrides: Partial<RequestHandler<string>> = {}): RequestHandler<string> {
  return {
    type: "test.local",
    versions: [1],
    validate: (payload): PayloadCheck<string> =>
      typeof payload === "string" ? { ok: true, value: payload } : { ok: false, detail: "expected text" },
    run: async (payload, context) => ({ said: payload, by: context.module.id }),
    ...overrides,
  };
}

// A request type that runs in the caller's client, and one that runs on the Gamemaster's client.
const localHandler = (overrides: Partial<RequestHandler<string>> = {}) => handler({ type: "test.local", ...overrides });
const gmHandler = (overrides: Partial<RequestHandler<string>> = {}) =>
  handler({ type: "test.gm", runsOn: "gm", ...overrides });

interface Setup {
  handlers?: RequestHandler[];
  isGm?: boolean;
  hasGm?: boolean;
  send?: RelayEnvironment["send"];
  kernel?: RequestKernel;
  timeoutMs?: number;
}

function makeRelay(setup: Setup = {}) {
  const registry = makeRegistry();
  const handlers = setup.handlers ?? [localHandler(), gmHandler()];
  const kernel = setup.kernel ?? createRequestKernel(registry, handlers);
  const send = vi.fn<RelayEnvironment["send"]>(setup.send ?? (async () => ({ ok: true, value: { relayed: true } })));
  const environment: RelayEnvironment = { isGm: () => setup.isGm ?? false, hasGm: () => setup.hasGm ?? true, send };
  const log = { info: vi.fn(), warn: vi.fn() };
  const relay = createRequestRelay({ kernel, handlers, registry, environment, log, timeoutMs: setup.timeoutMs });
  return { relay, send, log };
}

const gmRequest = (over: Record<string, unknown> = {}) => ({ module: "mod-a", type: "test.gm", payload: "hi", ...over });

afterEach(() => {
  vi.useRealTimers();
});

describe("RequestRelay.execute", () => {
  it("runs a caller-type and an unknown type in the local kernel without sending, also without a Gamemaster role", async () => {
    const { relay, send } = makeRelay({
      isGm: false,
      handlers: [localHandler({ run: async () => ({ ran: "here" }) }), gmHandler()],
    });

    expect(await relay.execute({ module: "mod-a", type: "test.local", payload: "hi" })).toEqual({
      ok: true,
      value: { ran: "here" },
    });
    expect(await relay.execute({ module: "mod-a", type: "nope.nothing" })).toMatchObject({
      ok: false,
      reason: "unknown-request",
    });
    expect(send).not.toHaveBeenCalled();
  });

  it("runs a gm-type in the local kernel when this client has a Gamemaster role", async () => {
    const { relay, send } = makeRelay({ isGm: true, handlers: [gmHandler({ run: async () => ({ ran: "on the gm" }) })] });

    expect(await relay.execute(gmRequest())).toEqual({ ok: true, value: { ran: "on the gm" } });
    expect(send).not.toHaveBeenCalled();
  });

  it("forwards a gm-type without a Gamemaster role: only the four known fields, the timeout, and the answer comes back unchanged", async () => {
    const answer = { ok: true, value: { relayed: [1, 2] } };
    const { relay, send } = makeRelay({ isGm: false, send: async () => answer });

    const result = await relay.execute(gmRequest({ version: 1, extra: () => 1, more: new Date() }));

    expect(result).toEqual(answer);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual({ module: "mod-a", type: "test.gm", version: 1, payload: "hi" });
    expect(send.mock.calls[0][1]).toBe(RELAY_TIMEOUT_MS);
  });

  it("answers no-gm without sending when no Gamemaster is connected", async () => {
    const { relay, send } = makeRelay({ hasGm: false });

    expect(await relay.execute(gmRequest())).toMatchObject({ ok: false, reason: "no-gm" });
    expect(send).not.toHaveBeenCalled();
  });

  it("turns a failing send into relay-failed with the message and never rejects", async () => {
    const cases: Array<[string, RelayEnvironment["send"], string]> = [
      ["rejects", () => Promise.reject(new Error("socket closed")), "socket closed"],
      ["throws", () => { throw new Error("no connection"); }, "no connection"],
      ["rejects with text", () => Promise.reject("plain text"), "plain text"],
    ];
    for (const [name, send, message] of cases) {
      const { relay } = makeRelay({ send });

      const result = await relay.execute(gmRequest());

      expect(result, name).toMatchObject({ ok: false, reason: "relay-failed" });
      expect(result.ok ? "" : result.detail, name).toContain(message);
    }
  });

  it("answers relay-timeout when the Gamemaster's client does not answer in time, and a late rejection changes nothing", async () => {
    vi.useFakeTimers();
    let rejectLate: (error: Error) => void = () => undefined;
    const send = () =>
      new Promise<unknown>((_resolve, reject) => {
        rejectLate = reject;
      });
    const { relay, send: sendMock } = makeRelay({ send, timeoutMs: 5_000 });

    const pending = relay.execute(gmRequest());
    await vi.advanceTimersByTimeAsync(4_999);
    let settled = false;
    void pending.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    const result = await pending;

    expect(result).toMatchObject({ ok: false, reason: "relay-timeout" });
    expect(result.ok ? "" : result.detail).toContain("5 seconds");
    expect(sendMock.mock.calls[0][1]).toBe(5_000);

    // a rejection after the timeout must not surface (an unhandled rejection would fail this run)
    rejectLate(new Error("late"));
    await vi.advanceTimersByTimeAsync(1);
  });

  it("turns an answer that is not a request result into relay-failed and passes a failure of the Gamemaster's side through unchanged", async () => {
    const notResults: unknown[] = [
      "text",
      null,
      5,
      [],
      {},
      { ok: true },
      { ok: true, value: () => 1 },
      { ok: false },
      { ok: false, reason: "x" },
      { ok: false, reason: 5, detail: "d" },
      { ok: "yes", value: 1 },
    ];
    for (const answer of notResults) {
      const { relay } = makeRelay({ send: async () => answer });
      expect(await relay.execute(gmRequest()), String(JSON.stringify(answer))).toMatchObject({
        ok: false,
        reason: "relay-failed",
      });
    }

    const failures = [
      { ok: false, reason: "not-permitted", detail: "no" },
      { ok: false, reason: "some-future-reason", detail: "later" },
    ];
    for (const answer of failures) {
      const { relay } = makeRelay({ send: async () => answer });
      expect(await relay.execute(gmRequest())).toEqual(answer);
    }
  });

  it("fails locally without sending for an invalid envelope, an unregistered sender and a request that is too large", async () => {
    const { relay, send } = makeRelay();

    expect(await relay.execute({ type: "test.gm" })).toMatchObject({ ok: false, reason: "invalid-request" });
    expect(await relay.execute(gmRequest({ module: "stranger" }))).toMatchObject({ ok: false, reason: "not-registered" });
    expect(await relay.execute(gmRequest({ payload: "x".repeat(MAX_RELAY_SIZE) }))).toMatchObject({
      ok: false,
      reason: "invalid-request",
    });
    expect(send).not.toHaveBeenCalled();
  });
});

describe("RequestRelay.receive", () => {
  it("runs a gm-type at a Gamemaster's client, with the sender taken from that client's own registry", async () => {
    const run = vi.fn(async (payload: string, context: RequestContext) => ({ said: payload, by: context.module.id }));
    const { relay } = makeRelay({ isGm: true, handlers: [gmHandler({ run })] });

    const result = await relay.receive({ module: "mod-a", type: "test.gm", payload: "hi" });

    expect(result).toEqual({ ok: true, value: { said: "hi", by: "mod-a" } });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("refuses a relayed request on a client without a Gamemaster role and does not run the handler", async () => {
    const run = vi.fn(async () => ({}));
    const { relay } = makeRelay({ isGm: false, handlers: [gmHandler({ run })] });

    expect(await relay.receive({ module: "mod-a", type: "test.gm", payload: "hi" })).toMatchObject({
      ok: false,
      reason: "not-permitted",
    });
    expect(run).not.toHaveBeenCalled();
  });

  it("refuses a caller-type with not-permitted and reports an unknown type or an unregistered sender like the kernel", async () => {
    const run = vi.fn(async () => ({}));
    const { relay } = makeRelay({ isGm: true, handlers: [localHandler({ run }), gmHandler()] });

    expect(await relay.receive({ module: "mod-a", type: "test.local", payload: "hi" })).toMatchObject({
      ok: false,
      reason: "not-permitted",
    });
    expect(run).not.toHaveBeenCalled();
    expect(await relay.receive({ module: "mod-a", type: "nope.nothing" })).toMatchObject({
      ok: false,
      reason: "unknown-request",
    });
    expect(await relay.receive(gmRequest({ module: "stranger" }))).toMatchObject({ ok: false, reason: "not-registered" });
  });

  it("rejects data that is not JSON, too large or malformed with invalid-request, and never rejects even if the kernel throws", async () => {
    const { relay } = makeRelay({ isGm: true });
    const cyclic: Record<string, unknown> = { module: "mod-a", type: "test.gm" };
    cyclic.self = cyclic;
    const bad: unknown[] = [
      undefined,
      null,
      "text",
      5,
      [],
      { type: "test.gm" },
      gmRequest({ payload: () => 1 }),
      gmRequest({ payload: "x".repeat(MAX_RELAY_SIZE) }),
      cyclic,
    ];
    for (const data of bad) {
      expect(await relay.receive(data), String(typeof data)).toMatchObject({ ok: false, reason: "invalid-request" });
    }

    const throwingKernel: RequestKernel = {
      execute: () => {
        throw new Error("kernel down");
      },
    };
    const { relay: broken } = makeRelay({ isGm: true, kernel: throwingKernel });
    await expect(broken.receive(gmRequest())).resolves.toMatchObject({ ok: false, reason: "internal-error" });
  });

  it("replaces the detail of handler-failed and internal-error with a general sentence, logs the original, keeps other details and does not log a success", async () => {
    const secret = "cannot update Actor 'Secret Boss'";
    const failing = gmHandler({
      run: async () => {
        throw new Error(secret);
      },
    });
    const { relay, log } = makeRelay({ isGm: true, handlers: [failing] });

    const failed = await relay.receive(gmRequest());

    expect(failed).toMatchObject({ ok: false, reason: "handler-failed" });
    expect(JSON.stringify(failed)).not.toContain("Secret Boss");
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn.mock.calls[0][0]).toContain("Secret Boss");
    expect(log.warn.mock.calls[0][0]).toContain("handler-failed");

    const invalid = await relay.receive(gmRequest({ payload: 5 }));
    expect(invalid).toEqual({ ok: false, reason: "invalid-payload", detail: "expected text" });

    const throwingKernel: RequestKernel = {
      execute: () => {
        throw new Error(secret);
      },
    };
    const { relay: broken, log: brokenLog } = makeRelay({ isGm: true, kernel: throwingKernel });
    const internal = await broken.receive(gmRequest());
    expect(internal).toMatchObject({ ok: false, reason: "internal-error" });
    expect(JSON.stringify(internal)).not.toContain("Secret Boss");
    expect(brokenLog.warn.mock.calls[0][0]).toContain("Secret Boss");

    const { relay: fine, log: fineLog } = makeRelay({ isGm: true });
    expect(await fine.receive(gmRequest())).toMatchObject({ ok: true });
    expect(fineLog.warn).not.toHaveBeenCalled();
    expect(fineLog.info).not.toHaveBeenCalled();
  });
});

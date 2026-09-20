import { afterEach, describe, expect, it, vi } from "vitest";
import { ModuleRegistry, type ModuleInfo, type ModuleInfoSource } from "./module-registry";
import { CONFIRM_TIMEOUT_MS } from "./request-identity";
import {
  createRequestKernel,
  type PayloadCheck,
  type RequestContext,
  type RequestHandler,
  type RequestKernel,
} from "./request-kernel";
import {
  createRequestRelay,
  MAX_RELAY_SIZE,
  RELAY_TIMEOUT_MS,
  type RelayEnvironment,
  type RequestRelay,
} from "./request-relay";

const API = "0.5.0";
const REQUEST_ID = "0123456789abcdef0123456789abcdef";

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
  // The user of this client; "" means unknown.
  userId?: string;
  send?: RelayEnvironment["send"];
  confirm?: RelayEnvironment["confirm"];
  environment?: Partial<RelayEnvironment>;
  kernel?: RequestKernel;
  timeoutMs?: number;
}

function makeRelay(setup: Setup = {}) {
  const registry = makeRegistry();
  const handlers = setup.handlers ?? [localHandler(), gmHandler()];
  const kernel = setup.kernel ?? createRequestKernel(registry, handlers);
  let counter = 0;
  const send = vi.fn<RelayEnvironment["send"]>(setup.send ?? (async () => ({ ok: true, value: { relayed: true } })));
  const confirm = vi.fn<RelayEnvironment["confirm"]>(
    setup.confirm ?? (async (userId) => ({ confirmed: true, userId })),
  );
  const environment: RelayEnvironment = {
    isGm: () => setup.isGm ?? false,
    hasGm: () => setup.hasGm ?? true,
    currentUserId: () => setup.userId ?? "p-1",
    newId: () => `request-id-${String(++counter).padStart(8, "0")}`,
    send,
    confirm,
    ...setup.environment,
  };
  const log = { info: vi.fn(), warn: vi.fn() };
  const relay = createRequestRelay({ kernel, handlers, registry, environment, log, timeoutMs: setup.timeoutMs });
  return { relay, send, confirm, log, registry };
}

const gmRequest = (over: Record<string, unknown> = {}) => ({ module: "mod-a", type: "test.gm", payload: "hi", ...over });

// What a client without a Gamemaster role sends: the request and the user it names.
const relayed = (request: unknown, userId = "p-1") => ({ request, claim: { userId, requestId: REQUEST_ID } });

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
    expect(send.mock.calls[0][0].request).toEqual({ module: "mod-a", type: "test.gm", version: 1, payload: "hi" });
    expect(send.mock.calls[0][1]).toBe(RELAY_TIMEOUT_MS);
  });

  it("sends the request with the user of this client and an identifier that is open while it is sent and closed after it, also after a failure and a timeout; without a known user nothing is sent", async () => {
    // open while it is sent, closed afterwards
    const holder: { relay?: RequestRelay } = {};
    let openWhileSending: boolean | undefined;
    const first = makeRelay({
      send: async (message) => {
        openWhileSending = holder.relay?.answerConfirmation({ requestId: message.claim.requestId }).confirmed;
        return { ok: true, value: { relayed: true } };
      },
    });
    holder.relay = first.relay;

    await first.relay.execute(gmRequest());

    const message = first.send.mock.calls[0][0];
    expect(message).toEqual({
      request: { module: "mod-a", type: "test.gm", payload: "hi" },
      claim: { userId: "p-1", requestId: "request-id-00000001" },
    });
    expect(openWhileSending).toBe(true);
    expect(first.relay.answerConfirmation({ requestId: message.claim.requestId }).confirmed).toBe(false);

    // closed after a failure
    const failing = makeRelay({ send: () => Promise.reject(new Error("socket closed")) });
    expect(await failing.relay.execute(gmRequest())).toMatchObject({ ok: false, reason: "relay-failed" });
    expect(failing.relay.answerConfirmation({ requestId: "request-id-00000001" }).confirmed).toBe(false);

    // closed after a timeout
    vi.useFakeTimers();
    const silent = makeRelay({ send: () => new Promise(() => undefined), timeoutMs: 5_000 });
    const waiting = silent.relay.execute(gmRequest());
    await vi.advanceTimersByTimeAsync(5_000);
    expect(await waiting).toMatchObject({ ok: false, reason: "relay-timeout" });
    expect(silent.relay.answerConfirmation({ requestId: "request-id-00000001" }).confirmed).toBe(false);
    vi.useRealTimers();

    // without a known user nothing is sent
    const stranger = makeRelay({ userId: "" });
    expect(await stranger.relay.execute(gmRequest())).toMatchObject({ ok: false, reason: "relay-failed" });
    expect(stranger.send).not.toHaveBeenCalled();
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

describe("RequestRelay.answerConfirmation", () => {
  it("confirms an identifier that is open with the own user id, and nothing else, and never throws", async () => {
    const holder: { relay?: RequestRelay } = {};
    let whileOpen: unknown;
    const { relay } = makeRelay({
      send: async (message) => {
        whileOpen = holder.relay?.answerConfirmation({ requestId: message.claim.requestId });
        return { ok: true, value: { relayed: true } };
      },
    });
    holder.relay = relay;

    await relay.execute(gmRequest());

    expect(whileOpen).toEqual({ confirmed: true, userId: "p-1" });
    const notConfirmed: unknown[] = [
      { requestId: "request-id-00000001" }, // closed by now
      { requestId: "never-sent" },
      { requestId: 5 },
      {},
      [],
      null,
      undefined,
      "request-id-00000001",
    ];
    for (const question of notConfirmed) {
      expect(relay.answerConfirmation(question), JSON.stringify(question)).toEqual({ confirmed: false, userId: "p-1" });
    }

    // a client that cannot tell its user confirms nothing and does not throw
    const unknownUser = makeRelay({ environment: { currentUserId: () => { throw new Error("no user"); } } });
    expect(unknownUser.relay.answerConfirmation({ requestId: "request-id-00000001" })).toEqual({
      confirmed: false,
      userId: "",
    });
  });
});

describe("RequestRelay.receive", () => {
  it("runs a gm-type at a Gamemaster's client, with the sender taken from that client's own registry", async () => {
    const run = vi.fn(async (payload: string, context: RequestContext) => ({ said: payload, by: context.module.id }));
    const { relay } = makeRelay({ isGm: true, handlers: [gmHandler({ run })] });

    const result = await relay.receive(relayed({ module: "mod-a", type: "test.gm", payload: "hi" }));

    expect(result).toEqual({ ok: true, value: { said: "hi", by: "mod-a" } });
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("refuses a relayed request on a client without a Gamemaster role and does not run the handler", async () => {
    const run = vi.fn(async () => ({}));
    const { relay, confirm } = makeRelay({ isGm: false, handlers: [gmHandler({ run })] });

    expect(await relay.receive(relayed({ module: "mod-a", type: "test.gm", payload: "hi" }))).toMatchObject({
      ok: false,
      reason: "not-permitted",
    });
    expect(run).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
  });

  it("refuses data without a proper message with invalid-request and asks nobody", async () => {
    const { relay, confirm } = makeRelay({ isGm: true });
    const bad: unknown[] = [
      gmRequest(), // the bare request of the old format: no claim
      { request: gmRequest() },
      { request: gmRequest(), claim: { userId: "", requestId: REQUEST_ID } },
      { request: gmRequest(), claim: { userId: "p-1", requestId: "short" } },
    ];

    for (const data of bad) {
      expect(await relay.receive(data), JSON.stringify(data)).toMatchObject({ ok: false, reason: "invalid-request" });
    }
    expect(confirm).not.toHaveBeenCalled();
  });

  it("refuses a caller-type with not-permitted and reports an unknown type or an unregistered sender like the kernel", async () => {
    const run = vi.fn(async () => ({}));
    const { relay } = makeRelay({ isGm: true, handlers: [localHandler({ run }), gmHandler()] });

    expect(await relay.receive(relayed({ module: "mod-a", type: "test.local", payload: "hi" }))).toMatchObject({
      ok: false,
      reason: "not-permitted",
    });
    expect(run).not.toHaveBeenCalled();
    expect(await relay.receive(relayed({ module: "mod-a", type: "nope.nothing" }))).toMatchObject({
      ok: false,
      reason: "unknown-request",
    });
    expect(await relay.receive(relayed(gmRequest({ module: "stranger" })))).toMatchObject({
      ok: false,
      reason: "not-registered",
    });
  });

  it("answers a caller-type, an unknown type and an unregistered sender before it asks anyone", async () => {
    const run = vi.fn(async () => ({}));
    const { relay, confirm } = makeRelay({ isGm: true, handlers: [localHandler({ run }), gmHandler({ run })] });

    await relay.receive(relayed({ module: "mod-a", type: "test.local", payload: "hi" }));
    await relay.receive(relayed({ module: "mod-a", type: "nope.nothing" }));
    await relay.receive(relayed(gmRequest({ module: "stranger" })));

    expect(confirm).not.toHaveBeenCalled();
    expect(run).not.toHaveBeenCalled();
  });

  it("asks the named user before it runs a gm-type, and runs it for that user", async () => {
    const seen: unknown[] = [];
    const gm = gmHandler({
      run: async (payload, context) => {
        seen.push(context.user);
        return { said: payload };
      },
    });
    const { relay, confirm, log } = makeRelay({ isGm: true, handlers: [gm] });

    const result = await relay.receive(relayed(gmRequest(), "p-7"));

    expect(result).toEqual({ ok: true, value: { said: "hi" } });
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(confirm).toHaveBeenCalledWith("p-7", REQUEST_ID, CONFIRM_TIMEOUT_MS);
    expect(seen).toEqual([{ id: "p-7" }]);
    expect(log.warn).not.toHaveBeenCalled();
    expect(log.info).not.toHaveBeenCalled();
  });

  it("refuses with not-permitted, runs nothing and warns with the named user when the confirmation fails in any way", async () => {
    const cases: Array<[string, RelayEnvironment["confirm"]]> = [
      ["the user says no", async (userId) => ({ confirmed: false, userId })],
      ["another user answers", async () => ({ confirmed: true, userId: "someone-else" })],
      ["the answer is text", async () => "yes"],
      ["there is no answer object", async () => undefined],
      ["the question is rejected", () => Promise.reject(new Error("User [p-1] is not active"))],
      ["the question throws", () => { throw new Error("no such user"); }],
    ];
    for (const [name, confirm] of cases) {
      const run = vi.fn(async () => ({ ran: true }));
      const { relay, log } = makeRelay({ isGm: true, confirm, handlers: [gmHandler({ run })] });

      const result = await relay.receive(relayed(gmRequest()));

      expect(result, name).toEqual({ ok: false, reason: "not-permitted", detail: "the asking user could not be confirmed" });
      expect(run, name).not.toHaveBeenCalled();
      expect(log.warn, name).toHaveBeenCalledTimes(1);
      expect(String(log.warn.mock.calls[0][0]), name).toContain("p-1");
    }

    // no answer at all: the Gamemaster's client stops waiting by itself
    vi.useFakeTimers();
    const { relay, log } = makeRelay({ isGm: true, confirm: () => new Promise(() => undefined) });
    const waiting = relay.receive(relayed(gmRequest()));
    await vi.advanceTimersByTimeAsync(CONFIRM_TIMEOUT_MS);
    expect(await waiting).toMatchObject({ ok: false, reason: "not-permitted" });
    expect(String(log.warn.mock.calls[0][0])).toContain("no answer");
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
      relayed({ type: "test.gm" }),
      relayed(gmRequest({ payload: () => 1 })),
      relayed(gmRequest({ payload: "x".repeat(MAX_RELAY_SIZE) })),
      relayed(cyclic),
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
    await expect(broken.receive(relayed(gmRequest()))).resolves.toMatchObject({ ok: false, reason: "internal-error" });
  });

  it("replaces the detail of handler-failed and internal-error with a general sentence, logs the original, keeps other details and does not log a success", async () => {
    const secret = "cannot update Actor 'Secret Boss'";
    const failing = gmHandler({
      run: async () => {
        throw new Error(secret);
      },
    });
    const { relay, log } = makeRelay({ isGm: true, handlers: [failing] });

    const failed = await relay.receive(relayed(gmRequest()));

    expect(failed).toMatchObject({ ok: false, reason: "handler-failed" });
    expect(JSON.stringify(failed)).not.toContain("Secret Boss");
    expect(log.warn).toHaveBeenCalledTimes(1);
    expect(log.warn.mock.calls[0][0]).toContain("Secret Boss");
    expect(log.warn.mock.calls[0][0]).toContain("handler-failed");

    const invalid = await relay.receive(relayed(gmRequest({ payload: 5 })));
    expect(invalid).toEqual({ ok: false, reason: "invalid-payload", detail: "expected text" });

    const throwingKernel: RequestKernel = {
      execute: () => {
        throw new Error(secret);
      },
    };
    const { relay: broken, log: brokenLog } = makeRelay({ isGm: true, kernel: throwingKernel });
    const internal = await broken.receive(relayed(gmRequest()));
    expect(internal).toMatchObject({ ok: false, reason: "internal-error" });
    expect(JSON.stringify(internal)).not.toContain("Secret Boss");
    expect(brokenLog.warn.mock.calls[0][0]).toContain("Secret Boss");

    const { relay: fine, log: fineLog } = makeRelay({ isGm: true });
    expect(await fine.receive(relayed(gmRequest()))).toMatchObject({ ok: true });
    expect(fineLog.warn).not.toHaveBeenCalled();
    expect(fineLog.info).not.toHaveBeenCalled();
  });
});

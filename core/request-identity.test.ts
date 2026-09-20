import { describe, expect, it } from "vitest";
import { createPendingRequests, isConfirmed, parseRelayMessage } from "./request-identity";

const ID = "0123456789abcdef0123456789abcdef";

describe("createPendingRequests", () => {
  it("remembers an identifier from newId until it is closed, keeps two apart, and ignores closing an unknown one", () => {
    let counter = 0;
    const pending = createPendingRequests(() => `id-${++counter}`);

    const first = pending.open();
    const second = pending.open();

    expect([first, second]).toEqual(["id-1", "id-2"]);
    expect(pending.has(first)).toBe(true);
    expect(pending.has(second)).toBe(true);

    pending.close(first);
    expect(pending.has(first)).toBe(false);
    expect(pending.has(second)).toBe(true);

    expect(() => pending.close("never-opened")).not.toThrow();
    expect(pending.has("never-opened")).toBe(false);
  });
});

describe("parseRelayMessage", () => {
  it("accepts a message with a request and a claim, and refuses everything else with invalid-request", () => {
    const request = { module: "mod-a", type: "test.gm" };

    expect(parseRelayMessage({ request, claim: { userId: "u-1", requestId: ID } })).toEqual({
      ok: true,
      value: { request, claim: { userId: "u-1", requestId: ID } },
    });
    // identifiers at the limits are fine
    expect(parseRelayMessage({ request, claim: { userId: "u", requestId: "x".repeat(16) } })).toMatchObject({ ok: true });
    expect(parseRelayMessage({ request, claim: { userId: "u", requestId: "x".repeat(128) } })).toMatchObject({ ok: true });

    const bad: Array<[string, unknown]> = [
      ["undefined", undefined],
      ["null", null],
      ["text", "text"],
      ["array", []],
      ["no claim", { request }],
      ["claim not an object", { request, claim: "u-1" }],
      ["userId missing", { request, claim: { requestId: ID } }],
      ["userId empty", { request, claim: { userId: "", requestId: ID } }],
      ["userId not text", { request, claim: { userId: 5, requestId: ID } }],
      ["requestId missing", { request, claim: { userId: "u-1" } }],
      ["requestId not text", { request, claim: { userId: "u-1", requestId: 1234567890123456 } }],
      ["requestId too short", { request, claim: { userId: "u-1", requestId: "x".repeat(15) } }],
      ["requestId too long", { request, claim: { userId: "u-1", requestId: "x".repeat(129) } }],
    ];
    for (const [name, data] of bad) {
      expect(parseRelayMessage(data), name).toMatchObject({
        ok: false,
        failure: { ok: false, reason: "invalid-request" },
      });
    }
  });
});

describe("isConfirmed", () => {
  it("counts only an answer that confirms and comes from the named user", () => {
    const claim = { userId: "u-1", requestId: ID };

    expect(isConfirmed({ confirmed: true, userId: "u-1" }, claim)).toBe(true);

    const refused: unknown[] = [
      { confirmed: false, userId: "u-1" },
      { confirmed: true, userId: "u-2" },
      { confirmed: true },
      { userId: "u-1" },
      { confirmed: "yes", userId: "u-1" },
      {},
      [],
      null,
      undefined,
      "confirmed",
      true,
    ];
    for (const answer of refused) {
      expect(isConfirmed(answer, claim), JSON.stringify(answer)).toBe(false);
    }
  });
});

import { describe, expect, it } from "vitest";
import { isJsonValue } from "./json-value";

describe("isJsonValue", () => {
  it("accepts null, booleans, finite numbers, text, nested arrays and plain objects", () => {
    const shared = { a: 1 };
    const accepted: unknown[] = [
      null,
      true,
      false,
      0,
      -1.5,
      "",
      "text",
      [],
      [1, "a", null, [true]],
      {},
      { a: 1, b: { c: [{}] } },
      { first: shared, second: shared }, // the same object twice is not a cycle
      Object.assign(Object.create(null), { a: 1 }),
    ];
    for (const value of accepted) {
      expect(isJsonValue(value), `value ${JSON.stringify(value)}`).toBe(true);
    }
  });

  it("rejects everything that would not survive JSON: undefined, NaN, Infinity, functions, symbols, bigint, class instances, cycles", () => {
    const cyclicObject: Record<string, unknown> = {};
    cyclicObject.self = cyclicObject;
    const cyclicArray: unknown[] = [];
    cyclicArray.push(cyclicArray);
    const throwing = {
      get boom(): number {
        throw new Error("getter");
      },
    };
    class Thing {}
    const rejected: Array<[string, unknown]> = [
      ["undefined", undefined],
      ["undefined property", { a: undefined }],
      ["undefined item", [undefined]],
      ["array hole", new Array(2)],
      ["NaN", Number.NaN],
      ["Infinity", Number.POSITIVE_INFINITY],
      ["-Infinity", Number.NEGATIVE_INFINITY],
      ["function", () => 1],
      ["symbol", Symbol("x")],
      ["bigint", 10n],
      ["Date", new Date()],
      ["Map", new Map()],
      ["class instance", new Thing()],
      ["nested class instance", { a: [new Thing()] }],
      ["cyclic object", cyclicObject],
      ["cyclic array", cyclicArray],
      ["throwing getter", throwing],
    ];
    for (const [name, value] of rejected) {
      expect(isJsonValue(value), name).toBe(false);
    }
  });
});

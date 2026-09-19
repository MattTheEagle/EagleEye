import { describe, expect, it } from "vitest";
import { compareVersions, EAGLE_API_VERSION, isApiCompatible, parseVersion, type ParsedVersion } from "./api-version";

function v(text: string): ParsedVersion {
  const parsed = parseVersion(text);
  if (!parsed) throw new Error(`test setup: invalid version ${text}`);
  return parsed;
}

describe("parseVersion", () => {
  it("accepts strict x.y.z and returns numbers", () => {
    expect(parseVersion("0.1.0")).toEqual({ major: 0, minor: 1, patch: 0 });
    expect(parseVersion("1.20.3")).toEqual({ major: 1, minor: 20, patch: 3 });
    expect(parseVersion(EAGLE_API_VERSION)).toBeDefined();
  });

  it("rejects everything that is not strict x.y.z", () => {
    const rejected: unknown[] = ["", "1", "1.2", "1.2.3-beta", "v1.2.3", "01.2.3", "a.b.c", 1, null, undefined];
    for (const input of rejected) {
      expect(parseVersion(input), `input ${JSON.stringify(input)}`).toBeUndefined();
    }
  });
});

describe("EAGLE_API_VERSION", () => {
  it("is 0.3.0, the version of part 3 of the API contract", () => {
    expect(EAGLE_API_VERSION).toBe("0.3.0");
  });
});

describe("compareVersions", () => {
  it("orders numerically, not lexically", () => {
    expect(compareVersions(v("1.10.0"), v("1.9.0"))).toBe(1);
    expect(compareVersions(v("1.9.0"), v("1.10.0"))).toBe(-1);
    expect(compareVersions(v("2.0.0"), v("1.99.99"))).toBe(1);
    expect(compareVersions(v("1.2.3"), v("1.2.4"))).toBe(-1);
    expect(compareVersions(v("1.2.3"), v("1.2.3"))).toBe(0);
  });
});

describe("isApiCompatible", () => {
  it("accepts a newer minor or patch of the same major (major 1 and up)", () => {
    expect(isApiCompatible(v("1.0.0"), v("1.2.5"))).toBe(true);
    expect(isApiCompatible(v("1.1.0"), v("1.2.0"))).toBe(true);
    expect(isApiCompatible(v("1.2.0"), v("1.2.0"))).toBe(true);
  });

  it("rejects a provided version that is older than the requested one", () => {
    expect(isApiCompatible(v("1.2.0"), v("1.1.9"))).toBe(false);
    expect(isApiCompatible(v("1.0.5"), v("1.0.4"))).toBe(false);
  });

  it("rejects different major versions in both directions", () => {
    expect(isApiCompatible(v("1.0.0"), v("2.0.0"))).toBe(false);
    expect(isApiCompatible(v("2.0.0"), v("1.9.9"))).toBe(false);
    expect(isApiCompatible(v("0.1.0"), v("1.1.0"))).toBe(false);
  });

  it("requires the same minor before 1.0", () => {
    expect(isApiCompatible(v("0.1.0"), v("0.1.5"))).toBe(true);
    expect(isApiCompatible(v("0.1.5"), v("0.1.0"))).toBe(false);
    expect(isApiCompatible(v("0.2.0"), v("0.1.9"))).toBe(false);
    expect(isApiCompatible(v("0.1.0"), v("0.2.0"))).toBe(false);
  });
});

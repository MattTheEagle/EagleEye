import { describe, expect, it } from "vitest";
import { scanPackages, type PackageLike, type PackageScanSource } from "./manifest-scanner";

// Foundry's CONST.PACKAGE_AVAILABILITY_CODES.MISSING_DEPENDENCY === 6
const MISSING_DEPENDENCY = 6;
// Foundry's CONST.PACKAGE_AVAILABILITY_CODES.VERIFIED === 1
const VERIFIED = 1;

function makePackage(overrides: Partial<PackageLike>): PackageLike {
  return {
    id: "dummy",
    title: "Dummy",
    version: "0.0.1",
    active: true,
    availability: VERIFIED,
    getVersionBadge: () => ({ type: "safe", tooltip: "Compatible" }),
    ...overrides,
  };
}

describe("scanPackages", () => {
  it("reports an incompatible dummy module as such, not as safe", () => {
    const dummy = makePackage({
      id: "eagleeye-dummy-test",
      title: "EagleEye Dummy Test Module",
      availability: MISSING_DEPENDENCY,
      getVersionBadge: () => ({ type: "error", tooltip: "Missing dependency" }),
    });
    const source: PackageScanSource = {
      modules: [dummy],
      system: makePackage({ id: "dnd5e", title: "D&D 5e" }),
    };

    const [dummyStatus] = scanPackages(source);

    expect(dummyStatus.id).toBe("eagleeye-dummy-test");
    expect(dummyStatus.availability).toBe(MISSING_DEPENDENCY);
    expect(dummyStatus.badge?.type).not.toBe("safe");
  });

  it("includes the active system alongside all modules", () => {
    const source: PackageScanSource = {
      modules: [makePackage({ id: "mod-a" }), makePackage({ id: "mod-b" })],
      system: makePackage({ id: "dnd5e", title: "D&D 5e" }),
    };

    const statuses = scanPackages(source);

    expect(statuses).toHaveLength(3);
    expect(statuses.filter((s) => s.kind === "system")).toHaveLength(1);
    expect(statuses.find((s) => s.kind === "system")?.id).toBe("dnd5e");
  });
});

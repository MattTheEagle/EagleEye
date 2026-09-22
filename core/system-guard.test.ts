import { describe, expect, it, vi } from "vitest";
import { parseVersion } from "./api-version";
import {
  announceSystem,
  evaluateSystem,
  noticeFor,
  SUPPORTED_SYSTEM_ID,
  TESTED_SYSTEM_VERSIONS,
  type AnnounceEnvironment,
  type SystemInfo,
  type SystemSource,
} from "./system-guard";

const source = (id: unknown, version: unknown): SystemSource => ({ id: () => id, version: () => version });
const throwing = (what: "id" | "version" | "both"): SystemSource => ({
  id: () => {
    if (what !== "version") throw new Error("no id");
    return "dnd5e";
  },
  version: () => {
    if (what !== "id") throw new Error("no version");
    return "5.3.3";
  },
});

describe("evaluateSystem", () => {
  it("rates a readable dnd5e version: tested when it is listed, same-line when only major and minor match a listed one, untested otherwise", () => {
    const cases: Array<[string, string]> = [
      ["5.3.3", "tested"],
      ["5.3.4", "same-line"],
      ["5.3.0", "same-line"],
      ["5.3.10", "same-line"],
      ["5.4.0", "untested"],
      ["5.2.9", "untested"],
      ["6.3.3", "untested"],
      ["4.3.3", "untested"],
      // the line is compared as numbers, not as text: 5.30 is not 5.3 and 5.10 is not 5.1
      ["5.30.3", "untested"],
      ["5.10.0", "untested"],
      ["0.0.0", "untested"],
    ];
    for (const [version, status] of cases) {
      expect(evaluateSystem(source("dnd5e", version), ["5.3.3"]), version).toMatchObject({ id: "dnd5e", version, status });
    }

    // several listed versions: every one of them is a tested version and a tested line
    const listed = ["5.2.1", "5.3.3"];
    expect(evaluateSystem(source("dnd5e", "5.2.1"), listed).status).toBe("tested");
    expect(evaluateSystem(source("dnd5e", "5.2.9"), listed).status).toBe("same-line");
    expect(evaluateSystem(source("dnd5e", "5.3.3"), listed).status).toBe("tested");
    expect(evaluateSystem(source("dnd5e", "5.4.0"), listed).status).toBe("untested");

    // the answer is a frozen object with a copy of the list
    const info = evaluateSystem(source("dnd5e", "5.3.3"), listed);
    expect(info.testedVersions).toEqual(listed);
    expect(info.testedVersions).not.toBe(listed);
    expect(Object.isFrozen(info)).toBe(true);
    expect(Object.isFrozen(info.testedVersions)).toBe(true);
  });

  it("rates another system as other-system and names it, whatever its version is", () => {
    for (const id of ["pf2e", "dnd5e-custom", "DND5E", " dnd5e", "dnd5e ", "dnd"]) {
      expect(evaluateSystem(source(id, "5.3.3")), id).toMatchObject({ id, version: null, status: "other-system" });
    }
    expect(evaluateSystem(source("pf2e", "garbage"))).toMatchObject({ id: "pf2e", version: null, status: "other-system" });
    expect(evaluateSystem({ id: () => "pf2e", version: () => { throw new Error("no version"); } })).toMatchObject({
      id: "pf2e",
      status: "other-system",
    });
  });

  it("rates what cannot be read as unknown: an id that is not a text, a version that is not a strict x.y.z, a source that throws", () => {
    for (const id of [undefined, null, "", 5, true, {}, ["dnd5e"]]) {
      expect(evaluateSystem(source(id, "5.3.3")), JSON.stringify(id)).toMatchObject({ id: null, version: null, status: "unknown" });
    }
    const versions: unknown[] = [undefined, null, "", 5, 5.3, "0", "5", "5.3", "5.3.3.1", "5.3.3-rc.1", "v5.3.3", "05.3.3", "5.3.x", " 5.3.3", "5.3.3 "];
    for (const version of versions) {
      expect(evaluateSystem(source("dnd5e", version)), JSON.stringify(version)).toMatchObject({
        id: "dnd5e",
        version: null,
        status: "unknown",
      });
    }
    for (const what of ["id", "version", "both"] as const) {
      expect(evaluateSystem(throwing(what)), what).toMatchObject({ status: "unknown" });
    }
  });

  it("uses the tested versions and the system id of the code, and a list or id that is handed in replaces them; nothing can add to the list", () => {
    expect(TESTED_SYSTEM_VERSIONS.length).toBeGreaterThan(0);
    expect(new Set(TESTED_SYSTEM_VERSIONS).size).toBe(TESTED_SYSTEM_VERSIONS.length);
    for (const version of TESTED_SYSTEM_VERSIONS) expect(parseVersion(version), version).toBeDefined();
    expect(TESTED_SYSTEM_VERSIONS).toContain("5.3.3");
    expect(SUPPORTED_SYSTEM_ID).toBe("dnd5e");

    expect(evaluateSystem(source("dnd5e", "5.3.3")).status).toBe("tested");
    expect(evaluateSystem(source("dnd5e", "5.3.3"), []).status).toBe("untested");
    expect(evaluateSystem(source("pf2e", "1.0.0"), ["1.0.0"], "pf2e").status).toBe("tested");
    expect(evaluateSystem(source("dnd5e", "1.0.0"), ["1.0.0"], "pf2e").status).toBe("other-system");

    // the list in the code and the list in an answer are frozen: a module that reads it through the API cannot change it
    expect(Object.isFrozen(TESTED_SYSTEM_VERSIONS)).toBe(true);
    const info = evaluateSystem(source("dnd5e", "5.3.3"));
    expect(() => (info.testedVersions as string[]).push("6.0.0")).toThrow();
    expect(() => (TESTED_SYSTEM_VERSIONS as string[]).push("6.0.0")).toThrow();
    expect(evaluateSystem(source("dnd5e", "6.0.0")).status).toBe("untested");
  });
});

describe("noticeFor", () => {
  const info = (status: SystemInfo["status"], id: string | null, version: string | null, tested = ["5.3.3"]): SystemInfo => ({
    id,
    version,
    status,
    testedVersions: tested,
  });

  it("has nothing to say for a tested system or one on a tested line, and names the version, the id or nothing for the rest", () => {
    expect(noticeFor(info("tested", "dnd5e", "5.3.3"))).toBeUndefined();
    expect(noticeFor(info("same-line", "dnd5e", "5.3.4"))).toBeUndefined();
    expect(noticeFor(info("untested", "dnd5e", "5.4.0"))).toEqual({
      key: "EAGLEFLIGHTCONTROL.system.untested",
      data: { version: "5.4.0", tested: "5.3.3" },
    });
    expect(noticeFor(info("untested", "dnd5e", "6.0.0", ["5.2.1", "5.3.3"]))).toEqual({
      key: "EAGLEFLIGHTCONTROL.system.untested",
      data: { version: "6.0.0", tested: "5.2.1, 5.3.3" },
    });
    expect(noticeFor(info("other-system", "pf2e", null))).toEqual({ key: "EAGLEFLIGHTCONTROL.system.otherSystem", data: { id: "pf2e" } });
    expect(noticeFor(info("unknown", null, null))).toEqual({ key: "EAGLEFLIGHTCONTROL.system.unknown", data: {} });
  });
});

describe("announceSystem", () => {
  function makeEnvironment(over: Partial<AnnounceEnvironment> = {}) {
    const log = { info: vi.fn(), warn: vi.fn() };
    const notify = vi.fn();
    const environment: AnnounceEnvironment = {
      isGm: () => true,
      log,
      notify,
      text: (key, data) => `${key} ${JSON.stringify(data ?? {})}`,
      ...over,
    };
    return { environment, log, notify };
  }

  it("logs one line every time (info for a tested system or one on a tested line, a warning otherwise) and tells a Gamemaster once, only when the system is not known to be fine, and never a player", () => {
    const cases: Array<[string, SystemSource, "info" | "warn", string, boolean]> = [
      ["tested", source("dnd5e", "5.3.3"), "info", "eagle-flight-control | game system: dnd5e 5.3.3 (tested)", false],
      ["same-line", source("dnd5e", "5.3.4"), "info", "eagle-flight-control | game system: dnd5e 5.3.4 (same-line)", false],
      ["untested", source("dnd5e", "5.4.0"), "warn", "eagle-flight-control | game system: dnd5e 5.4.0 (untested)", true],
      ["other-system", source("pf2e", "1.0.0"), "warn", "eagle-flight-control | game system: pf2e (other-system)", true],
      [
        "unknown version",
        source("dnd5e", "5.3.3-rc.1"),
        "warn",
        'eagle-flight-control | game system: dnd5e (unknown); id "dnd5e", version "5.3.3-rc.1"',
        true,
      ],
      ["unknown id", source(undefined, undefined), "warn", "eagle-flight-control | game system: unreadable (unknown); id undefined, version undefined", true],
      ["unreadable", throwing("both"), "warn", "eagle-flight-control | game system: unreadable (unknown); id unreadable, version unreadable", true],
    ];
    for (const [name, system, level, line, notice] of cases) {
      const gm = makeEnvironment();
      const info = announceSystem(system, gm.environment);

      expect(info.status, name).toBe(name === "unknown version" || name === "unknown id" || name === "unreadable" ? "unknown" : name);
      expect(gm.log[level].mock.calls, name).toEqual([[line]]);
      expect(gm.log[level === "info" ? "warn" : "info"], name).not.toHaveBeenCalled();
      expect(gm.notify, name).toHaveBeenCalledTimes(notice ? 1 : 0);
      if (notice) expect(gm.notify.mock.calls[0][0], name).toBe("warn");

      // a player gets the log line and no notice
      const player = makeEnvironment({ isGm: () => false });
      announceSystem(system, player.environment);
      expect(player.log[level], name).toHaveBeenCalledTimes(1);
      expect(player.notify, name).not.toHaveBeenCalled();
    }

    // the text of the notice is the translated key with its data
    const untested = makeEnvironment();
    announceSystem(source("dnd5e", "5.4.0"), untested.environment);
    expect(untested.notify).toHaveBeenCalledWith("warn", 'EAGLEFLIGHTCONTROL.system.untested {"version":"5.4.0","tested":"5.3.3"}');
  });

  it("never throws: a source, a log, a role check, a notification or a text that fails changes nothing, and a failing log does not stop the notice", () => {
    const boom = () => {
      throw new Error("boom");
    };
    const failing: Array<[string, Partial<AnnounceEnvironment>]> = [
      ["isGm throws", { isGm: boom }],
      ["notify throws", { notify: boom }],
      ["text throws", { text: boom }],
      ["log.info throws", { log: { info: boom, warn: boom } }],
    ];
    for (const [name, override] of failing) {
      const { environment } = makeEnvironment(override);
      expect(() => announceSystem(source("dnd5e", "5.4.0"), environment), name).not.toThrow();
      expect(announceSystem(throwing("both"), environment).status, name).toBe("unknown");
    }

    // the log fails, the notice still goes out
    const notify = vi.fn();
    const { environment } = makeEnvironment({ log: { info: boom, warn: boom }, notify });
    announceSystem(source("dnd5e", "5.4.0"), environment);
    expect(notify).toHaveBeenCalledTimes(1);
  });
});

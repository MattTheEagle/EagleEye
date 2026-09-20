import { describe, expect, it } from "vitest";
import {
  emptyRights,
  levelOf,
  parseRightsTable,
  serializeRightsTable,
  withLevel,
  type RightsTable,
} from "./rights-table";

const table = (modules: RightsTable["modules"]): RightsTable => ({ version: 1, modules });
const KNOWN = new Set(["u1", "u2", "u3"]);

function parsed(text: string): RightsTable {
  const result = parseRightsTable(text);
  if (!result.ok) throw new Error(`test setup: ${result.detail}`);
  return result.value;
}

// A table and everything in it that cannot be changed: a function that changed it would throw.
function frozen(value: RightsTable): RightsTable {
  const freeze = (item: unknown): void => {
    if (typeof item !== "object" || item === null) return;
    Object.values(item).forEach(freeze);
    Object.freeze(item);
  };
  freeze(value);
  return value;
}

describe("parseRightsTable", () => {
  it("reads nothing stored yet as the empty table and a valid text as the table it holds", () => {
    for (const text of [undefined, null, ""]) {
      expect(parseRightsTable(text), String(text)).toEqual({ ok: true, value: emptyRights() });
    }
    expect(parseRightsTable('{"version":1,"modules":{}}')).toEqual({ ok: true, value: emptyRights() });
    expect(parseRightsTable('{"version":1,"modules":{"mod-a":{"u1":"own","u2":"all"},"mod-b":{}}}')).toEqual({
      ok: true,
      value: table({ "mod-a": { u1: "own", u2: "all" }, "mod-b": {} }),
    });
  });

  it("rejects anything that is not a table with a reason and never returns a partial table", () => {
    const invalid: unknown[] = [
      5,
      {},
      "not json",
      "[]",
      "null",
      "5",
      '"text"',
      '{"modules":{}}',
      '{"version":2,"modules":{}}',
      '{"version":"1","modules":{}}',
      '{"version":1}',
      '{"version":1,"modules":[]}',
      '{"version":1,"modules":"none"}',
      '{"version":1,"modules":{"mod-a":[]}}',
      '{"version":1,"modules":{"mod-a":"own"}}',
      '{"version":1,"modules":{"mod-a":{"u1":"denied"}}}',
      '{"version":1,"modules":{"mod-a":{"u1":"foreign"}}}',
      '{"version":1,"modules":{"mod-a":{"u1":2}}}',
      '{"version":1,"modules":{"mod-a":{"u1":""}}}',
      '{"version":1,"modules":{"mod-a":{"u1":null}}}',
      '{"version":1,"modules":{"mod-a":{"":"own"}}}',
      // one bad entry spoils the whole table
      '{"version":1,"modules":{"mod-a":{"u1":"own"},"mod-b":{"u2":"maybe"}}}',
    ];
    for (const text of invalid) {
      const result = parseRightsTable(text);
      expect(result.ok, JSON.stringify(text)).toBe(false);
      expect(result.ok ? "" : result.detail, JSON.stringify(text)).not.toBe("");
    }
  });
});

describe("levelOf", () => {
  const rights = table({ "mod-a": { u1: "own", u2: "all" } });

  it("gives the stored level, and denied for a user without an entry or a module without entries", () => {
    expect(levelOf(rights, "mod-a", "u1")).toBe("own");
    expect(levelOf(rights, "mod-a", "u2")).toBe("all");
    expect(levelOf(rights, "mod-a", "u3")).toBe("denied");
    expect(levelOf(rights, "mod-b", "u1")).toBe("denied");
    expect(levelOf(emptyRights(), "mod-a", "u1")).toBe("denied");
  });

  it("only counts what the table itself holds: ids that are properties of every object never match, and such ids in a stored table are plain ids", () => {
    for (const id of ["__proto__", "constructor", "toString", "hasOwnProperty"]) {
      expect(levelOf(rights, id, "u1"), `module ${id}`).toBe("denied");
      expect(levelOf(rights, "mod-a", id), `user ${id}`).toBe("denied");
      expect(levelOf(emptyRights(), id, id), `both ${id}`).toBe("denied");
    }

    const hostile = parsed('{"version":1,"modules":{"__proto__":{"constructor":"own"},"constructor":{"u1":"all"}}}');
    expect(levelOf(hostile, "__proto__", "constructor")).toBe("own");
    expect(levelOf(hostile, "constructor", "u1")).toBe("all");
    expect(levelOf(hostile, "constructor", "u2")).toBe("denied");
    expect(levelOf(hostile, "mod-a", "u1")).toBe("denied");
    // a table that was built by code and holds something that is not a level
    expect(levelOf(table({ "mod-a": { u1: "maybe" as never } }), "mod-a", "u1")).toBe("denied");
  });
});

describe("withLevel", () => {
  it("sets the level of a user for a module, also on an empty table and over an existing entry", () => {
    const first = withLevel(emptyRights(), "mod-a", "u1", "own", KNOWN);
    expect(first).toEqual(table({ "mod-a": { u1: "own" } }));

    const second = withLevel(first, "mod-a", "u2", "all", KNOWN);
    expect(second).toEqual(table({ "mod-a": { u1: "own", u2: "all" } }));

    const third = withLevel(second, "mod-a", "u1", "all", KNOWN);
    expect(third).toEqual(table({ "mod-a": { u1: "all", u2: "all" } }));
  });

  it("removes the entry when the level is denied, and the module when it has no entry left", () => {
    const rights = table({ "mod-a": { u1: "own", u2: "all" }, "mod-b": { u1: "all" } });

    expect(withLevel(rights, "mod-a", "u1", "denied", KNOWN)).toEqual(table({ "mod-b": { u1: "all" }, "mod-a": { u2: "all" } }));
    expect(withLevel(rights, "mod-b", "u1", "denied", KNOWN)).toEqual(table({ "mod-a": { u1: "own", u2: "all" } }));
    // denied for a user who had no entry changes nothing
    expect(withLevel(rights, "mod-a", "u3", "denied", KNOWN)).toEqual(rights);
    expect(withLevel(emptyRights(), "mod-a", "u1", "denied", KNOWN)).toEqual(emptyRights());
  });

  it("drops the entries of this module that name a user nobody knows any more, and only this module's", () => {
    const rights = table({ "mod-a": { u1: "own", gone: "all" }, "mod-b": { gone: "own", u1: "all" } });

    const result = withLevel(rights, "mod-a", "u2", "own", KNOWN);

    expect(result.modules["mod-a"]).toEqual({ u1: "own", u2: "own" });
    expect(result.modules["mod-b"]).toEqual({ gone: "own", u1: "all" });
    // a module that only had stale entries disappears
    expect(withLevel(table({ "mod-a": { gone: "own" } }), "mod-a", "u1", "denied", KNOWN)).toEqual(emptyRights());
  });

  it("leaves the other modules as they are and does not change the table that goes in", () => {
    const rights = frozen(table({ "mod-a": { u1: "own" }, "mod-b": { u2: "all" } }));

    const result = withLevel(rights, "mod-a", "u3", "all", KNOWN);

    expect(result.modules["mod-b"]).toEqual({ u2: "all" });
    expect(rights).toEqual(table({ "mod-a": { u1: "own" }, "mod-b": { u2: "all" } }));
    expect(result).not.toBe(rights);
  });
});

describe("serializeRightsTable", () => {
  it("writes a text that parses back to the same table", () => {
    const rights = table({ "mod-a": { u1: "own", u2: "all" }, "mod-b": { u3: "own" } });

    expect(parseRightsTable(serializeRightsTable(rights))).toEqual({ ok: true, value: rights });
    expect(parseRightsTable(serializeRightsTable(emptyRights()))).toEqual({ ok: true, value: emptyRights() });
  });
});

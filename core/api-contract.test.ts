/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import contractRaw from "../docs/api-contract.md?raw";
import manifestRaw from "../v13/module.json?raw";
import { compareVersions, EAGLE_API_VERSION, isApiCompatible, parseVersion } from "./api-version";
import { COMPENDIUM_DOCUMENT_TYPES, NO_COMPENDIUMS } from "./compendium-handlers";
import { defaultRequestHandlers } from "./request-handlers";
import { CONFIRM_TIMEOUT_MS } from "./request-identity";
import { MAX_RELAY_SIZE, RELAY_TIMEOUT_MS } from "./request-relay";
import { SUPPORTED_SYSTEM_ID, TESTED_SYSTEM_VERSIONS } from "./system-guard";

// The contract in docs/api-contract.md is what authors of other modules rely on. These tests hold it against the code
// it describes: a code, a limit, a type or a list that changes on one side and not on the other fails here.

const contract = contractRaw;
// The same text with every run of white space as one space, for phrases the contract wraps over several lines.
const flat = contract.replace(/\s+/g, " ");

// The core sources whose types and texts the contract quotes.
const sources = import.meta.glob(["./*.ts", "!./*.test.ts"], { query: "?raw", import: "default", eager: true }) as Record<
  string,
  string
>;

function source(name: string): string {
  const text = sources[`./${name}.ts`];
  if (text === undefined) throw new Error(`test setup: core/${name}.ts is missing`);
  return text;
}

// The text from the first `from` up to the next `to` after it; fails loudly when a marker is gone.
function between(text: string, from: string, to: string): string {
  const start = text.indexOf(from);
  if (start < 0) throw new Error(`test setup: "${from}" not found`);
  const end = text.indexOf(to, start + from.length);
  if (end < 0) throw new Error(`test setup: "${to}" not found after "${from}"`);
  return text.slice(start, end);
}

// The double-quoted lower case words of a type, sorted (the codes of a union).
function quoted(text: string): string[] {
  return [...text.matchAll(/"([a-z-]+)"/g)].map((match) => match[1]).sort();
}

// The first column of a table whose cells are in backticks, sorted; the header cells are left out.
function tableCodes(block: string): string[] {
  return [...block.matchAll(/^\| `([a-z-]+)` \|/gm)]
    .map((match) => match[1])
    .filter((code) => code !== "reason" && code !== "status")
    .sort();
}

const parse = (version: string) => parseVersion(version)!;

describe("API contract: version and compatibility", () => {
  it("states the API version of the code", () => {
    expect(contract.match(/\*\*API version:\*\* `([^`]+)`/)?.[1]).toBe(EAGLE_API_VERSION);
  });

  it("has a compatibility table that agrees with isApiCompatible", () => {
    const rows = [...contract.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
    expect(rows.length).toBeGreaterThanOrEqual(7);
    for (const [, requested, provided, result] of rows) {
      const accepted = isApiCompatible(parse(requested), parse(provided));
      expect(accepted ? "accepted" : "rejected", `${requested} against ${provided}`).toBe(result);
    }
  });

  it("uses the current API version in its examples", () => {
    expect(contract).toContain(`apiVersion: "${EAGLE_API_VERSION}",\n    open:`);
    expect(contract).toContain(`{ apiVersion: "${EAGLE_API_VERSION}", module: "my-eagle-module", echo: "hello" }`);
  });

  it("names the API version that the current module version provides", () => {
    const moduleVersion = (JSON.parse(manifestRaw) as { version: string }).version;
    const table = between(contract, "| Module version | API version |", "The table gets a row");
    const rows = [...table.matchAll(/^\s*\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \|/gm)]
      .filter(([, version]) => compareVersions(parse(version), parse(moduleVersion)) <= 0)
      .sort((a, b) => compareVersions(parse(a[1]), parse(b[1])));
    const provided = rows.at(-1);
    expect(provided, `no row for module version ${moduleVersion}`).toBeDefined();
    expect(provided?.[2]).toBe(EAGLE_API_VERSION);
  });
});

describe("API contract: registration and requests", () => {
  it("lists the registration failure reasons of the code, in the table and in the TypeScript block", () => {
    const code = quoted(between(source("module-registry"), "export type RegistrationFailure", "export type RegistrationResult"));
    const table = tableCodes(
      between(contract, "**Failure reasons** (stable codes, part of the contract)", "Flight Control knows a module only if"),
    );
    const block = quoted(between(contract, "type RegistrationFailure", "type RegistrationResult"));
    expect(code).toHaveLength(7);
    expect(table).toEqual(code);
    expect(block).toEqual(code);
  });

  it("lists the request failure reasons of the code, in the table and in the TypeScript block", () => {
    const code = quoted(between(source("request-kernel"), "export type RequestFailure", "export type RequestResult"));
    const table = tableCodes(between(contract, "**Failure reasons of requests**", "Treat every reason you do not know"));
    const block = quoted(between(contract, "type RequestFailure", "type RequestResult"));
    expect(code).toHaveLength(11);
    expect(table).toEqual(code);
    expect(block).toEqual(code);
  });

  it("states the limits of the code", () => {
    const handlers = source("request-handlers");
    const echo = handlers.match(/MAX_ECHO_LENGTH = (\d+)/)?.[1];
    const uuid = handlers.match(/MAX_UUID_LENGTH = (\d+)/)?.[1];
    expect(flat).toContain(`within ${RELAY_TIMEOUT_MS / 1000} seconds`);
    expect(flat).toContain(`at most ${RELAY_TIMEOUT_MS / 1000} seconds`);
    expect(flat).toContain(`${MAX_RELAY_SIZE.toLocaleString("en-US")} characters`);
    expect(flat).toContain(`at most ${CONFIRM_TIMEOUT_MS / 1000} seconds`);
    expect(flat).toContain(`\`echo\` up to ${echo} characters`);
    expect(flat).toContain(`(up to ${uuid} characters)`);
  });

  it("lists the request types of the code, their versions and where each runs", () => {
    const handlers = defaultRequestHandlers(EAGLE_API_VERSION, () => ({ userId: "user", isGm: false }), NO_COMPENDIUMS);
    const rows = [...contract.matchAll(/^\| `([a-z]+\.[a-z]+)` \| `(\d+)` \| (your own client|the Gamemaster's client) \|/gm)];
    expect(rows.map((row) => row[1]).sort()).toEqual(handlers.map((handler) => handler.type).sort());
    for (const [, type, version, place] of rows) {
      const handler = handlers.find((candidate) => candidate.type === type)!;
      expect(handler.versions.map(String), type).toEqual([version]);
      expect(place, type).toBe((handler.runsOn ?? "caller") === "gm" ? "the Gamemaster's client" : "your own client");
    }
  });
});

describe("API contract: the API object, the rights and the game system", () => {
  const members = ["getRights", "getSystemInfo", "registerModule", "request", "version"];

  it("has the five members of the code in the text, the table and the TypeScript block", () => {
    const frozen = source("eagle-api").match(/return Object\.freeze\(\{ ([^}]+) \}\)/)?.[1] ?? "";
    expect(frozen.split(",").map((entry) => entry.trim().split(":")[0]).sort()).toEqual(members);

    const membersOf = (block: string) => [...block.matchAll(/^ {2}(?:readonly )?(\w+)[(:]/gm)].map((match) => match[1]).sort();
    expect(membersOf(between(source("eagle-api"), "export interface EagleFlightControlApi", "export interface ApiLogger"))).toEqual(members);
    expect(membersOf(between(contract, "interface EagleFlightControlApi", "declare global"))).toEqual(members);

    const offered = [...between(contract, "## What the API offers", "## Contents").matchAll(/^\| `(\w+)` \|/gm)].map((match) => match[1]);
    expect(offered.sort()).toEqual(members);
    expect(flat).toContain("exactly five members: `version`, `registerModule`, `request`, `getRights` and `getSystemInfo`");
  });

  it("has the rights levels and the getRights failures of the code in the text and the TypeScript block", () => {
    const levels = quoted(source("rights-table").match(/export type RightsLevel = ([^;]+);/)?.[1] ?? "");
    expect(levels).toEqual(["all", "denied", "own"]);
    expect(quoted(contract.match(/type RightsLevel = ([^;]+);/)?.[1] ?? "")).toEqual(levels);
    expect(tableCodes(between(contract, "| Level | Meaning |", "- **Defaults:**"))).toEqual(levels);

    const reasons = quoted(between(source("eagle-api"), "export type RightsQueryResult", "export interface RightsSource"));
    expect(reasons).toEqual(["internal-error", "invalid-request", "not-registered"]);
    expect(quoted(between(contract, "type RightsResult", "type SystemStatus"))).toEqual(reasons);
  });

  it("states every refusal text of the rights that the code uses", () => {
    const texts = new Set(
      [...source("request-rights").matchAll(/refuse\((["`])(.+?)\1\)/g)].map((match) => match[2].replace("${module}", "<id>")),
    );
    expect(texts.size).toBeGreaterThanOrEqual(4);
    for (const text of texts) expect(flat, text).toContain(text);
  });

  it("has the game system states of the code in the table and the TypeScript block", () => {
    const code = quoted(between(source("system-guard"), "export type SystemStatus", "export interface SystemInfo"));
    expect(code).toEqual(["other-system", "same-line", "tested", "unknown", "untested"]);
    expect(tableCodes(between(contract, "| `status` | Meaning |", "- **The list of tested versions**"))).toEqual(code);
    expect(quoted(between(contract, "type SystemStatus", "type SystemInfoResult"))).toEqual(code);
  });

  it("names the tested versions, the supported system and the notice of the code", () => {
    expect(flat).toContain(`Today it holds ${TESTED_SYSTEM_VERSIONS.map((version) => `\`${version}\``).join(", ")}`);
    expect(flat).toContain(`(\`${SUPPORTED_SYSTEM_ID}\`)`);
    expect(flat).toContain("eagleeye | game system: dnd5e 5.3.3 (tested)");
    expect(source("system-guard")).toContain("eagleeye | game system:");
    expect(flat).toContain("nothing is blocked because of the status");
    expect(flat).toContain("also gets one notification");
    expect(flat).toContain("nobody gets one for `tested` or `same-line`");
  });

  it("has the getSystemInfo failure of the code and its rules", () => {
    const reasons = quoted(between(source("eagle-api"), "export type SystemInfoResult", "export interface EagleFlightControlApi"));
    expect(reasons).toEqual(["internal-error"]);
    expect(quoted(between(contract, "type SystemInfoResult", "interface EagleFlightControlApi"))).toEqual(reasons);
    expect(flat).toContain("never throws; the only failure is `internal-error`");
    expect(flat).toContain("Call it from `ready` or later.");
  });
});

describe("API contract: structure", () => {
  it("keeps the section numbers 1 to 10 and lists every section in the contents", () => {
    const headings = [...contract.matchAll(/^## (\d+)\. (.+)$/gm)];
    expect(headings.map((match) => Number(match[1]))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const contents = between(contract, "## Contents", "## 1. Getting the API");
    for (const [, number, title] of headings) {
      const slug = `${number}-${title.toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/ /g, "-")}`;
      expect(contents, `section ${number}`).toContain(`${number}. [${title}](#${slug})`);
    }
  });

  it("names the steps of the project (\"part n\") only in the change history", () => {
    const outsideHistory = contract
      .split("\n")
      .filter((line) => !/^\| `\d+\.\d+\.\d+` \| Part \d+:/.test(line))
      .join("\n");
    expect(outsideHistory).not.toMatch(/\bparts? \d/i);
  });

  it("has one row per API version in the change history and ends with the current version", () => {
    const history = contract.slice(contract.indexOf("## 10. Change history"));
    const versions = [...history.matchAll(/^\| `(\d+\.\d+\.\d+)` \|/gm)].map((match) => match[1]);
    expect(versions.length).toBeGreaterThanOrEqual(7);
    expect(new Set(versions).size).toBe(versions.length);
    expect(versions).toEqual([...versions].sort((a, b) => compareVersions(parse(a), parse(b))));
    expect(versions.at(-1)).toBe(EAGLE_API_VERSION);
  });

  it("says when 1.0.0 comes and that requests are not limited", () => {
    expect(flat).toContain("the API stays below `1.0.0` until the first module outside Flight Control");
    expect(flat).toContain("**There is no limit** on how many requests a client may send or have waiting at once");
    expect(between(contract, "## 9. Not part of this version", "## 10. Change history")).toContain("A limit on how many requests");
  });

  it("does not list a feature of this version as not part of it", () => {
    const notPart = between(contract, "## 9. Not part of this version", "## 10. Change history");
    for (const word of ["getRights", "getSystemInfo", "game system", "confirmation", "rights per module"]) {
      expect(notPart, word).not.toContain(word);
    }
  });
});

describe("API contract: compendium.create and requests for a Gamemaster or Assistant only", () => {
  const handlers = defaultRequestHandlers(EAGLE_API_VERSION, () => ({ userId: "user", isGm: false }), NO_COMPENDIUMS);
  const compendia = between(contract, "**Compendia** (since API `0.8.0`)", "**The game system**");

  it("marks in the table of request types exactly the types that are for a Gamemaster or Assistant only", () => {
    const rows = between(contract, "**Request types in this version**", "Use `flightcontrol.ping`")
      .split("\n")
      .filter((line) => /^\| `[a-z]+\.[a-z]+` \|/.test(line));
    const marked = rows.filter((row) => row.includes("for a Gamemaster or Assistant only")).map((row) => row.split("`")[1]);
    expect(marked.sort()).toEqual(handlers.filter((handler) => handler.gmOnly === true).map((handler) => handler.type).sort());
  });

  it("marks every request type that runs on the Gamemaster's client and is not a proof as for a Gamemaster or Assistant only", () => {
    const changing = handlers.filter((handler) => handler.runsOn === "gm" && !handler.type.startsWith("flightcontrol."));
    expect(changing.map((handler) => handler.type)).toEqual(["compendium.create"]);
    for (const handler of changing) expect(handler.gmOnly, handler.type).toBe(true);
  });

  it("states the payload rules of compendium.create the way the code checks them", () => {
    const handler = handlers.find((candidate) => candidate.type === "compendium.create")!;
    const types = compendia.match(/The document type of the compendium: (.+?)\. \|/s)?.[1] ?? "";
    expect([...types.matchAll(/`([A-Za-z]+)`/g)].map((match) => match[1])).toEqual([...COMPENDIUM_DOCUMENT_TYPES]);
    const code = source("compendium-handlers");
    const nameLimit = code.match(/MAX_NAME_LENGTH = (\d+)/)?.[1];
    const labelLimit = code.match(/MAX_LABEL_LENGTH = (\d+)/)?.[1];
    expect(compendia).toContain(`at most ${labelLimit} characters`);
    expect(compendia).toContain(`at most ${nameLimit} characters`);
    expect(compendia).toContain("`^[a-z0-9]+([-_][a-z0-9]+)*$`");
    // the pattern in the text is the pattern in the code
    expect(code).toContain("/^[a-z0-9]+([-_][a-z0-9]+)*$/");
    // the examples of the contract pass the check of the code
    expect(handler.validate({ type: "Item", label: "Eagle Spells (2014)", name: "eagle-spells-2014" })).toMatchObject({ ok: true });
  });

  it("names the fields of the answer and says that asking again is safe and nothing else is changed", () => {
    expect(compendia).toContain("`{ created, collection, name, label, type, locked, ownership }`".replace(/`/g, "").length ? "created: true" : "");
    for (const field of ["created", "collection", "name", "label", "type", "locked", "ownership"]) {
      expect(source("compendium-handlers"), field).toMatch(new RegExp(`\\b${field}\\b`));
      expect(contract, field).toContain(field);
    }
    expect(flat).toContain("Asking again is safe");
    expect(flat).toContain("`created: false`");
    expect(flat).toContain("no lock and no ownership");
    expect(flat).toContain("Nothing is deleted, renamed or filled.");
  });

  it("states the rule for a Gamemaster or Assistant only, and its refusal text as the code gives it", () => {
    expect(flat).toContain("It is refused for every user who has neither the Gamemaster nor the Assistant role, **whatever level the module has for that user**");
    expect(flat).toContain("Every request type that changes the world is marked so.");
    expect(flat).toContain("`this request may only be made by a Gamemaster or Assistant`");
    expect(flat).toContain("the request type is for a Gamemaster or Assistant only and the user has neither role");
  });

  it("states the principle of request types: a Foundry operation, no document as data, safe to ask again, no type belongs to a module", () => {
    expect(flat).toContain("**no type of Flight Control belongs to a module**");
    expect(flat).toContain("A request names documents by UUID and never carries a document as data");
    expect(flat).toContain("a forwarded request may be at most 65,536 characters");
    expect(flat).toContain("A type that creates something answers \"it exists already\" when asked again");
  });

  it("says that a new request type raises the minor version of the API before 1.0.0, and gives the module version its row", () => {
    expect(flat).toContain("**A new request type does, until `1.0.0`:** it raises the minor version of the API");
    expect(flat).toContain("every new request type raises the minor version");
    expect(contract).toContain("| `0.2.0` | `0.8.0` |");
    expect(flat).not.toContain("New request types and new versions of a request type do not change the API version");
  });
});

/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import contractRaw from "../docs/api-contract.md?raw";
import manifestRaw from "../v13/module.json?raw";
import { compareVersions, EAGLE_API_VERSION, isApiCompatible, parseVersion } from "./api-version";
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
    const handlers = defaultRequestHandlers(EAGLE_API_VERSION, () => ({ userId: "user", isGm: false }));
    const rows = [...contract.matchAll(/^\| `(flightcontrol\.[a-z]+)` \| `(\d+)` \| (your own client|the Gamemaster's client) \|/gm)];
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

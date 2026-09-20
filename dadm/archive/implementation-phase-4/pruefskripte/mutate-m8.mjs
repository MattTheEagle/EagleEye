import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const scratch = "/tmp/claude-1000/-run-media-matt-Data-matt-Coding-FoundryVTT-EagleEye/9c37d4e4-e0ad-4c8b-8a54-8ab1bb2f3c6f/scratchpad/";
const outFile = scratch + "mutation-run.json";
const TESTS = ["core/api-contract.test.ts", "core/manifest.test.ts"];

const T = {
  version: "states the API version of the code",
  compat: "has a compatibility table that agrees with isApiCompatible",
  examples: "uses the current API version in its examples",
  moduleTable: "names the API version that the current module version provides",
  regCodes: "lists the registration failure reasons",
  reqCodes: "lists the request failure reasons",
  limits: "states the limits of the code",
  types: "lists the request types of the code",
  members: "has the five members of the code",
  levels: "has the rights levels and the getRights failures",
  refusals: "states every refusal text of the rights",
  states: "has the game system states of the code",
  tested: "names the tested versions, the supported system and the notice",
  sysInfo: "has the getSystemInfo failure of the code",
  sections: "keeps the section numbers 1 to 10",
  partN: "only in the change history",
  history: "has one row per API version in the change history",
  rule: "says when 1.0.0 comes",
  notPart: "does not list a feature of this version as not part of it",
  manId: "names the module and gives it a release version",
  manUrls: "points manifest, download and bugs at the release",
  manFiles: "loads the bundle and the English texts",
  manCompat: "is written for Foundry 13 only",
  manPlaceholder: "has no placeholder text left",
  pkgVersion: "has the version of the manifest",
  pkgDeps: "stays private, adds no dependency",
};

// Each mutation changes one place; `expect` names the test that has to turn red.
const mutations = [
  // --- contract side
  { id: "V1", file: "docs/api-contract.md", find: "**API version:** `0.7.0`", replace: "**API version:** `0.7.1`", expect: T.version },
  { id: "V2", file: "docs/api-contract.md", find: "| `0.1.0` | `0.2.0` | rejected (before", replace: "| `0.1.0` | `0.2.0` | accepted (before", expect: T.compat },
  { id: "V3", file: "docs/api-contract.md", find: 'apiVersion: "0.7.0",\n    open:', replace: 'apiVersion: "0.6.0",\n    open:', expect: T.examples },
  { id: "V4", file: "docs/api-contract.md", find: '{ apiVersion: "0.7.0", module: "my-eagle-module", echo: "hello" }', replace: '{ apiVersion: "0.6.0", module: "my-eagle-module", echo: "hello" }', expect: T.examples },
  { id: "V5", file: "docs/api-contract.md", find: "| `0.1.0` | `0.7.0` |", replace: "| `0.1.0` | `0.6.0` |", expect: T.moduleTable },
  { id: "R1", file: "docs/api-contract.md", find: "| `already-registered` |", replace: "| `already-known` |", expect: T.regCodes },
  { id: "R2", file: "docs/api-contract.md", find: '  | "no-gm"\n', replace: "", expect: T.reqCodes },
  { id: "R3", file: "docs/api-contract.md", find: "did not answer within 15 seconds", replace: "did not answer within 20 seconds", expect: T.limits },
  { id: "R4", file: "docs/api-contract.md", find: "at most 65,536 characters", replace: "at most 70,000 characters", expect: T.limits },
  { id: "R5", file: "docs/api-contract.md", find: "It waits at most 5 seconds.", replace: "It waits at most 6 seconds.", expect: T.limits },
  { id: "R6", file: "docs/api-contract.md", find: "| `flightcontrol.gmping` | `1` | the Gamemaster's client |", replace: "| `flightcontrol.gmping` | `1` | your own client |", expect: T.types },
  { id: "R7", file: "docs/api-contract.md", find: "(`echo` up to 200 characters)", replace: "(`echo` up to 100 characters)", expect: T.limits },
  { id: "A1", file: "docs/api-contract.md", find: "  getRights(moduleId: string): RightsResult;\n", replace: "", expect: T.members },
  { id: "A2", file: "docs/api-contract.md", find: "exactly five members", replace: "exactly six members", expect: T.members },
  { id: "A3", file: "docs/api-contract.md", find: "| `getSystemInfo` | Tells your module which game", replace: "| `getSystemState` | Tells your module which game", expect: T.members },
  { id: "A4", file: "docs/api-contract.md", find: 'type RightsLevel = "denied" | "own" | "all";', replace: 'type RightsLevel = "denied" | "own";', expect: T.levels },
  { id: "A5", file: "docs/api-contract.md", find: '"invalid-request" | "not-registered" | "internal-error";\n      readonly detail: string;\n    };\n\ntype SystemStatus', replace: '"invalid-request" | "internal-error";\n      readonly detail: string;\n    };\n\ntype SystemStatus', expect: T.levels },
  { id: "A6", file: "docs/api-contract.md", find: "may act only on targets this user owns", replace: "may act only on own targets", expect: T.refusals, all: true },
  { id: "A7", file: "docs/api-contract.md", find: "`the rights could not be set up, so nothing\n  is allowed`", replace: "`the rights setup failed`", expect: T.refusals },
  { id: "S1", file: "docs/api-contract.md", find: "| `same-line` | The version is not in the list", replace: "| `same-lane` | The version is not in the list", expect: T.states },
  { id: "S2", file: "docs/api-contract.md", find: "Today it holds `5.3.3`", replace: "Today it holds `5.3.2`", expect: T.tested },
  { id: "S3", file: "docs/api-contract.md", find: "also gets one notification", replace: "also gets two notifications", expect: T.tested },
  { id: "S4", file: "docs/api-contract.md", find: "the only failure is\n  `internal-error`", replace: "the only failure is\n  `internal-fail`", expect: T.sysInfo },
  { id: "S5", file: "docs/api-contract.md", find: "nothing is blocked because of the status", replace: "some things are blocked because of the status", expect: T.tested },
  { id: "N1", file: "docs/api-contract.md", find: "## 8. What is verified", replace: "## 7. What is verified", expect: T.sections },
  { id: "N2", file: "docs/api-contract.md", find: "6. [Manifest requirements for Eagle modules](#6-manifest-requirements-for-eagle-modules)\n", replace: "", expect: T.sections },
  { id: "N3", file: "docs/api-contract.md", find: "**The game system** (since API `0.7.0`)", replace: "**The game system (part 7)**", expect: T.partN },
  { id: "N4", file: "docs/api-contract.md", find: "later versions of this contract may add reasons", replace: "later parts of this contract may add reasons and part 8 will", expect: T.partN },
  { id: "N5", file: "docs/api-contract.md", apply: (t) => t.split("\n").filter((l) => !l.startsWith("| `0.7.0` | Part 7:")).join("\n"), expect: T.history },
  { id: "N6", file: "docs/api-contract.md", find: "**There is no limit**", replace: "**There is a limit**", expect: T.rule },
  { id: "N7", file: "docs/api-contract.md", find: "the API stays below `1.0.0` until the first module", replace: "the API stays below `1.0.0` after the first module", expect: T.rule },
  { id: "N8", file: "docs/api-contract.md", find: '(see "Forwarded requests" in section 4).', replace: '(see "Forwarded requests" in section 4). The game system is not part of this version.', expect: T.notPart },
  // --- code side
  { id: "C1", file: "core/request-relay.ts", find: "RELAY_TIMEOUT_MS = 15_000", replace: "RELAY_TIMEOUT_MS = 20_000", expect: T.limits },
  { id: "C2", file: "core/request-relay.ts", find: "MAX_RELAY_SIZE = 65_536", replace: "MAX_RELAY_SIZE = 70_000", expect: T.limits },
  { id: "C3", file: "core/request-identity.ts", find: "CONFIRM_TIMEOUT_MS = 5_000", replace: "CONFIRM_TIMEOUT_MS = 6_000", expect: T.limits },
  { id: "C4", file: "core/request-handlers.ts", find: "MAX_ECHO_LENGTH = 200", replace: "MAX_ECHO_LENGTH = 300", expect: T.limits },
  { id: "C5", file: "core/request-handlers.ts", find: "MAX_UUID_LENGTH = 200", replace: "MAX_UUID_LENGTH = 300", expect: T.limits },
  { id: "C6", file: "core/module-registry.ts", find: '  | "incompatible-api-version"\n  | "internal-error";', replace: '  | "incompatible-api-version"\n  | "brand-new"\n  | "internal-error";', expect: T.regCodes },
  { id: "C7", file: "core/request-kernel.ts", find: '| "not-permitted"', replace: '| "not-permitted"\n  | "too-many"', expect: T.reqCodes, first: true },
  { id: "C8", file: "core/eagle-api.ts", find: "return Object.freeze({ version: registry.apiVersion, registerModule, request, getRights, getSystemInfo });", replace: "return Object.freeze({ version: registry.apiVersion, registerModule, request, getRights, getSystemInfo, extra: 1 });", expect: T.members },
  { id: "C9", file: "core/rights-table.ts", find: 'export type RightsLevel = "denied" | "own" | "all";', replace: 'export type RightsLevel = "denied" | "own" | "some" | "all";', expect: T.levels },
  { id: "C10", file: "core/request-rights.ts", find: "may act only on targets this user owns", replace: "may act only on your own targets", expect: T.refusals },
  { id: "C11", file: "core/request-rights.ts", find: "the user of this request is not known", replace: "this user is not known", expect: T.refusals, all: true },
  { id: "C12", file: "core/system-guard.ts", find: 'Object.freeze(["5.3.3"])', replace: 'Object.freeze(["5.3.3", "5.4.0"])', expect: T.tested },
  { id: "C13", file: "core/system-guard.ts", find: '  | "unknown";', replace: '  | "unknown"\n  | "weird";', expect: T.states },
  { id: "C14", file: "core/request-handlers.ts", find: 'runsOn: "gm",', replace: 'runsOn: "caller",', expect: T.types, first: true },
  { id: "C15", file: "core/api-version.ts", find: 'EAGLE_API_VERSION = "0.7.0"', replace: 'EAGLE_API_VERSION = "0.7.1"', expect: T.version },
  { id: "C16", file: "core/api-version.ts", find: "if (requested.major === 0 && requested.minor !== provided.minor) return false;", replace: "", expect: T.compat },
  { id: "C17", file: "core/eagle-api.ts", find: 'readonly reason: "internal-error"; readonly detail: string };\n\nexport interface EagleFlightControlApi', replace: 'readonly reason: "internal-failure"; readonly detail: string };\n\nexport interface EagleFlightControlApi', expect: T.sysInfo },
  { id: "C18", file: "core/system-guard.ts", find: "eagleeye | game system:", replace: "eagleeye | system:", expect: T.tested },
  // --- manifest and package.json
  { id: "M1", file: "v13/module.json", find: '"version": "0.1.0"', replace: '"version": "0.2.0"', expect: T.manUrls },
  { id: "M2", file: "v13/module.json", find: '"version": "0.1.0"', replace: '"version": "0.2.0"', expect: T.pkgVersion },
  { id: "M3", file: "v13/module.json", find: '"name": "MattTheEagle"', replace: '"name": "Projektleiter"', expect: T.manPlaceholder },
  { id: "M4", file: "v13/module.json", find: '"esmodules": ["dist/module.js"]', replace: '"esmodules": ["module.js"]', expect: T.manFiles },
  { id: "M5", file: "v13/module.json", find: '"verified": "13"', replace: '"verified": "14"', expect: T.manCompat },
  { id: "M6", file: "v13/module.json", find: "releases/download/v13-v0.1.0/", replace: "releases/download/v13-v0.0.1/", expect: T.manUrls },
  { id: "M7", file: "v13/module.json", find: "Early release for testing.", replace: "In Entwicklung.", expect: T.manPlaceholder },
  { id: "M8", file: "v13/module.json", find: '"id": "eagleeye"', replace: '"id": "eagleeye2"', expect: T.manId },
  { id: "M9", file: "v13/module.json", find: '"path": "lang/en.json"', replace: '"path": "lang/de.json"', expect: T.manFiles },
  { id: "M10", file: "package.json", find: '"version": "0.1.0"', replace: '"version": "0.1.1"', expect: T.pkgVersion },
  { id: "M11", file: "package.json", find: '"devDependencies": {', replace: '"dependencies": { "left-pad": "1.3.0" },\n  "devDependencies": {', expect: T.pkgDeps },
  { id: "M12", file: "package.json", find: '"package": "node v13/package.mjs"', replace: '"pack": "node v13/package.mjs"', expect: T.pkgDeps },
  { id: "M13", file: "package.json", find: '"private": true', replace: '"private": false', expect: T.pkgDeps },
];

const only = process.argv[2];
const selected = only ? mutations.filter((m) => m.id === only) : mutations;
const originals = new Map();
for (const mutation of selected) if (!originals.has(mutation.file)) originals.set(mutation.file, readFileSync(root + mutation.file, "utf8"));

function runTests() {
  try {
    execFileSync(root + "node_modules/.bin/vitest", ["run", ...TESTS, "--reporter=json", `--outputFile=${outFile}`], { cwd: root, stdio: "ignore" });
  } catch {
    // a failing run exits non-zero; the result file tells what failed
  }
  const result = JSON.parse(readFileSync(outFile, "utf8"));
  const failed = [];
  for (const file of result.testResults) for (const test of file.assertionResults) if (test.status === "failed") failed.push(test.fullName);
  return { failed, total: result.numTotalTests, unloaded: result.testResults.filter((f) => f.status === "failed" && f.assertionResults.length === 0).length };
}

let found = 0;
let problems = 0;
try {
  for (const mutation of selected) {
    const original = originals.get(mutation.file);
    let mutated;
    if (mutation.apply) {
      mutated = mutation.apply(original);
      if (mutated === original) {
        console.log(`${mutation.id.padEnd(4)} FEHLER: die Verstellung hat nichts geändert`);
        problems++;
        continue;
      }
    } else {
      const count = original.split(mutation.find).length - 1;
      if (count < 1) {
        console.log(`${mutation.id.padEnd(4)} FEHLER: Suchtext nicht gefunden (${mutation.file})`);
        problems++;
        continue;
      }
      if (count > 1 && !mutation.all && !mutation.first) {
        console.log(`${mutation.id.padEnd(4)} FEHLER: Suchtext ${count}x gefunden, ohne first/all (${mutation.file})`);
        problems++;
        continue;
      }
      mutated = mutation.first ? original.replace(mutation.find, mutation.replace) : original.split(mutation.find).join(mutation.replace);
    }
    writeFileSync(root + mutation.file, mutated);
    const { failed, unloaded } = runTests();
    writeFileSync(root + mutation.file, original);
    const hit = failed.some((name) => name.includes(mutation.expect));
    if (hit) found++;
    else problems++;
    console.log(`${mutation.id.padEnd(4)} ${hit ? "gefunden " : "NICHT GEFUNDEN"} ${mutation.file}  erwartet: "${mutation.expect}"${hit ? "" : `\n       rot waren: ${failed.length ? failed.join(" | ") : "keiner"}${unloaded ? ` (Datei nicht ladbar: ${unloaded})` : ""}`}`);
  }
} finally {
  for (const [file, text] of originals) writeFileSync(root + file, text);
}

let restored = true;
for (const [file, text] of originals) if (readFileSync(root + file, "utf8") !== text) restored = false;
const after = runTests();
console.log(`\n${found} von ${selected.length} Verstellungen gefunden, ${problems} Problem(e); Dateien wiederhergestellt: ${restored}; Lauf danach: ${after.failed.length} rot von ${after.total}`);
process.exit(problems === 0 && restored && after.failed.length === 0 ? 0 : 1);

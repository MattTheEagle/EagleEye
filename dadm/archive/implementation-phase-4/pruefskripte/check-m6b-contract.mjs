import { readFileSync } from "node:fs";
import { parseVersion, isApiCompatible } from "./api-version.mjs";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const read = (path) => readFileSync(root + path, "utf8");
const doc = read("docs/api-contract.md");
const kernel = read("core/request-kernel.ts");
const relay = read("core/request-relay.ts");
const identity = read("core/request-identity.ts");
const versionTs = read("core/api-version.ts");
const handlers = read("core/request-handlers.ts");
const rights = read("core/request-rights.ts");
const table = read("core/rights-table.ts");
const api = read("core/eagle-api.ts");
const hub = read("core/rights-hub.ts");
const lang = JSON.parse(read("v13/lang/en.json"));

const between = (text, a, b) => text.slice(text.indexOf(a), text.indexOf(b, text.indexOf(a) + a.length));
const codesOf = (text) => [...text.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
const tableCodes = (block) => [...block.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).filter((c) => c !== "reason").sort();
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const num = (text, name) => Number(text.match(new RegExp(name + " = ([\\d_]+)"))[1].replaceAll("_", ""));

let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "ok   " : "FEHLT"} ${name}${extra ? " " + extra : ""}`);
};

// --- version
const constant = versionTs.match(/EAGLE_API_VERSION = "([^"]+)"/)[1];
const docVersion = doc.match(/\*\*API version:\*\* `([^`]+)`/)[1];
check("API-Version Vertrag = Konstante", docVersion === constant, `(${docVersion} / ${constant})`);

const rows = [...doc.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
let bad = 0;
for (const [, req, prov, expected] of rows) if ((isApiCompatible(parseVersion(req), parseVersion(prov)) ? "accepted" : "rejected") !== expected) { bad++; console.log("MISMATCH", req, prov); }
check("Kompatibilitaets-Tabelle stimmt mit der Logik", bad === 0, `(${rows.length} Zeilen)`);

// --- failure codes of requests
const code = codesOf(between(kernel, "export type RequestFailure", "export type RequestResult"));
const tab = tableCodes(between(doc, "**Failure reasons of requests**", "Treat every reason you do not know"));
const block = codesOf(between(doc, "type RequestFailure", "type RequestResult"));
check("Request-Codes Code = Tabelle = TS-Block", same(code, tab) && same(code, block), `(${code.length}, ${tab.length}, ${block.length})`);

// --- limits
const relayMs = num(relay, "RELAY_TIMEOUT_MS"), size = num(relay, "MAX_RELAY_SIZE"), confirmMs = num(identity, "CONFIRM_TIMEOUT_MS");
const fmt = size.toLocaleString("en-US");
check("Grenzen im Vertrag (15 s, 65,536 Zeichen, 5 s)", doc.includes(`within ${relayMs / 1000} seconds`) && doc.includes(`${fmt} characters`) && doc.includes(`at most ${confirmMs / 1000} seconds`));

// --- request types
const codeTypes = [...handlers.matchAll(/type: "(flightcontrol\.[a-z]+)"/g)].map((m) => m[1]);
const docTypes = [...doc.matchAll(/^\| `(flightcontrol\.[a-z]+)` \| `1` \|/gm)].map((m) => m[1]);
check("Anfragetypen Code = Vertragstabelle", same(codeTypes, docTypes), `(${codeTypes.join(", ")})`);
check("Vertrag: 'three request types'", doc.includes("offers three request"));
check("Vertrag: targetping-Ergebnis stimmt mit dem Code", doc.includes("{ apiVersion, module, uuid, askedBy }") && handlers.includes("{ apiVersion, module: context.module.id, uuid: payload.uuid, askedBy: context.user?.id ?? null }"));
check("Vertrag: uuid bis 200 Zeichen = Konstante", doc.includes("up to 200 characters") && handlers.includes("MAX_UUID_LENGTH = 200"));

// --- rights: levels, texts, api
const levelsCode = codesOf(between(table, "export type RightsLevel", "// The levels that are stored")).sort();
const levelsDoc = [...between(doc, "| Level | Meaning |", "- **Defaults:**").matchAll(/^\| `([a-z]+)` \|/gm)].map((m) => m[1]).sort();
check("Stufen Code = Vertragstabelle", same(levelsCode, levelsDoc), `(${levelsCode.join(", ")})`);

const details = [
  'module "<id>" may not be used by this user',
  'module "<id>" may act only on targets this user owns',
  "the user of this request is not known",
  "the rights could not be read, so nothing is allowed until they can",
  "the rights could not be checked",
];
const codeDetails = [
  'module "${module}" may not be used by this user',
  'module "${module}" may act only on targets this user owns',
  "the user of this request is not known",
  "the rights could not be read, so nothing is allowed until they can",
  "the rights could not be checked",
];
details.forEach((text, i) => {
  const inDoc = doc.replace(/\s+/g, " ").includes(text.replace(/\s+/g, " "));
  const inCode = (rights + kernel).includes(codeDetails[i]);
  check(`Ablehnungstext im Vertrag und im Code: ${text}`, inDoc && inCode);
});

const apiMembers = api.match(/return Object\.freeze\(\{ ([^}]+) \}\)/)[1].split(",").map((x) => x.trim().split(":")[0]).sort();
check("API-Mitglieder (Code) = vier", same(apiMembers, ["getRights", "registerModule", "request", "version"]), `(${apiMembers.join(", ")})`);
check("Vertrag: 'exactly four members'", doc.includes("exactly four members: `version`, `registerModule`, `request` and `getRights`"));
const apiReasons = codesOf(between(api, "export type RightsQueryResult", "// Where getRights gets"));
const docReasons = codesOf(between(doc, "type RightsResult", "interface EagleFlightControlApi"));
check("getRights-Gruende Code = TS-Block im Vertrag", same(apiReasons.filter((r) => r !== "ok"), docReasons.filter((r) => r !== "ok")), `(${apiReasons.join(", ")})`);
check("Vertrag: Beispiel Anmeldung mit 0.6.0", /apiVersion: "0\.6\.0",\n    open:/.test(doc));
check("Vertrag: ping-Beispiel mit 0.6.0", doc.includes('{ apiVersion: "0.6.0", module: "my-eagle-module", echo: "hello" }'));
check("Vertrag: Titel 'parts 1 to 6'", /^# Eagle Flight Control — API contract, parts 1 to 6/m.test(doc));
check("Vertrag: Standardwerte GM/Assistent immer, Rest denied", doc.includes("may always use every module") && doc.includes("start with `denied`"));
check("Vertrag: Ablage 'eagleeye.rights' (Vertrag) = Code", doc.includes("`eagleeye.rights`") && read("v13/rights.ts").includes('"eagleeye.rights"') && read("v13/rights.ts").includes('RIGHTS_SETTING = "rights"'));
check("Vertrag: Historie 0.6.0 nach 0.5.0", doc.indexOf("| `0.5.0` |") < doc.indexOf("| `0.6.0` |"));
check("Vertrag: Teil 6 unter 'Not verified'", doc.includes("part 6, the rights per module and user"));
check("Vertrag: 'Not part of this version' nennt drei Nachweis-Typen", doc.includes("only the three proofs exist"));
check("Vertrag: Live-Check-Vermerk ohne 'not been run live'", !doc.includes("has not been run live yet"));
check("Vertrag: getRights ab 'ready' aufrufen", doc.includes("Call it from `ready` or later"));

// --- hub texts
const write = codesOf(between(hub, "export type RightsWriteFailure", "export type RightsWriteResult"));
check("Hub-Schreibfehler im Code", same(write, ["invalid-value", "not-allowed", "not-permitted", "unknown-user", "write-failed"]), `(${write.join(", ")})`);
const keys = ["hub.rights.title", "hub.rights.hint", "hub.rights.unreadable", "hub.rights.noPlayers", "hub.rights.level.denied", "hub.rights.level.own", "hub.rights.level.all", "hub.notify.rightsNotPermitted", "hub.notify.rightsFailed"];
for (const key of keys) check(`Sprachschluessel EAGLEEYE.${key}`, key.split(".").reduce((o, k) => o?.[k], lang.EAGLEEYE) !== undefined);

console.log(failures === 0 ? "\nalle Pruefungen ok" : `\n${failures} Pruefung(en) fehlgeschlagen`);
process.exit(failures === 0 ? 0 : 1);

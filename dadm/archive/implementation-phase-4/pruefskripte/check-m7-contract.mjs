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
const api = read("core/eagle-api.ts");
const guard = read("core/system-guard.ts");
const shell = read("v13/system.ts");
const module = read("v13/module.ts");
const lang = JSON.parse(read("v13/lang/en.json"));
const rights = read("core/request-rights.ts");

const between = (text, a, b) => text.slice(text.indexOf(a), text.indexOf(b, text.indexOf(a) + a.length));
const codesOf = (text) => [...text.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
const tableCodes = (block) => [...block.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).filter((c) => c !== "reason" && c !== "status").sort();
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const num = (text, name) => Number(text.match(new RegExp(name + " = ([\\d_]+)"))[1].replaceAll("_", ""));

let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "ok   " : "FEHLT"} ${name}${extra ? " " + extra : ""}`);
};

// --- version and compatibility
const constant = versionTs.match(/EAGLE_API_VERSION = "([^"]+)"/)[1];
const docVersion = doc.match(/\*\*API version:\*\* `([^`]+)`/)[1];
check("API-Version Vertrag = Konstante", docVersion === constant, `(${docVersion} / ${constant})`);
const rows = [...doc.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
let bad = 0;
for (const [, req, prov, expected] of rows) if ((isApiCompatible(parseVersion(req), parseVersion(prov)) ? "accepted" : "rejected") !== expected) bad++;
check("Kompatibilitaets-Tabelle stimmt mit der Logik", bad === 0, `(${rows.length} Zeilen)`);
check("Vertrag: Titel 'parts 1 to 7'", /^# Eagle Flight Control — API contract, parts 1 to 7/m.test(doc));
check("Vertrag: Beispiel Anmeldung mit 0.7.0", /apiVersion: "0\.7\.0",\n    open:/.test(doc));
check("Vertrag: ping-Beispiel mit 0.7.0", doc.includes('{ apiVersion: "0.7.0", module: "my-eagle-module", echo: "hello" }'));
check("Vertrag: Historie 0.7.0 nach 0.6.0", doc.indexOf("| `0.6.0` |") < doc.indexOf("| `0.7.0` |"));

// --- request part unchanged
const code = codesOf(between(kernel, "export type RequestFailure", "export type RequestResult"));
const tab = tableCodes(between(doc, "**Failure reasons of requests**", "Treat every reason you do not know"));
const block = codesOf(between(doc, "type RequestFailure", "type RequestResult"));
check("Request-Codes Code = Tabelle = TS-Block", same(code, tab) && same(code, block), `(${code.length}, ${tab.length}, ${block.length})`);
const relayMs = num(relay, "RELAY_TIMEOUT_MS"), size = num(relay, "MAX_RELAY_SIZE"), confirmMs = num(identity, "CONFIRM_TIMEOUT_MS");
check("Grenzen im Vertrag (15 s, 65,536 Zeichen, 5 s)", doc.includes(`within ${relayMs / 1000} seconds`) && doc.includes(`${size.toLocaleString("en-US")} characters`) && doc.includes(`at most ${confirmMs / 1000} seconds`));
const codeTypes = [...handlers.matchAll(/type: "(flightcontrol\.[a-z]+)"/g)].map((m) => m[1]);
const docTypes = [...doc.matchAll(/^\| `(flightcontrol\.[a-z]+)` \| `1` \|/gm)].map((m) => m[1]);
check("Anfragetypen Code = Vertragstabelle (unveraendert drei)", same(codeTypes, docTypes) && codeTypes.length === 3, `(${codeTypes.join(", ")})`);

// --- part 7: states, list, texts, api
const statesCode = codesOf(between(guard, "export type SystemStatus", "export interface SystemInfo")).filter((x) => !["dnd5e"].includes(x));
const statesTable = tableCodes(between(doc, "| `status` | Meaning |", "- **The list of tested versions**"));
check("Zustaende Code = Vertragstabelle", same(statesCode, statesTable), `(${statesCode.join(", ")})`);
const statesTs = codesOf(between(doc, "type SystemStatus", "type SystemInfoResult"));
check("Zustaende Code = TS-Block im Vertrag", same(statesCode, statesTs));
const listed = guard.match(/TESTED_SYSTEM_VERSIONS: readonly string\[\] = Object\.freeze\(\[([^\]]*)\]\)/)[1].replaceAll('"', "").split(",").map((x) => x.trim());
check("Liste getesteter Versionen im Vertrag (Code: " + listed.join(", ") + ")", doc.includes(`Today it holds ${listed.map((v) => "`" + v + "`").join(", ")}`));
check("unterstuetzte Kennung dnd5e (Code und Vertrag)", guard.includes('SUPPORTED_SYSTEM_ID = "dnd5e"') && doc.includes("`dnd5e`"));
const apiMembers = api.match(/return Object\.freeze\(\{ ([^}]+) \}\)/)[1].split(",").map((x) => x.trim().split(":")[0]).sort();
check("API-Mitglieder (Code) = fuenf", same(apiMembers, ["getRights", "getSystemInfo", "registerModule", "request", "version"]), `(${apiMembers.join(", ")})`);
check("Vertrag: 'exactly five members'", /exactly five members: `version`, `registerModule`, `request`, `getRights` and\s+`getSystemInfo`/.test(doc));
check("Vertrag: getSystemInfo im TS-Interface", doc.includes("getSystemInfo(): SystemInfoResult;"));
const sysReasons = codesOf(between(api, "export type SystemInfoResult", "export interface EagleFlightControlApi")).filter((x) => x !== "ok");
const docSysReasons = codesOf(between(doc, "type SystemInfoResult", "interface EagleFlightControlApi")).filter((x) => x !== "ok");
check("getSystemInfo-Gruende Code = TS-Block im Vertrag", same(sysReasons, docSysReasons), `(${sysReasons.join(", ")})`);
check("Vertrag: getSystemInfo ab 'ready' aufrufen und nie eine Ausnahme", doc.includes("Call it from `ready` or later.") && doc.includes("never throws; the only failure is"));

// notice keys: code -> lang -> contract mentions
const keys = [...guard.matchAll(/"EAGLEEYE\.system\.([A-Za-z]+)"/g)].map((m) => m[1]).sort();
check("Hinweisschluessel im Code stehen in der Sprachdatei", keys.length === 3 && keys.every((k) => typeof lang.EAGLEEYE.system?.[k] === "string" && lang.EAGLEEYE.system[k].length > 0), `(${keys.join(", ")})`);
check("Log-Zeile im Vertrag = Code", doc.includes("eagleeye | game system: dnd5e 5.3.3 (tested)") && guard.includes("eagleeye | game system:"));
check("Vertrag: nichts wird gesperrt", doc.includes("nothing is blocked because of the status"));
check("Vertrag: Hinweis nur fuer GM-Rolle, nicht fuer tested und same-line", doc.includes("Gamemaster role (Gamemaster or Assistant) also gets one notification") && doc.includes("nobody gets one for `tested` or `same-line`"));
check("Huelle liest game.system.id und game.system.version", shell.includes("game.system?.id") && shell.includes("game.system?.version"));
check("ready-Hook ruft announceSystem mit der GM-Pruefung", module.includes('Hooks.once("ready"') && module.includes("announceSystem(systemSource") && module.includes("game.user?.isGM === true"));
check("Vertrag: Teil 7 unter 'Not verified'", doc.includes("part 7, the game system guard: the notification for a Gamemaster"));
check("Vertrag: 'Not part of this version' ohne Versionswaechter", !between(doc, "## 9. Not part of this version", "## 10.").includes("system version guard"));
check("Abschnittsnummern unveraendert (8 = What is verified, 9 = Not part, 10 = Change history)", /^## 8\. What is verified/m.test(doc) && /^## 9\. Not part of this version/m.test(doc) && /^## 10\. Change history/m.test(doc));
check("Vertrag: Kopf nennt Teil 7", doc.includes("(part 7)"));

console.log(failures === 0 ? "\nalle Pruefungen ok" : `\n${failures} Pruefung(en) fehlgeschlagen`);
process.exit(failures === 0 ? 0 : 1);

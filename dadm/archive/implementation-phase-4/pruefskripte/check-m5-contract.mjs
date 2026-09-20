import { readFileSync } from "node:fs";
import { parseVersion, isApiCompatible } from "./api-version.mjs";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const doc = readFileSync(root + "docs/api-contract.md", "utf8");
const kernel = readFileSync(root + "core/request-kernel.ts", "utf8");
const relay = readFileSync(root + "core/request-relay.ts", "utf8");
const versionTs = readFileSync(root + "core/api-version.ts", "utf8");
const handlers = readFileSync(root + "core/request-handlers.ts", "utf8");

const between = (text, a, b) => text.slice(text.indexOf(a), text.indexOf(b, text.indexOf(a) + a.length));
const codesOf = (text) => [...text.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
const tableCodes = (block) => [...block.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).filter((c) => c !== "reason").sort();
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

const constant = versionTs.match(/EAGLE_API_VERSION = "([^"]+)"/)[1];
const docVersion = doc.match(/\*\*API version:\*\* `([^`]+)`/)[1];
console.log("API-Version Vertrag / Konstante:", docVersion, "/", constant, "| gleich:", docVersion === constant);

const rows = [...doc.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
let bad = 0;
for (const [, req, prov, expected] of rows) {
  if ((isApiCompatible(parseVersion(req), parseVersion(prov)) ? "accepted" : "rejected") !== expected) { bad++; console.log("MISMATCH", req, prov); }
}
console.log(`Kompatibilitaets-Tabelle: ${rows.length} Zeilen, ${bad} Abweichungen`);

const code = codesOf(between(kernel, "export type RequestFailure", "export type RequestResult"));
const table = tableCodes(between(doc, "**Failure reasons of requests**", "Treat every reason you do not know"));
const block = codesOf(between(doc, "type RequestFailure", "type RequestResult"));
console.log("Request-Codes Code/Tabelle/TS-Block:", code.length, table.length, block.length, "| identisch:", same(code, table) && same(code, block));
console.log("  Codes:", code.join(", "));

// numbers in the contract text against the constants in the code
const timeout = Number(relay.match(/RELAY_TIMEOUT_MS = ([\d_]+)/)[1].replaceAll("_", ""));
const size = Number(relay.match(/MAX_RELAY_SIZE = ([\d_]+)/)[1].replaceAll("_", ""));
console.log(`Grenzen im Code: ${timeout} ms, ${size} Zeichen | im Vertrag: "${timeout / 1000} seconds" ${doc.includes(`within ${timeout / 1000} seconds`)} ; "${size.toLocaleString("en-US")} characters" ${doc.includes(`${size.toLocaleString("en-US")} characters`)}`);

// request types in the contract table against the handlers in the code
const codeTypes = [...handlers.matchAll(/type: "(flightcontrol\.[a-z]+)"/g)].map((m) => m[1]);
const docTypes = [...doc.matchAll(/^\| `(flightcontrol\.[a-z]+)` \| `1` \|/gm)].map((m) => m[1]);
console.log("Anfragetypen Code / Vertragstabelle:", codeTypes.join(", "), "/", docTypes.join(", "), "| gleich:", same(codeTypes, docTypes));
console.log("runsOn im Code: gmping=gm", /type: "flightcontrol\.gmping",\s*versions: \[1\],\s*runsOn: "gm"/.test(handlers), "| ping ohne runsOn", !/type: "flightcontrol\.ping",[^}]*runsOn/.test(handlers));

const checks = {
  "Titel 'parts 1 to 4'": /^# Eagle Flight Control — API contract, parts 1 to 4/m.test(doc),
  "Registrierungsbeispiel mit 0.4.0": /apiVersion: "0\.4\.0",\n    open:/.test(doc),
  "ping-Beispiel mit apiVersion 0.4.0": /\{ apiVersion: "0\.4\.0", module: "my-eagle-module", echo: "hello" \}/.test(doc),
  "Abschnitt 'Where a request runs'": doc.includes("**Where a request runs:**"),
  "Abschnitt 'Forwarded requests'": doc.includes("**Forwarded requests**"),
  "Spalte 'Runs on' in der Typ-Tabelle": doc.includes("| Type | Version | Runs on | Payload | Result |"),
  "relay-timeout: unbekannter Ausgang": doc.includes("The outcome is unknown"),
  "Aenderungshistorie 0.4.0": /\| `0\.4\.0` \| Part 4/.test(doc),
  "Weiterleitung nicht mehr unter 'Not part'": !/the forwarding of requests to the Gamemaster/.test(doc),
  "Weiterleitung unter 'Not verified' genannt": doc.includes("part 4, the relay"),
  "Hub-Tabelle nennt den Schieberegler": doc.includes("a slider with a number field"),
  "kein Rest 'API 0.3.0' ausser Live-Check und Historie": (doc.match(/0\.3\.0/g) ?? []).length === 2,
};
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? "ok   " : "FEHLT"} ${name}`);
console.log("Abschnitte:", [...doc.matchAll(/^## (\d+)\. (.+)$/gm)].map((m) => `${m[1]} ${m[2]}`).join(" | "));

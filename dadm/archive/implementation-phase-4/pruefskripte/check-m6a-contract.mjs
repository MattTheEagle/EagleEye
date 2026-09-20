import { readFileSync } from "node:fs";
import { parseVersion, isApiCompatible } from "./api-version.mjs";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const doc = readFileSync(root + "docs/api-contract.md", "utf8");
const kernel = readFileSync(root + "core/request-kernel.ts", "utf8");
const relay = readFileSync(root + "core/request-relay.ts", "utf8");
const identity = readFileSync(root + "core/request-identity.ts", "utf8");
const versionTs = readFileSync(root + "core/api-version.ts", "utf8");
const handlers = readFileSync(root + "core/request-handlers.ts", "utf8");
const shell = readFileSync(root + "v13/relay.ts", "utf8");

const between = (text, a, b) => text.slice(text.indexOf(a), text.indexOf(b, text.indexOf(a) + a.length));
const codesOf = (text) => [...text.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
const tableCodes = (block) => [...block.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).filter((c) => c !== "reason").sort();
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
const num = (text, name) => Number(text.match(new RegExp(name + " = ([\\d_]+)"))[1].replaceAll("_", ""));

const constant = versionTs.match(/EAGLE_API_VERSION = "([^"]+)"/)[1];
const docVersion = doc.match(/\*\*API version:\*\* `([^`]+)`/)[1];
console.log("API-Version Vertrag / Konstante:", docVersion, "/", constant, "| gleich:", docVersion === constant);

const rows = [...doc.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
let bad = 0;
for (const [, req, prov, expected] of rows) if ((isApiCompatible(parseVersion(req), parseVersion(prov)) ? "accepted" : "rejected") !== expected) { bad++; console.log("MISMATCH", req, prov); }
console.log(`Kompatibilitaets-Tabelle: ${rows.length} Zeilen, ${bad} Abweichungen`);

const code = codesOf(between(kernel, "export type RequestFailure", "export type RequestResult"));
const table = tableCodes(between(doc, "**Failure reasons of requests**", "Treat every reason you do not know"));
const block = codesOf(between(doc, "type RequestFailure", "type RequestResult"));
console.log("Request-Codes Code/Tabelle/TS-Block:", code.length, table.length, block.length, "| identisch:", same(code, table) && same(code, block));

const relayMs = num(relay, "RELAY_TIMEOUT_MS"), size = num(relay, "MAX_RELAY_SIZE"), confirmMs = num(identity, "CONFIRM_TIMEOUT_MS");
const fmt = size.toLocaleString("en-US");
console.log(`Grenzen im Code: ${relayMs} ms, ${size} Zeichen, Bestaetigung ${confirmMs} ms | im Vertrag: "${relayMs / 1000} seconds" ${doc.includes(`within ${relayMs / 1000} seconds`)}; "${fmt} characters" ${doc.includes(`${fmt} characters`)}; "at most ${confirmMs / 1000} seconds" ${doc.includes(`at most ${confirmMs / 1000} seconds`)}`);

const codeTypes = [...handlers.matchAll(/type: "(flightcontrol\.[a-z]+)"/g)].map((m) => m[1]);
const docTypes = [...doc.matchAll(/^\| `(flightcontrol\.[a-z]+)` \| `1` \|/gm)].map((m) => m[1]);
console.log("Anfragetypen Code / Vertragstabelle:", codeTypes.join(", "), "/", docTypes.join(", "), "| gleich:", same(codeTypes, docTypes));

const queries = [...shell.matchAll(/export const (RELAY|CONFIRM)_QUERY = "([^"]+)"/g)].map((m) => m[2]);
console.log("Query-Namen in der Huelle:", queries.join(", "), "| Praefix eagleeye.:", queries.every((q) => q.startsWith("eagleeye.")));

const checks = {
  "Titel 'parts 1 to 5'": /^# Eagle Flight Control — API contract, parts 1 to 5/m.test(doc),
  "Registrierungsbeispiel mit 0.5.0": /apiVersion: "0\.5\.0",\n    open:/.test(doc),
  "ping-Beispiel mit apiVersion 0.5.0": /\{ apiVersion: "0\.5\.0", module: "my-eagle-module", echo: "hello" \}/.test(doc),
  "Abschnitt 'Who asked (forwarded requests)'": doc.includes("**Who asked (forwarded requests)**"),
  "not-permitted nennt die unbestaetigte Identitaet": doc.includes("the asking user could not be confirmed"),
  "askedBy im gmping-Ergebnis (Vertrag und Code)": doc.includes("askedBy }`") && handlers.includes("askedBy: context.user?.id ?? null"),
  "Historie 0.5.0 nach 0.4.0": doc.indexOf("| `0.4.0` |") < doc.indexOf("| `0.5.0` |"),
  "Teil 5 unter 'Not verified'": doc.includes("part 5, the confirmation"),
  "Spike-Beobachtungen unter 'Verified'": doc.includes("Observed with a test module (not Flight Control) on 2026-09-20"),
  "Live-Check-Vermerk nennt Teil 5 als nicht live": doc.includes("part 5 has not been run live yet"),
  "Kernel/Relais: fail closed, nicht bestaetigt gibt not-permitted": /"not-permitted", "the asking user could not be confirmed"/.test(relay),
};
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? "ok   " : "FEHLT"} ${name}`);
console.log("Vorkommen von 0.4.0 im Vertrag:", (doc.match(/0\.4\.0/g) ?? []).length, "(Live-Check-Vermerk und Historie erwartet)");
console.log("Abschnitte:", [...doc.matchAll(/^## (\d+)\. (.+)$/gm)].map((m) => `${m[1]} ${m[2]}`).join(" | "));

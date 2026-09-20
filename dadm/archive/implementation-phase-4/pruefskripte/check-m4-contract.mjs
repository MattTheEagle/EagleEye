import { readFileSync } from "node:fs";
import { parseVersion, isApiCompatible, EAGLE_API_VERSION } from "./api-version.mjs";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const doc = readFileSync(root + "docs/api-contract.md", "utf8");
const registry = readFileSync(root + "core/module-registry.ts", "utf8");
const kernel = readFileSync(root + "core/request-kernel.ts", "utf8");

const codesOf = (text) => [...text.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
const between = (text, a, b) => text.slice(text.indexOf(a), text.indexOf(b, text.indexOf(a) + a.length));
const tableCodes = (block) => [...block.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).filter((c) => c !== "reason").sort();
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);

console.log("API-Version im Vertrag:", (doc.match(/\*\*API version:\*\* `([^`]+)`/) ?? [])[1], "| Konstante:", EAGLE_API_VERSION);

const rows = [...doc.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
let bad = 0;
for (const [, req, prov, expected] of rows) {
  if ((isApiCompatible(parseVersion(req), parseVersion(prov)) ? "accepted" : "rejected") !== expected) { bad++; console.log("MISMATCH", req, prov); }
}
console.log(`Kompatibilitaets-Tabelle: ${rows.length} Zeilen, ${bad} Abweichungen`);

const regCode = codesOf(between(registry, "export type RegistrationFailure", "export type RegistrationResult"));
const regTable = tableCodes(between(doc, "**Failure reasons** (stable codes, part of the contract)", "Flight Control knows a module only"));
const regBlock = codesOf(between(doc, "type RegistrationFailure", "type RegistrationResult"));
console.log("Registrierung Code/Tabelle/TS-Block:", regCode.length, regTable.length, regBlock.length, "| identisch:", same(regCode, regTable) && same(regCode, regBlock));

const reqCode = codesOf(between(kernel, "export type RequestFailure", "export type RequestResult"));
const reqTable = tableCodes(between(doc, "**Failure reasons of requests**", "Treat every reason you do not know"));
const reqBlock = codesOf(between(doc, "type RequestFailure", "type RequestResult"));
console.log("Requests     Code/Tabelle/TS-Block:", reqCode.length, reqTable.length, reqBlock.length, "| identisch:", same(reqCode, reqTable) && same(reqCode, reqBlock));

const checks = {
  "'request' im TS-Block der API": /request\(request: \{\s*module: string;\s*type: string;\s*version\?: number;\s*payload\?: JsonValue;\s*\}\): Promise<RequestResult>;/.test(doc),
  "Abschnitt '4. Requests'": /^## 4\. Requests$/m.test(doc),
  "ping-Beispiel mit apiVersion 0.3.0": /\{ apiVersion: "0\.3\.0", module: "my-eagle-module", echo: "hello" \}/.test(doc),
  "ping in der Typ-Tabelle": /\| `flightcontrol\.ping` \| `1` \|/.test(doc),
  "Aenderungshistorie 0.3.0": /\| `0\.3\.0` \| Part 3/.test(doc),
  "Querverweise auf Abschnitt 5 (Kompatibilitaet)": (doc.match(/see section 5|See section 5|\(section 5\)/g) ?? []).length >= 3,
  "kein Rest-Verweis auf 'section 4' fuer Kompatibilitaet": !/incompatible-api-version` \| See section 4/.test(doc),
  "Registrierungsbeispiel mit 0.3.0": /apiVersion: "0\.3\.0",\n    open:/.test(doc),
};
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? "ok   " : "FEHLT"} ${name}`);
console.log("Abschnitte:", [...doc.matchAll(/^## (\d+)\. (.+)$/gm)].map((m) => `${m[1]} ${m[2]}`).join(" | "));

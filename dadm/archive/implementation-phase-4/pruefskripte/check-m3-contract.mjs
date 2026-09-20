import { readFileSync } from "node:fs";
import { parseVersion, isApiCompatible, EAGLE_API_VERSION } from "./api-version.mjs";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const doc = readFileSync(root + "docs/api-contract.md", "utf8");
const src = readFileSync(root + "core/module-registry.ts", "utf8");

console.log("API-Version im Vertrag:", (doc.match(/\*\*API version:\*\* `([^`]+)`/) ?? [])[1], "| Konstante:", EAGLE_API_VERSION);

const rows = [...doc.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
let bad = 0;
for (const [, req, prov, expected] of rows) {
  const actual = isApiCompatible(parseVersion(req), parseVersion(prov)) ? "accepted" : "rejected";
  if (actual !== expected) { bad++; console.log(`MISMATCH ${req} vs ${prov}: doc=${expected} code=${actual}`); }
}
console.log(`Kompatibilitaets-Tabelle: ${rows.length} Zeilen, ${bad} Abweichungen`);

const union = src.slice(src.indexOf("export type RegistrationFailure"), src.indexOf("export type RegistrationResult"));
const codeCodes = [...union.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
const table = doc.slice(doc.indexOf("**Failure reasons**"), doc.indexOf("Flight Control knows a module only"));
const tableCodes = [...table.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).filter((c) => c !== "reason").sort();
const tsBlock = doc.slice(doc.indexOf("type RegistrationFailure"), doc.indexOf("type RegistrationResult"));
const blockCodes = [...tsBlock.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
console.log("Fehlercodes Code/Tabelle/TS-Block:", codeCodes.length, tableCodes.length, blockCodes.length, "| identisch:", JSON.stringify(codeCodes) === JSON.stringify(tableCodes) && JSON.stringify(codeCodes) === JSON.stringify(blockCodes));

const checks = {
  "descriptor-Zeile 'open'": /\| `open` \| function, optional/.test(doc),
  "invalid-descriptor nennt open": /`open` is given but is not a function/.test(doc),
  "Abschnitt 'The hub'": /^## 3\. The hub$/m.test(doc),
  "Aenderungshistorie 0.2.0": /\| `0\.2\.0` \| Part 2/.test(doc),
  "TS-Block mit open": /open\?: \(\) => void \| Promise<void>;/.test(doc),
};
for (const [name, ok] of Object.entries(checks)) console.log(`${ok ? "ok  " : "FEHLT"} ${name}`);

import { readFileSync } from "node:fs";
import { parseVersion, isApiCompatible, EAGLE_API_VERSION } from "./api-version.mjs";

const doc = readFileSync("/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/docs/api-contract.md", "utf8");
const src = readFileSync("/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/core/module-registry.ts", "utf8");

// 1) Beispieltabelle Abschnitt 3: | `req` | `prov` | accepted/rejected ... |
const rows = [...doc.matchAll(/^\| `(\d+\.\d+\.\d+)` \| `(\d+\.\d+\.\d+)` \| (accepted|rejected)/gm)];
let bad = 0;
for (const [, req, prov, expected] of rows) {
  const actual = isApiCompatible(parseVersion(req), parseVersion(prov)) ? "accepted" : "rejected";
  if (actual !== expected) { bad++; console.log(`MISMATCH ${req} vs ${prov}: doc=${expected} code=${actual}`); }
}
console.log(`Kompatibilitaets-Tabelle: ${rows.length} Zeilen geprueft, ${bad} Abweichungen`);

// 2) Fehlercodes: Union im Code vs. Tabelle im Vertrag
const union = src.slice(src.indexOf("export type RegistrationFailure"), src.indexOf("export type RegistrationResult"));
const codeCodes = [...union.matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).sort();
const docTable = doc.slice(doc.indexOf("**Failure reasons**"), doc.indexOf("Flight Control knows a module only"));
const docCodes = [...docTable.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).sort();
console.log("Codes im Code :", codeCodes.join(", "));
console.log("Codes im Doku :", docCodes.join(", "));
console.log("Codes identisch:", JSON.stringify(codeCodes) === JSON.stringify(docCodes));

// 3) API-Version im Vertrag = Konstante im Code
console.log("API-Version im Vertrag:", (doc.match(/\*\*API version:\*\* `([^`]+)`/) ?? [])[1], "| Konstante:", EAGLE_API_VERSION);
// 4) Fixtures
const a = readFileSync("/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/test-fixtures/eagleeye-dummy-a/module.js", "utf8").match(/apiVersion: "([^"]+)"/)[1];
const c = readFileSync("/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/test-fixtures/eagleeye-dummy-c/module.js", "utf8").match(/apiVersion: "([^"]+)"/)[1];
console.log(`dummy-a apiVersion ${a}: ${isApiCompatible(parseVersion(a), parseVersion(EAGLE_API_VERSION)) ? "kompatibel (erwartet)" : "INKOMPATIBEL (Fehler)"}`);
console.log(`dummy-c apiVersion ${c}: ${isApiCompatible(parseVersion(c), parseVersion(EAGLE_API_VERSION)) ? "KOMPATIBEL (Fehler)" : "inkompatibel (erwartet)"}`);

import { readFileSync, existsSync } from "node:fs";
const repo = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const ref = "/run/media/matt/Data/matt/Coding/foundry-vtt-reference-v13/types/src/foundry/";
const guide = readFileSync(repo + "docs/ui-guide.md", "utf8");
const rows = guide.split("\n").filter((l) => /^\| R-\d\d \|/.test(l));
console.log("Regelzeilen:", rows.length, "| IDs:", rows.map((r) => r.slice(2, 6)).join(" "));
let problems = 0;
for (const row of rows) {
  const cells = row.split("|").slice(1, -1).map((c) => c.trim());
  const [id, , , refCell, hubCell] = cells;
  const refTokens = [...refCell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  const hubTokens = [...hubCell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  if (refTokens.length + hubTokens.length === 0) { problems++; console.log(`${id}: KEIN BELEG`); continue; }
  for (const token of refTokens) {
    const [path, line] = token.split(":");
    const file = ref + path;
    if (!existsSync(file)) { problems++; console.log(`${id}: Referenzdatei fehlt: ${path}`); continue; }
    const lines = readFileSync(file, "utf8").split("\n");
    const n = Number(line);
    if (!(n >= 1 && n <= lines.length)) { problems++; console.log(`${id}: Zeile ausserhalb: ${token}`); continue; }
    console.log(`${id} ref ${token.padEnd(58)} -> ${lines[n - 1].trim().slice(0, 70)}`);
  }
  for (const token of hubTokens) {
    const [path, symbol] = token.split("#");
    const file = repo + path;
    if (!existsSync(file)) { problems++; console.log(`${id}: Hub-Datei fehlt: ${path}`); continue; }
    const found = readFileSync(file, "utf8").includes(symbol);
    if (!found) problems++;
    console.log(`${id} hub ${(path + "#" + symbol).padEnd(58)} -> ${found ? "Symbol gefunden" : "SYMBOL FEHLT"}`);
  }
}
console.log(problems === 0 ? "\nLeitfaden: alle Regeln belegt, alle Pfade und Symbole vorhanden" : `\nLeitfaden: ${problems} Problem(e)`);

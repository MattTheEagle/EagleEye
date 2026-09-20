// Gegenproben fuer die Foundry-Huelle (nicht von Vitest gedeckt): ein Fehler im Quelltext, neu gebautes Bundle in ein
// Temp-Verzeichnis, die Simulation muss fehlschlagen.
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const sim = "/tmp/claude-1000/-run-media-matt-Data-matt-Coding-FoundryVTT-EagleEye/9c37d4e4-e0ad-4c8b-8a54-8ab1bb2f3c6f/scratchpad/sim-m7.mjs";
const sha = (t) => createHash("sha256").update(t).digest("hex").slice(0, 12);
const out = mkdtempSync(tmpdir() + "/m7-shell-") + "/module.js";

const M = "v13/module.ts", Y = "v13/system.ts";
const mutations = [
  ["H1 no ready hook: nothing is announced", M, 'Hooks.once("ready", () => {', 'Hooks.once("ready-disabled", () => {'],
  ["H2 every user is treated as a Gamemaster", M, "isGm: () => game.user?.isGM === true,", "isGm: () => true,"],
  ["H3 nobody is treated as a Gamemaster", M, "isGm: () => game.user?.isGM === true,", "isGm: () => false,"],
  ["H4 the notice is not shown", M, "notify: (level, message) => notify(level, message),", "notify: () => undefined,"],
  ["H5 the system id is read from the wrong field", Y, "id: () => game.system?.id,", "id: () => game.system?.version,"],
  ["H6 the system version is read from the wrong field", Y, "version: () => game.system?.version,", "version: () => game.system?.id,"],
  ["H7 getSystemInfo is not wired", M, "createEagleApi(registry, consoleLog, requests, rightsSource, () =>\n      evaluateSystem(systemSource),\n    );", "createEagleApi(registry, consoleLog, requests, rightsSource);"],
  ["H8 an error in the ready hook is not caught", M, '  } catch (error) {\n    console.error("eagleeye | failed to check the game system", error);\n  }', "  } finally {\n  }"],
];

let caught = 0, skipped = 0;
for (const [name, file, from, to] of mutations) {
  const path = root + file;
  const original = readFileSync(path, "utf8");
  const count = original.split(from).length - 1;
  if (count !== 1) { skipped++; console.log(`SKIP  ${name}: Textstelle nicht genau einmal gefunden (${count}x)`); continue; }
  const before = sha(original);
  try {
    writeFileSync(path, original.replace(from, () => to));
    execSync(`npx esbuild v13/module.ts --bundle --format=esm --outfile=${out} --log-level=error`, { cwd: root, stdio: "pipe" });
    let failed = false, summary = "";
    try { execSync(`node ${sim}`, { cwd: root, stdio: "pipe", timeout: 60000, env: { ...process.env, BUNDLE: out } }); }
    catch (e) {
      failed = true;
      const text = String(e.stdout) + String(e.stderr);
      summary = [...text.matchAll(/FEHLT (.+)/g)].map((m) => m[1].trim().slice(0, 80)).slice(0, 2).join(" | ") || (text.match(/Error[^\n]*/)?.[0] ?? "").slice(0, 100);
    }
    console.log(`${failed ? "gefunden " : "UEBERSEHEN"} ${name}${summary ? "  -> " + summary : ""}`);
    if (failed) caught++;
  } finally {
    writeFileSync(path, original);
    if (sha(readFileSync(path, "utf8")) !== before) console.log("!!! Datei nicht wiederhergestellt:", file);
  }
}
console.log(`${caught} von ${mutations.length - skipped} Fehlern der Huelle gefunden` + (skipped ? ` (${skipped} uebersprungen)` : ""));

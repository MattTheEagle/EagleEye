import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const sha = (t) => createHash("sha256").update(t).digest("hex").slice(0, 12);

const mutations = [
  ["A relay forwards caller-types too", "core/request-relay.ts",
    'if (byType.get(envelope.type)?.runsOn !== "gm" || environment.isGm()) return await kernel.execute(envelope);',
    'if (environment.isGm()) return await kernel.execute(envelope);'],
  ["B receive skips the Gamemaster-role check", "core/request-relay.ts",
    `if (!environment.isGm()) return fail("not-permitted", "only a Gamemaster's client runs relayed requests");`,
    ``],
  ["C receive runs caller-types (site gate removed)", "core/request-relay.ts",
    `if (handler && handler.runsOn !== "gm") {`,
    `if (false && handler && handler.runsOn !== "gm") {`],
  ["D receive passes the original detail back (no redaction)", "core/request-relay.ts",
    `return fail(result.reason, GENERIC_DETAIL);`,
    `return result;`],
  ["E relay sends the raw request instead of the clean envelope", "core/request-relay.ts",
    `return await forward(envelope);`,
    `return await forward(request as RequestEnvelope);`],
  ["F relay does not check the sender before forwarding", "core/request-relay.ts",
    `if (!sender.ok) return sender.failure;\n      if (!environment.hasGm())`,
    `if (!environment.hasGm())`],
  ["G late rejection after the timeout is not swallowed", "core/request-relay.ts",
    `sending.catch(() => undefined);`,
    ``],
  ["H size limit of received data removed", "core/request-relay.ts",
    `if (!isJsonValue(data) || tooLarge(data)) {`,
    `if (!isJsonValue(data)) {`],
  ["I no-gm is not detected", "core/request-relay.ts",
    `if (!environment.hasGm()) return fail("no-gm"`,
    `if (false) return fail("no-gm"`],
  ["J gmping runs in the caller's client", "core/request-handlers.ts",
    `runsOn: "gm",`,
    `runsOn: "caller",`],
  ["K parseEnvelope keeps extra fields", "core/request-kernel.ts",
    `return { ok: true, value: envelope };\n}\n\n// Step 2`,
    `return { ok: true, value: request as RequestEnvelope };\n}\n\n// Step 2`],
  ["L kernel accepts an invalid runsOn", "core/request-kernel.ts",
    `if (handler.runsOn !== undefined && handler.runsOn !== "caller" && handler.runsOn !== "gm") {`,
    `if (false) {`],
];

let caught = 0;
for (const [name, file, from, to] of mutations) {
  const path = root + file;
  const original = readFileSync(path, "utf8");
  if (!original.includes(from)) { console.log(`SKIP  ${name}: Textstelle nicht gefunden`); continue; }
  const before = sha(original);
  try {
    writeFileSync(path, original.replace(from, to));
    let failed = false, summary = "";
    try { execSync("npx vitest run", { cwd: root, stdio: "pipe", timeout: 120000 }); }
    catch (e) {
      failed = true;
      const out = String(e.stdout) + String(e.stderr);
      summary = [...new Set([...out.matchAll(/^ (?:FAIL|×)\s+(.+)$/gm)].map((m) => m[1].trim().slice(0, 110)))].slice(0, 3).join(" | ") || (out.match(/Unhandled[^\n]*/)?.[0] ?? "");
    }
    console.log(`${failed ? "gefunden " : "UEBERSEHEN"} ${name}${summary ? "  -> " + summary : ""}`);
    if (failed) caught++;
  } finally {
    writeFileSync(path, original);
    if (sha(readFileSync(path, "utf8")) !== before) console.log("!!! Datei nicht wiederhergestellt:", file);
  }
}
console.log(`${caught} von ${mutations.length} Fehlern gefunden`);

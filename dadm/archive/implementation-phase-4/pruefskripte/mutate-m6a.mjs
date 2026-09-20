import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const sha = (t) => createHash("sha256").update(t).digest("hex").slice(0, 12);

const R = "core/request-relay.ts", I = "core/request-identity.ts", K = "core/request-kernel.ts", H = "core/request-handlers.ts";
const mutations = [
  ["A relay runs the request without asking the named user", R, "if (problem !== undefined) {", "if (false) {"],
  ["B a confirmation from another user counts", I, "return answer.confirmed === true && answer.userId === claim.userId;", "return answer.confirmed === true;"],
  ["C the identifier of a finished request stays open", R, "        pending.close(requestId);", ""],
  ["D an unknown type is confirmed before the kernel answers", R, "      if (!handler) return kernel.execute(envelope);", "      if (!handler) { await confirmClaim(claim); return kernel.execute(envelope); }"],
  ["E a failing question counts as confirmed (fail open)", R, "      return `the question failed: ${describeError(error)}`;", "      return undefined;"],
  ["F the relay does not stop waiting for the answer by itself", R, "const outcome = await Promise.race([asking, timedOut]);", "const outcome = await asking;"],
  ["G answerConfirmation confirms every identifier", R, "typeof requestId === \"string\" && pending.has(requestId)", "typeof requestId === \"string\" && true"],
  ["H the confirmed user does not reach the handler", R, "return kernel.execute(envelope, { user: { id: claim.userId } });", "return kernel.execute(envelope);"],
  ["I the requester names another user", R, "claim: { userId, requestId } };", "claim: { userId: \"someone-else\", requestId } };"],
  ["J currentUser wins over the user of the option", K, "const user = executeOptions?.user ?? options.currentUser?.();", "const user = options.currentUser?.() ?? executeOptions?.user;"],
  ["K very short identifiers are accepted", I, "const REQUEST_ID_MIN_LENGTH = 16;", "const REQUEST_ID_MIN_LENGTH = 1;"],
  ["L a message without claim is not refused", I, "if (!isPlainObject(claim)) return invalid(\"a relayed request must name the asking user in claim\");", "if (false) return invalid(\"x\");"],
  ["M gmping does not report the asking user", H, "askedBy: context.user?.id ?? null,", "askedBy: null,"],
];

let caught = 0;
for (const [name, file, from, to] of mutations) {
  const path = root + file;
  const original = readFileSync(path, "utf8");
  if (original.split(from).length - 1 !== 1) { console.log(`SKIP  ${name}: Textstelle nicht genau einmal gefunden (${original.split(from).length - 1}x)`); continue; }
  const before = sha(original);
  try {
    writeFileSync(path, original.replace(from, to));
    let failed = false, summary = "";
    try { execSync("npx vitest run", { cwd: root, stdio: "pipe", timeout: 120000 }); }
    catch (e) {
      failed = true;
      const out = String(e.stdout) + String(e.stderr);
      summary = [...new Set([...out.matchAll(/^ (?:FAIL|×)\s+(.+)$/gm)].map((m) => m[1].trim().slice(0, 100)))].slice(0, 3).join(" | ") || (out.match(/Unhandled[^\n]*/)?.[0] ?? "");
    }
    console.log(`${failed ? "gefunden " : "UEBERSEHEN"} ${name}${summary ? "  -> " + summary : ""}`);
    if (failed) caught++;
  } finally {
    writeFileSync(path, original);
    if (sha(readFileSync(path, "utf8")) !== before) console.log("!!! Datei nicht wiederhergestellt:", file);
  }
}
console.log(`${caught} von ${mutations.length} Fehlern gefunden`);

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const sha = (t) => createHash("sha256").update(t).digest("hex").slice(0, 12);

const K = "core/request-kernel.ts", G = "core/request-rights.ts", T = "core/rights-table.ts", U = "core/rights-hub.ts";
const A = "core/eagle-api.ts", H = "core/request-handlers.ts", R = "core/request-relay.ts";
const mutations = [
  // kernel
  ["K1 the kernel does not act on the verdict", K, "        if (refused) return refused;", "        if (false) return refused;"],
  ["K2 the gate is asked about the local user instead of the confirmed one", K, "const refused = await checkRights(caller.id, user, targets);", "const refused = await checkRights(caller.id, options.currentUser?.(), targets);"],
  ["K3 an answer that is not exactly { ok: true } counts as allowed", K, "    if (verdict?.ok === true) return undefined;", "    if (verdict?.ok !== false) return undefined;"],
  ["K4 a gate that throws lets the request run", K, "    } catch {\n      return fail(\"not-permitted\", \"the rights could not be checked\");\n    }", "    } catch {\n      return undefined;\n    }"],
  ["K5 the gate is not told the targets", K, "await checkRights(caller.id, user, targets)", "await checkRights(caller.id, user, [])"],
  ["K6 an empty text is accepted as a target", K, "targets.every((uuid) => typeof uuid === \"string\" && uuid !== \"\")", "targets.every((uuid) => typeof uuid === \"string\")"],
  ["K7 a targets that is not a list is accepted", K, "return Array.isArray(targets) && targets.every(", "return targets !== undefined && Array.prototype.every.call(targets, "],
  // the rule
  ["G1 a Gamemaster is not recognised", G, "        if (gm === true) return allow();", "        if (gm === true && false) return allow();"],
  ["G2 a user nobody knows is treated as a player", G, "        if (gm !== false) return refuse(\"the user of this request is not known\");", "        if (false) return refuse(\"the user of this request is not known\");"],
  ["G3 rights that cannot be read allow everything", G, "        if (!table) return refuse(\"the rights could not be read, so nothing is allowed until they can\");", "        if (!table) return allow();"],
  ["G4 a module without an entry is not refused", G, "        if (level === \"denied\") return refuse(", "        if (level === \"nothing\") return refuse("],
  ["G5 the level own allows every target", G, "if (level === \"all\" || targets.length === 0) return allow();", "if (level === \"all\" || level === \"own\" || targets.length === 0) return allow();"],
  ["G6 a target that cannot be found counts as owned", G, "if ((await environment.ownership(uuid, user.id)) !== \"own\") {", "if ((await environment.ownership(uuid, user.id)) === \"foreign\") {"],
  ["G7 only the first target is looked at", G, "for (const uuid of targets) {", "for (const uuid of targets.slice(0, 1)) {"],
  ["G8 the level all needs ownership too", G, "if (level === \"all\" || targets.length === 0) return allow();", "if (targets.length === 0) return allow();"],
  ["G9 effectiveLevel does not know a Gamemaster", G, "    if (gm === true) return \"all\";", "    if (gm === true) return \"denied\";"],
  ["G10 the warning comes every time", G, "    if (!warned) {", "    if (true) {"],
  ["G11 the warning never comes back", G, "      warned = false;\n      return parsed.value;", "      return parsed.value;"],
  // the table
  ["T1 the version is not checked", T, "if (data.version !== 1) return invalid(\"the stored rights have a version this Flight Control does not know\");", "if (false) return invalid(\"x\");"],
  ["T2 the level denied is accepted in a stored table", T, "      if (level !== \"own\" && level !== \"all\") {", "      if (level !== \"own\" && level !== \"all\" && level !== \"denied\") {"],
  ["T3 entries of users nobody knows stay", T, ".filter(([id]) => id !== userId && knownUserIds.has(id));", ".filter(([id]) => id !== userId);"],
  ["T4 denied is stored instead of removing the entry", T, "  if (level !== \"denied\") users.push([userId, level]);", "  users.push([userId, level as never]);"],
  ["T5 a module without entries stays", T, "const modules = users.length > 0 ? [...others, [moduleId, Object.fromEntries(users)] as const] : others;", "const modules = [...others, [moduleId, Object.fromEntries(users)] as const];"],
  // the hub logic
  ["U1 anybody may write the rights", U, "    if (!source.canEdit()) return refuse(", "    if (false) return refuse("],
  ["U2 rights for a module that is not registered are written", U, "if (!allowedModules.includes(moduleId)) return", "if (false) return"],
  ["U3 rights for a user who is not a player are written", U, "    if (!players.some((player) => player.id === userId)) {", "    if (false) {"],
  ["U4 a level that does not exist is written", U, "    if (rawLevel !== \"denied\" && rawLevel !== \"own\" && rawLevel !== \"all\") {", "    if (false) {"],
  ["U5 rights that cannot be read are overwritten", U, "    const parsed = parseRightsTable(source.storedTable());\n    const table = parsed.ok ? parsed.value : emptyRights();", "    let parsed: ReturnType<typeof parseRightsTable>;\n    try { parsed = parseRightsTable(source.storedTable()); } catch { parsed = { ok: false, detail: \"\" }; }\n    const table = parsed.ok ? parsed.value : emptyRights();"],
  ["U6 the list shows own for rights that cannot be read", U, "level: table ? levelOf(table, moduleId, id) : \"denied\"", "level: table ? levelOf(table, moduleId, id) : \"own\""],
  // api and handler
  ["A1 getRights answers for a module that is not registered", A, "      if (!registry.list().some((module) => module.id === moduleId)) {", "      if (false) {"],
  ["A2 getRights ignores the rights source", A, "value: { level: rights.levelFor(moduleId) }", "value: { level: \"all\" }"],
  ["D1 targetping does not name its target", H, "    targets: (payload) => [payload.uuid],", "    targets: () => [],"],
  ["D2 targetping runs in the caller's client", H, "    runsOn: \"gm\",\n    validate: validateTarget,", "    runsOn: \"caller\",\n    validate: validateTarget,"],
  ["D3 a uuid that is too long is accepted", H, "  if (uuid.length > MAX_UUID_LENGTH) {", "  if (false) {"],
  // the relay
  ["R1 the confirmed user does not reach the kernel", R, "return kernel.execute(envelope, { user: { id: claim.userId } });", "return kernel.execute(envelope);"],
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
    let failed = false, summary = "";
    try { execSync("npx vitest run", { cwd: root, stdio: "pipe", timeout: 120000 }); }
    catch (e) {
      failed = true;
      const out = String(e.stdout) + String(e.stderr);
      summary = [...new Set([...out.matchAll(/^ (?:FAIL|×)\s+(.+)$/gm)].map((m) => m[1].trim().slice(0, 90)))].slice(0, 2).join(" | ") || (out.match(/Unhandled[^\n]*/)?.[0] ?? "");
    }
    console.log(`${failed ? "gefunden " : "UEBERSEHEN"} ${name}${summary ? "  -> " + summary : ""}`);
    if (failed) caught++;
  } finally {
    writeFileSync(path, original);
    if (sha(readFileSync(path, "utf8")) !== before) console.log("!!! Datei nicht wiederhergestellt:", file);
  }
}
console.log(`${caught} von ${mutations.length - skipped} Fehlern gefunden` + (skipped ? ` (${skipped} uebersprungen)` : ""));

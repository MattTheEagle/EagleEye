// Deploy check for M7 (scratchpad, not part of the repo): the real bundle and the real fixtures in fake Foundry clients
// (a Gamemaster, an Assistant, a player). The states of the game system guard are shown with the same patched bundles
// that the live-check packages use: only what the guard reads (id or version of game.system) is changed.
import { readFileSync } from "node:fs";
const repo = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const standardBundle = readFileSync(process.env.BUNDLE ?? repo + "v13/dist/module.js", "utf8");
const fixture = (id) => ({
  id: `eagleeye-dummy-${id}`,
  code: readFileSync(repo + `test-fixtures/eagleeye-dummy-${id}/module.js`, "utf8"),
  manifest: JSON.parse(readFileSync(repo + `test-fixtures/eagleeye-dummy-${id}/module.json`, "utf8")),
});
const fixtures = ["a", "b", "c", "d"].map(fixture);
const fcManifest = JSON.parse(readFileSync(repo + "v13/module.json", "utf8"));
const fmt = (a) => a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");

import { patchBundle } from "./variants-m7.mjs";
const bundleFor = (variant, text = standardBundle) => patchBundle(variant, text);

const ROLE = { NONE: 0, PLAYER: 1, TRUSTED: 2, ASSISTANT: 3, GAMEMASTER: 4 };
const USERS = [
  { id: "gm-1", name: "TheGM", role: ROLE.GAMEMASTER },
  { id: "as-1", name: "TheAssistant", role: ROLE.ASSISTANT },
  { id: "p-1", name: "Anna", role: ROLE.PLAYER },
].map((u) => ({ ...u, isGM: u.role >= ROLE.ASSISTANT }));

let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok   " : "FEHLT"} ${name}${extra ? "  " + extra : ""}`);
};

function makeWorld() {
  const world = { clients: new Map(), settings: new Map() };
  world.dispatch = (fromId, targetId, name, data, opts) => {
    const target = world.clients.get(targetId);
    if (!target) return Promise.reject(new Error(`User [${targetId}] is not active`));
    const handler = target.CONFIG.queries[name];
    if (!handler) return Promise.reject(new Error(`User query '${name}' is not registered`));
    return Promise.resolve().then(() => handler(structuredClone(data), opts)).then((result) => structuredClone(result));
  };
  return world;
}

function makeClient(world, userDef, variant = "standard", system = { id: "dnd5e", version: "5.3.3" }) {
  const bundle = bundleFor(variant);
  const hooks = {};
  const lines = [];
  const notes = [];
  const store = new Map();
  const registered = new Map();
  const moduleInfos = new Map(
    [["eagleeye", fcManifest], ...fixtures.map((f) => [f.id, f.manifest])].map(([id, m]) => [id, { id, title: m.title, version: m.version, active: true }]),
  );
  const client = { lines, notes, CONFIG: { queries: { dialog() {}, confirmTeleportToken() {} } } };
  const viewOf = (def) => ({
    ...def,
    get active() { return world.clients.has(def.id); },
    query: (name, data, opts) => world.dispatch(userDef.id, def.id, name, data, opts),
  });
  const users = USERS.map(viewOf);
  const bucket = (data) => (data.scope === "world" ? world.settings : store);
  const env = {
    crypto: globalThis.crypto,
    console: { log: (...a) => lines.push(fmt(a)), info: (...a) => lines.push(fmt(a)), warn: (...a) => lines.push("WARN " + fmt(a)), error: (...a) => lines.push("ERROR " + fmt(a)) },
    Hooks: { once: (name, fn) => void (hooks[name] ??= []).push(fn), on: (name, fn) => void (hooks[name] ??= []).push(fn) },
    CONFIG: client.CONFIG,
    CONST: { USER_ROLES: ROLE },
    ui: { notifications: { info: (m) => notes.push(["info", m]), warn: (m) => notes.push(["warn", m]), error: (m) => notes.push(["error", m]) } },
    foundry: {
      applications: { api: { ApplicationV2: class {} }, fields: {}, elements: { HTMLRangePickerElement: class {} }, handlebars: {} },
      utils: { fromUuid: async () => null },
    },
    game: {
      system,
      user: users.find((u) => u.id === userDef.id),
      users: {
        contents: users,
        get: (id) => users.find((u) => u.id === id),
        get activeGM() { return users.find((u) => u.role === ROLE.GAMEMASTER && u.active) ?? null; },
      },
      modules: { get: (id) => moduleInfos.get(id) },
      settings: {
        settings: registered, menus: new Map(),
        register(ns, key, data) {
          registered.set(`${ns}.${key}`, { namespace: ns, key, ...data });
          if (!bucket(data).has(`${ns}.${key}`)) bucket(data).set(`${ns}.${key}`, data.default);
        },
        registerMenu() {},
        get: (ns, key) => bucket(registered.get(`${ns}.${key}`) ?? {}).get(`${ns}.${key}`),
        set: async (ns, key, value) => bucket(registered.get(`${ns}.${key}`) ?? {}).set(`${ns}.${key}`, value),
      },
      i18n: { localize: (k) => k, format: (k, d) => `${k} ${JSON.stringify(d)}` },
    },
  };
  const run = (code) => new Function(...Object.keys(env), code)(...Object.values(env));
  run(bundle);
  for (const f of fixtures) run(f.code);
  client.boot = async () => {
    for (const fn of hooks.init ?? []) fn();
    for (const fn of hooks.setup ?? []) fn();
    await Promise.all((hooks.ready ?? []).map((fn) => fn()));
  };
  client.api = () => env.game.modules.get("eagleeye").api;
  client.env = env;
  world.clients.set(userDef.id, client);
  return client;
}

const line = (client, filter) => client.lines.map((l) => l.replace("eagleeye-dummy-a | ", "")).filter((l) => filter.test(l));
const ANNOUNCE = /game system:/;
const [GM, ASSISTANT, PLAYER] = USERS;

// S1: the standard package: the test world is dnd5e 5.3.3, which is tested
{
  console.log("\n--- S1 Standardpaket: dnd5e 5.3.3 ist getestet");
  const world = makeWorld();
  const gm = makeClient(world, GM);
  await gm.boot();
  const as = makeClient(world, ASSISTANT);
  await as.boot();
  const player = makeClient(world, PLAYER);
  await player.boot();
  for (const [who, client] of [["GM", gm], ["Assistent", as], ["Spieler", player]]) {
    console.log(`    ${who}:`, line(client, ANNOUNCE).join(" | "), "| Hinweise:", JSON.stringify(client.notes));
    check(`${who}: eine Log-Zeile als Info, keine Warnung`, line(client, ANNOUNCE).length === 1 && line(client, ANNOUNCE)[0] === "eagleeye | game system: dnd5e 5.3.3 (tested)");
    check(`${who}: kein Hinweis`, client.notes.length === 0);
    check(`${who}: Dummy A meldet 'system: tested dnd5e 5.3.3'`, line(client, /^system:/)[0] === "system: tested dnd5e 5.3.3");
  }
  const result = gm.api().getSystemInfo();
  check("getSystemInfo: ok mit id, version, status und Liste", result.ok && JSON.stringify(result.value) === '{"id":"dnd5e","version":"5.3.3","status":"tested","testedVersions":["5.3.3"]}');
  check("die Antwort ist eingefroren, ein Modul kann die Liste nicht veraendern", Object.isFrozen(result.value) && (() => { try { result.value.testedVersions.push("6.0.0"); return false; } catch { return true; } })());
  check("die Liste im Wächter bleibt danach unveraendert", JSON.stringify(gm.api().getSystemInfo().value.testedVersions) === '["5.3.3"]');
  check("ein Aufruf liefert bei jedem Mal ein neues Objekt", gm.api().getSystemInfo().value !== gm.api().getSystemInfo().value);
  check("die API hat genau fuenf Mitglieder und Version 0.7.0", Object.keys(gm.api()).sort().join() === "getRights,getSystemInfo,getSystemInfo,registerModule,request,version".replace("getSystemInfo,getSystemInfo", "getSystemInfo") && gm.api().version === "0.7.0");
  check("bisheriges Verhalten unveraendert: Dummy A ping und gmping laufen fuer den GM, der Spieler bekommt ohne Freigabe not-permitted", line(gm, /^ping: ok/).length === 1 && line(player, /^ping: not-permitted/).length === 1);
}

// S2 to S5: what the guard reads is changed, the world stays the same
const states = [
  ["same-line", "5.3.4", "same-line", false, "info", "eagleeye | game system: dnd5e 5.3.4 (same-line)"],
  ["untested", "5.4.0", "untested", true, "warn", "eagleeye | game system: dnd5e 5.4.0 (untested)"],
  ["other-system", null, "other-system", true, "warn", "eagleeye | game system: pf2e (other-system)"],
  ["unknown", null, "unknown", true, "warn", 'eagleeye | game system: dnd5e (unknown); id "dnd5e", version "5.3.3-rc.1"'],
];
for (const [variant, version, status, notice, level, expectedLine] of states) {
  console.log(`\n--- Pruefpaket "${variant}": der Waechter liest ${variant === "other-system" ? 'die Kennung "pf2e"' : variant === "unknown" ? 'die Version "5.3.3-rc.1"' : `die Version "${version}"`}`);
  const world = makeWorld();
  const gm = makeClient(world, GM, variant);
  await gm.boot();
  const as = makeClient(world, ASSISTANT, variant);
  await as.boot();
  const player = makeClient(world, PLAYER, variant);
  await player.boot();
  const expectedNote = { untested: 'EAGLEEYE.system.untested {"version":"5.4.0","tested":"5.3.3"}', "other-system": 'EAGLEEYE.system.otherSystem {"id":"pf2e"}', unknown: "EAGLEEYE.system.unknown {}" }[variant];
  for (const [who, client, isGm] of [["GM", gm, true], ["Assistent", as, true], ["Spieler", player, false]]) {
    const logLines = line(client, ANNOUNCE);
    console.log(`    ${who}:`, logLines.join(" | "), "| Hinweise:", JSON.stringify(client.notes));
    check(`${who}: genau eine Log-Zeile ${level === "warn" ? "als Warnung" : "als Info"} mit dem Zustand`, logLines.length === 1 && logLines[0] === (level === "warn" ? "WARN " : "") + expectedLine);
    if (isGm && notice) check(`${who}: genau ein Hinweis mit dem uebersetzten Text`, client.notes.length === 1 && client.notes[0][0] === "warn" && client.notes[0][1] === expectedNote, client.notes[0]?.[1] ?? "");
    else check(`${who}: kein Hinweis`, client.notes.length === 0);
  }
  const result = gm.api().getSystemInfo();
  console.log("    getSystemInfo:", JSON.stringify(result));
  const expectedValue = {
    "same-line": { id: "dnd5e", version: "5.3.4", status: "same-line", testedVersions: ["5.3.3"] },
    untested: { id: "dnd5e", version: "5.4.0", status: "untested", testedVersions: ["5.3.3"] },
    "other-system": { id: "pf2e", version: null, status: "other-system", testedVersions: ["5.3.3"] },
    unknown: { id: "dnd5e", version: null, status: "unknown", testedVersions: ["5.3.3"] },
  }[variant];
  check("getSystemInfo liefert den Zustand", result.ok && JSON.stringify(result.value) === JSON.stringify(expectedValue));
  check("Dummy A meldet den Zustand", line(gm, /^system:/)[0] === `system: ${status} ${expectedValue.id} ${expectedValue.version ?? "?"}`, line(gm, /^system:/)[0]);
  check("nichts wird gesperrt: Dummy A ping und gmping laufen fuer den GM, der Spieler wird nur von den Rechten (nicht vom Waechter) abgewiesen", line(gm, /^ping: ok/).length === 1 && line(gm, /gmping: ok/).length === 1 && line(player, /^ping: not-permitted - module .* may not be used by this user/).length === 1);
}

// S6: the system cannot be read at all
{
  console.log("\n--- S6 game.system fehlt oder wirft");
  for (const [name, system] of [
    ["game.system fehlt", null],
    ["Kennung und Version fehlen", {}],
    ["Lesen wirft", { get id() { throw new Error("no id"); }, get version() { throw new Error("no version"); } }],
  ]) {
    const world = makeWorld();
    const gm = makeClient(world, GM, "standard", system);
    await gm.boot();
    const player = makeClient(world, PLAYER, "standard", system);
    await player.boot();
    console.log(`    ${name}:`, line(gm, ANNOUNCE).join(" | "), "| GM-Hinweise:", JSON.stringify(gm.notes));
    check(`${name}: kein Absturz, Zustand unknown, ein Hinweis nur beim GM`, gm.api().getSystemInfo().value.status === "unknown" && gm.notes.length === 1 && gm.notes[0][1] === "EAGLEEYE.system.unknown {}" && player.notes.length === 0);
    check(`${name}: die Log-Zeile nennt die Rohwerte`, /^WARN eagleeye \| game system: unreadable \(unknown\); id /.test(line(gm, ANNOUNCE)[0]), line(gm, ANNOUNCE)[0]);
    check(`${name}: die uebrige API laeuft weiter`, gm.api().getRights("eagleeye-dummy-a").value?.level === "all");
  }
}

// S7: failing notifications and logs never break the start
{
  console.log("\n--- S7 ein Hinweis, der wirft, bricht den Start nicht ab");
  const world = makeWorld();
  const gm = makeClient(world, GM, "untested");
  gm.env.ui.notifications.warn = () => { throw new Error("notifications not ready"); };
  await gm.boot();
  check("der Start laeuft durch, die Log-Zeile ist da, die API antwortet", line(gm, ANNOUNCE).length === 1 && gm.api().getSystemInfo().ok === true);
  check("kein Fehler des Hooks im Log", !gm.lines.some((l) => /failed to check the game system/.test(l)));
}

console.log(failures === 0 ? "\nalle Pruefungen der Simulation ok" : `\n${failures} Pruefung(en) der Simulation fehlgeschlagen`);
process.exit(failures === 0 ? 0 : 1);

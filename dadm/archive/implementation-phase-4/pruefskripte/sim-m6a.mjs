// Deploy check (scratchpad, not part of the repo): the real bundle and the real fixtures in fake Foundry clients,
// including a modified player client that tries to pose as another user.
import { readFileSync } from "node:fs";
const repo = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const bundle = readFileSync(repo + "v13/dist/module.js", "utf8");
const fixture = (id) => ({
  id: `eagleeye-dummy-${id}`,
  code: readFileSync(repo + `test-fixtures/eagleeye-dummy-${id}/module.js`, "utf8"),
  manifest: JSON.parse(readFileSync(repo + `test-fixtures/eagleeye-dummy-${id}/module.json`, "utf8")),
});
const fixtures = ["a", "b", "c", "d"].map(fixture);
const fcManifest = JSON.parse(readFileSync(repo + "v13/module.json", "utf8"));
const fmt = (a) => a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");

const USERS = [
  { id: "gm-1", name: "TheGM", isGM: true, role: "GAMEMASTER" },
  { id: "p-1", name: "ThePlayer", isGM: false, role: "PLAYER" },
  { id: "p-2", name: "TheModified", isGM: false, role: "PLAYER" },
  { id: "p-3", name: "Away", isGM: false, role: "PLAYER" },
];

function makeWorld() {
  const world = { clients: new Map(), log: [] };
  world.dispatch = (fromId, targetId, name, data, options) => {
    world.log.push(`${fromId} -> ${targetId}: ${name}`);
    const target = world.clients.get(targetId);
    if (!target) return Promise.reject(new Error(`User [${targetId}] is not active`));
    const handler = target.CONFIG.queries[name];
    if (!handler) return Promise.reject(new Error(`User query '${name}' is not registered`));
    return Promise.resolve()
      .then(() => handler(structuredClone(data), options))
      .then((result) => structuredClone(result));
  };
  return world;
}

function makeClient(world, userDef) {
  const hooks = {};
  const lines = [];
  const store = new Map();
  const registered = new Map();
  const moduleInfos = new Map(
    [["eagleeye", fcManifest], ...fixtures.map((f) => [f.id, f.manifest])].map(([id, m]) => [id, { id, title: m.title, version: m.version, active: true }]),
  );
  const client = { lines, CONFIG: { queries: { dialog() {}, confirmTeleportToken() {} } } };
  const viewOf = (def) => ({
    ...def,
    get active() { return world.clients.has(def.id); },
    query: (name, data, options) => world.dispatch(userDef.id, def.id, name, data, options),
  });
  const users = USERS.map(viewOf);
  const env = {
    crypto: globalThis.crypto,
    console: { log: (...a) => lines.push(fmt(a)), info: (...a) => lines.push(fmt(a)), warn: (...a) => lines.push("WARN " + fmt(a)), error: (...a) => lines.push("ERROR " + fmt(a)) },
    Hooks: { once: (name, fn) => void (hooks[name] ??= []).push(fn), on: (name, fn) => void (hooks[name] ??= []).push(fn) },
    CONFIG: client.CONFIG,
    ui: { notifications: { info() {}, warn() {}, error() {} } },
    foundry: { applications: { api: { ApplicationV2: class {} }, fields: {}, elements: { HTMLRangePickerElement: class {} }, handlebars: {} }, utils: {} },
    game: {
      user: users.find((u) => u.id === userDef.id),
      users: {
        get: (id) => users.find((u) => u.id === id),
        get activeGM() { return users.find((u) => u.role === "GAMEMASTER" && u.active) ?? null; },
      },
      modules: { get: (id) => moduleInfos.get(id) },
      settings: {
        settings: registered, menus: new Map(),
        register(ns, key, data) { registered.set(`${ns}.${key}`, { namespace: ns, key, ...data }); store.set(`${ns}.${key}`, data.default); },
        registerMenu() {}, get: (ns, key) => store.get(`${ns}.${key}`), set: async (ns, key, value) => { store.set(`${ns}.${key}`, value); },
      },
      i18n: { localize: (k) => k, format: (k) => k },
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
  world.clients.set(userDef.id, client);
  return client;
}

const show = (title, client, filter) => {
  console.log(`\n--- ${title}`);
  for (const l of client.lines.filter((line) => filter.test(line))) console.log("  " + l);
};
const ID32 = "0123456789abcdef0123456789abcdef";
const ask = async (world, from, label, message) => {
  const answer = await world.dispatch(from, "gm-1", "eagleeye.request", message, { timeout: 17000 }).catch((e) => ({ transport: e.message }));
  console.log(`  ${label}: ${JSON.stringify(answer)}`);
};

// S1: only the Gamemaster
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  show("S1 nur der GM", gm, /gmping:|this user/);
}

// S2: Gamemaster first, then the player; two requests at once
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const player = makeClient(world, USERS[1]);
  await player.boot();
  show("S2 GM zuerst, dann der Spieler: Konsole des Spielers", player, /gmping:|this user/);
  show("S2 Konsole des GM", gm, /relay|relayed|gmping:/);
  console.log("  Queries:", world.log.join(" | "));
  const results = await Promise.all([1, 2].map((n) => player.api().request({ module: "eagleeye-dummy-a", type: "flightcontrol.gmping", payload: { echo: `parallel ${n}` } })));
  console.log("  zwei gleichzeitige Anfragen:", results.map((r) => (r.ok ? `ok asked by ${r.value.askedBy}` : r.reason)).join(" | "));
}

// S3: only the player, no Gamemaster
{
  const world = makeWorld();
  const player = makeClient(world, USERS[1]);
  await player.boot();
  show("S3 nur der Spieler", player, /gmping:/);
}

// S4: the Gamemaster's client does not know the queries (older Flight Control)
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  delete gm.CONFIG.queries["eagleeye.request"];
  const player = makeClient(world, USERS[1]);
  await player.boot();
  show("S4 GM ohne Relais-Query", player, /gmping:/);
}

// S5: a modified client tries to pose as another user
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const p1 = makeClient(world, USERS[1]);
  await p1.boot();
  const p2 = makeClient(world, USERS[2]);
  await p2.boot();
  const ok = { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" };
  world.log.length = 0;
  console.log("\n--- S5 der veränderte Client p-2 schickt eigene Nachrichten an den GM");
  await ask(world, "p-2", "gibt sich als p-1 aus (verbunden, erfundene Kennung)", { request: ok, claim: { userId: "p-1", requestId: ID32 } });
  await ask(world, "p-2", "gibt sich als der GM aus", { request: ok, claim: { userId: "gm-1", requestId: ID32 } });
  await ask(world, "p-2", "gibt sich als p-3 aus (nicht verbunden)", { request: ok, claim: { userId: "p-3", requestId: ID32 } });
  await ask(world, "p-2", "nennt eine unbekannte Nutzer-ID", { request: ok, claim: { userId: "doesNotExist0000", requestId: ID32 } });
  await ask(world, "p-2", "nennt sich selbst mit erfundener Kennung", { request: ok, claim: { userId: "p-2", requestId: ID32 } });
  await ask(world, "p-2", "altes Format (bloßer Umschlag)", ok);
  await ask(world, "p-2", "zu kurze Kennung", { request: ok, claim: { userId: "p-1", requestId: "short" } });
  world.log.length = 0;
  await ask(world, "p-2", "caller-Typ mit gültig geformter Angabe", { request: { module: "eagleeye-dummy-a", type: "flightcontrol.ping" }, claim: { userId: "p-1", requestId: ID32 } });
  console.log("  Queries bei dem caller-Typ (es darf keine Rückfrage geben):", world.log.join(" | ") || "keine");
  show("S5 Konsole des GM (Warnungen)", gm, /not confirmed|relayed request rejected/);
  show("S5 Konsole von p-1 (das Opfer)", p1, /relayed|confirm/);
}

// S6: the named user's client never answers
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const p1 = makeClient(world, USERS[1]);
  await p1.boot();
  p1.CONFIG.queries["eagleeye.confirm"] = () => new Promise(() => undefined);
  const started = Date.now();
  const result = await p1.api().request({ module: "eagleeye-dummy-a", type: "flightcontrol.gmping" });
  console.log(`\n--- S6 der genannte Client antwortet nie: ${JSON.stringify(result)} nach ${Date.now() - started} ms`);
  show("S6 Konsole des GM", gm, /relayed request rejected/);
}
process.exit(0);

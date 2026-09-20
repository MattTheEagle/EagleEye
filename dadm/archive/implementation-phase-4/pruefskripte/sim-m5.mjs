// Monitor/Deploy check (scratchpad, not part of the repo): the real bundle and the real fixtures in two fake Foundry clients.
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

function makeWorld({ extraArg = false } = {}) {
  const world = { clients: new Map(), extraArg, queries: [] };
  world.dispatch = (fromId, targetId, name, data, options) => {
    world.queries.push({ from: fromId, to: targetId, name, timeout: options?.timeout });
    const target = world.clients.get(targetId);
    if (!target || !target.connected) return Promise.reject(new Error(`User ${targetId} is not connected`));
    const handler = target.CONFIG.queries[name];
    if (!handler) return Promise.reject(new Error(`No query handler "${name}" is registered on the target client`));
    const extra = world.extraArg ? [{ from: fromId }] : [];
    return Promise.resolve()
      .then(() => handler(structuredClone(data), ...extra))
      .then((result) => structuredClone(result));
  };
  return world;
}

const USERS = [
  { id: "gm-1", name: "TheGM", isGM: true, role: "GAMEMASTER" },
  { id: "p-1", name: "ThePlayer", isGM: false, role: "PLAYER" },
  { id: "p-2", name: "OtherPlayer", isGM: false, role: "PLAYER" },
];

function makeClient(world, userDef) {
  const hooks = {};
  const lines = [];
  const notifications = [];
  const store = new Map();
  const registered = new Map();
  const moduleInfos = new Map(
    [["eagleeye", fcManifest], ...fixtures.map((f) => [f.id, f.manifest])].map(([id, m]) => [id, { id, title: m.title, version: m.version, active: true }]),
  );
  const client = { connected: true, lines, notifications, CONFIG: { queries: { dialog() {}, confirmTeleportToken() {} } } };
  const viewOf = (def) => ({
    id: def.id, name: def.name, isGM: def.isGM, role: def.role,
    get active() { return world.clients.get(def.id)?.connected === true; },
    query: (name, data, options) => world.dispatch(userDef.id, def.id, name, data, options),
  });
  const users = USERS.map(viewOf);
  const env = {
    console: { log: (...a) => lines.push(fmt(a)), info: (...a) => lines.push(fmt(a)), warn: (...a) => lines.push("WARN " + fmt(a)), error: (...a) => lines.push("ERROR " + fmt(a)) },
    Hooks: { once: (name, fn) => void (hooks[name] ??= []).push(fn), on: (name, fn) => void (hooks[name] ??= []).push(fn) },
    CONFIG: client.CONFIG,
    ui: { notifications: { info: (m) => notifications.push(m), warn: (m) => notifications.push(m), error: (m) => notifications.push(m) } },
    foundry: { applications: { api: { ApplicationV2: class {} }, fields: {}, elements: { HTMLRangePickerElement: class {} }, handlebars: {} }, utils: {} },
    game: {
      user: users.find((u) => u.id === userDef.id),
      users: {
        get activeGM() { return users.find((u) => u.role === "GAMEMASTER" && u.active) ?? users.find((u) => u.isGM && u.active) ?? null; },
      },
      modules: { get: (id) => moduleInfos.get(id) },
      settings: {
        settings: registered,
        menus: new Map(),
        register(ns, key, data) { registered.set(`${ns}.${key}`, { namespace: ns, key, ...data }); store.set(`${ns}.${key}`, data.default); },
        registerMenu() {},
        get: (ns, key) => store.get(`${ns}.${key}`),
        set: async (ns, key, value) => { store.set(`${ns}.${key}`, value); },
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

const show = (title, client, filter = /eagleeye/) => {
  console.log(`\n--- ${title}`);
  for (const l of client.lines.filter((l) => filter.test(l))) console.log("  " + l);
};
const notEnv = (l) => !/registerModule result|ping result|gmping result|unknown request result|invalid payload result/.test(l);

// S1: only the Gamemaster
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  show("S1 nur der GM verbunden: Konsole des GM", gm);
}

// S2: Gamemaster first, then the player (without and with an extra query argument)
for (const extraArg of [false, true]) {
  const world = makeWorld({ extraArg });
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const player = makeClient(world, USERS[1]);
  await player.boot();
  show(`S2${extraArg ? "b" : "a"} GM zuerst, dann der Spieler (Foundry gibt ${extraArg ? "ein zweites Argument" : "kein zweites Argument"} mit): Konsole des Spielers`, player, /eagleeye-dummy-a \||eagleeye \|/);
  show(`S2${extraArg ? "b" : "a"} Konsole des GM (Diagnosezeile)`, gm, /relay|relayed/);
  console.log("  Queries:", JSON.stringify(world.queries));
}

// S3: only the player (no Gamemaster connected)
{
  const world = makeWorld();
  const player = makeClient(world, USERS[1]);
  await player.boot();
  show("S3 nur der Spieler verbunden", player, /eagleeye-dummy-a \| gmping|no-gm/);
}

// S4: a Gamemaster whose client has no relay query (for example an older Flight Control)
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  delete gm.CONFIG.queries["eagleeye.request"];
  const player = makeClient(world, USERS[1]);
  await player.boot();
  show("S4 GM ohne Relais-Query", player, /eagleeye-dummy-a \| gmping|relay-failed/);
}

// S5: a modified player client sends crafted queries directly
{
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const p1 = makeClient(world, USERS[1]);
  await p1.boot();
  const p2 = makeClient(world, USERS[2]);
  await p2.boot();
  const send = async (label, targetId, data) => {
    const answer = await world.dispatch("p-1", targetId, "eagleeye.request", data).catch((e) => ({ transport: e.message }));
    console.log(`  ${label}: ${JSON.stringify(answer)}`);
  };
  console.log("\n--- S5 Spieler p-1 schickt eigene Umschlaege direkt");
  await send("an den GM: gmping (erlaubt)", "gm-1", { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" });
  await send("an den GM: ping (Typ laeuft nur beim Aufrufer)", "gm-1", { module: "eagleeye-dummy-a", type: "flightcontrol.ping" });
  await send("an den GM: unbekannter Typ", "gm-1", { module: "eagleeye-dummy-a", type: "nope.nothing" });
  await send("an den GM: nicht angemeldetes Modul", "gm-1", { module: "eagleeye-dummy-c", type: "flightcontrol.gmping" });
  await send("an den GM: falsche Nutzlast", "gm-1", { module: "eagleeye-dummy-a", type: "flightcontrol.gmping", payload: { echo: 5 } });
  await send("an den GM: zu gross", "gm-1", { module: "eagleeye-dummy-a", type: "flightcontrol.gmping", payload: { echo: "x".repeat(70000) } });
  await send("an den GM: kein Umschlag", "gm-1", "text");
  await send("an den anderen Spieler: gmping", "p-2", { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" });
  show("S5 Konsole des GM (Warnungen)", gm, /relayed request rejected/);
  show("S5 Konsole des anderen Spielers (Warnungen)", p2, /relayed request rejected/);
}

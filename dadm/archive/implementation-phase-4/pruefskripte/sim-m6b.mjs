// Deploy check for M6b (scratchpad, not part of the repo): the real bundle, the real hub logic and the real fixtures in
// fake Foundry clients: one Gamemaster, one Assistant and three players. The rights are written through the real
// applyRightsInput (bundled from core/rights-hub.ts and v13/rights.ts), the way the hub writes them.
import { readFileSync } from "node:fs";
const repo = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const here = "/tmp/claude-1000/-run-media-matt-Data-matt-Coding-FoundryVTT-EagleEye/9c37d4e4-e0ad-4c8b-8a54-8ab1bb2f3c6f/scratchpad/";
const bundle = readFileSync(repo + "v13/dist/module.js", "utf8");
const rightsBundle = readFileSync(here + "sim-rights.js", "utf8");
const fixture = (id) => ({
  id: `eagleeye-dummy-${id}`,
  code: readFileSync(repo + `test-fixtures/eagleeye-dummy-${id}/module.js`, "utf8"),
  manifest: JSON.parse(readFileSync(repo + `test-fixtures/eagleeye-dummy-${id}/module.json`, "utf8")),
});
const fixtures = ["a", "b", "c", "d"].map(fixture);
const fcManifest = JSON.parse(readFileSync(repo + "v13/module.json", "utf8"));
const fmt = (a) => a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");

const ROLE = { NONE: 0, PLAYER: 1, TRUSTED: 2, ASSISTANT: 3, GAMEMASTER: 4 };
const USERS = [
  { id: "gm-1", name: "TheGM", role: ROLE.GAMEMASTER },
  { id: "as-1", name: "TheAssistant", role: ROLE.ASSISTANT },
  { id: "p-1", name: "Anna", role: ROLE.PLAYER },
  { id: "p-2", name: "Ben", role: ROLE.PLAYER },
  { id: "p-3", name: "Away", role: ROLE.TRUSTED },
].map((u) => ({ ...u, isGM: u.role >= ROLE.ASSISTANT }));

// Documents by UUID and who owns them; a UUID that is not listed does not exist.
const OWNERS = { "Actor.hero": ["p-1"], "Actor.villain": [], "Actor.shared": ["p-1", "p-2"] };

let failures = 0;
const check = (name, ok, extra = "") => {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok   " : "FEHLT"} ${name}${extra ? "  " + extra : ""}`);
};

function makeWorld(options = {}) {
  const world = { clients: new Map(), log: [], settings: new Map(), options };
  world.dispatch = (fromId, targetId, name, data, opts) => {
    world.log.push(`${fromId} -> ${targetId}: ${name}`);
    const target = world.clients.get(targetId);
    if (!target) return Promise.reject(new Error(`User [${targetId}] is not active`));
    const handler = target.CONFIG.queries[name];
    if (!handler) return Promise.reject(new Error(`User query '${name}' is not registered`));
    return Promise.resolve().then(() => handler(structuredClone(data), opts)).then((result) => structuredClone(result));
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
    ui: { notifications: { info() {}, warn() {}, error() {} } },
    foundry: {
      applications: { api: { ApplicationV2: class {} }, fields: {}, elements: { HTMLRangePickerElement: class {} }, handlebars: {} },
      utils: {
        // The document of a UUID, or null; the document answers who owns it (a Gamemaster owns everything).
        fromUuid: async (uuid) => {
          if (!(uuid in OWNERS)) return null;
          return { testUserPermission: (user, permission) => permission === "OWNER" && (user.isGM || OWNERS[uuid].includes(user.id)) };
        },
      },
    },
    game: {
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
          if (world.options.failRightsSetting && key === "rights") throw new Error("the setting could not be registered");
          registered.set(`${ns}.${key}`, { namespace: ns, key, ...data });
          if (!bucket(data).has(`${ns}.${key}`)) bucket(data).set(`${ns}.${key}`, data.default);
        },
        registerMenu() {},
        get: (ns, key) => bucket(registered.get(`${ns}.${key}`) ?? {}).get(`${ns}.${key}`),
        set: async (ns, key, value) => bucket(registered.get(`${ns}.${key}`) ?? {}).set(`${ns}.${key}`, value),
      },
      i18n: { localize: (k) => k, format: (k) => k },
    },
  };
  const run = (code) => new Function(...Object.keys(env), code)(...Object.values(env));
  run(bundle);
  for (const f of fixtures) run(f.code);
  client.rights = run(rightsBundle + "\nreturn RightsMod;");
  client.hubSource = client.rights.foundryRightsHubSource();
  client.boot = async () => {
    for (const fn of hooks.init ?? []) fn();
    for (const fn of hooks.setup ?? []) fn();
    await Promise.all((hooks.ready ?? []).map((fn) => fn()));
  };
  client.api = () => env.game.modules.get("eagleeye").api;
  client.set = (ns, key, value) => env.game.settings.set(ns, key, value);
  client.registered = registered;
  world.clients.set(userDef.id, client);
  return client;
}

const MODULES = ["eagleeye-dummy-a", "eagleeye-dummy-d"];
const setLevel = (gm, userId, level, moduleId = "eagleeye-dummy-a") => gm.rights.applyRightsInput(moduleId, userId, level, MODULES, gm.hubSource);
const line = (client, filter) => client.lines.map((l) => l.replace("eagleeye-dummy-a | ", "")).filter((l) => filter.test(l));
const ping = (client, type = "flightcontrol.ping", payload) => client.api().request({ module: "eagleeye-dummy-a", type, ...(payload ? { payload } : {}) });
const describe = (r) => (r.ok ? "ok" : `${r.reason}: ${r.detail}`);
const DENIED = 'module "eagleeye-dummy-a" may not be used by this user';
const ONLY_OWN = 'module "eagleeye-dummy-a" may act only on targets this user owns';

// S1: only the Gamemaster: everything is allowed without any setting
{
  console.log("\n--- S1 nur der GM");
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  for (const l of line(gm, /rights:|ping:/)) console.log("   ", l);
  check("GM: rights all", line(gm, /rights:/)[0] === "rights: all");
  check("GM: ping und gmping ok", line(gm, /^ping: ok/).length === 1 && line(gm, /gmping: ok.*asked by gm-1/).length === 1);
  const setting = gm.registered.get("eagleeye.rights");
  check("die Einstellung eagleeye.rights ist registriert: Welt, nicht in Foundrys Konfiguration, Text, Standard leer", setting?.scope === "world" && setting?.config === false && setting?.type === String && setting?.default === "");
}

// S2: Gamemaster and player: default is denied
{
  console.log("\n--- S2 Spieler ohne Freigabe (Standard: verboten)");
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const p1 = makeClient(world, USERS[2]);
  await p1.boot();
  for (const l of line(p1, /rights:|ping:/)) console.log("   ", l);
  check("Spieler: rights denied", line(p1, /rights:/)[0] === "rights: denied");
  check("Spieler: ping not-permitted mit dem Grund (Regel im eigenen Client)", line(p1, /^ping: /)[0] === `ping: not-permitted - ${DENIED}`);
  check("Spieler: gmping not-permitted mit dem Grund (beim GM entschieden)", line(p1, /gmping: /)[0] === `gmping: not-permitted - ${DENIED}`);
  check("GM: eine Warnung 'relayed request rejected' mit dem Grund, keine weitere", line(gm, /relayed request rejected/).length === 1 && /may not be used by this user/.test(line(gm, /relayed request rejected/)[0]));
  check("Der GM hat den Spieler bestaetigen lassen, bevor er die Rechte pruefte (Rueckfrage lief)", world.log.some((l) => l === "gm-1 -> p-1: eagleeye.confirm"));
}

// S3: the Gamemaster writes the level through the real hub logic
{
  console.log("\n--- S3 der GM stellt 'own' fuer p-1 ein (echter Schreibweg des Hubs)");
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const p1 = makeClient(world, USERS[2]);
  await p1.boot();
  const listing = gm.rights.listRights("eagleeye-dummy-a", gm.hubSource);
  console.log("    Liste im Hub:", listing.rows.map((r) => `${r.name}=${r.level}`).join(", "), "| unlesbar:", listing.unreadable);
  check("Hub-Liste: nur die Spieler (Anna, Ben, Away), alle 'denied'; kein GM, kein Assistent", listing.rows.map((r) => r.userId).join() === "p-1,p-2,p-3" && listing.rows.every((r) => r.level === "denied"));
  check("Hub: der GM darf schreiben, der Assistent nicht (canEdit)", gm.hubSource.canEdit() === true);
  const written = await setLevel(gm, "p-1", "own");
  check("applyRightsInput ok", written.ok && written.value === "own", JSON.stringify(written));
  console.log("    gespeicherter Text:", world.settings.get("eagleeye.rights"));
  check("der Spieler sieht die Stufe sofort (getRights)", p1.api().getRights("eagleeye-dummy-a").value?.level === "own");
  const r1 = await ping(p1), r2 = await ping(p1, "flightcontrol.gmping");
  check("Spieler: ping ok", r1.ok, describe(r1));
  check("Spieler: gmping ok, ran by der GM, asked by der Spieler", r2.ok && r2.value.ranBy.userId === "gm-1" && r2.value.askedBy === "p-1", describe(r2));

  // targets
  console.log("    targetping bei Stufe own:");
  const mine = await ping(p1, "flightcontrol.targetping", { uuid: "Actor.hero" });
  const theirs = await ping(p1, "flightcontrol.targetping", { uuid: "Actor.villain" });
  const lost = await ping(p1, "flightcontrol.targetping", { uuid: "Actor.missing" });
  const shared = await ping(p1, "flightcontrol.targetping", { uuid: "Actor.shared" });
  for (const [name, r] of [["eigener Actor", mine], ["fremder Actor", theirs], ["Actor, den es nicht gibt", lost], ["gemeinsamer Actor", shared]]) console.log(`      ${name}: ${describe(r)}`);
  check("own: eigenes Ziel ok, mit uuid und askedBy im Ergebnis", mine.ok && mine.value.uuid === "Actor.hero" && mine.value.askedBy === "p-1");
  check("own: fremdes Ziel not-permitted mit dem Text", !theirs.ok && theirs.reason === "not-permitted" && theirs.detail === ONLY_OWN);
  check("own: nicht auffindbares Ziel not-permitted mit demselben Text (kein Hinweis, ob es das Dokument gibt)", !lost.ok && lost.detail === theirs.detail);
  check("own: gemeinsam besessenes Ziel ok", shared.ok);
  const bad = await ping(p1, "flightcontrol.targetping", { uuid: 5 });
  check("ungueltige Nutzlast: invalid-payload vor der Rechtepruefung", !bad.ok && bad.reason === "invalid-payload");

  await setLevel(gm, "p-1", "all");
  const theirsAll = await ping(p1, "flightcontrol.targetping", { uuid: "Actor.villain" });
  const lostAll = await ping(p1, "flightcontrol.targetping", { uuid: "Actor.missing" });
  console.log("    Stufe all: fremd:", describe(theirsAll), "| gibt es nicht:", describe(lostAll));
  check("all: fremdes und nicht auffindbares Ziel ok", theirsAll.ok && lostAll.ok);
  check("getRights zeigt all", p1.api().getRights("eagleeye-dummy-a").value?.level === "all");

  await setLevel(gm, "p-1", "denied");
  const back = [await ping(p1), await ping(p1, "flightcontrol.gmping"), await ping(p1, "flightcontrol.targetping", { uuid: "Actor.hero" })];
  check("wieder denied: alle drei not-permitted", back.every((r) => !r.ok && r.reason === "not-permitted" && r.detail === DENIED), back.map(describe).join(" | "));
  check("der Eintrag ist aus der Ablage entfernt", world.settings.get("eagleeye.rights") === '{"version":1,"modules":{}}', world.settings.get("eagleeye.rights"));
}

// S4: the Assistant and two players; the levels are per user and per module
{
  console.log("\n--- S4 Assistent und mehrere Nutzer");
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const as = makeClient(world, USERS[1]);
  await as.boot();
  const p1 = makeClient(world, USERS[2]);
  await p1.boot();
  const p2 = makeClient(world, USERS[3]);
  await p2.boot();
  console.log("    Assistent: rights", line(as, /rights:/)[0], "|", line(as, /gmping:/)[0]);
  check("Assistent: rights all, ping und gmping ok ohne Eintrag (lokal, wie ein GM)", line(as, /rights:/)[0] === "rights: all" && line(as, /^ping: ok/).length === 1 && line(as, /gmping: ok.*ran by as-1.*asked by as-1/).length === 1);
  const refused = await as.rights.applyRightsInput("eagleeye-dummy-a", "p-1", "all", MODULES, as.hubSource);
  check("Assistent: der Hub-Schreibweg verweigert (not-permitted), nichts gespeichert", !refused.ok && refused.reason === "not-permitted" && world.settings.get("eagleeye.rights") === "");
  check("Assistent: canEdit false, GM: true", as.hubSource.canEdit() === false && gm.hubSource.canEdit() === true);

  await setLevel(gm, "p-1", "own");
  await setLevel(gm, "p-2", "all", "eagleeye-dummy-d");
  const a = { p1: await ping(p1), p2: await ping(p2) };
  check("p-1 darf Dummy A, p-2 nicht", a.p1.ok && !a.p2.ok && a.p2.detail === DENIED, `${describe(a.p1)} | ${describe(a.p2)}`);
  check("getRights: p-1 own fuer A, denied fuer D; p-2 all fuer D", p1.api().getRights("eagleeye-dummy-a").value.level === "own" && p1.api().getRights("eagleeye-dummy-d").value.level === "denied" && p2.api().getRights("eagleeye-dummy-d").value.level === "all");
  const stale = gm.rights.listRights("eagleeye-dummy-a", gm.hubSource).rows.map((r) => `${r.name}=${r.level}`).join(", ");
  console.log("    Hub-Liste A:", stale);
  check("Hub-Liste A zeigt Anna own, Ben denied, Away denied", stale === "Anna=own, Ben=denied, Away=denied");
  const unknown = await setLevel(gm, "as-1", "all");
  check("Hub: fuer einen Assistenten oder GM kann nichts eingestellt werden (unknown-user)", !unknown.ok && unknown.reason === "unknown-user");
  const wrongModule = await setLevel(gm, "p-1", "all", "eagleeye-dummy-b");
  check("Hub: fuer ein Modul, das nicht angemeldet ist (b), wird nichts geschrieben (not-allowed)", !wrongModule.ok && wrongModule.reason === "not-allowed");
}

// S5: the stored rights are damaged
{
  console.log("\n--- S5 beschaedigte Ablage");
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const p1 = makeClient(world, USERS[2]);
  await p1.boot();
  await setLevel(gm, "p-1", "all");
  check("vorher darf p-1", (await ping(p1)).ok);
  await gm.set("eagleeye", "rights", "{oops");
  const r = await ping(p1), g = await ping(gm), q = p1.api().getRights("eagleeye-dummy-a");
  console.log("    Spieler:", describe(r), "| GM:", describe(g), "| getRights:", JSON.stringify(q));
  check("Spieler: not-permitted 'could not be read'", !r.ok && r.reason === "not-permitted" && /could not be read/.test(r.detail));
  check("GM darf weiter", g.ok);
  check("getRights des Spielers: denied", q.ok && q.value.level === "denied");
  await ping(p1);
  check("der Spieler-Client warnt genau einmal (nicht bei jeder Anfrage)", line(p1, /the stored rights are not valid JSON/).length === 1, `(${line(p1, /the stored rights/).length}x)`);
  const listing = gm.rights.listRights("eagleeye-dummy-a", gm.hubSource);
  check("Hub: unlesbar gemeldet, alle denied", listing.unreadable && listing.rows.every((row) => row.level === "denied"));
  const fixed = await setLevel(gm, "p-2", "own");
  check("Schreiben ersetzt die beschaedigte Ablage durch eine gueltige", fixed.ok && world.settings.get("eagleeye.rights") === '{"version":1,"modules":{"eagleeye-dummy-a":{"p-2":"own"}}}', world.settings.get("eagleeye.rights"));
  await gm.set("eagleeye", "rights", '{"version":1,"modules":{"eagleeye-dummy-a":{"p-2":"denied-not-allowed"}}}');
  const bad = await ping(p1);
  check("eine Stufe, die es nicht gibt, macht die ganze Ablage unlesbar (fail closed)", !bad.ok && /could not be read/.test(bad.detail));
}

// S6: the rights cannot be set up at all
{
  console.log("\n--- S6 die Einstellung laesst sich nicht registrieren (Ausfall beim Start)");
  const world = makeWorld({ failRightsSetting: true });
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  for (const l of gm.lines.filter((l) => /ERROR|rights:|ping:/.test(l))) console.log("   ", l.replace("eagleeye-dummy-a | ", "").slice(0, 150));
  check("Fehler wird gemeldet", gm.lines.some((l) => /ERROR eagleeye \| failed to set up the rights; every request is refused/.test(l)));
  check("nichts wird erlaubt, auch nicht dem GM", line(gm, /^ping: /)[0] === "ping: not-permitted - the rights could not be set up, so nothing is allowed");
  check("getRights: denied", line(gm, /rights:/)[0] === "rights: denied");
}

// S7: forged claims and the API around it
{
  console.log("\n--- S7 veraenderter Client und die API");
  const world = makeWorld();
  const gm = makeClient(world, USERS[0]);
  await gm.boot();
  const p1 = makeClient(world, USERS[2]);
  await p1.boot();
  const p2 = makeClient(world, USERS[3]);
  await p2.boot();
  await setLevel(gm, "p-1", "all");
  const ID32 = "0123456789abcdef0123456789abcdef";
  const ok = { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" };
  const answer = await world.dispatch("p-2", "gm-1", "eagleeye.request", { request: ok, claim: { userId: "p-1", requestId: ID32 } }, { timeout: 17000 });
  console.log("    p-2 gibt sich als p-1 aus (der Erlaubte):", JSON.stringify(answer));
  check("die Fälschung wird weiter an der Bestaetigung abgewiesen, obwohl p-1 Rechte hat", !answer.ok && answer.reason === "not-permitted" && answer.detail === "the asking user could not be confirmed");
  const api = p1.api();
  check("getRights: unbekanntes Modul not-registered", api.getRights("stranger").reason === "not-registered");
  check("getRights: Modul b (nicht angemeldet) not-registered", api.getRights("eagleeye-dummy-b").reason === "not-registered");
  check("getRights: ohne Angabe invalid-request", api.getRights().reason === "invalid-request" && api.getRights("").reason === "invalid-request" && api.getRights(5).reason === "invalid-request");
  check("die API hat genau vier Mitglieder", Object.keys(api).sort().join() === "getRights,registerModule,request,version" && Object.isFrozen(api));
  check("API-Version 0.6.0", api.version === "0.6.0");
  const d = gm.lines.filter((l) => /eagleeye-dummy-d \|/.test(l)).map((l) => l.replace("eagleeye-dummy-d | ", ""));
  check("Dummy D: seine beiden fehlerhaften Anfragen laufen wie bisher (unknown-request, invalid-payload)", d.some((l) => /unknown request result.*unknown-request/.test(l)) && d.some((l) => /invalid payload result.*invalid-payload/.test(l)));
  const dp = p1.lines.filter((l) => /eagleeye-dummy-d \|/.test(l)).map((l) => l.replace("eagleeye-dummy-d | ", ""));
  check("... auch fuer einen Spieler ohne Freigabe fuer D (die Rechte kommen nach der Datenpruefung)", dp.some((l) => /unknown request result.*unknown-request/.test(l)) && dp.some((l) => /invalid payload result.*invalid-payload/.test(l)));
}

console.log(failures === 0 ? "\nalle Pruefungen der Simulation ok" : `\n${failures} Pruefung(en) der Simulation fehlgeschlagen`);
process.exit(failures === 0 ? 0 : 1);

import { readFileSync } from "node:fs";
const code = readFileSync("/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/test-fixtures/eagleeye-spike-query/module.js", "utf8");
const lines = [];
const fmt = (a) => a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ");

const world = { clients: new Map(), settings: new Map() };
const USERS = [
  { id: "gm-1", name: "TheGM", isGM: true },
  { id: "p-1", name: "ThePlayer", isGM: false },
  { id: "p-2", name: "Away", isGM: false },
];
function makeClient(userDef, connectedIds) {
  const hooks = {};
  const CONFIG = { queries: {} };
  const views = USERS.map((def) => ({
    ...def,
    get active() { return connectedIds.includes(def.id); },
    query: (name, data, options) => new Promise((resolve, reject) => {
      const target = world.clients.get(def.id);
      if (!target) return reject(new Error(`User ${def.id} is not connected`));
      const handler = target.CONFIG.queries[name];
      if (!handler) return reject(new Error(`no handler ${name}`));
      const timer = setTimeout(() => reject(new Error(`query timed out after ${options.timeout} ms`)), options.timeout);
      Promise.resolve().then(() => handler(structuredClone(data), options)).then((r) => { clearTimeout(timer); resolve(structuredClone(r)); }, (e) => { clearTimeout(timer); reject(e); });
    }),
  }));
  const moduleObj = {};
  const env = {
    console: { log: (...a) => lines.push(`[${userDef.name}] ` + fmt(a)) },
    Hooks: { once: (n, f) => void (hooks[n] ??= []).push(f) },
    CONFIG,
    game: {
      user: views.find((u) => u.id === userDef.id),
      users: { filter: (f) => views.filter(f), map: (f) => views.map(f) },
      modules: { get: () => moduleObj },
      settings: { register: (ns, key, d) => { if (!world.settings.has(ns + '.' + key)) world.settings.set(ns + '.' + key, d.default); }, get: (ns, key) => world.settings.get(ns + '.' + key), set: async (ns, key, v) => { world.settings.set(ns + '.' + key, v); } },
    },
    setTimeout, // real timers
  };
  new Function(...Object.keys(env), code)(...Object.values(env));
  for (const f of hooks.init ?? []) f();
  world.clients.set(userDef.id, { CONFIG });
  return { hooks, moduleObj };
}
const connected = ["gm-1", "p-1"];
const player = makeClient(USERS[1], connected);
const gm = makeClient(USERS[0], connected);
for (const f of gm.hooks.ready ?? []) f();      // schedules run() after 10 s (we call it directly instead)
await gm.moduleObj.api.run();
console.log(lines.join("\n"));
process.exit(0);

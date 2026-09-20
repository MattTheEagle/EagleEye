// Monitor check (scratchpad, not part of the repo): runs the real fixtures against the real core logic with a fake Foundry.
import { readFileSync } from "node:fs";
import { runInThisContext } from "node:vm";
import { EAGLE_API_VERSION } from "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/core/api-version";
import { createEagleApi } from "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/core/eagle-api";
import { buildHubModel, startModule } from "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/core/hub-model";
import { ModuleRegistry } from "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/core/module-registry";
import {
  applySettingInput,
  defaultHubSettingsSource,
  listHubSettings,
} from "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/core/settings-hub";

const repo = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const hooks: Record<string, Array<() => void>> = {};
const Hooks = { once: (name: string, fn: () => void) => void (hooks[name] ??= []).push(fn) };

const registered = new Map<string, any>();
const store = new Map<string, unknown>();
const notifications: string[] = [];
const log: string[] = [];

const moduleInfos = new Map<string, any>(
  ["eagleeye", "eagleeye-dummy-a", "eagleeye-dummy-b", "eagleeye-dummy-c", "eagleeye-dummy-d"].map((id) => {
    const manifest = id === "eagleeye" ? JSON.parse(readFileSync(repo + "v13/module.json", "utf8")) : JSON.parse(readFileSync(repo + `test-fixtures/${id}/module.json`, "utf8"));
    return [id, { id, title: manifest.title, version: manifest.version, active: true }];
  }),
);

const game: any = {
  settings: {
    settings: registered,
    register(namespace: string, key: string, data: any) {
      registered.set(`${namespace}.${key}`, { namespace, key, ...data });
      store.set(`${namespace}.${key}`, data.default);
    },
    get: (namespace: string, key: string) => store.get(`${namespace}.${key}`),
    set: async (namespace: string, key: string, value: unknown) => {
      store.set(`${namespace}.${key}`, value);
      return value;
    },
  },
  i18n: { localize: (id: string) => id },
  modules: { get: (id: string) => moduleInfos.get(id) },
  user: { isGM: true },
};
const ui = { notifications: { info: (m: string) => notifications.push(`info: ${m}`), warn: (m: string) => notifications.push(`warn: ${m}`), error: (m: string) => notifications.push(`error: ${m}`) } };
const sandboxConsole = { log: (...a: unknown[]) => log.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ")), warn: (...a: unknown[]) => log.push("WARN " + a.join(" ")) };

const realConsole = console;
Object.assign(globalThis, { Hooks, game, ui, console: sandboxConsole });
for (const id of ["a", "b", "c", "d"]) runInThisContext(readFileSync(repo + `test-fixtures/eagleeye-dummy-${id}/module.js`, "utf8"));
Object.assign(globalThis, { console: realConsole });
for (const fn of hooks.init ?? []) fn();

const registry = new ModuleRegistry({ get: (id) => moduleInfos.get(id) }, EAGLE_API_VERSION);
moduleInfos.get("eagleeye").api = createEagleApi(registry, { info: (m) => log.push(m), warn: (m) => log.push("WARN " + m) });
for (const fn of hooks.setup ?? []) fn();
const requestLines: string[] = [];
const origLog = console.log;
console.log = (...a: unknown[]) => { requestLines.push(a.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join(" ")); };
await Promise.all((hooks.ready ?? []).map((fn) => (fn as () => Promise<void>)()));
console.log = origLog;

(globalThis as any).game = game;
const source = defaultHubSettingsSource();
const modules = registry.list();
const model = buildHubModel(modules);
const out: string[] = [];
out.push(`API ${EAGLE_API_VERSION}; Tabs: ${model.tabs.map((t) => `${t.id} ("${t.label}")`).join(" | ")}; aktiv: ${model.activeTabId}`);
for (const module of modules) {
  out.push(`- ${module.id} v${module.version} (API ${module.apiVersion}) open=${module.open ? "ja" : "nein"}`);
  const settings = listHubSettings(module.id, source);
  if (settings.length === 0) out.push("    (keine Einstellungen)");
  for (const s of settings) {
    out.push(`    ${s.key}: kind=${s.kind} scope=${s.scope} wert=${JSON.stringify(s.value)}${s.choices ? " choices=" + JSON.stringify(s.choices.map((c) => c.value)) : ""}${s.range ? " range=" + JSON.stringify(s.range) : ""}${s.requiresReload ? " requiresReload" : ""}`);
  }
}
const a = modules.find((m) => m.id === "eagleeye-dummy-a")!;
const d = modules.find((m) => m.id === "eagleeye-dummy-d")!;
out.push("Start a:", JSON.stringify(await startModule(a)), "| Start d:", JSON.stringify(await startModule(d)));

const allowed = modules.map((m) => m.id);
const tries: Array<[string, string, unknown]> = [
  ["eagleeye-dummy-a", "level", "7"], ["eagleeye-dummy-a", "level", "11"], ["eagleeye-dummy-a", "level", "abc"],
  ["eagleeye-dummy-a", "mode", "beta"], ["eagleeye-dummy-a", "mode", "gamma"],
  ["eagleeye-dummy-a", "needsReload", true], ["eagleeye-dummy-a", "enabled", "true"],
  ["eagleeye-dummy-d", "note", "changed"], ["eagleeye-dummy-b", "label", "x"], ["eagleeye-dummy-a", "nope", 1],
];
for (const [ns, key, raw] of tries) {
  const r = await applySettingInput(ns, key, raw, allowed, source);
  out.push(`schreibe ${ns}.${key} <- ${JSON.stringify(raw)}: ${r.ok ? "ok " + JSON.stringify(r.value) : r.reason + " (" + r.detail + ")"}`);
}
game.user.isGM = false;
const denied = await applySettingInput("eagleeye-dummy-a", "level", 3, allowed, defaultHubSettingsSource());
out.push(`als Spieler schreiben: ${denied.ok ? "ok" : denied.reason}`);
out.push("Konsole der Fixtures im ready-Hook:", ...requestLines.map((l) => "  " + l));
out.push("Log von Flight Control:", ...log.filter((l) => l.includes("request rejected")).map((l) => "  " + l));
out.push("Meldungen der Fixtures:", ...notifications.map((n) => "  " + n));
out.push("Gespeicherte Werte a:", JSON.stringify(Object.fromEntries([...store].filter(([k]) => k.startsWith("eagleeye-dummy-a.")))));
console.log(out.join("\n"));

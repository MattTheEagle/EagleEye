import { FLIGHT_CONTROL_ID, logFlightControlReady } from "../core/index";
import { EAGLE_API_VERSION } from "../core/api-version";
import { createEagleApi, type ApiLogger, type EagleFlightControlApi } from "../core/eagle-api";
import { defaultModuleInfoSource, ModuleRegistry } from "../core/module-registry";
import { defaultRequestHandlers } from "../core/request-handlers";
import { createRequestKernel, type RequestKernel, type RightsGate } from "../core/request-kernel";
import { createRequestRelay } from "../core/request-relay";
import { createRightsGate, effectiveLevel, REFUSE_ALL } from "../core/request-rights";
import { defaultHubSettingsSource } from "../core/settings-hub";
import { announceSystem, evaluateSystem } from "../core/system-guard";
import { createHubApplicationClass } from "./hub-application";
import { foundryCompendiumEnvironment } from "./compendium";
import { foundryDocumentCreateEnvironment } from "./document-create";
import { foundryDocumentUpdateEnvironment } from "./document-update";
import { foundryImportEnvironment } from "./document-import";
import { foundryFlagEnvironment } from "./flag-write";
import { foundrySettingsEnvironment } from "./setting-write";
import { foundryCurrentUser, foundryExecutor, foundryRelayEnvironment, registerRelayQueries } from "./relay";
import { foundryRightsEnvironment, foundryRightsHubSource, registerRightsSetting } from "./rights";
import { foundrySystemSource } from "./system";

// Types game.modules.get("eagle-flight-control")?.api for readers (see docs/api-contract.md).
declare global {
  interface ModuleConfig {
    "eagle-flight-control": { api: EagleFlightControlApi };
  }
}

const consoleLog: ApiLogger = {
  info: (message) => console.log(message),
  warn: (message) => console.warn(message),
};

function text(key: string, data?: Record<string, string>): string {
  const i18n = game.i18n!;
  return data ? i18n.format(key, data) : i18n.localize(key);
}

function notify(level: "info" | "warn" | "error", message: string): void {
  const notifications = ui.notifications;
  if (!notifications) return;
  if (level === "error") notifications.error(message);
  else if (level === "warn") notifications.warn(message);
  else notifications.info(message);
}

const systemSource = foundrySystemSource();

// M10b: read by the getSceneControlButtons hook below, which fires on every toolbar build (long
// after "init") — needs a module-level reference, not one scoped inside the "init" callback (module
// registrations themselves still only happen once, inside "init", same as before).
let registry: ModuleRegistry | undefined;

// Project lead, 2026-09-27: a per-module icon for the toolbar button, instead of the same generic
// "open" arrow for every registered module. Font Awesome Free (the only icon set Foundry bundles) has
// no dedicated barrel/cask icon, so Homebrew gets a beer mug instead — close enough to "homebrewing"
// without inventing a custom icon font just for this. A module without an entry here keeps the
// generic fallback icon.
const MODULE_TOOLBAR_ICON: Record<string, string> = {
  "eagle-library": "fa-solid fa-book",
  "eagle-homebrew": "fa-solid fa-beer-mug-empty",
};

Hooks.once("init", () => {
  logFlightControlReady("13");

  try {
    registry = new ModuleRegistry(defaultModuleInfoSource(), EAGLE_API_VERSION);
  } catch (error) {
    console.error("eagle-flight-control | failed to create the module registry", error);
    return;
  }

  // The rights per module and user: the world setting they are stored in, and the check the kernel makes before it runs a
  // request. If they cannot be set up, nothing is allowed rather than everything.
  const rightsEnvironment = foundryRightsEnvironment();
  let rights: RightsGate = REFUSE_ALL;
  try {
    registerRightsSetting();
    rights = createRightsGate(rightsEnvironment, consoleLog);
  } catch (error) {
    console.error("eagle-flight-control | failed to set up the rights; every request is refused", error);
  }

  // Other modules read the API from their "setup" hook on, which runs after every "init" callback.
  // Attach it synchronously (before any await) so it exists by then, whatever the module load order.
  try {
    const handlers = defaultRequestHandlers(
      EAGLE_API_VERSION,
      foundryExecutor,
      foundryCompendiumEnvironment(),
      foundryImportEnvironment(),
      foundrySettingsEnvironment(),
      foundryFlagEnvironment(),
      foundryDocumentCreateEnvironment(),
      foundryDocumentUpdateEnvironment(),
    );
    const kernel = createRequestKernel(registry, handlers, { currentUser: foundryCurrentUser, rights });

    // Requests for handlers that run on the Gamemaster's client are forwarded by the relay. If the relay cannot be
    // set up, every request runs in the caller's client with the caller's own rights, which is the safe direction.
    let requests: RequestKernel = kernel;
    try {
      const relay = createRequestRelay({ kernel, handlers, registry, environment: foundryRelayEnvironment(), log: consoleLog });
      registerRelayQueries(relay);
      requests = relay;
    } catch (error) {
      console.error("eagle-flight-control | failed to set up the Gamemaster relay; requests run in the caller's client only", error);
    }

    const rightsSource = {
      levelFor: (moduleId: string) =>
        rights === REFUSE_ALL ? ("denied" as const) : effectiveLevel(rightsEnvironment, moduleId, game.user?.id ?? undefined),
    };
    game.modules!.get(FLIGHT_CONTROL_ID).api = createEagleApi(registry, consoleLog, requests, rightsSource, () =>
      evaluateSystem(systemSource),
    );
    console.log(`eagle-flight-control | API attached (v${EAGLE_API_VERSION})`);
  } catch (error) {
    console.error("eagle-flight-control | failed to attach the API to the module object", error);
  }

  // The hub opens from a button in the module settings (Gamemaster only). Built once and kept in a
  // variable (M10b): the scene-controls toolbar button below opens the exact same class, not a
  // second instance of it.
  let hubApplicationClass: (new () => foundry.applications.api.ApplicationV2.Any) | undefined;
  try {
    hubApplicationClass = createHubApplicationClass({
      registry,
      settings: defaultHubSettingsSource(),
      rights: foundryRightsHubSource(),
      text,
      notify,
      log: consoleLog,
    });
    game.settings!.registerMenu(FLIGHT_CONTROL_ID, "hub", {
      name: "EAGLEFLIGHTCONTROL.menu.name",
      label: "EAGLEFLIGHTCONTROL.menu.label",
      hint: "EAGLEFLIGHTCONTROL.menu.hint",
      icon: "fa-solid fa-eye",
      type: hubApplicationClass,
      restricted: true,
    });
  } catch (error) {
    console.error("eagle-flight-control | failed to register the hub menu", error);
  }

  // M10b: a "Flight Control" category in Foundry's scene controls toolbar — a second, faster way to
  // reach the hub and every registered module directly, alongside the settings-menu entry above
  // (which stays exactly as it was). Same audience as that entry (Gamemaster only, mirroring its own
  // `restricted: true` — this adds a shortcut, not a wider audience). One button for the hub, plus
  // one per module `registry.list()` returns with its own `open()` (core/module-registry.ts; Library
  // and Homebrew already pass one when they register, dadm/m10b-01-discover-output.md, Befund 2).
  // `getSceneControlButtons`'s exact v13 shape (`Control`/`Tool`) is real (`scene-controls.d.mts`)
  // but missing from the pinned reference's `Hooks.on` overloads (its own comment: "needs individual
  // attention" after v13's rework) — cast narrowly at this one call, the callback body itself stays
  // fully typed against the real shape. Live-check finding (M10b rework 1): the hook's own `controls`
  // parameter is a `Record<string, Control>` keyed by control name, not an array — `RenderContext.
  // controls` (the array `SceneControls.Control[]` the reference documents) is only the *rendered*
  // shape `SceneControls` derives from this record afterwards; the two are different points in the
  // same pipeline (`#prepareControls` builds this record first, converts it to an array later for the
  // template). Confirmed live: `controls.push` is not a function.
  try {
    type SceneControl = foundry.applications.ui.SceneControls.Control;
    type SceneTool = foundry.applications.ui.SceneControls.Tool;
    const onGetSceneControlButtons = (controls: Record<string, SceneControl>): void => {
      if (!game.user?.isGM || !hubApplicationClass) return;
      const hubClass = hubApplicationClass;
      const tools: Record<string, SceneTool> = {
        hub: {
          name: "hub",
          order: 0,
          title: text("EAGLEFLIGHTCONTROL.toolbar.hub"),
          icon: "fa-solid fa-eye",
          button: true,
          onChange: () => void new hubClass().render(true),
        },
      };
      let order = 1;
      for (const entry of registry?.list() ?? []) {
        if (!entry.open) continue;
        const open = entry.open;
        tools[entry.id] = {
          name: entry.id,
          order: order++,
          title: entry.title,
          icon: MODULE_TOOLBAR_ICON[entry.id] ?? "fa-solid fa-arrow-up-right-from-square",
          button: true,
          onChange: () => void open(),
        };
      }
      controls[FLIGHT_CONTROL_ID] = {
        name: FLIGHT_CONTROL_ID,
        order: 100,
        title: text("EAGLEFLIGHTCONTROL.toolbar.category"),
        icon: "fa-solid fa-tower-broadcast",
        tools,
        // Project lead, 2026-09-27: clicking the category button itself used to open the Hub immediately,
        // because `activeTool: "hub"` made Foundry treat becoming the active category as if "hub" had
        // been clicked. `activeTool` is required by the type (`Control.activeTool: string`, no `?`), but
        // its own doc comment only says it "should be" a real key in `tools` — pointing it at a name that
        // matches none of our (all `button: true`, one-shot) tools is a deliberate no-op default: nothing
        // in `tools` is looked up, so nothing fires, while the field itself stays a valid non-empty
        // string. Not live-verified yet (Foundry's own `SceneControls` type is marked "TODO: Stub" in the
        // pinned reference, so its exact runtime handling of an unmatched `activeTool` is not documented
        // either) — see the M16-adjacent live-check this change is bundled with.
        activeTool: "none",
      };
    };
    (Hooks.on as (hook: string, fn: (controls: Record<string, SceneControl>) => void) => number)(
      "getSceneControlButtons",
      onGetSceneControlButtons,
    );
  } catch (error) {
    console.error("eagle-flight-control | failed to register the scene controls toolbar button", error);
  }
});

// Says once per session which game system runs and whether Flight Control was tested with it. The notice goes to a
// Gamemaster or Assistant only; nothing is blocked (see core/system-guard.ts).
Hooks.once("ready", () => {
  try {
    announceSystem(systemSource, {
      isGm: () => game.user?.isGM === true,
      log: consoleLog,
      notify: (level, message) => notify(level, message),
      text,
    });
  } catch (error) {
    console.error("eagle-flight-control | failed to check the game system", error);
  }
});

import { EAGLEEYE_ID, logEagleEyeReady } from "../core/index";
import { EAGLE_API_VERSION } from "../core/api-version";
import { createEagleApi, type ApiLogger, type EagleFlightControlApi } from "../core/eagle-api";
import { defaultModuleInfoSource, ModuleRegistry } from "../core/module-registry";
import { defaultHubSettingsSource } from "../core/settings-hub";
import { createHubApplicationClass } from "./hub-application";

// Types game.modules.get("eagleeye")?.api for readers (see docs/api-contract.md).
declare global {
  interface ModuleConfig {
    eagleeye: { api: EagleFlightControlApi };
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

Hooks.once("init", () => {
  logEagleEyeReady("13");

  let registry: ModuleRegistry;
  try {
    registry = new ModuleRegistry(defaultModuleInfoSource(), EAGLE_API_VERSION);
  } catch (error) {
    console.error("eagleeye | failed to create the module registry", error);
    return;
  }

  // Other modules read the API from their "setup" hook on, which runs after every "init" callback.
  // Attach it synchronously (before any await) so it exists by then, whatever the module load order.
  try {
    game.modules!.get(EAGLEEYE_ID).api = createEagleApi(registry);
    console.log(`eagleeye | API attached (v${EAGLE_API_VERSION})`);
  } catch (error) {
    console.error("eagleeye | failed to attach the API to the module object", error);
  }

  // The hub opens from a button in the module settings (Gamemaster only).
  try {
    game.settings!.registerMenu(EAGLEEYE_ID, "hub", {
      name: "EAGLEEYE.menu.name",
      label: "EAGLEEYE.menu.label",
      hint: "EAGLEEYE.menu.hint",
      icon: "fa-solid fa-eye",
      type: createHubApplicationClass({ registry, settings: defaultHubSettingsSource(), text, notify, log: consoleLog }),
      restricted: true,
    });
  } catch (error) {
    console.error("eagleeye | failed to register the hub menu", error);
  }
});

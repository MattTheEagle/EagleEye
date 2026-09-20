import { EAGLEEYE_ID, logEagleEyeReady } from "../core/index";
import { EAGLE_API_VERSION } from "../core/api-version";
import { createEagleApi, type ApiLogger, type EagleFlightControlApi } from "../core/eagle-api";
import { defaultModuleInfoSource, ModuleRegistry } from "../core/module-registry";
import { defaultRequestHandlers } from "../core/request-handlers";
import { createRequestKernel, type RequestKernel, type RightsGate } from "../core/request-kernel";
import { createRequestRelay } from "../core/request-relay";
import { createRightsGate, effectiveLevel, REFUSE_ALL } from "../core/request-rights";
import { defaultHubSettingsSource } from "../core/settings-hub";
import { createHubApplicationClass } from "./hub-application";
import { foundryCurrentUser, foundryExecutor, foundryRelayEnvironment, registerRelayQueries } from "./relay";
import { foundryRightsEnvironment, foundryRightsHubSource, registerRightsSetting } from "./rights";

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

  // The rights per module and user: the world setting they are stored in, and the check the kernel makes before it runs a
  // request. If they cannot be set up, nothing is allowed rather than everything.
  const rightsEnvironment = foundryRightsEnvironment();
  let rights: RightsGate = REFUSE_ALL;
  try {
    registerRightsSetting();
    rights = createRightsGate(rightsEnvironment, consoleLog);
  } catch (error) {
    console.error("eagleeye | failed to set up the rights; every request is refused", error);
  }

  // Other modules read the API from their "setup" hook on, which runs after every "init" callback.
  // Attach it synchronously (before any await) so it exists by then, whatever the module load order.
  try {
    const handlers = defaultRequestHandlers(EAGLE_API_VERSION, foundryExecutor);
    const kernel = createRequestKernel(registry, handlers, { currentUser: foundryCurrentUser, rights });

    // Requests for handlers that run on the Gamemaster's client are forwarded by the relay. If the relay cannot be
    // set up, every request runs in the caller's client with the caller's own rights, which is the safe direction.
    let requests: RequestKernel = kernel;
    try {
      const relay = createRequestRelay({ kernel, handlers, registry, environment: foundryRelayEnvironment(), log: consoleLog });
      registerRelayQueries(relay, consoleLog);
      requests = relay;
    } catch (error) {
      console.error("eagleeye | failed to set up the Gamemaster relay; requests run in the caller's client only", error);
    }

    const rightsSource = {
      levelFor: (moduleId: string) =>
        rights === REFUSE_ALL ? ("denied" as const) : effectiveLevel(rightsEnvironment, moduleId, game.user?.id ?? undefined),
    };
    game.modules!.get(EAGLEEYE_ID).api = createEagleApi(registry, consoleLog, requests, rightsSource);
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
      type: createHubApplicationClass({
        registry,
        settings: defaultHubSettingsSource(),
        rights: foundryRightsHubSource(),
        text,
        notify,
        log: consoleLog,
      }),
      restricted: true,
    });
  } catch (error) {
    console.error("eagleeye | failed to register the hub menu", error);
  }
});

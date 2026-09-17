import { logEagleEyeReady } from "../core/index";
import { logPackageScan } from "../core/manifest-scanner";
import { HubApplication } from "../core/hub-application";
import { watchForConflicts, logConflict } from "../core/conflict-watch";
import { logLanguageScan } from "../core/language-scan";

Hooks.once("init", () => {
  logEagleEyeReady("14");

  // game.settings is populated before "init" fires; safe despite the optional type.
  game.settings!.registerMenu("eagleeye", "hub", {
    name: "EagleEye Hub",
    label: "Open Hub",
    hint: "Bündelt Einstellungen registrierter Module an einer Stelle.",
    icon: "fa-solid fa-eye",
    type: HubApplication,
    restricted: true,
  });
});

Hooks.once("ready", () => {
  logPackageScan();
  watchForConflicts(logConflict);
  logLanguageScan();
});

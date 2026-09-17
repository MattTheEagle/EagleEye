import { logEagleEyeReady } from "../core/index";
import { logPackageScan } from "../core/manifest-scanner";

Hooks.once("init", () => {
  logEagleEyeReady("13");
});

Hooks.once("ready", () => {
  logPackageScan();
});

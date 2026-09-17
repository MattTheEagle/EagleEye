import { logEagleEyeReady } from "../core/index";
import { logPackageScan } from "../core/manifest-scanner";

Hooks.once("init", () => {
  logEagleEyeReady("14");
});

Hooks.once("ready", () => {
  logPackageScan();
});

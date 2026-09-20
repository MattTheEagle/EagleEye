import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { patchBundle, VARIANTS } from "./variants-m7.mjs";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const stage = "/tmp/claude-1000/-run-media-matt-Data-matt-Coding-FoundryVTT-EagleEye/9c37d4e4-e0ad-4c8b-8a54-8ab1bb2f3c6f/scratchpad/stage-m7/";
const bundle = readFileSync(root + "v13/dist/module.js", "utf8");
rmSync(stage, { recursive: true, force: true });
const names = { standard: "eagleeye-v13-m7.zip" };
for (const variant of Object.keys(VARIANTS)) if (variant !== "standard") names[variant] = `eagleeye-v13-m7-check-${variant}.zip`;
for (const [variant, zip] of Object.entries(names)) {
  const dir = `${stage}${variant}/`;
  mkdirSync(dir + "dist", { recursive: true });
  mkdirSync(dir + "lang", { recursive: true });
  writeFileSync(dir + "module.json", readFileSync(root + "v13/module.json"));
  writeFileSync(dir + "dist/module.js", patchBundle(variant, bundle));
  writeFileSync(dir + "lang/en.json", readFileSync(root + "v13/lang/en.json"));
  rmSync(root + "v13/dist/live-check/" + zip, { force: true });
  execSync(`zip -q -r -D "${root}v13/dist/live-check/${zip}" module.json dist lang`, { cwd: dir });
  console.log("built", zip);
}

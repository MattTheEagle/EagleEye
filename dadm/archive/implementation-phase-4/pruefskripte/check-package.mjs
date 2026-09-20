import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const repo = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const scratch = "/tmp/claude-1000/-run-media-matt-Data-matt-Coding-FoundryVTT-EagleEye/9c37d4e4-e0ad-4c8b-8a54-8ab1bb2f3c6f/scratchpad/pkg-check/";
const STUB_BUILD = "mkdir -p v13/dist && echo bundle > v13/dist/module.js";

// A copy of the repository parts the script needs, with a stubbed build so that no tool chain is needed.
function tree(name, { pack = {}, manifest = {}, script = repo + "v13/package.mjs", scriptPath = "v13/package.mjs", dropLang = false } = {}) {
  const dir = scratch + name + "/";
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir + "v13/lang", { recursive: true });
  const packageJson = { ...JSON.parse(readFileSync(repo + "package.json", "utf8")), ...pack };
  packageJson.scripts = { ...packageJson.scripts, build: STUB_BUILD, ...(pack.scripts ?? {}) };
  writeFileSync(dir + "package.json", JSON.stringify(packageJson, null, 2));
  writeFileSync(dir + "v13/module.json", JSON.stringify({ ...JSON.parse(readFileSync(repo + "v13/module.json", "utf8")), ...manifest }, null, 2));
  if (!dropLang) cpSync(repo + "v13/lang/en.json", dir + "v13/lang/en.json");
  mkdirSync(dir + scriptPath.split("/").slice(0, -1).join("/"), { recursive: true });
  cpSync(script, dir + scriptPath);
  mkdirSync(dir + "release", { recursive: true });
  writeFileSync(dir + "release/old.txt", "previous release");
  return dir;
}

function run(dir, scriptPath = "v13/package.mjs", env = process.env) {
  const result = spawnSync("/usr/bin/node", [dir + scriptPath], { cwd: dir, encoding: "utf8", env });
  return { status: result.status, out: (result.stdout ?? "") + (result.stderr ?? "") };
}

let problems = 0;
function report(id, what, ok, detail) {
  if (!ok) problems++;
  console.log(`${id.padEnd(4)} ${ok ? "ok     " : "FEHLT  "} ${what}${detail ? `\n       ${detail}` : ""}`);
}

// A failing run must exit with 1, name the problem and leave the previous release alone.
function failing(id, what, dir, expected, opts = {}) {
  const { status, out } = run(dir, opts.scriptPath, opts.env);
  const message = out.split("\n").find((line) => line.includes(expected));
  const untouched = existsSync(dir + "release/old.txt");
  report(id, what, status === 1 && !!message && (opts.releaseMayChange || untouched), status === 1 && message ? `"${message.trim().slice(0, 130)}"` : `Exit ${status}: ${out.trim().slice(0, 200)}`);
}

// --- a run that works, in a tree of its own
{
  const dir = tree("P1");
  const { status, out } = run(dir);
  const files = existsSync(dir + "release") ? spawnSync("zip", ["-sf", dir + "release/eagleeye-v13.zip"], { encoding: "utf8" }).stdout : "";
  const holds = ["module.json", "dist/module.js", "lang/en.json"].every((entry) => files.includes(`  ${entry}\n`)) && files.includes("Total 3 entries");
  report("P1", "a run in another tree works: exit 0, three entries, module.json copied", status === 0 && holds && existsSync(dir + "release/module.json"));
  report("P2", "the release folder is emptied first (old file gone) and the staging folder is removed", !existsSync(dir + "release/old.txt") && !existsSync(dir + "release/stage"));
  const versionLine = out.split("\n").find((line) => line.includes("release files for version"));
  report("P3", "the output names the version and says that nothing was published", !!versionLine && versionLine.includes("0.1.0") && versionLine.includes("nothing was published"), versionLine?.trim());
}

// --- runs that have to fail
failing("N1", "versions of package.json and module.json differ", tree("N1", { pack: { version: "0.1.1" } }), "package.json has version");
failing("N2", "download names another tag than the version", tree("N2", { manifest: { download: "https://github.com/MattTheEagle/EagleEye/releases/download/v13-v0.0.1/eagleeye-v13.zip" } }), "download is");
failing("N3", "manifest address does not fit the repository", tree("N3", { manifest: { manifest: "https://example.com/module.json" } }), 'manifest is "https://example.com/module.json"');
failing("N4", "version is not x.y.z", tree("N4", { manifest: { version: "0.1" }, pack: { version: "0.1" } }), 'is not x.y.z');
failing("N5", "the language file is missing", tree("N5", { dropLang: true }), "does not exist in v13/");
failing("N6", "a path leaves the module folder", tree("N6", { manifest: { languages: [{ lang: "en", name: "English", path: "../../etc/passwd" }] } }), "not a plain relative path");
failing("N7", "esmodules is empty", tree("N7", { manifest: { esmodules: [] } }), "esmodules is not a list");
failing("N8", "the module id is wrong", tree("N8", { manifest: { id: "eagleeye2" } }), 'id is "eagleeye2"');
failing("N9", "url is not a GitHub repository", tree("N9", { manifest: { url: "https://example.com/x" } }), "not the address of a GitHub repository");
failing("N10", "the script sits outside a folder named v13", tree("N10", { scriptPath: "tools/package.mjs" }), "belongs in the v13 folder", { scriptPath: "tools/package.mjs" });
{
  const empty = scratch + "nobin/";
  mkdirSync(empty, { recursive: true });
  failing("N11", "the zip tool is not on the PATH", tree("N11"), "`zip` tool is not installed", { env: { ...process.env, PATH: empty } });
}
failing("N12", "the build fails", tree("N12", { pack: { scripts: { build: "exit 1" } } }), "the build failed");
failing("N13", "the build produces no bundle", tree("N13", { pack: { scripts: { build: "true" } } }), 'the build did not produce "dist/module.js"');

console.log(problems === 0 ? "\nalle Prüfungen ok" : `\n${problems} Prüfung(en) fehlgeschlagen`);
process.exit(problems === 0 ? 0 : 1);

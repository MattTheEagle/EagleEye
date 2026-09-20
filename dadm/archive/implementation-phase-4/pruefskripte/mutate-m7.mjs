import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = "/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/";
const sha = (t) => createHash("sha256").update(t).digest("hex").slice(0, 12);

const S = "core/system-guard.ts", A = "core/eagle-api.ts";
const mutations = [
  // evaluation
  ["S1 an id that cannot be read is not unknown", S, "    if (typeof id !== \"string\" || id === \"\") return result(null, null, \"unknown\");", "    if (false) return result(null, null, \"unknown\");"],
  ["S2 another system is not recognised", S, "    if (id !== supportedId) return result(id, null, \"other-system\");", "    if (false) return result(id, null, \"other-system\");"],
  ["S3 a version that is not a strict x.y.z is not unknown", S, "    if (typeof version !== \"string\" || parsed === undefined) return result(id, null, \"unknown\");", "    if (typeof version !== \"string\") return result(id, null, \"unknown\");"],
  ["S4 a listed version is not rated tested", S, "    if (tested.includes(version)) return result(id, version, \"tested\");", "    if (false) return result(id, version, \"tested\");"],
  ["S5 same-line ignores the minor version", S, "return other !== undefined && other.major === parsed.major && other.minor === parsed.minor;", "return other !== undefined && other.major === parsed.major;"],
  ["S6 same-line ignores the major version", S, "return other !== undefined && other.major === parsed.major && other.minor === parsed.minor;", "return other !== undefined && other.minor === parsed.minor;"],
  ["S7 the line is compared as text", S, "other.major === parsed.major && other.minor === parsed.minor;", "other.major === parsed.major && String(parsed.minor).startsWith(String(other.minor));"],
  ["S8 a source that throws is not caught", S, "  } catch {\n    return result(null, null, \"unknown\");\n  }", "  } catch (error) {\n    throw error;\n  }"],
  ["S9 the answer shares the list instead of copying it", S, "testedVersions: Object.freeze([...tested])", "testedVersions: tested"],
  ["S10 the list in the code is not frozen", S, "Object.freeze([\"5.3.3\"])", "[\"5.3.3\"]"],
  ["S11 the answer is not frozen", S, "Object.freeze({ id, version, status, testedVersions: Object.freeze([...tested]) })", "({ id, version, status, testedVersions: Object.freeze([...tested]) })"],
  ["S12 the tested version is not the one of the test world", S, "Object.freeze([\"5.3.3\"])", "Object.freeze([\"5.3.4\"])"],
  ["S13 the supported system is another one", S, "export const SUPPORTED_SYSTEM_ID = \"dnd5e\";", "export const SUPPORTED_SYSTEM_ID = \"dnd5f\";"],
  // notice and announcement
  ["N1 a system on a tested line gets a notice", S, "    case \"untested\":\n      return", "    case \"same-line\":\n    case \"untested\":\n      return"],
  ["N2 the notice does not name the tested versions", S, "tested: info.testedVersions.join(\", \")", "tested: \"\""],
  ["N3 the notice does not name the other system", S, "data: { id: info.id ?? \"\" }", "data: { id: \"\" }"],
  ["N4 a player gets the notice", S, "if (notice && environment.isGm())", "if (notice)"],
  ["N5 a system that is not tested but on no line is logged as info", S, "if (info.status === \"tested\" || info.status === \"same-line\") environment.log.info(line);", "if (info.status === \"tested\" || info.status === \"same-line\" || info.status === \"untested\") environment.log.info(line);"],
  ["N6 the raw values of an unknown system are not logged", S, "const detail = info.status === \"unknown\" ? `; ${describeRaw(source)}` : \"\";", "const detail = \"\";"],
  ["N7 a failing log breaks the caller", S, "  } catch {\n    // a failing log must not stop the notice\n  }", "  } finally {\n    // removed\n  }"],
  ["N8 a failing notification breaks the caller", S, "  } catch {\n    // a failing notification must not break the caller\n  }", "  } finally {\n    // removed\n  }"],
  // api
  ["A1 getSystemInfo does not catch a failing function", A, "    } catch (error) {\n      log.warn(`eagleeye | getSystemInfo failed: ${describeError(error)}`);\n      return { ok: false, reason: \"internal-error\", detail: describeError(error) };", "    } catch (error) {\n      throw error;"],
  ["A2 getSystemInfo answers with the first result for ever", A, "return { ok: true, value: systemInfo() };", "return { ok: true, value: ((globalThis as any).__systemCache ??= systemInfo()) };"],
  ["A3 the API does not offer getSystemInfo", A, "registerModule, request, getRights, getSystemInfo });", "registerModule, request, getRights });"],
];

let caught = 0, skipped = 0;
for (const [name, file, from, to] of mutations) {
  const path = root + file;
  const original = readFileSync(path, "utf8");
  const count = original.split(from).length - 1;
  if (count !== 1) { skipped++; console.log(`SKIP  ${name}: Textstelle nicht genau einmal gefunden (${count}x)`); continue; }
  const before = sha(original);
  try {
    writeFileSync(path, original.replace(from, () => to));
    let failed = false, summary = "";
    try { execSync("npx vitest run", { cwd: root, stdio: "pipe", timeout: 120000 }); }
    catch (e) {
      failed = true;
      const out = String(e.stdout) + String(e.stderr);
      summary = [...new Set([...out.matchAll(/^ (?:FAIL|×)\s+(.+)$/gm)].map((m) => m[1].trim().slice(0, 90)))].slice(0, 2).join(" | ") || (out.match(/Unhandled[^\n]*/)?.[0] ?? "");
    }
    console.log(`${failed ? "gefunden " : "UEBERSEHEN"} ${name}${summary ? "  -> " + summary : ""}`);
    if (failed) caught++;
  } finally {
    writeFileSync(path, original);
    if (sha(readFileSync(path, "utf8")) !== before) console.log("!!! Datei nicht wiederhergestellt:", file);
  }
}
console.log(`${caught} von ${mutations.length - skipped} Fehlern gefunden` + (skipped ? ` (${skipped} uebersprungen)` : ""));

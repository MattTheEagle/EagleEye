/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import langRaw from "../v13/lang/en.json?raw";
import manifestRaw from "../v13/module.json?raw";

// Source files that may contain localization keys (tests and declaration files excluded).
const sources = import.meta.glob(["../core/*.ts", "../v13/*.ts", "!../core/*.test.ts", "!../v13/*.d.ts"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function flatten(value: unknown, prefix = ""): Record<string, string> {
  if (typeof value !== "object" || value === null) return { [prefix]: String(value) };
  const result: Record<string, string> = {};
  for (const [key, child] of Object.entries(value)) {
    Object.assign(result, flatten(child, prefix ? `${prefix}.${key}` : key));
  }
  return result;
}

describe("localization keys", () => {
  it("has a non-empty English text for every EAGLEEYE.* key used in code, and the manifest points at the file", () => {
    const translations = flatten(JSON.parse(langRaw));
    const used = new Set<string>();
    for (const text of Object.values(sources)) {
      for (const match of text.matchAll(/EAGLEEYE(?:\.[A-Za-z0-9_]+)+/g)) used.add(match[0]);
    }

    expect(used.size, "no EAGLEEYE.* keys found in the sources").toBeGreaterThan(0);
    for (const key of used) {
      expect(translations[key], `missing or empty text for ${key}`).toBeTruthy();
    }

    const manifest = JSON.parse(manifestRaw) as { languages?: Array<{ lang: string; path: string }> };
    expect(manifest.languages).toContainEqual(expect.objectContaining({ lang: "en", path: "lang/en.json" }));
  });
});

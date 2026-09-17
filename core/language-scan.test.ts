import { describe, expect, it } from "vitest";
import { scanLanguages, type LanguageAwarePackage, type LanguageScanSource } from "./language-scan";

function makePackage(id: string, langs: string[]): LanguageAwarePackage {
  return {
    id,
    title: id,
    languages: langs.map((lang) => ({ lang, name: lang })),
  };
}

describe("scanLanguages", () => {
  it("detects a multi-language package that supports the active language", () => {
    const source: LanguageScanSource = {
      modules: [makePackage("dnd5e-ish-module", ["en", "de", "fr"])],
      system: makePackage("dnd5e", ["en"]),
      activeLanguage: "de",
    };

    const [moduleStatus] = scanLanguages(source);

    expect(moduleStatus.supportedLanguages).toEqual(["en", "de", "fr"]);
    expect(moduleStatus.supportsActiveLanguage).toBe(true);
  });

  it("reports false when the active language is not supported", () => {
    const source: LanguageScanSource = {
      modules: [makePackage("english-only", ["en"])],
      system: makePackage("dnd5e", ["en"]),
      activeLanguage: "de",
    };

    const [moduleStatus] = scanLanguages(source);

    expect(moduleStatus.supportsActiveLanguage).toBe(false);
  });
});

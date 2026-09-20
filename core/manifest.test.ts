/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import packageRaw from "../package.json?raw";
import manifestRaw from "../v13/module.json?raw";
import { EAGLEEYE_ID } from "./index";

// The manifest is what Foundry installs from, so the release files must agree with it. `npm run package` checks the
// same rules again when it builds the release.
interface Manifest {
  id: string;
  description: string;
  version: string;
  authors: { name: string }[];
  url: string;
  bugs: string;
  compatibility: { minimum: string; verified: string };
  esmodules: string[];
  languages: { lang: string; name: string; path: string }[];
  manifest: string;
  download: string;
}

interface PackageJson {
  version: string;
  private?: boolean;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

const manifest = JSON.parse(manifestRaw) as Manifest;
const pack = JSON.parse(packageRaw) as PackageJson;

// The language files the release ships; the bundle is built, so only these can be looked at here.
const languageFiles = import.meta.glob("../v13/lang/*.json", { query: "?raw", import: "default", eager: true });

describe("module manifest", () => {
  it("names the module and gives it a release version", () => {
    expect(manifest.id).toBe(EAGLEEYE_ID);
    expect(manifest.version).toMatch(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  });

  it("points manifest, download and bugs at the release of that version", () => {
    expect(manifest.url).toMatch(/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/);
    expect(manifest.manifest).toBe(`${manifest.url}/releases/latest/download/module.json`);
    expect(manifest.download).toBe(`${manifest.url}/releases/download/v13-v${manifest.version}/eagleeye-v13.zip`);
    expect(manifest.bugs).toBe(`${manifest.url}/issues`);
  });

  it("loads the bundle and the English texts, which are the files of the release", () => {
    expect(manifest.esmodules).toEqual(["dist/module.js"]);
    expect(manifest.languages).toEqual([{ lang: "en", name: "English", path: "lang/en.json" }]);
    expect(Object.keys(languageFiles)).toContain("../v13/lang/en.json");
  });

  it("is written for Foundry 13 only", () => {
    expect(manifest.compatibility).toEqual({ minimum: "13", verified: "13" });
  });

  it("has no placeholder text left", () => {
    expect(manifest.authors.length).toBeGreaterThan(0);
    for (const author of manifest.authors) {
      expect(author.name.trim()).not.toBe("");
      expect(author.name.toLowerCase()).not.toBe("projektleiter");
    }
    expect(manifest.description.trim()).not.toBe("");
    expect(manifest.description).not.toMatch(/in entwicklung/i);
  });
});

describe("package.json", () => {
  it("has the version of the manifest", () => {
    expect(pack.version).toBe(manifest.version);
  });

  it("stays private, adds no dependency and offers the package script", () => {
    expect(pack.private).toBe(true);
    expect(pack.dependencies).toBeUndefined();
    expect(Object.keys(pack.devDependencies ?? {}).sort()).toEqual(["esbuild", "typescript", "vitest"]);
    expect(pack.scripts?.package).toBe("node v13/package.mjs");
  });
});

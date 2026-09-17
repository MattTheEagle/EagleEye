export interface PackageLanguageInfo {
  lang: string;
  name?: string;
  system?: string;
}

export interface LanguageAwarePackage {
  id: string;
  title: string;
  languages: Iterable<PackageLanguageInfo>;
}

export interface LanguageScanSource {
  modules: Iterable<LanguageAwarePackage>;
  system: LanguageAwarePackage;
  activeLanguage: string;
}

export interface LanguageStatus {
  id: string;
  title: string;
  supportedLanguages: string[];
  supportsActiveLanguage: boolean;
}

function defaultSource(): LanguageScanSource {
  return {
    modules: game.modules!.contents as unknown as Iterable<LanguageAwarePackage>,
    system: game.system as unknown as LanguageAwarePackage,
    activeLanguage: game.i18n!.lang,
  };
}

function toStatus(pkg: LanguageAwarePackage, activeLanguage: string): LanguageStatus {
  const supportedLanguages = [...pkg.languages].map((l) => l.lang);
  return {
    id: pkg.id,
    title: pkg.title,
    supportedLanguages,
    supportsActiveLanguage: supportedLanguages.includes(activeLanguage),
  };
}

export function scanLanguages(source: LanguageScanSource = defaultSource()): LanguageStatus[] {
  const results: LanguageStatus[] = [];
  for (const mod of source.modules) {
    results.push(toStatus(mod, source.activeLanguage));
  }
  results.push(toStatus(source.system, source.activeLanguage));
  return results;
}

export function logLanguageScan(source?: LanguageScanSource): void {
  console.table(scanLanguages(source));
}

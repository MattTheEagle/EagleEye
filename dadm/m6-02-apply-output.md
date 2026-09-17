```
artifact: apply-output
milestone: M6
phase: APPLY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m6-01-discover-output.md` (geschlossen)

## Solution Design

### Architektur
Neues, eigenständiges Modul `core/language-scan.ts` — bewusst **nicht** in
`core/manifest-scanner.ts` (M3) integriert, um das bereits geschlossene M3-
Artefakt nicht nachträglich zu verändern. Gleiches Injection-Testmuster wie
M3/M4/M5.

### Interface (Signaturen)
```ts
interface PackageLanguageInfo {
  lang: string;
  name?: string;
  system?: string;
}

interface LanguageAwarePackage {
  id: string;
  title: string;
  languages: Iterable<PackageLanguageInfo>;
}

interface LanguageScanSource {
  modules: Iterable<LanguageAwarePackage>;
  system: LanguageAwarePackage;
  activeLanguage: string;
}

interface LanguageStatus {
  id: string;
  title: string;
  supportedLanguages: string[];
  supportsActiveLanguage: boolean;
}

function scanLanguages(source?: LanguageScanSource): LanguageStatus[];
function logLanguageScan(source?: LanguageScanSource): void;
```

`scanLanguages()` markiert `supportsActiveLanguage: true`, wenn irgendein
Eintrag in `languages` mit `lang === source.activeLanguage` übereinstimmt
(unabhängig vom optionalen `system`-Feld — eine genauere, system-eingeschränkte
Auswertung wäre Overhead für dieses Milestones Ziel).

### Grenze (aus Discover übernommen, für Bericht wichtig)
Erkennbar ist nur die **deklarierte** Sprachunterstützung laut Manifest, nicht
der tatsächliche Ladezustand zur Laufzeit (keine öffentliche API dafür). Für
das Milestone-Ziel ("Sprache installierter Systeme/Module kennen") ausreichend.

## Acceptance Criteria
```
AC-M6-01: `scanLanguages()` erkennt bei einem gemockten Paket mit mehreren
          Sprachen (inkl. der aktiven) `supportsActiveLanguage: true` und die
          korrekte Sprachliste.
AC-M6-02: Bei einem Paket ohne die aktive Sprache: `supportsActiveLanguage: false`.
AC-M6-03: Build/Typecheck fehlerfrei für v13 und v14 nach Hook-Integration.
AC-M6-04 (Proof für "mind. 1 mehrsprachiges Test-System"): Live-Log gegen die
          reale Welt des Projektleiters (dnd5e ist mehrsprachig und dort bereits
          aktiv) — bestätigt, dass ein echtes System mit mehreren deklarierten
          Sprachen korrekt erkannt wird.
```

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | Nur deklarierte Sprachunterstützung erkennbar (aus Discover R1 übernommen) | low | nein |

## Open TBDs
Keine blockierenden TBDs.

## Next Step
Deploy implementiert `core/language-scan.ts` + Tests, Hook-Integration,
optionaler Live-Check gegen dnd5e.

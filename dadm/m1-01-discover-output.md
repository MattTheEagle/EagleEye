# M1 — Phase-1-Code schneiden (E6) — Discover Output

```
artifact: discover-output
milestone: M1
phase: DISCOVER
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Entscheidung über Behalten/Umbauen/Entfernen
(das ist Aufgabe des Apply).

---

## Input Summary

- `dadm/04-milestone-plan.md` (M1), `01-project-brief.md`, `03-scope-declaration.md`,
  `06-working-mode.md`
- Bestätigte Pläne: `dadm/eagle-modules-projektplan.md` Abschnitt 3.1 (Phase-1-Code),
  `EAGLE-MODULES-PLAN.md`
- Der gesamte Code in `core/`, `v13/`, `test-fixtures/`, dazu `package.json`,
  `tsconfig.base.json`, `README.md` (Ist-Zustand gelesen, nicht geändert)
- `dadm/archive/research-phase-1/SUMMARY.md` (Live-Nachweise der ersten Phase)
- Messungen: `npm run typecheck`, `npm test` (Ausgangsstand), `git log`, `git diff`
  gegen den Release-Tag `v13-v0.0.1`, `gh release list` (read-only)

---

## Current-State Summary

Das Modul `eagleeye` (v0.0.1) besteht aus **538 Zeilen** TypeScript
(317 Code, 221 Tests) in 11 Dateien. Es tut heute genau vier Dinge:

1. **`init`:** loggt die Bereitschaft und registriert ein Einstellungsmenü "EagleEye
   Hub" (`restricted: true`, also nur für den GM), das ein `HubApplication`-Fenster
   öffnet.
2. **Hub-Fenster:** Es zeigt eine Tabelle **aller** Einstellungen **aller** Module und
   Systeme (`game.settings.settings`) und schreibt Änderungen in beliebige Namespaces
   zurück.
3. **`ready`:** gibt per `console.table` alle Module plus System mit Version,
   Aktivstatus und Kompatibilitäts-Badge aus, per `console.table` die deklarierten
   Sprachen aller Pakete, und lauscht auf libWrapper-Konfliktereignisse beliebiger
   Pakete (`console.warn`).
4. **Sonst nichts:** keine API (`game.modules.get("eagleeye").api` wird nirgends
   gesetzt), keine Anmeldung von Modulen, kein Anfragekanal, kein Versionswächter,
   keine Lokalisierungsdateien, kein Stylesheet.

Alles arbeitet über **alle** installierten Pakete; nirgends gibt es einen Filter auf
Eagle Module. Sichtbar für Nutzer ist nur das Hub-Fenster; alles andere geht in die
Konsole.

Ausgangsstand der Prüfungen (heute gemessen): `npm run typecheck` Exit 0;
`npm test` 4 Dateien, 10 Tests bestanden (477 ms). `npm run build` wurde in Discover
nicht ausgeführt (`v13/dist/module.js` liegt vor, 5.759 Bytes, erzeugt
2026-09-19 12:51).

Die Import-Beziehungen sind einfach: nur `v13/module.ts` importiert aus `core/` (fünf
Dateien); `core/hub-application.ts` importiert `core/settings-hub.ts`; alle anderen
`core/`-Dateien importieren nichts. Die Tests importieren jeweils nur ihre eigene
Datei. Seit dem Entfernen von v14 hat `core/` außer `v13/module.ts` keinen Verbraucher.

Live-Stand: Der letzte Code-Commit stammt vom **2026-09-17** (`4de2bcf`, Phase-1-M6).
Laut archivierter Phase-1-Zusammenfassung wurden Hub-Lesen/-Schreiben (M4),
libWrapper-Ereignisse (M5) und Spracherkennung gegen 94 reale Pakete (M6) auf Forge
bestätigt. Danach änderte sich kein Code mehr (Phase 3, M1 berührte nur v14-Ordner,
`package.json` und `README.md`). Der heutige Build wurde nicht erneut live gestartet.

Der GitHub-Release `v13-v0.0.1` (einziger Release, Markierung "Latest") enthält den
**minimalen M1-Stand**, nicht den heutigen Code: Der Diff zwischen Tag und Arbeitsstand
umfasst 10 Dateien, +528 Zeilen. `v13/module.json` zeigt als Manifest auf
`releases/latest/download/module.json`.

---

## Inventory

Bezug zu Fremdmodulen: **ja** = liest/beobachtet Pakete oder Einstellungen außerhalb
der eigenen; **nein** = kein Bezug; **Plan** = wie der bestätigte technische Plan
(Abschnitt 3.1) die Datei einordnet.

| # | Name | Beschreibung | Ort | Status |
|---|---|---|---|---|
| I1 | Kern-Konstante | `EAGLEEYE_ID = "eagleeye"`, `logEagleEyeReady(version)`; die Konstante wird nur in dieser Funktion benutzt (`module.ts` und `hub-application.ts` schreiben "eagleeye" bzw. "eagleeye-hub" als Literal). Bezug: nein | `core/index.ts` (5 Z.) | present, relevant |
| I2 | Paket-Scan | `scanPackages`/`logPackageScan`: id, title, version, kind, active, availability, Badge für **alle** `game.modules` plus `game.system`; kein Filter. Typ `PackageBadge` enthält v14-Werte (`"success"`, `"warning"`, `"neutral"`, `"error"`) und einen Kommentar zu v14 (Z. 4–5). Bezug: ja. Plan: "Paketdaten-Lesen als Baustein (mit Filter auf Eagle Module)" | `core/manifest-scanner.ts` (64 Z.) | present, relevant |
| I3 | Test Paket-Scan | 2 Tests (inkompatibles Dummy-Paket, System ist enthalten) | `core/manifest-scanner.test.ts` (53 Z.) | present |
| I4 | Einstellungs-Registry | `listSettings`: liest `game.settings.settings` (Map, alle Namespaces), Wert per `get`, Name/Hint per `localize`, Scope Default `client`; `updateSetting`: `set` in beliebigem Namespace, ohne Prüfung oder Filter. Bezug: ja. Plan: "Registry-Lesen/-Schreiben als Baustein (mit Filter auf Eagle Module)" | `core/settings-hub.ts` (61 Z.) | present, relevant |
| I5 | Test Registry | 3 Tests, darunter eine Regression (Instanz vs. `.settings`-Map) und "schreibt in einen fremden Namespace" | `core/settings-hub.test.ts` (75 Z.) | present |
| I6 | Hub-Fenster | `HubApplication extends ApplicationV2`: `_renderHTML` baut einen HTML-String (Tabelle: `namespace.key`, Name, Scope, Eingabe Checkbox/Text); `_replaceHTML` setzt `innerHTML`; `_onRender` bindet `change` an `updateSetting`. Kein `HandlebarsApplicationMixin`, keine Templates, keine Tabs, keine Lokalisierung, Inline-Stil; `namespace`, `key`, `name` und Wert werden **ohne Escaping** eingesetzt. Bezug: ja (alle Einstellungen). Kein Test | `core/hub-application.ts` (57 Z.) | present, relevant |
| I7 | Konflikt-Überwachung | Hooks `libWrapper.ConflictDetected`/`libWrapper.OverrideLost` → `console.warn`; nur aktiv, wenn `lib-wrapper` aktiv ist. Bezug: ja (Konflikte beliebiger Pakete). Plan: "ohne Bezug", Entfernen als Entscheidung dieser Phase | `core/conflict-watch.ts` (50 Z.) | present |
| I8 | Test Konflikt | 3 Tests | `core/conflict-watch.test.ts` (56 Z.) | present |
| I9 | Sprach-Erkennung | `scanLanguages`/`logLanguageScan`: deklarierte `languages` aller Module plus System gegen `game.i18n.lang`, `console.table`. Bezug: ja. Plan: "Fremdmodul-Sprach-Erkennung ohne Bezug", Entfernen als Entscheidung dieser Phase | `core/language-scan.ts` (55 Z.) | present |
| I10 | Test Sprache | 2 Tests | `core/language-scan.test.ts` (37 Z.) | present |
| I11 | Einstiegspunkt | `Hooks.once("init")`: `logEagleEyeReady("13")`, `registerMenu("eagleeye", "hub", …)` (Name "EagleEye Hub", Label "Open Hub", Hint auf Deutsch, `restricted: true`); `Hooks.once("ready")`: `logPackageScan()`, `watchForConflicts(logConflict)`, `logLanguageScan()`. Kein `setup`-Hook, keine API. Kein Test | `v13/module.ts` (25 Z.) | present, relevant |
| I12 | Manifest | `id eagleeye`, `title EagleEye`, `version 0.0.1`, `compatibility min 13 / verified 13`, `esmodules dist/module.js`, `manifest` und `download` auf GitHub; Beschreibung nennt "Fremdmodulen", "Forschungsprojekt", "Minimaler M1-Testbuild". Ohne `relationships`, `flags`, `languages`, `styles`, `packs` | `v13/module.json` | present, relevant |
| I13 | TS-Konfiguration | `v13/tsconfig.json` erweitert `tsconfig.base.json` (ES2022, strict, noEmit) und bindet `../core/**/*.ts`, `./**/*.ts` sowie per **absolutem Pfad** `/run/media/matt/Data/matt/Coding/foundry-vtt-reference-v13/types/src/index.d.mts` ein | `v13/tsconfig.json`, `tsconfig.base.json` | present |
| I14 | Paket-Manifest | `name eagleeye`, `version 0.0.1`, Beschreibung nennt "Fremdmodulen"; Skripte `build:v13`, `build`, `typecheck:v13`, `typecheck`, `test`; devDependencies esbuild, typescript, vitest; Feld `allowScripts`. **Kein** Packaging-/Release-Skript, kein Lint | `package.json` | present, relevant |
| I15 | Test-Fixtures | Zwei statische Foundry-Testmodule `eagleeye-dummy-a` (Einstellung `enabled`, Scope `client`, Boolean) und `-b` (`label`, Scope `world`, String), `compatibility.minimum 11`. Herkunft: Phase-1-M4-Live-Nachweis. **Kein Code importiert sie**; ihre IDs stehen nur als Zeichenketten in `settings-hub.test.ts` und `manifest-scanner.test.ts` | `test-fixtures/` (4 Dateien) | present |
| I16 | README | Beschreibt den Code als Grundgerüst und nennt noch "Funktionen für Fremdmodule (Paket-Scan, Konflikt-Überwachung)"; Build-Anweisungen | `README.md` | present |
| I17 | Build-Ausgabe | `v13/dist/module.js` (gitignoriert) | `v13/dist/` | present |
| I18 | GitHub-Release | `v13-v0.0.1` "Latest", 2026-09-17, minimaler M1-Stand (siehe Current-State) | `github.com/MattTheEagle/EagleEye` | present |
| I19 | Foundry-Referenz-Konfiguration | `v13/.foundry-workspace.yaml` (`foundry_version: 13`, committed); neu: `.foundry-workspace.yaml` im Root (heute angelegt) | `v13/`, Projekt-Root | present |

Testabdeckung: 4 Testdateien / 10 Tests decken die Logik-Dateien I2, I4, I7, I9 ab.
Ohne Test sind I1, I6 (Hub-Fenster) und I11 (Einstiegspunkt), also alle Teile, die
Foundry-Laufzeit brauchen.

---

## Dependencies

| # | Dependency | Version | Status |
|---|---|---|---|
| D1 | Foundry VTT (Forge) | Manifest: min/verified 13 | present (Projektleiter, live) |
| D2 | Node.js | v24.21.0 | present |
| D3 | esbuild | 0.24.2 (`^0.24.0`) | present |
| D4 | typescript | 5.9.3 (`^5.6.0`) | present |
| D5 | vitest | 2.1.9 (`^2.1.0`) | present |
| D6 | Foundry-Types (`foundry-vtt-reference-v13/types`) | gepinnt laut Referenz-README, per absolutem Pfad eingebunden | present (nur lokal) |
| D7 | libWrapper (Foundry-Modul) | Laufzeit-optional in `conflict-watch.ts` (Prüfung `lib-wrapper` aktiv); **nicht** im Manifest als Abhängigkeit deklariert | unclear (kein Bezug zu Flight Control lt. Plan) |
| D8 | dnd5e-System | nirgends im Code referenziert (nur der String "dnd5e" in Tests) | missing (nicht genutzt) |

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | `hub-application.ts` setzt `namespace`, `key`, Name und Wert **ohne Escaping** in HTML (`innerHTML`). Sonderzeichen in Einstellungen fremder Module können die Darstellung brechen oder Markup einschleusen. Abmilderung heute: Menü ist `restricted: true` (nur GM). | `low` | no |
| R2 | `updateSetting` schreibt ohne jede Prüfung in beliebige Namespaces. Erreichbar nur über den GM-Hub (keine API). Berührt später Q3 a und N1 (wer darf was ändern). | `low` | no |
| R3 | `v13/tsconfig.json` enthält einen absoluten Pfad auf diesen Rechner; der Typecheck läuft nur hier. | `low` | no |
| R4 | Der Release `v13-v0.0.1` ("Latest") enthält den minimalen M1-Stand, nicht den heutigen Code; die Manifest-URL zeigt auf `latest`. Änderungen am Repo wirken auf Forge erst nach Import Wizard oder neuem Release. | `info` | no |
| R5 | Das Hub-Fenster ist die einzige sichtbare Oberfläche; alle übrigen Funktionen schreiben nur in die Konsole. Was in Forge sichtbar ist, hängt damit vollständig an I6. | `info` | no |
| R6 | Alle Foundry-gebundenen Teile (I1, I6, I11) sind ungetestet; Tests laufen nur über Logik mit Attrappen. | `info` | no |
| R7 | Der heutige Build wurde seit dem Entfernen von v14 nicht live gestartet; der Code ist seit dem Live-Nachweis von Phase 1 unverändert. Live-Aussagen zum Ist-Verhalten bleiben `unverified`, bis ein Test freigegeben wird (Live-Test-Gate). | `low` | no |
| R8 | Beschreibungstexte (`module.json`, `package.json`, `README.md`) und ein Kommentar (`manifest-scanner.ts`) nennen Fremdmodule, v14, "Forschungsprojekt" bzw. "Minimaler M1-Testbuild" und passen nicht mehr zu E6. | `low` | no |
| A1 | **Annahme:** Die Plan-Formulierung "Registry-Lesen/-Schreiben und Paketdaten-Lesen als Bausteine" ordne ich `settings-hub.ts` (Registry) und `manifest-scanner.ts` (Paketdaten) zu. Die Zuordnung folgt aus Funktionsnamen und der Phase-1-Zusammenfassung (M3, M4), nicht aus einem Wortlaut im Plan. | `low` | no |
| A2 | **Annahme:** Die Live-Nachweise von Phase 1 stimmen mit der archivierten Zusammenfassung überein; sie wurden heute nicht erneut geprüft. | `low` | no |

Kein `medium`-Fund, kein `critical`-Fund, kein Trigger für eine Human Decision.

---

## Open Questions

Sie gehören alle zur Entscheidungsarbeit des Apply, nicht zu fehlenden Fakten. Keine
blockiert den Start des Apply.

| # | Question | Priority | Owner |
|---|---|---|---|
| Q1 | Welche der Dateien I2–I11 bleiben, werden umgebaut oder entfernt (E6, N4)? Der Plan nennt I7 und I9 "ohne Bezug" und lässt das Entfernen offen; bei fehlender klarer Option entscheidet der Projektleiter (Trigger 6). | important | Claude (Apply), ggf. Projektleiter |
| Q2 | Was passiert mit dem Hub-Fenster (I6) bis M3 es ersetzt: bleibt es, wird es umgebaut oder entfällt es? (Folge: R5.) | important | Claude (Apply) |
| Q3 | Bleibt die Aufteilung `core/` + `v13/` oder werden die Ordner zusammengelegt, nachdem v14 entfallen ist? | important | Claude (Apply) |
| Q4 | Ort und Form von `./docs/` für API-Vertrag und UI-Leitfaden (Scope-Punkt aus `03-scope-declaration.md`). | important | Claude (Apply), Bestätigung Projektleiter |
| Q5 | Test-Fixtures (I15): behalten, ersetzen oder entfernen? | nice-to-have | Claude (Apply) |
| Q6 | Wie werden die Foundry-gebundenen Teile künftig testbar (R6), ohne Live-Test? | important | Claude (Apply) |
| Q7 | Umfang der Text-Anpassungen in M1 (R8); die Versionsnummer bleibt nach Plan bis M8. | nice-to-have | Claude (Apply) |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m1-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

Es wurde kein Code geändert. Geändert wurden nur Prozess-Artefakte unter `dadm/` und
die neue `.foundry-workspace.yaml` (Bootstrap).

---

## Next Step

Apply M1: Entscheidungstabelle je Datei I2–I11 (Behalten/Umbauen/Entfernen mit
Begründung), Zuschnitt der Verzeichnisse (Q3), Ort von `./docs/` (Q4), Umgang mit
Hub-Fenster (Q2), Fixtures (Q5), Testansatz (Q6), Text-Anpassungen (Q7) und die
Acceptance-Kriterien für den Deploy.

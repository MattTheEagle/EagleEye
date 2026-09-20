# M1 — Phase-1-Code schneiden (E6) — Deploy Output

```
artifact: deploy-output
milestone: M1
phase: DEPLOY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m1-02-apply-output.md` (Design, Entscheidungstabelle, Acceptance AC-M1-01 bis -12,
  Deploy-Reihenfolge Abschnitt 9). Der Apply-Output gilt mit dem "Go" als geschlossen.
- **"Go" des Projektleiters am 2026-09-19** ("Go — Vorschläge T1 und T2 gelten"): Die
  Beschreibungstexte (Apply Abschnitt 7) und der Ort `./docs/` (Abschnitt 5) sind damit
  wie vorgeschlagen bestätigt.
- Ausgangsstand: Commit `77daf6d`; Discover-Baseline `typecheck` grün, 4 Testdateien /
  10 Tests grün.
- Grenzen: `06-working-mode.md` (kein Commit ohne Anweisung, kein Live-Test),
  `03-scope-declaration.md`.

---

## Implementation Summary

Der Deploy setzt genau das Design aus dem Apply um, ohne Abweichung und ohne
Dependency-Änderung:

- **Entfernt** (mit `rm`, nicht committet): Hub-Fenster, Konflikt-Überwachung und
  Sprach-Erkennung samt der Tests von Konflikt-Überwachung und Sprach-Erkennung.
- **Gekürzt:** `v13/module.ts` besteht nur noch aus dem Import von `logEagleEyeReady`
  und dem `init`-Hook. Kein Einstellungsmenü, kein `ready`-Hook, keine Scans.
- **Bereinigt:** `core/manifest-scanner.ts` (v14-Rest im Typ `PackageBadge.type` und der
  v14-Kommentar entfernt; Schnittstelle und Verhalten unverändert). `core/settings-hub.ts`
  trägt jetzt den Vorbedingungs-Kommentar (Eagle-Filter aus M2, Rechteprüfung vor
  jedem Schreiben aus M5/M6).
- **Texte:** `description` in `v13/module.json` und `package.json`; im `README.md` der
  Beschreibungsabsatz und die Stand-Klammer.

Laufzeitverhalten nach dem Deploy (aus dem Bundle abgelesen): Beim `init` schreibt das
Modul `eagleeye | ready (Foundry v13)` in die Konsole. Sonst tut es nichts.

---

## Files Changed

Gegenüber Commit `77daf6d`, ohne `dadm/` (Prozess-Artefakte), 11 Dateien:
+11 / −286 Zeilen.

| Datei | Änderung | Zeilen |
|---|---|---|
| `core/hub-application.ts` | gelöscht | −57 |
| `core/conflict-watch.ts` | gelöscht | −50 |
| `core/conflict-watch.test.ts` | gelöscht | −56 |
| `core/language-scan.ts` | gelöscht | −55 |
| `core/language-scan.test.ts` | gelöscht | −37 |
| `v13/module.ts` | gekürzt (25 → 5 Zeilen) | −20 |
| `core/manifest-scanner.ts` | Union gekürzt, Kommentar ersetzt | +2 / −3 |
| `core/settings-hub.ts` | Kommentar ergänzt | +3 |
| `v13/module.json` | nur `description` | +1 / −1 |
| `package.json` | nur `description` | +1 / −1 |
| `README.md` | Beschreibungsabsatz, Stand-Klammer | +4 / −6 |

Nicht im Diff, weil gitignoriert: `v13/dist/module.js` (neu gebaut, 5.759 → 238 Bytes).
Nicht geändert: `core/index.ts`, beide Testdateien der verbleibenden Bausteine,
`package-lock.json`, `test-fixtures/`, `v13/tsconfig.json`, `tsconfig.base.json`.

Stand der Codebasis: 265 Zeilen (vorher 538): 137 Code, 128 Tests; `core/` hat 5
Dateien (vorher 10).

---

## Proofs

Je einmal ausgeführt, nach Abschluss aller Änderungen (nicht wiederholt).

```
npm run typecheck   -> Exit 0
npm test            -> Test Files 2 passed (2); Tests 5 passed (5); Exit 0
                       core/manifest-scanner.test.ts (2 tests), core/settings-hub.test.ts (3 tests)
npm run build       -> v13/dist/module.js 238b; Exit 0
grep -cE "libWrapper|registerMenu|ConflictDetected" v13/dist/module.js   -> 0
grep -rniE "libwrapper|lib-wrapper|conflict-watch|language-scan|hub-application|HubApplication|registerMenu|languages" core v13 --include=*.ts   -> keine Treffer
grep -n -i v14 core/manifest-scanner.ts   -> keine Treffer
git diff v13/module.json package.json     -> je nur die description-Zeile
git diff --stat (package-lock.json, test-fixtures, v13/tsconfig.json, tsconfig.base.json)   -> leer
grep -niE "fremdmodul|forschungs|minimaler m1-testbuild" README.md v13/module.json package.json   -> keine Treffer
```

Ein Live-Test wurde nicht ausgeführt (Live-Test-Gate).

---

## Acceptance Checklist

- [x] AC-M1-01 — die fünf Dateien existieren nicht mehr (Prüfung je Datei: "weg")
- [x] AC-M1-02 — `v13/module.ts` importiert nur `core/index`, enthält 1 Hook (`init`), kein `registerMenu`, kein `ready`
- [x] AC-M1-03 — Suche in `core/` und `v13/` (`*.ts`) ohne Treffer
- [x] AC-M1-04 — kein v14-Verweis mehr; `PackageBadge.type` exakt `"safe" | "unsafe" | "warning" | "neutral" | "error"`; die 2 Tests sind unverändert und grün
- [x] AC-M1-05 — `core/settings-hub.ts`: Diff = nur der Vorbedingungs-Kommentar (+3 Zeilen inkl. Leerzeile); die 3 Tests sind unverändert und grün
- [x] AC-M1-06 — `typecheck` Exit 0
- [x] AC-M1-07 — 2 Testdateien, 5 Tests, alle bestanden
- [x] AC-M1-08 — `build` Exit 0; 0 Treffer im Bundle
- [x] AC-M1-09 — `module.json` und `package.json` nur in `description`; Lock-Datei, Fixtures, beide tsconfig unverändert
- [x] AC-M1-10 — keine der verbotenen Begriffe in README/`description`s; `id`, `title`, `version` unverändert
- [x] AC-M1-11 — Abgleich der Entscheidungstabelle siehe unten
- [ ] AC-M1-12 — **unverified**: Laden in Forge ohne Konsolenfehler, Startlog, kein Menü "EagleEye Hub" (nur nach ausdrücklicher Live-Freigabe)

### Abgleich Entscheidungstabelle (AC-M1-11)

| # | Datei | Apply-Entscheidung | Ist-Ergebnis | Stimmt |
|---|---|---|---|---|
| I1 | `core/index.ts` | behalten, unverändert | unverändert | ja |
| I2 | `core/manifest-scanner.ts` | behalten, Union kürzen, Kommentar ersetzen | +2 / −3, Verhalten unverändert | ja |
| I3 | `core/manifest-scanner.test.ts` | behalten, unverändert | unverändert, 2 Tests grün | ja |
| I4 | `core/settings-hub.ts` | behalten, nur Kommentar ergänzen | +3 Zeilen, nur Kommentar | ja |
| I5 | `core/settings-hub.test.ts` | behalten, unverändert | unverändert, 3 Tests grün | ja |
| I6 | `core/hub-application.ts` | entfernen | gelöscht | ja |
| I7 | `core/conflict-watch.ts` | entfernen | gelöscht | ja |
| I8 | `core/conflict-watch.test.ts` | entfernen | gelöscht | ja |
| I9 | `core/language-scan.ts` | entfernen | gelöscht | ja |
| I10 | `core/language-scan.test.ts` | entfernen | gelöscht | ja |
| I11 | `v13/module.ts` | auf `init`-Hook kürzen | 5 Zeilen, ein Hook | ja |
| I12 | `v13/module.json` | nur `description` | 1 Zeile | ja |
| I13 | `v13/tsconfig.json`, `tsconfig.base.json` | unverändert | unverändert | ja |
| I14 | `package.json` | nur `description` | 1 Zeile | ja |
| I15 | `test-fixtures/` | behalten, unverändert | unverändert | ja |
| I16 | `README.md` | Absatz und Stand-Klammer | beide ersetzt, Rest unverändert | ja |
| I17 | `v13/dist/module.js` | vom Build neu erzeugt | 238 Bytes | ja |
| I18 | GitHub-Release `v13-v0.0.1` | nicht angefasst | nicht angefasst | ja |
| I19 | `.foundry-workspace.yaml` | unverändert | unverändert (Root-Datei entstand im Bootstrap) | ja |

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | Das Modul hat keine sichtbare Oberfläche und außer dem Startlog keine Konsolenausgabe bis M3 (Apply-R1, mit dem "Go" akzeptiert). | `low` | no |
| R2 | `core/manifest-scanner.ts` und `core/settings-hub.ts` sind ohne Laufzeitverbraucher; sie sind getestet, und der Kommentar hält die Vorbedingungen fest (Apply-R2). | `low` | no |
| R3 | Der Live-Start des heutigen Builds ist `unverified` (AC-M1-12); die Erwartung stützt sich auf den 238-Byte-Bundle-Inhalt und Typecheck. | `low` | no |
| R4 | Gelöschter Code liegt nur im Git-Verlauf (Commit `77daf6d`); bis zu einem Commit besteht die Änderung nur im Arbeitsbaum (Apply-R3). | `low` | no |

Kein `medium`-Fund. Kein Rework nötig. Keine Abweichung vom Apply-Design, keine
Dependency-Änderung, keine Scope-Erweiterung.

---

## Decision Log

```
date: 2026-09-19
decision: Go für den Deploy von M1; die Vorschläge T1 (Beschreibungstexte) und T2 (Ort ./docs/) gelten wie im Apply-Output formuliert
reason: Freigabe nach Prüfung des Apply-Outputs; Autonomie-Regelung "Discover+Apply autonom, vor Deploy Go"
decided-by: Projektleiter
refs: m1-02-apply-output.md (Abschnitte 5, 7), 06-working-mode.md

date: 2026-09-19
decision: Deploy exakt nach Abschnitt 9 des Apply-Outputs umgesetzt, ohne Abweichung; Löschen mit rm (nicht git rm), kein Commit
reason: Commit und Push nur auf ausdrückliche Anweisung
decided-by: agent
refs: m1-02-apply-output.md, 06-working-mode.md
```

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m1-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Code-Änderungen im Arbeitsbaum (Tabelle "Files Changed") | durable (Repo; nicht committet) |
| `v13/dist/module.js` | ephemeral (Build-Ausgabe, gitignoriert) |

---

## Next Step

Monitor M1: Acceptance gegen den Deploy-Output abgleichen, Regressionen und Restrisiken
prüfen, Empfehlung (schließen / Rework / nächster Milestone). Das Monitor folgt nach
Working Mode ohne Stopp.

```
artifact: apply-output
milestone: M1
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m1-01-discover-output.md`

## Design der Änderung

| Datei | Änderung |
|---|---|
| `v14/` | Verzeichnis vollständig löschen (inklusive `dist/`) |
| `package.json` | `build:v14` und `typecheck:v14` entfernen; `build` wird `npm run build:v13`, `typecheck` wird `npm run typecheck:v13`. Die Namen `build:v13` und `typecheck:v13` bleiben, weil das Verzeichnis weiter `v13/` heißt |
| `README.md` Zeile 7 | "Entwickelt gegen Foundry v13 (siehe `v13/`), mit gemeinsamer Logik unter `core/`. Foundry v14 wird vorerst nicht weiterverfolgt und ist aus der Codebasis entfernt; der Stand liegt im Git-Verlauf." |
| `README.md` Zeilen 25, 26 | "baut v13" und "Typprüfung v13 gegen die gepinnten Foundry-Types". Diese Kommentare beschreiben ausdrücklich beide Versionen; sie gehören zum selben Sachverhalt wie die "v14-Erwähnung" im Scope und werden mitgeführt, damit die Anleitung nicht falsch bleibt |

Nicht angefasst: `core/`, `v13/`, `test-fixtures/`, `tsconfig.base.json`, der Kommentar in `core/manifest-scanner.ts`, das externe `foundry-vtt-reference-v14/`, GitHub-Releases, Modul-ID und Manifest von v13.

Löschmethode: Dateisystem-Löschung (`rm -r`), keine Git-Staging-Aktion und kein Commit. Der Stand bleibt über den Git-Verlauf abrufbar.

## Acceptance Criteria
- AC-M1-01: `v14/` existiert nicht mehr
- AC-M1-02: `package.json` enthält keinen Verweis auf `v14`
- AC-M1-03: `npm run typecheck`, `npm test`, `npm run build` laufen für v13 ohne Fehler durch
- AC-M1-04: `README.md` enthält keine Aussage mehr, die v14 als gebaut oder getestet beschreibt
- AC-M1-05: Liste der verbleibenden v14-Erwähnungen mit Zuständigkeit liegt im Deploy-Output vor
- AC-M1-06: `core/`, `v13/`, `test-fixtures/` sind unverändert (Prüfung über `git status`/`git diff`)

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Die drei Proofs laufen lokal ohne Foundry-Laufzeit; sie belegen Typen, Logik-Tests und Bündelung, aber kein Laden in Forge (Live-Test-Gate, nicht Teil dieses Milestones) | low | nein |

## Next Step
Deploy führt die Änderung aus und führt die Proofs aus.

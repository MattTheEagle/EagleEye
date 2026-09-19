```
artifact: discover-output
milestone: M1
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan.md` (M1), Entscheidung E1 (v14 gecancelt, darf aus der Codebasis entfernt werden)
- Ausdrückliches "Go" des Projektleiters am 2026-09-19 ("M1 bekommt auch das Go")
- `dadm/03-scope-declaration.md` (Schreibzugriff für M1: `./v14/`, Skripte in `./package.json`, v14-Erwähnung in `./README.md`)
- Repo-Stand vor M1: alle Änderungen dieser Phase unversioniert im Arbeitsbaum, nichts committet

## Inventory: Verweise auf v14 (außerhalb von `dadm/archive/`, `node_modules/`, `.git/`, `dist/`)

| Ort | Verweis | Zuständigkeit |
|---|---|---|
| `v14/` | Verzeichnis mit `.foundry-workspace.yaml`, `module.json`, `module.ts`, `tsconfig.json` (4 versionierte Dateien) und dem Build-Ausgabeordner `dist/` (ignoriert) | **M1** (löschen) |
| `package.json` | `build:v14`, `typecheck:v14` und die Sammelskripte `build`, `typecheck`, die beide aufrufen | **M1** |
| `README.md` Zeile 7 | "Entwickelt parallel gegen Foundry v13 und v14 (siehe `v13/` und `v14/`)" | **M1** |
| `README.md` Zeilen 25, 26 | Kommentare "baut beide Versionen" und "Typprüfung beider Versionen" | **M1** (gehören zum selben Sachverhalt; siehe Apply) |
| `core/manifest-scanner.ts` Zeilen 4–5 | Kommentar zur Umbenennung der Badge-Werte in v14 (`safe` → `success`) | später (Scope: `core/` bleibt unangetastet, unschädlich) |
| `EAGLE-MODULES-PLAN.md` Zeile 17 | historischer Satz "auf Foundry v13 und v14 getestet" | M15 |
| `tsconfig.base.json` | kein Bezug zu v14 | — |
| `dadm/` (aktive Artefakte, Referenz, Quellenanalyse) | Erwähnungen als Entscheidung, Referenz oder Analyse | bleiben |
| extern `foundry-vtt-reference-v14/` | Typreferenz außerhalb des Repos | bleibt unverändert |

## Fakten zum Vorzustand
- `v14/module.json` deklariert `compatibility` minimum/verified 14 und dieselbe Modul-ID `eagleeye` wie `v13/module.json`.
- `v14/tsconfig.json` bindet die v14-Types unter `/run/media/matt/Data/matt/Coding/foundry-vtt-reference-v14/…` ein.
- Git-Tags im Repo: keine. Ob GitHub-Releases für v14 bestehen, wurde nicht geprüft; Änderungen an Releases sind nicht Teil von M1.
- `node_modules/` liegt vor (39 Einträge); für die Proofs sind keine Installationen nötig.

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Löschen von Dateien: Der Stand der v14-Dateien ist über Git (Commit `4de2bcf` und davor) wiederherstellbar, wenn der Verzeichnisbaum nicht zwischenzeitlich geändert wurde; `v14/dist/` ist ein reines Build-Artefakt | low | nein |
| A1 | Die Modul-ID `eagleeye` bleibt für v13 unverändert (E5) | info | nein |

## Open Questions
Keine.

## Next Step
Apply legt die exakten Änderungen und die Acceptance Criteria fest.

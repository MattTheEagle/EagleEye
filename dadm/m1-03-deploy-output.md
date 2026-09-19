```
artifact: deploy-output
milestone: M1
phase: DEPLOY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m1-02-apply-output.md` (Änderungen, AC-M1-01 bis AC-M1-06)

## Implementation Summary
- `v14/` gelöscht (4 versionierte Dateien: `.foundry-workspace.yaml`, `module.json`, `module.ts`, `tsconfig.json`, dazu das ignorierte Build-Verzeichnis `dist/`).
- `package.json`: `build:v14` und `typecheck:v14` entfernt; `build` ruft nur noch `build:v13`, `typecheck` nur noch `typecheck:v13`.
- `README.md`: Satz zur Entwicklung gegen v13 und v14 ersetzt, zwei Kommentare im Build-Abschnitt auf v13 gekürzt.
- Keine Git-Staging-Aktion, kein Commit, keine Remote-Aktion.

## Files Changed
- gelöscht: `v14/.foundry-workspace.yaml`, `v14/module.json`, `v14/module.ts`, `v14/tsconfig.json` (und `v14/dist/`, ignoriert)
- geändert: `package.json`, `README.md`

## Proofs
Baseline vor der Änderung: `npm run typecheck` (v13 und v14) fehlerfrei, `npm test` 4 Dateien, 10 Tests bestanden.

Nach der Änderung:
```
npm run typecheck   -> tsc -p v13/tsconfig.json, Exit 0
npm test            -> Test Files 4 passed (4), Tests 10 passed (10)
npm run build       -> v13/dist/module.js 5.6kb, Done in 2ms
```
`git status --short core v13 test-fixtures tsconfig.base.json` ist leer (unverändert). `grep v14 package.json` findet nichts; in `core/`, `v13/`, `test-fixtures/` nur der Kommentar in `core/manifest-scanner.ts` (Zeilen 4–5).

Verbleibende v14-Erwähnungen mit Zuständigkeit:

| Ort | Erwähnung | Zuständigkeit |
|---|---|---|
| `core/manifest-scanner.ts:4–5` | Kommentar zu den Badge-Werten in v14 | später (Scope: `core/` unangetastet; unschädlich) |
| `EAGLE-MODULES-PLAN.md:17` | historischer Satz "auf Foundry v13 und v14 getestet" | M15 |
| `dadm/` (aktive Artefakte, Referenz, Quellenanalyse) | Entscheidung, Referenz, Analyse | bleiben |
| `foundry-vtt-reference-v14/` (extern) | Typreferenz | bleibt unverändert |
| GitHub-Releases | nicht geprüft, nicht angefasst | separate Freigabe, falls gewünscht |

## Acceptance Checklist
- [x] AC-M1-01 — `v14/` existiert nicht mehr
- [x] AC-M1-02 — `package.json` ohne v14-Verweis
- [x] AC-M1-03 — `typecheck`, `test`, `build` für v13 erfolgreich
- [x] AC-M1-04 — `README.md` beschreibt v14 nicht mehr als gebaut oder getestet
- [x] AC-M1-05 — Liste der verbleibenden Erwähnungen mit Zuständigkeit (oben)
- [x] AC-M1-06 — `core/`, `v13/`, `test-fixtures/` unverändert

## Risks and Assumptions
Keine neuen. Das Laden von v13 in Forge wurde nicht erneut getestet (Live-Test-Gate).

## Next Step
Deploy für M1 geschlossen. Weiter mit Monitor für M1.

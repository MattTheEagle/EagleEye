```
artifact: deploy-output
milestone: M6
phase: DEPLOY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m6-02-apply-output.md`

## Implementation Summary
- `core/language-scan.ts`: `scanLanguages()`/`logLanguageScan()`, liest
  `game.i18n.lang` + `package.languages` über dieselbe
  `game.modules`/`game.system`-Iteration wie M3, eigenständiges Modul (M3 nicht
  verändert)
- `core/language-scan.test.ts`: Vitest bestätigt Multi- und Single-Language-Fälle
- `v13/module.ts`/`v14/module.ts`: `logLanguageScan()` im `ready`-Hook ergänzt

## Files Changed
- `core/language-scan.ts`, `core/language-scan.test.ts` (neu)
- `v13/module.ts`, `v14/module.ts` (Hook ergänzt)

## Proofs
- `npm run test` — 10/10 Tests grün (2 neu)
- `npm run build` + `npm run typecheck` — beide Versionen fehlerfrei
- **Live-Proof (Projektleiter):** 94 reale Pakete korrekt ausgewertet, u. a.
  `dice-so-nice` (20 Sprachen), `tidy5e-sheet` (16), `healthEstimate` (13),
  `fxmaster` (11) — durchgängig korrektes `supportsActiveLanguage`. Eigene
  Pakete (`eagleeye`, beide Dummys) korrekt mit 0 deklarierten Sprachen erkannt.
  Keine neuen Bugs in diesem Durchlauf.

## Acceptance Checklist
- [x] AC-M6-01: Multi-Language-Erkennung (Vitest)
- [x] AC-M6-02: Fehlende aktive Sprache korrekt als `false` erkannt (Vitest)
- [x] AC-M6-03: Build/Typecheck fehlerfrei
- [x] AC-M6-04: Live-Proof gegen reale mehrsprachige Module erfolgreich

Alle M6-Acceptance-Criteria erfüllt.

## Risks and Assumptions
Keine neuen, siehe Apply-Output R1 (unverändert, info/nicht blockierend).

## Next Step
Deploy für M6 geschlossen. Weiter mit Monitor für M6.

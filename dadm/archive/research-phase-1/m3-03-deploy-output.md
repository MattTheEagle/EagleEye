```
artifact: deploy-output
milestone: M3
phase: DEPLOY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m3-02-apply-output.md` (Design: `core/manifest-scanner.ts`, Vitest-Proof
  statt Live-Quench-Lauf)

## Implementation Summary
- `core/manifest-scanner.ts`: `scanPackages()` (iteriert `game.modules.contents`
  + `game.system`, liest `availability` + `getVersionBadge()` aus) und
  `logPackageScan()` (`console.table`)
- `core/manifest-scanner.test.ts`: zwei Vitest-Tests mit gemocktem
  `PackageScanSource` — ein absichtlich inkompatibles Dummy-Paket
  (`availability = MISSING_DEPENDENCY`) wird korrekt als solches erkannt, dazu
  ein Test, dass System + alle Module gemeinsam erfasst werden
- `v13/module.ts`/`v14/module.ts`: `logPackageScan()` im `ready`-Hook verdrahtet
- vitest als devDependency ergänzt, `npm run test`-Skript hinzugefügt
- **Realer Bug durch Typecheck gefunden und behoben:** `game.modules`/
  `game.system` sind laut Foundry-Types vor vollständiger Initialisierung
  optional — mit begründeter Non-Null-Assertion gelöst (sicher, da Aufruf nur im
  `ready`-Hook)
- **Undokumentierter v13→v14-Breaking-Change gefunden:** Badge-`type`-Werte
  unterscheiden sich (`"safe"` in v13 vs. `"success"` in v14, `"unsafe"` entfällt
  in v14). `PackageBadge.type` in `core/` auf eine Vereinigungsmenge beider
  erweitert; Fund zusätzlich in die geteilte Referenz
  (`foundry-vtt-reference-v14/breaking-changes-v13-to-v14.md`, außerhalb des
  EagleEye-Scopes, laut CLAUDE.md-Vorgabe für genau diesen Zweck vorautorisiert)
  eingetragen, damit er anderen Projekten zur Verfügung steht
- npm-audit-Vorfall geprüft und mit Projektleiter abgestimmt: zwei `moderate`
  Advisories (esbuild/vite Dev-Server), in unserem Nutzungsmuster (nur
  `--bundle`/`vitest run`, kein Dev-Server) nicht anwendbar — bewusst kein
  `npm audit fix --force`

## Files Changed
- `core/manifest-scanner.ts` (neu)
- `core/manifest-scanner.test.ts` (neu)
- `v13/module.ts`, `v14/module.ts` (ready-Hook ergänzt)
- `package.json`, `package-lock.json` (vitest, `test`-Skript, `allowScripts`)
- (außerhalb EagleEye-Scope, geteilte Referenz) `foundry-vtt-reference-v14/breaking-changes-v13-to-v14.md`

## Proofs
- `npm run test` — 2/2 Tests grün (Dummy-Paket korrekt als inkompatibel erkannt)
- `npm run build` — beide Versionen fehlerfrei
- `npm run typecheck` — beide Versionen fehlerfrei (nach den zwei oben genannten
  Fixes)

## Acceptance Checklist
- [x] AC-M3-01: `scanPackages()` liefert `PackageStatus` inkl. `availability`+Badge
- [x] AC-M3-02: Vitest-Test mit inkompatiblem Dummy-Paket bestanden
- [x] AC-M3-03: `ready`-Hook-Integration in v13/v14, build-verifiziert

Alle M3-Acceptance-Criteria erfüllt. Live-Forge-Bestätigung des Konsolen-Logs ist
optional (kein neuer Testlauf nötig, ergibt sich beim nächsten ohnehin
stattfindenden Ladevorgang).

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | v13/v14-Badge-API-Unterschied jetzt konkret bestätigt (vorher nur allgemeines Risiko aus M1) — für `manifest-scanner.ts` bereits abgefangen, aber ein Hinweis, dass core/-Code bei jeder neuen Foundry-Client-API weiterhin gegen beide Type-Pakete geprüft werden muss | low | no |
| R2 | npm-audit-Advisories (esbuild/vite Dev-Server) bleiben ungefixt, bewusste Entscheidung, siehe Implementation Summary | info | no |

## Next Step
Deploy für M3 geschlossen. Weiter mit Monitor für M3.

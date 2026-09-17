```
artifact: deploy-output
milestone: M4
phase: DEPLOY
status: incomplete
date: 2026-09-17
```

## Input Summary
- `dadm/m4-02-apply-output.md` (Design: `core/settings-hub.ts`,
  `core/hub-application.ts`, 2 Dummy-Module)

## Implementation Summary
- `core/settings-hub.ts`: `listSettings()`/`updateSetting()`, testbare
  `SettingsRegistrySource`-Injection wie beim M3-Scanner
- `core/settings-hub.test.ts`: Vitest-Test bestätigt Lesen/Schreiben über
  mehrere Namespaces und Scopes hinweg (Cross-Namespace-Write funktioniert
  logisch, R1 aus Apply bleibt für den Live-Test offen)
- `core/hub-application.ts`: `HubApplication` (`ApplicationV2`, ohne
  Handlebars-Mixin — einfacher Template-String statt externer `.hbs`-Datei, um
  keinen Asset-Kopier-Schritt in den Build einzuführen; funktional identisch zum
  Apply-Entwurf, nur der Rendering-Mechanismus ist pragmatischer)
- `v13/module.ts`/`v14/module.ts`: `game.settings.registerMenu("eagleeye",
  "hub", { ..., restricted: true, type: HubApplication })` im `init`-Hook
- Zwei Dummy-Module unter `test-fixtures/`: `eagleeye-dummy-a` (`client`-Scope,
  Boolean), `eagleeye-dummy-b` (`world`-Scope, String), je mit `onChange`-Log
- Scope Declaration um `./test-fixtures/` ergänzt
- Build/Typecheck-Fix: `game.settings` ist laut Typen vor `init` optional
  (gleiches Muster wie bei `game.modules`/`game.system` in M1) — mit
  begründeter Non-Null-Assertion gelöst

## Files Changed
- `core/settings-hub.ts`, `core/settings-hub.test.ts` (neu)
- `core/hub-application.ts` (neu)
- `v13/module.ts`, `v14/module.ts` (registerMenu ergänzt)
- `test-fixtures/eagleeye-dummy-a/`, `test-fixtures/eagleeye-dummy-b/` (neu)
- `dadm/03-scope-declaration.md` (test-fixtures ergänzt)

## Proofs
- `npm run test` — 4/4 Tests grün (2 aus M3, 2 neu)
- `npm run build` + `npm run typecheck` — beide Versionen fehlerfrei
- **Ausstehend:** Live-Proof auf Forge (AC-M4-04) — manuell durch Projektleiter

## Acceptance Checklist
- [x] AC-M4-01: `listSettings()`/`updateSetting()` Vitest-geprüft
- [x] AC-M4-02: `HubApplication` baut/typecheckt fehlerfrei für v13 und v14
- [x] AC-M4-03: Zwei Dummy-Module vorhanden
- [ ] AC-M4-04: Live-Proof ausstehend

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | `world`-Scope-Schreiben aus fremdem Namespace (Apply-R1) noch nicht live verifiziert | medium | ja — für AC-M4-04 |
| R2 | Rendering-Ansatz weicht vom Apply-Entwurf ab (Template-String statt Handlebars-Mixin) — funktional gleichwertig, aber dokumentiert als Implementierungsdetail-Anpassung, keine Architekturänderung | info | nein |

## Next Step
Drei Zips liegen bereit: `eagleeye-v13.zip` (aktualisiert, inkl. Hub),
`eagleeye-dummy-a.zip`, `eagleeye-dummy-b.zip`. Projektleiter installiert alle
drei via Import Wizard, öffnet den Hub über die Foundry-Settings, ändert je eine
Dummy-Einstellung und bestätigt mit Screenshot/Log (insbesondere: wirkt sich die
`world`-Scope-Änderung bei `eagleeye-dummy-b` tatsächlich aus — das ist der
unverifizierte Teil, R1).

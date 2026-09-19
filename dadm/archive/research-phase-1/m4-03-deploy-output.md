```
artifact: deploy-output
milestone: M4
phase: DEPLOY
status: complete
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
- `npm run test` — 5/5 Tests grün (2 aus M3, 3 neu inkl. Regressionstest für
  den unten beschriebenen Bug)
- `npm run build` + `npm run typecheck` — beide Versionen fehlerfrei
- Live-Proof auf Forge (Projektleiter, drei Durchläufe wegen zweier gefundener
  Bugs — siehe unten): Checkbox (Dummy A, `client`-Scope) im Hub geändert →
  Änderung in Foundrys eigenem Modul-Settings-Dialog sichtbar. Textfeld
  (Dummy B, `world`-Scope) im Hub geändert → ebenfalls übernommen. Zusätzlich
  umgekehrte Richtung getestet: Änderung in Foundrys Settings-Dialog wirkt sich
  beim erneuten Öffnen im Hub aus. **R1 damit verifiziert:** Cross-Namespace-
  Schreiben funktioniert auch für `world`-Scope.

## Im Live-Test gefundene und behobene Bugs
1. **`defaultSource()` verwechselte `game.settings` (die `ClientSettings`-
   Instanz) mit `game.settings.settings` (der eigentlichen Registry-Map).**
   Der Vitest-Test hatte das nicht abgedeckt, da er immer eine bereits korrekt
   geformte `SettingsRegistrySource` direkt injiziert hat, nie die echte
   Adaption geprüft. Fix + neuer Regressionstest, der `globalThis.game`
   stubbt und genau diese Adaption prüft.
2. **Hub-Fenster nicht scrollbar** (echte Foundry-Welten haben deutlich mehr
   registrierte Settings als angenommen — u. a. `lib-wrapper`, `forge-vtt`,
   `dnd5e` — die eigenen Dummy-Settings waren dadurch unerreichbar) und
   **Namen/Hints wurden als rohe i18n-Keys angezeigt** (z. B.
   `SETTINGS.DND5E.RULESVERSION.Name`) statt lokalisiert wie in Foundrys
   eigenem Settings-Dialog. Beides behoben (`overflow-y: auto` +
   `game.i18n.localize()`).

## Acceptance Checklist
- [x] AC-M4-01: `listSettings()`/`updateSetting()` Vitest-geprüft
- [x] AC-M4-02: `HubApplication` baut/typecheckt fehlerfrei für v13 und v14
- [x] AC-M4-03: Zwei Dummy-Module vorhanden
- [x] AC-M4-04: Live-Proof erfolgreich, beide Richtungen, beide Scopes

Alle M4-Acceptance-Criteria erfüllt.

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | `world`-Scope-Schreiben aus fremdem Namespace — **verifiziert, funktioniert** | info | nein |
| R2 | Rendering-Ansatz weicht vom Apply-Entwurf ab (Template-String statt Handlebars-Mixin) — funktional gleichwertig, dokumentierte Implementierungsdetail-Anpassung | info | nein |
| R3 | Vom Projektleiter explizit benannt: Hub wendet Änderungen sofort ohne Bestätigung an (kein Speichern-Dialog, keine Undo-Möglichkeit). Ausdrücklich als aktuell nicht zu lösen eingestuft — als Finding für Monitor vorgemerkt, keine stille Änderung | low | nein — bewusst zurückgestellt |

## Next Step
Deploy für M4 geschlossen. Weiter mit Monitor für M4.

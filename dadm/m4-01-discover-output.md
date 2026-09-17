```
artifact: discover-output
milestone: M4
phase: DISCOVER
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/04-milestone-plan.md` (M4-Definition)
- `dadm/m3-04-monitor-output.md` (Empfehlung: weiter mit M4)
- Foundry-Typ-Fakten aus
  `foundry-vtt-reference-v13/types/src/foundry/client/helpers/client-settings.d.mts`
  (gegen v14 stichprobenartig gegengeprüft — Kernklasse `ClientSettings`
  strukturell identisch vorhanden)
- Aktueller Code-Stand: `core/index.ts`, `core/manifest-scanner.ts` (kein
  Settings-Code bisher)

## Current-State Summary
- Es existiert noch kein Settings-bezogener Code in `core/`. **relevant**
- Es existieren noch keine Dummy-Module (M4-Scope verlangt explizit 2 neue
  Test-Dummy-Module, anders als M3, das mit Mocks auskam). **relevant**

## Wichtigster Fund
Foundry stellt bereits eine vollständige, namespace-übergreifende
Settings-Infrastruktur bereit — eine zentrale Bündelung ist ohne
Sonderrechte oder Cross-Module-Kooperation möglich:

- `game.settings.settings` — ein öffentliches `Map<"namespace.key",
  SettingConfig>` mit **allen** jemals registrierten Settings (Core, System,
  jedes Modul). Jeder `SettingConfig`-Eintrag enthält `namespace`, `key`,
  `name`, `hint`, `scope` (`"world"` oder `"client"`, laut Doku-Beispiel auch
  `"user"`), `config` (ob im Foundry-eigenen Menü sichtbar), `type`, `default`,
  `choices`/`range`, `requiresReload`, `onChange`
- `game.settings.get(namespace, key)` / `.set(namespace, key, value)` — generische
  Lese-/Schreib-API, funktioniert für **jeden** Namespace, nicht nur das eigene
  Modul. Kein zusätzliches Berechtigungsmodell auf Client-Seite; `world`-Scope-
  Schreibvorgänge laufen über den Server (vermutlich GM-only durchgesetzt,
  nicht im Detail verifiziert)
- `game.settings.registerMenu(namespace, key, data)` — offizieller Weg, eine
  eigene `ApplicationV2`/`FormApplication`-Klasse als Button in Foundrys
  Settings-Menü einzuhängen, statt eigene UI-Einstiegspunkte von Grund auf zu
  bauen

## Inventory

| # | Name | Beschreibung | Ort | Status |
|---|---|---|---|---|
| I1 | `game.settings.settings` | Vollständige, öffentliche Settings-Registry über alle Namespaces | Foundry Core (v13+v14) | present |
| I2 | `game.settings.get`/`.set` | Generische Cross-Namespace Lese-/Schreib-API | Foundry Core (v13+v14) | present |
| I3 | `game.settings.registerMenu` | Fertiger Einhängepunkt für eigene Settings-UI in Foundrys Menü | Foundry Core (v13+v14) | present |
| I4 | Dummy-Module (2x) | Für M4-Acceptance nötig | — | missing, muss gebaut werden |
| I5 | Settings-Hub-Code | `core/`-Logik zum Lesen/Schreiben fremder Settings + UI | `core/` | missing |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | `world`-Scope-Schreibvorgänge laufen über den Server; ob das aus einem GM-Client heraus für fremde Namespaces uneingeschränkt funktioniert, ist nicht verifiziert (nur clientseitige Typen geprüft, kein Server-Verhalten) | medium | nein — wird in Deploy praktisch getestet, kein Blocker für Apply |
| R2 | `config: false`-Settings (vom Modul-Autor absichtlich aus Foundrys Menü versteckt) wären über `game.settings.settings` trotzdem für EagleEye sichtbar — ethische/Design-Frage, ob der Hub solche Settings anzeigen soll | info | nein — Design-Entscheidung für Apply |
| R3 | M4 verlangt (anders als M3) echte Dummy-Module statt Mocks — bedeutet einen weiteren manuellen Forge-Rundgang für den finalen Proof (Vorher/Nachher-Screenshot oder Log) | info | nein — bereits im Milestone Plan als Proof-Form vorgesehen |

## Open Questions
Keine blockierenden Fragen.

## Next Step
Apply entwirft: Settings-Hub-Architektur (Lesen via `game.settings.settings`,
Schreiben via `game.settings.set`), UI-Ansatz (`registerMenu` +
ApplicationV2-Klasse), Umgang mit `config: false`-Settings (R2), und Aufbau der
2 Dummy-Module.

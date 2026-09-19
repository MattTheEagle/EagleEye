```
artifact: apply-output
milestone: M4
phase: APPLY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m4-01-discover-output.md` (geschlossen — Kernfund: `game.settings.settings`
  als bereits vorhandene, öffentliche Cross-Namespace-Registry)

## Solution Design

### Architektur
Neues Modul `core/settings-hub.ts` (reine Logik) + `core/hub-application.ts`
(UI, `ApplicationV2` + `HandlebarsApplicationMixin`, `foundry.applications.api`).
Registrierung über `game.settings.registerMenu` im `init`-Hook von
`v13/module.ts`/`v14/module.ts` — Standardweg, kein eigener UI-Einstiegspunkt
nötig (siehe Discover I3).

### Interfaces (Signaturen, keine Implementierung)
```ts
// core/settings-hub.ts
interface SettingEntry {
  namespace: string;
  key: string;
  name: string;
  hint?: string;
  scope: "world" | "client" | "user";
  value: unknown;
}

interface SettingsRegistrySource {
  entries(): Iterable<[string, RawSettingConfig]>;   // wie game.settings.settings
  get(namespace: string, key: string): unknown;
  set(namespace: string, key: string, value: unknown): Promise<unknown>;
}

function listSettings(source?: SettingsRegistrySource): SettingEntry[];
function updateSetting(namespace: string, key: string, value: unknown, source?: SettingsRegistrySource): Promise<unknown>;
```

```ts
// core/hub-application.ts
class HubApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS: Partial<ApplicationV2.Configuration>;
  static PARTS: Record<string, HandlebarsTemplatePart>;
  protected _prepareContext(): Promise<{ settings: SettingEntry[] }>;
  // Bei Formular-Submit: updateSetting(namespace, key, value) pro geändertem Feld
}
```

`listSettings()`/`updateSetting()` nehmen wie beim M3-Scanner eine optionale
`source` entgegen (Default: echtes `game.settings`) — dieselbe testbare
Dependency-Injection wie in `core/manifest-scanner.ts`, aus demselben Grund
(Vitest ohne Foundry-Laufzeit).

### Design-Entscheidungen (aus Discover-Risiken abgeleitet)
- **R2 (config:false-Settings):** Der Hub zeigt **alle** registrierten Settings,
  unabhängig von `config`. Begründung: Genau diese ecosystemweite Transparenz
  ist der im Project Brief formulierte Zweck von EagleEye ("alle Einstellungen
  ... an einer Stelle bündeln"), nicht ein Umgehen fremder Absicht — betrifft in
  diesem Milestone ohnehin nur die eigenen Dummy-Module.
- **Zugriff:** `registerMenu(..., { restricted: true })` — Hub nur für GM
  sichtbar, da auch `world`-Scope-Settings (wirken auf alle Spieler) darüber
  änderbar sind. Sinnvoller Default, nicht Teil der Milestone-Anforderung, aber
  naheliegende Vorsichtsmaßnahme.
- **R1 (world-Scope-Schreiben aus fremdem Namespace):** Wird in Deploy praktisch
  getestet (eines der beiden Dummy-Settings wird `scope: "world"`, das andere
  `scope: "client"`, um beide Pfade abzudecken).

### Dummy-Module (2x, für AC-M4-Proof)
Analog zu M1s Minimal-Manifest-Muster, aber ohne Build (reine statische
Test-Fixtures, kein TypeScript nötig):
- `test-fixtures/eagleeye-dummy-a/module.json` + `module.js`: registriert eine
  `client`-Scope-Setting (z. B. Boolean), `onChange` loggt den neuen Wert
- `test-fixtures/eagleeye-dummy-b/module.json` + `module.js`: registriert eine
  `world`-Scope-Setting (z. B. String), `onChange` loggt den neuen Wert
- Deployment dieser beiden testfixtures: Import Wizard (kein Meilenstein-Release,
  siehe M2-Hybrid-Entscheidung)

## Acceptance Criteria (verfeinert gegenüber Milestone Plan)
```
AC-M4-01: `listSettings()`/`updateSetting()` funktionieren gegen eine gemockte
          Registry mit mind. zwei Einträgen unterschiedlichen Scopes
          (Vitest-Test).
AC-M4-02: `HubApplication` baut und typecheckt fehlerfrei für v13 und v14.
AC-M4-03: Zwei Dummy-Module (`test-fixtures/`) mit je einer registrierten
          Setting sind vorhanden.
AC-M4-04: Live-Proof (manuell, Projektleiter): Hub ändert eine Dummy-Modul-
          Einstellung, Wirkung sichtbar per Screenshot oder Konsolen-Log
          (`onChange`-Ausgabe des Dummy-Moduls) — wie im Milestone Plan
          vorgesehen, kein Quench nötig.
```

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | `world`-Scope-Schreiben aus EagleEyes Namespace heraus für einen fremden Namespace ist serverseitig nicht vorab verifiziert — wird live in Deploy geprüft, siehe AC-M4-04 | medium | nein — expliziter Deploy-Testfall, kein offener Findings-Rest danach |
| R2 | `test-fixtures/` liegt außerhalb von `core/`/`v13/`/`v14` — Ergänzung der Scope Declaration nötig (reiner Projektordner-Scope, keine Freigabe über Safety Boundaries hinaus nötig) | info | nein |

## Open TBDs
Keine blockierenden TBDs.

## Next Step
Deploy implementiert `core/settings-hub.ts`, `core/hub-application.ts`, die
beiden Dummy-Module, verdrahtet `registerMenu` in `v13/`/`v14`, und holt den
Live-Proof vom Projektleiter ein.

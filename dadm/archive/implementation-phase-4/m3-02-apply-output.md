# M3 — Hub-Oberfläche (mit UI-Leitfaden) — Apply Output

```
artifact: apply-output
milestone: M3
phase: APPLY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Design ohne Implementierung (Schnittstellen als Signaturen, keine Funktionsrümpfe). Der Deploy beginnt erst nach dem
ausdrücklichen "Go" des Projektleiters (`06-working-mode.md`).

---

## Input Summary

- Geschlossener Discover-Output `m3-01-discover-output.md`. Verweise darin: **I** Repo-Ist, **S** Spezifikation,
  **F** Foundry-Fakten, **V** Vorbilder, **U** nicht ohne Live-Test belegbar, **D** Dependencies, **Q** offene Fragen.
  Verweise auf dessen Risiken und Annahmen tragen das Präfix "Discover-"; die Risiken (R1–R8) und Annahmen (A1–A4) dieses
  Dokuments stehen unten.
- `04-milestone-plan.md` (M3), `m2-04-monitor-output.md` und `m2-05-live-check-output.md` (Übergaben, Live-Bestätigung)
- Ergänzend im Apply gegen die Types geprüft: die Namensräume `foundry.applications.api | fields | handlebars`
  (`applications/_module.d.mts`), `foundry.utils.parseHTML` (`client/utils/helpers.d.mts:187`), `ui.notifications`
  (`client/applications/ui/notifications.d.mts`), `DialogV2.confirm/prompt` (`api/dialog.d.mts:175, 198`), `User#isGM`
  (`common/documents/user.d.mts:61`) und die Form der Feld-Helfer (`FormGroupConfig`, `FormInputConfig` mit `dataset`,
  `NumberInputConfig` mit `min/max/step`, `SelectInputConfig` mit `options`)

---

## Solution Design

### 1. Leitlinie

Der Hub ist ein **`ApplicationV2`-Fenster ohne eigene Vorlagendateien**: Die Registerkarten-Leiste kommt aus der
Foundry-Kernvorlage, alles andere entsteht aus Foundrys Feld-Helfern und DOM-Aufrufen, nie aus zusammengesetzten
HTML-Strings. Alles, was ohne Foundry prüfbar ist, liegt in `core/` (K1); die Fensterhülle in `v13/` bleibt dünn (K3) und
ist nur live prüfbar. Jeder Schreibzugriff auf Einstellungen läuft durch **eine** geprüfte Funktion.

### 2. Entscheidungen zu den offenen Fragen des Discover

| Q | Entscheidung | Grund | Verworfene Alternative |
|---|---|---|---|
| Q1 Tab-Inhalt | Ein Tab je angemeldetem aktivem Modul mit: Kopf (Titel, Version, API-Version aus der Registry), Schaltfläche "Open" (nur wenn das Modul eine Start-Aktion mitgibt) und den **Einstellungen des Moduls**. Kein modul-eigener Inhalt in M3 | P-FC3 (Hub bündelt Einstellungen), P-FC4, P-FC5, Q15 a; A1 des Discover; schmale API (N4). Eigene Inhalte wären später als optionales Beschreiber-Feld additiv nachrüstbar | Render-Callback je Modul (vergrößert die Fläche, die über sieben Repos stabil bleiben muss) |
| Q2 Einstellungen | Angezeigt werden Einstellungen im Namensraum des Moduls mit `config: true` (Foundrys eigene Bedeutung, F9). Darstellung nach Art: Boolean → Checkbox, String → Textfeld oder, mit `choices`, Auswahlliste, Number → Zahlenfeld mit `min/max/step` aus `range`. Alles andere ist **`unsupported`** und erscheint mit Name und Hinweis "Cannot be edited here", ohne Rohwert. Art-Erkennung: `Boolean`, `String`, `Number` als Konstruktor oder `BooleanField`, `StringField`, `NumberField` als Feld-Instanz (U3); `choices` und `range` nur aus der Einstellung, nicht aus dem Feld. Modulmenüs (`game.settings.menus`) sind nicht Teil von M3 | native Semantik von `config`; beide möglichen Formen von `type` werden abgedeckt, der Rückfall `unsupported` ist sichtbar statt falsch; Phase 1 zeigte `"[object Object]"` (V3) | Rohwerte aller Einstellungen anzeigen (Phase-1-Fehler); Foundrys eigenes Einstellungsfenster nachbauen (`CategoryBrowser`, F8) |
| Q3 Einstieg | `game.settings.registerMenu("eagleeye", "hub", …)` mit `restricted: true`: Der Hub wird über eine Schaltfläche unter Moduleinstellungen geöffnet. Symbol `fa-solid fa-eye` wie in Phase 1 | live bestätigt in Phase 1 (V3); typisiert (F10); GM-only ohne eigene Rechtelogik | Szene-Steuerung/Seitenleiste (Hook `getSceneControlButtons` in den Types nur als Kommentar, F11; nicht belegt) |
| Q4 Fensteraufbau | `ApplicationV2` **ohne** `HandlebarsApplicationMixin`. Tab-Leiste: `foundry.applications.handlebars.renderTemplate("templates/generic/tab-navigation.hbs", { tabs })`, das Ergebnis über `foundry.utils.parseHTML` in DOM verwandelt. Tab-Inhalte: je Modul ein `<section class="tab" data-group="primary" data-tab="<id>">`, gefüllt mit `createFormGroup` und den `create…Input`-Helfern (F6). Dynamische Tabs über überschriebenes `_prepareTabs` (F2). `_renderHTML` liefert ein Element, `_replaceHTML` ersetzt den Inhalt | keine Vorlagendateien im Paket (D3, U5), keine String-Markups (Phase-1-Lehre, I10), nur in der Foundry-Referenz belegte Bausteine (F1–F6) | `CategoryBrowser` (abstrakt, Stub-Typen, verlangt eigene Kategorie-Vorlage, Zwei-Spalten-Liste statt Registerkarten, F8); `HandlebarsApplicationMixin` mit eigenen `.hbs` (Vorlagen im Zip, dynamische Parts über `_configureRenderParts`); Phase-1-String-Rendering |
| Q5 Start und API Teil 2 | Der Beschreiber bekommt das optionale Feld `open` (Funktion ohne Argumente, darf ein Promise liefern). Der Hub ruft sie beim Klick auf "Open"; Fehler werden abgefangen und als Meldung gezeigt. `open` vorhanden, aber keine Funktion → `invalid-descriptor`. **API-Version `0.2.0`** (neues Feld); die Dummy-Module ziehen nach | Q15 a ("gestartet" = Oberfläche öffnen); die M2-Regel "vor 1.0 bricht Minor" gilt bewusst, alle Module sind eigen und in Entwicklung | Version bei `0.1.x` lassen (verschleiert eine Vertragsänderung); Regel für 0.x lockern (Politikänderung, gehört zu M8) |
| Q6 Zugriff auf die Registry | Fabrik `createHubApplicationClass(context)` in `v13/hub-application.ts`: Die erzeugte Klasse schließt Registry, Einstellungsquelle, Texte und Meldungen ein und hat einen Konstruktor ohne Argumente, wie `registerMenu` es verlangt (F10) | keine globalen Singletons, testbare Abhängigkeiten (K1) | Modulweite Variable (versteckte Kopplung) |
| Q7 Lokalisierung | `v13/lang/en.json` mit Schlüsseln `EAGLEEYE.*` und `languages`-Eintrag im Manifest (`lang: "en"`, `path: "lang/en.json"`, F12); Texte über `game.i18n.localize/format`. Ein Test prüft, dass jeder im Code benutzte Schlüssel in der Datei steht | native Praxis, konsistent mit dem Leitfaden (Regel R-09), Klartext Englisch (N3) | feste englische Strings im Code (widerspricht der eigenen Leitfaden-Regel) |
| Q8 Schreiben | Alle Änderungen aus dem Hub laufen durch `applySettingInput`: (1) `canWrite()` (bis M6: `game.user.isGM`), (2) Namensraum gehört zu einem **jetzt angemeldeten** Modul, (3) Einstellung existiert, hat `config: true` und eine unterstützte Art, (4) Eingabe wird geprüft und umgewandelt (`min/max`, `choices`, Zahl, Boolean), (5) erst dann `game.settings.set`. Jeder Fehlschlag liefert einen stabilen Grund; die Eingabe springt auf den gespeicherten Wert zurück, eine Meldung erscheint. Bei `requiresReload` zeigt der Hub den Hinweis "Takes effect after a reload", ohne eigenen Dialog | erfüllt die M1-Vorbedingungen (Eagle-Filter aus der Registry, Rechteprüfung vor jedem Schreiben; Discover-R3), M6 ersetzt nur `canWrite` | `updateSetting` direkt aufrufen (ungeprüft); Foundrys Neuladen-Aufforderung nachbauen (nicht typisiert, U4) |
| Q9 Randfälle | Keine angemeldeten Module → Hinweistext "No Eagle modules are registered yet."; inaktive oder nicht angemeldete Module → kein Tab (N2); Modul ohne `config: true`-Einstellungen → Tab mit Kopf und Zeile "This module has no settings in the hub."; aktiver Tab bleibt beim Neuzeichnen erhalten, sonst der erste | S2, S3 | Platzhalter-Tabs für nicht angemeldete Module |
| Q10 Leitfaden | `docs/ui-guide.md` (Englisch, T1): eine Regeltabelle, jede Regel mit Spalte "Evidence" (Foundry-Referenz mit Pfad und Zeile **oder** Hub mit Datei und Symbol); Gliederung in Abschnitt 9 | S5 (Foundry-Bausteine plus schriftlicher Leitfaden), Plan-Acceptance von M3 | Leitfaden ohne Belege |
| Q11 Live-Prüfung | Ein gebündelter Live-Check nach dem M3-Deploy (Freigabe je Test), Pakete mit `lang/en.json` und angepassten Dummys | Wunsch des Projektleiters aus M2 (T3), R1 hängt daran | ohne Live-Prüfung weiterarbeiten |

### 3. Schnittstellen (nur Signaturen)

```ts
// core/module-registry.ts (erweitert)
export interface ModuleDescriptor { id: string; apiVersion: string; open?: () => void | Promise<void> }
export interface RegisteredModule {
  readonly id: string; readonly title: string; readonly version: string; readonly apiVersion: string;
  readonly open?: () => void | Promise<void>;                    // nur gesetzt, wenn der Beschreiber sie mitgab
}
// registerModule: `open` gesetzt, aber keine Funktion -> "invalid-descriptor"; sonst unverändert

// core/api-version.ts
export const EAGLE_API_VERSION = "0.2.0";

// core/hub-model.ts (neu)
export interface HubTab { readonly id: string; readonly label: string }               // id = Modul-id, label = Modul-title
export interface HubModel { readonly tabs: readonly HubTab[]; readonly activeTabId: string | null; readonly empty: boolean }
export function buildHubModel(modules: readonly RegisteredModule[], previousActiveId?: string | null): HubModel;
export type StartFailure = "no-open-action" | "open-failed";
export type StartResult = { readonly ok: true } | { readonly ok: false; readonly reason: StartFailure; readonly detail: string };
export function startModule(module: RegisteredModule): Promise<StartResult>;           // löst nie mit einer Ablehnung auf

// core/settings-hub.ts (erweitert; bestehende Exporte und ihre Tests bleiben unverändert)
export type SettingKind = "boolean" | "string" | "number" | "unsupported";
export interface HubSettingChoice { readonly value: string; readonly label: string }
export interface HubSettingRange { readonly min?: number; readonly max?: number; readonly step?: number }
export interface HubSetting {
  readonly namespace: string; readonly key: string; readonly label: string; readonly hint?: string;
  readonly scope: "world" | "client" | "user"; readonly kind: SettingKind; readonly value: unknown;
  readonly choices?: readonly HubSettingChoice[]; readonly range?: HubSettingRange;
  readonly requiresReload: boolean; readonly typeName: string;                        // typeName nur zur Diagnose (U3)
}
// RawSettingConfig erhält optionale Felder: config, type, choices, range, requiresReload
export interface HubSettingsSource extends SettingsRegistrySource { kindOf(type: unknown): SettingKind; canWrite(): boolean }
export function listHubSettings(namespace: string, source: HubSettingsSource): HubSetting[];   // nur config === true
export function coerceSettingInput(setting: HubSetting, raw: unknown): { ok: true; value: boolean | string | number } | { ok: false; detail: string };
export type SettingWriteFailure = "not-permitted" | "not-allowed" | "unknown-setting" | "not-editable" | "invalid-value" | "write-failed";
export type SettingWriteResult = { readonly ok: true; readonly value: unknown } | { readonly ok: false; readonly reason: SettingWriteFailure; readonly detail: string };
export function applySettingInput(namespace: string, key: string, raw: unknown, allowedNamespaces: readonly string[], source: HubSettingsSource): Promise<SettingWriteResult>;  // löst nie mit Ablehnung auf
export function defaultHubSettingsSource(): HubSettingsSource;                          // Adapter auf game.settings, game.i18n, game.user (K1/K2)

// v13/hub-application.ts (neu, Foundry-Hülle, nur live prüfbar)
export interface HubContext {
  registry: ModuleRegistry; settings: HubSettingsSource;
  text(key: string, data?: Record<string, string>): string;
  notify(level: "info" | "warn" | "error", message: string): void; log: ApiLogger;
}
export function createHubApplicationClass(context: HubContext): new () => foundry.applications.api.ApplicationV2;
```

Die Regel für die Art-Erkennung in `defaultHubSettingsSource().kindOf`: Konstruktor `Boolean`/`String`/`Number` oder Instanz von
`foundry.data.fields.BooleanField`/`StringField`/`NumberField` (nur wenn `foundry` verfügbar ist); sonst `unsupported`.

### 4. Aufbau und Abläufe

```
Moduleinstellungen (GM) -> Schaltfläche "Open Eagle Flight Control"  (registerMenu, restricted)
  |
  +-- Fenster "Eagle Flight Control" (ApplicationV2, id "eagleeye-hub", resizable)
       nav   : <nav class="tabs"> aus templates/generic/tab-navigation.hbs, ein Eintrag je Modul (Tab.label = Modul-title)
       body  : je Modul <section class="tab" data-group="primary" data-tab="<id>">
                 Kopf:   Titel, "Version x (API y)", [Open]   <- nur mit open
                 Felder: createFormGroup( label, hint[, "Takes effect after a reload."], input ) je Einstellung
                         unsupported: Name + "Cannot be edited here."
       leer  : "No Eagle modules are registered yet."

Render:  registry.list() -> buildHubModel(previous tabGroups.primary) -> je Modul listHubSettings(id, source)
         -> _prepareTabs("primary") aus dem Modell -> nav (Kernvorlage) + sections (Feld-Helfer)
Klick "Open":  actions.openModule -> startModule(entry) -> bei Fehler notify("error", …) + log
Änderung:      change-Ereignis eines Feldes (dataset: namespace, key) -> applySettingInput(…, registry.list().map(id))
               ok  -> nichts weiter        Fehler -> Feld auf gespeicherten Wert zurück, notify(…), log
```

Diagnose für den Live-Check: Beim Zeichnen schreibt der Hub eine Zeile `eagleeye | hub rendered: <n> tab(s)` und je
`unsupported`-Einstellung `eagleeye | hub: <namespace>.<key> is not editable (type <typeName>)` (belegt U3).

### 5. Zielbild der Dateien

```
core/
  module-registry.ts (+test)   erweitert: optionales open
  api-version.ts (+test)       EAGLE_API_VERSION = "0.2.0"
  hub-model.ts + .test.ts      neu    Tab-Modell, startModule
  settings-hub.ts (+test)      erweitert: Hub-Einstellungen, Eingabeprüfung, geprüftes Schreiben, Adapter; Kommentar aktualisiert
  lang-keys.test.ts            neu    jeder benutzte EAGLEEYE.*-Schlüssel steht in v13/lang/en.json
v13/
  hub-application.ts           neu    Fensterhülle (createHubApplicationClass)
  module.ts                    verdrahtet: registerMenu mit der erzeugten Klasse; API-Anhängen unverändert (eigener try/catch)
  module.json                  + languages [{ lang: "en", name: "English", path: "lang/en.json" }]
  lang/en.json                 neu
test-fixtures/
  eagleeye-dummy-a/            apiVersion 0.2.0, open-Aktion, vier Einstellungen
  eagleeye-dummy-b/, -c/       unverändert
docs/
  api-contract.md              Teil 2 (siehe Abschnitt 8)
  ui-guide.md                  neu
```

Schlüssel in `lang/en.json` (verschachtelt unter `EAGLEEYE`): `menu.name`, `menu.label`, `menu.hint`, `hub.title`, `hub.empty`,
`hub.open`, `hub.version`, `hub.noSettings`, `hub.notEditable`, `hub.requiresReload`, `hub.notify.notPermitted`,
`hub.notify.invalidValue`, `hub.notify.writeFailed`, `hub.notify.openFailed`.

### 6. Testplan (Vitest; jeder Fall genau ein `it`, Tabellenfälle laufen als Schleife im Test)

| # | Datei | Fall |
|---|---|---|
| H1 | module-registry | `open` (Funktion) wird angenommen und steht am angemeldeten Modul und in `list()` |
| H2 | module-registry | `open` gesetzt, aber keine Funktion (String, Objekt, Zahl, `null`) → `invalid-descriptor`, nichts gespeichert |
| H3 | module-registry | ohne `open` hat der Eintrag keine Eigenschaft `open` (Schlüssel unverändert) |
| H4 | api-version | `EAGLE_API_VERSION` ist `"0.2.0"` |
| H5 | hub-model | ein Tab je angemeldetem Modul in Registry-Reihenfolge; `id` = Modul-id, `label` = Titel |
| H6 | hub-model | inaktive Module erzeugen keinen Tab (Registry mit umschaltbarem Aktivstatus) |
| H7 | hub-model | aktiver Tab: bleibt, wenn noch vorhanden, sonst der erste, `null` und `empty` ohne Module |
| H8 | hub-model | `startModule` ruft `open` genau einmal auf und liefert `ok` (synchron und asynchron) |
| H9 | hub-model | `startModule` ohne `open` → `no-open-action` |
| H10 | hub-model | `startModule` mit werfender oder ablehnender `open` → `open-failed` mit `detail`, nie eine Ablehnung |
| H11 | settings-hub | `listHubSettings`: nur der Namensraum, nur `config: true`; Standard-Scope `client`; lokalisierte Namen und Hinweise; Wert aus der Quelle |
| H12 | settings-hub | Art-Erkennung: `Boolean`/`String`/`Number` → Arten; `choices` → Optionen mit lokalisierten Labels; `range` → Bereich; unbekannter Typ → `unsupported` samt `typeName`; `requiresReload` |
| H13 | settings-hub | `coerceSettingInput`: Boolean, String (mit `choices`), Number (`min/max`, keine Zahl, leer), `unsupported` → nicht editierbar |
| H14 | settings-hub | `applySettingInput` Erfolg: schreibt über die Quelle und liefert den umgewandelten Wert |
| H15 | settings-hub | `applySettingInput` lehnt ab (nichts geschrieben): `not-permitted`, `not-allowed`, `unknown-setting`, `not-editable` (`config: false` und `unsupported`), `invalid-value`; ablehnendes `set` → `write-failed` |
| H16 | settings-hub | `defaultHubSettingsSource` gegen die echte Form: `game.settings.settings` (Map mit `config`, `type`, `choices`, `range`, `requiresReload`), `get`/`set`, `game.i18n.localize`, `game.user.isGM` (Adapter-Regressionstest, K2) |
| H17 | settings-hub | `defaultHubSettingsSource().kindOf`: Konstruktoren, Instanzen gestubbter `foundry.data.fields`-Klassen und Unbekanntes |
| H18 | lang-keys | jeder in `v13/hub-application.ts`, `v13/module.ts` und `core/*.ts` benutzte `EAGLEEYE.*`-Schlüssel steht mit nicht leerem Wert in `v13/lang/en.json`; der `languages`-Eintrag im Manifest zeigt auf eine vorhandene Datei |

Erwartet: 7 Testdateien mit **44 Tests** (26 bestehende unverändert, 18 neu).

### 7. Dummy-Module (klassische Skripte, ohne Build)

- **a:** `apiVersion: "0.2.0"` und `open: () => ui.notifications.info("eagleeye-dummy-a: open action called")`;
  vier Einstellungen mit `config: true`, Texte Englisch: `enabled` (Scope `client`, Boolean, besteht), `mode` (Scope `world`,
  String, `choices { alpha: "Alpha", beta: "Beta" }`), `level` (Scope `client`, Number, `range { min: 0, max: 10, step: 1 }`) und
  `needsReload` (Scope `world`, Boolean, `requiresReload: true`). Deckt Checkbox, Auswahl, Zahl und Neuladen-Hinweis ab.
- **b:** unverändert (meldet sich nicht an; seine Einstellung darf im Hub nicht erscheinen).
- **c:** unverändert (`9.0.0`, wird abgewiesen, darf keinen Tab haben).

### 8. API-Vertrag Teil 2 (Änderungen an `docs/api-contract.md`)

Kopfzeile auf `0.2.0`; Abschnitt 1 (TypeScript-Block) und Abschnitt 2 (Beschreiber-Tabelle) erhalten `open`; in der
Fehlerliste erweitert sich `invalid-descriptor` um "`open` is present but not a function"; neuer Abschnitt "The hub" (Tab je
angemeldetem aktivem Modul mit Titel aus dem Manifest, Kopf, "Open"-Schaltfläche, Einstellungen im eigenen Namensraum mit
`config: true`, unterstützte Arten, `unsupported` ohne Rohwert, `requiresReload`-Hinweis, nur für den GM, Leer-Text);
Abschnitt "Not part of this version" ohne Hub und Start; Änderungshistorie um `0.2.0`; Abschnitt "What is verified" führt die
Darstellung des Hubs als `unverified`, bis der Live-Check gelaufen ist.

### 9. Gliederung `docs/ui-guide.md` (Englisch)

Zweck und Geltungsbereich (alle Eagle Module, S4/S5, E8); Grundsätze (nur Foundry-Bausteine, keine eigene Optik); die Regeltabelle
mit Spalten *Rule*, *Why*, *Evidence*; Checkliste für ein neues Modul-Fenster; Stand der Verifikation (welche Regeln nur
durch Referenz belegt sind, welche im Hub verwendet werden, was live noch offen ist).

| Regel | Evidence (Referenz: Pfad relativ zu `foundry-vtt-reference-v13/types/src/foundry/`) |
|---|---|
| R-01 Jedes Fenster ist ein `ApplicationV2` (`foundry.applications.api`) | `client/applications/api/_module.d.mts`, `application.d.mts:125` · Hub: `createHubApplicationClass` |
| R-02 Fenster haben stabile `id`, lokalisierten `window.title`-Schlüssel und Font-Awesome-`window.icon` | `application.d.mts:125–160, 198–215` · Hub: `DEFAULT_OPTIONS` |
| R-03 Klicks über `actions` (`data-action`), keine Inline-Handler | `application.d.mts:159` · Hub: `openModule` |
| R-04 Registerkarten über `TABS`/`tabGroups`/`_prepareTabs` und die Kernvorlage `templates/generic/tab-navigation.hbs` | `application.d.mts:348–385, 513, 554, 663` · Hub: Tab-Leiste |
| R-05 Eingabefelder mit Foundrys Feld-Helfern, nicht mit handgeschriebenem Markup | `client/applications/forms/fields.d.mts:132–271` · Hub: Einstellungsfelder |
| R-06 Label, Feld und Hinweis mit `createFormGroup` | `fields.d.mts:132` · Hub: Einstellungsfelder |
| R-07 Daten gelangen nie als zusammengesetzter String in `innerHTML`; Helfer, `textContent` oder Foundry-Vorlagen | `client/utils/helpers.d.mts:187` (`parseHTML`) · Hub: einziger String-Weg ist die Kernvorlage; Phase-1-Hub als Gegenbeispiel (Git `77daf6d`) |
| R-08 Bestätigungen und Eingaben über `DialogV2` | `client/applications/api/dialog.d.mts:175, 198` (nur Referenz) |
| R-09 Texte über `game.i18n` und `lang/<code>.json`, im Manifest unter `languages`; Sprache der Oberfläche ist Englisch (N3) | `common/packages/base-package.d.mts:137–160, 337` · Hub: `lang/en.json` |
| R-10 Einstiegspunkte über `game.settings.registerMenu` (Konstruktor ohne Argumente, `restricted` für GM) | `client/helpers/client-settings.d.mts:129–139, 331–377` · Hub: `registerMenu("eagleeye", "hub", …)` |
| R-11 Rückmeldungen über `ui.notifications` | `client/applications/ui/notifications.d.mts:63–81` · Hub: `notify` |
| R-12 Einstellungen, die im Hub erscheinen sollen: `config: true` und Art Boolean, String (mit `choices`) oder Number (mit `range`); `requiresReload` kennzeichnen | `client-settings.d.mts:270–330` · Hub: `listHubSettings` |
| R-13 Keine eigene Optik (Farben, Schriften); zusätzliches CSS nur über `styles` im Manifest, mit eigener Klasse begrenzt und live geprüft. **Das CSS-Verhalten ist durch die Referenz nicht belegt.** | `base-package.d.mts:332` (`styles`) · Stand: `unverified` |

Kurzschreibweise der Pfade (jeweils relativ zu `foundry/`): `application.d.mts` = `client/applications/api/application.d.mts`,
`dialog.d.mts` = `client/applications/api/dialog.d.mts`, `fields.d.mts` = `client/applications/forms/fields.d.mts`,
`client-settings.d.mts` = `client/helpers/client-settings.d.mts`, `notifications.d.mts` = `client/applications/ui/notifications.d.mts`,
`base-package.d.mts` = `common/packages/base-package.d.mts`. Im Leitfaden stehen die vollen Pfade.

Der Deploy prüft per Skript, dass jede Regelzeile eine nicht leere Evidence-Zelle hat, dass jeder genannte Pfad existiert und
dass jedes genannte Hub-Symbol in der genannten Datei vorkommt.

### 10. Übergaben

- **M4:** Das Ergebnismuster `{ ok, reason, detail }` mit stabilen Codes gilt auch für `startModule` und `applySettingInput`.
- **M5/M6:** `canWrite()` (heute `game.user.isGM`) wird durch die Nutzungsrechte je Modul und Nutzer ersetzt; für Spieler wäre
  das Schreiben von Einstellungen ein Anfragekanal-Fall (Q3 a). Modul-`id` bleibt der Schlüssel.
- **M7:** Der Versionswächter kann später im Hub-Kopf angezeigt werden (nicht Teil von M3).
- **M8:** Ein Packaging-Skript (`module.json`, `dist/module.js`, `lang/`) für die Release-Zips, Konsolidierung des Vertrags, API-Versionspolitik
  ab 1.0, Nachführen der Pläne und des Root-`README.md` (T4).

### 11. Deploy-Reihenfolge (Plan, ohne Code)

1. `core/module-registry.ts` (`open`) mit H1–H3; `core/api-version.ts` mit H4
2. `core/hub-model.ts` mit H5–H10
3. `core/settings-hub.ts` erweitern (Kommentar aktualisieren) mit H11–H17
4. `v13/hub-application.ts`, `v13/module.ts` verdrahten (eigener `try/catch` für das Menü)
5. `v13/lang/en.json`, `languages` im Manifest, `core/lang-keys.test.ts` (H18)
6. Dummy-Module a (ändern); b und c unverändert
7. `docs/api-contract.md` (Teil 2), `docs/ui-guide.md`
8. Prüfen: **einmal** `typecheck`, `test`, `build`; Skriptprüfungen (Vertrag ↔ Code, Leitfaden-Belege, Fixtures-Syntax); Suche
   `innerHTML` in `v13/hub-application.ts`; `git status`
9. Deploy-Output; kein Commit ohne Anweisung, kein Live-Test durch mich

---

## Acceptance Criteria

```
AC-M3-01: core/hub-model.ts exportiert buildHubModel, startModule und die Typen aus Abschnitt 3; die Tests H5-H10 bestehen.
AC-M3-02: core/module-registry.ts nimmt ein optionales open (Funktion) an und legt es am RegisteredModule ab; ein open ohne Funktion ergibt invalid-descriptor; Einträge ohne open haben keine Eigenschaft open; die Tests H1-H3 bestehen.
AC-M3-03: core/settings-hub.ts exportiert listHubSettings, coerceSettingInput, applySettingInput, defaultHubSettingsSource und die Typen aus Abschnitt 3; die bisherigen Exporte listSettings und updateSetting und deren 3 Tests sind unverändert; die Tests H11-H17 bestehen.
AC-M3-04: EAGLE_API_VERSION ist "0.2.0" (H4).
AC-M3-05: v13/hub-application.ts exportiert createHubApplicationClass; die erzeugte Klasse erweitert foundry.applications.api.ApplicationV2 ohne HandlebarsApplicationMixin, verwendet keine eigene .hbs-Datei, und "innerHTML" kommt in der Datei höchstens einmal vor (für die Tab-Leiste aus der Kernvorlage, über parseHTML).
AC-M3-06: v13/module.ts registriert im init zusätzlich game.settings.registerMenu("eagleeye", "hub", {... restricted: true, type: <erzeugte Klasse>}) in einem eigenen try/catch; weiterhin nur ein Hook, kein ready, kein await.
AC-M3-07: v13/lang/en.json ist gültiges JSON mit den Schlüsseln aus Abschnitt 5; v13/module.json enthält genau den zusätzlichen Eintrag languages; H18 besteht.
AC-M3-08: docs/api-contract.md nennt API 0.2.0, das Feld open, den erweiterten Grund invalid-descriptor, den Abschnitt "The hub" und den Eintrag 0.2.0 in der Änderungshistorie; die dort genannten Fehlercodes sind identisch mit denen im Code.
AC-M3-09: docs/ui-guide.md (Englisch) enthält die Regeln R-01 bis R-13 mit nicht leerer Evidence-Zelle; jeder genannte Pfad existiert; jedes genannte Hub-Symbol kommt in der genannten Datei vor.
AC-M3-10: eagleeye-dummy-a registriert mit apiVersion "0.2.0" und open und hat die vier Einstellungen; b und c sind unverändert; JSON parst, node --check ist ok.
AC-M3-11: npm run typecheck endet mit Exit 0; npm test endet mit Exit 0 und meldet 7 Testdateien und 44 Tests, alle bestanden; npm run build endet mit Exit 0; das Bundle enthält "registerMenu" und kein "libWrapper".
AC-M3-12: package.json, package-lock.json, v13/tsconfig.json, core/manifest-scanner.ts und core/index.ts sind unverändert; die durch M3 geänderten Dateien stimmen mit Abschnitt 5 überein (Abgleich gegen den M2-Endstand, da nicht committet).
AC-M3-13 (unverified, nur nach ausdrücklicher Live-Freigabe): In Forge öffnet die Schaltfläche unter Moduleinstellungen den Hub; genau ein Tab (Dummy a); Einstellungen (Checkbox, Auswahl, Zahl, Neuladen-Hinweis) sind editierbar und bleiben gespeichert; "Open" löst die Meldung von a aus; Dummy b und c erscheinen nicht; Darstellung im nativen Stil (U1-U5).
```

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (Discover-R1/U1/U2) Tabs mit selbst gebauten Inhalts-Abschnitten und die native Optik sind nur live prüfbar. Das Design stützt sich für die Leiste auf die Kernvorlage; die Konvention `section.tab[data-group][data-tab]` und die Klasse `active` stammen nicht aus der Referenz. Trifft es nicht zu, ist der Rückfall die Variante mit `HandlebarsApplicationMixin` und eigenen Vorlagen (Design-Änderung, zurück in Apply). Mit dem "Go" ausdrücklich anzunehmen. | `medium` | no |
| R2 | (Discover-R2/U5) `v13/lang/en.json` gehört ab jetzt in jedes Paket; fehlt sie, zeigt der Hub rohe Schlüssel (sichtbar, nicht still). Meine Zips enthalten sie; die Release-Zips des Projektleiters brauchen den Ordner `lang/` (Vorschlag: Packaging-Skript in M8). | `low` | no |
| R3 | (U3) Ob `game.settings.settings` je Eintrag den Rohtyp oder ein Feld liefert, ist offen; beide Formen werden erkannt, sonst erscheint `unsupported` mit Diagnosezeile. Schlimmster Fall: alle Einstellungen "not editable", sichtbar im Live-Check. | `low` | no |
| R4 | (U4) Foundrys eigene Neuladen-Aufforderung wird nicht nachgebaut; der Hub zeigt nur den Hinweis. | `low` | no |
| R5 | Die Schreibsperre `canWrite()` = GM ist ein Zwischenstand bis M6; Spieler erreichen den Hub nicht (`restricted`). | `low` | no |
| R6 | Nur `min/max` werden geprüft, nicht `step` (Gleitkommafehler würden sonst zu Fehlablehnungen führen); das Browserfeld erzwingt die Schrittweite. | `low` | no |
| R7 | Die CSS-Regeln des Leitfadens (R-13) sind durch die Referenz nicht belegt und stehen als `unverified`; der Monitor führt sie nach dem Live-Check nach. | `low` | no |
| R8 | API `0.2.0` macht Dummy a (`0.1.0`) unverträglich; erwartet, a wird mit umgestellt. Auch spätere Milestones erhöhen die Minor-Version (Regel bis 1.0). | `low` | no |
| A1 | **Annahme (mit dem "Go" zu bestätigen):** "Inhalt" eines Moduls im Hub sind seine Einstellungen plus die Start-Aktion; modul-eigene Inhalte kommen, falls gewünscht, später als optionales Beschreiber-Feld. | `low` | no |
| A2 | **Annahme:** Die Kernvorlage `templates/generic/tab-navigation.hbs` nimmt `tabs` (`Record<string, Tab>`) als Kontext und liefert Markup, das mit dem eingebauten `changeTab` zusammenarbeitet (U1). | `low` | no |
| A3 | **Annahme:** `window.title` nimmt einen Lokalisierungsschlüssel (ApplicationV2 lokalisiert ihn). Schlimmstenfalls steht der Schlüssel im Titel (sichtbar). | `low` | no |
| A4 | **Annahme:** `game.user.isGM` ist beim Schreiben verfügbar (`common/documents/user.d.mts:61`). | `info` | no |

`medium` in R1 ist mit dem "Go" ausdrücklich anzunehmen (Governance). Sonst kein `medium+`-Fund, kein Human-Decision-Trigger:
keine Dependency-Änderung, keine Cross-Milestone-Änderung (API Teil 2 und Leitfaden gehören zu M3), Sicherheit der Schreibwege durch
`applySettingInput` (Rechte, Namensraum, Validierung) abgedeckt.

---

## Open TBDs

Sie werden zusammen mit dem "Go" beantwortet; die Vorschläge gelten, solange nichts anderes genannt wird.

| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Lesart A1 bestätigen: Tab-Inhalt = Einstellungen plus "Open"; keine modul-eigenen Inhalte in M3 | important | Projektleiter |
| T2 | Live-Prüfung: einmal gebündelt nach dem M3-Deploy (Pakete mit `lang/`), später oder gar nicht; Vorschlag: gebündelt, R1 hängt daran | important | Projektleiter |
| T3 | Umfang: M3 als geplant in einem Deploy (Vorschlag) oder teilen in M3a (Fenster, Tabs, Start, API Teil 2) und M3b (Einstellungen, Schreiben, Leitfaden); das Teilen bräuchte Plan Version 2 mit neuer Approval | nice-to-have | Projektleiter |
| T4 | Aus M1/M2: die zwei Plan-Stellen und das Root-`README.md` nachführen, jetzt oder mit M8 (Vorschlag: M8) | nice-to-have | Projektleiter |

---

## Next Step

Nach dem "Go" des Projektleiters: Deploy M3 — Reihenfolge Abschnitt 11, beginnend mit `core/module-registry.ts` (`open`) und den Tests H1–H4.

# M3 — Hub-Oberfläche (mit UI-Leitfaden) — Discover Output

```
artifact: discover-output
milestone: M3
phase: DISCOVER
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Wahl zwischen den vorhandenen Bausteinen (Aufgabe des Apply). Belege nennen die
Fundstelle; was sich ohne Live-Test nicht belegen lässt, steht getrennt in "Nicht ohne Live-Test belegbar".

---

## Input Summary

- `04-milestone-plan.md` (M3 mit Ergänzung UI-Leitfaden, U5), `m2-04-monitor-output.md` und `m2-05-live-check-output.md`
  (Übergaben, Live-Bestätigung der Anmeldung), `m2-02-apply-output.md` (Konventionen, API Teil 1)
- Spezifikation: `dadm/reference/eagle-modules-aufbau.md` (UI-Design, P-FC3 bis P-FC5, Q15, N1, N2, N18, E8),
  `EAGLE-MODULES-PLAN.md` Abschnitt 3.1
- Foundry-Referenz v13 (`foundry-vtt-reference-v13`): `cheat-sheet.md` (13 Zeilen, keine UI-Einträge) und `types/`
  (Tag `v13.345.1`, Commit `3fdf2bbf`)
- Quellenanalyse `dadm/reference/source-analysis/` (Vorbild-Module), Phase-1-Archiv (`m4-04-monitor-output.md`)
- Repo-Ist nach M2: `v13/`, `core/`, `test-fixtures/`, `docs/`
- Kein Web-Abruf, kein Live-Test, kein Code geändert.

---

## Current-State Summary

1. **Es gibt keinen Hub.** Das alte Hub-Fenster wurde in M1 entfernt (nur im Git-Verlauf, Commit `77daf6d`); Flight Control
   hat heute keine sichtbare Oberfläche und kein Einstellungsmenü. *(relevant)*
2. **Die Registry liefert die Modulliste** (`ModuleRegistry#list()`: `id`, `title`, `version`, `apiVersion` der
   angemeldeten und jetzt aktiven Module), ist aber eine lokale Konstante in `v13/module.ts` und von außen nicht
   erreichbar. *(relevant)*
3. **Die Einstellungs-Bausteine sind nicht verdrahtet** und für einen Hub unvollständig: `core/settings-hub.ts` liest nur
   `namespace`, `key`, `name`, `hint`, `scope` und den Wert; `config`, `type`, `choices`, `range` und `requiresReload`
   fehlen. *(relevant)*
4. **Die Anmeldung kennt nur `{ id, apiVersion }`;** Tab-Inhalt und Start-Aktion sind im API-Vertrag nicht vorgesehen.
   Zusatzfelder im Beschreiber werden heute ignoriert. *(relevant)*
5. **Foundry v13 liefert die Bausteine für Fenster mit Registerkarten und für native Formulare** (Tabelle F1–F12), aber
   **kein CSS in den Types**; das Aussehen ist ohne Live-Test nicht belegbar (Tabelle U1–U5).
6. **Eine Vorlage aus Phase 1 existiert** (altes Hub-Fenster als String-Rendering) samt der Erfahrung, dass die
   Live-Prüfung der Oberfläche drei Runden brauchte.

---

## Inventory

### Repo-Ist

| # | Name | Beschreibung | Location | Status |
|---|---|---|---|---|
| I1 | Einstiegspunkt | `init`: Registry und API anlegen, API anhängen; Registry nur als lokale Konstante; kein Menü, kein Hub | `v13/module.ts` (25 Z.) | present |
| I2 | Registry | `list()` liefert `RegisteredModule[]` (`id`, `title`, `version`, `apiVersion`) in Anmeldereihenfolge, nur aktive | `core/module-registry.ts` | present |
| I3 | Einstellungs-Baustein | `listSettings(source)` → `SettingEntry` (`namespace`, `key`, lokalisierter `name`, `hint?`, `scope`, `value`); `RawSettingConfig` kennt nur `namespace`, `key`, `name?`, `hint?`, `scope?`; `updateSetting` schreibt ohne Prüfung; Kommentar: vor Laufzeitnutzung Eagle-Filter und Rechteprüfung | `core/settings-hub.ts` (64 Z.) | present |
| I4 | Paketdaten-Baustein | `scanPackages` (alle Module plus System, mit `availability` und Badge); nicht verdrahtet | `core/manifest-scanner.ts` | present |
| I5 | API und Vertrag | `createEagleApi` (eingefroren: `version`, `registerModule`), Beschreiber `{ id, apiVersion }`, Zusatzfelder ignoriert; API-Version `0.1.0`, vor 1.0 bricht "Minor" | `core/eagle-api.ts`, `docs/api-contract.md` | present |
| I6 | Dummy-Module | a: Einstellung `enabled` (Scope `client`, Boolean), meldet sich an; b: Einstellung `label` (Scope `world`, String), meldet sich nicht an; c: keine Einstellung, meldet sich inkompatibel an | `test-fixtures/` | present |
| I7 | UI-Leitfaden | `docs/ui-guide.md` (Englisch, T1) | `docs/` | missing |
| I8 | Manifest von Flight Control | `esmodules ["dist/module.js"]`; **ohne** `styles`, `languages`, Templates; kein Ordner `templates/` oder `lang/` | `v13/module.json` | present |
| I9 | Paketierung | Die Zips (Phase 1 und M2) enthalten `module.json` und `dist/module.js`, sonst nichts; das Zippen für Forge macht der Projektleiter selbst, kein Packaging-Skript im Repo | `v13/dist/live-check/`, Phase-1-Archiv | present |
| I10 | Altes Hub-Fenster (Git-Verlauf) | `ApplicationV2`-Unterklasse **ohne** Handlebars-Mixin: `_renderHTML` liefert einen HTML-String, `_replaceHTML` setzt `innerHTML`, Inline-Stil, Einträge ohne Escaping; Einstieg über `game.settings.registerMenu("eagleeye", "hub", { …, type: HubApplication, restricted: true })` | Commit `77daf6d`: `core/hub-application.ts`, `v13/module.ts` | present (nur Verlauf) |
| I11 | Tests | 26 Tests für reine Logik; keine Foundry-Laufzeit, keine UI; Konventionen K1–K4 (injizierbare Quellen, Adapter-Regressionstest, dünne Hüllen) | `core/*.test.ts`, `m1-02-apply-output.md` | present |

### Spezifikation und Entscheidungen (Projektleiter)

| # | Aussage | Fundstelle |
|---|---|---|
| S1 | P-FC3 "Hub bündelt die Einstellungen der einzelnen Eagle Module"; P-FC4 "Jedes installierte Module hat eine eigene Registerkarte im Hub"; P-FC5 "Jedes Eagle Module kann aus dem Hub gestartet werden" | `eagle-modules-aufbau.md` Z. 35–37 |
| S2 | N2: Registerkarten nur für **aktive** Eagle Module, die API-Registrierung genügt | ebd. Z. 202 |
| S3 | Q15 a: "gestartet" heißt, die Oberfläche des Moduls zu **öffnen** (nicht aktivieren/deaktivieren) | ebd. Z. 193 |
| S4 | UI-Design: "Die UI der einzelnen Module soll einheitlich aussehen, gleicher Stil, gleiche Buttons, gleiche Schrift etc. Alles schon in Foundry vorhanden, deshalb wird für die UI der Stil der Foundry-UI benutzt" (E8) | ebd. Z. 21–23, Z. 261 |
| S5 | N18 a: "Nur Foundry-Bausteine plus schriftlicher Leitfaden (O1)" | ebd. Z. 230 |
| S6 | Plan 3.1: "Ein Eagle Modul meldet sich mit seinem Inhalt und einer Startfunktion an; so lassen sich später weitere Module ohne Änderung an Eagle Flight Control ergänzen." | `EAGLE-MODULES-PLAN.md` Z. 103–105 |
| S7 | U5 (diese Phase): Der UI-Leitfaden für alle Module gehört zu M3; T1: Dokumente in `docs/` auf Englisch; N3: Klartext Englisch | `01-project-brief.md`, `m2-03-deploy-output.md` |
| S8 | N1: Nutzungsrechte je Modul und Nutzer folgen später (M6); Q3 a: Foundry-Änderungen laufen über Flight Control; der Hub ist Flight Control selbst | `eagle-modules-aufbau.md` Z. 181, 201 |
| S9 | Milestone Plan M3: Tab-Modell und Start-Aktion per Vitest prüfbar; Leitfaden-Regeln verweisen nur auf im Hub verwendete oder in der Foundry-Referenz belegte Bausteine; Darstellung in Foundry `unverified` | `04-milestone-plan.md` |

### Foundry-Fakten (Types v13.345.1; Pfade relativ zu `foundry-vtt-reference-v13/types/src/foundry/client/`)

| # | Fakt | Fundstelle |
|---|---|---|
| F1 | `ApplicationV2`-Konfiguration: `id`, `uniqueId`, `classes`, `tag`, `window` (`frame`, `positioned`, `title`, `icon`, `controls`, `minimizable`, `resizable`, `contentTag`, `contentClasses`), `actions` (Klick-Handler je Name), `form` (`handler`, `submitOnChange`, `closeOnSubmit`), `position`; Standard über `static DEFAULT_OPTIONS`. Exportiert als `foundry.applications.api.ApplicationV2` | `applications/api/application.d.mts:125–272, 507`; `api/_module.d.mts` |
| F2 | Tabs: `static TABS: Record<string, TabsConfiguration>` (je Gruppe `tabs`, `initial`, `labelPrefix`), `tabGroups` (aktiver Tab je Gruppe), `changeTab(tab, group)`, `protected _prepareTabs(group): Record<string, Tab>`. Der Typ `Tab` (`id`, `group`, `active`, `cssClass`, `icon?`, `label?`) ist als "Used with `templates/generic/tab-navigation.hbs`" vermerkt | `application.d.mts:348–360, 377–385, 513, 554, 663, 796` |
| F3 | `HandlebarsApplicationMixin`: `static PARTS` (je Teil `template`, `id`, `classes`, `templates`, `scrollable`, `forms`), `_preparePartContext`, `_attachPartListeners`, und `_configureRenderParts(options)` ("Allow subclasses to dynamically configure render parts") | `applications/api/handlebars-application.d.mts:26–41, 71–125, 170–209` |
| F4 | Kernvorlagen, die die Types ausdrücklich nennen: `templates/generic/tab-navigation.hbs` (mit `Tab`), `templates/generic/form-fields.hbs` (mit `FormNode`: `fieldset`, `legend`, `fields`, `field`, `value`), `templates/generic/form-footer.hbs` (mit den Fußzeilen-Buttons) | `application.d.mts:376, 386, 399` |
| F5 | Vorlagen-API und Helfer: `getTemplate`, `loadTemplates`, `renderTemplate`; Handlebars-Helfer u. a. `formInput`, `formGroup`, `selectOptions`, `localize`, `numberInput`, `checked`, `disabled`, `radioBoxes`, `filePicker`, `colorPicker`, `rangePicker`, `editor`, `ifThen`, `concat`, `numberFormat` | `applications/handlebars.d.mts:10–296` |
| F6 | Feld-Helfer in JS: `createFormGroup`, `createCheckboxInput`, `createNumberInput`, `createSelectInput`, `createTextInput`, `createTextareaInput`, `createMultiSelectInput`, `createEditorInput`, `prepareSelectOptionGroups`, `setInputAttributes` | `applications/forms/fields.d.mts:132–271` |
| F7 | Kern-Elemente: `multi-select`, `string-tags`, `color-picker`, `range-picker`, `hue-slider`, `file-picker`, `prosemirror-editor`, `document-tags`, `document-embed`, `enriched-content`, `secret-block`, `form-element`; dazu `ux`: `context-menu`, `drag-drop`, `search-filter`, `tabs`, `text-editor`; Dialoge über `foundry.applications.api.DialogV2` | Verzeichnisse `applications/elements/`, `applications/ux/`, `applications/api/` |
| F8 | `CategoryBrowser` (abstrakt): "2-pane Application that allows for entries to be grouped and filtered by category"; Unterklassen liefern `_prepareCategoryData()` (Kategorie-`id` → `{ id, label, entries }`) und **müssen** `subtemplates.category` (Vorlagenpfad) setzen; `filter` und `sidebarFooter` optional; hat Textsuche. Foundrys eigenes Einstellungsfenster `SettingsConfig` erbt davon; seine Einträge sind `MenuEntry` (`buttonText`, `hint`, `icon`, `key`, `label`) oder `SettingEntry` (`field: DataField`, `label`, `value`). In den Types als "TODO: Stub" bzw. mit `_onSearchFilter: unknown` unvollständig typisiert | `applications/api/category-browser.d.mts`; `applications/settings/config.d.mts` |
| F9 | Einstellungen: `game.settings.settings` (`Map<…, SettingConfig>`), `game.settings.menus` (`Map<…, SettingSubmenuConfig>`), `game.settings.sheet` (Singleton des Einstellungsfensters). Feld-Liste je Einstellung: `namespace`, `key`, `name?`, `hint?`, `scope` (`"world" \| "client"`), `config?` ("Indicates if this Setting should render in the Config application"), `type?`, `choices?`, `range?` (`min`, `max`, `step`), `default`, `requiresReload?`, `onChange?`, `input?`. `get`/`set` sind typisiert; bei `set` gehen Optionen an den Server, wenn der Scope `world` ist | `helpers/client-settings.d.mts:29–40, 150–200, 270–330` |
| F10 | `registerMenu(namespace, key, { name, label, hint, icon, type, restricted })`; `type` ist ein Konstruktor **ohne Argumente** (`new () => ApplicationV2`); `restricted: true` = nur GM. Das Recht `SETTINGS_MODIFY` hat die Standardrolle `ASSISTANT` (`disableGM: false`) | `client-settings.d.mts:129–139, 331–377`; `common/constants.d.mts:1491–1501` |
| F11 | Hooks für Fenster: `render<Klassenname>` (dynamisch, z. B. `renderApplicationV2`) und `getHeaderControls<Klassenname>`; der Hook `getSceneControlButtons` steht in den Types nur als Kommentar | `hooks.d.mts:416, 1043, 1063` |
| F12 | Manifest-Felder in v13: `styles` (Menge von CSS-Pfaden), `languages` (Menge von `{ lang, name?, path, system?, module?, flags }`), `esmodules`, `scripts`; **kein** Feld für Vorlagen (Handlebars-Vorlagen werden per Pfad geladen). Lokalisierung: `game.i18n.localize`, `format`, `has`, `lang` | `common/packages/base-package.d.mts:137–160, 322–337`; `helpers/localization.d.mts` |

### Vorbilder und frühere Erfahrung

| # | Fakt | Fundstelle |
|---|---|---|
| V1 | Custom D&D 5e nutzt je Bereich ein Einstellungsmenü (`registerMenu`, `restricted: true`, Scope `world`) mit Editor-Formular plus eine Enable- und eine Config-Einstellung (`config: false`) | `source-analysis/ruling-rules-customization.md:45–52` |
| V2 | Midi-QOL hat ein TroubleShooter- und ein Config-Panel als `ApplicationV2` | `source-analysis/roll-out-automation.md:60` |
| V3 | Phase 1 (M4, live bestätigt): Hub per `registerMenu` geöffnet, Einstellungen fremder Module gelesen und geschrieben. Zwei Beobachtungen: Werte vom Typ Object erscheinen als `"[object Object]"` (F2), und der Live-Zyklus (Fehler finden, beheben, neu zippen, erneut testen) brauchte **drei Runden** (F3) | `archive/research-phase-1/m4-04-monitor-output.md:24–33` |
| V4 | Die Live-Prüfung von M2 zeigte: Die Anmeldung funktioniert im `setup`; die API ist von anderen Modulen lesbar | `m2-05-live-check-output.md` |

### Nicht ohne Live-Test belegbar

Ein Beleg bräuchte einen Test in Forge (Freigabe durch den Projektleiter, Konsole und Sichtprüfung von ihm).

| # | Frage | Warum offen |
|---|---|---|
| U1 | Wie sieht ein `ApplicationV2`-Fenster mit `TABS` und `tab-navigation.hbs` in v13 aus, und funktionieren dynamisch (je angemeldetem Modul) erzeugte Tabs, wenn `_prepareTabs` überschrieben wird? | Types zeigen Schnittstellen, nicht Verhalten oder Darstellung (F2, F3) |
| U2 | Stellt das Foundry-Kern-CSS Buttons, Formularfelder und Fußzeilen in einem eigenen Fenster automatisch im nativen Stil dar, und welche Klassen sind dafür nötig? | CSS ist nicht Teil der Types; im Plan als `medium`-Risiko von M3 benannt |
| U3 | Liefert `game.settings.settings` in v13 je Eintrag ein `DataField` (das Einstellungsfenster arbeitet mit `field: DataField`) oder den registrierten Rohtyp? | Der Phase-1-Code las nur `namespace`, `key`, `name`, `hint`, `scope`; die Types nennen `type?: RuntimeType` (F8, F9) |
| U4 | Wie löst Foundry die Neuladen-Aufforderung bei `requiresReload`-Einstellungen aus, und muss ein eigenes Fenster sie nachbauen? | die Logik sitzt im Einstellungsfenster, in den Types nur als Stub (F8, F9) |
| U5 | Reicht die Paketierung, wenn Vorlagen (`templates/*.hbs`) oder `lang/en.json` hinzukommen? | die bisherigen Zips enthalten nur `module.json` und `dist/module.js` (I9); Ablauf liegt beim Projektleiter |

---

## Dependencies

| # | Dependency | Version | Status |
|---|---|---|---|
| D1 | Foundry-Types v13 (`ApplicationV2`, Mixin, Vorlagen-API, Felder) | Tag `v13.345.1` | present (nur lokal, absoluter Pfad) |
| D2 | typescript / esbuild / vitest | 5.9.3 / 0.24.2 / 2.1.9 | present |
| D3 | esbuild bündelt Vorlagen (`.hbs`) nicht in `dist/module.js`; Foundry lädt sie zur Laufzeit per Pfad (`getTemplate`, `loadTemplates`, `PARTS`) | — | Fakt (F3, F5, F12) |
| D4 | Neue npm-Dependency | — | nicht vorhanden, nicht beantragt |

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | U1/U2: Darstellung und Stil des Hubs (Tabs, Formularfelder, Buttons im nativen Look) sind nur live sichtbar. Im Milestone Plan als `medium`-Risiko von M3 benannt und mit der Plan-Freigabe zur Kenntnis genommen; die Annahme des Restrisikos folgt im Monitor. | `medium` | no |
| R2 | Sobald der Hub Vorlagen oder `lang/en.json` nutzt, muss jedes Paket für Forge mehr als `module.json` und `dist/module.js` enthalten (U5); fehlen die Dateien, bleibt das Fenster leer. Ich baue die Zips selbst, der Projektleiter installiert sie. | `low` | no |
| R3 | Erste Laufzeitnutzung von `core/settings-hub.ts`: Die Vorbedingungen aus dem M1-Kommentar (Eagle-Filter, Rechteprüfung vor jedem Schreiben) gelten jetzt. Der Eagle-Filter kann aus der Registry kommen; für die Rechte ist bis M5/M6 nur die Sichtbarkeit des Hubs (GM) vorhanden (F10). | `low` | no |
| R4 | `CategoryBrowser` und `SettingsConfig` sind in den Types unvollständig typisiert (Stub, `unknown`); wer sie nutzt, arbeitet ohne volle Typprüfung. | `low` | no |
| R5 | `RawSettingConfig` (I3) kennt `config`, `type`, `choices`, `range`, `requiresReload` nicht; ein Hub, der Einstellungen wie Foundry darstellen will, braucht diese Angaben. Werte vom Typ Object waren in Phase 1 nicht sinnvoll darstellbar (V3). | `low` | no |
| R6 | Oberflächenarbeit ist teuer: Phase 1 brauchte drei Live-Runden für ein einfaches Fenster (V3). | `low` | no |
| A1 | **Annahme:** Der "Inhalt" eines Moduls im Hub (S6) sind seine **Einstellungen** (P-FC3) plus die Start-Aktion (P-FC5). Dass Module darüber hinaus eigene Inhalte in den Tab liefern, steht nirgends. | `low` | no |
| A2 | **Annahme:** Der Hub ist wie in Phase 1 nur für den GM sichtbar; der Zugriff für Spieler gehört zu N1/M6. | `low` | no |
| A3 | **Annahme:** `game.settings.settings` liefert weiterhin die Form, die Phase 1 live gelesen hat (94 Pakete). | `low` | no |

Kein `high`- oder `critical`-Fund, kein Human-Decision-Trigger. R1 ist `medium` und nicht blockierend (durch den
freigegebenen Plan gedeckt).

---

## Open Questions

Alle gehören zur Entscheidungsarbeit des Apply; keine blockiert dessen Start.

| # | Question | Priority | Owner |
|---|---|---|---|
| Q1 | Ist der Tab-Inhalt nur die Einstellungen des Moduls (A1), oder sollen Module eigene Inhalte liefern? Bleibt die Lesart unklar, wird der Projektleiter gefragt. | important | Claude (Apply), ggf. Projektleiter |
| Q2 | Welche Einstellungen erscheinen (nur `config: true`, auch Modulmenüs aus `game.settings.menus`?) und wie werden die Typen dargestellt (Boolean, String, Zahl, `choices`, `range`; nicht Darstellbares)? | important | Claude (Apply) |
| Q3 | Wie wird der Hub geöffnet (Einstieg)? Phase 1 hat `registerMenu` live bestätigt (F10, V3). | important | Claude (Apply) |
| Q4 | Aufbau des Fensters: `ApplicationV2` mit `TABS` und Kernvorlagen oder `CategoryBrowser` (F2, F3, F8); Vorlagen als Dateien oder ohne Vorlagendateien (R2, D3, U5). | important | Claude (Apply) |
| Q5 | Wie liefert ein Modul seine Start-Aktion, wie steht das in Teil 2 des Vertrags, und wie ändert sich die API-Version (M2-Übergabe: `0.2.0` bricht vor 1.0 die Dummy-Module)? | important | Claude (Apply) |
| Q6 | Wie erreicht der Hub die Registry (Ablage, Übergabe; Konstruktor ohne Argumente laut F10)? | important | Claude (Apply) |
| Q7 | Lokalisierung der Hub-Texte: `lang/en.json` mit `languages` im Manifest (F12) oder feste englische Texte (N3)? | important | Claude (Apply) |
| Q8 | Schreiben aus dem Hub: reicht "nur GM" (R3), wie wird `requiresReload` behandelt (U4), was passiert mit nicht darstellbaren Werten? | important | Claude (Apply) |
| Q9 | Verhalten ohne angemeldete Module (leerer Hub) und mit installierten, aber nicht angemeldeten oder inaktiven Modulen (S2: ausblenden). | nice-to-have | Claude (Apply) |
| Q10 | Umfang und Gliederung von `docs/ui-guide.md`: nur Bausteine, die der Hub verwendet oder die die Foundry-Referenz belegt (S9). | important | Claude (Apply) |
| Q11 | Live-Prüfung nach dem Deploy (Freigabe je Test): ein Paketsatz mit allem Nötigen. | nice-to-have | Projektleiter |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m3-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

Es wurde kein Code geändert.

---

## Next Step

Apply M3: Q1–Q10 entscheiden (Tab-Inhalt, dargestellte Einstellungen, Einstieg, Fensteraufbau, Start-Aktion und API-Teil 2,
Zugriff auf die Registry, Lokalisierung, Schreibrechte, Randfälle, Leitfaden-Gliederung), Acceptance-Kriterien und
Deploy-Reihenfolge festlegen. Q11 (Live-Prüfung) geht spätestens zum "Go" des M3-Deploys an den Projektleiter.

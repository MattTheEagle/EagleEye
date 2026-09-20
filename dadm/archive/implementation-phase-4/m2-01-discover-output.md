# M2 — Modul-Anmeldung und Erkennung — Discover Output

```
artifact: discover-output
milestone: M2
phase: DISCOVER
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Entscheidung über die Form der Anmeldung (Aufgabe
des Apply). Belege nennen die Fundstelle; was sich ohne Live-Test nicht belegen lässt,
steht getrennt in Abschnitt "Nicht ohne Live-Test belegbar".

---

## Input Summary

- `04-milestone-plan.md` (M2 mit Risiken), `m1-04-monitor-output.md` (Übergaben an M2),
  `m1-02-apply-output.md` (Konventionen K1–K4)
- Spezifikation und Entscheidungen: `dadm/reference/eagle-modules-aufbau.md` (P-FC2,
  P-FC4, Q3, Q15, N2, N4, E6), bestätigte Pläne (`dadm/eagle-modules-projektplan.md`
  Abschnitt 3.1, `EAGLE-MODULES-PLAN.md` Abschnitt 3.1)
- Archivierte Phase-3-Recherche `archive/planning-phase-3/m5-01-…` und `m5-02-…`
  (Nachschlagematerial, nicht bindend; Aussagen daraus sind als solche gekennzeichnet)
- Foundry-Referenz v13 (`foundry-vtt-reference-v13`): `cheat-sheet.md` und `types/`
  (Tag `v13.345.1`, Commit `3fdf2bbf`, Stand 2025-07-04)
- Quellenanalyse `dadm/reference/source-analysis/` (`techniques-catalog.md`, `README.md`,
  `roll-out-automation.md`)
- Repo-Ist nach M1: `v13/`, `core/`, `test-fixtures/`
- Kein Web-Abruf, kein Live-Test, kein Code geändert.

---

## Current-State Summary

1. **Flight Control heute:** `v13/module.ts` hat nur einen `init`-Hook mit Startlog. Es gibt
   keine `api`, keine Anmelde-Struktur, kein `setup`/`ready`, keine Eagle-Erkennung;
   `v13/module.json` hat weder `relationships` noch `flags`. *(relevant)*
2. **Eagle Module:** Es existiert keines; ihre Modul-IDs sind nicht festgelegt (E5: nur
   Dokumente wurden umbenannt). *(relevant)*
3. **Bausteine aus M1:** `core/manifest-scanner.ts` (Paketdaten aller Module und des
   Systems, ohne Filter) und `core/settings-hub.ts` (Registry lesen/schreiben) sind
   getestet und nicht verdrahtet. *(relevant)*
4. **Entscheidungen zur Anmeldung** stehen fest, aber ihr Zusammenspiel ist offen
   (Tabelle S1–S6 unten).
5. **Foundry v13 liefert** weder eine `api`-Eigenschaft an Modulen noch ein Konzept für
   API-Versionen; es liefert einen typisierten Erweiterungspunkt (`ModuleConfig`), das
   `relationships`-Schema mit Versionsspanne und Hook-Lebenszyklus (Tabelle F1–F10).
6. **Drei Eigenschaften, die der Plan für M2 braucht, sind ohne Live-Test nicht belegbar**
   (Tabelle U1–U5; im Plan als `medium`-Risiken benannt).

---

## Inventory

### Repo-Ist

| # | Name | Beschreibung | Location | Status |
|---|---|---|---|---|
| I1 | Einstiegspunkt | `init` → `logEagleEyeReady("13")`; sonst nichts | `v13/module.ts` (5 Z.) | present |
| I2 | Manifest | `id eagleeye`, `esmodules ["dist/module.js"]`, `compatibility 13/13`; **ohne** `relationships`, `flags`, `languages` | `v13/module.json` | present |
| I3 | Paketdaten-Lesen | `scanPackages`/`logPackageScan`; `PackageLike` (`id`, `title`, `version`, `active?`, `availability`, `getVersionBadge()`), alle Module plus System, kein Filter, nicht verdrahtet | `core/manifest-scanner.ts` (63 Z.) | present |
| I4 | Registry-Lesen/-Schreiben | `listSettings`/`updateSetting`; nicht verdrahtet; Vorbedingungs-Kommentar (Filter, Rechteprüfung) | `core/settings-hub.ts` (64 Z.) | present |
| I5 | Dummy-Module | `eagleeye-dummy-a` und `-b`: `scripts: ["module.js"]` (klassisch, **nicht** `esmodules`), `compatibility.minimum 11`, **kein** `relationships`; sie registrieren im `init` je eine Einstellung und rufen keine Eagle-API auf | `test-fixtures/` | present |
| I6 | Dokumentation für Module | `./docs/` (Ort mit dem M1-Go bestätigt) | `docs/` | missing (entsteht mit M2) |
| I7 | Test-Konventionen | injizierbare Quellen, Regressionstest je Standardadapter, dünne Foundry-Hüllen, Englisch (K1–K4) | `m1-02-apply-output.md` Abschnitt 6 | present |
| I8 | Foundry-Types | lokal per absolutem Pfad in `v13/tsconfig.json` eingebunden | `v13/tsconfig.json` | present |
| I9 | Eagle-Modul-Repos und -IDs | keine | — | missing |

### Spezifikation und Entscheidungen (Projektleiter)

| # | Aussage | Fundstelle |
|---|---|---|
| S1 | P-FC2: "Nur eigene Eagle Module angebunden. Keine Fremdmodule" (E6) | `eagle-modules-aufbau.md` Z. 34, Z. 259 |
| S2 | P-FC4: "Jedes installierte Module hat eine eigene Registerkarte im Hub" | ebd. Z. 36 |
| S3 | N2: "Registerkarten nur für aktive Eagle Module. Folge: Die Erkennung inaktiver Module über Manifest-`flags` entfällt, die API-Registrierung genügt." | ebd. Z. 202 |
| S4 | N4: Flight Control bleibt eine schmale, generische Schnittstelle; Editor-Logik bleibt in den Modulen | ebd. Z. 204 |
| S5 | Q3 a: alle Foundry-Änderungen laufen über Flight Control; E7: jedes Modul ein eigenes Repo, versionierte Schnittstelle | ebd. Z. 181; Plan Abschnitt 1, 3.1 |
| S6 | Technischer Plan 3.1: Anfragekanal per `game.modules.get(id).api`, Zugriff erst ab `setup`/`ready`; Versionsspanne in `relationships.requires` plus API-Versionsprüfung; "Nicht verifiziert: Ladereihenfolge, deaktivierte Abhängigkeit, Erzwingen der Spanne (Live-Test)" | `eagle-modules-projektplan.md` Abschnitt 3.1 |

### Foundry-Fakten (Types v13.345.1; Pfade relativ zu `foundry-vtt-reference-v13/types/src/`)

| # | Fakt | Fundstelle |
|---|---|---|
| F1 | `Module` deklariert `active: boolean`; eine Eigenschaft `api` gibt es nicht (Suche nach `\bapi\b` in `client/packages/*.d.mts` und `common/packages/*.d.mts`: keine Treffer) | `foundry/client/packages/module.d.mts` |
| F2 | Offizieller Erweiterungspunkt `ModuleConfig`: `interface ModuleConfig { "module-id": { api: APIObject } }`; `game.modules.get(id)` liefert `Module & ConfiguredModule<T>`; `RequiredModules` entfernt `undefined` für Pflichtmodule | `configuration/configuration.d.mts:203–225`; `foundry/client/game.d.mts:629–636` |
| F3 | `game.modules` ist "A Map of active Modules which are currently eligible to be enabled in this World. The subset of Modules which are designated as active are currently enabled." Es enthält also auch nicht aktive Module; `Module#active` unterscheidet. Anders als `game.packs` ("Initialized just before the `setup` hook") trägt `game.modules` keine Stufen-Einschränkung | `foundry/client/game.d.mts:74–84` |
| F4 | Lebenszyklus: `init` ("fires as Foundry is initializing, right before any initialization tasks have begun"), `i18nInit`, `setup` ("finished initializing but before the game state has been set up. Fires before any Documents, UI applications, or the Canvas have been initialized"), `ready` ("fully ready"); alle über `Hooks.callAll`. Die Typen `InitGame`, `I18nInitGame`, `SetupGame`, `ReadyGame` zeigen `Game` je Lebensstufe | `foundry/client/hooks.d.mts:267–298`; `game.d.mts:608–626` |
| F5 | Hooks-API: `on`, `once` ("only triggered once the first time the event occurs"), `off`, `call`, `callAll` ("Call all hook listeners in the order in which they were registered … will always trigger every hook callback"). Ob ein **nach** dem Ereignis registrierter Listener noch aufgerufen wird, sagen die Types nicht | `foundry/client/helpers/hooks.d.mts:25–100` |
| F6 | Hook-Namen sind typisiert (`Hooks.HookName`); `HookConfig extends AllHooks` ist als Erweiterungspunkt deklariert. Wie eigene, nicht deklarierte Hook-Namen zur Compile-Zeit behandelt werden, wurde nicht geprüft | `configuration/hooks.d.mts:4`; `foundry/client/hooks.d.mts:267` |
| F7 | Manifest: `relationships` hat `systems`, `requires` ("required for base functionality"), `recommends`, `conflicts`, `flags`. Jedes Element: `id`, `type` (Default `"module"`), `manifest` (optional), `compatibility` mit `minimum` ("will not function before this version"), `verified`, `maximum` ("will not function after this version") und `reason`. Paketebene: `flags`, `esmodules`, `scripts` | `foundry/common/packages/base-package.d.mts:163–232, 303, 322, 327` |
| F8 | `PACKAGE_AVAILABILITY_CODES`: `UNKNOWN 0`, `VERIFIED 1`, `UNVERIFIED_BUILD 2`, `UNVERIFIED_SYSTEM 3`, `UNVERIFIED_GENERATION 4`, `MISSING_SYSTEM 5`, `MISSING_DEPENDENCY 6` ("A dependency of the Package is not available"), `REQUIRES_CORE_DOWNGRADE 7`, `REQUIRES_CORE_UPGRADE_STABLE 8`, weitere folgen. Ob eine Abhängigkeit mit unpassender Version als `MISSING_DEPENDENCY` zählt, geht aus den Types nicht hervor | `foundry/common/constants.d.mts:~796–845` |
| F9 | Versionshelfer: `foundry.utils.isNewerVersion(v1, v0)`; `game.version` (Foundry-Kern); `game.system.version`; `Module#version` (Pflichtfeld, Default `"0"`). Ein Konzept für die API-Version eines Moduls gibt es nicht (keine Fundstelle) | `foundry/common/utils/helpers.d.mts:397`; `game.d.mts:209`; `module.d.mts` (`version`) |
| F10 | Das `cheat-sheet.md` der Referenz (13 Zeilen) enthält keine Einträge zu Modulen, Hooks oder APIs | `foundry-vtt-reference-v13/cheat-sheet.md` |

### Vorbilder und Foundry-Doku

| # | Fakt | Fundstelle |
|---|---|---|
| V1 | Midi-QOL setzt `game.modules.get("midi-qol").api = globalThis.MidiQOL`; Custom D&D 5e setzt `module.api = {…}` im `init`-Hook | `midi-qol/src/midi-qol.ts:958`; `custom-dnd5e/scripts/module.js:67,95` (aus `m5-01`, b1) |
| V2 | Bereitschafts-Hooks der Vorbilder: `libWrapper.Ready`, `socketlib.ready`, `midi-qol.midiReady`, `DAE.setupComplete`, `tidy5e-sheet.ready` ("liefert API"). Muster: "feature-erkannte APIs statt harter Abhängigkeit (`game.modules.get(id)?.api`)", "Aufrufer prüfen Fähigkeiten vor Nutzung"; "Integrationen per Hook, nicht per Abhängigkeit" | `source-analysis/techniques-catalog.md:98–109`; `roll-out-automation.md:108` |
| V3 | Foundry-Doku (Stand Phase 3, **heute nicht neu abgerufen**): "If a module has been installed with dependencies, but its dependencies are missing, it cannot be enabled."; Library-Module laden vor Nicht-Library-Paketen; zur Reihenfolge normaler Module untereinander und zu "installiert, aber deaktiviert" steht nichts | `m5-01-discover-output.md` (b2–b4) |

### Nicht ohne Live-Test belegbar

Ein Beleg bräuchte einen Test in Forge (Freigabe je Test durch den Projektleiter, Konsolen-Log
von ihm).

| # | Frage | Warum offen |
|---|---|---|
| U1 | In welcher Reihenfolge laufen die `init`-Callbacks von Flight Control und einem davon abhängigen Eagle Modul? | Doku und Types schweigen (V3, F4) |
| U2 | Was passiert, wenn Flight Control installiert, aber **deaktiviert** ist und ein abhängiges Modul aktiv ist? | Doku schweigt (V3); F8 nennt nur "not available" |
| U3 | Erzwingt Foundry die `compatibility`-Spanne aus `relationships.requires` beim Aktivieren oder zeigt es sie nur an? | aus Types und Doku nicht ableitbar (F7, F8) |
| U4 | Wird ein Hook-Listener, der **nach** dem Auslösen des Hooks registriert wird, noch aufgerufen? | Types schweigen (F5) |
| U5 | Nimmt die `Module`-Instanz in v13 zur Laufzeit eine frei gesetzte Eigenschaft `api` an? | Vorbilder tun es (V1), die Types erlauben es über `ModuleConfig` (F2); von uns nicht getestet |

---

## Dependencies

| # | Dependency | Version | Status |
|---|---|---|---|
| D1 | Foundry-Types `foundry-vtt-reference-v13/types` | Tag `v13.345.1` (Commit `3fdf2bbf`) | present (nur lokal, absoluter Pfad) |
| D2 | typescript / esbuild / vitest | 5.9.3 / 0.24.2 / 2.1.9 | present |
| D3 | Semver-Bibliothek als deklarierte Dependency | — | missing (nicht in `package.json`; Änderung wäre freigabepflichtig) |
| D4 | `foundry.utils.isNewerVersion` | Foundry-Laufzeit | unclear (in Vitest nicht verfügbar; Tests laufen ohne Foundry, vgl. K1) |
| D5 | libWrapper | — | nicht betroffen (Flight Control braucht es nach Plan nicht) |

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | U1–U3 (Ladereihenfolge, deaktivierte Abhängigkeit, Erzwingen der Versionsspanne) sind unbelegt. Sie sind im freigegebenen Milestone Plan als `medium`-Risiken von M2 benannt und mit der Plan-Freigabe zur Kenntnis genommen; das Restrisiko wird im Monitor ausdrücklich angenommen oder durch einen freigegebenen Live-Test belegt. | `medium` | no |
| R2 | U4 (Verhalten nachträglich registrierter Hook-Listener): Ein Bereitschafts-Hook, den der Aufrufer zu spät abonniert, könnte nie ausgelöst werden. Die Types treffen dazu keine Aussage. | `low` | no |
| R3 | F1/F2: `api` ist an `Module` nicht nativ getypt; Typsicherheit braucht eine eigene `ModuleConfig`-Erweiterung (Erweiterungspunkt existiert). | `low` | no |
| R4 | E6 ("keine Fremdmodule") gegen N2 ("API-Registrierung genügt"): Foundry kennt keinen Mechanismus, die Herkunft eines API-Aufrufs zu prüfen; jeder Code im selben Client, der `game.modules.get("eagleeye").api` erreicht, könnte sich anmelden. *(Beobachtung aus dem Aufbau von JavaScript, keine Quelle.)* | `low` | no |
| R5 | Die Dummy-Module (I5) bilden Eagle-Module-Bedingungen nicht nach (`scripts` statt `esmodules`, keine Abhängigkeit auf `eagleeye`, keine API-Aufrufe); ein Live-Test der Anmeldung braucht ausgebaute Dummys. | `info` | no |
| A1 | **Annahme:** Modul-IDs der Eagle Module sind nicht festgelegt; Aussagen gelten unabhängig von der ID (wie Phase 3). | `info` | no |
| A2 | **Annahme:** V1/V2 (Vorbild-Module) stammen aus der Quellenanalyse und wurden heute nicht gegen den Quelltext neu geprüft. | `low` | no |
| A3 | **Annahme:** Die Foundry-Doku-Aussagen (V3) gelten unverändert; sie wurden nicht neu abgerufen. | `low` | no |

Kein `critical`- oder `high`-Fund, kein Human-Decision-Trigger. R1 ist `medium`, aber nicht
blockierend: Die Aussage ist durch den freigegebenen Plan gedeckt, und der Apply hat ein
Design zu wählen, das ohne die unbelegten Eigenschaften auskommt oder sie ausdrücklich als
`unverified` ausweist.

---

## Open Questions

Alle gehören zur Entscheidungsarbeit des Apply; keine blockiert dessen Start.

| # | Question | Priority | Owner |
|---|---|---|---|
| Q1 | Wie meldet sich ein Modul an (Form der API-Schnittstelle) und wie hängt das mit dem späteren Anfragekanal (M4) zusammen? | important | Claude (Apply) |
| Q2 | Zu welchem Zeitpunkt darf/soll sich ein Modul anmelden und wie erfährt es, dass Flight Control bereit ist (R2, U1, U4)? | important | Claude (Apply) |
| Q3 | Woran gilt ein Modul als Eagle Modul, und weist Flight Control Anmeldungen von Nicht-Eagle-Modulen ab (S1/E6 gegenüber S3/N2, R4)? Ist die Lesart von E6 nicht eindeutig, wird der Projektleiter gefragt. | important | Claude (Apply), ggf. Projektleiter |
| Q4 | Welche Angaben gehören zur Anmeldung (Teil 1 des API-Vertrags) und was gehört erst zu M3 (Tab-Inhalt, Start-Aktion, Einstellungen)? | important | Claude (Apply) |
| Q5 | Wie wird die API-Version definiert und verglichen (F9, D3, D4), und was passiert bei Inkompatibilität (Abweisen, nur Warnhinweis, Funktionen des Moduls aus)? | important | Claude (Apply) |
| Q6 | Verhalten bei Randfällen: Modul meldet sich doppelt, gar nicht, vor der Bereitschaft von Flight Control oder mit ungültigen Angaben. | important | Claude (Apply) |
| Q7 | Typisierung der API über `ModuleConfig` (F2, R3) und wie andere Repos (E7) den Vertrag nutzen: nur als Text in `docs/api-contract.md` oder mit Typdatei? Keine neue Dependency. | nice-to-have | Claude (Apply) |
| Q8 | Sprache von `docs/api-contract.md` (Deutsch oder Englisch); vor dem ersten Dokument im Deploy zu klären (T3 aus dem M1-Apply). | important | Projektleiter |
| Q9 | Soll einer der unbelegten Punkte U1–U5 live geprüft werden (Freigabe je Test)? Vorschlag aus dem M1-Monitor: gebündelt mit dem M1-Live-Check, ein Test nach dem M2-Deploy. | nice-to-have | Projektleiter |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m2-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

Es wurde kein Code geändert.

---

## Next Step

Apply M2: Q1–Q7 entscheiden (Form der Anmeldung, Zeitpunkt und Bereitschaft, Erkennung und
Abweisung, Inhalt von Teil 1 des API-Vertrags, Versionsprüfung, Randfälle, Typisierung),
Acceptance-Kriterien und Deploy-Reihenfolge festlegen. Q8 (Sprache der Dokumente) und
Q9 (Live-Prüfung) gehen an den Projektleiter, spätestens zum "Go" des M2-Deploys.

# M3 — Hub-Oberfläche (mit UI-Leitfaden) — Deploy Output

```
artifact: deploy-output
milestone: M3
phase: DEPLOY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m3-02-apply-output.md` (Design, Testplan H1–H18, Acceptance AC-M3-01 bis -13, Deploy-Reihenfolge Abschnitt 11). Der
  Apply-Output gilt mit dem "Go" als geschlossen.
- **"Go" des Projektleiters am 2026-09-19** mit diesen Antworten:
  - Go für den Deploy; **Risiko R1 (`medium`) ausdrücklich angenommen**
  - T1: Tab-Inhalt = Einstellungen plus "Open"; keine modul-eigenen Inhalte in M3
  - T2: Live-Prüfung **einmal gesammelt nach M3**; der Projektleiter deployt dabei selbst auf Forge
  - T3: M3 wie geplant in **einem** Deploy (keine Teilung, kein neuer Plan)
  - T4 (Pläne und Root-`README.md` nachführen) wurde nicht abgefragt; es gilt der Vorschlag "mit M8"
- Ausgangsstand: M2-Endstand im Arbeitsbaum (nicht committet), Basis-Commit `77daf6d`.
- Grenzen: `06-working-mode.md` (kein Commit, kein Live-Test durch mich), `03-scope-declaration.md`.

---

## Implementation Summary

Der Deploy setzt das Design des Apply um, in der Reihenfolge von Abschnitt 11.

- **Registry und API:** `core/module-registry.ts` nimmt im Beschreiber ein optionales `open` (Funktion) an und legt es am
  `RegisteredModule` ab; ein `open`, das keine Funktion ist, ergibt `invalid-descriptor`; Einträge ohne `open` bleiben
  frei von der Eigenschaft. `EAGLE_API_VERSION` ist `0.2.0`.
- **Tab-Modell und Start (`core/hub-model.ts`, neu):** `buildHubModel` (ein Tab je angemeldetem aktivem Modul in
  Registry-Reihenfolge, Label = Titel, aktiver Tab bleibt erhalten, sonst der erste, leerer Hub erkennbar) und
  `startModule` (ruft `open` ohne Argumente, löst nie mit einer Ablehnung auf).
- **Einstellungen (`core/settings-hub.ts`, erweitert):** `listHubSettings` (Namensraum, `config: true`, lokalisiert, Art
  Boolean/String/Number/unsupported, `choices`, `range`, `requiresReload`, `typeName` zur Diagnose), `coerceSettingInput`,
  das geprüfte Schreiben `applySettingInput` (GM, angemeldeter Namensraum, vorhandene und bearbeitbare Einstellung, gültiger
  Wert, erst dann `game.settings.set`) und der Adapter `defaultHubSettingsSource` samt Art-Erkennung für Konstruktoren und
  `BooleanField`/`StringField`/`NumberField`. Die bisherigen Exporte `listSettings` und `updateSetting` und ihre Tests sind
  unverändert; der Kommentar am Dateikopf beschreibt jetzt den tatsächlichen Gebrauch.
- **Fensterhülle (`v13/hub-application.ts`, neu):** `createHubApplicationClass(context)` liefert einen `ApplicationV2` ohne
  Handlebars-Mixin und ohne eigene Vorlagen. Die Tab-Leiste stammt aus der Kernvorlage
  `templates/generic/tab-navigation.hbs` (über `parseHTML` in DOM gewandelt), Tab-Inhalte entstehen mit den Feld-Helfern und
  DOM-Aufrufen (`createFormGroup`, `createCheckboxInput`, `createNumberInput`, `createSelectInput`, `createTextInput`); `open`
  über `actions.openModule`, Einstellungen über `change`-Ereignisse mit Rückfall auf den gespeicherten Wert. Diagnosezeilen für
  den Live-Check (`eagleeye | hub rendered: …`, nicht editierbare Einstellungen).
- **Verdrahtung (`v13/module.ts`):** im `init` Registry anlegen, API anhängen (wie M2) und in einem eigenen `try/catch` das
  Einstellungsmenü `registerMenu("eagleeye", "hub", … restricted: true)` mit der erzeugten Klasse registrieren.
- **Texte:** `v13/lang/en.json` (14 Schlüssel unter `EAGLEEYE`) und `languages` im Manifest.
- **Dummy-Modul a:** `apiVersion "0.2.0"`, `open`-Aktion, vier Einstellungen (Checkbox, Auswahl, Zahl, Neuladen-Hinweis); b und
  c unverändert.
- **Dokumentation:** `docs/api-contract.md` (Teil 2: `open`, Abschnitt "The hub", Änderungshistorie `0.2.0`) und
  `docs/ui-guide.md` (Englisch, 13 Regeln, je Regel Foundry-Referenz und/oder Fundstelle im Hub).

**Ergänzungen innerhalb des Designs** (keine neue Architekturentscheidung):
1. `buildHubModel` fällt bei leerem Modultitel auf die Modul-`id` zurück (Fall in H5 geprüft).
2. Der Lang-Schlüssel-Test (H18) liest die Quelldateien über Vites `import.meta.glob` mit `?raw` und
   `/// <reference types="vite/client" />`, weil `@types/node` nicht installiert ist. Keine Dependency-Änderung.
3. Der Leitfaden nutzt statt einer Evidence-Spalte zwei Spalten ("Foundry reference", "Used in the hub"), damit das Skript
   beides getrennt prüfen kann; inhaltlich unverändert.
4. Der Hub schreibt kein `innerHTML` (Apply erlaubte höchstens eines): Die Tab-Leiste läuft über `foundry.utils.parseHTML`.
5. `applySettingInput` fängt auch unerwartete Fehler (z. B. aus der Quelle) als `write-failed` ab, damit "löst nie mit
   Ablehnung auf" ohne Ausnahme gilt.

---

## Files Changed

Von M3 stammen (Zeilenzahl jetzt):

| Datei | Änderung | Zeilen |
|---|---|---|
| `core/module-registry.ts` | `open` im Beschreiber und am Eintrag | 118 |
| `core/module-registry.test.ts` | + H1–H3 | 199 |
| `core/api-version.ts` | `EAGLE_API_VERSION = "0.2.0"` | 33 |
| `core/api-version.test.ts` | + H4 | 65 |
| `core/hub-model.ts` | neu | 41 |
| `core/hub-model.test.ts` | neu (H5–H10) | 115 |
| `core/settings-hub.ts` | Hub-Funktionen, Adapter, Kommentar | 276 |
| `core/settings-hub.test.ts` | + H11–H17 | 295 |
| `core/lang-keys.test.ts` | neu (H18) | 38 |
| `v13/hub-application.ts` | neu | 212 |
| `v13/module.ts` | Menü verdrahtet (25 → 66 Zeilen) | 66 |
| `v13/module.json` | + `languages` | — |
| `v13/lang/en.json` | neu | 24 |
| `test-fixtures/eagleeye-dummy-a/module.js` | 0.2.0, `open`, vier Einstellungen | 66 |
| `test-fixtures/eagleeye-dummy-a/module.json` | `description` | — |
| `docs/api-contract.md` | Teil 2 | 227 |
| `docs/ui-guide.md` | neu | 59 |

Nicht durch M3 geändert: `package.json`, `package-lock.json`, `v13/tsconfig.json`, `core/manifest-scanner.ts`,
`core/index.ts`, `core/eagle-api.ts`, `test-fixtures/eagleeye-dummy-b/` und `-c/`. `v13/dist/module.js` (gitignoriert)
wurde neu gebaut: 4.958 → 19.745 Bytes.

---

## Proofs

Abschließender Lauf über alles, nach Abschluss aller Änderungen.

```
npm run typecheck   -> Exit 0
npm test            -> Test Files 7 passed (7); Tests 44 passed (44); Exit 0
                       manifest-scanner 2, api-version 8, hub-model 6, eagle-api 4, module-registry 13, settings-hub 10, lang-keys 1
npm run build       -> v13/dist/module.js 19.3kb; Exit 0
Bundle              -> "registerMenu" 1, "registerModule" 4, "API attached" 1, "hub rendered" 1, "openModule" 2, "libWrapper" 0, "innerHTML" 0
```

(Die Fehlermeldung des zusammengesetzten Aufrufs kam nur vom letzten `grep -c`, das bei 0 Treffern mit Exit 1 endet.)

**Skriptprüfungen** (Skripte im Scratchpad, nicht im Repo)
```
API-Vertrag gegen Code: Version 0.2.0 = EAGLE_API_VERSION; Kompatibilitätstabelle 7/7; Fehlercodes im Code, in der Tabelle und im
  TypeScript-Block je 7, identisch; descriptor-Zeile "open", erweiterter Grund invalid-descriptor, Abschnitt "The hub",
  Eintrag 0.2.0 in der Historie, "open" im TypeScript-Block: alles vorhanden
UI-Leitfaden: 13 Regeln (R-01 bis R-13), jede mit mindestens einem Beleg; alle Referenzpfade existieren, die Zeilen liegen
  im Bereich; alle Hub-Symbole kommen in ihren Dateien vor
Fixtures: JSON parst (a, b, c); node --check ok (a, b, c); a: requires eagleeye, 4 Einstellungen mit config true,
  apiVersion "0.2.0" und open; b: git diff leer; c: apiVersion "9.0.0" unverändert
Hub-Datei: 0 "innerHTML", 0 HandlebarsApplicationMixin, 0 .hbs-Dateien in v13/; module.ts: 1 Hook, kein ready, kein await im Code
```

**Gegenproben** (Nachweise, dass die Prüfungen wirken)
- **Lang-Schlüssel-Test:** Ich habe `EAGLEEYE.hub.notify.openFailed` kurz aus `lang/en.json` entfernt: Der Test scheiterte
  mit "missing or empty text for EAGLEEYE.hub.notify.openFailed". Danach die Datei byte-genau wiederhergestellt (`cmp` ohne
  Abweichung); der abschließende Lauf besteht.
- **Leitfaden-Belege:** Das Skript druckt den Zeilentext jeder Referenzzeile. Dabei fielen zwei ungenaue Belege auf (R-01
  zeigte auf die falsche Export-Zeile, R-12 auf einen allgemeinen Kommentar); beide wurden auf die exakten Zeilen korrigiert
  (`_module.d.mts:6`; `client-settings.d.mts:283, 289, 296, 308` für `config`, `choices`, `range`, `requiresReload`).

Ein Live-Test wurde von mir nicht ausgeführt (Live-Test-Gate). Er ist für nach M3 vom Projektleiter gewünscht (T2); Anleitung im
Monitor-Output.

---

## Acceptance Checklist

- [x] AC-M3-01 — `core/hub-model.ts` exportiert `buildHubModel`, `startModule` und die Typen; H5–H10 bestehen (6 Tests)
- [x] AC-M3-02 — optionales `open` wird angenommen und abgelegt; kein Funktionswert → `invalid-descriptor`; Einträge ohne `open` ohne die Eigenschaft; H1–H3 bestehen, bestehende Tests unverändert grün
- [x] AC-M3-03 — `listHubSettings`, `coerceSettingInput`, `applySettingInput`, `defaultHubSettingsSource` und Typen exportiert; `listSettings`, `updateSetting` und ihre 3 Tests unverändert; H11–H17 bestehen (7 Tests)
- [x] AC-M3-04 — `EAGLE_API_VERSION` ist `"0.2.0"` (H4)
- [x] AC-M3-05 — `createHubApplicationClass` erweitert `ApplicationV2` ohne Handlebars-Mixin, keine `.hbs`-Datei, 0 × `innerHTML` (erlaubt war höchstens eines)
- [x] AC-M3-06 — `v13/module.ts` registriert im `init` das Menü in eigenem `try/catch` (`restricted: true`, `type` = erzeugte Klasse); ein Hook, kein `ready`, kein `await`
- [x] AC-M3-07 — `v13/lang/en.json` gültiges JSON mit den Schlüsseln aus dem Apply; `languages` im Manifest; H18 besteht
- [x] AC-M3-08 — API-Vertrag: `0.2.0`, `open`, erweiterter Grund, Abschnitt "The hub", Historie; Fehlercodes identisch mit dem Code (Skript)
- [x] AC-M3-09 — `docs/ui-guide.md` (Englisch): R-01 bis R-13 mit Beleg, alle Pfade und Hub-Symbole vorhanden (Skript)
- [x] AC-M3-10 — Dummy a registriert mit `0.2.0` und `open`, vier Einstellungen; b und c unverändert; JSON parst, `node --check` ok
- [x] AC-M3-11 — `typecheck` Exit 0; `npm test` Exit 0 mit 7 Dateien und 44 Tests; `build` Exit 0; Bundle enthält `registerMenu`, kein `libWrapper`
- [x] AC-M3-12 — `package.json`, Lock-Datei, `v13/tsconfig.json`, `core/manifest-scanner.ts`, `core/index.ts` unverändert; die 17 durch M3 geänderten Dateien entsprechen Abschnitt 5 des Apply. *Hinweis:* Weil M1 und M2 nicht committet sind, ist die Änderungsliste über den Zeitstempel gegenüber dem M2-Abschlussartefakt bestimmt (`find -newer`), nicht über `git status`.
- [ ] AC-M3-13 — **unverified**: Öffnen des Hubs aus den Moduleinstellungen, genau ein Tab (Dummy a), Felder editierbar und gespeichert, "Open" löst die Meldung von a aus, b und c ohne Tab, Darstellung im nativen Stil (U1–U5); nur durch den vom Projektleiter gewünschten Live-Check

### Abgleich Testplan (H1–H18)

| Datei | Fälle | Tests |
|---|---|---|
| `core/module-registry.test.ts` | H1–H3 (zusätzlich zu 10) | 13 |
| `core/api-version.test.ts` | H4 (zusätzlich zu 7) | 8 |
| `core/hub-model.test.ts` | H5–H10 | 6 |
| `core/settings-hub.test.ts` | H11–H17 (zusätzlich zu 3) | 10 |
| `core/lang-keys.test.ts` | H18 | 1 |

Jeder Fall ist genau ein `it`; Tabellenfälle laufen als Schleife im Test. Gesamt 44 = 26 bestehende + 18 neue.

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (aus Apply-R1, mit dem "Go" angenommen) Tabs mit selbst gebauten Inhalts-Abschnitten und der native Look sind nur live prüfbar; die Konvention `section.tab[data-group][data-tab]` mit der Klasse `active` stammt nicht aus der Referenz. Trifft sie nicht zu, geht M3 mit einer Variante über `HandlebarsApplicationMixin` zurück in Apply. Belegt oder widerlegt wird das durch den Live-Check nach M3. | `medium` | no |
| R2 | (Apply-R2) `v13/lang/en.json` gehört ab jetzt in jedes Paket, sonst zeigt der Hub rohe Schlüssel. Meine Live-Check-Zips enthalten sie; die Release-Zips brauchen den Ordner `lang/` (Vorschlag: Packaging-Skript in M8). | `low` | no |
| R3 | (Apply-R3/U3) Ob `game.settings.settings` je Eintrag den Rohtyp oder ein Feld liefert, ist offen; beide Formen werden erkannt, sonst erscheint `unsupported` mit Diagnosezeile. | `low` | no |
| R4 | (Apply-R4/U4) Foundrys Neuladen-Aufforderung wird nicht nachgebaut; der Hub zeigt nur den Hinweis. | `low` | no |
| R5 | Der Hub ist bis M6 nur für den GM nutzbar (`restricted`, `canWrite` = GM). | `low` | no |
| R6 | Die CSS-Regeln des Leitfadens (R-13) und die Optik sind durch die Referenz nicht belegt; der Monitor führt sie nach dem Live-Check nach. | `low` | no |
| R7 | API `0.2.0` macht Dummy a mit `0.1.0` unverträglich; a ist mit umgestellt, das Paket wird neu gebaut. | `info` | no |

Kein weiterer `medium`-Fund, kein Rework, keine Abweichung vom Design außer den oben genannten Ergänzungen, keine
Dependency-Änderung, keine Scope-Erweiterung.

---

## Decision Log

```
date: 2026-09-19
decision: Go für den Deploy von M3; R1 (medium) angenommen; Tab-Inhalt = Einstellungen + Open; M3 in einem Deploy; Live-Check einmal gesammelt nach M3
reason: Freigabe nach Prüfung des Apply-Outputs; Autonomie-Regelung "Discover+Apply autonom, vor Deploy Go"
decided-by: Projektleiter
refs: m3-02-apply-output.md (Open TBDs T1–T3, Risiko R1), 06-working-mode.md

date: 2026-09-19
decision: Fünf kleine Ergänzungen innerhalb des Designs (Titel-Fallback, Lang-Test über import.meta.glob statt Node-Typen, zwei Spalten im Leitfaden, kein innerHTML, applySettingInput fängt unerwartete Fehler); AC-M3-12 über Zeitstempel geprüft, weil M1 und M2 nicht committet sind
reason: Design-Ziele ("nie Ablehnung", Skriptprüfung der Belege, keine neue Dependency) erreichbar machen; der AC-Wortlaut setzte committeten Stand voraus
decided-by: agent
refs: m3-02-apply-output.md (Abschnitte 2, 6, 9; AC-M3-05, -09, -12)
```

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m3-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Code, Tests, Fixtures, `lang/`, `docs/` (Tabelle "Files Changed") | durable (Repo; nicht committet) |
| `v13/dist/module.js` | ephemeral (Build-Ausgabe, gitignoriert) |

---

## Next Step

Monitor M3: Acceptance gegen den Deploy-Output abgleichen, Regressionen und Restrisiken prüfen, den Live-Check vorbereiten (Pakete
mit `lang/en.json`, erwartete Anzeigen für den Projektleiter), Empfehlung schließen / Rework / nächster Milestone. Das Monitor folgt
nach Working Mode ohne Stopp.

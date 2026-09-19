```
artifact: discover-output
milestone: M12
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M12), Entscheidungen E7 (ein Repo je Modul), E8 (Stil der nativen Foundry-UI, gleiche Buttons, Schrift usw.), Antworten Q2 a (Kompatibilität mit Fremdmodulen bleibt Ziel), N4
- PDF-Aussagen P-G1 bis P-G3; Ergebnisse M5 (Flight Control schmal und generisch), M8 (Overlay), M9 bis M11 (Fenster und Einstiege)
- Foundry-v13-Types, Foundry-Release-Notes 13.341, `dadm/reference/source-analysis/` (Stack aus Phase 1: esbuild je Modul)

## Fakten

| # | Fakt | Quelle |
|---|---|---|
| u1 | In Foundry v13 wurden alle Anwendungen des Kerns auf `ApplicationV2` umgestellt | Release Notes 13.341 |
| u2 | Die Oberfläche von Foundry passt sich automatisch der Vorgabe des Betriebssystems oder Browsers an (hell oder dunkel), überschreibbar über eine Welt-Einstellung | Release Notes 13.341 |
| u3 | Die von Foundry gesteuerten UI-Elemente verwenden CSS-Schichten (`@layer`); **wo** Modul-Stile in die Schichten gehören, geben die Release Notes nicht an | Release Notes 13.341 |
| u4 | Bausteine für Fenster und Layout in den Types: `HandlebarsApplicationMixin` (Teile/Vorlagen), `DocumentSheetV2`, `DialogV2`, **`CategoryBrowser`** (abstrakte Zwei-Spalten-Anwendung, in der Einträge nach Kategorien gruppiert und gefiltert werden), `Tabs`, `ContextMenu`, `DragDrop`, `SearchFilter` | `client/applications/api/`, `client/applications/ux/` |
| u5 | Formularbausteine: eigene HTML-Elemente (`color-picker`, `document-tags`, `file-picker`, `multi-select`, `prose-mirror`, `range-picker`, `string-tags`, `hue-slider`, `document-embed`, `enriched-content`, `secret-block`, CodeMirror), Funktionen `createFormGroup`, `createSelectInput`, `createNumberInput`, `createTextInput` u. a. und Handlebars-Helfer (`numberInput`, `localize`, `editor`, `checked`, `disabled` …) | `client/applications/elements/`, `forms/fields.d.mts`, `handlebars.d.mts` |
| u6 | dnd5e verwendet für seine Blätter und den `CompendiumBrowser` eine eigene Basisklasse (`Application5e`) mit eigenem Aussehen; das ist nicht der Foundry-native Stil | `dnd5e/module/applications/compendium-browser.mjs:19` |
| u7 | Stack aus Phase 1: TypeScript, esbuild; jedes Modul bündelt seinen Code selbst | Archiv Research Phase 1, `package.json` |
| u8 | Ein gemeinsamer Laufzeit-Baustein für alle Module wäre über Flight Control (M5, Zugriff ab `setup`) oder über ein Modul mit `library: true` möglich (Library-Module laden vor allen anderen, M5 b3) | M5 |
| u9 | Änderungen an Dependencies (z. B. ein gemeinsames Paket) sind laut Safety Boundaries freigabepflichtig | `dadm/02-safety-boundaries.md` |
| u10 | Der Foundry-CSS-Quelltext selbst (Klassennamen, Variablen) liegt lokal nicht vor; die Wiki-Seite "ApplicationV2 Conversion Guide" lieferte beim Abruf keinen Text | Abruf 2026-09-19 |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert: Platzierung von Modul-Stilen in den CSS-Schichten; welche Foundry-CSS-Klassen und -Variablen stabil und dokumentiert sind; Verhalten mit Fenster-Modulen (z. B. PopOut, Q2 a) | medium | nein |
| R2 | Ein gemeinsames Aussehen bei sieben getrennten Repos driftet, wenn es nur auf Absprache beruht | medium | nein |
| A1 | "Stil der Foundry-UI" (P-G3) bedeutet den Kernstil von Foundry, nicht den Stil des dnd5e-Systems | low | nein (wird in Apply bestätigt gelesen) |

## Open Questions
Keine, die den Ablauf stoppen; nicht blockierender Punkt N18 in Apply.

## Next Step
Apply vergleicht die Wege zu einem einheitlichen Aussehen und bewertet die Risiken.

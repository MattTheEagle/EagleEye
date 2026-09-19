```
artifact: discover-output
milestone: M4
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Eagle-Eyrie-Anforderungen,
  inkl. Klärung: Klassen/Spezies/Subklassen/Backgrounds immer übertragen)
- Foundry-Typ-Fakten aus
  `foundry-vtt-reference-v13/types/src/foundry/client/documents/collections/compendium-collection.d.mts`,
  `.../compendium-packs.d.mts`, `.../abstract/directory-collection-mixin.d.mts`

## Rechercheergebnis

| Eyrie-Anforderung | Foundry-API-Baustein | Status |
|---|---|---|
| Eigene Compendien erstellen (wenn nicht vorhanden) | `CompendiumCollection.createCompendium(metadata, options)` (statische Methode) | belegt |
| Compendien durchsuchen (Searchbar) | `CompendiumCollection` erbt von `DirectoryCollectionMixin`, das bereits `searchMode` (`DIRECTORY_SEARCH_MODES`, u. a. Name- vs. Volltext-Suche) mitbringt — dieselbe Mechanik, die Foundrys eigene Compendium-Sidebar nutzt | belegt |
| Übergreifende Suche über mehrere/alle Compendien | `game.packs` (Collection aller `CompendiumCollection`-Instanzen) + `.index` (leichtgewichtiger Namens-/Metadaten-Index, ohne volle Dokumente zu laden) je Pack — Iteration + Filterung ist Anwendungslogik, keine fehlende API | belegt |
| Hotkey-Quicksearch ohne Library zu öffnen | `game.keybindings.register()` (Standard-API, unproblematisch) + eigene UI | belegt (Standard-Baustein, kein Sonderfall) |
| Dedup nach Namen | `.index`-Abgleich (enthält `name` per Default) vor dem Kopieren | belegt |
| Ausnahme Klassen/Spezies/Subklassen/Backgrounds (immer übertragen) | reine Anwendungslogik (Typ-Check vor Dedup-Prüfung) | belegt |
| Log nicht übertragener Einträge + Ein-Klick-Nachtrag | `CompendiumCollection#importDocument()` (kopiert ein Dokument in ein Compendium, nutzt intern `WorldCollection#fromCompendium` + `Document.createDocuments`) | belegt |

**Gesamtbild:** Alle für Eagle Eyrie benötigten Bausteine sind offizielle,
dokumentierte Foundry-Core-APIs. Es handelt sich um eine
**Kompositionsaufgabe** (bestehende Bausteine kombinieren), nicht um eine
Machbarkeitslücke.

## Performance-Einschätzung (Plan-Risiko)
`.index` ist bewusst leichtgewichtig (kein Laden voller Dokumente) — das ist
exakt der Mechanismus, mit dem Foundry selbst Compendium-Sidebars mit
tausenden Einträgen performant hält. Für die im Vision-Dokument beschriebene
Größenordnung (mehrere Compendia mit ggf. tausenden Einträgen, siehe
Phase-1-Erfahrung: 928 Spells, 3017 Items in einer einzelnen Compendium)
sollte reine Index-basierte Suche/Dedup unproblematisch sein. Volles Laden
aller Dokumente zum Vergleich (statt nur des Index) wäre der eigentliche
Risikofall — als Design-Hinweis für eine spätere Umsetzung festgehalten.

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | `CompendiumCollection.createCompendium` | Programmatische Compendium-Erstellung | gepinnte v13-Types | present |
| I2 | `.index` / `getIndex()` | Leichtgewichtiger Namens-/Metadaten-Index je Pack | gepinnte v13-Types | present |
| I3 | `DirectoryCollectionMixin.searchMode` | Bestehende Such-Infrastruktur (Name/Volltext) | gepinnte v13-Types | present |
| I4 | `CompendiumCollection#importDocument` | Dokument in Compendium kopieren | gepinnte v13-Types | present |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Volles Laden aller Dokumente (statt nur Index) für Vergleich/Anzeige wäre der eigentliche Performance-Risikofall — Design-Hinweis für spätere Umsetzung, kein Blocker für die Machbarkeitsfrage dieser Phase | low | nein |

## Open Questions
Keine.

## Next Step
Apply fasst die Machbarkeitsbewertung zusammen (bereits eindeutig positiv)
und bewertet kurz die API-Umwandlung-Relevanz (Normalisierung
unterschiedlicher Quellformate) aus dem Milestone Plan.

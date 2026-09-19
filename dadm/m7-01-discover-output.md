```
artifact: discover-output
milestone: M7
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan.md` (M7), Antworten aus `dadm/m4-05-human-decision-output.md` (Q3 a, Q4 a, Q5 a, Q6 a, Q7 a)
- Phase-2-Ergebnis zu Eyrie (Compendium-API, Index-Suche), PDF-Aussagen P-L1 bis P-L8
- Foundry-v13-Types (`foundry-vtt-reference-v13`), dnd5e Release 5.3.3 (Commit `965ad2d`)

## Fakten

| # | Fakt | Quelle |
|---|---|---|
| g1 | `CompendiumCollection.createCompendium({type, label, name?})` legt ein neues Compendium an; `deleteCompendium()` ist laut Kommentar auf **World-Ebene und für Spielleiter** beschränkt. Ein von Modulen mitgeliefertes Compendium kann so nicht entstehen; angelegt werden Welt-Compendien | `client/documents/collections/compendium-collection.d.mts:259–291` |
| g2 | `type` eines Compendiums ist ein Foundry-Dokumenttyp: `Actor, Adventure, Cards, Item, JournalEntry, Macro, Playlist, RollTable, Scene`. "Eagle Classes" ist kein eigener Dokumenttyp, sondern Items vom dnd5e-Untertyp `class` | `common/constants.d.mts:336–347` |
| g3 | Die Metadaten `flags` eines Compendiums sind "created by the server, but always empty and no way to change it": Ein Eagle-Compendium ist daher über Name/Label oder eine eigene Liste erkennbar, nicht über ein Flag am Compendium | `compendium-collection.d.mts:351` |
| g4 | `importDocument(document, options)` kopiert ein Dokument in ein Compendium (Optionen der Methode `toCompendium`); `getIndex(options)` lädt den Index, `indexFields` besteht aus den Index-Feldern des Dokumenttyps plus Konfiguration | `compendium-collection.d.mts:106–130, 193` |
| g5 | dnd5e legt an Items ein Feld `system.source.rules` an (`SourceField`, `StringField`); **Anfangswert = Einstellung `rulesVersion` der aktuellen Welt** ("modern" → "2024", sonst "2014"), Standardeinstellung "modern" | `module/data/shared/source-field.mjs:15–21`, `module/settings.mjs:70–76` |
| g6 | `SourceField` steckt in Items (Vorlage `item-description`), NPC- und Vehicle-Actors. **Nicht** in Charakter-, Encounter- und Gruppen-Actors; die Zauberlisten-Journalseiten schalten `rules` ausdrücklich ab | `module/data/item/templates/item-description.mjs:26`, `actor/npc.mjs`, `actor/vehicle.mjs`, `journal/spells.mjs:42` |
| g7 | Advancement "Item Grant" speichert seine Items als UUID-Liste (`items[].uuid`); die Zauberlisten-Registry bildet Zauber-UUIDs auf Journalseiten ab | `module/data/advancement/item-grant.mjs:29`, `module/registry.mjs:329, 572` |
| g8 | Container-Items haben Inhalte; dnd5e kopiert sie mit `Item5e.createWithContents(items, {transformAll, keepId})` und `toCompendium`, mit `keepId: true` | `module/documents/item.mjs:1278`, `module/applications/item/item-compendium.mjs:54–62` |
| g9 | Phase-2-Befund: Compendium-Erstellung, indexbasierte Suche/Dedup ohne vollständiges Laden und Dokumentkopie sind offizielle APIs | Projektplan Planungsphase 2, M4 |
| g10 | Aufträge, die Compendien anlegen oder befüllen, sind Spielleiter-Operationen; Q3 a legt sie in Flight Control | Antwort Q3, M5 (b6) |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (Live-Test nötig): Laufzeit und Speicherbedarf beim Kopieren mehrerer tausend Einträge; Verhalten von `getIndex` mit zusätzlichen Feldern bei sehr großen Compendien | medium | nein |
| R2 | Für Kopien mit zugehörigen Bild- und Sounddateien gilt: Dateien werden nicht mitkopiert, nur ihre Pfade | low | nein |
| A1 | Quelle für das Wort "Version" ist `system.source.rules` (E1: dnd5e-5.x-Linie); ob das die vom Projektleiter gemeinte Unterscheidung ist, ist naheliegend, aber nicht ausdrücklich festgehalten | low | nein |

## Open Questions
Keine, die den Ablauf stoppen. Aufgenommen in die Sammlung nicht blockierender Punkte: N6 bis N8 (siehe Apply).

## Next Step
Apply bewertet Anlegen, Version, Einmaligkeit, Kopieren und die Verweise zwischen Einträgen.

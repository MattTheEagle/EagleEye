```
artifact: discover-output
milestone: M10
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M10), Antworten Q8 c (Import zurückgestellt), Q9 (sofort angelegt, Welt-Dokument und Library-Eintrag), Q10 c (Kopfzeile und Verzeichnis-Kontextmenü), Q3 a, N4, N5, N6
- Ergebnisse M5 (Anfragenkanal, Restdaten erhalten), M6 (bedingte Effekte, Weg A und Filterformat), M7 (Library-Compendien), M8a (Umschreiben von Verweisen), M9 (Hook für Kopfzeilen)
- PDF-Aussagen P-HB1 bis P-HB6, `dadm/reference/source-analysis/homebrew-importers.md` und `techniques-catalog.md` (Activity-Rezepte)
- dnd5e 5.3.3 (Commit `965ad2d`), Foundry-v13-Types

## Fakten

| # | Fakt | Quelle |
|---|---|---|
| o1 | Actor-Typen in dnd5e: `character`, `encounter`, `group`, `npc`, `vehicle` (5, deckt sich mit der PDF-Liste). Item-Typen laut Manifest: `weapon, equipment, consumable, tool, loot, race, background, class, subclass, spell, feat, container, backpack, facility` (14). Die PDF-Liste hat 14 Einträge; 13 lassen sich zuordnen (Feature = `feat`, Species = `race`, Container = `container` usw.), **"Item" hat keinen dnd5e-Typ**; `backpack` steht im Manifest, seine Bedeutung wurde nicht geprüft | `dnd5e/system.json` (`documentTypes`), PDF |
| o2 | Items werden über Daten erzeugt; Mechanik liegt in `system.activities.<id>` (Rezepte für Angriff, Rettungswurf, Schaden, Zauber wirken, Nutzungen, Zustände) | `dadm/reference/source-analysis/techniques-catalog.md` §2 |
| o3 | Jedes Dokument ist ein `DataModel` mit `validate()`; die Fehlerliste (`validationFailures`, mit Feldern) ist abrufbar | `client`/`common/abstract/data.d.mts:98, 177` |
| o4 | Das Regelwerk-Feld `system.source.rules` erhält ohne Angabe die Welteinstellung `rulesVersion` (Standard "modern" = 2024) | `module/data/shared/source-field.mjs:20–21`, `module/settings.mjs:70–76` |
| o5 | Rolltabellen sind Foundry-Kern (`RollTable`); Ergebnisse können auf Dokumente verweisen (`documentUuid`), im dnd5e-Inhalt 151-mal | M8a, `common/documents/table-result.d.mts` |
| o6 | Ein eingebauter Mechanismus, der ein Welt-Dokument und einen Compendium-Eintrag laufend abgleicht, ist in den Types nicht zu finden. Die Herkunftsangabe `_stats.compendiumSource` hält nur fest, woraus ein Dokument entstanden ist | Suche in den Types, M8a (s16) |
| o7 | Einstiegspunkte: Kopfzeile von Dokumentblättern über `getHeaderControls…` (M9 c1); Verzeichnis-Kontextmenüs über Hooks der Form `get{Anwendungsname}ContextOptions`. Der genaue Name je Verzeichnis (Items, Actors, Rolltabellen) ist nicht einzeln verifiziert | `client/hooks.d.mts:79–93, 1058–1076` |
| o8 | Jede Änderung an einem Dokument ist ein Datenbankvorgang und löst die Standard-Hooks `update…`/`create…` aus, auf die auch andere Module reagieren | `client/hooks.d.mts:109` |
| o9 | Der Phase-2-Befund zum strukturierten Erzeugen: das Schema von Activities/DamageData deckt Schaden, Typ und "magisch" nativ ab; die Bedingung klärt M6 (Weg A + Filterformat) | Projektplan Planungsphase 2, M2; M6 |
| o10 | Die Library legt Welt-Compendien je Untertyp an, GM-Vorgang über Flight Control (M7); Verweise werden mit einer Abbildungstabelle umgeschrieben (M8a) | M7, M8a |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (Live-Test mit Freigabe): Auswirkungen häufiger Schreibvorgänge (Live-Bearbeitung) auf andere Module, die auf `update`-Hooks reagieren; Namen der Kontextmenü-Hooks der Verzeichnisse | medium | nein |
| R2 | Der Umfang der Editoren (19 Objektarten) ist der größte Aufwandsfaktor; eine belastbare Aufwandsschätzung je Art ist erst mit dem Editor-Design (Umsetzungsphase) möglich, hier nur eine Rangfolge nach Komplexität der Datenmodelle | medium | nein |
| A1 | Die Modul-ID des Homebrew-Moduls ist noch nicht festgelegt (E5); Angaben zu Flags gelten unabhängig davon | info | nein |

## Open Questions
Keine, die den Ablauf stoppen; nicht blockierende Punkte N14 bis N16 in Apply.

## Next Step
Apply bewertet Objektarten, Ablauf (Anlegen, Live-Bearbeitung, Welt ↔ Library) und "Edit with".

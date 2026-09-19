```
artifact: discover-output
milestone: M8a
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M8a), Antwort N6 (jede Verlinkung wird umgeschrieben), Q4–Q7, N7, N8
- Ergebnis M7 (`dadm/m7-02-apply-output.md`, Verweise als Beispiele)
- dnd5e Release 5.3.3 (Commit `965ad2d`): Datenmodelle (`module/data/**`) und **die Quelldateien der mitgelieferten Compendien** (`packs/_source`, 4.674 YAML-Dokumente)
- Foundry-v13-Types

## Methode
1. **Schema-Inventar:** Suche in allen dnd5e-Datenmodellen nach Feldern, die Dokumente referenzieren (`DocumentUUIDField`, `ForeignDocumentField`, `LocalDocumentField`, `DocumentIdField`, Felder mit `uuid` im Namen, `HTMLField`).
2. **Empirische Auswertung:** Alle 4.674 YAML-Dokumente der mitgelieferten Compendien wurden geladen und Wert für Wert nach Verweismustern durchsucht (vollständige Compendium-UUIDs, `@UUID[`, `@Embed[`, `@Compendium[`, `@Item[…]`, `data-*-uuid`, `&Reference[`, `activity=`), gruppiert nach normalisiertem Feldpfad. Das findet auch Stellen, die das Schema-Inventar übersieht. Hilfsskripte: `dadm/reference/source-analysis/scripts/scan-refs.py`, `scan-refs-2.py` (rein lesend, PyYAML).
3. Grenze: Ausgewertet ist nur der Inhalt, den dnd5e selbst mitliefert. Inhalte anderer Quellen (Importer, Homebrew, Drittmodule) wurden nicht ausgewertet.

## Fakten I: Schema-Inventar (Felder, die andere Dokumente referenzieren)

| # | Dokument / Feld | Art | Quelle |
|---|---|---|---|
| s1 | Item, `system.advancement[].configuration.items[].uuid` (Item Grant) | UUID-Zeichenkette | `module/data/advancement/item-grant.mjs:29` |
| s2 | Item, `…configuration.pool[].uuid` (Item Choice) | UUID-Zeichenkette | `item-choice.mjs:36` |
| s3 | Item, `…configuration.recommendation` (Ability Score Improvement) | UUID (Item) | `ability-score-improvement.mjs:32` |
| s4 | Item, `system.activities.<id>.spell.uuid` (Cast) | UUID | `module/data/activity/cast-data.mjs:31` |
| s5 | Item, `system.activities.<id>.profiles[].uuid` (Summon, Transform) | UUID (Actor) | `summon-data.mjs:49`, `transform-data.mjs:35` |
| s6 | Item, `system.activities.<id>.effects[].riders.item[]` (Enchant) | UUID (Item) | `enchant-data.mjs:26` |
| s7 | Item, `system.startingEquipment[].key`, wenn `type` = `linked` | UUID | `module/data/item/templates/_types.mjs:93` |
| s8 | Facility-Item, `system.*.item` und Actor-UUID-Listen (Belegung) | UUID | `module/data/item/facility.mjs:41–69` |
| s9 | Journalseite Zauberliste, `system.spells` (Menge von UUID-Zeichenketten), `unlinkedSpells[].source.uuid` | UUID | `module/data/journal/spells.mjs:34–42` |
| s10 | Journalseite Klasse/Unterklasse, `system.item` | UUID | `module/data/journal/class.mjs:22`, `subclass.mjs:21` |
| s11 | Actor Encounter `system.members[].uuid`; Vehicle `crew/passengers`; Gruppe `members[].actor`, `primaryVehicle` | UUID bzw. Welt-Actor-ID (Zustand) | `actor/encounter.mjs:20`, `vehicle.mjs:102–113`, `group.mjs:34–36` |
| s12 | Physische Items `system.container` (Item-ID im selben Bestand); Actor `details.race`, `details.background`, `details.originalClass` (Item-IDs) | lokale ID | `item/templates/physical-item.mjs:20`, `actor/templates/details.mjs:37`, `actor/character.mjs:89` |
| s13 | Lokale IDs innerhalb eines Dokuments: Activity-, Effekt-, Advancement-, Equipment-Entry-IDs; `forward.activity.id`; `riders.activity/effect`; `startingEquipment[].group` | lokale ID | `activity/*.mjs`, `advancement/base-advancement.mjs:31`, `starting-equipment.mjs:167` |
| s14 | HTML-Felder (Beschreibungen, Journaltexte, Biografie) in 10 Datenmodell-Dateien | Text mit Links | `module/data/**` (`HTMLField`) |
| s15 | Zauberlisten-Registry: Standardlisten stehen als eingefrorene UUID-Liste in der Konfiguration; weitere Listen werden zur Laufzeit mit `register(uuid)` angemeldet; Listen mit gleicher Art und Kennung werden zusammengeführt | Laufzeit-Verweis | `module/config.mjs:3170`, `module/registry.mjs:419–453` |
| s16 | Herkunft: `_stats.compendiumSource`, `_stats.duplicateSource` (Foundry) und die Legacy-Flags `flags.core.sourceId`, `flags.dnd5e.sourceId`. `toCompendium` löscht die `_stats`-Angaben standardmäßig (`clearSource: true`), **nicht** die Legacy-Flags. dnd5e wertet `_stats.compendiumSource ?? flags.dnd5e.sourceId` beim Unterklassen-Advancement aus | Herkunft | `client-document.d.mts:545–551`, `module/documents/advancement/subclass.mjs:67–89` |

## Fakten II: Empirische Auswertung der mitgelieferten dnd5e-Compendien

Umfang: **4.674 Dokumente**; davon **1.732 (37 %)** enthalten mindestens einen vollständigen Compendium-UUID-Verweis.

| Muster | Treffer |
|---|---|
| Vollständige Compendium-UUID als Zeichenkette (in Struktur- und Textfeldern) | 25.920 |
| `@UUID[…]` in Texten | 6.941 |
| `@Embed[…]` in Texten | 2.085 |
| `[[/… activity=…]]` (relative Activity-ID) | 161 |
| `&Reference[…]` (Regelschlüssel, keine UUID) | 25 |
| Relative Links `@UUID[.id#anker]` / `@Embed[.id…]` (auf Nachbar-/Unterdokumente) | 395 |
| Welt-absolute Links (`@UUID[Item.id]` ohne `Compendium.`) | 0 |
| `@Compendium[…]`, `@Item[…]` (Altformate) | 0 |
| Verweise auf Pakete außerhalb von dnd5e (Monster Manual 1.580, Players Handbook 11, Dungeon Master's Guide 1) | 1.592 |

Feldpfade mit den meisten Verweisen (Anzahl Treffer, jeweils normalisiert; Auswahl):

| Treffer | Feldpfad | Bemerkung |
|---|---|---|
| 5.054 (+469, +176) | `items[]._stats.compendiumSource` (eingebettete Items in Actors, Effekte) | Herkunft, s16 |
| 3.156 + 2.895 (`@UUID`) | `items[].system.description.value` | Text in eingebetteten Items |
| 2.540 (+1.841 `@UUID`, +1.089 `@Embed`) | `pages[].text.content` | Journalseiten (Regeln) |
| 2.381 | `pages[].system.spells[]` | Zauberlisten, s9 |
| 2.178 (+672) | `items[].effects[].origin`, `effects[].origin` | **Effekt-Herkunft: die UUID des Items selbst**; von der Schema-Suche nicht erfasst |
| 2.064 (+1.947 `@UUID`) | `system.description.value` | Text in Items |
| 1.134 + 299 | `…advancement.<id>.configuration.items[].uuid` | Item Grant, s1 |
| 1.038 | `items[].flags.dnd5e.sourceId` | Legacy-Herkunft, s16 |
| 811 (+72, +53) | `…advancement.<id>.value.added.<id>` | **Advancement-Zustand:** abgebildet Item-ID → UUID (Actors mit Fortschritt) |
| 557 + 352 | `…activities.<id>.spell.uuid` | Cast, s4 |
| 512 + 171 | `system.startingEquipment[].key` | s7 |
| 326 + 75 | `…configuration.pool[].uuid` | Item Choice, s2 |
| 274 + 192 | `…activities.<id>.profiles[].uuid` | Summon/Transform, s5 |
| 151 (+165 `@UUID`) | `results[].documentUuid`, `results[].description` | **Rolltabellen:** Foundry-Kernfeld, von der Schema-Suche nicht erfasst |
| 144 (+118 `@Embed`) | `effects[].changes[].value` | **Effekt-Änderungswerte mit UUIDs** |
| 103 | `…activities.<id>.consumption.targets[].target` | **Verbrauchsziel als UUID** (StringField, von der Schema-Suche nicht erfasst) |
| 48 | `…configuration.recommendation` | s3 |
| 36 | `pages[].system.item` | s10 |

Zielverteilung: Verweise aus Actors gehen vor allem auf Zauber (4.898), Ausrüstung (3.061) und Klassen (2.929); Regeln und Inhaltsjournale verweisen auf Zauber und Ausrüstung; Klassen verweisen aufeinander (431).

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Die Auswertung deckt nur dnd5e-eigene Inhalte ab; Verweisformen in Importer-, Homebrew- und Drittmodul-Inhalten sind offen (z. B. Verweise über getrennte Felder für Paket und ID statt einer UUID-Zeichenkette) | medium | nein |
| R2 | Nicht verifiziert (Live-Test nötig): ob `toCompendium` `_stats` auch in eingebetteten Dokumenten löscht; Verhalten von `createDocuments` mit `keepId` beim Kopieren aus fremden Compendien in größerer Menge (dnd5e nutzt `keepId: true` im eigenen Compendium-Import) | medium | nein |
| A1 | Dateien im Verzeichnis `packs/_source` entsprechen dem Inhalt der Compendien von Release 5.3.3 | info | nein |

## Open Questions
Keine, die den Ablauf stoppen. Zwei nicht blockierende Punkte (N10, N11) stehen in Apply.

## Next Step
Apply ordnet die Verweisarten ein, bewertet eine Umschreibestrategie und beschreibt die Folgen.

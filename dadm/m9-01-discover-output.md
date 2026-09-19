```
artifact: discover-output
milestone: M9
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M9), Antworten Q3 a, Q11 a, N1, N4, N6; Ergebnisse M5 (Anfragenkanal, Restdaten), M7, M8a
- Phase-2-Ergebnis zu Egg (`dadm/eagle-modules-projektplan.md`, dnd5e-Advancement-System als Engine)
- PDF-Aussagen P-CE1 bis P-CE6, Vision V-EG1 bis V-EG6
- dnd5e Release 5.3.3 (Commit `965ad2d`, Quelltext und `packs/_source`), Foundry-v13-Types

## Fakten

| # | Fakt | Quelle |
|---|---|---|
| c1 | Header-Steuerelemente lassen sich über den Hook `getHeaderControls{Klassenname}` ergänzen; jede Klasse der Vererbungskette löst ihn aus (z. B. `getHeaderControlsApplicationV2`) | `client/hooks.d.mts:79, 1058–1069` |
| c2 | Das dnd5e-Charakterblatt ist `CharacterActorSheet`, registriert für den Actor-Typ `character`; eigene Header-Steuerelemente definiert dnd5e in den Fensteroptionen | `dnd5e.mjs:153–157`, `module/applications/actor/api/base-actor-sheet.mjs:83` |
| c3 | Actors, Items und Journale anzulegen ist standardmäßig Assistenten-Rolle (Nutzungsrechte je Modul und Nutzer werden nach N1 später festgelegt) | `common/constants.d.mts:1295–1305`, M5 (b6) |
| c4 | `AdvancementManager` bietet `forNewItem`, `forLevelChange`, `forModifyChoices`, `forDeletedItem`, `forNewAdvancement`, `forDeletedAdvancement` | `module/applications/advancement/advancement-manager.mjs:194–381` |
| c5 | Der Manager arbeitet auf einem **Klon** des Actors und schreibt am Ende in **einem** Schritt (`#complete`) alle Änderungen (Items anlegen, ändern, löschen). Schritte können `automatic` sein; sonst öffnet `render()` einen Dialog mit Einzelschritten. Optionen `automaticApplication`; Hooks `dnd5e.preAdvancementManagerRender` und `dnd5e.preAdvancementManagerComplete` | `advancement-manager.mjs:40–52, 526–566, 880–900` |
| c6 | Aufgerufen wird der Manager im dnd5e-Quelltext nur von den **Blättern** (Ablegen eines Items, Stufenänderung), nicht von Dokumentmethoden | `base-actor-sheet.mjs:1224, 1905`, `character-sheet.mjs:1259` |
| c7 | Punktekauf und Standardwerte gibt es in dnd5e nicht (Suche in `module/` und `lang/en.json` ohne Treffer) | Suche im Klon |
| c8 | `AbilityScoreImprovement` addiert die Zuweisung direkt auf `system.abilities.<k>.value` und speichert sie zusätzlich als `value.assignments` in den Advancement-Daten | `module/documents/advancement/ability-score-improvement.mjs:188–203` |
| c9 | Spezies: In 2014 sind Unterarten **eigene, gleichrangige** Spezies-Items (z. B. "Hill Dwarf" mit Item Grant, Ability Score Improvement, Size, Traits); in 2024 ebenso je Linie (`elf-drow`, `elf-high`, `elf-wood`, `gnome-forest`, `gnome-rock`); "Human" nutzt ein `ItemChoice`-Advancement ("Versatile"). Es gibt **kein** Feld, das Art und Unterart verknüpft | `packs/_source/races`, `packs/_source/origins24/species` |
| c10 | Zauberanzahl: 2024-Wizard hat `ScaleValue`-Advancements "Cantrips Known" und `max-prepared`, `spellcasting.preparation.formula = @scale.wizard.max-prepared`; 2014-Wizard hat `formula = @abilities.int.mod + @classes.wizard.levels` und `cantrips-known`; 2014-Bard und -Sorcerer haben `cantrips-known` und `spells-known` | `packs/_source/classes24/wizard/wizard.yml`, `packs/_source/classes/*/wizard.yml, bard.yml, sorcerer.yml` |
| c11 | Klassen-Zauberlisten liefert `dnd5e.registry.spellLists.forType("class", identifier)`; Listen gleicher Art und Kennung werden zusammengeführt (Original + Library, M8a) | `module/registry.mjs:405–453` |
| c12 | Ausgangsausrüstung liegt als Daten vor (`startingEquipment`: Gruppen AND/OR, `linked` mit Item-UUID, Kategorien, Währung über `wealth`). Oberflächen dafür gibt es nur zum Bearbeiten (`starting-equipment-config.mjs`) und Anzeigen (`class-page-sheet.mjs`); im Quelltext der Actor-/Dokumentlogik wird sie **nicht** auf Charaktere angewendet | `module/data/item/templates/starting-equipment.mjs`, `module/applications/item/config/`, `module/applications/journal/class-page-sheet.mjs`, Suche in `module/documents` |
| c13 | Änderungen an Dokumenten lösen die Standard-Hooks `update{Typ}`, `create{Typ}`, `delete{Typ}` aus (z. B. `updateActor`, `createItem`); geöffnete Blätter zeichnen sich bei Datenänderungen neu | `client/hooks.d.mts:109` |
| c14 | Bestehende Charaktere: Klassen als eingebettete Items mit `system.levels`, Species/Hintergrund/Ursprungsklasse als lokale Item-IDs in `system.details`; Herkunft über `_stats.compendiumSource`; Advancement-Zustand in den Items (`system.advancement[].value`) | `module/data/actor/templates/details.mjs:37`, `character.mjs:89`, M8a |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (Live-Test mit Freigabe): Verhalten des Advancement-Dialogs, wenn er aus einem eigenen Fenster geöffnet wird; Verhalten bei gleichzeitig geöffnetem Blatt und Editor | medium | nein |
| R2 | Punktekauf (27 Punkte, Kostentabelle) und Standardwerte (15, 14, 13, 12, 10, 8) sind aus den SRD-Regeln bekannt, nicht aus dem dnd5e-Code belegt; ob 2014 und 2024 hier identisch sind, ist nicht aus den Quellen geprüft | low | nein |
| R3 | Regeln, die nur im Fließtext stehen (z. B. Zauberbuch des Wizard, Zauber von Unterklassen), sind in den Daten nicht abgebildet | medium | nein |

## Open Questions
Keine, die den Ablauf stoppen; nicht blockierende Punkte N12 und N13 in Apply.

## Next Step
Apply bewertet Startwege, Live-Abgleich und die sechs Registerkarten.

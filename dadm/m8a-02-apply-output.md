```
artifact: apply-output
milestone: M8a
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m8a-01-discover-output.md` (Schema-Inventar s1–s16, empirische Auswertung von 4.674 Dokumenten)

## Einordnung der Verweisarten

| Kat. | Verweisart | Fundstellen | Umschreibbar? |
|---|---|---|---|
| **V1** | Vollständige Compendium-UUID als Zeichenkette in **Strukturfeldern** | Item Grant, Item Choice, Cast, Summon/Transform, Enchant-Riders, Startausrüstung (`linked`), Zauberlisten, Klassen-Journalseiten, Rolltabellen (`documentUuid`), Verbrauchsziele, Effekt-**Herkunft** (`origin`), Effekt-Änderungswerte, Advancement-Werte (`value.added`) | **Ja, generisch.** Eine schemaunabhängige Ersetzung aller Zeichenketten, die dem UUID-Muster entsprechen, über eine Abbildungstabelle Quelle → Library-Eintrag findet alle Felder, auch die, die das Schema-Inventar nicht kannte (`origin`, `documentUuid`, Verbrauchsziele, Änderungswerte) und unbekannte Felder von Drittmodulen, sofern dort die volle UUID steht |
| **V2** | Links in **Text** (`@UUID[…]{Label}`, `@Embed[…]`, rohe UUID im Fließtext) | Beschreibungen, Journaltexte, Biografien, Tabellenbeschreibungen | **Ja**, gleiche Ersetzung. Label und Anker (`#…`) bleiben unverändert |
| **V3** | **Relative und lokale** Verweise | `@UUID[.id#anker]` (395), `activity=…` in Enrichern (161), `system.container`, Activity-/Effekt-/Advancement-IDs | **Kein Umschreiben nötig, solange die IDs erhalten bleiben** (`keepId`). Bekommt ein Eintrag eine neue ID (erzwungenes Duplikat, ID-Kollision), muss die ID innerhalb des Dokuments konsistent ersetzt werden |
| **V4** | **Herkunftsangaben** | `_stats.compendiumSource` (5.699 in eingebetteten Items/Effekten), `flags.dnd5e.sourceId` (1.038), `flags.core.sourceId` | Keine Funktionsverweise, aber `sourceId` wird beim Unterklassen-Advancement ausgewertet (s16). Foundry löscht `_stats` beim Aufbereiten standardmäßig, die Legacy-Flags nicht. **Entscheidung nötig (N10)** |
| **V5** | **Schlüssel statt UUID** (`&Reference[…]`, Regelseiten über `CONFIG.DND5E.rules`) | 25 im Inhalt | Keine gespeicherte UUID; Auflösung im System. Nicht Teil der Umschreibung |
| **V6** | **Laufzeit-Registrierung** | Zauberlisten-Registry (s15) | Nicht umschreibbar, sondern anzumelden: Library-Zauberlisten müssen mit `register(uuid)` registriert werden. Die Originale bleiben über die eingefrorene Standardliste registriert; Listen gleicher Art und Kennung werden zusammengeführt (Original- und Library-Zauber landen in derselben Liste) |
| **V7** | **Zustand und Weltverweise** | Gruppen, Fahrzeuge, Encounter, Facility-Belegung, Actor-UUID-Listen (s8, s11) | Gehört nicht in die Library; `toCompendium` löscht Zustandsfelder standardmäßig (`clearState`). Welt-absolute Links kommen im dnd5e-Inhalt nicht vor (0) |
| **V8** | **Ziele außerhalb der Library** | 1.592 Verweise auf Foundry-Premium-Module (Monster Manual, PHB, DMG) | Nur umschreibbar, wenn das Ziel mitkopiert wurde. Ist das Paket nicht installiert, ist das Ziel unauflösbar |

## Umschreibestrategie (Bewertung)

1. **Zwei Durchgänge.** Durchgang 1: Alle zu kopierenden Quelleinträge bestimmen (Duplikate nach Q6/N7/N8 ausscheiden), jedem Eintrag seine Ziel-UUID in der Library zuweisen und die **Abbildungstabelle** aufbauen. Durchgang 2: Jeden Eintrag durchlaufen, alle Zeichenketten nach dem UUID-Muster ersetzen und schreiben. So sind Verweise in beliebiger Richtung und Zyklen (Klasse ↔ Merkmal) kein Sonderfall, weil alle Ziel-UUIDs vor dem Schreiben feststehen.
2. **IDs erhalten (`keepId`).** dnd5e nutzt das beim eigenen Compendium-Import ebenfalls. Damit ändert sich bei der Abbildung nur der Compendium-Name; der Anhang für eingebettete Dokumente (`.ActiveEffect.<id>`) und Anker (`#…`) bleiben. Neue IDs entstehen nur für erzwungene Duplikate.
3. **Selbstverweise.** Effekt-`origin` verweist auf das Item selbst. Bei einem erzwungenen Duplikat ("Name (Duplicate)") muss dieser Verweis auf das **Duplikat** zeigen, nicht auf den Haupteintrag; Verweise **anderer** Einträge auf die Quelle zeigen auf den Haupteintrag.
4. **Abbildung bei Duplikaten (Q6/N8).** Wird ein Quelleintrag als Duplikat übersprungen, zeigen alle Verweise auf ihn auf den bereits vorhandenen Library-Eintrag desselben Namens und derselben Version.
5. **Version (N7).** Ziel-UUID richtet sich nach der Version des **Ziels**. Ein 2024-Eintrag, der auf einen 2014-Eintrag verweist, bekommt einen Verweis auf dessen Library-Kopie in 2014.
6. **Abhängigkeitsabschluss.** 37 % der Dokumente enthalten Compendium-Verweise; Actors verweisen vor allem auf Zauber, Ausrüstung und Klassen (Discover). Beim Kopieren **aller** Nicht-Eagle-Compendien schließt sich der Bestand von selbst. Bei **Teilauswahl** (Q7: "einzelne") entstehen Verweise auf nicht kopierte Ziele. Dann gibt es zwei Wege: Abhängigkeiten automatisch mitkopieren (Bestand kann stark wachsen) oder die Verweise stehen lassen und melden (N11).
7. **Unauflösbare Ziele.** Verweise auf nicht vorhandene Pakete bleiben stehen und werden protokolliert; sie können nicht in die Library gezogen werden (V8).
8. **Prüfbericht.** Nach dem Kopieren durchläuft ein Prüfer alle Library-Dokumente und meldet jeden Verweis, der nicht in einem Eagle Compendium endet (offen, extern, unauflösbar). Die Hilfsskripte dieser Analyse sind im Kern genau dieser Prüfer und belegen, dass er in einem Durchgang über 4.674 Dokumente arbeitet.

## Verdict
**Machbar.** Alle 16 im Schema gefundenen Stellen und die zusätzlich empirisch gefundenen (Effekt-`origin`, Rolltabellen-`documentUuid`, Verbrauchsziele, Effekt-Änderungswerte, Advancement-Werte) fallen unter zwei generische Regeln (UUID-Zeichenketten ersetzen; lokale IDs erhalten). Restaufwand und Restrisiko liegen bei
- **Vollständigkeit für fremde Inhalte** (R1): Verweisformen ohne volle UUID-Zeichenkette werden nicht gefunden;
- **Abhängigkeitsabschluss und unauflösbaren Zielen** (Umfang, Regel bei Teilauswahl);
- **Zauberlisten-Registry**: eine Library-Liste ergänzt die Original-Liste, ersetzt sie nicht; Character Edit muss die Listen auf Library-Zauber einschränken (M9);
- **Herkunftsangaben** (N10).

Risiko: **mittel** (statt mittel-hoch nach M7).

## Auswirkungen
| Bereich | Wirkung |
|---|---|
| Kopiervorgang (M7) | Zwei Durchgänge, `keepId`, Abbildungstabelle, Prüfbericht; Regel für Verweise auf nicht kopierte oder externe Ziele |
| Einmaligkeit | Duplikate werden auf den vorhandenen Eintrag abgebildet; erzwungene Duplikate bekommen neue IDs und eigene Selbstverweise |
| Character Edit (M9) | Klassen, Spezies, Hintergründe vergeben ihre Merkmale über Library-UUIDs; Startausrüstung (`linked`) zeigt auf Library-Ausrüstung. Die **Zauberliste** eines Charakters ergibt sich aus einer zusammengeführten Liste (Original + Library) und muss auf Library-Zauber gefiltert werden. Bereits eingebettete Items tragen Herkunft (`compendiumSource`); neu aus der Library hinzugefügte Items tragen automatisch Library-Herkunft |
| Homebrew (M10) | In der Library entstehende Objekte verweisen auf Library-UUIDs. Nach Q9 entsteht jedes Objekt zugleich als Welt-Dokument und Library-Eintrag; für Verweise **innerhalb** solcher Objekte braucht es dieselbe Abbildung (Welt → Library) und beim späteren Abgleich in beide Richtungen |

## Nicht blockierende offene Punkte
| # | Punkt | Auswirkung |
|---|---|---|
| N10 | Herkunftsangaben (`_stats.compendiumSource`, `flags.dnd5e.sourceId`, `flags.core.sourceId`): Sollen sie in Library-Kopien **entfernt**, **auf die Library-Kopie umgeschrieben** oder **auf die ursprüngliche Quelle belassen** werden (Nachvollziehbarkeit der Herkunft)? Verweise auf die Originale widersprechen der strengen Lesart von N6 | Regel im Kopiervorgang, Unterklassen-Advancement |
| N11 | Bei **Teilauswahl** einzelner Compendien (Q7) und bei **unauflösbaren** Zielen (Premium-Module nicht installiert): Abhängigkeiten automatisch mitkopieren oder Verweise stehen lassen und melden? | Bestandsgröße, Vollständigkeit der Library |

## Acceptance Criteria
- AC-M8a-01: Das Inventar deckt alle Dokumenttypen ab, die die Library aufnimmt (Items, Actors, Journale, Rolltabellen), aus Schema und aus dem realen Inhalt
- AC-M8a-02: Jede Verweisart hat ein Verdict mit Quellen; Nicht-Belegtes ist gekennzeichnet
- AC-M8a-03: Auswirkungen auf Kopiervorgang, Einmaligkeit, Character Edit und Homebrew sind beschrieben
- AC-M8a-04: Ergebnis, N10 und N11 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Fremde Verweisformen (nicht als UUID-Zeichenkette) werden von der generischen Ersetzung nicht erfasst; Auswertung nur an dnd5e-Inhalt | medium | nein |
| R2 | Nicht verifiziert (Live-Test mit Freigabe): `toCompendium` auf eingebettete `_stats`, `keepId` bei größeren Mengen | medium | nein |
| R3 | Zauberlisten-Zusammenführung von Original und Library kann in Character Edit zu doppelten Zaubern führen, wenn nicht gefiltert wird | medium | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

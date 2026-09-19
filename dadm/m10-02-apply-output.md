```
artifact: apply-output
milestone: M10
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m10-01-discover-output.md` (Fakten o1–o10, Risiken R1–R2)

## Bewertung

### Objektarten — **machbar; Aufwand sehr unterschiedlich**
Rangfolge nach Komplexität der dnd5e-Datenmodelle (qualitativ, keine Aufwandsschätzung, R2):

| Stufe | Objektarten | Grund |
|---|---|---|
| einfach | Loot, Tool, Weapon, Equipment, Consumable, Container | Grunddaten plus Activities nach Rezepten (o2); Container mit Inhalt über `createWithContents` |
| mittel | Feature (`feat`), Spell, Species (`race`), Background, Rolltabelle | Activities, Nutzungen, Voraussetzungen; Species und Background zusätzlich Advancements; Spell mit Stufe, Schule, Komponenten; Rolltabelle mit Ergebnisbereichen und Dokumentverweisen (M8a) |
| hoch | Class, Subclass, Facility, NPC | Klasse: HitPoints, Traits, Skalenwerte je Stufe, Item Grant je Stufe, Unterklasse, Zauberprogression, Startausrüstung (im Wizard-Beispiel 18 Advancements); Unterklasse an Klassenkennung gebunden; NPC: Statblock mit Attributen, HP, RK, Aktionen als eingebettete Items mit Activities, Zauberwirken |
| Sonderfälle | Encounter, Group, Vehicle, Player Character | Encounter und Gruppen bestehen aus Verweisen auf Actors (Zustand, gehört nicht in die Library, M8a); Player Character überschneidet sich mit Eagle Character Edit (N15) |

Nicht zuordenbar: **"Item"** in der PDF-Liste (o1, N15).

### Anlegen ("Create Homebrew", danach Art und Unterkategorie) — **machbar, Risiko niedrig-mittel**
Flight Control erzeugt das Objekt aus Editordaten (Q3 a, N4: Editor-Logik im Modul, Schreiben über Flight Control). Die strukturierte Eingabe wird in Foundry-/dnd5e-Daten umgewandelt (Phase-2-Befund, o9). Das Objekt entsteht **sofort** nach Wahl von Art und Unterkategorie (Q9). Ein leeres Objekt muss gültig sein: dnd5e-Dokumente lassen sich mit Standardwerten anlegen, unvollständige Eingaben bleiben im Editor als Entwurf, bis sie gültig sind; Fehler werden aus der Validierung (o3) feldgenau angezeigt (PDF/Vision: Fehler hervorheben).

### Live-Bearbeitung im Hintergrund — **machbar, Risiko mittel**
Jede bestätigte Änderung im Editor wird als Update auf das Objekt geschrieben (Debounce, Schreiben beim Verlassen eines Feldes statt bei jedem Tastendruck). Andere Module reagieren auf `update…`-Hooks (o8, R1); häufige Schreibvorgänge können dort Nebenwirkungen haben.

### Welt-Dokument und Library-Eintrag zugleich (Q9) — **machbar; Verhalten offen (N14)**
Q9 verlangt, dass jedes neue Objekt als Welt-Dokument **und** als Library-Eintrag entsteht. Foundry bietet keinen laufenden Abgleich zwischen beiden (o6). Optionen für den Abgleich bei späteren Änderungen:

| Option | Beschreibung | Bewertung |
|---|---|---|
| S1 Library → Welt (einseitig) | Der Library-Eintrag ist die Quelle; nach jeder Änderung im Editor wird das Welt-Dokument daraus aktualisiert | passt zu "Single Source of Truth" (P-L1) und N6; einfach und eindeutig; Änderungen am Welt-Dokument außerhalb des Editors gehen beim nächsten Abgleich verloren, wenn nicht gewarnt |
| S2 Welt → Library (einseitig) | Das Welt-Dokument ist die Quelle, die Library folgt | Library ist nur noch abgeleitet, widerspricht P-L1 |
| S3 Beidseitig | Update-Hooks auf beiden Seiten | Konfliktlösung nötig, Rückkopplungsschleifen (Schreiben löst Hook aus, der wieder schreibt) müssen verhindert werden; hoher Aufwand |
| S4 Nur Herkunft, kein Abgleich | Zwei unabhängige Kopien, das Welt-Dokument trägt die Library als Herkunft | einfach; Kopien laufen auseinander, "eine Wahrheit" gilt nicht mehr |

**Empfehlung (Vorschlag):** S1, weil sie zu P-L1 und N6 passt. Die Verweise **innerhalb** des Objekts brauchen dabei dieselbe Abbildung wie beim Kopieren (Welt → Library, M8a): Verweise im Objekt zeigen auf Library-Einträge.
Abhängigkeitskette: Homebrew braucht die Library (für den zweiten Eintrag) und Flight Control; die Library braucht Flight Control.

### "Edit with Eagle Homebrew" für bestehende Objekte (Q10 c) — **machbar, Risiko mittel**
Einstieg in der Kopfzeile des Blatts (`getHeaderControls…`, M9 c1) und im Kontextmenü des Verzeichnisses (o7, Hook-Namen je Verzeichnis nicht einzeln verifiziert). Der Editor bildet nur einen Teil der Daten ab; alles Übrige (fremde Flags, Effekte, Felder späterer dnd5e-Versionen, Konstrukte, die der Editor nicht kennt) muss beim Speichern **unverändert erhalten** bleiben (M5 (d)). Bei einem bestehenden Objekt ohne Library-Eintrag ist offen, ob einer angelegt wird (N14).

### Freitext-Import
Zurückgestellt (Q8 c), kein Teil dieses Plans. Das Phase-2-Ergebnis (`dadm/eagle-modules-projektplan.md`, Abschnitt M6 der Planungsphase 2; zuverlässig nur für templatierte Eingaben) bleibt Referenz.

### Bedingte Effekte im Editor (N5, M6)
Stufe 1: Der Editor erzeugt für "Zusatzschaden gegen X" eine zweite native Damage-Activity (Weg A) und speichert die Bedingung zusätzlich als Daten im dnd5e-Filterformat; die Auswahl der Bedingungen ist eine endliche Liste (M6). Die Automatik folgt in Stufe 2 bei Roll Out.

## Zusammenfassung
| Bereich | Verdict | Risiko |
|---|---|---|
| Objektarten (einfach: 6, mittel: 5, hoch: 4, Sonderfälle: 4; "Item" nicht zuordenbar) | machbar, Aufwand nach Stufe gestaffelt | mittel (Umfang) |
| Anlegen mit feldgenauer Fehleranzeige | machbar | niedrig-mittel |
| Live-Bearbeitung | machbar, mit Debounce | mittel |
| Welt-Dokument + Library-Eintrag | machbar; Regel für den Abgleich offen (Vorschlag S1) | mittel |
| "Edit with" für bestehende Objekte | machbar, Restdaten erhalten | mittel |
| Freitext-Import | zurückgestellt | — |

## Nicht blockierende offene Punkte
| # | Punkt | Auswirkung |
|---|---|---|
| N14 | Welt-Dokument und Library-Eintrag (Q9): (a) Wer ist bei späteren Änderungen die Quelle? (S1 Library → Welt, S2 Welt → Library, S3 beidseitig, S4 kein Abgleich) (b) "Edit with" auf ein bestehendes Welt-Dokument ohne Library-Eintrag: Library-Eintrag anlegen oder nicht? (c) Existiert der Name in der Library bereits (gleiche Version): wie bei erzwungener Übertragung "Name (Duplicate)", oder Rückfrage im Editor? | Kernablauf von Homebrew und Library |
| N15 | Typenliste: (a) Was ist der Untertyp "Item"? dnd5e hat keinen Typ dieses Namens; die 13 anderen Einträge sind zuordenbar. Gemeint: Gegenstände allgemein, magische Gegenstände oder ein Eintrag, der entfallen soll? (b) "Player Character" steht sowohl in Homebrew als auch (als Zweck) in Character Edit: Was soll Homebrew hier leisten (z. B. Vorlagen/Pregenerierte für die Library)? | Umfang des Homebrew-Editors |
| N16 | Regelwerk-Version eines neuen Objekts: im Editor wählbar (2014/2024) oder aus der Welteinstellung `rulesVersion` (Standard 2024)? Sie bestimmt das Library-Compendium | Ablauf beim Anlegen |

## Acceptance Criteria
- AC-M10-01: Jede Objektart und jeder Ablauf hat ein Verdict mit Belegen (o1–o10)
- AC-M10-02: Antworten Q8–Q10, N4–N6 und Ergebnisse M6, M8a sind eingearbeitet
- AC-M10-03: Ergebnis und N14–N16 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nebenwirkungen häufiger Schreibvorgänge und Hook-Namen der Verzeichnisse nicht verifiziert | medium | nein |
| R2 | Umfang von 19 Objektarten; die Aufwandsschätzung folgt in der Umsetzungsphase | medium | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

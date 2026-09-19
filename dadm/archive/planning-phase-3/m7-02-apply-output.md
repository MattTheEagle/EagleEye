```
artifact: apply-output
milestone: M7
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m7-01-discover-output.md` (Fakten g1–g10, Risiken R1–R2)

## Bewertung je Teilfunktion

### 1. Eigene Compendien je Art anlegen — **machbar, Risiko niedrig**
- Möglich über `createCompendium` (g1), nur als **Welt-Compendium**, nur durch den Spielleiter. Folge: Die Eagle Library gehört **zu einer Welt**; jede Welt hat ihre eigene
  Library, Inhalte werden nicht zwischen Welten geteilt.
- "Art" heißt praktisch: je Dokumenttyp und, bei Items, je dnd5e-Untertyp (Class, Subclass, Species, Background, Spell, Feat, Waffen/Ausrüstung usw.). Die Aufteilung
  der Items in mehrere Compendien ist eine Konvention der Library (g2), keine Foundry-Vorgabe.
- Erkennbar als "Eagle Compendium" sind sie über Namens- und Label-Konvention oder eine in der Welt gespeicherte Liste (g3), nicht über ein Flag.

### 2. Zuordnung zu 2014 und 2024 — **machbar für Items, NPC- und Vehicle-Actors; nicht aus den Daten ableitbar für Charaktere, Gruppen, Encounter, Journale**
- Für Items, NPCs und Vehicles gibt es `system.source.rules` (g5, g6). "Wo nötig" (PDF) entspricht damit diesen Typen. Für Charakter-, Gruppen- und Encounter-Actors sowie Journale,
  Tabellen und Makros kennt dnd5e **keine** Regelwerk-Version in den Daten; dort gibt es keine 2014/2024-Trennung, oder sie müsste über andere Wege (z. B. die
  Herkunft) hergestellt werden.
- **Fallstrick:** Der Anfangswert von `rules` folgt der **aktuellen Welteinstellung** (g5). Ein Eintrag ohne gespeicherte Angabe wird in einer 2024-Welt als "2024" **gelesen**,
  auch wenn er ursprünglich 2014 ist. Der Compendium-Index liefert den **gespeicherten** Wert und damit bei fehlender Angabe "leer". Beide Sichten können abweichen.
  Für Einträge ohne gespeicherte Version braucht die Library eine Regel (N7).

### 3. "Jeder Eintrag nur einmal pro Version" (Q4 a, Q6 a) — **machbar, Risiko niedrig-mittel**
- Prüfung: gleicher Name im selben Eagle Compendium und in derselben Version. Der Index liefert Namen ohne die Dokumente zu laden (g4, g9), das Feld für die Version wird
  zusätzlich angefordert (`getIndex` mit Feldern).
- **Grenzen des Namenskriteriums:** Bei anderer Sprache trägt derselbe Eintrag einen anderen Namen ("Langschwert" gegenüber "Longsword"); zwei verschiedene Einträge mit
  demselben Namen innerhalb einer Version werden als Duplikat behandelt. Genauigkeit der Namensgleichheit (Groß-/Kleinschreibung, Leerzeichen) ist eine Detailregel.
  Zusätzlich verfügbar wäre die Herkunftsangabe eines Eintrags; gewählt wurde aber der Name (Q6).
- **Widerspruch zwischen zwei Antworten (N8):** Q5 a lässt den Spielleiter die Übertragung **erzwingen**; Q4 a/Q6 a verlangen "nur einmal pro Version". Erzwingen kann dann
  entweder den bestehenden Eintrag ersetzen oder ein zweites Exemplar erzeugen (das verletzt die Einmaligkeit) oder unter geändertem Namen ablegen. Machbar sind alle drei; welche
  gemeint ist, ist offen.

### 4. Kopieren in das richtige Compendium — **machbar, Risiko mittel**
- Technik: Quelleintrag laden, mit `toCompendium` aufbereiten und mit `importDocument` oder `createDocuments` in das Zielcompendium schreiben (g4). Auswahl einzelner oder aller
  Nicht-Eagle-Compendien (Q7 a: die Auswahl dient nur dem Kopieren) ist eine Oberfläche über dieser Schleife.
- **Container mit Inhalt:** müssen mit `createWithContents` kopiert werden, sonst gehen die Inhalte verloren (g8).
- **Menge:** Für große Bestände ist Verarbeitung in Portionen mit Fortschrittsanzeige nötig; Laufzeit nicht verifiziert (R1).
- **Ausführung:** Spielleiter-Operation (g10); die Oberfläche läuft im Library-Modul, die Schreibvorgänge über Flight Control (Q3 a).
- **Log und Erzwingen (Q5 a):** Nicht übertragene Einträge werden mit Grund (Duplikat, Version unbekannt) protokolliert. Ablage z. B. als Welt-Einstellung oder Journal der Library; die
  Darstellung "per Klick erzwingen" ist eine Liste mit Schaltfläche. Machbar.

### 5. Verweise zwischen Einträgen (Single Source of Truth) — **machbar, aber aufwendig; Risiko mittel-hoch**
- Einträge verweisen auf andere Einträge über UUIDs: Klassen vergeben ihre Merkmale über "Item Grant" (g7), Zauberlisten verweisen auf Zauber (g7), Beschreibungen enthalten `@UUID`-Links.
  Eine reine Datenkopie **behält die Verweise auf die Original-Compendien**.
- Zwei Stufen: **(1)** Kopieren wie es ist: einfach; die Library ist dann nicht in sich abgeschlossen; verschwindet ein Quell-Compendium, brechen die Verweise, und ein
  Modul, das über die Library arbeitet, greift über die Verweise doch auf die Originale zu. **(2)** Verweise beim Kopieren auf die Library-Kopien umschreiben: erfordert, dass der
  Abhängigkeitsabschluss mitkopiert wird, eine Abbildung Quelle → Library-Eintrag (mit Dedup und Version: eine 2014-Klasse verweist auf 2014-Merkmale) und das Umschreiben in
  Advancement-Daten, Zauberlisten und Textlinks. Werden IDs beim Kopieren beibehalten (dnd5e macht das im eigenen Compendium-Import, g8), ist das Umschreiben in vielen Fällen
  ein Tausch des Compendium-Namens; bei Dedup-Treffern mit anderer ID braucht es eine echte Abbildung.
- Die Vision sagt "ausschließlich auf Einträge der Eagle Library" (V-EY8, P-L1). Strenge Lesart verlangt Stufe 2 (N6). Für Eagle Character Edit (M9) ist das wichtig: Eine
  Klasse aus der Library erzeugt beim Hinzufügen Merkmale über die gespeicherten UUIDs.
- Nicht kopiert werden Bilddateien und Sounds (R2): Sie bleiben Pfade auf Dateien der Quellpakete.

## Zusammenfassung
| Teilfunktion | Verdict | Risiko |
|---|---|---|
| Eigene Compendien je Art | machbar (Welt-Compendien, GM) | niedrig |
| Zuordnung 2014/2024 | machbar für Items, NPC, Vehicle; sonst nicht aus Daten; Fallstrick beim Anfangswert | niedrig-mittel |
| Einmalig pro Version | machbar mit Namenskriterium; Grenzen bei Sprachen | niedrig-mittel |
| Kopieren, Container, Menge | machbar; Menge unverifiziert | mittel |
| Log und Erzwingen | machbar | niedrig |
| Verweise in sich abgeschlossen (Stufe 2) | machbar, aufwendig | mittel-hoch |

## Nicht blockierende offene Punkte
| # | Punkt | Auswirkung |
|---|---|---|
| N6 | Sollen Verweise innerhalb kopierter Einträge (Klasse → Merkmale, Zauberlisten, `@UUID`-Links) beim Kopieren auf die Library-Kopien umgeschrieben werden (strenge Lesart von "ausschließlich Eagle Library"), oder genügt Kopieren wie es ist? | Aufwand der Library, Verhalten von Character Edit |
| N7 | Was geschieht mit Einträgen, deren Version nicht gespeichert ist? Vorschlag: nicht kopieren, protokollieren, Spielleiter entscheidet (nutzt Log und Erzwingen aus Q5) | Regel im Kopiervorgang |
| N8 | Q5 (Übertragung erzwingen) und Q4/Q6 (einmal pro Version): Was bedeutet "erzwingen"? (a) bestehenden Eintrag ersetzen (b) zweites Exemplar zulassen (c) unter geändertem Namen ablegen | Regel bei Duplikaten |

## Acceptance Criteria
- AC-M7-01: Jede Teilfunktion hat ein Verdict mit Belegen (g1–g10)
- AC-M7-02: Klärungen Q3–Q7 sind eingearbeitet; Widersprüche sind als offene Punkte benannt
- AC-M7-03: Ergebnis und N6–N8 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Laufzeit beim Kopieren großer Bestände und Indexgröße nicht verifiziert (Live-Test mit Freigabe) | medium | nein |
| R2 | Verweise (Stufe 2) sind der aufwendigste Teil der Library; ohne sie bleibt sie keine in sich abgeschlossene Wahrheitsquelle | medium-high | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

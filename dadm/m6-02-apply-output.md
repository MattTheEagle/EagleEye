```
artifact: apply-output
milestone: M6
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m6-01-discover-output.md` (Fakten f1–f13, Risiken R1–R2)

## Bewertung des Referenzfalls (Magisches Langschwert, +2W6 Feuer, "Hit, Undead")

| Teil | Bewertung |
|---|---|
| 1 Magische Waffe | nativ (Phase 2) |
| 2 Zusatzschaden 2W6 Feuer | nativ: Schadensteil mit Anzahl, Würfelgröße und Typ (f1) |
| 3 "nur bei Treffer" | nativ: der Schaden gehört zur Angriffs-Activity |
| 4 "nur gegen Untote" | **im Kern von dnd5e nicht vorhanden** (f1, f2). Ohne Fremdmodul auf drei Arten lösbar, siehe unten |

**Gesamtaussage:** Der Referenzfall ist **ohne Fremdmodul machbar**. Ein Item, das vollständig **ohne** Laufzeitcode funktioniert,
ist möglich, prüft die Bedingung aber nicht selbst. Wird die Bedingung automatisch geprüft, braucht das einen aktiven Eagle Baustein
zur Spielzeit. Risiko: **mittel** (bisher hing der Befund an einem Fremdmodul).

## Lösungswege

| Weg | Beschreibung |
|---|---|
| **A** Nativ, manuell | Der Editor legt neben der Angriffs-Activity eine zweite Activity vom Typ `damage` an ("Zusatzschaden gegen Untote", 2W6 Feuer, f3). Die Bedingung steht im Namen und in der Beschreibung; nach dem Treffer gegen einen Untoten wird sie ausgelöst |
| **B** Bedingung als Daten, Prüfung beim Wurf | Bedingung liegt als Daten am Item. Ein Hook `dnd5e.preRollDamageV2` (f6) prüft die Ziele (`game.user.targets`, f7; Kreaturtyp, f8) und ergänzt `config.rolls` (f5) um den Zusatzwurf |
| **C** Bedingung als Daten, Prüfung bei der Anwendung je Ziel | Der Zusatzwurf wird immer mitgewürfelt und markiert; `dnd5e.preCalculateDamage` (f10) entfernt ihn für Ziele, die die Bedingung nicht erfüllen |
| **D** Eigener Activity-Typ | Ein in `CONFIG.DND5E.activityTypes` registrierter Typ "bedingter Schaden" (f11) mit eigenem Feld für die Bedingung; die Wirkung läuft weiter über B oder C |
| **E** Fremdmodul (Build-a-Bonus, Automated Conditions, Midi-QOL) | **ausgeschlossen** (E3) |

## Vergleich

| Kriterium | A | B | C | D |
|---|---|---|---|---|
| Aktiver Eagle Baustein zur Spielzeit nötig | nein | ja | ja | ja |
| Bedingung wird geprüft | nein, manuell | ja | ja | ja (über B/C) |
| Mehrere Ziele, gemischt (Untote und Lebende) | manuell | **falsch**: ein Wurf, gleicher Zusatz für alle angewendeten Ziele | **korrekt** je Ziel | wie B/C |
| Aufwand | niedrig | mittel | mittel-hoch | hoch (Datenmodell, Blatt, Vorlage, Lokalisierung) |
| Robustheit gegen dnd5e-Updates | hoch (nur native Daten) | mittel-hoch (dokumentierte Hooks, f6) | mittel (greift in die interne Aufbereitung der Chat-Karte ein, f9) | mittel |
| Ohne das Modul | voll funktionsfähig | Item läuft weiter, Zusatz entfällt **still** | wie B | Rohdaten bleiben erhalten (f11), Darstellung im Blatt nicht verifiziert (R1) |
| Besonderheit | — | ohne Ziel unklar, ob der Zusatz angewendet wird | Die Markierung überlebt die Aufbereitung nur im Feld `properties` (f9); Verhalten unbekannter Einträge dort nicht verifiziert (R1) | beste Bedienung im Item-Blatt |

## Empfehlung
1. **A immer erzeugen** (Grundlinie ohne Abhängigkeit). Damit funktioniert jedes mit Eagle Homebrew erstellte Item auch ohne Eagle Module vollständig.
2. Die Bedingung **zusätzlich als Daten** im deklarativen Format speichern, das dnd5e selbst mitliefert und öffentlich bereitstellt
   (`dnd5e.Filter`, `{k, v, o}`, f12). Dann können eine spätere Automatik (Weg C) und ein eventuelles natives dnd5e-Bedingungssystem (f2) dieselben Daten lesen.
3. Automatik als **zweite Stufe** mit **Weg C** (je Ziel korrekt), Weg B nur, wenn ausdrücklich nur Einzelziele gemeint sind; Weg D nur, wenn die Bedienung im Item-Blatt den hohen Aufwand rechtfertigt.
4. Der Editor bietet eine **endliche Liste vorgegebener Bedingungstypen** an (siehe Abdeckung), keine freien Bedingungen.

## Abdeckung der Bedingungsarten

| Bedingungsart | Ohne Laufzeitcode | Mit Laufzeitcode (B/C/D) |
|---|---|---|
| Bei Treffer | ja (Angriffs-Activity) | — |
| Bei Kritischem Treffer | ja (`damage.critical.bonus`, f4) | — |
| Kreaturtyp des Ziels (z. B. Untote) | manuell (Weg A) | ja: `system.details.type.value` (f8) |
| Weitere Zieldaten (Größe, Status, Trefferpunkte) | manuell (Weg A) | ja, über dasselbe Filterformat, soweit die Werte als Daten am Actor liegen (Datenfelder nicht einzeln geprüft) |
| Angreiferdaten (Gesundheit, Größe, Status) | manuell (Weg A) | ja, gleiches Format (in f2 genannt) |
| Umstände außerhalb der Daten (Tageszeit, Lage der Verbündeten, Erzählentscheidung) | manuell | nicht abbildbar; bleibt manuell |

## Nicht blockierender offener Punkt
| # | Punkt | Auswirkung |
|---|---|---|
| N5 | Wo läuft der Laufzeitcode der Automatik (Flight Control, Homebrew oder Roll Out) und ab wann? Vorschlag: Stufe 1 (Weg A) ohne Laufzeitcode in Homebrew; Stufe 2 (Weg C) bei Eagle Roll Out, weil dort die Automation angesiedelt ist. Muss ein Homebrew-Item ohne installierte Eagle Module vollständig funktionieren? (Weg A erfüllt das.) | bestimmt Zeitpunkt und Zuständigkeit der Automatik, keine Auswirkung auf die Machbarkeit |

## Acceptance Criteria
- AC-M6-01: Der Referenzfall hat je Teil ein Verdict; offene Teile sind benannt
- AC-M6-02: Alle Lösungswege sind mit Belegen (f1–f13) verglichen; ausgeschlossene Wege sind als solche markiert
- AC-M6-03: Die Grenze der abdeckbaren Bedingungsarten ist dokumentiert
- AC-M6-04: Ergebnis und N5 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (Live-Test, Freigabe nötig): unbekannte `properties`-Einträge in Chat-Karte/Schadensdialog; Ergänzen von `config.rolls` im Hook; Darstellung eines unregistrierten Activity-Typs | medium | nein |
| R2 | Weg C greift in Datenflüsse ein, die dnd5e intern aufbereitet (f9); ein dnd5e-Update kann sie ändern | medium | nein |
| R3 | Ein künftiges natives Bedingungssystem in dnd5e (f2) könnte Teile überflüssig machen; das gespeicherte Filterformat hält die Daten dafür kompatibel | low | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

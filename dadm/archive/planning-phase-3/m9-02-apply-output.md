```
artifact: apply-output
milestone: M9
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m9-01-discover-output.md` (Fakten c1–c14, Risiken R1–R3)

## Bewertung

### Startweg aus dem Hub (nur neuer Charakter) — **machbar, Risiko niedrig**
Der Hub öffnet zunächst nur "Create Player Character" mit Namensfeld. Der Befehl geht an Flight Control (Q3 a), das den Actor vom Typ `character` anlegt; danach öffnet sich der Editor und der Abgleich beginnt. Wer den Actor anlegen darf, ergibt sich aus den Foundry-Rechten (c3); reicht das Recht nicht, hilft der GM-Anfrageweg aus M5. Die Nutzungsrechte je Modul legt der Projektleiter später in den Moduleinstellungen fest (N1). Offen: Besitzer des neuen Actors und Abbruch (N13).

### Startweg aus dem Charakterblatt — **machbar, Risiko niedrig**
Ein zusätzlicher Eintrag in der Kopfzeile des Charakterblatts über den Hook `getHeaderControls…` (c1, c2), nur für Actors vom Typ `character`. Flight Control liest den Charakter aus und füllt den Editor (c14). Nicht aus der Library stammende Items (Herkunft fehlt oder verweist auf ein anderes Compendium) zeigt der Editor als "extern" an und behält sie unverändert (M5 (d): Restdaten erhalten).

### Live-Abgleich Editor ↔ Flight Control ↔ Charakterblatt — **machbar, Risiko mittel**
- Das echte Blatt zeigt Änderungen ohne Zutun, weil Foundry geöffnete Blätter bei Datenänderungen neu zeichnet (c13). Der Editor schreibt über Flight Control (Q3 a) und hört auf `updateActor`, `createItem`, `updateItem`, `deleteItem` des Charakters.
- **Granularität:** Einfache Felder (Name, Attributswerte) sind sofortige Einzelschreibvorgänge. Klasse, Spezies, Hintergrund und Stufenänderungen laufen über dnd5e-Advancements. Der Manager arbeitet auf einem Klon und schreibt erst am Ende eines Vorgangs (c5). "Live" heißt hier: nach jedem **abgeschlossenen** Vorgang, nicht nach jedem Klick innerhalb eines Vorgangs.
- **Zwei Wege für die Advancement-Wahlen:** (A) den dnd5e-Manager als Dialog über dem Editor verwenden (native Oberfläche, wenig Eigenaufwand, Auswahlen erscheinen im Dialog, nicht in den Registerkarten); (B) die Flows selbst steuern und die Auswahl in den Registerkarten darstellen (einheitlicher, aber hoher Aufwand und Abhängigkeit von dnd5e-Interna). Empfehlung: **A** als Grundlage, B nur für einzelne, gut abgegrenzte Fälle.
- **Abwählen:** Entfernen einer Klasse oder Spezies läuft über `forDeletedItem` (rückwärts gerichtete Schritte, c4) und ist ebenfalls ein abgeschlossener Vorgang.
- **Gleichzeitiges Blatt und Editor:** Beide schreiben; die letzte Änderung gewinnt je Feld. Der Editor muss auf Update-Hooks neu einlesen (R1).

### Registerkarte Attributes — **machbar, Risiko niedrig-mittel**
- **Punktekauf und Standardwerte** gibt es in dnd5e nicht (c7). Der Editor bringt die Regeltabellen selbst mit (R2). Manuelle Eingabe ist trivial.
- **Base, Bonus, Base+Bonus:** Der gespeicherte Wert enthält bereits Erhöhungen aus Advancements (c8); der Bonus ist als Summe der `value.assignments` aller Ability-Score-Improvement-Advancements bestimmbar, der Basiswert als Differenz. Werte aus Active Effects liegen **nicht** im gespeicherten Wert (abgeleitet) und zählen nur dann zum Bonus, wenn der Editor sie ausdrücklich einrechnet. Der Editor muss beim Schreiben eines Basiswerts den bestehenden Bonus erhalten (Basis + Bonus schreiben), sonst überschreibt er Erhöhungen aus Spezies und Hintergrund.

### Registerkarte Class (Klasse, Level, Klassenmerkmale, Unterklasse) — **machbar, Risiko mittel**
- Klassenwahl über `forNewItem`, Stufe über `forLevelChange` (c4; Q11 a: das Level steht in dieser Registerkarte). Merkmale je Stufe lassen sich aus den Item-Grant-Advancements der Library-Klasse lesen und anzeigen (M8a: die UUIDs zeigen auf Library-Einträge). Die Unterklasse ist ein eigenes Advancement (Typ `Subclass`), Kandidaten kommen aus der Library nach Klassenkennung.
- Risiko: Die Auswahlschritte laufen im dnd5e-Dialog (R1).

### Registerkarte Species (Art, Unterart, Merkmale) — **machbar mit Lücke**
Spezies sind Items mit Advancements. Unterarten sind in dnd5e **eigene gleichrangige Items ohne Verknüpfung** zur Art (c9), in 2024 teils Auswahlen innerhalb der Spezies (Human). Ein Zwei-Stufen-Auswahlbild "Art → Unterart" braucht eine Gruppierungsregel, die es in den Daten nicht gibt (N12). Merkmale entstehen über die Item-Grant-Advancements.

### Registerkarte Background — **machbar, Risiko niedrig-mittel**
`background`-Item mit Advancements (Ability-Score-Erhöhungen, Fertigkeiten, Herkunftstalent je nach Regelwerk-Version); Ablauf wie bei Klasse und Spezies über den Manager.

### Registerkarte Spells — **machbar mit Grenzen, Risiko mittel-hoch**
- **Wählbar** sind Zauber aus der Klassenliste der Registry (c11), begrenzt durch die höchste verfügbare Zauberstufe, die dnd5e aus den Klassenstufen ableitet. Wegen der Zusammenführung von Original- und Library-Liste (M8a) muss der Editor auf **Library-Zauber** filtern, sonst erscheinen Zauber doppelt.
- **Anzahl "laut Regelwerk":** für viele Klassen aus den Daten ablesbar (Skalenwerte wie `cantrips-known`, `spells-known`, `max-prepared` und die Vorbereitungsformel, c10). Die Formate unterscheiden sich zwischen 2014 und 2024. Regeln, die nur im Fließtext stehen (z. B. Zauberbuch des Wizard, Zauber von Unterklassen, Zauber aus der Spezies), sind nicht abgebildet (R3). Für diese Fälle gibt es entweder eigene Regeltabellen im Editor oder eine offen gekennzeichnete Lücke.

### Registerkarte Equipment (Ausrüstung und Gold) — **machbar, Risiko mittel**
Die Ausgangsausrüstung liegt als Daten vor, wird aber von dnd5e nicht auf Charaktere angewendet (c12). Der Editor muss die Auswahl selbst darstellen (Gruppen "oder"/"und", feste Items über Library-UUID, Kategorien, Währung über `wealth`) und die Items mit Container-Inhalt anlegen. Ausrüstung kommt aus der Library (M8a).

### Bestehende Charaktere einlesen — **machbar, Risiko mittel**
Klassen, Stufen, Unterklasse, Spezies, Hintergrund, Zauber, Ausrüstung und Erhöhungen lassen sich lesen (c14). Nicht aus der Library stammende oder frei angelegte Items bleiben unverändert erhalten. Charaktere, die ohne die Advancement-Flows entstanden sind (z. B. Import), haben keinen Advancement-Zustand; der Editor muss sie als "teilweise erfasst" behandeln.

## Zusammenfassung
| Bereich | Verdict | Risiko |
|---|---|---|
| Start aus dem Hub / aus dem Blatt | machbar | niedrig |
| Live-Abgleich | machbar; "live" je abgeschlossenem Vorgang | mittel |
| Attributes | machbar; Regeltabellen selbst; Bonus über Assignments | niedrig-mittel |
| Class (mit Level, Unterklasse) | machbar über Advancement-Manager | mittel |
| Species (mit Unterart) | machbar; Gruppierung der Unterarten fehlt in den Daten | mittel |
| Background | machbar | niedrig-mittel |
| Spells | machbar mit Grenzen (Fließtext-Regeln, Listen-Filter) | mittel-hoch |
| Equipment | machbar; Anwendung der Ausgangsausrüstung selbst | mittel |
| Bestehende Charaktere lesen | machbar | mittel |

## Nicht blockierende offene Punkte
| # | Punkt | Auswirkung |
|---|---|---|
| N12 | Unterarten (Subspecies): dnd5e speichert sie als eigene, gleichrangige Spezies-Items ohne Verknüpfung. Wie soll der Editor Art und Unterart gruppieren? (a) nach einem Namensschema (z. B. "Elf (Dunkelelf)" → Basis "Elf") (b) über einen Marker, den die Library an Spezies-Einträgen pflegt (c) flach: eine Liste aller Spezies | Aufbau der Registerkarte Species |
| N13 | Neuer Charakter: (a) Wer wird Besitzer (der anlegende GM, der angemeldete Spieler)? (b) Wird der Editor mitten in der Erstellung geschlossen: bleibt der unfertige Charakter bestehen und lässt sich über das Blatt fortsetzen, oder wird er gelöscht? | Ablauf beim Anlegen und Abbrechen |

## Acceptance Criteria
- AC-M9-01: Jeder Startweg und jede Registerkarte hat ein Verdict mit Belegen (c1–c14)
- AC-M9-02: Klärungen Q3 a, Q11 a, N1, N4, N6 und Ergebnis M8a sind eingearbeitet
- AC-M9-03: Ergebnis, N12 und N13 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Verhalten des Advancement-Dialogs aus einem eigenen Fenster und bei gleichzeitigem Blatt nicht verifiziert (Live-Test mit Freigabe) | medium | nein |
| R2 | Regeltabellen für Punktekauf und Standardwerte nicht aus dem Code belegt | low | nein |
| R3 | Fließtext-Regeln für Zauber sind nicht in den Daten; Lücken im Zauber-Tab | medium | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

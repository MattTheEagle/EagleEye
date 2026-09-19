```
artifact: apply-output
milestone: M13
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m13-01-discover-output.md` (Fakten r1–r10, Risiken R1–R2, Korrektur der Ausgangslage)

## Neubewertung der drei Ebenen aus Phase 2

| Ebene | Phase-2-Aussage | Neubewertung | Risiko |
|---|---|---|---|
| **1 Regel-Nachschlagewerk** | voll automatisch machbar über `CONFIG.DND5E.rules` | bestätigt; Umfang **170 Regelbegriffe** in 5.3.3 statt "über 60" (r2); der Verweis führt auf Seiten des dnd5e-Regelcompendiums | niedrig |
| **2 Regel-Einstellungen** | nur machbar, wo dnd5e die Mechanik als Einstellung freigibt; Bestandsaufnahme fehlte | **Bestandsaufnahme erledigt (r1):** 45 Einstellungen, davon etwa 25 regelrelevant (kritische Treffer, Initiative, Tragkraft, Ruhephasen, Leveln, Konzentration, Zustände wie "Bloodied", Sichtbarkeiten, Automatik). Lesen und Schreiben ist über den Hub aus Phase 1 belegt | niedrig |
| **3 "Change Rule to Homebrew"** | nur über tiefe Eingriffe, hoher Aufwand | **in drei Teile aufgeteilt, nur einer ist tief:** siehe unten | gestaffelt |

### Aufteilung von Ebene 3

| Teil | Mechanismus | Deckt ab | Aufwand/Risiko |
|---|---|---|---|
| **3a Konfiguration** | Überschreibungen in `CONFIG.DND5E` (134 Bereiche, r2), als Weltdaten gespeichert und bei jedem Start auf jedem Client angewendet (r9) | datengetriebene Regeln: Fertigkeiten, Attribute, Schadensarten, Zustände, Größen, Währungen, Sprachen, Werkzeug-/Waffenlisten, Tragkraft-Werte, Höchststufe, "Bloodied"-Schwelle (Vorbild: über 40 Bereiche in Custom D&D 5e, r4) | niedrig-mittel; Änderungen sind flüchtig (keine Daten überschrieben) und rückgängig durch Entfernen; Risiko: Daten, die auf entfernte Schlüssel verweisen |
| **3b Hooks der Wurf-/Aktivierungspipeline** | dokumentierte Hooks (`dnd5e.preRoll…`, `dnd5e.preUseActivity`, `dnd5e.preCalculateDamage` …, r8) | Änderungen an Wurfkonfiguration (Vorteil/Nachteil, Boni, Formeln), Schadensberechnung, Ablauf beim Einsatz | mittel; die Reihenfolge der Hook-Listener mehrerer Module ist Registrierungsreihenfolge |
| **3c Methoden-Wrapper** | Ersetzen von Klassenmethoden (Custom D&D 5e nutzt 9, r5, darunter die vier D20-Methoden) | Mechaniken, die in Code stecken und nicht per Hook erreichbar sind (Berechnung von Bewegung/Tragkraft, D20-Vorteilslogik) | hoch; braucht entweder libWrapper (Fremdmodul-Abhängigkeit, N19) oder eigenes, konfliktanfälliges Überschreiben |
| **3d "Add New Rule"** | Regel als Trigger → Aktion, umgesetzt über Hooks (Muster aus Custom D&D 5e "Workflows", K11) | begrenzt: vordefinierte Auslöser und Aktionen (endliche Bausteinliste wie in M6), keine freie Programmierung | mittel; nur für die Bausteine machbar |

Klartext-Darstellung einer Regel (Vision "Critical Damage = 2× Damage Dice + Modifier"): für Regeln aus 3a und Ebene 2 aus den Werten erzeugbar (Textvorlagen, Englisch, N3); für Regeln, die nur im Code stehen, nur als beschreibender Text aus Ebene 1, nicht als Mechanik-Aussage (M5 (d)).

## Wird die Umsetzung durch die Repo-Analyse einfacher?
**Ja, an drei Stellen:** (1) Klarheit, **welche** Bereiche konfigurierbar sind (Config-Bereiche und Einstellungen) und dass ein großer Teil der Regeländerungen **keine tiefen Eingriffe** braucht (3a); (2) ein bewährtes Muster für die Konfigurations-Engine (Speichern als Weltdaten, Anwenden pro Client, Zurücksetzen) und eine Referenzliste der Wrapper-Ziele (9 in 4.1.2); (3) ein Hook-Katalog für 3b.
**Nein:** Für Mechaniken, die nur im Code stehen (3c), bleibt der Aufwand hoch. **Lizenz (r7):** Übernommen werden dürfen nur Muster und Erkenntnisse, kein Code (E4: für Eagle Modules gilt keine Lizenz, MIT-Module dürfen mit Hinweis genutzt werden).

## Koexistenz mit Custom D&D 5e (E2)
Auf dem Zielstand ist Koexistenz mit Custom D&D 5e ≤ 4.1.2 **real** (Korrektur). Berührungsflächen:

| Fläche | Konfliktart | Gegenmaßnahme |
|---|---|---|
| `CONFIG.DND5E`-Bereiche (über 40 von Custom D&D 5e beschrieben) | beide überschreiben denselben Bereich; wer später schreibt, gewinnt | Änderungen als Einfügen/Ändern einzelner Schlüssel statt Ersetzen ganzer Bereiche; Bereiche der eigenen Regeln dokumentieren; Schreibzeitpunkt festlegen |
| D20-Wrapper (`D20Roll`, `D20Die`), Bewegung, Tragkraft | doppeltes Umschreiben derselben Methoden | wenn möglich Hooks statt Wrapper; keine Wrapper auf dieselben Methoden ohne Not |
| Regel-Einstellungen | beide ändern dieselben dnd5e-Einstellungen | Änderungen sichtbar machen, nicht still überschreiben |

Q2 a (Kompatibilität mit verbreiteten Fremdmodulen bleibt Ziel) heißt hier: Verträglichkeit durch **Bauweise** (Hooks vor Wrappern, Einfügen statt Ersetzen), nicht durch eine Erkennungsfunktion (Q1 a: Konflikterkennung entfällt).

## Zusammenfassung
| Bereich | Verdict | Risiko |
|---|---|---|
| Ebene 1: Nachschlagewerk (170 Begriffe) | machbar | niedrig |
| Ebene 2: Regel-Einstellungen (etwa 25 regelrelevante von 45) | machbar | niedrig |
| 3a Konfigurationsüberschreibungen (134 Bereiche) | machbar | niedrig-mittel |
| 3b Hook-basierte Änderungen | machbar | mittel |
| 3c Wrapper-basierte Änderungen | machbar mit libWrapper (Fremdmodul) oder fragil | hoch |
| 3d Neue Regeln (Trigger → Aktion) | begrenzt machbar (endliche Bausteine) | mittel |
| Koexistenz mit Custom D&D 5e ≤ 4.1.2 | beherrschbar durch Bauweise; im Live-System nicht geprüft | mittel |

## Nicht blockierender offener Punkt
| # | Punkt | Auswirkung |
|---|---|---|
| N19 | Darf Eagle Ruling (und später Roll Out) **libWrapper** als Abhängigkeit nutzen (weit verbreitetes Fremdmodul für Methoden-Wrapper, meldet Konflikte), oder soll es ohne auskommen (dann nur Konfiguration, Hooks und eigene Mini-Wrapper)? E3 verlangt eine eigene Lösung für Bedingungen, sagt aber nichts zu Wrappern | Reichweite von Ebene 3c, Verträglichkeit mit anderen Modulen |

## Acceptance Criteria
- AC-M13-01: Jede Ebene aus Phase 2 hat eine Neubewertung mit Belegen (r1–r10)
- AC-M13-02: Die Frage "wird die Umsetzung einfacher?" und die Koexistenz (E2) sind beantwortet
- AC-M13-03: Die Korrektur der Ausgangslage (Custom D&D 5e für Foundry 13 verfügbar) ist dokumentiert
- AC-M13-04: Ergebnis und N19 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Zusammenspiel mit Custom D&D 5e 4.1.2 im Live-System nicht geprüft (Freigabe nötig) | medium | nein |
| R2 | Zählungen aus Zeilenauswertung | low | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

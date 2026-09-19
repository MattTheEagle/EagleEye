```
artifact: human-decision
milestone: M4
phase: MONITOR (geplanter Stopp)
status: decided
immutable: true
date: 2026-09-19
decided-by: Projektleiter
```

## Trigger / Reason
Geplanter Stopp laut `dadm/06-working-mode.md` und `dadm/04-milestone-plan.md` (M4): Beim Abgleich
von Vision und PDF sind Unklarheiten über die Absicht entstanden, die nur der Projektleiter klären
kann. Kein Governance-Trigger im engeren Sinn (kein Critical/Security/Scope-Fund).

## Blocking Summary
16 Fragen (Q0–Q15) zu Flight Control, Library, Character Edit, Homebrew, Journal, Roll Out und einer
Dokumentenfrage. Ohne Antworten wären M5–M14 in die falsche Richtung recherchiert worden.

## Options und Empfehlung
Optionen, Risiken und Empfehlungen je Frage: `dadm/m4-02-apply-output.md` (Abschnitt
Klärungsliste) und `dadm/spezifikationsabgleich.md`. Der Projektleiter ist bei allen Fragen mit
Ausnahme von Q8 (keine Empfehlung), Q9 Ort (keine Empfehlung) und Q12 (keine Empfehlung) der
Empfehlung gefolgt bzw. hat selbst gewählt (siehe unten).

## Evidence
- `dadm/m4-01-discover-output.md`, `dadm/m4-02-apply-output.md`, `dadm/m4-03-deploy-output.md`
- Antworten im Wortlaut: `dadm/reference/eagle-modules-aufbau.md`, Abschnitt "Antworten des
  Projektleiters zur Klärungsliste von M4"

## Final Human Decision
**approve** — Antworten wie folgt (Kurzform; Wortlaut und Ausformulierung in der Referenz):

| # | Entscheidung |
|---|---|
| Q0 | Die Vision gilt weiter, wo das PDF schweigt (außer bei einzeln gefragten Punkten); "Ursprungsplan" = Vision |
| Q1 | Kompatibilitätserkennung, Auswirkung von Einstellungsänderungen und Aktivieren/Deaktivieren von Abhängigkeiten entfallen ganz |
| Q2 | Kompatibilität der Eagle Module mit verbreiteten Fremdmodulen bleibt ein Ziel |
| Q3 | Alle Foundry-Änderungen laufen über Flight Control; die anderen Module haben nur Einbindung und UI |
| Q4 | Ausnahme für Klassen/Spezies/Subklassen/Backgrounds entfällt; alles einmal pro Version |
| Q5 | Logging und "Übertragung erzwingen" bleiben |
| Q6 | "Derselbe Eintrag" = gleicher Name im selben Eagle Compendium und in derselben Version |
| Q7 | Auswahl dient nur dem Kopieren; durchsucht wird nur die Eagle Library |
| Q8 | Freitext-Import zurückgestellt, nicht Teil dieses Plans |
| Q9 | Wann: sofort nach Wahl von Art und Unterkategorie (Live). Wo: immer beides, Welt-Dokument und Eintrag in der Eagle Library (auf Rückfrage bestätigt) |
| Q10 | "Edit with Eagle Homebrew" in Kopfzeile des Dokumentblatts und im Verzeichnis-Kontextmenü |
| Q11 | Level wird im Class-Tab festgelegt |
| Q12 | "Eagle Journal Note" = neuer Journal-Eintrag im Eagle-Journal-Vault |
| Q13 | Der Roll-Out-Vorab-Plan bewertet beide Wege (komplett eigen / auf bestehenden Modulen aufbauend); entschieden wird danach |
| Q14 | Die drei Dateinamen werden umbenannt |
| Q15 | "Gestartet" heißt: Oberfläche des Moduls öffnen |

## Folgen für die Milestones (Rahmen, keine Recherche-Ergebnisse)
| Milestone | Rahmen aus den Antworten |
|---|---|
| M5 Flight Control | Keine Funktionen zur Kompatibilitäts-/Auswirkungs-/Abhängigkeitserkennung (Q1). Der Anfragenkanal umfasst alle Foundry-Änderungen aller Eagle Module (Q3). Der Hub-Start öffnet die Oberfläche des Moduls (Q15). Fremdmodul-Kompatibilität als Anforderung an jedes Modul (Q2), nicht als Anbindung. Versionsverträglichkeit getrennter Repos bleibt eine technische Voraussetzung |
| M6 Bedingte Effekte | unabhängig von den Antworten (E3) |
| M7 Library Kopieren | Einmalig pro Version ohne Ausnahme (Q4); Log und Erzwingen (Q5); Kriterium Name + Compendium + Version (Q6); Auswahl nur zum Kopieren (Q7); Foundry-Zugriffe über Flight Control (Q3) |
| M8 Library Suche | Durchsucht wird nur die Eagle Library (Q7) |
| M9 Character Edit | Level im Class-Tab (Q11) |
| M10 Homebrew | Kein Freitext-Import (Q8); Objekt sofort angelegt, als Welt-Dokument und Library-Eintrag (Q9); Einstieg in Blatt-Kopfzeile und Verzeichnis (Q10). **Offene Detailfrage für M10:** Sind beide Einträge unabhängige Kopien oder verknüpft, und wie werden Änderungen abgeglichen? Sie ist ein Bewertungspunkt in M10; bleibt es dort eine Absichtsfrage, stoppt der Ablauf |
| M11 Journal | "Note" = Journal-Eintrag (Q12) |
| M14 Roll Out | Beide Wege werden bewertet (Q13) |
| M12, M13, M15 | keine Änderung |

## Folgeaufgaben, ausgeführt im Rahmen dieser Entscheidung
- **Q14:** Umbenennung in `dadm/reference/source-analysis/`, Links in `README.md` und
  `techniques-catalog.md` angepasst (0 kaputte Links):

  | alt | neu |
  |---|---|
  | `beak-importers.md` | `homebrew-importers.md` |
  | `prey-rules-customization.md` | `ruling-rules-customization.md` |
  | `wings-automation.md` | `roll-out-automation.md` |

  Die drei neuen Namen habe ich aus den Modulnamen abgeleitet; sie sind leicht änderbar. Der
  freigegebene Milestone Plan (`dadm/04-milestone-plan.md`) und die geschlossenen Outputs
  (`m3-*`, `m4-*`) nennen die alten Dateinamen weiter; sie bleiben unverändert (immutable), diese
  Tabelle löst die Verweise auf. Die Umbenennung erweitert das Ergebnis von M3 (in M3-Apply war
  "Dateinamen unverändert" als Regel R4 bis zu dieser Entscheidung festgelegt); ein neuer
  Milestone oder eine neue Plan-Version ist dafür nicht nötig, weil Frage und Entscheidung
  dokumentiert sind.

## Next Step
M4 ist geschlossen. Weiter mit **M5 — Eagle Flight Control: Machbarkeit des neuen Zuschnitts**.
M1 wartet weiter auf das ausdrückliche "Go".

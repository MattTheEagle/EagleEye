# Planungsphase 3 "Spezifikations-Update Eagle Modules" — Zusammenfassung

status: abgeschlossen und archiviert (2026-09-19)
retention: durable (Nachschlagematerial, keine aktive Konfiguration)

Nichts in diesem Ordner (Safety Boundaries, Scope Declaration, Milestone Plans, Working Mode) bindet einen künftigen Milestone Plan
automatisch. Verweise **innerhalb** der archivierten Dateien nennen die ursprünglichen Pfade `dadm/…`; sie liegen jetzt hier.

## Auftrag und Ergebnis
Auftrag: das PDF "Eagle Modules - Aufbau" (echte Modulnamen, konkretisierte Modulbeschreibungen, Aufträge zu Eagle Ruling und Eagle Roll Out)
gegen die bisherigen Machbarkeitsergebnisse abgleichen, Widersprüche klären, die Pläne aktualisieren. Es entstand kein Feature-Code; einziger Code-Eingriff war die Entfernung von Foundry v14 (M1).

Ergebnis (lebende Dokumente außerhalb des Archivs):
- `EAGLE-MODULES-PLAN.md` (Repo-Wurzel): eigenständige Fassung für Leser ohne Vorwissen
- `dadm/eagle-modules-projektplan.md`: technische Fassung mit Belegen
- `dadm/reference/eagle-modules-aufbau.md`: das PDF wortgetreu, alle Antworten und Klarstellungen des Projektleiters, Namenszuordnung
- `dadm/reference/source-analysis/`: Analyse zehn bestehender Foundry-Module, mit Korrektur zur Versionshistorie (Abschnitt 4) und den Auswertungsskripten

## Inhalt dieses Ordners
| Datei(en) | Inhalt |
|---|---|
| `01-project-brief.md` … `03-scope-declaration.md`, `06-working-mode.md` | Bootstrap-Artefakte (Entscheidungen E1–E8) |
| `04-milestone-plan.md` (Version 1), `04-milestone-plan-v2.md` (Version 2, mit M8a), `05-milestone-plan-approval*.md` | Milestone Plans und Freigaben |
| `m1-…` bis `m15-…`, `m8a-…` | je Milestone Discover-, Apply-, Deploy-, Monitor-Output |
| `m4-05-…`, `m8-05-…`, `m15-05-…`, `m15-06-human-decision-output.md` | Decision-Records (Fragen Q0–Q15, Punkte N1–N9, N10–N20, Bestätigung der Pläne mit N10b, N21, N22) |
| `spezifikationsabgleich.md` | Ergebnisdokument: Delta Vision ↔ PDF, Ergebnisse je Milestone, Fragen und Antworten |

## Wichtigste Ergebnisse
- Nur Foundry v13 (v14 gestrichen), nur eigene Eagle Module an Flight Control angebunden, alle Foundry-Änderungen über Flight Control, keine Lizenz, Klartext Englisch,
  libWrapper als einzige Fremdmodul-Abhängigkeit freigegeben.
- Alle sieben Module sind machbar; größte Risiken: Schnittstellenstabilität getrennter Repos, Umschreiben aller Verweise in der Library, Umfang der Homebrew-Editoren, Roll Out insgesamt.
- Korrektur einer früheren Aussage: Custom D&D 5e und weitere Module haben Releases für Foundry 13 (Versionsstände dort dokumentiert).
- Reihenfolge einer Umsetzung: Flight Control → Library → Journal/Ruling (Teile) → Character Edit → Homebrew → Ruling (tiefere Ebenen) → Roll Out.
- Live-Tests in Forge entscheidet der Projektleiter einzeln nach Bedarf.

## Nächster Schritt
Eine Umsetzungsphase braucht einen frischen DAD-M-Bootstrap (Project Brief, Safety Boundaries, Scope Declaration, Milestone Plan mit Approval, Working Mode).

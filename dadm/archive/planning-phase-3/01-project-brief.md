# Project Brief — EagleEye: Eagle Modules Spezifikations-Update (Planungsphase 3)

retention: durable
status: approved (2026-09-19, siehe 05-milestone-plan-approval.md)
Feld-Herkunft: `project_specific` (frisch erhoben aus dem PDF "Eagle Modules -
Aufbau" und den Antworten des Projektleiters vom 2026-09-19)

## Projektname
EagleEye — Planungsphase 3 "Spezifikations-Update Eagle Modules"

## Ausgangslage
Zwei Phasen sind abgeschlossen und archiviert; sie binden diese Phase nicht
automatisch:
- `dadm/archive/research-phase-1/` — Grundgerüst und Machbarkeit der
  Kernfunktionen (Code in `core/`, `v13/`, `v14/`)
- `dadm/archive/planning-phase-2/` — Machbarkeitsplanung der Vision (Ergebnis:
  `dadm/eagle-modules-projektplan.md`, `EAGLE-MODULES-PLAN.md`)

Dazu liegt Referenzmaterial vor: `dadm/reference/eagle-modules-vision.md`
(ursprüngliche Vision) und `dadm/reference/source-analysis/` (Analyse von zehn
bestehenden Foundry-Modulen).

Neu ist das PDF "Eagle Modules - Aufbau" des Projektleiters mit den
konkretisierten Modulbeschreibungen, den echten Modulnamen und zwei
Prüfaufträgen (Eagle Ruling, Eagle Roll Out), sowie seine Antworten auf die vier
offenen Fragen der Quellenanalyse.

## Ziel
Den im PDF festgehaltenen, konkretisierten Zuschnitt der Eagle Modules gegen die
bisherigen Machbarkeitsergebnisse abgleichen: Was ist unverändert, was neu, was
widersprüchlich? Dazu die vom Projektleiter genannten Prüfaufträge erledigen
(Eagle Ruling nach der Repo-Analyse neu bewerten, Vorab-Plan für Eagle Roll Out)
und den Projektplan auf den neuen Stand bringen. Unklarheiten werden nicht
interpretiert, sondern dem Projektleiter vorgelegt.

## Messbarer Endzustand
- Aktualisierter Projektplan (`dadm/eagle-modules-projektplan.md` und
  `EAGLE-MODULES-PLAN.md`) mit den echten Modulnamen und einer
  Machbarkeits-/Risikobewertung je Modul gegen die **neue** Spezifikation
- Neubewertung von Eagle Ruling und Vorab-Plan für Eagle Roll Out
- Alle in dieser Phase erkannten Unklarheiten sind vom Projektleiter geklärt und
  dokumentiert
- Codebasis ohne `v14/` (ausdrücklich freigegeben, einziger Code-Eingriff)

## Festgehaltene Entscheidungen des Projektleiters (Rahmen dieser Phase)
| # | Entscheidung | Quelle |
|---|---|---|
| E1 | Zielversion vorerst nur Foundry v13. v14 ist gecancelt und darf aus der Codebasis entfernt werden; evtl. viel später wieder | Antwort Q1, 2026-09-19 |
| E2 | Eagle Ruling existiert neben Custom D&D 5e und baut nicht darauf auf; das Repo wurde nur zur Analyse geschickt, ob die Umsetzung dadurch einfacher wird | Antwort Q2 + PDF |
| E3 | Bedingungen wie "nur gegen Kreaturtyp X": eigene Lösung, keine Fremdmodul-Abhängigkeit | Antwort Q3 |
| E4 | Lizenz vorerst keine (Hobbyprojekt für den Projektleiter und befreundete DMs) | Antwort Q4 |
| E5 | Echte Modulnamen statt Entwicklungsnamen (Tabelle unten). Die Umbenennung betrifft nur Dokumente, nicht Modul-ID, Manifest-Titel oder GitHub-Repo | PDF + Antwort AskUserQuestion |
| E6 | Eagle Flight Control bindet nur eigene Eagle Module an, keine Fremdmodule. Die Fremdmodul-Funktionen (Hub-Scan, Konflikt-Erkennung, Sprach-Erkennung für Fremdmodule) entfallen. Der bestehende Phase-1-Code bleibt in dieser Phase unangetastet | PDF + Antwort AskUserQuestion |
| E7 | Jedes Modul ist ein eigenes Modul mit eigenem GitHub-Repo, bewusst modular; weitere Module sollen später dazukommen | PDF |
| E8 | UI aller Module einheitlich im Stil der nativen Foundry-UI (gleiche Buttons, Schrift usw.) | PDF |

### Modulnamen
| Entwicklungsname | Modulname |
|---|---|
| Eagle Eye | Eagle Flight Control |
| Eagle Eyrie | Eagle Library |
| Eagle Egg | Eagle Character Edit |
| Eagle Beak | Eagle Homebrew |
| Eagle Talon | Eagle Journal |
| Eagle Prey | Eagle Ruling |
| Eagle Wings | Eagle Roll Out |

## Technologien / Umfeld
- Foundry VTT v13 auf Forge (Import Wizard bleibt Standardweg, siehe
  Phase 1). v14 ist raus (E1).
- dnd5e-Linie: die zu Foundry v13 passende (Testwelt: dnd5e 5.3.3).
  Dass dnd5e 6.x und Module, die Foundry 14 verlangen, damit nicht Ziel sind
  (höchstens Code-Referenz), hat der Projektleiter am 2026-09-19 bestätigt.
- Stack (TypeScript, esbuild, Vitest, Node 24) bleibt; für diese Phase nur beim
  Code-Milestone M1 relevant.
- Repo-Struktur (bisher Monorepo `core`/`v13`, künftig ein Repo pro Modul) ist
  **nicht** Thema dieser Phase; sie gehört in die Apply-Phase einer späteren
  Umsetzungsphase.

## Zeitrahmen
Irrelevant. Detailgrad hat Vorrang vor Tempo.

## Non-Goals
- Keine eigenständige Feature-Entwicklung der Module (kein Code außer M1)
- Keine Umsetzungsphase, keine Architekturentscheidung zur Repo-Struktur
- Keine Umbenennung von Modul-ID, Manifest-Titel, Code-Bezeichnern oder
  GitHub-Repo (E5)
- Kein Entfernen oder Umbauen der Fremdmodul-Funktionen im Phase-1-Code (E6)
- Keine Lizenzwahl, keine LICENSE-Datei (E4)
- Keine Fremdmodul-Abhängigkeit für Bedingungen einplanen (E3)
- Keine neuen GitHub-Repos anlegen
- v14 in dieser Phase nicht weiter betrachten (E1)
- Bei Unklarheiten fragen statt interpretieren (dauerhafte Arbeitsregel)

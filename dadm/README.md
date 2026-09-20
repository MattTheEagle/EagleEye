# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
**Es läuft keine Phase.** Die Umsetzungsphase 4 "Eagle Flight Control" (M1–M8, Planversion 2) ist abgeschlossen und archiviert (2026-09-20). Ihre Zusammenfassung steht in `archive/implementation-phase-4/SUMMARY.md`, die Gesamtprüfung in `archive/implementation-phase-4/m8-06-gesamtpruefung-output.md`.
Das Release 0.1.0 (Modul `eagleeye`, API `0.7.0`) ist vorbereitet und in Forge abgenommen, aber bewusst **nicht veröffentlicht** (Release-Entscheidung B vom 2026-09-20: vorbereitet lassen; nicht vor echten, an Flight Control angeschlossenen Modulen und Erfahrungswerten mit ihnen; das GitHub-Repo ist öffentlich); Tag, Push und GitHub-Release nur auf ausdrückliche Anweisung des Projektleiters, die Checkliste steht in `archive/implementation-phase-4/m8-04-monitor-output.md`.
Die nächste Umsetzungsphase (Empfehlung: Eagle Library) braucht einen frischen DAD-M-Bootstrap (Project Brief, Safety Boundaries, Scope Declaration, Milestone Plan mit Freigabe, Working Mode); die Übergabe steht in `uebergabe-naechste-phase.md`. **Erster Schritt dieses Bootstraps ist der Umbau des Workspaces** (Elternordner als Workspace-Wurzel, Modul-Repos strikt getrennt): `uebergabe-naechste-phase.md`, Abschnitt 7.
**Committet wird nur lokal und nur auf Anweisung des Projektleiters; gepusht ist bisher nichts** (Push nur auf seine Anweisung). Den Stand zeigen `git log origin/master..HEAD` und `git status`.

## Lebende Dokumente
| Datei | Inhalt |
|---|---|
| `uebergabe-naechste-phase.md` | Übergabe an die nächste Phase: Stand von Flight Control, Regeln für Verbraucher, offene Punkte, Empfehlung (lebend) |
| `eagle-modules-projektplan.md` | technischer Projektplan (Stand Planungsphase 3, bestätigt; in der Umsetzungsphase 4 an einer Stelle nachgeführt) |
| `../EAGLE-MODULES-PLAN.md` | eigenständig lesbare Fassung für Leser ohne Vorwissen (Stand von Hub und Anfragen nachgeführt) |
| `reference/eagle-modules-aufbau.md` | das PDF "Eagle Modules - Aufbau" wortgetreu, alle Antworten und Klarstellungen des Projektleiters, Namenszuordnung |
| `reference/eagle-modules-vision.md` | ursprüngliche Vision (mit den Entwicklungsnamen der Module) inkl. Klärungen aus dem damaligen Bootstrap |
| `reference/source-analysis/` | Analyse von zehn bestehenden Foundry-Modulen (Importer, Regelanpassung, Automatisierung), inkl. Versionshistorie (Abschnitt 4 der README) und Skripten der Verweis-Auswertung; Einstieg: `reference/source-analysis/README.md` |
| `bios.registry.json` | workspace-lokale BIOS-Capability-Registry; beim nächsten Bootstrap neu erzeugen (siehe unten) |

## Archiv
Abgeschlossene Phasen. Nichts darin bindet einen künftigen Milestone Plan automatisch; es ist reines Nachschlagematerial, keine aktive Konfiguration.
- `archive/research-phase-1/` — Grundgerüst und Machbarkeit der Kernfunktionen (Eagle Eye, jetzt Eagle Flight Control), inkl. `SUMMARY.md`
- `archive/planning-phase-2/` — Machbarkeitsplanung der Vision (Milestone Plan Version 2, M1–M10, reine Recherche)
- `archive/planning-phase-3/` — Spezifikations-Update Eagle Modules (Milestone Plan Version 2 mit M8a, M1–M15), inkl. `SUMMARY.md`, Decision-Records und Ergebnisdokument `spezifikationsabgleich.md`
- `archive/implementation-phase-4/` — Umsetzung von Eagle Flight Control (M1–M8, Planversion 2 mit M6a und M6b), inkl. `SUMMARY.md`, Live-Check-Nachträgen, Gesamtprüfung (`m8-06`), der Release-Checkliste (`m8-04`) und den Prüfskripten (`pruefskripte/`)

## `bios.registry.json`
Neu erzeugen mit:
```
python3 <framework_root>/runtime/build_bios_registry.py --repo-root .
```

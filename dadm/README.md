# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
**Keine Phase aktiv.** Die Planungsphase 3 "Spezifikations-Update Eagle Modules" ist abgeschlossen und archiviert (2026-09-19). Ihre Ergebnisse stehen in den
bestätigten Plänen; eine Umsetzungsphase braucht einen frischen DAD-M-Bootstrap (Project Brief, Safety Boundaries, Scope Declaration, Milestone Plan mit Approval, Working Mode).

## Lebende Dokumente
| Datei | Inhalt |
|---|---|
| `eagle-modules-projektplan.md` | technischer Projektplan (Stand Planungsphase 3, bestätigt) |
| `../EAGLE-MODULES-PLAN.md` | eigenständig lesbare Fassung für Leser ohne Vorwissen |
| `reference/eagle-modules-aufbau.md` | das PDF "Eagle Modules - Aufbau" wortgetreu, alle Antworten und Klarstellungen des Projektleiters, Namenszuordnung |
| `reference/eagle-modules-vision.md` | ursprüngliche Vision (mit den Entwicklungsnamen der Module) inkl. Klärungen aus dem damaligen Bootstrap |
| `reference/source-analysis/` | Analyse von zehn bestehenden Foundry-Modulen (Importer, Regelanpassung, Automatisierung), inkl. Versionshistorie (Abschnitt 4 der README) und Skripten der Verweis-Auswertung; Einstieg: `reference/source-analysis/README.md` |
| `bios.registry.json` | workspace-lokale BIOS-Capability-Registry; beim nächsten Bootstrap neu erzeugen (siehe unten) |

## Archiv
Abgeschlossene Phasen. Nichts darin bindet einen künftigen Milestone Plan automatisch; es ist reines Nachschlagematerial, keine aktive Konfiguration.
- `archive/research-phase-1/` — Grundgerüst und Machbarkeit der Kernfunktionen (Eagle Eye, jetzt Eagle Flight Control), inkl. `SUMMARY.md`
- `archive/planning-phase-2/` — Machbarkeitsplanung der Vision (Milestone Plan Version 2, M1–M10, reine Recherche)
- `archive/planning-phase-3/` — Spezifikations-Update Eagle Modules (Milestone Plan Version 2 mit M8a, M1–M15), inkl. `SUMMARY.md`, Decision-Records und Ergebnisdokument `spezifikationsabgleich.md`

## `bios.registry.json`
Neu erzeugen mit:
```
python3 <framework_root>/runtime/build_bios_registry.py --repo-root .
```

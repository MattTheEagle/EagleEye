# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
**Umsetzungsphase 4 "Eagle Flight Control" läuft.** Bootstrap abgeschlossen, Milestone Plan Version 1 (M1–M8) am 2026-09-19 freigegeben. Discover und Apply laufen
eigenständig, vor jedem Deploy wartet der Ablauf auf das "Go" (`06-working-mode.md`). Die drei früheren Phasen liegen unter `archive/`.
**Der Stand von M1 bis M4 ist lokal committet, aber nicht gepusht** (Push nur auf Anweisung des Projektleiters).

| Milestone | Stand | Artefakte | Live-Prüfung |
|---|---|---|---|
| M1 Phase-1-Code schneiden | abgeschlossen | `m1-01` bis `m1-04` | Startlog bestätigt (`m2-05`); Prüfung "altes Menü weg" offen (low) |
| M2 Modul-Anmeldung und Erkennung | abgeschlossen | `m2-01` bis `m2-05` | bestanden (`m2-05-live-check-output.md`, R1 geschlossen) |
| M3 Hub-Oberfläche mit UI-Leitfaden | abgeschlossen | `m3-01` bis `m3-04` | offen, gemeinsamer Check mit M4 |
| M4 Anfragekanal-Kern | abgeschlossen | `m4-01` bis `m4-04` | offen; Anleitung und Pakete: `m4-04-monitor-output.md`, `v13/dist/live-check/` |
| M5 GM-Weiterleitung | nächster Milestone | — | — |
| M6 bis M8 | offen | — | — |

## Aktive Phase (Bootstrap-Artefakte)
| Datei | Inhalt |
|---|---|
| `01-project-brief.md` | Ziel, messbarer Endzustand, Entscheidungen U1–U5, Non-Goals |
| `02-safety-boundaries.md` | Safety Boundaries (inherited plus Overrides Live-Test-Gate und Publizieren) |
| `03-scope-declaration.md` | Schreib-/Lesezugriff, ausdrücklich nicht im Scope |
| `04-milestone-plan.md` | Milestone Plan Version 1, M1–M8, Proofs, Rückverfolgung auf P-FC1–P-FC8 |
| `05-milestone-plan-approval.md` | Freigabe (immutable) |
| `06-working-mode.md` | `one_chat`, Autonomie-Regelung, Live-Tests, Commit/Push nur auf Anweisung |
| `m<N>-0<P>-<phase>-output.md` | Milestone-Outputs (`01` Discover, `02` Apply, `03` Deploy, `04` Monitor) |

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

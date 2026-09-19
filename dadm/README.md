# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
Die **Planungsphase 3 "Spezifikations-Update Eagle Modules"** ist **abgeschlossen** (2026-09-19): Milestone Plan Version 2 (M1–M15 und M8a) vollständig geliefert,
alle offenen Punkte N1–N22 beantwortet, die überarbeiteten Pläne (`../EAGLE-MODULES-PLAN.md`, `eagle-modules-projektplan.md`) vom Projektleiter bestätigt
(Decision-Records `m4-05-…`, `m8-05-…`, `m15-05-…`, `m15-06-human-decision-output.md`). Eine Umsetzungsphase braucht einen eigenen, frisch genehmigten Milestone Plan
(neuer Bootstrap); die Artefakte dieser Phase binden ihn nicht automatisch und sollten dann wie die früheren Phasen archiviert werden.

| Datei | Inhalt |
|---|---|
| `01-project-brief.md` … `06-working-mode.md` | Bootstrap-Artefakte dieser Phase (freigegeben; `05-...` ist die Approval); gültiger Plan ist `04-milestone-plan-v2.md` (Version 1 als Aufzeichnung) |
| `m<N>-01…04-*-output.md` | Discover-/Apply-/Deploy-/Monitor-Output je Milestone dieser Phase |
| `spezifikationsabgleich.md` | Ergebnisdokument dieser Phase (Delta Vision → Aufbau, Klärungsliste; wächst mit den Milestones) |
| `eagle-modules-projektplan.md` | technischer Projektplan, in M15 auf den Stand der Planungsphase 3 gebracht |
| `../EAGLE-MODULES-PLAN.md` | eigenständig lesbare Fassung für Leser ohne Vorwissen, in M15 aktualisiert |

## Referenzmaterial
- `reference/eagle-modules-vision.md` — ursprüngliche Vision (mit den
  Entwicklungsnamen der Module) inkl. Klärungen aus dem damaligen Bootstrap
- `reference/eagle-modules-aufbau.md` — Spezifikation "Eagle Modules - Aufbau"
  (PDF wortgetreu), Antworten des Projektleiters vom 2026-09-19, Entscheidungen
  E1–E8 und Namenszuordnung
- `reference/source-analysis/` — Analyse von zehn bestehenden Foundry-Modulen
  (Importer, Regelanpassung, Automatisierung); Einstieg:
  `reference/source-analysis/README.md`. Kein Milestone-Artefakt, ändert weder
  Plan noch Scope.

## Archiv
Abgeschlossene Phasen; nichts darin bindet einen künftigen Milestone Plan
automatisch — reines Nachschlagematerial, keine aktive Konfiguration.
- `archive/research-phase-1/` — Grundgerüst und Machbarkeit der
  Kernfunktionen von Eagle Flight Control (ehemals Eagle Eye), inkl. `SUMMARY.md`
- `archive/planning-phase-2/` — Machbarkeitsplanung der Vision (Milestone Plan
  Version 2, M1–M10, reine Recherche): Bootstrap-Artefakte samt beider
  Approvals und alle Milestone-Outputs

## `bios.registry.json`
Workspace-lokale BIOS-Capability-Registry (lokale Skills/Agents/Config-Stand),
unabhängig von Milestone-Plan-Phasen. Bei Bedarf neu erzeugen mit:
```
python3 <framework_root>/runtime/build_bios_registry.py --repo-root .
```

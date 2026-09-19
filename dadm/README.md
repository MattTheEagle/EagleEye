# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
Die Planungsphase "Eagle Modules Machbarkeit" (Milestone Plan Version 2,
M1–M10, reine Recherche ohne Code) ist abgeschlossen und vom Projektleiter
bestätigt. Ihre Artefakte liegen direkt hier:

| Datei(en) | Inhalt |
|---|---|
| `01-project-brief.md` … `06-working-mode.md` | Bootstrap-Artefakte dieser Phase (Approval v1 und v2: `05-milestone-plan-approval*.md`) |
| `m1-*` … `m10-*` | je Milestone Discover-/Apply-/Deploy-/Monitor-Output |
| `eagle-modules-projektplan.md` | fortlaufend gewachsenes Ergebnisdokument mit Synthese |
| `../EAGLE-MODULES-PLAN.md` | eigenständig lesbare Fassung für Leser ohne Vorwissen |

Ein neuer Milestone Plan (z. B. eine Umsetzungsphase) durchläuft einen
frischen DAD-M-Bootstrap; die hier liegenden Artefakte binden ihn nicht
automatisch.

## Referenzmaterial
- `reference/eagle-modules-vision.md` — Quelldokument der Eagle-Modules-Vision
  inkl. Klärungen aus dem Bootstrap
- `reference/source-analysis/` — Analyse von zehn bestehenden Foundry-Modulen
  (Importer, Regelanpassung, Automatisierung) als Grundlage für die Umsetzung;
  Einstieg: `reference/source-analysis/README.md`. Kein Milestone-Artefakt,
  ändert weder Plan noch Scope.

## Archiv
`archive/research-phase-1/` enthält alle Bootstrap- und Milestone-Artefakte
der ersten Forschungsphase (Grundgerüst und Machbarkeit der Eagle-Eye-
Kernfunktionen), inklusive `SUMMARY.md` als kompakte Übersicht.
**Wichtig:** Nichts darin (Safety Boundaries, Scope Declaration etc.) bindet
einen künftigen Milestone Plan automatisch — es ist reines
Nachschlagematerial, keine aktive Konfiguration.

## `bios.registry.json`
Workspace-lokale BIOS-Capability-Registry (lokale Skills/Agents/Config-Stand),
unabhängig von Milestone-Plan-Phasen. Bei Bedarf neu erzeugen mit:
```
python3 <framework_root>/runtime/build_bios_registry.py --repo-root .
```

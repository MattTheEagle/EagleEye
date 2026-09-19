# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
Kein aktiver Milestone Plan. Research Phase 1 (M1–M7) ist abgeschlossen und
archiviert, siehe `archive/research-phase-1/`. Ein neuer Milestone Plan
durchläuft einen frischen DAD-M-Bootstrap (Project Brief, Safety Boundaries,
Scope Declaration, Milestone Plan, Approval, Working Mode) direkt hier in
`dadm/` — unabhängig von dem, was im Archiv steht.

## Archiv
`archive/research-phase-1/` enthält alle Bootstrap- und Milestone-Artefakte
der ersten Forschungsphase, inklusive `SUMMARY.md` als kompakte Übersicht.
**Wichtig:** Nichts darin (Safety Boundaries, Scope Declaration etc.) bindet
einen künftigen Milestone Plan automatisch — es ist reines
Nachschlagematerial, keine aktive Konfiguration.

## `bios.registry.json`
Workspace-lokale BIOS-Capability-Registry (lokale Skills/Agents/Config-Stand),
unabhängig von Milestone-Plan-Phasen. Bei Bedarf neu erzeugen mit:
```
python3 <framework_root>/runtime/build_bios_registry.py --repo-root .
```

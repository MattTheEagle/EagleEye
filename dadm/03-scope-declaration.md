# Scope Declaration — EagleEye (Eagle Modules Planungsphase)

retention: durable

Alles, was hier nicht aufgeführt ist, gilt per Default als off-limits.

## Schreibzugriff (aktiver Scope dieser Phase)
- `./dadm/` — Projekt-Artefakte dieser Phase (Bootstrap, Milestone-Discover-/
  Apply-/Deploy-/Monitor-Outputs, finaler Projektplan)
- `./dadm/reference/` — Referenzmaterial (Vision-Dokument, ggf. weitere
  Recherche-Notizen)

## Lesezugriff (Recherche, keine Änderung)
- `./core/`, `./v13/`, `./v14/`, `./test-fixtures/` — bestehender Code aus
  Research Phase 1, als Grundlage/Kontext für die Machbarkeitsanalyse
  (insbesondere `core/manifest-scanner.ts`, `core/settings-hub.ts`,
  `core/conflict-watch.ts`, `core/language-scan.ts` — direkt relevant für
  Eagle Eyes bereits erforschte Fähigkeiten)
- `foundry-vtt-reference-v13/`, `foundry-vtt-reference-v14/` (extern, per
  `.foundry-workspace.yaml` in `v13/`/`v14/`)
- Öffentliche externe Quellen (z. B. `github.com/foundryvtt/dnd5e` für
  Eagle-Prey- und Eagle-Egg-Recherche), rein lesend

## Explizit NICHT im Scope dieser Phase (Non-Goal-Absicherung)
- **Keine Schreibzugriffe auf `./core/`, `./v13/`, `./v14/`,
  `./test-fixtures/`** — diese Phase produziert keinen Code, nur Analyse
  (siehe Project Brief Non-Goals)
- Andere Projektordner unter `/run/media/matt/Data/matt/Coding` (nur
  read-only Recherche gemäß Safety Boundaries)
- Die produktive Forge-Instanz (kein Live-Test in dieser Phase vorgesehen)

# Scope Declaration — EagleEye (Planungsphase 3: Spezifikations-Update)

retention: durable
status: approved (2026-09-19, siehe 05-milestone-plan-approval.md)

Alles, was hier nicht aufgeführt ist, gilt per Default als off-limits.

## Schreibzugriff (aktiver Scope dieser Phase)
- `./dadm/` — Artefakte dieser Phase (Bootstrap, Milestone-Outputs, das
  Ergebnisdokument `dadm/spezifikationsabgleich.md`, `dadm/README.md`)
- `./dadm/reference/` — Referenzmaterial (u. a. neu: transkribierte
  Spezifikation "Aufbau"; Namenshinweis im Vision-Dokument; Namensumstellung
  in `source-analysis/`)
- `./dadm/eagle-modules-projektplan.md`, `./EAGLE-MODULES-PLAN.md`, `./README.md`
  — lebende Dokumente: Umstellung auf die echten Modulnamen (M3) und
  inhaltliche Aktualisierung (M15)
- **Nur für M1 (Code):** Löschen von `./v14/`; in `./package.json` nur die
  Skripte `build`, `build:v14`, `typecheck`, `typecheck:v14`; in `./README.md`
  die v14-Erwähnung

## Lesezugriff (Recherche, keine Änderung)
- `./core/`, `./v13/`, `./test-fixtures/` — bestehender Code als Kontext
- `foundry-vtt-reference-v13/` (extern, per `v13/.foundry-workspace.yaml`);
  `foundry-vtt-reference-v14/` nur, falls ein Vergleich nötig wird
- Öffentliche externe Quellen (dnd5e-Repo, die zehn analysierten Modul-Repos),
  rein lesend
- Archivierte Artefakte unter `dadm/archive/` (Nachschlagen, nicht ändern)

## Explizit NICHT im Scope dieser Phase
- Änderungen an `./core/`, `./v13/`, `./test-fixtures/` — der Phase-1-Code
  bleibt unangetastet, auch die Fremdmodul-Funktionen (Entscheidung E6)
- Umbenennung von Modul-ID (`eagleeye`), Manifest-Titel, Code-Bezeichnern oder
  GitHub-Repo (E5)
- Anlegen neuer GitHub-Repos, GitHub-Releases, Forge-Live-Tests
- LICENSE-Datei oder Lizenzhinweise im Repo (E4)
- Inhaltliche Änderungen an archivierten Artefakten (immutable)
- Änderungen im extern liegenden `foundry-vtt-reference-v14/`
- Andere Projektordner unter `/run/media/matt/Data/matt/Coding`

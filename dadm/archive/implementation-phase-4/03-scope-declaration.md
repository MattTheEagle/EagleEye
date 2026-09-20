# Scope Declaration — EagleEye (Umsetzungsphase 4: Eagle Flight Control)

retention: durable
status: approved (2026-09-19, siehe 05-milestone-plan-approval.md)

Alles, was hier nicht aufgeführt ist, gilt per Default als off-limits.

## Schreibzugriff (aktiver Scope dieser Phase)
- `./core/`, `./v13/` — Code von Flight Control, inklusive Tests. Dazu gehören
  Umbau und Löschen der Fremdmodul-Funktionen, sobald M1 (Apply) den Zuschnitt
  entschieden und der Projektleiter das "Go" für den Deploy gegeben hat.
  `./v13/module.json` (Metadaten, Version, `relationships`) und
  `./v13/tsconfig.json` gehören dazu. Build-Ausgabe `./v13/dist/` ist
  gitignoriert und darf erzeugt werden.
- `./test-fixtures/` — soweit für Vitest nötig (Anpassen oder Entfernen nach M1)
- `./package.json` — nur Skripte und Metadaten (z. B. `description`);
  **keine Dependency-Änderung** (freigabepflichtig). `package-lock.json` wird
  nur von einer freigegebenen Dependency-Änderung berührt.
- `./README.md` — Stand und Beschreibung
- `./docs/` — neu, nur für den API-Vertrag und den UI-Leitfaden (Ablage im
  Repo, damit spätere Modul-Repos sie lesen können). Der genaue Ort wird im
  Apply von M1 bestätigt.
- `./dadm/` — Prozess-Artefakte dieser Phase (Bootstrap, Milestone-Outputs,
  `dadm/README.md`, `dadm/bios.registry.json`)
- `./.foundry-workspace.yaml` — neu (Foundry-Referenz, `foundry_version: 13`)

## Lesezugriff (Recherche, keine Änderung)
- `./dadm/reference/` und `./dadm/archive/` (Nachschlagen; archivierte Artefakte
  sind `immutable`)
- `./EAGLE-MODULES-PLAN.md` und `./dadm/eagle-modules-projektplan.md`
  (bestätigte Pläne). Nachführen (z. B. Verifikationsstatus) nur als
  ausdrücklich benannter Schritt mit Freigabe des Projektleiters.
- `foundry-vtt-reference-v13/` (extern, `cheat-sheet.md` und `types/`)
- Öffentliche externe Quellen, rein lesend (dnd5e-Repo, Vorbild-Module wie
  Midi-QOL und Custom D&D 5e für das API-Muster)

## Publizieren (nach Override in `02-safety-boundaries.md`)
- Nur `github.com/MattTheEagle/EagleEye`; Releases nur bei echten
  Milestone-Abschlüssen (Hybrid-Workflow) und nur auf ausdrückliche Anweisung.

## Explizit NICHT im Scope dieser Phase
- Code oder Artefakte anderer Eagle Module
- Anbindung von Fremdmodulen (E6)
- Umbenennung von Modul-ID (`eagleeye`), Manifest-Titel oder GitHub-Repo
- Neue GitHub-Repos; Publizieren außerhalb des freigegebenen Repos
- Forge-Live-Tests und Quench-Läufe ohne ausdrückliche Freigabe (jedes Mal)
- Dependency-Änderungen, Paket-Installationen, Änderungen an `node_modules/`
- LICENSE-Datei oder Lizenzhinweise (keine Lizenz)
- Inhaltliche Änderungen an archivierten Artefakten (`immutable`)
- Änderungen im extern liegenden `foundry-vtt-reference-v13/` ohne Freigabe
- Andere Projektordner unter `/run/media/matt/Data/matt/Coding`
- Foundry v14

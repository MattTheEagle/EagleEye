# EagleEye

Foundry-VTT-Modul als Kommunikationsschnittstelle zwischen eigenen Modulen,
Fremdmodulen, TTRPG-Systemen und Foundry VTT selbst — Forschungs-/Testprojekt,
primär zur Unterstützung eigener DnD5e-Module.

Entwickelt parallel gegen Foundry v13 und v14 (siehe `v13/` und `v14/`), mit
gemeinsamer Logik unter `core/`.

Projekt-Prozess (DAD-M) und alle Entscheidungs-/Planungsartefakte: siehe `dadm/`.
Research Phase 1 (M1–M7) ist abgeschlossen und archiviert unter
`dadm/archive/research-phase-1/` (Kurzfassung: `SUMMARY.md` darin).

Die größere Vision ("Eagle Modules" — Eagle Eye als Kernmodul plus sechs
weitere, aufeinander abgestimmte Module) samt Machbarkeitsprüfung je Modul:
siehe [`EAGLE-MODULES-PLAN.md`](./EAGLE-MODULES-PLAN.md) — verständlich auch
ohne Vorwissen zum Projekt.

## Build

Voraussetzung: Node.js 24.

```
npm install
npm run build       # baut beide Versionen
npm run typecheck   # Typprüfung beider Versionen gegen die gepinnten Foundry-Types
npm run test        # Vitest-Suite (core/-Logik, ohne Foundry-Laufzeit)
```

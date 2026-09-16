# EagleEye

Foundry-VTT-Modul als Kommunikationsschnittstelle zwischen eigenen Modulen,
Fremdmodulen, TTRPG-Systemen und Foundry VTT selbst — Forschungs-/Testprojekt,
primär zur Unterstützung eigener DnD5e-Module.

Entwickelt parallel gegen Foundry v13 und v14 (siehe `v13/` und `v14/`), mit
gemeinsamer Logik unter `core/`.

Projekt-Prozess (DAD-M) und alle Entscheidungs-/Planungsartefakte: siehe `dadm/`.

## Build

Voraussetzung: Node.js 24.

```
npm install
npm run build       # baut beide Versionen
npm run typecheck   # Typprüfung beider Versionen gegen die gepinnten Foundry-Types
```

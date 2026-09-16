```
artifact: apply-output
milestone: M1
phase: APPLY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m1-01-discover-output.md` (geschlossen, alle Blocker aufgelöst)
- `dadm/01-project-brief.md`, `02-safety-boundaries.md`, `03-scope-declaration.md`,
  `04-milestone-plan.md`
- Foundry-Manifest-Schema-Fakten aus `foundry-vtt-reference-v13/types/src/foundry/common/packages/base-package.d.mts`
  und `base-module.d.mts` (Pflichtfelder: `id`, `title`, `description`, `authors`;
  `version`/`compatibility` auf Modul-Ebene definiert, um Konflikt mit World-Schema
  zu vermeiden)

## Solution Design

### Architektur-Übersicht
```
EagleEye/
├── package.json          (Root-Package, zwei Build-Skripte)
├── tsconfig.base.json     (gemeinsame Compiler-Optionen)
├── core/
│   └── index.ts           (gemeinsame Logik — für M1 nur ein Platzhalter-Export)
├── v13/
│   ├── module.ts           (Entry-Point, importiert aus ../core)
│   ├── module.json         (Foundry-Manifest v13)
│   ├── tsconfig.json        (extends ../tsconfig.base.json, Types-Pfad -> v13-reference)
│   ├── .foundry-workspace.yaml  (foundry_version: 13)
│   └── dist/module.js       (esbuild-Output, [BUILD-ARTEFAKT, nicht in Deploy von Hand geschrieben])
├── v14/
│   ├── module.ts
│   ├── module.json          (Foundry-Manifest v14)
│   ├── tsconfig.json         (extends ../tsconfig.base.json, Types-Pfad -> v14-reference)
│   ├── .foundry-workspace.yaml  (foundry_version: 14)
│   └── dist/module.js
├── .gitignore              (u. a. node_modules/, dist/)
├── README.md
└── dadm/                   (bereits vorhanden — Prozess-Artefakte)
```

Ein Root-`package.json` statt npm-Workspaces/Monorepo-Tooling (z. B. Turborepo) —
für zwei Build-Ziele mit einem gemeinsamen `core`-Ordner ist das ausreichend und
vermeidet unnötige Tooling-Komplexität (Non-Goal-nahe: kein Overhead ohne Bedarf).

### Build-Design
- Zwei esbuild-Aufrufe, je einer pro Version, mit `v13/module.ts` bzw.
  `v14/module.ts` als Entry-Point und Bundling (inkl. `core/`) nach
  `v13/dist/module.js` bzw. `v14/dist/module.js`.
- `package.json`-Skripte: `build:v13`, `build:v14`, `build` (beide).
- Jede Version hat ein eigenes `tsconfig.json`, das die passenden gepinnten Types
  referenziert (`foundry-vtt-reference-v13/types` bzw. `-v14/types`) — dadurch
  bekommt `core/`-Code beim Bauen für v13 und v14 jeweils die korrekten
  Typ-Signaturen, ohne dass zwei Kopien des Quellcodes nötig sind.

### Manifest-Design (`module.json`, pro Version)
Pflichtfelder laut Foundry-Schema (`base-package.d.mts`/`base-module.d.mts`):
```json
{
  "id": "eagleeye",
  "title": "EagleEye",
  "description": "Kommunikationsschnittstelle zwischen eigenen Modulen, Fremdmodulen, Systemen und Foundry VTT (Forschungsprojekt).",
  "version": "0.0.1",
  "authors": [{ "name": "<Projektleiter>" }],
  "compatibility": { "minimum": "13" },   // v14-Manifest: "minimum": "14"
  "esmodules": ["dist/module.js"]
}
```
`compatibility.verified` wird als [TBD] offengelassen, bis ein echter Ladetest auf
Forge stattgefunden hat (siehe Open TBDs, T2).

### `.foundry-workspace.yaml` je Version
```yaml
foundry_version: 13   # bzw. 14 in v14/
```
`reference_root` wird nicht gesetzt — Default aus der globalen CLAUDE.md greift.

**Abweichung von der globalen Konvention (dokumentiert, vom Projektleiter
bestätigt):** Die globale Regel sagt "Datei im Projekt-Root". Hier liegen bewusst
zwei Dateien in `./v13/` und `./v14/` statt einer im EagleEye-Root, weil das Projekt
beide Foundry-Versionen parallel anvisiert und ein einzelnes `foundry_version`-Feld
das nicht abbilden kann. Siehe Risks R1.

### Node-Installation (Deploy-Vorgehen, keine Architekturentscheidung)
System-weite Installation von Node.js 24 über den Paketmanager der Distribution;
falls die Distro-Repos keine 24.x-Version führen, Fallback auf das offizielle
NodeSource-Setup-Skript. Freigegeben durch Projektleiter für System-weite
Installation (siehe Discover Q1).

## Acceptance Criteria
```
AC-M1-01: `node --version` meldet 24.x nach Deploy (system-weit installiert).
AC-M1-02: `npm run build:v13` erzeugt `v13/dist/module.js` ohne Build-Fehler.
AC-M1-03: `npm run build:v14` erzeugt `v14/dist/module.js` ohne Build-Fehler.
AC-M1-04: Projektleiter bestätigt (Terminal-/Konsolen-Beleg), dass das v13-Modul
          in einer Forge-Instanz fehlerfrei lädt.
AC-M1-05: Projektleiter bestätigt analog für das v14-Modul.
AC-M1-06: Git-Repository in EagleEye ist initialisiert mit einem initialen Commit,
          der das Grundgerüst enthält.
```

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | `.foundry-workspace.yaml` liegt in `./v13/` und `./v14/` statt im Projekt-Root — Abweichung vom Wortlaut der globalen CLAUDE.md-Regel, bewusst und vom Projektleiter bestätigt | info | no |
| R2 | Exakte Node-24-Installationsmethode auf diesem System noch nicht geprüft (Paketmanager-Verfügbarkeit) | low | no |
| R3 | `compatibility.verified` kann erst nach echtem Forge-Ladetest final gesetzt werden | low | no |
| R4 | v14-API-Volatilität und v13/v14-Unterschiede (aus Discover R2/R3) bleiben bestehen | medium | no (bereits akzeptiert) |

## Open TBDs

| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Konkrete Node-24-Installationsmethode auf diesem System ermitteln (Paketmanager prüfen) | blocking (für AC-M1-01) | KI, in Deploy |
| T2 | `compatibility.verified` final setzen nach erfolgreichem Forge-Ladetest | important | Projektleiter + KI |

## Next Step
Deploy beginnt mit der Node-24-Installation (system-weit, bereits freigegeben),
gefolgt vom Anlegen des Grundgerüsts (git init, `package.json`, `core/`/`v13/`/`v14`
inkl. Build-Configs und Manifesten) gemäß obigem Design.

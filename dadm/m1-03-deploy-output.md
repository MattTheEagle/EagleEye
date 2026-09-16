```
artifact: deploy-output
milestone: M1
phase: DEPLOY
status: incomplete
date: 2026-09-17
```

## Input Summary
- `dadm/m1-02-apply-output.md` (geschlossen, Design für Grundgerüst/Build/Manifeste)
- Freigaben aus Discover: system-weite Node-24-Installation (Q1), manueller
  Forge-Proof durch Projektleiter (Q2)

## Implementation Summary
- Monorepo-Grundgerüst angelegt: `core/`, `v13/`, `v14/`, Root-`package.json`,
  `tsconfig.base.json`
- Je Version: `module.ts` (Entry-Point, Hook `init`), `module.json` (Manifest),
  `tsconfig.json` (referenziert gepinnte Foundry-Types via `include`), eigene
  `.foundry-workspace.yaml` (`foundry_version: 13` bzw. `14`)
- Node.js 24 (`nodejs-lts-krypton`, `v24.21.0`) + npm (`12.0.2`) system-weit
  installiert (vom Projektleiter selbst ausgeführt nach Paketdatenbank-Refresh)
- `npm install` durchgeführt (esbuild, typescript als devDependencies); esbuild-
  Postinstall über `npm install-scripts approve esbuild` freigegeben (Standard-
  Downloadverhalten von esbuild, keine Abweichung vom vereinbarten Tech-Stack)
- `npm run build` erfolgreich für beide Versionen (`v13/dist/module.js`,
  `v14/dist/module.js`)
- `npm run typecheck` erfolgreich für beide Versionen — bestätigt, dass die
  `include`-basierte Referenzierung der gepinnten Types (statt npm-Dependency)
  funktioniert, ohne Namenskonflikt zwischen den beiden
  `@league-of-foundry-developers/foundry-vtt-types`-Versionen
- Git-Repository initialisiert, zwei Commits (Grundgerüst; Toolchain-Install +
  Verifikation)

## Files Changed
- `.gitignore`, `README.md`, `package.json`, `package-lock.json`,
  `tsconfig.base.json`
- `core/index.ts`
- `v13/module.ts`, `v13/module.json`, `v13/tsconfig.json`,
  `v13/.foundry-workspace.yaml`
- `v14/module.ts`, `v14/module.json`, `v14/tsconfig.json`,
  `v14/.foundry-workspace.yaml`
- (build-generiert, nicht getrackt: `v13/dist/module.js`, `v14/dist/module.js`,
  `node_modules/`)

## Proofs
- `npm run build` — Log siehe Terminal, beide Bundles ohne Fehler erzeugt (238 B je
  Version)
- `npm run typecheck` — keine Ausgabe = keine Typfehler, beide Versionen
- `node --version` → `v24.21.0`, `npm --version` → `12.0.2`
- **Ausstehend:** Forge-Ladetest v13/v14 — manuell durch Projektleiter,
  Terminal-/Konsolen-Beleg folgt (siehe Discover Q2)

## Acceptance Checklist
- [x] AC-M1-01: Node 24.x installiert
- [x] AC-M1-02: `npm run build:v13` fehlerfrei
- [x] AC-M1-03: `npm run build:v14` fehlerfrei
- [ ] AC-M1-04: v13-Modul lädt fehlerfrei auf Forge (Projektleiter-Beleg ausstehend)
- [ ] AC-M1-05: v14-Modul lädt fehlerfrei auf Forge (Projektleiter-Beleg ausstehend)
- [x] AC-M1-06: Git-Repo initialisiert mit initialem Commit

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | esbuild-Postinstall mit `npm install-scripts approve` freigegeben (lädt offizielles Plattform-Binary von esbuild) | info | no |
| R2 | `compatibility.verified` in beiden Manifesten noch nicht final gesetzt (siehe Apply T2) — folgt nach Forge-Ladetest | low | no |

## Next Step
Projektleiter lädt `v13/` (Inhalt: `module.json` + `dist/module.js`) und `v14/`
(analog) manuell auf die Forge-Instanz hoch und bestätigt hier mit Terminal-/
Konsolen-Beleg, ob beide fehlerfrei laden (AC-M1-04, AC-M1-05). Danach wird dieses
Deploy-Output geschlossen und M1 geht in Monitor.

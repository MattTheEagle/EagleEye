```
artifact: deploy-output
milestone: M1
phase: DEPLOY
status: complete
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
- v13-Forge-Ladetest (Projektleiter, manuell hochgeladen, reale Welt mit D&D5e-
  System + mehreren Fremdmodulen, u. a. libWrapper): Konsolen-Log zeigt
  `module.js:4 eagleeye | ready (Foundry v13)` ohne zugehörige Fehler. Der einzige
  Konsolenfehler (404 für ein `beyond20`-Icon) gehört zu einem fremden Modul, nicht
  zu EagleEye.
- v14-Forge-Ladetest (Projektleiter, manuell hochgeladen, reale Welt mit D&D5e-
  System): Konsolen-Log zeigt `module.js:4 eagleeye | ready (Foundry v14)` ohne
  zugehörige Fehler. Die beiden im Log sichtbaren `Error:`-Einträge stammen aus
  Forges eigenem Bundle (`ForgeVTTFilePicker.mjs`/`ForgeCompatibility.mjs`, Meldung
  zur `FilePicker`-Namespace-Migration in v13→v15) — nicht von EagleEye verursacht.

## Acceptance Checklist
- [x] AC-M1-01: Node 24.x installiert
- [x] AC-M1-02: `npm run build:v13` fehlerfrei
- [x] AC-M1-03: `npm run build:v14` fehlerfrei
- [x] AC-M1-04: v13-Modul lädt fehlerfrei auf Forge (Beleg: Konsolen-Log, s. o.)
- [x] AC-M1-05: v14-Modul lädt fehlerfrei auf Forge (Beleg: Konsolen-Log, s. o.)
- [x] AC-M1-06: Git-Repo initialisiert mit initialem Commit

Alle M1-Acceptance-Criteria erfüllt.

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | esbuild-Postinstall mit `npm install-scripts approve` freigegeben (lädt offizielles Plattform-Binary von esbuild) | info | no |
| R2 | Forges eigenes Bundle wirft `FilePicker`-Deprecation-Warnings (Fremdcode, nicht EagleEye) — nur als Umgebungsrauschen vermerkt, keine Aktion nötig | info | no |

## Open TBDs (aus Apply übernommen, jetzt aufgelöst)
- T1 (Node-Installationsmethode): **resolved** — `nodejs-lts-krypton` via pacman
- T2 (`compatibility.verified` final setzen): **resolved** — auf `"13"` bzw. `"14"`
  gesetzt nach erfolgreichem Ladetest (siehe `v13/module.json`, `v14/module.json`)

## Next Step
Deploy für M1 ist geschlossen. Weiter mit Monitor für M1.

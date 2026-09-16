```
artifact: discover-output
milestone: M1
phase: DISCOVER
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/01-project-brief.md` bis `dadm/06-working-mode.md` (Bootstrap-Artefakte)
- `.dadm-workspace.yaml` (Safety Boundaries inkl. Override, Working Mode)
- Lokale Systemprüfung (Bash): `node`, `npm`, `git` Verfügbarkeit
- `foundry-vtt-reference-v13/README.md`, `foundry-vtt-reference-v14/README.md`,
  `breaking-changes-v13-to-v14.md`
- Verzeichnisinhalt `./` (EagleEye-Projektordner)

## Current-State Summary
- EagleEye-Projektordner: nur `dadm/` (Bootstrap-Artefakte) und
  `.dadm-workspace.yaml` vorhanden. Kein `core/`, `v13/`, `v14/`, kein Build-Setup.
  **relevant**
- Kein Git-Repository in EagleEye initialisiert. **relevant** (M1-Scope)
- Kein lokaler Foundry-VTT-Server vorhanden; Testing/Deployment ausschließlich über
  Forge-Cloud (bereits im Project Brief festgehalten). **relevant**
- Node.js/npm sind auf diesem Rechner **nicht installiert** (`command not found`).
  **relevant, blockierend für Build-Tooling**
- Git ist lokal vorhanden (2.55.0). **relevant, kein Hindernis**

## Inventory

| # | Name | Beschreibung | Ort | Status |
|---|---|---|---|---|
| I1 | EagleEye-Projektordner | Zielverzeichnis des Moduls | `.` | present (leer bis auf dadm/) |
| I2 | Bootstrap-Artefakte | Brief, Safety Boundaries, Scope, Plan, Approval, Working Mode | `dadm/01-06` | present |
| I3 | foundry-vtt-reference-v13 | Gepinnte Types (Tag `v13.345.1`), Cheat-Sheet leer | reference_root v13 | present |
| I4 | foundry-vtt-reference-v14 | Types auf `main`-HEAD (Commit `fe5da5e6`, meldet `14.366.0`), kein fester Tag; Breaking-Changes-Doku vorhanden; Cheat-Sheet leer | reference_root v14 | present |
| I5 | `.foundry-workspace.yaml` | Aktiviert die Foundry-Referenz-Nutzung; erwartet laut CLAUDE.md genau **ein** `foundry_version`-Feld | EagleEye-Root | missing |
| I6 | Bestehender Forge-Deploy-Workflow des Projektleiters | Wie bisher eigene Module auf Forge installiert wurden | (nur mündlich erwähnt) | unclear/nicht dokumentiert |

## Dependencies

| # | Dependency | Version | Status |
|---|---|---|---|
| D1 | Node.js | 24 (v14-Pflicht, laut Project Brief für beide Versionen einheitlich) | **missing** |
| D2 | npm (oder anderer Paketmanager) | unklar, noch nicht festgelegt | missing |
| D3 | TypeScript | Version noch nicht festgelegt | missing |
| D4 | esbuild | Version noch nicht festgelegt | missing |
| D5 | foundry-vtt-types (v13) | gepinnt `v13.345.1` | present (extern, reference_root) |
| D6 | foundry-vtt-types (v14) | gepinnt `main`@`fe5da5e6` (meldet `14.366.0`), kein dedizierter Tag | present (extern, reference_root) |
| D7 | git | 2.55.0 | present |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Node.js/npm sind lokal nicht installiert; Node-24-Toolchain aus dem Project Brief kann noch nicht aufgesetzt werden | medium | **resolved** — system-weite Installation von Projektleiter freigegeben (siehe Q1) |
| R2 | Foundry v14 befindet sich noch in aktivem Test-Build-Zyklus (kein fester Tag, Stand 2026-09-06/14.366.0); API kann sich vor finalem Release noch ändern | medium | no (bekanntes, akzeptiertes Risiko der Parallel-Strategie aus dem Project Brief) |
| R3 | v13/v14-API-Unterschiede (bestätigt u. a. durch entfernte `MeasuredTemplate` in v14) könnten gemeinsamen `core`-Code erschweren | medium | no (bereits im Milestone Plan als Risiko vermerkt) |
| R4 | M1-Acceptance-Criterion verlangt erfolgreiches Laden auf Forge unter v13 UND v14, der formale Forge-Deployment-Vergleich ist aber erst M2 | medium | **resolved** — manueller Proof-Weg von Projektleiter festgelegt (siehe Q2) |

## Open Questions

| # | Frage | Priorität | Owner | Antwort |
|---|---|---|---|---|
| Q1 | Wie soll Node 24 bereitgestellt werden — versionsverwaltet (z. B. nvm/fnm) oder system-weit? | blocking | Projektleiter | **System-weit installieren.** Freigegeben durch Projektleiter (Safety-Boundary-Ausnahme für diese Installation). |
| Q2 | Darf für den M1-Proof (Modul lädt auf Forge) bereits dein bisheriger, bekannter Forge-Deploy-Weg verwendet werden? | blocking | Projektleiter | **Teilweise.** Projektleiter fügt das Modul manuell und selbst zu Forge hinzu (kein Zugriff/Ausführung durch die KI) und kopiert das Terminal-/Konsolen-Ergebnis zur Bestätigung hierher. Proof-Mechanismus für M1 ist damit: manuelle Ausführung durch Projektleiter + Beleg-Übergabe, kein automatisierter Deploy durch die KI. |
| Q3 | Wie soll die Foundry-Referenz-Aktivierung für v13 **und** v14 parallel gehandhabt werden? | important | Projektleiter | **Bestätigt:** je eine `.foundry-workspace.yaml` in `./v13/` und `./v14/`. |

## Next Step
Alle blockierenden Fragen sind aufgelöst. Apply für M1 entwirft: Ordnerstruktur
(`core/`, `v13/`, `v14/`), Build-Tooling-Design (Node 24, TS, esbuild-Konfiguration),
Inhalt der beiden `.foundry-workspace.yaml`-Dateien, sowie die minimalen
`module.json`-Manifest-Anforderungen für ein leeres, ladbares Modul je Version. Die
tatsächliche Node-Installation und das Forge-Hinzufügen erfolgen in Deploy
(Node-Install durch die KI, Forge-Upload manuell durch den Projektleiter).

---
status: closed (immutable) — alle Blocker aufgelöst, Uebergang zu Apply M1 freigegeben

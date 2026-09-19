# EagleEye

Foundry-VTT-Modul als Grundgerüst für Eagle Flight Control, die Schnittstelle zwischen
den Eagle Modules, dem DnD-5e-System und Foundry VTT selbst — Forschungs-/Testprojekt.
Der Code stammt aus der ersten Phase und enthält noch Funktionen für Fremdmodule
(Paket-Scan, Konflikt-Überwachung), die nach den aktuellen Planungsentscheidungen
entfallen; über ihre Entfernung entscheidet eine spätere Umsetzungsphase.

Entwickelt gegen Foundry v13 (siehe `v13/`), mit gemeinsamer Logik unter
`core/`. Foundry v14 wird vorerst nicht weiterverfolgt und ist aus der
Codebasis entfernt; der Stand liegt im Git-Verlauf.

Projekt-Prozess (DAD-M) und alle Entscheidungs-/Planungsartefakte: siehe `dadm/`
(Stand: keine Phase aktiv; drei abgeschlossene Phasen liegen unter `dadm/archive/`, die
bestätigten Projektpläne unter `dadm/eagle-modules-projektplan.md` und
[`EAGLE-MODULES-PLAN.md`](./EAGLE-MODULES-PLAN.md)).

Die größere Vision ("Eagle Modules" — Eagle Flight Control (ehemals Eagle Eye) als Kernmodul plus sechs
weitere, aufeinander abgestimmte Module) samt Machbarkeitsprüfung je Modul:
siehe [`EAGLE-MODULES-PLAN.md`](./EAGLE-MODULES-PLAN.md) — verständlich auch
ohne Vorwissen zum Projekt.

## Build

Voraussetzung: Node.js 24.

```
npm install
npm run build       # baut v13
npm run typecheck   # Typprüfung v13 gegen die gepinnten Foundry-Types
npm run test        # Vitest-Suite (core/-Logik, ohne Foundry-Laufzeit)
```

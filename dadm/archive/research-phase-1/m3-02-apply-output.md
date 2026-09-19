```
artifact: apply-output
milestone: M3
phase: APPLY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m3-01-discover-output.md` (geschlossen — Kernfund: `availability`/
  `getVersionBadge()` bereits in Foundry-Core vorhanden)
- `dadm/02-safety-boundaries.md` (Live-Test-Gate: Quench nur mit Freigabe pro
  Nutzung)

## Solution Design

### Architektur
Neues Modul `core/manifest-scanner.ts`, von `v13/module.ts`/`v14/module.ts` im
`ready`-Hook aufgerufen (nicht `init` — Package-`availability` ist zum Zeitpunkt
von `init` noch nicht zuverlässig vollständig berechnet; `ready` ist der früheste
Zeitpunkt, an dem `game.modules`/`game.system` sicher fertig sind).

### Interface (Signaturen, keine Implementierung)
```ts
type PackageKind = "module" | "system";

interface PackageStatus {
  id: string;
  title: string;
  version: string;
  kind: PackageKind;
  active: boolean;              // bei "system" immer true
  availability: number;         // Wert aus CONST.PACKAGE_AVAILABILITY_CODES
  badge: {
    type: "safe" | "unsafe" | "warning" | "neutral" | "error";
    tooltip: string;
    label?: string;
    icon?: string;
  } | null;
}

function scanPackages(): PackageStatus[];
function logPackageScan(): void;   // console.table(scanPackages())
```

`scanPackages()` iteriert `game.modules.contents` (alle eligible Module, aktiv
und inaktiv) plus `game.system` als einzelnen zusätzlichen Eintrag. Pro Paket
wird `availability` direkt ausgelesen und `getVersionBadge()` aufgerufen (Wiederverwendung
der Foundry-eigenen Badge-/Tooltip-Logik statt eigener Neuimplementierung —
konsistent mit dem "beobachtend zuerst"-Prinzip aus dem Project Brief).

### Warum nicht `foundry.utils.isNewerVersion` (Abweichung vom Wortlaut im Milestone Plan)
Der Milestone Plan nannte ursprünglich `isNewerVersion` als Umsetzungsidee. Laut
Discover-Fund deckt die bereits vorhandene `availability`-Property (11 Codes,
inkl. fehlender Dependencies/Systeme, Core-Up-/Downgrade) den Bedarf robuster und
vollständiger ab, ohne Versionsvergleiche selbst zu implementieren. Das Ziel des
Milestones ("Kompatibilität eigener Module erkennen") bleibt unverändert — nur
der Umsetzungsweg wird aktualisiert. `isNewerVersion` bleibt als Werkzeug
verfügbar, falls in M5/M7 ein Vergleich außerhalb von `game.modules` (z. B. gegen
eine extern abgefragte Manifest-Version) nötig wird.

## Acceptance Criteria (verfeinert gegenüber Milestone Plan)
```
AC-M3-01: `scanPackages()` liefert für jedes Element aus `game.modules` +
          `game.system` ein `PackageStatus`-Objekt inkl. `availability` und Badge.
AC-M3-02: Vitest-Test mit einem gemockten Dummy-Paket, dessen `availability`
          absichtlich auf einen inkompatiblen Code gesetzt ist (z. B.
          MISSING_DEPENDENCY), beweist, dass der Scanner den Status korrekt
          durchreicht (kein falsches "safe"/"verified").
AC-M3-03: `v13/module.ts` und `v14/module.ts` rufen `logPackageScan()` im
          `ready`-Hook auf; beim nächsten ohnehin stattfindenden Forge-Ladetest
          (kein separater Testlauf) ist das Log sichtbar.
```

**Begründung für die Abweichung vom ursprünglichen Proof ("Testlauf-Log gegen
Forge-Instanz, Quench-Nutzung separat freigeben lassen"):** Ein gemockter
Vitest-Test deckt den eigentlichen Prüfzweck (erkennt der Scanner einen
inkompatiblen Zustand korrekt?) deterministisch und wiederholbar ab, ohne dass
dafür ein separat freizugebender Quench-Lauf nötig ist — passend zum
Safety-Boundary-Prinzip, Testausführungen gegen die reale Instanz nicht ohne
Not zu wiederholen. AC-M3-03 nutzt lediglich den ohnehin schon etablierten,
nicht-gated manuellen Ladetest (wie in M1/M2), keinen automatisierten Testlauf.

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | `getVersionBadge()`-Texte sind für Foundrys eigenen Admin-Setup-Screen gedacht, nicht notwendigerweise ideal für eine spätere EagleEye-eigene UI (M4) — für M3 (reine Erkennung + einfaches Log) ausreichend, M4 kann bei Bedarf eigene Aufbereitung ergänzen | info | no |
| R2 | `game.modules.contents` enthält auch inaktive Module — für M3 bewusst mitgezählt (vollständiger Scan), Filterung auf "nur aktiv" bleibt spätere Option falls gewünscht | info | no |

## Open TBDs
Keine blockierenden TBDs.

## Next Step
Deploy implementiert `core/manifest-scanner.ts`, den Vitest-Test mit
Dummy-Paket, und die Hook-Integration in `v13/`/`v14/`.

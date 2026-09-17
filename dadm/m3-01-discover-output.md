```
artifact: discover-output
milestone: M3
phase: DISCOVER
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/04-milestone-plan.md` (M3-Definition)
- `dadm/m1-04-monitor-output.md` (Empfehlung: weiter mit M2, jetzt M3)
- Foundry-Typ-Fakten aus `foundry-vtt-reference-v13/types/src/foundry/common/packages/base-package.d.mts`,
  `foundry-vtt-reference-v13/types/src/foundry/client/packages/client-package.d.mts`,
  `foundry-vtt-reference-v13/types/src/foundry/client/packages/module.d.mts`,
  `foundry-vtt-reference-v13/types/src/foundry/common/constants.d.mts`,
  `foundry-vtt-reference-v13/types/src/foundry/client/game.d.mts` — gegen v14
  gegengeprüft (identisch vorhanden)
- Aktueller Code-Stand: `core/index.ts` (Platzhalter aus M1)

## Current-State Summary
- `core/index.ts` enthält bisher nur den M1-Platzhalter (`EAGLEEYE_ID`,
  `logEagleEyeReady`), keinerlei Scan-/Kompatibilitätslogik. **relevant**
- `v13/module.ts`/`v14/module.ts` rufen bisher nur `logEagleEyeReady` im
  `init`-Hook auf. **relevant**

## Wichtigster Fund
Foundry bringt bereits eine vollständige, offizielle Kompatibilitäts-
Infrastruktur mit — M3 muss Versionsvergleiche **nicht** von Grund auf selbst
bauen:

- Jedes `Module`/`System`-Objekt in `game.modules`/`game.system` hat eine bereits
  berechnete Property `availability: PACKAGE_AVAILABILITY_CODES`
- `PACKAGE_AVAILABILITY_CODES` (11 Werte) deckt praktisch alle im Project Brief
  genannten Fälle ab: `VERIFIED`, `UNVERIFIED_BUILD`, `UNVERIFIED_SYSTEM`,
  `UNVERIFIED_GENERATION`, `MISSING_SYSTEM`, `MISSING_DEPENDENCY`,
  `REQUIRES_CORE_DOWNGRADE`, `REQUIRES_CORE_UPGRADE_STABLE`,
  `REQUIRES_CORE_UPGRADE_UNSTABLE`, `REQUIRES_DEPENDENCY_UPDATE`, `UNKNOWN`
- `Module#getVersionBadge()` (Instanzmethode) liefert direkt ein UI-taugliches
  Badge-Objekt (`{type: safe|unsafe|warning|neutral|error, tooltip, label?,
  icon?}`), inklusive fertig formatierter Tooltips für fehlende Dependencies
  (`_formatBadDependenciesTooltip`) und inkompatible Systeme
  (`_formatIncompatibleSystemsTooltip`)
- Identisch in v13 und v14 vorhanden — kein Versions-Sonderfall für dieses
  Milestone

## Inventory

| # | Name | Beschreibung | Ort | Status |
|---|---|---|---|---|
| I1 | `game.modules` | `Collection<Module>` aller im World eligible Module (nicht nur aktive), je mit `.active`, `.availability`, `.id`, `.title`, `.version` | Foundry Core (v13+v14) | present |
| I2 | `game.system` | Einzelnes `System`-Package-Objekt, gleiche Basis-Properties | Foundry Core (v13+v14) | present |
| I3 | `CONST.PACKAGE_AVAILABILITY_CODES` | 11 vordefinierte Kompatibilitäts-Codes | Foundry Core (v13+v14) | present |
| I4 | `Module#getVersionBadge()` / `ClientPackage.getVersionBadge()` | Fertige UI-Badge- und Tooltip-Erzeugung aus Availability-Daten | Foundry Core (v13+v14) | present |
| I5 | `foundry.utils.isNewerVersion` | Roher Versionsvergleich (aus M1-Recherche bekannt) — jetzt als Baustein niedrigerer Priorität erkennbar, da `availability` bereits mehr leistet | Foundry Core | present, aber vermutlich nicht mehr die naheliegendste Lösung |
| I6 | `core/index.ts` | Aktueller Code-Stand: nur M1-Platzhalter | `core/index.ts` | present, kein Scanner |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Die im Milestone Plan notierte Umsetzungsidee ("via `foundry.utils.isNewerVersion`") ist durch den Fund von `availability`/`getVersionBadge()` überholt — Ziel bleibt gleich, aber der sinnvollere Ansatz ist jetzt, die bereits von Foundry berechnete `availability` auszulesen statt Versionen manuell zu vergleichen | low | no — Apply aktualisiert den Ansatz, keine Scope-Änderung |
| R2 | `getVersionBadge()` ist für Foundры eigenen Setup-Screen gedacht (Admin-Kontext, ggf. lokalisierte/englische Texte) — ob EagleEye die fertigen Badges direkt übernimmt oder nur die rohen `availability`-Codes selbst aufbereitet, ist eine Design-Frage | info | no |
| R3 | `game.modules` enthält auch inaktive, aber "eligible" Module — M3-Ziel spricht von "installierten Modulen", ohne explizit zwischen aktiv/inaktiv zu unterscheiden | low | no — Apply entscheidet sinnvollen Default |

## Open Questions
Keine blockierenden Fragen. R2/R3 werden als Design-Entscheidungen an Apply
übergeben statt separat erfragt.

## Next Step
Apply entwirft den Scanner auf Basis von `game.modules`/`game.system` +
`availability`, entscheidet aktiv-vs-alle-Module und Umgang mit
`getVersionBadge()` vs. eigener Aufbereitung, und legt die einfache Anzeige
für M3 fest.

```
artifact: discover-output
milestone: M6
phase: DISCOVER
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/04-milestone-plan.md` (M6-Definition)
- `dadm/m5-04-monitor-output.md` (Empfehlung: weiter mit M6)
- Foundry-Typ-Fakten aus
  `foundry-vtt-reference-v13/types/src/foundry/common/packages/base-package.d.mts`,
  `foundry-vtt-reference-v13/types/src/foundry/client/helpers/localization.d.mts`
  — gegen v14 gegengeprüft

## Wichtigster Fund
Die benötigten Fakten liegen in denselben Strukturen, die M3 bereits erschlossen
hat — M6 ist im Kern eine Erweiterung des M3-Scanners, kein neuer
Datenzugriffsweg:

- `game.i18n.lang: string` — aktuell aktive Sprache der Foundry-Instanz
  (World-weit)
- Jedes Package (Modul/System, aus `game.modules`/`game.system` — dieselben
  Collections wie in M3) hat ein `languages`-Feld aus dem Manifest: Array von
  `{ lang, name?, path, system? }` — deklariert, welche Sprachen dieses Paket
  unterstützt. `system` grenzt die Übersetzung optional auf ein bestimmtes
  System ein
- Es gibt **keine öffentliche API**, um zu prüfen, ob eine Sprache für ein
  Paket tatsächlich zur Laufzeit geladen wurde (nur eine interne, protected
  Methode `_filterLanguagePaths`) — erkennbar ist nur die **deklarierte**
  Unterstützung laut Manifest, nicht der tatsächliche Ladezustand

## v13→v14-Unterschied (kleiner Namens-Unterschied, gleiche Struktur)
`PackageLanguageSchema` (v13) wurde zu `LanguageSchema` (v14) umbenannt —
gleiches Muster wie der in M3 gefundene `PackageCompatibilityBadge` →
`CompatibilityBadge`-Wechsel. Die Feldstruktur selbst (`lang`, `name`, `path`,
`system`) ist unverändert, daher kein Cross-Version-Typkonflikt wie bei M3 zu
erwarten.

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | `game.i18n.lang` | Aktive Sprache der Foundry-Instanz | Foundry Core (v13+v14) | present |
| I2 | `package.languages` | Deklarierte Sprachunterstützung pro Modul/System aus dem Manifest | Foundry Core (v13+v14), Feldname-Änderung v14 (kosmetisch) | present |
| I3 | `core/manifest-scanner.ts` | Bereits vorhandene Iteration über `game.modules`/`game.system` (M3) | eigener Code | present, wiederverwendbar |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nur deklarierte (Manifest-)Sprachunterstützung ist erkennbar, nicht der tatsächliche Ladezustand zur Laufzeit — passend zum Milestone-Ziel ("Sprache installierter Systeme/Module kennen"), aber als Grenze zu dokumentieren, falls M7 (Übersetzer) mehr braucht | low | nein |

## Open Questions
Keine blockierenden Fragen.

## Next Step
Apply entwirft die Erweiterung von `core/manifest-scanner.ts` (oder ein kleines
neues Modul, das dessen Iteration wiederverwendet) um Sprachinformationen, plus
die Acceptance-Verifikation gegen ein reales mehrsprachiges System (dnd5e ist in
der Live-Welt des Projektleiters bereits vorhanden und lokalisiert, siehe M4).

# Research Phase 1 — Summary (archiviert)

status: abgeschlossen, archiviert am 2026-09-19
retention: durable (informativ — siehe Hinweis unten)

**Hinweis:** Dieser gesamte Ordner ist reines Nachschlagematerial. Nichts
hierin (Safety Boundaries, Scope Declaration, Milestone Plan, Approval,
Working Mode) gilt automatisch für einen künftigen Milestone Plan. Ein neuer
Plan durchläuft einen frischen Bootstrap (`dadm/`-Root, außerhalb dieses
Archivs).

## Worum ging es
EagleEye als Forschungsprojekt: Kann ein zentrales Foundry-VTT-Modul die
eigenen künftigen Module steuern und mit Foundry, installierten Systemen und
Fremdmodulen verknüpfen? Primärer Treiber: saubere Unterstützung eigener
DnD5e-Module. Details: `01-project-brief.md`.

## Ergebnis je Milestone

| M | Ziel | Ergebnis |
|---|---|---|
| M1 | Grundgerüst | Monorepo (`core`/`v13`/`v14`), Node 24, TS+esbuild, lädt fehlerfrei auf Forge in v13 und v14 |
| M2 | Forge-Deployment-Entscheidung | Hybrid: Import Wizard für Iteration, GitHub-Manifest-URL für Meilenstein-Releases — beide live verifiziert |
| M3 | Manifest-/Versionskompatibilität | Foundry berechnet Kompatibilität bereits selbst (`availability`, `getVersionBadge()`) — keine eigene Versionsvergleichslogik nötig |
| M4 | Zentrale Settings-Bündelung | Settings-Hub liest/schreibt Settings beliebiger Module/Systeme cross-namespace, bidirektional verifiziert |
| M5 | Kompatibilitätsforschung Fremdmodule | Nur libWrapper-basierte Konflikte zuverlässig erkennbar (`libWrapper.ConflictDetected`/`OverrideLost`); rohes Monkey-Patching nicht robust erkennbar |
| M6 | Sprach-/Lokalisierungserkennung | Erkennung deklarierter Sprachunterstützung gegen 94 reale Pakete verifiziert |
| M7 | Übersetzer-Machbarkeitsstudie | Multi-System-Datenübersetzung **gestrichen** (kein einheitliches Schema über Systeme, belegt durch reales Präzedenzmodul "Actor Export") — DnD5e-Fokus bestätigt |

## Wiederverwendbare technische Erkenntnisse (unabhängig vom Scope)
- `game.modules`/`game.system` (Collection, `.contents`) + `availability`
  (`CONST.PACKAGE_AVAILABILITY_CODES`) + `getVersionBadge()`: fertige
  Kompatibilitäts-Infrastruktur in Foundry-Core, v13 und v14 identisch
  vorhanden
- `game.settings.settings` (Map, nicht `game.settings` selbst!) ist die
  öffentliche Cross-Namespace-Settings-Registry; `game.settings.get/set`
  funktionieren für beliebige Namespaces
- `libWrapper.ConflictDetected(packageA, packageB, wrapperName, targets[])`
  und `libWrapper.OverrideLost` (gleiche Signatur) sind offizielle,
  verifizierte Hooks der libWrapper-Library
- `package.languages` (Manifest-Feld: `{lang, name?, path, system?}`) +
  `game.i18n.lang`: deklarierte Sprachunterstützung pro Paket, aber kein
  öffentlicher Weg, den tatsächlichen Ladezustand zu prüfen
- v13→v14: mehrere `Package…`-präfigierte Typnamen wurden zu kürzeren Namen
  ohne Präfix umbenannt (`PackageCompatibilityBadge`→`CompatibilityBadge`,
  `PackageLanguageSchema`→`LanguageSchema`) — Feldstruktur meist unverändert,
  nur der Typname; bei `CompatibilityBadge` zusätzlich `"safe"`→`"success"`,
  `"unsafe"` entfällt
- Live-Tests gegen die reale Forge-Welt fanden mehrfach Bugs, die reine Mocks
  nicht erkannt hätten (u. a. Instanz-vs-Registry-Verwechslung in M4)

## Offene, nicht weiterverfolgte Idee
Cross-Language-Übersetzung (automatisches Übersetzen fehlender
Sprachdateien fremder Module) wurde in M7 als eigenständige, von der
Multi-System-Frage unabhängige Idee identifiziert, aber nicht untersucht.
Kandidat für ein eigenes künftiges Thema.

## Vollständige Artefakte
`01-project-brief.md` bis `06-working-mode.md` (Bootstrap), `m1-*` bis `m7-*`
(je Discover/Apply/Deploy/Monitor).

```
artifact: discover-output
milestone: M1
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Eagle-Eye-Anforderungen)
- `dadm/archive/research-phase-1/SUMMARY.md` und referenzierte Einzelartefakte
  (`m3-*`, `m4-*`, `m5-*`, `m6-*`) für Detailbelege

## Current-State Summary
Research Phase 1 hat vier der fünf in der Vision genannten Eagle-Eye-
Funktionsblöcke bereits (teilweise) direkt erforscht, ohne dass zum
damaligen Zeitpunkt die Eagle-Modules-Vision bekannt war — Phase 1 war
inhaltlich bereits Grundlagenarbeit für genau dieses Kernmodul.

## Abgleich: Vision-Anforderung -> Phase-1-Beleg

| # | Vision-Anforderung (Eagle Eye) | Status | Beleg / Begründung |
|---|---|---|---|
| A1 | Schnittstelle zwischen Foundry, DnD, eigenen und fremden Modulen | **teilweise belegt** | Belegt: EagleEye kann Zustand jedes Pakets (`game.modules`/`game.system`) lesen, Settings jedes Namespaces lesen/schreiben (M4), auf libWrapper-Signale fremder Module reagieren (M5). **Offen:** die umgekehrte Richtung — dass fremde Module aktiv gegen eine von Eagle Eye bereitgestellte eigene API programmieren — wurde nie untersucht, da Phase 1 keine öffentliche EagleEye-API definiert hat |
| A2 | Erkennen, wenn Module nicht kompatibel sind, und **warum** | **belegt** | M3: `availability` (`CONST.PACKAGE_AVAILABILITY_CODES`, 11 Werte) + `getVersionBadge()` liefern Status und Begründung auf Manifest-Ebene. M5: `libWrapper.ConflictDetected`/`OverrideLost` liefern Paket-genaue Begründung für Laufzeit-Konflikte — mit dokumentierter Grenze: nur libWrapper-Fälle, rohes Monkey-Patching nicht erkennbar (siehe Phase-1-M5-Befund) |
| A3a | Settings-Hub: gebündelte Einstellungsänderung | **belegt** | M4: `listSettings()`/`updateSetting()`, bidirektional gegen 94 reale Pakete live verifiziert (client- und world-Scope) |
| A3b | Erkennen, dass eine Einstellungsänderung ein **anderes** Modul beeinflusst, und DM informieren | **offen** | In Phase 1 nicht untersucht. Keine bekannte generische Foundry-API, die Cross-Modul-Auswirkungen von Settings-Änderungen ausdrückt — reine Vermutung, keine Quelle. Echte offene Frage |
| A3c | Dependencies zwischen Modulen **aktivieren/deaktivieren** können | **offen** | In Phase 1 nicht untersucht. Modul-Aktivierung ist in Foundry Teil der World-Modul-Konfiguration und erfordert i. d. R. einen Welt-Neustart (Skripte werden beim Boot geladen) — das ist Hintergrundwissen aus der allgemeinen Foundry-Architektur, nicht durch Phase-1-Recherche verifiziert. Echte offene Frage |
| A4 | Datenbank mit Zugriff auf Funktionen von Foundry, DnD, anderen Modulen | **teilweise belegt** | Belegt für Lesezugriff auf Paket-/Settings-/Sprachdaten (M3/M4/M6). "Funktionen anderer Module aufrufen" (nicht nur deren Daten lesen) wurde nie untersucht — es gibt keine generische Foundry-API, mit der ein Modul die internen Funktionen eines anderen (nicht dafür vorgesehenen) Moduls sicher aufruft |
| A5 | "API umwandeln" (komplexe API-Vorgänge aus einfacher Eingabe) | **verschoben nach M2** | Eigene Milestone, siehe Milestone Plan — hier nur zur Vollständigkeit gelistet |

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | Phase-1-Erkenntnisse (M3/M4/M5/M6) | Direkt wiederverwendbare Belege für A2, A3a | `dadm/archive/research-phase-1/` | present |
| I2 | Eagle-Eye-eigene API-Fläche | Ob/wie andere Module aktiv gegen EagleEye programmieren könnten | — | fehlt, nie entworfen |
| I3 | Cross-Modul-Settings-Auswirkungs-Erkennung (A3b) | Generische Foundry-API dafür | — | keine bekannte Quelle, ungeklärt |
| I4 | Modul-Aktivierung/-Deaktivierung zur Laufzeit (A3c) | Foundry-Mechanismus zur Modul-(De-)Aktivierung | allgemeines Architekturwissen, nicht verifiziert | ungeklärt |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | A3b und A3c sind zentrale, in der Vision explizit genannte Eagle-Eye-Anforderungen, für die der aktuelle Milestone Plan **keinen eigenen Milestone** vorsieht (M2–M9 decken Eyrie/Egg/Beak/Talon/Prey/Wings ab, nicht diese beiden verbleibenden Eagle-Eye-Kernfragen) | medium | **ja — Plan-Lücke, erfordert Projektleiter-Entscheidung** |
| R2 | A1 (EagleEye als aktiv nutzbare API-Schnittstelle für Drittmodule) ist ebenfalls unresearcht, aber weniger dringlich (keine der PDF-Ideen setzt das explizit voraus) | low | nein |

## Open Questions

| # | Frage | Priorität | Owner |
|---|---|---|---|
| Q1 | Wie soll mit R1 (Plan-Lücke für A3b/A3c) umgegangen werden — neues Milestone einfügen, in M9 (Synthese) mit aufnehmen, oder bewusst außerhalb dieser Phase lassen? | blocking (für die Weiterarbeit über M1 hinaus) | Projektleiter |

## Next Step
M1 selbst ist inhaltlich abgeschlossen. Bevor mit M2 fortgefahren wird: Q1
klären, da R1 eine Lücke im genehmigten Plan aufzeigt, die nicht
stillschweigend entschieden werden soll (siehe Autonomie-Freigabe in
`06-working-mode.md`: bei Unklarheit stoppen).

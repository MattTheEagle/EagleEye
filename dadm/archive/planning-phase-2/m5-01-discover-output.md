```
artifact: discover-output
milestone: M5
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Eagle-Egg-Anforderungen, Tabs)
- dnd5e-Quellcode (`github.com/foundryvtt/dnd5e`, `master`, rein lesend)
- `dadm/m2-01-discover-output.md`/`m2-02-apply-output.md` (API-Umwandlung-Befund)

## Wichtigster Fund: dnd5e hat bereits ein vollständiges, öffentlich nutzbares Advancement-System
Das im Plan als Risiko vermerkte "Kollisionsrisiko mit eigener Logik" lässt
sich durch einen strategischen Kurswechsel entschärfen: **statt einer
parallelen, konkurrierenden Charaktererstellungs-Logik sollte Eagle Egg
dnd5e's eigenes Advancement-System als Engine wiederverwenden.**

- dnd5e exponiert seine komplette `applications`-Modulstruktur als
  **öffentliches Global** (`dnd5e.mjs`: `globalThis.dnd5e = { applications,
  ... }`, danach `game.dnd5e = Object.assign(game.system, globalThis.dnd5e)`)
  — das ist dnd5e's eigener, bewusster Weg, Drittmodulen Zugriff auf
  System-Internas zu geben, keine Umgehung
- `dnd5e.applications.advancement.AdvancementManager` bietet fertige,
  benannte **statische Factory-Methoden** für genau die Lebenszyklus-
  Ereignisse, die Eagle Egg braucht:
  - `forNewItem(actor, itemData, options)` — Class/Species/Background/
    Subclass hinzufügen inkl. aller zugehörigen Advancement-Schritte
  - `forLevelChange(actor, classId, levelDelta, options)` — Level-Aufstieg
  - `forModifyChoices`, `forNewAdvancement`, `forDeletedItem`,
    `forDeletedAdvancement` — weitere Lebenszyklus-Fälle
- Es gibt bereits **native Advancement-Typen** für exakt die in der Vision
  genannten Tab-Inhalte: `AbilityScoreImprovement`, `HitPoints`,
  `ItemChoice` (= "wähle N aus einer gefilterten Liste", z. B. Spells nach
  Level/Class — direkt passend zum Spells-Tab), `ItemGrant`, `ModifyItem`,
  `ScaleValue`, `Size`, `Subclass`, `Trait`

## Bewertung je Eagle-Egg-Tab

| Tab | Bestehender dnd5e-Baustein | Status |
|---|---|---|
| Attributes (Point Buy/Standard Array/manuell) | `AbilityScoreImprovement`-Advancement | belegt |
| Class/Subclass + Features | `forNewItem` + `ItemGrant`/`Subclass`-Advancements | belegt |
| Species/Subspecies + Features | `forNewItem` + `ItemGrant`-Advancements | belegt |
| Background + Features | `forNewItem` + `ItemGrant`-Advancements | belegt |
| Spells (nach Level/Class gefiltert) | `ItemChoice`-Advancement (genau dafür entworfen) | belegt |
| Equipment | Reguläre Item-Vergabe, kein Advancement-Sonderfall nötig | belegt |

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | `game.dnd5e.applications.advancement.AdvancementManager` | Öffentlich exponierte Advancement-Orchestrierung | `dnd5e.mjs`, `advancement-manager.mjs` | present, verifiziert |
| I2 | 8 native Advancement-Typen | Decken alle Egg-Tabs ab | `module/documents/advancement/` | present, verifiziert |
| I3 | Factory-Methoden (`forNewItem` etc.) | Programmatischer Einstiegspunkt für Drittmodule | `advancement-manager.mjs` | present, verifiziert |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Ob sich Eagle Eggs eigene UI (Tabs, Live-Vorschau) sauber **um** die dnd5e-eigene AdvancementManager-UI herum bauen lässt (z. B. Manager im Hintergrund treiben, eigene Oberfläche davorschalten) oder ob man dessen UI direkt mitnutzen müsste, ist nicht im Detail geprüft — UI-Integrationsfrage, kein Kern-Machbarkeitsrisiko mehr | low | nein |
| R2 | Das ursprüngliche Plan-Risiko ("Kollision mit eigener Logik") entfällt bei diesem Kurswechsel; es entsteht dafür eine neue, deutlich kleinere Abhängigkeit: Eagle Egg wäre an dnd5e's Advancement-API-Stabilität gebunden (system-eigene, nicht Core-Foundry-API) | low | nein |

## Open Questions
Keine blockierenden Fragen.

## Next Step
Apply fasst die Neubewertung zusammen: deutlich geringeres Risiko als im
Plan vermerkt, da Wiederverwendung statt Neubau empfohlen wird.

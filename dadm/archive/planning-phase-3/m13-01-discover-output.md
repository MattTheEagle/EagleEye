```
artifact: discover-output
milestone: M13
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M13), PDF-Auftrag P-R1/P-R2 (Umsetzung nach Repo-Analyse neu prüfen; neben Custom D&D 5e, nicht darauf aufbauen), Entscheidungen E2, E3, E1, Antworten Q0 a, Q2 a, Q3 a, N4
- Phase-2-Ergebnis zu Prey (`dadm/eagle-modules-projektplan.md`, Abschnitt M8 der Planungsphase 2: drei Ebenen)
- Quellenanalyse `dadm/reference/source-analysis/ruling-rules-customization.md`, `techniques-catalog.md`, `README.md` (K7, K11)
- Neu erhoben: Versionshistorie der Module (siehe Korrektur in `source-analysis/README.md`), Custom D&D 5e 4.1.2 (Commit `2b57702`, Foundry-13-Reihe), dnd5e 5.3.3 (Commit `965ad2d`)

## Wichtige Korrektur zur Ausgangslage
Der Plan (M13) und K11 gingen davon aus, Custom D&D 5e verlange Foundry 14 und dnd5e 6.x und laufe daher auf dem Zielstand nicht. Das gilt nur für die **neuesten** Releases. Die Releases **2.0 bis 4.1.2** deklarieren Foundry 13.342–13.999 und dnd5e 5.x (4.x: 5.2.5–5.99, umfasst 5.3.3). Custom D&D 5e **kann also auf dem Zielstand (Foundry v13, dnd5e 5.3.3) laufen**, und die im PDF erwähnte Koexistenz ist real, nicht nur theoretisch.

## Fakten

| # | Fakt | Quelle |
|---|---|---|
| r1 | dnd5e 5.3.3 registriert **45 Einstellungen**: 38 auf Weltebene (12 im Einstellungsmenü sichtbar, 26 ausgeblendet), 5 pro Client, 1 pro Benutzer, 1 ohne Angabe. Regelrelevante darunter: `criticalDamageModifiers`, `criticalDamageMaxDice`, `initiativeDexTiebreaker`, `initiativeScore`, `proficiencyModifier`, `encumbrance`, `currencyWeight`, `restVariant`, `levelingMode`, `allowFeats`, `disableConcentration`, `disableAdvancements`, `allowRests`, `allowPolymorphing`, `allowSummoning`, `bloodied`, `attackRollVisibility`, `challengeVisibility`, `concealItemDescriptions`, `autoRecharge`, `autoRollNPCHP`, `movementAutomation`, Werte für Loyalty/Ehre/Sanity | `dnd5e/module/settings.mjs` |
| r2 | `CONFIG.DND5E` hat **134** Ebene-1-Schlüssel; `DND5E.rules` (Regelbegriffe mit Verweis auf Regelseiten) hat **170** Einträge (Phase 2 schätzte "über 60") | `dnd5e/module/config.mjs:4673` |
| r3 | Kritischer Schwellenwert ist ein Datenfeld an Item und Activity (`criticalThreshold`) | `dnd5e/module/data/activity/attack-data.mjs:123–128` |
| r4 | Custom D&D 5e 4.1.2 (Foundry 13, dnd5e 5.2.5–5.99, 122 Skriptdateien) verändert über 40 Bereiche von `CONFIG.DND5E` (u. a. `conditionTypes`, `abilities`, `skills`, `actorSizes`, `encumbrance`, `damageTypes`, `maxLevel`, `maxAbilityScore`, `bloodied`, `activityTypes`, Waffen-/Werkzeug-/Rüstungslisten, `currencies`, `languages`) | Code von 4.1.2 |
| r5 | Custom D&D 5e 4.1.2 setzt **9 libWrapper-Wrapper**: `Token._refreshBorder`, `AttributesFields.prepareMovement`, `prepareEncumbrance`, `BaseActorSheet._prepareSkillsTools`, `_prepareSenses`, `D20Roll.validD20Roll`, `D20Roll.configureModifiers`, `D20Roll.fromConfig`, `D20Die.applyAdvantage` | Code von 4.1.2 |
| r6 | Hooks in Custom D&D 5e 4.1.2: überwiegend Render-Hooks der Blätter, dazu `dnd5e.preUseActivity`, `dnd5e.rollSavingThrow`, `preUpdateActor`, Aktiveffekt-Hooks und eigene `customDnd5e.*`-Hooks | Code von 4.1.2 |
| r7 | In `module.json` und im Tag 4.1.2 liegt keine Lizenzdatei vor; die Quellenanalyse (K10) ordnete Custom D&D 5e als "nicht zur Weitergabe lizenziert" ein. Code darf nicht übernommen werden, nur Muster | Tag 4.1.2, Quellenanalyse |
| r8 | Die Wurf- und Aktivierungspipeline von dnd5e bietet dokumentierte Hooks (`dnd5e.preRoll…`, `dnd5e.preUseActivity`, `dnd5e.preCalculateDamage` …) | `techniques-catalog.md` §6, M6 (f6, f10) |
| r9 | `CONFIG` gilt pro Client im Speicher: Änderungen daran müssen auf **jedem** Client beim Start angewendet werden und schreiben keine Daten in die Welt | Foundry-Grundverhalten, Muster in Custom D&D 5e (Config-Engine, K7) |
| r10 | libWrapper ist ein Fremdmodul; es meldet Konflikte zwischen Wrappern (Hooks `libWrapper.ConflictDetected`, Phase 1) | Phase-1-Archiv, `core/conflict-watch.ts` |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (Live-Test mit Freigabe): tatsächliches Zusammenspiel mit Custom D&D 5e 4.1.2 in einer Foundry-13-Welt | medium | nein |
| R2 | Die Zählung der 170 Regeleinträge beruht auf einer Zeilenauswertung der Konfigurationsdatei | low | nein |
| A1 | "Neben Custom D&D 5e existieren" (E2) wird so gelesen, dass beide Module gleichzeitig aktiv sein können sollen, ohne einander zu stören | low | nein |

## Open Questions
Keine, die den Ablauf stoppen; nicht blockierender Punkt N19 in Apply.

## Next Step
Apply bewertet die drei Ebenen neu, die Koexistenz und die Frage, was die Repo-Analyse einfacher macht.

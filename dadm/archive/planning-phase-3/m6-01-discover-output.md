```
artifact: discover-output
milestone: M6
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan.md` (M6), Entscheidung E3 (eigene Lösung, keine Fremdmodul-Abhängigkeit)
- Phase-2-Ergebnis zum Referenzfall (`dadm/eagle-modules-projektplan.md`, Abschnitt M2 der Planungsphase 2)
- dnd5e Release 5.3.3 (flacher Klon im Scratchpad, Commit `965ad2d`)
- Quellenanalyse (`dadm/reference/source-analysis/techniques-catalog.md`, `ruling-rules-customization.md`)
- GitHub-Issue foundryvtt/dnd5e#4477

## Referenzfall
Magisches Langschwert: Zusatzschaden 2W6 Feuer, Bedingung "Hit, Undead" (Vision). Teile: (1) Waffe mit magischem Bonus, (2) Zusatzschaden
2W6 vom Typ Feuer, (3) nur bei Treffer, (4) nur gegen Untote. Teile 1–3 waren in Phase 2 als nativ belegt; offen ist Teil 4.

## Fakten (alle dnd5e 5.3.3, Quelltext)

| # | Fakt | Quelle |
|---|---|---|
| f1 | Ein Schadensteil (`DamageData`) hat die Felder `number`, `denomination`, `bonus`, `types`, `custom{enabled, formula}`, `scaling{mode, number, formula}`. **Kein Bedingungsfeld** | `module/data/shared/damage-field.mjs:21–41` |
| f2 | Issue #4477 "Add self & target conditions to damage parts" ist **offen** (seit 2024-10-01): Bedingungen an Schadensteilen, evaluiert für den Angreifer (Gesundheit, Größe, Status) und je Ziel (Kreaturtyp, Trefferpunkte), aufbauend auf dem vorhandenen Filterformat. Kein Maintainer-Kommentar sichtbar | github.com/foundryvtt/dnd5e/issues/4477 |
| f3 | Activity-Typen: `attack, cast, check, damage, enchant, forward, heal, order (nicht konfigurierbar), save, summon, transform, utility`. Typ `damage` würfelt Schaden ohne Angriffswurf | `module/config.mjs:4403–4440` |
| f4 | Angriffs-Activities haben `damage.critical.bonus` (zusätzliche Würfel bei Kritischem Treffer) | `module/data/activity/attack-data.mjs:27–37, 313–314` |
| f5 | Ablauf `rollDamage()`: `getDamageConfig(config)` baut `rollConfig.rolls` aus `damage.parts` und **hängt `config.rolls` an**; danach `DamageRoll.build` | `module/documents/activity/mixin.mjs:869–904`, `module/data/activity/base-activity.mjs:744–755` |
| f6 | Hooks vor jedem Wurf mit dynamischem Namen: `dnd5e.preRoll{Name}` und `…V2` mit `(config, dialog, message)`, für Schaden `dnd5e.preRollDamage`/`dnd5e.preRollDamageV2` (`hookNames` enthält `"damage"`); `config.subject` ist die Activity. Nach dem Wurf `dnd5e.rollDamage(V2)` mit `(rolls, {subject})` | `module/dice/basic-roll.mjs:88–103`, `mixin.mjs:871, 925–926` |
| f7 | Ziele der Benutzerin/des Benutzers zum Nutzungszeitpunkt: `messageFlags.targets = getTargetDescriptors()` liest `game.user.targets` (name, img, uuid, ac) | `mixin.mjs:136–141`, `module/utils.mjs:639–650` |
| f8 | Kreaturtyp eines Actors: `actor.system.details.type.value` (Feld `CreatureTypeField` mit `value`, `subtype`, `swarm`, `custom`); bei Charakteren aus dem Spezies-Item (`race.system.type`), Ersatzwert `humanoid`; Auswahlliste `CONFIG.DND5E.creatureTypes` | `module/data/actor/character.mjs:203–205`, `npc.mjs:155, 402` |
| f9 | Schadensanwendung: Die Chat-Karte bildet `DamageDescription`s mit `aggregateDamageRolls(rolls, {respectProperties: true})`. Dabei überleben **nur `type` und `properties`** einer Wurfkonfiguration (neue `DamageRoll`s mit `{type, properties}`); eigene `options`-Felder gehen verloren | `module/documents/chat-message.mjs:566–570, 804–808`, `module/dice/aggregate-damage-rolls.mjs:10–35` |
| f10 | Je Ziel-Actor laufen `dnd5e.preCalculateDamage(actor, damages, options)`, `dnd5e.calculateDamage`, `dnd5e.preApplyDamage`, `dnd5e.applyDamage`; `damages` sind `DamageDescription`s (`value`, `type`, `properties`) | `module/documents/actor/actor.mjs:746–902`, `module/documents/_types.mjs:31–40` |
| f11 | Unbekannter Activity-Typ: `ActivityField.getModel` liefert `CONFIG.DND5E.activityTypes[type]?.documentClass ?? null`; ohne Klasse bleibt der Rohdatensatz erhalten (`deepClone(value)`), er wird nicht gelöscht. Registrierung ist ein Eintrag in einem gewöhnlichen Konfigurationsobjekt | `module/data/fields/activities-field.mjs:37–72`, `config.mjs:4403` |
| f12 | dnd5e liefert ein **deklaratives Bedingungsformat** öffentlich mit: `dnd5e.Filter.performCheck(data, filter)` mit Beschreibungen `{k, v, o}` (Schlüssel, Wert, Operator), Verknüpfungen AND/OR/NOT/XOR und Vergleichen `exact`, `in`, `has`, `hasany`, `hasall`, `gt` usw. | `module/filter.mjs`, `module/_types.mjs:305–311`, `dnd5e.mjs:38–48` |
| f13 | Vergleichsfall: Custom D&D 5e registriert eigene Activity-Typen und arbeitet mit Hooks (Quellenanalyse); Code darf wegen der Lizenz nicht übernommen werden, nur das Muster | `dadm/reference/source-analysis/ruling-rules-customization.md` |

## Inventory: Bedingungsarten in den Quellen des Projekts
Konkret genannt ist nur "Hit, Undead" (Vision). Das PDF nennt keine weiteren Bedingungen.

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (nur Live-Test, Freigabe nötig): Verhalten der Chat-Karte und des Schadens-Dialogs bei unbekannten `properties`-Einträgen; Wirkung des Ergänzens von `config.rolls` in `dnd5e.preRollDamageV2`; Darstellung eines unregistrierten Activity-Typs im Item-Blatt | medium | nein |
| R2 | Ein künftiges natives Bedingungssystem in dnd5e (f2) könnte eine eigene Lösung teilweise überflüssig machen; f2 ist ein offener Wunsch ohne Zusage | low | nein |
| A1 | Ausgangslage ist dnd5e 5.3.3 (E1); 6.x ist nicht Ziel | info | nein |

## Open Questions
Keine, die den Ablauf stoppen. Der Standort des Laufzeitcodes (Flight Control, Homebrew oder Roll Out) ist eine Entscheidung für die Umsetzungsphase (siehe N5 in Apply).

## Next Step
Apply vergleicht die Lösungswege, bewertet den Referenzfall und grenzt die abdeckbaren Bedingungsarten ab.

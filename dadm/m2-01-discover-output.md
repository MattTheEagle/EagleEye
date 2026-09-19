```
artifact: discover-output
milestone: M2
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Referenzfall: magisches Langschwert,
  +2W6 Feuerschaden bei Treffer gegen Untote)
- dnd5e-Quellcode (`github.com/foundryvtt/dnd5e`, `master`-Branch, via
  `raw.githubusercontent.com` und GitHub API, rein lesend)
- dnd5e-eigenes Issue-Tracker (offizielle Feature-Request-Lage)
- Modulseite "Build-a-Bonus" (foundryvtt.com/packages/babonus)

## Rechercheergebnis, Teil für Teil des Referenzfalls

### "Longsword" (Basis-Item) + "2d6 Fire" (Zusatzschaden) — voll deklarativ abbildbar
dnd5e hat seit Version 3+ ein **Activity-System** (`module/data/activity/`).
Eine `DamageActivityData` enthält `damage.parts`, ein Array von `DamageData`
(`module/data/shared/damage-field.mjs`) mit den Feldern `number`,
`denomination`, `bonus`, `types` (Set von Schadensarten), `scaling`. "2d6
Feuerschaden" ist exakt `{ number: 2, denomination: 6, types: ["fire"] }` —
reine Dateneingabe, kein Code nötig.

### "Magic" — deklarativ abbildbar (erste Einschätzung)
`BaseActivityData` (`base-activity.mjs`) hat bereits ein Feld
`visibility.requireMagic` (BooleanField). Items haben zusätzlich ein
`properties`-Set, in dem u. a. eine "magisch"-Eigenschaft geführt wird. Beides
sind bestehende, deklarative Felder — keine Code-Notwendigkeit erkennbar
(nicht bis ins letzte Detail verifiziert, aber keine gegenteiligen Hinweise
gefunden).

### "Damage Conditions: Hit, Undead" — **nicht nativ abbildbar, aber gelöstes Problem im Ökosystem**
"Hit" ist inhärent (eine Damage-Activity wird nach erfolgreichem Treffer
ausgelöst). "Vs. Undead" (Schaden nur gegen einen bestimmten Kreaturentyp) ist
**nicht** im Kern-Schema von `BaseActivityData`/`DamageData` vorgesehen — kein
Feld dafür vorhanden. Bestätigt durch **offiziellen dnd5e-Issue #4477**
("Add self & target conditions to damage parts", offen, als "epic" mit
"priority: medium" gelabelt) — die dnd5e-Maintainer selbst führen dies als
fehlendes Feature, nicht als bereits gelöst.

**Aber:** Das Community-Modul **"Build-a-Bonus" (babonus)** löst exakt diese
Problemklasse bereits — deklarativ, über eine UI mit Filtern (u. a. nach
Kreaturentyp des Ziels), ohne Code/Scripting. Das ist ein reales,
funktionierendes Präzedenzbeispiel für genau die Art "einfache Auswahl ->
korrekte technische Umsetzung", die Eagle Eye anstrebt — nur eben in einem
eingegrenzten Teilbereich (bedingte Boni), nicht für ganze Items.

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | dnd5e Activity-/DamageData-Schema | Deklarative Struktur für Schadensmenge/-typ | `module/data/activity/damage-data.mjs`, `module/data/shared/damage-field.mjs` | present, verifiziert |
| I2 | `visibility.requireMagic`, Item-`properties` | Deklarative "magisch"-Kennzeichnung | `module/data/activity/base-activity.mjs` | present, teilweise verifiziert |
| I3 | Fehlendes Feld für Ziel-Kreaturentyp-Bedingungen | Bestätigte Lücke im dnd5e-Kern | GitHub Issue #4477 (offiziell, offen) | bestätigt fehlend |
| I4 | Build-a-Bonus (babonus) | Community-Lösung für genau diese Lücke, UI-basiert, kein Code | foundryvtt.com/packages/babonus | present, bestätigtes Präzedenzbeispiel |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | "Magic"-Eigenschaft nur oberflächlich verifiziert (Feld existiert, exakte Nutzung nicht bis ins Detail geprüft) | low | nein |
| R2 | Der Referenzfall ist ein vergleichsweise einfacher Fall (eine Damage-Activity + eine Bedingung). Komplexere Homebrew-Wünsche könnten Activity-Typen brauchen, die über das bestehende Schema hinausgehen (z. B. neuartige Mechaniken ohne Entsprechung unter Attack/Cast/Check/Heal/Save/Summon/Teleport/Transform/Utility/Enchant/Order) | medium | nein — genau diese Generalisierbarkeitsfrage ist Teil der Apply-Bewertung |

## Open Questions
Keine blockierenden Fragen.

## Next Step
Apply bewertet den Gesamtbefund (Kombination aus nativer Activity-Struktur +
Filter-basiertem Zusatzmechanismus für Bedingungen) und schätzt die
Generalisierbarkeit über den Referenzfall hinaus ein.

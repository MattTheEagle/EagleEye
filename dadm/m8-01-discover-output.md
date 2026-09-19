```
artifact: discover-output
milestone: M8
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Eagle-Prey-Anforderung, Klärung:
  automatische Extraktion aus laufendem Code, kein handgepflegter Katalog)
- dnd5e-Quellcode (`module/config.mjs`, `module/dice/damage-roll.mjs`)

## Wichtigster Fund: Zwei unterschiedliche Dinge werden im Vision-Text vermischt

Die Anforderung "Regeln in schriftlicher Form UND als Mechanik darstellen"
sind technisch **zwei unabhängige Fragen** mit sehr unterschiedlicher
Machbarkeit:

### 1. Schriftliche Regel-Darstellung (Klartext) — bereits vollständig gelöst, automatisch
`CONFIG.DND5E.rules` ist ein **deklaratives, von dnd5e selbst gepflegtes**
Mapping von ~60+ benannten Regelbegriffen (`criticalhits`, `damagerolls`,
`attackrolls`, `cover`, `grappling`, `deathsaves`, uvm. — deckt genau die im
Beispiel genannten Kategorien ab) auf `JournalEntryPage`-UUIDs mit dem
offiziellen Regelwerkstext. Eagle Prey könnte diesen Katalog **automatisch
zur Laufzeit auslesen** — er wird von dnd5e selbst gepflegt und bleibt damit
automatisch mit der installierten dnd5e-Version synchron. Das erfüllt die
Klärung "keine eigene Handpflege" tatsächlich: nicht weil Eagle Eye Code
analysiert, sondern weil dnd5e selbst bereits einen strukturierten,
programmatisch lesbaren Katalog mitliefert.

### 2. Mechanik als editierbare Formel/Wert — nur teilweise, uneinheitlich verfügbar
Am konkreten Beispiel geprüft (`module/dice/damage-roll.mjs`):
Kritischer-Treffer-Verdopplung ist als `term.number *= (critical.multiplier
?? 2)` implementiert — der Multiplikator ist **konfigurierbar**, gespeist
u. a. aus `game.settings.get("dnd5e", "criticalDamageModifiers")` und
`game.settings.get("dnd5e", "criticalDamageMaxDice")`. Für **dieses** Beispiel
ist die Mechanik also tatsächlich über bereits registrierte dnd5e-eigene
Game-Settings zugänglich — direkt lesbar/änderbar über den in Phase 1
bereits gebauten Settings-Hub, **ohne** Code-Extraktion.

**Aber:** Das ist kein generisches Muster. Die meisten Spielmechaniken sind
**nicht** als Settings exponiert, sondern direkt in imperativem JS-Code
verankert (wie z. B. die konkrete Term-Manipulationslogik in
`#applyCriticalTerm` selbst) — dort gibt es keine deklarative,
"extrahierbare" Repräsentation. Automatische Extraktion aus beliebigem
imperativem Code ist Programm-Analyse-Territorium ohne generische Lösung.

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | `CONFIG.DND5E.rules` | Deklarativer Katalog: Regelbegriff -> offizieller Regeltext (JournalEntryPage-UUID) | `module/config.mjs` | present, verifiziert |
| I2 | `game.settings.get("dnd5e", "criticalDamageModifiers"/"criticalDamageMaxDice")` | Konkretes Beispiel einer bereits als Setting exponierten Mechanik | `module/dice/damage-roll.mjs` | present, verifiziert |
| I3 | Übrige Mechanik-Logik | Größtenteils imperativer Code ohne deklarative Repräsentation | allgemeiner Code-Aufbau | bestätigt, nicht extrahierbar |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nur eine unbekannte Teilmenge der Mechaniken ist über Settings zugänglich — welcher Anteil das insgesamt ist, wurde nur stichprobenartig (1 Beispiel) geprüft, nicht erschöpfend | medium | nein — realistische Grenze einer Planungsphase, keine vollständige Code-Analyse aller dnd5e-Mechaniken möglich/sinnvoll |
| R2 | Für Mechaniken ohne Settings-Zugang bliebe nur der in der Vision selbst bereits antizipierte Fallback (tiefe Eingriffe/Code-Override) — kein neuer Fund, sondern Bestätigung der ursprünglichen Einschätzung des Projektleiters | hoch | nein — erwartetes Ergebnis |

## Open Questions
Keine.

## Next Step
Apply fasst die zweigeteilte Machbarkeit zusammen (Text: voll automatisch;
Mechanik: teilweise über Settings, überwiegend nicht ohne Code-Eingriff).

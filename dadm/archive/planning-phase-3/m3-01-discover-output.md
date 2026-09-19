```
artifact: discover-output
milestone: M3
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan.md` (M3), `dadm/01-project-brief.md` (E5: Umbenennung nur
  in Dokumenten; Namenstabelle)
- `dadm/reference/eagle-modules-aufbau.md` (Namenszuordnung)
- Die neun lebenden Dokumente: `EAGLE-MODULES-PLAN.md`, `README.md`,
  `dadm/README.md`, `dadm/eagle-modules-projektplan.md`,
  `dadm/reference/source-analysis/` (`README.md`, `beak-importers.md`,
  `prey-rules-customization.md`, `wings-automation.md`, `techniques-catalog.md`)
- `dadm/reference/eagle-modules-vision.md` (nur Hinweis-Kopf vorgesehen)

## Inventory: Fundstellen der Entwicklungsnamen (vor der Umstellung)

Volle Namen ("Eagle Eye" usw., inklusive Bindestrich- und Pluralformen):

| Datei | Fundstellen |
|---|---|
| `EAGLE-MODULES-PLAN.md` | 74 |
| `dadm/eagle-modules-projektplan.md` | 59 |
| `dadm/reference/source-analysis/README.md` | 19 |
| `dadm/reference/source-analysis/prey-rules-customization.md` | 9 |
| `dadm/reference/source-analysis/beak-importers.md` | 5 |
| `dadm/reference/source-analysis/wings-automation.md` | 5 |
| `README.md` | 1 |
| `dadm/README.md` | 1 |
| `dadm/reference/source-analysis/techniques-catalog.md` | 1 |
| **Summe** | **174** |

Verteilung der Formen: Eagle Eye 37, Eagle Beak 30, Eagle Prey 28, Eagle Wings 24,
Eagle Egg 19, Eagle Talon 17, Eagle Eyrie 14. Dazu Sonderformen: "Eagle-Eye-Hub",
"Eagle-Eye-Anforderungen", "Eagle-Eye-Kernfunktionen" (je 1), "Eagle-Beak-Konzept" (1),
Plural/Genitiv "Eagle Eggs" (1).

Kurzformen ohne "Eagle" (nur Eyrie, Egg, Beak, Talon, Prey, Wings): 25 Zeilen, davon
`eagle-modules-projektplan.md` 10, `EAGLE-MODULES-PLAN.md` 7, `source-analysis/README.md`
3, `wings-automation.md` 4, `prey-rules-customization.md` 1 (manche Zeilen enthalten
mehrere), dazu Zusammensetzungen wie "Wings-Modul" und "Wings-Bündelung".

Grammatik: Fundstellen mit Artikel oder Präposition (aus der Fundstellenliste):
"aus der Eagle Eye" (weiblich, passt zu "Die Eagle Flight Control" im PDF),
sonst überwiegend artikellos ("für Eagle Beak", "vor Eagle Wings").

## Fundstellen, die **nicht** Entwicklungsnamen eines Moduls sind
- "EagleEye" in einem Wort: 3 Stellen (`README.md` Titel; `EAGLE-MODULES-PLAN.md`
  Zeile 11, das Phase-1-Modul; `eagle-modules-projektplan.md` Zeile 20, "EagleEye
  als aktiv nutzbare API"). "EagleEye" ist Projekt-, Repo- und Modulname des
  bestehenden Codes und bleibt laut E5.
- Milestone-Nummern (M1–M10) im Projektplan bezeichnen die Milestones der
  Planungsphase 2.
- Dateinamen `beak-importers.md`, `prey-rules-customization.md`, `wings-automation.md`
  tragen die Entwicklungsnamen kleingeschrieben.

## Inventory: Aussagen, die durch E1–E8 oder das PDF inhaltlich überholt sein könnten
Nur Trefferzahlen nach Stichwörtern (Bedeutungsverschiebungen, die M15 einarbeiten
muss; keine Bewertung):

| Thema | Stichwort | Trefferzeilen |
|---|---|---|
| Fremdmodule | "remd" | PLAN 5, Projektplan 3, SA-README 3, wings 2, techniques 2, README 1 |
| Foundry 14 / dnd5e 6 | "v14", "Foundry 14", "dnd5e 6" | SA-README 8, wings 9, PLAN 1, prey 1, beak 1, README 1 |
| Fremdmodul für Bedingungen | "Build-a-Bonus" | SA-README 3, Projektplan 1 |
| Verhältnis zu Custom D&D 5e | "aufbauen", "Koexist" | SA-README 4, prey 2, wings 2 |
| Freitext-Import | "Import Homebrew", "Freitext" | Projektplan 6, PLAN 4, SA-README 2, beak 2 |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Eine rein mechanische Ersetzung kann Sätze inhaltlich falsch machen (z. B. "Eagle Flight Control verbindet eigene und fremde Module", was E6 widerspricht). Gegenmaßnahme: Namensumstellung getrennt von Inhaltsänderung halten, Status-Hinweise setzen, Liste der überholten Aussagen für M15 | medium | nein |
| R2 | Grammatik bei Kurzformen, Bindestrich-Zusammensetzungen und Plural muss von Hand geprüft werden | low | nein |
| R3 | Doppelte Klammer-Erwähnungen ("ehemals …") an jeder Stelle würden die Lesbarkeit verschlechtern | low | nein |
| A1 | Dateinamen der Referenzdokumente werden nicht umbenannt; E5 betrifft Inhalte, nicht Dateinamen. Ob das gewünscht ist, ist offen (Punkt für M4) | info | nein |

## Open Questions
Keine für den Ablauf von M3. Frage für M4: Sollen die drei Dateinamen mit
Entwicklungsnamen umbenannt werden (`beak-importers.md`, `prey-rules-customization.md`,
`wings-automation.md`)?

## Next Step
Apply legt die Ersetzungsregeln, die Form der Namens-/Status-Hinweise und die
Acceptance Criteria fest.

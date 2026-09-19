```
artifact: apply-output
milestone: M2
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m2-01-discover-output.md` (Inventar des PDFs, Formbeobachtungen)
- Vorbild: Aufbau von `dadm/reference/eagle-modules-vision.md`

## Design des Referenzdokuments
Datei: `dadm/reference/eagle-modules-aufbau.md`

Aufbau, in dieser Reihenfolge:
1. **Kopf** mit Quelle, Datum, Retention `durable`, Hinweis, dass das Dokument
   das PDF wortgetreu wiedergibt und dass bei Abweichungen zur Vision der
   Delta-Abgleich (M4) folgt
2. **Transkript des PDFs** — Abschnittsüberschriften, Reihenfolge und
   Aufzählungspunkte wie im PDF; Wortlaut inklusive Tipp- und
   Schreibfehlern unverändert, typografische Anführungszeichen bleiben
3. **Hinweise zur Transkription** — die Formbeobachtungen aus Discover als
   Fakten, ohne Deutung
4. **Antworten des Projektleiters vom 2026-09-19** — die vier Antworten zu
   Q1–Q4 im Wortlaut, mit der jeweiligen Frage, dazu die Ergänzung zum PDF und die
   beiden AskUserQuestion-Antworten samt Fragestellung
5. **Entscheidungen E1–E8** in Kurzform mit Quelle; maßgeblich bleibt
   `dadm/01-project-brief.md`
6. **Namenszuordnung** Entwicklungsname → Modulname

## Transkriptionsregeln
- Nichts korrigieren, ergänzen, zusammenfassen oder umstellen. Auch offensichtliche
  Tippfehler bleiben.
- Was im PDF ein eigener Aufzählungspunkt ist, bleibt ein eigener Punkt
  (auch die Zeile "Weapon, Container, …").
- Keine Modulnamen ersetzen: Im Transkript stehen die Namen wie im PDF.
- Keine Bewertung, keine Widerspruchsmarkierung im Transkript selbst. Das ist
  Aufgabe von M4 und steht in einem anderen Dokument.
- Kein Bezug auf die Vision im Transkriptteil.

## Acceptance Criteria
- AC-M2-01: Jede Aussage des PDFs steht im Dokument; Punktezahl je Abschnitt
  stimmt mit dem Inventar überein (Flight Control 8, Library 10, Character Edit 6
  plus 6 Registerkarten-Zeilen, Homebrew 9, Journal 2, Ruling 2, Roll Out 2)
- AC-M2-02: Wortlaut unverändert (Stichprobe der Schreibweisen "Leveltatsächlich",
  "Projekplan", "vllt", "einträgen zu Suchen", "(2014,2024)")
- AC-M2-03: Antworten des Projektleiters stehen im Wortlaut im Dokument
- AC-M2-04: Entscheidungen E1–E8 und Namenszuordnung sind enthalten und stimmen
  mit `dadm/01-project-brief.md` überein
- AC-M2-05: Das Dokument enthält keine Bewertung und keinen Vergleich mit der Vision

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Doppelte Pflege von E1–E8 in zwei Dokumenten kann auseinanderlaufen; Gegenmaßnahme: Verweis, dass der Project Brief maßgeblich ist | low | nein |

## Next Step
Deploy erstellt das Dokument und prüft die Punktezahlen.

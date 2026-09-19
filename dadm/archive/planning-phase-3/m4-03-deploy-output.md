```
artifact: deploy-output
milestone: M4
phase: DEPLOY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m4-02-apply-output.md` (Klassifikation, Klärungsliste, AC-M4-01 bis AC-M4-04)

## Implementation Summary
Das Ergebnisdokument der Planungsphase 3, `dadm/spezifikationsabgleich.md`, wurde
angelegt: Stand der Milestones, Kurzfassungen zu M2 und M3, Delta Vision → Aufbau als
Kurzfassung je Modul (mit Verweis auf die vollständige Zuordnung im Apply-Output) und die
Klärungsliste mit 16 Fragen (Status: alle offen). Die Fragen wurden per Skript aus dem
Apply-Output übernommen, damit sie wortgleich sind.

## Files Changed
- `dadm/spezifikationsabgleich.md` (neu)

## Proofs
Vollständigkeitsprüfung per Skript über Discover- und Apply-Output:

```
Discover: V 45 P 40
nicht klassifiziert V: [] P: []
V-IDs als Ursprung genau einmal: True | doppelt: []
F-Zeilen: 17 ohne Frage-Verweis: []
Fragen im Ergebnisdokument: 16 | alle mit 6 Spalten: True
```

## Acceptance Checklist
- [x] AC-M4-01 — alle 45 Vision-Aussagen und alle 40 PDF-Aussagen sind zugeordnet; jede
  Vision-Aussage genau einmal als Ursprung
- [x] AC-M4-02 — alle 17 Zeilen der Klasse **F** verweisen auf eine Frage; jede der 16
  Fragen nennt Optionen, Auswirkung und Empfehlung bzw. "keine"
- [x] AC-M4-03 — Klassifikation (Kurzfassung) und Klärungsliste stehen in
  `dadm/spezifikationsabgleich.md`
- [ ] AC-M4-04 — Antworten des Projektleiters sind in `dadm/reference/eagle-modules-aufbau.md`
  festgehalten: **offen, wartet auf die Antworten**

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Ohne Antworten auf Q0–Q15 laufen M5–M14 Gefahr, in die falsche Richtung zu recherchieren | medium | ja, geplanter Stopp |

## Next Step
Deploy für M4 geschlossen. Weiter mit Monitor für M4; danach Stopp bis zu den Antworten.

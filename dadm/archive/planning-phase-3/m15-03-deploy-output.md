```
artifact: deploy-output
milestone: M15
phase: DEPLOY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m15-02-apply-output.md`

## Implementation Summary
- `EAGLE-MODULES-PLAN.md` vollständig neu geschrieben (Aufbau wie in Apply).
- `dadm/eagle-modules-projektplan.md` vollständig neu geschrieben (technische Fassung, ersetzt den Stand der Planungsphase 2; der frühere Text liegt im Git-Verlauf und die Milestone-Outputs der Phase im Archiv).
- `README.md`: Einleitung angepasst.
- `dadm/spezifikationsabgleich.md`: Abschnitt "M15" und Stand der Milestones ergänzt (siehe unten).

## Files Changed
- `EAGLE-MODULES-PLAN.md`, `README.md`
- `dadm/eagle-modules-projektplan.md`, `dadm/spezifikationsabgleich.md`, `dadm/README.md`

## Proofs
```
Entwicklungsnamen außerhalb "(ehemals …)":  EAGLE-MODULES-PLAN.md 0 · eagle-modules-projektplan.md 0 · README.md 0
fehlende Verweisziele: keine (SUMMARY.md im README steht als Kurzverweis "darin" auf das Archiv)
N10–N20: im Ergebnisdokument, im Standalone-Plan (Tabelle 8.2) und im technischen Plan genannt (alle elf)
```
Reststichworte im Standalone-Plan (Kontext geprüft): "v14" nur als Aussage, dass v14 nicht weiterverfolgt wird; "Freitext" nur als "Import zurückgestellt"; "Kompatibilitäts-" nur als beschriebene Idee und als "entfällt".

Abgleich mit der Liste überholter Aussagen aus `m3-03`:
| Thema | Stand |
|---|---|
| Fremdmodule als Teil der Schnittstelle (E6) | in beiden Plänen überarbeitet |
| Foundry 14 / beide Versionen (E1) | in beiden Plänen überarbeitet; README Einleitung und Build-Abschnitt (M1) angepasst |
| Build-a-Bonus für Bedingungen (E3) | ersetzt (zwei Stufen ohne Fremdmodul) |
| Verhältnis zu Custom D&D 5e (E2) | überarbeitet; Korrektur zur Lauffähigkeit aufgenommen |
| Freitext-Import | als zurückgestellt geführt |
| Bezeichnung "Eagle Library" für Sammlung und Modul | im Plan wird "Eagle Library" für das Modul und "die Library" für die Sammlung verwendet |
| Reference-Dokumente der Quellenanalyse | unverändert (Referenz; Status-Hinweise und Korrektur zu K1 vorhanden) |

## Acceptance Checklist
- [x] AC-M15-01 — nur echte Namen
- [x] AC-M15-02 — Entscheidungen E1–E8, Q0–Q15, N1–N9 berücksichtigt
- [x] AC-M15-03 — N10–N20 in allen drei Stellen
- [x] AC-M15-04 — Verweise führen auf vorhandene Dateien
- [x] AC-M15-05 — Liste überholter Aussagen abgearbeitet
- [ ] AC-M15-06 — Bestätigung des Projektleiters: **ausstehend**

## Risks and Assumptions
Keine neuen.

## Next Step
Deploy für M15 geschlossen. Weiter mit Monitor für M15; danach Bestätigung durch den Projektleiter.

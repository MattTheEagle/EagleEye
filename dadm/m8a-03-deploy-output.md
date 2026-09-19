```
artifact: deploy-output
milestone: M8a
phase: DEPLOY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m8a-02-apply-output.md` (Einordnung, Strategie, Verdict, N10, N11, AC-M8a-01 bis AC-M8a-04)

## Implementation Summary
`dadm/spezifikationsabgleich.md`: Abschnitt "M8a" (Verweisarten, Verdict, Strategie) eingefügt; N10 und N11 in die Punktetabelle aufgenommen; Überschrift der Tabelle auf N1–N11 erweitert; Milestone-Tabelle aktualisiert.
Die zwei Hilfsskripte der Auswertung liegen als Referenz in `dadm/reference/source-analysis/scripts/` (rein lesend, PyYAML).

## Files Changed
- `dadm/spezifikationsabgleich.md`
- neu: `dadm/reference/source-analysis/scripts/scan-refs.py`, `scan-refs-2.py`

## Proofs
- Die Auswertung lief über alle 4.674 YAML-Dokumente von `packs/_source` (dnd5e 5.3.3, Commit `965ad2d`); Ergebnis in Discover (Treffer je Muster und je Feldpfad).
- Schema-Inventar s1–s16 mit Datei und Zeile.
- Nicht Verifiziertes (R1, R2, R3) ist gekennzeichnet.

## Acceptance Checklist
- [x] AC-M8a-01 — Items, Actors, Journale, Rolltabellen aus Schema und realem Inhalt abgedeckt
- [x] AC-M8a-02 — jede Verweisart mit Verdict und Quellen, Nicht-Belegtes gekennzeichnet
- [x] AC-M8a-03 — Auswirkungen auf Kopiervorgang, Einmaligkeit, Character Edit, Homebrew beschrieben
- [x] AC-M8a-04 — Ergebnis, N10, N11 im Ergebnisdokument

## Risks and Assumptions
Keine neuen (siehe Apply R1–R3).

## Next Step
Deploy für M8a geschlossen. Weiter mit Monitor für M8a.

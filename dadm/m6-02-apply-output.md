```
artifact: apply-output
milestone: M6
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m6-01-discover-output.md` (geschlossen)

## Machbarkeitsbewertung
**Verdict: Freitext-Parsing ist zuverlässig nur für templatierte Eingaben
machbar (Stat-Blocks, JSON, CSV), nicht für echte freie Prosa — bestätigt das
im Milestone Plan erwartete Ergebnis ("hoch", "kein Scheitern").** Das ist
keine Schwäche eines potenziellen EagleEye-eigenen Parsers, sondern eine
strukturelle Grenze von Regex-/Muster-basiertem Parsing ohne
Sprachverständnis — bestätigt durch ein reales, aktiv genutztes
Precedent-Modul.

## Empfehlung für Eagle Beak
Statt "freien Text parsen" als Versprechen zu formulieren (das laut Vision-
Problem-Statement genau am bestehenden Ansatz anderer Importer scheitert),
wird empfohlen:
1. **Templatierte Eingabe explizit unterstützen und bewerben** (Stat-Block-
   Formate, JSON) — dort ist zuverlässiges Parsen realistisch
2. **Bei Freitext-Eingabe transparent "Best Effort" kommunizieren**, mit
   Editor-Vorschau zur Korrektur (wie in der Vision ohnehin für "Import
   Homebrew" vorgesehen — das Problem ist bereits im eigenen Konzept
   mitgedacht: "Fehler/nicht erkannte Angaben werden im Editor hervorgehoben
   und können nachbearbeitet werden")
3. Der Korrektur-Editor-Schritt aus der Vision ist damit **keine
   Nebensache, sondern der eigentlich tragende Teil** der Freitext-Import-
   Funktion — das Parsen liefert nur einen Entwurf, keine fertige Lösung

## Acceptance Criteria
```
AC-M6-01: Machbarkeitsbewertung mit Quellenbelegen — erfüllt
AC-M6-02: Vergleich mit bestehenden Importer-Modulen — erfüllt
```

## Risks and Assumptions
Siehe Discover R1 (erwartetes, jetzt belegtes Ergebnis).

## Next Step
Deploy: Ergebnis in `dadm/eagle-modules-projektplan.md` übernehmen. Danach
Monitor, dann automatisch weiter mit M7 (Eagle Talon).

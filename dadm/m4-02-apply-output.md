```
artifact: apply-output
milestone: M4
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m4-01-discover-output.md` (geschlossen — alle benötigten Bausteine
  sind offizielle Foundry-APIs)

## Machbarkeitsbewertung
**Verdict: machbar, reine Kompositionsaufgabe.** Jede einzelne
Eyrie-Anforderung (Compendium-Erstellung, Index-basierte Suche, Dedup,
Ausnahme-Typen, Log + Nachtrag) entspricht einem dokumentierten,
offiziellen Foundry-Core-Baustein. Kein Feature erfordert unbelegte
Annahmen oder Fremdmodul-Abhängigkeiten.

## API-Umwandlung-Relevanz (aus Milestone Plan) — Befund: geringer als angenommen
Die im Plan vermutete Normalisierungsfrage (System-Compendia vs.
D&D-Beyond-Importer vs. Forge-Compendia liefern unterschiedliche
Datenformen) stellt sich bei genauerer Betrachtung **nicht** wie erwartet:
Sobald Inhalt als reguläres Foundry-Dokument (Actor/Item) existiert, ist es
bereits auf das jeweilige System-Schema (z. B. dnd5e) normalisiert — diese
Normalisierung leistet der jeweilige Importer/die Quelle bereits, bevor das
Dokument in einer Compendium landet. Es gibt kein separates "DDB-Format" oder
"Forge-Format" auf Dokumentenebene. Das eigentliche Eyrie-Problem ist
**Duplikat-Erkennung** (dieselbe Sache mehrfach vorhanden), nicht
**Formatübersetzung** — ein einfacheres, bereits durch M4-Discover
abgedecktes Problem. Der M2-Befund (Activity-Schema-Befüllung) ist hier
**nicht direkt anwendbar**, da keine neue Datenstruktur erzeugt werden muss.

## Acceptance Criteria
```
AC-M4-01: Machbarkeitsbewertung dokumentiert, mit Quellenbelegen — erfüllt
AC-M4-02: API-Umwandlung-Relevanz bewertet (nicht nur pauschal angenommen) —
          erfüllt, Ergebnis: geringer relevant als im Plan vermutet
```

## Risks and Assumptions
Siehe Discover R1 (Performance bei vollem Dokumentladen statt Index-Nutzung
— Design-Hinweis für spätere Umsetzung).

## Next Step
Deploy: Ergebnis in `dadm/eagle-modules-projektplan.md` übernehmen. Danach
Monitor, dann automatisch weiter mit M5 (Eagle Egg).

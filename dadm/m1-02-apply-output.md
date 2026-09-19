```
artifact: apply-output
milestone: M1
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m1-01-discover-output.md` (geschlossen — R1/Q1: Plan-Lücke für A3b/A3c)

## Solution Design: Optionen für den Umgang mit R1 (Plan-Lücke A3b/A3c)

Zur Erinnerung, die beiden unabgedeckten Eagle-Eye-Kernanforderungen:
- **A3b:** Erkennen, dass eine Einstellungsänderung eines Moduls ein anderes
  Modul beeinflusst, DM informieren
- **A3c:** Dependencies zwischen Modulen aktivieren/deaktivieren können

**Option A — Neues eigenes Milestone einfügen** (z. B. zwischen M2 und M3, da
inhaltlich näher an Eagle Eye selbst als an den Satelliten-Modulen)
- Vorteil: Konsistent mit dem Projektziel ("Plan verstehen, Umsetzbarkeit sehr
  detailreich prüfen") — beides sind explizite Vision-Anforderungen, kein
  Nice-to-have
- Nachteil: Erweitert den bereits genehmigten Plan (Cross-Milestone-
  Scope-Change) — braucht explizite Freigabe, kein automatischer Schritt

**Option B — In M9 (Synthese) als offene Fragen aufnehmen, ohne eigene
Discover/Apply-Recherche**
- Vorteil: Kein Eingriff in den bereits genehmigten Plan nötig
- Nachteil: Zwei explizit in der Vision geforderte Eagle-Eye-Fähigkeiten
  blieben in dieser "sehr detailreichen" Analysephase unerforscht

**Option C — Bewusst außerhalb dieser Phase lassen**
- Vorteil: Plan bleibt exakt wie genehmigt
- Nachteil: Größte inhaltliche Lücke der drei Optionen

## Empfehlung
**Option A.** Beide Fragen sind in der Vision explizit als Eagle-Eye-
Kernfunktionen benannt (nicht Teil eines Satelliten-Moduls), und das
Projektziel fordert ausdrücklich Detailtiefe ohne Zeitdruck. Eine
Investigation ist ohne Codeänderung möglich (reine API-/Architektur-
Recherche, passend zum Non-Goal "keine Feature-Entwicklung"). Da dies aber
eine Erweiterung des genehmigten Plans ist, entscheidet der Projektleiter.

## Acceptance Criteria
```
AC-M1-01: Abgleichtabelle vollständig (siehe Discover-Output) — erfüllt.
AC-M1-02: Liste offener Fragen für spätere Milestones vorhanden — erfüllt.
AC-M1-03: Entscheidung zu R1/Q1 vom Projektleiter eingeholt — erfüllt:
          Option A gewählt, Milestone Plan v2 mit neuem M3 (Eagle Eye
          Kernfragen) erstellt und genehmigt (siehe
          `05-milestone-plan-approval-v2.md`).
```

**Entscheidung umgesetzt:** Milestone Plan auf Version 2 aktualisiert, neues
M3 "Eagle Eye: Cross-Modul-Settings-Impact & Modul-(De)Aktivierung"
eingefügt, Folge-Milestones zu M4–M10 verschoben.

## Risks and Assumptions
Keine neuen — siehe Discover R1/R2.

## Next Step
Automatischer Ablauf gestoppt (siehe `06-working-mode.md`,
Autonomie-Freigabe). Warten auf Projektleiter-Entscheidung zu Q1/Option
A/B/C, bevor Deploy (Aufnahme in den Gesamtplan) und Monitor für M1
abgeschlossen werden.

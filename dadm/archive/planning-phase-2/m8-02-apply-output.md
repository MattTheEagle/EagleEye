```
artifact: apply-output
milestone: M8
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m8-01-discover-output.md` (geschlossen — zweigeteilter Befund)

## Machbarkeitsbewertung (zweigeteilt, wie in Discover begründet)

| Teil | Verdict | Weg |
|---|---|---|
| Schriftliche Regeldarstellung | **voll automatisch machbar** | `CONFIG.DND5E.rules` auslesen, von dnd5e selbst gepflegt |
| Mechanik als editierbarer Wert, **falls** als dnd5e-Setting exponiert | **machbar** | bestehender Settings-Hub (Phase 1 M4) direkt wiederverwendbar |
| Mechanik als editierbarer Wert, **sonst** (Großteil der Fälle) | **nicht ohne Code-Eingriff machbar** | entspricht dem in der Vision bereits antizipierten Fallback (tiefe Eingriffe) |

**Gesamtverdict:** Deutlich differenzierter als die ursprüngliche
Plan-Einschätzung ("hoch, stark eingeschränkt oder nicht robust machbar").
Der **Text-Teil** ist überraschend gut und vollautomatisch lösbar. Der
**Mechanik-Teil** bestätigt die ursprüngliche Erwartung nur für den Teil
**ohne** Settings-Zugang — für den (unbekannt großen) Teil **mit**
Settings-Zugang ist er sogar bereits durch bestehende Phase-1-Infrastruktur
abgedeckt.

## Empfehlung
Eagle Prey in zwei klar getrennte Ebenen aufteilen:
1. **Regel-Nachschlagewerk** (Text, `CONFIG.DND5E.rules`) — sofort machbar,
   kein Risiko
2. **Regel-Einstellungen, soweit von dnd5e als Settings exponiert** —
   direkte Erweiterung des bestehenden Settings-Hubs (dieselbe Infrastruktur
   wie M3 dieser Phase), kein neues technisches Risiko
3. **"Change Rule to Homebrew" für alles andere** — bleibt wie in der Vision
   selbst vorgesehen: tiefe Eingriffe als bewusster Fallback, kein
   generischer, code-freier Weg

Eine vollständige Bestandsaufnahme, welche Mechaniken bereits als Settings
exponiert sind, wäre eine sinnvolle erste Aufgabe einer künftigen
Umsetzungsphase — kein Teil dieser Planungsphase (R1).

## Acceptance Criteria
```
AC-M8-01: Machbarkeitsbewertung mit Quellenbelegen — erfüllt
AC-M8-02: Klare Grenzziehung zwischen automatisch/teilweise/nicht machbar —
          erfüllt
```

## Risks and Assumptions
Siehe Discover R1, R2.

## Next Step
Deploy: Ergebnis in `dadm/eagle-modules-projektplan.md` übernehmen. Danach
Monitor, dann automatisch weiter mit M9 (Eagle Wings Kurz-Scoping).

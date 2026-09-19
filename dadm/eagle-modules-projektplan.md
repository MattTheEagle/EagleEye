# Eagle Modules — Projektplan (im Aufbau)

status: in Arbeit — wird von jedem Milestone (M1–M10, siehe
`04-milestone-plan.md`, Version 2) inkrementell ergänzt. M10 (Synthese)
schließt mit Abhängigkeitsgraph, Gesamt-Risiko-/Machbarkeitsmatrix,
API-Umwandlung-Übersicht und priorisierter Umsetzungsempfehlung ab.
retention: durable

Quelle der Ideen: `dadm/reference/eagle-modules-vision.md`.

---

## M1 — Eagle Eye: Bestandsaufnahme gegen Vision-Anforderungen

**Ergebnis:** Vier von fünf explizit genannten Eagle-Eye-Anforderungen sind
durch Research Phase 1 bereits (teilweise) belegt. Zwei Kernanforderungen
waren im ursprünglichen Plan (Version 1) nicht abgedeckt und wurden über eine
Plan-Erweiterung (neues M3, siehe unten) nachträglich aufgenommen.

| Anforderung | Status | Kurzbegründung |
|---|---|---|
| Schnittstelle Foundry/DnD/eigene/fremde Module | teilweise belegt | Lesend/beobachtend gut belegt (Phase 1 M3–M6); EagleEye als aktiv nutzbare API für Drittmodule nie untersucht |
| Kompatibilität erkennen + warum | belegt | `availability`/`getVersionBadge()` (Manifest-Ebene) + `libWrapper.ConflictDetected`/`OverrideLost` (Laufzeit-Ebene, nur libWrapper-Fälle) |
| Settings-Hub: gebündelte Änderung | belegt | Bidirektional gegen 94 reale Pakete verifiziert (Phase 1 M4) |
| Settings-Hub: Cross-Modul-Auswirkung erkennen + DM informieren | **offen** | Kein bekannter genereller Mechanismus — eigenes Milestone (M3) |
| Settings-Hub: Modul-Dependencies (de)aktivieren | **offen** | Nicht untersucht — eigenes Milestone (M3) |
| Datenbank mit Zugriff auf Funktionen | teilweise belegt | Datenlesezugriff belegt; Funktionsaufruf fremder Module nicht |
| "API umwandeln" | verschoben | Eigene Grundsatzfrage, siehe M2 |

Vollständige Belege: `dadm/m1-01-discover-output.md`, `dadm/m1-02-apply-output.md`.

---

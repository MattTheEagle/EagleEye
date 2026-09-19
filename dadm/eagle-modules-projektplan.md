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

## M2 — API-Umwandlung: Grundsatzfrage (Eagle Eye / Eagle Beak)

**Ergebnis:** Machbar für den Referenzfall (magisches Langschwert, +2W6 Feuer
vs. Untote), aber als **Komposition zweier Mechanismen**, nicht eine einzelne
API: (1) dnd5e's natives Activity-/DamageData-Schema deckt Schadensmenge,
-typ und "magisch"-Kennzeichnung vollständig deklarativ ab — kein Code nötig.
(2) Zielkreaturentyp-Bedingungen ("vs. Untote") fehlen im dnd5e-Kern
nachweislich (offizielles, offenes dnd5e-Issue #4477), sind aber durch das
reale Community-Modul "Build-a-Bonus" bereits bewiesen lösbar (UI-basiert,
kein Code).

**Generalisierbarkeit:** dnd5e bietet 11 Activity-Typen, bewusst breit für
code-freie Item-Mechaniken angelegt — der Ansatz dürfte für die Mehrheit
gängiger Homebrew-Wünsche funktionieren. Grenze: grundlegend neuartige
Mechaniken außerhalb dieser 11 Typen brauchen echten Custom-Code.

**Übertragbarkeit:** hoch für M5 (Egg — Klassenmerkmale nutzen ebenfalls
Activities), gering für M4 (Eyrie) und M7 (Talon), **nicht übertragbar** auf
M8 (Prey) — dort ist die Fragerichtung umgekehrt (Override bestehender Logik
statt Neuerstellung), eigene Recherche nötig.

Vollständige Belege: `dadm/m2-01-discover-output.md`, `dadm/m2-02-apply-output.md`.

---

## M3 — Eagle Eye: Cross-Modul-Settings-Impact & Modul-(De)Aktivierung

**Ergebnis (Teilfrage a, Stufe 1 — deklarierte Abhängigkeiten):** Machbar,
großteils bereits vorhanden. Erweiterung des bestehenden
Manifest-Scanners (Phase 1 M3) um eine Warnfunktion beim Versuch, ein
Modul zu deaktivieren, von dem andere aktive Module deklariert abhängen.

**Ergebnis (Teilfrage a, Stufe 2 — generische Verhaltens-Erkennung):** Nicht
robust machbar. Kein Foundry-Mechanismus verknüpft Settings-Änderungen mit
Verhaltensänderungen undeklariert verbundener Module. Nur über eine
kuratierte, manuell gepflegte Wissensbasis denkbar — das ist kein
automatisches Erkennen.

**Ergebnis (Teilfrage b — Modul-Aktivierung):** Nur über die Standard-UI
(`ModuleManagement`, selbst in Foundrys Typdefinitionen nur als Stub
vorhanden), erfordert zwingend einen Welt-Neustart. Keine öffentliche API für
programmatisches Umschalten durch ein Drittmodul gefunden. Eagle Eye könnte
höchstens eine komfortablere Oberfläche darüber bauen, keine echte
Laufzeit-Aktivierung.

Vollständige Belege: `dadm/m3-01-discover-output.md`, `dadm/m3-02-apply-output.md`.

---

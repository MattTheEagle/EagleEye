# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
**Umsetzungsphase 4 "Eagle Flight Control" läuft.** Bootstrap abgeschlossen, Milestone Plan Version 1 (M1–M8) am 2026-09-19 freigegeben. Discover und Apply laufen
eigenständig, vor jedem Deploy wartet der Ablauf auf das "Go" (`06-working-mode.md`). Die drei früheren Phasen liegen unter `archive/`.
**Committet wird nur lokal und nur auf Anweisung des Projektleiters; gepusht ist bisher nichts** (Push nur auf seine Anweisung). Den Stand zeigen `git log origin/master..HEAD` und `git status`.

| Milestone | Stand | Artefakte | Live-Prüfung |
|---|---|---|---|
| M1 Phase-1-Code schneiden | abgeschlossen | `m1-01` bis `m1-04` | Startlog und Menü bestätigt (`m2-05`, `m4-05`) |
| M2 Modul-Anmeldung und Erkennung | abgeschlossen | `m2-01` bis `m2-05` | bestanden (`m2-05-live-check-output.md`, R1 geschlossen) |
| M3 Hub-Oberfläche mit UI-Leitfaden | abgeschlossen, Nacharbeit 1 live bestätigt, Nacharbeit 2 (Rahmen um den Modul-Block) umgesetzt | `m3-01` bis `m3-04`, `m3-rework-1-output.md`, `m3-rework-2-output.md` | bestanden mit Befund F1 (Feld-Anordnung weicht vom nativen Look ab, `medium`): `m4-05-live-check-output.md`; Nacharbeit 1 (Option A) live bestätigt (`m5-05`); Nacharbeit 2 (Rahmen mit Titel, Wahl des Projektleiters) live gesehen (`m6a-05`): der Titel sitzt zu nah an der Tab-Leiste (`low`); Nacharbeit 3 (Titel entfällt, Versuch 2 von 2, `m3-rework-3-output.md`) kommt gebündelt mit dem M6b-Paket |
| M4 Anfragekanal-Kern | abgeschlossen | `m4-01` bis `m4-04` | bestanden (`m4-05-live-check-output.md`) |
| M5 GM-Weiterleitung | abgeschlossen | `m5-01` bis `m5-05` | bestanden (`m5-05-live-check-output.md`: `no-gm`, Spieler → GM → Ergebnis, U1 beantwortet); offen nur Test E (Spieleransicht) und die nicht ausgelösten Fehlerwege |
| M6a Verifizierte Nutzeridentität (Planversion 2) | abgeschlossen: Discover, Human Decision 1, Spike, Apply, Deploy, Monitor und Live-Check (Go am 2026-09-20); API `0.5.0`, 87 Tests in 12 Dateien | `m6-01`, `m6-hd-1-output.md`, `m6-spike-1-output.md`, `m6-spike-1-result-output.md`, `m6a-02` bis `m6a-05` | bestanden (`m6a-05-live-check-output.md`): Spieler `ran by <GM>`, `asked by <Spieler>`; GM lokal; drei gefälschte Angaben `not-permitted`. Angenommenes Restrisiko: Schutz nur gegen die Fälschung einer fremden Identität |
| M6b Nutzungsrechte je Modul und Nutzer (Planversion 2) | Discover und Apply abgeschlossen; **wartet auf das Go** (Risiken R1 bis R3 `medium`, Punkte T1 bis T9, Nacharbeit 3 mit Wahl A oder B) | `m6b-01-discover-output.md`, `m6b-02-apply-output.md` | — |
| M7, M8 | offen | — | — |

## Aktive Phase (Bootstrap-Artefakte)
| Datei | Inhalt |
|---|---|
| `01-project-brief.md` | Ziel, messbarer Endzustand, Entscheidungen U1–U5, Non-Goals |
| `02-safety-boundaries.md` | Safety Boundaries (inherited plus Overrides Live-Test-Gate und Publizieren) |
| `03-scope-declaration.md` | Schreib-/Lesezugriff, ausdrücklich nicht im Scope |
| `04-milestone-plan.md` | Milestone Plan Version 1, M1–M8, Proofs, Rückverfolgung auf P-FC1–P-FC8 |
| `05-milestone-plan-approval.md` | Freigabe (immutable) |
| `06-working-mode.md` | `one_chat`, Autonomie-Regelung, Live-Tests, Commit/Push nur auf Anweisung |
| `m<N>-0<P>-<phase>-output.md` | Milestone-Outputs (`01` Discover, `02` Apply, `03` Deploy, `04` Monitor) |
| `04-milestone-plan-v2.md`, `05-milestone-plan-approval-v2.md` | Planversion 2 (M6 geteilt in M6a und M6b), freigegeben am 2026-09-20; Version 1 bleibt unverändert |

## Lebende Dokumente
| Datei | Inhalt |
|---|---|
| `eagle-modules-projektplan.md` | technischer Projektplan (Stand Planungsphase 3, bestätigt) |
| `../EAGLE-MODULES-PLAN.md` | eigenständig lesbare Fassung für Leser ohne Vorwissen |
| `reference/eagle-modules-aufbau.md` | das PDF "Eagle Modules - Aufbau" wortgetreu, alle Antworten und Klarstellungen des Projektleiters, Namenszuordnung |
| `reference/eagle-modules-vision.md` | ursprüngliche Vision (mit den Entwicklungsnamen der Module) inkl. Klärungen aus dem damaligen Bootstrap |
| `reference/source-analysis/` | Analyse von zehn bestehenden Foundry-Modulen (Importer, Regelanpassung, Automatisierung), inkl. Versionshistorie (Abschnitt 4 der README) und Skripten der Verweis-Auswertung; Einstieg: `reference/source-analysis/README.md` |
| `bios.registry.json` | workspace-lokale BIOS-Capability-Registry; beim nächsten Bootstrap neu erzeugen (siehe unten) |

## Archiv
Abgeschlossene Phasen. Nichts darin bindet einen künftigen Milestone Plan automatisch; es ist reines Nachschlagematerial, keine aktive Konfiguration.
- `archive/research-phase-1/` — Grundgerüst und Machbarkeit der Kernfunktionen (Eagle Eye, jetzt Eagle Flight Control), inkl. `SUMMARY.md`
- `archive/planning-phase-2/` — Machbarkeitsplanung der Vision (Milestone Plan Version 2, M1–M10, reine Recherche)
- `archive/planning-phase-3/` — Spezifikations-Update Eagle Modules (Milestone Plan Version 2 mit M8a, M1–M15), inkl. `SUMMARY.md`, Decision-Records und Ergebnisdokument `spezifikationsabgleich.md`

## `bios.registry.json`
Neu erzeugen mit:
```
python3 <framework_root>/runtime/build_bios_registry.py --repo-root .
```

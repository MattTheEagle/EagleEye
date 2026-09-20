# dadm — Projekt-Prozess-Artefakte

## Aktueller Stand
**Umsetzungsphase 4 "Eagle Flight Control": alle Milestones (M1–M8) sind abgeschlossen** (Gesamtprüfung: `m8-06-gesamtpruefung-output.md`). Das Release 0.1.0 ist vorbereitet und abgenommen, aber bewusst nicht veröffentlicht (Release-Entscheidung B vom 2026-09-20); Tag, Push und GitHub-Release nur auf ausdrückliche Anweisung. Bootstrap und Milestone Plan Version 1 (M1–M8) wurden am 2026-09-19 freigegeben; Discover und Apply liefen eigenständig, vor jedem Deploy stand das "Go" (`06-working-mode.md`). Die drei früheren Phasen liegen unter `archive/`; die Übergabe an die nächste Phase steht in `uebergabe-naechste-phase.md`.
**Committet wird nur lokal und nur auf Anweisung des Projektleiters; gepusht ist bisher nichts** (Push nur auf seine Anweisung). Den Stand zeigen `git log origin/master..HEAD` und `git status`.

| Milestone | Stand | Artefakte | Live-Prüfung |
|---|---|---|---|
| M1 Phase-1-Code schneiden | abgeschlossen | `m1-01` bis `m1-04` | Startlog und Menü bestätigt (`m2-05`, `m4-05`) |
| M2 Modul-Anmeldung und Erkennung | abgeschlossen | `m2-01` bis `m2-05` | bestanden (`m2-05-live-check-output.md`, R1 geschlossen) |
| M3 Hub-Oberfläche mit UI-Leitfaden | abgeschlossen; Nacharbeit 1 (Feld-Anordnung) und Nacharbeit 3 (Tab ohne Titel und Rahmen) live bestätigt, Nacharbeit 2 (Rahmen mit Titel) durch 3 ersetzt | `m3-01` bis `m3-04`, `m3-rework-1-output.md`, `m3-rework-2-output.md` | bestanden mit Befund F1 (Feld-Anordnung weicht vom nativen Look ab, `medium`): `m4-05-live-check-output.md`; Nacharbeit 1 (Option A) live bestätigt (`m5-05`); Nacharbeit 2 (Rahmen mit Titel, Wahl des Projektleiters) live gesehen (`m6a-05`): der Titel sitzt zu nah an der Tab-Leiste (`low`); Nacharbeit 3 (Titel und Rahmen entfallen, Wahl B, Versuch 2 von 2, `m3-rework-3-output.md`) im Paket von M6b umgesetzt und live bestätigt (`m6b-05`, Projektleiter: gefällt) |
| M4 Anfragekanal-Kern | abgeschlossen | `m4-01` bis `m4-04` | bestanden (`m4-05-live-check-output.md`) |
| M5 GM-Weiterleitung | abgeschlossen | `m5-01` bis `m5-05` | bestanden (`m5-05-live-check-output.md`: `no-gm`, Spieler → GM → Ergebnis, U1 beantwortet); offen nur Test E (Spieleransicht) und die nicht ausgelösten Fehlerwege |
| M6a Verifizierte Nutzeridentität (Planversion 2) | abgeschlossen: Discover, Human Decision 1, Spike, Apply, Deploy, Monitor und Live-Check (Go am 2026-09-20); API `0.5.0`, 87 Tests in 12 Dateien | `m6-01`, `m6-hd-1-output.md`, `m6-spike-1-output.md`, `m6-spike-1-result-output.md`, `m6a-02` bis `m6a-05` | bestanden (`m6a-05-live-check-output.md`): Spieler `ran by <GM>`, `asked by <Spieler>`; GM lokal; drei gefälschte Angaben `not-permitted`. Angenommenes Restrisiko: Schutz nur gegen die Fälschung einer fremden Identität |
| M6b Nutzungsrechte je Modul und Nutzer (Planversion 2) | abgeschlossen: Discover, Apply, Deploy, Monitor und Live-Check (Go am 2026-09-20: R1 bis R3 `medium` angenommen, T1 bis T9 wie vorgeschlagen, Nacharbeit 3 Variante B); API `0.6.0`, 126 Tests in 15 Dateien | `m6b-01` bis `m6b-05` | bestanden (`m6b-05-live-check-output.md`): Standard "verboten" in beiden Wegen, Freigabe im Hub gespeichert, eigenes Ziel `ok` und fremdes `not-permitted` bei "Own targets only", beide `ok` bei "Own and foreign targets", Änderung kommt ohne Neuladen an, Hub gefällt. Offen (nicht blockierend): Assistent, mehrere Spieler, Besitzprüfung für GM, Compendium und "Inherit" |
| M7 DnD-Versionswächter | abgeschlossen: Discover, Apply, Deploy, Monitor und Live-Check (Go am 2026-09-20, T1 bis T8 wie vorgeschlagen, alle Risiken `low`); API `0.7.0`, 136 Tests in 16 Dateien | `m7-01` bis `m7-05` | bestanden (`m7-05-live-check-output.md`): `game.system.id` `dnd5e`, `game.system.version` `5.3.3`, Log-Zeile `(tested)`, `getSystemInfo()` wie im Vertrag. Offen (nicht blockierend, angenommen): Hinweis beim GM und die Zustände `same-line`, `untested`, `other-system`, `unknown` in Foundry (Test B mit den Prüfpaketen nicht durchgeführt) |
| M8 Abschluss: Vertrag, Gesamtprüfung, Release-Entscheidung | abgeschlossen: Discover bis Gesamtprüfung (Go am 2026-09-20: T1 bis T13 wie vorgeschlagen, Modulversion `0.1.0`, Autor `MattTheEagle`, im Plan nur die zwei Stellen aus Befund F1); API bleibt `0.7.0`, 162 Tests in 18 Dateien, alle Risiken `low`. **Release-Entscheidung B: vorbereitet lassen, später** (Tag, Push und GitHub-Release nur auf ausdrückliche Anweisung); Archivieren freigegeben | `m8-01` bis `m8-06` | bestanden (`m8-05-live-check-output.md`): Release-Zip 0.1.0, Weg Spieler → Spielleiter, `unsupported-version` und `invalid-request`, nicht verbundener Nutzer, Regler begrenzt selbst, Spieler ohne Menüknopf, Modul-Manager lässt Flight Control nicht abwählen; L4 (Prüfpakete des Wächters) vom Projektleiter als Risiko angenommen |

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
| `uebergabe-naechste-phase.md` | Übergabe an die nächste Phase: Stand von Flight Control, Regeln für Verbraucher, offene Punkte, Empfehlung (lebend) |
| `entwurf-summary-implementation-phase-4.md` | Entwurf der `SUMMARY.md` für das Archivieren der Umsetzungsphase 4 (wird dabei verschoben und abgeschlossen) |
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

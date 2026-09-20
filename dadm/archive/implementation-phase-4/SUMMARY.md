# Umsetzungsphase 4 "Eagle Flight Control" — Zusammenfassung

status: abgeschlossen und archiviert (2026-09-20)
retention: durable (nach dem Archivieren Nachschlagematerial, keine aktive Konfiguration)

Nichts in diesem Ordner (Safety Boundaries, Scope Declaration, Milestone Plans, Working Mode) bindet einen künftigen Milestone Plan automatisch. Verweise **innerhalb** der archivierten Dateien nennen die ursprünglichen Pfade `dadm/…`; sie liegen jetzt hier.

## Auftrag und Ergebnis

Auftrag: **Eagle Flight Control** umsetzen, das Kernmodul der Eagle Modules: die Schnittstelle zwischen den Eagle Modulen, dem DnD-5e-System und Foundry v13. Nur Flight Control (U1); "Klartext ↔ Code" entfiel in dieser Phase (U2).

Ergebnis:
- Modul `eagleeye`, **Version 0.1.0, API `0.7.0`**: Anmeldung von Modulen, Hub, Anfragekanal mit Weiterleitung an den Spielleiter und Bestätigung des anfragenden Nutzers, Rechte je Modul und Nutzer, Versionswächter für das DnD-5e-System.
- `docs/api-contract.md` (der Vertrag für Autoren von Eagle Modulen, durch Tests gegen den Code gehalten) und `docs/ui-guide.md` (Regeln für die Oberfläche), beide auf Englisch.
- 162 Tests in 18 Dateien; `npm run package` baut die Release-Dateien.
- Veröffentlichung: **nicht veröffentlicht** (Release-Entscheidung B am 2026-09-20: vorbereitet lassen, später). `npm run package` baut die Release-Dateien; Tag, Push und GitHub-Release nur auf ausdrückliche Anweisung.

## Ergebnis je Milestone

| M | Ziel | Ergebnis |
|---|---|---|
| M1 | Phase-1-Code schneiden | Hub-Fenster, Konflikt-Überwachung und Sprach-Erkennung entfernt; `settings-hub` und `manifest-scanner` blieben als getestete Bausteine |
| M2 | Modul-Anmeldung und Erkennung | `registerModule` über `game.modules.get("eagleeye").api`, API `0.1.0`, sieben Fehlercodes; live bestätigt |
| M3 | Hub-Oberfläche mit UI-Leitfaden | Fenster mit einer Registerkarte je Modul (Einstellungen, Startknopf), `docs/ui-guide.md`; live bestätigt, drei Nacharbeiten (Feld-Anordnung, Rahmen, zuletzt kein Titel im Tab) |
| M4 | Anfragekanal-Kern | `api.request`, Version je Anfragetyp, sieben Fehlercodes, `flightcontrol.ping`; API `0.3.0`; live bestätigt |
| M5 | Weiterleitung an den Spielleiter | `User#query`, Codes `no-gm`, `relay-timeout`, `relay-failed`, `not-permitted`, `flightcontrol.gmping`; API `0.4.0`; live bestätigt. Befund: Der Handler beim Spielleiter erfährt nicht, wer gefragt hat → Human Decision 1 |
| M6a | Verifizierte Nutzeridentität | Der Spielleiter fragt beim genannten Nutzer nach (Human Decision 1, Option B, Spike vorab); API `0.5.0`; live: drei gefälschte Angaben `not-permitted` |
| M6b | Rechte je Modul und Nutzer | `denied`, `own`, `all`, im Hub gesetzt, `getRights`, `flightcontrol.targetping`; API `0.6.0`; live bestätigt, Änderungen kommen ohne Neuladen an |
| M7 | DnD-Versionswächter | Meldet und sperrt nichts, `getSystemInfo`; API `0.7.0`; live: der getestete Standardfall bestätigt, die übrigen Zustände nicht |
| M8 | Abschluss | Vertrag zusammenhängend (Abschnittsnummern 1–10 stabil), Modulversion `0.1.0`, Paketier-Skript, Diagnosezeile aus M5 entfernt, Gesamtprüfung, Übergabenotiz; Live-Abnahme des Release-Zips bestanden (`m8-05`) |

## Wichtigste Erkenntnisse zu Foundry v13 (belegt in Forge, Build 351)

- `User#query`: Der Handler bekommt `(data, { timeout })` und **keine Angabe zum Fragenden**; deshalb fragt der Spielleiter beim genannten Nutzer nach. Ein nicht verbundener Nutzer und ein nicht registrierter Name scheitern sofort, ein Fehler im Handler kommt als Ablehnung zurück, der `timeout` wirkt.
- Eine Welteinstellung (`scope: "world"`, `config: false`, Text mit JSON) taugt als gemeinsame Ablage: Der Spielleiter schreibt, alle Clients lesen, eine Änderung kommt ohne Neuladen an.
- `game.system.id` und `game.system.version` sind zur Zeit von `ready` gefüllt (`dnd5e`, `5.3.3`).
- `doc.testUserPermission(user, "OWNER")` unterscheidet auf dem Client des Spielleiters eigene und fremde Dokumente eines Spielers.
- Oberfläche: `ApplicationV2` mit `standard-form`, `foundry.applications.fields` und dem Range-Picker liefert Foundrys eigene Optik; eine Überschrift direkt unter der Tab-Leiste wirkt falsch, ein `fieldset` mit `legend` weiter unten passt. Ein Paket ohne `lang/` zeigt rohe Textschlüssel.
- Das Zahlenfeld eines Schiebereglers begrenzt einen getippten Wert über dem Maximum selbst, bevor der Hub ihn sieht. Der Modul-Manager lässt ein Modul nicht abwählen, das aktive Module voraussetzen. Ein Spieler sieht in den Einstellungen keinen Eintrag für Flight Control (das Menü ist auf den Spielleiter beschränkt).
- Die Nachträge für die gemeinsame Referenz stehen in `foundry-vtt-reference-v13/cheat-sheet.md` (sechs Einträge, nach Freigabe am 2026-09-20 eingetragen; Wortlaut des Entwurfs: `m8-02-apply-output.md`, Abschnitt 12).

## Entscheidungen des Projektleiters in dieser Phase

- Umfang nur Flight Control (U1); Klartext ↔ Code entfällt (U2); `docs/api-contract.md` und `docs/ui-guide.md` auf Englisch.
- **Human Decision 1:** Nutzeridentität per Rückfrage beim genannten Nutzer (entgegen der Empfehlung, der mitgeschickten ID zu vertrauen), mit Spike vorab und angenommenem Restrisiko (Schutz nur gegen die Fälschung einer fremden Identität).
- Rechte: verboten oder erlaubt je Modul und Nutzer plus eigene oder fremde Ziele; nur der Spielleiter (nicht der Assistent) stellt sie ein; ohne Eintrag gilt "verboten".
- Hub: Feld-Anordnung nach Foundrys Vorbild (Option A), Titel im Tab entfällt (Variante B).
- Der Versionswächter meldet nur und sperrt nichts; seine Reaktionen für ungetestete Systemversionen sind nicht live geprüft, der Projektleiter hat das als Risiko angenommen (L4).
- M8: Modulversion `0.1.0`, Autor `MattTheEagle`; im bestätigten Plan die zwei Stellen aus Befund F1 und (nach der Gesamtprüfung freigegeben) die zwei Status-Überschriften zu Hub und Anfragen nachgeführt; Einträge für die gemeinsame Referenz nach der Gesamtprüfung freigegeben und eingetragen; **Release-Entscheidung B** (vorbereitet lassen, später); zwei lokale Commits und das Archivieren freigegeben (kein Push, kein Tag).
- Committet wird nur lokal und nur auf Anweisung; Push, Tag und Release nur auf ausdrückliche Anweisung.

## Was offen bleibt

Siehe `dadm/uebergabe-naechste-phase.md` (Abschnitt "Offene Punkte") und `docs/api-contract.md`, Abschnitt 8. Das Release ist vorbereitet, aber nicht veröffentlicht; vor einem Push ist die Datenschutz-Frage zu sechs Dokumenten mit Test-Konto-Namen oder Nutzer-IDs zu entscheiden (siehe `uebergabe-naechste-phase.md`). Die offenen Live-Punkte sind in `m8-06-gesamtpruefung-output.md` entschieden (angenommen oder als Restrisiko geführt); die Live-Abnahme steht in `m8-05-live-check-output.md`.

## Inhalt dieses Ordners

| Datei(en) | Inhalt |
|---|---|
| `01-project-brief.md` … `03-scope-declaration.md`, `06-working-mode.md` | Bootstrap-Artefakte |
| `04-milestone-plan.md` (Version 1), `04-milestone-plan-v2.md` (Version 2: M6 geteilt in M6a und M6b), `05-milestone-plan-approval*.md` | Milestone Plans und Freigaben |
| `m1-…` bis `m8-…` | je Milestone Discover-, Apply-, Deploy-, Monitor-Output; `m4-05`, `m5-05`, `m6a-05`, `m6b-05`, `m7-05`, `m8-05` sind Live-Check-Auswertungen |
| `m3-rework-1-output.md` … `m3-rework-3-output.md` | Nacharbeiten am Hub |
| `m6-01-…`, `m6-hd-1-output.md`, `m6-spike-1-output.md`, `m6-spike-1-result-output.md` | Discover von M6, Human Decision 1, Spike |
| `m8-04-monitor-output.md` | enthält die Checkliste für das Release 0.1.0 (Befehle für Tag, Push und GitHub-Release; **nicht ausgeführt**) |
| `m8-06-gesamtpruefung-output.md` | Gesamtprüfung gegen P-FC1 bis P-FC8 |
| `pruefskripte/` | die Prüfwerkzeuge der Phase (Zwei-Client-Simulationen, Gegenproben, Paketprüfung), am 2026-09-20 unverändert gesichert; feste Pfade, siehe die README dort |

## Nächster Schritt

Eine neue Umsetzungsphase (Empfehlung: Eagle Library) braucht einen frischen DAD-M-Bootstrap. Die Übergabenotiz `dadm/uebergabe-naechste-phase.md` bleibt außerhalb des Archivs, damit die nächste Phase sie ohne Suchen findet. Das Release 0.1.0 ist vorbereitet, aber nicht veröffentlicht (Entscheidung B); Tag, Push und GitHub-Release nur auf ausdrückliche Anweisung, vorher die Datenschutz-Frage zu sechs Dokumenten dieses Ordners (`m5-05`, `m6-spike-1-result`, `m6a-05`, `m6b-04`, `m6b-05`, `m7-05`).

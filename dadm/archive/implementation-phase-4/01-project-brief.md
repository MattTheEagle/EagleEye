# Project Brief — EagleEye: Eagle Flight Control (Umsetzungsphase 4)

retention: durable
status: approved (2026-09-19, siehe 05-milestone-plan-approval.md)
Feld-Herkunft: `project_specific` (abgeleitet aus dem bestätigten Projektplan und den
Antworten des Projektleiters vom 2026-09-19; jede Quelle ist unten genannt)

## Projektname
EagleEye — Umsetzungsphase 4 "Eagle Flight Control"

## Ausgangslage
Drei Phasen sind abgeschlossen und archiviert; sie binden diese Phase nicht
automatisch (`dadm/archive/`): Phase 1 (Grundgerüst, Machbarkeit), Phase 2
(Machbarkeitsplanung), Phase 3 (Spezifikations-Update). Die Pläne
`dadm/eagle-modules-projektplan.md` und `EAGLE-MODULES-PLAN.md` sind vom
Projektleiter bestätigt; sie empfehlen als ersten Umsetzungsschritt Eagle Flight
Control (`EAGLE-MODULES-PLAN.md` Abschnitt 7, technischer Plan Abschnitt 6).

Vorhanden ist der Code aus Phase 1 (`core/`, `v13/`): ein Hub als
Einstellungsmenü, Paket-Scan, Konflikt-Überwachung, Sprach-Erkennung, Vitest-Tests.
Ein Teil davon bezieht sich auf Fremdmodule und entfällt nach Entscheidung E6
(Umgang: Entscheidung in dieser Phase, M1). Modul-ID `eagleeye`, GitHub-Repo
`MattTheEagle/EagleEye` und Testbuild v0.0.1 existieren.

## Ziel
Eagle Flight Control als schmale, generische Schnittstelle zwischen Foundry VTT,
dem DnD-5e-System und den künftigen Eagle Modulen bauen (Hub, Modul-Anmeldung,
Anfragekanal mit GM-Weiterleitung, DnD-Versionswächter), ausgehend vom
Phase-1-Code.

## Messbarer Endzustand
1. **Code-Schnitt:** Der Umgang mit dem Phase-1-Code ist entschieden und
   umgesetzt (M1); die Bausteine, die bleiben, haben Tests.
2. **Modul-Anmeldung:** Eagle Module melden sich per API an; Flight Control
   kennt nur angemeldete, aktive Eagle Module (M2).
3. **Hub:** Registerkarte je aktivem angemeldetem Modul; "Start" öffnet dessen
   Oberfläche; die Einstellungen der Module sind gebündelt; ein UI-Leitfaden
   für alle Module liegt vor (M3).
4. **Anfragekanal:** Ein Eagle Modul kann eine Anfrage stellen, Flight Control
   führt sie aus und antwortet (M4); Nutzer ohne Foundry-Recht gehen über den
   GM (M5); Nutzungsrechte je Modul und Nutzer sind einstellbar und werden
   durchgesetzt (M6).
5. **Versionswächter:** Flight Control erkennt die Version des DnD-Systems und
   kennt eine Liste getesteter Versionen (M7).
6. **API-Vertrag:** Ein dokumentierter, versionierter Vertrag beschreibt, was ein
   Eagle Modul von Flight Control erwartet und bekommt (M8).
7. **Nachweis:** `typecheck`, `test`, `build` laufen durch. Jede Aussage, die
   nur im laufenden Foundry prüfbar ist, ist entweder vom Projektleiter live
   bestätigt oder ausdrücklich als `unverified` akzeptiert.

## Festgehaltene Entscheidungen des Projektleiters (Rahmen dieser Phase)
| # | Entscheidung | Quelle |
|---|---|---|
| U1 | Umfang: nur Eagle Flight Control (Schritt 1 der Umsetzungsreihenfolge) | Antwort 2026-09-19 (Quickstart) |
| U2 | Klartext ↔ Code (Richtung Daten → lesbarer Text, P-FC8) entfällt in dieser Phase und kommt mit den Verbraucher-Modulen | Antwort 2026-09-19 |
| U3 | Nutzungsrechte je Modul und Nutzer (N1) gehören in diese Phase (eigener Milestone M6) | Antwort 2026-09-19 |
| U4 | Foundry-Referenz (`foundry-vtt-reference-v13`) wird vor Web-Recherchen genutzt (read-only) | Antwort 2026-09-19 |
| U5 | Der UI-Leitfaden für alle Module ist Teil dieser Phase, als Ergänzung zu M3 | Antwort 2026-09-19 (bei der Plan-Freigabe) |
| E1 | Nur Foundry v13; dnd5e-Linie zu Foundry 13 (Testwelt 5.3.3) | Phase 3 |
| E6 | Flight Control bindet nur eigene Eagle Module an, keine Fremdmodule | Phase 3 |
| Q3 a | Alle Foundry-**Änderungen** laufen über Flight Control; Lesen direkt in den Modulen | Phase 3 |
| Q15 a | "Aus dem Hub gestartet" = die Oberfläche des Moduls öffnen | Phase 3 |
| N1 | Nutzungsrechte je Modul und Nutzer später in den Moduleinstellungen; Nutzer ohne Foundry-Recht brauchen den GM-Anfrageweg | Phase 3 |
| N2 | Inaktive Module werden im Hub ausgeblendet | Phase 3 |
| N4 | Flight Control bleibt schmal und generisch; Editor-Logik bleibt in den Modulen | Phase 3 |
| N3 | Klartext Englisch | Phase 3 |
| E8 | UI nur mit Foundry-Bausteinen im nativen Stil | Phase 3 |
| — | Modul-ID `eagleeye` und Repo unverändert; keine Lizenz | Phase 3 |

## Technologien / Umfeld
- Foundry VTT v13 auf Forge (Import Wizard bleibt Standardweg; Live-Tests und
  Deploys führt der Projektleiter selbst aus und liefert Konsolen-Logs)
- Bestehender Stack: TypeScript, esbuild, Vitest, Node 24; gepinnte
  Foundry-Types aus `foundry-vtt-reference-v13`
- Keine Dependency-Änderung geplant; libWrapper wird nach aktuellem Planstand
  für Flight Control nicht gebraucht

## Zeitrahmen
Nicht relevant; Detailgrad hat Vorrang vor Tempo (bestätigte Präferenz aus
Phase 3, zu bestätigen mit dieser Freigabe).

## Non-Goals
- Alle anderen Eagle Module (Library, Character Edit, Homebrew, Journal,
  Ruling, Roll Out)
- Klartext ↔ Code (U2) und weitere Fachanfragen, die erst ein Verbraucher-Modul
  braucht
- Anbindung von Fremdmodulen (E6)
- Neue GitHub-Repos; Umbenennung von Modul-ID, Manifest-Titel oder Repo
- Lizenz, Foundry v14
- Quench-/Live-Testläufe ohne ausdrückliche Freigabe
- Bei Unklarheiten fragen statt interpretieren (dauerhafte Arbeitsregel)

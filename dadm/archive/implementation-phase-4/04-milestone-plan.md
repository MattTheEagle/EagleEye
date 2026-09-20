# Milestone Plan — EagleEye: Eagle Flight Control (Umsetzungsphase 4)

plan-version: 1
status: approved (2026-09-19, siehe `05-milestone-plan-approval.md`)
retention: durable (bei signifikanter Änderung: neue Version + neue Approval)

Grundlage: `01-project-brief.md` (Entscheidungen U1–U4 und die übernommenen
Entscheidungen aus Phase 3), die bestätigten Pläne (`EAGLE-MODULES-PLAN.md`
Abschnitt 3.1/4/7, `dadm/eagle-modules-projektplan.md` Abschnitt 3.1) und die
Spezifikation P-FC1–P-FC8 (`dadm/archive/planning-phase-3/m4-01-discover-output.md`).

Alle Milestones sind Code-Milestones (Foundry v13, TypeScript). Jeder läuft
Discover → Apply → Deploy → Monitor; der Deploy wartet auf das "Go" des
Projektleiters (siehe `06-working-mode.md`).

## Proofs (projektbezogen, token-sparend, nicht wiederholt)
- **Discover/Apply:** schriftlicher Output mit Quellenbelegen (Foundry-Referenz
  und Types, Code-Stellen, bestätigte Pläne). Geprüft auf Nachvollziehbarkeit.
- **Deploy:** neue oder angepasste Vitest-Tests für reine Logik (ohne
  Foundry-Kontext); danach **einmal** `npm run typecheck`, `npm test` und
  `npm run build` mit Ausgabe im Deploy-Output. Erneut nur, wenn sich der Code
  seit dem letzten Lauf geändert hat.
- **Monitor:** Abgleich Acceptance ↔ Deploy-Output; Liste der `unverified`
  Live-Punkte.
- **Live (Forge/Quench):** nur nach ausdrücklicher Einzelfreigabe. Bis dahin
  bleibt die Aussage `unverified`. Ein Milestone darf mit `unverified`-Punkten
  schließen, wenn der Projektleiter das Restrisiko im Monitor ausdrücklich
  annimmt (Phase-Transition-Regel: kein offener `medium+`-Fund ohne Lösung oder
  ausdrückliche Annahme).

## Durchgängige Linsen (bei jedem betroffenen Milestone im Apply prüfen)
1. **Schmal und generisch (N4):** Flight Control enthält keine Editor-Logik der
   Module und keine Fachanfragen, die erst ein Verbraucher-Modul braucht (U2).
2. **Nur Eagle Module (E6)** und **nur Foundry v13** (E1).
3. **Ein Repo pro Modul (E7, künftig):** Was ein Modul von Flight Control
   braucht, muss über getrennt veröffentlichte und versionierte Module
   funktionieren — der API-Vertrag ist deshalb versioniert.
4. **Foundry-native UI (E8)**, sichtbare Texte und Klartext Englisch (N3);
   Sprache und Lokalisierung der Hub-Texte entscheidet M3 (Apply). Der
   UI-Leitfaden für alle Module entsteht in M3 (U5).
5. **Änderungen nur über Flight Control (Q3 a):** Flight Control ist die einzige
   Stelle, die Foundry-Daten ändert; Lesen darf direkt geschehen.

## Rückverfolgung auf die Spezifikation
| ID | Anforderung | Milestone | Anmerkung |
|---|---|---|---|
| P-FC1 | Schnittstelle zwischen Foundry, DnD-5e-System und Eagle Modulen | M2, M4, M7 | zusammen erfüllt |
| P-FC2 | Nur eigene Eagle Module angebunden | M1, M2 | |
| P-FC3 | Hub bündelt die Einstellungen der Module | M3, M6 | |
| P-FC4 | Registerkarte je installiertem (aktivem) Modul | M3 | inaktive ausgeblendet (N2) |
| P-FC5 | Modul aus dem Hub starten | M3 | = Oberfläche öffnen (Q15 a) |
| P-FC6 | Versteht Foundry-API und DnD-Systemlogik | M7 | **nur Versionswächter**; weitere Systemlogik kommt mit den Verbrauchern |
| P-FC7 | Empfängt Anfragen und führt sie aus | M4, M5, M6 | |
| P-FC8 | Klartext ↔ Code | — | **entfällt in dieser Phase** (U2) |
| — | UI-Leitfaden für alle Module (Plan: "nur Foundry-Bausteine plus Leitfaden") | M3 | Zusatz zur Spezifikation P-FC, Entscheidung U5 |

## M1 — Phase-1-Code schneiden (E6)
- Ziel: Entscheiden und umsetzen, was vom Phase-1-Code (`core/`, `v13/module.ts`,
  Hub als Einstellungsmenü) bleibt, umgebaut oder entfernt wird. Grundlage sind
  E6 (nur Eagle Module) und N4 (schmal und generisch).
- Scope: Discover — Inventar aller Dateien, Funktionen, Tests, Fixtures und
  Texte mit Fremdmodul-Bezug (Manifest, README, `package.json`), Abhängigkeiten
  zwischen den Dateien, was "Registry-Lesen/-Schreiben und Paketdaten-Lesen als
  Bausteine" (technischer Plan 3.1) konkret bedeutet. Apply — Behalten/Umbauen/Entfernen je
  Datei; Zuschnitt der Verzeichnisse (`core/` + `v13/` weiterführen oder
  zusammenlegen, da v14 entfallen ist); Ablageort des API-Vertrags; Konventionen
  für die Folge-Milestones. Deploy — Umsetzung.
- Deliverables: Discover-/Apply-Output mit Entscheidungstabelle je Datei;
  bereinigter Code samt angepassten Tests, Fixtures, Manifest- und README-Texten.
- Acceptance: `typecheck`, `test`, `build` grün; keine Fremdmodul-Funktion mehr
  im Laufzeitcode (soweit im Apply so entschieden); jeder verbleibende Baustein
  hat einen Test; die Entscheidungstabelle nennt zu jeder Entfernung den Grund.
  Startverhalten in Forge unverändert: `unverified`.
- Risiken:
  - **medium** — Das Löschen verändert den bestehenden Forge-Testbuild (v0.0.1);
    der Stand bleibt im Git-Verlauf rückholbar.
  - **medium** — Der Zuschnitt beeinflusst alle Folge-Milestones. Gibt es bei
    "Entfernen vs. Umbauen" keine klare beste Option, entscheidet der
    Projektleiter (Trigger 6).
- Dependencies: keine
- Priorität: hoch

## M2 — Modul-Anmeldung und Erkennung (P-FC1/P-FC2, N2)
- Ziel: Eagle Module melden sich bei Flight Control an. Flight Control kennt nur
  angemeldete, aktive Eagle Module; die Versionsverträglichkeit ist prüfbar.
- Scope: Apply legt fest: Form der API (`game.modules.get(id).api`, Vorbild
  Midi-QOL und Custom D&D 5e), Zeitpunkt (Zugriff erst ab `setup`/`ready`),
  Erkennung (Manifest-`flags` plus API-Anmeldung; seit N2 genügt die
  Anmeldung), Versionsspanne (`relationships.requires`) plus
  API-Versionsprüfung, Verhalten bei inkompatibler Version und bei Modulen, die
  sich nicht anmelden.
- Deliverables: Anmelde-Register (Logik in `core/`, Vitest); API-Vertrag
  Teil 1 (Anmeldung); Discover-/Apply-/Deploy-/Monitor-Output.
- Acceptance: Vitest deckt Anmeldung, doppelte Anmeldung, inaktives Modul und
  inkompatible Version ab; API-Vertrag Teil 1 ist dokumentiert. Ladereihenfolge,
  deaktivierte Abhängigkeit und Erzwingen der Versionsspanne: `unverified`.
- Risiken:
  - **medium** — Ladereihenfolge normaler Module ist nicht dokumentiert (nur
    live prüfbar).
  - **medium** — Verhalten bei deaktivierter Abhängigkeit und erzwungener
    Versionsspanne nicht verifiziert.
- Dependencies: M1
- Priorität: hoch

## M3 — Hub-Oberfläche (P-FC3/P-FC4/P-FC5, Q15 a)
- Ziel: Der Hub ist eine `ApplicationV2` mit einer Registerkarte je aktivem,
  angemeldetem Eagle Modul. "Start" öffnet die Oberfläche des Moduls. Der Hub
  bündelt die Einstellungen der Module. Dazu entsteht ein UI-Leitfaden für alle
  Eagle Module (Entscheidung U5).
- Scope: Apply legt fest: Tab-Mechanik (eingebaute Tabs der `ApplicationV2`),
  wie Module Tab-Inhalt, Einstellungen und Start-Aktion beisteuern (Vertrag),
  Einstieg in den Hub, Verhalten ohne angemeldete Module, Sprache und
  Lokalisierung der Texte, nativer Foundry-Stil (E8). Leitfaden: Inhalt und
  Umfang legt das Apply fest; er beschreibt nur Foundry-Bausteine (E8) und wird
  aus dem Hub abgeleitet. Nicht Teil: die Oberflächen der Module selbst.
- Deliverables: Hub-Code; API-Vertrag Teil 2 (Tab, Einstellungen, Start);
  UI-Leitfaden (Ablage in `./docs/`); Vitest für die Logik hinter dem
  Tab-Modell; Outputs je Phase.
- Acceptance: Das Tab-Modell liefert genau einen Tab je aktivem angemeldetem
  Modul und blendet inaktive aus (Vitest); die Start-Aktion ruft die
  angemeldete Öffnen-Funktion (Vitest); der Leitfaden liegt vor, und jede
  Regel darin verweist auf einen im Hub tatsächlich verwendeten oder in der
  Foundry-Referenz belegten Baustein; `typecheck`/`test`/`build` grün.
  Darstellung im Foundry: `unverified`.
- Risiken:
  - **medium** — Rendering und CSS-Schichten nur live sichtbar (technischer Plan
    Abschnitt 8: CSS-Schichten und Fenster-Module).
  - **low** — Der Leitfaden kann den Milestone aufblähen. Der Umfang wird im
    Apply begrenzt; wächst er trotzdem stark, wird M3 geteilt (neue Planversion
    mit neuer Approval).
- Dependencies: M2
- Priorität: hoch

## M4 — Anfragekanal-Kern (P-FC1/P-FC7, Q3 a, N4)
- Ziel: Ein Eagle Modul kann Flight Control eine Anfrage stellen; Flight
  Control führt sie aus und antwortet. Der Kern bleibt schmal und generisch.
- Scope: Apply legt fest: Anfrage-/Antwortformat, Fehlerbild, Versionierung des
  Vertrags, Anmeldung von Anfrage-Handlern, exemplarische Anfrage als Nachweis.
  Welche Fachanfragen (Dokumente kopieren, Charakter anlegen usw.) Flight
  Control später anbietet, folgt mit den Verbraucher-Modulen (U2/N4) und ist
  nicht Teil dieses Milestones.
- Deliverables: Kern-Code mit Tests; API-Vertrag Teil 3 (Anfrage/Antwort/Fehler).
- Acceptance: Vitest deckt gültige Anfrage, ungültiges Format, unbekannten
  Handler, Handler-Fehler und Versionsprüfung ab; Ergebnis und Fehler kommen
  beim Aufrufer an.
- Risiken:
  - **high** — Schnittstellenstabilität zwischen getrennt veröffentlichten
    Modulen ist laut technischem Plan (Abschnitt 7) das größte Einzelrisiko; ein
    Fehlgriff im Format wirkt auf alle Folgemodule.
  - **medium** — Gefahr eines Mega-Moduls (N4): Der Umfang über "Kern plus
    Nachweis-Anfrage" hinaus wäre eine Scope-Ausweitung (Human Decision).
- Dependencies: M2
- Priorität: hoch

## M5 — GM-Weiterleitung (N1, `User#query`)
- Ziel: Anfragen von Nutzern ohne Foundry-Recht laufen über den Spielleiter.
- Scope: Apply legt fest: `CONFIG.queries` mit präfixiertem Namen, Verhalten
  ohne verfügbaren GM, Zeitüberschreitung, wo die Prüfung "wer darf was"
  stattfindet (auf der GM-Seite, nie im anfragenden Client), Fehlerbild.
- Deliverables: Weiterleitungs-Code mit Tests; API-Vertrag Teil 4.
- Acceptance: Vitest für die Entscheidungslogik (weitergeleitet, abgelehnt,
  kein GM erreichbar, Zeitüberschreitung). Spieler-Client → GM → Ergebnis in
  einem echten Foundry: `unverified`.
- Risiken:
  - **high** (Security) — Die Weiterleitung führt Änderungen mit GM-Rechten
    aus. Fehlt oder umgeht jemand die Prüfung auf der GM-Seite, ist das ein
    Rechteproblem; laut Governance ist ein `high`-Security-Fund eine Human
    Decision.
  - **medium** — Nur live prüfbar (`User#query` mit echtem Spieler).
- Dependencies: M4
- Priorität: hoch

## M6 — Nutzungsrechte je Modul und Nutzer (N1, U3)
- Ziel: Es ist einstellbar, welches Modul von wem in wie weit genutzt werden
  darf; Flight Control setzt das im Anfragekanal durch.
- Scope: Apply legt fest: Datenmodell der Rechte, Ort der Einstellung (Hub
  und/oder Foundry-Moduleinstellungen), Standardwerte, Durchsetzung in M4/M5.
  **Geplanter Stopp:** Was "in wie weit" bedeutet (Stufen, Umfang), steht nicht
  fest und wird dem Projektleiter vorgelegt, nicht interpretiert.
- Deliverables: Rechte-Logik mit Tests; Einstellungsoberfläche; API-Vertrag
  Teil 5 (Rechteabfrage durch Module).
- Acceptance: Vitest für die Rechteauswertung (erlaubt/abgelehnt, Standardwerte,
  unbekanntes Modul oder Nutzer); Durchsetzung im Anfragekanal ist getestet;
  Darstellung im Hub: `unverified`.
- Risiken:
  - **medium** — Umfang und Bedeutung von "in wie weit" sind offen; bei zu
    großem Umfang wird der Milestone geteilt (neue Planversion).
  - **high** (Security) — Eine umgehbare Rechteprüfung wäre ein
    Security-Fund (Human Decision).
- Dependencies: M3, M5
- Priorität: mittel

## M7 — DnD-Versionswächter (P-FC1/P-FC6)
- Ziel: Flight Control erkennt die Version des DnD-5e-Systems
  (`game.system.version`) und kennt eine Liste getesteter Versionen; das
  Verhalten bei nicht getesteter Version ist definiert.
- Scope: Apply legt fest: Prüfung von `game.system.id`, Form und Ort der Liste
  getesteter Versionen (Testwelt: dnd5e 5.3.3), Reaktion bei ungetesteter oder
  fehlender Version (Hinweis, Anfragen sperren o. a.), wie Module die
  Versionsinfo abfragen.
- Deliverables: Wächter-Code mit Tests; API-Vertrag Teil 6 (Versionsinfo).
- Acceptance: Vitest für den Versionsvergleich (getestet, ungetestet, kein
  dnd5e, fehlende Version). Die Reaktion in einem echten Foundry: `unverified`.
- Risiken: **low** — kleine, klar umrissene Logik.
- Dependencies: M2
- Priorität: mittel

## M8 — Abschluss: API-Vertrag, Gesamtprüfung, Release-Entscheidung
- Ziel: Ein konsolidierter, versionierter API-Vertrag, eine Gesamtprüfung gegen
  die Rückverfolgungstabelle und der Stand aller `unverified`-Punkte; Übergabe
  an die nächste Phase (Eagle Library).
- Scope: Zusammenführen der Teile 1–6 im Vertragsdokument (Ort aus M1);
  Abgleich der Acceptance aller Milestones; Liste der offenen Live-Punkte, die
  der Projektleiter einzeln freigeben oder als Restrisiko annehmen kann;
  Versionsnummer in `module.json`. GitHub-Release nur, wenn der Projektleiter
  ihn ausdrücklich anweist (Hybrid-Workflow).
- Deliverables: API-Vertrag (konsolidiert); Gesamtprüfung; Übergabenotiz mit
  Empfehlung für die nächste Phase; `SUMMARY.md` beim Archivieren der Phase.
- Acceptance: Jede Zeile P-FC1–P-FC7 hat einen Beleg (`verified` oder
  ausdrücklich `unverified` akzeptiert), P-FC6 nur im Umfang des
  Versionswächters, P-FC8 ist als entfallen vermerkt; der API-Vertrag ist
  vollständig; `typecheck`/`test`/`build` grün.
- Risiken: **low** — Restrisiko sind `unverified`-Punkte aus M2–M7.
- Dependencies: M1–M7
- Priorität: mittel

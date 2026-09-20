# Milestone Plan — EagleEye: Eagle Flight Control (Umsetzungsphase 4)

plan-version: 2
status: approved (2026-09-20, siehe `05-milestone-plan-approval-v2.md`; Version 1 siehe `05-milestone-plan-approval.md`)
retention: durable (bei signifikanter Änderung: neue Version + neue Approval)

Änderung gegenüber Version 1 (`dadm/04-milestone-plan.md`, freigegeben am 2026-09-19, bleibt als Aufzeichnung
unverändert): **M6 wird geteilt** in **M6a** (Verifizierte Nutzeridentität für GM-seitige Anfragen) und **M6b**
(Nutzungsrechte je Modul und Nutzer). Auslöser: Die Antworten des Projektleiters vom 2026-09-20 zum geplanten Stopp
von M6 (erlaubt oder verboten je Modul und Nutzer, dazu eigene oder fremde Ziele; bindend beim GM; Einstellen durch den GM
im Hub) und die Human Decision 1 (`m6-hd-1-output.md`: Nutzeridentität per Rückfrage des GM an den genannten Nutzer, weil
Foundry dem Query-Handler keinen Absender mitgibt) machen M6 deutlich größer. Der Plan sah für diesen Fall die Teilung
vor (Risiko "Umfang" in M6). Der Projektleiter wählte "Teilen: M6a Identität, M6b Rechte". Die Nummern aller anderen
Milestones bleiben unverändert, damit Verweise in den geschlossenen Outputs gültig bleiben. Der API-Vertrag bekommt
dadurch einen Teil mehr: Teil 5 (Identität, M6a), Teil 6 (Rechte, M6b), Teil 7 (Versionsinfo, M7). Sonst gilt Version 1
unverändert.

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
| P-FC3 | Hub bündelt die Einstellungen der Module | M3, M6b | |
| P-FC4 | Registerkarte je installiertem (aktivem) Modul | M3 | inaktive ausgeblendet (N2) |
| P-FC5 | Modul aus dem Hub starten | M3 | = Oberfläche öffnen (Q15 a) |
| P-FC6 | Versteht Foundry-API und DnD-Systemlogik | M7 | **nur Versionswächter**; weitere Systemlogik kommt mit den Verbrauchern |
| P-FC7 | Empfängt Anfragen und führt sie aus | M4, M5, M6a, M6b | |
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

## M6a — Verifizierte Nutzeridentität für GM-seitige Anfragen (Human Decision 1, N1)
- Ziel: Läuft eine Anfrage eines Nutzers ohne GM-Rolle beim GM, weiß die GM-Seite verlässlich, welcher Nutzer sie gestellt
  hat: Sie lässt den genannten Nutzer die Anfrage bestätigen. Ohne Bestätigung wird die Anfrage abgelehnt (fail closed).
  Das ist die Grundlage für die Rechte je Nutzer in M6b.
- Scope: Apply legt fest: Umschlag der Weiterleitung mit Nutzerangabe und Anfragekennung, die Bestätigungs-Anfrage vom GM
  an den genannten Nutzer (Name, Daten, Zeit), Ablauf und Ablage der offenen Anfragen im Client des Aufrufers, alle
  Fehlerfälle, Weitergabe des bestätigten Nutzers an die Handler, Vertrag Teil 5. **Vorbedingung:** Der Spike
  (`m6-spike-1-output.md`) zeigt, dass `User#query` vom GM an einen Spieler zuverlässig zugestellt und beantwortet wird;
  sonst zurück zur Human Decision 1. Nicht Teil: Rechte, Ziele, Oberfläche (M6b).
- Deliverables: Bestätigungs-Code mit Tests (reine Logik in `core/`, dünne Hülle in `v13/`); Anpassung der Testmodule für
  den Live-Check; API-Vertrag Teil 5.
- Acceptance: Vitest für bestätigt, nicht bestätigt (Antwort "nein", falsche Nutzer-ID, keine Antwort, Zeitüberschreitung,
  Nutzer nicht verbunden), gefälschte Angabe, fehlende oder fehlgeformte Angabe; der bestätigte Nutzer erreicht den
  Handler. Live (`unverified` bis zum Live-Check, GM und Spieler): Anfrage eines Spielers läuft mit bestätigter Nutzer-ID;
  eine gefälschte Nutzer-ID wird mit `not-permitted` abgelehnt.
- Risiken:
  - **high** (Security) — Restrisiko nach Human Decision 1: Der Schutz gilt gegen die Fälschung einer fremden Identität,
    nicht gegen einen Nutzer, der sich selbst freiwillig ausgibt; die Modul-`id` bleibt eine Vertrauensgrenze. Das
    Apply legt die Severity des Rests neu fest.
  - **medium** — Das Verhalten von `User#query` vom GM an einen Spieler ist nur live prüfbar (Spike).
- Dependencies: M5, Human Decision 1
- Priorität: hoch (Vorbedingung von M6b)

## M6b — Nutzungsrechte je Modul und Nutzer (N1, U3)
- Ziel: Es ist einstellbar, welches Modul von wem genutzt werden darf: **erlaubt oder verboten je Modul und Nutzer**, bei
  "erlaubt" **eingeschränkt auf eigene oder fremde Ziele** (Besitz nach Foundry). Flight Control setzt das im Anfragekanal
  durch: **bindend beim GM**, **als Regel im eigenen Client** (dort umgehbar, ohne Gewinn über Foundrys eigene Rechte).
  Eingestellt wird nur vom GM (nicht von Assistenten), im Hub. (Antworten des Projektleiters vom 2026-09-20.)
- Scope: Apply legt fest: Datenmodell (Modul, Nutzer, erlaubt, Ziele eigene oder fremde), Speicherort (Welteinstellung;
  Lesbarkeit für Spieler laut Spike), Standardwerte (Vorschlag: der GM darf immer alles), wie ein Anfragetyp sein Ziel
  angibt und wie der Besitz geprüft wird, Durchsetzung im Kern und im Empfänger (mit dem bestätigten Nutzer aus M6a),
  Oberfläche im Hub je Modul, Rechteabfrage durch Module (Vertrag Teil 6), Umgang mit gelöschten Nutzern.
- Deliverables: Rechte-Logik mit Tests; Einstellungsoberfläche im Hub; falls für den Live-Nachweis nötig ein
  Nachweis-Anfragetyp mit Ziel; API-Vertrag Teil 6 (Rechteabfrage durch Module).
- Acceptance: Vitest für die Rechteauswertung (erlaubt, abgelehnt, Standardwerte, eigene und fremde Ziele, unbekanntes
  Modul oder Nutzer, GM); Durchsetzung im Kern und im Empfänger ist getestet; Darstellung im Hub und Verhalten mit echten
  Nutzern: `unverified`.
- Risiken:
  - **high** (Security) — Eine umgehbare Rechteprüfung wäre ein Security-Fund (Human Decision); die Reichweite ist begrenzt
    (Regel im eigenen Client).
  - **medium** — Umfang; bei Bedarf weitere Teilung (neue Planversion).
  - **medium** — Wer Rechte einstellen darf (nur Gamemaster-Rolle, nicht Assistenten) und ob Spieler die Welteinstellung
    lesen können, sind nur live prüfbar.
- Dependencies: M3, M5, M6a
- Priorität: mittel

## M7 — DnD-Versionswächter (P-FC1/P-FC6)
- Ziel: Flight Control erkennt die Version des DnD-5e-Systems
  (`game.system.version`) und kennt eine Liste getesteter Versionen; das
  Verhalten bei nicht getesteter Version ist definiert.
- Scope: Apply legt fest: Prüfung von `game.system.id`, Form und Ort der Liste
  getesteter Versionen (Testwelt: dnd5e 5.3.3), Reaktion bei ungetesteter oder
  fehlender Version (Hinweis, Anfragen sperren o. a.), wie Module die
  Versionsinfo abfragen.
- Deliverables: Wächter-Code mit Tests; API-Vertrag Teil 7 (Versionsinfo).
- Acceptance: Vitest für den Versionsvergleich (getestet, ungetestet, kein
  dnd5e, fehlende Version). Die Reaktion in einem echten Foundry: `unverified`.
- Risiken: **low** — kleine, klar umrissene Logik.
- Dependencies: M2
- Priorität: mittel

## M8 — Abschluss: API-Vertrag, Gesamtprüfung, Release-Entscheidung
- Ziel: Ein konsolidierter, versionierter API-Vertrag, eine Gesamtprüfung gegen
  die Rückverfolgungstabelle und der Stand aller `unverified`-Punkte; Übergabe
  an die nächste Phase (Eagle Library).
- Scope: Zusammenführen der Teile 1–7 im Vertragsdokument (Ort aus M1);
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
- Dependencies: M1–M7 (mit M6a und M6b)
- Priorität: mittel

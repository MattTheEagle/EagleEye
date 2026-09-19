# Milestone Plan — EagleEye: Eagle Modules Spezifikations-Update (Planungsphase 3)

plan-version: 2
status: approved (2026-09-19, siehe `05-milestone-plan-approval-v2.md`)
retention: durable (bei signifikanter Änderung: neue Version + neue Approval)

Änderung gegenüber Version 1 (`dadm/04-milestone-plan.md`, freigegeben am 2026-09-19, bleibt als
Aufzeichnung unverändert): Neuer Milestone **M8a** (Inventar aller Verweisstellen der Eagle Library).
Auslöser: Antwort N6 des Projektleiters vom 2026-09-19 ("Jede Verlinkung muss auf die Library Kopien
umgeschrieben werden"); die Recherche in M7 hat nur Beispiele für Verweise belegt. Der Projektleiter
wählte "Neuer Milestone". Die Nummern aller anderen Milestones bleiben unverändert (der neue heißt
M8a), damit Verweise in den geschlossenen Outputs gültig bleiben. M9 hängt zusätzlich von M8a ab.
Sonst gilt Version 1 unverändert.

Grundlage: PDF "Eagle Modules - Aufbau" und die festgehaltenen Entscheidungen
E1–E8 aus `01-project-brief.md`. Die Milestones setzen die im PDF genannten
Aufträge um (Namen anpassen, Eagle Ruling neu prüfen, Vorab-Plan Eagle Roll
Out) und prüfen die konkretisierten Modulbeschreibungen gegen die bisherigen
Ergebnisse. Alles ist Recherche/Analyse, mit einer Ausnahme: M1 ist ein
kleiner Code-Milestone (v14 entfernen).

Proofs/Artefakte: Recherche-Milestones liefern einen schriftlichen
Discover-Output (Fakten und Quellen) und Apply-Output (Bewertung und
Empfehlung). Deploy = Übernahme in das Ergebnisdokument dieser Phase
`dadm/spezifikationsabgleich.md`; Monitor = kurze Konsistenzprüfung. Der
bestehende Projektplan bleibt bis M15 unverändert (außer der Namensumstellung
in M3). M1 hat als Proof `typecheck`, `test` und `build` für v13.

Durchgängige Analyse-Linsen (bei jedem betroffenen Milestone ausdrücklich
prüfen, nicht separat neu erforschen):
1. **API-Umwandlung** (aus Phase 2): einfache, semantische Eingabe wird zu
   korrekten Foundry-/dnd5e-Daten. Achtung: das Phase-2-Ergebnis für den
   Referenzfall (magisches Langschwert, "nur gegen Untote") stützte sich auf
   das Fremdmodul Build-a-Bonus. Entscheidung E3 verlangt eine eigene Lösung;
   das Ergebnis ist deshalb offen und wird in M6 neu geklärt.
2. **Nur Foundry v13** (E1): Befunde, die auf Foundry 14 oder dnd5e 6.x
   beruhen, gelten nur als Referenz.
3. **Ein Repo pro Modul** (E7): Was Modul A von Modul B braucht, muss über
   getrennt veröffentlichte und versionierte Module funktionieren.
4. **Foundry-native UI** (E8): kein eigenes Design-System.

## M1 — Codebasis: v14 entfernen (einziger Code-Milestone)
- Ziel: `v14/` aus der Codebasis entfernen (Entscheidung E1), v13 bleibt
  unverändert lauffähig
- Scope: `./v14/` löschen; `package.json`-Skripte (`build`, `build:v14`,
  `typecheck`, `typecheck:v14`) auf v13 reduzieren; v14-Satz in `README.md`;
  Discover inventarisiert alle v14-Verweise, damit nichts übersehen wird.
  `core/`, `v13/`, `test-fixtures/` bleiben unangetastet (auch der Kommentar zu
  v14 in `core/manifest-scanner.ts`; er ist unschädlich und gehört in eine
  spätere Umsetzungsphase)
- Deliverables: bereinigte Codebasis, Deploy-Output mit den Proof-Ausgaben
- Acceptance: `npm run typecheck`, `npm test`, `npm run build` laufen für v13
  durch; kein Verweis auf `v14/` mehr in Skripten; Liste der verbleibenden
  v14-Erwähnungen (Doku/Kommentar) mit Zuständigkeit (M3/M15/später)
- Risiken: niedrig — Git-Historie bewahrt den Stand; GitHub-Releases werden
  nicht angefasst
- Dependencies: keine
- Priorität: mittel
- Start: erst nach ausdrücklichem "Go" des Projektleiters (siehe
  `06-working-mode.md`)

## M2 — Referenz: Spezifikation "Aufbau" festhalten
- Ziel: Das PDF vollständig und wortgetreu als `dadm/reference/eagle-modules-aufbau.md`
  transkribieren (analog zur Vision), ergänzt um die Entscheidungen E1–E8 und
  die Namenszuordnung. Damit gibt es eine dauerhafte, prüfbare Quelle
- Scope: `dadm/reference/`, keine Interpretation
- Deliverables: transkribiertes Referenzdokument
- Acceptance: jede Aussage des PDFs ist enthalten; der Projektleiter kann sie
  abgleichen
- Risiken: keine — info
- Dependencies: keine
- Priorität: hoch (Grundlage für alle folgenden Milestones)

## M3 — Dokumente auf die echten Modulnamen umstellen
- Ziel: PDF-Auftrag "Entsprechend anpassen" für die **lebenden** Dokumente:
  `EAGLE-MODULES-PLAN.md`, `README.md`, `dadm/eagle-modules-projektplan.md`,
  `dadm/README.md`, `dadm/reference/source-analysis/*`. Erste Erwähnung je
  Dokument "Modulname (ehemals Entwicklungsname)", danach nur der Modulname
- Nicht angefasst: archivierte Artefakte (immutable), das transkribierte
  Vision-Dokument (Quelldokument; erhält nur einen Hinweis-Kopf auf die neuen
  Namen), Modul-ID/Manifest/Repo (E5)
- Deliverables: umgestellte Dokumente, Prüfliste (Trefferzahl vorher/nachher)
- Acceptance: `grep` findet die Entwicklungsnamen nur noch in den
  "ehemals"-Klammern, im Vision-Dokument und im Archiv
- Risiken: niedrig (rein mechanisch, aber Bedeutungsverschiebungen prüfen, z. B.
  Aussagen, die für Eagle Eye als "Fremdmodul-Schnittstelle" galten)
- Dependencies: M2
- Priorität: hoch

## M4 — Delta-Analyse Vision → Aufbau + Klärungsliste (planmäßiger Stopp)
- Ziel: Je Modul festhalten, was im PDF unverändert, neu, geändert, entfallen
  oder widersprüchlich gegenüber der Vision ist; alle Unklarheiten als Fragen
  an den Projektleiter formulieren
- Scope: Vision, PDF, Phase-2-Ergebnisse (rein Dokumentenvergleich)
- Vorab erkannte Punkte (Auszug, M4 liefert die vollständige Liste):
  1. Library: Vision sagt, Klassen/Spezies/Subklassen/Backgrounds werden
     **immer** übertragen; das PDF sagt, jeder Eintrag darf nur **einmal pro
     Version** vorkommen. Gilt die Ausnahme noch?
  2. Library: "nicht übertragene Einträge werden geloggt, DM kann die
     Übertragung erzwingen" (Vision) fehlt im PDF. Bleibt es?
  3. Library: Was zählt als "derselbe Eintrag" (Name? Quelle?) und woran wird
     die Version 2014/2024 festgemacht?
  4. Homebrew: "Import Homebrew" (Freitext) aus der Vision fehlt im PDF (dort
     nur "Create Homebrew"). Entfällt der Import?
  5. Homebrew: Wo landet das erstellte Objekt (Welt oder Eagle Library)?
  6. Character Edit: Wo wird das Level festgelegt? Der Class-Tab nennt nur
     Class, Classfeatures, Subclass, Subclassfeatures.
  7. Journal: Was ist eine "Eagle Journal Note" (= neuer Journal-Eintrag?)
  8. Flight Control: Gilt die Vision-Aussage weiter, dass Eagle Module mit
     verbreiteten Fremdmodulen (Prime Performance, PopOut, Token Action HUD …)
     zusammen funktionieren sollen, obwohl Fremdmodule nicht "angebunden" sind?
  9. Roll Out: Soll die Automation komplett im Modul selbst entstehen oder darf
     sie auf bestehenden Automationsmodulen aufbauen?
- Deliverables: Delta-Tabelle je Modul, Klärungsliste mit Empfehlungen
- Acceptance: Der Projektleiter hat jede Frage beantwortet; die Antworten sind
  in `dadm/reference/eagle-modules-aufbau.md` festgehalten
- Risiken: mittel — falsche Annahmen würden die folgenden Milestones in die
  falsche Richtung lenken; deshalb Stopp
- Dependencies: M2
- Priorität: hoch
- **Automatischer Ablauf endet hier, bis alle Fragen beantwortet sind.**

## M5 — Eagle Flight Control: Machbarkeit des neuen Zuschnitts
- Ziel: Jede im PDF genannte Fähigkeit prüfen: (a) Hub mit einer Registerkarte
  je installiertem Eagle Modul und Start des Moduls aus dem Hub, inklusive der
  Frage, wie "installierte Eagle Module" erkannt werden und wie sich weitere,
  später hinzukommende Module anmelden; (b) Anfragenkanal von den Eagle
  Modulen an Flight Control über getrennt veröffentlichte Module (Ladereihenfolge,
  Versionsverträglichkeit, Verhalten bei fehlendem Flight Control); (c) "versteht
  Foundry API und DnD Systemlogik" (Abgleich mit den Phase-2-Befunden);
  (d) "Klartext ↔ Code" in **beide** Richtungen, insbesondere die
  Rückrichtung Code → Klartext; (e) Einordnung des Phase-1-Codes: was davon
  deckt Eagle-only-Anforderungen ab (Information, keine Entscheidung über
  Entfernung)
- Scope: Foundry-v13-Modul-APIs (`game.modules`, Hooks, Settings), Phase-2-Ergebnisse
- API-Umwandlung-Relevanz: (d) ist der Kern; Referenzfall siehe M6
- Deliverables: Machbarkeitsbewertung je Fähigkeit (a)–(e)
- Acceptance: dokumentierte Aussage je Fähigkeit mit Quellenbelegen
- Risiken: mittel (Kopplung getrennter Repos, Rückrichtung Code → Klartext
  bisher nicht untersucht)
- Dependencies: M4
- Priorität: hoch

## M6 — Bedingte Effekte ohne Fremdmodul (Referenzfall Langschwert, Entscheidung E3)
- Ziel: Klären, wie sich "Zusatzschaden/Effekt nur gegen Zielkreaturtyp X"
  (und verwandte Bedingungen wie "bei Treffer") in dnd5e auf Foundry v13
  **ohne** Fremdmodul-Abhängigkeit abbilden lässt. Discover sammelt die
  vorhandenen Erweiterungspunkte (dnd5e-Hooks, Activity-Typen, Effekt-Konventionen,
  Registrierung eigener Activity-Typen); Apply bewertet die Optionen
- Scope: dnd5e-Quellcode (5.x), Quellenanalyse (`techniques-catalog.md`,
  `prey-rules-customization.md`); Fremdmodule nur als Muster, nicht als
  Abhängigkeit; Lizenzgrenzen beachten (Code nur aus den MIT-Modulen)
- API-Umwandlung-Relevanz: zentral — ersetzt den Fremdmodul-Anteil des
  Phase-2-Ergebnisses
- Deliverables: Optionenvergleich mit Empfehlung; klare Grenze, welche
  Bedingungsarten damit abdeckbar sind
- Acceptance: dokumentierte Aussage mit Quellenbelegen; Referenzfall
  Langschwert ist entweder als machbar belegt oder die Lücke ist benannt
- Risiken: mittel-hoch — der bisherige "machbar"-Befund hing an einem
  Fremdmodul. Bei mehreren gleichwertigen Optionen ohne klare Empfehlung
  entscheidet der Projektleiter
- Dependencies: M4
- Priorität: hoch (berührt Homebrew, Ruling und Roll Out)

## M7 — Eagle Library: Kopieren, Zuordnung zu 2014/2024, Einmaligkeit
- Ziel: Prüfen: eigene Compendien je Compendium-Art (Eagle Actors, Eagle
  Classes, Eagle Items usw.) und wo nötig getrennt für 2014 und 2024; Kopieren
  einzelner oder aller Nicht-Eagle-Compendien per Button in das jeweils richtige
  Eagle Compendium; Zuordnung der Version; "jeder Eintrag nur einmal pro
  Version"
- Scope: Compendium-API (v13, gepinnte Types), dnd5e-Datenmodell (Regelwerk-
  Version eines Eintrags), Phase-2-Ergebnis zu Eyrie (M4 alt)
- API-Umwandlung-Relevanz: gering, aber prüfen, ob 2014- und 2024-Daten
  gleicher Inhalte unterschiedlich aufgebaut sind (Normalisierung)
- Deliverables: Machbarkeitsbewertung je Teilfunktion
- Acceptance: dokumentierte Aussage mit Quellenbelegen; Klärung aus M4 ist
  eingearbeitet
- Risiken: mittel (Erkennung der Version und Gleichheit von Einträgen)
- Dependencies: M4
- Priorität: mittel

## M8 — Eagle Library: Suche, Hotkey-Schnellsuche, Drag & Drop
- Ziel: Prüfen: Suche innerhalb der Library; Hotkey außerhalb der Library, der
  eine Suchleiste mit Dropdown-Ergebnissen einblendet; Übernahme eines Treffers
  per Drag & Drop zum Beispiel auf ein Charakterblatt; eine Registerkarte je
  Compendium in der Library
- Scope: Foundry-v13-Keybindings, ApplicationV2, Drag-&-Drop-Datenformat der
  Compendium-Einträge, Compendium-Index
- Deliverables: Machbarkeitsbewertung je Teilfunktion
- Acceptance: dokumentierte Aussage mit Quellenbelegen
- Risiken: niedrig-mittel (Performance bei großen Compendien)
- Dependencies: M7
- Priorität: mittel

## M8a — Eagle Library: Inventar aller Verweisstellen und Umschreibbarkeit (N6)
- Ziel: N6 verlangt, dass **jede** Verlinkung in kopierten Einträgen auf die Library-Kopien umgeschrieben
  wird. M7 hat nur Beispiele belegt (Klassen-Merkmale über "Item Grant", Zauberlisten, `@UUID`-Links).
  Dieser Milestone erhebt vollständig, an welchen Stellen dnd5e 5.3.3 (und der Foundry-Kern) Verweise auf
  andere Dokumente speichert, wie sie sich umschreiben lassen und was das für Kopiervorgang, Einmaligkeit,
  Version, Character Edit und Homebrew bedeutet
- Scope: dnd5e-Quellcode 5.3.3 (Datenmodelle aller Item-, Actor-, Journal-, Activity-, Advancement- und
  Effect-Typen), Foundry-Kern-Types (UUID-Felder, `@UUID`-Auszeichnung, Verweise wie `system.container`),
  Ergebnis M7, Antworten Q4–Q7 und N6–N8. Rein lesend
- Deliverables: (1) Inventar der verweistragenden Felder (Dokumenttyp/Untertyp, Feldpfad, Art des Verweises:
  absolute UUID, relative ID, Text-Link in HTML, Verweis auf Welt- oder Compendium-Dokument);
  (2) Einordnung je Fall: maschinell umschreibbar / nur per Textumschreibung / nicht umschreibbar oder erst zur
  Laufzeit berechnet; (3) Bewertung einer Umschreibestrategie (Abbildung Quelle → Library-Eintrag, Kopierreihenfolge
  und Abhängigkeitsabschluss, zyklische Verweise, Verweise auf Einträge ohne Library-Kopie, Abbildung 2014/2024,
  Wiedererkennung eines Eintrags nach der Umbenennung "(Duplicate)"); (4) Auswirkungen auf Kopiervorgang, Dedup,
  Character Edit (M9) und Homebrew (M10)
- Acceptance: Das Inventar deckt alle Dokumenttypen ab, die die Eagle Library aufnimmt; jede Kategorie hat ein
  Verdict mit Quellenbelegen; Nicht-Belegtes ist gekennzeichnet
- Risiken: mittel-hoch (Vollständigkeit; Verweise, die erst zur Laufzeit entstehen)
- Dependencies: M7
- Priorität: hoch (M9 baut darauf auf)

## M9 — Eagle Character Edit: Startwege und Live-Abgleich
- Ziel: Prüfen: (a) Start aus dem Hub nur für neue Charaktere (Button "Create
  Player Character" mit Namensfeld, Anfrage an Flight Control, Editor erscheint
  erst nach Anlage); (b) Start aus dem Charakterblatt mit Auslesen und Ausfüllen
  eines bestehenden Charakters; (c) ständiger Live-Abgleich Editor ↔ Flight
  Control ↔ echtes Charakterblatt; (d) Tabs Attributes, Class, Species,
  Background, Spells, Equipment (Abgleich mit Phase-2-Ergebnis zu Egg, das
  dnd5e's Advancement-System als Engine vorsieht)
- Scope: dnd5e-Actor-Datenmodell, Advancement-System, Sheet-Einhängepunkte in
  v13 (Header-Buttons/Hooks am dnd5e-Charakterblatt)
- API-Umwandlung-Relevanz: hoch (Tab-Auswahl → Actor-Struktur); Rückrichtung
  beim Auslesen bestehender Charaktere
- Deliverables: Machbarkeitsbewertung je Startweg und je Tab
- Acceptance: dokumentierte Aussage mit Quellenbelegen; Klärung aus M4 (Level)
  ist eingearbeitet
- Risiken: mittel (Auslesen bereits abweichend erstellter Charaktere)
- Dependencies: M4, M5, M8a
- Priorität: mittel

## M10 — Eagle Homebrew: Erstellen und Bearbeiten nach neuem Ablauf
- Ziel: Prüfen: Auswahl Art (Actor/Item/Roll Table) und Unterkategorie;
  Erzeugen des Objekts durch Flight Control mit Live-Bearbeitung im Hintergrund;
  "Edit with Eagle Homebrew" für bestehende Objekte (Übertragung "alles
  Relevanten" in den Editor); Roll Table als Objektart. Ob der Freitext-Import
  Teil des Moduls bleibt, klärt M4; das Phase-2-Ergebnis dazu bleibt als
  Referenz erhalten
- Scope: dnd5e-Item-/Actor-Typen, RollTable-API, Ergebnis aus M6 als
  Bedingungsmechanismus, Quellenanalyse Importer (`beak-importers.md`)
- API-Umwandlung-Relevanz: zentral (Erzeugen) und Rückrichtung (Bearbeiten
  bestehender Objekte)
- Deliverables: Machbarkeitsbewertung je Objektart und je Ablauf
- Acceptance: dokumentierte Aussage mit Quellenbelegen
- Risiken: mittel (Abdeckung exotischer Mechaniken; Bearbeiten fremd erstellter
  Objekte)
- Dependencies: M4, M5, M6
- Priorität: mittel

## M11 — Eagle Journal: Einstiegspunkte in der Foundry-UI
- Ziel: Prüfen, wie "Open in Eagle Journal" und "Create Eagle Journal Note"
  überall dort erscheinen können, wo Journal-Einträge geöffnet oder erstellt
  werden (Verzeichnis, Blatt, Kontextmenü), orientiert am Original-Foundry-Code;
  Start aus dem Hub. Die übrigen Funktionen bleiben laut PDF wie im
  Ursprungsplan (Phase-2-Ergebnis zu Talon gilt als Referenz)
- Scope: Foundry-v13-UI-Hooks für Journal-Verzeichnis, -Blatt und Kontextmenüs
- Deliverables: Machbarkeitsbewertung je Einstiegspunkt
- Acceptance: dokumentierte Aussage mit Quellenbelegen; Klärung aus M4 ("Note")
  ist eingearbeitet
- Risiken: niedrig
- Dependencies: M4
- Priorität: niedrig

## M12 — Einheitliche UI im Foundry-Stil über getrennte Repos
- Ziel: Prüfen, was Foundry v13 nativ für ein einheitliches Aussehen bietet
  (ApplicationV2, Theme-Variablen, Standard-Formularelemente, Icons) und wie
  sieben getrennt veröffentlichte Module dabei gleich aussehen können, ohne ein
  eigenes Design-System (Entscheidung E8). Optionen (z. B. jedes Modul nutzt
  nur die Foundry-Klassen, gemeinsame Basis über Flight Control, dokumentierter
  Style-Leitfaden) werden verglichen
- Scope: Foundry-v13-UI-Framework (Types, Cheat-Sheet), Quellenanalyse
  (`techniques-catalog.md`)
- Deliverables: Optionenvergleich mit Empfehlung; Risiken (Foundry-Updates,
  Theme-Wechsel hell/dunkel)
- Acceptance: dokumentierte Aussage mit Quellenbelegen. Ohne klare beste
  Option entscheidet der Projektleiter
- Risiken: niedrig-mittel
- Dependencies: M5
- Priorität: mittel

## M13 — Eagle Ruling: Neubewertung nach Repo-Analyse
- Ziel: PDF-Auftrag: die im Projektplan erarbeitete Umsetzung (drei Ebenen:
  Regel-Nachschlagewerk, Regel-Settings, "Change Rule to Homebrew") gegen die
  Ergebnisse der Repo-Analyse prüfen. Leitfragen: Wird die Umsetzung dadurch
  einfacher, und wo? Welche Techniken aus Custom D&D 5e (Konfigurations-Engine,
  Registrierung eigener Activity-Typen, Wrapper-Nutzung) sind als **Muster**
  übertragbar? Wo überschneiden sich beide Module, und welche Konflikte drohen
  beim gleichzeitigen Betrieb (E2: nebeneinander, nicht darauf aufbauen)?
  Wirkung von E3 (eigene Lösung) auf Ruling
- Scope: Quellenanalyse (`prey-rules-customization.md`), Phase-2-Ergebnis
  (M8 alt), dnd5e-Quellcode 5.x; Custom D&D 5e verlangt Foundry 14/dnd5e 6.x
  und ist deshalb nur analysierbar, nicht auf dem Zielstand lauffähig; Lizenz:
  kein Code übernehmen
- API-Umwandlung-Relevanz: hoch (Rückrichtung: Klartext → Override einer
  bestehenden Regel)
- Deliverables: Neubewertung je Ebene, Konfliktrisiken bei Koexistenz,
  angepasste Empfehlung
- Acceptance: dokumentierte Aussage mit Quellenbelegen
- Risiken: mittel-hoch (Mechanik-Ebene ohne Settings-Zugang bleibt schwierig)
- Dependencies: M4, M6
- Priorität: hoch

## M14 — Eagle Roll Out: Vorab-Plan Automationsumfang
- Ziel: PDF-Auftrag: einen Vorab-Plan erstellen, wie viel Automation in dieses
  Modul gepackt werden kann. Automationsbereiche katalogisieren (u. a. Angriffs-
  und Schadensabwicklung, Rettungswürfe, Bedingungen, Auren, Token-/Lichteffekte,
  Wurf-Oberfläche) und je Bereich einschätzen: Aufwand als Eigenimplementierung,
  Überschneidung mit den analysierten Modulen, Konfliktrisiken (nur ein
  "Besitzer" je Bereich), Voraussetzungen aus den anderen Eagle Modulen. Wie die
  Automation entsteht (komplett im Modul oder auf bestehenden Modulen
  aufbauend), klärt M4
- Scope: Quellenanalyse (`wings-automation.md`, `techniques-catalog.md`),
  Ergebnis aus M6; nur Planung, keine Umsetzung. Das Modul bleibt laut PDF
  "zu einem späteren Zeitpunkt"
- Deliverables: Bereichskatalog mit Machbarkeit/Aufwand/Risiko, Empfehlung für
  einen möglichen Ausbaupfad
- Acceptance: dokumentierte Aussage mit Quellenbelegen
- Risiken: hoch (größtes Modul, viele Wechselwirkungen) — bewusst als Vorab-Plan
- Dependencies: M4, M6, M13
- Priorität: niedrig (wie vom Projektleiter vorgegeben)

## M15 — Synthese: Projektplan und Standalone-Plan aktualisieren
- Ziel: Ergebnisse aus M2–M14 in `dadm/eagle-modules-projektplan.md` und
  `EAGLE-MODULES-PLAN.md` einarbeiten: echte Modulnamen, neue Spezifikation,
  Machbarkeits-/Risikomatrix je Modul, aktualisierte Abhängigkeiten (ein Repo
  pro Modul, nur v13), überarbeitete Empfehlung zur Reihenfolge einer späteren
  Umsetzungsphase, Ruling-Neubewertung, Roll-Out-Vorab-Plan
- Scope: die beiden lebenden Dokumente; das Phase-2-Ergebnis bleibt in der
  Git-Historie und im Archiv nachvollziehbar
- Deliverables: aktualisierte Dokumente
- Acceptance: Projektleiter bestätigt, dass die Dokumente vollständig sind und
  die Ergebnisse dieser Phase korrekt wiedergeben
- Risiken: keine neuen (Zusammenführung) — info
- Dependencies: M1–M14
- Priorität: hoch

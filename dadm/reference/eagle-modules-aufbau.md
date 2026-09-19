# Eagle Modules - Aufbau

retention: durable (Quelldokument der Planungsphase 3)
Quelle: vom Projektleiter als PDF bereitgestellt ("Eagle Modules.pdf",
Titel im Dokument "Eagle Modules - Aufbau", 3 Seiten, geliefert am 2026-09-19).
Der Abschnitt "Transkript des PDFs" gibt das PDF **wortgetreu** wieder, auch
Tipp- und Schreibfehler, ohne Bewertung. Danach folgen die Antworten des
Projektleiters vom selben Tag, die daraus abgeleiteten Entscheidungen und die
Namenszuordnung. Der Abgleich mit der Vision (`eagle-modules-vision.md`) steht
nicht hier, sondern im Ergebnis von Milestone M4.

## Transkript des PDFs

**Grundaufbau:** Jedes Module ist ein einzelnes Modul mit eigenem Github-Repo.
Die Module sind zwar miteinander verknüpft, aber die Eagle Modules sollen bewusst
modular aufgebaut sein.
Zum einen, weil außer den bisher geplanten Modulen später weitere dazu kommen sollen.
Zum anderen weil ich den Grundgedanken von einem modularen VTT beibehalten will und
kein großes Mega-Modul erschaffen will.

**UI-Design:** Die UI der einzelnen Module soll einheitlich aussehen, gleicher Stil, gleiche
Buttons, gleiche Schrift etc. Alles schon in Foundry vorhanden, deshalb wird für die UI der
Stil der Foundry-UI benutzt damit sich jedes Module optisch schön in Foundry einfügt

### Module:

Alle Module haben in diesem Dokument ihren richtigen Modul Namen und nicht wie bisher
den Entwicklungsnamen. Entsprechend anpassen

**Eagle Flight Control:**

- Die Eagle Flight Control (ehemals Eagle Eye) wird zur Schnittstelle zwischen
  FoundryVTT, dem DnD 5E System von Foundry und den Eagle Modulen.
- Nur eigene Eagle Module angebunden. Keine Fremdmodule
- Hub bündelt die Einstellungen der einzelnen Eagle Module
- Jedes installierte Module hat eine eigene Registerkarte im Hub
- Jedes Eagle Module kann aus dem Hub gestartet werden
- Versteht Foundry API und DnD Systemlogik
- Empfängt Anfragen von Eagle Modules und führt diese aus
- Wandelt je nach Anfrage Klartext in Codesprache um und umgekehrt

**Eagle Library:**

- Die Eagle Library (ehemals Eagle Eyrie) dient als Single Source of Truth für Eagle
  Modules
- Erstellt eigene Compendien für jede Art Compendium (Eagle Actors, Eagle Classes,
  Eagle Items, etc)
- Es werden da wo nötig Compendien für 2014er DnD und 2024er DnD erstellt
- Eagle Library als UI um auf alle Eagle Compendien zuzugreifen
- Jedes Compendium hat eine eigene Registerkarte in der Library
- In der Library kann man einzelne oder alle nicht Eagle Compendien auswählen und
  per Button in die Eagle Library kopieren
- Alles wird in das jeweilig richtige Compendium in der Library kopiert, auch 2014er
  Inhalte zu 2014er Compendien und 2024er Inhalte zu 2024er Compendien
- Jeder Eintrag in der Eagle Library darf nur genau einmal pro Version vorkommen
  (2014,2024)
- Eagle Library hat eine Suchfunktion um in der Library direkt nach Compendium
  einträgen zu Suchen
- Außerhalb der Library Hotkeys zum durchsuchen (Searchbar erscheint,nach
  Sucheingabe erscheinen Einträge im Drop Down Menü, Eintrag kann daraufhin per
  Drag&Drop zum Beispiel in Character Sheet eingeführt werden)

**Eagle Character Edit:**

- Eagle Character Edit (ehemals Eagle Egg) ist ein einfacher Charaktereditor und dient
  zum Erstellen von Player Charakter
- Workflow: Eagle Character Edit UI <--> Eagle Flight Control <--> Character Sheet
- Lässt sich aus dem Hub starten (nur für neuen Charakter zu erstellen, vor Anzeige
  vom Editor nur ein “Create Player Character” Button mit Textfeld zur Eingabe des
  Namens. Befehl an Eagle Flight Control zum Charakter erstellen. Editor-UI erscheint
  sobald Eagle Flight Control Charakter erstellt hat und damit anfängt die Daten vom
  Sheet zum Editor zu übertragen und umgekehrt
- Lässt sich aus Charakter Sheet starten, Eagle Flight Control liest Character aus und
  füllt alles im Editor aus was bereits für den Charakter ausgefüllt wurde
- Registerkarten im Editor:
  - Attributes: Point Buy, Standard Array oder manuelle Eingabe; Anzeige von
    Base-Wert, Bonus (aus späteren Feature-Wahlen) und Base+Bonus
  - Class: Class, Classfeatures, Subclass, Subclassfeatures
  - Species: Species, Subspecies, Speciesfeatures
  - Background: Background, Backgroundfeatures
  - Spells nach Level sortiert, mit Anzeige verfügbarer vs. bereits
    gewählter Spells/Cantrips laut Regelwerk; nur mit aktueller
    Class/Leveltatsächlich wählbare Spells werden angezeigt
  - Equipment: Equipment und Gold
- Während der Erstellung/Bearbeitung wird das echte Sheet stets von Eagle Flight
  Control live mitbearbeitet

**Eagle Homebrew:**

- Eagle Homebrew (ehemals Eagle Beak) ist ein Editor zum Erstellen von Homebrew
  in Foundry/DnD
- Öffnen aus Hub von Eagle Flight Control für neues Objekt
- Beim Öffnen Wahl zwischen "Create Homebrew", danach zunächst Art
  (Actor/Item/Roll Table), dann Unterkategorie:
- Actor: Player Character, Non Player Character, Encounter, Group, Vehicle
- Item: Class, Subclass, Item, Spell, Feature, Background, Facility, Tool,
- Weapon, Container, Equipment, Loot, Consumable, Species
- Eagle Flight Control erstellt gewähltes Objekt und editiert live im Hintergrund
- Workflow: Eagle Homebrew <--> Eagle Flight Control <--> gewähltes Objekt
- Kann bei bereits bestehendem Objekt genutzt werden mit “Edit with Eagle
  Homebrew”, Eagle Flight Control überträgt dann alles relevante in Eagle Homebrew

**Eagle Journal (ehemals Eagle Talon):**

- Kann über Hub geöffnet werden oder überall dort wo normal Journal Entries geöffnet
  oder erstellt werden können mit zusätzlichen “Open in Eagle Journal” oder “Create
  Eagle Journal Note” Buttons oder im Drop Down Menü (ja nach Programmierung der
  Foundry UI einfach am Original Journal Code orientieren)
- Features bleiben ansonsten wie im Ursprungsplan

**Eagle Ruling(Ehemals Eagle Prey):**

- Umsetzung aus erarbeiteten Projekplan prüfen nach Recherche der github Repos
- Soll neben custom 5e existieren, nicht darauf aufbauen, Repo wurde geschickt zur
  Analyse ob Umsetzung für Eagle Ruling dadurch vllt einfacher

**Eagle Roll Out(Ehemals Eagle Wings):**

- Weiterhin zu einem späterem Zeitpunkt
- Aufgrund geschickter Repos zur Analyse aber gerne einen Vorab-Plan für Eagle Roll
  Out hinsichtlich dessen wieviel Automation in dieses Modul gepackt werden kann

## Hinweise zur Transkription

Fakten zur Form des PDFs, keine Deutung:

- Im Abschnitt Eagle Character Edit beginnt die Registerkarten-Zeile zu den Spells
  ohne Doppelpunkt ("Spells nach Level sortiert, …"); die übrigen fünf beginnen mit
  "Name:".
- Im Abschnitt Eagle Character Edit ist die Klammer im dritten Punkt ("Lässt sich
  aus dem Hub starten (nur für …") im PDF nicht geschlossen.
- Im Abschnitt Eagle Homebrew stehen "Actor: …", "Item: …" und "Weapon, Container,
  Equipment, Loot, Consumable, Species" im PDF als eigene Aufzählungspunkte auf
  derselben Ebene wie die übrigen Punkte. Die Zeile "Item: …" endet mit "Tool,".
- Im Abschnitt Eagle Homebrew hat der erste Aufzählungspunkt im PDF einen fett
  gesetzten Strich.
- Die Schreibweisen "Leveltatsächlich", "Projekplan", "vllt", "einträgen zu
  Suchen", "Searchbar erscheint,nach", "(2014,2024)" und "Eagle Ruling(Ehemals
  Eagle Prey)" stehen so im PDF.
- Die Überschriften der Abschnitte Eagle Ruling und Eagle Roll Out schreiben
  "Ehemals" groß und setzen kein Leerzeichen vor die Klammer; bei Eagle Flight
  Control, Eagle Library, Eagle Character Edit und Eagle Homebrew steht "ehemals"
  im ersten Aufzählungspunkt bzw. bei Eagle Journal in der Überschrift.

## Antworten des Projektleiters vom 2026-09-19

### Zu den vier offenen Fragen der Quellenanalyse
Die Fragen stehen in `source-analysis/README.md`, Abschnitt 5 "Offene Fragen an den Projektleiter".

| Frage | Antwort im Wortlaut |
|---|---|
| Q1: Auf welche Foundry- und dnd5e-Versionen sollen die Eagle Modules zielen? | "1. Vorerst für V13, V14 wird gecancelt und kann auch aus Codebasis entfernt werden. Eventuell zu einem bedeutend späteren Zeitpunkt." |
| Q2: Soll Eagle Prey (und ggf. Teile von Eagle Wings) neben Custom D&D 5e koexistieren, darauf aufbauen/integrieren oder sich bewusst davon abgrenzen? | "2. in PDF erklärt" |
| Q3: Sind Abhängigkeiten auf Fremdmodule (Build-a-Bonus, Automated Conditions, Midi-QOL) für Eagle Beak akzeptabel, oder soll eine eigenständige Lösung erforscht werden? ("nur gegen Typ X"-Bedingungen) | "3. eigene Lösung" |
| Q4: Unter welcher Lizenz sollen die Eagle Modules veröffentlicht werden? | "4. Vorerst unter keiner, das ist ein Hobyprojekt für mich und befreundete DMs" |

Zusätzlich: "Im PDF steht ein genauerer Plan für die nächste Phase. Mit expliziteren Anweisungen."

### Antworten auf Rückfragen bei der Vorbereitung des Bootstraps

| Frage | Antwort |
|---|---|
| Das PDF sagt: "Entsprechend anpassen" (echte Modulnamen statt Entwicklungsnamen). Wie weit soll die Umbenennung gehen? | "Nur Dokumente (Recommended)": Plan, Vision, README und Referenzmaterial nutzen die neuen Namen (alte nur als "ehemals"). Abgeschlossene Milestone-Artefakte bleiben unverändert. Modul-ID, Titel und Repo-Name im Code/GitHub bleiben vorerst, bis die Repo-Struktur (ein Repo pro Modul) in einer Umsetzungsphase entworfen wird. |
| Das PDF sagt für Eagle Flight Control "Nur eigene Eagle Module angebunden. Keine Fremdmodule". Der bereits gebaute Code scannt dagegen alle installierten Module, zeigt deren Einstellungen im Hub, überwacht libWrapper-Konflikte beliebiger Module und erkennt System-Sprachen. Wie ist das gemeint? | "Fremdmodul-Funktionen entfallen": Hub, Scanner, Konfliktüberwachung und Sprach-Erkennung für Fremdmodule gehören nicht mehr zum Vorhaben. Der Phase-1-Code bleibt in dieser Phase unangetastet; ob er entfernt oder auf Eagle-Module umgebaut wird, entscheidet eine spätere Umsetzungsphase. |

### Bestätigungen bei der Plan-Freigabe
"1.Plan freigegeben 2. bestätige 3. bestätige 4. bestätige" — bezogen auf: (1)
Milestone Plan Version 1 der Planungsphase 3, (2) Safety Boundaries, (3) Working
Mode inklusive Autonomie-Freigabe, (4) die abgeleitete dnd5e-Linie (dnd5e 6.x und
Module, die Foundry 14 verlangen, sind nicht Ziel).

## Antworten des Projektleiters zur Klärungsliste von M4 (2026-09-19)

Fragen und Optionen: `dadm/spezifikationsabgleich.md` und `dadm/m4-02-apply-output.md`. Die Spalte "Antwort" ist der Wortlaut, "Bedeutung" die ausgeschriebene Option.

| # | Thema | Antwort (Wortlaut) | Bedeutung |
|---|---|---|---|
| Q0 | Vision gilt weiter, wo das PDF schweigt; "Ursprungsplan" = Vision | "0. a" | Ja: Die Vision gilt weiter, wo das PDF schweigt (außer bei den einzeln gefragten Punkten). "Ursprungsplan" (Journal) = Vision. |
| Q1 | Fremdmodul-Funktionen unter Eagle Modulen (Kompatibilität, Auswirkungen, Abhängigkeiten) | "1.a" | Entfallen ganz: Kompatibilitätserkennung, Auswirkung von Einstellungsänderungen und Aktivieren/Deaktivieren von Abhängigkeiten gelten auch unter Eagle Modulen nicht. |
| Q2 | Kompatibilität mit verbreiteten Fremdmodulen als Ziel | "2. A" | Ja: Kompatibilität der Eagle Module mit verbreiteten Fremdmodulen bleibt ein Ziel, auch wenn Flight Control keine Fremdmodule anbindet. |
| Q3 | Nur Flight Control spricht mit Foundry/DnD | "3. a" | Ja: Alle Foundry-Änderungen laufen über Flight Control; die anderen Module haben nur Einbindung und UI. |
| Q4 | Library: Ausnahme Klassen/Spezies/Subklassen/Backgrounds | "4. a" | Die Ausnahme entfällt: Auch Klassen, Spezies, Subklassen und Backgrounds kommen nur einmal pro Version vor. |
| Q5 | Library: Log und Erzwingen | "5.a" | Ja: Nicht übertragene Einträge werden geloggt, der DM kann die Übertragung erzwingen. |
| Q6 | Library: was ist "derselbe Eintrag" | "6.a" | "Derselbe Eintrag" = gleicher Name im selben Eagle Compendium und in derselben Version. |
| Q7 | Library: Auswahl "zur Durchsuchung" oder "zum Kopieren" | "7.a" | Dieselbe Funktion: Die Auswahl dient nur dem Kopieren, durchsucht wird nur die Eagle Library. |
| Q8 | Homebrew: Import Homebrew (Freitext) | "8. c" | Zurückgestellt: Der Freitext-Import ist nicht Teil dieses Plans (bleibt im Konzept vorgesehen). |
| Q9 | Homebrew: wann und wo wird das Objekt angelegt | "9.  1, a und b"; Rückfrage "Wo? a und b — wie gemeint?": "Immer beides" | Wann: (1) sofort nach Wahl von Art und Unterkategorie (Live-Modell). Wo: immer beides gleichzeitig, als Welt-Dokument **und** als Eintrag in der Eagle Library (Rückfrage am 2026-09-19 beantwortet; "a und b" = beides). Offen für M10: ob beide Einträge unabhängige Kopien oder verknüpft sind und wie Änderungen abgeglichen werden. |
| Q10 | Homebrew: Einstieg "Edit with Eagle Homebrew" | "10. c" | Beides: Kopfzeile des Dokumentblatts und Kontextmenü im Verzeichnis. |
| Q11 | Character Edit: Level | "11. a" | Das Level wird im Class-Tab festgelegt (Class und Level). |
| Q12 | Journal: "Eagle Journal Note" | "12. a" | "Eagle Journal Note" = ein neuer Journal-Eintrag im Eagle-Journal-Vault. |
| Q13 | Roll Out: eigene Implementierung oder Aufbau auf bestehenden Modulen | "13.c" | Der Vorab-Plan bewertet beides (komplett eigene Implementierung und Aufbau auf bestehenden Modulen); der Projektleiter entscheidet danach. |
| Q14 | Dateinamen mit Entwicklungsnamen umbenennen | "14. a" | Ja: Die drei Dateinamen werden umbenannt, Links angepasst. |
| Q15 | Flight Control: "aus dem Hub gestartet" | "15 a" | "Gestartet" heißt: die Oberfläche des Moduls öffnen (nicht aktivieren/deaktivieren). |

## Antworten des Projektleiters zu den offenen Punkten N1–N9 (2026-09-19)

Die Punkte wurden in M5 bis M8 gesammelt (`dadm/spezifikationsabgleich.md`).

| # | Antwort (Wortlaut) | Bedeutung |
|---|---|---|
| N1 | "kann später in den Moduleinstellungen festgelegt werden, welches Modul von wem in wie weit genutzt werden darf" | Nutzungsrechte je Modul und Nutzer werden später in den Moduleinstellungen festgelegt. Folge: Flight Control braucht für Nutzer ohne Foundry-Rechte den GM-Anfrageweg (`User#query`). |
| N2 | "ausblenden" | Registerkarten nur für aktive Eagle Module. Folge: Die Erkennung inaktiver Module über Manifest-`flags` entfällt, die API-Registrierung genügt. |
| N3 | "Englisch" | Der Klartext erscheint auf Englisch. Hinweis: dnd5e-Labels folgen der aktiven Foundry-Sprache; bei nicht englischer Instanz braucht englischer Klartext englische Strings (nicht geprüft). |
| N4 | "Editor-Logik bleibt in den Modulen" | Flight Control bleibt eine schmale, generische Schnittstelle; die Editor-Logik bleibt in den Modulen. |
| N5 | "Vorschlag wird angenommen, erst Stufe 1 dann Stufe 2 ausbauen" | Stufe 1 (Weg A, ohne Laufzeitcode, in Homebrew), danach Stufe 2 (Weg C, bei Roll Out). |
| N6 | "Jede Verlinkung muss auf die Library Kopien umgeschrieben werden (sonst keine Single Source of truth mehr)" | Alle Verlinkungen werden beim Kopieren auf die Library-Kopien umgeschrieben. Folge: neuer Milestone M8a (Plan Version 2, wartet auf Freigabe). |
| N7 | "Wenn weder 2014 noch 2024 hinterlegt ist dann unter 2014 abspeichern, gibt es den Eintrag in 2014 schon aber in 2024 nicht, dann in 2024 abspeichern" | Ohne gespeicherte Version: standardmäßig 2014; existiert der Name in 2014 schon, in 2024 nicht, dann 2024. Existiert er in beiden: Duplikat, protokolliert (Q5); beim Erzwingen wählt der GM die Version (Rückfrage). |
| N8 | "unter geändertem Namen ablegen, die Regel lautet dann Ursprungsname + \"(Duplicate)\"" | Erzwungene Übertragung legt den Eintrag als "Ursprungsname (Duplicate)" ab; weitere Duplikate werden nummeriert ("(Duplicate 2)", …) (Rückfrage). |
| N9 | "nur Namenssuche, ein Hotkey für alle, wenn möglich Compendien Lesen direkt im Library Modul, compendien ändern im library modul läuft aber über flight control" | Nur Namenssuche; ein Hotkey für alle Eagle Compendien; Compendien lesen direkt im Library-Modul, Compendien ändern über Flight Control. |

Rückfragen zu N6 bis N8 und Antworten (Auswahl):
- N6, Erfassung des Inventars aller Verweisstellen: "Neuer Milestone (Recommended)" (Plan Version 2 mit neuer Approval).
- N7/N8, Version der erzwungenen Kopie "(Duplicate)", wenn der Name in 2014 und 2024 schon existiert: "GM wählt".
- N8, weiteres Duplikat, wenn "Name (Duplicate)" schon existiert: "Nummerieren".

## Antworten des Projektleiters zu den offenen Punkten N10–N20 (2026-09-19)

Die Punkte stehen in `dadm/spezifikationsabgleich.md`. Auslegungen von mir sind gekennzeichnet; Prüfergebnisse und Folgen stehen in `dadm/m15-05-human-decision-output.md`.

| # | Antwort (Wortlaut) | Bedeutung |
|---|---|---|
| N10 | "Herkunftsangaben auf der Quelle belassen werden, vermutlich besser für Advancement" | Herkunftsangaben (`_stats.compendiumSource`, Legacy-Flags) bleiben in den Library-Kopien auf der Originalquelle (Prüfergebnis: `m15-05-human-decision-output.md`). |
| N11 | "Abhängigkeiten mitkopieren" | Abhängigkeiten werden automatisch mitkopiert (Abhängigkeitsabschluss, soweit auflösbar; nicht auflösbare Verweise bleiben stehen und werden gemeldet). |
| N12 | "b" | Unterarten einer Spezies über einen Marker, den die Library an Spezies-Einträgen pflegt. |
| N13 | "Besitzer wird ersteinmal der Ersteller also Player wenn er erstallt, GM wenn er erstellt. Ein der Editor mitten im Erstellen beendet wird und ein unfertiger Charakter entsteht sollte man über den Sheet laut Plan wieder den Editor aufrufen können und ihn nachbearbeiten. Warum ist das hier keine Option?" | Besitzer ist zunächst der Ersteller (Spieler, wenn ein Spieler anlegt, GM, wenn der GM anlegt). Ein unfertiger Charakter bleibt bestehen und lässt sich über das Charakterblatt im Editor fortsetzen. (Die Fortsetzung über das Blatt war im Ergebnisdokument als Option enthalten, im Standalone-Plan aber nicht ausgeschrieben; Wortlaut dort korrigiert.) |
| N14 | "S1 wird angenommen, b Eintrag anlegen, c \"Name (Duplicate)\"" | (a) Die Library ist die Quelle, das Welt-Dokument wird daraus aktualisiert (S1). (b) "Edit with" auf ein Welt-Dokument ohne Library-Eintrag legt den Eintrag an. (c) Existiert der Name bereits: "Name (Duplicate)", bei Wiederholung nummeriert wie bei N8. |
| N15 | "Item ist die Foundryseitige Hauptgruppe zu der Features, Spells, Classes etc zählen. \"Player Character\" in Homebrew ist tatsächlich von mir falsch angegeben worden, wird bereits durch Character Edit gelöst" | "Item" ist die Foundry-Hauptgruppe (Art), kein Untertyp; die Untertypen sind die 13 dnd5e-Typen (Auslegung, siehe Rückfrage). "Player Character" gehört nicht in Homebrew, das erledigt Character Edit. |
| N16 | "rulesVersion" | Die Regelwerk-Version eines neuen Objekts kommt aus der Welteinstellung `rulesVersion`. |
| N17 | "Alle Journal Einstiege sollen auch einen Eagle Journal Einstieg haben, besser wäre sogar, falls möglich das Eagle Journal die Journal Einstiege überschreibt und nicht aus Versehen ein normaler Journal Eintrag ersrellt wird, bitte prüfen ob möglich b) Einordnung automatisch durchführen c) alle automatisch einordnen" | (a) Jeder Journal-Einstieg bekommt einen Eagle-Journal-Einstieg; besser: Eagle Journal ersetzt die normalen Einstiege, damit nicht versehentlich ein normaler Eintrag entsteht (Prüfung durchgeführt, Ergebnis unten). (b) Einordnung in den Vault automatisch. (c) Alle neuen Einträge werden automatisch eingeordnet. |
| N18 | "a" | Nur Foundry-Bausteine plus schriftlicher Leitfaden (O1). |
| N19 | "libWrapper als Abhängigkeit freigegeben" | libWrapper ist als Abhängigkeit freigegeben (einzige Fremdmodul-Abhängigkeit). |
| N20 | "N29 b) nichts soll per se dauerhaft ausgeschlossen bleiben, ziel ist es die höchstmögliche Automationsstufe zu erreichen, in wie weit der GM die Automation möchte wird später in den Einstellungen von Roll Out spezifiziert" | Gelesen als N20 (im Text "N29") und Weg (b) Eigenbau, für tiefe Bereiche mit libWrapper. Nichts bleibt dauerhaft ausgeschlossen; Ziel ist die höchstmögliche Automationsstufe; wie viel Automation der GM will, stellt er später in den Einstellungen von Roll Out ein. |

## Antworten auf die Rückfragen zu N10–N22 und Bestätigung der Pläne (2026-09-19)

| Punkt | Antwort (Wortlaut) | Bedeutung |
|---|---|---|
| N10b | "N10b. ja" | Character Edit setzt die ältere Herkunftsmarke `flags.dnd5e.sourceId` beim Hinzufügen eines Items auf die Library-Kopie |
| N21 | "N21. automatisch beim Kopieren, kann aber auch von Hand hinzugefügt oder entfernt werden" | Der Unterarten-Marker entsteht automatisch beim Kopieren; die Library erlaubt, ihn von Hand zu setzen oder zu entfernen |
| N22 | "N22 Guter Vorschlag, wird angenommen" | Importe (Abenteuer, Importer) behalten ihre Ordnerstruktur innerhalb eines Unterordners des Vaults; Compendium- und Systeminhalte (Regeln, Klassenseiten) werden nicht ersetzt |
| Auslegungen | "4. bestätige beide Auslegungen" | "Item" ist die Foundry-Hauptgruppe, die Untertypen sind die 13 dnd5e-Typen; "N29" war N20 und "b)" der Weg (b) Eigenbau mit libWrapper |
| Bestätigung | "Beide Pläne bestätigen, Commit kann durchgeführt werden" | `EAGLE-MODULES-PLAN.md` und `dadm/eagle-modules-projektplan.md` sind bestätigt (Milestone-Acceptance von M15); ein lokaler Commit ist freigegeben (kein Push ausdrücklich genannt) |

## Entscheidungen E1–E8 (Kurzform)
Maßgeblich ist `dadm/01-project-brief.md`; hier nur zum Nachschlagen.

| # | Entscheidung | Quelle |
|---|---|---|
| E1 | Zielversion vorerst nur Foundry v13; v14 gecancelt, aus der Codebasis entfernbar | Antwort Q1 |
| E2 | Eagle Ruling neben Custom D&D 5e, nicht darauf aufbauend | Antwort Q2 + PDF |
| E3 | "Nur gegen Typ X"-Bedingungen: eigene Lösung, keine Fremdmodul-Abhängigkeit | Antwort Q3 |
| E4 | Vorerst keine Lizenz | Antwort Q4 |
| E5 | Echte Modulnamen; Umbenennung nur in Dokumenten | PDF + Rückfrage |
| E6 | Flight Control nur mit eigenen Eagle Modulen; Fremdmodul-Funktionen entfallen; Phase-1-Code unangetastet | PDF + Rückfrage |
| E7 | Ein eigenes GitHub-Repo je Modul, bewusst modular | PDF |
| E8 | UI im Stil der nativen Foundry-UI | PDF |

## Namenszuordnung

| Entwicklungsname | Modulname |
|---|---|
| Eagle Eye | Eagle Flight Control |
| Eagle Eyrie | Eagle Library |
| Eagle Egg | Eagle Character Edit |
| Eagle Beak | Eagle Homebrew |
| Eagle Talon | Eagle Journal |
| Eagle Prey | Eagle Ruling |
| Eagle Wings | Eagle Roll Out |

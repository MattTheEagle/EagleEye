```
artifact: discover-output
milestone: M4
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Vision, Entwicklungsnamen)
- `dadm/reference/eagle-modules-aufbau.md` (PDF-Transkript und Antworten vom 2026-09-19)
- Phase-2-Ergebnisse (`dadm/eagle-modules-projektplan.md`), nur zum Nachschlagen
- Liste der überholten Aussagen aus `dadm/m3-03-deploy-output.md`

## Vorgehen
Beide Quellen werden in einzelne Aussagen zerlegt und nummeriert (V = Vision,
P = PDF). Eine Aussage ist eine Anforderung oder Festlegung, kein Erklärtext. Die
Zuordnung und Bewertung folgt in Apply.

## Inventory: Aussagen der Vision (V) je Modul

| ID | Modul (Modulname) | Aussage |
|---|---|---|
| V-EE1 | Flight Control | Schnittstelle zwischen Foundry, DnD, eigenen und (wenn möglich) fremden Modulen |
| V-EE2 | Flight Control | Erkennen, wenn Module nicht miteinander kompatibel sind, und **warum** |
| V-EE3 | Flight Control | Hub für gebündelte Einstellungsänderungen |
| V-EE4 | Flight Control | Erkennen, wenn eine Einstellungsänderung Auswirkungen auf andere Module hat; DM informieren |
| V-EE5 | Flight Control | Dependencies zwischen Modulen aktivieren/deaktivieren können |
| V-EE6 | Flight Control | Datenbank mit Zugriff auf Funktionen von Foundry, DnD und anderen Modulen |
| V-EE7 | Flight Control | Komplexe API-Anwendungen "umwandeln" (strukturierte Eingabe → korrekte Foundry-/dnd5e-Struktur), Beispiel Langschwert |
| V-EE8 | Architektur | Nur Eagle Eye interagiert direkt mit Foundry und dem DnD-System; die übrigen Module haben nur Verknüpfungen für Einbindung und UI, alle Daten-/Orchestrierungslogik läuft über Eagle Eye |
| V-EE9 | Architektur | Kompatibilität mit verbreiteten Fremdmodulen (Prime Performance, PopOut, Token Action HUD, Monks Little Details) ist erwünscht, kein Standalone-Konzept; Anbindung weiterer Module langfristig vorgesehen |
| V-EY1 | Library | Erstellt (wenn aktiv, falls nicht vorhanden) eigene Compendien, zusammengefasst in der "Eagle Library" |
| V-EY2 | Library | Durchsuchbar über eine Searchbar im Library Browser |
| V-EY3 | Library | Hotkey-Quicksearch ohne die Library zu öffnen |
| V-EY4 | Library | Neue Compendien zunächst leer; im Browser können alle oder einzelne Compendien "zur Durchsuchung" ausgewählt werden |
| V-EY5 | Library | Existiert ein Eintrag mit **gleichem Namen** bereits in der Library, wird er nicht automatisch übertragen |
| V-EY6 | Library | Ausnahme: Klassen, Spezies, Subklassen, Backgrounds werden **immer** übertragen (Klärung Bootstrap) |
| V-EY7 | Library | Nicht übertragene Einträge werden geloggt; der DM kann per Klick die Übertragung erzwingen |
| V-EY8 | Library | Alle Eagle Module beziehen sich ausschließlich auf Einträge der Eagle Library |
| V-EG1 | Character Edit | Geführte Erstellung von Player Characters direkt über deren Actor Sheet |
| V-EG2 | Character Edit | Fragt über Eagle Eye die Eagle Library ab und zeigt passende Optionen in mehreren Tabs |
| V-EG3 | Character Edit | Änderungen am Sheet werden von Eagle Eye gesteuert |
| V-EG4 | Character Edit | Auswahlmöglichkeiten passen sich dynamisch an bereits getroffene Wahlen an |
| V-EG5 | Character Edit | Sechs Tabs: Attributes (Point Buy, Standard Array, manuell; Base/Bonus/Base+Bonus), Class, Species, Background, Spells (nach Level, verfügbar vs. gewählt, nur aktuell wählbare), Equipment |
| V-EG6 | Character Edit | Das echte Sheet wird live mitbearbeitet |
| V-BK1 | Homebrew | "Homebrew Object Creator/Importer/Editor" |
| V-BK2 | Homebrew | Beim Öffnen Wahl zwischen "Import Homebrew" und "Create Homebrew" |
| V-BK3 | Homebrew | Erst Art (Actor/Item/Roll Table), dann Unterkategorie (Actor 5, Item 14 Einträge) |
| V-BK4 | Homebrew | Nach Bestätigung öffnet sich ein zu Eagle Egg analoger Editor mit passenden Optionen |
| V-BK5 | Homebrew | "Create" sendet alles an Eagle Eye; dieses erstellt das Objekt inklusive Features und fügt es über Eyrie zur Eagle Library hinzu |
| V-BK6 | Homebrew | Fehler/nicht erkannte Angaben werden im Editor hervorgehoben und sind nachbearbeitbar; "Create" wird danach zu "Edit" |
| V-BK7 | Homebrew | "Import Homebrew": Freitext in ein Textfeld, per Button geparst, vorausgefüllt im Editor, danach gleicher Workflow |
| V-TA1 | Journal | Obsidian-angelehnte Journal-Darstellung |
| V-TA2 | Journal | GM und jeder Spieler bekommen beim ersten Öffnen einen eigenen Ordner (nach Login-Namen); GM sieht alle, Spieler nur den eigenen |
| V-TA3 | Journal | Darin ein Ordner mit dem Namen der Foundry-Welt als "Vault" |
| V-TA4 | Journal | Neue Einträge werden automatisch strukturiert abgelegt (Szenen → Unterordner → Eintrag) |
| V-TA5 | Journal | Vault-Aufbau als Sidebar links |
| V-TA6 | Journal | Eigene Tags erstellen, zuweisen, durchsuchen |
| V-TA7 | Journal | Verlinkung per Rechtsklick "Link to…" (Namens-/Tag-Suche) oder direkt "Link to [Name]" bei gleichnamigem Eintrag |
| V-TA8 | Journal | Alle direkten Foundry-Änderungen laufen über Eagle Eye |
| V-PR1 | Ruling | Alle Regeln des laufenden DnD-Systems katalogisiert und vereinfacht darstellen (Combat, Attack, Damage …), schriftlich und als Klartext-Mechanik |
| V-PR2 | Ruling | Erfassung **automatisch aus dem laufenden dnd5e-Code**, kein manuell gepflegter Katalog (Klärung) |
| V-PR3 | Ruling | "Change Rule to Homebrew" (eigenes Fenster) und "Add New Rule" |
| V-PR4 | Ruling | Änderungen gehen an Eagle Eye, das die Original-Regel außer Kraft setzt und die geänderte/neue einsetzt |
| V-PR5 | Ruling | Zuerst ohne tiefe Eingriffe versuchen; sonst tiefe Eingriffe erlaubt, dann katalogisierte Liste aller nutzbaren Variablen, Hooks, Flags |
| V-WG1 | Roll Out | Automation/QoL, die stets kompatibel funktioniert; soll Funktionen mehrerer bestehender Module bündeln (Midi-QoL, Active Auras, Active Token Effects, Automated Conditions) |
| V-WG2 | Roll Out | Vom Projektleiter zurückgestellt bis alles andere reibungslos läuft |

## Inventory: Aussagen des PDFs (P) je Abschnitt

| ID | Abschnitt | Aussage (Kurzfassung, Wortlaut im Transkript) |
|---|---|---|
| P-G1 | Grundaufbau | Jedes Modul ist ein einzelnes Modul mit eigenem GitHub-Repo |
| P-G2 | Grundaufbau | Module miteinander verknüpft, aber bewusst modular; weitere Module später; kein Mega-Modul |
| P-G3 | UI-Design | UI einheitlich (Stil, Buttons, Schrift), im Stil der Foundry-UI |
| P-G4 | Module | Echte Modulnamen statt Entwicklungsnamen, "Entsprechend anpassen" |
| P-FC1 | Flight Control | Schnittstelle zwischen FoundryVTT, dem DnD 5E System von Foundry und den Eagle Modulen |
| P-FC2 | Flight Control | Nur eigene Eagle Module angebunden, keine Fremdmodule |
| P-FC3 | Flight Control | Hub bündelt die Einstellungen der einzelnen Eagle Module |
| P-FC4 | Flight Control | Jedes installierte Modul hat eine eigene Registerkarte im Hub |
| P-FC5 | Flight Control | Jedes Eagle Modul kann aus dem Hub gestartet werden |
| P-FC6 | Flight Control | Versteht Foundry API und DnD Systemlogik |
| P-FC7 | Flight Control | Empfängt Anfragen von Eagle Modulen und führt sie aus |
| P-FC8 | Flight Control | Wandelt je nach Anfrage Klartext in Codesprache um **und umgekehrt** |
| P-L1 | Library | Single Source of Truth für Eagle Modules |
| P-L2 | Library | Eigene Compendien für jede Art Compendium (Eagle Actors, Eagle Classes, Eagle Items, etc) |
| P-L3 | Library | Wo nötig getrennte Compendien für 2014er und 2024er DnD |
| P-L4 | Library | Eagle Library als UI für den Zugriff auf alle Eagle Compendien |
| P-L5 | Library | Jedes Compendium hat eine eigene Registerkarte |
| P-L6 | Library | Einzelne oder alle **nicht-Eagle** Compendien auswählen und per Button in die Eagle Library **kopieren** |
| P-L7 | Library | Alles wird ins jeweils richtige Compendium kopiert (2014 → 2014, 2024 → 2024) |
| P-L8 | Library | Jeder Eintrag darf nur **genau einmal pro Version** (2014, 2024) vorkommen |
| P-L9 | Library | Suchfunktion in der Library nach Compendium-Einträgen |
| P-L10 | Library | Außerhalb der Library Hotkeys zum Durchsuchen: Searchbar, Dropdown-Ergebnisse, Drag & Drop z. B. ins Character Sheet |
| P-CE1 | Character Edit | Einfacher Charaktereditor zum Erstellen von Player Charakteren |
| P-CE2 | Character Edit | Workflow: Editor-UI ↔ Flight Control ↔ Character Sheet |
| P-CE3 | Character Edit | Start aus dem Hub nur für neuen Charakter: Button "Create Player Character" + Namensfeld, Befehl an Flight Control; Editor erscheint, sobald der Charakter erstellt ist und der Datenabgleich Sheet ↔ Editor beginnt |
| P-CE4 | Character Edit | Start aus dem Charakter Sheet: Flight Control liest den Charakter aus und füllt den Editor mit allem bereits Ausgefüllten |
| P-CE5 | Character Edit | Sechs Registerkarten (Attributes, Class, Species, Background, Spells, Equipment) mit Inhalten wie in V-EG5 |
| P-CE6 | Character Edit | Das echte Sheet wird während Erstellung/Bearbeitung stets live mitbearbeitet |
| P-HB1 | Homebrew | Editor zum Erstellen von Homebrew in Foundry/DnD |
| P-HB2 | Homebrew | Öffnen aus dem Hub für neues Objekt |
| P-HB3 | Homebrew | Beim Öffnen Wahl zwischen "Create Homebrew", danach Art (Actor/Item/Roll Table), dann Unterkategorie (Actor 5, Item 14 Einträge, wie V-BK3) |
| P-HB4 | Homebrew | Flight Control erstellt das gewählte Objekt und editiert live im Hintergrund |
| P-HB5 | Homebrew | Workflow: Homebrew ↔ Flight Control ↔ gewähltes Objekt |
| P-HB6 | Homebrew | Bei bestehendem Objekt nutzbar mit "Edit with Eagle Homebrew"; Flight Control überträgt alles Relevante |
| P-J1 | Journal | Öffnen über den Hub oder überall, wo Journal Entries geöffnet/erstellt werden können, mit zusätzlichen Buttons "Open in Eagle Journal" / "Create Eagle Journal Note" oder im Drop-Down-Menü; am Original-Journal-Code orientieren |
| P-J2 | Journal | Features bleiben ansonsten wie im Ursprungsplan |
| P-R1 | Ruling | Umsetzung aus dem erarbeiteten Projektplan nach Recherche der GitHub-Repos prüfen |
| P-R2 | Ruling | Soll neben Custom D&D 5e existieren, nicht darauf aufbauen; Repo zur Analyse geschickt, ob die Umsetzung dadurch einfacher wird |
| P-W1 | Roll Out | Weiterhin zu einem späteren Zeitpunkt |
| P-W2 | Roll Out | Vorab-Plan, wie viel Automation in dieses Modul gepackt werden kann |

## Inventory: Wortlautunterschiede bei erkennbar gleichen Themen (Fakten)
- Library Auswahl: Vision "zur **Durchsuchung**" (V-EY4), PDF "in die Eagle Library **kopieren**" (P-L6).
- Library Duplikate: Vision prüft "gleichen **Namen**" (V-EY5), PDF nennt "einmal pro **Version**" (P-L8) ohne Kriterium.
- Homebrew: Vision "Importer" und Wahl "Import Homebrew"/"Create Homebrew" (V-BK1/2/7), PDF nur "Create Homebrew" (P-HB3), Wort "Wahl zwischen" mit einer genannten Option.
- Homebrew Ablauf: Vision "Create sendet an Eagle Eye, dieses erstellt … und fügt über Eyrie zur Library hinzu" (V-BK5); PDF "Flight Control erstellt gewähltes Objekt und editiert live im Hintergrund" (P-HB4), Zielort nicht genannt.
- Journal: Begriff "Eagle Journal Note" nur im PDF (P-J1).
- Flight Control: Vision "eigenen und (wenn möglich) fremden" (V-EE1) gegen PDF "Nur eigene … Keine Fremdmodule" (P-FC2); durch Antwort bestätigt (E6).
- Character Edit: Vision "direkt über deren Actor Sheet" (V-EG1) gegen PDF "einfacher Charaktereditor" mit Workflow über Flight Control (P-CE1/2).
- In der PDF-Beschreibung von Character Edit und Homebrew kommt an keiner Stelle ein Level-Wert als eigenes Eingabeelement vor; das Wort "Level" steht nur in der Spells-Zeile.

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Aus dem Vergleich der beiden Quellen entstehen Fragen zur Absicht des Projektleiters; ohne Antworten würden M5–M14 in die falsche Richtung recherchieren | medium | ja, geplanter Stopp nach M4 |
| A1 | "Ursprungsplan" in P-J2 lese ich als die Vision, weil Ruling im selben PDF vom "erarbeiteten Projektplan" spricht und die Journal-Funktionen im Projektplan der Planungsphase 2 nicht verändert wurden (nur bewertet). Kein Blocker, wird in der Klärungsliste als Bestätigung geführt | low | nein |

## Open Questions
Ergeben sich aus Apply (Klassifikation der Unterschiede).

## Next Step
Apply ordnet jede Aussage zu, bewertet die Unterschiede und formuliert die Klärungsliste.

# Eagle Modules — Projektplan

*Easy VTT for Complex Ideas*

> **Namen:** Dieses Dokument verwendet die echten Modulnamen: Eagle Flight Control (ehemals Eagle Eye), Eagle Library (ehemals Eagle Eyrie), Eagle Character Edit (ehemals Eagle Egg), Eagle Homebrew (ehemals Eagle Beak), Eagle Journal (ehemals Eagle Talon), Eagle Ruling (ehemals Eagle Prey), Eagle Roll Out (ehemals Eagle Wings).
>
> **Stand (2026-09-19):** Überarbeitet nach der zweiten Planungsrunde und **vom Projektleiter bestätigt**. Eingearbeitet sind die konkretisierten Modulbeschreibungen des Projektleiters, seine Entscheidungen (u. a. nur Foundry v13, keine Lizenz, Englisch als Sprache des Klartexts, libWrapper als einzige Fremdmodul-Abhängigkeit) und die Ergebnisse der erneuten Machbarkeitsprüfung. Alle Fragen sind beantwortet.

Dieses Dokument beschreibt die Vision der "Eagle Modules" für Foundry Virtual Tabletop, ihren
geplanten Aufbau und den Stand einer Machbarkeitsprüfung, die für jedes Modul einzeln
durchgeführt wurde. Es richtet sich an Leser ohne Vorwissen zum Projekt. Es geht um ein
**Hobbyprojekt** des Projektleiters für sich und befreundete Spielleiter; eine Lizenz ist vorerst
nicht vorgesehen. In dieser Phase wird nichts entwickelt, sondern geprüft und geplant.

Technischer Hintergrund: Vorab entstand am Modul "EagleEye" ein erstes lauffähiges Grundgerüst, das
in einer echten Foundry-Welt getestet wurde (Einstellungen fremder Module lesen und schreiben, Modul-Informationen auslesen). Es dient als
Ausgangspunkt für Eagle Flight Control, ist aber nicht das Ziel dieses Dokuments (Details im Archiv
unter `dadm/archive/` im Projektrepository).

---

## 1. Die Idee dahinter

Foundry Virtual Tabletop gilt als eines der mächtigsten und flexibelsten digitalen Werkzeuge zum
Spielen von Pen-&-Paper-Rollenspielen. Seine große Stärke — eine schlanke Grundstruktur, auf der
praktisch jedes Regelsystem und beliebige Erweiterungen ("Module") aufbauen können — ist zugleich
seine größte Hürde für Einsteiger:

- Im Forge-VTT-Bazaar (einem verbreiteten Hosting-Anbieter für Foundry) existieren mehrere tausend
  Module. Viele überschneiden sich funktional, manche sind zueinander inkompatibel, andere veralten
  und funktionieren nach einem Foundry-Update plötzlich nicht mehr.
- Wer sich seinen Spieltisch individuell einrichten möchte, muss sich zwangsläufig tief in
  technische Details einarbeiten: Modul-Kombinationen ausprobieren, Kompatibilitätsprobleme selbst
  diagnostizieren, Einstellungen über viele Menüs verteilt pflegen.
- Selbst technisch versierte Spielleiter verbringen dadurch oft mehr Zeit mit der Konfiguration von
  Foundry als mit dem eigentlichen Spiel.

Die Eagle Modules sind der Versuch, diese Hürde zu senken: ein Ökosystem eigener, aufeinander
abgestimmter Module, die dem Spielleiter komplexe Foundry- und Regelsystem-Interna abnehmen.

---

## 2. Der Aufbau

### 2.1 Sieben eigenständige Module

Jedes Eagle Modul ist ein **einzelnes, eigenständiges Modul mit eigenem GitHub-Repository**. Die
Module sind miteinander verknüpft, aber bewusst modular aufgebaut: Zum einen sollen später weitere
Module dazukommen, zum anderen soll der Grundgedanke eines modularen Tabletops erhalten bleiben,
statt ein großes "Mega-Modul" zu bauen.

| Modul | Rolle |
|---|---|
| **Eagle Flight Control** | Kernmodul: Schnittstelle zwischen Foundry, dem DnD-5e-System und den Eagle Modulen; Hub mit den Einstellungen der Eagle Module |
| **Eagle Library** | Eine eigene, durchsuchbare Sammlung ("Eagle Library") aus Kompendien, die als einzige Quelle der Wahrheit für die Eagle Module dient |
| **Eagle Character Edit** | Einfacher Editor zum Erstellen und Bearbeiten von Spielercharakteren |
| **Eagle Homebrew** | Editor zum Erstellen und Bearbeiten von Homebrew-Inhalten (Actors, Gegenstände, Zufallstabellen) |
| **Eagle Journal** | Obsidian-artige, verknüpfbare Notizen- und Journal-Verwaltung |
| **Eagle Ruling** | Nachschlagewerk und Anpassung von Spielregeln, unabhängig vom Modul "Custom D&D 5e" |
| **Eagle Roll Out** | Bündelung von Automatisierungs- und Komfortfunktionen (später) |

### 2.2 Rahmen und Grundsätze

- **Nur Foundry v13** und das DnD-5e-System (dessen Linie zu Foundry 13 passt). Foundry v14 wird
  vorerst nicht weiterverfolgt, eventuell zu einem viel späteren Zeitpunkt.
- **Einheitliche Oberfläche im Stil von Foundry selbst:** gleicher Stil, gleiche Buttons, gleiche
  Schrift. Es gibt kein eigenes Design-System; die Module nutzen die Bausteine von Foundry.
- **Eagle Flight Control bindet nur Eagle Module an, keine Fremdmodule.** Alle **Änderungen** an
  Foundry-Daten laufen über Eagle Flight Control; Lesen dürfen die Module direkt. Die Logik der
  Editoren bleibt in den jeweiligen Modulen. Eagle Flight Control bleibt eine schmale, allgemeine
  Schnittstelle, damit es kein Mega-Modul wird.
- **Verträglichkeit mit verbreiteten Fremdmodulen** (Fenster-, Performance- und HUD-Modulen) bleibt
  ein Ziel. Es wird durch die Bauweise erreicht, nicht durch eine Erkennungsfunktion.
- **Sprache:** Der von den Modulen erzeugte Klartext ist Englisch.
- **Rechte:** Wer welches Modul in welchem Umfang nutzen darf, wird später in den Moduleinstellungen
  festgelegt.
- **Keine Lizenz.** Für die Kernfunktionen gibt es keine Abhängigkeit von Fremdmodulen (Eigenlösung statt
  Fremdmodul, z. B. bei Bedingungen wie "nur gegen Untote"). **Einzige freigegebene Ausnahme ist libWrapper**, ein
  weit verbreitetes Hilfsmodul, mit dem sich Programmteile anderer Module und des Systems sauber überschreiben lassen.

---

## 3. Die Module im Detail

Für jedes Modul: zuerst die geplanten Funktionen, danach der Stand der Machbarkeitsprüfung.

### 3.1 Eagle Flight Control (Kernmodul)

**Geplante Funktionen:**
- Schnittstelle zwischen Foundry, dem DnD-5e-System und den Eagle Modulen
- Hub, der die Einstellungen der Eagle Module bündelt; **jedes aktive Eagle Modul hat eine eigene
  Registerkarte** (nicht aktive Module werden ausgeblendet)
- Jedes Eagle Modul lässt sich aus dem Hub **starten** (seine Oberfläche öffnen)
- Kennt die Foundry-Programmierschnittstelle und die Logik des DnD-Systems
- Nimmt Anfragen der Eagle Module entgegen und führt sie aus
- Wandelt je nach Anfrage **Klartext in Foundry-Daten um und umgekehrt** (Englisch)

Nicht mehr vorgesehen sind die Funktionen aus der ersten Vision, die Fremdmodule betrafen:
Kompatibilitäts-Erkennung mit Begründung, Erkennung von Auswirkungen einer Einstellungsänderung und das
Aktivieren oder Deaktivieren von Abhängigkeiten. Sie entfallen auch für die Eagle Module untereinander.

**Stand der Prüfung:**
- **Hub mit Registerkarten und Start der Module: machbar (Risiko niedrig).** Foundry bringt die Bausteine
  für Fenster mit Registerkarten mit; das Grundgerüst aus der ersten Phase hat bereits ein solches
  Fenster (bisher eine Tabelle ohne Registerkarten). Ein Eagle Modul meldet sich mit seinem Inhalt und einer Startfunktion an; so lassen sich
  später weitere Module ohne Änderung an Eagle Flight Control ergänzen.
- **Anfragen der Module an Eagle Flight Control: machbar (Risiko mittel).** Dafür gibt es ein in Foundry-Modulen
  übliches Muster (auch Midi-QOL nutzt es). Der Zugriff ist sicher erst möglich, nachdem alle Module
  gestartet sind. Sollen Spieler Änderungen anstoßen, für die ihnen Foundry die Rechte nicht gibt, kann
  Eagle Flight Control die Anfrage an den Spielleiter weiterreichen; Foundry hat dafür einen eigenen, eingebauten
  Mechanismus, ein weiteres Modul ist nicht nötig.
- **Versionen getrennter Module:** Sieben Module werden unabhängig voneinander veröffentlicht. Die
  wichtigste Regel ist deshalb eine stabile, versionierte Schnittstelle. Nicht geprüft (nur im
  laufenden Foundry testbar): Verhalten bei fehlendem oder deaktiviertem Eagle Flight Control, Erzwingen von Versionsspannen.
- **"Klartext ↔ Code":** siehe Abschnitt 4.
- Das vorhandene Grundgerüst deckt Teile davon ab (Einstellungen lesen und schreiben, Modul-Informationen
  auslesen); die Fremdmodul-Anteile entfallen.

### 3.2 Eagle Library (Kompendien-Sammlung, Suche)

**Geplante Funktionen:**
- Einzige Quelle der Wahrheit für die Eagle Module; für jede Art von Kompendium ein eigenes Eagle Kompendium
  (Eagle Actors, Eagle Classes, Eagle Items usw.), wo nötig **getrennt für 2014 und 2024**
- Eine Oberfläche mit **einer Registerkarte je Kompendium**
- Einzelne oder alle Nicht-Eagle-Kompendien lassen sich per Schaltfläche in die Library **kopieren**, jeweils in
  das richtige Kompendium (2014-Inhalt nach 2014, 2024-Inhalt nach 2024)
- **Abhängigkeiten werden automatisch mitkopiert** (was ein Eintrag verwendet, etwa die Merkmale einer Klasse, soweit
  das Ziel auffindbar ist; nicht auffindbare Ziele werden gemeldet)
- **Jeder Eintrag kommt pro Version nur einmal vor** (gleicher Name im selben Kompendium)
- Nicht übertragene Einträge werden protokolliert; der Spielleiter kann die Übertragung **erzwingen**
  (der Eintrag heißt dann "Name (Duplicate)", weitere "Name (Duplicate 2)" usw.; die Version wählt der
  Spielleiter)
- Einträge ohne gespeicherte Version kommen standardmäßig nach 2014; existiert der Name dort schon und in 2024 noch nicht, nach 2024
- **Jede Verlinkung** innerhalb kopierter Einträge (z. B. Klasse → Klassenmerkmale, Zauberlisten, Textlinks) wird auf
  die Kopien in der Library umgeschrieben, damit die Library wirklich die einzige Quelle bleibt
- **Herkunftsangaben** (aus welchem Kompendium ein Eintrag ursprünglich stammt) bleiben auf der Originalquelle; dadurch
  stimmt auch die Quellenangabe (Buch)
- **Unterarten** von Spezies werden über eine Markierung gruppiert, die die Library an den Einträgen pflegt (automatisch beim Kopieren, von Hand änderbar)
- **Suche** in der Library (nur nach Namen) und ein **Tastenkürzel** außerhalb der Library: Suchleiste mit
  Ergebnisliste, Treffer lassen sich per Drag & Drop z. B. auf ein Charakterblatt ziehen

**Stand der Prüfung:**
- **Kompendien anlegen und Einträge kopieren: machbar (Risiko niedrig bis mittel).** Foundry stellt die Werkzeuge
  bereit. Die Kompendien gehören zu **einer Welt**: Jede Welt hat ihre eigene Library. Angelegt und
  befüllt wird sie vom Spielleiter. Container (z. B. Rucksack mit Inhalt) müssen mit Inhalt kopiert werden.
- **2014/2024-Zuordnung:** Bei Gegenständen, Zaubern usw. sowie Monstern und Fahrzeugen trägt das DnD-System die Regelwerk-Version in den
  Daten. Für Charaktere, Gruppen, Journale und Tabellen gibt es in den Daten keine Version. Fallstrick: Fehlt die Angabe, liest das
  System dafür den Wert der Welteinstellung, nicht den tatsächlichen; die Library muss den gespeicherten Wert prüfen.
- **Suche, Tastenkürzel, Drag & Drop: machbar (Risiko niedrig).**
- **Verweise umschreiben: machbar, aber der aufwendigste Teil (Risiko mittel).** In den mitgelieferten Inhalten des Systems
  enthalten 37 % aller Dokumente mindestens einen Verweis auf ein anderes Kompendium (rund 26.000 Verweise in Feldern und Texten). Fast alle folgen wenigen Mustern und lassen
  sich mit einer Zuordnung "Original → Library-Kopie" in zwei Durchgängen umschreiben. Sonderfälle: Verweise auf
  Premium-Module des Herstellers, die nicht installiert sein müssen, und Zauberlisten (die Liste der Library ergänzt die des Systems
  und ersetzt sie nicht). Nach dem Kopieren prüft ein Bericht, welche Verweise nicht in der Library enden.
- **Automatisches Mitkopieren von Abhängigkeiten:** Der Bestand kann dadurch stark wachsen (Actors verweisen auf Zauber, Ausrüstung und Klassen).
- **Herkunft auf der Quelle:** Das System leitet die Quellenangabe (Buch) aus der Herkunft ab; sie bleibt so richtig. Gewährte Klassenmerkmale bekommen ihre
  Herkunft vom System neu aus den umgeschriebenen Verweisen. Ein Randfall betrifft von Hand auf einen Charakter gezogene Einträge: Ihre ältere Herkunftsmarke zeigt auf die Originalquelle; Eagle Character Edit setzt sie beim Hinzufügen auf die Library-Kopie.
- Nicht geprüft (nur im laufenden Foundry testbar): Laufzeit beim Kopieren sehr großer Bestände.

### 3.3 Eagle Character Edit (Charaktereditor)

**Geplante Funktionen:**
- Einfacher Editor zum Erstellen von Spielercharakteren; der Editor arbeitet über Eagle Flight Control **live am echten
  Charakterblatt**
- **Start aus dem Hub** (nur für einen neuen Charakter: Schaltfläche "Create Player Character" mit Namensfeld) und **Start aus
  dem Charakterblatt** (bestehender Charakter wird eingelesen)
- Registerkarten: **Attributes** (Punktekauf, Standardwerte oder freie Eingabe; Basis, Bonus, Basis + Bonus), **Class** (Klasse,
  Stufe, Klassenmerkmale, Unterklasse), **Species** (Spezies, Unterart, Merkmale), **Background**, **Spells** (nach Stufe sortiert, nur
  tatsächlich wählbare Zauber, verfügbar gegen gewählt), **Equipment** (Ausrüstung und Gold)
- **Besitzer** eines neuen Charakters ist der Ersteller (ein Spieler, wenn er ihn anlegt, der Spielleiter, wenn er ihn anlegt). Wird der Editor mitten in der Erstellung
  geschlossen, **bleibt der unfertige Charakter bestehen** und lässt sich über sein Charakterblatt wieder im Editor öffnen und weiterbearbeiten

**Stand der Prüfung:** **Machbar (Risiko mittel).** Der Start aus dem Charakterblatt und aus dem Hub ist unkritisch.
- Das DnD-System bringt ein eigenes, öffentliches Fortschrittssystem mit (Klassenmerkmale, Wahlen bei Stufenaufstieg). Der Editor nutzt es als
  Motor und stellt die Oberfläche davor. Dieses System arbeitet auf einer Arbeitskopie und schreibt am Ende eines Vorgangs auf den Charakter:
  "live" heißt hier nach jedem abgeschlossenen Vorgang (Klasse gewählt, Stufe erhöht), nicht nach jedem Klick.
- Punktekauf und Standardwerte gibt es im System nicht; der Editor bringt die Regeltabellen selbst mit. Der Bonus (aus Spezies und Hintergrund) lässt
  sich aus den gespeicherten Zuweisungen ableiten; beim Speichern eines Basiswerts muss der Bonus erhalten bleiben.
- **Lücken, die das System nicht schließt:** Unterarten sind im DnD-System eigene, gleichrangige Einträge ohne Verknüpfung zur Art; die Zuordnung übernimmt
  die Markierung der Library (sie entsteht automatisch beim Kopieren und lässt sich von Hand setzen oder entfernen). Die Ausgangsausrüstung liegt als Daten vor, wird vom System aber nicht auf Charaktere angewendet (der Editor muss Auswahl
  und Gold selbst umsetzen). Zauberanzahlen sind für viele Klassen aus den Daten ablesbar; Regeln, die nur im Fließtext stehen (z. B. das Zauberbuch
  des Magiers), sind es nicht.
- Damit Zauber nicht doppelt erscheinen, muss der Editor die Zauberlisten auf die Einträge der Library einschränken.

### 3.4 Eagle Homebrew (Homebrew-Editor)

**Geplante Funktionen:**
- Öffnen aus dem Hub für ein neues Objekt: erst die **Art** (Actor, Item, Roll Table), dann die **Unterkategorie** (Actors: NPC, Encounter, Group, Vehicle;
  Items: Class, Subclass, Spell, Feature, Background, Facility, Tool, Weapon, Container, Equipment, Loot, Consumable, Species). "Item" ist die
  Foundry-Hauptgruppe, kein Untertyp; Spielercharaktere erledigt Eagle Character Edit
- Das Objekt wird **sofort angelegt**, und zwar **gleichzeitig als normales Dokument in der Welt und als Eintrag in der Eagle Library**; Eagle Flight Control
  bearbeitet es live im Hintergrund. **Die Library ist die Quelle:** Das Welt-Dokument wird daraus aktualisiert
- Die **Regelwerk-Version** (2014/2024) des neuen Objekts kommt aus der Welteinstellung `rulesVersion`
- Existiert der Name in der Library schon (gleiche Version), heißt das neue Objekt "Name (Duplicate)"
- **"Edit with Eagle Homebrew"** für bestehende Objekte (im Kopfbereich des Blatts und im Kontextmenü der Verzeichnisse); alles Relevante wird in den Editor
  übertragen. Hat das Objekt noch keinen Library-Eintrag, wird er angelegt
- Der Import von Freitext ist **zurückgestellt**

**Stand der Prüfung:** **Machbar (Risiko mittel), Aufwand je nach Objektart sehr verschieden.**
- Einfach: Loot, Werkzeug, Waffe, Ausrüstung, Verbrauchsgegenstand, Behälter. Mittel: Feature, Zauber, Spezies, Hintergrund, Zufallstabelle. Hoch: Klasse,
  Unterklasse, Facility und NPC. Sonderfälle: Encounter, Gruppe und Fahrzeug (bestehen aus Verweisen auf Actors). Zusammen 18 Objektarten.
- **Beispiel "magisches Langschwert, +2W6 Feuer nur gegen Untote":** Zusatzschaden, Schadensart, "magisch" und "bei Treffer" sind im DnD-System als reine Daten
  abbildbar. Nur die Bedingung "nur gegen Untote" fehlt im System (ein offener Verbesserungswunsch der Systementwickler). Eine Lösung ohne Fremdmodul ist möglich: **Stufe 1** legt eine zweite,
  rein systemeigene Schadensaktion an ("Zusatzschaden gegen Untote"), die manuell ausgelöst wird, und speichert die Bedingung zusätzlich als Daten
  in dem Format, das das System selbst mitbringt. Das Item funktioniert damit auch ohne Eagle Module. **Stufe 2** (später, bei Eagle Roll Out) prüft die Bedingung
  automatisch je Ziel.
- **Welt und Library zugleich:** Foundry gleicht Welt-Dokument und Library-Eintrag nicht selbst ab; der Abgleich (Library → Welt) muss vom Modul kommen. Verweise
  innerhalb des Objekts müssen dieselbe Umschreibung erfahren wie beim Kopieren (Welt → Library).
- Das Bearbeiten bestehender Objekte darf nichts zerstören: Alles, was der Editor nicht kennt (fremde Einstellungen, Effekte), muss beim Speichern unverändert erhalten bleiben.
- Homebrew braucht Eagle Library und Eagle Flight Control (Kette: Flight Control ← Library ← Homebrew).

### 3.5 Eagle Journal (Journal- und Notizen-Upgrade)

**Geplante Funktionen:**
- Erreichbar über den Hub **und** überall dort, wo Foundry Journal-Einträge öffnet oder erstellt: **jeder Journal-Einstieg bekommt einen Eagle-Journal-Einstieg**
  ("Open in Eagle Journal", "Create Eagle Journal Note"; eine "Note" ist ein neuer Journal-Eintrag im Eagle-Journal-Bereich)
- Besser: Eagle Journal **ersetzt** die normalen Einstiege, damit nicht versehentlich ein normaler Journal-Eintrag entsteht
- **Alle neu angelegten Journal-Einträge werden automatisch in den Vault eingeordnet**, auch Einträge außerhalb davon beim Öffnen
- Sonst wie in der ursprünglichen Idee: Obsidian-artige Darstellung, jeder Nutzer bekommt einen eigenen Ordner mit einem "Vault" nach dem Namen der Welt (der Spielleiter sieht alle,
  ein Spieler nur den eigenen), Vault-Aufbau als Seitenleiste, eigene Tags, Verknüpfung per Rechtsklick

**Stand der Prüfung:** **Machbar (Risiko niedrig bis mittel).**
- Journal-Blatt und Journal-Verzeichnis sind in Foundry v13 moderne Fenster, an denen sich Schaltflächen und Kontextmenü-Einträge einhängen lassen. Die genauen Namen der
  Einhängepunkte sind gegen das laufende Foundry zu bestätigen (der Foundry-Quelltext liegt für die Prüfung nicht lokal vor).
- **Ersetzen der normalen Einstiege (geprüft):** Öffnen: Eagle Journal kann als Standardblatt für Journal-Einträge eingetragen werden, oder gezielt je Eintrag
  (mit libWrapper). Das Standardblatt lässt sich je Welt und Nutzer umstellen. Wichtig: Das DnD-System bringt eigene Journal-Seiten (Klassen, Regeln, Zauberlisten,
  Karten) mit; ein ersetzendes Blatt muss diese darstellen können, sonst gilt es nur für Einträge im Vault. Erstellen: Der Erstell-Dialog lässt sich mit libWrapper umleiten, Schaltflächen und
  Kontextmenü im Verzeichnis über Hooks. Für jeden Erstellweg, auch durch Programme oder andere Module, greift zusätzlich ein Einhängepunkt vor dem Anlegen, der den Eintrag
  einordnet und kennzeichnet; ein Verbot auf Programmebene ist nicht sinnvoll. Risiken: Massenimporte (Abenteuer, Importer) würden ihre Ordnerstruktur verlieren,
  Systeminhalte dürfen nicht ersetzt werden. Entschieden: Importe behalten ihre Ordnerstruktur in einem Unterordner des Vaults; Compendium- und Systeminhalte (Regeln, Klassenseiten) werden nicht ersetzt.
- Verknüpfungen (Backlinks) nutzen den eingebauten Verlinkungsmechanismus von Foundry; Tags lassen sich über den dafür vorgesehenen Erweiterungsmechanismus ergänzen. Ordner haben in Foundry
  keine eigenen Rechte; der private Bereich wird über die Rechte der einzelnen Einträge umgesetzt.
- **Rechte:** Normale Spieler dürfen in Foundry standardmäßig keine Journal-Einträge anlegen. Für den Spieler-Bereich braucht es die Weiterleitung an den Spielleiter oder eine
  Rechtefreigabe (später in den Moduleinstellungen).
- Restrisiko: Das Rechtsklick-Menü "Link to…" im Texteditor wurde nicht im Detail geprüft.

### 3.6 Eagle Ruling (Regeln nachschlagen und anpassen)

**Geplante Funktionen:** Alle Regeln des laufenden DnD-5e-Systems automatisch erfassen und verständlich darstellen (als Text und als Klartext-Mechanik), jede Regel anpassbar,
neue Regeln hinzufügbar. Es ist **unabhängig vom Modul "Custom D&D 5e"** und baut nicht darauf auf. Beide gleichzeitig zu aktivieren ist technisch möglich, aber nicht das Ziel von Eagle Ruling.

**Stand der Prüfung (nach Auswertung des Moduls "Custom D&D 5e" und weiterer Module):** **Deutlich einfacher als zunächst gedacht, weil ein großer Teil keine tiefen Eingriffe braucht.**
- **Regeln nachschlagen:** machbar (Risiko niedrig). Das System liefert selbst ein Verzeichnis mit **170** Regelbegriffen samt Verweis auf die Regelseiten.
- **Regeln als Einstellung:** machbar (Risiko niedrig). Das System hat **45 Einstellungen**, davon rund 25 mit Regelbezug (kritische Treffer, Initiative, Tragkraft,
  Ruhephasen, Stufenaufstieg, Konzentration, Sichtbarkeiten, Automatik). Der Hub zeigt und ändert sie bereits.
- **Regeländerung:** in drei Teile aufgeteilt. **(a) Konfigurationswerte** des Systems (134 Bereiche, z. B. Fertigkeiten, Schadensarten, Zustände, Tragkraft-Werte): machbar (niedrig bis mittel), die
  Änderungen sind flüchtig und rückgängig machbar. **(b) Änderungen über die offiziellen Einhängepunkte der Würfel- und Aktivierungsabläufe:** machbar (mittel). **(c) Überschreiben von Programmteilen des Systems:**
  hohes Risiko; mit dem freigegebenen Hilfsmodul libWrapper sauber machbar, ohne wäre es fragil. Neue Regeln sind nur aus einer festen Liste von Auslösern und Aktionen baubar.
- **Zusammenspiel mit Custom D&D 5e:** Wichtig ist eine Korrektur: Custom D&D 5e läuft in den Versionen bis 4.1.2 auf Foundry 13 mit DnD 5e 5.x, also auf dem Zielstand. Beide Module verändern teils dieselben Bereiche.
  Beide gleichzeitig zu aktivieren ist möglich, **Eagle Ruling ist dafür aber nicht gedacht** (Klarstellung des Projektleiters): Ein reibungsloses Zusammenspiel ist kein Ziel und wird nicht zugesagt. Wer beide aktiviert, muss mit Überschneidungen rechnen.
  Ob und wann das im laufenden Foundry getestet wird, entscheidet der Projektleiter im Einzelfall.

### 3.7 Eagle Roll Out (Automatisierung, später)

**Geplante Funktionen:** Bündelt langfristig Funktionen bekannter Automatisierungsmodule in einem mit den anderen Eagle Modulen abgestimmten Modul. Bleibt **zu einem späteren Zeitpunkt**; hier liegt nur ein **Vorab-Plan**, wie viel Automation sich in das Modul packen lässt.
**Ziel ist die höchstmögliche Automationsstufe; nichts bleibt dauerhaft ausgeschlossen.** Wie viel Automation der Spielleiter möchte, stellt er später in den Einstellungen von Roll Out ein.

**Stand des Vorab-Plans:**
- Von 15 Automationsbereichen lassen sich **12** als Eigenbau mit den offiziellen Einhängepunkten des Systems planen (Ablauf Angriff → Ziel → Rettungswurf → Schaden, Schaden und Effekte auf Ziele
  anwenden, Rettungswürfe anfordern, Würfelmodifikatoren aus Effekten, Zustände nach Regelwerk-Version, bedingte Zusatzeffekte, Konzentration, Effektdauer und Schaden über Zeit, Auren, Token-Effekte, Schnellwurf-Oberfläche, Reichweite und Deckung).
  **Reaktionen, eine Makro-Ebene und eine Rückgängig-Historie** sind die aufwendigsten Bereiche und kommen als späte Stufen dazu.
- Vieles bringt das DnD-System schon mit (Konzentration, Schadensberechnung je Ziel mit Resistenzen, Anfrage-Nachrichten für Zielwürfe, Aufladung, Beschwörung). Es fehlen: automatisches Anwenden von Schaden ohne Klick,
  Auren, Effekte auf Token-Licht, Schaden über Zeit.
- **Gewählter Weg:** Eigenbau mit den Einhängepunkten des Systems, für tiefe Bereiche mit libWrapper. Auf Midi-QOL aufzubauen hätte drei Fremdmodule als Abhängigkeit
  und die Bindung an einen fremden Autor bedeutet; einige der bekannten Automationsmodule sind für die Systemversion des Ziels nicht als geprüft ausgewiesen.
- Ausbau in Stufen: Voraussetzungen (Flight Control, Bedingungsdaten aus Homebrew, Ruling) → kleine Bausteine (Token-Effekte, Schnellwurf, Konzentration) → Modifikatoren und Zustände → bedingte Zusatzeffekte → Kernablauf
  (Ziele, Anwenden, Rettungswürfe) → Auren und Effektdauer → später Reaktionen, Makro-Ebene und Rückgängig-Historie. Jeder Bereich hat genau einen Besitzer und einen Ein/Aus-Schalter; Ruling besitzt die Definition der Regeln, Roll Out deren Ausführung.

---

## 4. Die durchgängige Frage: "Komplexe Technik in einfache Auswahl übersetzen" (und zurück)

Ein wiederkehrendes Thema: Ein Nutzer trifft eine einfache, verständliche Auswahl (z. B. "Feuerschaden, 2 Würfel, nur gegen Untote"), und Eagle Flight Control erzeugt daraus die technisch korrekte
Foundry-Struktur. Umgekehrt soll bestehender Inhalt in die Editoren übertragen und lesbar dargestellt werden.

| Richtung | Stand |
|---|---|
| **Auswahl → Foundry-Daten** | machbar. Das DnD-System hat ein bewusst breites, datenbasiertes Baukastensystem für Mechaniken. Die Bedingung "nur gegen Typ X" wird ohne Fremdmodul gelöst (Abschnitt 3.4, zwei Stufen) |
| **Bestehende Daten → Editor** (Charakter bearbeiten, "Edit with") | machbar. Wichtigste Regel: Alles, was der Editor nicht abbildet, muss beim Speichern unverändert erhalten bleiben |
| **Daten → lesbare Zusammenfassung** | teilweise sofort machbar: Das System liefert selbst beschriftete Bausteine (Aktivierung, Angriff, Schaden), sie folgen der Spielsprache. Ein ganzer Satz wie "Zusätzlich 2W6 Feuerschaden gegen Untote" ist nur für bekannte Strukturen über Vorlagen erzeugbar, sonst bleibt eine Feldliste. Der Klartext ist Englisch |

Betroffen sind die Module unterschiedlich stark: Homebrew (zentral), Character Edit (sehr stark), Ruling (Rückrichtung: eine bestehende Regel wird angepasst), Journal (schwach, einfache Zuordnung),
Library (kaum, es geht um Duplikate und Verweise).

---

## 5. Wie die Module voneinander abhängen

```
Eagle Flight Control (Kernmodul: Hub, Anfragen, alle Änderungen an Foundry-Daten)
  │
  ├─→ Eagle Library ──┬─→ Eagle Character Edit
  │                   └─→ Eagle Homebrew
  │
  ├─→ Eagle Journal            [unabhängig von Library, Character Edit, Homebrew]
  │
  ├─→ Eagle Ruling             [unabhängig von Library, Character Edit, Homebrew]
  │
  └─→ Eagle Roll Out   ← braucht Flight Control, Ruling und das Bedingungsformat aus Homebrew (später)
```

Die Kette zeigt: Weil alle Änderungen über Eagle Flight Control laufen, steht es **vor** allen anderen, auch vor der Library. Eagle Journal und Eagle Ruling hängen nur von Eagle Flight Control ab.

---

## 6. Risiko- und Machbarkeitsüberblick

| Modul | Machbarkeit | Risiko | Größter offener Punkt |
|---|---|---|---|
| Eagle Flight Control | machbar | mittel | stabile Schnittstelle zwischen sieben getrennt veröffentlichten Modulen; Ladeverhalten nur live prüfbar |
| Eagle Library | machbar | mittel | Verweise in allen Einträgen umschreiben, Menge beim Kopieren |
| Eagle Character Edit | machbar | mittel | Lücken des Systems (Unterarten, Ausgangsausrüstung, Zauberregeln im Fließtext) |
| Eagle Homebrew | machbar | mittel | Umfang der Editoren (18 Objektarten), Abgleich Welt ↔ Library |
| Eagle Journal | machbar | niedrig | genaue Einhängepunkte, Rechte für Spieler |
| Eagle Ruling | teils einfach, teils schwer | niedrig bis hoch je Ebene | tiefe Programmeingriffe (mit libWrapper machbar); Überschneidungen mit Custom D&D 5e bei gleichzeitigem Betrieb nicht ausgeschlossen |
| Eagle Roll Out | Vorab-Plan liegt vor, Weg entschieden (Eigenbau mit libWrapper) | hoch (größtes Modul) | Umfang; späte Stufen (Reaktionen, Makro-Ebene, Rückgängig) sehr aufwendig |
| Oberfläche im Foundry-Stil | machbar | niedrig bis mittel | Drift zwischen sieben Repos ohne geteilte Bausteine |

---

## 7. Empfohlene Reihenfolge für eine künftige Umsetzung

1. **Eagle Flight Control zuerst:** Hub mit Registerkarten, Anfrage-Schnittstelle und Weiterleitung an den Spielleiter, Versionsprüfung des DnD-Systems. Das vorhandene Grundgerüst ist der Start.
2. **Eagle Library** (Kopieren mit Umschreiben der Verweise, Einmaligkeit, Suche, Tastenkürzel): schafft die Grundlage für Character Edit und Homebrew.
3. **Eagle Journal und Eagle Ruling (Nachschlagen, Einstellungen, Konfigurationswerte) parallel dazu:** beide hängen nur von Flight Control ab.
4. **Eagle Character Edit** nach der Library.
5. **Eagle Homebrew** nach der Library, zuerst die einfachen Objektarten und Stufe 1 der bedingten Effekte, dann die mittleren und hohen.
6. **Eagle Ruling, Regeländerungen über Einhängepunkte und neue Regeln;** Programmüberschreibungen (mit libWrapper) zuletzt.
7. **Eagle Roll Out** erst, wenn alle anderen zuverlässig laufen (Stufen wie in 3.7).

Eine Umsetzungsphase benötigt einen eigenen Plan und die ausdrückliche Freigabe des Projektleiters; jedes weitere Repository (eines je Modul) braucht ebenfalls eine Freigabe.

---

## 8. Entscheidungen und offene Fragen

### 8.1 Bereits entschieden (Auswahl)

Nur Foundry v13; keine Lizenz; Eagle Flight Control ohne Fremdmodule; libWrapper als einzige Fremdmodul-Abhängigkeit freigegeben; Verträglichkeit mit Fremdmodulen bleibt Ziel; alle Änderungen über Eagle Flight Control;
Library: keine Ausnahme für Klassen/Spezies/Unterklassen, "gleicher Name im selben Kompendium und derselben Version", Protokoll und Erzwingen, Duplikate als "Name (Duplicate)", Abhängigkeiten werden mitkopiert,
Herkunftsangaben bleiben auf der Quelle, Unterarten über eine Markierung der Library; Homebrew: sofort angelegt (Welt und Library, Library ist Quelle), Regelwerk-Version aus der Welteinstellung, Freitext-Import zurückgestellt;
Character Edit: Level im Class-Tab, Besitzer ist der Ersteller, unfertige Charaktere bleiben fortsetzbar; Journal: alle Einstiege bekommen einen Eagle-Journal-Einstieg und werden möglichst ersetzt, alle neuen Einträge werden eingeordnet;
Oberfläche: nur Foundry-Bausteine plus Leitfaden; Roll Out: Eigenbau (mit libWrapper für tiefe Bereiche), nichts dauerhaft ausgeschlossen, Automationsgrad einstellbar; inaktive Module im Hub ausgeblendet; Klartext Englisch;
bedingte Effekte in zwei Stufen; alle Verlinkungen werden umgeschrieben; Suche nur nach Namen mit einem Tastenkürzel. Die vollständige Liste mit Wortlaut steht in `dadm/reference/eagle-modules-aufbau.md`.

### 8.2 Offene Fragen

**Keine.** Die Rückfragen zur Herkunftsmarke, zur Entstehung des Unterarten-Markers und zu Massenimporten im Journal sind beantwortet und eingearbeitet, die Auslegungen bestätigt.

### 8.3 Nur im laufenden Foundry prüfbar (der Projektleiter gibt Tests einzeln und nach Bedarf frei)

Ladereihenfolge und Verhalten bei deaktiviertem Flight Control; Laufzeit beim Kopieren großer Bestände; Verhalten des Fortschrittssystems als Fenster über dem Editor; Nebenwirkungen häufiger Speichervorgänge auf andere Module; Namen der Einhängepunkte in den Verzeichnissen;
Verhalten bei Fenster-Modulen; Überschneidungen mit Custom D&D 5e bei gleichzeitigem Betrieb (kein Ziel von Eagle Ruling).

### 8.4 Nicht weiterverfolgte Ideen

- Automatische Übersetzung fehlender Sprachdateien fremder Module (eigenständig, nicht Teil dieser Module)
- Eagle Flight Control als öffentliche Schnittstelle für fremde Entwickler (hat sich durch die Entscheidung "nur Eagle Module angebunden" erledigt)

---

## Weiterführende Dokumente

- Technischer Projektplan mit Belegen je Modul: `dadm/eagle-modules-projektplan.md`
- Ergebnisdokument der Planungsrunde (Vergleich Vision ↔ neue Spezifikation, Ergebnisse je Milestone, Fragen und Antworten): `dadm/archive/planning-phase-3/spezifikationsabgleich.md`
- Neue Spezifikation im Wortlaut samt Antworten des Projektleiters: `dadm/reference/eagle-modules-aufbau.md`
- Ursprüngliche Vision (Entwicklungsnamen): `dadm/reference/eagle-modules-vision.md`
- Analyse zehn bestehender Foundry-Module: `dadm/reference/source-analysis/README.md`

# Eagle Modules — Projektplan

*Easy VTT for Complex Ideas*

Dieses Dokument beschreibt die Vision der "Eagle Modules" für Foundry
Virtual Tabletop, ihren geplanten Aufbau und den aktuellen Stand einer
Machbarkeitsprüfung, die für jedes Modul einzeln durchgeführt wurde. Es
richtet sich an Leser ohne Vorwissen zum Projekt.

Technischer Hintergrund für den Kontext: Dieses Dokument entstand im Rahmen
einer separaten, vorgelagerten Forschungsphase am Modul "EagleEye" für
Foundry VTT, in der bereits ein erstes lauffähiges Grundgerüst gebaut und auf
Foundry v13 und v14 getestet wurde (Details siehe `dadm/archive/` im
Projektrepository). Die hier beschriebene größere Vision der "Eagle Modules"
baut konzeptionell darauf auf, ist aber inhaltlich eigenständig zu lesen.

---

## 1. Die Idee dahinter

Foundry Virtual Tabletop gilt als eines der mächtigsten und flexibelsten
digitalen Tools zum Spielen von Pen-&-Paper-Rollenspielen. Seine große
Stärke — eine schlanke Core-Struktur, auf der praktisch jedes Regelsystem
und beliebige Erweiterungs-Module ("Module") aufbauen können — ist zugleich
seine größte Hürde für Einsteiger:

- Im Forge-VTT-Bazaar (einem verbreiteten Hosting-Anbieter für Foundry)
  existieren mehrere tausend Module. Viele überschneiden sich funktional,
  manche sind zueinander inkompatibel, andere veralten und funktionieren
  nach einem Foundry-Update plötzlich nicht mehr.
- Wer sich seinen Spieltisch individuell einrichten möchte, muss sich
  zwangsläufig tief in technische Details einarbeiten — Modul-Kombinationen
  ausprobieren, Kompatibilitätsprobleme selbst diagnostizieren, Einstellungen
  über viele verschiedene Menüs verteilt pflegen.
- Selbst technisch versierte Spielleiter verbringen dadurch oft mehr Zeit
  mit der Konfiguration von Foundry als mit dem eigentlichen Spiel.

Die Eagle Modules sind der Versuch, diese Einstiegshürde zu senken: ein
Ökosystem eigener, aufeinander abgestimmter Module, die zentral gesteuert
werden und dem Spielleiter komplexe Foundry-/Regelsystem-Interna abnehmen.

---

## 2. Der Aufbau: Ein Kernmodul, sechs Satelliten

Die Eagle Modules bestehen aus einem zentralen Kernmodul und sechs weiteren
Modulen, die jeweils einen konkreten Anwendungsfall abdecken:

| Modul | Rolle |
|---|---|
| **Eagle Eye** | Kernmodul — Schnittstelle zu Foundry und dem Regelsystem, für alle anderen Module |
| **Eagle Eyrie** | Bündelt und dedupliziert Inhalte aus verschiedenen Kompendien in einer eigenen, durchsuchbaren "Eagle Library" |
| **Eagle Egg** | Geführte, schrittweise Charaktererstellung |
| **Eagle Beak** | Erstellung und Import von Homebrew-Inhalten (Waffen, Zauber, Monster etc.) |
| **Eagle Talon** | Obsidian-artige, verknüpfbare Notizen-/Journal-Verwaltung |
| **Eagle Prey** | Nachschlagewerk und Anpassungsmöglichkeit für Spielregeln |
| **Eagle Wings** | Bündelung von Automatisierungs-/Komfortfunktionen (langfristig, aktuell zurückgestellt) |

**Wichtiges Architekturprinzip:** Nur Eagle Eye kommuniziert direkt mit
Foundry und dem Regelsystem. Alle anderen Module laufen über Eagle Eye als
zentrale Vermittlungsschicht — sie haben selbst nur die minimal nötige
Foundry-Anbindung für ihre eigene Oberfläche. Das soll verhindern, dass sich
sieben unabhängig voneinander agierende Module gegenseitig ins Gehege
kommen.

Alle Module sind primär auf das Regelsystem **DnD 5e** ausgerichtet — das
ist der konkrete, praktische Antrieb des Projekts. Die zugrundeliegende
Idee (Kompatibilitätserkennung, zentrale Einstellungen) ist zwar
system-unabhängig gedacht, aber die Umsetzung priorisiert DnD 5e klar vor
einer Unterstützung anderer Systeme.

---

## 3. Die Module im Detail

Für jedes Modul gilt: zuerst die ursprüngliche Idee/das gelöste Problem,
danach der aktuelle Stand der Machbarkeitsprüfung.

### 3.1 Eagle Eye (Kernmodul)

**Idee:** Das Modul, von dem Endnutzer am wenigsten direkt mitbekommen, das
aber die gesamte technische Arbeit im Hintergrund erledigt. Es soll:
- als Schnittstelle zwischen Foundry, dem DnD-System, eigenen und (wo
  möglich) fremden Modulen dienen,
- erkennen, wenn Module nicht miteinander kompatibel sind — und warum,
- als zentraler Hub dienen, über den Einstellungen mehrerer Module gebündelt
  geändert werden können, inklusive Warnung, wenn eine Änderung
  Auswirkungen auf ein anderes Modul hat, und der Möglichkeit, abhängige
  Module zu (de)aktivieren,
- als eine Art Datenbank mit Zugriff auf Funktionen von Foundry, dem
  Regelsystem und anderen Modulen dienen,
- komplexe technische Vorgänge so "übersetzen", dass ein Spielleiter sie
  über einfache Auswahlmöglichkeiten auslösen kann, ohne selbst Foundrys
  interne Logik verstehen zu müssen (siehe Abschnitt 4).

**Aktueller Stand:**
- Kompatibilitätserkennung (inkl. Begründung) ist **belegt machbar** —
  Foundry berechnet das für jedes installierte Modul bereits selbst intern,
  Eagle Eye müsste diese Information nur zentral auslesen und anzeigen.
- Der zentrale Einstellungs-Hub ist **belegt machbar** und wurde bereits
  gegen 94 reale, in einer produktiven Welt installierte Module erfolgreich
  getestet — inklusive Lesen und Schreiben von Einstellungen, die
  eigentlich zu einem fremden Modul gehören.
- Warnen bei Auswirkungen auf andere Module: **teilweise machbar.** Wenn ein
  Modul bereits selbst erklärt hat, von einem anderen abhängig zu sein
  (was in Foundry über Modul-Manifeste üblich ist), kann Eagle Eye das
  auswerten und warnen. Eine generische Erkennung *unbekannter*
  Wechselwirkungen zwischen Modulen ist dagegen technisch nicht belastbar
  lösbar — es gibt in Foundry keinen Mechanismus dafür.
- Module aktiv/inaktiv schalten: **nur eingeschränkt machbar.** Das ist in
  Foundry ausschließlich über eine eigene Oberfläche möglich und erfordert
  in jedem Fall einen Neustart der Spielwelt. Ein anderes Modul kann diesen
  Schalter nicht "leise" im Hintergrund umlegen — Eagle Eye könnte hier
  höchstens eine komfortablere Bedienoberfläche für den bestehenden
  Foundry-eigenen Mechanismus bauen.
- Offen/nicht untersucht: ob Eagle Eye selbst zu einer aktiv nutzbaren
  Schnittstelle werden könnte, gegen die *andere* Entwickler ihre Module
  programmieren (bisher wurde nur die beobachtende/lesende Richtung
  geprüft).

### 3.2 Eagle Eyrie (Kompendien-Bündelung & Suche)

**Idee:** Durch Regelsystem, D&D-Beyond-Importer, Forge-eigene Kompendien
usw. entstehen viele Sammlungen ("Kompendien") mit teils identischen
Inhalten. Eine Suche über alle Kompendien zeigt dann dasselbe Monster oder
denselben Zauber achtfach an. Eagle Eyrie soll eigene, deduplizierte
Kompendien anlegen (die "Eagle Library"), durchsuchbar über eine Suchleiste
und per Tastenkürzel. Neue Einträge werden nur übernommen, wenn noch kein
gleichnamiger existiert — außer bei Klassen, Spezies, Subklassen und
Backgrounds, die immer übernommen werden. Nicht übertragene Einträge werden
protokolliert und können mit einem Klick nachträglich doch übernommen
werden.

**Aktueller Stand:** **Vollständig machbar**, mit den bereits offiziell von
Foundry bereitgestellten Werkzeugen (eigene Kompendien programmatisch
anlegen, ein leichtgewichtiges Namensregister je Kompendium für performante
Suche/Duplikatsprüfung ohne alle Inhalte laden zu müssen, sowie eine
eingebaute Funktion, um Einträge zwischen Kompendien zu kopieren). Keine der
Anforderungen erfordert eine technische Neuentwicklung — es handelt sich um
eine reine Kombination bestehender Bausteine.

### 3.3 Eagle Egg (Geführte Charaktererstellung)

**Idee:** Foundry selbst bietet keine geführte, schrittweise
Charaktererstellung wie z. B. D&D Beyond — man arbeitet direkt im rohen
Charakterbogen. Eagle Egg soll das nachholen: über mehrere Reiter
(Attributswerte, Klasse, Spezies, Hintergrund, Zauber, Ausrüstung) führt es
Schritt für Schritt durch die Erstellung, wobei sich die verfügbaren
Optionen je nach vorherigen Entscheidungen dynamisch anpassen (z. B. nur
Zauber, die mit der gewählten Klasse und Stufe tatsächlich wählbar sind).

**Aktueller Stand:** **Machbar, mit geringerem Risiko als ursprünglich
angenommen.** Das DnD-5e-Regelsystem für Foundry bringt bereits ein
eigenes, umfangreiches System für genau solche geführten Fortschritts-
Entscheidungen mit (u. a. für Attributswerte, Klassenmerkmale,
Zauberauswahl) und stellt es sogar öffentlich für andere Module bereit.
Statt eine eigene, möglicherweise damit kollidierende Logik zu bauen, sollte
Eagle Egg dieses bestehende System als "Motor" im Hintergrund verwenden und
lediglich eine eigene, freundlichere Bedienoberfläche davorschalten. Damit
verschiebt sich der Hauptaufwand von riskanter Coreentwicklung hin zu
Oberflächengestaltung.

### 3.4 Eagle Beak (Homebrew erstellen/importieren)

**Idee:** Eigene Inhalte ("Homebrew" — selbst ausgedachte Waffen, Zauber,
Monster usw.) in Foundry anzulegen, ist zeitaufwendig und erfordert
Kenntnis interner Foundry-Variablen. Bestehende Text-Importer, die
Homebrew-Beschreibungen automatisch einlesen sollen, funktionieren laut
Erfahrungsbericht selten zuverlässig. Eagle Beak soll zwei Wege anbieten:
eine geführte Erstellung über Auswahlfelder (analog zu Eagle Egg), und einen
Import-Modus, bei dem freier Text eingefügt und automatisch in Foundry-
Felder übersetzt wird — mit einem Korrektur-Editor für alles, was dabei
nicht richtig erkannt wurde.

**Aktueller Stand — zweigeteilt:**
- **Geführte Erstellung über Auswahlfelder: machbar.** Am konkreten
  Beispiel eines magischen Langschwerts mit zusätzlichem Feuerschaden gegen
  Untote geprüft: Das Regelsystem hat für "wie viel Schaden, welche Art"
  bereits ein passendes, rein datenbasiertes Eingabeformat, das ohne Code
  befüllt werden kann. Eine Einschränkung "nur gegen einen bestimmten
  Gegnertyp" fehlt dem Regelsystem selbst zwar (bestätigt durch einen
  offiziellen, offenen Verbesserungsvorschlag der Systementwickler), ist
  aber durch ein etabliertes Zusatzmodul der Community bereits gelöst
  gezeigt worden. Dieses Muster dürfte für die meisten typischen
  Homebrew-Wünsche funktionieren; nur grundlegend neuartige Mechaniken
  außerhalb der vom Regelsystem vorgesehenen Bausteine bräuchten
  tatsächlich eigenen Programmcode.
- **Freitext-Import: nur eingeschränkt zuverlässig, wie erwartet.** Ein
  bereits existierendes, vergleichbares Werkzeug der Community arbeitet mit
  Mustererkennung gegen bekannte, standardisierte Textvorlagen (etwa den
  offiziellen Aufbau eines Monster-Eintrags), nicht mit echtem
  Sprachverständnis. Bei Texten, die einer solchen Vorlage folgen, ist das
  brauchbar; bei völlig frei formulierter Prosa bleibt es unzuverlässig —
  das deckt sich mit der ursprünglich beschriebenen Erfahrung mit
  bestehenden Importern. Empfehlung: templatierte Eingabe aktiv fördern,
  bei freiem Text transparent kommunizieren, dass es sich um einen
  bestenfalls groben Entwurf handelt, der über den ohnehin geplanten
  Korrektur-Editor nachbearbeitet werden muss.

### 3.5 Eagle Talon (Journal-/Notizen-Upgrade)

**Idee:** Foundrys eingebautes Journal wird bei größerem Umfang schnell
unübersichtlich, und Verknüpfungen zwischen Einträgen zu erstellen,
erfordert technisches Vorwissen. Eagle Talon soll eine an die Notiz-App
Obsidian angelehnte Oberfläche bieten: jeder Nutzer (Spielleiter wie
Spieler) bekommt automatisch einen eigenen, privaten Bereich ("Vault"),
darin lassen sich Einträge mit eigenen Schlagworten ("Tags") versehen, nach
Tags durchsuchen, und per Rechtsklick direkt mit anderen Einträgen
verknüpfen.

**Aktueller Stand:** **Machbar, sogar einfacher als angenommen.** Foundry
hat für die Verknüpfung von Dokumenten (das Kernstück der
Backlink-Funktion) bereits einen eingebauten, überall im Programm genutzten
Mechanismus — Eagle Talon müsste dafür keine eigene Logik entwickeln. Tags
lassen sich über einen in Foundry für genau diesen Zweck vorgesehenen
Erweiterungsmechanismus ergänzen. Eine Besonderheit: Die "privaten
Ordner"-Idee lässt sich nicht als Eigenschaft des Ordners selbst umsetzen
(Ordner sind in Foundry reine Organisationselemente ohne eigene
Zugriffsrechte) — die private Sichtbarkeit muss stattdessen konsequent auf
jedem einzelnen Eintrag innerhalb des Ordners gesetzt werden. Funktional
kein Problem, aber ein wichtiges Detail für die spätere Umsetzung.

### 3.6 Eagle Prey (Regel-Nachschlagewerk & -Anpassung)

**Idee:** Eigene Regeln einzuführen oder bestehende DnD-5e-Regeln zu
verändern, ist in Foundry schwierig, ohne mit Automatisierungs-Modulen in
Konflikt zu geraten — und manche gewünschten Hausregeln lassen sich im
Standard-Regelwerk kaum abbilden. Eagle Prey soll alle Regeln des laufenden
Systems automatisch erfassen und verständlich darstellen (sowohl als Text
als auch als nachvollziehbare Formel, z. B. "kritischer Treffer = doppelter
Würfelwert plus Attributsbonus"), mit der Möglichkeit, jede Regel per Klick
anzupassen oder ganz neue hinzuzufügen.

**Aktueller Stand — ebenfalls zweigeteilt:**
- **Regeln als Text darstellen: vollständig automatisch machbar.** Das
  DnD-5e-Regelsystem für Foundry bringt selbst bereits ein strukturiertes,
  mitgeliefertes Nachschlagewerk mit über 60 Regelbegriffen mit, das direkt
  auf die passenden Textstellen des offiziellen Regelwerks verweist. Eagle
  Prey könnte dieses bereits vorhandene, vom Systementwickler selbst
  gepflegte Verzeichnis einfach auslesen — ohne selbst irgendetwas
  pflegen zu müssen, und automatisch passend zur jeweils installierten
  Version.
- **Regeln als anpassbare Formel/Wert: nur teilweise machbar.** Am Beispiel
  "kritischer Trefferschaden" geprüft: Diese eine konkrete Mechanik ist
  tatsächlich bereits als normale, änderbare Spieleinstellung im
  Regelsystem hinterlegt — dafür ließe sich sogar der bereits für Eagle Eye
  gebaute Einstellungs-Hub direkt wiederverwenden. Das ist aber kein
  generelles Muster: Die meisten anderen Spielmechaniken sind fest im
  Programmcode verankert, nicht als änderbare Einstellung zugänglich. Für
  diese bliebe nur der ursprünglich ohnehin schon in Betracht gezogene,
  aufwendigere Weg über tiefere technische Eingriffe.

### 3.7 Eagle Wings (Automatisierung & Quality of Life)

**Idee:** Automatisierungs- und Komfort-Module (z. B. für automatische
Schadensberechnung, Flächeneffekte, Zustands-Tracking) sind besonders
anfällig für Kompatibilitätsprobleme und fallen häufig nach Updates aus.
Eagle Wings soll langfristig die Funktionen mehrerer bekannter,
existierender Module dieser Art in einem einzigen, mit den anderen Eagle
Modulen abgestimmten Modul bündeln.

**Aktueller Stand:** Bewusst noch nicht untersucht — ausdrücklich als das
umfangreichste und risikoreichste Modul der Reihe eingestuft, an dem laut
eigener Priorisierung erst gearbeitet werden soll, wenn alle anderen Module
zuverlässig laufen. Empfehlung für eine spätere Prüfung: zunächst
untersuchen, ob die zu ersetzenden bestehenden Module bereits offene
Schnittstellen anbieten, die sich wiederverwenden lassen, statt von Grund
auf neu zu entwickeln.

---

## 4. Die durchgängige Frage: "Komplexe Technik in einfache Auswahl übersetzen"

Ein wiederkehrendes Thema über mehrere Module hinweg: Soll ein Nutzer eine
einfache, verständliche Auswahl treffen können (z. B. "Feuerschaden, 2
Würfel, nur gegen Untote"), aus der Eagle Eye automatisch die technisch
korrekte Foundry-Struktur im Hintergrund erzeugt? Diese Fähigkeit betrifft
nicht nur Eagle Beak (wofür sie ursprünglich gedacht war), sondern in
unterschiedlicher Ausprägung auch andere Module:

| Modul | Wie stark betroffen |
|---|---|
| Eagle Beak (geführte Erstellung) | zentral — genau dafür gedacht |
| Eagle Egg | sehr stark — jede Auswahl (Klasse, Stufe, Zauber) muss korrekt übersetzt werden |
| Eagle Prey | stark, aber umgekehrte Richtung: eine *bestehende* Regel wird angepasst statt eine *neue* Struktur erzeugt — braucht eine eigene Lösung |
| Eagle Talon | schwach — nur eine einfache 1:1-Übersetzung (Verknüpfung/Tag) |
| Eagle Eyrie | kaum relevant — hier geht es um Duplikaterkennung, nicht um neue Strukturen |

Die gute Nachricht: Für den zentralen Anwendungsfall (Eagle Beak/Eagle Egg)
ist diese Übersetzung machbar, weil das DnD-5e-System bereits ein
absichtlich breit angelegtes, datenbasiertes Baukastensystem für
Gegenstands- und Charaktermechaniken mitbringt. Eagle Eye müsste dieses
System korrekt befüllen, nicht neu erfinden.

---

## 5. Wie die Module voneinander abhängen

```
Eagle Eye (Kernmodul)
  │
  ├─→ Eagle Eyrie ──┬─→ Eagle Egg
  │                 └─→ Eagle Beak (geführte Erstellung)
  │                         └─→ Eagle Beak (Freitext-Import)
  │
  ├─→ Eagle Talon            [unabhängig von Eyrie/Egg/Beak]
  │
  ├─→ Eagle Prey             [unabhängig von Eyrie/Egg/Beak]
  │
  └─→ Eagle Wings   ← braucht alle anderen (bewusst zuletzt)
```

Wichtig für eine mögliche Umsetzungsreihenfolge: Eagle Talon und Eagle Prey
hängen nur vom Kernmodul ab und könnten daher **parallel** zu Eyrie/Egg/Beak
entwickelt werden, statt zwingend danach.

---

## 6. Risiko- und Machbarkeitsüberblick

| Modul | Machbarkeit | Größtes verbleibendes Risiko/offener Punkt |
|---|---|---|
| Eagle Eye (Kern) | überwiegend belegt | Eagle Eye als aktiv nutzbare Schnittstelle für fremde Entwickler noch ungeprüft |
| Eagle Eye (Auswirkungserkennung/Aktivierung) | teils machbar, teils nicht | generische Erkennung unbekannter Wechselwirkungen technisch nicht lösbar |
| Eagle Eyrie | **voll machbar** | keine offenen technischen Risiken |
| Eagle Egg | machbar, Risiko gesenkt | Aufwand verschiebt sich zu Oberflächengestaltung |
| Eagle Beak (geführt) | machbar | Abdeckung sehr ausgefallener Mechaniken begrenzt |
| Eagle Beak (Freitext) | eingeschränkt | strukturelle, erwartete Grenze von Textmustererkennung |
| Eagle Talon | **voll machbar** | Umsetzungsdetail bei privaten Bereichen (auf Eintrags-, nicht Ordnerebene) |
| Eagle Prey | teils machbar, teils nicht | unbekannt, wie viele Regeln tatsächlich als Einstellung zugänglich sind |
| Eagle Wings | nicht bewertet | bewusst zurückgestellt |

---

## 7. Empfohlene Reihenfolge für eine künftige Umsetzung

1. **Eagle Eyrie zuerst** — vollständig machbar, keine offenen Risiken,
   schafft die inhaltliche Grundlage ("Eagle Library") für Eagle Egg und
   Eagle Beak
2. **Eagle Talon und Eagle Prey parallel dazu** — beide unabhängig von
   Eyrie, mit niedrigem Risiko, liefern schnell sichtbare Ergebnisse
3. **Eagle Egg** — im Anschluss an Eyrie, Risiko bereits durch
   Wiederverwendung vorhandener Regelsystem-Funktionen gesenkt
4. **Eagle Beak, geführte Erstellung** — ebenfalls nach Eyrie, teilt
   technische Erkenntnisse mit Eagle Egg
5. **Eagle Beak, Freitext-Import** — erst danach, da der ohnehin nötige
   Korrektur-Editor dieselbe Infrastruktur nutzt
6. **Eagle Prey, tiefere Regel-Eingriffe** (für Regeln ohne einfache
   Einstellungsoption) — höchster Aufwand, kurz vor Eagle Wings
7. **Eagle Wings** — wie ursprünglich vorgesehen erst, wenn alle anderen
   Module zuverlässig laufen

---

## 8. Offene Punkte für eine künftige Vertiefung

- Ob Eagle Eye selbst zu einer öffentlich nutzbaren Schnittstelle für
  fremde Entwickler werden kann (bisher nur die beobachtende Richtung
  geprüft)
- Wie groß der Anteil der DnD-5e-Regeln tatsächlich ist, der bereits als
  einfache Einstellung zugänglich ist (nur ein Beispiel wurde geprüft)
- Eine im Regelsystem vorhandene, aber noch nicht im Detail geprüfte
  Funktion ("Enchantment"), die möglicherweise ein noch passenderer Weg für
  magische Gegenstands-Boni wäre als der bisher geprüfte Ansatz
- Eine eigenständige, hier nicht weiterverfolgte Idee: automatische
  Übersetzung fehlender Sprachdateien fremder Module (unabhängig von den
  oben beschriebenen Modulen)
- Eagle Wings insgesamt (bewusst zurückgestellt)

---

## Weiterführende Dokumente

Die vollständige, im Detail quellenbelegte Recherche zu jedem Modul liegt im
Projekt-Repository unter `dadm/` (Dateien `m1-*` bis `m10-*`), die
ursprüngliche, unveränderte Vision unter
`dadm/reference/eagle-modules-vision.md`.

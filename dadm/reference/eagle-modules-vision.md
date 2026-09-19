# The Eagle Modules — Easy VTT for Complex Ideas

> **Hinweis (2026-09-19):** Dieses Quelldokument nutzt die Entwicklungsnamen der Module. Die echten Modulnamen stehen in `eagle-modules-aufbau.md` (Abschnitt Namenszuordnung). Inhalt und Wortlaut dieses Dokuments sind unverändert.

retention: durable (Quelldokument dieser Planungsphase)
Quelle: vom Projektleiter als PDF bereitgestellt ("The Eagle Modules.pdf"),
hier als Markdown transkribiert für dauerhafte Projekt-Referenz. Ergänzt um
Klärungen aus dem Bootstrap-Gespräch (siehe Abschnitt "Klärungen" am Ende).

## Die Vision dahinter

FoundryVTT ist laut Projektleiter das mit Abstand beste VTT am Markt — solide
Core-Struktur, hohe Modularität. Die Praxis zeigt aber: je individueller man
seinen Tisch anpassen will, desto tiefer muss man in die Materie einsteigen.
Bei fast 9000 Modulen im Forge-Bazaar gibt es viel Redundanz, viele
Inkompatibilitäten, und häufig veralten/brechen Module nach Updates. Auch
technisch versierte Nutzer verbringen mehr Zeit mit Foundry-Konfiguration als
mit dem eigentlichen Spiel. Vision: ein Foundry-Ökosystem mit geringerer
Einstiegshürde und wenig Zeitaufwand für die Technik dahinter — daraus
entstand die Idee der Eagle Modules.

## Core Module: Eagle Eye

Das Modul, auf dem alle anderen aufbauen — von dem Nutzer am wenigsten direkt
mitbekommen. Soll DM und Spielern Arbeit abnehmen. Funktionen:

- Schnittstelle zwischen Foundry, DnD, eigenen und (wenn möglich) fremden
  Modulen
- Erkennen, wenn Module nicht miteinander kompatibel sind, und **warum**
- Hub für gebündelte Einstellungsänderungen; erkennen, wenn eine
  Einstellungsänderung Auswirkungen auf andere Module hat, DM informieren,
  und Dependencies zwischen Modulen aktivieren/deaktivieren können
- Dient als Datenbank mit Zugriff auf Funktionen von Foundry, DnD und anderen
  Modulen
- Soll komplexe API-Anwendungen/Funktionen "umwandeln" können, damit ein DM
  weniger vorbereiten muss (siehe Klärung unten — Beispiel: strukturierte
  Homebrew-Erstellung)

Ausdrücklich als vage benannt vom Projektleiter selbst — Umsetzbarkeit soll
sich erst zeigen.

## Eagle Eyrie — Source of Truth & Quick Search

**Problem:** Durch System, D&D-Beyond-Importer, Forge-Compendia etc. entstehen
viele Kompendien mit oft denselben Actors/Items — Suche über alle Kompendien
zeigt 8–10× dasselbe Objekt.

**Lösungsidee:** Eagle Eyrie erstellt (wenn aktiv, falls nicht vorhanden)
eigene Compendien, zusammengefasst in der "Eagle Library", durchsuchbar über
eine Searchbar im Library Browser sowie per Hotkey-Quicksearch ohne die
Library zu öffnen. Neue Compendien sind zunächst leer; im Browser können
alle oder einzelne Compendien zur Durchsuchung ausgewählt werden. Existiert
ein Eintrag mit gleichem Namen bereits in der Eagle Library, wird er
**nicht** automatisch übertragen — außer bei Klassen, Spezies, Subklassen und
Backgrounds (siehe Klärung unten: diese werden **immer** übertragen, keine
Dedup-Prüfung). Nicht übertragene Einträge werden geloggt, DM kann per Klick
die Übertragung nachträglich erzwingen. Alle mit Eagle Eye verbundenen Eagle
Module beziehen sich ausschließlich auf Einträge in der Eagle Library.

## Eagle Egg — Charakterbuilder/Editor

**Problem:** Foundry hat keine geführte Charaktererstellung (anders als z. B.
D&D Beyond) — alles läuft über das rohe Sheet.

**Lösungsidee:** Eagle Egg ermöglicht geführte Erstellung von Player
Characters direkt über deren Actor Sheet. Fragt über Eagle Eye die Eagle
Library ab und zeigt passende Optionen in mehreren Tabs. Änderungen am Sheet
werden von Eagle Eye gesteuert; Auswahlmöglichkeiten im Builder passen sich
dynamisch an bereits getroffene Wahlen an (Optionen kommen hinzu/fallen weg).

Tabs:
- **Attributes:** Point Buy, Standard Array oder manuelle Eingabe; Anzeige
  von Base-Wert, Bonus (aus späteren Feature-Wahlen) und Base+Bonus
- **Class:** Class, Classfeatures, Subclass, Subclassfeatures
- **Species:** Species, Subspecies, Speciesfeatures
- **Background:** Background, Backgroundfeatures
- **Spells:** nach Level sortiert, mit Anzeige verfügbarer vs. bereits
  gewählter Spells/Cantrips laut Regelwerk; nur mit aktueller Class/Level
  tatsächlich wählbare Spells werden angezeigt
- **Equipment:** Equipment und Gold

Während der Erstellung wird das echte Sheet von Eagle Eye live mitbearbeitet
(Hinzufügen/Abwählen wirkt sich sofort aus).

## Eagle Beak — Homebrew Object Creator/Importer/Editor

**Problem:** Homebrew-Erstellung in Foundry erfordert detaillierte
Foundry-Kenntnisse (welche Variable wohin). Bestehende Text-Importer sind
unzuverlässig (Features/Erkennung oft fehlerhaft).

**Lösungsidee:** Beim Öffnen Wahl zwischen "Import Homebrew" und "Create
Homebrew". Zunächst Art (Actor/Item/Roll Table), dann Unterkategorie:
- Actor: Player Character, Non Player Character, Encounter, Group, Vehicle
- Item: Class, Subclass, Item, Spell, Feature, Background, Facility, Tool,
  Weapon, Container, Equipment, Loot, Consumable, Species

Nach Bestätigung öffnet sich ein zu Eagle Egg analoger Editor mit den
passenden Optionen. "Create"-Button sendet alles an Eagle Eye, welches das
Homebrew-Objekt inkl. aller angegebenen Features erstellt und über Eagle
Eyrie zur Eagle Library hinzufügt. Fehler/nicht erkannte Angaben werden im
Editor hervorgehoben und können nachbearbeitet werden; "Create" wird danach
zu "Edit" (Objekt existiert bereits).

Bei "Import Homebrew": Freitext-Homebrew wird in ein Textfeld kopiert, per
Button geparsed und vorausgefüllt im Editor dargestellt — ab hier gleicher
Workflow wie "Create Homebrew" (Prüfen, Korrigieren, Bestätigen).

**Konkretes Beispiel für die Eagle-Eye-"API-Umwandlung" (Klärung während
Bootstrap):** Ein magisches Langschwert, das bei Treffer zusätzlich 2W6
Feuerschaden gegen Untote macht, soll durch einfache Auswahl entstehen —
"Longsword", "Magic", "Additional Damage: 2d6", "Damage Type: Fire",
"Damage Conditions: Hit, Undead" — diese Angaben gehen an Eagle Eye, welches
die Foundry-/dnd5e-Logik (Variablen, Active Effects, Activities) kennt und
daraus das korrekt aufgebaute Item erzeugt, ohne dass der DM sich mit
Foundry-internem Aufbau beschäftigen muss.

## Eagle Talon — Journal Upgrade

**Problem:** Foundrys Journal wird schnell unübersichtlich; Verknüpfungen
zwischen Einträgen erfordern tiefere Foundry-/Coding-Kenntnisse.

**Lösungsidee:** Eagle Talon bietet eine an Obsidian angelehnte
Journal-Darstellung. GM und jeder Spieler bekommen beim ersten Öffnen einen
eigenen Ordner (nach Login-Namen) in Journals; GM sieht alle, Spieler nur den
eigenen. Darin ein Ordner mit dem Namen der Foundry-Welt als "Vault". Neue
Journal-Einträge werden automatisch strukturiert abgelegt (z. B. Szenen ->
eigener Unterordner -> Eintrag). Der Vault-Aufbau erscheint als Sidebar
links. Eigene Tags können erstellt, Einträgen zugewiesen und durchsucht
werden. Verlinkung zwischen Einträgen: Text markieren, Rechtsklick ->
"Link to…" (mit Namens-/Tag-Suche) oder direkt "Link to [Name]", falls ein
gleichnamiger Eintrag existiert. Auch hier laufen alle direkten
Foundry-Änderungen über Eagle Eye; Eagle Talon bezieht seine Informationen
darüber.

## Eagle Prey — Homebrew Rules einfügen / Core Rules anpassen

**Problem:** Eigene Regeln zu implementieren oder DnD-System-Regeln zu
überschreiben ohne Konflikte mit Automation/QoL-Modulen ist schwer; manche
Mechaniken lassen sich im Original-Regelwerk kaum abbilden.

**Lösungsidee:** Eagle Eye erfasst alle Regeln des laufenden DnD-Systems und
stellt sie in Eagle Prey katalogisiert und vereinfacht dar (Combat Rules,
Attack Rules, Damage Rules, …) — sowohl schriftlich als auch als Klartext-
Mechanik (z. B. "Critical Damage = 2× Damage Dice + Attribut-Mod" statt
Foundry-interner Variablennamen). **Klärung:** Die Erfassung soll
**automatisch aus dem laufenden dnd5e-System-Code** erfolgen, nicht über
einen manuell gepflegten Katalog. Jede Regel lässt sich über "Change Rule to
Homebrew" in einem eigenen Fenster bearbeiten und bestätigen; "Add New Rule"
erlaubt gänzlich neue Regeln. Änderungen gehen an Eagle Eye, das die
Original-Regel für Foundry außer Kraft setzt und die geänderte/neue einsetzt.

Der Projektleiter ist sich bewusst, dass dies tiefe Eingriffe ins System
erfordern kann und dass Nutzer beim Ändern von Regeln ggf. nicht ganz ohne
Foundry-/DnD-Code auskommen. Grundsatz: zuerst ohne tiefe Eingriffe
versuchen; ist das nicht möglich, sind tiefe Eingriffe erlaubt — dann soll
Eagle Prey zusätzlich eine katalogisierte Liste aller nutzbaren Variablen,
Hooks, Flags etc. bereitstellen, um es zu vereinfachen.

## Eagle Wings — Automation & Quality of Life

**Problem:** Automation-/QoL-Module sind sehr empfindlich gegenüber
Kompatibilität, fallen häufig nach Updates aus; Homebrew-Objekte/-Regeln
werden dadurch oft falsch dargestellt.

**Lösungsansatz:** In Verbindung mit Eagle Eye und den anderen Eagle Modulen
soll stets funktionierende, kompatible Automation/QoL gewährleistet werden.
Umfangreichstes und kritischstes Modul der Reihe — soll perspektivisch
Funktionen mehrerer bestehender Module bündeln (z. B. Midi-QoL, Active Auras,
Active Token Effects, Automated Conditions). **Ausdrücklich vom Projektleiter
zurückgestellt:** Arbeit daran erst, wenn alles andere reibungslos läuft.

## Klarstellung zur Architektur

Von allen Modulen interagiert nur **Eagle Eye** direkt mit Foundry und dem
DnD-System. Die übrigen Module haben nur die Foundry-Verknüpfungen, die für
ihre eigene Umsetzung nötig sind (Einbindung, UI-Darstellung etc.) — alle
Daten-/Orchestrierungslogik läuft über Eagle Eye. Kompatibilität mit
verbreiteten Fremdmodulen (Prime Performance, PopOut, Token Action HUD,
Monks Little Details etc.) ist ausdrücklich erwünscht, kein Standalone-
Konzept. Die Anbindung weiterer Module an Eagle Eye ist langfristig
vorgesehen; für manche Fälle gibt es aktuell nur noch keine bessere Lösung.

## Klärungen (aus dem Bootstrap-Gespräch, 2026-09-19)

1. **Eagle Eyrie — Ausnahme bei Klassen/Spezies/Subklassen/Backgrounds:**
   Diese vier Typen werden **immer** in die Eagle Library übertragen, auch
   bei gleichem Namen — keine Dedup-Prüfung für sie.
2. **Eagle Prey — Regelerfassung:** Soll **automatisch aus dem laufenden
   dnd5e-Code** erfolgen, nicht über einen manuell gepflegten Katalog.
3. **Eagle Eye — "API umwandeln":** Siehe konkretes Beispiel oben (Eagle
   Beak, magisches Langschwert). Dieselbe Kernfähigkeit trägt sowohl die
   "API-Umwandlung" von Eagle Eye als auch Eagle Beaks strukturierte
   Homebrew-Erstellung — wird als eine gemeinsame Fragestellung erforscht,
   nicht doppelt.

## Übergeordneter Rahmen für diese Planungsphase

Ziel: den Plan verstehen und seine generelle Umsetzbarkeit **theoretisch**
prüfen, in möglichst kleinen Schritten (viele Abhängigkeiten zwischen den
Modulen). Messbarer Endzustand: ein Projektplan auf Basis dieser Ideen,
inklusive Risiko- und Machbarkeitsanalyse. Zeitrahmen irrelevant — Tiefe und
Detailgrad vor Tempo. Non-Goal: keine eigenständige Feature-Entwicklung der
einzelnen Ideen in dieser Phase.

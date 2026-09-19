# Import-Module: Erkenntnisse für Eagle Homebrew (und Eagle Flight Control)

> **Namen:** Dieses Dokument verwendet die echten Modulnamen: Eagle Flight Control (ehemals Eagle Eye), Eagle Homebrew (ehemals Eagle Beak).

status: Referenzmaterial, Stand 2026-09-19 — siehe [`README.md`](README.md) für Methode
und Commit-Stände.

Betrachtet: **5e Statblock Importer**, **5e Item Importer**, **5e Spellblock
Importer**. Sie lösen dasselbe Grundproblem wie der Import-Teil von Eagle Homebrew
(Text → Foundry-Dokument), in drei unterschiedlichen Reifegraden.

## 1. 5e Statblock Importer (Aioros) — das ausgereifteste freie Vorbild

**Aufgabe:** Monster-/NPC-Statblocks im Standardlayout (WotC) einfügen → NPC-Actor
mit Werten, Aktionen, Zaubern, Legendary/Lair-Aktionen. **Lizenz MIT**,
gepflegt (letzter Commit 2026-03-25), deckt Foundry 12–14 und dnd5e 4.3–5.x ab.

### Bedienablauf (deckt sich mit dem Eagle-Homebrew-Konzept)
Text einfügen → **Parse** (oder Auto-Parse bei jeder Änderung) → erkannte
Informationen werden im Eingabefeld **markiert/unterstrichen**, damit man vor
dem Import prüfen kann, was gefunden wurde → **Import** erzeugt den Actor.
Das ist im Kern der in der Vision beschriebene "Import Homebrew"-Ablauf mit
Vorschau, nur ohne editierbare Formularansicht.

### Architektur (~3,4k LOC, sehr übersichtlich)
| Datei | Rolle |
|---|---|
| `sbiRegex.js` (134 Z.) | Katalog aller Muster: erkennt zuerst, **welche Art Zeile** vorliegt (`armor`, `health`, `speed`, `savingThrows`, `senses`, `languages`, `challenge`, `actions`, `legendaryActions` …), dann getrennte Detail-Muster je Zeilenart |
| `sbiParser.js` (993 Z.) | Zerlegt den Text in Blöcke (Werte, Traits, Aktionen, Reaktionen, Legendary, Lair …) und ruft die Muster auf; jeder Teil-Parser liefert sein Element oder wirft einen Fehler |
| `sbiActor.js` (1166 Z.) | Baut aus dem geparsten Ergebnis Actor und Items, inkl. Activities und Effekten |
| `sbiUtils.js`, `sbiData.js`, `sbiConfig.js` | Hilfsfunktionen, Konstanten, Einstellungen |
| `sbiWindow.js` + Templates/CSS | Import-Fenster mit Markierung (`.sbi-issue` u. ä.) |

**Übertragbares Prinzip:** Zweistufige Erkennung — erst Zeilenart erkennen,
dann Details extrahieren — mit einem einzigen, zentralen Muster-Katalog. Das
hält die Wartung an einer Stelle.

### Format-Drift ist eingebaut
Für dieselben Konzepte existieren getrennte Muster je Layout-Generation:
`attack` / `attack24`, `savingThrowDetails` / `savingThrowDetails24`,
`abilityValues` / `abilityValues24` (Layout 2014 vs. 2024). Zusätzlich
Sonderfälle für handgeschriebene Blöcke (z. B. Initiative in eigener Zeile
statt in der AC-Zeile, "Villain Actions", "Mythic Actions", "Souls"). Ein
Parser wächst also mit jedem neuen Layout — er wird nicht "fertig".

### Wie Activities/Effekte erzeugt werden (Kerndaten für M2/M6)
Der Importer baut Items als reine Daten und lässt Foundry sie anlegen. Muster
(gekürzt aus `sbiActor.js`, Konzept — kein Code übernommen):

- **Angriff:** `system.activities.<id> = { _id, type: "attack", activation: {type:"action", value:1} }`;
  ist der Trefferbonus nicht aus Attribut+Übungsbonus ableitbar, wird
  `attack.flat = true` und `attack.bonus = <Wert>` gesetzt.
- **Rettungswurf:** `type: "save"`, `save = { ability, dc: { formula } }`,
  `damage.onSave = <Anteil>`.
- **Schaden:** `damage.parts` (Array), bei Zauberangriffen `damage.includeBase = false`.
- **Zustand bei Treffer/Fehlschlag:** ein Active Effect mit
  `statuses: ["prone"]` o. ä. wird in `item.effects` angelegt und über
  `activity.effects = [{ _id, onSave: false }]` mit der Activity verknüpft.
- **Zauber als Activity:** `type: "cast"` mit `spell.uuid`, `spell.level`,
  `consumption.targets = [{ type: "activityUses", value: 1 }]`,
  `uses.max`, `uses.recovery = [{ period: "day", type: "recoverAll" }]`;
  per Einstellung (`spellsAsActivities`) alternativ als eigenständige Items.
- **Fallback:** Fehlt jede erkennbare Mechanik, wird eine leere
  `utility`-Activity mit passender Aktivierung angelegt, damit das Item
  überhaupt benutzbar ist.

### Auflösung von Zaubern/Items
Konfigurierbare **Compendium-Priorität** (Menü "Compendium Options",
Einstellung `compendiums`). Gefundene Zauber werden per `Item.create` bzw.
über ihre UUID (`@UUID[…]` im Beschreibungstext) verknüpft — Voraussetzung ist
ein installiertes Zauber-Compendium (SRD).

## 2. 5e Item Importer (GnollStack) — der modernste, aber lizenzrechtlich geschlossene Ansatz

**Aufgabe:** Item-Text → Foundry-Items (7 Typen: Weapon, Equipment, Consumable,
Tool, Loot, Container, Spell). **Foundry 14+, dnd5e 5.3+.** ~25k LOC, mit
eigener Testsuite, Diagnose-API und Exportern.
**Lizenz: EULA, "source-available"** — Einsicht und private Anpassung erlaubt,
Weitergabe, Forks und abgeleitete öffentliche Veröffentlichungen untersagt.
**Konzepte studieren ja, Code übernehmen nein** (Lizenzlage aller Quellen:
[`README.md`](README.md), K10).

### Zwei Eingabewege nebeneinander (bestätigt die M6-Empfehlung)
1. **Natural Language Parser** — erkennt Typ, Preis, Gewicht, Schaden,
   Eigenschaften, Beschreibung aus üblichem Statblock-/Fließtext; zeigt das
   Ergebnis **vor** dem Anlegen.
2. **Strict Format (YAML-Vorlagen)** — vorhersagbare Felder, klarere Validierung;
   ausdrücklich "besser für komplizierte Homebrew und wiederholbare Formate".
   Unterstützt **Batch-Importe** (mehrere YAML-Dokumente mit `---`, mehrere
   Typen in einem Block), ein **leichtgewichtiges Key/Value-Entwurfsformat**
   (nur `name` + `type` Pflicht, der Router ergänzt konservative, gültige
   Standardwerte und validiert), **Schema-Versionierung mit Migration**
   (neuere Schema-Versionen als unterstützt werden abgelehnt statt
   halb importiert) und einen **Exporter** (Item → YAML).

### Designprinzipien, die sich übertragen lassen
- **Vorschau, Konfidenz, Provenienz:** Jedes Parse-Ergebnis trägt Vertrauenswert,
  Belege ("evidence") und Prüfvorschläge; Vorschläge bleiben Vorschau, bis
  die Automatisierungs-Ableitung ausdrücklich angefordert wird
  (`api.parse(text, { trace: true, synthesizeAutomation: false })`).
- **Kern vs. Automatisierung getrennt:** Der freie Kern erzeugt Items **ohne**
  Activities/Effekte ("Core Item export excludes Activities and Active
  Effects"). Activities/Effekte übernimmt ein **separates Premium-Companion-
  Modul** ("5e Activity Importer", laut README noch nicht enthalten), das über
  eine öffentliche API (`api.serializeActivity()`, `api.serializeEffect()`,
  öffentliche Parser-API) eingebunden wird.
- **Konservative Automatisierungs-Ableitung:** `naturalAutomationSynthesis.js`
  erkennt nur ausdrücklich formulierten Zusatzschaden, Heilung, Rettungswürfe,
  Zustände und Aufladung; Ergebnisse bleiben "pending" mit Konfidenz und
  Textbeleg, bis sie angewendet werden.
- **Feature-erkannte öffentliche API:** `game.modules.get("5e-item-importer")?.api`
  mit `parse`, `export`, `exportBatch`; Aufrufer sollen jede Funktion vorab
  prüfen. Metadaten liegen unter dem eigenen Flag-Namensraum und dürfen nie als
  `system.*`-Pfade interpretiert werden.
- **Gemischter Schaden:** Empfohlen wird ein typisierter Formelausdruck wie
  `1d8[piercing] + 1d6[lightning]`, mit dem Primär-Schadenstyp als Standard.
- **Icons aus Compendien:** lokale Kandidatensuche mit Cache (Größe, Laufzeit,
  Statistik einstellbar), optional deterministisch oder mit Seed; optionale
  Integration mit Automated Animations.
- **Testansatz:** Komplette Suiten liegen im Repo, aber nicht im Release; sie
  laufen aus der Browser-Konsole (`ItemImporterTests.runStructured()`), legen
  ausdrücklich **keine** Weltdokumente an, und Änderungen an Fixtures laufen nur
  über eine eigens "gesperrte" Automatisierungs-Schnittstelle. Bemerkenswert im
  Hinblick auf das bestehende Live-Test-Gate dieses Projekts.

## 3. 5e Spellblock Importer (gioppoluca) — kleiner, teils veraltet

**Aufgabe:** Zauber- oder Item-Blöcke einfügen (Name = erste Zeile) → Spell/Item.
MIT, ~1k LOC, **abgeleitet vom Statblock Importer** (laut README Code und
Inspiration übernommen). **Keine Activity-Behandlung** im Quelltext gefunden;
verifiziert nur gegen dnd5e 4.3.6 (also vor dem Activity-Datenmodell).
Ob die von ihm erzeugten Legacy-Daten unter dnd5e 5.x/6.x funktionieren,
wurde nicht geprüft — dnd5e enthält Migrationsroutinen, die ältere
Item-Daten in Activities überführen (z. B. `transformTypeData` in
`damage-data.mjs`), inwieweit das für importierte Rohdaten greift, ist
offen.

### Trotzdem nützliche Ideen
- **SRD-Klon als Vorlage:** Hat eine Waffe einen Untertyp, der einem SRD-Objekt
  entspricht, werden dessen Attribute geklont — der Nutzer muss nur Abweichungen
  ändern. Passt direkt zum "Longsword + Magic"-Beispiel (Basis-Item aus dem
  Compendium nehmen, dann anpassen).
- **Zauberlisten pflegen:** Hat ein Zauber eine Klassenliste, wird ein Journal
  "imported-spells" mit einer Seite je Klasse angelegt und der Zauber dort
  eingetragen.

## 4. Was das für Eagle Homebrew bedeutet

Aus den Quellen ableitbar (Schlüsse, keine Festlegungen):

1. **Reihenfolge:** Strukturierte Erstellung und templatierter Import
   (YAML/Statblock-Layout) sind der belastbare Kern; natürlichsprachiger
   Freitext bleibt eine Zusatzstufe mit ehrlicher Konfidenzanzeige. Die
   betrachteten Module gehen genau so vor (Statblock: WotC-Layout; Item
   Importer: YAML-Vorlagen neben dem Natural Parser).
2. **Eine Zwischenrepräsentation** (Item Importer: normalisiertes,
   versioniertes Schema) entkoppelt Parser, Editor, Exporter und Activity-
   Erzeugung voneinander — und erlaubt Editor-Ansicht, Export und Import
   auf derselben Datenbasis.
3. **Core/Automatisierung trennen:** Item-Grunddaten ohne Mechanik anlegen und
   Activities/Effekte als eigenen, optionalen Schritt erzeugen — so bleibt
   der Kern robust gegenüber dnd5e-Änderungen am Activity-Modell.
4. **Konfidenz + Beleg je erkanntem Feld** speichern (nicht nur markieren),
   damit der Korrektur-Editor gezielt die unsicheren Stellen hervorheben kann
   (siehe Vision: "Fehler … werden im Editor hervorgehoben").
5. **Layout-Versionen einplanen:** Muster je Regelwerk-Layout getrennt halten
   (2014/2024), statt ein Universalmuster zu bauen.
6. **Testkorpus:** Die im Automated-Conditions-Wiki gesammelten Flag-Beispiele
   ("Flags-examples (automating 5e items)") und die Beispiel-Vorlagen des Item
   Importers eignen sich als realistische Eingaben für spätere Tests.
7. **Lizenz beachten:** Muster/Datenstrukturen des MIT-Statblock-Importers
   dürfen bei Namensnennung übernommen werden; beim Item Importer nur die
   Ideen.

## 5. Offene Punkte

- Wie die Vision-Eingabe "Longsword + magisch + 2W6 Feuer + Treffer/Untote" in
  ein Zielformat für die Bedingung übersetzt wird, hängt an Q3 in
  [`README.md`](README.md).
- Welche dnd5e-Versionen zu unterstützen sind (Q1), bestimmt, ob das
  Activity-Datenmodell 5.x **und** 6.x abgedeckt werden muss — in dieser
  Analyse wurde das 6.x-Datenmodell nicht gesondert untersucht.

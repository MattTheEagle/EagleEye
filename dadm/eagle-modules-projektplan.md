# Eagle Modules — Projektplan (Stand Planungsphase 3)

> **Namen:** Dieses Dokument verwendet die echten Modulnamen: Eagle Flight Control (ehemals Eagle Eye), Eagle Library (ehemals Eagle Eyrie), Eagle Character Edit (ehemals Eagle Egg), Eagle Homebrew (ehemals Eagle Beak), Eagle Journal (ehemals Eagle Talon), Eagle Ruling (ehemals Eagle Prey), Eagle Roll Out (ehemals Eagle Wings).

status: bestätigt vom Projektleiter am 2026-09-19 (Milestone-Acceptance von M15, siehe `dadm/m15-06-human-decision-output.md`)
retention: durable
Stand: 2026-09-19

Dieses Dokument ist die technische Fassung des Projektplans. Es ersetzt den Stand der Planungsphase 2
(dessen Milestone-Outputs liegen unter `dadm/archive/planning-phase-2/`, der frühere Text im Git-Verlauf).
Die für Leser ohne Vorwissen geschriebene Fassung ist `EAGLE-MODULES-PLAN.md`. Belege stehen in den
Milestone-Outputs (`dadm/m<N>-0<Phase>-*-output.md`) und im Ergebnisdokument
`dadm/spezifikationsabgleich.md`; Quellenverweise (Datei:Zeile) dort und in den Discover-Outputs.

Die Milestone-Nummern in diesem Dokument (M1–M15, M8a) sind die der Planungsphase 3.

---

## 1. Rahmen

Quelle der Spezifikation: PDF "Eagle Modules - Aufbau" (wortgetreu in `dadm/reference/eagle-modules-aufbau.md`), Entscheidungen E1–E8
(`dadm/01-project-brief.md`), Antworten Q0–Q15 (`dadm/m4-05-human-decision-output.md`) und N1–N9 (`dadm/m8-05-human-decision-output.md`).

| Entscheidung | Inhalt |
|---|---|
| E1 | Nur Foundry v13 (v14 gestrichen und aus der Codebasis entfernt, M1); DnD-5e-Linie zu Foundry 13 (dnd5e 5.x) |
| E2 | Eagle Ruling neben Custom D&D 5e, nicht darauf aufbauend |
| E3 | Eigene Lösung statt Fremdmodul für Bedingungen wie "nur gegen Typ X" |
| E4 | Vorerst keine Lizenz (Hobbyprojekt) |
| E5 | Umbenennung nur in Dokumenten (Modul-ID `eagleeye`, Manifest, Repo unverändert) |
| E6 | Eagle Flight Control bindet nur Eagle Module an; Fremdmodul-Funktionen entfallen, auch Erkennung, Auswirkungsanalyse und Aktivieren von Abhängigkeiten (Q1 a) |
| E7 | Ein GitHub-Repo je Modul, bewusst modular |
| E8 | UI im Stil der nativen Foundry-UI |
| Q3 a | Alle Foundry-**Änderungen** über Flight Control; Lesen direkt (N9); Editor-Logik bleibt in den Modulen (N4) |
| Q2 a | Verträglichkeit mit verbreiteten Fremdmodulen bleibt ein Ziel (durch Bauweise) |
| N1, N3 | Nutzungsrechte je Modul und Nutzer später in den Moduleinstellungen; Klartext Englisch |
| N10–N20 | Antworten vom 2026-09-19 (`dadm/m15-05-human-decision-output.md`): Herkunft auf der Quelle, Abhängigkeiten mitkopieren, Unterart-Marker, Besitzer = Ersteller und fortsetzbare Charaktere, Homebrew S1 mit Library-Eintrag bei "Edit with" und "Name (Duplicate)", `rulesVersion` der Welt, Journal-Einstiege ersetzen und alle Einträge einordnen, UI-Weg O1, **libWrapper als Abhängigkeit freigegeben**, Roll Out Eigenbau ohne dauerhafte Ausschlüsse |

---

## 2. Modulübersicht und Gesamtverdict

| Modul | Kernergebnis | Verdict | Risiko |
|---|---|---|---|
| Eagle Flight Control | Hub mit Tabs, Anfragekanal, GM-Relay über `User#query`; Ladeverhalten unverifiziert | machbar | mittel |
| Eagle Library | Welt-Compendien, Zuordnung 2014/2024, Einmaligkeit, Suche/Hotkey/Drag & Drop; Verweise umschreiben (zwei Durchgänge) | machbar | mittel |
| Eagle Character Edit | dnd5e-Advancement-Manager als Motor; Lücken: Unterarten, Ausgangsausrüstung, Fließtext-Zauberregeln | machbar | mittel |
| Eagle Homebrew | 18 Objektarten, gestaffelter Aufwand; Welt + Library zugleich (Library ist Quelle); bedingte Effekte in zwei Stufen | machbar | mittel |
| Eagle Journal | Einstiege über Hooks an `ApplicationV2`-Journal-Fenstern; Rechte der Spieler | machbar | niedrig |
| Eagle Ruling | drei Ebenen neu bewertet, große Teile ohne tiefe Eingriffe | teils einfach, teils schwer | niedrig bis hoch je Ebene |
| Eagle Roll Out | Vorab-Plan: 12 von 15 Bereichen planbar; Weg entschieden (Eigenbau mit libWrapper) | Vorab-Plan liegt vor | hoch |
| UI im Foundry-Stil | Bausteine vorhanden; Drift zwischen sieben Repos | machbar | niedrig-mittel |

---

## 3. Module im Detail

### 3.1 Eagle Flight Control (M5, M9-Anteile)
Spezifikation: P-FC1 bis P-FC8. Belege: `dadm/m5-0*-output.md`.

- **Hub und Registerkarten:** `ApplicationV2` hat eingebaute Tabs; der Phase-1-Hub ist bereits eine `ApplicationV2` (bisher Tabelle). Erkennung der Eagle Module über einen Manifest-`flags`-Eintrag plus Anmeldung per API;
  seit N2 werden inaktive Module ausgeblendet, damit genügt die API-Anmeldung. Start = Oberfläche öffnen (Q15 a).
- **Anfragekanal:** `game.modules.get(id).api` (Vorbild Midi-QOL, Custom D&D 5e), Zugriff erst ab `setup`/`ready` (Ladereihenfolge normaler Module nicht dokumentiert). Spieler ohne Foundry-Recht: `User#query` mit präfixiertem Namen in `CONFIG.queries`,
  kein socketlib. Versionsspanne in `relationships.requires` plus API-Versionsprüfung. **Nicht verifiziert:** Ladereihenfolge, deaktivierte Abhängigkeit, Erzwingen der Spanne (Live-Test).
- **DnD-Logik:** Versionswächter über `game.system.version`; Liste getesteter dnd5e-Versionen.
- **Klartext ↔ Code:** siehe Abschnitt 4.
- **Phase-1-Code:** Registry-Lesen/-Schreiben und Paketdaten-Lesen als Bausteine (mit Filter auf Eagle Module); Konflikt-Überwachung und Fremdmodul-Sprach-Erkennung ohne Bezug; Entscheidung über Entfernen in der Umsetzungsphase (E6).
- Architekturrisiko: Q3 a und "kein Mega-Modul" sind vereinbar, solange Flight Control schmal und generisch bleibt (N4).

### 3.2 Eagle Library (M7, M8, M8a)
Spezifikation: P-L1 bis P-L10. Belege: `dadm/m7-0*`, `m8-0*`, `m8a-0*`.

- **Compendien:** `CompendiumCollection.createCompendium`, nur als **Welt-Compendium** durch den GM; jede Welt hat ihre Library. "Art" = Dokumenttyp, bei Items dnd5e-Untertyp (Konvention der Library); Eagle Compendien erkennbar an Name/Label oder gespeicherter Liste.
- **2014/2024:** `system.source.rules` bei Items, NPC, Vehicle; nicht bei Charakter-, Gruppen-, Encounter-Actors und Journalen. Fallstrick: Anfangswert folgt der Welteinstellung `rulesVersion`, der Index liefert den gespeicherten Wert.
  Regeln (N7): ohne gespeicherte Version 2014; existiert der Name in 2014 und nicht in 2024, dann 2024; in beiden Versionen vorhanden = Duplikat.
- **Einmaligkeit:** Name im selben Eagle Compendium und derselben Version (Q6 a), ohne Ausnahme für Klassen usw. (Q4 a); Protokoll und Erzwingen bleiben (Q5 a); erzwungene Kopie "Name (Duplicate)", weitere nummeriert, Version wählt der GM (N8).
- **Kopieren:** `toCompendium` + `importDocument`/`createDocuments`, Container mit `createWithContents`; große Mengen in Portionen (Laufzeit nicht verifiziert). Bilddateien werden nicht mitkopiert.
- **Suche:** Namenssuche über die Indizes, ein Hotkey für alle (`game.keybindings.register` im `init`), Overlay als rahmenlose `ApplicationV2`, Drag & Drop mit `{type, uuid}`; Lesen direkt im Library-Modul, Ändern über Flight Control (N9).
- **Verweise (N6: jede Verlinkung wird umgeschrieben):** Empirisch über alle 4.674 Quelldokumente der dnd5e-Compendien: 37 % enthalten Verweise, 25.920 UUID-Zeichenketten, 6.941 `@UUID[`, 2.085 `@Embed[`.
  Stellen u. a. Item Grant/Choice, Cast, Summon/Transform, Enchant-Riders, Startausrüstung, Zauberlisten, Klassen-Journalseiten, Rolltabellen, Verbrauchsziele, Effekt-`origin`, Effekt-Änderungswerte, Advancement-Werte, Texte.
  Strategie: zwei Durchgänge (Abbildungstabelle bauen, dann schreiben), IDs erhalten (`keepId`), Selbstverweise bei Duplikaten auf das Duplikat, Prüfbericht. Sonderfälle: Zauberlisten-Registry (Liste der Library ergänzt die des Systems, Filter in Character Edit),
  Verweise auf nicht installierte Premium-Module. Skripte der Auswertung: `dadm/reference/source-analysis/scripts/`.
- **Entschieden (N10, N11, N12):** Herkunftsangaben bleiben auf der Originalquelle (`toCompendium` mit `clearSource: false`; dnd5e leitet das Quellenbuch-Label aus der Herkunft ab; gewährte Items bekommen ihre Herkunft von dnd5e neu aus den umgeschriebenen UUIDs;
  Randfall Legacy-Flag `flags.dnd5e.sourceId` bei manuell gezogenen Items: Character Edit setzt es beim Hinzufügen auf die Library-Kopie, N10b). Abhängigkeiten werden automatisch mitkopiert (Bestand kann stark wachsen; nicht auflösbare Verweise werden gemeldet). Unterarten über einen Marker der Library, der automatisch beim Kopieren entsteht und von Hand gesetzt oder entfernt werden kann (N21).

### 3.3 Eagle Character Edit (M9)
Spezifikation: P-CE1 bis P-CE6. Belege: `dadm/m9-0*`.

- **Start:** Hub nur für neue Charaktere (Anlegen über Flight Control), Charakterblatt über `getHeaderControls…` (nur Typ `character`); bestehende Charaktere einlesen, nicht aus der Library stammende Items als "extern" erhalten.
- **Live-Abgleich:** Das Blatt aktualisiert sich selbst. Der dnd5e-`AdvancementManager` arbeitet auf einem Klon und schreibt je Vorgang einmal ("live" = nach jedem abgeschlossenen Vorgang); empfohlen: Manager als Dialog über dem Editor.
- **Tabs:** Attributes (Punktekauf/Standardwerte fehlen in dnd5e, Tabellen im Editor; Bonus aus den gespeicherten `assignments`), Class mit Level (Q11 a; `forNewItem`, `forLevelChange`, Unterklasse als Advancement), Species (Unterarten in dnd5e eigene gleichrangige Items, N12),
  Background, Spells (Registry-Listen auf Library-Zauber filtern; Anzahlen aus Skalenwerten und Vorbereitungsformel; Fließtext-Regeln nicht in den Daten), Equipment (Ausgangsausrüstung wird von dnd5e nicht angewendet).
- **Entschieden (N13):** Besitzer ist der Ersteller; ein unfertiger Charakter bleibt bestehen und wird über das Blatt im Editor fortgesetzt (P-CE4). Unterarten über den Marker der Library (N12).

### 3.4 Eagle Homebrew (M10, M6)
Spezifikation: P-HB1 bis P-HB6. Belege: `dadm/m10-0*`, `m6-0*`.

- **Objektarten:** einfach (Loot, Tool, Weapon, Equipment, Consumable, Container), mittel (Feature, Spell, Species, Background, Rolltabelle), hoch (Class, Subclass, Facility, NPC), Sonderfälle (Encounter, Group, Vehicle). "Item" ist die Foundry-Hauptgruppe, kein Untertyp; Player Character entfällt in Homebrew (Character Edit); 18 Objektarten (N15).
- **Ablauf:** Objekt sofort angelegt (Q9), zugleich als Welt-Dokument und Library-Eintrag; Live-Bearbeitung mit Debounce; feldgenaue Validierung über `DataModel#validate`; "Edit with" in Blatt-Kopfzeile und Verzeichnis-Kontextmenü (Q10 c), Restdaten bleiben erhalten.
  Foundry hat keinen Abgleich Welt ↔ Compendium; **entschieden (N14):** S1 (Library → Welt), "Edit with" legt einen fehlenden Library-Eintrag an, Kollision "Name (Duplicate)"; Regelwerk-Version aus der Welteinstellung `rulesVersion` (N16). Kette Flight Control ← Library ← Homebrew.
- **Bedingte Effekte (E3, N5):** dnd5e hat keine Bedingung am Schadensteil (Issue #4477 offen). Stufe 1: zweite native Damage-Activity (Weg A) plus Bedingung als Daten im dnd5e-Filterformat (`dnd5e.Filter`). Stufe 2 (Roll Out): Prüfung je Ziel über `dnd5e.preCalculateDamage` (Weg C).
- Freitext-Import zurückgestellt (Q8 c); das Phase-2-Ergebnis (verlässlich nur für templatierte Eingaben) bleibt Referenz.

### 3.5 Eagle Journal (M11)
Spezifikation: P-J1, P-J2. Belege: `dadm/m11-0*`.

- Journal-Blatt (`JournalEntrySheet`) und -Verzeichnis (`JournalDirectory`) sind `ApplicationV2`; Hooks `render…`, `getHeaderControls…`, `get…ContextOptions` für "Open in Eagle Journal" und "Create Eagle Journal Note" (= neuer Eintrag im Vault, Q12 a).
  Exakte Hook-Namen und Selektoren gegen das laufende Foundry bestätigen (Quelltext lokal nicht vorhanden).
- **Entschieden (N17):** Jeder Journal-Einstieg bekommt einen Eagle-Journal-Einstieg; Eagle Journal soll die normalen Einstiege ersetzen; alle neuen Einträge werden eingeordnet. Geprüft (`dadm/m15-05-human-decision-output.md`): Öffnen über `DocumentSheetConfig.registerSheet` (`makeDefault`)
  oder je Eintrag über libWrapper auf `_getSheetClass`; Erstellen über libWrapper auf `JournalEntry.createDialog` und Verzeichnis-Hooks; `preCreateJournalEntry` erfasst jeden Erstellweg. dnd5e-Seitenblätter (Klasse, Regel, Zauberliste, Karte) müssen in einem ersetzenden Blatt darstellbar sein;
  Massenimporte behalten ihre Ordnerstruktur in einem Unterordner des Vaults; Compendium- und Systeminhalte werden nicht ersetzt (N22).
- Rechte: `JOURNAL_CREATE` Standard Trusted; Spieler-Vault braucht GM-Anfrageweg oder Rechtefreigabe (N1). Ordner ohne Berechtigung, Privatheit über Einträge. Automatische Ablage über `preCreateJournalEntry`, Geltungsbereich N17.
- Phase-2-Ergebnis gilt weiter (native `@UUID`-Verlinkung, Tags über `flags`); Restrisiko: Rechtsklick-Menü im ProseMirror-Editor nicht verifiziert.

### 3.6 Eagle Ruling (M13)
Spezifikation: P-R1, P-R2. Belege: `dadm/m13-0*`.

- Korrektur: Custom D&D 5e Releases 2.0 bis 4.1.2 laufen auf Foundry 13 mit dnd5e 5.x; Koexistenz ist real. Neubewertung: Ebene 1 (170 Regelbegriffe) und 2 (45 Einstellungen, etwa 25 regelrelevant) machbar/niedrig;
  Ebene 3 geteilt: 3a `CONFIG.DND5E` (134 Bereiche) niedrig-mittel, 3b Hooks mittel, 3c Wrapper hoch (mit dem freigegebenen libWrapper machbar, N19), 3d neue Regeln aus fester Bausteinliste. Bauweise für Verträglichkeit: einzelne Schlüssel einfügen, Hooks vor Wrappern.
- Lizenz: von Custom D&D 5e nur Muster, kein Code.

### 3.7 Eagle Roll Out (M14, Vorab-Plan)
Belege: `dadm/m14-0*`.

- 15 Bereiche; 12 als Eigenbau mit offiziellen Hooks planbar; Reaktionen, Makro-Ebene, Undo nicht empfohlen. dnd5e nativ: Konzentration, Schadensberechnung je Ziel, Anfrage-Nachrichten, Aufladung, Beschwörung. Fehlt nativ: automatisches Anwenden, Auren, Token-Effekte, Over-Time.
- Wege nach Q13 c: P-E1 (nur Hooks), P-E2 (mit libWrapper), P-A1 (auf Midi-QOL), P-A2 (Koordinator, Spannung zu Q1 a). **Entschieden (N20, N19):** P-E2, Eigenbau, für tiefe Bereiche mit libWrapper; nichts dauerhaft ausgeschlossen, Ziel ist die höchstmögliche Automationsstufe, der Grad wird später in den Einstellungen von Roll Out gewählt.
  Ausbaupfad Stufen 0–5, danach Reaktionen, Makro-Ebene und Undo als späte Stufen; Ruling besitzt Regeldefinition, Roll Out die Ausführung.

### 3.8 Einheitliche UI (M12)
Belege: `dadm/m12-0*`. Bausteine in v13: `ApplicationV2`, `HandlebarsApplicationMixin`, Tabs, `CategoryBrowser`, Formularelemente und -Helfer, `DialogV2`, `ContextMenu`, `DragDrop`; Hell/Dunkel folgt automatisch, solange keine eigenen Farben gesetzt werden.
**Entschieden (N18):** O1, nur Foundry-Bausteine plus schriftlicher Leitfaden (verworfen bzw. vorerst nicht gewählt: O2 geteilte Basis über Flight Control, O3 UI-Bibliotheksmodul, O4 geteilter Quellcode zur Bauzeit). Nicht verifiziert: CSS-Schichten für Modul-Stile, Klassenstabilität, Fenster-Module.

---

## 4. Übergreifend: "Klartext ↔ Code" (API-Umwandlung)

| Richtung | Stand | Module |
|---|---|---|
| Auswahl → Foundry-Daten | machbar; Activity-Schema deckt Schaden/Art/magisch; Bedingung ohne Fremdmodul in zwei Stufen | Homebrew, Character Edit |
| Daten → Editor-Zustand | machbar, wenn nicht abgebildete Restdaten erhalten bleiben | Character Edit, Homebrew ("Edit with") |
| Daten → lesbarer Text | strukturiert sofort (dnd5e-Labels, `richTooltip`, Feldlabels); ganzer Satz nur für bekannte Strukturen; Klartext Englisch (N3), dnd5e-Labels folgen der Spielsprache | Flight Control, Ruling |

Wirkung nach Modul: Homebrew zentral, Character Edit sehr stark, Ruling stark (Rückrichtung, eigene Lösung), Journal schwach, Library kaum.

## 5. Abhängigkeiten

```
Eagle Flight Control (Hub, Anfragekanal, alle Änderungen an Foundry-Daten)
  ├─→ Eagle Library ──┬─→ Eagle Character Edit
  │                   └─→ Eagle Homebrew
  ├─→ Eagle Journal      [unabhängig von Library, Character Edit, Homebrew]
  ├─→ Eagle Ruling       [unabhängig von Library, Character Edit, Homebrew]
  └─→ Eagle Roll Out ← Flight Control, Ruling, Bedingungsformat aus Homebrew (später)
```

## 6. Empfohlene Reihenfolge einer Umsetzungsphase
1. Eagle Flight Control (Hub, Anfragekanal, Versionswächter; Phase-1-Code als Start) — vor allen anderen, weil alle Änderungen darüber laufen
2. Eagle Library (Kopieren mit Umschreiben der Verweise, Einmaligkeit, Suche/Hotkey)
3. Eagle Journal und Eagle Ruling (Ebenen 1, 2, 3a) parallel
4. Eagle Character Edit
5. Eagle Homebrew (einfache Objektarten und Stufe 1 der bedingten Effekte zuerst)
6. Eagle Ruling, Ebenen 3b bis 3d
7. Eagle Roll Out (Stufen 0–5)

Änderung gegenüber Planungsphase 2: Flight Control steht jetzt an erster Stelle (Q3 a); der Freitext-Import ist entfallen (zurückgestellt); die Library-Umschreibung der Verweise ist neuer Hauptaufwand; Ruling ist in Teilen einfacher, Roll Out hat einen Vorab-Plan.

## 7. Risiko-/Machbarkeitsmatrix (Kurzform)
Siehe Abschnitt 2. Größte Einzelrisiken: (1) Schnittstellenstabilität zwischen sieben getrennt veröffentlichten Modulen, (2) Umschreiben aller Verweise in der Library, (3) Umfang der Homebrew-Editoren,
(4) Regeln nur im Fließtext (Zauber-Tab), (5) Roll Out insgesamt.

## 8. Nur im Live-System prüfbar (braucht Freigabe des Projektleiters)
Ladereihenfolge und deaktivierte Abhängigkeit; Menge beim Kopieren; Advancement-Dialog aus eigenem Fenster; häufige Update-Hooks bei Live-Bearbeitung; Hook-Namen der Verzeichnisse; CSS-Schichten und Fenster-Module; Zusammenspiel mit Custom D&D 5e;
`properties`-Einträge und Hook-Ergänzung in Weg C; `toCompendium` bei eingebetteten Dokumenten; `keepId` in großer Menge.

## 9. Offene Fragen an den Projektleiter
**Keine.** N1–N22 sind beantwortet (`dadm/m8-05-human-decision-output.md`, `dadm/m15-05-human-decision-output.md`, `dadm/m15-06-human-decision-output.md`); die Auslegungen zu "Item" und zu N20 sind bestätigt.

## 10. Korrekturen aus dieser Phase
- Custom D&D 5e und weitere Module haben Releases für Foundry 13 (Tabelle in `dadm/reference/source-analysis/README.md`, Abschnitt 4); die frühere Aussage "verlangt Foundry 14" galt nur für die neuesten Releases.
- `DND5E.rules` hat 170 Einträge (Phase 2 schätzte "über 60"); dnd5e hat 45 Einstellungen, etwa 25 regelrelevant.
- Das Phase-2-Ergebnis "Langschwert machbar" stützte sich für "nur gegen Untote" auf Build-a-Bonus; es wurde ohne Fremdmodul neu begründet (zwei Stufen).
- Das Phase-2-Ergebnis "Advancement-System als Motor" wurde präzisiert: Der Manager arbeitet auf einem Klon und schreibt je Vorgang einmal.

# Spezifikationsabgleich — Ergebnisdokument der Planungsphase 3

status: abgeschlossen (Planungsphase 3); alle Milestones geschlossen, N1–N22 beantwortet, Pläne bestätigt
retention: durable
Quellen: `dadm/reference/eagle-modules-aufbau.md` (PDF und Antworten),
`dadm/reference/eagle-modules-vision.md` (Vision, Entwicklungsnamen). Die Modulnamen
in diesem Dokument sind die echten Namen. Der bestehende Projektplan bleibt bis M15
unverändert; dieses Dokument sammelt die Ergebnisse der Planungsphase 3.

## Stand der Milestones

| Milestone | Inhalt | Stand |
|---|---|---|
| M1 | v14 aus der Codebasis entfernen | geschlossen (Go am 2026-09-19; `typecheck`, `test`, `build` für v13 grün) |
| M2 | Spezifikation "Aufbau" als Referenz festhalten | geschlossen |
| M3 | Dokumente auf die echten Modulnamen umstellen | geschlossen |
| M4 | Delta-Analyse Vision → Aufbau, Klärungsliste | geschlossen (alle 16 Fragen beantwortet, siehe `dadm/m4-05-human-decision-output.md`) |
| M5 | Eagle Flight Control: Machbarkeit | geschlossen |
| M6 | Bedingte Effekte ohne Fremdmodul (Referenzfall Langschwert) | geschlossen |
| M7 | Eagle Library: Kopieren, Zuordnung 2014/2024, Einmaligkeit | geschlossen |
| M8 | Eagle Library: Suche, Hotkey-Schnellsuche, Drag & Drop | geschlossen |
| M8a | Eagle Library: Inventar aller Verweisstellen (N6) | geschlossen |
| M9 | Eagle Character Edit: Startwege und Live-Abgleich | geschlossen |
| M10 | Eagle Homebrew: Erstellen und Bearbeiten | geschlossen |
| M11 | Eagle Journal: Einstiegspunkte in der Foundry-UI | geschlossen |
| M12 | Einheitliche UI im Foundry-Stil über getrennte Repos | geschlossen |
| M13 | Eagle Ruling: Neubewertung nach Repo-Analyse | geschlossen |
| M14 | Eagle Roll Out: Vorab-Plan Automationsumfang | geschlossen |
| M15 | Synthese: Projektplan und Standalone-Plan aktualisieren | geschlossen (Pläne am 2026-09-19 bestätigt, `dadm/m15-06-human-decision-output.md`) |

## M2 — Referenz festgehalten
`dadm/reference/eagle-modules-aufbau.md` enthält das PDF wortgetreu, die Antworten des
Projektleiters vom 2026-09-19, die Entscheidungen E1–E8 und die Namenszuordnung.
Punktezählung je Abschnitt bestätigt Vollständigkeit.

## M3 — Modulnamen umgestellt
In zehn lebenden Dokumenten stehen die echten Namen, die Entwicklungsnamen nur noch in
"(ehemals …)"-Klammern (0 Treffer außerhalb). Inhaltlich sind die Dokumente auf dem Stand der
Planungsphase 2; die überholten Aussagen sind gelistet (`dadm/m3-03-deploy-output.md`) und
werden in M15 eingearbeitet.

## M4 — Delta Vision → Aufbau

Vollständige Zuordnung jeder Aussage (V-… gegen P-…) mit Klassifikation:
`dadm/m4-02-apply-output.md`. Kurzfassung je Modul:

**Eagle Flight Control**
- Geändert: nur Eagle Module, keine Fremdmodule (E6, bestätigt); die Formulierung "Datenbank mit
  Zugriff auf Funktionen" kommt nicht mehr vor.
- Neu: Registerkarte je installiertem Modul im Hub, Start der Module aus dem Hub,
  Umwandlung "und umgekehrt" (Code → Klartext).
- Offen: Kompatibilität, Auswirkungen und Abhängigkeiten unter Eagle Modulen (Q1), Kompatibilität mit
  Fremdmodulen als Ziel (Q2), Architekturregel "nur Flight Control spricht mit Foundry" (Q3),
  Bedeutung von "gestartet" (Q15).

**Eagle Library**
- Unverändert: Suche, Hotkey-Schnellsuche, Single Source of Truth für die Eagle Module.
- Neu: Compendien je Art, Trennung 2014/2024 mit Zuordnung beim Kopieren, Registerkarte je Compendium,
  Library als UI, Drag & Drop.
- Geändert/offen: Duplikat-Kriterium (Q6) und Ausnahme für Klassen usw. (Q4), Auswahl "zum Kopieren" statt "zur
  Durchsuchung" (Q7), Log und Erzwingen (Q5).

**Eagle Character Edit**
- Unverändert: sechs Registerkarten, Steuerung über Flight Control, Live-Bearbeitung des Sheets.
- Neu: Start aus dem Hub nur für neue Charaktere; Start aus dem Charakter Sheet mit Auslesen
  bestehender Charaktere (Erstellung **und Bearbeitung**).
- Offen: Wo das Level festgelegt wird (Q11).

**Eagle Homebrew**
- Unverändert: Objektarten und Unterkategorien.
- Neu: Live-Bearbeitung im Hintergrund, Öffnen aus dem Hub, "Edit with Eagle Homebrew" für bestehende Objekte.
- Geändert/offen: Freitext-Import fehlt im PDF (Q8), Zeitpunkt und Ort des Anlegens (Q9),
  Einstiegspunkt "Edit with" (Q10).

**Eagle Journal**
- Unverändert: alle Funktionen laut PDF "wie im Ursprungsplan" (Lesart: Vision, Q0).
- Neu: Einstiegspunkte "Open in Eagle Journal" / "Create Eagle Journal Note" überall, wo Journal-Einträge
  geöffnet oder erstellt werden (Begriff "Note": Q12).

**Eagle Ruling**
- Keine Funktionsänderung im PDF. Prüfauftrag (Umsetzung nach Repo-Recherche neu bewerten) und
  Abgrenzung "neben Custom D&D 5e, nicht darauf aufbauen" (E2) → M13.

**Eagle Roll Out**
- Weiterhin später. Neu: Vorab-Plan zum Automationsumfang → M14 (Q13).

**Allgemein**
- Ein eigenes GitHub-Repo je Modul, bewusst modular (E7); UI einheitlich im Foundry-Stil (E8) → M12.

### Klärungsliste
Status: alle 16 beantwortet (2026-09-19). Die Antworten im Wortlaut stehen in `dadm/reference/eagle-modules-aufbau.md`.

| # | Frage | Optionen | Empfehlung (Vorschlag) | Betrifft | Antwort |
|---|---|---|---|---|---|
| Q0 | Wo das PDF schweigt: Gilt die Vision weiter? Und ist mit "Ursprungsplan" (Journal) die Vision gemeint? | (a) Ja, Vision gilt weiter, außer bei den einzeln gefragten Punkten; Ursprungsplan = Vision. (b) Nein, nur was im PDF steht gilt | (a) | alle | Ja: Die Vision gilt weiter, wo das PDF schweigt (außer bei den einzeln gefragten Punkten). "Ursprungsplan" (Journal) = Vision. |
| Q1 | Flight Control: Fremdmodul-Funktionen entfallen (E6). Gelten Kompatibilitätserkennung mit Begründung, Erkennung der Auswirkungen von Einstellungsänderungen und Aktivieren/Deaktivieren von Abhängigkeiten noch für Eagle Module untereinander? | (a) Entfallen ganz. (b) Bleiben für Eagle Module untereinander. (c) Nur die Kompatibilitätserkennung bleibt | (a). Versionsverträglichkeit getrennter Repos untersuche ich in M5 trotzdem als technische Voraussetzung, nicht als Funktion | M5 | Entfallen ganz: Kompatibilitätserkennung, Auswirkung von Einstellungsänderungen und Aktivieren/Deaktivieren von Abhängigkeiten gelten auch unter Eagle Modulen nicht. |
| Q2 | Die Vision wünscht Kompatibilität mit verbreiteten Fremdmodulen (Prime Performance, PopOut, Token Action HUD …). Bleibt das ein Ziel für die Eagle Module, auch wenn Flight Control keine Fremdmodule anbindet? | (a) Ja, weiterhin Ziel. (b) Nein, entfällt | (a) | M5, M12 | Ja: Kompatibilität der Eagle Module mit verbreiteten Fremdmodulen bleibt ein Ziel, auch wenn Flight Control keine Fremdmodule anbindet. |
| Q3 | Vision: Nur Flight Control spricht direkt mit Foundry und dem DnD-System, alle anderen Module nur Einbindung/UI. Gilt das weiter, auch für Library (Compendien anlegen, kopieren), Journal (Ordner, Einträge) und Ruling? | (a) Ja, alle Foundry-Änderungen über Flight Control. (b) Nur Character Edit und Homebrew laufen über Flight Control; die anderen greifen selbst zu. (c) Gemischt, ich beschreibe es | (a) | M5, M7, M11 | Ja: Alle Foundry-Änderungen laufen über Flight Control; die anderen Module haben nur Einbindung und UI. |
| Q4 | Library: Vision überträgt Klassen, Spezies, Subklassen, Backgrounds **immer**, PDF verlangt "jeder Eintrag nur einmal pro Version". Gilt die Ausnahme noch? | (a) Entfällt, auch diese Typen nur einmal pro Version. (b) Bleibt, diese vier Typen dürfen mehrfach vorkommen | (a). Vermutung, bitte prüfen: Die Ausnahme lag vermutlich an gleichnamigen Klassen aus 2014 und 2024; die neue Trennung nach Version deckt das ab | M7 | Die Ausnahme entfällt: Auch Klassen, Spezies, Subklassen und Backgrounds kommen nur einmal pro Version vor. |
| Q5 | Library: Vision loggt nicht übertragene Einträge und lässt den DM die Übertragung erzwingen. Bleibt das? | (a) Ja. (b) Nein, Duplikate werden ohne Meldung übersprungen. (c) Nur Meldung, kein Erzwingen | (a) | M7 | Ja: Nicht übertragene Einträge werden geloggt, der DM kann die Übertragung erzwingen. |
| Q6 | Library: Was ist "derselbe Eintrag"? Vision: gleicher Name. | (a) Gleicher Name im selben Eagle Compendium und in derselben Version. (b) Anderes Kriterium (z. B. Quelle/Buch), ich beschreibe es | (a) | M7 | "Derselbe Eintrag" = gleicher Name im selben Eagle Compendium und in derselben Version. |
| Q7 | Library: Vision wählt Compendien "zur Durchsuchung" aus, PDF "zum Kopieren". Dieselbe Funktion? | (a) Ja: Auswahl dient nur dem Kopieren, durchsucht wird nur die Eagle Library. (b) Zusätzlich Suche direkt in ausgewählten Nicht-Eagle-Compendien | (a) | M7, M8 | Dieselbe Funktion: Die Auswahl dient nur dem Kopieren, durchsucht wird nur die Eagle Library. |
| Q8 | Homebrew: "Import Homebrew" (Freitext) aus der Vision fehlt im PDF, das nur "Create Homebrew" nennt. | (a) Entfällt ganz. (b) Bleibt Teil des Moduls. (c) Zurückgestellt, nicht Teil dieses Plans | keine; nur du kannst das entscheiden. Bei (a) fällt der schwierigste Teil (Freitext-Parsing, Risiko hoch) weg | M10 | Zurückgestellt: Der Freitext-Import ist nicht Teil dieses Plans (bleibt im Konzept vorgesehen). |
| Q9 | Homebrew: Wo und wann wird das Objekt angelegt? PDF: Flight Control erstellt es und editiert live; Vision: erst bei "Create", dann in die Library. | Wo: (a) als normales Welt-Dokument. (b) direkt in der Eagle Library. (c) Welt, danach per Button in die Library. (d) anderes. Wann: (1) sofort nach Wahl von Art und Unterkategorie (Live-Modell). (2) erst bei "Create" | Wann: (1), wie im PDF. Wo: keine | M10 | Wann: (1) sofort nach Wahl von Art und Unterkategorie (Live-Modell). Wo: immer beides gleichzeitig, als Welt-Dokument **und** als Eintrag in der Eagle Library (Rückfrage am 2026-09-19 beantwortet; "a und b" = beides). Offen für M10: ob beide Einträge unabhängige Kopien oder verknüpft sind und wie Änderungen abgeglichen werden. |
| Q10 | Homebrew: Wo erscheint "Edit with Eagle Homebrew"? | (a) Kopfzeile des Dokumentblatts. (b) Kontextmenü im Verzeichnis. (c) Beides. (d) anderes | (c), analog zu Character Edit (Sheet) und Journal (überall, wo Einträge geöffnet werden) | M10 | Beides: Kopfzeile des Dokumentblatts und Kontextmenü im Verzeichnis. |
| Q11 | Character Edit: Wo wird das Level festgelegt? Der Class-Tab nennt nur Class, Classfeatures, Subclass, Subclassfeatures. | (a) Im Class-Tab (Class und Level). (b) Charaktere starten immer auf Level 1. (c) Eigener Bereich. (d) anderes | (a), weil bestehende Charaktere (P-CE4) ohnehin Level über 1 haben können | M9 | Das Level wird im Class-Tab festgelegt (Class und Level). |
| Q12 | Journal: Was ist eine "Eagle Journal Note"? | (a) Ein neuer Journal-Eintrag im Eagle-Journal-Vault. (b) Eine Karten-Notiz (Foundry Map Note), die auf einen Eagle-Journal-Eintrag zeigt. (c) anderes | keine; der Begriff ist in Foundry doppelt belegt | M11 | "Eagle Journal Note" = ein neuer Journal-Eintrag im Eagle-Journal-Vault. |
| Q13 | Roll Out: Soll die Automation komplett im Modul selbst entstehen oder darf sie auf bestehenden Automationsmodulen (Midi-QOL usw.) aufbauen? | (a) Komplett eigene Implementierung. (b) Darf auf bestehenden Modulen aufbauen. (c) Vorab-Plan bewertet beides, du entscheidest danach | (c) | M14 | Der Vorab-Plan bewertet beides (komplett eigene Implementierung und Aufbau auf bestehenden Modulen); der Projektleiter entscheidet danach. |
| Q14 | Dateinamen: `beak-importers.md`, `prey-rules-customization.md`, `wings-automation.md` tragen noch Entwicklungsnamen. Umbenennen (Links werden angepasst)? | (a) Ja. (b) Nein | (a), passend zum Auftrag "Namen anpassen" | nur Dokumente | Ja: Die drei Dateinamen werden umbenannt, Links angepasst. |
| Q15 | Flight Control: "Jedes Eagle Module kann aus dem Hub gestartet werden" — Start heißt die Oberfläche des Moduls öffnen oder das Modul aktivieren/deaktivieren? | (a) Oberfläche öffnen. (b) Modul aktivieren/deaktivieren. (c) beides | (a) | M5 | "Gestartet" heißt: die Oberfläche des Moduls öffnen (nicht aktivieren/deaktivieren). |

## M5 — Eagle Flight Control: Machbarkeit des neuen Zuschnitts

Belege: `dadm/m5-01-discover-output.md`, Bewertung: `dadm/m5-02-apply-output.md`.

| Fähigkeit | Verdict | Risiko |
|---|---|---|
| (a) Hub mit Registerkarte je Eagle Modul, Start der Module | machbar: Tabs sind in `ApplicationV2` eingebaut, der Phase-1-Hub ist bereits eine `ApplicationV2`. Erkennung der Eagle Module am besten über einen Manifest-`flags`-Eintrag plus API-Registrierung (Inhalt der Registerkarte, Startfunktion). Start = Oberfläche öffnen (Q15) | niedrig |
| (b) Anfragenkanal Module → Flight Control | machbar über die Konvention `game.modules.get(id).api` (Midi-QOL, Custom D&D 5e). Zugriff erst ab `setup`/`ready`, weil die Ladereihenfolge normaler Module nicht dokumentiert ist. GM-Anfragen für Spieler über die eingebaute `User#query` (kein socketlib). Versionsverträglichkeit: Versionsspanne in `relationships.requires` plus API-Versionsprüfung. **Nicht verifiziert:** Ladereihenfolge, deaktivierte Abhängigkeit, Erzwingen der Versionsspanne (Live-Test nötig) | mittel |
| (c) Versteht Foundry-API und DnD-Systemlogik | machbar; dnd5e-Erweiterungspunkte aus Phase 2 belegt; Versionswächter (`game.system.version`) empfohlen | niedrig-mittel |
| (d) Klartext ↔ Code | vorwärts abhängig von M6. Rückwärts: Daten → Editor-Daten machbar, wenn nicht abgebildete Restdaten beim Zurückschreiben erhalten bleiben; Daten → strukturierte Zusammenfassung mit dnd5e-eigenen, lokalisierten Labels sofort machbar; Daten → natürlichsprachiger Satz nur für bekannte Strukturen (Vorlagen), sonst Feldliste | mittel |
| (e) Phase-1-Code | Registry-Lesen/-Schreiben und Paketdaten-Lesen sind Bausteine für einen Eagle-only-Hub (mit Filter); Konflikt-Überwachung hat keinen Bezug zu Q1 a. Keine Entscheidung über Entfernung | — |

Architekturhinweis: Q3 (alle Foundry-Änderungen über Flight Control) und "kein Mega-Modul" (P-G2) sind vereinbar,
solange die Schnittstelle schmal und generisch bleibt (Punkt N4).

## M6 — Bedingte Effekte ohne Fremdmodul (Referenzfall Langschwert, E3)

Belege: `dadm/m6-01-discover-output.md`, Bewertung: `dadm/m6-02-apply-output.md`.

**Verdict:** Der Referenzfall ist ohne Fremdmodul machbar. Zusatzschaden, Typ, "magisch" und "bei Treffer" sind nativ. Die Bedingung
"nur gegen Untote" fehlt im dnd5e-Kern (Issue #4477 "Add self & target conditions to damage parts" ist offen). Risiko: mittel.

| Weg | Kurz | Fazit |
|---|---|---|
| A nativ, manuell | zweite Activity vom Typ `damage` ("Zusatzschaden gegen Untote"), Bedingung im Text | keine Abhängigkeit, prüft die Bedingung nicht |
| B Prüfung beim Wurf | Hook `dnd5e.preRollDamageV2` ergänzt den Zusatzwurf anhand der Ziele | automatisch, aber ein Wurf gilt für alle Ziele: falsch bei gemischten Zielen |
| C Prüfung je Ziel bei der Anwendung | Zusatzwurf markiert, `dnd5e.preCalculateDamage` filtert je Ziel | korrekt je Ziel; die Markierung überlebt nur im Feld `properties`, Verhalten nicht verifiziert |
| D eigener Activity-Typ | registrierter Typ "bedingter Schaden" mit Bedingungsfeld | beste Bedienung, höchster Aufwand, Wirkung weiter über B/C |
| E Fremdmodul | Build-a-Bonus, Automated Conditions, Midi-QOL | ausgeschlossen (E3) |

**Empfehlung:** (1) Weg A immer erzeugen, damit Items ohne Eagle Module voll funktionieren; (2) die Bedingung zusätzlich im
dnd5e-eigenen Filterformat (`dnd5e.Filter`, `{k, v, o}`) als Daten speichern, damit eine spätere Automatik und ein mögliches natives
dnd5e-System dieselben Daten lesen; (3) Automatik als zweite Stufe mit Weg C; (4) im Editor eine endliche Liste vorgegebener Bedingungstypen
(Treffer, Kritischer Treffer, Kreaturtyp und weitere Zieldaten, Angreiferdaten). Umstände außerhalb der Daten bleiben manuell.

**Nicht verifiziert (Live-Test mit Freigabe nötig):** Verhalten unbekannter `properties`-Einträge, Ergänzen von `config.rolls` im Hook,
Darstellung eines unregistrierten Activity-Typs.

## M7 — Eagle Library: Kopieren, Zuordnung zu 2014/2024, Einmaligkeit

Belege: `dadm/m7-01-discover-output.md`, Bewertung: `dadm/m7-02-apply-output.md`.

| Teilfunktion | Verdict | Risiko |
|---|---|---|
| Eigene Compendien je Art | machbar: `createCompendium`, aber nur als **Welt-Compendium** durch den Spielleiter; jede Welt hat ihre eigene Library. "Art" = Dokumenttyp und bei Items dnd5e-Untertyp (Konvention der Library) | niedrig |
| Zuordnung 2014/2024 | machbar für Items, NPC- und Vehicle-Actors über `system.source.rules`; für Charakter-, Gruppen-, Encounter-Actors, Journale usw. gibt es in den Daten keine Version. Fallstrick: Der Anfangswert von `rules` folgt der aktuellen Welteinstellung, der Compendium-Index liefert dagegen den gespeicherten Wert | niedrig-mittel |
| "Nur einmal pro Version" | machbar über Namensvergleich im Index; Grenzen bei anderen Sprachen und bei zwei verschiedenen Einträgen desselben Namens | niedrig-mittel |
| Kopieren | machbar; Container nur mit `createWithContents`; große Mengen in Portionen (Laufzeit nicht verifiziert); Bilddateien werden nicht mitkopiert | mittel |
| Log und "Übertragung erzwingen" | machbar | niedrig |
| Verweise in sich abgeschlossen | machbar, aufwendig: Klassen-Merkmale, Zauberlisten und `@UUID`-Links verweisen per UUID auf die Original-Compendien; für "ausschließlich Eagle Library" müssen sie beim Kopieren umgeschrieben werden | mittel-hoch |

## M8 — Eagle Library: Suche, Hotkey-Schnellsuche, Drag & Drop

Belege: `dadm/m8-01-discover-output.md`, Bewertung: `dadm/m8-02-apply-output.md`.

| Teilfunktion | Verdict | Risiko |
|---|---|---|
| Suche in der Library, Registerkarte je Compendium | machbar: Namenssuche über die Indizes (kein Dokumentladen); Tabs sind Foundry-Bausteine. Volltextsuche in Beschreibungen wäre deutlich teurer | niedrig |
| Tastenkürzel außerhalb der Library, Suchleiste mit Dropdown | machbar: `game.keybindings.register` im `init`-Hook (umbelegbar), Overlay als rahmenlose `ApplicationV2` | niedrig |
| Drag & Drop ins Charakterblatt, auf die Karte, ins Journal | machbar: Ziehdaten `{type, uuid}` (die UUID steht im Index), Spieler dürfen aus Welt-Compendien ziehen | niedrig |

Baustein: dnd5e liefert einen eigenen `CompendiumBrowser` (Filter über mehrere Compendien) als Vorbild; als Grundlage nur bedingt geeignet.

## M8a — Eagle Library: Inventar aller Verweisstellen und Umschreibbarkeit (N6)

Belege: `dadm/m8a-01-discover-output.md` (Schema-Inventar und Auswertung von 4.674 dnd5e-Dokumenten), Bewertung: `dadm/m8a-02-apply-output.md`.

**Verdict: machbar, Risiko mittel** (nach M7 mittel-hoch). Von 4.674 mitgelieferten Dokumenten enthalten 1.732 (37 %) mindestens einen Compendium-Verweis (25.920 UUID-Zeichenketten,
6.941 `@UUID[`, 2.085 `@Embed[`). Alle gefundenen Stellen fallen unter zwei generische Regeln.

| Verweisart | Beispiele | Umschreibbar? |
|---|---|---|
| Volle UUID in Strukturfeldern | Item Grant/Choice, Cast, Summon, Enchant-Riders, Startausrüstung, Zauberlisten, Klassen-Journalseiten, Rolltabellen, Verbrauchsziele, Effekt-`origin`, Effekt-Änderungswerte | ja: schemaunabhängige Ersetzung aller UUID-Zeichenketten über eine Abbildungstabelle Quelle → Library |
| Links in Text | `@UUID[…]{Label}`, `@Embed[…]` | ja, gleiche Ersetzung; Label und Anker bleiben |
| Relative und lokale Verweise | `@UUID[.id#…]`, `activity=…`, `system.container`, Activity-/Effekt-IDs | kein Umschreiben, solange die IDs erhalten bleiben (`keepId`) |
| Herkunftsangaben | `_stats.compendiumSource`, `flags.dnd5e.sourceId` | Entscheidung nötig (N10) |
| Regelschlüssel | `&Reference[…]` | keine gespeicherte UUID, bleibt Systemverweis |
| Zauberlisten-Registry | `register(uuid)` | nicht umschreibbar, anzumelden; Library-Liste wird mit der Original-Liste zusammengeführt, Character Edit muss auf Library-Zauber filtern |
| Zustand, Weltverweise | Gruppen, Fahrzeuge, Encounter | gehören nicht in die Library (`toCompendium` löscht Zustand) |
| Ziele außerhalb der Library | 1.592 Verweise auf Premium-Module | nur, wenn das Ziel mitkopiert wurde |

Strategie: zwei Durchgänge (Abbildung bauen, dann schreiben), IDs erhalten, Selbstverweise bei erzwungenen Duplikaten auf das Duplikat, Verweise auf übersprungene Duplikate auf den vorhandenen Eintrag,
Ziel-UUID nach der Version des Ziels, Prüfbericht über alle Library-Dokumente. Nicht verifiziert (Live-Test mit Freigabe): `toCompendium` bei eingebetteten `_stats`, `keepId` bei großen Mengen.

## M9 — Eagle Character Edit: Startwege und Live-Abgleich

Belege: `dadm/m9-01-discover-output.md`, Bewertung: `dadm/m9-02-apply-output.md`.

| Bereich | Verdict | Risiko |
|---|---|---|
| Start aus dem Hub (nur neuer Charakter) und aus dem Charakterblatt | machbar: Kopfzeilen-Eintrag über den Hook `getHeaderControls…`; Anlegen über Flight Control | niedrig |
| Live-Abgleich | machbar; das echte Blatt aktualisiert sich von selbst. Klasse, Spezies, Hintergrund und Stufen laufen über dnd5e-Advancements, die auf einem Klon arbeiten und am Ende in einem Schritt schreiben: "live" heißt nach jedem abgeschlossenen Vorgang. Empfehlung: den dnd5e-Manager als Dialog über dem Editor verwenden | mittel |
| Attributes | machbar; Punktekauf und Standardwerte gibt es in dnd5e nicht (Editor bringt die Tabellen mit); Bonus über die gespeicherten Zuweisungen der Ability-Score-Improvements ableitbar; beim Schreiben Basis + Bonus erhalten | niedrig-mittel |
| Class (mit Level, Unterklasse) | machbar über `forNewItem`, `forLevelChange`, Unterklasse als eigenes Advancement | mittel |
| Species (mit Unterart) | machbar mit Lücke: Unterarten sind in dnd5e eigene, gleichrangige Items ohne Verknüpfung zur Art (N12) | mittel |
| Background | machbar | niedrig-mittel |
| Spells | machbar mit Grenzen: Zauberlisten aus der Registry, auf Library-Zauber gefiltert (Original- und Library-Liste werden zusammengeführt); Anzahlen für viele Klassen aus Skalenwerten und Vorbereitungsformel ablesbar; Regeln nur im Fließtext (z. B. Zauberbuch des Wizard) nicht | mittel-hoch |
| Equipment | machbar; dnd5e wendet die Ausgangsausrüstung nicht auf Charaktere an, der Editor muss Gruppen, feste Items, Kategorien und Gold selbst umsetzen | mittel |
| Bestehende Charaktere lesen | machbar; nicht aus der Library stammende Items als "extern" erhalten | mittel |

## M10 — Eagle Homebrew: Erstellen und Bearbeiten nach neuem Ablauf

Belege: `dadm/m10-01-discover-output.md`, Bewertung: `dadm/m10-02-apply-output.md`.

| Bereich | Verdict | Risiko |
|---|---|---|
| Objektarten | machbar, Aufwand gestaffelt: einfach (Loot, Tool, Weapon, Equipment, Consumable, Container), mittel (Feature, Spell, Species, Background, Rolltabelle), hoch (Class, Subclass, Facility, NPC), Sonderfälle (Encounter, Group, Vehicle, Player Character). "Item" aus der PDF-Liste hat in dnd5e keinen Typ (N15) | mittel (Umfang) |
| Anlegen mit feldgenauer Fehleranzeige | machbar (dnd5e-Dokumente lassen sich validieren) | niedrig-mittel |
| Live-Bearbeitung | machbar; Schreiben mit Debounce, andere Module reagieren auf Update-Hooks | mittel |
| Welt-Dokument und Library-Eintrag zugleich (Q9) | machbar; Foundry hat keinen laufenden Abgleich. Vorschlag: Library als Quelle, Welt-Dokument wird daraus aktualisiert (S1), passt zu "Single Source of Truth" und N6 | mittel |
| "Edit with Eagle Homebrew" für bestehende Objekte | machbar (Kopfzeile, Verzeichnis-Kontextmenü); nicht abgebildete Daten bleiben erhalten | mittel |
| Freitext-Import | zurückgestellt (Q8 c) | — |

Abhängigkeitskette: Flight Control ← Library ← Homebrew (Homebrew braucht die Library für den zweiten Eintrag).

## M11 — Eagle Journal: Einstiegspunkte in der Foundry-UI

Belege: `dadm/m11-01-discover-output.md`, Bewertung: `dadm/m11-02-apply-output.md`.

| Bereich | Verdict | Risiko |
|---|---|---|
| Einstiege "Open in Eagle Journal" und "Create Eagle Journal Note" (Hub, Blatt-Kopfzeile, Verzeichnis-Kopfzeile, Kontextmenüs) | machbar: Journal-Blatt und -Verzeichnis sind in v13 `ApplicationV2`-Klassen; die Hook-Muster `render…`, `getHeaderControls…`, `get…ContextOptions` sind belegt. Genaue Namen und Selektoren gegen das laufende Foundry bestätigen (der Foundry-Quelltext liegt lokal nicht vor) | niedrig bis niedrig-mittel |
| "Note" = neuer Journal-Eintrag im Vault (Q12 a) | machbar über Flight Control | niedrig |
| Rechte der Spieler | Anlegen von Journalen ist standardmäßig Trusted-Rolle; für den Spieler-Vault braucht es den GM-Anfrageweg oder Rollenfreigabe (Einstellung später, N1) | niedrig-mittel |
| Automatische Ablage neuer Einträge | machbar über `preCreateJournalEntry`; Geltungsbereich offen (N17) | niedrig |
| Rechtsklick "Link to…" im Editor (Vision) | nicht Teil des Auftrags; Einbindung eines Kontextmenüs in den ProseMirror-Editor nicht verifiziert | mittel (Restrisiko) |

## M12 — Einheitliche UI im Foundry-Stil über getrennte Repos

Belege: `dadm/m12-01-discover-output.md`, Bewertung: `dadm/m12-02-apply-output.md`.

**Verdict:** Ein einheitliches Aussehen im Foundry-Stil ohne eigenes Design-System ist mit den Bausteinen von Foundry v13 machbar (Risiko niedrig-mittel). Alle Kernanwendungen sind `ApplicationV2`; die Oberfläche folgt automatisch dem hellen oder dunklen Schema, solange Module keine eigenen Farben und Schriften festlegen. Nutzbar sind `HandlebarsApplicationMixin`, Tabs, der Zwei-Spalten-Baustein `CategoryBrowser` (Kategorien und Einträge, passend für Library, Hub und Editoren), eigene Formular-Elemente und Hilfsfunktionen, Dialoge, Kontextmenüs, Drag & Drop. Der Stil des dnd5e-Systems ist nicht gemeint.

| Weg zu gleichem Aussehen über sieben Repos | Einheitlichkeit | Kopplung | Anmerkung |
|---|---|---|---|
| O1 nur Foundry-Bausteine plus schriftlicher Leitfaden (Vorschlag) | mittel | keine | folgt Foundry-Updates von selbst |
| O2 geteilte Basis über Flight Control | hoch | hoch | Flight Control würde UI-Bibliothek (gegen schmale Schnittstelle) |
| O3 eigenes UI-Bibliotheksmodul | hoch | mittel | achtes Repo, Freigabe nötig |
| O4 geteilter Quellcode zur Bauzeit | hoch | keine zur Laufzeit | gemeinsames Paket, Dependency-Freigabe nötig |

Nicht verifiziert: Platzierung von Modul-Stilen in den CSS-Schichten, stabile Foundry-CSS-Klassen, Verhalten mit Fenster-Modulen (z. B. PopOut).

## M13 — Eagle Ruling: Neubewertung nach Repo-Analyse

Belege: `dadm/m13-01-discover-output.md`, Bewertung: `dadm/m13-02-apply-output.md`.

**Korrektur der Ausgangslage:** Custom D&D 5e verlangt nur in den **neuesten** Releases Foundry 14 und dnd5e 6.x. Die Releases 2.0 bis 4.1.2 laufen auf Foundry 13 mit dnd5e 5.x (4.x: 5.2.5–5.99) und damit auf dem Zielstand. Die Koexistenz aus dem PDF ist real. Dasselbe gilt für weitere Module der Quellenanalyse (Tabelle in `dadm/reference/source-analysis/README.md`, Abschnitt 4).

**Wird die Umsetzung durch die Repo-Analyse einfacher? Ja**, weil ein großer Teil der Regeländerungen keine tiefen Eingriffe braucht:

| Ebene | Verdict | Risiko |
|---|---|---|
| 1 Regel-Nachschlagewerk (170 Regelbegriffe in dnd5e 5.3.3) | machbar | niedrig |
| 2 Regel-Einstellungen (45 dnd5e-Einstellungen, etwa 25 regelrelevant) | machbar; Bestandsaufnahme erledigt | niedrig |
| 3a Konfigurationsüberschreibungen in `CONFIG.DND5E` (134 Bereiche; Custom D&D 5e nutzt über 40) | machbar; flüchtig, pro Client beim Start angewendet, rückgängig durch Entfernen | niedrig-mittel |
| 3b Hook-basierte Änderungen der Wurf-/Aktivierungspipeline | machbar | mittel |
| 3c Methoden-Wrapper (Custom D&D 5e 4.1.2 nutzt 9, darunter D20-Wurf) | nur mit libWrapper (Fremdmodul) oder fragil | hoch |
| 3d Neue Regeln als Trigger → Aktion | begrenzt (endliche Bausteinliste) | mittel |

Koexistenz mit Custom D&D 5e: beherrschbar durch Bauweise (Einfügen einzelner Schlüssel statt Ersetzen ganzer Bereiche, Hooks vor Wrappern, Änderungen sichtbar machen); im Live-System nicht geprüft. Lizenz: nur Muster, kein Code.

## M14 — Eagle Roll Out: Vorab-Plan Automationsumfang

Belege: `dadm/m14-01-discover-output.md`, Bewertung: `dadm/m14-02-apply-output.md`.

**Wie viel Automation lässt sich in das Modul packen?** Von 15 Automationsbereichen sind **12** als Eigenbau mit den offiziellen dnd5e-Hooks plausibel planbar (Aktivierungskette, Anwenden von Schaden und Effekten, Rettungswürfe, Modifikatoren, Zustände, bedingte Zusatzeffekte, Konzentration, Dauer/Over-Time, Auren, Token-Effekte, Schnellwurf-Oberfläche, Reichweite/Deckung).
Nicht empfohlen für ein erstes Roll Out: **Reaktionen, Makro-Ebene und Rückgängig-Historie**. Nativ vorhanden (dnd5e 5.3.3) und daher kaum Arbeit: Konzentration, Schadensberechnung je Ziel, Anfrage-Nachrichten für Zielwürfe, Aufladung, Beschwörung/Verwandlung/Verzauberung. Nicht vorhanden: automatisches Anwenden ohne Klick, Auren, Token-Effekte, Over-Time.
Maßstab der Größe: ATL 1,3k, RSR 2k, Active Auras 3k, Automated Conditions 31k, Midi-QOL 50k Zeilen; die empfohlene Teilmenge liegt weit unter einem Midi-Ersatz.

| Weg (Q13 c) | Kurzbewertung |
|---|---|
| P-E1 Eigenbau, nur Hooks (Vorschlag) | keine Fremdabhängigkeit, Hooks sind dokumentiert (AC5E und RSR belegen: Hooks reichen); Aufwand hoch, aber in Stufen |
| P-E2 Eigenbau mit libWrapper | tiefere Bereiche möglich; hängt an N19 (Fremdabhängigkeit) |
| P-A1 auf Midi-QOL aufbauen | drei Fremdabhängigkeiten (DAE, socketlib, libWrapper), Bindung an einen fremden Autor |
| P-A2 Koordinator über bestehende Module | steht in Spannung zu Q1 a/E6 (Fremdmodul-Wissen), dauerhaft aufwendig; AC5E und RSR sind für dnd5e 5.3.3 nicht verifiziert |

Ausbaupfad (Vorschlag): Stufe 0 Voraussetzungen (Flight Control, Homebrew-Bedingungsdaten, Ruling) → 1 kleine Bausteine (Token-Effekte, Schnellwurf, Konzentration) → 2 Modifikatoren und Zustände → 3 bedingte Zusatzeffekte (Weg C) → 4 Kernkette (Ziele, Anwenden, Rettungswürfe) → 5 Auren und Dauer. Abgrenzung: Ruling besitzt die Definition von Regeln, Roll Out die Ausführung; jeder Bereich hat einen Besitzer und einen Ein/Aus-Schalter.

## M15 — Synthese

Belege: `dadm/m15-0*-output.md`.

`EAGLE-MODULES-PLAN.md` (für Leser ohne Vorwissen) und `dadm/eagle-modules-projektplan.md` (technische Fassung) sind auf den Stand dieser Phase gebracht: echte Modulnamen, neue Spezifikation je Modul,
Entscheidungen E1–E8, Q0–Q15, N1–N9, Ergebnisse M5–M14 und M8a, aktualisierte Abhängigkeiten und Reihenfolge (Flight Control zuerst), offene Fragen N10–N20, nur live prüfbare Punkte und Korrekturen an früheren Aussagen.
Die Milestone-Acceptance (Bestätigung durch den Projektleiter) erfolgte am 2026-09-19.

## Nachtrag zu M15: Antworten N10–N20 und Folgeprüfungen

Decision-Record: `dadm/m15-05-human-decision-output.md`. Alle Punkte N1–N20 sind beantwortet. Zwei Antworten wurden geprüft:

- **N10 (Herkunft auf der Quelle belassen):** umsetzbar und sinnvoll, weil dnd5e das Quellenbuch-Label aus der Herkunft ableitet. Gewährte Items bekommen ihre Herkunft von dnd5e neu aus den umgeschriebenen Library-UUIDs. Randfall bei manuell gezogenen Items (Legacy-Flag `flags.dnd5e.sourceId` zeigt auf die Quelle, dnd5e bevorzugt es): Vorschlag, dass Character Edit es beim Hinzufügen auf die Library-Kopie setzt (N10b).
- **N17 (Journal-Einstiege ersetzen):** machbar. Öffnen: `registerSheet` mit `makeDefault` oder je Eintrag über einen Wrapper auf `_getSheetClass`; Erstellen: Wrapper auf `JournalEntry.createDialog` (libWrapper freigegeben, N19) plus Hooks im Verzeichnis; `preCreateJournalEntry` erfasst jeden Erstellweg und ordnet ein (deckt "alle einordnen"). Risiken: Massenimporte, dnd5e-Seitenblätter, Standardblatt ist umstellbar; nur live verifizierbar (N22).

Die kleinen Rückfragen sind beantwortet: **N10b** ja (Character Edit setzt das Legacy-Flag auf die Library-Kopie), **N21** Marker automatisch beim Kopieren, von Hand änderbar, **N22** Vorschlag angenommen (Importe behalten ihre Ordnerstruktur in einem Unterordner des Vaults, Compendium- und Systeminhalte werden nicht ersetzt).

## Punkte N1–N20 (gesammelt in M5–M14; alle am 2026-09-19 beantwortet, ebenso die Rückfragen N10b, N21, N22)

Die Antworten im Wortlaut stehen in `dadm/reference/eagle-modules-aufbau.md`, der Decision-Record in
`dadm/m8-05-human-decision-output.md`.

| # | Aus | Punkt | Antwort (Wortlaut) | Bedeutung und Folge |
|---|---|---|---|---|
| N1 | M5 | Wer darf welches Modul nutzen: nur GM oder auch Spieler (z. B. Character Edit)? | "kann später in den Moduleinstellungen festgelegt werden, welches Modul von wem in wie weit genutzt werden darf" | Nutzungsrechte je Modul und Nutzer werden später in den Moduleinstellungen festgelegt. Folge: Flight Control braucht für Nutzer ohne Foundry-Rechte den GM-Anfrageweg (`User#query`). |
| N2 | M5 | Registerkarte für installierte, aber inaktive Eagle Module: nur Information zeigen oder ausblenden? | "ausblenden" | Registerkarten nur für aktive Eagle Module. Folge: Die Erkennung inaktiver Module über Manifest-`flags` entfällt, die API-Registrierung genügt. |
| N3 | M5 | In welcher Sprache erscheint der Klartext (aktive Foundry-Sprache, Englisch, Deutsch)? | "Englisch" | Der Klartext erscheint auf Englisch. Hinweis: dnd5e-Labels folgen der aktiven Foundry-Sprache; bei nicht englischer Instanz braucht englischer Klartext englische Strings (nicht geprüft). |
| N4 | M5 | Flight Control bleibt eine schmale, generische Schnittstelle; Editor-Logik bleibt in den Modulen (vereint Q3 und "kein Mega-Modul") — einverstanden? | "Editor-Logik bleibt in den Modulen" | Flight Control bleibt eine schmale, generische Schnittstelle; die Editor-Logik bleibt in den Modulen. |
| N5 | M6 | Wo läuft der Laufzeitcode der Automatik (Flight Control, Homebrew oder Roll Out) und ab wann? Vorschlag: Stufe 1 (Weg A) ohne Laufzeitcode in Homebrew, Stufe 2 (Weg C) bei Roll Out. Muss ein Homebrew-Item ohne installierte Eagle Module vollständig funktionieren? (Weg A erfüllt das) | "Vorschlag wird angenommen, erst Stufe 1 dann Stufe 2 ausbauen" | Stufe 1 (Weg A, ohne Laufzeitcode, in Homebrew), danach Stufe 2 (Weg C, bei Roll Out). |
| N6 | M7 | Sollen Verweise innerhalb kopierter Einträge (Klasse → Merkmale, Zauberlisten, `@UUID`-Links) beim Kopieren auf die Library-Kopien umgeschrieben werden (strenge Lesart von "ausschließlich Eagle Library"), oder genügt Kopieren wie es ist? | "Jede Verlinkung muss auf die Library Kopien umgeschrieben werden (sonst keine Single Source of truth mehr)" | Alle Verlinkungen werden beim Kopieren auf die Library-Kopien umgeschrieben. Folge: neuer Milestone M8a (Plan Version 2, wartet auf Freigabe). |
| N7 | M7 | Was geschieht mit Einträgen ohne gespeicherte Version? Vorschlag: nicht kopieren, protokollieren, Spielleiter entscheidet | "Wenn weder 2014 noch 2024 hinterlegt ist dann unter 2014 abspeichern, gibt es den Eintrag in 2014 schon aber in 2024 nicht, dann in 2024 abspeichern" | Ohne gespeicherte Version: standardmäßig 2014; existiert der Name in 2014 schon, in 2024 nicht, dann 2024. Existiert er in beiden: Duplikat, protokolliert (Q5); beim Erzwingen wählt der GM die Version (Rückfrage). |
| N8 | M7 | Q5 (Übertragung erzwingen) und Q4/Q6 (einmal pro Version): Was bedeutet "erzwingen"? (a) bestehenden Eintrag ersetzen (b) zweites Exemplar zulassen (c) unter geändertem Namen ablegen | "unter geändertem Namen ablegen, die Regel lautet dann Ursprungsname + \"(Duplicate)\"" | Erzwungene Übertragung legt den Eintrag als "Ursprungsname (Duplicate)" ab; weitere Duplikate werden nummeriert ("(Duplicate 2)", …) (Rückfrage). |
| N9 | M8 | (a) Suchumfang: nur Namen (schnell) oder auch Beschreibungstext (teuer)? (b) Ein Hotkey für alle Eagle Compendien oder je Art? (c) Compendien lesen direkt im Library-Modul oder über Flight Control (Q3 nennt "Änderungen")? | "nur Namenssuche, ein Hotkey für alle, wenn möglich Compendien Lesen direkt im Library Modul, compendien ändern im library modul läuft aber über flight control" | Nur Namenssuche; ein Hotkey für alle Eagle Compendien; Compendien lesen direkt im Library-Modul, Compendien ändern über Flight Control. |
| N10 | M8a | Herkunftsangaben (`_stats.compendiumSource`, `flags.dnd5e.sourceId`, `flags.core.sourceId`) in Library-Kopien: entfernen, auf die Library-Kopie umschreiben oder auf die Quelle belassen? | "Herkunftsangaben auf der Quelle belassen werden, vermutlich besser für Advancement" | Herkunftsangaben (`_stats.compendiumSource`, Legacy-Flags) bleiben in den Library-Kopien auf der Originalquelle (Prüfergebnis: `m15-05-human-decision-output.md`). |
| N11 | M8a | Bei Teilauswahl einzelner Compendien und bei unauflösbaren Zielen: Abhängigkeiten automatisch mitkopieren oder Verweise stehen lassen und melden? | "Abhängigkeiten mitkopieren" | Abhängigkeiten werden automatisch mitkopiert (Abhängigkeitsabschluss, soweit auflösbar; nicht auflösbare Verweise bleiben stehen und werden gemeldet). |
| N12 | M9 | Unterarten (Subspecies): dnd5e speichert sie als eigene, gleichrangige Spezies-Items ohne Verknüpfung. Gruppierung im Editor: (a) nach Namensschema (b) über einen Marker, den die Library pflegt (c) flach, eine Liste aller Spezies | "b" | Unterarten einer Spezies über einen Marker, den die Library an Spezies-Einträgen pflegt. |
| N13 | M9 | Neuer Charakter: (a) Wer wird Besitzer (anlegender GM, angemeldeter Spieler)? (b) Editor mitten in der Erstellung geschlossen: unfertigen Charakter behalten (über das Blatt fortsetzbar) oder löschen? | "Besitzer wird ersteinmal der Ersteller also Player wenn er erstallt, GM wenn er erstellt. Ein der Editor mitten im Erstellen beendet wird und ein unfertiger Charakter entsteht sollte man über den Sheet laut Plan wieder den Editor aufrufen können und ihn nachbearbeiten. Warum ist das hier keine Option?" | Besitzer ist zunächst der Ersteller (Spieler, wenn ein Spieler anlegt, GM, wenn der GM anlegt). Ein unfertiger Charakter bleibt bestehen und lässt sich über das Charakterblatt im Editor fortsetzen. (Die Fortsetzung über das Blatt war im Ergebnisdokument als Option enthalten, im Standalone-Plan aber nicht ausgeschrieben; Wortlaut dort korrigiert.) |
| N14 | M10 | Welt-Dokument und Library-Eintrag (Q9): (a) Quelle bei späteren Änderungen (S1 Library → Welt, S2 Welt → Library, S3 beidseitig, S4 kein Abgleich; Vorschlag S1) (b) "Edit with" auf ein Welt-Dokument ohne Library-Eintrag: Eintrag anlegen? (c) Name existiert in der Library schon (gleiche Version): "Name (Duplicate)" oder Rückfrage? | "S1 wird angenommen, b Eintrag anlegen, c \"Name (Duplicate)\"" | (a) Die Library ist die Quelle, das Welt-Dokument wird daraus aktualisiert (S1). (b) "Edit with" auf ein Welt-Dokument ohne Library-Eintrag legt den Eintrag an. (c) Existiert der Name bereits: "Name (Duplicate)", bei Wiederholung nummeriert wie bei N8. |
| N15 | M10 | Typenliste: (a) Was ist der Untertyp "Item" (dnd5e hat keinen)? (b) "Player Character" in Homebrew und Character Edit: Was soll Homebrew hier leisten? | "Item ist die Foundryseitige Hauptgruppe zu der Features, Spells, Classes etc zählen. \"Player Character\" in Homebrew ist tatsächlich von mir falsch angegeben worden, wird bereits durch Character Edit gelöst" | "Item" ist die Foundry-Hauptgruppe (Art), kein Untertyp; die Untertypen sind die 13 dnd5e-Typen (Auslegung, siehe Rückfrage). "Player Character" gehört nicht in Homebrew, das erledigt Character Edit. |
| N16 | M10 | Regelwerk-Version eines neuen Objekts: im Editor wählbar (2014/2024) oder aus der Welteinstellung `rulesVersion`? | "rulesVersion" | Die Regelwerk-Version eines neuen Objekts kommt aus der Welteinstellung `rulesVersion`. |
| N17 | M11 | (a) Welche Stellen genau für die Einstiege (Verzeichnis-Kopfzeile, Ordner-/Eintrags-Kontextmenü, Blatt-Kopfzeile, Kartennotizen, Compendium-Journale)? (b) "Open in Eagle Journal" bei Einträgen außerhalb des Vault: nur öffnen, Einordnung anbieten oder nicht anbieten? (c) Automatische Ablage für alle neuen Journal-Einträge oder nur die im Eagle Journal angelegten? | "Alle Journal Einstiege sollen auch einen Eagle Journal Einstieg haben, besser wäre sogar, falls möglich das Eagle Journal die Journal Einstiege überschreibt und nicht aus Versehen ein normaler Journal Eintrag ersrellt wird, bitte prüfen ob möglich b) Einordnung automatisch durchführen c) alle automatisch einordnen" | (a) Jeder Journal-Einstieg bekommt einen Eagle-Journal-Einstieg; besser: Eagle Journal ersetzt die normalen Einstiege, damit nicht versehentlich ein normaler Eintrag entsteht (Prüfung durchgeführt, Ergebnis unten). (b) Einordnung in den Vault automatisch. (c) Alle neuen Einträge werden automatisch eingeordnet. |
| N18 | M12 | Wie erhalten die Module ihr einheitliches Aussehen: (a) nur Foundry-Bausteine plus schriftlicher Leitfaden (O1, Vorschlag) (b) zusätzlich geteilter Quellcode zur Bauzeit (O4) (c) geteilte Laufzeit-Basis über Flight Control (O2) (d) eigenes UI-Bibliotheksmodul (O3)? | "a" | Nur Foundry-Bausteine plus schriftlicher Leitfaden (O1). |
| N19 | M13 | Darf Eagle Ruling (und später Roll Out) libWrapper als Abhängigkeit nutzen (Fremdmodul für Methoden-Wrapper, meldet Konflikte), oder soll es ohne auskommen (dann nur Konfiguration, Hooks und eigene Mini-Wrapper)? E3 verlangt eine eigene Lösung für Bedingungen, sagt aber nichts zu Wrappern | "libWrapper als Abhängigkeit freigegeben" | libWrapper ist als Abhängigkeit freigegeben (einzige Fremdmodul-Abhängigkeit). |
| N20 | M14 | Wie soll Roll Out entstehen? (a) Eigenbau nur mit Hooks (P-E1, Vorschlag) (b) Eigenbau, für tiefe Bereiche mit libWrapper (P-E2, hängt an N19) (c) auf Midi-QOL aufbauen (P-A1) (d) Koordinator über bestehende Module (P-A2). Sollen Reaktionen, Makro-Ebene und Undo dauerhaft ausgeschlossen bleiben? | "N29 b) nichts soll per se dauerhaft ausgeschlossen bleiben, ziel ist es die höchstmögliche Automationsstufe zu erreichen, in wie weit der GM die Automation möchte wird später in den Einstellungen von Roll Out spezifiziert" | Gelesen als N20 (im Text "N29") und Weg (b) Eigenbau, für tiefe Bereiche mit libWrapper. Nichts bleibt dauerhaft ausgeschlossen; Ziel ist die höchstmögliche Automationsstufe; wie viel Automation der GM will, stellt er später in den Einstellungen von Roll Out ein. |

```
artifact: human-decision
milestone: M15 (Sammelentscheidung zu den Punkten N10–N20)
phase: MONITOR
status: decided
immutable: true
date: 2026-09-19
decided-by: Projektleiter
```

## Trigger / Reason
Die im Milestone M15 vorgelegten offenen Punkte N10–N20 (Milestone-Acceptance, `dadm/m15-04-monitor-output.md`, F2) wurden beantwortet.

## Blocking Summary
Keine Blockade. Zwei Antworten verlangten eine Prüfung (N10: Wirkung auf Advancement; N17: Kann Eagle Journal die normalen Journal-Einstiege ersetzen?); sie sind unten dokumentiert. Drei kleine Rückfragen und zwei Auslegungen sind offen.

## Evidence
Antworten im Wortlaut und Bedeutung: `dadm/reference/eagle-modules-aufbau.md` (Abschnitt N10–N20); Optionen: `dadm/spezifikationsabgleich.md`.

## Final Human Decision
**approve**

| # | Entscheidung |
|---|---|
| N10 | Herkunftsangaben bleiben in Library-Kopien auf der Originalquelle |
| N11 | Abhängigkeiten werden automatisch mitkopiert |
| N12 | Unterarten über einen Marker, den die Library pflegt |
| N13 | Besitzer ist der Ersteller; ein unfertiger Charakter bleibt bestehen und wird über das Charakterblatt im Editor fortgesetzt |
| N14 | (a) Library → Welt (S1); (b) "Edit with" legt fehlenden Library-Eintrag an; (c) "Name (Duplicate)" |
| N15 | "Item" ist die Foundry-Hauptgruppe; "Player Character" entfällt in Homebrew |
| N16 | Regelwerk-Version aus der Welteinstellung `rulesVersion` |
| N17 | Alle Journal-Einstiege bekommen einen Eagle-Journal-Einstieg, Eagle Journal soll sie möglichst ersetzen; Einordnung automatisch; alle neuen Einträge werden eingeordnet |
| N18 | O1: nur Foundry-Bausteine plus schriftlicher Leitfaden |
| N19 | libWrapper als Abhängigkeit freigegeben |
| N20 | Eigenbau, für tiefe Bereiche mit libWrapper; nichts dauerhaft ausgeschlossen; höchstmögliche Automationsstufe, Grad später in den Einstellungen von Roll Out |

## Antwort auf die Frage zu N13 ("Warum ist das hier keine Option?")
Die Fortsetzung über das Charakterblatt stand im Ergebnisdokument als Option (N13 b: "behalten, über das Blatt fortsetzbar oder löschen"). Im Standalone-Plan war die Frage kürzer gefasst ("bleibt bestehen oder wird gelöscht") und nannte die Fortsetzung nicht. Der Wortlaut dort ist korrigiert; die Fortsetzung entspricht dem Startweg aus dem Charakterblatt im PDF (P-CE4).

## Prüfergebnis zu N10 (Herkunftsangaben)
Quelle: dnd5e 5.3.3 (Commit `965ad2d`).
- **Vorteil der Entscheidung:** `prepareDescriptionData` leitet das Quellenbuch-Label eines Items aus `flags.dnd5e.sourceId ?? _stats.compendiumSource` ab (`module/data/item/templates/item-description.mjs:73–76`). Bleibt die Herkunft auf der Originalquelle, zeigen Library-Kopien die richtige Quelle (Buch, Paket). Ohne Herkunft würde sie aus dem Welt-Compendium der Library abgeleitet.
- **Advancement selbst:** Gewährte Items bekommen ihre Herkunft von dnd5e neu: `createItemData` setzt `flags.dnd5e.sourceId` auf die UUID aus der Advancement-Konfiguration, also auf die nach M8a umgeschriebene Library-UUID, und `_stats` über `fromCompendium` (`module/documents/advancement/advancement.mjs:322–335`). Die Herkunft auf der Library-Kopie beeinflusst das nicht.
- **Randfall:** Manuell auf einen Actor gezogene Items tragen das Legacy-Flag `flags.dnd5e.sourceId` der Library-Kopie, also die Originalquelle. dnd5e bevorzugt dieses Flag vor `_stats.compendiumSource` beim Abgleich (Item Grant, Unterklassen-Advancement: `item-grant.mjs:118, 186`, `subclass.mjs:67, 89`). Das kann beim späteren Wiederherstellen von Advancements zu Abweichungen führen. **Vorschlag:** Character Edit setzt das Flag beim Hinzufügen auf die Library-Kopie (Rückfrage N10b).
- `Item#asGear` (NPC-Ausrüstung) holt Vorlagen über `_stats.compendiumSource` aus der Originalquelle statt aus der Library; unkritisch.
- Folge: Beim Kopieren wird die Herkunft nicht gelöscht (`toCompendium` mit `clearSource: false`; Foundry löscht sie sonst standardmäßig).

## Prüfergebnis zu N17 (Journal-Einstiege ersetzen)
Quelle: Foundry-v13-Types (Foundry-Quelltext lokal nicht vorhanden), dnd5e 5.3.3.

| Ziel | Mittel | Ergebnis |
|---|---|---|
| Zusätzlicher Einstieg an jeder Stelle | Hooks (M11) | machbar |
| Eagle Journal als Blatt zum **Öffnen** | `DocumentSheetConfig.registerSheet(JournalEntry, scope, Blatt, {makeDefault: true, themes, label})`; feinere Steuerung je Eintrag über einen libWrapper-Wrapper auf `ClientDocument#_getSheetClass` | machbar. Das Standardblatt ist je Welt/Nutzer umstellbar und konkurriert mit anderen Modulen. Wichtig: dnd5e registriert eigene Journal-Blätter und Seitenblätter (Klasse, Regel, Zauberliste, Karte; `dnd5e.mjs:191–213`). Ein Eagle-Blatt muss diese Seiten darstellen können, sonst darf es nur für Einträge im Vault gelten |
| Erstellen über die normalen Stellen **umleiten** | libWrapper-Wrapper auf `JournalEntry.createDialog`; alternativ Unterklasse über `CONFIG.JournalEntry.documentClass` (exklusiv, kollidiert mit anderen Modulen); Schaltflächen und Kontextmenü im Verzeichnis über Render- und Kontextmenü-Hooks | machbar; die Einhängepunkte des Verzeichnisses sind in den Types nicht einzeln belegt |
| **Nichts entsteht als normaler Eintrag** | `preCreateJournalEntry` läuft für **jeden** Erstellweg (Oberfläche, Programm, andere Module) und kann Ordner, Rechte und Kennzeichen des Eagle Journals setzen | machbar. Ein Verbot des Erstellens auf Programmebene ist nicht sinnvoll; stattdessen wird jeder neue Eintrag eingeordnet und gekennzeichnet (deckt N17 b und c) |
| Einträge außerhalb des Vault öffnen (b) | automatische Einordnung beim Öffnen oder Erstellen | machbar für Welt-Journale; Compendium-Einträge lassen sich nicht verschieben, nur kopieren |

Risiken: (1) Massenimporte (Abenteuer, Importer) würden bei "alle einordnen" ihre eigene Ordnerstruktur verlieren (N22); (2) das Ersetzen des Standardblatts für Systeminhalte (dnd5e-Regeln, Klassenseiten) ist heikel; (3) nur im laufenden Foundry verifizierbar (R).

## Folgen für die Planung
| Bereich | Wirkung |
|---|---|
| Library | Herkunft bleibt, Abhängigkeitsabschluss automatisch (Bestand kann stark wachsen; Bericht über nicht auflösbare Verweise), Marker für Unterarten (Entstehung offen, N21) |
| Character Edit | Besitzer = Ersteller; Fortsetzung über das Blatt; Unterarten über den Marker; Legacy-Flag setzen (N10b, Vorschlag) |
| Homebrew | S1; "Edit with" legt Library-Eintrag an; Kollision "Name (Duplicate)"; Regelwerk-Version aus `rulesVersion`; Typenliste = 13 dnd5e-Item-Typen und Actor-Typen NPC, Encounter, Group, Vehicle sowie Rolltabelle (18 Objektarten statt 19) |
| Journal | Einstiege ersetzt und ergänzt; alle neuen Einträge eingeordnet; Umsetzung mit libWrapper möglich |
| Ruling | Ebene 3c (Methoden-Wrapper) mit libWrapper machbar |
| Roll Out | Weg P-E2; keine dauerhaften Ausschlüsse; Reaktionen, Makro-Ebene und Undo werden späte Stufen; Automationsgrad in den Einstellungen von Roll Out |
| UI | O1 (Leitfaden) |

## Offene Rückfragen und Auslegungen
- **N10b:** Soll Character Edit das Legacy-Flag `flags.dnd5e.sourceId` bei hinzugefügten Items auf die Library-Kopie setzen (Vorschlag)?
- **N21:** Wie entsteht der Marker für Unterarten: automatisch beim Kopieren (z. B. aus dem Namen abgeleitet), von Hand in der Library, oder beides?
- **N22:** Journal: Wie gehen wir mit Massenimporten (Abenteuer, Importer) und Compendium-Journalen um, wenn "alle eingeordnet" werden? Vorschlag: Importe behalten ihre Ordnerstruktur innerhalb eines Unterordners des Vaults; Compendium-Journale werden nicht ersetzt.
- **Auslegung N15:** "Item" ist kein Untertyp; die Untertypenliste besteht aus den 13 dnd5e-Typen. Bitte bestätigen oder korrigieren.
- **Auslegung N20:** "N29" gelesen als N20, "b)" als Weg (b) Eigenbau mit libWrapper.

## Next Step
Pläne mit den Antworten aktualisieren (erledigt in diesem Zug); danach Bestätigung der Pläne (Milestone-Acceptance von M15) und Antworten auf die drei kleinen Rückfragen.

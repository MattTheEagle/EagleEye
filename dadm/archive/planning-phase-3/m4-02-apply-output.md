```
artifact: apply-output
milestone: M4
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m4-01-discover-output.md` (Aussagen V-… und P-…, Wortlautunterschiede)

## Klassifikation
Codes: **U** unverändert · **K** konkretisiert (gleiche Absicht, mehr Detail) · **Ä** geändert ·
**N** neu (nur im PDF) · **S** schweigt (Vision-Aussage kommt im PDF nicht vor) ·
**F** Frage an den Projektleiter nötig.

### Flight Control
| Vision | PDF | Klasse | Anmerkung |
|---|---|---|---|
| V-EE1 | P-FC1, P-FC2 | Ä | Fremdmodule entfallen (E6, bestätigt); "DnD" wird "DnD 5E System" |
| V-EE2 | — | S, **F** | Kompatibilitätserkennung mit Begründung; nach E6 für Eagle Module untereinander offen → Q1 |
| V-EE3 | P-FC3 | Ä | nur Eagle Module (E6) |
| V-EE4 | — | S, **F** | Auswirkungen von Einstellungsänderungen → Q1 |
| V-EE5 | — | S, **F** | Dependencies aktivieren/deaktivieren → Q1 |
| V-EE6 | P-FC6, P-FC7 | Ä | umformuliert; "Datenbank" und "andere Module" entfallen |
| V-EE7 | P-FC8 | U + N | "und umgekehrt" (Code → Klartext) ist neu |
| V-EE8 | P-FC7, P-CE2, P-HB5 | U/F | für Character Edit und Homebrew durch Workflow-Zeilen bestätigt, für Library, Journal, Ruling nicht wiederholt → Q3 |
| V-EE9 | — | S, **F** | Fremdmodul-Kompatibilität der Eagle Module → Q2 |
| — | P-FC4 | N | Registerkarte je installiertem Modul im Hub |
| — | P-FC5 | N, **F** | "aus dem Hub gestartet" → Q15 |

### Library
| Vision | PDF | Klasse | Anmerkung |
|---|---|---|---|
| V-EY1 | P-L1, P-L2 | K | Compendien nach Art; "wenn aktiv, falls nicht vorhanden" (Zeitpunkt des Anlegens) wird nicht wiederholt (S) |
| V-EY2 | P-L9 | U | |
| V-EY3 | P-L10 | K | zusätzlich Dropdown und Drag & Drop |
| V-EY4 | P-L6 | Ä, **F** | "zur Durchsuchung" gegen "zum Kopieren" → Q7 |
| V-EY5 | P-L8 | Ä, **F** | "gleicher Name" gegen "einmal pro Version" ohne Kriterium → Q6 |
| V-EY6 | — | **F** | Ausnahme Klassen/Spezies/Subklassen/Backgrounds neben absolut formuliertem P-L8 → Q4 |
| V-EY7 | — | S, **F** | Log und "Übertragung erzwingen" → Q5 |
| V-EY8 | P-L1 | U | |
| — | P-L3, P-L4, P-L5, P-L7 | N | 2014/2024-Trennung, Library als UI, Registerkarte je Compendium, Zuordnung nach Version |

### Character Edit
| Vision | PDF | Klasse | Anmerkung |
|---|---|---|---|
| V-EG1 | P-CE1 | K | "einfacher Charaktereditor", Sheet wird live mitbearbeitet |
| V-EG2 | — | S | Optionen aus der Library ergeben sich aus P-L1 (Single Source of Truth); nicht wiederholt |
| V-EG3 | P-CE2 | U | Änderungen laufen über Flight Control |
| V-EG4 | — | S | dynamische Anpassung der Optionen nicht wiederholt (nur in der Spells-Zeile "tatsächlich wählbar") |
| V-EG5 | P-CE5 | U | Wortlaut nahezu identisch |
| V-EG6 | P-CE6 | U | |
| — | P-CE3 | N | Start aus dem Hub nur für neue Charaktere |
| — | P-CE4 | N | Start aus dem Sheet, Auslesen bestehender Charaktere; Erstellung **und Bearbeitung** |
| — | — | **F** | Level: nirgends als Eingabe genannt → Q11 |

### Homebrew
| Vision | PDF | Klasse | Anmerkung |
|---|---|---|---|
| V-BK1 | P-HB1 | Ä, **F** | "Creator/Importer/Editor" gegen "Editor zum Erstellen" → Q8 |
| V-BK2 | P-HB3 | Ä, **F** | "Import Homebrew" fehlt → Q8 |
| V-BK3 | P-HB3 | U | Art und Unterkategorien identisch (Actor 5, Item 14) |
| V-BK4 | — | S | |
| V-BK5 | P-HB4 | Ä, **F** | Erstellen und Live-Bearbeitung statt "Create" am Ende; Zielort Library nicht genannt → Q9 |
| V-BK6 | — | S | "Create" wird zu "Edit"; im Live-Modell offen (Teil von Q9) |
| V-BK7 | — | **F** | Freitext-Import → Q8 |
| — | P-HB2, P-HB5 | N | Öffnen aus dem Hub, Workflow-Zeile |
| — | P-HB6 | N, **F** | "Edit with Eagle Homebrew" für bestehende Objekte; Ort des Einstiegs → Q10 |

### Journal
| Vision | PDF | Klasse | Anmerkung |
|---|---|---|---|
| V-TA1 bis V-TA8 | P-J2 | U | "Features bleiben ansonsten wie im Ursprungsplan"; Lesart "Ursprungsplan = Vision" → Q0 |
| — | P-J1 | N, **F** | Einstiegspunkte über Buttons/Dropdown; Begriff "Eagle Journal Note" → Q12 |

### Ruling und Roll Out
| Vision | PDF | Klasse | Anmerkung |
|---|---|---|---|
| V-PR1 bis V-PR5 | — | S | keine Funktionsänderung genannt; PDF gibt nur Prüfauftrag (P-R1) und Abgrenzung (P-R2, Entscheidung E2) → M13 |
| V-WG1 | P-W2 | U + N, **F** | Vorab-Plan zum Automationsumfang; ob die Automation im Modul selbst oder auf bestehenden Modulen entsteht → Q13 |
| V-WG2 | P-W1 | U | |

### Allgemein
| Vision | PDF | Klasse | Anmerkung |
|---|---|---|---|
| "Klarstellung zur Architektur" | P-G1, P-G2 | K | eigenes GitHub-Repo je Modul, bewusst modular (E7) |
| — | P-G3 | N | einheitliche UI im Foundry-Stil (E8) → M12 |
| — | P-G4 | N | Umbenennung; erledigt in M3 |

## Klärungsliste (Fragen an den Projektleiter)
Jede Frage nennt Auswirkung und Empfehlung. Empfehlungen sind Vorschläge, keine Annahmen;
bis zur Antwort geht nichts davon in die Recherche ein.

| # | Frage | Optionen | Empfehlung | Betrifft |
|---|---|---|---|---|
| Q0 | Wo das PDF schweigt: Gilt die Vision weiter? Und ist mit "Ursprungsplan" (Journal) die Vision gemeint? | (a) Ja, Vision gilt weiter, außer bei den einzeln gefragten Punkten; Ursprungsplan = Vision. (b) Nein, nur was im PDF steht gilt | (a) | alle |
| Q1 | Flight Control: Fremdmodul-Funktionen entfallen (E6). Gelten Kompatibilitätserkennung mit Begründung, Erkennung der Auswirkungen von Einstellungsänderungen und Aktivieren/Deaktivieren von Abhängigkeiten noch für Eagle Module untereinander? | (a) Entfallen ganz. (b) Bleiben für Eagle Module untereinander. (c) Nur die Kompatibilitätserkennung bleibt | (a). Versionsverträglichkeit getrennter Repos untersuche ich in M5 trotzdem als technische Voraussetzung, nicht als Funktion | M5 |
| Q2 | Die Vision wünscht Kompatibilität mit verbreiteten Fremdmodulen (Prime Performance, PopOut, Token Action HUD …). Bleibt das ein Ziel für die Eagle Module, auch wenn Flight Control keine Fremdmodule anbindet? | (a) Ja, weiterhin Ziel. (b) Nein, entfällt | (a) | M5, M12 |
| Q3 | Vision: Nur Flight Control spricht direkt mit Foundry und dem DnD-System, alle anderen Module nur Einbindung/UI. Gilt das weiter, auch für Library (Compendien anlegen, kopieren), Journal (Ordner, Einträge) und Ruling? | (a) Ja, alle Foundry-Änderungen über Flight Control. (b) Nur Character Edit und Homebrew laufen über Flight Control; die anderen greifen selbst zu. (c) Gemischt, ich beschreibe es | (a) | M5, M7, M11 |
| Q4 | Library: Vision überträgt Klassen, Spezies, Subklassen, Backgrounds **immer**, PDF verlangt "jeder Eintrag nur einmal pro Version". Gilt die Ausnahme noch? | (a) Entfällt, auch diese Typen nur einmal pro Version. (b) Bleibt, diese vier Typen dürfen mehrfach vorkommen | (a). Vermutung, bitte prüfen: Die Ausnahme lag vermutlich an gleichnamigen Klassen aus 2014 und 2024; die neue Trennung nach Version deckt das ab | M7 |
| Q5 | Library: Vision loggt nicht übertragene Einträge und lässt den DM die Übertragung erzwingen. Bleibt das? | (a) Ja. (b) Nein, Duplikate werden ohne Meldung übersprungen. (c) Nur Meldung, kein Erzwingen | (a) | M7 |
| Q6 | Library: Was ist "derselbe Eintrag"? Vision: gleicher Name. | (a) Gleicher Name im selben Eagle Compendium und in derselben Version. (b) Anderes Kriterium (z. B. Quelle/Buch), ich beschreibe es | (a) | M7 |
| Q7 | Library: Vision wählt Compendien "zur Durchsuchung" aus, PDF "zum Kopieren". Dieselbe Funktion? | (a) Ja: Auswahl dient nur dem Kopieren, durchsucht wird nur die Eagle Library. (b) Zusätzlich Suche direkt in ausgewählten Nicht-Eagle-Compendien | (a) | M7, M8 |
| Q8 | Homebrew: "Import Homebrew" (Freitext) aus der Vision fehlt im PDF, das nur "Create Homebrew" nennt. | (a) Entfällt ganz. (b) Bleibt Teil des Moduls. (c) Zurückgestellt, nicht Teil dieses Plans | keine; nur du kannst das entscheiden. Bei (a) fällt der schwierigste Teil (Freitext-Parsing, Risiko hoch) weg | M10 |
| Q9 | Homebrew: Wo und wann wird das Objekt angelegt? PDF: Flight Control erstellt es und editiert live; Vision: erst bei "Create", dann in die Library. | Wo: (a) als normales Welt-Dokument. (b) direkt in der Eagle Library. (c) Welt, danach per Button in die Library. (d) anderes. Wann: (1) sofort nach Wahl von Art und Unterkategorie (Live-Modell). (2) erst bei "Create" | Wann: (1), wie im PDF. Wo: keine | M10 |
| Q10 | Homebrew: Wo erscheint "Edit with Eagle Homebrew"? | (a) Kopfzeile des Dokumentblatts. (b) Kontextmenü im Verzeichnis. (c) Beides. (d) anderes | (c), analog zu Character Edit (Sheet) und Journal (überall, wo Einträge geöffnet werden) | M10 |
| Q11 | Character Edit: Wo wird das Level festgelegt? Der Class-Tab nennt nur Class, Classfeatures, Subclass, Subclassfeatures. | (a) Im Class-Tab (Class und Level). (b) Charaktere starten immer auf Level 1. (c) Eigener Bereich. (d) anderes | (a), weil bestehende Charaktere (P-CE4) ohnehin Level über 1 haben können | M9 |
| Q12 | Journal: Was ist eine "Eagle Journal Note"? | (a) Ein neuer Journal-Eintrag im Eagle-Journal-Vault. (b) Eine Karten-Notiz (Foundry Map Note), die auf einen Eagle-Journal-Eintrag zeigt. (c) anderes | keine; der Begriff ist in Foundry doppelt belegt | M11 |
| Q13 | Roll Out: Soll die Automation komplett im Modul selbst entstehen oder darf sie auf bestehenden Automationsmodulen (Midi-QOL usw.) aufbauen? | (a) Komplett eigene Implementierung. (b) Darf auf bestehenden Modulen aufbauen. (c) Vorab-Plan bewertet beides, du entscheidest danach | (c) | M14 |
| Q14 | Dateinamen: `beak-importers.md`, `prey-rules-customization.md`, `wings-automation.md` tragen noch Entwicklungsnamen. Umbenennen (Links werden angepasst)? | (a) Ja. (b) Nein | (a), passend zum Auftrag "Namen anpassen" | nur Dokumente |
| Q15 | Flight Control: "Jedes Eagle Module kann aus dem Hub gestartet werden" — Start heißt die Oberfläche des Moduls öffnen oder das Modul aktivieren/deaktivieren? | (a) Oberfläche öffnen. (b) Modul aktivieren/deaktivieren. (c) beides | (a) | M5 |

Auswirkung ohne Antwort: Q1–Q3, Q15 legen den Rahmen von M5 fest, Q4–Q7 den von M7 und M8, Q8–Q10 den von
M10, Q11 M9, Q12 M11, Q13 M14. M6 (bedingte Effekte ohne Fremdmodul, E3), M12 (UI) und M13 (Ruling) hängen von
keiner Frage ab, laufen laut Plan aber erst nach dem Stopp weiter.

## Acceptance Criteria
- AC-M4-01: Jede Aussage V-… und P-… ist in der Klassifikation genau einmal zugeordnet
- AC-M4-02: Jede Klasse **F** verweist auf eine Frage; jede Frage nennt Optionen, Auswirkung und
  Empfehlung (oder "keine")
- AC-M4-03: Klassifikation und Klärungsliste stehen im Ergebnisdokument `dadm/spezifikationsabgleich.md`
- AC-M4-04: Die Antworten des Projektleiters werden in `dadm/reference/eagle-modules-aufbau.md`
  festgehalten (nach Beantwortung)

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Die Empfehlungen in der Klärungsliste könnten wie Annahmen wirken; Gegenmaßnahme: ausdrücklich als Vorschlag gekennzeichnet, Q8, Q9 (Ort) und Q12 ohne Empfehlung | low | nein |
| R2 | Die Liste ist mit 16 Fragen lang; einzelne Fragen (Q14) sind klein. Die Reihenfolge folgt den Modulen, damit sie sich schnell durchgehen lässt | low | nein |

## Next Step
Deploy schreibt das Ergebnisdokument.

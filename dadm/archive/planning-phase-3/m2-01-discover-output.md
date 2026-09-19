```
artifact: discover-output
milestone: M2
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- PDF "Eagle Modules.pdf" (Titel im Dokument: "Eagle Modules - Aufbau"),
  3 Seiten, vom Projektleiter am 2026-09-19 geliefert
- Antworten des Projektleiters vom 2026-09-19: die vier Antworten zu Q1–Q4 der
  Quellenanalyse, seine Ergänzung "Im PDF steht ein genauerer Plan für die nächste
  Phase. Mit expliziteren Anweisungen.", die beiden AskUserQuestion-Antworten
  (Umfang der Umbenennung, Bedeutung von "Keine Fremdmodule") und die
  Bestätigung der abgeleiteten dnd5e-Linie
- `dadm/01-project-brief.md` (Entscheidungen E1–E8, Namenstabelle)
- `dadm/reference/eagle-modules-vision.md` (Format des bisherigen
  Transkripts, zum Vergleich der Darstellung)

## Inventory: Inhalt des PDFs

| Abschnitt im PDF | Inhalt | Aufzählungspunkte |
|---|---|---|
| Grundaufbau | Absatz, 4 Sätze (ein Repo pro Modul, bewusst modular, weitere Module später, kein Mega-Modul) | Absatz |
| UI-Design | Absatz, 2 Sätze (einheitlicher Stil, Foundry-UI-Stil) | Absatz |
| Module (Einleitung) | 1 Satz: echte Modulnamen statt Entwicklungsnamen, "Entsprechend anpassen" | Absatz |
| Eagle Flight Control (ehemals Eagle Eye) | Schnittstelle, Hub, Registerkarten, Start der Module, Anfragen, Klartext ↔ Code | 8 |
| Eagle Library (ehemals Eagle Eyrie) | Single Source of Truth, eigene Compendien, 2014/2024, Kopieren, Einmaligkeit pro Version, Suche, Hotkeys | 10 |
| Eagle Character Edit (ehemals Eagle Egg) | Editor, Workflow, zwei Startwege, Registerkarten, Live-Bearbeitung | 6 (davon ein Punkt mit 6 Registerkarten-Zeilen) |
| Eagle Homebrew (ehemals Eagle Beak) | Editor, Öffnen aus dem Hub, Art/Unterkategorie, Live-Bearbeitung, "Edit with Eagle Homebrew" | 9 |
| Eagle Journal (ehemals Eagle Talon) | Einstiegspunkte (Hub, Buttons, Dropdown), sonst wie Ursprungsplan | 2 |
| Eagle Ruling (Ehemals Eagle Prey) | Umsetzung prüfen nach Repo-Recherche, neben Custom D&D 5e | 2 |
| Eagle Roll Out (Ehemals Eagle Wings) | später; Vorab-Plan zum Automationsumfang | 2 |

## Beobachtungen zur Form des PDFs (Fakten, keine Interpretation)
- Der Registerkarten-Punkt im Character-Edit-Abschnitt hat sechs Zeilen; die
  Zeile zu den Spells beginnt ohne Doppelpunkt ("Spells nach Level sortiert, …"),
  die übrigen fünf mit "Name:".
- Im Homebrew-Abschnitt stehen "Actor: …" und "Item: …" als eigene
  Aufzählungspunkte auf derselben Ebene wie die anderen Punkte; die Zeile "Weapon,
  Container, Equipment, Loot, Consumable, Species" steht als eigener
  Aufzählungspunkt direkt unter der Item-Zeile, die mit "Tool," endet.
- Der erste Homebrew-Punkt hat im PDF einen fett gesetzten Aufzählungsstrich.
- Schreibweisen wie "Leveltatsächlich", "Projekplan", "vllt", "einträgen zu
  Suchen", "Eagle Ruling(Ehemals …)" und "(2014,2024)" stehen so im PDF.
- Beim Eagle-Homebrew-Punkt "Beim Öffnen Wahl zwischen "Create Homebrew", danach
  …" wird nur eine Option genannt.
- Im Eagle-Journal-Abschnitt kommt der Begriff "Eagle Journal Note" vor.
- Die Seitenumbrüche liegen nach dem Library-Punkt "… 2024er Inhalte zu 2024er
  Compendien" (Seite 1/2) und nach dem Homebrew-Punkt "… überträgt dann alles
  relevante in Eagle Homebrew" (Seite 2/3).

(Die Beobachtungen zu "Create Homebrew" und "Eagle Journal Note" gehören in die
Delta-Analyse M4; hier werden sie nur festgehalten, nicht bewertet.)

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Abschreibfehler bei der Transkription; Gegenmaßnahme: Punktezählung je Abschnitt als Proof in Deploy | low | nein |
| A1 | Grundlage ist der Text des PDFs, wie er in der Sitzung vorliegt; die Seitenbilder zeigen denselben Inhalt | info | nein |

## Open Questions
Keine für M2. Die Fragen zu Inhalt und Widersprüchen stellt M4.

## Next Step
Apply legt die Struktur des Referenzdokuments und die Transkriptionsregeln fest.

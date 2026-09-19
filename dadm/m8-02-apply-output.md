```
artifact: apply-output
milestone: M8
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m8-01-discover-output.md` (Fakten h1–h9)

## Bewertung je Teilfunktion

### Suche in der Library — **machbar, Risiko niedrig**
- Durchsucht wird nur die Eagle Library (Q7 a). Die Indizes der Eagle Compendien liegen im Speicher, sobald geladen (h1, h9); eine Trefferliste nach Namen ist eine einfache Filterung von Daten, nicht von Seitenelementen.
- **Suchumfang:** Namen (und Felder wie Typ und Version) sind ohne Dokumente verfügbar. Eine Suche im Beschreibungstext braucht Volltext-Felder im Index und ist deutlich teurer. PDF sagt nur "Suchfunktion" (R2, N9).
- Registerkarte je Compendium: dynamische Tabs aus den erkannten Eagle Compendien (Tabs sind Bausteine von Foundry, h6). Bei vielen Compendien (Untertyp × Version) braucht die Tab-Leiste eine Gliederung; das ist ein Oberflächen-Detail, keine Machbarkeitsfrage.

### Tastenkürzel außerhalb der Library — **machbar, Risiko niedrig**
- Über `game.keybindings.register` (h3), vom Nutzer umbelegbar, für Spieler nicht eingeschränkt (`restricted` aus). Die Registrierung muss vor dem Initialisieren der Bindings passieren, also im `init`-Hook des Moduls (Vorbild h4).
- Overlay mit Suchleiste und Ergebnis-Dropdown: eine `ApplicationV2` ohne Rahmen (h5) mit Eingabefeld und Liste. Tastaturbedienung (Pfeile, Enter, Esc) ist normale Oberflächenarbeit.
- "Hotkeys" steht im PDF im Plural. Mehrere Tastenkürzel sind technisch kein Problem (N9).

### Drag & Drop ins Charakterblatt und weitere Ziele — **machbar, Risiko niedrig**
- Jede Trefferzeile wird ziehbar und liefert Ziehdaten in Foundrys Format `{type, uuid}` (h6); die UUID steht im Index-Eintrag (h1). Die Blätter von dnd5e, die Karte und Journal-Editoren nehmen dieses Format an, weil es dasselbe ist, das Foundry selbst aus Compendien liefert.
- Spieler dürfen aus Welt-Compendien ziehen (h2). Ziehen einer Klasse löst beim Ablegen auf dem Charakter die dnd5e-eigene Levelauswahl aus; die dabei vergebenen Merkmale kommen aus den gespeicherten UUIDs (Bezug zu N6 aus M7).

### Lesezugriff und Q3
Suchen und Ziehen brauchen Lesezugriff auf die Compendien. Q3 a lautet "alle Foundry-**Änderungen** über Flight Control". Ob das Lesen direkt im Library-Modul oder über Flight Control läuft, ist offen (N9). Direkt lesen ist einfacher und schneller; über Flight Control wäre die Trennung strenger.

### Baustein dnd5e `CompendiumBrowser`
dnd5e liefert eine eigene Oberfläche zum Durchsuchen mehrerer Compendien mit Filtern (h7, h8). Sie ist ein Vorbild für Filter und Indexnutzung. Als Grundlage der Library eignet sie sich nur bedingt (keine Tabs je Compendium, kein Overlay, hängt an dnd5e-Interna); die Prüfung als Baustein gehört in eine Umsetzungsphase.

## Zusammenfassung
| Teilfunktion | Verdict | Risiko |
|---|---|---|
| Suche in der Library, Tabs je Compendium | machbar | niedrig |
| Tastenkürzel + Overlay mit Dropdown | machbar | niedrig |
| Drag & Drop in Blatt, Karte, Journal | machbar | niedrig |

## Nicht blockierender offener Punkt
| # | Punkt | Auswirkung |
|---|---|---|
| N9 | (a) Suchumfang: nur Namen (schnell) oder auch Beschreibungstext (teuer)? (b) Ein Hotkey für alle Eagle Compendien oder je Art (z. B. Items, Actors, Zauber)? (c) Lesen der Compendien direkt im Library-Modul oder über Flight Control (Q3 spricht von "Änderungen")? | Umfang der Oberfläche und Trennung der Zuständigkeiten |

## Acceptance Criteria
- AC-M8-01: Jede Teilfunktion hat ein Verdict mit Belegen (h1–h9)
- AC-M8-02: Ergebnis und N9 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Antwortzeit bei sehr großen Beständen und Fokusverhalten des Overlays nicht verifiziert | low | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

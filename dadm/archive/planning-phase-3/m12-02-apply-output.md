```
artifact: apply-output
milestone: M12
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m12-01-discover-output.md` (Fakten u1–u10, Risiken R1–R2)

## Was Foundry nativ mitbringt

Für Fenster, Layout und Formulare reichen die eingebauten Bausteine (u4, u5): Fenster als `ApplicationV2` mit `HandlebarsApplicationMixin`, Tabs, Zwei-Spalten-Layout mit Kategorien (`CategoryBrowser`, passend für Library-Registerkarten, Hub und Editoren), Formularfelder als eigene HTML-Elemente mit Hilfsfunktionen, Dialoge, Kontextmenüs, Drag & Drop, Suchfilter. Da das Aussehen aus dem Kern kommt, folgt es dem Hell/Dunkel-Schema und den Foundry-Updates von selbst (u2), solange Module **keine eigenen Farben und Schriften festlegen**. Das entspricht E8 ("kein eigenes Design-System"). Das System-Aussehen von dnd5e (u6) ist bewusst nicht gemeint (A1).

## Wege zu gleichem Aussehen über sieben getrennte Repos

| Weg | Beschreibung | Einheitlichkeit | Kopplung | Aufwand und Nebenwirkungen |
|---|---|---|---|---|
| **O1** Nur Foundry-Bausteine, schriftlicher Leitfaden | Jedes Modul nutzt ausschließlich Foundry-Klassen, -Elemente und -Variablen; ein kurzer Leitfaden legt Muster fest (Fensterkopf, Tab-Aufbau, Tabellen/Listen, Suchleiste, Schaltflächenreihenfolge, Abstände, Icons) | mittel: Muster werden je Modul nachgebaut und können abweichen (R2) | keine | gering; folgt Foundry-Updates und Themes von selbst; keine Abhängigkeit |
| **O2** Geteilte Basis über Flight Control | Flight Control stellt Basisklassen, Vorlagen und ein Stylesheet zur Laufzeit bereit; die Module erweitern sie | hoch | hoch: jede UI-Änderung berührt die Flight-Control-API (M5 R2) | Flight Control wird zur UI-Bibliothek; gegen N4 (schmal, generisch) und "kein Mega-Modul" |
| **O3** Eigenes Bibliotheksmodul für UI (`library: true`) | Ein zusätzliches Modul mit geteilten Bausteinen, lädt vor allen anderen | hoch | mittel: alle hängen davon ab | ein achtes Repo (neues öffentliches Ziel, Freigabe nötig, `dadm/02-safety-boundaries.md`); widerspricht nicht "modular", erhöht aber die Zahl der Pakete |
| **O4** Geteilter Quellcode zur Bauzeit | Ein gemeinsames Paket (Vorlagen, Hilfsfunktionen, Stilregeln) wird beim Bauen in jedes Modul gebündelt; kein Laufzeit-Zugriff | hoch (solange alle dieselbe Version bauen) | keine zur Laufzeit; Versionsstände der Module können auseinanderlaufen | mittel; braucht ein gemeinsames Paket (Dependency-Änderung, Freigabe, u9) |

**Empfehlung (Vorschlag):** Mit **O1** beginnen (kein Zusatzaufwand, keine Kopplung, passt zu E8 und N4) und den Leitfaden als kurzes Dokument im Projekt führen. Erst wenn sich in der Umsetzung wiederholte, gleiche Bauteile zeigen (z. B. dieselbe Suchleiste in Library und Journal), **O4** ergänzen; O2 und O3 nur, wenn eine Laufzeit-Gemeinsamkeit wirklich nötig wird. Das ist eine Empfehlung, keine Festlegung: Es gibt keine eindeutig beste Option, die Entscheidung liegt beim Projektleiter (N18).

## Risiken

- **CSS-Schichten und Klassen (R1):** Wo Modul-Stile in den Schichten stehen und welche Foundry-Klassen dauerhaft stabil sind, ist nicht belegt (u3, u10). Gegenmaßnahme: nur dokumentierte Klassen und Variablen verwenden, eigene Regeln knapp halten und mit eindeutigem Präfix je Modul versehen, damit sich Module nicht gegenseitig überschreiben.
- **Fremdmodule (Q2 a):** Fenster, die sich wie normale `ApplicationV2`-Fenster verhalten (ohne eigenen Rahmen), sind am ehesten mit Fenster-Modulen wie PopOut verträglich; **nicht verifiziert**. Das rahmenlose Overlay der Schnellsuche (M8) ist ein Sonderfall.
- **D&D-Widgets:** Zeigen die Editoren dnd5e-eigene Elemente (Vorbild `CompendiumBrowser`), mischt sich der Stil des Systems in den Foundry-Stil (u6). Empfehlung: bei den Foundry-Elementen bleiben und dnd5e-Elemente nur einzeln, bewusst und im Leitfaden benannt einsetzen.
- **Nur v13 (E1):** Das begrenzt das Risiko durch Foundry-Änderungen; die Klassen anderer Foundry-Versionen sind nicht Ziel.

## Zusammenfassung
| Bereich | Verdict | Risiko |
|---|---|---|
| Einheitlicher Look im Foundry-Stil ohne eigenes Design-System | machbar mit Foundry-Bausteinen (Fenster, Tabs, Kategorien-Browser, Formularelemente) | niedrig-mittel |
| Einheitlichkeit über sieben Repos | O1 (Leitfaden) genügt für den Start; Drift-Risiko bleibt; ergänzende Wege O2–O4 mit Kosten | mittel |
| CSS-Schichten, Klassenstabilität, Fenster-Module | nicht verifiziert | mittel |

## Nicht blockierender offener Punkt
| # | Punkt | Auswirkung |
|---|---|---|
| N18 | Wie sollen die Module ihr einheitliches Aussehen erhalten: (a) nur Foundry-Bausteine plus schriftlicher Leitfaden (O1, Vorschlag), (b) zusätzlich geteilter Quellcode zur Bauzeit (O4), (c) geteilte Laufzeit-Basis über Flight Control (O2) oder (d) ein eigenes UI-Bibliotheksmodul (O3)? | Repo- und Paketstruktur der Umsetzungsphase |

## Acceptance Criteria
- AC-M12-01: Der Optionenvergleich nennt Einheitlichkeit, Kopplung und Aufwand je Weg mit Belegen (u1–u10)
- AC-M12-02: Nicht Belegtes ist gekennzeichnet; bei fehlender klarer Bestoption entscheidet der Projektleiter (N18)
- AC-M12-03: Ergebnis und N18 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | CSS-Schichten, Klassenstabilität und Fenster-Modul-Verhalten nicht verifiziert | medium | nein |
| R2 | Drift des Aussehens bei sieben Repos ohne geteilte Bausteine | medium | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

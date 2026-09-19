```
artifact: apply-output
milestone: M14
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m14-01-discover-output.md` (Fakten a1–a7, n1–n8, Risiken R1–R2)

## Katalog der Automationsbereiche

Größenordnung nach dem Maßstab vergleichbarer Module (R1): **S** wie ATL/RSR (1–2k Zeilen), **M** wie Active Auras (3k bis etwa 10k), **L** wie ein Teilbereich von Automated Conditions (10–30k), **XL** wie Midi-QOL (über 30k).

| # | Bereich | Bestehende Module | dnd5e 5.3.3 nativ | Eigenbau nur mit Hooks? | Größe | Einschätzung |
|---|---|---|---|---|---|---|
| 1 | Aktivierungskette (Angriff → Ziel → Rettungswurf → Schaden) | Midi-QOL | Aktivierung, Hooks, Zielliste (n1) | schlanke Kette ja | M bis L | Kern von Roll Out; eine schlanke Fassung ist machbar, die volle Midi-Tiefe (XL) nicht sinnvoll |
| 2 | Schaden und Effekte automatisch auf Ziele anwenden (mit GM-Anfrageweg) | Midi-QOL | Berechnung je Ziel (n2), Bausteine (n3), Anwenden nur per Klick der Spielleitung | ja; Anwenden für Spieler über `User#query` (M5) | M | sinnvoll und gut abgegrenzt |
| 3 | Rettungswürfe der Ziele anfordern | Midi-QOL (socketlib) | Anfrage-Nachrichten (n4) | ja | S bis M | teilweise nativ, daher günstig |
| 4 | Würfelmodifikatoren aus Effekten (Vorteil/Nachteil, Boni, Auto-Erfolg) | Automated Conditions, Midi-QOL, RSR | nur Wurf-Hooks (n1) | ja (AC5E und RSR belegen: Hooks reichen) | M (Teilmenge) bis L | Bedingungen im dnd5e-Filterformat (M6) statt eigener Ausdruckssprache |
| 5 | Zustände nach Regelwerk-Version (2014/2024) | Automated Conditions | Zustandsliste konfigurierbar (n7) | ja | M | folgt der Einstellung `rulesVersion`; Bezug zu Ruling |
| 6 | Bedingte Zusatzeffekte (z. B. Kreaturtyp) | Build-a-Bonus, AC5E, Midi (Fremdmodule) | fehlt im Kern (M6) | ja (Weg C) | S bis M | von N5 für Roll Out (Stufe 2) vorgesehen |
| 7 | Konzentration | Midi-QOL | nativ (n5) | — | S | nur Komfort, wenig eigener Aufwand |
| 8 | Effektdauer, Over-Time-Effekte (Schaden am Zugbeginn) | Midi-QOL, DAE, Times-Up | Dauer nativ, Over-Time nicht (n8) | ja | M | abgegrenzt machbar |
| 9 | Auren | Active Auras | nicht vorhanden (n8) | Hooks, Entfernungsmessung, GM-Ausführung | M | Vorbild ist klein (3k Zeilen); nutzt in v13 `MeasuredTemplate`-Daten, Foundry 14 ist nicht Ziel (E1) |
| 10 | Token-Licht, -Sicht, -Größe per Effekt | ATL | nicht vorhanden (n8) | ja (nur Hooks) | S | kleinster, in sich geschlossener Baustein |
| 11 | Schnellwurf-Oberfläche (Modifikatortasten, Chat-Karten) | Ready Set Roll | Dialoge und Hooks | ja (RSR baut nur darauf) | S bis M | Lizenz: RSR ist GPL-3.0, nur Ideen, kein Code |
| 12 | Reichweite, Deckung, Flankierung, Sichtbarkeit | Midi-QOL, AC5E | Deckungsstatus teilweise | großteils | M | Besitzerfrage (a6) |
| 13 | Reaktionen und Unterbrechungen (Gelegenheitsangriff, Schutzzauber) | Midi-QOL, Chris's Premades | nein | schwierig | L bis XL | für ein erstes Roll Out nicht empfohlen |
| 14 | Makro-Ebene: On-Use-Makros, Item-Skripte, Premade-Bibliotheken | Midi-QOL, Chris's Premades | nein | — | XL | nicht empfohlen (ein Skript-Ökosystem, kein Automationsbereich) |
| 15 | Rückgängig-Historie | Midi-QOL | nein | — | M bis L | nicht empfohlen |
| — | Aufladung, Beschwörung, Verwandlung, Verzauberung | — | nativ (n6) | — | — | keine Arbeit für Roll Out |

**Abdeckung ("wie viel kann in das Modul"):** Von den 15 Bereichen sind **12** als Eigenbau mit den offiziellen dnd5e-Hooks plausibel planbar (1 bis 12); Bereich 7 und ein Teil von 3 sind nativ. Die drei aufwendigsten (Reaktionen, Makro-Ebene, Undo) sind mit Abstand am teuersten und für ein erstes Roll Out nicht empfohlen. Eine Fassung, die Midi-QOL vollständig ersetzt, liegt in der Größenordnung von dessen 50k Zeilen; die empfohlene Teilmenge liegt weit darunter (Vergleich: Automated Conditions 31k Zeilen einschließlich Werkzeugen, ATL 1,3k, RSR 2k, Active Auras 3k).

## Zwei Wege (Q13 c)

| Kriterium | **P-E1 Eigenbau, nur Hooks** | **P-E2 Eigenbau mit libWrapper** | **P-A1 auf Midi-QOL aufbauen** | **P-A2 Koordinator über bestehende Module** |
|---|---|---|---|---|
| Fremde Abhängigkeiten | keine | libWrapper (N19) | Midi-QOL, DAE, socketlib, libWrapper | die koordinierten Module (Midi-QOL, AC5E, RSR, …) |
| Verfügbarkeit auf Foundry 13 / dnd5e 5.3.3 | eigener Code, an dnd5e-Hooks gebunden | wie P-E1 | Midi-QOL v13 (dnd5e 5.2.0–5.3.99) ja | Midi ja; AC5E nur bis dnd5e 5.2 verifiziert, RSR bis 5.0.4 (a7) |
| Wartung | bei jedem dnd5e-Update zu prüfen; Hooks sind dokumentiert und stabiler als Interna (AC5E, RSR) | Wrapper hängen an Interna, brechen leichter | Roll Out bricht, wenn Midi-QOL bricht; an einen fremden Autor gebunden | Roll Out muss jeder Änderung der koordinierten Module folgen |
| Kontrolle | nur an den Hook-Punkten | größer | groß (etwa 100 Hooks von Midi) | gering |
| Passung zu Entscheidungen | gut: E3 (eigene Lösung), N4, "stets kompatibel" (Vision); Q2 a durch Bauweise | wie P-E1, plus N19 | widerspricht dem Ziel "Automation, die nicht durch Fremdänderungen ausfällt" (Vision) | steht in Spannung zu Q1 a/E6: Fremdmodul-Funktionen (Konflikt- und Besitzerwissen) entfielen für Flight Control und würden hier neu entstehen |
| Aufwand | hoch, aber in Stufen; kleine Bereiche zuerst | etwas geringer für tiefe Bereiche | niedriger für die Kernkette, hohe Bindung | niedrig für den Start, dauerhaft aufwendig |
| Lizenz | Muster aus MIT-Modulen nutzbar (Midi, AC5E, Active Auras, ATL, mit Hinweis), RSR nur als Idee | wie P-E1 | Nutzung über API/Hooks, kein Code nötig | wie P-A1 |

**Empfehlung (Vorschlag):** **P-E1** als Grundlage, Bereich für Bereich in Stufen; P-E2 nur für einzelne Bereiche, wenn N19 libWrapper erlaubt und ein Bereich ohne Wrapper nicht lösbar ist; P-A1 und P-A2 nicht als Basis. Die Entscheidung liegt beim Projektleiter (Q13 c, N20).
Jeder Bereich bekommt einen eigenen Ein/Aus-Schalter (Standard aus). Wo ein Fremdmodul denselben Bereich automatisiert, liegt die Wahl beim Nutzer; es gibt keine Erkennungsfunktion (Q1 a).

## Vorschlag für einen Ausbaupfad (Vorab-Plan, nicht verbindlich)

| Stufe | Inhalt | Begründung |
|---|---|---|
| 0 Voraussetzungen | Flight-Control-Anfragekanal und GM-Anfrageweg (M5), Bedingungsdaten aus Homebrew Stufe 1 (M6), Regel-Einstellungen aus Ruling (M13) | ohne diese fehlt die Basis |
| 1 Kleine, unabhängige Bausteine | Token-Effekte (Bereich 10), Schnellwurf-Oberfläche (11), Konzentrations-Komfort (7) | klein, sichtbar, geringes Risiko |
| 2 Modifikatoren und Zustände | Bereiche 4 und 5 mit Bedingungen im dnd5e-Filterformat, Regelwerk-Version | Grundlage für spätere Stufen, deckt viel Nutzen ab |
| 3 Bedingte Zusatzeffekte | Bereich 6, Weg C aus M6 (Stufe 2 von N5) | baut auf Stufe 2 auf |
| 4 Kernkette | Bereiche 1 bis 3: Ziele, Schaden und Effekte anwenden, Rettungswürfe anfordern | größter Nutzen, größter Aufwand |
| 5 Auren und Dauer | Bereiche 9 und 8 | eigenständig, danach |
| später/ausgeschlossen | 12 bei Bedarf, 13, 14, 15 | hoher Aufwand, wenig Nutzen im Verhältnis |

## Abgrenzung zu Eagle Ruling
Ruling besitzt die **Definition** von Regeln (Einstellungen, Konfiguration, Hook-Änderungen der Werte), Roll Out die **Ausführung** (automatisches Würfeln, Anwenden, Auren). Ein Bereich hat genau einen Besitzer (a6): z. B. "Kritischer Treffer als Regel" gehört zu Ruling, "Schaden nach dem Wurf automatisch anwenden" zu Roll Out.

## Voraussetzungen aus den anderen Eagle Modulen
Flight Control (Anfragekanal, GM-Relay, Systemwissen), Homebrew (Datenformat der Bedingungen), Ruling (Regelwerte); Library, Character Edit und Journal werden nicht gebraucht.

## Nicht blockierender offener Punkt (Grundsatzentscheidung nach Q13 c)
| # | Punkt | Auswirkung |
|---|---|---|
| N20 | Wie soll Roll Out entstehen? (a) Eigenbau nur mit Hooks (P-E1, Vorschlag) (b) Eigenbau, für tiefe Bereiche mit libWrapper (P-E2, hängt an N19) (c) auf Midi-QOL aufbauen (P-A1) (d) Koordinator über bestehende Module (P-A2). Und: Sollen Reaktionen, Makro-Ebene und Undo dauerhaft ausgeschlossen bleiben? | Zuschnitt, Abhängigkeiten und Aufwand von Roll Out |

## Acceptance Criteria
- AC-M14-01: Der Bereichskatalog nennt je Bereich vorhandene Module, native dnd5e-Funktionen, Eigenbau-Machbarkeit und Größenordnung
- AC-M14-02: Beide Wege aus Q13 c sind verglichen; Empfehlung und Grundsatzfrage (N20) sind gekennzeichnet
- AC-M14-03: Ausbaupfad, Abgrenzung zu Ruling und Voraussetzungen sind beschrieben
- AC-M14-04: Ergebnis und N20 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Größenordnungen sind Vergleichswerte, keine Schätzung | low | nein |
| R2 | Zusammenspiel mehrerer Automationsmodule nicht getestet | medium | nein |
| R3 | Hooks sind stabiler als Interna, aber dnd5e kann sie ändern; bei jedem dnd5e-Update zu prüfen | medium | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

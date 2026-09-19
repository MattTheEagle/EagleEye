```
artifact: apply-output
milestone: M2
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m2-01-discover-output.md` (geschlossen)

## Machbarkeitsbewertung: Referenzfall (magisches Langschwert, +2W6 Feuer vs. Untote)

**Verdict: Machbar, aber als Komposition zweier Mechanismen, nicht als eine
einzelne API.**

| Teil des Beispiels | Machbar über | Code nötig? |
|---|---|---|
| Basis-Waffe "Longsword" | bestehendes dnd5e-Item-Schema | nein |
| "Magic"-Kennzeichnung | `visibility.requireMagic` / Item-`properties` | nein (Detailgrad nicht 100% verifiziert, R1) |
| "+2W6 Feuerschaden" | `DamageActivityData`/`DamageData` (`number`, `denomination`, `types`) | nein |
| "bei Treffer" | inhärent in der Activity-Auslösung nach Angriffstreffer | nein |
| "gegen Untote" (Zielbedingung) | **nicht** im dnd5e-Kern, aber durch Community-Modul "Build-a-Bonus" bewiesen lösbar (Filter-UI, kein Code) | nein für den Nutzer, aber Eagle Eye bräuchte einen eigenen oder abhängigen Bedingungsmechanismus |

## Zwei Umsetzungsoptionen für den Bedingungsteil (nur zur Einordnung, keine
Implementierungsentscheidung in dieser Phase)
- **Option 1 — Abhängigkeit auf Build-a-Bonus:** schneller, bewährt, aber
  EagleEye würde von einem Fremdmodul abhängen (Aktivierungspflicht,
  Versions-/Wartungsrisiko)
- **Option 2 — eigener, babonus-inspirierter Filter-Mechanismus:** unabhängig,
  aber deutlich mehr Aufwand, im Kern eine Neuimplementierung von etwas, das
  bereits existiert

## Generalisierbarkeit über den Referenzfall hinaus
dnd5e bietet aktuell **11 Activity-Typen** (Attack, Cast, Check, Damage,
Enchant, Forward, Heal, Order, Save, Summon, Teleport, Transform, Utility) —
bewusst so breit angelegt, dass viele "normale" Item-Mechaniken ohne
Custom-Code abbildbar sind. Der Ansatz "strukturierte Eingabe -> passenden
Activity-Typ befüllen" generalisiert daher vermutlich gut für die **Mehrheit
gängiger Homebrew-Wünsche**. Grenze: Mechaniken, die keinem der 11 Typen
entsprechen (grundlegend neue Spielmechaniken), bräuchten tatsächlich
Custom-Code — dort endet die "kein Code nötig"-Eigenschaft.

**Hinweis für eine mögliche spätere Umsetzungsphase (kein verifizierter
Befund, nur Beobachtung):** Der `Enchant`-Activity-Typ wurde im Rahmen dieser
Recherche nur oberflächlich gesehen, nicht inhaltlich geprüft — könnte für
"magische Gegenstands-Boni" ggf. der nativ vorgesehene Mechanismus sein
(dnd5e nutzt Enchantments für "Base Item + aufsteckbare Verzauberung"). Wert,
in einer späteren, tieferen Recherche verifiziert zu werden, statt hier
spekulativ als Fakt zu behaupten.

## Übertragbarkeit auf andere Milestones (M4 Eyrie, M5 Egg, M7 Talon, M8 Prey)
- **M4 (Eyrie):** Wenig direkte Übertragbarkeit — Eyrie normalisiert
  bestehende Einträge, erzeugt keine neuen Activity-Strukturen
- **M5 (Egg):** Hohe Übertragbarkeit — Klassenmerkmale/Features nutzen
  ebenfalls Activities; derselbe "strukturierte Auswahl -> Activity befüllen"
  Mechanismus gilt
- **M7 (Talon):** Keine Übertragbarkeit (Journal-Struktur, keine Activities)
- **M8 (Prey):** Wie im Milestone Plan vermerkt: **Rückrichtung** (Override
  bestehender Regel-Logik statt Neuerstellung) — dieser M2-Befund ist nicht
  direkt übertragbar, eigene Recherche nötig

## Acceptance Criteria
```
AC-M2-01: Machbarkeitsbewertung für den Referenzfall dokumentiert, mit
          Quellenbelegen (dnd5e-Quellcode, offizielles Issue, Community-Modul)
AC-M2-02: Generalisierbarkeits-Einschätzung dokumentiert
AC-M2-03: Übertragbarkeit auf M4/M5/M7/M8 explizit bewertet (nicht nur
          pauschal angenommen)
```
Alle erfüllt.

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | "Magic"-Kennzeichnung nicht bis ins letzte Detail verifiziert | low | nein |
| R2 | Generalisierbarkeits-Einschätzung beruht auf der Breite der 11 Activity-Typen, nicht auf einer erschöpfenden Prüfung aller — vernünftige Stichprobe, keine Vollständigkeitsgarantie | low | nein |

## Open TBDs
| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | `Enchant`-Activity-Typ im Detail prüfen, falls dieses Projekt in eine Umsetzungsphase geht | nice-to-have | zukünftige Phase |

## Next Step
Deploy: Ergebnis in `dadm/eagle-modules-projektplan.md` übernehmen. Danach
Monitor, dann automatisch weiter mit M3 (Eagle Eye Kernfragen).

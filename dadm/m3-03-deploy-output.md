```
artifact: deploy-output
milestone: M3
phase: DEPLOY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m3-02-apply-output.md` (Regeln R1–R5, Form der Hinweise, AC-M3-01 bis AC-M3-06)

## Implementation Summary
1. Vorzustände der zehn betroffenen Dateien im Scratchpad gesichert (für die
   Rückabbildung).
2. Regel R1: Wortgenaue Ersetzung der sieben vollen Namen (169 Ersetzungen; die
   verbleibenden 5 Sonderformen der insgesamt 174 Fundstellen gingen per Hand).
3. Regeln R2/R3 von Hand: 28 Einzeländerungen in sieben Dateien (Kurzformen,
   Bindestrich-Zusammensetzungen, Plural/Genitiv, "Wings-Modul"/"Wings-Bündelung",
   zwei Abhängigkeitsdiagramme samt Einrückung der Baumzeichen).
4. Namenshinweis (Zitatblock unter dem Titel, je Dokument nur mit den dort
   vorkommenden Namen) in sieben Dokumenten; in `README.md` und `dadm/README.md`
   steht die Erstnennung "(ehemals Eagle Eye)" direkt im Satz.
5. Status-Hinweise: `EAGLE-MODULES-PLAN.md` und `dadm/eagle-modules-projektplan.md`
   (Inhalt noch Stand Planungsphase 2; Projektplan zusätzlich Hinweis zu M1–M10),
   `source-analysis/README.md` (vier Fragen beantwortet, Verweis).
6. Vision-Dokument: Hinweis-Kopf ergänzt, sonst unverändert.
7. `dadm/README.md`: Abschnitt "Aktueller Stand" auf den laufenden Stand der
   Planungsphase 3 gebracht (vorher "Bootstrap im Entwurf"), Verweis auf
   `reference/eagle-modules-aufbau.md` ergänzt.

**Abweichungen von Apply (offengelegt):**
- Der Status-Hinweis im eigenständigen Plan `EAGLE-MODULES-PLAN.md` ist ohne
  DAD-M-Fachbegriffe formuliert (kein "Milestone M15", "Planungsphase 2"), weil das
  Dokument für Leser ohne Vorwissen gedacht ist. Inhaltlich gleich.
- Eine Stelle wurde im ersten Durchgang übersehen ("Eagle Ruling/Wings" in K11 der
  Quellenanalyse); die grep-Prüfung AC-M3-01 hat sie gefunden, sie wurde
  nachgebessert (Nachbesserung im selben Milestone, kein Rework-Fund).

## Files Changed
- `EAGLE-MODULES-PLAN.md`, `README.md`
- `dadm/README.md`, `dadm/eagle-modules-projektplan.md`
- `dadm/reference/eagle-modules-vision.md` (nur Hinweis-Kopf)
- `dadm/reference/source-analysis/README.md`, `beak-importers.md`,
  `prey-rules-customization.md`, `wings-automation.md`, `techniques-catalog.md`

## Proofs
**AC-M3-01 (grep):** Entwicklungsnamen außerhalb von "(ehemals …)": **0**;
Erwähnungen innerhalb der Klammern: 31. Vorher: 174 volle Namen plus 25 Kurzform-Zeilen.

**AC-M3-02 (Rückabbildung):** Nach Entfernen der Hinweisblöcke und Umkehr-Ersetzung
weichen die Dokumente vom Vorzustand nur an diesen Stellen ab; jede einzeln
durchgesehen:

| Datei | Abweichende Stellen | Ursache |
|---|---|---|
| `EAGLE-MODULES-PLAN.md` | 10 | Kurzformen (Eyrie/Egg/Beak, Prey), Diagramm-Einrückung, vier Stellen mit dem bereits vorhandenen Ausdruck "Eagle Library" (siehe Hinweis unten) |
| `dadm/eagle-modules-projektplan.md` | 8 | Bindestrichform, Kurzformen, Plural "Eagle Eggs", Diagramm-Einrückung, "Eagle Library" |
| `source-analysis/README.md` | 2 | "M8 (Prey)", "M9 (Wings)" |
| `source-analysis/wings-automation.md` | 4 | "Wings"-Kurzformen und Zusammensetzungen |
| `source-analysis/prey-rules-customization.md` | 2 | "Eagle-Eye-Hub", Zeilenumbruch "Eagle / Prey" |
| `source-analysis/beak-importers.md` | 1 | "Eagle-Beak-Konzept" |
| `dadm/README.md` | 1 | Erstnennung im Satz |
| `README.md`, `techniques-catalog.md` | 0 | rein mechanisch |

Hinweis zu "Eagle Library": Das Wort stand in den Dokumenten schon vorher für die
Sammlung von Compendien, die das Modul Eagle Eyrie anlegt. Dieser Gebrauch bleibt
unverändert; er fällt jetzt mit dem neuen Modulnamen zusammen (siehe Liste für M15).

**AC-M3-03:** "EagleEye" (ein Wort): vorher/nachher je 1 in `EAGLE-MODULES-PLAN.md`,
`README.md`, `eagle-modules-projektplan.md`. Dateinamen: keine Umbenennung
(Verzeichnisinhalt von `source-analysis/` unverändert). Milestone-Nummern unverändert.

**AC-M3-04:** Diff des Vision-Dokuments: ausschließlich die beiden neuen Hinweiszeilen
(`2a3,4`).

**AC-M3-05 (Grammatik):** Die einzige Stelle mit Artikel ("aus der Eagle Flight
Control automatisch die technisch …") bleibt weiblich und passt zum PDF ("Die Eagle
Flight Control"). Alle übrigen Stellen artikellos oder umformuliert ("Die Aufgabe von
Eagle Character Edit wäre …", "Ein Eagle-Roll-Out-Modul müsste …", "Ob eine Bündelung
in Eagle Roll Out sinnvoller …").

## Liste überholter Aussagen für M15 (AC-M3-06)
Nur Fundstellen nach Stichwort, Stand nach der Umstellung; Zeilennummern
verschieben sich bei künftigen Änderungen. Keine dieser Stellen wurde inhaltlich
geändert.

| Thema (Entscheidung) | Fundstellen (Datei: Zeilen) |
|---|---|
| Fremdmodule als Teil der Schnittstelle (E6) | PLAN: 88, 107, 327, 362, 370 · README: 4 · Projektplan: 26, 31, 289 · source-analysis/README: 102, 237, 240 · wings: 40, 49 · techniques: 128, 132 |
| Foundry 14 / dnd5e 6.x / beide Versionen (E1) | PLAN: 17 · README: 7 · source-analysis/README: 44, 69, 71, 72, 75, 76, 230, 231 · beak: 76, 132, 181, 182 · prey: 16, 188 · wings: 73–77, 143, 144, 147, 184, 197 · techniques: 44, 189 |
| Fremdmodul (Build-a-Bonus/"Community-Modul") für Bedingungen (E3) | PLAN: 182, 187, 193 · Projektplan: 46 · source-analysis/README: 102, 198, 237 |
| Verhältnis zu Custom D&D 5e (E2: daneben, nicht darauf aufbauend) | PLAN: 28 · source-analysis/README: 172, 179, 222, 234, 235 · prey: 113, 171 · wings: 70, 114, 175 |
| Freitext-Import als Teil von Eagle Homebrew (Frage 4 in M4) | PLAN: 192, 308, 332, 350 · Projektplan: 128, 139, 219, 231, 252, 276 · source-analysis/README: 202, 222 · beak: 22, 153 |
| Codebasis "beide Versionen" (E1, M1) | README: 7 und "baut beide Versionen" im Build-Abschnitt; nach M1 zu prüfen |
| Bezeichnung "Eagle Library" für Sammlung und Modul zugleich | PLAN und Projektplan (u. a. Modulübersicht, Eyrie-Abschnitt) |

Weitere inhaltliche Verschiebung ohne Stichwort: Aussagen, die Eagle Flight Control
als "Konflikt-/Besitzerwissen" oder als Schnittstelle zu Drittmodulen beschreiben
(z. B. `wings-automation.md`, Abschnitt "Offene Punkte"); E6 macht das zur offenen
Frage 8/9 in M4.

## Acceptance Checklist
- [x] AC-M3-01 — 0 Treffer außerhalb der Klammern
- [x] AC-M3-02 — Rückabbildung: nur erwartete Stellen, einzeln durchgesehen
- [x] AC-M3-03 — "EagleEye", Modul-ID, Milestone-Nummern, Dateinamen unverändert
- [x] AC-M3-04 — Vision-Dokument nur um Hinweis-Kopf ergänzt
- [x] AC-M3-05 — Grammatik der geänderten Stellen durchgesehen
- [x] AC-M3-06 — Liste überholter Aussagen liegt vor

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Die Dokumente nennen jetzt die neuen Namen, sagen aber inhaltlich noch Dinge, die E1/E6 widersprechen. Gegenmaßnahme: Status-Hinweise (gesetzt) und Liste für M15 | medium (mitigiert) | nein |
| R2 | Zeilennummern der Liste werden bei Änderungen ungültig | low | nein |

## Next Step
Deploy für M3 geschlossen. Weiter mit Monitor für M3.

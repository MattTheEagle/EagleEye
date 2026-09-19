```
artifact: apply-output
milestone: M3
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m3-01-discover-output.md` (Inventar, Sonderformen, überholte Aussagen)

## Design der Umstellung

### Ersetzungsregeln
| # | Regel |
|---|---|
| R1 | Volle Namen, wortgenau ersetzt: Eagle Eye → Eagle Flight Control, Eagle Eyrie → Eagle Library, Eagle Egg → Eagle Character Edit, Eagle Beak → Eagle Homebrew, Eagle Talon → Eagle Journal, Eagle Prey → Eagle Ruling, Eagle Wings → Eagle Roll Out (Wortgrenze beachten, weil "Eagle Eye" der Anfang von "Eagle Eyrie" ist) |
| R2 | Kurzformen (Eyrie, Egg, Beak, Talon, Prey, Wings) werden überall zum vollen Modulnamen; keine Kurzformen ohne "Eagle", weil "Library" und "Journal" auch gewöhnliche Wörter sind |
| R3 | Sonderformen von Hand: Bindestrich-Zusammensetzungen ("Eagle-Eye-Anforderungen" → "Eagle-Flight-Control-Anforderungen" usw.), Plural/Genitiv ("Eagle Eggs Aufgabe" → "Aufgabe von Eagle Character Edit"), "Wings-Modul"/"Wings-Bündelung" → "Eagle-Roll-Out-Modul"/"Bündelung in Eagle Roll Out" |
| R4 | Unverändert bleiben: "EagleEye" in einem Wort (E5), Modul-ID, Milestone-Nummern des Projektplans (Planungsphase 2), Dateinamen, alle Codebezeichner |
| R5 | Grammatik prüfen: Artikel und Genus an jeder Stelle mit Artikel; vorhandenes "der Eagle Eye" passt zu "der Eagle Flight Control" |

### Namens- und Status-Hinweise (Form)
Erste Erwähnung je Dokument im Format "Modulname (ehemals Entwicklungsname)": Direkt
unter dem Titel steht ein Zitatblock mit den in **diesem** Dokument vorkommenden
Modulnamen, jeweils mit "(ehemals …)". Dadurch steht die Klammer einmal pro
Dokument statt an jeder Stelle (R3 aus Discover).

Zusätzlich ein Status-Hinweis, weil die Umstellung nur die Namen ändert:
- `EAGLE-MODULES-PLAN.md` und `dadm/eagle-modules-projektplan.md`: "Inhalt
  entspricht noch dem Stand der Planungsphase 2. Die Spezifikation
  `dadm/reference/eagle-modules-aufbau.md` und die Entscheidungen der Planungsphase 3
  (u. a. nur Foundry v13, Flight Control ohne Fremdmodule, eigene Lösung statt
  Fremdmodul-Bedingungen) sind noch nicht eingearbeitet (Milestone M15). Widersprüche
  zwischen beiden klärt Milestone M4." Im Projektplan zusätzlich: "M1–M10 in diesem
  Dokument sind die Milestones der Planungsphase 2, nicht die des aktuellen Plans."
- `source-analysis/README.md`: Hinweis, dass die vier offenen Fragen aus Abschnitt 5
  beantwortet sind (Verweis auf `../eagle-modules-aufbau.md`); der Text von Abschnitt 5
  selbst bleibt unverändert.
- `dadm/reference/eagle-modules-vision.md`: nur ein Hinweis-Kopf ("nutzt die
  Entwicklungsnamen; echte Namen: `eagle-modules-aufbau.md`"), Rest unverändert.

Kleine Ergänzung außerhalb der Namensumstellung: `dadm/README.md` bekommt einen
Verweis auf das in M2 angelegte Referenzdokument `reference/eagle-modules-aufbau.md`
(die Datei wird ohnehin bearbeitet, M2 hatte sie nicht aktualisiert).

Nicht in M3: inhaltliche Korrekturen an überholten Aussagen; sie werden als
Liste in den Deploy-Output geschrieben und in M15 eingearbeitet.

## Acceptance Criteria
- AC-M3-01: In den neun Dokumenten stehen die Entwicklungsnamen nur noch in den
  "(ehemals …)"-Klammern der Namenshinweise (Prüfung per grep; Zählung vorher 174
  volle Namen plus 25 Kurzform-Zeilen, nachher 0 außerhalb der Klammern)
- AC-M3-02: Rückabbildung: Wendet man auf jedes umgestellte Dokument die
  Umkehr-Ersetzung an und entfernt die Hinweisblöcke, unterscheidet es sich vom
  Vorzustand nur an den Stellen der Regeln R2/R3; jede dieser Stellen ist
  einzeln durchgesehen
- AC-M3-03: "EagleEye", Modul-ID, Milestone-Nummern, Dateinamen unverändert
- AC-M3-04: Im Vision-Dokument sind nur Hinweis-Zeilen am Anfang hinzugekommen
- AC-M3-05: Grammatik der geänderten Stellen durchgesehen (Artikel, Genus,
  Plural/Genitiv)
- AC-M3-06: Liste überholter Aussagen (mit Datei und Zeile) liegt im Deploy-Output vor

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Die Status-Hinweise sind eine Ergänzung über die reine Umbenennung hinaus. Sie sagen nur, welcher Stand das Dokument hat, und bewerten keine Inhalte; ohne sie würde ein umbenanntes Dokument aktueller wirken als es ist | low | nein |
| R2 | Widerspruch zwischen Umstellung und Immutability: archivierte Dokumente bleiben unberührt, daher enthält das Archiv weiterhin die alten Namen | info | nein |

## Next Step
Deploy führt die Ersetzung durch und dokumentiert Proofs und Liste der überholten Aussagen.

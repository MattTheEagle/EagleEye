```
artifact: discover-output
milestone: M15
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M15), Ergebnisdokument `dadm/spezifikationsabgleich.md` (M1–M14, M8a), Entscheidungsrecords (`m4-05-…`, `m8-05-…`)
- Die zu aktualisierenden Dokumente: `dadm/eagle-modules-projektplan.md` (Stand Planungsphase 2), `EAGLE-MODULES-PLAN.md` (eigenständige Fassung), `README.md` (Einleitung)
- Liste überholter Aussagen aus `dadm/m3-03-deploy-output.md`

## Inventory: Was in den beiden Dokumenten überholt war

| Thema | Vorher (Stand Planungsphase 2) | Nachher |
|---|---|---|
| Modulzuschnitt und Namen | Vision mit Entwicklungsnamen, Kernmodul mit Fremdmodul-Schnittstelle | neue Spezifikation je Modul, echte Namen, nur Eagle Module angebunden (E6, Q1 a) |
| Zielversion | Foundry v13 und v14 | nur v13 (E1); dnd5e-Linie zu Foundry 13 |
| Flight Control | Kompatibilitäts-/Auswirkungserkennung, Aktivieren von Abhängigkeiten, Fremdmodul-Zugriff | entfallen; Hub mit Tabs, Anfragekanal, Klartext ↔ Code in beide Richtungen |
| Library | Ausnahme für Klassen usw., Dedup nach Namen | einmal pro Version, 2014/2024, Verweise umschreiben, Log/Erzwingen, Suche/Hotkey |
| Character Edit | geführte Erstellung | einfacher Editor, zwei Startwege, Live-Abgleich, Level im Class-Tab |
| Homebrew | Import und Erstellung; Bedingung "gegen Untote" über Build-a-Bonus | Erstellen/Bearbeiten, Welt + Library zugleich, Import zurückgestellt, Bedingung ohne Fremdmodul |
| Journal | Vault-Funktionen | plus Einstiegspunkte (Schaltflächen, Kontextmenüs) |
| Ruling | "über 60 Regelbegriffe", Ebene 3 nur tief | 170 Begriffe, 45 Einstellungen, Ebene 3 in vier Teile |
| Roll Out | bewusst nicht bewertet | Vorab-Plan |
| Reihenfolge | Library zuerst | Flight Control zuerst (Q3 a) |
| Offene Punkte | Liste aus Planungsphase 2 | N10–N20 |

## Fakten für den Abgleich
- `EAGLE-MODULES-PLAN.md` ist für Leser ohne Vorwissen geschrieben (keine Fachbegriffe des Projektprozesses).
- `dadm/eagle-modules-projektplan.md` ist die technische Fassung mit Verweisen auf Belege.
- Die Quellenanalyse unter `dadm/reference/source-analysis/` und das Vision-Dokument bleiben Referenz und sind nicht Teil dieses Milestones (sie tragen Status-Hinweise).

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Zwei Dokumente mit überlappendem Inhalt können auseinanderlaufen | low | nein (Standalone-Plan verweist auf die technische Fassung) |
| A1 | Der Projektleiter bestätigt die Dokumente laut Acceptance; bis dahin gelten sie als Entwurf | info | ja für das Schließen von M15 |

## Open Questions
Keine.

## Next Step
Apply legt den Aufbau beider Dokumente und die Prüfungen fest.

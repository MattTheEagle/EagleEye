```
artifact: apply-output
milestone: M2
phase: APPLY
status: incomplete
date: 2026-09-17
```

## Input Summary
- `dadm/m2-01-discover-output.md` (geschlossen)
- Bestätigte Fakten: Baseline = Forge Import Wizard (offiziell, bereits 2x
  erfolgreich genutzt); Alternative = Manifest-URL via GitHub Releases (Foundry-
  Standardmechanismus); öffentliches Repo für GitHub-Route freigegeben

## Solution Design — Vergleich

### Option A: Import Wizard (Baseline)
**Vorteile**
- Bereits bekannt und zweimal erfolgreich genutzt, kein neuer Lernaufwand
- Kein externes Hosting nötig — nichts verlässt den privaten Forge-Account
- Keine Safety-Boundary-Erweiterung nötig
- Schnell für häufige, kleine Iterationen (passt zur "fein"-Milestone-Größe)

**Nachteile**
- Kein natives Foundry-Update-Check (kein "Modul aktualisieren"-Button), da kein
  Manifest mit Update-URL hinterlegt ist
- Keine für Foundry sichtbare Versions-/Release-Historie
- Nicht der von Foundry vorgesehene Standardpfad für Modul-Distribution

### Option B: Manifest-URL via GitHub Releases
**Vorteile**
- Foundry-Standardmechanismus inkl. nativem Update-Check
- Versionierte, nachvollziehbare Release-Historie — passt zum Projektanspruch
  "sauberer, detaillierter Arbeit statt Tempo"
- Hält die Tür offen, falls das Modul später doch geteilt werden soll (aktuell
  Non-Goal, aber ohne Zusatzaufwand verfügbar)
- Git-Repo existiert bereits lokal — nur Remote + Release-Workflow kommt neu dazu

**Nachteile**
- Einmaliger Einrichtungsaufwand (GitHub-Repo, Remote, Release-Prozess mit
  korrekt referenzierten URLs im Manifest)
- Erfordert öffentliches Repo — Quellcode wird sichtbar (laut Projektleiter für
  aktuelle Phase akzeptiert)
- Safety Boundaries müssen um "ausgehendes Publizieren" ergänzt werden
- Zusätzlicher Schritt pro Release (Tag + Release statt direktem Wizard-Upload)
  — bei "fein" gegliederten Milestones potenziell spürbarer Mehraufwand, wenn
  für jeden kleinen Fortschritt ein Release nötig wäre

## Empfehlung (zur Entscheidung, keine Festlegung)
Hybrid statt Entweder-Oder: **Import Wizard bleibt der Standardweg für laufende
Entwicklungs-Iterationen** (schnell, kein Overhead, bereits bewährt) — passend
zur feinen Milestone-Granularity. **GitHub + Manifest-URL wird zusätzlich
eingerichtet**, aber nur für tatsächliche Meilenstein-Abschlüsse oder wenn ein
nativer Update-Check gebraucht wird, nicht für jeden Zwischenschritt.

Das erfüllt die M2-Acceptance ("Entscheidung dokumentiert und einmal erfolgreich
durchgeführt"), ohne den Forschungscharakter des Projekts durch Release-Overhead
zu belasten. Alternative: eine reine Entscheidung für Option A oder B, falls das
klarer gewünscht ist.

## Acceptance Criteria
```
AC-M2-01: Entscheidung (Import Wizard / GitHub-Manifest-URL / Hybrid) ist vom
          Projektleiter bestätigt und hier dokumentiert.
AC-M2-02: Falls GitHub-Route (ganz oder teilweise) gewählt wird: GitHub-Repo
          angelegt, Remote verbunden, ein Test-Release einmal erfolgreich über
          Manifest-URL auf Forge installiert.
AC-M2-03: Falls GitHub-Route gewählt wird: Safety Boundaries um "ausgehendes
          Publizieren" ergänzt (bootstrap_override).
```

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | Empfehlung ist eine Workflow-Präferenz ohne "falschen" Weg — finale Wahl liegt bewusst beim Projektleiter, nicht bei mir | info | no |

## Open TBDs
| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Finale Entscheidung A/B/Hybrid einholen | blocking | Projektleiter |
| T2 | Falls GitHub: genauer Release-Workflow (Tag-Konvention, was landet im Release-Asset) | important | KI, nach T1 |

## Next Step
Rückmeldung des Projektleiters zur Empfehlung einholen, danach Deploy
entsprechend der gewählten Option ausführen.

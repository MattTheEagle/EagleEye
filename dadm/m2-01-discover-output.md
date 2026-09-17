```
artifact: discover-output
milestone: M2
phase: DISCOVER
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m1-04-monitor-output.md` (M1 geschlossen, Empfehlung: M2 startet)
- `dadm/04-milestone-plan.md` (M2-Definition)
- Beobachtung aus M1-Deploy: Projektleiter hatte lokal `v13.zip`, `v13.tar.gz`,
  `v14.zip` im Projektordner erzeugt, bevor die Module manuell auf Forge geladen
  wurden (danach aus Git ausgenommen, siehe `.gitignore`)
- Websuche zu Forge-VTT-Entwickler-Workflows für eigene/private Module

## Current-State Summary
- Projektleiter hat bereits zweimal (v13, v14) erfolgreich ein selbstgebautes
  Modul auf die eigene Forge-Instanz gebracht — funktionierender Weg existiert,
  Details des genauen Mechanismus aber noch nicht vollständig dokumentiert.
  **relevant**
- Kein GitHub-Remote für EagleEye vorhanden (nur lokales Repo). **relevant**,
  falls eine manifest-URL-basierte Alternative in Frage kommt

## Inventory

| # | Name | Beschreibung | Ort | Status |
|---|---|---|---|---|
| I1 | Baseline-Methode (Projektleiter) | **Import Wizard** im Forge Configuration Screen (Game Manager) — offiziell von Forge dokumentiertes Feature zum direkten Import von Modul-Zips, zweimal erfolgreich genutzt (M1) | Forge Configuration Screen | present, bestätigt |
| I2 | Forge-Manifest-URL-Installation | Alternative, für eigene/private Module ebenfalls offiziell unterstützt, läuft über den Install-Dialog innerhalb einer laufenden Welt (Game Manager) statt über den Configuration Screen | Forge-Foren/Community-Wiki (Websuche) | present (extern bestätigt) |
| I3 | Foundry-Standardmechanismus (generisch) | `module.json`-Manifest an stabiler URL + darin referenzierter `download`-Link auf `module.zip`, den Foundry selbst lädt | foundryvtt.com/article/module-development/ | present (extern bestätigt) |
| I4 | GitHub-Hosting für EagleEye | Für eine manifest-URL-Alternative nötig; bisher nie mit Forge verknüpft, wäre für EagleEye komplett neu | — | missing |

## Dependencies

| # | Dependency | Version | Status |
|---|---|---|---|
| D1 | GitHub-Repo (falls Manifest-URL-Alternative gewählt wird) | — | missing |
| D2 | Bestehender Forge-Account/-Instanz des Projektleiters | — | present |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Safety Boundaries regeln bisher nur lesenden/recherchierenden Netzwerkzugriff und freigabepflichtige Paket-**Downloads** — ausgehendes Publizieren (z. B. ein öffentliches GitHub-Repo) war nicht explizit erfasst | medium | **resolved** — Projektleiter hat öffentliches Repo für die aktuelle Forschungs-/Alpha-Phase explizit freigegeben (siehe Q3-Antwort). Safety-Boundaries-Ergänzung folgt, falls M2 sich für die GitHub-Route entscheidet |
| R2 | Exakter technischer Mechanismus der Baseline-Methode war unklar | medium | **resolved** — Import Wizard, offiziell dokumentiertes Forge-Feature (siehe I1) |

## Open Questions

| # | Frage | Priorität | Owner | Antwort |
|---|---|---|---|---|
| Q1 | Wie genau lief der Zip-Upload zu Forge technisch ab? | blocking | Projektleiter | **Import Wizard im Game Manager** (Configuration Screen) |
| Q2 | Gibt es für andere eigene Module bereits eine GitHub-Konvention/Account? | important | Projektleiter | **Nein** — GitHub und Forge bisher nie verknüpft, wäre für EagleEye komplett neu |
| Q3 | Repo öffentlich oder privat, falls GitHub-Alternative gewählt wird? | important | Projektleiter | **Öffentlich wäre in Ordnung** — aktuell Forschungs-/Alpha-Testing-Phase |

## Next Step
Alle Fragen aufgelöst. Apply stellt Baseline (Import Wizard) und Manifest-URL-
Alternative (via neu anzulegendem öffentlichem GitHub-Repo) gegenüber und
arbeitet eine Empfehlung aus.

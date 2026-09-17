# Scope Declaration — EagleEye

retention: durable

Alles, was hier nicht aufgeführt ist, gilt per Default als off-limits. Diese
Deklaration wird von ScopeGuard referenziert — jeder Schreibzugriff außerhalb des
deklarierten Scopes gilt als Scope-Verletzung und muss vor Fortsetzung explizit
freigegeben werden.

- `./core/` — gemeinsame Logik (Manifest-Scanning, Kompatibilitätslogik, Settings-Hub,
  Sprach-Erkennung, Übersetzer-Prototyp)
- `./v13/` — Entry-Point + Modul-Manifest für Foundry VTT v13
- `./v14/` — Entry-Point + Modul-Manifest für Foundry VTT v14
- `./dadm/` — Projekt-Artefakte (Brief, Safety Boundaries, Scope Declaration,
  Milestone Plan, Approvals, Human-Decision-Records, BIOS-Registry)
- `./test-fixtures/` — statische Dummy-Module für Milestone-Proofs (kein Build,
  keine echte Funktionalität), seit M4
- Projekt-Root-Konfigurationsdateien (z. B. `package.json`, `tsconfig.json`,
  Build-Config, `.gitignore`, `README.md`) im Wurzelverzeichnis von EagleEye

Nicht Teil des Scopes ohne explizite Freigabe:
- andere Projektordner unter `/run/media/matt/Data/matt/Coding` (nur read-only
  Recherchezugriff gemäß Safety Boundaries)
- die produktive Forge-Instanz selbst außerhalb dessen, was zum Testen/Deployen des
  Moduls notwendig ist

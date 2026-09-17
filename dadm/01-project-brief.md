# Project Brief — EagleEye

retention: durable

## Projektname
EagleEye

## Ziel
Übergeordnetes Foundry-VTT-Modul als Kommunikationsschnittstelle zwischen:
- eigenen, zukünftig entwickelten Modulen
- Foundry-VTT-Modulen von Drittentwicklern
- TTRPG-System-Modulen für Foundry
- Foundry VTT selbst

Primärer, konkreter Treiber ist die saubere Unterstützung eigener **DnD 5e**-Module.
EagleEye selbst bleibt dabei system-agnostisch aufgebaut (siehe Non-Goals).

**Update nach M7 (2026-09-17):** Die Multi-System-Übersetzer-Funktion wurde nach
Machbarkeitsstudie gestrichen (siehe `dadm/m7-02-apply-output.md`) — kein
generisches Datenschema über Foundry-Systeme hinweg, reales Präzedenzbeispiel
("Actor Export") bestätigt, dass selbst der einfachere Export-Fall nur über
handgeschriebene Pro-System-Provider lösbar ist. Als Nice-to-have für mögliche
zukünftige, dediziert darauf ausgerichtete Projekte vorgemerkt, nicht Teil von
EagleEye. Der DnD5e-Fokus sowie die übrigen Funktionen (Kompatibilitäts-
erkennung, Settings-Hub, Konflikt-Erkennung, Spracherkennung) sind davon
unberührt.

## Funktionen
- Zentrale Bündelung aller Einstellungen zukünftiger eigener Module an einer Stelle
- Kompatibilitätserkennung zwischen eigenen Modulen
- Kompatibilitätserkennung mit fremden Modulen
- Erkennung der Sprache installierter Systeme/Module
- Wo technisch möglich: Übersetzer-Rolle zwischen Modulen, Systemen und Foundry

## Messbarer Endzustand
Kein festes Enddatum/Abnahmekriterium — das Projekt ist primär Machbarkeitsforschung:
Kann ein zentrales Modul die eigenen künftigen Module steuern und sie damit mit
Foundry, den installierten Systemen und Fremdmodulen verknüpfen? Der Erfolg wird pro
Milestone anhand der jeweiligen Acceptance Criteria in der Milestone Plan bewertet.

## Technologien / Umfeld
Gemeinsam erarbeitet und vom Projektleiter bestätigt:
- TypeScript + esbuild (kein Vite — kein lokaler Dev-Server nötig, da Forge-only)
- Monorepo: gemeinsamer `core`-Quellcode + dünne Entry-Points/Manifeste für v13 und v14
- Node.js 24 einheitlich für beide Versionen (v14-Pflicht, v13 kompatibel)
- Prinzip "beobachtend zuerst": `libWrapper` nur als Fallback, wenn Funktionen ohne
  tiefe Eingriffe nachweislich nicht realisierbar sind — nicht als Standardweg
- `socketlib` vorerst zurückgestellt (kein bekannter Live-Sync-Bedarf)
- `foundry.utils.isNewerVersion` (Core-API) für Versionsvergleiche statt Fremd-Lib
- Testing: Quench (freigabepflichtig vor jeder Ausführung, siehe Safety Boundaries)
  + Vitest ergänzend für reine Logik ohne Foundry-Kontext
- Kein UI-Framework (React/Vue/Svelte) als aktuelle Präferenz — keine Hard Rule,
  in späteren Milestones neu bewertbar
- Deployment auf Forge: offene Frage, wird in Discover M2 geklärt (Vergleich mit
  bisheriger Vorgehensweise des Projektleiters)

## Zeitrahmen
Irrelevant — reines Forschungs-/Testprojekt. Fokus liegt auf sauberer, detaillierter
Arbeit statt Tempo.

## Non-Goals
- Kein Modul für ein spezifisches System (EagleEye selbst bleibt system-agnostisch)
- Kein Modul zur UI-Anpassung
- Kein Frontend-Modul außer zur Verwaltung eigener Module

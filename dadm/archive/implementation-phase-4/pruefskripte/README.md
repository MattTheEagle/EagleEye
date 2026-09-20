# Prüfskripte der Umsetzungsphase 4 (Referenz)

status: gesichert am 2026-09-20 aus dem Scratchpad der Sitzung; die Skripte sind unverändert und werden nicht gepflegt
retention: durable (Nachschlagematerial)

Das waren Wegwerf-Werkzeuge der Deploy- und Monitor-Phasen. Sie sind **kein** Teil des Moduls und werden weder mitgebaut noch getestet. Was dauerhaft nötig war, steht als Test im Repo (`core/*.test.ts`, seit M8 auch `core/api-contract.test.ts` und `core/manifest.test.ts`). Hier liegen sie als Referenz für den Fall, dass Flight Control in einer späteren Phase erweitert wird und dieselben Prüfungen (Zwei-Client-Simulation, Gegenproben) wieder gebraucht werden. Neue Prüfungen gehören als Tests ins Repo; diese Skripte sind Vorlagen.

**Vor dem Lauf beachten**
- Die Skripte enthalten **feste Pfade**: den Repo-Pfad `/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/` und teils den Scratchpad der damaligen Sitzung (`/tmp/claude-1000/…/scratchpad/`, zum Beispiel in `mutate-m7-shell.mjs` und `build-m7-packages.mjs`). Anpassen, bevor du sie startest.
- Voraussetzung: Node 24, `npm install` im Repo (esbuild, Vitest) und für die Simulationen das gebaute Bundle `v13/dist/module.js` (`npm run build`).
- Die Gegenproben verstellen Dateien im Repo und stellen sie danach wieder her. Nach einem Abbruch `git status` und `git diff` prüfen.

## Zwei-Client-Simulationen (echtes Bundle, echte Testmodule, gefälschtes Foundry)

| Skript | Prüft | Stand am 2026-09-20 |
|---|---|---|
| `sim-m5.mjs` | M5: die Weiterleitung Spieler → Spielleiter mit zwei gefälschten Clients (unter anderem ohne Spielleiter, abgelehnte Nachrichten) | läuft mit dem heutigen Bundle |
| `sim-m6a.mjs` | M6a: die Bestätigung des Nutzers, ein veränderter Client mit gefälschten Angaben, ein Client, der nie antwortet | läuft |
| `sim-m6b.mjs` | M6b: die Rechte mit einem Spielleiter, einem Assistenten und drei Spielern; die Rechte werden wie im Hub über `applyRightsInput` geschrieben; lädt `sim-rights.js` | läuft; **zwei Erwartungen sind seit M7 veraltet** ("genau vier Mitglieder", "API-Version 0.6.0"), sie schlagen an |
| `sim-m7.mjs` | M7: alle Zustände des Systemwächters, mit denselben gepatchten Bündeln wie die Prüfpakete (`variants-m7.mjs`) | läuft |
| `sim-spike.mjs` | der M6-Spike: das Testmodul `eagleeye-spike-query` gegen gefälschte Clients | historisch |
| `sim.ts` | frühe Prüfung von Hub-Logik und Anmeldung mit den Testmodulen gegen den Kern | historisch (aus M3 und M4); gegen den heutigen Kern neu bauen und die Erwartungen prüfen |
| `sim-rights-entry.ts` | Einstiegspunkt für das Bündel `sim-rights.js`, das `sim-m6b.mjs` lädt | |

Erzeugte Dateien sind nicht gesichert, weil sie vom Kernstand abhängen. Bauen (im Repo-Ordner, mit den Pfaden dieses Ordners):
- `sim-rights.js` für `sim-m6b.mjs`: `npx esbuild sim-rights-entry.ts --bundle --format=iife --global-name=RightsMod --outfile=sim-rights.js` (am 2026-09-20 nachgebaut: gleich dem ursprünglichen Bündel bis auf die Pfad-Kommentarzeile).
- `sim.mjs` aus `sim.ts`: `npx esbuild sim.ts --bundle --format=esm --platform=node --outfile=sim.mjs`.

## Gegenproben (eine Stelle verstellen; die Prüfung muss anschlagen)

| Skript | Verstellt und erwartet |
|---|---|
| `mutate.mjs` | frühe Gegenproben am Anfragekern `core/request-kernel.ts` (`node mutate.mjs <Buchstabe>`) |
| `mutate-m5.mjs`, `mutate-m6a.mjs`, `mutate-m6b.mjs`, `mutate-m7.mjs` | je Milestone Stellen in `core/` (Relais, Identität, Kern, Rechte, Wächter, API); der Vitest-Lauf muss rot werden |
| `mutate-m7-shell.mjs` | die Foundry-Hülle, die Vitest nicht abdeckt: ein Fehler im Quelltext, ein neu gebautes Bundle, die Simulation `sim-m7.mjs` muss fehlschlagen |
| `mutate-m8.mjs` | M8: 63 Verstellungen in Vertrag, Code, Manifest und `package.json` gegen `core/api-contract.test.ts` und `core/manifest.test.ts` (`node mutate-m8.mjs [Kennung]`); alle 63 wurden gefunden |

## Prüfungen von Vertrag, Leitfaden und Paket

| Skript | Prüft | Stand |
|---|---|---|
| `check-contract.mjs`, `check-m3-contract.mjs` bis `check-m7-contract.mjs`, `api-version.mjs` (Hilfsdatei) | den Vertrag gegen den Code, je nach Stand des Milestones | **abgelöst durch `core/api-contract.test.ts`**; gegen den heutigen Vertragstext schlagen sie teilweise an (die alten Bezeichnungen "part n") |
| `check-ui-guide.mjs` | die Belege des UI-Leitfadens (Foundry-Referenz und Symbole im Hub) | läuft; zwei bekannte Fehlalarme bei R-14 (HTML-Elemente werden als Dateipfade gelesen) |
| `check-package.mjs` | `v13/package.mjs` in einem Nachbau des Repos: ein Lauf, der gelingt, und 13 Fehlerfälle (16 Prüfungen) | läuft |
| `build-m7-packages.mjs`, `variants-m7.mjs` | Bau der Live-Check-Zips von M7 (Standard und vier Prüfpakete mit einem gepatchten Bundle) | historisch |

**Nicht gesichert:** Skripte, die nur Dokumente bearbeitet haben (Ersetzungen im Vertrag, in Plänen und in Outputs), erzeugte Bündel, Zips, Ausgabedateien und Sicherungskopien.

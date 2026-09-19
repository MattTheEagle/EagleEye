```
artifact: discover-output
milestone: M5
phase: DISCOVER
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/04-milestone-plan.md` (M5-Definition)
- `dadm/m4-04-monitor-output.md` (Empfehlung: weiter mit M5)
- `dadm/m3-04-monitor-output.md` (F3: `availability`-Fund aus M3 als Basiswissen
  wiederverwenden, nicht neu erforschen)
- Websuche zu libWrapper (Drittanbieter-Library, kein Foundry-Core — daher nicht
  in der gepinnten `foundry-vtt-reference-*`-Referenz enthalten)
- Reales Beobachtungsmaterial: `libWrapper-api.js` Version 1.13.5.1 bereits in
  der Forge-Testwelt des Projektleiters aktiv (aus M1/M4-Konsolen-Logs bekannt)

## Current-State Summary
- M3 hat bereits geklärt, was Foundry **aus Manifest-Daten** erkennt
  (`availability`, `getVersionBadge()`). M5 muss sich auf das konzentrieren,
  was **darüber hinausgeht** — Laufzeit-/Verhaltenskonflikte, die aus
  Manifest-Feldern allein nicht ableitbar sind. **relevant**

## Rechercheergebnis: Was ist über Manifest-Daten hinaus erkennbar?

### 1. libWrapper-Konfliktmeldungen (am vielversprechendsten)
libWrapper ist die de-facto-Standard-Library, mit der Module Core-Funktionen
sicher patchen, statt sich gegenseitig blind zu überschreiben. Sie bringt eine
**eigene Konflikterkennung** mit, verifiziert direkt gegen den offiziellen
README-Quelltext (`github.com/ruipin/fvtt-lib-wrapper`, `raw.githubusercontent.com`):

- Seit v1.4.0.0 werden Konflikte zwischen Modulen, die dieselbe Methode
  patchen, automatisch erkannt und als Foundry-Hooks ausgelöst
- **`libWrapper.ConflictDetected`** (exakt verifiziert): Parameter
  `(packageIdA, packageIdB, wrapperName, targets[])` — `packageIdA` ist das
  Paket, das den Konflikt ausgelöst hat (oder `«unknown»`), `packageIdB` das
  kollidierende Paket, `wrapperName` der Name der gewrappten Methode,
  `targets` die Liste aller beteiligten Target-Strings
- **`libWrapper.OverrideLost`** (ebenfalls exakt verifiziert): gleiche
  Parameterform, ausgelöst wenn ein `OVERRIDE`-Wrapper durch einen
  höher-priorisierten ersetzt wird — strukturell ähnlich nützlich
- Beide Hooks: Rückgabewert `false` unterdrückt die Nutzerbenachrichtigung
  (für EagleEye irrelevant, wir hören nur zu)
- **Grenze:** Erfasst nur Module, die tatsächlich libWrapper nutzen. Module,
  die roh monkey-patchen (schlechte Praxis, aber verbreitet), sind für diesen
  Mechanismus unsichtbar. libWrapper selbst ist außerdem nicht garantiert
  installiert — EagleEye muss dessen Abwesenheit sauber abfangen

### 2. Stacktrace-basierte Fehlerzuordnung (generisch, fragil)
Scriptpfade in Stacktraces enthalten typischerweise `modules/<module-id>/...`.
Ein globaler `window.onerror`/`unhandledrejection`-Listener könnte Fehler grob
einem Modul zuordnen. **Grenze:** Keine offizielle Foundry-API dafür, reine
Heuristik, bricht bei minifiziertem/gebündeltem Code (unsere eigenen Module
inklusive) leicht.

### 3. Foundry-interne Hook-Registry (`Hooks`)
Es gibt keine offiziell dokumentierte, stabile Public API, um zu sehen, wie
viele Listener auf einen Hook-Namen registriert sind oder von welchem Modul sie
stammen. **Grenze:** Nur über interne/undokumentierte Interna zugänglich, nicht
versionsstabil — als Ansatz zu fragil für dieses Projekt.

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | libWrapper-Konflikterkennung | Erkennt Methoden-Patch-Kollisionen zwischen Modulen, die libWrapper nutzen; Hooks `libWrapper.ConflictDetected`/`libWrapper.OverrideLost` mit exakter Parameterform verifiziert | README, github.com/ruipin/fvtt-lib-wrapper | present, verifiziert |
| I2 | libWrapper bereits live vorhanden | Version 1.13.5.1, aktiv in der Test-Welt des Projektleiters | eigene Konsolen-Logs (M1/M4) | present |
| I3 | Stacktrace-Modul-Zuordnung | Heuristische Fehlerzuordnung über Skriptpfade | allgemeines Webplattform-Wissen | present, aber fragil |
| I4 | `Hooks`-interne Registry | Undokumentiert, instabil | allgemeines Foundry-Community-Wissen | vorhanden, aber nicht belastbar |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Das ursprüngliche Milestone-Risiko ("evtl. nicht robust lösbar") bestätigt sich für den allgemeinen Fall: Nur libWrapper-basierte Konflikte sind zuverlässig erkennbar, alles andere (rohes Monkey-Patching, Performance-Interferenz, Hook-Reihenfolge-Konflikte) ist nicht robust erkennbar | high | nein — genau das ist das erwartete Forschungsergebnis von M5, kein neuer Blocker |

## Open Questions
Keine blockierenden Fragen.

## Next Step
Apply entscheidet, ob ein kleiner Prototyp gebaut wird (naheliegend: Listener
auf den echten libWrapper-Konflikt-Hook, Ausgabe im bestehenden Log/Hub), und
formuliert den Forschungsbericht mit klarer Grenzziehung (erkennbar via
libWrapper vs. nicht robust erkennbar bei rohem Monkey-Patching).

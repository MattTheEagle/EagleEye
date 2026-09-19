# M2 (mit M1) — Live-Check des Projektleiters — Ergebnis

```
artifact: live-check-output
milestone: M2 (Nachtrag zum Monitor, mit AC-M1-12)
phase: MONITOR
status: complete
date: 2026-09-19
```

retention: immutable

Nachtrag zu `m2-04-monitor-output.md` (dessen Inhalt bleibt unverändert). Anlass: Der Projektleiter wünschte einen
einmaligen, gesammelten Live-Check nach M2 (T3). Er hat ihn selbst auf Forge ausgeführt und den Konsolenauszug in
den Chat kopiert; ich habe nichts gegen Forge ausgeführt.

---

## Input Summary

- Pakete aus `v13/dist/live-check/`: Flight Control (aktueller Build 0.0.1, Bundle 4.958 Bytes) sowie die Dummy-Module
  a, b und c
- Umgebung laut Konsole: Foundry VTT v13 auf Forge, Welt mit dem dnd5e-System (Lokalisierung `systems/dnd5e/lang/en.json`)
- Eingabe: Konsolenauszug des Projektleiters (Ladevorgang der Welt), darin neben Foundry- und dnd5e-Meldungen die
  Zeilen von Flight Control und den Dummy-Modulen
- Erwartung: `m2-04-monitor-output.md`, Abschnitt "Live-Check"

---

## Beobachtung gegen Erwartung

| # | Erwartet | Beobachtet (Auszug, sinngemäß gekürzt) | Ergebnis |
|---|---|---|---|
| 1 | Startlog | `eagleeye \| ready (Foundry v13)` | erfüllt |
| 2 | API angehängt | `module.js:139 eagleeye \| API attached (v0.1.0)` | erfüllt |
| 3 | a angenommen (Log von Flight Control) | `module.js:30 eagleeye \| registered module eagleeye-dummy-a (api 0.1.0)` | erfüllt |
| 4 | a erhält `ok: true` | `eagleeye-dummy-a \| registerModule result {ok: true, module: {id: 'eagleeye-dummy-a', title: 'EagleEye Dummy Test Module A', version: '0.0.1', apiVersion: '0.1.0'}}` | erfüllt; Form wie im Vertrag |
| 5 | c abgewiesen (Log von Flight Control) | `module.js:31 eagleeye \| registration rejected for eagleeye-dummy-c: incompatible-api-version - module "eagleeye-dummy-c" requests API 9.0.0, Flight Control provides 0.1.0` | erfüllt |
| 6 | c erhält `ok: false` | `eagleeye-dummy-c \| registerModule result {ok: false, reason: 'incompatible-api-version', detail: 'module "eagleeye-dummy-c" requests API 9.0.0, Flight Control provides 0.1.0'}` | erfüllt; Form wie im Vertrag |
| 7 | keine Anmeldung von b | keine Zeile zu `eagleeye-dummy-b` | konsistent; ob b aktiv war, zeigt der Auszug nicht |
| 8 | keine roten Fehler von `eagleeye` | im Auszug keine Fehlerzeile | erfüllt (Auszug) |

Zeitliche Einordnung: Startlog und `API attached` stehen vor der Dummy-Anmeldung (die `init`-Phase), die Anmeldungen
von a und c erfolgen im `setup`, nach der dnd5e-Meldung "Setting Up Compendium Packs".

---

## Bewertung

| Kriterium | Ergebnis |
|---|---|
| **R1 / U5** (Foundry lässt `api` am Modulobjekt zu; andere Module können sie lesen) | **belegt.** Die Zuweisung im `init` lief ohne Fehler, beide Dummys fanden die API im `setup` und riefen `registerModule` erfolgreich auf. R1 (`medium`) ist **geschlossen**. |
| **AC-M2-12**, Kern: a ok, c abgewiesen, `api` erreichbar | **erfüllt** |
| AC-M2-12, b meldet sich nicht an | konsistent mit der Erwartung; die Aktivierung von b ist nicht belegt (`low`) |
| AC-M2-12, U1 (Reihenfolge der `init`-Callbacks) | **weiter unverified**; die Dummys loggen im `init` nichts. Für das Design ohne Bedeutung, da ab `setup` angemeldet wird; dass die API im `setup` vorhanden ist, ist belegt (Annahme A1 des Apply bestätigt). |
| AC-M2-12, U2 (deaktivierte Flight Control bei aktiven Abhängigen) | **nicht getestet**, weiter unverified |
| AC-M2-12, U3 (Erzwingen der `compatibility`-Spanne) | **nicht getestet**, weiter unverified |
| **AC-M1-12**: Modul lädt, Startlog | erfüllt |
| AC-M1-12: keine Konsolenfehler | erfüllt für den Auszug |
| AC-M1-12: Menü "EagleEye Hub" nicht mehr vorhanden | **nicht berichtet**, unverified (`low`); die Konsole zeigt so etwas nicht, der Blick in die Moduleinstellungen genügt |

Was der Auszug nicht zeigt: ob Dummy b aktiviert war, `Object.isFrozen(game.modules.get("eagleeye").api)`, und alle
Zeilen außerhalb des kopierten Bereichs.

---

## Folgen

1. **R1 geschlossen.** M2 ist im Kern live bestätigt; kein Rework, keine Rückkehr in Apply.
2. **Nachführung `docs/api-contract.md`, Abschnitt 6** (ausdrücklich, nicht still): Die Aussage "Foundry lässt die API
   am Modulobjekt anhängen" wechselt von *unverified* zu *verified*; neu aufgenommen ist, dass eine kompatible
   Anmeldung angenommen und eine inkompatible abgewiesen wird. U1 bis U3 bleiben als *unverified* stehen.
3. **Offene, nicht blockierende Prüfungen** (nur auf Wunsch des Projektleiters):
   - Moduleinstellungen ansehen: Menü "EagleEye Hub" darf nicht mehr auftauchen (AC-M1-12)
   - optional U2: Flight Control deaktivieren, während a aktiv ist, und Foundrys Meldung mitkopieren
4. **M3 startet** nach Working Mode: Discover und Apply eigenständig, Stopp vor dem Deploy für das "Go".

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m2-05-live-check-output.md` (dieses Dokument) | immutable |

Geändert im Zuge dieses Nachtrags: `docs/api-contract.md` (Abschnitt 6, siehe Folgen 2), `dadm/README.md`.

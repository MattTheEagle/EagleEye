# M7 — DnD-Versionswächter — Monitor Output

```
artifact: monitor-output
milestone: M7
phase: MONITOR
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m7-03-deploy-output.md` (Implementierung, Nachweise, Acceptance, Klärungen), `m7-02-apply-output.md` (Design, Übergaben), `m7-01-discover-output.md` (Fakten, offene Punkte U1 bis U5)
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: die 136 Tests gegen den Stand von M6b (die Tests aus M1 bis M6b bestehen bis auf zwei angepasste Fälle unverändert), die Simulation einschließlich des Verhaltens der Rechte aus M6b (Dummy A für einen Spieler ohne Freigabe), die Live-Check-Pakete

---

## Validation Result

**M7 hat sein Ziel erreicht, soweit es ohne Forge prüfbar ist.** Flight Control erkennt die Version des DnD-5e-Systems, kennt eine Liste getesteter Versionen (heute `5.3.3`), meldet einem GM einmal, wenn das System nicht bekannt gut ist, und beantwortet Module auf Nachfrage. Es sperrt nichts.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M7-01 bis AC-M7-06 | erfüllt (Belege im Deploy-Output) |
| AC-M7-07 (Live: Kennung und Version der Testwelt; Standardpaket `tested` ohne Hinweis; Prüfpakete zeigen die Reaktionen) | **unverified**, Anleitung unten |
| Regression M1 bis M6b | Kern, Relais, Identität, Rechte und Hub sind unverändert (`git diff` leer); 126 Tests bestehen, davon zwei angepasst (Oberfläche der API, Versionsnummer); in der Simulation verhält sich Dummy A für einen Spieler ohne Freigabe wie in M6b (`not-permitted`), unabhängig vom Zustand des Wächters |
| Gegenproben | Logik 24 von 24, Hülle 7 von 8 (der achte ist äquivalent) |
| Simulation | alle Prüfungen ok: der Standardfall, die vier Zustände über dieselben gepatchten Bundles wie die Prüfpakete, ein nicht lesbares System, ein werfender Hinweis |

---

## Evidence Summary

- **Gewollte Verhaltensänderungen:** (1) API `0.7.0`: Module mit `0.6.0` werden abgewiesen (Dummys a und d sind umgestellt, b und c unverändert); (2) eine Log-Zeile beim Laden der Welt (`eagleeye | game system: dnd5e 5.3.3 (tested)`); (3) bei einem System, das nicht bekannt gut ist, **ein** Hinweis für GM und Assistent; (4) die neue Funktion `api.getSystemInfo()`. Sonst ändert sich nichts.
- **Nichts angefasst:** `core/request-kernel.ts`, `core/request-relay.ts`, `core/request-rights.ts`, `core/request-identity.ts`, `core/request-handlers.ts`, `core/rights-*.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/hub-model.ts`, `core/manifest-scanner.ts`, `v13/hub-application.ts`, `v13/relay.ts`, `v13/rights.ts`, `package.json`, Lock-Datei. Kein Commit nach dem Deploy, kein Push, kein Live-Test durch mich.
- **Größe:** Bundle 55,1 kB (M6b: 51,6 kB), ohne `libWrapper`, `socketlib`, `innerHTML`, `game.socket`.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | `same-line` bedeutet "nicht getestet, aber auf der getesteten Linie" und löst keinen Hinweis aus; ein Patch von dnd5e kann dennoch etwas brechen. Module lesen den Zustand und dürfen strenger sein. Eine Vorabversion mit Nachsilbe (`5.4.0-rc.1`) ergibt `unknown` und damit einen Hinweis. | `low` | no |
| F2 | Die Reaktion für ein wirklich ungetestetes oder fremdes System ist in der Testwelt nicht auslösbar; die Prüfpakete zeigen sie mit einem geänderten **gelesenen** Wert. Laut Plan `unverified` angenommen. | `low` | no |
| F3 | Die Foundry-Hülle (`v13/system.ts`, der `ready`-Hook in `v13/module.ts`) ist nicht durch Vitest gedeckt; sie ist mit Stellvertretern simuliert und durch Gegenproben abgesichert (eine äquivalent). Ob `game.system` zur Zeit von `ready` gefüllt ist und wie ein Hinweis beim GM zu diesem Zeitpunkt aussieht (Discover U3, U4), zeigt der Live-Check. | `low` | no |
| F4 | Die einmalige Diagnosezeile zu den Handler-Argumenten aus M5 ist überholt und bleibt bis M8; ebenso die Ratenbegrenzung (M5-S6, M6a-S7). | `info` | no |
| F5 | Der Deploy-Stand ist nicht committet (Code, Tests, Testmodule, Vertrag Teil 7, `m7-03`, `m7-04`). | `info` | no |

Kein `critical`-Fund, kein `medium`- oder `high`-Fund, keine Human-Decision-Trigger, kein Rework.

---

## Live-Check (GM, optional ein Spieler): Anleitung

Du deployst selbst auf Forge und siehst die Anzeige; ich führe nichts aus. Das Ergebnis halte ich in **einem** Artefakt fest (`m7-05-live-check-output.md`), weil die Monitor-Outputs unveränderlich sind. Der wichtige Teil ist **Test A** (Standardpaket, zwei Minuten); **Test B** (Prüfpakete) ist optional.

**Pakete** (fertig gebaut, gitignoriert, im Projektordner): `v13/dist/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-v13-m7.zip` | Flight Control (`module.json`, `dist/module.js`, `lang/en.json`), API `0.7.0`; **ersetzt** das M6b-Paket (`eagleeye-v13-m6b.zip` ist aus dem Ordner entfernt) |
| `eagleeye-dummy-a.zip` | meldet sich mit `0.7.0` an; gibt zusätzlich `system: <Zustand> <Kennung> <Version>` aus |
| `eagleeye-dummy-d.zip` | meldet sich mit `0.7.0` an |
| `eagleeye-dummy-b.zip`, `eagleeye-dummy-c.zip` | unverändert |
| `eagleeye-v13-m7-check-same-line.zip`, `-untested.zip`, `-other-system.zip`, `-unknown.zip` | **Prüfpakete für Test B.** Wie das Standardpaket, aber in **einer Zeile** lässt Flight Control einen anderen Wert vom System lesen (Version `5.3.4`, Version `5.4.0`, Kennung `pf2e`, Version `5.3.3-rc.1`). Die Welt selbst bleibt dnd5e 5.3.3. Nur für diese Prüfung, nicht für den Alltag. |

**Vorbereitung:** Die Zips von Flight Control (Standard), a und d im Import Wizard installieren (überschreiben). Das Spike-Modul bleibt deaktiviert. Konsole öffnen, Filter `eagleeye`, die Sitzung des GM neu laden.

**Test A: Standardpaket (dnd5e 5.3.3, erwartet "getestet")**
1. Erwartet in der GM-Konsole, **ohne** Hinweisfenster (keine Meldung von Foundry auf dem Bildschirm):
```
eagleeye | game system: dnd5e 5.3.3 (tested)
eagleeye-dummy-a | system: tested dnd5e 5.3.3
```
2. In der GM-Konsole **nacheinander, jede Zeile einzeln** einfügen (die Konsole zeigt sonst nur das Ergebnis der letzten; die zweite Zeile liefert Text, damit nichts eingeklappt bleibt):
```js
[game.system.id, game.system.version]
JSON.stringify(game.modules.get("eagleeye").api.getSystemInfo())
```
   Erwartet `["dnd5e", "5.3.3"]` und `{"ok":true,"value":{"id":"dnd5e","version":"5.3.3","status":"tested","testedVersions":["5.3.3"]}}`.
3. Optional den Spieler laden: dieselbe Log-Zeile, kein Hinweis. Der Hub und die Rechte laufen wie bisher (kurz den Hub öffnen genügt).

**Test B (optional): die Reaktionen mit den Prüfpaketen**
Für jedes der vier Prüfpakete: über das Standardpaket installieren (Flight Control überschreiben), die Welt neu laden (GM, optional der Spieler) und die Erwartung prüfen. **Danach das Standardpaket `eagleeye-v13-m7.zip` wieder installieren.**

| Prüfpaket | Flight Control liest | Konsole des GM | Hinweisfenster beim GM | Spieler |
|---|---|---|---|---|
| `same-line` | Version `5.3.4` | `eagleeye \| game system: dnd5e 5.3.4 (same-line)` (keine Warnung) | keines | keines |
| `untested` | Version `5.4.0` | Warnung `eagleeye \| game system: dnd5e 5.4.0 (untested)` | "Eagle Flight Control has not been tested with D&D 5e 5.4.0. Tested: 5.3.3. Eagle modules may not work as expected." | keines |
| `other-system` | Kennung `pf2e` | Warnung `eagleeye \| game system: pf2e (other-system)` | "Eagle Flight Control is made for D&D 5e, but this world uses the system "pf2e". Eagle modules may not work as expected." | keines |
| `unknown` | Version `5.3.3-rc.1` | Warnung `eagleeye \| game system: dnd5e (unknown); id "dnd5e", version "5.3.3-rc.1"` | "Eagle Flight Control could not read the version of the game system. Eagle modules may not work as expected." | keines |

In jedem Prüfpaket zeigt `JSON.stringify(game.modules.get("eagleeye").api.getSystemInfo())` den Zustand, und Dummy A gibt `system: <Zustand> …` aus. Der Hinweis erscheint **einmal** beim Laden und nicht bei jeder Anfrage.

**Bitte mitgeben:** aus Test A die beiden Konsolenzeilen und die Ergebnisse der beiden eingefügten Zeilen; aus Test B, falls durchgeführt, je Prüfpaket die Konsolenzeile und den Text des Hinweisfensters (Screenshot oder Text) und ob der Spieler etwas gesehen hat.

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| `game.system.id` ist nicht genau `dnd5e` | Die Kennung im Code passt nicht zur Welt (Discover U1): bitte den Wert melden, ich passe die Konstante an |
| `game.system.version` hat ein anderes Format (Nachsilbe, führende Null) | Der Wächter meldet `unknown` (Discover U2): bitte den Text melden; ich entscheide im Nachtrag, ob das Format gelesen werden soll |
| Beim Standardpaket erscheint ein Hinweisfenster oder die Zeile sagt nicht `(tested)` | Fehler oder abweichende Version: Zeile melden |
| Ein Spieler sieht einen Hinweis | Fehler (der Hinweis gilt nur der GM-Rolle): melden |
| Bei `untested`, `other-system` oder `unknown` kommt **kein** Hinweisfenster beim GM | `ui.notifications` zur Zeit `ready` verhält sich anders als angenommen (Discover U4): melden; die Log-Zeile ist trotzdem da |
| Die Zeile `eagleeye \| game system: …` fehlt | der `ready`-Hook lief nicht, oder der Filter stimmt nicht; bitte alle `eagleeye`-Zeilen und Fehler der Konsole mitgeben |
| `failed to check the game system` in der Konsole | Fehler im Hook: Zeile mitkopieren |
| `Uncaught TypeError … getSystemInfo is not a function` | alter Stand im Browser (Cache): F5 |
| `relay-failed`, `not-registered` oder `incompatible-api-version` bei Dummy A oder D | Flight Control und Dummys haben verschiedene Stände: alle drei Zips gleichzeitig installieren und neu laden |

---

## Übergaben

- **M8 (Abschluss):** Den Vertrag zusammenführen (Teile 1 bis 7, Abschnitte umnummerieren; die früheren Dokumente verweisen auf Abschnitt 8 "What is verified"), Paketieren mit `lang/`, **`relationships.systems` mit einer `compatibility`-Spanne im Manifest prüfen** (T6), die Liste getesteter Versionen beim Release pflegen, Ratenbegrenzung und Diagnosezeile aus M5, Versionspolitik (wann `1.0.0`), Gesamtprüfung gegen die Rückverfolgungstabelle, offene `unverified`-Punkte (Assistent, mehrere Spieler und GMs, Besitzprüfung für GM, Compendium und "Inherit", Test E aus M5), T3 und T4 (Plan-Stellen und Root-README), Release-Entscheidung (ein GitHub-Release nur auf ausdrückliche Anweisung).
- **Künftige Anfragetypen, die das DnD-Datenmodell brauchen:** im Apply ihres Milestones festlegen, welche Zustände sie annehmen; der Wächter sperrt nichts (Vertrag Teil 7).
- **Prüfpakete:** Die Technik (eine Zeichenkette im gebauten Bundle ändern) ist für weitere Live-Prüfungen von Zuständen wiederverwendbar, die die Testwelt nicht von selbst erreicht.

---

## Recommendation

**Schließen.** M7 ist abgeschlossen (Status: Completed, Live-Check offen). Nächster Schritt ist der **Live-Check** (Test A genügt, Test B ist optional), danach M8. Alle Risiken sind `low` und nichts ist anzunehmen.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m7-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete in `v13/dist/live-check/` (Standardpaket, vier Prüfpakete, Dummys a bis d) | ephemeral |

M7-Abschlusskette: `m7-01-discover-output.md`, `m7-02-apply-output.md`, `m7-03-deploy-output.md`, `m7-04-monitor-output.md` (alle `immutable`). Folgeartefakt nach dem Live-Check: `m7-05-live-check-output.md`.

---

## Next Step

Live-Check durch den Projektleiter, danach Nachtrag `m7-05`, Nachführung von `docs/api-contract.md` (Abschnitt 8); danach M8 (Discover und Apply eigenständig, Stopp vor dem Deploy für das "Go", GitHub-Release nur auf ausdrückliche Anweisung).

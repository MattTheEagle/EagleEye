# M7 — Live-Check mit dem GM — Auswertung (Nachtrag zum Monitor)

```
artifact: live-check-output
milestone: M7
phase: MONITOR (Nachtrag)
status: complete
date: 2026-09-20
```

retention: immutable

Nachtrag zu `m7-04-monitor-output.md`, das unverändert bleibt. Grundlage: die Konsolenzeilen der GM-Sitzung und die beiden eingefügten Zeilen. **Test A** (Standardpaket) wurde durchgeführt; **Test B** (die vier Prüfpakete) und der Spieler-Teil von Test A wurden nicht durchgeführt.

---

## Input Summary

- **Umgebung:** Foundry v13 Stable, Build 351, Forge, dnd5e 5.3.3; GM `matteagle404` (`LmS6Y5vvR5k7wX71`).
- **Pakete:** `eagleeye-v13-m7.zip` (Standard), Dummys a und d (API `0.7.0`; b und c unverändert).
- **Durchgeführt:** Test A für den GM. **Nicht durchgeführt:** Test A Schritt 3 (Spieler) und Test B (`same-line`, `untested`, `other-system`, `unknown`).

---

## Validation Result

**AC-M7-07 ist für das Standardpaket erfüllt. M7 ist abgeschlossen** (Status: Completed). In der Testwelt erkennt Flight Control das System richtig, meldet es als getestet und beantwortet `getSystemInfo()` wie im Vertrag. Die Reaktionen auf ein ungetestetes, fremdes oder unlesbares System und der Hinweis beim GM sind live **nicht gezeigt** (Test B nicht durchgeführt); sie bleiben `unverified`, wie im Plan vorgesehen (Risiko `low`, mit Tests und Simulation belegt).

| Prüfung | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| API-Version | `0.7.0` | `eagleeye \| API attached (v0.7.0)`; `registered module eagleeye-dummy-a (api 0.7.0)` und Dummy D ebenso; Dummy C wird als inkompatibel abgewiesen (`requests API 9.0.0, Flight Control provides 0.7.0`) | **erfüllt** |
| Log-Zeile | `eagleeye \| game system: dnd5e 5.3.3 (tested)` als Info, ohne Warnung | genau diese Zeile, ohne Stapel und ohne Warnung (die Warnungen des Ladens stehen in Zeile 1335 des Bundles, die Zeile des Wächters wie die Registrierungszeilen in 1334) | **erfüllt** |
| Dummy A | `system: tested dnd5e 5.3.3` | `eagleeye-dummy-a \| system: tested dnd5e 5.3.3` | **erfüllt** |
| Kennung und Version der Welt | `["dnd5e", "5.3.3"]` | `(2) ['dnd5e', '5.3.3']` | **erfüllt** |
| `getSystemInfo()` | `{"ok":true,"value":{"id":"dnd5e","version":"5.3.3","status":"tested","testedVersions":["5.3.3"]}}` | genau dieser Text | **erfüllt** |
| Kein Hinweisfenster | keines | in der Nachricht nicht erwähnt, die Konsole zeigt keine Warnung; nach dem Code (`tested`) und Tests gibt es keinen Hinweis | nicht einzeln bestätigt |
| Bisheriges Verhalten | wie in M6b | `ping: ok`, `rights: all`, `gmping: ok … ran by LmS6Y5vvR5k7wX71 (GM: true), asked by LmS6Y5vvR5k7wX71`; Dummy D `unknown-request` und `invalid-payload`; Dummy C `not-registered` | **erfüllt** |

---

## Evidence Summary

- **Die Kennung des Systems ist genau `dnd5e`** (Discover U1) und **die Version ein Text im strengen Format `x.y.z`** (`'5.3.3'`, Discover U2): Der strenge Parser reicht für die Testwelt.
- **`game.system` ist zur Zeit von `ready` gefüllt** (Discover U3): Der `ready`-Hook von Flight Control hat Kennung und Version gelesen und `tested` erkannt.
- **Der Standardfall verhält sich wie im Vertrag Teil 7:** eine Log-Zeile, kein Warnzustand, `getSystemInfo()` mit `id`, `version`, `status` und der Liste getesteter Versionen.
- **Keine Regression:** Registrierung, Anfragen, Rechte und Weiterleitung laufen wie in M6b.

---

## Findings

Keine. Es gab weder einen Fehler noch eine unerwartete Beobachtung.

## Restrisiken

- **R2, R3 (`low`):** `same-line` löst keinen Hinweis aus; eine Vorabversion mit Nachsilbe ergibt `unknown`. Unverändert.
- **R4 (`low`):** Die Reaktion für ein ungetestetes oder fremdes System ist live nicht gezeigt. Laut Plan `unverified` angenommen; die vier Prüfpakete liegen weiter im Ordner, falls du sie später ansehen willst.

## Weiterhin `unverified` (nicht blockierend)

Der Hinweis für eine GM-Rolle zum Zeitpunkt `ready` (Discover U4: wie `ui.notifications.warn` dort aussieht) und die Zustände `same-line`, `untested`, `other-system` und `unknown` in Foundry; die Log-Zeile und das Fehlen eines Hinweises für einen Spieler. Dazu unverändert die offenen Punkte aus M2 bis M6b (siehe `docs/api-contract.md`, Abschnitt 8).

---

## Folgen für die Dokumente

- `docs/api-contract.md` Abschnitt 8: Teil 7 als live belegt eingetragen (Kennung, Version, Log-Zeile, `getSystemInfo`); unter "not verified" bleiben der Hinweis und die Zustände.
- `dadm/README.md` und Memory: M7 abgeschlossen.

---

## Recommendation

**M7 schließen** (Status: Completed). Nächster Schritt ist M8 (Abschluss: API-Vertrag, Gesamtprüfung, Release-Entscheidung): Discover und Apply eigenständig, Stopp vor dem Deploy für das "Go"; ein GitHub-Release nur auf ausdrückliche Anweisung.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m7-05-live-check-output.md` (dieses Dokument) | immutable |

M7-Abschlusskette: `m7-01-discover-output.md`, `m7-02-apply-output.md`, `m7-03-deploy-output.md`, `m7-04-monitor-output.md`, `m7-05-live-check-output.md` (alle `immutable`).

---

## Next Step

M8: `m8-01-discover-output.md`, dann `m8-02-apply-output.md`; Stopp vor dem Deploy für das "Go" des Projektleiters.

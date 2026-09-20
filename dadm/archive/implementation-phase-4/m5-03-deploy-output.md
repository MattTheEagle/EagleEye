# M5 — GM-Weiterleitung — Deploy Output

```
artifact: deploy-output
milestone: M5 (mit der Hub-Nacharbeit M3-Rework 1)
phase: DEPLOY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m5-02-apply-output.md` (Design, Testplan P1–P20, Acceptance AC-M5-01 bis -12, Deploy-Reihenfolge Abschnitt 11) und `m3-rework-1-output.md` (Design und Acceptance AC-M3R-01 bis -03).
  Beide gelten mit dem "Go" als geschlossen.
- **"Go" des Projektleiters am 2026-09-19** mit diesen Antworten:
  - Go für den M5-Deploy; **R1 (`medium`, Absender beim GM unbelegt, harte Vorbedingung für M6) und R3 (`medium`, Laufzeitverhalten nur live prüfbar) ausdrücklich angenommen**;
    T1 bis T3 wie vorgeschlagen (Nachweis `flightcontrol.gmping`, API `0.4.0`, 15 Sekunden und 65.536 Zeichen)
  - F1 aus `m4-05`: **Option A**, Nacharbeit gebündelt mit dem M5-Paket; die Wahl gilt als Go für die Nacharbeit und ist zugleich die ausdrückliche Entscheidung zur Cross-Milestone-Änderung
    (Hub-Datei aus M3 im Zuge des M5-Deploys)
  - T4: Spielerkonto vorhanden, **zwei Browser oder Profile gehen** (Live-Check mit GM und Spieler gleichzeitig)
  - Committen: zwei lokale Commits, kein Push. Ausgeführt vor dem Deploy: `4b7b909` (Produkt: Nachführung von `docs/`) und `9509921` (Prozess: `m4-05`, `m5-01`, `m5-02`, `dadm/README.md`)
- Ausgangsstand: Commit `9509921`, Arbeitsbaum sauber; `origin/master` unverändert auf `77daf6d` (vier Commits voraus).
- Grenzen: `06-working-mode.md` (kein Commit ohne Anweisung, kein Live-Test durch mich), `03-scope-declaration.md`.

---

## Implementation Summary

Der Deploy setzt das Design in der Reihenfolge von Abschnitt 11 um.

- **`core/request-kernel.ts` (erweitert, additiv):** vier neue Codes (`no-gm`, `relay-timeout`, `relay-failed`, `not-permitted`), optionales `RequestHandler.runsOn` (`"caller"` Standard, `"gm"`),
  `createRequestKernel` wirft bei anderen Werten; Schritt 1 und 2 von `execute` sind als `parseEnvelope` und `findSender` herausgelöst und exportiert (Typen `Checked`, `RequestFailureResult`);
  das Verhalten von `execute` ist für alle bisherigen Fälle unverändert.
- **`core/request-handlers.ts` (erweitert):** Parameter `executor`, neuer Handler `flightcontrol.gmping` (Version 1, `runsOn "gm"`, gleiche Datenprüfung wie `ping`, Antwort mit `ranBy: { userId, isGm }`),
  die Datenprüfung liegt jetzt in `validateEcho` für beide. Die Standardmenge hat genau zwei Handler.
- **`core/request-relay.ts` (neu):** `createRequestRelay` mit `execute` (Aufrufer-Seite) und `receive` (GM-Seite), `RELAY_TIMEOUT_MS = 15000`, `MAX_RELAY_SIZE = 65536`, `RelayEnvironment` (`isGm`, `hasGm`, `send`).
  Aufrufer: bereinigter Umschlag, Absenderprüfung, `no-gm`, Größenprüfung, eigener Zeitgeber (`relay-timeout`), Prüfung der Antwort (`relay-failed`), jeder Fehler des Transports wird `relay-failed`.
  GM-Seite: nur mit GM-Rolle, JSON und Größe, nur `runsOn "gm"` (sonst `not-permitted`), volle Prüfung im Kern mit der eigenen Registry, `detail` von `handler-failed` und `internal-error` allgemein,
  Originaltext per `warn` in der Konsole des GM; `execute` und `receive` lösen nie mit einer Ablehnung auf.
- **`core/api-version.ts`:** `EAGLE_API_VERSION` ist `"0.4.0"`. **`core/eagle-api.ts`:** fester Platzhalter-Ausführer im Standardkern (für Aufrufer ohne Foundry).
- **`v13/relay.ts` (neu, Hülle):** Query-Name `eagleeye.request`, Typ-Ergänzung von `CONFIG.Queries`, `foundryExecutor`, `foundryRelayEnvironment` (`game.user.isGM`, `game.users.activeGM`,
  `activeGM.query(..., { timeout: 15 s + 2 s })`), `registerRelayQuery` mit einmaliger Diagnosezeile zu den zusätzlichen Argumenten des Query-Handlers (klärt U1 im Live-Check).
- **`v13/module.ts`:** Verdrahtung im `init`; scheitert der Aufbau des Relais, wird das geloggt und die API läuft mit dem lokalen Kern (kleinste Rechte).
- **`v13/hub-application.ts` (Nacharbeit M3, Versuch 1):** `window.contentClasses: ["standard-form"]`; Zahlen mit vollständigem `range` als `HTMLRangePickerElement`; Listener auch für `range-picker`;
  ein Wert, der dem gespeicherten entspricht, wird nicht erneut gespeichert (fängt wiederholte `change`-Ereignisse und das Zurücksetzen ab); je Feld höchstens ein Speichern gleichzeitig.
- **Testmodule:** a und d melden sich mit `"0.4.0"`; a stellt im `ready`-Hook zusätzlich `gmping` und gibt Ergebnisse als **Textzeile** aus (`ping: …`, `gmping: …`, `this user: …`); c bleibt `9.0.0`, b unverändert.
- **`docs/api-contract.md`:** Teil 4 (API `0.4.0`, "parts 1 to 4", "Where a request runs", "Forwarded requests", vier neue Codes, `flightcontrol.gmping`, Grenzen, Historie); die Hub-Tabelle nennt den Schieberegler.

---

## Files Changed

| Datei | Änderung |
|---|---|
| `core/request-kernel.ts`, `core/request-kernel.test.ts` | geändert (P1 angepasst, P2 und P3 neu) |
| `core/request-handlers.ts`, `core/request-handlers.test.ts` | geändert (P17 neu, P18 angepasst, Ping-Test mit neuer Signatur) |
| `core/request-relay.ts` (170 Zeilen), `core/request-relay.test.ts` (303 Zeilen) | **neu** (P4 bis P16) |
| `core/api-version.ts`, `core/api-version.test.ts` | `"0.4.0"` (P20) |
| `core/eagle-api.ts`, `core/eagle-api.test.ts` | Platzhalter-Ausführer; P19 neu |
| `v13/relay.ts` (60 Zeilen) | **neu** |
| `v13/module.ts` | Verdrahtung |
| `v13/hub-application.ts` | Nacharbeit M3 (Versuch 1) |
| `test-fixtures/eagleeye-dummy-a/` (`module.js`, `module.json`), `test-fixtures/eagleeye-dummy-d/` (`module.js`, `module.json`) | `0.4.0`; a mit `gmping` und Textzeilen; Beschreibungen |
| `docs/api-contract.md` | Teil 4 |
| `dadm/m3-rework-1-output.md` | Rework-Protokoll und Design (vor der Änderung des Hubs geschrieben) |
| `v13/dist/live-check/` (gitignoriert) | fünf Zips: `eagleeye-v13-m5.zip` (`module.json`, `dist/module.js`, `lang/en.json`) und Dummys a bis d; die alten M3/M4-Pakete wurden ersetzt |
| **unverändert** | `package.json`, `package-lock.json`, `v13/tsconfig.json`, `tsconfig.base.json`, `core/hub-model.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/manifest-scanner.ts`, `core/json-value.ts`, `core/index.ts`, `v13/module.json`, `v13/lang/en.json`, Dummys b und c |

15 bestehende Dateien geändert (416 Einfügungen, 133 Löschungen laut `git diff --stat`, ohne die vier neuen Dateien).

---

## Proofs

Einmal nach dem letzten Codeeingriff:

```
npm run typecheck   -> Exit 0 (keine Meldung)
npm test            -> Exit 0: Test Files 11 passed (11), Tests 76 passed (76)
npm run build       -> Exit 0: v13/dist/module.js 32,9 kB (33.629 Bytes; M4: 25,6 kB)
```

Testverteilung: request-relay 13, module-registry 13, request-kernel 12, settings-hub 10, api-version 8, hub-model 6, eagle-api 6, request-handlers 3, json-value 2, manifest-scanner 2, lang-keys 1.

| Nachweis | Ergebnis |
|---|---|
| Vertrag gegen Code (Skript) | API-Version `0.4.0` in beiden; die elf Request-Codes sind in Code, TS-Block und Tabelle identisch; Grenzen im Vertrag (15 Sekunden, 65.536 Zeichen) gleich den Konstanten; Anfragetypen der Tabelle gleich den Handlern; Kompatibilitätstabelle 7 Zeilen ohne Abweichung; Abschnitte, Historie, "Not part" und "Not verified" wie geplant; `0.3.0` kommt nur noch im Live-Check-Vermerk und in der Historie vor |
| Bundle | enthält `eagleeye.request`, `flightcontrol.gmping`, `standard-form`, `HTMLRangePickerElement`, `relay-timeout`; enthält weder `libWrapper` noch `socketlib` noch `innerHTML`, `game.socket`, `insertAdjacentHTML` oder `eval(`; die Suche im Quellcode (`core`, `v13`, ohne Tests) nach diesen Mustern ist leer |
| Typ-Ergänzung `CONFIG.Queries` | **kompiliert ohne Cast**; Gegenprobe: ein anderer Query-Name im Aufruf scheitert mit `TS2345 … not assignable to parameter of type 'keyof Queries'`, danach wiederhergestellt |
| Fixtures | `node --check` und JSON-Parser für a und d bestanden; `apiVersion`: a und d `0.4.0`, c `9.0.0`, b keine Anmeldung |
| Gegenproben (12 gezielte Fehler, Skript) | **11 gefunden**, jeder von mindestens einem Test: Relais leitet `caller`-Typen weiter (P4), Empfänger ohne GM-Prüfung (P13), ohne Orts-Prüfung (P14), ohne Schwärzung von `detail` (P16), rohe Anfrage statt bereinigtem Umschlag (P6), ohne Absenderprüfung (P11), ohne Größenprüfung beim Empfang (P15), `no-gm` nicht erkannt (P7 und P19), `gmping` läuft beim Aufrufer (P17, P18), `parseEnvelope` behält Zusatzfelder (P2 und P6), ungültiges `runsOn` akzeptiert (P1). **Ein Fund wurde nicht bemerkt**: das Entfernen von `sending.catch(...)`. Das war kein Testloch, sondern ein äquivalenter Fehler: `Promise.race` hängt sich weiter an das Sende-Promise, eine spätere Ablehnung ist damit ohnehin behandelt. Die überflüssige Zeile wurde entfernt, der Kommentar nennt den Grund. Alle Dateien wurden nach jeder Probe wiederhergestellt (Prüfsumme) |
| Simulation, echtes Bundle und echte Testmodule in zwei nachgebildeten Clients (`User#query` als Übertragung, GM und Spieler) | **S1** nur GM: `gmping` ok, `ran by gm-1 (GM: true)`, alle M4-Ergebnisse wie im Live-Check. **S2a/b** GM zuerst, dann Spieler: der Spieler bekommt `ok`, `ran by gm-1`, seine eigene ID `p-1 (GM: false)`; die Query ging von `p-1` an `gm-1` mit `timeout` 17000; die Konsole des GM zeigt die Diagnosezeile (`extra handler arguments: none` bzw. `1: [{"from":"p-1"}]`). **S3** nur Spieler: `no-gm` und Warnung. **S4** GM ohne Relais-Query: `relay-failed` mit der Meldung des Transports. **S5** ein Spieler-Client schickt Umschläge direkt: `gmping` ok; `ping` → `not-permitted`; unbekannter Typ → `unknown-request`; nicht angemeldetes Modul → `not-registered`; falsche Daten → `invalid-payload`; 70.000 Zeichen → `invalid-request`; Text statt Umschlag → `invalid-request`; an einen anderen Spieler → `not-permitted`; die Warnungen erscheinen auf dem jeweils empfangenden Client |
| Pakete | fünf Zips gebaut; Bundle, Sprachdatei und Manifest im Flight-Control-Zip sind byte-identisch mit dem Repo; `v13/dist/` ist gitignoriert |

---

## Acceptance Checklist

| # | Kriterium | Ergebnis |
|---|---|---|
| AC-M5-01 | Kern: elf Codes, `runsOn`, `parseEnvelope`, `findSender`; `execute` unverändert für bisherige Fälle | **erfüllt** (alle zehn früheren Kerntests grün, einer davon für `runsOn` erweitert (P1); P2 und P3 neu) |
| AC-M5-02 | Relais: Exporte, lehnt nie ab, Reihenfolge wie Abschnitt 4 | **erfüllt** (P4 bis P16, Simulation S1 bis S5) |
| AC-M5-03 | Aufrufer-Seite sendet nur `gm`-Typen, nur ohne GM-Rolle, nur den bereinigten Umschlag, ohne GM nichts | **erfüllt** (P4 bis P7, P11) |
| AC-M5-04 | GM-Seite: nur mit GM-Rolle und nur `gm`-Typen, allgemeines `detail`, Original per `warn` | **erfüllt** (P13 bis P16, S5) |
| AC-M5-05 | Standardmenge genau zwei Handler, nur `gmping` läuft beim GM | **erfüllt** (P17, P18) |
| AC-M5-06 | API `0.4.0`; API mit Relais als Kern loggt die neuen Codes | **erfüllt** (P20, P19) |
| AC-M5-07 | Hülle: Query im `init`, `activeGM.query` mit `timeout` = 15 s + 2 s, Fehler beim Aufbau geloggt, typecheck | **erfüllt** (Zeilen `v13/relay.ts:10`, `:33`; Simulation zeigt `timeout` 17000; `v13/module.ts`) |
| AC-M5-08 | Vertrag Teil 4 gegen den Code | **erfüllt** (Skript) |
| AC-M5-09 | Testmodule a und d `0.4.0`, a stellt `gmping`, c und b wie zuvor | **erfüllt** |
| AC-M5-10 | typecheck, test (11 Dateien, 76 Tests), build, Bundle-Inhalt | **erfüllt** |
| AC-M5-11 | unveränderte Dateien; geänderte Dateien wie Abschnitt 5 | **erfüllt, mit einer Ausnahme:** `v13/hub-application.ts` ist geändert, weil die Nacharbeit M3 (Entscheidung A) nach dem Apply hinzukam; die Kriterienliste nannte sie als unverändert. Alle übrigen genannten Dateien sind unverändert. |
| AC-M5-12 | Live: (a) nur Spieler → `no-gm`; (b) GM und Spieler → `ok`, `ranBy` = GM, verschieden vom Spieler; (c) GM lokal; (d) Diagnosezeile beim GM | **unverified**, Live-Check mit GM und Spieler gleichzeitig (Anleitung im Monitor) |
| AC-M3R-01 | Hub: `contentClasses`, Schieberegler bei vollständigem Bereich, typecheck | **erfüllt** |
| AC-M3R-02 | `core/` für die Nacharbeit unberührt, Tests von `settings-hub` und `hub-model` unverändert grün, kein `innerHTML` | **erfüllt** |
| AC-M3R-03 | Live: Anordnung wie im Einstellungsfenster, Schieberegler, genau ein `onChange`, ungültiger Wert springt zurück | **unverified**, Live-Check zusammen mit M5 |

### Abgleich Testplan (P1–P20)

| # | Test (Datei) | Stand |
|---|---|---|
| P1 | `createRequestKernel throws on an invalid handler definition` (kernel), um `runsOn` erweitert | angepasst, besteht |
| P2 | `parseEnvelope keeps exactly the four known fields …` (kernel) | neu, besteht |
| P3 | `findSender finds a registered active sender …` (kernel) | neu, besteht |
| P4 bis P16 | 13 Tests in `request-relay.test.ts` (`RequestRelay.execute`: P4 bis P11, `RequestRelay.receive`: P12 bis P16) | neu, bestehen |
| P17 | `flightcontrol.gmping runs on the Gamemaster's client …` (handlers) | neu, besteht |
| P18 | `defaultRequestHandlers offers exactly two request types …` (handlers) | angepasst, besteht |
| P19 | `works with the relay as its kernel …` (eagle-api) | neu, besteht |
| P20 | `EAGLE_API_VERSION is 0.4.0 …` (api-version) | angepasst, besteht |

Erwartet 11 Dateien und 76 Tests (59 + 17 neue); erreicht 11 und 76. Ein Fall pro `it`, wie geplant.

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (Apply-R1) Absender beim GM unbelegt (U1). Mit dem "Go" angenommen. Der Live-Check zeigt über die Diagnosezeile, was Foundry dem Query-Handler übergibt; das Ergebnis entscheidet, wie M6 die Nutzeridentität bekommt. | `medium` | no |
| R3 | (Apply-R3) Laufzeitverhalten von `User#query` nur live prüfbar (U2 bis U9). Mit dem "Go" angenommen. Die Simulation bildet die Übertragung nach; ob Foundry sich gleich verhält, zeigt der Live-Check. | `medium` | no |
| R10 | (Apply-R10) Die Typ-Ergänzung von `CONFIG.Queries` kompiliert ohne Cast. | erledigt | no |
| R11 | (Apply-R11) Die Diagnosezeile zu U1 bleibt in der Konsole des GM, bis M8 entscheidet. | `low` | no |
| RW1 | (Rework) Die Klasse `standard-form` wirkt in v13 nicht wie erhofft. Live prüfbar; Rückfall Versuch 2 (minimales eigenes CSS) oder Annahme. | `medium` | no |
| RW2 | (Rework) Das native Element sendet mehr als ein `change`-Ereignis oder reagiert beim Setzen von `value`; abgefangen durch den Vergleich mit dem gespeicherten Wert und die Sperre je Feld. | `low` | no |
| R12 | Neu: Der Vergleich mit dem gespeicherten Wert gilt für **alle** Felder des Hubs. Ändert ein Nutzer ein Feld auf genau den Wert, der schon gespeichert ist, passiert nichts (gewollt, kein Schreiben ohne Änderung). | `low` | no |

Die übrigen Risiken und Annahmen des Apply (R2, R4 bis R9, A1 bis A4) sind unverändert; A1 (`flightcontrol.gmping`), A2 (`isGM` gilt für Gamemaster und Assistent) und A3 (JSON in beide Richtungen) sind mit dem "Go" bestätigt.
Kein `critical`-Fund, kein `high`-Fund, keine Dependency-Änderung, kein Human-Decision-Trigger (die Cross-Milestone-Änderung ist ausdrücklich vom Projektleiter entschieden).

---

## Decision Log

Abweichungen und Feinheiten gegenüber dem Apply, alle ohne neue Architekturentscheidung:

1. **AC-M5-11 und `v13/hub-application.ts`:** durch die Nacharbeit M3 überlagert (siehe Checkliste).
2. **P9 und der Puffer für Foundry:** Der Test prüft, dass das Relais seinen eigenen Zeitwert an `send` übergibt; der Puffer von 2 Sekunden wird in der Hülle addiert (AC-M5-07). Das ist reine Logik gegen Hülle: Der Puffer ist per Suche (`v13/relay.ts:10`, `:33`) und Simulation (`timeout` 17000) belegt, nicht per Vitest.
3. **Redundante Zeile entfernt:** `sending.catch(...)` im Relais (äquivalenter Fehler der Gegenprobe, siehe Proofs).
4. **Testmodul a:** zusätzlich Textzeilen zu `ping`, `gmping` und dem eigenen Nutzer, damit im Konsolenauszug nichts aufgeklappt werden muss (Lehre aus F4 in `m4-05`); die Hilfsfunktion heißt `dummyADescribe`, damit sie im klassischen Skript keinen globalen Namen wie `describe` überschreibt. Die Beschreibungstexte der Manifeste von a und d sind auf M5 angepasst.
5. **`core/request-kernel.test.ts`:** die Testkonstante `API = "0.3.0"` bleibt (sie ist nur der Wert der Test-Registry, unabhängig von der API-Version).

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m5-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| `dadm/m3-rework-1-output.md` | immutable |
| Code, Tests, Testmodule, `docs/api-contract.md` (siehe Files Changed) | durable (nicht committet) |
| Live-Check-Pakete in `v13/dist/live-check/` (fünf Zips) | ephemeral |

---

## Next Step

Monitor M5 ohne Stopp (Working Mode): Abgleich Acceptance gegen Deploy-Output, Regressionen, Restrisiken, Liste der `unverified`-Punkte und die Anleitung für den Live-Check mit GM und Spieler.

# M4 — Anfragekanal-Kern — Deploy Output

```
artifact: deploy-output
milestone: M4
phase: DEPLOY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m4-02-apply-output.md` (Design, Testplan P1–P17, Acceptance AC-M4-01 bis -11, Deploy-Reihenfolge Abschnitt 10). Der Apply-Output gilt mit
  dem "Go" als geschlossen.
- **"Go" des Projektleiters am 2026-09-19** mit diesen Antworten:
  - Go für den Deploy; **Risiko R1 (`high`, Formatstabilität) ausdrücklich angenommen**
  - T1: Nachweis-Anfrage `flightcontrol.ping` und Benennungsmuster `<bereich>.<verb>` bestätigt
  - T2: Die Live-Checks von M3 (Hub) und M4 (Anfragen) laufen **in einem neuen Paketsatz nach M4**
  - T3 (Pläne und Root-`README.md` nachführen) wurde nicht abgefragt; es gilt der Vorschlag "mit M8"
- Ausgangsstand: M3-Endstand im Arbeitsbaum (nicht committet), Basis-Commit `77daf6d`.
- Grenzen: `06-working-mode.md` (kein Commit, kein Live-Test durch mich), `03-scope-declaration.md`.

---

## Implementation Summary

Der Deploy setzt das Design des Apply um, in der Reihenfolge von Abschnitt 10.

- **`core/json-value.ts` (neu):** `JsonValue` und `isJsonValue` (endliche Zahlen, Text, Wahrheitswerte, `null`, Arrays und einfache Objekte; lehnt
  `undefined` auch als Eigenschaft oder Array-Loch, `NaN`, `Infinity`, Funktionen, Symbole, `bigint`, Klasseninstanzen und Zyklen ab; wirft nie).
- **`core/request-kernel.ts` (neu):** Umschlag, die sieben Fehlercodes, `RequestHandler`, `createRequestKernel` (prüft jede Handler-Definition und wirft
  bei einem Programmierfehler) und `execute` in der festgelegten Reihenfolge: Umschlag, Absender (angemeldet und aktiv), Handler, Version (Standard `1`),
  Daten, Ausführung, JSON-Ergebnis. `execute` löst nie mit einer Ablehnung auf.
- **`core/request-handlers.ts` (neu):** genau ein Handler, `flightcontrol.ping` in Version 1 (Daten `undefined`, `null` oder `{ echo?: string }` bis 200 Zeichen;
  Ergebnis `{ apiVersion, module, echo }`), zugänglich über `defaultRequestHandlers(apiVersion)`.
- **`core/eagle-api.ts` (erweitert):** drittes Mitglied `request`; `createEagleApi(registry, log?, kernel?)` erzeugt ohne dritten Parameter den Kern mit den
  Standard-Handlern; Fehlschläge werden per `warn` geloggt, Erfolge nicht; `request` lehnt nie ab.
- **`core/api-version.ts`:** `EAGLE_API_VERSION = "0.3.0"`.
- **Dummy-Module:** a und d melden sich mit `0.3.0` an; im `ready`-Hook fragt a einen `ping` mit `echo`, c einen `ping` trotz abgewiesener Anmeldung
  (erwartet `not-registered`), d einen unbekannten Typ (`unknown-request`) und einen `ping` mit `{ echo: 5 }` (`invalid-payload`); b unverändert.
- **`docs/api-contract.md` (Teil 3):** API `0.3.0`, `request` im TypeScript-Block, neuer Abschnitt "Requests" (Umschlag, Ergebnis, JSON-Pflicht, sieben Codes,
  Regel für unbekannte Codes, Versionen, Ausführungsort, Vertrauensgrenze, `flightcontrol.ping`), Verifikationsstand, Änderungshistorie `0.3.0`.
- **Unverändert:** `v13/module.ts`, `v13/hub-application.ts`, `v13/module.json`, `core/hub-model.ts`, `core/settings-hub.ts`, `core/module-registry.ts`. Die
  API-Typen wachsen über das bestehende `ModuleConfig` automatisch mit (der Typecheck bestätigt es).

**Ergänzungen innerhalb des Designs** (keine neue Architekturentscheidung):
1. `isJsonValue` fängt Ausnahmen selbst ab (werfende Getter, absurde Verschachtelung) und liefert dann `false`; der Fall steht im Test P2.
2. Im Kern läuft auch `validate` innerhalb des Fangnetzes: Ein werfendes `validate` ergibt `handler-failed` (Apply nannte nur `run`); Fall im Test P10.
3. Die Hilfsfunktion zum Beschreiben des Absenders in Logzeilen heißt jetzt `describeField` und dient Registrierung und Anfragen gemeinsam.
4. Die Abschnitte 4 bis 9 des API-Vertrags haben sich um eins verschoben (neuer Abschnitt 4 "Requests"); alle Querverweise im Vertrag sind angepasst.
   Die unveränderlichen Dokumente aus M2 und M3 nennen die alten Nummern (Historie).
5. Der Test P13 fasst Annahme, Ablehnung und Antwort des `ping` in einem `it` zusammen, damit die geplante Gesamtzahl 59 stimmt.

---

## Files Changed

Von M4 stammen (Zeilenzahl jetzt):

| Datei | Änderung | Zeilen |
|---|---|---|
| `core/json-value.ts` | neu | 52 |
| `core/json-value.test.ts` | neu (P1–P2) | 61 |
| `core/request-kernel.ts` | neu | 134 |
| `core/request-kernel.test.ts` | neu (P3–P12) | 186 |
| `core/request-handlers.ts` | neu | 39 |
| `core/request-handlers.test.ts` | neu (P13–P14) | 43 |
| `core/eagle-api.ts` | `request`, optionaler Kern, Logging | 80 |
| `core/eagle-api.test.ts` | T18 angepasst (= P15), + P16 | 122 |
| `core/api-version.ts` | `"0.3.0"` | 33 |
| `core/api-version.test.ts` | H4 angepasst (= P17) | 65 |
| `docs/api-contract.md` | Teil 3 | 324 |
| `test-fixtures/eagleeye-dummy-a/module.js`, `module.json` | `0.3.0`, `ping` im `ready`-Hook, `description` | — |
| `test-fixtures/eagleeye-dummy-c/module.js`, `module.json` | `ping` im `ready`-Hook, `description` | — |
| `test-fixtures/eagleeye-dummy-d/module.js`, `module.json` | `0.3.0`, zwei fehlerhafte Anfragen, `description` | — |

17 Dateien. Nicht durch M4 geändert: `package.json`, `package-lock.json`, `v13/tsconfig.json`, `v13/module.ts`, `v13/hub-application.ts`, `v13/module.json`,
`core/hub-model.ts`, `core/settings-hub.ts`, `core/module-registry.ts`, `core/manifest-scanner.ts`, `core/index.ts`, `test-fixtures/eagleeye-dummy-b/`.
`v13/dist/module.js` (gitignoriert) wurde neu gebaut: 19.745 → 25.624 Bytes.

---

## Proofs

Abschließender Lauf über alles, nach Abschluss aller Änderungen.

```
npm run typecheck   -> Exit 0
npm test            -> Test Files 10 passed (10); Tests 59 passed (59); Exit 0
                       manifest-scanner 2, api-version 8, hub-model 6, eagle-api 5, module-registry 13, settings-hub 10, lang-keys 1,
                       json-value 2, request-kernel 10, request-handlers 2
npm run build       -> v13/dist/module.js 25.0kb; Exit 0
Bundle              -> "flightcontrol.ping" 1, "request rejected" 1, "registerMenu" 1, "libWrapper" 0, "innerHTML" 0
```

Ein früherer Zwischenlauf (nach der reinen Logik, vor Fixtures und Dokumenten) war ebenfalls grün; der abschließende Lauf oben ist der Nachweis.

**Skriptprüfungen** (Skripte im Scratchpad, nicht im Repo)
```
API-Vertrag gegen Code: Version 0.3.0 = EAGLE_API_VERSION; Kompatibilitätstabelle 7/7; Fehlercodes der Registrierung im Code, in der Tabelle und im
  TypeScript-Block je 7, identisch; Fehlercodes der Requests im Code, in der Tabelle und im TypeScript-Block je 7, identisch; "request" im TypeScript-Block,
  Abschnitt "4. Requests", Ping-Beispiel, Ping-Zeile der Typ-Tabelle, Eintrag 0.3.0, Querverweise auf Abschnitt 5, Registrierungsbeispiel mit 0.3.0: alles vorhanden
UI-Leitfaden (unverändert, Stichprobe): alle 13 Regeln belegt, alle Pfade und Symbole vorhanden
Fixtures: JSON parst und node --check ok (a, b, c, d); a: apiVersion "0.3.0" und api.request; c: "9.0.0" und api.request; d: "0.3.0" und zwei api.request;
  b: git diff leer; kein "0.2.0" mehr in den Fixtures
```

**Gegenproben** (Nachweise, dass die Tests wirken; jeweils ein gezielter Fehler im Kern, danach byte-genau wiederhergestellt)
- Entfernte JSON-Prüfung des Handler-Ergebnisses → der Test zu Nicht-JSON-Ergebnissen scheitert.
- Vertauschte Prüfung von Absender und Handler → der Test zum Vorrang von `not-registered` scheitert.
- Entfernte Prüfung auf doppelte Handler-Typen → der Test zur Handler-Definition scheitert.

Ein Live-Test wurde von mir nicht ausgeführt (Live-Test-Gate). Er ist für nach M4 vom Projektleiter gewünscht (gebündelt mit dem Hub-Check aus M3);
Anleitung im Monitor-Output.

---

## Acceptance Checklist

- [x] AC-M4-01 — `core/json-value.ts` exportiert `JsonValue` und `isJsonValue`; P1–P2 bestehen (2 Tests)
- [x] AC-M4-02 — `core/request-kernel.ts` exportiert `createRequestKernel`, `REQUEST_TYPE_PATTERN` und die Typen; `execute` löst nie mit einer Ablehnung auf, prüft in der festgelegten Reihenfolge und kennt genau die sieben Codes; P3–P12 bestehen (10 Tests)
- [x] AC-M4-03 — `defaultRequestHandlers` enthält genau einen Handler (`flightcontrol.ping`, Versionen `[1]`); P13–P14 bestehen (2 Tests)
- [x] AC-M4-04 — die API ist eingefroren mit genau `version`, `registerModule`, `request`; `request` löst nie mit einer Ablehnung auf, loggt Fehlschläge per `warn` und Erfolge nicht; ohne dritten Parameter entsteht der Kern mit den Standard-Handlern; T19–T21 unverändert grün; P15–P16 bestehen
- [x] AC-M4-05 — `EAGLE_API_VERSION` ist `"0.3.0"` (P17)
- [x] AC-M4-06 — `v13/module.ts`, `v13/hub-application.ts` und `core/hub-model.ts` unverändert; der Typecheck bestätigt den neuen API-Typ mit `request`
- [x] AC-M4-07 — API-Vertrag: `0.3.0`, `request` im TypeScript-Block, Abschnitt "Requests", `flightcontrol.ping` mit Beispiel, Eintrag `0.3.0`; Fehlercodes der Requests-Tabelle identisch mit dem Code (Skript)
- [x] AC-M4-08 — a und d melden sich mit `"0.3.0"` an, a, c und d stellen die Anfragen im `ready`-Hook, c bleibt `"9.0.0"`, b unverändert; JSON parst, `node --check` ok
- [x] AC-M4-09 — `typecheck` Exit 0; `npm test` Exit 0 mit 10 Dateien und 59 Tests; `build` Exit 0; Bundle enthält `flightcontrol.ping`, kein `libWrapper`
- [x] AC-M4-10 — `package.json`, Lock-Datei, `v13/tsconfig.json`, `core/manifest-scanner.ts`, `core/settings-hub.ts` und die Hub-Dateien unverändert; die 17 durch M4 geänderten Dateien entsprechen Abschnitt 5 des Apply. *Hinweis:* Weil M1 bis M3 nicht committet sind, ist die Änderungsliste über den Zeitstempel gegenüber dem M3-Abschlussartefakt bestimmt (`find -newer`), nicht über `git status`.
- [ ] AC-M4-11 — **unverified**: In Forge liefert a `ok` mit dem erwarteten Wert, c `not-registered`, d `unknown-request` und `invalid-payload`; nur durch den vom Projektleiter gewünschten Live-Check

### Abgleich Testplan (P1–P17)

| Datei | Fälle | Tests |
|---|---|---|
| `core/json-value.test.ts` | P1–P2 | 2 |
| `core/request-kernel.test.ts` | P3–P12 | 10 |
| `core/request-handlers.test.ts` | P13–P14 | 2 |
| `core/eagle-api.test.ts` | P15 (T18 angepasst), P16 neu, T19–T21 unverändert | 5 |
| `core/api-version.test.ts` | P17 (H4 angepasst) | 8 |

Jeder Fall ist genau ein `it`; Tabellenfälle laufen als Schleife im Test. Gesamt 59 = 44 bestehende (zwei angepasst) + 15 neue.

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (aus Apply-R1, mit dem "Go" angenommen) Die Stabilität des Formats ist das größte Einzelrisiko: Sechs weitere Module werden das Format erst noch benutzen. Gemindert durch ein additiv erweiterbares Umschlag-Objekt, eine ausdrückliche Version je Anfragetyp, stabile Codes mit der Regel "unbekannte Codes sind Fehlschläge", die JSON-Pflicht und genau einen Nachweis-Handler; ein Restrisiko bleibt. | `high` | no |
| R2 | (Apply-R2) Die Standardmenge der Handler ist auf `flightcontrol.ping` begrenzt, der Test P14 verhindert unbemerktes Wachsen; jede Fachanfrage braucht das Apply ihres Milestones. | `medium` | no |
| R3 | (Apply-R4) Der Absender ist die selbst angegebene Modul-`id`; der Vertrag nennt ihn eine Vertrauens-, keine Sicherheitsgrenze. | `low` | no |
| R4 | (Apply-R7) Bis M5 läuft ein Handler im Client des Aufrufers; ein Handler, der Dokumente ändert, scheiterte für einen Nutzer ohne Foundry-Recht an Foundry und käme als `handler-failed` zurück. Für `ping` unerheblich. | `low` | no |
| R5 | (Apply-R8) Das Verhalten in Foundry ist nicht live belegt; der Kern besteht aus reiner Logik, ein Live-Check der Dummys bestätigt es. | `low` | no |
| R6 | API `0.3.0` macht Dummys mit `0.2.0` unverträglich; a und d sind umgestellt, die Pakete werden neu gebaut. | `info` | no |

Kein weiterer `medium`-Fund, kein Rework, keine Abweichung vom Design außer den oben genannten Ergänzungen, keine Dependency-Änderung, keine Scope-Erweiterung.

---

## Decision Log

```
date: 2026-09-19
decision: Go für den Deploy von M4; R1 (high) angenommen; Nachweis-Anfrage flightcontrol.ping und Muster <bereich>.<verb> bestätigt; Live-Checks von M3 und M4 in einem neuen Paketsatz nach M4
reason: Freigabe nach Prüfung des Apply-Outputs; Autonomie-Regelung "Discover+Apply autonom, vor Deploy Go"
decided-by: Projektleiter
refs: m4-02-apply-output.md (Open TBDs T1–T3, Risiko R1), 06-working-mode.md

date: 2026-09-19
decision: Fünf kleine Ergänzungen innerhalb des Designs (isJsonValue fängt eigene Ausnahmen, validate im Fangnetz, describeField, Abschnittsnummern im Vertrag verschoben, Test P13 als ein Fall); AC-M4-10 über Zeitstempel geprüft, weil M1 bis M3 nicht committet sind
reason: "nie Ablehnung" muss auch bei bösartigen Eingaben gelten; die geplante Testzahl 59 einhalten; der AC-Wortlaut setzte committeten Stand voraus
decided-by: agent
refs: m4-02-apply-output.md (Abschnitte 3, 6; AC-M4-02, -10)
```

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m4-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Code, Tests, Fixtures, `docs/api-contract.md` (Tabelle "Files Changed") | durable (Repo; nicht committet) |
| `v13/dist/module.js` | ephemeral (Build-Ausgabe, gitignoriert) |

---

## Next Step

Monitor M4: Acceptance gegen den Deploy-Output abgleichen, die echten Test-Module gegen den echten Kern in einem nachgebildeten Foundry durchspielen, Restrisiken
prüfen, den gemeinsamen Live-Check für Hub und Anfragen vorbereiten (neue Pakete, erwartete Anzeigen), Empfehlung schließen / Rework / nächster Milestone. Das
Monitor folgt nach Working Mode ohne Stopp.

# M6a — Verifizierte Nutzeridentität für GM-seitige Anfragen — Deploy Output

```
artifact: deploy-output
milestone: M6a
phase: DEPLOY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m6a-02-apply-output.md` (Design, Testplan P1–P12, Acceptance AC-M6a-01 bis -12, Deploy-Reihenfolge Abschnitt 11). Der Apply-Output gilt mit dem "Go" als geschlossen.
- **Bedingtes "Go" des Projektleiters am 2026-09-20:** "Go nach bestandenem Spike, R1/R2 angenommen, T1–T3 wie vorgeschlagen" (Query `eagleeye.confirm`, Feld `askedBy`, API `0.5.0`, 5 Sekunden). Dazu am selben Tag die **Freigabe der Planversion 2**
  (`05-milestone-plan-approval-v2.md`, M6 geteilt in M6a und M6b).
- **Die Bedingung ist erfüllt:** Der Spike (`m6-spike-1-result-output.md`) zeigt `ok after 108 ms` mit `answeredBy` = Spieler und derselben Nonce; damit gilt A1 als bestätigt und R2 als geschlossen.
- Ausgangsstand: Commit `9c2e71b`; im Arbeitsbaum lagen nur Dokumente (README, Planversion 2, Freigabe, `m6a-02`); `origin/master` unverändert auf `77daf6d`.
- Grenzen: `06-working-mode.md` (kein Commit ohne Anweisung, kein Live-Test durch mich), `03-scope-declaration.md`.

---

## Implementation Summary

Der Deploy setzt das Design in der Reihenfolge von Abschnitt 11 um.

- **`core/request-kernel.ts` (erweitert, additiv):** `RequestUser`, `RequestContext.user?`, `ExecuteOptions`, `KernelOptions`; `execute(request, options?)` setzt `context.user` aus der Option oder aus `currentUser`, sonst bleibt es weg.
  Alle bisherigen Fälle sind unverändert.
- **`core/request-identity.ts` (neu, rein):** `CONFIRM_TIMEOUT_MS` (5000), `createPendingRequests` (offene Kennungen), `parseRelayMessage` (Nachricht `{ request, claim }`, Kennung 16 bis 128 Zeichen), `isConfirmed` (nur `{ confirmed: true, userId: <genannte ID> }`).
- **`core/request-relay.ts` (erweitert):** Der Aufrufer sendet `{ request, claim: { userId, requestId } }` und hält die Kennung bis zum Ende jeder Anfrage offen (auch bei Fehler und Zeitüberschreitung); ohne bekannte Nutzer-ID wird nicht gesendet.
  `receive` prüft Rolle → JSON und Größe → Nachricht und Umschlag → Ausführungsort → Absender-Registrierung → **Rückfrage** (eigener Zeitgeber 5 s) → Ausführung mit `{ user: <bestätigter Nutzer> }`; jede fehlende Bestätigung ist `not-permitted`
  (fail closed), der Grund steht in der Warnung beim GM. `answerConfirmation` bestätigt nur eine offene Kennung mit der eigenen Nutzer-ID und wirft nie.
- **`core/request-handlers.ts`:** `flightcontrol.gmping` meldet additiv `askedBy` (`null` ohne bekannten Nutzer). **`core/api-version.ts`:** `"0.5.0"`.
- **`v13/relay.ts` (Hülle):** `CONFIRM_QUERY = "eagleeye.confirm"`, Typ-Ergänzung für beide Queries, `foundryCurrentUser`, Kennung aus `crypto.getRandomValues` (128 Bit), `send` mit der Nachricht, `confirm` über `game.users.get(id).query` (Zeit 5 s plus 2 s Puffer),
  `registerRelayQueries` setzt beide Queries auf jedem Client. **`v13/module.ts`:** Kern mit `currentUser`, Wiring.
- **Testmodule:** a und d melden sich mit `"0.5.0"`; a gibt `asked by <ID>` in der Textzeile von `gmping` aus; b und c unverändert.
- **`docs/api-contract.md`:** Teil 5 ("parts 1 to 5", API `0.5.0`, "Who asked (forwarded requests)", erweiterte Zeile `not-permitted`, `askedBy`, Grenze 5 Sekunden, Historie); Abschnitt 8 nennt zusätzlich die mit dem Spike-Modul beobachteten Foundry-Fakten.

---

## Files Changed

| Datei | Änderung |
|---|---|
| `core/request-kernel.ts`, `core/request-kernel.test.ts` | geändert (P1 neu) |
| `core/request-identity.ts` (83 Zeilen), `core/request-identity.test.ts` (86 Zeilen) | **neu** (P2 bis P4) |
| `core/request-relay.ts`, `core/request-relay.test.ts` | geändert; bestehende Tests auf das neue Nachrichtenformat angepasst, P5 bis P10 neu |
| `core/request-handlers.ts`, `core/request-handlers.test.ts` | `askedBy` (P11 neu, Test des Ergebnisses angepasst) |
| `core/api-version.ts`, `core/api-version.test.ts` | `"0.5.0"` (P12) |
| `core/eagle-api.test.ts` | Umgebung des Relais-Tests um die neuen Mitglieder erweitert |
| `v13/relay.ts`, `v13/module.ts` | Hülle und Verdrahtung |
| `test-fixtures/eagleeye-dummy-a/`, `-d/` (`module.js`, `module.json`) | `0.5.0`, a mit `asked by` |
| `docs/api-contract.md` | Teil 5 |
| `v13/dist/live-check/` (gitignoriert) | `eagleeye-v13-m6a.zip` (`module.json`, `dist/module.js`, `lang/en.json`) und Dummys a bis d; das M5-Paket wurde ersetzt |
| **unverändert** | `package.json`, `package-lock.json`, `v13/tsconfig.json`, `v13/hub-application.ts`, `core/hub-model.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/manifest-scanner.ts`, `core/json-value.ts`, `core/eagle-api.ts`, Dummys b und c |

17 bestehende Dateien geändert (473 Einfügungen, 85 Löschungen laut `git diff --stat`, darunter `dadm/README.md`), dazu die zwei neuen Dateien.

---

## Proofs

Einmal nach dem letzten Codeeingriff:

```
npm run typecheck   -> Exit 0 (keine Meldung)
npm test            -> Exit 0: Test Files 12 passed (12), Tests 87 passed (87)
npm run build       -> Exit 0: v13/dist/module.js 37,5 kB (M5: 32,9 kB)
```

Testverteilung: request-relay 19, request-kernel 13, module-registry 13, settings-hub 10, api-version 8, hub-model 6, eagle-api 6, request-handlers 4, request-identity 3, json-value 2, manifest-scanner 2, lang-keys 1.

| Nachweis | Ergebnis |
|---|---|
| Vertrag gegen Code (Skript) | API-Version `0.5.0` in beiden; die elf Request-Codes sind in Code, TS-Block und Tabelle identisch (unverändert); Grenzen 15 Sekunden, 65.536 Zeichen und 5 Sekunden gleich den Konstanten; Anfragetypen der Tabelle gleich den Handlern; `askedBy` in Vertrag und Code; beide Query-Namen tragen das Präfix `eagleeye.`; Historie in aufsteigender Reihenfolge; Teil 5 unter "Not verified"; Kompatibilitätstabelle 7 Zeilen ohne Abweichung |
| Bundle | enthält `eagleeye.request`, `eagleeye.confirm`, `getRandomValues`, `flightcontrol.gmping`, `askedBy`, `standard-form`, `fieldset`; enthält weder `libWrapper` noch `socketlib` noch `innerHTML`, `game.socket`, `insertAdjacentHTML` oder `eval(`; die Suche im Quellcode nach diesen Mustern ist leer |
| Gegenproben (13 gezielte Fehler, Skript) | **alle 13 gefunden:** Ausführung ohne Rückfrage, Bestätigung durch einen anderen Nutzer gilt, Kennung bleibt offen, ein unbekannter Typ löst eine Rückfrage aus, fehlgeschlagene Rückfrage gilt als bestätigt (fail open), kein eigener Zeitgeber für die Rückfrage, `answerConfirmation` bestätigt jede Kennung, der bestätigte Nutzer erreicht den Handler nicht, der Aufrufer nennt einen anderen Nutzer, `currentUser` schlägt die Option, zu kurze Kennungen werden akzeptiert, eine Nachricht ohne `claim` wird nicht abgelehnt, `gmping` meldet `askedBy` nicht. Alle Dateien wurden nach jeder Probe wiederhergestellt (Prüfsumme), danach wieder 87 Tests grün |
| Simulation, echtes Bundle und echte Testmodule in nachgebildeten Clients (`User#query` wie im Spike beobachtet: nicht verbundener Nutzer und fehlende Query lehnen sofort ab) | **S1** nur GM: `asked by gm-1`. **S2** GM zuerst, dann der Spieler: `ok`, `ran by gm-1`, **`asked by p-1`**; die Queries sind `p-1 → gm-1: eagleeye.request` und `gm-1 → p-1: eagleeye.confirm`; zwei gleichzeitige Anfragen liefern beide `ok`. **S3** nur Spieler: `no-gm`. **S4** GM ohne Query: `relay-failed`. **S5** ein veränderter Client p-2 schickt eigene Nachrichten: als p-1 (verbunden, erfundene Kennung), als GM, als p-3 (nicht verbunden), mit unbekannter ID, als sich selbst mit erfundener Kennung: **jedes Mal `not-permitted` "the asking user could not be confirmed"** und eine Warnung beim GM mit der genannten ID und dem Grund; altes Format und zu kurze Kennung: `invalid-request`; ein `caller`-Typ mit gültig geformter Angabe: `not-permitted` **ohne** Rückfrage (nur die eine Query an den GM). **S6** der genannte Client antwortet nie: `not-permitted` nach 5000 ms, Warnung "no answer within 5 seconds" |
| Fixtures | `node --check` und JSON-Parser für a und d bestanden; `apiVersion`: a und d `0.5.0`, c `9.0.0`, b keine Anmeldung |
| Pakete | fünf Zips gebaut; Bundle, Sprachdatei und Manifest im Flight-Control-Zip sind byte-identisch mit dem Repo; `v13/dist/` ist gitignoriert |

---

## Acceptance Checklist

| # | Kriterium | Ergebnis |
|---|---|---|
| AC-M6a-01 | Kern: `context.user`, `ExecuteOptions`, `KernelOptions`; bisherige Kerntests grün | **erfüllt** (P1; alle zwölf früheren Kerntests unverändert grün) |
| AC-M6a-02 | `core/request-identity.ts`: Exporte und Tests | **erfüllt** (P2 bis P4) |
| AC-M6a-03 | Aufrufer sendet nur `{ request, claim }`, schließt die Kennung, ohne Nutzer-ID kein Senden; `answerConfirmation` nur für offene Kennungen | **erfüllt** (P5, P6, Simulation S2) |
| AC-M6a-04 | `receive`: Reihenfolge, keine Rückfrage vorher, fail closed innerhalb von 5 s, nie eine Ablehnung | **erfüllt** (P7 bis P10, Simulation S5 und S6) |
| AC-M6a-05 | bestätigter Nutzer erreicht den Handler; `gmping` meldet `askedBy` | **erfüllt** (P9, P11, Simulation S2) |
| AC-M6a-06 | API `0.5.0`, elf Codes unverändert | **erfüllt** (P12, Skript) |
| AC-M6a-07 | Hülle: beide Queries im `init`, `game.users.get(id).query` mit 5 s plus 2 s, Kennung aus `getRandomValues`, typecheck | **erfüllt** (Typecheck ohne Cast, Bundle-Suche, Skript) |
| AC-M6a-08 | Vertrag Teil 5 gegen den Code | **erfüllt** (Skript) |
| AC-M6a-09 | Testmodule a und d `0.5.0`, a mit `asked by`; b und c wie zuvor | **erfüllt** |
| AC-M6a-10 | typecheck, test (12 Dateien, 87 Tests), build, Bundle-Inhalt | **erfüllt** |
| AC-M6a-11 | unveränderte Dateien; geänderte Dateien wie Abschnitt 5 | **erfüllt** (auch `v13/hub-application.ts` ist unverändert) |
| AC-M6a-12 | Live: (a) Spieler `asked by` = seine ID, `ran by` = GM; (b) GM lokal; (c) gefälschte Angabe → `not-permitted`; (d) optional nicht verbundener Nutzer | **unverified**, Live-Check mit GM und Spieler (Anleitung im Monitor) |

### Abgleich Testplan (P1–P12)

| # | Test (Datei) | Stand |
|---|---|---|
| P1 | `gives the handler the user it runs for …` (kernel) | neu, besteht |
| P2 bis P4 | `createPendingRequests …`, `parseRelayMessage …`, `isConfirmed …` (identity) | neu, bestehen |
| P5 | `sends the request with the user of this client and an identifier …` (relay, `execute`) | neu, besteht |
| P6 | `confirms an identifier that is open with the own user id …` (relay, `answerConfirmation`) | neu, besteht |
| P7 bis P10 | `refuses data without a proper message …`, `answers a caller-type, an unknown type and an unregistered sender before it asks anyone`, `asks the named user before it runs a gm-type …`, `refuses with not-permitted, runs nothing and warns … when the confirmation fails in any way` (relay, `receive`) | neu, bestehen |
| P11 | `names in askedBy the user the request runs for …` (handlers) | neu, besteht |
| P12 | `EAGLE_API_VERSION is 0.5.0 …` (api-version) | angepasst, besteht |

Erwartet 12 Dateien und 87 Tests (76 + 11 neue); erreicht 12 und 87. Ein Fall pro `it`, wie geplant.

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (Apply-R1) Nutzeridentität. Mit dem "Go" angenommen: Verhalten von Foundry bis zum Live-Check plus das Restrisiko aus der Human Decision 1 (Schutz gegen die Fälschung einer fremden Identität, nicht gegen Selbstausgabe). Die Simulation stützt sich auf das im Spike beobachtete Verhalten. | `medium` | no |
| R2 | (Apply-R2) `User#query` vom GM an einen Spieler | **geschlossen** (Spike bestanden) | no |
| R3 | (Apply-R3) ein zusätzlicher Hin- und Rückweg je weitergeleiteter Anfrage; der Spike maß etwa 100 Millisekunden je Abfrage | `low` | no |
| R4 | (Apply-R4) kein Ratenlimit für Rückfragen an ein Opfer; M8 prüft | `low` | no |
| A1 | (Apply-A1) Zustellung und Antwort GM → Spieler | **bestätigt** (Spike) | no |
| A2 | (Apply-A2) nicht verbundener Nutzer wird abgelehnt | **bestätigt** (Spike: sofortige Ablehnung `User [<id>] is not active`) | no |
| A3 | (Apply-A3) der Client beantwortet die Rückfrage, während seine Anfrage läuft | in der Simulation gezeigt (S2, auch zwei Anfragen gleichzeitig); live noch `unverified` | no |

Die übrigen Risiken und Annahmen des Apply (R5 bis R7, A4) sind unverändert; A4 (`eagleeye.confirm`, `askedBy`, 5 Sekunden, API `0.5.0`) ist mit dem "Go" bestätigt.
Kein `critical`-Fund, kein `high`-Fund, keine Dependency-Änderung, kein Human-Decision-Trigger.

---

## Decision Log

Abweichungen und Feinheiten gegenüber dem Apply, alle ohne neue Architekturentscheidung:

1. **Absenderprüfung vor der Rückfrage:** `receive` prüft nach dem Ausführungsort zusätzlich, ob das genannte Modul angemeldet ist, **bevor** es zurückfragt. Das folgt dem Grundsatz des Apply "Was vorher scheitert, löst keine Rückfrage aus";
   der Test P8 deckt es mit ab.
2. **Unbekannter Typ:** Wird kein Handler angeboten, beantwortet der Kern die Anfrage ohne Rückfrage (kein Handler läuft, niemand muss gefragt werden); im Code so kommentiert.
3. **`RequestRelay.execute` reicht `ExecuteOptions` an den Kern weiter** (für den lokalen Weg); auf dem weitergeleiteten Weg zählt allein `currentUserId`.
4. **Hülle:** Die Funktion heißt `registerRelayQueries` (statt `registerRelayQuery`), und `foundryCurrentUser` ist neu; beides ist die im Apply beschriebene Verdrahtung.
5. **Vertrag:** Abschnitt 8 nennt zusätzlich die mit dem Spike-Modul beobachteten Foundry-Fakten (nur Dokumentation).
6. **Test P8** überschneidet sich zum Teil mit dem angepassten Test des M5 ("refuses a caller-type …"); P8 prüft zusätzlich, dass nie zurückgefragt wird.
7. Die einmalige Diagnosezeile zu den Handler-Argumenten aus M5 bleibt (M5-R11, M8 entscheidet).

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6a-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Code, Tests, Testmodule, `docs/api-contract.md` (siehe Files Changed) | durable (nicht committet) |
| Live-Check-Pakete in `v13/dist/live-check/` (`eagleeye-v13-m6a.zip`, Dummys a bis d) | ephemeral |

---

## Next Step

Monitor M6a ohne Stopp (Working Mode): Abgleich Acceptance gegen Deploy-Output, Regressionen, Restrisiken, Liste der `unverified`-Punkte und die Anleitung für den Live-Check mit GM und Spieler, einschließlich des Einzeilers für eine gefälschte Angabe.

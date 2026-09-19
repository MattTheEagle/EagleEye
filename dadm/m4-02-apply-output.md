# M4 — Anfragekanal-Kern — Apply Output

```
artifact: apply-output
milestone: M4
phase: APPLY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Design ohne Implementierung (Schnittstellen als Signaturen, keine Funktionsrümpfe). Der Deploy beginnt erst nach dem ausdrücklichen "Go"
des Projektleiters (`06-working-mode.md`).

---

## Input Summary

- Geschlossener Discover-Output `m4-01-discover-output.md`. Verweise darin: **I** Repo-Ist, **S** Spezifikation, **F** Foundry-Fakten,
  **U** nicht ohne Live-Test belegbar, **D** Dependencies, **Q** offene Fragen. Verweise auf dessen Risiken und Annahmen tragen das Präfix
  "Discover-"; die Risiken (R1–R8) und Annahmen (A1–A4) dieses Dokuments stehen unten.
- `04-milestone-plan.md` (M4), `m3-04-monitor-output.md` (Übergaben), Konventionen K1–K4 (`m1-02-apply-output.md`)
- Bestätigte Entscheidungen: P-FC7, Q3 a, N4, U2, N1 (Spezifikation, Tabelle S1–S9 des Discover)

---

## Solution Design

### 1. Leitlinie

Der Kern ist eine **kleine, reine Ausführungseinheit**: Sie bekommt einen Umschlag (Absender, Anfragetyp, Version, Daten), prüft ihn in
fester Reihenfolge, ruft den passenden Handler auf und liefert **immer** ein Ergebnis im bestehenden Muster `{ ok, … }` (nie eine Ausnahme).
Umschlag und Ergebnis bestehen nur aus **JSON-Werten**, damit M5 dieselbe Ausführung unverändert über `User#query` beim GM aufrufen kann.
Der Kern bringt **genau einen** Handler mit (den Nachweis); jede Fachanfrage gehört in den Milestone des Moduls, das sie braucht (N4, R2).
Der Kern liegt in `core/` (K1), die Hülle in `v13/` ändert sich nicht.

### 2. Entscheidungen zu den offenen Fragen des Discover

| Q | Entscheidung | Grund | Verworfene Alternative |
|---|---|---|---|
| Q1 Umschlag | Eine Anfrage ist **ein Objekt** `{ module, type, version?, payload? }`: `module` = Modul-`id` des Absenders, `type` = Anfragetyp, `version` = positive ganze Zahl (Standard `1`), `payload` = beliebiger JSON-Wert oder weggelassen. Zusatzfelder werden ignoriert. Die Antwort ist `{ ok: true, value }` mit JSON-Wert oder `{ ok: false, reason, detail }`. Beides wird beim Eintritt und beim Austritt auf JSON-Tauglichkeit geprüft | ein einziges Objekt lässt sich später additiv erweitern, ohne den Aufruf zu brechen; JSON-Pflicht wegen `User#query` (F1, Discover-R3); gleiches Ergebnismuster wie `registerModule` (I3) | mehrere Parameter (`request(module, type, payload)`; bricht bei jeder Erweiterung); Funktionen oder Klasseninstanzen im Umschlag (nicht weiterleitbar) |
| Q2 Fehlerbild | Sieben stabile Codes: `invalid-request` (Umschlag fehlerhaft), `not-registered` (Absender nicht angemeldet oder nicht aktiv), `unknown-request` (kein Handler für den Typ), `unsupported-version`, `invalid-payload`, `handler-failed` (Handler wirft, lehnt ab oder liefert Nicht-JSON), `internal-error`. `detail` ist ein Satz für Logs. Der Vertrag sagt: **unbekannte künftige Codes sind als Fehlschlag zu behandeln**; spätere Teile dürfen Codes ergänzen (z. B. `not-permitted` mit M6) | passt zu I3; additive Erweiterung ohne Bruch | einen Code `not-permitted` schon jetzt dokumentieren, obwohl nichts ihn erzeugt |
| Q3 Benennung und Version | Anfragetypen heißen `<bereich>.<verb>` in Kleinbuchstaben mit Punkten (Muster `^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$`). Jeder Handler nennt die Versionen, die er versteht (z. B. `[1]`). Eine Anfrage ohne `version` gilt als Version `1`; eine nicht unterstützte Version ergibt `unsupported-version`. Die **API-Version** steigt nur, wenn sich der Kern selbst ändert (neues Mitglied, neuer Umschlag); neue Anfragetypen und neue Handler-Versionen erhöhen sie nicht | Stabilität über getrennt veröffentlichte Module (Discover-R1): alte Aufrufer behalten ihr Verhalten, weil sie die Version nennen oder weglassen; das Muster passt zu Foundrys Regel für präfixierte Abfragenamen (F2) | Version im Typnamen (`ping2`); nur die API-Version (jede neue Fachanfrage würde alle Module brechen) |
| Q4 Handler und Datenprüfung | Handler sind **intern** in Flight Control (A2): `{ type, versions, validate(payload), run(payload, context) }`. `validate` prüft die Daten von Hand und liefert `{ ok, value }` oder `{ ok: false, detail }`; erst danach läuft `run`. Der Kern prüft bei der Erzeugung jede Handler-Definition (Typmuster, nicht leere Versionsliste aus positiven ganzen Zahlen, keine doppelten Typen) und **wirft** bei einem Fehler (Programmierfehler). Spätere Milestones ergänzen Handler in eigenen Dateien, ohne den Kern zu ändern | keine Schema-Bibliothek nötig (Discover-R6, D3); klare Trennung Format (Kern) und Fachlogik (Handler) | Module registrieren eigene Handler (Modul-zu-Modul-Kanal, nicht in P-FC7 gemeint); Validierungsbibliothek (Dependency-Freigabe) |
| Q5 Absender und Rechte | Der Kern löst den Absender über `registry.list()` auf (angemeldet **und aktiv**) und gibt ihn dem Handler als `context.module`. Die Rechteprüfung (M6) hängt später **intern** vor dem Aufruf von `run` ein und braucht keine Änderung der öffentlichen API; `execute` kennt keinen Transport, M5 ruft es auf dem GM-Client mit demselben Umschlag auf. Reihenfolge der Prüfung: Umschlag → Absender → Handler → Version → Daten → Ausführung → JSON-Ergebnis | Ein nicht angemeldeter Absender erfährt nichts über vorhandene Handler; die Modul-`id` bleibt selbst angegeben (Discover-R4), der Vertrag sagt das ausdrücklich | sofort einen Rechte-Haken mit Standard "erlaubt" bauen (spekulativ; intern nachrüstbar) |
| Q6 Nachweis | Genau ein Handler: **`flightcontrol.ping`**, Version `1`, Daten `undefined`, `null` oder `{ echo?: string }` (höchstens 200 Zeichen), Ergebnis `{ apiVersion, module, echo }` (`echo` ist `null`, wenn nicht gegeben). Er berührt Foundry nicht | beweist Umschlag, Absenderprüfung, Datenprüfung und Ergebnis ohne Fachlogik (R2); braucht keinen Live-Test für Foundry-Daten | Handler, die Dokumente lesen oder ändern (Fachanfrage, gehört zu späteren Milestones) |
| Q7 API-Fläche und Version | Die API erhält ein drittes Mitglied `request(request: unknown): Promise<RequestResult>`; es lehnt nie ab. **API-Version `0.3.0`**; die Dummy-Module ziehen nach. `createEagleApi` bekommt den Kern als optionalen dritten Parameter (Standard: Kern mit den Standard-Handlern), sodass bestehende Aufrufe und Tests gültig bleiben. Fehlschläge werden per `warn` geloggt, Erfolge nicht | die kleinste Ergänzung der Fläche (N4); Regel "vor 1.0 bricht Minor" (M2) | eigene Ereignisse/Hooks für Antworten (größere Fläche) |
| Q8 Vertrag Teil 3 und Dummys | `docs/api-contract.md` bekommt den Abschnitt "Requests" (Umschlag, Antwort, sieben Codes, Benennung und Versionen, JSON-Pflicht, `flightcontrol.ping`); Dummy a fragt `ping` mit `echo`, Dummy c fragt `ping` (erwartet `not-registered`), Dummy d fragt einen unbekannten Typ (`unknown-request`) und `ping` mit ungültigen Daten (`invalid-payload`); Aufrufe im `ready`-Hook, nach allen Anmeldungen | belegt live jede Antwortart mit echten Modulen | keine Dummy-Anpassung (kein Live-Nachweis der Fehlerarten) |

### 3. Schnittstellen (nur Signaturen)

```ts
// core/json-value.ts (neu)
export type JsonValue = null | boolean | number | string | readonly JsonValue[] | { readonly [key: string]: JsonValue };
export function isJsonValue(value: unknown): value is JsonValue;    // endliche Zahlen, Text, Wahrheitswerte, null, Arrays, einfache Objekte; keine Zyklen

// core/request-kernel.ts (neu)
export interface RequestEnvelope { module: string; type: string; version?: number; payload?: unknown }   // Zusatzfelder werden ignoriert
export type RequestFailure =
  | "invalid-request" | "not-registered" | "unknown-request" | "unsupported-version"
  | "invalid-payload" | "handler-failed" | "internal-error";
export type RequestResult =
  | { readonly ok: true; readonly value: JsonValue }
  | { readonly ok: false; readonly reason: RequestFailure; readonly detail: string };
export type PayloadCheck<P> = { readonly ok: true; readonly value: P } | { readonly ok: false; readonly detail: string };
export interface RequestContext { readonly module: RegisteredModule }
export interface RequestHandler<P = unknown> {
  readonly type: string;                                   // "<bereich>.<verb>"
  readonly versions: readonly number[];                    // verstandene Anfrageversionen, z. B. [1]
  validate(payload: unknown): PayloadCheck<P>;
  run(payload: P, context: RequestContext): Promise<JsonValue>;
}
export interface RequestKernel { execute(request: unknown): Promise<RequestResult> }                       // löst nie mit Ablehnung auf
export const REQUEST_TYPE_PATTERN: RegExp;                                                                 // ^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$
export function createRequestKernel(registry: Pick<ModuleRegistry, "list">, handlers: readonly RequestHandler[]): RequestKernel;  // wirft bei ungültiger Handler-Definition

// core/request-handlers.ts (neu)
export function defaultRequestHandlers(apiVersion: string): RequestHandler[];                              // genau: flightcontrol.ping (Version 1)

// core/eagle-api.ts (erweitert)
export interface EagleFlightControlApi {
  readonly version: string;
  registerModule(descriptor: unknown): RegistrationResult;
  request(request: unknown): Promise<RequestResult>;
}
export function createEagleApi(registry: ModuleRegistry, log?: ApiLogger, kernel?: RequestKernel): Readonly<EagleFlightControlApi>;
```

Prüfreihenfolge in `execute` (bei jedem Fehler sofort Ergebnis, keine weitere Prüfung):
1. Umschlag: Objekt (kein Array, nicht `null`), `module` nicht leerer Text, `type` passt auf das Muster, `version` weggelassen oder positive ganze Zahl,
   `payload` weggelassen oder JSON-Wert → sonst `invalid-request`
2. Absender: `registry.list()` enthält `module` → sonst `not-registered`
3. Handler zum `type` → sonst `unknown-request`
4. `version` (Standard `1`) in `handler.versions` → sonst `unsupported-version` (mit den unterstützten Versionen im `detail`)
5. `handler.validate(payload)` → sonst `invalid-payload` mit dem `detail` des Handlers
6. `handler.run(value, { module })`; Ausnahme oder Ablehnung → `handler-failed`
7. Ergebnis ist JSON-Wert (`undefined` gilt nicht) → sonst `handler-failed`; dann `{ ok: true, value }`
8. Jede unerwartete Ausnahme außerhalb der Handler → `internal-error`

### 4. Ablauf

```
Modul (nach seiner Anmeldung)                       Flight Control (im selben Client, M4)
  api.request({ module, type, version?, payload? })
        │  await
        ▼
  [ createEagleApi.request ] ── kernel.execute(envelope) ──▶ 1 Umschlag  2 Absender  3 Handler  4 Version  5 Daten
        │                                                    6 run(...)  7 JSON-Ergebnis
        ◀──────────── { ok: true, value }  |  { ok: false, reason, detail }
  Fehlschlag wird per warn geloggt (Erfolg nicht)

Später (nicht in M4):  M5: gleicher Umschlag per User#query an den GM-Client, dort dieselbe execute-Funktion
                       M6: Rechteprüfung zwischen Schritt 5 und 6 (intern, neuer Fehlercode additiv)
```

### 5. Zielbild der Dateien

```
core/
  json-value.ts + .test.ts          neu    JsonValue, isJsonValue
  request-kernel.ts + .test.ts      neu    Umschlag, Ergebnis, Kern
  request-handlers.ts + .test.ts    neu    flightcontrol.ping
  eagle-api.ts (+test)              erweitert: request, optionaler Kern
  api-version.ts (+test)            EAGLE_API_VERSION = "0.3.0"
v13/module.ts                       unverändert (die API-Typen wachsen über ModuleConfig automatisch mit)
test-fixtures/
  eagleeye-dummy-a/, -c/, -d/       ready-Hook mit Anfragen; a und d melden sich mit 0.3.0 an; c bleibt 9.0.0
  eagleeye-dummy-b/                 unverändert
docs/api-contract.md                Teil 3 (siehe Abschnitt 8)
```

### 6. Testplan (Vitest; jeder Fall genau ein `it`, Tabellenfälle laufen als Schleife im Test)

| # | Datei | Fall |
|---|---|---|
| P1 | json-value | `isJsonValue` akzeptiert `null`, Wahrheitswerte, endliche Zahlen, Text, verschachtelte Arrays und einfache Objekte |
| P2 | json-value | `isJsonValue` lehnt ab: `undefined` (auch als Eigenschaft), `NaN`, `Infinity`, Funktion, Symbol, `bigint`, `Date`, `Map`, Klasseninstanz, Zyklus |
| P3 | request-kernel | `createRequestKernel` wirft bei ungültiger Handler-Definition: Typ nicht im Muster, leere oder ungültige Versionsliste, doppelter Typ |
| P4 | request-kernel | gültige Anfrage: `validate` sieht die Daten, `run` bekommt den geprüften Wert und `context.module`; Ergebnis `{ ok: true, value }` |
| P5 | request-kernel | ungültige Umschläge → `invalid-request`: `null`, Text, Array, ohne `module`, `module` kein Text, ohne `type`, `type` falsch geformt, `version` `0`/`1.5`/`"1"`, `payload` Nicht-JSON |
| P6 | request-kernel | nicht angemeldeter oder inaktiver Absender → `not-registered`, auch bei unbekanntem Typ (Vorrang vor `unknown-request`) |
| P7 | request-kernel | unbekannter Typ → `unknown-request` |
| P8 | request-kernel | Version: weggelassen gilt als `1`; nicht unterstützte Version → `unsupported-version` mit den unterstützten Versionen im `detail` |
| P9 | request-kernel | ungültige Daten → `invalid-payload` mit dem `detail` des Handlers; `run` läuft nicht |
| P10 | request-kernel | werfende oder ablehnende `run`/`validate` → `handler-failed` mit Nachricht; der Kern lehnt nie ab |
| P11 | request-kernel | Handler-Ergebnis kein JSON (`undefined`, Funktion, `NaN`) → `handler-failed` |
| P12 | request-kernel | wirft die Registry, kommt `internal-error` zurück |
| P13 | request-handlers | `flightcontrol.ping`: Daten `undefined`/`null`/`{}`/`{ echo: "x" }` gültig; `{ echo: 5 }`, Text, zu langes `echo` ungültig; Ergebnis `{ apiVersion, module, echo }` |
| P14 | request-handlers | `defaultRequestHandlers` enthält genau einen Handler (`flightcontrol.ping`, Versionen `[1]`); Schutz gegen unbemerktes Wachsen (N4) |
| P15 | eagle-api | die API ist eingefroren und hat genau `version`, `registerModule` und `request` (bestehender Test T18 wird angepasst) |
| P16 | eagle-api | `request` liefert das Ergebnis des Kerns durch, loggt einen Fehlschlag per `warn` mit Grund, einen Erfolg nicht, und lehnt nie ab (auch wenn der Kern wirft: `internal-error`) |
| P17 | api-version | `EAGLE_API_VERSION` ist `"0.3.0"` (bestehender Test H4 wird angepasst) |

Erwartet: **10 Testdateien mit 59 Tests**. Die 44 bestehenden Tests bleiben, zwei davon werden angepasst (T18 wird zu P15, H4 zu P17); neu sind
**15 Tests**: P1–P14 und P16. Neue Dateien sind `json-value.test.ts`, `request-kernel.test.ts` und `request-handlers.test.ts` zu den bisherigen sieben.

### 7. Dummy-Module (klassische Skripte)

- **a:** `apiVersion "0.3.0"`; im `ready`-Hook `await api.request({ module: "eagleeye-dummy-a", type: "flightcontrol.ping", payload: { echo: "hello" } })`
  und Ausgabe des Ergebnisses (erwartet: `ok`, `value { apiVersion: "0.3.0", module: "eagleeye-dummy-a", echo: "hello" }`).
- **c:** bleibt `9.0.0` (abgewiesen); im `ready`-Hook `ping` (erwartet `not-registered`).
- **d:** `apiVersion "0.3.0"`; im `ready`-Hook ein Anfragetyp `nope.nothing` (erwartet `unknown-request`) und `ping` mit `{ echo: 5 }` (erwartet `invalid-payload`).
- **b:** unverändert.

### 8. API-Vertrag Teil 3 (Änderungen an `docs/api-contract.md`)

Kopfzeile und Überschrift auf `0.3.0` und "parts 1 to 3"; TypeScript-Block um `request` und die Typen `RequestResult`/`RequestFailure` erweitern;
neuer Abschnitt "Requests" (nach dem Hub): Umschlag und Felder, Antwort, die sieben Codes als Tabelle mit Reaktion, Regel "unbekannte Codes sind Fehlschläge",
Benennung `<area>.<verb>`, Versionen (Standard `1`, `unsupported-version`), JSON-Pflicht in beide Richtungen, der Absender ist die selbst angegebene Modul-`id`,
Ausführung im Client des Aufrufers (bis das Weiterleiten an den GM kommt), `flightcontrol.ping` mit Beispiel; "What is verified": Kern durch Unit-Tests
belegt, Verhalten in Foundry `unverified` bis zum Live-Check; "Not part": Fachanfragen und Weiterleitung; Änderungshistorie `0.3.0`.
Die Fehlercodes der Tabelle sind per Skript mit dem Code zu vergleichen.

### 9. Übergaben

- **M5:** `execute(request)` bleibt transportfrei. Auf allen Clients wird `CONFIG.queries["eagleeye.request"]` (Präfix laut F2) registriert und ruft beim GM
  dieselbe Funktion auf; die Entscheidung, welche Anfragen beim GM ausgeführt werden müssen, ist Sache von M5. Umschlag und Ergebnis sind JSON-tauglich.
- **M6:** Die Rechteprüfung hängt intern zwischen Datenprüfung und Ausführung ein; der Code `not-permitted` kommt additiv. Der Absender ist die Modul-`id`.
- **Spätere Milestones:** Jede Fachanfrage (Dokumente anlegen, auslesen, live ändern, kopieren) wird ein eigener Handler in einer eigenen Datei mit eigenem Apply
  (N4); Änderungen an Handler-Daten erhöhen deren Handler-Version, nicht die API-Version.
- **M8:** Konsolidierung des Vertrags; die Regel für unbekannte Codes und die Handler-Versionierung sind Teil der Versionspolitik ab 1.0.

### 10. Deploy-Reihenfolge (Plan, ohne Code)

1. `core/json-value.ts` mit P1–P2
2. `core/request-kernel.ts` mit P3–P12
3. `core/request-handlers.ts` mit P13–P14
4. `core/eagle-api.ts` erweitern (P15–P16), `core/api-version.ts` (P17)
5. Dummy-Module a, c, d anpassen
6. `docs/api-contract.md` (Teil 3)
7. Prüfen: **einmal** `typecheck`, `test`, `build`; Skriptprüfungen (Fehlercodes Vertrag ↔ Code, Fixtures-Syntax); Suche nach verbotenen Mustern; Zeitstempelvergleich der geänderten Dateien
8. Deploy-Output; kein Commit ohne Anweisung, kein Live-Test durch mich

---

## Acceptance Criteria

```
AC-M4-01: core/json-value.ts exportiert JsonValue und isJsonValue; die Tests P1-P2 bestehen.
AC-M4-02: core/request-kernel.ts exportiert createRequestKernel, REQUEST_TYPE_PATTERN und die Typen aus Abschnitt 3; execute löst nie mit einer Ablehnung auf, prüft in der Reihenfolge aus Abschnitt 3 und kennt genau die sieben Codes; die Tests P3-P12 bestehen.
AC-M4-03: core/request-handlers.ts exportiert defaultRequestHandlers; die Standardmenge enthält genau einen Handler, flightcontrol.ping mit den Versionen [1]; die Tests P13-P14 bestehen.
AC-M4-04: core/eagle-api.ts: die API ist eingefroren und hat genau version, registerModule und request; request löst nie mit einer Ablehnung auf, loggt Fehlschläge per warn und Erfolge nicht; ohne dritten Parameter wird der Kern mit den Standard-Handlern erzeugt; die bisherigen Tests T19-T21 bleiben unverändert grün; die Tests P15-P16 bestehen.
AC-M4-05: EAGLE_API_VERSION ist "0.3.0" (P17).
AC-M4-06: v13/module.ts, v13/hub-application.ts und core/hub-model.ts sind unverändert; typecheck bestätigt, dass game.modules.get("eagleeye")?.api den neuen Typ mit request hat.
AC-M4-07: docs/api-contract.md nennt API 0.3.0, request im TypeScript-Block, den Abschnitt "Requests", flightcontrol.ping mit Beispiel, den Eintrag 0.3.0 in der Historie; die Fehlercodes der Requests-Tabelle sind identisch mit denen im Code (Skript).
AC-M4-08: eagleeye-dummy-a und -d melden sich mit "0.3.0" an, a, c und d stellen die Anfragen aus Abschnitt 7 im ready-Hook; c bleibt "9.0.0"; b ist unverändert; JSON parst, node --check ist ok.
AC-M4-09: npm run typecheck endet mit Exit 0; npm test endet mit Exit 0 und meldet 10 Testdateien und 59 Tests, alle bestanden; npm run build endet mit Exit 0; das Bundle enthält "flightcontrol.ping" und kein "libWrapper".
AC-M4-10: package.json, package-lock.json, v13/tsconfig.json, core/manifest-scanner.ts, core/settings-hub.ts und die Hub-Dateien sind unverändert; die durch M4 geänderten Dateien stimmen mit Abschnitt 5 überein (Zeitstempelvergleich, da nicht committet).
AC-M4-11 (unverified, nur nach ausdrücklicher Live-Freigabe): In Forge liefert a "ok" mit dem erwarteten Wert, c "not-registered", d "unknown-request" und "invalid-payload".
```

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (Discover-R1) Die Stabilität des Formats ist das größte Einzelrisiko des Vorhabens. Das Design mindert es durch ein einziges, additiv erweiterbares Umschlag-Objekt, eine ausdrückliche Version je Anfragetyp, stabile Codes mit der Regel "unbekannte Codes sind Fehlschläge", JSON-Pflicht und genau einen Nachweis-Handler; ein Restrisiko bleibt, weil sechs weitere Module das Format erst noch benutzen werden. Mit dem "Go" ausdrücklich anzunehmen. | `high` | no |
| R2 | (Discover-R2) Mega-Modul: Die Standardmenge der Handler ist auf `flightcontrol.ping` begrenzt und der Test P14 verhindert unbemerktes Wachsen; jede Fachanfrage braucht das Apply ihres Milestones. | `medium` | no |
| R3 | (Discover-R3) Die JSON-Pflicht wird in beide Richtungen erzwungen (Umschlag und Ergebnis); die eigene Prüfung `isJsonValue` muss Zyklen, Prototypen und Sonderwerte sicher ablehnen (P2). | `low` | no |
| R4 | (Discover-R4) Der Absender ist die selbst angegebene Modul-`id`; ein Modul kann sich als ein anderes ausgeben. Rechte je Modul und Nutzer (M6) sind damit eine Vertrauens-, keine Sicherheitsgrenze; der Vertrag sagt das. | `low` | no |
| R5 | (Discover-R5) API `0.3.0` macht die Dummys mit `0.2.0` unverträglich; sie werden mit umgestellt. | `low` | no |
| R6 | (Discover-R6) Die Datenprüfung ist von Hand geschrieben; jeder künftige Handler muss sie liefern. Das ist gewollt (keine neue Dependency), erhöht aber den Aufwand je Handler. | `low` | no |
| R7 | Bis M5 läuft ein Handler im Client des Aufrufers; ein Handler, der Dokumente ändert, scheitert für einen Nutzer ohne Foundry-Recht an Foundry selbst und käme als `handler-failed` zurück. Für `ping` unerheblich. | `low` | no |
| R8 | Die Ausführung des Kerns in Foundry ist nicht live belegt; sie besteht nur aus reiner Logik und sollte sich wie im Test verhalten, ein Live-Check der Dummys bestätigt es. | `low` | no |
| A1 | **Annahme (mit dem "Go" zu bestätigen):** Der Anfragetyp der Nachweis-Anfrage heißt `flightcontrol.ping`, und die Benennung `<bereich>.<verb>` in Kleinbuchstaben ist gewollt. | `low` | no |
| A2 | **Annahme:** Die Handler gehören zu Flight Control selbst; Module registrieren keine eigenen Handler und es gibt keinen Weg von Modul zu Modul über den Kern (P-FC7, N4). | `low` | no |
| A3 | **Annahme:** Ein Anfrageumschlag ohne `version` gilt dauerhaft als Version `1` (alte Aufrufer bleiben unberührt). | `low` | no |

`high` in R1 ist mit dem "Go" ausdrücklich anzunehmen (Governance). Sonst kein `high`+-Fund außer dem im Plan benannten, kein Human-Decision-Trigger: keine
Dependency-Änderung, keine Cross-Milestone-Änderung (Fachanfragen sind ausdrücklich ausgeschlossen), keine neue Sicherheitsgrenze (die Absenderangabe wird
als Vertrauensgrenze dokumentiert).

---

## Open TBDs

Sie werden zusammen mit dem "Go" beantwortet; die Vorschläge gelten, solange nichts anderes genannt wird.

| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Nachweis-Anfrage und Benennung bestätigen: `flightcontrol.ping`, Muster `<bereich>.<verb>` (A1) | important | Projektleiter |
| T2 | Live-Prüfung: die M3-Prüfung (Hub) und die M4-Prüfung (Anfragen der Dummys) in **einem** neuen Paketsatz nach dem M4-Deploy bündeln (Vorschlag), oder getrennt | important | Projektleiter |
| T3 | Aus M1 bis M3: die zwei Plan-Stellen und das Root-`README.md` nachführen, jetzt oder mit M8 (Vorschlag: M8) | nice-to-have | Projektleiter |

---

## Next Step

Nach dem "Go" des Projektleiters: Deploy M4 — Reihenfolge Abschnitt 10, beginnend mit `core/json-value.ts` und den Tests P1–P2.

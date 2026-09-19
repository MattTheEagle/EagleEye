# M5 — GM-Weiterleitung — Apply Output

```
artifact: apply-output
milestone: M5
phase: APPLY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Design, Schnittstellen, Tests und Akzeptanzkriterien. Kein Code, keine Implementierung; der Deploy wartet auf das "Go" des Projektleiters
(`06-working-mode.md`).

---

## Input Summary

- Geschlossener Discover-Output `m5-01-discover-output.md`. Verweise darin: **FF** Foundry-Fakten, **U** nicht ohne Live-Test belegbar, **Q** offene Fragen
  (1 bis 8). Verweise auf dessen Risiken und Annahmen tragen das Präfix "Discover-"; die Risiken (R1–R11) und Annahmen (A1–A4) dieses Dokuments stehen unten.
- `04-milestone-plan.md` (M5 mit Risiken), `m4-04-monitor-output.md` (Übergaben), `m4-05-live-check-output.md` (Registry, Kern, Hub live bestätigt),
  `m4-02-apply-output.md` (Q5, Ablauf), Konventionen K1–K4 (`m1-02-apply-output.md`)
- Bestätigte Entscheidungen: N1, N4, Q3 a, kein socketlib, `User#query` mit präfixiertem Namen (`eagle-modules-projektplan.md` Abschnitt 3.1)

---

## Solution Design

### 1. Leitlinie

Die Weiterleitung ist **kein Proxy für alles**, sondern eine enge Tür: Ein Anfragetyp erklärt selbst, **wo** er läuft (`runsOn`: im Client des Aufrufers oder beim GM). Nur
Typen, die ausdrücklich beim GM laufen, verlassen den Client eines Nutzers ohne GM-Rolle. Die GM-Seite vertraut dem Absender nichts: Sie prüft Rolle, Ausführungsort, Größe,
Modul-Anmeldung und Daten **neu**, mit ihrer eigenen Registry. Eine Entscheidung anhand der Nutzeridentität trifft M5 nicht (sie ist nicht belegt, U1); das ist Aufgabe von M6 und
dort eine harte Vorbedingung. Bis M6 gibt es genau einen Handler mit `runsOn: "gm"`, den lesenden Nachweis `flightcontrol.gmping`. Die Logik liegt rein in `core/` (K1), der Transport ist eine
dünne Hülle in `v13/` (K2/K3).

### 2. Entscheidungen zu den offenen Fragen des Discover

| Q | Entscheidung | Grund | Verworfene Alternative |
|---|---|---|---|
| Q1 Ort der Entscheidung | Am Handler: `runsOn: "caller"` (Standard) oder `"gm"`. Wer eine GM-Rolle hat (`isGM`, auch Assistent, FF9), führt jeden Typ lokal aus; jeder andere schickt `gm`-Typen an den GM. Der Ort hängt am Anfragetyp, **nicht** an den Foundry-Rechten des Nutzers. | deterministisch; kleinste Rechte (nur was ein Handler ausdrücklich beansprucht, läuft mit GM-Rechten); keine Auswertung von Fehlertexten | alles von Spielern weiterleiten (jeder Handler liefe mit GM-Rechten); erst lokal, bei Rechtefehler weiterleiten (Doppelausführung, Fehlertexte parsen); Rollen im Client auswerten |
| Q2 Absenderangabe | M5 entscheidet **nicht** anhand einer Nutzeridentität. Die GM-Seite prüft die Modul-Anmeldung in ihrer eigenen Registry, den Ausführungsort, die Größe und die Daten. Die Hülle protokolliert einmalig, welche Argumente Foundry dem Query-Handler übergibt (Diagnose für U1). M6 muss U1 klären, **bevor** es Rechte je Nutzer entscheidet. | eine selbst mitgeschickte `userId` wäre fälschbar und würde Sicherheit nur vortäuschen; U1 lässt sich billig im Live-Check beantworten | `userId` im Umschlag mitschicken und darauf prüfen |
| Q3 Standardverhalten vor M6 | Verweigern, was nicht ausdrücklich `gm` ist: Der Empfänger führt nur Typen aus, deren Handler `runsOn: "gm"` trägt; alles andere ist `not-permitted`. Bis M6 gibt es genau einen solchen Handler (`flightcontrol.gmping`, nur lesend); ein Test hält die Menge fest. **Regel:** Kein Handler, der Daten ändert oder GM-Wissen weitergibt, trägt `runsOn: "gm"`, bevor M6 und U1 geklärt sind. | Verweigern als Standard; die Menge der GM-Handler bleibt überprüfbar klein | erlauben, bis M6 kommt |
| Q4 Fehlerbild | Vier neue Codes, additiv: `no-gm` (kein GM verbunden, es wird nichts gesendet), `relay-timeout` (eigener Zeitgeber 15 s; die Foundry-Option `timeout` ist 15 s plus 2 s Puffer, damit unser Zeitgeber zuerst auslöst; **der Ausgang ist unbekannt, die Anfrage kann noch laufen**), `relay-failed` (Transport lehnt ab, Antwort ist kein Ergebnis), `not-permitted` (Empfänger verweigert; in M6 auch für fehlende Rechte). Jeder Fehler von `User#query`, gleich welcher Art (U2 bis U5), wird zu `relay-failed` mit dem Text der Meldung. Bei `handler-failed` und `internal-error` vom GM ist `detail` **allgemein**, der Originaltext steht in der Konsole des GM. | die Zuordnung bleibt stabil, auch wenn das Verhalten von Foundry (U2 bis U5) anders ist als gedacht; kein Text aus der GM-Umgebung gelangt zum Spieler (Datenschutz) | Fehlerarten von Foundry einzeln unterscheiden (nicht belegt); Originaltext weiterreichen |
| Q5 Auswahl des GM | Der Aufrufer nimmt `game.users.activeGM` (FF7). Ist er selbst ein GM, läuft die Anfrage lokal. Der Empfänger verlangt nur `isGM` (nicht "aktiver GM"), damit abweichende Sichten zweier GM-Clients keine Anfrage ablehnen; Clients ohne GM-Rolle verweigern (`not-permitted`). | robust bei mehreren GMs (U8); ein Spieler-Client kann nicht als Zwischenstation dienen | Empfänger nur bei `isActiveGM` |
| Q6 Name der Query | `eagleeye.request` (Präfixregel FF2). Der Typ wird in `v13/relay.ts` mit `declare global { namespace CONFIG { interface Queries { … } } }` ergänzt (FF12); scheitert das im Typecheck, bleibt ein eng begrenzter Cast an einer Stelle (wie in M2). | Muster aus der Übergabe von M4; Regel für Modulnamen | ungeprägter Name (verboten, FF2) |
| Q7 Schnitt der Tests | Reine Logik in `core/request-relay.ts` mit eingespeister Umgebung (Rolle, GM vorhanden, Senden); Hülle `v13/relay.ts` dünn, ohne Test, live geprüft; Testmodule a und d stützen den Live-Check (Abschnitt 7) | K1 bis K4 | Foundry im Test nachbauen |
| Q8 Vertrag Teil 4 | Abschnitt 8 unten | | |

Weitere Festlegungen:

- **Grenzen:** Zeitüberschreitung `RELAY_TIMEOUT_MS = 15000`; Größe eines weitergeleiteten Umschlags höchstens `MAX_RELAY_SIZE = 65536` Zeichen (JSON-Text). Beides sind Werte im Code, der Vertrag nennt sie.
- **API-Version `0.4.0`** (wie bei M2 bis M4 eine Minor je Teil des Vertrags; die Dummys a und d werden umgestellt).
- **Nachweis-Handler `flightcontrol.gmping`** (Version 1, `runsOn: "gm"`): gleiche Daten wie `ping`; Antwort `{ apiVersion, module, echo, ranBy: { userId, isGm } }`, wobei `ranBy` den Client nennt, auf dem er lief. Die Nutzer-ID des GM ist für Spieler ohnehin sichtbar. Der Nachweis ist das einzige Wachstum des Kerns in M5 (N4); ohne ihn ließe sich "Spieler → GM → Ergebnis" nicht zeigen.
- **M5 ändert Dateien aus M4 nur additiv** (`request-kernel.ts`, `request-handlers.ts`); das ist die im Plan vorgesehene Abhängigkeit, keine Scope-Änderung.

### 3. Schnittstellen (nur Signaturen)

```ts
// core/request-kernel.ts  (Ergänzungen)
export type RequestFailure = /* die sieben bisherigen */ | "no-gm" | "relay-timeout" | "relay-failed" | "not-permitted";
export interface RequestHandler<P = unknown> { /* wie bisher */ readonly runsOn?: "caller" | "gm"; }  // Standard "caller"
export type RequestFailureResult = Extract<RequestResult, { readonly ok: false }>;
export type Checked<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly failure: RequestFailureResult };
export function parseEnvelope(request: unknown): Checked<RequestEnvelope>;                   // Schritt 1 aus execute, wiederverwendbar
export function findSender(registry: Pick<ModuleRegistry, "list">, moduleId: string): Checked<RegisteredModule>;  // Schritt 2
// createRequestKernel wirft zusätzlich bei runsOn außerhalb von "caller" | "gm"; execute bleibt für alle bisherigen Fälle unverändert.

// core/request-handlers.ts
export interface Executor { readonly userId: string; readonly isGm: boolean }
export function defaultRequestHandlers(apiVersion: string, executor: () => Executor): RequestHandler[];   // ping (caller), gmping (gm)

// core/request-relay.ts  (neu)
export const RELAY_TIMEOUT_MS = 15_000;
export const MAX_RELAY_SIZE = 65_536;
export interface RelayEnvironment {
  isGm(): boolean;                                                            // Rolle des Nutzers dieses Clients (GM oder Assistent)
  hasGm(): boolean;                                                           // ist aus Sicht dieses Clients ein GM verbunden
  send(envelope: RequestEnvelope, timeoutMs: number): Promise<unknown>;       // zum GM; lehnt bei jedem Fehler ab
}
export interface RequestRelayOptions {
  kernel: RequestKernel;                       // führt in diesem Client aus
  handlers: readonly RequestHandler[];         // dieselbe Liste wie beim Kern
  registry: Pick<ModuleRegistry, "list">;
  environment: RelayEnvironment;
  log: ApiLogger;
  timeoutMs?: number;                          // Standard RELAY_TIMEOUT_MS
}
export interface RequestRelay extends RequestKernel { receive(data: unknown): Promise<RequestResult> }   // GM-Seite; lehnt nie ab
export function createRequestRelay(options: RequestRelayOptions): RequestRelay;

// v13/relay.ts  (neu, Hülle)
export const RELAY_QUERY = "eagleeye.request";
export function foundryExecutor(): Executor;                                  // game.user.id und game.user.isGM
export function foundryRelayEnvironment(): RelayEnvironment;                  // isGM, activeGM, activeGM.query(RELAY_QUERY, envelope, { timeout: timeoutMs + 2000 })
export function registerRelayQuery(relay: RequestRelay, log: ApiLogger): void;   // CONFIG.queries[RELAY_QUERY] = (data, ...rest) => relay.receive(data), mit einmaliger Diagnosezeile
```

`createEagleApi` bleibt unverändert; der Standardkern für Aufrufer ohne Foundry (Tests) bekommt einen festen Platzhalter-Ausführer.
`createRequestRelay` gibt ein Objekt zurück, das `RequestKernel` erfüllt und deshalb als dritter Parameter an `createEagleApi` geht.

### 4. Ablauf

```
Aufrufer-Client (z. B. Spieler)                                                GM-Client
api.request(env)  →  relay.execute(env)
  1  parseEnvelope(env)                         → invalid-request
  2  Handler zum Typ suchen; unbekannt oder runsOn "caller" → kernel.execute(env)      [wie bisher, lokal]
  3  runsOn "gm" und isGm()                      → kernel.execute(env)                  [GM führt selbst lokal aus]
  4  findSender(eigene Registry)                 → not-registered
  5  hasGm()?                                    → no-gm             (nichts wird gesendet)
  6  bereinigten Umschlag {module,type,version?,payload?} senden; Größe > MAX_RELAY_SIZE → invalid-request
     User#query("eagleeye.request", env, {timeout: 15 s + 2 s})  ─────────────▶   CONFIG.queries["eagleeye.request"](env)
     eigener Zeitgeber 15 s                      → relay-timeout                       └─ relay.receive(env)
  7  Antwort prüfen (Ergebnismuster, JSON)       → relay-failed                          a  isGm() sonst not-permitted
  ◀────────────── { ok, value } | { ok: false, reason, detail } ──────────────           b  JSON und Größe sonst invalid-request
                                                                                          c  Handler runsOn "gm" sonst not-permitted
Fehlschläge loggt createEagleApi wie bisher (warn), Erfolge nicht                         d  kernel.execute(env), volle Prüfung mit der GM-Registry
Fehlschläge der GM-Seite loggt receive zusätzlich beim GM (warn, mit Originaltext)        e  detail von handler-failed/internal-error allgemein
```

Später (nicht in M5): M6 hängt die Rechteprüfung hinter Schritt c (Empfänger) und im Kern für die lokale Ausführung ein; `not-permitted` ist dafür schon definiert.

### 5. Zielbild der Dateien

| Datei | Änderung |
|---|---|
| `core/request-kernel.ts` | **geändert (additiv):** vier Codes, `runsOn`, `parseEnvelope`, `findSender`; `execute` nutzt beide |
| `core/request-kernel.test.ts` | angepasst und erweitert (P1 bis P3) |
| `core/request-handlers.ts` | **geändert:** Parameter `executor`, neuer Handler `flightcontrol.gmping` |
| `core/request-handlers.test.ts` | angepasst und erweitert (P17, P18) |
| `core/request-relay.ts`, `core/request-relay.test.ts` | **neu** (P4 bis P16) |
| `core/api-version.ts`, `core/api-version.test.ts` | `"0.4.0"` (P20) |
| `core/eagle-api.ts` | Platzhalter-Ausführer im Standardkern; `core/eagle-api.test.ts` um P19 erweitert |
| `v13/relay.ts` | **neu** (Hülle, Abschnitt 3) |
| `v13/module.ts` | Verdrahtung im `init`: Handler mit `foundryExecutor`, Kern, Relais, `registerRelayQuery`, API mit dem Relais als Kern; ein Fehler dabei wird geloggt, die API bleibt mit dem lokalen Kern nutzbar (kleinste Rechte) |
| `test-fixtures/eagleeye-dummy-a`, `-d` | `apiVersion "0.4.0"`; a stellt `gmping` (Abschnitt 7) |
| `docs/api-contract.md` | Teil 4 (Abschnitt 8) |
| **unverändert** | `package.json`, Lock-Datei, `v13/tsconfig.json`, `v13/hub-application.ts`, `core/hub-model.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/manifest-scanner.ts`, `core/json-value.ts`, Dummys b und c |

### 6. Testplan (Vitest; jeder Fall genau ein `it`, Tabellenfälle laufen als Schleife im Test)

| # | Datei | Fall |
|---|---|---|
| P1 | request-kernel (angepasst) | `createRequestKernel` akzeptiert `runsOn` `"caller"` und `"gm"` und wirft bei jedem anderen Wert (zusätzlich zu den bisherigen Fällen der Definitionsprüfung) |
| P2 | request-kernel | `parseEnvelope` liefert den bereinigten Umschlag (nur `module`, `type`, `version`, `payload`, Zusatzfelder weg) und für ungültige Umschläge dieselben Fehler wie `execute` |
| P3 | request-kernel | `findSender` findet einen angemeldeten aktiven Absender und liefert sonst `not-registered` |
| P4 | request-relay | Typ mit `runsOn "caller"` und unbekannter Typ laufen im lokalen Kern, ohne Senden, auch auf einem Client ohne GM-Rolle |
| P5 | request-relay | `gm`-Typ auf einem Client mit GM-Rolle läuft im lokalen Kern, ohne Senden |
| P6 | request-relay | `gm`-Typ auf einem Client ohne GM-Rolle wird gesendet: nur der bereinigte Umschlag (Zusatzfelder und Nicht-JSON-Beiwerk entfallen), Zeitwert wie festgelegt; das Ergebnis des GM kommt unverändert zurück |
| P7 | request-relay | kein GM verbunden → `no-gm`, es wird nicht gesendet |
| P8 | request-relay | wirft oder lehnt das Senden ab → `relay-failed` mit der Meldung; `execute` lehnt nie ab |
| P9 | request-relay | keine Antwort → `relay-timeout` nach dem eigenen Zeitwert (künstliche Uhr, Fake-Timer), die Option für Foundry ist größer; eine späte Antwort oder späte Ablehnung bleibt folgenlos |
| P10 | request-relay | Antworten, die kein Ergebnis sind (Text, `null`, `ok` ohne JSON-Wert, `ok: false` ohne `reason`), → `relay-failed`; Fehlschläge des GM (auch mit unbekanntem `reason`) kommen unverändert durch |
| P11 | request-relay | ungültiger Umschlag → `invalid-request`, nicht angemeldeter Absender → `not-registered`, zu großer Umschlag → `invalid-request`; jeweils ohne Senden |
| P12 | request-relay | `receive` auf einem GM-Client führt einen `gm`-Typ über den Kern aus (`context.module` aus der Registry des GM) und liefert dessen Ergebnis |
| P13 | request-relay | `receive` auf einem Client ohne GM-Rolle → `not-permitted`; der Handler läuft nicht |
| P14 | request-relay | `receive` verweigert einen `caller`-Typ mit `not-permitted` (Handler läuft nicht); ein unbekannter Typ liefert `unknown-request`, ein nicht angemeldeter Absender `not-registered` |
| P15 | request-relay | `receive` lehnt Nicht-JSON, zu große und fehlgeformte Daten mit `invalid-request` ab und lehnt selbst dann nie ab, wenn der Kern wirft (`internal-error`) |
| P16 | request-relay | `receive` ersetzt `detail` bei `handler-failed` und `internal-error` durch einen allgemeinen Satz und loggt den Originaltext per `warn`; andere Gründe behalten ihr `detail`; ein Erfolg wird nicht geloggt |
| P17 | request-handlers | `flightcontrol.gmping`: gleiche Datenprüfung wie `ping`, Antwort `{ apiVersion, module, echo, ranBy: { userId, isGm } }` aus dem eingespeisten Ausführer, `runsOn "gm"` |
| P18 | request-handlers (angepasst) | die Standardmenge enthält genau zwei Handler (`flightcontrol.ping` `caller` `[1]`, `flightcontrol.gmping` `gm` `[1]`); die Menge der `gm`-Handler ist genau `flightcontrol.gmping` (Schutz gegen unbemerktes Wachsen der GM-Rechte) |
| P19 | eagle-api | die API mit dem Relais als Kern liefert ein weitergeleitetes Ergebnis und loggt `no-gm`, `relay-timeout` und `relay-failed` per `warn`; ein Erfolg wird nicht geloggt |
| P20 | api-version (angepasst) | `EAGLE_API_VERSION` ist `"0.4.0"` |

Erwartet: **11 Testdateien mit 76 Tests.** Die 59 bestehenden Tests bleiben; drei werden angepasst (P1, P18, P20; der Ping-Test bekommt nur die neue Signatur von `defaultRequestHandlers`);
neu sind **17 Tests**: P2, P3, P4 bis P16, P17 und P19. Neue Datei ist `request-relay.test.ts` zu den bisherigen zehn.

### 7. Testmodule und Live-Check (klassische Skripte; Anleitung im Monitor)

- **a:** `apiVersion "0.4.0"`; im `ready`-Hook bleibt `ping`; neu `gmping` mit `echo` und die Ausgabe von Ergebnis und dem eigenen Nutzer (`game.user.id`, `isGM`). Erwartet auf einem Spieler-Client mit GM: `ok`, `ranBy` = GM (ID verschieden vom eigenen Nutzer);
  auf dem GM-Client: `ok`, `ranBy` = eigener Nutzer; ohne GM: `no-gm`.
- **d:** `apiVersion "0.4.0"`; sonst unverändert. **c** bleibt `9.0.0`, **b** unverändert.
- **Live-Prüfung** braucht **zwei gleichzeitig verbundene Nutzer** (GM und Spieler) und eine Freigabe je Test; sie läuft mit einem neuen Paketsatz nach dem Deploy. Reihenfolge: (A) nur der Spieler verbunden → `no-gm`;
  (B) GM zuerst, dann der Spieler → `ok` mit `ranBy` = GM, und die Konsole des GM zeigt die Diagnosezeile zu den Argumenten des Query-Handlers (klärt U1); (C) der GM führt seine eigene Anfrage lokal aus.

### 8. API-Vertrag Teil 4 (Änderungen an `docs/api-contract.md`, Englisch)

Kopfzeile und Überschrift auf `0.4.0` und "parts 1 to 4"; Abschnitt "Requests": "Where a request runs" neu (jeder Anfragetyp erklärt, ob er im Client des Aufrufers oder beim Gamemaster läuft;
ein Nutzer ohne GM-Rolle braucht dafür kein Foundry-Recht; ein GM führt jeden Typ selbst aus; Rechte je Modul und Nutzer kommen später); die vier neuen Fehlgründe mit Bedeutung und Reaktion,
darunter dass `relay-timeout` einen **unbekannten Ausgang** meldet (die Anfrage kann noch laufen; Handler, die etwas ändern, müssen das vertragen); die allgemeine Fassung von `detail` bei GM-Fehlern;
die Grenzen (15 Sekunden, 65.536 Zeichen); Tabelle der Anfragetypen um `flightcontrol.gmping` (mit Spalte "runs on"); Abschnitt "Not part" ohne die Weiterleitung, mit den Rechten je Modul und Nutzer;
"What is verified": Logik durch Unit-Tests, Verhalten in Foundry `unverified` bis zum Live-Check; Historie `0.4.0`. Die Fehlercodes der Tabelle sind per Skript mit dem Code zu vergleichen.

### 9. Sicherheitsbetrachtung (Weiterleitung mit GM-Rechten)

| # | Bedrohung | Maßnahme im Design | Rest |
|---|---|---|---|
| S1 | Ein veränderter Client sendet beliebige Umschläge an den GM | Der Empfänger prüft alles neu: Rolle, Größe, JSON, Ausführungsort, Modul-Anmeldung, Datenprüfung des Handlers | keiner für M5 (kein datenändernder GM-Handler) |
| S2 | Ein Client adressiert einen anderen Spieler statt des GM | Empfänger ohne GM-Rolle verweigert (`not-permitted`) | keiner |
| S3 | Die Weiterleitung dient als Proxy für Typen, die nur lokal laufen sollen | Der Empfänger führt nur `runsOn "gm"` aus; die Menge ist per Test festgelegt (P18) | keiner |
| S4 | Fälschung der Absenderangabe (Modul-`id`, Nutzer) | M5 entscheidet nicht danach; U1 wird live diagnostiziert; Vorbedingung für M6 | **`medium`**: bis U1 geklärt ist, kann M6 Rechte je Nutzer nicht belastbar durchsetzen |
| S5 | Fehlertexte aus der GM-Umgebung gelangen zum Spieler | `detail` bei `handler-failed` und `internal-error` ist allgemein; Original nur in der Konsole des GM (P16) | keiner |
| S6 | Überlastung des GM durch viele oder große Anfragen | Größenbegrenzung, Zeitgeber; keine Ratenbegrenzung | `low`, wächst mit künftigen Handlern (M8 prüft) |
| S7 | Unklarer Ausgang nach Zeitüberschreitung | Der Vertrag nennt `relay-timeout` einen unbekannten Ausgang | `low` für `gmping`; künftige ändernde Handler müssen das vertragen |
| S8 | Ein künftiger Handler wird mit `runsOn "gm"` ohne Rechteprüfung ausgeliefert | Regel aus Q3 (kein datenändernder GM-Handler vor M6 und U1) und Test P18; jeder solche Handler braucht ein eigenes Apply | `low` |

**Bewertung für die Governance:** Das im Plan als `high` genannte Security-Risiko ist **inhärent `high`**. Nach dem Design bleibt **kein `high`-Security-Fund**: Der Mechanismus führt nur ausdrücklich freigegebene
Handler aus, und der einzige (`gmping`) ist lesend und gibt nur die Nutzer-ID des GM preis, die Spielern ohnehin sichtbar ist. Der verbleibende Punkt ist S4 (`medium`, U1 offen): Er ist keine Lücke von M5, sondern eine Grenze
für M6. Nach Governance ist `medium` mit dem "Go" **ausdrücklich anzunehmen**. Die Absenkung von `high` auf `medium` ist meine Bewertung; teilt der Projektleiter sie nicht, ist es eine Human Decision.
Kein Datenschutz-Fund `medium+`, keine Dependency-Änderung, keine Cross-Milestone-Änderung.

### 10. Übergaben

- **M6:** Der Haken für die Rechte liegt im Empfänger hinter der Prüfung des Ausführungsorts und im Kern für die lokale Ausführung; `not-permitted` ist definiert. **Vorbedingung:** U1 ist geklärt (Live-Diagnose aus M5) oder eine Human Decision regelt,
  woher die Nutzeridentität kommt. Die Bedeutung von "in wie weit" (N1) bleibt der geplante Stopp.
- **Spätere Milestones:** Jeder Handler mit `runsOn "gm"` bekommt ein eigenes Apply, prüft seine Daten streng und verträgt einen unbekannten Ausgang; datenändernde GM-Handler erst nach M6.
- **M8:** Versionspolitik (Handler-Versionen, unbekannte Codes); Entscheidung, ob die Diagnosezeile zu U1 bleibt; Prüfung einer Ratenbegrenzung und einer Zeitüberschreitung je Handler.

### 11. Deploy-Reihenfolge (Plan, ohne Code)

1. `core/request-kernel.ts` (Codes, `runsOn`, `parseEnvelope`, `findSender`) mit P1 bis P3
2. `core/request-handlers.ts` (`executor`, `gmping`) mit P17, P18
3. `core/request-relay.ts` mit P4 bis P16
4. `core/api-version.ts` (P20), `core/eagle-api.ts` und Test P19
5. `v13/relay.ts` und `v13/module.ts` (Typecheck bestätigt die Typen von `CONFIG.queries`)
6. Testmodule a und d anpassen
7. `docs/api-contract.md` (Teil 4)
8. Prüfen: **einmal** `typecheck`, `test`, `build`; Skriptprüfungen (Fehlercodes Vertrag ↔ Code, Fixtures-Syntax); Suche nach verbotenen Mustern (`innerHTML`, `libWrapper`, `socketlib`, `game.socket`); Zeitstempelvergleich der geänderten Dateien
9. Live-Check-Pakete bauen (Flight Control mit `lang/`, Dummys a bis d); Deploy-Output; kein Commit ohne Anweisung, kein Live-Test durch mich

---

## Acceptance Criteria

```
AC-M5-01: core/request-kernel.ts: RequestFailure enthält zusätzlich genau no-gm, relay-timeout, relay-failed und not-permitted; RequestHandler.runsOn ist optional ("caller" | "gm", Standard "caller") und createRequestKernel wirft bei anderen Werten; parseEnvelope und findSender sind exportiert; execute verhält sich für alle bisherigen Fälle unverändert (alle bisherigen Kerntests bleiben grün); die Tests P1-P3 bestehen.
AC-M5-02: core/request-relay.ts exportiert createRequestRelay, RELAY_TIMEOUT_MS (15000), MAX_RELAY_SIZE (65536) und die Typen aus Abschnitt 3; execute und receive lösen nie mit einer Ablehnung auf; die Entscheidungsreihenfolge entspricht Abschnitt 4; die Tests P4-P16 bestehen.
AC-M5-03: execute sendet nur Typen, deren Handler runsOn "gm" trägt, und nur von Clients ohne GM-Rolle; gesendet wird nur der bereinigte Umschlag; ohne verbundenen GM wird nichts gesendet (no-gm).
AC-M5-04: receive führt nur aus, wenn isGm() gilt und der Typ runsOn "gm" trägt, sonst not-permitted; das detail von handler-failed und internal-error ist allgemein und der Originaltext geht per warn in die Konsole des GM.
AC-M5-05: core/request-handlers.ts: defaultRequestHandlers(apiVersion, executor) enthält genau zwei Handler, flightcontrol.ping (caller, [1]) und flightcontrol.gmping (gm, [1]); die Menge der gm-Handler ist genau flightcontrol.gmping; die Tests P17-P18 bestehen.
AC-M5-06: EAGLE_API_VERSION ist "0.4.0" (P20); createEagleApi mit dem Relais als Kern liefert Ergebnisse und loggt die neuen Codes per warn (P19).
AC-M5-07: v13/relay.ts und v13/module.ts: CONFIG.queries["eagleeye.request"] wird im init gesetzt; die Anfrage geht über game.users.activeGM.query mit timeout = RELAY_TIMEOUT_MS + 2000; ein Fehler beim Aufbau wird geloggt und die API bleibt mit dem lokalen Kern nutzbar; typecheck bestätigt die Typen.
AC-M5-08: docs/api-contract.md nennt API 0.4.0 und "parts 1 to 4", den Ausführungsort je Anfragetyp, die vier neuen Codes mit Reaktion, flightcontrol.gmping, die Grenzen (15 Sekunden, 65.536 Zeichen) und die Bedeutung von relay-timeout; die Fehlercodes der Requests-Tabelle sind identisch mit denen im Code (Skript).
AC-M5-09: eagleeye-dummy-a und -d melden sich mit "0.4.0"; a stellt gmping im ready-Hook und protokolliert Ergebnis und eigenen Nutzer; c bleibt "9.0.0", b ist unverändert; JSON parst, node --check ist ok.
AC-M5-10: npm run typecheck, npm test und npm run build enden mit Exit 0; npm test meldet 11 Testdateien und 76 Tests, alle bestanden; das Bundle enthält "eagleeye.request" und "flightcontrol.gmping" und weder "libWrapper" noch "socketlib" noch "innerHTML".
AC-M5-11: package.json, package-lock.json, v13/tsconfig.json, v13/hub-application.ts, core/hub-model.ts, core/module-registry.ts, core/settings-hub.ts, core/manifest-scanner.ts und core/json-value.ts sind unverändert; die durch M5 geänderten Dateien stimmen mit Abschnitt 5 überein (Zeitstempelvergleich, da nicht committet).
AC-M5-12 (unverified, nur nach ausdrücklicher Live-Freigabe, GM und Spieler gleichzeitig): (a) nur der Spieler verbunden: a erhält no-gm; (b) GM verbunden: a beim Spieler erhält ok mit ranBy.isGm true und der Nutzer-ID des GM, verschieden von der des Spielers; (c) der GM führt seine eigene gmping lokal aus (ranBy = eigener Nutzer); (d) die Konsole des GM zeigt die Diagnosezeile zu den Argumenten des Query-Handlers (klärt U1).
```

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (Discover-R1, S4) Die Absenderidentität beim GM ist nicht belegt (U1). Das Design entscheidet nicht danach und diagnostiziert U1 im Live-Check; M6 darf Rechte je Nutzer erst nach geklärtem U1 (oder einer Human Decision) durchsetzen. Restrisiko: bis dahin keine belastbare Rechtedurchsetzung je Nutzer. Inhärent `high`, nach dem Design `medium`. **Mit dem "Go" ausdrücklich anzunehmen.** | `medium` | no |
| R2 | (Discover-R2, S1 bis S3, S8) Standardverhalten: Der Empfänger verweigert alles außer ausdrücklich freigegebenen `gm`-Typen; einziger Handler ist `gmping` (lesend); Test P18 hält die Menge fest. Inhärent `high`, nach dem Design `low`. | `low` | no |
| R3 | (Discover-R3, U2 bis U9) Das Laufzeitverhalten von `User#query` ist nur live prüfbar. Das Design bildet jeden Fehler auf `relay-failed` oder `relay-timeout` ab, gleich wie Foundry sich verhält; ein Live-Check beobachtet es. Im schlechtesten Fall zeigt der Live-Check ein anderes Verhalten und M5 geht zurück in Apply. | `medium` | no |
| R4 | (Discover-R4, S6) Kein Ratenlimit; Größenbegrenzung 65.536 Zeichen. Wächst mit künftigen Handlern; M8 prüft. | `low` | no |
| R5 | (Discover-R5, S5) Details von GM-Fehlern werden allgemein; das Ergebnis eines künftigen Handlers entscheidet dessen eigenes Apply. | `low` | no |
| R6 | (Discover-R6) Kein GM, mehrere GMs, GM-Client nicht bereit: sichtbare Fehler (`no-gm`, `relay-failed`), kein Datenrisiko. | `low` | no |
| R7 | (S7) `relay-timeout` meldet einen unbekannten Ausgang; für `gmping` unerheblich, der Vertrag sagt es ausdrücklich. | `low` | no |
| R8 | API `0.4.0` macht die Dummys mit `0.3.0` unverträglich (Regel "gleiche Minor vor 1.0"); a und d werden umgestellt. | `low` | no |
| R9 | M5 ändert Dateien aus M4 additiv; alle bisherigen Tests bleiben unverändert grün (bis auf die drei angepassten). | `low` | no |
| R10 | Die Typ-Ergänzung von `CONFIG.Queries` (FF12) kompiliert womöglich nicht; Rückfall ist ein eng begrenzter Cast an einer Stelle. | `low` | no |
| R11 | Die einmalige Diagnosezeile zu U1 bleibt in der Konsole des GM, bis M8 entscheidet, ob sie bleibt. | `low` | no |
| A1 | **Annahme (mit dem "Go" zu bestätigen):** Der Nachweis-Handler heißt `flightcontrol.gmping` (Muster `<bereich>.<verb>`, nur Kleinbuchstaben und Ziffern). | `low` | no |
| A2 | **Annahme:** `isGM` gilt für die Rollen Gamemaster und Assistent (FF9, Typen); ein Assistent führt weitergeleitete Anfragen mit seinen Rechten aus. | `low` | no |
| A3 | **Annahme:** `User#query` übergibt JSON-Objekte unverändert und liefert das Ergebnis des Handlers (FF1); ob das Ergebnis serialisiert wird (U7), fängt die Prüfung der Antwort auf (P10). | `low` | no |
| A4 | **Annahme:** Handler mit `runsOn "gm"` gehören Flight Control selbst; Module registrieren keine eigenen (N4, A2 aus M4). | `low` | no |

`medium` in R1 und R3 ist mit dem "Go" ausdrücklich anzunehmen (Governance). Kein `critical`-Fund; nach dem Design kein `high`-Fund. Kein Human-Decision-Trigger: keine Dependency-Änderung
(kein socketlib), keine Cross-Milestone-Änderung, kein `medium+`-Datenschutzfund.

---

## Open TBDs

Sie werden zusammen mit dem "Go" beantwortet; die Vorschläge gelten, solange nichts anderes genannt wird.

| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Nachweis-Handler und Benennung bestätigen: `flightcontrol.gmping`, lesend, `runsOn "gm"` (A1) | important | Projektleiter |
| T2 | API-Version `0.4.0` bestätigen (Dummys a und d werden umgestellt) | important | Projektleiter |
| T3 | Grenzen bestätigen: Zeitüberschreitung 15 Sekunden, Größe 65.536 Zeichen | nice-to-have | Projektleiter |
| T4 | Live-Prüfung: ein neuer Paketsatz nach dem Deploy; sie braucht **GM und Spieler gleichzeitig** auf Forge (Konto für einen Spieler, zwei Browser oder Profile). Gibt es ein solches Spielerkonto? | important | Projektleiter |
| T5 | Aus `m4-05`: Entscheidung zu F1 (Feld-Anordnung im Hub), A: Nacharbeit mit Foundry-eigenen Mitteln gebündelt mit dem M5-Paket, B: annehmen, C: vor M5 | important | Projektleiter |
| T6 | Aus M1 bis M3: die zwei Plan-Stellen und das Root-`README.md` nachführen, mit M8 (Vorschlag) | nice-to-have | Projektleiter |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m5-02-apply-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

Nach dem "Go" des Projektleiters: Deploy M5 — Reihenfolge Abschnitt 11, beginnend mit `core/request-kernel.ts` und den Tests P1–P3.

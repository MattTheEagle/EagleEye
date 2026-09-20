# M6a — Verifizierte Nutzeridentität für GM-seitige Anfragen — Apply Output

```
artifact: apply-output
milestone: M6a (Planversion 2, wartet auf Freigabe)
phase: APPLY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Design, Schnittstellen, Tests und Akzeptanzkriterien. Kein Code, keine Implementierung; der Deploy wartet auf das "Go" des Projektleiters (`06-working-mode.md`) und auf zwei Vorbedingungen:
die Freigabe der Planversion 2 (Teilung von M6) und das Bestehen des Spikes (`m6-spike-1-output.md`, Bedingung 1 der Human Decision 1).

---

## Input Summary

- Discover: `m6-01-discover-output.md` (gilt für M6 als Ganzes und damit für M6a und M6b). Verweise darin: **FF** Foundry-Fakten, **U** nicht ohne Live-Test belegbar, **Q** offene Fragen. Verweise auf dessen Risiken und Annahmen tragen
  das Präfix "Discover-"; die Risiken (R1–R7) und Annahmen (A1–A3) dieses Dokuments stehen unten.
- **Human Decision 1** (`m6-hd-1-output.md`, decision: modify): Nutzeridentität per **Rückfrage des GM an den genannten Nutzer**; Bedingungen: Spike vorab, fail closed, Restrisiko angenommen.
- Spike-Plan: `m6-spike-1-output.md` (Ergebnis steht aus). `04-milestone-plan-v2.md` (Vorschlag: M6 geteilt in M6a und M6b).
- Live-Befund: `m5-05-live-check-output.md` (Foundry gibt dem Query-Handler nur `{ timeout }` mit), `m5-02-apply-output.md` Abschnitte 9 und 10.
- Antworten des Projektleiters am 2026-09-20: "in wie weit" = erlaubt oder verboten je Modul und Nutzer, dazu eigene oder fremde Ziele; bindend beim GM, als Regel im eigenen Client; Einstellen nur der GM im Hub; Teilung von M6 in M6a und M6b.
  Für **M6a** zählt davon nur die Identität; der Rest ist die Übergabe an M6b (Abschnitt 10).
- Konventionen K1 bis K4 (`m1-02-apply-output.md`).

---

## Solution Design

### 1. Leitlinie

Die GM-Seite führt eine weitergeleitete Anfrage erst aus, wenn der **genannte Nutzer sie bestätigt hat**. Der Client des Aufrufers merkt sich jede gesendete Anfrage unter einer Kennung, die nur er kennt; der GM fragt beim genannten Nutzer
nach dieser Kennung. Ein ehrlicher Client bestätigt nur, was er gesendet hat. Ein veränderter Client, der sich als anderer Nutzer ausgibt, kennt keine Kennung dieses Nutzers und wird nicht bestätigt. **Fehlt die Bestätigung aus irgendeinem
Grund, wird abgelehnt (fail closed).** Der bestätigte Nutzer geht als `context.user` an den Handler; Rechte entscheidet erst M6b. Die Logik liegt rein in `core/` (K1), die Übertragung ist eine dünne Hülle in `v13/` (K2/K3).

### 2. Entscheidungen zu den offenen Fragen des Discover

| Q | Entscheidung | Grund | Verworfene Alternative |
|---|---|---|---|
| Q5 Herkunft der Nutzeridentität | **Rückfrage des GM an den genannten Nutzer** (Human Decision 1, Option B). Die Anfrage nennt Nutzer-ID und Kennung; der GM stellt beim Client dieses Nutzers die Frage "hast du die Anfrage mit dieser Kennung gestellt?" per `User#query`. | Entscheidung des Projektleiters; fälscht ein Client eine fremde ID, kann der ehrliche Client des Genannten nicht bestätigen | Vertrauen auf die mitgeschickte ID (Option A); Rechte nur je Modul (Option C) |
| Nachricht der Weiterleitung | Die Query-Daten sind jetzt eine Nachricht `{ request, claim: { userId, requestId } }` statt des bloßen Umschlags. `request` ist der bereinigte Umschlag wie in M5. | Die Kennung gehört nicht in den Umschlag der Anfrage (API-Form bleibt unverändert) | Zusatzfelder im Umschlag |
| Kennung | 128 Bit Zufall (32 Hexzeichen), erzeugt im Client des Aufrufers (`crypto.getRandomValues`), einmal je Anfrage. Erlaubt beim Empfang: Text von 16 bis 128 Zeichen. | Ein Fälscher müsste eine offene Kennung des genannten Nutzers erraten (praktisch unmöglich) | fortlaufende Nummern; `Math.random` |
| Ablage der offenen Anfragen | Im Client des Aufrufers eine Menge offener Kennungen; sie wird geschlossen, sobald die Anfrage endet (Erfolg, Fehlschlag, Zeitüberschreitung). Keine Zeitlimits, keine Persistenz. | klein und ohne Zustand über das Ende der Anfrage hinaus | Speicherung mit Ablaufzeit |
| Bestätigungs-Anfrage | Query-Name `eagleeye.confirm` (Präfixregel, FF8/M5-FF2), Daten `{ requestId }`, Antwort `{ confirmed: boolean, userId }`. Sie wird auf **allen** Clients registriert. Bestätigt gilt nur `{ confirmed: true, userId: <die genannte ID> }`. | Die Antwort kommt vom Client des Genannten; die eigene ID in der Antwort ist eine zusätzliche Kontrolle | freie Textantwort |
| Zeit | Der GM wartet höchstens `CONFIRM_TIMEOUT_MS = 5000` (eigener Zeitgeber; Foundrys `timeout` ist 5 s plus 2 s Puffer). Der Aufrufer wartet weiter höchstens 15 s auf das Ergebnis. | 5 s genügen für einen Hin- und Rückweg und lassen dem Aufrufer Luft | keine Grenze |
| Fehlerfälle | Jede fehlende oder ungültige Bestätigung (Antwort "nein", falsche ID, fehlgeformte Antwort, Nutzer unbekannt oder nicht verbunden, Ablehnung oder Fehler von `User#query`, keine Antwort in 5 s) → **`not-permitted`**, `detail` "the asking user could not be confirmed". Der Grund steht in der Konsole des GM (Warnung mit der genannten ID). Kein neuer Code. | fail closed (Human Decision 1); die Codes des Vertrags bleiben schmal | eigener Code für "nicht bestätigt" |
| Reihenfolge auf der GM-Seite | Rolle → JSON und Größe → Nachricht und Umschlag prüfen → Ausführungsort (`runsOn "gm"`) → **Bestätigung** → Ausführung mit dem bestätigten Nutzer. Was schon vorher scheitert, löst keine Rückfrage aus. | keine unnötigen Rückfragen an unbeteiligte Nutzer | Rückfrage zuerst |
| Weitergabe an Handler | `RequestContext` bekommt `user?: { id }`. Lokal ist es der Nutzer des Clients (`game.user.id`), auf der GM-Seite der bestätigte Nutzer. `flightcontrol.gmping` meldet ihn additiv als `askedBy` (`null`, wenn unbekannt). | M6b braucht den Nutzer im Kontext; `askedBy` macht ihn im Live-Check sichtbar | Nutzer als Teil des Umschlags |
| API-Version `0.5.0` | Wie bei M2 bis M5 eine Minor je Teil des Vertrags (Teil 5). Die Dummys a und d melden sich mit `0.5.0`. | Praxis der bisherigen Teile | keine Erhöhung |

Weitere Festlegungen:

- **Wer bestätigt:** jeder Client (auch der des GM: fragt ein Spieler mit der ID des GM, verneint der GM-Client, weil er keine solche Anfrage offen hat).
- **Anfragen von Clients mit GM-Rolle** laufen lokal und werden nicht weitergeleitet; sie brauchen keine Bestätigung.
- **Anfragen an `caller`-Typen** ändern sich nicht (außer `context.user`).
- **Keine Ratenbegrenzung** in M6a (Risiko R4, `low`); M8 prüft sie zusammen mit der aus M5.

### 3. Schnittstellen (nur Signaturen)

```ts
// core/request-kernel.ts  (Ergänzungen)
export interface RequestUser { readonly id: string }
export interface RequestContext { readonly module: RegisteredModule; readonly user?: RequestUser }
export interface ExecuteOptions { readonly user?: RequestUser }                     // der Nutzer, für den ausgeführt wird
export interface RequestKernel { execute(request: unknown, options?: ExecuteOptions): Promise<RequestResult> }
export interface KernelOptions { readonly currentUser?: () => RequestUser | undefined }
export function createRequestKernel(registry, handlers, options?: KernelOptions): RequestKernel;
// context.user = options.user ?? currentUser?.(); ohne beides undefined. Alles andere in execute bleibt unverändert.

// core/request-identity.ts  (neu, rein)
export const CONFIRM_TIMEOUT_MS = 5_000;
export interface Claim { readonly userId: string; readonly requestId: string }
export interface RelayMessage { readonly request: unknown; readonly claim: Claim }
export interface ConfirmationAnswer { readonly confirmed: boolean; readonly userId: string }
export interface PendingRequests { open(): string; has(requestId: string): boolean; close(requestId: string): void }
export function createPendingRequests(newId: () => string): PendingRequests;
export function parseRelayMessage(data: unknown): Checked<RelayMessage>;             // Fehlschlag: invalid-request
export function isConfirmed(answer: unknown, claim: Claim): boolean;

// core/request-relay.ts  (Änderungen)
export interface RelayEnvironment {
  isGm(): boolean;
  hasGm(): boolean;
  currentUserId(): string;                                                          // neu: der Nutzer dieses Clients ("" wenn unbekannt)
  newId(): string;                                                                  // neu: eine neue, nicht erratbare Kennung
  send(message: RelayMessage, timeoutMs: number): Promise<unknown>;                 // geändert: Nachricht statt Umschlag
  confirm(userId: string, requestId: string, timeoutMs: number): Promise<unknown>;  // neu: Rückfrage an den genannten Nutzer
}
export interface RequestRelay extends RequestKernel {
  receive(data: unknown): Promise<RequestResult>;                                   // GM-Seite, lehnt nie ab
  answerConfirmation(data: unknown): ConfirmationAnswer;                            // neu: die Antwort dieses Clients auf die Rückfrage, wirft nie
}

// core/request-handlers.ts: gmping-Ergebnis additiv { apiVersion, module, echo, ranBy, askedBy }   (askedBy: string | null)

// v13/relay.ts  (Hülle)
export const CONFIRM_QUERY = "eagleeye.confirm";
// foundryRelayEnvironment: currentUserId = game.user.id; newId = 128 Bit aus crypto.getRandomValues; send = activeGM.query("eagleeye.request", message, { timeout });
//   confirm = game.users.get(userId).query("eagleeye.confirm", { requestId }, { timeout: timeoutMs + 2 s }); unbekannter oder nicht verbundener Nutzer wirft
// registerRelayQueries: setzt CONFIG.queries["eagleeye.request"] (receive, mit der einmaligen Diagnosezeile) und CONFIG.queries["eagleeye.confirm"] (answerConfirmation)
// v13/module.ts: createRequestKernel(registry, handlers, { currentUser: () => ({ id: game.user.id }) })
```

### 4. Ablauf

```
Client des Spielers U (Aufrufer)                     GM-Client                                  Client von U (der Genannte, derselbe wie links)
relay.execute(env)   (gm-Typ, kein GM-Rolle)
  1 Umschlag, Absender, GM verbunden, Größe           (wie in M5)
  2 requestId = newId(); offen.open()
  3 send { request: env, claim: { U, requestId } } ─▶ receive(data)
                                                        a  Rolle GM?                       sonst not-permitted
                                                        b  JSON, Größe, Nachricht          sonst invalid-request
                                                        c  Ausführungsort "gm"?            sonst not-permitted   (keine Rückfrage)
                                                        d  confirm(U, requestId, 5 s) ───────────────────────────────▶ answerConfirmation({ requestId })
                                                                                                                         requestId offen? → { confirmed: true, userId: U }
                                                           ◀────────────────────────────────────────────────────────── sonst { confirmed: false, userId: U }
                                                        e  bestätigt (genau { true, U })? sonst not-permitted, Warnung mit U
                                                        f  kernel.execute(env, { user: { id: U } }) mit der eigenen Registry
  ◀──────────────── { ok, value } | { ok: false, reason, detail } ─────────────────────────────────────────────────
  4 offen.close(requestId)  (immer, auch bei Fehler und Zeitüberschreitung)
```

Ein Fälscher M nennt die ID von U und eine erfundene Kennung: In Schritt d antwortet der Client von U "nein" (die Kennung ist bei ihm nicht offen); die Anfrage wird abgelehnt. Ist U nicht verbunden, scheitert die Rückfrage; ebenfalls abgelehnt.

### 5. Zielbild der Dateien

| Datei | Änderung |
|---|---|
| `core/request-kernel.ts`, `core/request-kernel.test.ts` | **geändert (additiv):** `RequestUser`, `context.user`, `ExecuteOptions`, `KernelOptions`; P1 |
| `core/request-identity.ts`, `core/request-identity.test.ts` | **neu** (P2 bis P4) |
| `core/request-relay.ts`, `core/request-relay.test.ts` | **geändert:** Nachricht, offene Kennungen, Rückfrage, `answerConfirmation`; bestehende Relais-Tests angepasst, P5 bis P10 neu |
| `core/request-handlers.ts`, `core/request-handlers.test.ts` | `askedBy` im `gmping`-Ergebnis (P11); Test des Ergebnisses angepasst |
| `core/api-version.ts`, `core/api-version.test.ts` | `"0.5.0"` (P12) |
| `core/eagle-api.test.ts` | Umgebung des Relais-Tests um die neuen Mitglieder erweitert (keine neue Prüfung) |
| `v13/relay.ts`, `v13/module.ts` | Hülle und Verdrahtung (Abschnitt 3) |
| `test-fixtures/eagleeye-dummy-a`, `-d` | `apiVersion "0.5.0"`; a gibt `askedBy` in der Textzeile von `gmping` aus |
| `docs/api-contract.md` | Teil 5 (Abschnitt 8) |
| **unverändert** | `package.json`, Lock-Datei, `v13/tsconfig.json`, `v13/hub-application.ts`, `core/hub-model.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/manifest-scanner.ts`, `core/json-value.ts`, Dummys b und c |

### 6. Testplan (Vitest; jeder Fall genau ein `it`, Tabellenfälle laufen als Schleife im Test)

| # | Datei | Fall |
|---|---|---|
| P1 | request-kernel | `execute` gibt dem Handler `context.user`: die Option `{ user }` gewinnt gegen `currentUser`; ohne beides ist `context.user` `undefined` |
| P2 | request-identity | `createPendingRequests`: `open()` liefert die Kennung aus `newId` und merkt sie; `has` ist wahr bis `close`; zwei offene Kennungen sind verschieden; `close` einer unbekannten Kennung ist folgenlos |
| P3 | request-identity | `parseRelayMessage`: eine gültige Nachricht liefert `request` und `claim`; abgelehnt (`invalid-request`) werden: keine Nachricht, ohne `claim`, `userId` leer oder kein Text, `requestId` kein Text, zu kurz (unter 16) oder zu lang (über 128) |
| P4 | request-identity | `isConfirmed` ist nur wahr für `{ confirmed: true, userId: <die genannte ID> }`; falsch für `confirmed: false`, fehlende Felder, eine andere `userId` und Nicht-Objekte |
| P5 | request-relay | Aufrufer: `send` bekommt `{ request: <bereinigter Umschlag>, claim: { userId: <currentUserId>, requestId } }`; die Kennung ist während des Sendens offen und danach geschlossen, auch bei Fehler und Zeitüberschreitung; ohne bekannte Nutzer-ID wird nicht gesendet (`relay-failed`) |
| P6 | request-relay | `answerConfirmation` bestätigt eine offene Kennung mit der eigenen Nutzer-ID; nicht bestätigt werden eine unbekannte, eine geschlossene und eine fehlgeformte Anfrage; die Methode wirft nie |
| P7 | request-relay | `receive` mit fehlender oder fehlgeformter Nachricht (kein `claim`, ungültige Kennung) → `invalid-request`, ohne Rückfrage |
| P8 | request-relay | `receive`: ein `caller`-Typ und ein unbekannter Typ werden **vor** der Rückfrage abgelehnt (keine Rückfrage, Handler läuft nicht) |
| P9 | request-relay | `receive` mit Bestätigung: die Rückfrage geht an die genannte ID mit der Kennung und `CONFIRM_TIMEOUT_MS`; der Handler läuft mit `context.user.id` = genannte ID; ein Erfolg wird nicht geloggt |
| P10 | request-relay | `receive` ohne Bestätigung → `not-permitted`, der Handler läuft nicht, eine Warnung nennt die ID: Antwort "nein", falsche ID in der Antwort, fehlgeformte Antwort, Rückfrage lehnt ab oder wirft, keine Antwort (künstliche Uhr) |
| P11 | request-handlers | `flightcontrol.gmping` nennt in `askedBy` den Nutzer aus dem Kontext und `null` ohne Nutzer |
| P12 | api-version (angepasst) | `EAGLE_API_VERSION` ist `"0.5.0"` |

Erwartet: **12 Testdateien mit 87 Tests.** Die 76 bestehenden Tests bleiben; angepasst werden der Versionstest (P12), der Test der Weiterleitung und die `receive`-Tests des Relais (Nachricht statt Umschlag, neue Mitglieder der Umgebung), der Test des `gmping`-Ergebnisses
und der Relais-Test in `eagle-api`; neu sind **11 Tests**: P1 bis P11. Neue Datei ist `request-identity.test.ts`.

### 7. Testmodule und Live-Check (Anleitung im Monitor)

- **a:** `apiVersion "0.5.0"`; die Textzeile von `gmping` nennt zusätzlich `asked by <ID>`. **d:** `apiVersion "0.5.0"`. b und c unverändert.
- **Live-Prüfung** (GM und Spieler gleichzeitig, Freigabe je Test): (a) der Spieler bekommt `gmping: ok … asked by <ID des Spielers>`, `ran by <ID des GM>`; (b) der GM lokal: `asked by <ID des GM>`; (c) **gefälschte Angabe:** in der Konsole des Spielers ein
  Einzeiler, der `eagleeye.request` an den aktiven GM mit der ID des GM (oder eines zweiten Spielers) und einer erfundenen Kennung schickt; erwartet `not-permitted`, "the asking user could not be confirmed", eine Warnung in der Konsole des GM;
  (d) optional: Angabe eines Nutzers, der nicht verbunden ist: ebenfalls `not-permitted`.

### 8. API-Vertrag Teil 5 (Änderungen an `docs/api-contract.md`, Englisch)

Kopfzeile und Überschrift auf `0.5.0` und "parts 1 to 5"; im Abschnitt "Requests" neu "Who asked": Vor der Ausführung einer weitergeleiteten Anfrage fragt der Client des GM beim Client des genannten Nutzers nach; nur dessen Bestätigung lässt sie laufen, jede fehlende,
späte oder verneinende Antwort ist `not-permitted`; Handler beim GM bekommen den bestätigten Nutzer (`gmping`: `askedBy`); eine Anfrage im eigenen Client läuft für den Nutzer dieses Clients; die Modul-`id` bleibt ein ehrliches Etikett.
Die Zeile `not-permitted` in der Tabelle der Fehlgründe nennt zusätzlich "the asking user could not be confirmed"; Tabelle der Anfragetypen: `gmping`-Ergebnis mit `askedBy`; Grenze 5 Sekunden für die Bestätigung; "What is verified" und "Not verified"
(Bestätigung nur durch Tests und Simulation, live `unverified`); Historie `0.5.0`. Die Fehlercodes der Tabelle sind per Skript mit dem Code zu vergleichen.

### 9. Sicherheitsbetrachtung (Rückfrage des GM beim genannten Nutzer)

| # | Bedrohung | Maßnahme im Design | Rest |
|---|---|---|---|
| S1 | Ein veränderter Client nennt die ID eines anderen, ehrlichen und verbundenen Nutzers | Der GM fragt bei diesem Nutzer nach; dessen ehrlicher Client kennt die Kennung nicht und verneint | keiner, sofern Foundry die Rückfrage an den genannten Nutzer zustellt (Spike, Annahme A1) |
| S2 | Ein veränderter Client nennt die ID eines nicht verbundenen Nutzers | Die Rückfrage scheitert; abgelehnt | keiner |
| S3 | Ein veränderter Client nennt die ID des GM | Der GM-Client hat die Kennung nicht offen und verneint | keiner |
| S4 | Ein Nutzer gibt sich selbst frei aus (nennt seine eigene ID) | Das ist seine eigene Identität; die Bestätigung stimmt | keiner (Absicht) |
| S5 | Ein Nutzer mit zwei Konten bestätigt sich selbst | Es bleibt seine eigene Identität; kein Gewinn gegenüber fremden Nutzern | keiner |
| S6 | Ein veränderter Client bestätigt beliebige Kennungen | Wirkt nur auf Anfragen, die seine eigene ID nennen | keiner |
| S7 | Ein Fälscher erzeugt viele Anfragen, um dem Opfer viele Rückfragen zu schicken (Belastung) | keine Ratenbegrenzung in M6a | `low`, M8 prüft |
| S8 | Das Erraten einer offenen Kennung | 128 Bit Zufall, nur im Client des Aufrufers und beim GM bekannt | keiner |
| S9 | Verhalten von Foundry ist ein anderes als angenommen (Zustellung, Fehler, Zeit) | Jede Abweichung führt zur Ablehnung (fail closed); der Spike prüft es vor dem Deploy | `medium` bis zum Live-Check |
| S10 | Die Modul-`id` bleibt selbst angegeben | unverändert eine Vertrauensgrenze (Vertrag) | `low` (Absicht) |

**Bewertung für die Governance:** Das im Discover als `high` genannte Security-Risiko (Identität) ist **inhärent `high`**. Mit der gewählten Rückfrage bleibt nach dem Design **kein `high`-Fund**: Die Fälschung einer fremden Identität wird abgelehnt, jede
Unsicherheit führt zur Ablehnung. Verbleibend ist S9 (`medium`, bis der Live-Check das Verhalten von Foundry bestätigt) und das mit Human Decision 1 ausdrücklich angenommene Restrisiko (S4 bis S6: Schutz nur gegen die Fälschung einer fremden
Identität). Nach Governance ist `medium` mit dem "Go" **ausdrücklich anzunehmen**. Die Absenkung von `high` auf `medium` ist meine Bewertung; teilt der Projektleiter sie nicht, ist es eine Human Decision. Kein Datenschutz-Fund `medium+`, keine
Dependency-Änderung, keine Cross-Milestone-Änderung außer dem Ausbau des Relais aus M5 (im Plan vorgesehen, M6a hängt von M5 ab).

### 10. Übergaben

- **M6b (Rechte):** Der bestätigte Nutzer steht als `context.user` im Kern und im Empfänger bereit; die Rechte hängen im Kern zwischen `validate` und `run` ein (Ausführung für den Nutzer) und im Empfänger nach der Bestätigung. Festgelegt vom Projektleiter am 2026-09-20 für M6b:
  erlaubt oder verboten je Modul und Nutzer, bei "erlaubt" eingeschränkt auf **eigene oder fremde Ziele** (Besitz nach Foundry); **bindend beim GM, als Regel im eigenen Client**; eingestellt **nur vom GM** (nicht von Assistenten) **im Hub**. Offen für M6b: Standardwerte
  (Vorschlag: der GM darf immer alles), wie ein Anfragetyp sein Ziel angibt, Speicherort (Welteinstellung; Lesbarkeit für Spieler laut Spike-Zeile `probe`), Umgang mit gelöschten Nutzern, Vertrag Teil 6.
- **Spätere Milestones:** Ein Handler mit `runsOn "gm"`, der etwas ändert, braucht M6b und dieses Apply als Grundlage (Regel aus M5 bleibt bis M6b).
- **M8:** Ratenbegrenzung (M5-S6, M6a-S7), Diagnosezeile zu U1 entfernen (die Frage ist beantwortet), Versionspolitik.

### 11. Deploy-Reihenfolge (Plan, ohne Code)

1. `core/request-kernel.ts` (`context.user`, Optionen) mit P1
2. `core/request-identity.ts` mit P2 bis P4
3. `core/request-relay.ts` (Nachricht, offene Kennungen, Rückfrage, `answerConfirmation`) mit P5 bis P10; bestehende Relais-Tests anpassen
4. `core/request-handlers.ts` (`askedBy`) mit P11; `core/api-version.ts` mit P12; `eagle-api`-Test anpassen
5. `v13/relay.ts` und `v13/module.ts` (Typecheck bestätigt die Typen der zwei Queries)
6. Testmodule a und d anpassen
7. `docs/api-contract.md` (Teil 5)
8. Prüfen: **einmal** `typecheck`, `test`, `build`; Skriptprüfungen (Fehlercodes Vertrag ↔ Code, Fixtures-Syntax); Suche nach verbotenen Mustern (`innerHTML`, `libWrapper`, `socketlib`, `game.socket`); Gegenproben für die neuen Prüfungen; Zwei-Client-Simulation mit echtem Bundle
   einschließlich eines veränderten Clients; Zeitstempelvergleich
9. Live-Check-Pakete bauen; Deploy-Output; kein Commit ohne Anweisung, kein Live-Test durch mich

---

## Acceptance Criteria

```
AC-M6a-01: core/request-kernel.ts: RequestContext.user, ExecuteOptions, KernelOptions; execute setzt context.user aus der Option oder aus currentUser, sonst undefined; alle bisherigen Kerntests bleiben grün; Test P1 besteht.
AC-M6a-02: core/request-identity.ts exportiert CONFIRM_TIMEOUT_MS (5000), createPendingRequests, parseRelayMessage und isConfirmed; die Tests P2-P4 bestehen.
AC-M6a-03: core/request-relay.ts: der Aufrufer sendet nur { request, claim } mit der Nutzer-ID des Clients und einer offenen Kennung und schließt sie am Ende jeder Anfrage; ohne bekannte Nutzer-ID wird nicht gesendet; answerConfirmation bestätigt nur offene Kennungen; die Tests P5-P6 bestehen.
AC-M6a-04: receive prüft die Reihenfolge Rolle, JSON und Größe, Nachricht, Ausführungsort, Bestätigung; Anfragen, die vorher scheitern, lösen keine Rückfrage aus; ohne genau { confirmed: true, userId: <genannte ID> } innerhalb von CONFIRM_TIMEOUT_MS wird mit not-permitted abgelehnt und der Handler läuft nicht; execute und receive lösen nie mit einer Ablehnung auf; die Tests P7-P10 bestehen.
AC-M6a-05: der bestätigte Nutzer erreicht den Handler als context.user; flightcontrol.gmping meldet ihn als askedBy (null ohne Nutzer); Test P11 besteht.
AC-M6a-06: EAGLE_API_VERSION ist "0.5.0" (P12); die Fehlercodes des Kerns sind unverändert elf.
AC-M6a-07: v13/relay.ts und v13/module.ts: die Queries eagleeye.request und eagleeye.confirm werden im init gesetzt; die Rückfrage geht über game.users.get(id).query mit timeout = CONFIRM_TIMEOUT_MS + 2000; die Kennung stammt aus crypto.getRandomValues; typecheck bestätigt die Typen.
AC-M6a-08: docs/api-contract.md nennt API 0.5.0 und "parts 1 to 5", "Who asked", die erweiterte Zeile not-permitted, askedBy im gmping-Ergebnis, die Grenze von 5 Sekunden und die Historie 0.5.0; die Fehlercodes der Tabelle sind identisch mit denen im Code (Skript).
AC-M6a-09: eagleeye-dummy-a und -d melden sich mit "0.5.0"; a gibt askedBy in der Textzeile von gmping aus; c bleibt "9.0.0", b unverändert; JSON parst, node --check ist ok.
AC-M6a-10: npm run typecheck, npm test und npm run build enden mit Exit 0; npm test meldet 12 Testdateien und 87 Tests, alle bestanden; das Bundle enthält "eagleeye.confirm" und "getRandomValues" und weder "libWrapper" noch "socketlib" noch "innerHTML".
AC-M6a-11: package.json, package-lock.json, v13/tsconfig.json, v13/hub-application.ts, core/hub-model.ts, core/module-registry.ts, core/settings-hub.ts, core/manifest-scanner.ts und core/json-value.ts sind unverändert; die durch M6a geänderten Dateien stimmen mit Abschnitt 5 überein.
AC-M6a-12 (unverified, nur nach ausdrücklicher Live-Freigabe, GM und Spieler gleichzeitig): (a) der Spieler erhält gmping ok mit askedBy = seine ID und ranBy = GM; (b) der GM lokal: askedBy = seine ID; (c) eine gefälschte Nutzer-ID (die des GM oder eines zweiten Spielers) mit erfundener Kennung wird mit not-permitted abgelehnt und in der Konsole des GM gewarnt; (d) optional: die ID eines nicht verbundenen Nutzers wird ebenso abgelehnt.
```

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (Discover-R1) Nutzeridentität. Inhärent `high`; mit der Rückfrage (Human Decision 1) bleibt nach dem Design `medium` (S9, Verhalten von Foundry bis zum Live-Check) plus das angenommene Restrisiko (S4 bis S6). **Mit dem "Go" ausdrücklich anzunehmen.** | `medium` | no |
| R2 | (Discover-U3) `User#query` vom GM an einen Spieler: Der Spike zeigt Zustellung, Antwort, Fehler und Zeitverhalten. **Vorbedingung des Deploys.** Scheitert er, geht M6 zurück zur Human Decision 1. | `medium` | **ja (bis der Spike bestanden ist)** |
| R3 | Jede weitergeleitete Anfrage kostet einen zusätzlichen Hin- und Rückweg (bis 5 s im Fehlerfall). Der Aufrufer wartet weiter höchstens 15 s. | `low` | no |
| R4 | Kein Ratenlimit: Ein Fälscher kann dem genannten Nutzer viele Rückfragen schicken lassen (Belastung, kein Datenrisiko). M8 prüft. | `low` | no |
| R5 | API `0.5.0` macht die Dummys mit `0.4.0` unverträglich (Regel "gleiche Minor vor 1.0"); a und d werden umgestellt. | `low` | no |
| R6 | Die Nachricht der Weiterleitung ändert sich (Nachricht statt Umschlag). Läuft ein Client mit altem Stand (Browser-Cache), scheitert die Anfrage mit `invalid-request`; sie wird nie ohne Bestätigung ausgeführt. | `low` | no |
| R7 | `context.user` ist optional; Handler müssen `undefined` vertragen. `gmping` meldet dann `null`. | `low` | no |
| A1 | **Annahme (bis der Spike bestanden ist):** `User#query` vom GM an einen verbundenen Spieler wird zugestellt und beantwortet, und die Antwort kommt vom Client dieses Spielers (Kernkommandos von Foundry nutzen es ebenso, `DialogV2.query`, Discover FF5). | `medium` | ja (Spike) |
| A2 | **Annahme:** `game.users.get(id).active` ist für den GM verlässlich; ein nicht verbundener Nutzer wird nicht gefragt (wirft, abgelehnt). | `low` | no |
| A3 | **Annahme:** Der Client des Aufrufers beantwortet die Rückfrage, während seine eigene Anfrage noch läuft (beides sind unabhängige Queries). | `low` | no |
| A4 | **Annahme:** Die Namen `eagleeye.confirm` und `askedBy`, die Grenze von 5 Sekunden und die API-Version `0.5.0` sind gewollt (T1 bis T3). | `low` | no |

`medium` in R1 und R2 ist mit dem "Go" ausdrücklich anzunehmen; R2 zusätzlich erst nach bestandenem Spike. Kein `critical`-Fund; nach dem Design kein `high`-Fund. Kein Human-Decision-Trigger: keine Dependency-Änderung, kein `medium+`-Datenschutzfund;
die Teilung von M6 (Planversion 2) ist ausdrücklich vom Projektleiter gewählt.

---

## Open TBDs

Sie werden zusammen mit dem "Go" beantwortet; die Vorschläge gelten, solange nichts anderes genannt wird.

| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Benennung bestätigen: Query `eagleeye.confirm`, Feld `askedBy` im `gmping`-Ergebnis (A4) | important | Projektleiter |
| T2 | API-Version `0.5.0` bestätigen (Dummys a und d werden umgestellt) | important | Projektleiter |
| T3 | Grenze bestätigen: die Bestätigung darf höchstens 5 Sekunden dauern | nice-to-have | Projektleiter |
| T4 | **Planversion 2 freigeben** (`04-milestone-plan-v2.md`: M6 geteilt in M6a und M6b; danach entsteht `05-milestone-plan-approval-v2.md`) | important | Projektleiter |
| T5 | Das "Go" gilt **erst nach dem bestandenen Spike** (R2/A1). Bestehen heißt: die Zeile zum verbundenen Spieler ist `ok` mit `answeredBy` = Spieler; scheitert sie, geht M6 zurück zur Human Decision 1 | important | Projektleiter |
| T6 | Live-Check: der Einzeiler für die gefälschte Angabe wird in der Konsole des Spielers eingefügt (Anleitung im Monitor); eine zweite Spieler-Identität ist dafür nicht nötig (die ID des GM genügt), mit einem zweiten Spieler zusätzlich möglich | nice-to-have | Projektleiter |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6a-02-apply-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| `dadm/04-milestone-plan-v2.md` (Vorschlag, wartet auf Freigabe) | durable |

---

## Next Step

Nach dem bestandenen Spike, der Freigabe der Planversion 2 und dem "Go" des Projektleiters: Deploy M6a, Reihenfolge Abschnitt 11, beginnend mit `core/request-kernel.ts` und dem Test P1.

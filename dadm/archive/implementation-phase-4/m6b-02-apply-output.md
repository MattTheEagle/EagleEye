# M6b — Nutzungsrechte je Modul und Nutzer — Apply Output

```
artifact: apply-output
milestone: M6b
phase: APPLY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Zielbild, Schnittstellen (nur Signaturen), Abläufe, Testplan, Akzeptanzkriterien und Sicherheitsbetrachtung. Kein Code. **Der Deploy wartet auf das "Go".** Was mit dem "Go" als angenommen gilt, steht am Ende (Risiken R1 bis R3, Punkte T1 bis T9).

---

## Input Summary

- `m6b-01-discover-output.md` (Fakten FF10 bis FF17, live belegt L1 bis L3, offen U1 bis U5, Risiken R1 bis R9), `m6-01-discover-output.md`, `m6-hd-1-output.md`, `m6a-02-apply-output.md` (Abschnitte 9 und 10), `m6a-05-live-check-output.md`, `m3-rework-3-output.md`, `04-milestone-plan-v2.md` (M6b)
- **Vorgaben des Projektleiters** (2026-09-20): erlaubt oder verboten je Modul und Nutzer; bei "erlaubt" eingeschränkt auf eigene oder fremde Ziele (Besitz nach Foundry); bindend beim GM, als Regel im eigenen Client; eingestellt nur vom GM (nicht von Assistenten), im Hub.
- **Live belegt und für das Design genutzt:** Ein Spieler liest eine vom GM geschriebene Welteinstellung mit `scope: "world"`, `config: false`, `type: String` (Spike `probe`, L1); der bestätigte Nutzer erreicht den Handler auf dem GM-Client (L2).

---

## Solution Design

### 1. Leitlinie

- **Eine Stelle wertet die Rechte aus: der Anfragekern**, zwischen Datenprüfung und Ausführung. Der Empfänger beim GM ruft den Kern schon mit dem bestätigten Nutzer auf (M6a); dieselbe Prüfung gilt dort deshalb **bindend**. Im Client des Aufrufers gilt sie für Typen, die dort laufen (`caller`), als **umgehbare Regel** (Vorgabe).
- Ein Recht ist **eine Stufe je Modul und Nutzer**: `denied`, `own`, `all`. Die Auswertung ist reine Logik in `core/`; Tabelle, Rolle und Besitz kommen über eingespeiste Quellen (K1 bis K4). Die Foundry-Hülle bleibt dünn.
- **Fail closed:** Jeder Zweifel (unbekannter Nutzer, unlesbare Ablage, Fehler bei der Besitzprüfung, nicht auflösbares Ziel bei `own`) ist ein Nein. Eine Ausnahme gibt es nicht.
- **Flight Control bleibt schmal:** eine Einstellung, ein Anfragetyp mit Ziel (Nachweis), eine API-Funktion, ein Block im Hub. Keine Bibliothek, keine neue Abhängigkeit.

### 2. Entscheidungen zu den offenen Fragen des Discover

| Frage | Entscheidung | Begründung |
|---|---|---|
| 1 Datenmodell, Stufen, Ablage | **T1:** drei Stufen `denied`, `own` (nur eigene Ziele), `all` (eigene und fremde Ziele). Gespeichert werden nur `own` und `all`; ein fehlender Eintrag heißt `denied`. **T3:** Ablage als Welteinstellung `eagleeye.rights`, `config: false`, `type: String`, Wert ist ein JSON-Text `{"version":1,"modules":{"<moduleId>":{"<userId>":"own"\|"all"}}}`. | Die Stufen setzen "erlaubt oder verboten, bei erlaubt eigene oder fremde Ziele" um. "Nur fremde Ziele" wird nicht angeboten: Auf eigenen Zielen darf der Nutzer in Foundry ohnehin handeln, `all` gibt also nichts zusätzlich frei, das `own` verbietet. Ein Text statt eines Objekts: Genau diese Form (Welt, `config: false`, Zeichenkette) hat der Spike live gelesen (L1); die Prüfung liegt im eigenen Code und nicht in Foundrys Typumwandlung. |
| 2 Standardwerte | **T2:** GM und Assistent (`isGM`) sind immer erlaubt, ohne Eintrag und nicht einstellbar. Alle anderen Nutzer ohne Eintrag: `denied`. Unbekannter Nutzer: `denied`. Nicht lesbare Ablage: alle Nutzer außer GM und Assistent `denied`. | Vorschlag des Plans für den GM; fail closed für den Rest. Ein Assistent führt Anfragen als `isGM` ohnehin lokal mit seinen Foundry-Rechten aus, dort kann Flight Control ihn nicht beschränken. Ein neues Modul und ein neuer Spieler haben damit nichts, bis der GM es freigibt. |
| 3 Ziel und Besitz | Ein Anfragetyp nennt seine Ziele als Liste von Dokument-UUIDs (`targets(payload)`); eine leere Liste heißt: kein Ziel. "Eigen" heißt: Foundry gibt dem Nutzer die Besitzstufe `OWNER` (`testUserPermission(user, "OWNER")`), geprüft auf dem Client, der die Anfrage ausführt, beim GM also für den bestätigten Nutzer. Ist das Ziel nicht auflösbar oder der Nutzer unbekannt, gilt "unbekannt". Bei `own` müssen **alle** Ziele eigen sein, "unbekannt" zählt als nicht eigen. Ohne Ziel sperrt nur `denied`. | Besitz nach Foundry (Vorgabe); eingebettete Dokumente erben laut Referenz den Besitz des Elternteils (FF11), die Prüfung liegt beim aufgelösten Dokument, nicht bei der Schreibweise der UUID. Der Ablehnungstext ist bei "fremd" und "nicht auflösbar" gleich und verrät nicht, ob es das Dokument gibt. |
| 4 Durchsetzung | Im Kern nach `validate`, vor `run`, über `KernelOptions.rights`. Nutzer für die Prüfung: `executeOptions.user` (bestätigt), sonst `currentUser`. Ablehnung: `not-permitted` mit Text. **Kein Vorabtest in der Weiterleitung:** Der GM entscheidet nach der Bestätigung. Wirft die Prüfung, ist das eine Ablehnung. | Eine Stelle für beide Wege; bindend beim GM, weil dort der bestätigte Nutzer ankommt. Ein Vorabtest im Client des Spielers gäbe nur eine schnellere Antwort und wäre umgehbar. |
| 5 Bindung der Typen an Module (R2) | **T7:** nicht jetzt. Regel im Vertrag Teil 6 und in den Übergaben: Ein Anfragetyp, der zu einem Modul gehört, muss die Module benennen, die ihn stellen dürfen, sonst kann sich ein veränderter Client als ein anderes, für ihn erlaubtes Modul ausgeben. Das Apply des Milestones, der den ersten solchen Typ bringt, legt es fest. | Die drei Typen sind allgemeine, lesende Nachweise; ein Angreifer gewinnt heute nichts (R2). Ein Feld ohne Nutzer wäre Vorrat. |
| 6 Rechteabfrage durch Module | **T6:** `api.getRights(moduleId)` liefert die **wirksame Stufe des aktuellen Nutzers** für ein angemeldetes Modul: `{ ok: true, value: { level } }`, sonst `invalid-request` oder `not-registered`. GM und Assistent: `all`. API-Version `0.6.0`. | Damit ein Modul einen Knopf ausblenden kann, statt an `not-permitted` zu scheitern. Ergebnis wie bei den übrigen Funktionen (nie eine Ausnahme). |
| 7 Oberfläche im Hub | Ein Block je Modul-Tab unter den Einstellungen: `fieldset` mit `legend` "Who may use this module", je Spieler (Rolle ohne GM-Rechte) ein Auswahlfeld mit den drei Stufen. Sichtbar und schreibbar **nur für die Rolle GAMEMASTER (T4)**; ein Assistent sieht ihn nicht, sein Schreiben wird abgewiesen. Schreiben über `applyRightsInput`, nacheinander in einer Warteschlange, damit keine Änderung eine andere überschreibt. Gelöschte Nutzer: Einträge bleiben wirkungslos und werden beim nächsten Schreiben dieses Moduls entfernt; neue Nutzer haben `denied`. | Vorgabe "im Hub, nur der GM". Der Block bleibt eigenständig von der Frage, ob der Modul-Rahmen entfällt (T8). |
| 8 Nachweis-Anfragetyp | **T5:** `flightcontrol.targetping` (Version 1, `runsOn "gm"`, Nutzlast `{ uuid: string }`, Ziel = diese UUID). Er tut nichts mit dem Dokument und gibt nichts über es preis: Antwort `{ apiVersion, module, uuid, askedBy }`. | Damit der Live-Check "eigen" gegen "fremd" zeigen kann, ohne dass ein Typ Daten ändert oder GM-Wissen weitergibt. |
| 9 Nacharbeit 3 | **T8:** im selben Paket; A (Rahmen bleibt ohne Titel) oder B (Rahmen entfällt, Empfehlung), Wahl mit dem "Go". | `m3-rework-3-output.md` |
| Umfang (R6) | **T9:** nicht weiter teilen (keine Planversion 3). Eine Teilung in Logik ohne Oberfläche und Oberfläche würde eine Logik hinterlassen, die sich nur über die Konsole einstellen lässt. | Der Umfang ist groß, aber zusammenhängend. |

### 3. Schnittstellen (nur Signaturen)

```ts
// core/request-kernel.ts (erweitert)
interface RequestHandler<P> {
  // ... type, versions, runsOn?, validate, run wie bisher
  // The documents this request acts on, as UUIDs; empty when it acts on none. Called only with a validated payload.
  targets?(payload: P): readonly string[];
}
interface RightsCheck {
  readonly module: string;                 // the module the request names
  readonly user: RequestUser | undefined;  // the user the request runs for
  readonly targets: readonly string[];
}
type RightsVerdict = { readonly ok: true } | { readonly ok: false; readonly detail: string };
interface RightsGate { check(request: RightsCheck): Promise<RightsVerdict> }   // never rejects
interface KernelOptions { readonly currentUser?; readonly rights?: RightsGate }

// core/rights-table.ts (neu, reine Daten)
type RightsLevel = "denied" | "own" | "all";
interface RightsTable { readonly version: 1; readonly modules: Readonly<Record<string, Readonly<Record<string, "own" | "all">>>> }
type ParsedRights = { ok: true; value: RightsTable } | { ok: false; detail: string };
function parseRightsTable(text: unknown): ParsedRights                       // undefined, null, "" = leere Tabelle
function serializeRightsTable(table: RightsTable): string
function levelOf(table: RightsTable, moduleId: string, userId: string): RightsLevel
function withLevel(table: RightsTable, moduleId: string, userId: string, level: RightsLevel,
                   knownUserIds: ReadonlySet<string>): RightsTable           // neue Tabelle; "denied" entfernt den Eintrag

// core/request-rights.ts (neu, die Auswertung)
type OwnershipKind = "own" | "foreign" | "unknown";
interface RightsEnvironment {
  storedTable(): string | undefined;                                  // wirft, wenn nicht lesbar
  isGm(userId: string): boolean | undefined;                          // undefined: den Nutzer kennt niemand
  ownership(uuid: string, userId: string): Promise<OwnershipKind>;    // "unknown" statt Fehler
}
function createRightsGate(environment: RightsEnvironment, log?: { warn(message: string): void }): RightsGate
function effectiveLevel(environment: RightsEnvironment, moduleId: string, userId: string | undefined): RightsLevel

// core/rights-hub.ts (neu, was der Hub zeigt und wie er schreibt)
interface RightsHubUser { readonly id: string; readonly name: string }
interface RightsHubSource {
  canEdit(): boolean;                          // Rolle GAMEMASTER, nicht Assistent
  players(): readonly RightsHubUser[];         // Nutzer ohne GM-Rechte
  storedTable(): string | undefined;
  store(text: string): Promise<unknown>;
}
interface RightsRow { readonly userId: string; readonly name: string; readonly level: RightsLevel }
function listRights(moduleId: string, source: RightsHubSource): { rows: readonly RightsRow[]; unreadable: boolean }
type RightsWriteFailure = "not-permitted" | "not-allowed" | "unknown-user" | "invalid-value" | "write-failed";
type RightsWriteResult = { ok: true; value: RightsLevel } | { ok: false; reason: RightsWriteFailure; detail: string };
function applyRightsInput(moduleId: string, userId: string, rawLevel: unknown,
                          allowedModules: readonly string[], source: RightsHubSource): Promise<RightsWriteResult>  // nie eine Ablehnung

// core/eagle-api.ts (erweitert)
interface EagleFlightControlApi { /* version, registerModule, request */ getRights(moduleId: unknown): RightsQueryResult }
type RightsQueryResult = { ok: true; value: { level: RightsLevel } } | { ok: false; reason: "invalid-request" | "not-registered"; detail: string }
// createEagleApi(registry, log, kernel, rights?: { levelFor(moduleId: string): RightsLevel })

// core/request-handlers.ts (erweitert): flightcontrol.targetping, defaultRequestHandlers liefert genau drei Typen

// v13/rights.ts (neu, dünne Hülle)
function registerRightsSetting(): void                       // game.settings.register("eagleeye", "rights", { scope: "world", config: false, type: String, default: "" })
function foundryRightsEnvironment(): RightsEnvironment       // game.settings, game.users, fromUuid + testUserPermission
function foundryRightsHubSource(): RightsHubSource           // game.user.role === GAMEMASTER, game.users, game.settings
```

### 4. Ablauf

**Auswertung** (`RightsGate.check`, in dieser Reihenfolge, jede Ausnahme wird zur Ablehnung):
1. Nutzer fehlt oder unbekannt (`isGm` undefined): Nein ("the user of this request is not known").
2. `isGm` wahr (GM, Assistent): Ja.
3. Ablage lesen und prüfen; nicht lesbar: Nein ("the rights could not be read, so nothing is allowed until they can"); ein Hinweis im Log, einmal, bis sie wieder lesbar ist.
4. Stufe des Nutzers für das Modul (`levelOf`): `denied`: Nein (`module "<id>" may not be used by this user`).
5. `all` oder keine Ziele: Ja.
6. `own` mit Zielen: für jedes Ziel `ownership(uuid, userId)`; jedes Ergebnis außer `own`: Nein (`module "<id>" may act only on targets this user owns`), ohne die weiteren Ziele zu prüfen. Sonst Ja.

**Eine Anfrage eines Spielers für einen `gm`-Typ** (nach M6a unverändert bis zur Bestätigung): Spieler-Client leitet weiter, GM-Client bestätigt den Nutzer über dessen Client, **dann** `kernel.execute(umschlag, { user })`: Umschlag prüfen, Absender, Handler, Version, Datenprüfung, `targets(payload)`, **Rechteprüfung**, `run`. Ablehnung kommt als `not-permitted` mit dem Text zurück; der GM-Client loggt sie wie jede abgelehnte weitergeleitete Anfrage.

**Eine Anfrage für einen `caller`-Typ** läuft im eigenen Client durch denselben Kern mit `currentUser`; die Rechteprüfung ist dort eine Regel für Module, die sich an die Regeln halten.

**Einstellen** (GM im Hub): Auswahl geändert, Speichern durch `applyRightsInput` (Rolle GAMEMASTER, Modul angemeldet, Nutzer ein Spieler dieser Welt, Stufe gültig); Tabelle lesen (nicht lesbar zählt als leer), `withLevel`, `serializeRightsTable`, `store`. Bei Ablehnung stellt der Hub die gespeicherte Stufe wieder ein und zeigt eine Meldung; Schreiben läuft nacheinander.

**`getRights`:** Modul angemeldet? Sonst `not-registered`. Dann `effectiveLevel` für den Nutzer dieses Clients.

**Aktualität:** Die Prüfung liest die Ablage bei jeder Anfrage (`game.settings.get`), nicht aus einem Zwischenspeicher der Rechte. Die Bindung beim GM hängt deshalb nicht davon ab, ob eine Änderung schon auf einem anderen Client angekommen ist: Der GM schreibt sie selbst. (Mit mehreren gleichzeitig verbundenen GMs gilt das nur, wenn die Änderung des anderen GMs angekommen ist; U5, unverified.)

### 5. Zielbild der Dateien

| Datei | Änderung |
|---|---|
| `core/rights-table.ts`, `core/request-rights.ts`, `core/rights-hub.ts` | **neu** (reine Logik, eingespeiste Quellen) |
| `core/request-kernel.ts` | `targets`, `RightsCheck`, `RightsVerdict`, `RightsGate`, `KernelOptions.rights`; Prüfung nach `validate`, vor `run` |
| `core/request-handlers.ts` | `flightcontrol.targetping`; genau drei Typen |
| `core/eagle-api.ts`, `core/api-version.ts` | `getRights`; Version `0.6.0` |
| `v13/rights.ts` | **neu** (Einstellung registrieren, Umgebung und Hub-Quelle für Foundry) |
| `v13/module.ts` | Einstellung registrieren, Prüfung in den Kern einhängen (fällt sie aus, verweigert ein Ersatz alles), `getRights` verdrahten, Hub bekommt die Quelle |
| `v13/hub-application.ts` | Rechte-Block je Tab (nur GAMEMASTER) mit Warteschlange; Nacharbeit 3 (Titel entfällt) |
| `v13/lang/en.json` | Texte des Rechte-Blocks und der Meldungen |
| `test-fixtures/eagleeye-dummy-a`, `-d` | API `0.6.0`; Dummy a gibt `getRights` aus |
| `docs/api-contract.md`, `docs/ui-guide.md` | Vertrag Teil 6; Leitfaden nach dem Live-Check |

`core/request-relay.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/hub-model.ts`, `core/json-value.ts`, `core/manifest-scanner.ts`, `package.json` und die Lock-Datei bleiben unverändert.

### 6. Testplan (Vitest; jeder Fall genau ein `it`, Tabellenfälle laufen als Schleife im Test)

| # | Prüfung | Datei |
|---|---|---|
| P1 | `parseRightsTable`: nimmt `undefined`, `null`, `""` und eine gültige Tabelle an; lehnt ab: kein JSON, kein Objekt, falsche Version, `modules` kein Objekt, Modul kein Objekt, Stufe außer `own`/`all` (auch `denied`, Zahl, leer), leere Nutzer-ID (zwei Tests) | `rights-table.test.ts` |
| P2 | `levelOf`: `own`, `all`, fehlender Nutzer, fehlendes Modul; feindliche Schlüssel (`__proto__`, `constructor`, `toString`) ergeben `denied` und keinen Fehler (zwei Tests) | dito |
| P3 | `withLevel`: setzt eine Stufe; `denied` entfernt den Eintrag und ein leer gewordenes Modul; entfernt Einträge unbekannter Nutzer dieses Moduls; lässt andere Module unberührt; ändert die Eingabe nicht (vier Tests) | dito |
| P4 | `serializeRightsTable` und `parseRightsTable` ergeben die Ausgangstabelle | dito |
| P5 | Gate: GM und Assistent sind erlaubt, ohne Tabelle und ohne Besitzprüfung | `request-rights.test.ts` |
| P6 | Gate, Tabelle der Fälle (Schleife): kein Eintrag; `own` ohne Ziel; `own` mit eigenem, fremdem, unbekanntem Ziel; `own` mit einem eigenen und einem fremden Ziel; `all` mit fremdem und mit unbekanntem Ziel | dito |
| P7 | Gate: die Besitzprüfung läuft nur bei `own` mit Zielen, je Ziel, mit der ID des Nutzers; sie endet beim ersten Nicht-Eigenen | dito |
| P8 | Gate: fehlender Nutzer und unbekannter Nutzer werden abgelehnt | dito |
| P9 | Gate: nicht lesbare Ablage (wirft, kein JSON) lehnt Spieler ab und erlaubt den GM; ein Hinweis, der erst nach einer lesbaren Ablage wieder erscheinen kann (zwei Tests) | dito |
| P10 | Gate: wirft `isGm` oder `ownership`, ist es eine Ablehnung, nie eine Ausnahme | dito |
| P11 | Gate: die Texte der Ablehnung (Modul gesperrt, nur eigene Ziele, fremd und nicht auflösbar gleich) | dito |
| P12 | `effectiveLevel`: GM `all`, Spieler laut Tabelle, unbekannter Nutzer und nicht lesbare Ablage `denied` | dito |
| P13 | Kern: Ablehnung durch das Gate ergibt `not-permitted`, `run` läuft nicht, `validate` lief vorher | `request-kernel.test.ts` |
| P14 | Kern: das Gate bekommt Modul, Nutzer und die Ziele aus `targets(payload)` (ohne `targets`: leere Liste) | dito |
| P15 | Kern: `executeOptions.user` gewinnt gegen `currentUser` auch bei der Prüfung | dito |
| P16 | Kern: wirft oder verwirft das Gate, ist es `not-permitted`, `run` läuft nicht | dito |
| P17 | Kern: wirft `targets`, ist es `handler-failed`, `run` läuft nicht | dito |
| P18 | Kern: eine ungültige Nutzlast ergibt `invalid-payload`, ohne das Gate zu fragen | dito |
| P19 | `targetping`: prüft die Nutzlast (`uuid` Pflicht, Text, höchstens 200 Zeichen), nennt sein Ziel, läuft beim GM, gibt `uuid` und `askedBy` zurück (zwei Tests) | `request-handlers.test.ts` |
| P20 | genau drei Anfragetypen, nur `gmping` und `targetping` laufen beim GM (Test aus M5 angepasst) | dito |
| P21 | Relais mit echtem Kern und einem Gate: ein bestätigter Nutzer mit gesperrtem Modul wird beim GM abgelehnt (Handler läuft nicht, Log nennt den Grund), ein erlaubter läuft (zwei Tests) | `request-relay.test.ts` |
| P22 | `listRights`: nur Spieler, mit wirksamer Stufe; Nutzer ohne Eintrag `denied`; Einträge unbekannter Nutzer erscheinen nicht; nicht lesbare Ablage: alle `denied` und `unreadable` (zwei Tests) | `rights-hub.test.ts` |
| P23 | `applyRightsInput`: speichert eine Stufe; `denied` entfernt sie; behält andere Einträge; entfernt Einträge gelöschter Nutzer des Moduls (drei Tests) | dito |
| P24 | `applyRightsInput`: Ablehnung (Schleife): keine Rolle GAMEMASTER, Modul nicht angemeldet, Nutzer kein Spieler dieser Welt (auch GM und Assistent), ungültige Stufe; Fehler beim Speichern; in keinem Fall wird etwas gespeichert (zwei Tests) | dito |
| P25 | `getRights`: angemeldetes Modul ergibt die Stufe; unbekanntes Modul `not-registered` und falsche Angabe `invalid-request` (Schleife); wirft die Quelle, gibt es ein Ergebnis (drei Tests). Der bestehende Test der Oberfläche ("genau version, registerModule und request") nennt danach vier Mitglieder. | `eagle-api.test.ts` |
| P26 | `EAGLE_API_VERSION` ist `0.6.0`; die Versionstests bleiben grün | `api-version.test.ts` |

Erwartet: 38 neue Tests, insgesamt etwa 125 in 15 Dateien (P20, P25 und P26 ändern bestehende Tests).

**Weitere Prüfungen im Deploy:** einmal `typecheck`, `test`, `build`; Skriptprüfung der Fehlercodes (Vertrag gegen Code) und der Testmodule; Suche nach verbotenen Mustern (`innerHTML`, `libWrapper`, `socketlib`, `game.socket`); Gegenproben für jede neue Prüfung (die Prüfung im Kern auslassen; `own` und `fremd` vertauschen; "unbekannt" als eigen werten; nicht lesbare Ablage erlauben; `isGm` ignorieren; GM-Prüfung umkehren; Rolle beim Schreiben nicht prüfen; Einträge gelöschter Nutzer behalten; Nutzer aus `currentUser` statt aus `executeOptions`); Zwei-Client-Simulation mit dem echten Bundle (Standard `denied`, freigeben, eigen und fremd, `all`, wieder sperren, kaputte Ablage, gefälschte Angabe bleibt abgelehnt); Simulation der Hub-Logik; Zeitstempelvergleich der Pakete.

### 7. Testmodule und Live-Check (Anleitung im Monitor)

- **Dummy a und d:** API `0.6.0`; Dummy a gibt zusätzlich `rights: <Stufe>` aus (`getRights`) und stellt weiter `ping` und `gmping`. **Gewollte Verhaltensänderung:** Ohne Freigabe bekommt ein Spieler für beide `not-permitted`.
- **Ablauf für den Projektleiter:** (A) Spieler ohne Freigabe: `ping` und `gmping` `not-permitted`, `rights: denied`; der GM bekommt `ok` und `rights: all`. (B) GM setzt im Hub für Dummy A den Spieler auf "Own targets only"; nach dem Neuladen `ping` und `gmping` `ok`, `rights: own`. (C) Mit `flightcontrol.targetping` und der UUID eines Akteurs, den der Spieler besitzt (`ok`), und eines, den er nicht besitzt (`not-permitted`); die UUIDs stehen in der Konsole des Spielers (`game.actors.contents.map(a => a.uuid + " " + a.isOwner)`).
  (D) Stufe "Own and foreign targets": beide `ok`. (E) Wieder "Denied": `not-permitted`; die Einstellung bleibt nach F5. (F) Aussehen des Hubs (Nacharbeit 3 und Rechte-Block), Screenshots von Tab A und D. Optional: Assistentenkonto (Block nicht sichtbar) und ein zweiter Spieler.
- **Pakete:** `eagleeye-v13-m6b.zip`, `eagleeye-dummy-a.zip`, `eagleeye-dummy-d.zip` (b und c unverändert), im Ordner `v13/dist/live-check/`. Die Zips der Testmodule b und c bleiben unverändert.

### 8. API-Vertrag Teil 6 (Änderungen an `docs/api-contract.md`, Englisch)

Neuer Teil "Rights per module and user": die drei Stufen und was sie erlauben; Standardwerte (GM und Assistent immer, alle anderen ohne Eintrag `denied`); wer einstellt (nur der GM im Hub) und dass die Ablage `eagleeye.rights` intern ist (nicht schreiben); wie ein Anfragetyp Ziele nennt und was "eigen" heißt; `not-permitted` mit den Texten; **wo die Prüfung bindend ist** (auf dem GM-Client) **und wo sie eine umgehbare Regel ist** (Typen im eigenen Client); `getRights` (Signatur, Ergebnisse, Aufruf ab `ready`); die Regeln für künftige Anfragetypen (Ziele nennen, Bindung an Module, keine Daten ohne Ziel ändern); was live belegt ist und was nicht. Abschnitt "Not part of this version" und die Tabelle der Fehlercodes werden angepasst, die Änderungshistorie um `0.6.0` ergänzt.

### 9. Sicherheitsbetrachtung (Rechte je Modul und Nutzer)

| # | Bedrohung | Maßnahme im Design | Rest |
|---|---|---|---|
| S1 | Ein Spieler ohne Freigabe stellt eine Anfrage (unveränderter Client) | Der Kern verweigert; bei `gm`-Typen beim GM nach der Bestätigung des Nutzers | keiner |
| S2 | Ein veränderter Client überspringt die Regel im eigenen Client (Typ mit `runsOn "caller"`) | Vorgabe: umgehbare Regel; der Handler läuft mit den Foundry-Rechten des Nutzers, ein Gewinn über diese hinaus entsteht nicht | Absicht, `info` |
| S3 | Ein veränderter Client gibt sich als ein anderes Modul aus, für das sein Nutzer erlaubt ist (R2) | Die Rechte hängen an der selbst angegebenen Modul-`id` (M6a-S10, Vertrauensgrenze); die drei Typen sind allgemeine Nachweise ohne Wirkung auf Daten; für künftige Typen gilt die Regel aus Frage 5 | `medium` (heute ohne Gewinn) |
| S4 | Ein Nutzer nennt die Identität eines anderen | M6a: Bestätigung durch den genannten Nutzer | keiner |
| S5 | Ein Spieler ändert die Ablage | Er hat kein Recht, Welteinstellungen zu schreiben (Foundry) | Assistent: U1, `medium` (S12) |
| S6 | Die Ablage ist beschädigt oder nicht lesbar | Alle außer GM und Assistent verweigert, Hinweis im Log | keiner (fail closed) |
| S7 | Die Besitzprüfung oder die Nutzerabfrage scheitert | Ablehnung, `run` läuft nicht | keiner |
| S8 | `own` mit fremdem oder nicht auflösbarem Ziel | verweigert, gleicher Text | keiner |
| S9 | Ein Handler ändert Dokumente, die er nicht in `targets` nennt | Regel im Vertrag; heute gibt es keinen ändernden Handler; künftige Handler prüft ihr Apply | `low` bis zum ersten ändernden Handler |
| S10 | Aussperrung des GM | GM und Assistent sind immer erlaubt und nicht einstellbar | keiner |
| S11 | Nutzer wird gelöscht und neu angelegt (neue ID) | Kein Eintrag heißt `denied`; ein Eintrag der alten ID wirkt nicht | `low` (A1) |
| S12 | Ein Assistent verändert die Ablage über die Konsole oder stellt sich selbst etwas ein | Oberfläche und Schreibpfad von Flight Control verlangen die Rolle GAMEMASTER; ein Assistent nutzt ohnehin alles als `isGM`; ob Foundry ihm das Schreiben von Welteinstellungen erlaubt, ist offen (U1) | `medium`, angenommen |
| S13 | Die Prüfung fehlt in der Verdrahtung (Kern ohne `rights`) | `v13/module.ts` verdrahtet sie immer; fällt der Aufbau aus, verweigert ein Ersatz alles; die Simulation prüft das Bundle | `low` |
| S14 | Spieler lesen die Ablage | Nutzer-IDs und Stufen, keine weiteren personenbezogenen Daten (R8) | `low` |

**Bewertung für die Governance:** Die im Discover als `high` (inhärent) genannten Risiken R1 (Umgehbarkeit) und R2 (Modul-`id`) bleiben nach dem Design **ohne `high`-Fund**: Die Prüfung beim GM ist bindend gegenüber jedem Nutzer, der sich nicht als ein anderes, für ihn erlaubtes Modul ausgibt; im eigenen Client ist sie ausdrücklich eine Regel (Vorgabe, kein Gewinn). Verbleibend sind S3 und S12 (`medium`),
die mit dem "Go" **ausdrücklich anzunehmen** sind. Die Absenkung von `high` auf `medium` ist meine Bewertung; teilt der Projektleiter sie nicht, ist es eine Human Decision. Kein Datenschutz-Fund `medium+`, keine Dependency-Änderung; die Änderung an einer M3-Datei (Nacharbeit 3) ist eine Cross-Milestone-Änderung, deren Zustimmung das "Go" einschließt.

### 10. Übergaben

- **Künftige Anfragetypen** (jeder Milestone, der einen bringt): im Apply festlegen, welche Dokumente der Typ als Ziel nennt, ob er an Module gebunden ist (S3), ob er Daten ändert oder GM-Wissen weitergibt (dann `runsOn "gm"` mit Ziel und diesem Design als Grundlage; die Regel aus M5 ist damit für Typen mit Ziel erfüllt).
- **M8:** Ratenbegrenzung (M5-S6, M6a-S7), Diagnosezeile aus M5 entfernen, Packaging-Skript mit `lang/`, Versionspolitik; Vertrag Gesamtdurchsicht; T3 und T4 (Plan-Stellen und Root-README).
- **Ungeprüft nach dem Live-Check** (Liste in `m6b-04`): Assistent schreibt Welteinstellung (U1), Objekt oder Text über Clients hinweg (U2, für Text durch L1 gedeckt), Besitzprüfung für GM, Compendium und `INHERIT` (U3), gelöschte Nutzer (U4), mehrere GMs (U5).

### 11. Deploy-Reihenfolge (Plan, ohne Code)

1. `core/rights-table.ts` mit P1 bis P4
2. `core/request-kernel.ts` (`targets`, Gate-Typen, Prüfung) mit P13 bis P18
3. `core/request-rights.ts` mit P5 bis P12
4. `core/request-handlers.ts` (`targetping`) mit P19 und P20; `core/api-version.ts` mit P26
5. `core/eagle-api.ts` (`getRights`) mit P25
6. `core/rights-hub.ts` mit P22 bis P24
7. `core/request-relay.test.ts` (P21; der Relais-Code bleibt unverändert)
8. `v13/rights.ts`, `v13/module.ts`, `v13/lang/en.json`, `v13/hub-application.ts` (Rechte-Block, Warteschlange, Nacharbeit 3); Typecheck bestätigt die Hülle
9. Testmodule a und d
10. `docs/api-contract.md` (Teil 6); der Leitfaden nach dem Live-Check
11. Prüfen wie oben; Live-Check-Pakete bauen; Deploy-Output; kein Commit ohne Anweisung, kein Live-Test durch mich

---

## Acceptance Criteria

```
AC-M6b-01: core/rights-table.ts liest und schreibt die Tabelle nach Abschnitt 3; ungültige Tabellen, feindliche Schlüssel und Stufen außer own/all werden abgelehnt oder bleiben ohne Wirkung (P1 bis P4).
AC-M6b-02: Das Gate entscheidet nach Abschnitt 4: GM und Assistent immer erlaubt; ohne Eintrag, unbekannter Nutzer, nicht lesbare Ablage, Fehler und fremdes oder nicht auflösbares Ziel bei own verweigert; all erlaubt; die Besitzprüfung läuft nur, wo sie gebraucht wird (P5 bis P12).
AC-M6b-03: Der Kern wertet die Rechte nach der Datenprüfung und vor der Ausführung aus, mit dem bestätigten Nutzer (executeOptions.user) vor currentUser; eine Ablehnung ist not-permitted und run läuft nicht; eine Ausnahme im Gate oder in targets führt nie zur Ausführung (P13 bis P18).
AC-M6b-04: flightcontrol.targetping existiert genau einmal, läuft beim GM, nennt sein Ziel und gibt nur uuid und askedBy zurück; die Liste der Anfragetypen bleibt bewacht (P19, P20).
AC-M6b-05: Ein über das Relais bestätigter Nutzer wird beim GM nach den Rechten geprüft (P21); core/request-relay.ts ist unverändert.
AC-M6b-06: listRights zeigt nur Spieler mit ihrer wirksamen Stufe; applyRightsInput schreibt nur mit der Rolle GAMEMASTER, nur für angemeldete Module und Spieler dieser Welt, nur gültige Stufen, und entfernt Einträge gelöschter Nutzer (P22 bis P24).
AC-M6b-07: api.getRights(moduleId) liefert die wirksame Stufe des aktuellen Nutzers, oder invalid-request, not-registered; nie eine Ausnahme; API-Version 0.6.0; die API hat genau version, registerModule, request und getRights (P25, P26).
AC-M6b-08: v13/module.ts registriert die Einstellung, verdrahtet die Prüfung immer in den Kern (bei Ausfall verweigert ein Ersatz alles) und den Hub mit der Rechte-Quelle; der Hub zeigt den Rechte-Block nur der Rolle GAMEMASTER, ohne innerHTML; der Titel des Moduls entfällt nach dem "Go" (Nacharbeit 3, A oder B); typecheck endet mit Exit 0.
AC-M6b-09: docs/api-contract.md hat Teil 6 nach Abschnitt 8 (Englisch), die Codetabelle, "Not part of this version" und die Historie sind angepasst; ein Skript prüft die Fehlercodes des Vertrags gegen den Code.
AC-M6b-10: Alle Tests bestehen; Tests des Relais und des Kerns aus M4 bis M6a bleiben unverändert grün (bis auf die Anpassungen P20, P25 und P26); das Bundle enthält weder innerHTML noch libWrapper, socketlib oder game.socket; keine neue Dependency.
AC-M6b-11 (unverified, Live-Check mit GM und Spieler): ein Spieler ohne Freigabe bekommt not-permitted für ping und gmping; nach der Freigabe im Hub ok; targetping mit eigenem Ziel ok, mit fremdem not-permitted (Stufe own), mit fremdem ok (Stufe all); nach dem Sperren wieder not-permitted; die Einstellung bleibt nach F5; getRights zeigt die Stufe.
AC-M6b-12 (unverified, Live-Check): Der Rechte-Block und der Tab ohne Titel sehen gut aus; ein Assistent sieht den Block nicht (optional).
```

---

## Risks and Assumptions

| # | Risiko oder Annahme | Severity | Blocking |
|---|---|---|---|
| R1 | **Security, Reichweite:** Beim GM bindend, im eigenen Client umgehbar (Vorgabe, S2). Nach dem Design kein `high`-Fund; das ist meine Bewertung (Abschnitt 9). | `medium` (angenommen mit dem "Go") | no |
| R2 | **Security, Modul-`id` (S3):** ein veränderter Client kann sich als ein anderes, für ihn erlaubtes Modul ausgeben; heute ohne Gewinn, wirksam mit dem ersten modulspezifischen Typ; Regel im Vertrag und in den Übergaben (T7). | `medium` (angenommen mit dem "Go") | no |
| R3 | **Security, Einstellen (S12, U1):** Ob Foundry einem Assistenten das Schreiben von Welteinstellungen erlaubt, ist offen; der Hub und der Schreibpfad von Flight Control verlangen die Rolle GAMEMASTER, die Ablage selbst schützt Foundry. | `medium` (angenommen mit dem "Go") | no |
| R4 | Foundry-Verhalten, das nur live prüfbar ist: `testUserPermission` für GM, Compendium und `INHERIT` (U3), Aktualisierung der Welteinstellung auf anderen Clients (U2), Nutzerliste bei gelöschten oder neuen Nutzern (U4), mehrere GMs (U5). Die Bindung beim GM hängt von keinem dieser Punkte für die Aktualität ab (Abschnitt 4). | `medium` | no |
| R5 | Die Oberfläche (Rechte-Block, Tab ohne Titel) und die Wirkung mit einem echten Spieler sind nur live prüfbar; es ist der letzte Versuch der Nacharbeit (Rework-Limit). | `low` | no |
| R6 | **Gewollte Verhaltensänderung:** Ohne Freigabe bekommt ein Spieler für `ping` und `gmping` `not-permitted`; das ändert die Anzeige der Testmodule und den Ablauf des Live-Checks. | `low` | no |
| R7 | Umfang groß, aber zusammenhängend (T9); ein Fehler in einem Teil verzögert den ganzen Live-Check. | `low` | no |
| R8 | Datenschutz: Nutzer-IDs und Stufen, von Spielern lesbar. | `low` | no |
| A1 | **Annahme:** `fromUuid` steht im Client als globale Funktion zur Verfügung (die Typen der Referenz führen sie); nicht live geprüft. | `low` | no |
| A2 | **Annahme:** `game.users.get(id)?.isGM` und `testUserPermission(user, "OWNER")` verhalten sich, wie die Referenz beschreibt (FF2, FF12); nicht live geprüft. | `low` | no |
| A3 | **Annahme:** Nutzer-IDs bleiben stabil (M6-A1). | `low` | no |

Kein `high`-Fund, kein `critical`-Fund. Nach Governance sind `medium`-Punkte mit dem "Go" ausdrücklich anzunehmen (R1 bis R3).

---

## Open TBDs (mit Vorschlag; mit dem "Go" als angenommen)

| # | Punkt | Vorschlag |
|---|---|---|
| T1 | Stufen | `denied`, `own`, `all`; "nur fremde Ziele" wird nicht angeboten (Abschnitt 2, Frage 1) |
| T2 | Standardwerte | GM und Assistent immer erlaubt; alle anderen ohne Eintrag `denied`; unbekannt oder unlesbar `denied` |
| T3 | Ablage | Welteinstellung `eagleeye.rights`, `config: false`, `type: String` mit JSON-Text, nur Stufen `own` und `all` gespeichert |
| T4 | Wer sieht und ändert | nur die Rolle GAMEMASTER; ein Assistent sieht den Block nicht und wird beim Schreiben abgewiesen |
| T5 | Nachweis-Anfragetyp | `flightcontrol.targetping` (Version 1, `gm`, Nutzlast `{ uuid }`, gibt nur `uuid` und `askedBy` zurück) |
| T6 | Rechteabfrage | `api.getRights(moduleId)` mit `{ ok, value: { level } }`; API `0.6.0` |
| T7 | Bindung der Anfragetypen an Module | nicht jetzt; Regel im Vertrag und in den Übergaben |
| T8 | Nacharbeit 3 im Paket | **B:** der Rahmen entfällt mit dem Titel (Empfehlung); **A:** der Rahmen bleibt ohne Titel. Die Wahl trifft der Projektleiter mit dem "Go". |
| T9 | Umfang | nicht weiter teilen, keine Planversion 3 |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6b-02-apply-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

**Stopp für das "Go" des Projektleiters** (Working Mode). Mit dem "Go" gelten R1 bis R3 (`medium`) als angenommen, T1 bis T9 wie vorgeschlagen und die Wahl bei T8. Danach der Deploy in der Reihenfolge aus Abschnitt 11, dann der Monitor ohne Stopp mit der Anleitung für den Live-Check.

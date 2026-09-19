# M2 — Modul-Anmeldung und Erkennung — Apply Output

```
artifact: apply-output
milestone: M2
phase: APPLY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Design ohne Implementierung (Schnittstellen als Signaturen, keine Funktionsrümpfe). Der Deploy
beginnt erst nach dem ausdrücklichen "Go" des Projektleiters (`06-working-mode.md`).

---

## Input Summary

- Geschlossener Discover-Output `m2-01-discover-output.md`. Verweise darin: **F** Foundry-Fakten,
  **V** Vorbilder/Doku, **U** nicht belegbar ohne Live-Test, **S** Spezifikation, **I** Repo-Ist,
  **D** Dependencies, **Q** offene Fragen. Verweise auf dessen Risiken und Annahmen tragen das Präfix
  "Discover-"; die Risiken (R1–R7) und Annahmen (A1–A3) dieses Dokuments stehen unten.
- `04-milestone-plan.md` (M2), `m1-04-monitor-output.md` (Übergaben), `m1-02-apply-output.md`
  (Konventionen K1–K4)
- Bestätigte Entscheidungen: E6, N2, N4, Q3 a, E7 (`eagle-modules-aufbau.md`)
- Zusätzlich im Apply gegen die Types geprüft: `ModuleConfig` ist ein **globales** Interface
  (`types/config.d.mts`, `declare global`); `ConfiguredModule<Name>` liefert für Module, die nicht in
  `RequiredModules` stehen, eine Union nach `active` (`utils/index.d.mts:18–24`).

---

## Solution Design

### 1. Leitlinie

Flight Control stellt an seinem Modulobjekt eine **schmale API** bereit; ein Eagle Modul ruft **eine**
Funktion auf, um sich anzumelden. Flight Control kennt danach genau die Module, die sich erfolgreich
angemeldet haben **und jetzt aktiv sind**. Es scannt nichts und prüft keine Manifeste anderer Module
(E6); die Anmeldung ist die Erkennung (N2). Alles, was Foundry-Laufzeit braucht, liegt in einer dünnen
Hülle (K3); die Logik ist rein und in Vitest prüfbar (K1).

### 2. Entscheidungen zu den offenen Fragen des Discover

| Q | Entscheidung | Grund | Verworfene Alternative |
|---|---|---|---|
| Q1 Form | **Push:** Das Modul ruft `game.modules.get("eagleeye")?.api.registerModule(descriptor)` auf. Öffentliche Fläche in M2: genau `version` und `registerModule` | N2 (API-Registrierung genügt), Plan 3.1 ("Ein Eagle Modul meldet sich mit seinem Inhalt und einer Startfunktion an"), N4 (schmal). Vorbild-Konvention V1 | **Pull** über Manifest-`flags` (widerspricht N2); Liste der Module in die öffentliche API (nicht nötig, vergrößert die Fläche, die über sieben Repos stabil bleiben muss; im Milestone Plan ist das als `high`-Risiko von M4 geführt) |
| Q2 Zeitpunkt | Flight Control setzt die `api` im **synchronen Teil seines `init`-Callbacks** (vor jedem `await`). Module melden sich **ab ihrem `setup`-Hook** an (oder später). Kein eigener Bereitschafts-Hook | `setup` läuft nach dem `init`-Ereignis (F4), also nach allen `init`-Callbacks, egal in welcher Reihenfolge Module laden. Damit hängt das Design **nicht** an U1 (Reihenfolge) und nicht an U4 (nachträgliche Listener) | Anmeldung im `init` (hängt an U1); eigener Hook `eagleeye.ready` (hängt an U4, vergrößert die Fläche); `library: true` (nicht empfohlen, `m5-02`) |
| Q3 Erkennung | Ein Modul gilt als Eagle Modul, wenn `registerModule` es angenommen hat. Flight Control prüft **nicht die Herkunft** (technisch nicht möglich, Discover-R4) und scannt nichts. E6 wird gelesen als "Flight Control bindet von sich aus keine Fremdmodule an"; eine Selbstanmeldung Dritter ist nicht vorgesehen und im Vertrag ausgeschlossen, aber nicht verhindert | Kein Verfahren (Manifest-Marker, `requires`-Prüfung, Namenspräfix) ist fälschungssicher; die Modul-IDs stehen nicht fest (A1); weitere Module sollen ohne Änderung an Flight Control ergänzbar sein | `requires`-Pflichtprüfung beim Anmelden (kein Sicherheitsgewinn, nur Formalität); feste ID-Liste (widerspricht "später weitere Module ohne Änderung") |
| Q4 Inhalt | Teil 1 des Vertrags: Beschreiber `{ id, apiVersion }`. Titel und Version des Moduls liest Flight Control aus Foundry, nicht aus dem Beschreiber. Unbekannte Zusatzfelder werden ignoriert (Vorwärtskompatibilität). Tab-Inhalt, Start-Aktion und Einstellungen kommen als optionale Felder mit M3 | eine Quelle der Wahrheit für Titel/Version; M2/M3 sauber getrennt (Plan-Scope) | Titel/Version im Beschreiber (doppelte Wahrheit) |
| Q5 Version | Flight Control hat eine eigene **API-Version** `0.1.0` (unabhängig von der Modulversion). Das Modul nennt die API-Version, gegen die es geschrieben ist. Kompatibel, wenn `provided ≥ requested`, gleiche Major-Version und (nur bei Major `0`) gleiche Minor-Version. Bei Inkompatibilität wird die Anmeldung **abgewiesen** (`incompatible-api-version`); das Modul entscheidet, wie es damit umgeht (nur seine eigenen Funktionen abschalten, `m5-02`) | F9: Foundry hat kein API-Versionskonzept; eigene, kleine, reine Logik ohne neue Dependency (D3) und ohne Foundry-Laufzeit (D4). Vor 1.0 gilt "Minor bricht" (Entwicklungsphase, alle Module eigen). Wann `1.0.0` erreicht wird, entscheidet M8 | Semver-Bibliothek (Dependency-Änderung, freigabepflichtig); `foundry.utils.isNewerVersion` (in Vitest nicht verfügbar); nur warnen statt abweisen (Schnittstellenstabilität ist das größte Risiko laut Plan) |
| Q6 Randfälle | Reihenfolge der Prüfung: (1) Beschreiber gültig → `invalid-descriptor`, (2) `apiVersion` strikt `x.y.z` → `invalid-api-version`, (3) Modul in Foundry bekannt → `unknown-module`, (4) Modul aktiv → `inactive-module`, (5) nicht schon angemeldet → `already-registered` (die erste Anmeldung bleibt), (6) kompatibel → `incompatible-api-version`. `registerModule` wirft nie; ein unerwarteter Fehler ergibt `internal-error`. Wer sich nicht anmeldet, ist Flight Control unbekannt. Vor `setup` ist die `api` unter Umständen nicht da; der Aufrufer prüft sie (`?.`) | stabile Fehlercodes sind Teil des Vertrags; ein werfender Aufruf würde das `setup` fremder Module stören | Ausnahmen werfen; erneutes Anmelden ersetzt still |
| Q7 Typisierung | Die Form der API steht als TypeScript-Schnittstelle in `core/` (`EagleFlightControlApi`). Leser-Seite: Erweiterung des globalen `ModuleConfig` (`"eagleeye": { api: … }`) in `v13/module.ts`; der Vertrag enthält dieselbe Schnittstelle als kopierbaren Text für andere Repos. Die Zuweisung der `api` an das eigene Modul soll **ohne Cast** kompilieren. `game.modules.get` liefert je nach `active` eine Union (F2); ob der Compiler das Schreiben zulässt, zeigt erst der Typecheck. Erlaubter Rückfall ist **ein** enger, kommentierter Cast an dieser einen Stelle | Erweiterungspunkt existiert (F2); keine neue Dependency; E7 verlangt nur einen lesbaren, versionierten Vertrag | Eigenes Typpaket veröffentlichen (neues öffentliches Ziel, freigabepflichtig, nicht Teil dieser Phase); `RequiredModules` für das eigene Modul (würde den Cast sparen, erklärt aber global "immer vorhanden" und irritiert beim Kopieren in andere Repos, weil Flight Control dort fehlen kann, U2) |

### 3. Schnittstellen (nur Signaturen)

```ts
// core/api-version.ts
export const EAGLE_API_VERSION = "0.1.0";
export interface ParsedVersion { major: number; minor: number; patch: number }
export function parseVersion(input: unknown): ParsedVersion | undefined;          // strikt x.y.z, ohne Präfix/Zusatz/führende Nullen
export function compareVersions(a: ParsedVersion, b: ParsedVersion): -1 | 0 | 1;
export function isApiCompatible(requested: ParsedVersion, provided: ParsedVersion): boolean;

// core/module-registry.ts
export interface ModuleDescriptor { id: string; apiVersion: string }              // Zusatzfelder werden ignoriert
export interface ModuleInfo { id: string; title: string; version: string; active: boolean }
export interface ModuleInfoSource { get(id: string): ModuleInfo | undefined }
export interface RegisteredModule { readonly id: string; readonly title: string; readonly version: string; readonly apiVersion: string }
export type RegistrationFailure =
  | "invalid-descriptor" | "invalid-api-version" | "unknown-module" | "inactive-module"
  | "already-registered" | "incompatible-api-version" | "internal-error";
export type RegistrationResult =
  | { readonly ok: true; readonly module: RegisteredModule }
  | { readonly ok: false; readonly reason: RegistrationFailure; readonly detail: string };
export class ModuleRegistry {
  constructor(source: ModuleInfoSource, provided: string);                        // provided = API-Version von Flight Control
  readonly apiVersion: string;
  registerModule(descriptor: unknown): RegistrationResult;
  list(): RegisteredModule[];                                                     // angemeldet UND jetzt aktiv, in Anmeldereihenfolge
}
export function defaultModuleInfoSource(): ModuleInfoSource;                      // Adapter auf game.modules (K1/K2)

// core/eagle-api.ts
export interface EagleFlightControlApi { readonly version: string; registerModule(descriptor: unknown): RegistrationResult }
export interface ApiLogger { info(message: string): void; warn(message: string): void }
export function createEagleApi(registry: ModuleRegistry, log?: ApiLogger): Readonly<EagleFlightControlApi>;  // eingefroren, genau diese zwei Eigenschaften
```

`internal-error` wird nur von `createEagleApi` erzeugt (Fangnetz um `registerModule`); die Registry selbst
gibt die übrigen sechs Gründe zurück.

### 4. Ablauf über die Zeit

```
Foundry lädt Module (Reihenfolge nicht belegt, U1)
 |-- init   Flight Control: legt ModuleRegistry + API an, setzt game.modules.get("eagleeye").api   [synchron]
 |          Dummy/Eagle Modul (falls es im init etwas tut): darf die api NICHT voraussetzen
 |-- setup  jedes Eagle Modul: api = game.modules.get("eagleeye")?.api
 |                             api?.registerModule({ id, apiVersion })  -> Ergebnis prüfen, bei Fehler eigene Funktionen aus
 |-- ready  (M3) Hub liest registry.list() beim Öffnen: nur angemeldete, jetzt aktive Module
```

### 5. Zielbild der Dateien

```
core/
  api-version.ts + .test.ts        neu   Version parsen, vergleichen, Kompatibilitätsregel
  module-registry.ts + .test.ts    neu   Anmelde-Register, Adapter auf game.modules
  eagle-api.ts + .test.ts          neu   öffentliche API-Fläche (eingefroren), Logging, Fangnetz
  manifest-scanner.ts, settings-hub.ts   unverändert (weiterhin nicht verdrahtet)
v13/
  module.ts                        init: Registry + API anlegen, anhängen, Startlog; ModuleConfig-Erweiterung
test-fixtures/
  eagleeye-dummy-a/                registriert kompatibel (apiVersion 0.1.0), requires eagleeye
  eagleeye-dummy-b/                unverändert (meldet sich nicht an)
  eagleeye-dummy-c/                neu: registriert mit inkompatibler apiVersion (9.0.0), requires eagleeye
docs/
  api-contract.md                  neu   API-Vertrag Teil 1 (Sprache: Antwort auf T1)
```

Logging: `createEagleApi` schreibt bei Erfolg `eagleeye | registered module <id> (api <apiVersion>)` (info) und bei
Ablehnung `eagleeye | registration rejected for <id|?>: <reason> - <detail>` (warn); der Logger ist injizierbar,
Standard ist die Konsole. Die Hülle in `v13/module.ts` schreibt beim Anhängen `eagleeye | API attached (v0.1.0)`
und bei Fehlschlag des Anhängens `console.error` mit der Ursache.

### 6. Testplan (Vitest, reine Logik; alle neuen Tests)

| # | Datei | Fall |
|---|---|---|
| T1 | api-version | `parseVersion` akzeptiert `0.1.0`, `1.20.3` und liefert Zahlen |
| T2 | api-version | `parseVersion` lehnt ab: `""`, `"1"`, `"1.2"`, `"1.2.3-beta"`, `"v1.2.3"`, `"01.2.3"`, `"a.b.c"`, die Zahl `1`, `null`, `undefined` |
| T3 | api-version | `compareVersions` ordnet numerisch (`1.10.0 > 1.9.0`, gleich, Patch) |
| T4 | api-version | Major ≥ 1: `provided` mit neuerer Minor/Patch, gleicher Major → kompatibel |
| T5 | api-version | `provided` älter als `requested` → inkompatibel |
| T6 | api-version | verschiedene Major-Versionen → inkompatibel (beide Richtungen) |
| T7 | api-version | Major 0: gleiche Minor nötig (`0.1.5` für `0.1.0` ja; `0.2.0` gegen `0.1.x` und umgekehrt nein) |
| T8 | module-registry | erfolgreiche Anmeldung liefert `{ ok: true, module }` mit Titel/Version aus der Quelle |
| T9 | module-registry | zweite Anmeldung derselben `id` → `already-registered`; die erste bleibt unverändert |
| T10 | module-registry | unbekannte `id` → `unknown-module`, nichts gespeichert |
| T11 | module-registry | inaktives Modul → `inactive-module`, nichts gespeichert |
| T12 | module-registry | ungültige Beschreiber (`null`, `undefined`, String, `{}`, leere `id`, `id` als Zahl, ohne `apiVersion`, `apiVersion` als Zahl) → `invalid-descriptor` |
| T13 | module-registry | `apiVersion` in falscher Form (`"1.2"`, `"latest"`) → `invalid-api-version` |
| T14 | module-registry | inkompatible `apiVersion` (`9.0.0`; `0.2.0` gegen `0.1.0`) → `incompatible-api-version`, nichts gespeichert; eine spätere kompatible Anmeldung derselben `id` gelingt |
| T15 | module-registry | `list()` in Anmeldereihenfolge und nur Module, die **jetzt** aktiv sind (Aktivstatus der Attrappe umschalten); Rückgabe ist eine Kopie |
| T16 | module-registry | Zusatzfelder im Beschreiber werden ignoriert |
| T17 | module-registry | `defaultModuleInfoSource()` adaptiert die echte Form von `game.modules` (Collection-artiges `get`); fehlendes Modul → `undefined` (Adapter-Regressionstest, K2) |
| T18 | eagle-api | die API ist eingefroren und hat genau `version` und `registerModule` |
| T19 | eagle-api | `version` entspricht der API-Version der Registry |
| T20 | eagle-api | Erfolg wird einmal per `info` geloggt, Ablehnung per `warn` mit Grund; Ergebnisse werden unverändert durchgereicht |
| T21 | eagle-api | wirft die Quelle einen Fehler, gibt `registerModule` `{ ok: false, reason: "internal-error" }` zurück, warnt und wirft nicht |

Erwartet: 5 Testdateien mit 26 Tests (5 bestehende unverändert, 21 neu).

### 7. Dummy-Module (Test-Fixtures, klassische Skripte, ohne Build)

- **a:** behält die bestehende Einstellung; ergänzt `relationships.requires` auf `eagleeye`
  (`compatibility.minimum: "0.0.1"`) und im `setup` den Aufruf
  `api?.registerModule({ id: "eagleeye-dummy-a", apiVersion: "0.1.0" })` samt Ausgabe des Ergebnisses; `api`
  fehlt → Warnung, kein Fehler.
- **b:** unverändert; dient als "meldet sich nicht an".
- **c:** neu; wie a, aber `apiVersion: "9.0.0"`; erwartet Ablehnung `incompatible-api-version`.
- Ihre `description` nennt statt "M4 (Settings-Hub-Proof)" den neuen Zweck. Nutzung im Live-Test nur nach
  Freigabe.

### 8. Gliederung `docs/api-contract.md` (Teil 1)

Zweck und Geltungsbereich (nur Eagle Module); API erreichen und Zeitpunkt (`setup`, Feature-Erkennung,
Typerweiterung als Textblock); `registerModule` mit Beschreiber, Ergebnis und allen sieben Fehlercodes;
API-Versionsregel (`0.x`: gleiche Minor); Manifest-Anforderungen an Eagle Module (`relationships.requires` auf
`eagleeye` mit `compatibility.minimum` als Flight-Control-**Modulversion**, ab der die benutzte API-Version geliefert
wird; der Vertrag führt die Zuordnung Modulversion ↔ API-Version als Tabelle; ob Foundry die Spanne erzwingt, ist
`unverified`, U3); Verhalten bei fehlender oder deaktivierter Flight Control (Aufrufer prüft `api`, U2
`unverified`); ausdrücklich `unverified`: U1–U3, U5; Änderungshistorie des Vertrags ab `0.1.0`.

### 9. Übergaben

- **M3:** Der Hub liest `registry.list()`; das ist zugleich der **Eagle-Filter** für `core/settings-hub.ts` und
  `core/manifest-scanner.ts`. Die Hülle braucht dafür Zugriff auf die Registry (Ablage legt M3 fest). Neue,
  optionale Beschreiber-Felder (Tab, Start-Aktion) erhöhen die API-Version; bis 1.0 bricht "Minor", die Dummy-Module
  ziehen ihre `apiVersion` dann nach.
- **M4:** Das Ergebnismuster `{ ok, reason, detail }` mit stabilen Codes gilt auch für Anfragen.
- **M5/M6:** Die angemeldete Modul-`id` ist der Schlüssel für Nutzungsrechte je Modul und Nutzer.
- **M7:** Der Versionswächter ist getrennt von der API-Version (Systemversion, nicht Vertragsversion).
- **M8:** API-Versionspolitik (wann `1.0.0`), Bereitstellung der Typen für andere Repos, Konsolidierung
  des Vertrags.

### 10. Deploy-Reihenfolge (Plan, ohne Code)

1. `core/api-version.ts` und Test (T1–T7)
2. `core/module-registry.ts` und Test (T8–T17)
3. `core/eagle-api.ts` und Test (T18–T21)
4. `v13/module.ts` verdrahten, Typerweiterung
5. Dummy-Module a (ändern) und c (neu)
6. `docs/api-contract.md`
7. Prüfen: **einmal** `typecheck`, `test`, `build`; Syntaxprüfung der Fixtures (JSON parsen, `node --check`);
   Suchprüfungen; `git status` und `git diff --stat`
8. Deploy-Output; kein Commit ohne Anweisung, kein Live-Test

---

## Acceptance Criteria

```
AC-M2-01: core/api-version.ts exportiert EAGLE_API_VERSION = "0.1.0", parseVersion, compareVersions, isApiCompatible; die Tests T1-T7 bestehen.
AC-M2-02: core/module-registry.ts exportiert ModuleRegistry (registerModule, list, apiVersion), die Typen aus Abschnitt 3 und defaultModuleInfoSource; die Tests T8-T17 bestehen.
AC-M2-03: core/eagle-api.ts exportiert createEagleApi; das Ergebnis ist eingefroren und hat genau version und registerModule; registerModule wirft nie; die Tests T18-T21 bestehen.
AC-M2-04: v13/module.ts legt im synchronen Teil des init-Callbacks Registry und API an, hängt die API an game.modules.get("eagleeye") und loggt "eagleeye | API attached (v0.1.0)"; kein ready-Hook, keine weitere Logik.
AC-M2-05: game.modules.get("eagleeye")?.api ist über das globale ModuleConfig typisiert; die Zuweisung der API im Modul enthält höchstens einen kommentierten Cast; npm run typecheck endet mit Exit 0.
AC-M2-06: npm test endet mit Exit 0 und meldet 5 Testdateien und 26 Tests, alle bestanden; die 5 bestehenden Tests sind unverändert.
AC-M2-07: npm run build endet mit Exit 0; das Bundle enthält "registerModule" und "0.1.0" und kein "libWrapper".
AC-M2-08: docs/api-contract.md deckt alle Punkte aus Abschnitt 8 ab, nennt alle sieben Fehlercodes und kennzeichnet U1-U3 und U5 als unverified; Sprache laut Antwort auf T1.
AC-M2-09: eagleeye-dummy-a (registriert kompatibel, requires eagleeye) und eagleeye-dummy-c (inkompatible apiVersion) sind syntaktisch gültig (JSON parst, node --check der .js); eagleeye-dummy-b ist unverändert.
AC-M2-10: package.json, package-lock.json, core/manifest-scanner.ts, core/settings-hub.ts, v13/module.json und v13/tsconfig.json sind unverändert (git diff).
AC-M2-11: git status ohne dadm/ zeigt nur: core/ (neue Dateien), v13/module.ts, test-fixtures/, docs/; keine weiteren Dateien.
AC-M2-12 (unverified, nur nach ausdrücklicher Live-Freigabe): in Forge meldet a sich an, b nicht, c wird mit incompatible-api-version abgewiesen; die api ist am Modulobjekt erreichbar (U5); Ladereihenfolge (U1), deaktivierte Flight Control (U2), Erzwingen der Versionsspanne (U3) und nachträgliche Hook-Listener (U4) sind damit ggf. belegt.
```

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | **U5:** Das Zuweisen der `api` an das Modulobjekt ist in v13 nur durch Vorbild-Module belegt (V1), von uns nicht getestet. Verweigert Foundry das Setzen, fehlt die API, und M2 hätte keinen Anmeldeweg (Design-Änderung zurück in Apply). Abmilderung: Zuweisung in einem `try/catch` mit `console.error`; der Live-Test von a/b/c belegt es. Mit dem "Go" ausdrücklich angenommen. | `medium` | no |
| R2 | U1–U3 (Ladereihenfolge, deaktivierte Flight Control, Erzwingen der Versionsspanne) bleiben `unverified`. Das Design stützt sich auf keinen davon: Anmeldung erst ab `setup` (nicht auf Ladereihenfolge angewiesen), Aufrufer prüfen die `api`, die Versionsprüfung geschieht beim Anmelden. | `low` | no |
| R3 | E6-Lesart (Q3): Eine Selbstanmeldung fremder Module lässt sich nicht verhindern; sie wird im Vertrag ausgeschlossen. Nutzt jemand sie, gilt das Modul als angemeldet. Die Annahme ist mit dem "Go" zu bestätigen. | `low` | no |
| R4 | Regel "vor 1.0 bricht Minor": Jede Erweiterung der API-Version macht bereits geschriebene Module unverträglich, bis sie ihre `apiVersion` nachziehen. Vertretbar, solange alle Module eigen und in Entwicklung sind; Politik ab 1.0 entscheidet M8. | `low` | no |
| R5 | Der eigene Versions-Parser akzeptiert nur `x.y.z` (keine Vorabversionen, keine führenden Nullen). Der Vertrag schreibt das ausdrücklich vor. | `low` | no |
| R6 | Ob die Zuweisung der `api` ohne Cast kompiliert (F2: Union nach `active`), ist vor dem Typecheck nicht belegt. Falls nicht, gilt der Rückfall "ein enger, kommentierter Cast"; Konsumenten bekommen in jedem Fall die saubere Lese-Typisierung. | `low` | no |
| R7 | Die Dummy-Module sind Testhilfen für einen freigabepflichtigen Live-Test; ohne ihn bleibt AC-M2-12 offen. | `info` | no |
| A1 | **Annahme:** `setup` läuft nach allen `init`-Callbacks (Wortlaut F4: "finished initializing"); die synchrone Zuweisung im `init` ist dann vor jedem `setup` erledigt. | `low` | no |
| A2 | **Annahme:** `game.modules` ist im `init` befüllt (F3 ohne Stufen-Einschränkung; Custom D&D 5e nutzt es im `init`, V1). | `low` | no |
| A3 | **Annahme:** `Module#title`, `#version` und `#active` sind zur Laufzeit gesetzt (Phase-1-Code hat sie live für 94 Pakete gelesen). | `info` | no |

`medium` in R1 ist mit dem "Go" ausdrücklich anzunehmen (Governance: kein offener `medium+`-Fund ohne
Lösung oder ausdrückliche Annahme). Sonst kein `medium+`-Fund, kein Human-Decision-Trigger: keine
Dependency-Änderung, keine Cross-Milestone-Änderung (Tab-Inhalt und Start-Aktion bleiben bei M3).

---

## Open TBDs

Sie werden zusammen mit dem "Go" beantwortet; die Vorschläge gelten, solange nichts anderes genannt wird.

| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Sprache von `docs/api-contract.md` (Deutsch oder Englisch); Code-Kommentare und Bezeichner bleiben Englisch (K4) | important | Projektleiter |
| T2 | E6-Lesart bestätigen: Flight Control weist Anmeldungen nicht nach Herkunft ab (technisch nicht möglich), sondern schließt Fremdmodule im Vertrag aus (R3) | important | Projektleiter |
| T3 | Live-Prüfung: einmal gebündelt nach dem M2-Deploy (M1-Check AC-M1-12 plus AC-M2-12), später oder gar nicht; Vorschlag: gebündelt, da R1 an ihr hängt | important | Projektleiter |
| T4 | Aus dem M1-Monitor: die zwei Plan-Stellen nachführen (`EAGLE-MODULES-PLAN.md` Z. 103–105, `dadm/eagle-modules-projektplan.md` Z. 67), jetzt oder mit M8 (F1) | nice-to-have | Projektleiter |

---

## Next Step

Nach dem "Go" des Projektleiters: Deploy M2 — Reihenfolge Abschnitt 10, beginnend mit
`core/api-version.ts` und seinem Test.

# M7 — DnD-Versionswächter — Apply Output

```
artifact: apply-output
milestone: M7
phase: APPLY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Zielbild, Schnittstellen (nur Signaturen), Abläufe, Testplan, Akzeptanzkriterien und Sicherheitsbetrachtung. Kein Code. **Der Deploy wartet auf das "Go".** Was mit dem "Go" als angenommen gilt, steht am Ende (Punkte T1 bis T8; alle Risiken sind `low`).

---

## Input Summary

- `m7-01-discover-output.md` (Fakten FF18 bis FF22, Ökosystem, offen U1 bis U5, Risiken R1 bis R6, Fragen 1 bis 8), `04-milestone-plan-v2.md` (M7), `01-project-brief.md` (Ziel 5, E1), Übergaben aus `m2-02`, `m3-02` und `m6b-04`
- **Vorgabe:** Flight Control erkennt die Version des DnD-5e-Systems (`game.system.version`), kennt eine Liste getesteter Versionen, und das Verhalten bei nicht getesteter Version ist definiert. P-FC6 gilt nur im Umfang des Versionswächters (keine weitere Systemlogik).
- **Live belegt und genutzt:** Die Testwelt läuft mit dnd5e 5.3.3 auf Foundry v13, Build 351.

---

## Solution Design

### 1. Leitlinie

- **Ein Wächter, der meldet und nichts sperrt.** Er stellt fest, welches System läuft und ob es getestet ist, sagt es dem GM einmal und antwortet Modulen auf Nachfrage. Er blockiert **keine** Anfragen: Es gibt keinen Anfragetyp, der DnD-Daten braucht, und eine Sperre würde nach einer gewöhnlichen dnd5e-Aktualisierung alle Eagle Module lahmlegen (Discover R1).
- **Reine Logik in `core/`** mit eingespeister Systemquelle (K1 bis K4); die Foundry-Hülle liest nur `game.system.id` und `game.system.version`.
- **Fail closed heißt hier "unbekannt":** Was sich nicht lesen lässt, ergibt den Zustand `unknown`, nie eine Ausnahme und nie ein stilles "getestet".
- **Schmal:** eine Datei Logik, eine API-Funktion, ein Hinweis. Keine Systemlogik, keine Einstellung, keine Oberfläche im Hub.

### 2. Entscheidungen zu den offenen Fragen des Discover

| Frage | Entscheidung | Begründung |
|---|---|---|
| 1 Was heißt "getestet"? | **T1:** fünf Zustände. Ist die Kennung nicht lesbar: `unknown`. Ist sie nicht `dnd5e`: `other-system`. Ist die Version nicht streng `x.y.z`: `unknown`. Steht die Version in der Liste: `tested`. Stimmen nur Haupt- und Nebenversion mit einer gelisteten überein: `same-line`. Sonst `untested`. | Die Liste bleibt eine Liste **getesteter Versionen** (Vorgabe). `same-line` (etwa 5.3.4 bei gelisteter 5.3.3) ist eine ehrliche Zwischenstufe: nicht getestet, aber auf der getesteten Linie; andere Module ziehen ihre Grenze an der Nebenversion (Midi-QOL "5.3.99"). Sie vermeidet, dass jede Patch-Ausgabe von dnd5e einen Hinweis auslöst (Discover R2). |
| 2 Form und Ort der Liste | **T2:** eine Konstante im Code (`TESTED_SYSTEM_VERSIONS`, heute `["5.3.3"]`) und die Kennung `SUPPORTED_SYSTEM_ID = "dnd5e"`, beide in `core/system-guard.ts`. Ergänzt wird sie mit einem Release, nachdem der Projektleiter die Version live geprüft hat. | Die Liste ist Wissen des Releases, keine Einstellung des GM; eine Einstellung würde dem GM erlauben, sich selbst zu beruhigen. Ein Test hält sie streng und ohne Doppelte. |
| 3 Reaktion je Zustand | **T3:** Immer **eine Zeile im Log** (`eagleeye \| game system: dnd5e 5.3.3 (tested)`; bei den drei Warnzuständen als Warnung). **Ein Hinweis** (`ui.notifications.warn`) **einmal je Sitzung nur für Nutzer mit GM-Rolle** (GM, Assistent) bei `untested`, `other-system` und `unknown`; bei `tested` und `same-line` keiner. **Keine Sperre** von Anfragen. | Ein Spieler kann nichts tun, der GM schon. Ein Hinweis pro Sitzung stört nicht. Eine Sperre hätte heute nichts zu schützen (R1). Ein künftiger Anfragetyp, der das DnD-Datenmodell braucht, legt im Apply seines Milestones fest, welche Zustände er annimmt (Regel im Vertrag Teil 7). |
| 4 Abfrage durch Module | **T4:** `api.getSystemInfo()`: lokal, ohne Recht, nie eine Ausnahme, wertet bei **jedem Aufruf** neu aus. Ergebnis wie bei `getRights`: `{ ok: true, value: { id, version, status, testedVersions } }` oder `{ ok: false, reason: "internal-error", detail }`. API `0.7.0`. | Ein Modul kann seine Oberfläche danach ausrichten, ohne auf `not-permitted` zu stoßen. Systemkennung und -version sieht jeder Nutzer der Welt ohnehin (Discover R6), also gibt es nichts zu schützen. |
| 5 Anzeige im Hub | **T5:** keine Zeile im Hub in M7. Ein Kopf im Hub bleibt möglich, wenn der Projektleiter ihn will (M3-Übergabe). | Die Erzeugung der Oberfläche ist nur live prüfbar; der Hinweis und die Abfrage genügen für das Ziel. |
| 6 Manifest | **T6:** kein `relationships.systems` in `v13/module.json` in M7; Übergabe an M8 (Paketieren). | Nach FF21 liefert Foundrys Prüfung `false`, wenn kein angegebenes System installiert ist; das kann das Modul dort als nicht verfügbar einstufen (nicht live geprüft). Das ist eine Entscheidung zum Paketieren und braucht einen eigenen Live-Test. Der Wächter ist Laufzeitinformation, Foundrys Angabe eine grobe Spanne. |
| 7 Zeitpunkt | **T7:** Flight Control bekommt einen **`ready`-Hook** (bisher nur `init`); dort wird gemeldet. `getSystemInfo` liest bei jedem Aufruf; der Vertrag sagt "ab `ready`" (wie bei `getRights`). | `game.system` ist nach `ready` garantiert gefüllt (Phase-1-Kommentar, U3); `ui.notifications` gibt es dann. |
| 8 Live-Prüfung | **T8:** Standardpaket (Zustand `tested`) und **drei Prüfpakete**, in denen nur eine Zeichenkette des gebauten Bundles geändert ist (Liste oder Kennung), sodass die Testwelt `same-line`, `untested` und `other-system` zeigt. Der Zustand `unknown` ist nur durch Tests und Simulation belegt. Die Prüfpakete sind gitignoriert und im Deploy-Output als Abweichung vom Repo-Stand benannt. | So lassen sich die Reaktionen doch im echten Foundry zeigen, ohne die dnd5e-Version der Testwelt zu ändern (Discover U5). Das Zeigen ist optional; der Plan nimmt `unverified` an. |
| Umfang (R5) | Keine Systemlogik über den Wächter hinaus. | P-FC6 nur Versionswächter. |

### 3. Schnittstellen (nur Signaturen)

```ts
// core/system-guard.ts (neu)
const SUPPORTED_SYSTEM_ID = "dnd5e";
const TESTED_SYSTEM_VERSIONS: readonly string[];               // ["5.3.3"]
type SystemStatus = "tested" | "same-line" | "untested" | "other-system" | "unknown";
interface SystemInfo {
  readonly id: string | null;                                   // null: nicht lesbar
  readonly version: string | null;                              // null: nicht lesbar oder nicht gebraucht
  readonly status: SystemStatus;
  readonly testedVersions: readonly string[];
}
interface SystemSource { id(): unknown; version(): unknown }   // roh; darf werfen
function evaluateSystem(source: SystemSource, tested?: readonly string[], supportedId?: string): SystemInfo  // wirft nie
interface SystemNotice { readonly key: string; readonly data: Record<string, string> }
function noticeFor(info: SystemInfo): SystemNotice | undefined  // nur für untested, other-system, unknown
interface AnnounceEnvironment {
  isGm(): boolean;
  log: { info(message: string): void; warn(message: string): void };
  notify(level: "warn", message: string): void;
  text(key: string, data?: Record<string, string>): string;
}
function announceSystem(source: SystemSource, environment: AnnounceEnvironment): SystemInfo  // wirft nie

// core/eagle-api.ts (erweitert)
type SystemInfoResult = { ok: true; value: SystemInfo } | { ok: false; reason: "internal-error"; detail: string }
interface EagleFlightControlApi { /* version, registerModule, request, getRights */ getSystemInfo(): SystemInfoResult }
// createEagleApi(registry, log, kernel, rights, systemInfo?: () => SystemInfo)

// v13/system.ts (neu, dünne Hülle)
function foundrySystemSource(): SystemSource      // game.system?.id, game.system?.version
```

### 4. Ablauf

**Auswertung** (`evaluateSystem`, in dieser Reihenfolge, jede Ausnahme wird zu `unknown`):
1. Die Kennung ist kein nicht leerer Text: `unknown` (`id` und `version` `null`).
2. Die Kennung ist nicht `dnd5e`: `other-system` (die Kennung wird gemeldet, die Version nicht gebraucht).
3. Die Version ist kein Text im strengen Format `x.y.z` (auch `"0"`, `""`, `"5.3"`, `"5.3.3-rc.1"`, `"v5.3.3"`): `unknown` (die Kennung bleibt gemeldet).
4. Steht die Version (als Text) in der Liste: `tested`.
5. Hat eine gelistete Version dieselbe Haupt- und Nebenversion: `same-line`.
6. Sonst `untested`.

**Meldung** (`announceSystem`, einmal im `ready`-Hook): auswerten; eine Log-Zeile (`info` bei `tested` und `same-line`, `warn` sonst); bei `untested`, `other-system` und `unknown` und einer GM-Rolle **ein** Hinweis mit dem übersetzten Text. Jede Ausnahme in Quelle, Log oder Hinweis wird geschluckt; der Hook bricht nie ab.

**Abfrage** (`getSystemInfo`): `evaluateSystem` mit der Systemquelle dieses Clients; das Ergebnis ist ein Objekt, kein Zwischenspeicher.

**Hinweistexte** (Englisch, `v13/lang/en.json`): `EAGLEEYE.system.untested` ("Eagle Flight Control has not been tested with D&D 5e {version}. Tested: {tested}. Eagle modules may not work as expected."), `EAGLEEYE.system.otherSystem` ("Eagle Flight Control is made for D&D 5e, but this world uses the system \"{id}\". Eagle modules may not work as expected."), `EAGLEEYE.system.unknown` ("Eagle Flight Control could not read the version of the game system. Eagle modules may not work as expected.").

### 5. Zielbild der Dateien

| Datei | Änderung |
|---|---|
| `core/system-guard.ts` (+ `.test.ts`) | **neu** (reine Logik) |
| `core/eagle-api.ts`, `core/api-version.ts` | `getSystemInfo`; Version `0.7.0` |
| `v13/system.ts` | **neu** (Systemquelle für Foundry) |
| `v13/module.ts` | `ready`-Hook mit `announceSystem`; `getSystemInfo` verdrahtet |
| `v13/lang/en.json` | die drei Hinweistexte |
| `test-fixtures/eagleeye-dummy-a` und `-d` | API `0.7.0`; Dummy a gibt `system: <Zustand> <Version>` aus |
| `docs/api-contract.md` | Teil 7 (Unterabschnitt am Ende von Abschnitt 4, **ohne Umnummerierung**: frühere Dokumente verweisen auf Abschnitt 8), Historie, "Not part of this version", Abschnitt 8 |

`core/request-kernel.ts`, `core/request-relay.ts`, `core/request-rights.ts`, `core/rights-*.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/hub-model.ts`, `v13/hub-application.ts`, `v13/relay.ts`, `v13/rights.ts`, `package.json` und die Lock-Datei bleiben unverändert.

### 6. Testplan (Vitest; jeder Fall genau ein `it`, Tabellenfälle laufen als Schleife im Test)

| # | Prüfung | Datei |
|---|---|---|
| P1 | `evaluateSystem` bei lesbarem dnd5e: gelistete Version `tested`; gleiche Haupt- und Nebenversion `same-line` (auch niedriger und höher als die gelistete); andere Nebenversion, andere Hauptversion, zweistellige Zahlen (5.10.0 gegen 5.3.3) `untested` | `system-guard.test.ts` |
| P2 | `evaluateSystem`: eine lesbare Kennung, die nicht `dnd5e` ist (auch `dnd5e-custom`, `DND5E`, mit Leerzeichen), ergibt `other-system` und meldet die Kennung; die Version bleibt unbeachtet | dito |
| P3 | `evaluateSystem`: `unknown` bei fehlender, leerer oder nicht als Text gegebener Kennung; bei dnd5e mit fehlender, leerer, nicht als Text gegebener Version, `"0"`, `"5.3"`, `"5.3.3-rc.1"`, `"v5.3.3"`, `"05.3.3"`; wirft die Quelle, ist es `unknown` und kein Fehler | dito |
| P4 | Die Konstanten: `TESTED_SYSTEM_VERSIONS` ist nicht leer, jeder Eintrag streng `x.y.z`, keine Doppelten, enthält die Version der Testwelt; `SUPPORTED_SYSTEM_ID` ist `dnd5e`; eine eigene Liste und Kennung als Argument gelten statt der Konstanten | dito |
| P5 | `noticeFor`: keiner bei `tested` und `same-line`; bei `untested` Schlüssel und Daten mit Version und Liste, bei `other-system` mit Kennung, bei `unknown` ohne Daten | dito |
| P6 | `announceSystem`: eine Log-Zeile je Aufruf (`info` bei `tested` und `same-line`, `warn` sonst); der Hinweis nur mit GM-Rolle und nur bei den drei Warnzuständen (übersetzt); nie für einen Spieler; werfen Quelle, Log, Hinweis oder Text, wirft die Funktion nicht und gibt das Ergebnis zurück (zwei Tests) | dito |
| P7 | `getSystemInfo`: liefert `{ ok: true, value }` mit dem Wert der eingespeisten Funktion, wertet bei jedem Aufruf neu aus; wirft sie, ist es `internal-error` mit Warnung im Log; ohne eingespeiste Funktion `unknown`; der Test der API-Oberfläche nennt fünf Mitglieder (drei Tests, einer angepasst) | `eagle-api.test.ts` |
| P8 | `EAGLE_API_VERSION` ist `0.7.0` | `api-version.test.ts` |
| P9 | Sprachschlüssel: der bestehende Test findet die drei neuen Schlüssel in `v13/lang/en.json` | `lang-keys.test.ts` |

Erwartet: 9 bis 10 neue Tests, insgesamt etwa 136 in 16 Dateien (P7 und P8 ändern bestehende Tests).

**Weitere Prüfungen im Deploy:** einmal `typecheck`, `test`, `build`; Skriptprüfung Vertrag gegen Code (Konstanten, Zustände, Version, Hinweistexte, API-Mitglieder); Suche nach verbotenen Mustern; Gegenproben für jede Regel (Reihenfolge der Auswertung, Nebenversion, Kennung, Format, GM-Rolle, einmaliger Hinweis, Fehlerfälle); Zwei-Client-Simulation mit dem echten Bundle für alle vier Zustände (dieselben Zeichenketten-Änderungen wie in den Prüfpaketen) und für die Nachbildung von `ui.notifications`; Zeitstempelvergleich der Pakete.

### 7. Testmodule und Live-Check (Anleitung im Monitor)

- **Dummy a und d:** API `0.7.0`; Dummy a gibt `system: <Zustand> <Version>` aus (`getSystemInfo`).
- **Standardpaket (`eagleeye-v13-m7.zip`):** in der Testwelt erwartet `game.system.id` `dnd5e`, `game.system.version` `5.3.3`, Log-Zeile `game system: dnd5e 5.3.3 (tested)`, **kein Hinweis**, `getSystemInfo()` mit `status` `tested`.
- **Prüfpakete (optional, gitignoriert, nur eine Zeichenkette im Bundle geändert):** (a) Liste `["5.3.2"]`: `same-line`, kein Hinweis; (b) Liste `["5.2.0"]`: `untested`, **ein Hinweis beim GM**, keiner beim Spieler; (c) Kennung `"pf2e"`: `other-system`, ein Hinweis beim GM. Jedes wird einzeln über das Standardpaket installiert und die Welt neu geladen.
- **Konsole:** `game.system.id`, `game.system.version` und `game.modules.get("eagleeye").api.getSystemInfo()` (klärt Discover U1 bis U4).

### 8. API-Vertrag Teil 7 (Änderungen an `docs/api-contract.md`, Englisch)

Neuer Unterabschnitt "The game system" am Ende von Abschnitt 4: was der Wächter tut und was nicht (er sperrt nichts); die fünf Zustände mit den Regeln der Auswertung; die Liste getesteter Versionen und wie sie wächst; der Hinweis für den GM; `getSystemInfo` (Signatur, Ergebnis, Fehler, Aufruf ab `ready`); die Regel für künftige Anfragetypen, die das DnD-Datenmodell brauchen (im Apply ihres Milestones festlegen, welche Zustände sie annehmen). Der Kopf und "Not part of this version" (Abschnitt 9) werden angepasst, die Historie um `0.7.0` ergänzt, Abschnitt 8 nach dem Live-Check nachgeführt.

### 9. Sicherheitsbetrachtung

| # | Bedrohung | Maßnahme im Design | Rest |
|---|---|---|---|
| S1 | Ein Modul oder Nutzer verfälscht die Systemangabe | Der Wächter liest `game.system` im eigenen Client; ein veränderter Client kann sich nur selbst täuschen, andere Clients und der GM lesen ihr eigenes System | keiner (Information, kein Recht) |
| S2 | Der Wächter sperrt einen Nutzer aus | Er sperrt nichts | keiner |
| S3 | Ein unlesbares System führt zum Absturz | `evaluateSystem` und `announceSystem` werfen nie; `unknown` statt Ausnahme; der Hook schluckt Fehler | keiner |
| S4 | Ein Hinweis verrät etwas | Er nennt Systemkennung, Version und die Liste; alles ist für jeden Nutzer der Welt sichtbar | keiner |
| S5 | Eine falsche Zustandsangabe ("getestet" bei nicht Gelesenem) | Nur ein streng gelesenes `x.y.z` aus der Liste ergibt `tested`; alles Unklare `unknown` | keiner |

**Bewertung für die Governance:** kein Security- oder Datenschutz-Fund, keine Dependency-Änderung, keine Cross-Milestone-Änderung (kein Code aus M1 bis M6b wird berührt außer `core/eagle-api.ts` und `core/api-version.ts`, die der Plan für Vertragsteile vorsieht).

### 10. Übergaben

- **Künftige Anfragetypen, die das DnD-Datenmodell brauchen:** im Apply ihres Milestones festlegen, welche Zustände sie annehmen (`tested`, `same-line`, weitere) und was bei den übrigen geschieht; der Wächter selbst sperrt nichts.
- **M8:** Vertrag zusammenführen (Teile 1 bis 7, Abschnitte umnummerieren, Verweise in älteren Dokumenten beachten); Paketieren mit `lang/`; **`relationships.systems` mit einer `compatibility`-Spanne im Manifest prüfen** (T6); die Liste getesteter Versionen beim Release pflegen; Ratenbegrenzung und Diagnosezeile aus M5 (offene Punkte aus M5 und M6a); T3 und T4 (Plan-Stellen und Root-README).
- **Hub-Kopf:** Wenn der Projektleiter die Systemzeile im Hub will, ist es eine kleine Nacharbeit (T5).

### 11. Deploy-Reihenfolge (Plan, ohne Code)

1. `core/system-guard.ts` mit P1 bis P6
2. `core/api-version.ts` (P8), `core/eagle-api.ts` (`getSystemInfo`, P7)
3. `v13/system.ts`, `v13/module.ts` (`ready`-Hook, Verdrahtung), `v13/lang/en.json` (P9)
4. Testmodule a und d
5. `docs/api-contract.md` (Teil 7)
6. Prüfen wie oben; Standardpaket und drei Prüfpakete bauen; Deploy-Output; kein Commit ohne Anweisung, kein Live-Test durch mich

---

## Acceptance Criteria

```
AC-M7-01: core/system-guard.ts wertet nach Abschnitt 4 aus: nicht lesbare Kennung unknown, fremde Kennung other-system, nicht streng x.y.z unknown, gelistete Version tested, gleiche Haupt- und Nebenversion same-line, sonst untested; es wirft nie (P1 bis P4).
AC-M7-02: noticeFor und announceSystem: höchstens ein Hinweis, nur für eine GM-Rolle, nur bei untested, other-system und unknown; immer eine Log-Zeile; nie eine Ausnahme; keine Anfrage wird gesperrt (P5, P6).
AC-M7-03: api.getSystemInfo() liefert { ok: true, value: { id, version, status, testedVersions } } bei jedem Aufruf neu, internal-error bei einem Fehler, unknown ohne Quelle; die API hat genau version, registerModule, request, getRights und getSystemInfo; Version 0.7.0 (P7, P8).
AC-M7-04: v13/module.ts registriert einen ready-Hook, der announceSystem mit der Systemquelle des Clients aufruft, und verdrahtet getSystemInfo; die drei Hinweistexte stehen in v13/lang/en.json; typecheck endet mit Exit 0 (P9).
AC-M7-05: docs/api-contract.md hat Teil 7 (Englisch) nach Abschnitt 8 dieses Apply-Dokuments, ohne Umnummerierung; Kopf, "Not part", Historie sind angepasst; ein Skript prüft Konstanten, Zustände, Hinweistexte und API-Mitglieder gegen den Code.
AC-M7-06: Alle Tests bestehen; core/request-*, core/rights-*, v13/hub-application.ts, v13/relay.ts, v13/rights.ts, package.json und Lock-Datei sind unverändert; das Bundle enthält weder innerHTML noch libWrapper, socketlib oder game.socket; keine neue Dependency.
AC-M7-07 (unverified, Live-Check): in der Testwelt game.system.id "dnd5e" und game.system.version "5.3.3"; Standardpaket: Log-Zeile "(tested)", kein Hinweis, getSystemInfo status tested. Prüfpakete (optional): same-line ohne Hinweis; untested und other-system mit einem Hinweis beim GM und keinem beim Spieler.
```

---

## Risks and Assumptions

| # | Risiko oder Annahme | Severity | Blocking |
|---|---|---|---|
| R1 | Zu strenge Reaktion: durch das Design ausgeschlossen (nichts wird gesperrt). | erledigt | no |
| R2 | Zu grober Maßstab: `same-line` ist "nicht getestet, aber auf der getesteten Linie" und löst keinen Hinweis aus; ein Patch kann dennoch etwas brechen. Module lesen den Zustand und dürfen strenger sein. | `low` | no |
| R3 | Ein Vorabformat der Version (`5.4.0-rc.1`) ergibt `unknown` und damit einen Hinweis, obwohl das System lesbar ist. | `low` | no |
| R4 | Die Reaktion ist nur mit gepatchten Prüfpaketen live zu zeigen; `unknown` nur mit Tests und Simulation. Laut Plan `unverified` angenommen. | `low` | no |
| R5 | Der neue `ready`-Hook ist der erste von Flight Control; die Reihenfolge zu anderen `ready`-Hooks ist ohne Bedeutung, weil die Abfrage bei jedem Aufruf neu liest. | `low` | no |
| A1 | **Annahme:** `game.system.id` ist `dnd5e` (U1), und `game.system.version` ist zur Zeit von `ready` gefüllt und hat die Form `x.y.z` (U2, U3); der Live-Check zeigt es. | `low` | no |

Kein `medium`- oder `high`-Fund, keine Human-Decision-Trigger.

---

## Open TBDs (mit Vorschlag; mit dem "Go" als angenommen)

| # | Punkt | Vorschlag |
|---|---|---|
| T1 | Zustände | `tested`, `same-line`, `untested`, `other-system`, `unknown` (Regeln in Abschnitt 4). Alternative: vier Zustände ohne `same-line`; dann löst jede Patch-Ausgabe einen Hinweis aus. |
| T2 | Liste | Konstante im Code (`["5.3.3"]`), mit dem Release nach einem Live-Test ergänzt; keine Einstellung |
| T3 | Reaktion | Log-Zeile immer; ein Hinweis je Sitzung nur für eine GM-Rolle bei `untested`, `other-system`, `unknown`; **keine Sperre von Anfragen** |
| T4 | Abfrage | `api.getSystemInfo()` (lokal, ohne Recht, `{ ok, value }`), API `0.7.0` |
| T5 | Hub | keine Systemzeile im Hub in M7 |
| T6 | Manifest | kein `relationships.systems` in M7 (Übergabe an M8) |
| T7 | Zeitpunkt | neuer `ready`-Hook für die Meldung; die Abfrage liest bei jedem Aufruf |
| T8 | Live-Prüfung | Standardpaket plus drei optionale Prüfpakete mit einer geänderten Zeichenkette |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m7-02-apply-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

**Stopp für das "Go" des Projektleiters** (Working Mode). Mit dem "Go" gelten T1 bis T8 wie vorgeschlagen (alle Risiken `low`). Danach der Deploy in der Reihenfolge aus Abschnitt 11, dann der Monitor ohne Stopp mit der Anleitung für den Live-Check.

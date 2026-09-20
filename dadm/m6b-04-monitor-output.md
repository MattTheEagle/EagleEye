# M6b — Nutzungsrechte je Modul und Nutzer — Monitor Output

```
artifact: monitor-output
milestone: M6b
phase: MONITOR
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m6b-03-deploy-output.md` (Implementierung, Nachweise, Acceptance, Klärungen), `m6b-02-apply-output.md` (Design, Übergaben), `m6b-01-discover-output.md`, `m3-rework-3-output.md`, `m6a-05-live-check-output.md` (Ausgangslage)
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: die 126 Tests gegen den Stand von M6a (die Tests aus M1 bis M6a sind bis auf drei angepasste Fälle unverändert), die Zwei-Client-Simulation einschließlich des Angriffs aus M6a (gefälschte Angabe eines erlaubten Nutzers), die Live-Check-Pakete

---

## Validation Result

**M6b hat sein Ziel erreicht, soweit es ohne Forge prüfbar ist.** Ein Spieler darf ein Modul nur nutzen, wenn der GM es im Hub freigegeben hat; die Stufe `own` beschränkt auf Ziele, die dem Nutzer nach Foundry gehören; beim GM ist die Prüfung bindend, im eigenen Client eine umgehbare Regel; jeder Zweifel ist ein Nein.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M6b-01 bis AC-M6b-10 | erfüllt (Belege im Deploy-Output) |
| AC-M6b-11 (Live: Freigabe, `targetping` eigen und fremd, Sperren, F5, `getRights`) | **unverified**, Live-Check unten |
| AC-M6b-12 (Live: Rechte-Block und Tab ohne Titel; Assistent sieht den Block nicht) | **unverified**, Live-Check unten |
| Regression M6a | Das Relais (`core/request-relay.ts`) und die Identität (`core/request-identity.ts`) sind unverändert; die Simulation zeigt die Fälschung eines erlaubten Nutzers weiter als `not-permitted` ("the asking user could not be confirmed"), die Rückfrage läuft vor der Rechteprüfung |
| Regression M1 bis M5 | 87 Tests aus M1 bis M6a bestehen; angepasst sind drei (Liste der Anfragetypen, Oberfläche der API, Versionsnummer); Dummy D stellt seine zwei fehlerhaften Anfragen wie bisher (`unknown-request`, `invalid-payload`), auch für einen Spieler ohne Freigabe |
| Gegenproben | 35 von 35 gefunden |
| Simulation | 7 Szenarien, alle Prüfungen ok |

---

## Evidence Summary

- **Gewollte Verhaltensänderungen:** (1) API `0.6.0`: Module mit `0.5.0` werden abgewiesen (Dummys a und d sind umgestellt, b und c unverändert); (2) **ohne Freigabe im Hub bekommt ein Spieler für jede Anfrage `not-permitted`** (Standard "verboten"), auch für `ping`; GM und Assistent sind immer erlaubt; (3) `flightcontrol.targetping` und `api.getRights`; (4) der Hub zeigt den Modul-Tab ohne Titel und ohne Rahmen (Nacharbeit 3, B) und, nur für die Rolle GAMEMASTER, den Rechte-Block.
- **Nichts angefasst:** `core/request-relay.ts`, `core/request-identity.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/hub-model.ts`, `core/json-value.ts`, `core/manifest-scanner.ts`, `v13/relay.ts`, `package.json`, Lock-Datei. Kein Commit nach dem Deploy, kein Push, kein Live-Test durch mich.
- **Größe:** Bundle 51,6 kB (M6a: 37,5 kB), ohne `libWrapper`, `socketlib`, `innerHTML`, `game.socket`.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **R1 bis R3 sind mit dem "Go" angenommen:** (1) die Prüfung ist beim GM bindend und im eigenen Client umgehbar (Vorgabe); (2) die Rechte hängen an der selbst angegebenen Modul-`id`, ein veränderter Client kann sich als ein anderes, für ihn erlaubtes Modul ausgeben (heute ohne Gewinn, weil alle drei Anfragetypen allgemeine Nachweise sind; für künftige Typen gilt die Regel im Vertrag); (3) ob Foundry einem Assistenten das Schreiben von Welteinstellungen erlaubt, ist offen, der Hub und der Schreibpfad verlangen die Rolle GAMEMASTER. | `medium` | no |
| F2 | Foundry-Verhalten, das nur live prüfbar ist: was `testUserPermission(user, "OWNER")` für einen Nutzer auf dem GM-Client ergibt, für den GM, für ein Dokument in einem Compendium und bei `INHERIT`; ob eine Änderung der Welteinstellung ohne Neuladen auf dem Spieler-Client ankommt; die Nutzerliste bei einem gelöschten oder neu angelegten Nutzer; mehrere GMs. **Die Bindung beim GM hängt für ihre Aktualität von keinem dieser Punkte ab** (der GM schreibt die Ablage selbst). | `medium` | no |
| F3 | Die DOM-Erzeugung des Hubs (Rechte-Block, Tab ohne Titel und Rahmen) ist von keinem Test und keiner Simulation ausgeführt, nur typgeprüft; die Simulation deckt die Logik dahinter (Liste, Schreiben, Rolle), nicht die Darstellung. Es ist der letzte Versuch der Nacharbeit (Rework-Limit): gefällt es nicht, entscheidet der Projektleiter neu. | `low` | no |
| F4 | Die Foundry-Hülle (`v13/rights.ts`, `v13/module.ts`, `v13/hub-application.ts`) ist nicht durch Vitest gedeckt; sie ist mit Stellvertretern simuliert (Ausnahme: die DOM-Erzeugung, siehe F3). | `low` | no |
| F5 | Kein Ratenlimit (M5-S6, M6a-S7): ein Client kann dem GM viele weitergeleitete Anfragen schicken; die Rechteprüfung kommt erst nach der Bestätigung. M8. | `low` | no |
| F6 | Die einmalige Diagnosezeile zu den Handler-Argumenten aus M5 ist überholt und bleibt bis M8. | `info` | no |
| F7 | Der Deploy-Stand ist nicht committet (Code, Tests, Testmodule, Vertrag, `dadm/m6b-03`, `m6b-04`). | `info` | no |

Kein `critical`-Fund, kein neuer `high`-Fund, keine Human-Decision-Trigger, kein Rework.

---

## Live-Check (GM und Spieler gleichzeitig): Anleitung

Du deployst selbst auf Forge und siehst die Anzeige; ich führe nichts aus. Das Ergebnis halte ich in **einem** Artefakt fest (`m6b-05-live-check-output.md`), weil die Monitor-Outputs unveränderlich sind.

**Pakete** (fertig gebaut, gitignoriert, im Projektordner): `v13/dist/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-v13-m6b.zip` | Flight Control (`module.json`, `dist/module.js`, `lang/en.json`), API `0.6.0`; **ersetzt** das M6a-Paket. Das alte Zip `eagleeye-v13-m6a.zip` ist aus dem Ordner entfernt, damit es nicht versehentlich installiert wird. |
| `eagleeye-dummy-a.zip` | meldet sich mit `0.6.0` an, mit "Open", vier Einstellungen; stellt `ping` und `gmping` und gibt `rights: <Stufe>` aus |
| `eagleeye-dummy-d.zip` | meldet sich mit `0.6.0` an, ohne "Open", eine Text-Einstellung, zwei fehlerhafte Anfragen |
| `eagleeye-dummy-b.zip`, `eagleeye-dummy-c.zip` | unverändert, bereits installiert |

**Vorbereitung**
1. Die Zips von Flight Control, a und d im Import Wizard installieren (überschreiben). Das Spike-Modul bleibt deaktiviert.
2. Zwei Browser-Sitzungen wie zuvor (GM und Spieler `matttheeagle`), in beiden die Konsole, Filter `eagleeye`. **Beide Sitzungen neu laden.**
3. Für Test C zwei Akteure in der Welt: einen, den der Spieler besitzt (Berechtigung "Owner" für `matttheeagle`), und einen, den er nicht besitzt (keine oder nur eine niedrigere Berechtigung). Die UUIDs zeigt die Konsole des GM:
```js
game.actors.contents.map(a => `${a.uuid}  ${a.name}  spieler besitzt: ${a.testUserPermission(game.users.getName("matttheeagle"), "OWNER")}`)
```

**Test A: Spieler ohne Freigabe (Standard "verboten")**
GM zuerst anmelden, danach den Spieler. Erwartet in der Konsole des **Spielers**:
```
eagleeye-dummy-a | ping: not-permitted - module "eagleeye-dummy-a" may not be used by this user
eagleeye-dummy-a | this user: <Spieler-ID> (GM: false)
eagleeye-dummy-a | rights: denied
eagleeye-dummy-a | gmping: not-permitted - module "eagleeye-dummy-a" may not be used by this user
```
In der Konsole des **GM**: `ping: ok …`, `rights: all`, `gmping: ok … ran by <GM-ID> … asked by <GM-ID>` und **eine** Warnung `eagleeye | relayed request rejected for eagleeye-dummy-a (flightcontrol.gmping): not-permitted - module "eagleeye-dummy-a" may not be used by this user`.

**Test B: freigeben im Hub (GM)**
1. Zahnrad, Einstellungen konfigurieren, "Open Eagle Flight Control", Tab "EagleEye Dummy Test Module A". Unter den Einstellungen steht ein Rahmen "Who may use this module" mit einer Auswahl je Spieler, alle auf "Denied".
2. Für `matttheeagle` "Own targets only" wählen. Keine Meldung, kein Fehler in der Konsole.
3. **Vor dem Neuladen** in der Konsole des Spielers (zeigt, ob die Änderung ohne Neuladen ankommt; beide Ergebnisse sind interessant, keines ist ein Fehler):
```js
game.modules.get("eagleeye").api.getRights("eagleeye-dummy-a")
```
   Erwartet `{ok: true, value: {level: "own"}}` oder noch `denied`. Danach den Spieler mit F5 neu laden: `ping: ok`, `rights: own`, `gmping: ok … ran by <GM-ID> (GM: true), asked by <Spieler-ID>`.
4. Beim GM F5, Hub wieder öffnen: Die Auswahl steht weiter auf "Own targets only".

**Test C: eigenes und fremdes Ziel (Konsole des Spielers, Stufe "Own targets only")**
Zuerst einmal diese Hilfszeile einfügen:
```js
globalThis.tp = async (uuid) => { const r = await game.modules.get("eagleeye").api.request({ module: "eagleeye-dummy-a", type: "flightcontrol.targetping", payload: { uuid } }); return r.ok ? "ok " + JSON.stringify(r.value) : r.reason + ": " + r.detail; }
```
Dann, mit den UUIDs aus der Vorbereitung:
```js
await tp("<UUID des Akteurs, den der Spieler besitzt>")
await tp("<UUID des Akteurs, den er nicht besitzt>")
await tp("Actor.doesNotExist0000")
```
Erwartet: der erste `ok {"apiVersion":"0.6.0","module":"eagleeye-dummy-a","uuid":"…","askedBy":"<Spieler-ID>"}`; der zweite und der dritte **beide** `not-permitted: module "eagleeye-dummy-a" may act only on targets this user owns` (derselbe Satz: er verrät nicht, ob es das Dokument gibt).
Dann beim GM im Hub die Stufe "Own and foreign targets" wählen, den Spieler neu laden und die drei Zeilen wiederholen: jetzt alle drei `ok` (auch das Ziel, das es nicht gibt: `targetping` tut nichts mit dem Dokument).

**Test D: wieder sperren**
Im Hub "Denied". Spieler neu laden: `ping` und `gmping` wieder `not-permitted`, `rights: denied`; `await tp("<UUID des eigenen Akteurs>")` ebenso `not-permitted: module … may not be used by this user`. Nach F5 beim GM steht die Auswahl weiter auf "Denied".

**Test E: Aussehen des Hubs (als GM)**
Screenshot von Tab A und von Tab D. Gefällt der Tab ohne Titel und Rahmen, und der Rahmen "Who may use this module" darunter (Auswahl je Spieler, Beschriftung, Abstände)? Es ist der letzte Versuch der Nacharbeit; sag mir, was nicht gefällt.

**Optional**
- **Assistent:** ein Assistentenkonto anlegen und im Hub prüfen: Der Rechte-Block darf nicht erscheinen; `ping` und `gmping` laufen für ihn ohne Freigabe (`rights: all`). Zeigt zugleich, ob Foundry einem Assistenten das Schreiben von Welteinstellungen erlaubt: in seiner Konsole `await game.settings.set("eagleeye", "rights", game.settings.get("eagleeye", "rights"))`. Das schreibt den **aktuellen Wert unverändert zurück**, es ändert also keine Rechte; melde nur, ob Foundry es zulässt oder eine Ablehnung zeigt (U1).
- **Zweiter Spieler:** ein zweites Spielerkonto zeigt, dass die Stufen je Nutzer gelten (ein Spieler freigegeben, der andere nicht).
- **Fälschung:** die Einzeiler aus M6a (`forge(...)`, drei gefälschte Angaben) gelten unverändert und sollten weiter `not-permitted` ("the asking user could not be confirmed") ergeben.

**Bitte mitgeben:** die Zeilen aus Test A und B (beide Konsolen, samt der Warnung beim GM), das Ergebnis von `getRights` vor dem Neuladen, die Ausgaben der `tp`-Zeilen (Test C und D), die Screenshots von Test E und, falls gemacht, die optionalen Ergebnisse.

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| Test A: der Spieler bekommt `ok` ohne Freigabe | **ernster Sicherheitsfund** (Standard "verboten" greift nicht): bitte sofort melden; ich behandle es als Human Decision |
| Test C: `not-permitted` fehlt bei einem fremden Ziel in der Stufe "Own targets only" (`ok`) | **ernster Sicherheitsfund** (Besitzprüfung greift nicht); bitte Ausgabe und die Zeile aus der Vorbereitung mitgeben |
| Test C: das **eigene** Ziel wird abgelehnt | Die Besitzprüfung sieht den Spieler nicht als Owner; bitte die Zeile aus der Vorbereitung (`spieler besitzt: …`) und `game.actors.get("<id>").ownership` des Akteurs mitgeben (F2, U3) |
| Der GM sieht den Rechte-Block nicht | die Rollenprüfung schlägt fehl: bitte `game.user.role` und `CONST.USER_ROLES` aus der Konsole des GM mitgeben |
| Der Block sagt beim ersten Öffnen, die Rechte seien nicht lesbar | bitte `game.settings.get("eagleeye", "rights")` aus der Konsole des GM mitgeben |
| `ping` ist auch für den GM `not-permitted` ("could not be set up") | die Einstellung ließ sich nicht registrieren; in der GM-Konsole steht `failed to set up the rights`; bitte die Zeile mitkopieren |
| `getRights` vor dem Neuladen zeigt noch `denied`, nach F5 `own` | keine Störung: Die Änderung erreicht einen anderen Client erst nach dem Neuladen (F2). Die Prüfung beim GM ist davon nicht betroffen. |
| `relay-failed` mit "User query … is not registered" oder `invalid-request` im normalen Weg | ein Client hat noch den alten Stand (Browser-Cache); dort F5 |
| Tab oder Rahmen sehen schlecht aus | letzter Versuch der Nacharbeit: der Projektleiter entscheidet die Gestaltung neu (etwa minimales eigenes CSS nach R-13) |

---

## Übergaben

- **M7 (DnD-Versionswächter):** unabhängig von den Rechten. Ein Anfragetyp, der DnD-Daten liest oder ändert, folgt den Regeln aus Vertrag Teil 6 (Ziele nennen, Bindung an Module, Änderungen und GM-Wissen im Apply begründen).
- **M8:** Ratenbegrenzung (M5-S6, M6a-S7), Diagnosezeile aus M5 entfernen, Packaging-Skript mit `lang/`, Versionspolitik, Gesamtdurchsicht des Vertrags, T3 und T4 (Plan-Stellen und Root-README).
- **Künftige Anfragetypen:** siehe Apply Abschnitt 10; die Regel zur Bindung an Module (R2) legt das Apply des Milestones fest, der den ersten modulspezifischen Typ bringt.
- **UI-Leitfaden:** `docs/ui-guide.md` wird nach dem Live-Check nachgeführt (Tab ohne Titel, Rechte-Block als `fieldset` mit `legend`, Beobachtungen zur Darstellung).

---

## Recommendation

**Schließen.** M6b ist abgeschlossen (Status: Completed, Live-Check offen). Nächster Schritt ist der **Live-Check mit GM und Spieler**, danach M7 (Discover und Apply eigenständig). R1 bis R3 (`medium`) sind mit dem "Go" angenommen und bleiben bis zum Live-Check stehen.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6b-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete in `v13/dist/live-check/` (`eagleeye-v13-m6b.zip`, Dummys a bis d) | ephemeral |

M6b-Abschlusskette: `m6b-01-discover-output.md`, `m6b-02-apply-output.md`, `m6b-03-deploy-output.md`, `m6b-04-monitor-output.md` (alle `immutable`), dazu `m3-rework-3-output.md`. Folgeartefakt nach dem Live-Check: `m6b-05-live-check-output.md`.

---

## Next Step

Live-Check durch den Projektleiter (GM und Spieler), danach Nachtrag `m6b-05`, Nachführung von `docs/api-contract.md` (Abschnitt 8) und `docs/ui-guide.md`; danach M7 (Discover und Apply eigenständig, Stopp vor dem Deploy für das "Go").

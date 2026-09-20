# M6a — Verifizierte Nutzeridentität für GM-seitige Anfragen — Monitor Output

```
artifact: monitor-output
milestone: M6a
phase: MONITOR
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m6a-03-deploy-output.md` (Implementierung, Proofs, Acceptance-Checkliste), `m6a-02-apply-output.md` (Design, Übergaben), `m6-spike-1-result-output.md` (Verhalten von `User#query`), `m6-hd-1-output.md` (Human Decision 1)
- `04-milestone-plan-v2.md` (M6a), `03-scope-declaration.md`, `06-working-mode.md`
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: die frühere Simulation der Hub-Logik (Tabs, Feldarten, Prüfung, Rechte, `ready`-Hook der Testmodule) gegen den heutigen Stand, die Zwei-Client-Simulation aus dem Deploy mit dem echten Bundle
  (einschließlich des veränderten Clients), die Live-Check-Pakete

---

## Validation Result

**M6a hat sein Ziel erreicht, soweit es ohne Forge prüfbar ist.** Eine weitergeleitete Anfrage läuft beim GM erst, wenn der genannte Nutzer sie bestätigt hat; jede fehlende oder ungültige Bestätigung ist `not-permitted`; der bestätigte Nutzer erreicht den Handler;
der Vertrag Teil 5 liegt vor und ist gegen den Code geprüft.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M6a-01 bis AC-M6a-11 | erfüllt (Belege im Deploy-Output) |
| AC-M6a-12 (Live: Spieler `asked by` = seine ID; GM lokal; gefälschte Angabe `not-permitted`) | **unverified**; Live-Check mit GM und Spieler, Anleitung unten |
| Regression der Hub-Logik (Simulation mit API `0.5.0`) | unverändert wie in M3 bis M5: zwei Tabs a und d, Feldarten, Prüfung (`7` ok, `11` und `abc` abgelehnt, `gamma` abgelehnt), Namensraum- und GM-Sperre, Open-Aktion von a, keine bei d |
| Zwei-Client-Simulation (echtes Bundle, echte Testmodule) | GM allein, GM plus Spieler (auch zwei gleichzeitige Anfragen), nur Spieler, GM ohne Query, ein veränderter Client mit fünf Fälschungsversuchen, ein Client, der nie antwortet: alle Ergebnisse wie im Design |
| Gegenproben der Tests | alle 13 gezielten Fehler gefunden |
| Voraussetzung des Deploys | Spike bestanden (`m6-spike-1-result-output.md`): GM → Spieler `ok` mit `answeredBy` = Spieler |

---

## Evidence Summary

- **Regressionen:** keine. Die 76 Tests aus M1 bis M5 bestehen (angepasst wurden der Versionstest, die Tests des Relais für das neue Nachrichtenformat, das Ergebnis von `gmping` und die Umgebung des Relais-Tests in `eagle-api`; die zwölf früheren Kerntests
  sind unverändert); Gesamt **87 Tests in 12 Dateien**, `typecheck` und `build` grün, Bundle 37,5 kB ohne `libWrapper`, `socketlib` und `innerHTML`.
- **Gewollte Verhaltensänderungen:** (1) API `0.5.0`: Anmeldungen mit `0.4.0` werden abgewiesen (die Dummys a und d wurden umgestellt); (2) eine weitergeleitete Anfrage kostet einen zusätzlichen Hin- und Rückweg und braucht die Bestätigung des genannten Nutzers;
  (3) das alte Format ohne `claim` wird mit `invalid-request` abgelehnt; (4) `context.user` und `askedBy`. Für `caller`-Typen, Registrierung, Hub, Tabs und Speichern ändert sich nichts.
- **Nichts angefasst:** `package.json`, Lock-Datei, `v13/tsconfig.json`, `v13/hub-application.ts`, `core/hub-model.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/manifest-scanner.ts`, `core/json-value.ts`, `core/eagle-api.ts`.
  Kein Commit nach dem Deploy, kein Push, kein Live-Test durch mich.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **R1 bleibt als angenommenes Restrisiko:** Das Verhalten von Foundry im Zusammenspiel (Rückfrage, während die eigene Anfrage noch läuft; A3) ist nur live belegt, soweit der Spike es zeigt; dazu das mit der Human Decision 1 angenommene Restrisiko (Schutz nur gegen die Fälschung einer fremden Identität, nicht gegen einen Nutzer, der sich selbst freiwillig ausgibt, und nicht gegen die Modul-`id`). | `medium` | no |
| F2 | Jede weitergeleitete Anfrage kostet einen Hin- und Rückweg mehr; im Spike etwa 100 Millisekunden je Abfrage. Im Fehlerfall wartet der GM bis zu 5 Sekunden. | `low` | no |
| F3 | Es gibt kein Ratenlimit: Ein Fälscher kann dem genannten Nutzer viele Rückfragen schicken lassen (Belastung, kein Datenrisiko). M8 prüft die Ratenbegrenzung zusammen mit der aus M5. | `low` | no |
| F4 | Die Foundry-Hülle (`v13/relay.ts`, `v13/module.ts`) ist nicht durch Vitest gedeckt; sie ist mit Stellvertretern simuliert. Ihr Verhalten in Foundry zeigt der Live-Check. | `low` | no |
| F5 | Der Rahmen um den Modul-Block im Hub (Nacharbeit 2, `m3-rework-2-output.md`, Test H) ist noch nicht live gesehen; dieses Paket enthält ihn (`fieldset`). | `low` | no |
| F6 | Vom Spike unbeantwortet: mehrere GMs gleichzeitig, ob ein Assistent Welteinstellungen schreiben darf, Verhalten von `scope: "user"`, Stabilität der Nutzer-IDs (Discover-U2, U5, U6 und M5-U8). Sie betreffen M6b beziehungsweise Sonderfälle. | `info` | no |
| F7 | Die einmalige Diagnosezeile zu den Handler-Argumenten aus M5 ist überholt (die Frage ist beantwortet) und bleibt bis M8. | `info` | no |
| F8 | Dieser Stand und die Planversion 2 sind noch nicht committet. | `info` | no |

Kein `critical`-Fund, keine Human-Decision-Trigger, kein Rework.

---

## Live-Check (GM und Spieler gleichzeitig): Anleitung

Du deployst selbst auf Forge und siehst die Anzeige; ich führe nichts aus. Das Ergebnis halte ich danach in **einem** Artefakt fest (`m6a-05-live-check-output.md`, deckt M6a und den Rahmen im Hub ab), weil die Monitor-Outputs unveränderlich sind.

**Pakete** (fertig gebaut, gitignoriert, im Projektordner): `v13/dist/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-v13-m6a.zip` | Flight Control (`module.json`, `dist/module.js`, `lang/en.json`), API `0.5.0`, mit dem Rahmen um den Modul-Block; überschreibt den bisherigen Stand |
| `eagleeye-dummy-a.zip` | meldet sich mit `0.5.0` an, mit "Open", vier Einstellungen, stellt `ping` und `gmping`, gibt `asked by <ID>` aus |
| `eagleeye-dummy-d.zip` | meldet sich mit `0.5.0` an, ohne "Open", eine Text-Einstellung, sendet zwei fehlerhafte Anfragen |
| `eagleeye-dummy-b.zip`, `eagleeye-dummy-c.zip` | unverändert; sie sind schon installiert |

**Vorbereitung**
1. Die Zips von Flight Control, a und d im Import Wizard installieren (überschreiben). Das Spike-Modul "EagleEye Spike: User#query" kann **deaktiviert** werden, sonst läuft es weiter und schreibt Zeilen in die Konsole.
2. Zwei Browser-Sitzungen wie zuvor (GM und Spieler), in beiden die Konsole öffnen, Filter `eagleeye`. Beide Fenster sichtbar lassen. **Beide Sitzungen neu laden** (der Spieler-Client lädt Flight Control nur beim Seitenaufbau).

**Test A: GM allein (lokal)**
1. Nur der GM angemeldet. Erwartet in der GM-Konsole:
```
eagleeye-dummy-a | gmping: ok, api 0.5.0, module eagleeye-dummy-a, echo from <GM-Name>, ran by <GM-ID> (GM: true), asked by <GM-ID>
```

**Test B: GM und Spieler (Kernprüfung)**
1. GM anmelden und warten, bis die Welt geladen ist; danach den Spieler anmelden (oder in der Spieler-Sitzung F5). Erwartet in der Konsole des **Spielers**:
```
eagleeye-dummy-a | this user: <Spieler-ID> (GM: false)
eagleeye-dummy-a | gmping: ok, api 0.5.0, module eagleeye-dummy-a, echo from <Spieler-Name>, ran by <GM-ID> (GM: true), asked by <Spieler-ID>
```
   In der Konsole des **GM**: die Diagnosezeile `eagleeye | relay: first query received, extra handler arguments: 1: [{"timeout":17000}]` und **keine** Zeile `relayed request rejected`.

**Test F: Fälschung (in der Konsole des Spielers)**
Diese Zeilen ahmen einen veränderten Client nach: Sie schicken dem GM direkt eine Nachricht, die einen anderen Nutzer nennt. Füge sie einzeln in die Konsole des **Spielers** ein (mit dem GM verbunden). Die Ergebnisse erscheinen als Text.

F1, die Angabe nennt den GM:
```js
JSON.stringify(await game.users.activeGM.query("eagleeye.request", { request: { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" }, claim: { userId: game.users.activeGM.id, requestId: "0123456789abcdef0123456789abcdef" } }, { timeout: 17000 }))
```
F2, die Angabe nennt einen Nutzer, den es nicht gibt:
```js
JSON.stringify(await game.users.activeGM.query("eagleeye.request", { request: { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" }, claim: { userId: "doesNotExist0000", requestId: "0123456789abcdef0123456789abcdef" } }, { timeout: 17000 }))
```
F3, die Angabe nennt den Spieler selbst, aber mit einer erfundenen Kennung (ohne den echten Weg):
```js
JSON.stringify(await game.users.activeGM.query("eagleeye.request", { request: { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" }, claim: { userId: game.user.id, requestId: "0123456789abcdef0123456789abcdef" } }, { timeout: 17000 }))
```
Erwartet bei **allen drei** je Zeile: `{"ok":false,"reason":"not-permitted","detail":"the asking user could not be confirmed"}`. In der Konsole des **GM** je eine Warnung
`eagleeye | relayed request rejected for eagleeye-dummy-a (flightcontrol.gmping): not-permitted - the asking user could not be confirmed (claimed user …: …)` mit dem Grund am Ende.
(Optional, wenn ein zweiter Spieler verbunden ist: die ID dieses Spielers statt der des GM in F1 einsetzen; sie steht in `game.users.contents.map(u => u.id + " " + u.name)`.)

**Test H: Rahmen im Hub (als GM)**
1. Zahnrad, Einstellungen konfigurieren, Kategorie "EagleEye", "Open Eagle Flight Control". Sieht der Modul-Block gut aus: ein Rahmen mit dem Modulnamen als Titel, darin Version, Open und die Einstellungen? Screenshot von Tab A und Tab D.

**Bitte mitgeben:** die Zeilen aus Test A und B (beide Konsolen), die drei Ergebnisse von Test F samt den Warnungen aus der Konsole des GM, und die Screenshots von Test H.

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| Spieler: `ok … ran by <GM-ID> … asked by <Spieler-ID>` | AC-M6a-12 (a) erfüllt: Die Rückfrage hält in Foundry, der GM kennt den Nutzer |
| F1 bis F3 alle `not-permitted` mit dem Satz "the asking user could not be confirmed" | AC-M6a-12 (c) erfüllt: Eine gefälschte Angabe wird abgelehnt |
| **Eine der F-Zeilen liefert `ok`** | **ernster Sicherheitsfund**: bitte sofort melden (Text der Zeile und die Konsole des GM); ich behandle es als Human Decision |
| Spieler bekommt im normalen Weg `not-permitted` | Die Bestätigung scheitert in Foundry; der Grund steht am Ende der Warnung in der Konsole des GM (`the question failed: …`, `no answer within 5 seconds`, `the answer is not a confirmation …`); bitte mitkopieren |
| `relay-failed` mit "User query 'eagleeye.confirm' is not registered" | ein Client hat noch den alten Stand (Browser-Cache); dort F5 |
| `invalid-request` mit "must name the asking user in claim" im normalen Weg | Aufrufer und GM laufen mit verschiedenen Ständen; beide neu laden |
| Rahmen sieht schlecht aus (Test H) | Nacharbeit 2, Versuch 2 (minimales eigenes CSS) oder eine der beiden anderen Gestaltungen |

---

## Übergaben (zusätzlich zu Apply Abschnitt 10)

- **M6b (Rechte):** Der bestätigte Nutzer steht als `context.user` im Kern und im Empfänger bereit (Nutzer-ID). Die Rechte hängen im Kern zwischen `validate` und `run` ein und im Empfänger nach der Bestätigung. Vorgaben des Projektleiters, festgehalten in `m6a-02` Abschnitt 10:
  erlaubt oder verboten je Modul und Nutzer, bei "erlaubt" eingeschränkt auf eigene oder fremde Ziele; bindend beim GM, als Regel im eigenen Client; eingestellt nur vom GM im Hub. Die Rechte-Daten können als Welteinstellung liegen: Spieler lesen sie (Spike, `probe`).
  Offen für M6b: Standardwerte, wie ein Anfragetyp sein Ziel angibt, Umgang mit gelöschten Nutzern, Vertrag Teil 6, Nachweis-Anfragetyp mit Ziel.
- **M8:** Ratenbegrenzung (M5-S6, M6a-S7), Diagnosezeile aus M5 entfernen, Versionspolitik, Packaging-Skript mit `lang/`.

---

## Recommendation

**Schließen.** M6a ist abgeschlossen (Status: Completed). Nächster Schritt ist der **Live-Check mit GM und Spieler**, danach M6b (Discover und Apply eigenständig). R1 (`medium`) ist mit dem "Go" angenommen und bleibt bis zum Live-Check stehen.

Hinweis zur Reihenfolge: M6b baut auf der bestätigten Nutzeridentität auf. Ich empfehle deshalb den Live-Check **vor** M6b, damit die Bestätigung in Foundry belegt ist, bevor Rechte daran hängen.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6a-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete in `v13/dist/live-check/` (fünf Zips, ersetzen den M5-Satz) | ephemeral |

M6a-Abschlusskette: `m6a-02-apply-output.md`, `m6a-03-deploy-output.md`, `m6a-04-monitor-output.md` (alle `immutable`), Discover war `m6-01-discover-output.md`, dazu `m6-hd-1-output.md` und der Spike (`m6-spike-1-output.md`, `m6-spike-1-result-output.md`).
Folgeartefakt nach dem Live-Check: `m6a-05-live-check-output.md`.

---

## Next Step

Live-Check durch den Projektleiter (GM und Spieler), danach Nachtrag `m6a-05` und Nachführung von `docs/api-contract.md` (Abschnitt 8); danach M6b (Discover und Apply eigenständig, Human Decision bei einem bleibenden `high`-Security-Fund, Stopp vor dem Deploy für das "Go").

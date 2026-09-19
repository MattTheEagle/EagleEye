# M5 — GM-Weiterleitung — Monitor Output

```
artifact: monitor-output
milestone: M5 (mit der Hub-Nacharbeit M3-Rework 1)
phase: MONITOR
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m5-03-deploy-output.md` (Implementierung, Proofs, Acceptance-Checkliste), `m5-02-apply-output.md` (Design, Übergaben), `m5-01-discover-output.md` (Fakten und offene Punkte)
- `m3-rework-1-output.md` (Nacharbeit, Akzeptanz AC-M3R-01 bis -03), `m4-05-live-check-output.md` (offene `low`-Punkte des letzten Live-Checks)
- `04-milestone-plan.md` (M5), `03-scope-declaration.md`, `06-working-mode.md`
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: die frühere Simulation der Hub-Logik (Tabs, Feldarten, Prüfung, Rechte, `ready`-Hook der Testmodule) gegen den heutigen Stand,
  Rückkopplung des UI-Leitfadens auf die Nacharbeit, Durchsicht der geänderten Hub-Hülle, die Live-Check-Pakete

---

## Validation Result

**M5 hat sein Ziel erreicht, soweit es ohne Forge prüfbar ist.** Ein Anfragetyp erklärt, wo er läuft; Anfragen für Typen, die beim GM laufen, werden von Clients ohne GM-Rolle an den GM weitergeleitet; die GM-Seite prüft alles neu
und führt nur ausdrücklich freigegebene Typen aus; ohne GM, bei Zeitüberschreitung und bei Transportfehlern kommen stabile Codes zurück. Der Vertrag Teil 4 liegt vor und ist gegen den Code geprüft.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M5-01 bis AC-M5-11, AC-M3R-01 bis AC-M3R-02 | erfüllt (Belege im Deploy-Output; AC-M5-11 mit der dort genannten Ausnahme für die Hub-Datei) |
| AC-M5-12 (Live: a beim Spieler `ok` mit `ranBy` = GM, ohne GM `no-gm`, GM lokal, Diagnosezeile beim GM) | **unverified**; Live-Check mit GM und Spieler gleichzeitig, Anleitung unten |
| AC-M3R-03 (Live: Anordnung wie im Einstellungsfenster, Schieberegler, genau ein `onChange`, ungültiger Wert) | **unverified**; im selben Live-Check |
| Regression der Hub-Logik (Simulation mit API `0.4.0`) | unverändert wie in M3 und M4: zwei Tabs a und d, Feldarten (Checkbox, Auswahl, Zahl mit Bereich `0` bis `10`, Checkbox mit Neuladen-Hinweis, Text), Prüfung (`7` ok, `11` und `abc` abgelehnt, `gamma` abgelehnt), Namensraum- und GM-Sperre, Open-Aktion von a, keine bei d |
| Ergebnisse der Testmodule im `ready`-Hook | a `ping` ok, c `not-registered`, d `unknown-request` und `invalid-payload`, wie im Live-Check von M4 |
| Zwei-Client-Simulation aus dem Deploy (echtes Bundle, echte Testmodule) | GM allein, GM plus Spieler, nur Spieler, GM ohne Relais, Direktzugriffe eines veränderten Spieler-Clients: alle Ergebnisse wie im Design (Deploy-Output, Proofs) |
| Gegenproben der Tests | elf von zwölf gezielten Fehlern gefunden, der zwölfte war ein äquivalenter Fehler (überflüssige Zeile, entfernt) |

---

## Evidence Summary

- **Regressionen:** keine. Die 59 Tests aus M1 bis M4 bestehen (drei angepasst: P1, P18, P20, dazu die neue Signatur im Ping-Test); Gesamt **76 Tests in 11 Dateien**, `typecheck` und `build` grün, Bundle 32,9 kB
  ohne `libWrapper`, `socketlib` und `innerHTML`.
- **Gewollte Verhaltensänderungen:** (1) API `0.4.0`: Anmeldungen mit `0.3.0` werden abgewiesen (die Dummys a und d wurden umgestellt); (2) Anfragen an `flightcontrol.gmping` laufen beim GM; (3) neue Fehlgründe; (4) der Hub
  bekommt `standard-form` und Schieberegler (Nacharbeit). Für alle bisherigen Anfragetypen (`flightcontrol.ping`) und für Registrierung, Tabs, Open und Speichern ändert sich nichts.
- **Nichts angefasst:** `package.json`, Lock-Datei, `v13/tsconfig.json`, `core/hub-model.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/manifest-scanner.ts`, `core/json-value.ts`, Manifest und Sprachdatei von Flight Control.
  Kein Commit nach dem Deploy, kein Push, kein Live-Test durch mich.
- **Rückkopplung ins Dokument (ausdrücklich):** `docs/ui-guide.md` Abschnitt 4 nennt jetzt, dass der Hub `standard-form` setzt und den Schieberegler nutzt und dass beides live noch aussteht; sonst stand dort "the hub does not use it yet".
- **Selbstkorrektur im Deploy:** Eine Gegenprobe zeigte, dass eine Zeile im Relais überflüssig war (siehe Deploy-Output); sie ist entfernt.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **R1 bleibt als angenommenes Restrisiko:** Ob der Query-Handler beim GM erfährt, welcher Nutzer angefragt hat, ist unbelegt (U1). M5 entscheidet nicht danach; die Diagnosezeile in der Konsole des GM beantwortet es im Live-Check. **Harte Vorbedingung für M6.** | `medium` | no |
| F2 | **R3 bleibt als angenommenes Restrisiko:** Fehlerbild von `User#query` bei nicht verbundenem Ziel, Zeitüberschreitung, Serialisierung des Ergebnisses und Auswahl bei mehreren GMs (U2 bis U9) sind nur live prüfbar. Das Design bildet jeden Fehler ab; ein anderes Verhalten von Foundry zeigt sich erst live. | `medium` | no |
| F3 | **RW1:** Die Klasse `standard-form` wirkt in v13 womöglich nicht wie erhofft oder verändert andere Abstände. Live prüfbar; Rückfall Versuch 2 (minimales eigenes CSS nach R-13) oder Annahme. | `medium` | no |
| F4 | Die Foundry-Hüllen (`v13/relay.ts`, `v13/module.ts`, `v13/hub-application.ts`) sind nicht durch Vitest gedeckt; sie sind mit Stellvertretern simuliert (Relais, Wiring) beziehungsweise nur durchgesehen (Hub). Ihr Verhalten in Foundry zeigt der Live-Check. | `low` | no |
| F5 | `relay-timeout` meldet einen unbekannten Ausgang. Für `gmping` unerheblich; jeder künftige ändernde GM-Handler muss doppelte Ausführung vertragen. Der Vertrag sagt es ausdrücklich. | `low` | no |
| F6 | Offene `low`-Punkte aus `m4-05` gehen in diesen Live-Check: Werte bleiben nach Wiederöffnen, ungültiger Wert (bei einem Schieberegler kann das Element den Wert selbst begrenzen), Ansicht als Spieler, Ping-Inhalt (jetzt als Textzeile). | `low` | no |
| F7 | Ein Handler mit `runsOn "gm"` ohne Rechteprüfung bleibt für künftige Milestones ein Risiko, wenn die Regel (kein ändernder GM-Handler vor M6 und U1) missachtet wird. Abgesichert durch Test P18 und die Übergabe an M6. | `low` | no |
| F8 | T6 (zwei Plan-Stellen und Root-`README.md` nachführen) bleibt offen; Vorschlag "mit M8". Der Deploy und dieser Monitor von M5 sind noch nicht committet. | `info` | no |

Kein `critical`-Fund, kein `high`-Fund, keine Human-Decision-Trigger (kein neuer Security-/Privacy-Fund, keine Dependency-Änderung), kein Rework.

---

## Live-Check (T4: GM und Spieler gleichzeitig): Anleitung

Du deployst selbst auf Forge und siehst die Anzeige; ich führe nichts aus. Das Ergebnis halte ich danach in **einem** Artefakt fest (`m5-05-live-check-output.md`, deckt M5 und die Hub-Nacharbeit ab),
weil die Monitor-Outputs unveränderlich sind. Der Paketsatz **ersetzt** den M4-Satz; hast du ihn schon installiert, überschreibst du ihn einfach.

**Pakete** (fertig gebaut, gitignoriert, im Projektordner): `v13/dist/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-v13-m5.zip` | Flight Control (`module.json`, `dist/module.js`, `lang/en.json`), API `0.4.0` |
| `eagleeye-dummy-a.zip` | meldet sich mit `0.4.0` an, mit "Open", vier Einstellungen, stellt `ping` und `gmping`, gibt Textzeilen aus |
| `eagleeye-dummy-b.zip` | meldet sich nicht an (darf keinen Tab haben) |
| `eagleeye-dummy-c.zip` | meldet sich mit `9.0.0` an, wird abgewiesen (kein Tab), fragt trotzdem einen `ping` |
| `eagleeye-dummy-d.zip` | meldet sich mit `0.4.0` an, ohne "Open", eine Text-Einstellung, sendet zwei fehlerhafte Anfragen |

**Vorbereitung**
1. Zips im Import Wizard installieren wie zuvor. In einer v13-Welt Flight Control und die vier Dummy-Module aktivieren (a, c und d verlangen `eagleeye`).
2. **Zwei Browser-Sitzungen**, die sich nicht gegenseitig abmelden: ein zweites Browser-Profil oder ein privates Fenster. Sitzung 1 ist der **GM**, Sitzung 2 ein **Spieler** derselben Welt.
3. In beiden Sitzungen die Konsole öffnen (F12), Filter `eagleeye`. **Beide Fenster sichtbar nebeneinander lassen** (ein Fenster im Hintergrund drosselt der Browser).

**Test A: kein GM verbunden**
1. Nur die Spieler-Sitzung anmelden (GM ist nicht verbunden), Welt laden lassen.
2. Erwartet in der Konsole des Spielers:
```
eagleeye-dummy-a | this user: <Spieler-ID> (GM: false)
eagleeye | request rejected for eagleeye-dummy-a (flightcontrol.gmping): no-gm - no Gamemaster is connected, so this request cannot run     (Warnung)
eagleeye-dummy-a | gmping: no-gm - no Gamemaster is connected, so this request cannot run
```
3. Spieler abmelden.

**Test B: GM und Spieler (Kernprüfung)**
1. GM anmelden und **warten, bis die Welt geladen ist** (Szene sichtbar).
2. Danach den Spieler anmelden (oder neu laden, F5). Erwartet in der Konsole des **Spielers**:
```
eagleeye | ready (Foundry v13)
eagleeye | API attached (v0.4.0)
eagleeye-dummy-a | ping: ok, api 0.4.0, module eagleeye-dummy-a, echo hello
eagleeye-dummy-a | this user: <Spieler-ID> (GM: false)
eagleeye-dummy-a | gmping: ok, api 0.4.0, module eagleeye-dummy-a, echo from <Spielername>, ran by <GM-ID> (GM: true)
```
   und in der Konsole des **GM** (nach dem Eintreffen der Anfrage des Spielers):
```
eagleeye | relay: first query received, extra handler arguments: <none oder eine Angabe>
```
   sowie beim GM aus dem eigenen Laden: `eagleeye-dummy-a | gmping: ok, …, ran by <GM-ID> (GM: true)` (Test C, lokal).
3. Erwartet außerdem in beiden Konsolen die bekannten Zeilen aus M4: `registered module eagleeye-dummy-a … / -d …`, Abweisung von c, drei Warnungen für c und d.

**Test D: Hub nach der Nacharbeit (als GM)**
1. Zahnrad → Einstellungen konfigurieren → Kategorie "EagleEye" → **"Open Eagle Flight Control"**.
2. **Optik:** Stehen Label links und Felder rechts wie im Einstellungsfenster (Screenshot von Tab A und Tab D)? "Dummy A Level" zeigt einen **Schieberegler mit Zahlenfeld**?
3. **Level** auf 7 ziehen, danach eine Zahl eintippen, zum Beispiel 3: Erwartet je einmal `eagleeye-dummy-a | level changed to 7` und `… to 3` (**nicht doppelt**).
4. **11** in das Zahlenfeld eintippen und das Feld verlassen: entweder begrenzt das Element auf 10 (`level changed to 10`) oder der Wert springt zurück und eine Warnung nennt den Grund. Bitte sagen, was passiert.
5. Mode auf Beta, Enabled anhaken, Tab wechseln, **Open** klicken (wie zuvor).
6. Hub schließen und wieder öffnen (und einmal F5): die Werte sind geblieben.

**Test E (optional): Spieleransicht der Einstellungen:** Als Spieler unter Einstellungen konfigurieren: der Knopf "Open Eagle Flight Control" darf **nicht** erscheinen.

**Bitte mitgeben:** die Konsolenzeilen mit `eagleeye` aus **beiden** Sitzungen (nach Test B), einen Screenshot von Tab A und Tab D des Hubs, und je eine Zeile zu Test D 2 bis 4, 6 und E.

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| Spieler `gmping: ok … ran by <GM-ID> (GM: true)`, eigene ID verschieden | AC-M5-12 (b) erfüllt: die Weiterleitung hält in Foundry; R3 ist im Kern bestätigt |
| Spieler `gmping: relay-failed - …` | Foundry lehnt die Query ab (U2 bis U5); den Text bitte mitkopieren; dann geht M5 mit dem beobachteten Verhalten zurück in Apply |
| Spieler `no-gm`, obwohl der GM verbunden ist | `activeGM` sieht den GM nicht (U8, oder der GM war noch nicht geladen); nach ein paar Sekunden mit F5 wiederholen und die Zeile mitkopieren |
| Spieler `relay-timeout` nach etwa 15 Sekunden | der Client des GM antwortet nicht (Relais dort nicht registriert, Fenster im Hintergrund gedrosselt); Konsole des GM ansehen |
| Diagnosezeile beim GM nennt ein zweites Argument | U1 geklärt: der Text sagt, was Foundry mitgibt; das entscheidet, wie M6 die Nutzeridentität bekommt |
| Diagnosezeile beim GM: `none` | Foundry gibt dem Handler nichts über den Absender mit; M6 braucht dann eine Human Decision für die Nutzeridentität |
| Hub-Optik wie bisher (gestapelt) | RW1: `standard-form` wirkt nicht; Versuch 2 (minimales eigenes CSS) oder Annahme |
| Hub-Optik nativ, Schieberegler da | AC-M3R-03 (a) und (b) erfüllt; Leitfaden wird nachgeführt |
| `level changed to …` doppelt | RW2: Der Schutz vor doppelten Ereignissen greift nicht wie gedacht; Nacharbeit Versuch 2 |
| Fehler in der Konsole beim Öffnen des Hubs | Fehler in der Hülle; Konsolentext genügt |

---

## Übergaben (zusätzlich zu Apply Abschnitt 10)

- **M6 (Nutzungsrechte):** Der Haken für die Rechte liegt im Empfänger (`receive`) hinter der Prüfung des Ausführungsorts und im Kern für die lokale Ausführung; `not-permitted` ist definiert. **Vorbedingung:** U1 ist durch den Live-Check
  geklärt oder eine Human Decision regelt, woher die Nutzeridentität kommt. Die Bedeutung von "in wie weit" (N1) bleibt der geplante Stopp: Sie wird dem Projektleiter vorgelegt, nicht interpretiert.
- **Spätere Milestones:** Jeder Handler mit `runsOn "gm"` bekommt ein eigenes Apply, prüft seine Daten streng und verträgt einen unbekannten Ausgang (`relay-timeout`); datenändernde GM-Handler erst nach M6.
- **M8:** Versionspolitik (Handler-Versionen, unbekannte Codes); Entscheidung, ob die Diagnosezeile zu U1 bleibt; Ratenbegrenzung und Zeitüberschreitung je Handler prüfen; Packaging-Skript mit `lang/`; Nachführen der Pläne (T6) und des Root-`README.md`.

---

## Recommendation

**Schließen.** M5 ist abgeschlossen (Status: Completed); die Nacharbeit M3-Rework 1 ist umgesetzt. Nächster Schritt ist der **Live-Check mit GM und Spieler**, danach M6. R1 und R3 (`medium`) sind mit dem "Go" angenommen und
bleiben bis zum Live-Check stehen; RW1 (`medium`) entscheidet über einen zweiten Versuch der Nacharbeit.

Hinweis zur Reihenfolge: M6 (Rechte je Modul und Nutzer) hat einen geplanten Stopp und hängt an U1. Ich empfehle deshalb den Live-Check **vor** M6, damit die Absenderfrage beantwortet ist, wenn du mit mir über "in wie weit" sprichst.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m5-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete in `v13/dist/live-check/` (fünf Zips, ersetzen den M4-Satz) | ephemeral |

M5-Abschlusskette: `m5-01-discover-output.md`, `m5-02-apply-output.md`, `m5-03-deploy-output.md`, `m5-04-monitor-output.md` (alle `immutable`), dazu `m3-rework-1-output.md`. Folgeartefakt nach dem Live-Check:
`m5-05-live-check-output.md` (deckt M5 und die Hub-Nacharbeit ab).

---

## Next Step

Live-Check durch den Projektleiter (GM und Spieler gleichzeitig), danach Nachtrag `m5-05` und Nachführung von `docs/api-contract.md` (Abschnitt 8) und `docs/ui-guide.md` (Abschnitt 4); danach M6 (Discover und Apply
eigenständig, geplanter Stopp bei der Bedeutung von "in wie weit", Human Decision bei einem `high`-Security-Fund).

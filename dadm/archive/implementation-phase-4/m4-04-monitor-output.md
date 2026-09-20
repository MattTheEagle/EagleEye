# M4 — Anfragekanal-Kern — Monitor Output

```
artifact: monitor-output
milestone: M4
phase: MONITOR
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m4-03-deploy-output.md` (Implementierung, Proofs, Acceptance-Checkliste)
- `m4-02-apply-output.md` (Design, Übergaben), `m4-01-discover-output.md` (Fakten)
- `04-milestone-plan.md` (M4), `03-scope-declaration.md`, `06-working-mode.md`, `m3-04-monitor-output.md` (offener Hub-Check)
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: die echten Test-Module gegen die echte API mit dem echten Kern in einem nachgebildeten Foundry
  (Simulation, jetzt mit `ready`-Hook), die Live-Check-Pakete, die Vertrags-, Fixture- und Gegenproben aus dem Deploy

---

## Validation Result

**M4 hat sein Ziel erreicht, soweit es ohne Forge prüfbar ist.** Ein Eagle Modul kann Flight Control eine Anfrage stellen; der Kern prüft sie in fester
Reihenfolge, führt sie aus und antwortet immer im bekannten Muster; das Format ist auf JSON beschränkt und versioniert; der Vertrag Teil 3 liegt vor und ist
gegen den Code geprüft.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M4-01 bis AC-M4-10 | erfüllt (Belege im Deploy-Output) |
| AC-M4-11 (Live: a `ok`, c `not-registered`, d `unknown-request` und `invalid-payload`) | **unverified**; gemeinsamer Live-Check mit dem Hub-Check aus M3, Anleitung unten |
| Simulation: echte Fixtures a, b, c, d gegen `createEagleApi(registry)` mit dem echten Kern | a: `ping` mit `echo "hello"` → `{ ok: true, value: { apiVersion: "0.3.0", module: "eagleeye-dummy-a", echo: "hello" } }`; c: `ping` → `not-registered`; d: Typ `nope.nothing` → `unknown-request`, `ping` mit `{ echo: 5 }` → `invalid-payload` ("payload.echo must be a string"); Flight Control warnt genau die drei Fehlschläge, den Erfolg nicht |
| Simulation: Hub-Logik mit API `0.3.0` | unverändert wie in M3 (zwei Tabs a und d, Feldarten, Validierung, Namensraum- und GM-Sperre) |
| Gegenproben der Tests | drei gezielte Fehler im Kern (JSON-Prüfung, Vorrang des Absenders, doppelte Handler) wurden von je genau einem Test gefunden |
| Live-Check-Pakete | fünf Zips gebaut (Flight Control `eagleeye-v13-m4.zip` mit `lang/en.json` sowie Dummys a bis d); Bundle und Sprachdatei byte-identisch mit dem Repo, a und d melden `"0.3.0"`, c `"9.0.0"` |

---

## Evidence Summary

- **Regressionen:** keine. Die 44 Tests aus M1 bis M3 bestehen (zwei davon wurden für den Vertragswechsel angepasst: T18 und H4); Gesamt 59 Tests in 10 Dateien,
  `typecheck` und `build` grün, Bundle 25,6 kB ohne `libWrapper` und ohne `innerHTML`.
- **Gewollte Verhaltensänderung:** Die API hat ein drittes Mitglied `request` und steht auf `0.3.0`; Anmeldungen mit `0.2.0` werden abgewiesen (Dummys a und d
  wurden umgestellt). Sonst ändert sich zur Laufzeit nichts: Der Hub und die Anmeldung sind unangetastet.
- **Nichts angefasst:** `v13/module.ts`, `v13/hub-application.ts`, `core/hub-model.ts`, `core/settings-hub.ts`, `core/module-registry.ts`, `package.json`,
  Lock-Datei, GitHub-Release. Kein Commit, kein Push, kein Live-Test durch mich.
- **Selbstkorrektur im Monitor:** Mein erster Simulationslauf brach ohne Ausgabe ab, weil ich `console.log` mit einer schon ersetzten Funktion "wiederhergestellt"
  hatte; das war ein Fehler des Testskripts im Scratchpad, nicht des Produkts. Nach der Korrektur läuft die Simulation vollständig (Ergebnisse oben).

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **R1 bleibt als Restrisiko:** Die Stabilität des Formats hängt daran, wie sechs weitere Module es benutzen werden. Der Projektleiter hat das Risiko mit dem "Go" angenommen; die Versionspolitik ab 1.0 (Handler-Versionen, Umgang mit unbekannten Codes) entscheidet M8, geprüft wird das Format erst mit den ersten Verbraucher-Milestones. | `high` | no |
| F2 | AC-M4-11 ist bis zum Live-Check `unverified`; ebenso AC-M3-13 (Hub: Fenster, Registerkarten, native Optik, Speichern) mit dem angenommenen Risiko R1 (`medium`) aus M3, AC-M1-12 (kein altes Hub-Menü) und die aus M2 offenen Punkte U1 bis U3. | `low` | no |
| F3 | Bis M5 läuft ein Handler im Client des Aufrufers. Ein künftiger Handler, der Dokumente ändert, scheitert für einen Nutzer ohne Foundry-Recht an Foundry selbst (`handler-failed`); `ping` ist nicht betroffen. | `low` | no |
| F4 | Die Abschnitte 4 bis 9 des API-Vertrags haben sich verschoben (neuer Abschnitt "Requests"); die unveränderlichen Dokumente aus M2 und M3 nennen die alten Nummern. Der Vertrag selbst ist konsistent (Skript). | `info` | no |
| F5 | T3/T4 (zwei Plan-Stellen in `EAGLE-MODULES-PLAN.md` und `dadm/eagle-modules-projektplan.md` sowie das Root-`README.md` nachführen) bleiben offen; Vorschlag "mit M8". | `info` | no |
| F6 | Die Absenderangabe (`module`) ist selbst angegeben und nicht belegbar; der Vertrag nennt sie eine Vertrauensgrenze. Für die Rechte je Modul und Nutzer (M6) ist das die Ausgangslage. | `info` | no |

Kein `critical`-Fund, keine Human-Decision-Trigger (kein Security-/Privacy-Fund, keine Cross-Milestone-Änderung, keine Dependency-Änderung), kein Rework.

---

## Live-Check (gemeinsam für M3 und M4, T2): Anleitung

Du deployst selbst auf Forge und siehst die Anzeige; ich führe nichts aus. Das Ergebnis halte ich danach in **einem** Artefakt fest
(`m4-05-live-check-output.md`, deckt M3 und M4 ab), weil die Monitor-Outputs unveränderlich sind. Der Paketsatz **ersetzt** den M3-Satz; hast du den M3-Satz
schon installiert, überschreibst du ihn einfach.

**Pakete** (fertig gebaut, gitignoriert, im Projektordner): `v13/dist/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-v13-m4.zip` | Flight Control (`module.json`, `dist/module.js`, **`lang/en.json`**) |
| `eagleeye-dummy-a.zip` | meldet sich mit `0.3.0` an, mit "Open", vier Einstellungen, fragt einen `ping` |
| `eagleeye-dummy-b.zip` | meldet sich nicht an (darf keinen Tab haben) |
| `eagleeye-dummy-c.zip` | meldet sich mit `9.0.0` an, wird abgewiesen (kein Tab), fragt trotzdem einen `ping` |
| `eagleeye-dummy-d.zip` | meldet sich mit `0.3.0` an, ohne "Open", eine Text-Einstellung, sendet zwei fehlerhafte Anfragen |

**Ablauf** (Zips im Import Wizard installieren wie zuvor):
1. In einer v13-Welt Flight Control und die vier Dummy-Module aktivieren (a, c und d verlangen `eagleeye`).
2. Welt neu laden, Konsole öffnen (F12), Zeilen mit `eagleeye` beachten.
3. Zahnrad → Einstellungen konfigurieren → in der Kategorie des Moduls "EagleEye" den Knopf **"Open Eagle Flight Control"** anklicken (nur als GM sichtbar).

**Erwartete Konsolenzeilen beim Laden der Welt** (Reihenfolge der Dummys hängt von Foundry ab):
```
eagleeye | ready (Foundry v13)
eagleeye | API attached (v0.3.0)
eagleeye | registered module eagleeye-dummy-a (api 0.3.0)
eagleeye | registration rejected for eagleeye-dummy-c: incompatible-api-version - … requests API 9.0.0, Flight Control provides 0.3.0
eagleeye | registered module eagleeye-dummy-d (api 0.3.0)
eagleeye-dummy-a | ping result {ok: true, value: {apiVersion: '0.3.0', module: 'eagleeye-dummy-a', echo: 'hello'}}
eagleeye-dummy-c | ping result {ok: false, reason: 'not-registered', detail: …}
eagleeye-dummy-d | unknown request result {ok: false, reason: 'unknown-request', detail: 'no request type "nope.nothing" is offered'}
eagleeye-dummy-d | invalid payload result {ok: false, reason: 'invalid-payload', detail: 'payload.echo must be a string'}
eagleeye | request rejected for eagleeye-dummy-c (flightcontrol.ping): not-registered - …      (Warnung, 3 Stück für c und d)
eagleeye | hub rendered: 2 tab(s)          <- erst beim Öffnen des Hubs
```
Der `ping` von a wird **nicht** von Flight Control geloggt (nur die Dummy-Ausgabe erscheint). Keine Zeile der Form `eagleeye | hub: … is not editable (type …)`.

**Erwartete Anzeige im Hub** (unverändert aus M3): Fenster "Eagle Flight Control" mit **zwei** Tabs "EagleEye Dummy Test Module A" (aktiv) und "… D", **kein** Tab für b
und c. Tab A: Kopf mit "Version 0.0.1 (API 0.3.0)", Knopf **Open**, vier Felder (Checkbox, Auswahl Alpha/Beta, Zahl 0 bis 10, Checkbox mit dem Hinweis "… Takes effect
after a reload."). Tab D: Kopf, **kein** Open-Knopf, ein Textfeld "Dummy D Note" mit "hello".

**Was du im Hub ausprobierst** (M3, jetzt mit den neuen Paketen):
1. Zwischen Tab A und Tab D wechseln und zurück.
2. In Tab A auf **Open** klicken: Meldung "eagleeye-dummy-a: open action called".
3. Level auf 7, Mode auf Beta, Enabled anhaken; Hub schließen und wieder öffnen: Werte sind geblieben.
4. In Level **11** eintragen und das Feld verlassen: Der Wert springt zurück, eine Warnung nennt den Grund.
5. Optional: als Spieler anmelden; der Knopf darf nicht erscheinen.

**Bitte mitgeben:** die Konsolenzeilen mit `eagleeye` (beim Laden und nach dem Öffnen des Hubs), einen Screenshot des Hubs mit beiden Tabs (für den nativen Look) und eine
Zeile, was von 1 bis 4 funktioniert hat.

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| Anfrage-Zeilen wie erwartet (vier Ergebnisse) | M4 live bestätigt (AC-M4-11); das Format hält in Foundry, was der Test verspricht |
| Zeile mit `eagleeye-dummy-a \| ping result` fehlt, dafür Fehler in der Konsole | Ausführungsfehler im Kern in Foundry; Konsolentext genügt, dann Rework in M4 |
| a bekommt `not-registered` | die Registrierung von a schlug fehl (Zeile davor prüfen) oder der `ready`-Hook läuft vor der Anmeldung; Ablauf klären |
| Hub: alle Rückmeldungen aus dem M3-Block (Tabs schalten nicht, Optik, rohe Schlüssel, "Cannot be edited here") | Bedeutung wie in `m3-04-monitor-output.md` (U1 bis U3, `lang/`, A3) |

---

## Übergaben (zusätzlich zu Apply Abschnitt 9)

- **M5 (GM-Weiterleitung):** `kernel.execute(envelope)` ist transportfrei und der Umschlag JSON-tauglich. Auf allen Clients wird `CONFIG.queries["eagleeye.request"]`
  registriert (Präfix laut Foundry-Regel); beim GM ruft der Handler dieselbe `execute`-Funktion auf. M5 hat ein `high`-Risiko (Security): Die Weiterleitung führt
  Änderungen mit GM-Rechten aus; wo die Prüfung "wer darf was" sitzt (auf der GM-Seite), ist Teil des Apply und löst nach Governance eine Human Decision aus, wenn
  ein `high`-Security-Fund entsteht.
- **M6 (Nutzungsrechte):** Die Rechteprüfung hängt intern zwischen Datenprüfung und Ausführung ein; der Code `not-permitted` kommt additiv. Schlüssel ist die angemeldete Modul-`id`.
  Die Bedeutung von "in wie weit" (N1) ist ein geplanter Stopp für den Projektleiter.
- **Spätere Milestones:** Jede Fachanfrage ein eigener Handler in einer eigenen Datei mit eigenem Apply; Änderungen an Handler-Daten erhöhen die Handler-Version, nicht die API-Version.
- **M8:** Konsolidierung des Vertrags; Versionspolitik ab 1.0 (auch für Handler-Versionen und unbekannte Codes); Packaging-Skript mit `lang/`; Nachführen der Pläne und des Root-`README.md`.

---

## Recommendation

**Schließen.** M4 ist abgeschlossen (Status: Completed); nächster Milestone ist **M5** (GM-Weiterleitung, `User#query`). R1 (`high`) ist mit dem "Go" angenommen und bleibt als
Restrisiko, bis Verbraucher-Milestones das Format benutzen.

Hinweis zur Reihenfolge: M5 und M6 sind sicherheitsrelevant (Weiterleitung mit GM-Rechten, Rechte je Modul und Nutzer) und der Plan sieht dort einen Stopp für dich vor (Bedeutung von
"in wie weit"). Ich empfehle, vorher den gemeinsamen Live-Check zu machen, weil M5 und M6 auf Registry, Kern und Hub aufbauen. Nach Working Mode dürfte ich Discover und Apply von M5
ohne dein Zutun starten; die Entscheidung liegt beim Projektleiter.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m4-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete in `v13/dist/live-check/` (fünf Zips, ersetzen den M3-Satz) | ephemeral |

M4-Abschlusskette: `m4-01-discover-output.md`, `m4-02-apply-output.md`, `m4-03-deploy-output.md`, `m4-04-monitor-output.md` (alle `immutable`). Folgeartefakt nach dem Live-Check:
`m4-05-live-check-output.md` (deckt M3 und M4 ab).

---

## Next Step

Live-Check durch den Projektleiter (Hub und Anfragen), danach M5 (Discover und Apply eigenständig, Stopp vor dem Deploy für das "Go"; bei einem `high`-Security-Fund im Apply eine
Human Decision).

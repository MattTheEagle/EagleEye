# M5 und Hub-Nacharbeit — Live-Check des Projektleiters — Ergebnis

```
artifact: live-check-output
milestone: M5 und M3-Rework 1 (Nachtrag zu den Monitor-Outputs)
phase: MONITOR
status: complete
date: 2026-09-20
```

retention: immutable

Nachtrag zu `m5-04-monitor-output.md` und `m3-rework-1-output.md` (deren Inhalt bleibt unverändert). Der Projektleiter hat den Live-Check auf Forge selbst ausgeführt, mit zwei gleichzeitigen Sitzungen (GM und Spieler), und
Screenshots, Konsolenauszüge und Bemerkungen in den Chat gegeben; ich habe nichts gegen Forge ausgeführt. Er deckt ab: den Hub nach der Nacharbeit (Test D), die Anfragen auf dem Client des GM (Test C) und die Weiterleitung
mit dem Spieler (Tests A und B). **Test E (Spieleransicht der Einstellungen) ist nicht berichtet.**

---

## Input Summary

- Pakete aus `v13/dist/live-check/`: Flight Control `eagleeye-v13-m5.zip` (API `0.4.0`) sowie die Dummy-Module a bis d
- Umgebung laut Bildschirm: Foundry VTT v13 Stable, Build 351, System dnd5e 5.3.3, Forge, sechs aktive Module; GM `matteagle404`, Spieler `matttheeagle`
- Eingabe, in zwei Nachrichten:
  1. zwei Screenshots, im Folgenden H1 (Hub, Tab A) und H2 (Hub, Tab D), beide mit der Konsole des GM (Filter `eagleeye`); sechs Konsolenzeilen als Text; zwei Zeilen des Projektleiters:
     "Test D 2: Label stehen links, Felder stehen rechts. Überschrift der Dummy Module nicht schön formatiert" und "Test D 6: Werte auf Regler und Einstellung waren nach Open und Hub schließen und F5 drücken
     unverändert auf 10 und Beta"; dazu der Auftrag zu committen
  2. drei Konsolenauszüge als Text: **P-A** (Sitzung des Spielers allein, Test A), **P-B** (Sitzung des Spielers bei verbundenem GM, Test B) und **G-B** (Sitzung des GM, dazu)
- Nicht geliefert: Test E, eine Angabe zu D 3 bis D 5 (dazu nur die Konsole), der Klick auf Open in diesem Durchgang
- Zeitliche Einordnung: Die Konsole in H1 und H2 endet mit `mode changed to beta`; ein Neuladen (F5) leert sie, die Bilder stammen also von vor dem Test D 6. D 6 beruht auf dem Bericht. G-B ist eine spätere Sitzung des GM.
- Erwartung: `m5-04-monitor-output.md`, Abschnitt "Live-Check"; Akzeptanzkriterien AC-M5-12 und AC-M3R-03

---

## Beobachtung gegen Erwartung

### A. Start und Anfragen (P-A, P-B, G-B)

| # | Erwartet | Beobachtet (sinngemäß gekürzt) | Ergebnis |
|---|---|---|---|
| A1 | Startlog, API `0.4.0`, Sprachdatei | in allen drei Auszügen: `eagleeye \| ready (Foundry v13)`, `API attached (v0.4.0)`, `Loaded localization file modules/eagleeye/lang/en.json` | erfüllt |
| A2 | a und d angenommen, c abgewiesen, drei Warnungen | wie in `m4-05`: `registered module … (api 0.4.0)`, `registration rejected for eagleeye-dummy-c: incompatible-api-version - … provides 0.4.0`, Warnungen `not-registered` (c), `unknown-request` (d), `invalid-payload` (d) | erfüllt |
| A3 | `ping` von a: `ok` mit Inhalt | P-A: `ok: true, value: {apiVersion: '0.4.0', module: 'eagleeye-dummy-a', echo: 'hello'}` und Textzeile `ping: ok, api 0.4.0, module eagleeye-dummy-a, echo hello` (auch G-B, H1) | erfüllt; der Inhalt von `value` ist zu sehen (schließt F4 aus `m4-05`) |
| A4 | keine Fehlerzeilen von `eagleeye` | in P-A, P-B und G-B keine `ERROR`-Zeile, auch nicht zum Aufbau des Relais im `init` | erfüllt |

### B. Weiterleitung (Tests A, B und C)

| # | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| B1 | **Test A**, nur der Spieler verbunden: `no-gm`, Warnung (AC-M5-12 a) | P-A: `this user: YvMJ2d7AkPP3I4pT (GM: false)`; Warnung `request rejected for eagleeye-dummy-a (flightcontrol.gmping): no-gm - no Gamemaster is connected, so this request cannot run`; Ergebnis `{ok: false, reason: 'no-gm', detail: …}`; Textzeile `gmping: no-gm - …` | **erfüllt** |
| B2 | **Test B**, GM verbunden, Spieler lädt: `ok`, `ranBy` = GM, verschieden vom Spieler (AC-M5-12 b) | P-B: `this user: YvMJ2d7AkPP3I4pT (GM: false)` und `gmping: ok, api 0.4.0, module eagleeye-dummy-a, echo from matttheeagle, ran by LmS6Y5vvR5k7wX71 (GM: true)`; die ID des GM (`this user` in G-B) ist `LmS6Y5vvR5k7wX71` | **erfüllt** |
| B3 | Der GM führt seine eigene `gmping` lokal aus (AC-M5-12 c) | G-B und H1: `gmping: ok, …, echo from matteagle404, ran by LmS6Y5vvR5k7wX71 (GM: true)` | **erfüllt** |
| B4 | Diagnosezeile beim GM (AC-M5-12 d) | G-B: `eagleeye \| relay: first query received, extra handler arguments: 1: [{"timeout":17000}]` | **erfüllt**; Inhalt siehe B5 |
| B5 | Was gibt Foundry dem Query-Handler mit (U1)? | **Ein** zusätzliches Argument, und es ist die Option der Anfrage `{ timeout: 17000 }` (die 15 Sekunden des Relais plus 2 Sekunden Puffer, gesetzt in `v13/relay.ts`). **Keine Angabe dazu, welcher Nutzer angefragt hat.** | **U1 beantwortet: nein** (über die Argumente des Handlers) |
| B6 | Keine Ablehnung beim GM | G-B zeigt keine Zeile `relayed request rejected`: Die weitergeleitete Anfrage bestand alle Prüfungen der GM-Seite | erfüllt |
| B7 | Das Ergebnis kommt unverändert zurück (U7) | P-B: `ok: true, value: {apiVersion, module, echo, ranBy: {…}}`; das verschachtelte Objekt `ranBy` kam an | erfüllt (für diese Form) |
| B8 | `timeout` kommt wie eingestellt an (AC-M5-07) | B4/B5: `17000` = `RELAY_TIMEOUT_MS` plus 2000 | erfüllt |

### C. Hub-Anzeige und Bedienung (H1, H2, Bericht)

| # | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| C1 | Anordnung wie im Einstellungsfenster (AC-M3R-03 a) | Labels links, Felder rechts, Hinweise unter dem Label; in Tab A (Checkbox, Auswahl, Schieberegler, Checkbox) und Tab D (Textfeld) (H1, H2; Bericht D 2) | **erfüllt** |
| C2 | Zahl mit Bereich als Schieberegler mit Zahlenfeld | "Dummy A Level": Regler mit Griff am rechten Ende und Zahlenfeld "10" (H1) | **erfüllt** |
| C3 | Kopf "Version 0.0.1 (API 0.4.0)", Knopf Open in Tab A, keiner in Tab D | wie erwartet | erfüllt |
| C4 | Kopfzeile eines Moduls | Die Überschrift ist groß, steht direkt unter der Tab-Leiste, hat einen großen Abstand zur Versionszeile und wiederholt den Namen des Tabs; laut Bericht "nicht schön formatiert" | **Abweichung (F1)** |
| C5 | Änderungen im Hub: je Änderung genau eine Zeile | H1 und G-B, alle Sitzungen: `level changed to 7`, `3`, `10`, `5`, `8`, `6`, `enabled changed to true/false`, `mode changed to beta/alpha`, keine Zeile doppelt | erfüllt; **RW2 nicht beobachtet** |
| C6 | 11 in Level eintippen (D 4) | nicht ausdrücklich berichtet. Die Konsole zeigt nach `3` ein `level changed to 10`, der Regler steht auf dem Maximum; das passt zu einer Begrenzung durch das Element auf 10. Kein Zurückspringen, keine Warnung von `eagleeye` | **wahrscheinlich, nicht bestätigt** (F2) |
| C7 | Mode auf Beta, Enabled anhaken, Tab wechseln (D 5) | `mode changed to beta`, `enabled changed to true`; Tab D erreichbar (H2) | erfüllt |
| C8 | Hub schließen, wieder öffnen, F5 (D 6) | Bericht: Regler auf 10 und Mode Beta sind unverändert | **erfüllt** (Bericht) |
| C9 | Open klicken | in diesem Durchgang nicht zu sehen (H1 stammt von vor dem Klick) | nicht belegt in diesem Durchgang (im ersten Live-Check belegt) |
| C10 | Test E, Spieleransicht: der Knopf "Open Eagle Flight Control" fehlt | nicht berichtet | **offen** |

---

## Bewertung

| Kriterium | Ergebnis |
|---|---|
| **AC-M5-12 (a)** nur Spieler → `no-gm` | **erfüllt** (B1) |
| **AC-M5-12 (b)** Spieler mit GM → `ok`, `ranBy` = GM, verschieden vom Spieler | **erfüllt** (B2): Die Weiterleitung hält in Foundry. |
| **AC-M5-12 (c)** der GM führt seine eigene `gmping` lokal aus | **erfüllt** (B3) |
| **AC-M5-12 (d)** Diagnosezeile beim GM | **erfüllt** (B4); sie beantwortet U1 (B5) |
| **AC-M5-07** Query im `init`, `activeGM.query` mit `timeout` = 15 s + 2 s | **erfüllt** live (B4, B8, A4) |
| **M5-R3** (`medium`, Laufzeitverhalten von `User#query`) | **teilweise geklärt:** U1 (Argumente des Handlers), U7 (Ergebnis kommt an, für diese Form), U9 (Forge behindert nichts) sind belegt. **Nicht ausgelöst und weiter unverified:** Ziel nicht erreichbar oder ohne Handler (U2, U5), Zeitüberschreitung (U3), Fehler im Handler beim GM (U4), Anfrage an den eigenen Nutzer (U6), mehrere GMs (U8). Die Codes `relay-failed` und `relay-timeout` sind nur durch Tests und Simulation belegt. |
| **M5-R1** (`medium`, Absender beim GM, U1) | **U1 ist beantwortet, und zwar negativ:** Über die Argumente des Query-Handlers erfährt die GM-Seite nichts über den anfragenden Nutzer. M5 hat nicht danach entschieden; für **M6 ist das jetzt ein Fakt**, keine offene Frage (siehe Folgen 2). |
| **AC-M3R-03 (a)** Anordnung wie im Einstellungsfenster | **erfüllt.** Die Klasse `standard-form` wirkt in v13; RW1 (`medium`) ist **geschlossen**. |
| **AC-M3R-03 (b)** Schieberegler, genau ein `onChange`, ungültiger Wert | **erfüllt für Schieberegler und einmaliges `onChange`** (C5); RW2 wurde nicht beobachtet. Ein zu großer Wert scheint vom Element begrenzt statt abgelehnt zu werden (C6, F2; nicht bestätigt). |
| **AC-M3R-03 (c)** keine neuen Abweichungen bei Tabs, Knöpfen, Fensterrahmen | **teilweise:** Tabs, Knöpfe und Rahmen unauffällig; die Modulüberschrift ist neu aufgefallen (F1). |
| Nacharbeit M3, Versuch 1 von 2 | **erfolgreich** für F1 und F2 aus `m4-05`; ein zweiter Versuch ist dafür nicht nötig. Die Überschrift ist ein **neuer** Befund. |
| `m4-05` F3, Teil "Werte bleiben nach Wiederöffnen" | **belegt** (C8, Bericht) |
| `m4-05` F3, Teil "ungültiger Wert springt zurück" | für Zahlen mit Bereich scheint das Element den Wert selbst zu begrenzen (nicht bestätigt). Der Rückfall im Hub bleibt nur durch Tests der Logik belegt. |
| `m4-05` F4 (Inhalt des `ping`) | **belegt** (A3) |

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **Die Überschrift eines Modul-Tabs ist nicht schön formatiert** (Bericht D 2; H1, H2): groß, direkt unter der Tab-Leiste, großer Abstand zur Versionszeile, wiederholt den Namen des Tabs. Sie trat auf, seit der Hub `standard-form` trägt (vorher stand die Überschrift dicht über der Versionszeile). Was genau stört, ist nicht angegeben; die Entscheidung über die Gestaltung liegt beim Projektleiter. | `low` | no |
| F2 | Ein über das Maximum hinaus eingetippter Wert scheint vom Schieberegler-Element begrenzt zu werden (Konsole nach `3`: `level changed to 10`). Der Pfad "abgelehnter Wert springt zurück, Warnung" wäre für Zahlen mit Bereich damit über die Oberfläche kaum erreichbar und ist nur durch Tests belegt. Die Beobachtung beruht auf der Konsole, nicht auf einem Bericht. | `info` | no |
| F3 | Die einmalige Diagnosezeile zu U1 hat ihre Aufgabe erfüllt. Sie bleibt im Code, bis M8 entscheidet (Discover-R11 von M5). | `info` | no |

Kein `critical`-Fund, keine neuen Human-Decision-Trigger für M5.

---

## Offen

- **Test E** (optional): Als Spieler unter Einstellungen konfigurieren; der Knopf "Open Eagle Flight Control" darf nicht erscheinen.
- Zu C6: Bitte bestätigen, ob 11 tatsächlich auf 10 begrenzt wurde (nicht blockierend).
- Nicht ausgelöste Fehlerwege der Weiterleitung (U2 bis U6, U8) bleiben `unverified`; sie sind für den Betrieb mit einem GM und Spielern nicht erforderlich und lassen sich später bei Bedarf gezielt prüfen.

---

## Folgen

1. **M5 ist live bestätigt** (AC-M5-12 a bis d, AC-M5-07). Die Weiterleitung von einem Spieler an den GM und zurück funktioniert in Foundry auf Forge; ohne GM antwortet sie mit `no-gm`. R3 ist teilweise geklärt.
2. **U1 ist beantwortet: Foundry gibt dem Query-Handler keinen Absender mit** (nur die Anfrage-Option `{ timeout }`). Für M6 (Rechte je Modul und Nutzer) heißt das: Die GM-Seite erfährt über die Argumente nicht, welcher Nutzer angefragt hat.
   Eine im Umschlag mitgeschickte Nutzer-ID wäre fälschbar; ob es einen belastbaren Weg gibt (etwa eine Rückfrage des GM an den genannten Nutzer), prüft M6. M6 braucht eine ausdrückliche Entscheidung des Projektleiters darüber,
   woher die Nutzeridentität kommt und wie viel Vertrauen sie bekommt; nach Governance ist das bei einem `high`-Security-Fund eine Human Decision. Das ist die im Apply von M5 vorgesehene harte Vorbedingung, jetzt mit belegter Grundlage.
3. **Die Hub-Nacharbeit (Versuch 1) ist live bestätigt.** F1 und F2 aus `m4-05` sind geschlossen, RW1 ist geschlossen, RW2 wurde nicht beobachtet. Der Werte-Erhalt nach Wiederöffnen und Neuladen ist belegt.
4. **Nachführung der Dokumente** (ausdrücklich, nicht still): `docs/ui-guide.md` (Regeln R-05 und R-06, Checkliste, Abschnitt 4), `docs/api-contract.md` Abschnitt 8 (Weiterleitung, `no-gm`, Inhalt des `ping`, Argumente des
   Query-Handlers, Werte bleiben erhalten), `dadm/README.md`.
5. **F1 (Überschrift):** Entscheidung des Projektleiters über die Gestaltung, danach eine kleine Nacharbeit mit eigenem Rework-Protokoll (neuer Befund, Versuch 1 von 2).
6. **Commit:** Auf Anweisung des Projektleiters wurden `9fd7e3e` (Produkt) und `929a2c5` (Prozess) angelegt, kein Push. Dieser Nachtrag und die Nachführung der Dokumente sind noch nicht committet.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m5-05-live-check-output.md` (dieses Dokument) | immutable |

Geändert im Zuge dieses Nachtrags: `docs/ui-guide.md`, `docs/api-contract.md`, `dadm/README.md`.

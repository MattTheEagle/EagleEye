# M3 und M4 — Live-Check des Projektleiters — Ergebnis

```
artifact: live-check-output
milestone: M3 und M4 (Nachtrag zu den Monitor-Outputs, mit AC-M1-12 und Restpunkten aus M2)
phase: MONITOR
status: complete
date: 2026-09-19
```

retention: immutable

Nachtrag zu `m3-04-monitor-output.md` und `m4-04-monitor-output.md` (deren Inhalt bleibt unverändert). Der Projektleiter hat den
gemeinsamen Live-Check selbst auf Forge ausgeführt und Konsolenauszug sowie acht Screenshots in den Chat gegeben; ich habe nichts
gegen Forge ausgeführt. `m3-04` nennt als Ergebnisdatei `m3-05-live-check-output.md`; nach der Festlegung in `m4-04` (ein gemeinsames
Artefakt) gibt es diese Datei nicht, dieses Dokument ersetzt sie.

---

## Input Summary

- Pakete aus `v13/dist/live-check/`: Flight Control `eagleeye-v13-m4.zip` (API `0.3.0`, mit `lang/en.json`) sowie die Dummy-Module a, b, c, d
- Umgebung laut Bildschirm: Foundry VTT v13 Stable, Build 351, System dnd5e 5.3.3, Forge, sechs aktive Module, angemeldet als GM
- Eingabe: Konsolenauszug (Filter `eagleeye`) und acht Screenshots, im Folgenden S1 bis S8 in der Reihenfolge der Übergabe:
  S1 Hub Tab A mit Open-Meldung · S2 Hub Tab D · S3 Hub Tab A, Auswahlliste geöffnet · S4 Hub Tab A, Beta gewählt ·
  S5 native Einstellungen Dummy D · S6 native Einstellungen Dummy B · S7 native Einstellungen Dummy A · S8 Konsole nach dem Laden der Welt
- Erwartung: `m4-04-monitor-output.md`, Abschnitt "Live-Check"; Akzeptanzkriterien AC-M3-13, AC-M4-11 und AC-M1-12

---

## Beobachtung gegen Erwartung

### A. Konsole

| # | Erwartet | Beobachtet (sinngemäß gekürzt) | Ergebnis |
|---|---|---|---|
| A1 | Startlog | `eagleeye \| ready (Foundry v13)` | erfüllt |
| A2 | API angehängt, Version `0.3.0` | `eagleeye \| API attached (v0.3.0)` | erfüllt |
| A3 | Sprachdatei geladen | `Foundry VTT \| Loaded localization file modules/eagleeye/lang/en.json` | erfüllt |
| A4 | a und d angenommen | `registered module eagleeye-dummy-a (api 0.3.0)` und `… eagleeye-dummy-d (api 0.3.0)`; die Dummy-Zeilen `registerModule result` zeigen `{ok: true, module: {…}}` (S8) | erfüllt |
| A5 | c abgewiesen | `registration rejected for eagleeye-dummy-c: incompatible-api-version - module "eagleeye-dummy-c" requests API 9.0.0, Flight Control provides 0.3.0`; die Dummy-Zeile zeigt `{ok: false, reason: 'incompatible-api-version', …}` | erfüllt |
| A6 | Anmeldung erst im `setup` | Aufrufkette der Warnung: `registerModule` ← Dummy-Callback ← `callAll` ← `setupGame` | erfüllt |
| A7 | `ping` von a: `ok` | `eagleeye-dummy-a \| ping result` mit `{ok: true, value: {…}}` (S8); Flight Control loggt den Erfolg nicht | erfüllt; `value` nicht aufgeklappt (F4) |
| A8 | `ping` von c: `not-registered` | Warnung `request rejected for eagleeye-dummy-c (flightcontrol.ping): not-registered - …`; Ergebnis `{ok: false, reason: 'not-registered', …}` | erfüllt |
| A9 | `nope.nothing` von d: `unknown-request` | Warnung und Ergebnis `{ok: false, reason: 'unknown-request', detail: 'no request type "nope.nothing" is offered'}` | erfüllt |
| A10 | `ping` von d mit `echo: 5`: `invalid-payload` | Warnung und Ergebnis `{ok: false, reason: 'invalid-payload', detail: 'payload.echo must be a string'}` | erfüllt |
| A11 | genau drei Anfrage-Warnungen | c, d, d | erfüllt |
| A12 | Hub geöffnet | `eagleeye \| hub rendered: 2 tab(s)`, einmal | erfüllt |
| A13 | keine Zeile `… is not editable`, keine Fehlerzeilen von `eagleeye` | keine | erfüllt |

### B. Hub-Anzeige

| # | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| B1 | Einstiegspunkt in den Moduleinstellungen | Kategorie "EagleEye" mit genau einem Eintrag "Open Eagle Flight Control", Hinweis "Bundles the settings of your Eagle modules and starts them." (S1, S5 bis S7, Zähler [1]) | erfüllt; nur die GM-Ansicht wurde gesehen |
| B2 | Fenster "Eagle Flight Control" | Fenster mit Auge-Symbol, Titel, Schließen und Größengriff; alle Texte lokalisiert, keine rohen Schlüssel | erfüllt |
| B3 | zwei Tabs (A aktiv, D), keiner für b und c | zwei Tabs (S1, S2); b ist aktiv (eigene Kategorie mit Einstellung in S6) und hat keinen Tab | erfüllt |
| B4 | Tab A | Kopf "Version 0.0.1 (API 0.3.0)", Knopf Open, Checkbox, Auswahl Alpha/Beta, Zahlenfeld (5), Checkbox mit Hinweis "… Takes effect after a reload." (S1, S3, S4) | erfüllt |
| B5 | Tab D | Kopf, kein Open-Knopf, Textfeld "Dummy D Note" mit "hello" (S2, derselbe Wert in S5) | erfüllt |
| B6 | nativer Look | Fensterrahmen, Farben, Schrift, Tab-Leiste, Knöpfe und Eingabeelemente wie in Foundry; **Anordnung der Felder und Zahlenfeld weichen vom Einstellungsfenster ab**; ob der aktive Tab deutlich genug markiert ist, lässt sich aus den Bildern nicht beurteilen | teilweise (F1, F2) |

### C. Bedienung

| # | Versuch | Beobachtet | Ergebnis |
|---|---|---|---|
| C1 | Tab-Wechsel | Inhalt von A (S1, S3, S4) und von D (S2) war sichtbar; die Konsole zeigt nur ein `hub rendered`, der Wechsel rendert das Fenster nicht neu; der Hub startet mit A aktiv, also ist A→D belegt | erfüllt (Rückweg D→A nicht ausdrücklich belegt, derselbe Mechanismus) |
| C2 | Open | Meldung "eagleeye-dummy-a: open action called" (S1) und in der Konsole | erfüllt |
| C3 | Enabled, Mode, Level ändern | Konsole: `enabled changed to true`, `mode changed to beta`, `level changed to 7`, `level changed to 5`, `mode changed to alpha`; die `onChange`-Handler liefen für Checkbox (Client), Auswahl (Welt) und Zahl (Client), die Felder behielten den Wert (S1, S3, S4) | Schreiben erfüllt |
| C4 | Hub schließen, wieder öffnen, Werte prüfen | Kein zweites `hub rendered` in der Konsole, also nicht ausprobiert. S7 und S8 zeigen dieselbe native Ansicht mit den Ausgangswerten von A (Enabled aus); S8 entstand vor dem ersten Öffnen des Hubs (keine `hub rendered`-Zeile). S7 ist damit weder Beleg noch Gegenbeleg | nicht belegt (F3) |
| C5 | 11 in Level eintragen | Keine Zeile `eagleeye \| hub could not save …`, die der Hub bei jeder Ablehnung loggt; nicht ausprobiert | nicht belegt (F3) |
| C6 | Spieleransicht (optional) | nicht berichtet | nicht getestet (F3) |

---

## Bewertung

| Kriterium | Ergebnis |
|---|---|
| **M3-R1** (`medium`), Teil Tab-Konvention (`section.tab[data-group][data-tab]`, Klasse `active`, Kernvorlage `tab-navigation.hbs`) | **belegt.** Die Leiste erscheint, ein Klick schaltet den Inhalt um, ohne das Fenster neu zu rendern. Annahme A2 (Kernvorlage arbeitet mit `changeTab` zusammen) ist bestätigt, der Rückfall über `HandlebarsApplicationMixin` entfällt. |
| M3-R1, Teil "nativer Look" | **teilweise**, siehe F1 und F2 |
| M3-U3 (Art-Erkennung der Einstellungen) | **belegt.** Boolean, String mit `choices`, Number und String wurden erkannt, keine Zeile "not editable". |
| M3-U5 und M3-R2 (Paket ohne Vorlagendateien, `lang/en.json`) | **belegt.** Der Hub läuft ohne `.hbs`; die Sprachdatei wird geladen; der Fenstertitel nimmt einen Schlüssel (A3). |
| M3-U4 (Foundrys Neuladen-Aufforderung nicht nachgebaut) | unverändert; der Hinweis ist zu sehen, "Needs Reload" wurde nicht umgeschaltet |
| **AC-M3-13** | **erfüllt mit Einschränkungen:** Öffnen, Tabs, Felder, Open, Schreiben und das Fehlen von b und c sind belegt; die Dauerhaftigkeit der Werte (F3) und die Optik (F1, F2) nicht oder nur teilweise. |
| **AC-M4-11** | **erfüllt.** a `ok`, c `not-registered`, d `unknown-request` und `invalid-payload`, dazu genau die drei erwarteten Warnungen. |
| **AC-M1-12** (altes Menü "EagleEye Hub" weg) | **erfüllt.** Die Kategorie "EagleEye" enthält nur den Eintrag "Open Eagle Flight Control". |
| M2: b ist aktiv und meldet sich nicht an | **belegt** (schließt den `low`-Punkt aus `m2-05`) |
| M2-U1 (Reihenfolge der `init`-Callbacks) | weiter unverified, ohne Bedeutung für das Design; die API ist im `setup` vorhanden, die Anmeldung läuft in Foundrys `setupGame` |
| M2-U2 (Flight Control deaktiviert), M2-U3 (Versionsspanne erzwungen) | nicht getestet, weiter unverified |
| M4-R1 (`high`, Formatstabilität) | bleibt als angenommenes Restrisiko; das Format hält in Foundry, was der Test verspricht |

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **Die Anordnung der Felder weicht vom nativen Einstellungsfenster ab.** Im Hub steht das Label über dem Feld, das Feld nimmt die volle Breite, der Hinweis folgt darunter (S1, S2); im Einstellungsfenster steht das Label links und das Feld rechts (S5 bis S7). Das ist der in `m3-04` vorgesehene Zweig "Optik weicht ab (U2, CSS)"; der Look war als Teil von R1 (`medium`) vom Projektleiter angenommen worden. Die Ursache ist nicht belegt, weil die Referenz kein CSS enthält. Ein Kandidat aus der Referenz ist die Fensteroption `window.contentClasses` (v13, `application.d.mts:239`), die die v14-Referenz mit der Klasse `standard-form` zeigt; die v13-Referenz nennt diese Klasse nicht. | `medium` | no |
| F2 | Ein Zahlenfeld mit `range` erscheint im Hub als einfaches Zahlenfeld, im Einstellungsfenster als Schieberegler mit Zahlenfeld (S1 gegen S7). Das entspricht der Entscheidung Q2 im Apply von M3; die Referenz bietet `HTMLRangePickerElement.create` (`client/applications/elements/range-picker.d.mts:30`). | `low` | no |
| F3 | Nicht belegt sind: Werte bleiben nach Schließen und Wiederöffnen, Ablehnung eines ungültigen Werts (11) mit Rückfall und Warnung, Ansicht als Spieler. Die Logik dahinter (Prüfung, Rechte) ist durch Tests abgedeckt; live fehlt die Bestätigung der Hülle (Rückfall im Feld) und von Foundry (Speicherung, `restricted`). | `low` | no |
| F4 | Der Inhalt des erfolgreichen `ping` (`apiVersion`, `module`, `echo`) wurde nicht aufgeklappt. Die Form ist durch Tests und Simulation belegt; AC-M4-11 verlangt nur `ok`. | `info` | no |
| F5 | Die Aussage in `docs/ui-guide.md`, `createFormGroup` liefere "das native Layout" (R-06), war zu stark; sie wird auf "natives Markup" korrigiert (siehe Folgen 3). | `info` | no |

Kein `critical`-Fund, keine Human-Decision-Trigger (kein Security-/Privacy-Fund, keine Cross-Milestone-Änderung, keine Dependency-Änderung).
F1 ist `medium`: Nach Governance folgt Rework oder die ausdrückliche Annahme durch den Projektleiter (Folgen 4).

---

## Folgen

1. **M4 ist live bestätigt** (AC-M4-11). Kein Rework, keine Rückkehr in Apply. R1 (`high`) bleibt als Restrisiko.
2. **M3: Die Tab-Konvention ist belegt**, R1 ist in diesem Teil geschlossen; der Rückfall über `HandlebarsApplicationMixin` entfällt. Die
   Funktion des Hubs ist bestätigt, die Optik nur teilweise (F1, F2).
3. **Nachführung der Dokumente** (ausdrücklich, nicht still): `docs/ui-guide.md` Abschnitt 4 (belegt, abweichend, offen) und die Spalte "Why" von
   R-06; `docs/api-contract.md` Abschnitt 8 (was live belegt ist); `dadm/README.md` (Statustabelle).
4. **Entscheidung zu F1 (Projektleiter):**
   - **(A) M3-Nacharbeit mit Foundrys eigenen Mitteln, ohne eigenes CSS (Empfehlung):** `window.contentClasses: ["standard-form"]` für die
     Anordnung und `HTMLRangePickerElement` für Zahlen mit `range` (F2). Kleiner Deploy nach eigenem "Go"; die Prüfung wird mit dem M5-Paket
     gebündelt, es entsteht kein zusätzlicher Live-Durchgang. Risiko: Die Wirkung der Klasse in v13 ist eine Hypothese (die Referenz nennt sie nur
     für v14). Schlägt sie fehl, bleibt Versuch 2 (minimales, auf eine eigene Klasse begrenztes CSS nach R-13) oder die Annahme. Rework-Limit: 2.
   - **(B) Abweichung annehmen:** Der Leitfaden nennt sie bereits; Neubewertung in M8.
   - **(C) Nacharbeit vor M5:** dieselbe Änderung, aber mit eigenem Live-Durchgang vor M5.

   Die Frage wird zusammen mit dem "Go" für das M5-Deploy gestellt; Discover und Apply von M5 hängen nicht davon ab.
5. **Offene, nicht blockierende Prüfungen** für das nächste Paket: Werte nach Schließen und Wiederöffnen; 11 in Level; Ansicht als Spieler
   (der Knopf darf nicht erscheinen); optional den `value` des Ping aufklappen; M2-U2 und M2-U3 nur auf Wunsch.
6. **M5 startet** nach Working Mode: Discover und Apply eigenständig, Stopp vor dem Deploy für das "Go"; bei einem `high`-Security-Fund im
   Apply eine Human Decision.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m4-05-live-check-output.md` (dieses Dokument) | immutable |

Geändert im Zuge dieses Nachtrags: `docs/ui-guide.md`, `docs/api-contract.md`, `dadm/README.md`.

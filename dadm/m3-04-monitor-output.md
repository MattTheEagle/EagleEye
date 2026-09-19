# M3 — Hub-Oberfläche (mit UI-Leitfaden) — Monitor Output

```
artifact: monitor-output
milestone: M3
phase: MONITOR
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m3-03-deploy-output.md` (Implementierung, Proofs, Acceptance-Checkliste)
- `m3-02-apply-output.md` (Design, Übergaben), `m3-01-discover-output.md` (Fakten, U1–U5)
- `04-milestone-plan.md` (M3), `03-scope-declaration.md`, `06-working-mode.md`
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: die echten Test-Module gegen die echte `core/`-Logik in einem
  nachgebildeten Foundry (Simulation), die Live-Check-Pakete, die Vertrags- und Leitfaden-Prüfungen aus dem Deploy

---

## Validation Result

**M3 hat sein Ziel erreicht, soweit es ohne Forge prüfbar ist.** Die Logik hinter Hub, Registerkarten, Start-Aktion und
Einstellungen ist getestet, der Vertrag Teil 2 und der UI-Leitfaden liegen vor und sind gegen Code und Referenz geprüft. Wie das
Fenster in Foundry aussieht und ob die Registerkarten schalten, ist nur live prüfbar.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M3-01 bis AC-M3-12 | erfüllt (Belege im Deploy-Output) |
| AC-M3-13 (Live: Hub öffnet, Tabs, Felder, Speichern, Open, nativer Stil) | **unverified**; Live-Check vom Projektleiter gewünscht, Anleitung unten |
| Simulation: echte Fixtures a, b, c, d gegen echte `core/`-Logik | Anmeldung a ok (mit `open`), c abgewiesen, d ok (ohne `open`); zwei Tabs (a aktiv, d); Feldarten `boolean`, `string` mit `choices`, `number` mit `range`, Neuladen-Hinweis; Start a ok, Start d `no-open-action`; Schreiben validiert wie geplant (`7` ok, `11` und `abc` `invalid-value`, `beta` ok, `gamma` `invalid-value`); b `not-allowed`, unbekannt `unknown-setting`, Spieler `not-permitted`; gespeicherte Werte folgen den Schreibvorgängen |
| Live-Check-Pakete | fünf Zips gebaut; das Flight-Control-Zip enthält `module.json`, `dist/module.js` und `lang/en.json`, Bundle und Sprachdatei sind byte-identisch mit dem Repo, der `languages`-Pfad zeigt auf eine Datei im Zip |
| Vertrag und Leitfaden | Vertrag gegen Code (Version, 7/7 Beispielzeilen, 7 Fehlercodes) und Leitfaden (13 Regeln, alle Belege auflösbar) laut Deploy-Output |

---

## Evidence Summary

- **Regressionen:** keine. Die 26 Tests aus M1 und M2 sind unverändert und bestehen; Gesamt 44 Tests in 7 Dateien, `typecheck`
  und `build` grün, Bundle 19,7 kB ohne `libWrapper` und ohne `innerHTML`.
- **Gewollte Verhaltensänderung:** Flight Control registriert im `init` zusätzlich das Einstellungsmenü "Open Eagle Flight
  Control" (nur GM); die API steht auf `0.2.0`, Anmeldungen mit `0.1.0` werden abgewiesen (Dummy a wurde umgestellt).
- **Simulationsbefund (kein Produktfehler):** Mein erster Simulationslauf führte die Fixtures in einem getrennten `vm`-Kontext
  aus; dort ist `Boolean` ein anderes Objekt, und die Art-Erkennung meldete alle Einstellungen als `unsupported`. In Foundry
  laufen Modul und Hub im selben Fenster; im selben Kontext erkennt der Hub alle vier Arten richtig. Sollte der Live-Check
  dennoch "not editable" mit Typnamen wie `Boolean` zeigen, wäre das der Hinweis auf U3 (Foundry wickelt die Typen um).
- **Nichts angefasst:** `package.json`, Lock-Datei, `v13/tsconfig.json`, `core/manifest-scanner.ts`, `core/index.ts`,
  `core/eagle-api.ts`, GitHub-Release. Kein Commit, kein Push, kein Live-Test durch mich.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **R1 bleibt offen:** Tabs mit selbst gebauten Inhalts-Abschnitten (Konvention `section.tab[data-group][data-tab]`, Klasse `active`) und der native Look sind nur live prüfbar. Der Projektleiter hat das Risiko mit dem "Go" angenommen. Trifft die Konvention nicht zu, geht M3 mit der Variante über `HandlebarsApplicationMixin` zurück in Apply. | `medium` | no |
| F2 | AC-M3-13 ist bis zum Live-Check `unverified`; ebenso die aus M2 offenen Punkte U1 bis U3 (Ladereihenfolge, deaktivierte Flight Control, Erzwingen der Versionsspanne) und das Fehlen des alten Menüs "EagleEye Hub" (AC-M1-12). | `low` | no |
| F3 | **Ergänzt im Monitor, nicht im Deploy:** `test-fixtures/eagleeye-dummy-d/` (Test-Modul, das sich kompatibel ohne `open` anmeldet und eine Text-Einstellung hat). Grund: Mit nur einem angemeldeten Dummy gäbe es genau einen Tab, das Umschalten der Registerkarten (P-FC4) wäre live nicht prüfbar. Reine Testhilfe, kein Produktcode, nicht in der Dateiliste des Deploy-Outputs; hier ausdrücklich ausgewiesen. | `low` | no |
| F4 | `lang/en.json` gehört ab jetzt in jedes Paket, sonst zeigt der Hub rohe Schlüssel (sichtbar). Die Release-Zips des Projektleiters brauchen den Ordner `lang/`; Vorschlag: Packaging-Skript in M8. | `low` | no |
| F5 | Die Aussagen des Leitfadens zur Optik (R-04 Konvention, R-13 CSS) sind nur durch Referenz bzw. Hub-Code belegt und stehen als `unverified`; nach dem Live-Check ist Abschnitt 4 des Leitfadens und Abschnitt 7 des Vertrags nachzuführen. | `low` | no |
| F6 | Die Nummerierung der Abschnitte im API-Vertrag hat sich geändert (neuer Abschnitt 3 "The hub", Kompatibilität jetzt 4). Die unveränderlichen M2-Dokumente verweisen mit den alten Nummern; die Änderungshistorie des Vertrags hält die Änderung fest. | `info` | no |
| F7 | T4 (zwei Plan-Stellen in `EAGLE-MODULES-PLAN.md` und `dadm/eagle-modules-projektplan.md` sowie das Root-`README.md` nachführen) bleibt offen; Vorschlag "mit M8". | `info` | no |
| F8 | Der Hub ist bis M6 nur für den Gamemaster (`restricted`, `canWrite` = GM); wie Spieler Module und Einstellungen erleben, entscheiden M5/M6. | `info` | no |

Kein `high`/`critical`-Fund, keine Human-Decision-Trigger, kein Rework.

---

## Live-Check (vom Projektleiter gewünscht, T2): Anleitung

Du deployst selbst auf Forge und siehst die Anzeige; ich führe nichts aus. Das Ergebnis halte ich danach in einem eigenen Artefakt
fest (`m3-05-live-check-output.md`), weil dieser Monitor-Output unveränderlich ist.

**Pakete** (fertig gebaut, gitignoriert, im Projektordner): `v13/dist/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-v13-m3.zip` | Flight Control (`module.json`, `dist/module.js`, **`lang/en.json`**) |
| `eagleeye-dummy-a.zip` | meldet sich mit `0.2.0` an, mit "Open", vier Einstellungen |
| `eagleeye-dummy-b.zip` | meldet sich nicht an (darf keinen Tab haben) |
| `eagleeye-dummy-c.zip` | meldet sich mit `9.0.0` an, wird abgewiesen (darf keinen Tab haben) |
| `eagleeye-dummy-d.zip` | meldet sich mit `0.2.0` an, ohne "Open", eine Text-Einstellung |

**Ablauf** (Zips im Import Wizard installieren wie zuvor; Flight Control überschreibt die alte Version):
1. In einer v13-Welt Flight Control und die vier Dummy-Module aktivieren (a, c und d verlangen `eagleeye`).
2. Welt neu laden, Konsole öffnen (F12), Zeilen mit `eagleeye` beachten.
3. Zahnrad → Einstellungen konfigurieren → in der Kategorie des Moduls "EagleEye" den Knopf **"Open Eagle Flight Control"** anklicken
   (nur als GM sichtbar).

**Erwartete Konsolenzeilen** (Reihenfolge von a, c und d hängt von Foundry ab):
```
eagleeye | ready (Foundry v13)
eagleeye | API attached (v0.2.0)
eagleeye | registered module eagleeye-dummy-a (api 0.2.0)
eagleeye | registration rejected for eagleeye-dummy-c: incompatible-api-version - … requests API 9.0.0, Flight Control provides 0.2.0
eagleeye | registered module eagleeye-dummy-d (api 0.2.0)
eagleeye | hub rendered: 2 tab(s)          <- erst beim Öffnen des Hubs
```
Keine Zeile der Form `eagleeye | hub: … is not editable (type …)` (sonst siehe Tabelle unten).

**Erwartete Anzeige im Hub** (Fenster "Eagle Flight Control"):
- eine Registerkartenleiste mit **zwei** Tabs: "EagleEye Dummy Test Module A" (aktiv) und "EagleEye Dummy Test Module D"; **keine** Tabs für b und c
- Tab A: Überschrift, "Version 0.0.1 (API 0.2.0)", Knopf **Open**, vier Felder: "Dummy A Enabled" (Checkbox), "Dummy A Mode"
  (Auswahl Alpha/Beta), "Dummy A Level" (Zahl 0 bis 10), "Dummy A Needs Reload" (Checkbox, Hinweis endet mit "Takes effect
  after a reload.")
- Tab D: Überschrift, Version, **kein** Open-Knopf, ein Textfeld "Dummy D Note" mit "hello"

**Was du ausprobierst**
1. Zwischen Tab A und Tab D wechseln und zurück.
2. In Tab A auf **Open** klicken: Meldung "eagleeye-dummy-a: open action called".
3. Level auf 7, Mode auf Beta, Enabled anhaken; Hub schließen und wieder öffnen: die Werte sind geblieben.
4. In Level **11** eintragen und das Feld verlassen: Der Wert springt zurück, eine Warnung nennt den Grund ("… must not be above 10").
5. Optional: als Spieler anmelden; der Knopf darf nicht erscheinen.

**Bitte mitgeben:** die Konsolenzeilen mit `eagleeye`, ein Screenshot des Hubs mit beiden Tabs (für den nativen Look) und eine Zeile,
was von 1 bis 4 funktioniert hat.

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| Alles wie erwartet, Look nativ | R1/U1/U2 belegt; AC-M3-13 erfüllt; Leitfaden und Vertrag werden nachgeführt |
| Hub öffnet, Tabs schalten nicht (Klick ohne Wirkung) | Konvention für Tab-Inhalte trifft nicht zu (U1); M3 geht mit der Handlebars-Variante zurück in Apply |
| Hub öffnet, Optik weicht ab (Tab-Leiste, Abstände, Felder) | U2 (CSS); Screenshot genügt, dann Entscheidung über minimales CSS oder Vorlagenvariante |
| Rohe Schlüssel wie `EAGLEEYE.hub.title` in Titel oder Texten | `lang/en.json` wird nicht geladen (Paket ohne `lang/`, Manifest) oder Fensterüberschrift nimmt keinen Schlüssel (A3) |
| Felder erscheinen als "Cannot be edited here" plus Konsolenzeilen `… (type X)` | U3: Foundry liefert die Typen anders; `X` bitte mitkopieren |
| Knopf unter Moduleinstellungen fehlt oder Fehler in der Konsole beim Öffnen | Fehler in der Hülle; Konsolentext genügt |

---

## Übergaben (zusätzlich zu Apply Abschnitt 10)

- **M4 (Anfragekanal-Kern):** Das Ergebnismuster `{ ok, reason, detail }` mit stabilen Codes gilt für Anfragen; `startModule` und
  `applySettingInput` folgen ihm bereits. Die Registry und die API sind live bestätigt (M2), unabhängig vom Ergebnis des Hub-Checks.
- **M5/M6:** `canWrite()` (heute `game.user.isGM`) wird durch die Nutzungsrechte je Modul und Nutzer ersetzt; Einstellungen für Spieler
  wären ein Anfragekanal-Fall (Q3 a).
- **M8:** Packaging-Skript (`module.json`, `dist/module.js`, `lang/`), Konsolidierung des Vertrags, Nachführen der Pläne und des
  Root-`README.md` (T4), Beleg-Stand des Leitfadens nach den Live-Checks.

---

## Recommendation

**Schließen.** M3 ist abgeschlossen (Status: Completed); nächster Milestone ist **M4** (Anfragekanal-Kern). R1 ist mit dem "Go"
angenommen und bleibt `medium`, bis der Live-Check gelaufen ist.

Hinweis zur Reihenfolge: M4 baut auf Registry und API auf (live bestätigt), nicht auf dem Hub-Fenster. Ein Fehlschlag des Hub-Checks
ändert die Grundlage von M4 deshalb nicht; nach Working Mode laufen Discover und Apply von M4 eigenständig weiter, vor dem
M4-Deploy wartet der Ablauf auf das "Go".

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m3-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| `test-fixtures/eagleeye-dummy-d/` (Testhilfe, siehe F3) | durable (Repo; nicht committet) |
| Live-Check-Pakete in `v13/dist/live-check/` (fünf Zips) | ephemeral |

M3-Abschlusskette: `m3-01-discover-output.md`, `m3-02-apply-output.md`, `m3-03-deploy-output.md`, `m3-04-monitor-output.md` (alle
`immutable`). Folgeartefakt nach dem Live-Check: `m3-05-live-check-output.md`.

---

## Next Step

Discover M4 (Anfragekanal-Kern) eigenständig, danach Apply, dann Stopp vor dem M4-Deploy für das "Go". Parallel wartet der Live-Check
des Hubs auf den Projektleiter.

# M8 — Abschluss: API-Vertrag, Gesamtprüfung, Release-Entscheidung — Discover Output

```
artifact: discover-output
milestone: M8
phase: DISCOVER
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Wahl von Vertragsaufbau, Versionsnummer, Paketierung oder Archivierung (Aufgabe des Apply). Belege nennen die Fundstelle; was sich ohne Live-Test nicht belegen lässt, steht getrennt.

---

## Input Summary

- `04-milestone-plan-v2.md` (M8, Zeilen 245 bis 262; Rückverfolgungstabelle), `03-scope-declaration.md`, `02-safety-boundaries.md`, `06-working-mode.md`, `01-project-brief.md`
- Übergaben an M8 aus `m2-02` (Abschnitt 10), `m3-02` (Abschnitt 10), `m5-02`/`m5-04`, `m6a-02` (Abschnitt 10), `m6b-04` und `m7-04` (Abschnitt "Übergaben")
- Repo-Ist nach M7: `docs/api-contract.md` und `docs/ui-guide.md`, `README.md`, `package.json`, `v13/module.json`, `.gitignore`, `v13/relay.ts`, `core/request-relay.ts`, alle Live-Check-Nachträge (`m2-05`, `m4-05`, `m5-05`, `m6a-05`, `m6b-05`, `m7-05`)
- Archivierte Phasen (`dadm/archive/`, insbesondere `planning-phase-3/SUMMARY.md`) als Muster für das Abschließen einer Phase
- Die gemeinsame Foundry-Referenz (`foundry-vtt-reference-v13/cheat-sheet.md`, `README.md`)
- Kein Web-Abruf, kein Live-Test, kein Code geändert. **Nicht geprüft:** ob auf GitHub ein Release zu `v13-v0.0.1` besteht (Netzwerk).

---

## Current-State Summary

- **M1 bis M7 sind abgeschlossen und live bestätigt** (Details in den Nachträgen). Stand: API `0.7.0`, 136 Tests in 16 Dateien, Bundle 55,1 kB, `docs/api-contract.md` 564 Zeilen (Abschnitte 1 bis 10), `docs/ui-guide.md` mit 14 Regeln.
- **Vorgabe (Plan v2, M8):** ein konsolidierter, versionierter API-Vertrag; eine Gesamtprüfung gegen die Rückverfolgungstabelle und der Stand aller `unverified`-Punkte; Übergabe an die nächste Phase (Eagle Library). Scope: Teile 1 bis 7 im Vertragsdokument zusammenführen (Ort aus M1); Acceptance aller Milestones abgleichen; Liste der offenen Live-Punkte, die der Projektleiter einzeln freigeben oder als Restrisiko annehmen kann; Versionsnummer in `module.json`; GitHub-Release nur auf ausdrückliche Anweisung.
  Deliverables: konsolidierter Vertrag, Gesamtprüfung, Übergabenotiz mit Empfehlung, `SUMMARY.md` beim Archivieren der Phase. Acceptance: jede Zeile P-FC1 bis P-FC7 hat einen Beleg (`verified` oder ausdrücklich `unverified` akzeptiert), P-FC6 nur im Umfang des Versionswächters, P-FC8 als entfallen vermerkt, der Vertrag ist vollständig, `typecheck`, `test`, `build` grün. Risiko laut Plan `low`.
- **Die Vorgaben zum Veröffentlichen sind eng:** Nur `github.com/MattTheEagle/EagleEye`, Releases nur bei echten Milestone-Abschlüssen (Hybrid-Workflow) und **nur auf ausdrückliche Anweisung**; Commit und Push nur auf ausdrückliche Anweisung (`02`, `03`, `06`).

---

## Inventory

### Repo-Ist

| Baustein | Ort | Fakt |
|---|---|---|
| API-Vertrag | `docs/api-contract.md` | Abschnitte 1 bis 10 (Getting the API, Registering, The hub, Requests, API version and compatibility, Manifest requirements, Behaviour when missing, What is verified, Not part of this version, Change history). Die Vertragsteile 5, 6 und 7 stehen als **Unterabschnitte in Abschnitt 4** ("Who asked", "Rights per module and user", "The game system"). Der Text spricht in 23 Zeilen von "part n"; Titel und Kopf nennen "parts 1 to 7"; die Historie hat sieben Zeilen (`0.1.0` bis `0.7.0`). |
| Verweise auf Abschnittsnummern | Vertrag, `docs/ui-guide.md`, `dadm/m*` | Im Vertrag: Abschnitte 2, 4, 5, 6; im UI-Leitfaden "contract section 2"; in den **unveränderlichen** Prozessdokumenten und im Memory: "Abschnitt 8" (What is verified) und "Abschnitt 5". |
| UI-Leitfaden | `docs/ui-guide.md` | Kopf: "written together with the Flight Control hub (API contract `0.2.0`)" (überholt, API ist `0.7.0`); Regeln R-01 bis R-14, Checkliste, Abschnitt 4 mit belegt, beobachtet, unverified. |
| Manifest | `v13/module.json` | Felder: `id` `eagleeye`, `title` `EagleEye`, `description` (endet mit "In Entwicklung."), `version` **`0.0.1`**, `authors` `[{ "name": "Projektleiter" }]` (Platzhalter), `compatibility` 13/13, `esmodules`, `languages`, `manifest` (`…/releases/latest/download/module.json`), `download` (`…/releases/download/v13-v0.0.1/eagleeye-v13.zip`). Es fehlen `url`, `bugs`, `changelog`, `flags`; keine Lizenz (Entscheidung: keine Lizenz). |
| `package.json` | Wurzel | `private: true`, `version` `0.0.1`; Skripte `build`, `build:v13`, `typecheck`, `typecheck:v13`, `test`; **kein Skript zum Paketieren**. |
| Paketieren heute | — | Die Live-Check-Zips entstanden von Hand mit `zip` (Flight Control: `module.json`, `dist/module.js`, `lang/en.json`; Testmodule: `module.json`, `module.js`). `.gitignore` schließt `dist/`, `*.zip`, `*.tar.gz` aus. `gh` ist installiert (`/usr/bin/gh`), wurde nie benutzt. |
| Tag und Release | Git | Lokal ein Tag `v13-v0.0.1` (Commit `55dbed9`, 2026-09-17, "einmaliger Nachweis" des Hybrid-Workflows in der Forschungsphase). Das Manifest zeigt weiter auf dieses Release. |
| Wurzel-`README.md` | Wurzel | "In Entwicklung (Umsetzungsphase 4)", Verweis auf `dadm/` und den Plan, Abschnitt "Build" (`npm install`, `build`, `typecheck`, `test`). Nichts zu Installation, Umfang oder Vertrag. |
| Bestätigte Pläne (T4) | `EAGLE-MODULES-PLAN.md` Z. 103 bis 105; `dadm/eagle-modules-projektplan.md` Z. 67 | Z. 103 bis 105: "das Grundgerüst aus der ersten Phase hat bereits ein solches Fenster (bisher eine Tabelle ohne Registerkarten)" — das Fenster ist seit M1 entfernt und der Hub neu gebaut. Projektplan Z. 67: "Entscheidung über Entfernen in der Umsetzungsphase (E6)" — in M1 entschieden. Beide Dokumente sind bestätigte Pläne; Nachführen nur als ausdrücklich benannter Schritt mit Freigabe (`03`). |
| Diagnosezeile aus M5 | `v13/relay.ts` Z. 64 bis 82 | Beim ersten eingehenden Query schreibt der GM-Client `eagleeye \| relay: first query received, extra handler arguments: …` (beantwortete Frage U1 aus M5; erscheint in den Live-Logs). |
| Grenzen des Relais | `core/request-relay.ts`, `core/request-identity.ts` | Größe 65.536 Zeichen, Wartezeit 15 s, Bestätigung 5 s. **Keine Grenze** für die Zahl gleichzeitiger weitergeleiteter Anfragen eines Clients oder für Rückfragen an einen Nutzer; offene Kennungen (`pending`) werden am Ende jeder Anfrage entfernt. |
| Gemeinsame Foundry-Referenz | `foundry-vtt-reference-v13/cheat-sheet.md` | **Leer** (13 Zeilen, nur Vorlage): "hier kommen destillierte, tatsächlich wiederverwendete Patterns rein, sobald sie in einem konkreten v13-Modul gebraucht wurden". Die Regel in der Projekt-Konfiguration verlangt, tatsächlich wiederverwendete Erkenntnisse dort nachzutragen; Schreiben dort ist freigabepflichtig (`02`, `03`). |
| Prozessdateien | `dadm/` | 55 Dateien im Wurzelordner: Bootstrap (`01` bis `06`, dazu `04-…-v2` und `05-…-v2`), rund 50 Milestone-Outputs (`m1-…` bis `m7-…`), `README.md`, `bios.registry.json`, `eagle-modules-projektplan.md`; dazu die Ordner `archive/` und `reference/`. |
| Muster für ein Phasenende | `dadm/archive/planning-phase-3/` | Bootstrap, Pläne, Freigaben, alle Milestone-Outputs und Decision-Records liegen im Archivordner, dazu `SUMMARY.md` (Auftrag und Ergebnis, Inhalt des Ordners, wichtigste Ergebnisse, nächster Schritt; "Verweise innerhalb der archivierten Dateien nennen die ursprünglichen Pfade `dadm/…`"). Lebende Dokumente bleiben außerhalb. |

### Vorgaben aus den Übergaben der Milestones

| Quelle | Punkt für M8 |
|---|---|
| `m2-02` | API-Versionspolitik (wann `1.0.0`), Bereitstellung der Typen für andere Repos, Konsolidierung des Vertrags |
| `m3-02`, `m1-04` (F1) | Packaging-Skript (`module.json`, `dist/module.js`, `lang/`); Vertrag konsolidieren; Pläne und Wurzel-`README.md` nachführen (T4) |
| `m5-02`, `m6a-02` (S7) | Ratenbegrenzung prüfen; Diagnosezeile aus M5 entfernen |
| `m6b-04`, `m7-04` | Vertrag zusammenführen und umnummerieren ("Verweise in älteren Dokumenten beachten"); `relationships.systems` prüfen; Liste getesteter Versionen beim Release pflegen; Versionspolitik; Gesamtprüfung; offene `unverified`-Punkte; Release-Entscheidung |

### Beleglage je Spezifikationszeile (Grundlage der Gesamtprüfung; Fakten, keine Wertung)

| ID | Anforderung | Milestones | Belege | Stand |
|---|---|---|---|---|
| P-FC1 | Schnittstelle zwischen Foundry, DnD-5e-System und Eagle Modulen | M2, M4, M7 | `m2-05` (Anmeldung live), `m4-05` (Anfragen live), `m7-05` (Systemwächter, Standardfall live) | live; die Zustände des Wächters außer `tested` `unverified` |
| P-FC2 | Nur eigene Eagle Module angebunden | M1, M2 | `m1-04`, `m2-05`; der Vertrag schließt fremde Module aus, ohne es technisch zu erzwingen (Entscheidung E6: "nur im Vertrag ausschließen") | durch den Vertrag |
| P-FC3 | Hub bündelt die Einstellungen der Module | M3, M6b | `m4-05`, `m5-05`, `m6b-05` | live |
| P-FC4 | Registerkarte je installiertem aktivem Modul | M3 | `m4-05` (Tabs für a und d; b ohne Anmeldung und c inkompatibel ohne Tab) | live |
| P-FC5 | Modul aus dem Hub starten | M3 | `m4-05` (Open ruft die Startfunktion) | live |
| P-FC6 | Versteht Foundry-API und DnD-Systemlogik | M7 | `m7-05` | **nur Versionswächter** (Plan); live für `tested` |
| P-FC7 | Empfängt Anfragen und führt sie aus | M4, M5, M6a, M6b | `m4-05`, `m5-05`, `m6a-05`, `m6b-05` | live |
| P-FC8 | Klartext und Code | — | Entscheidung U2 | **entfällt in dieser Phase** |

### Offene Live-Punkte (`unverified`), Sammlung aus Vertrag Abschnitt 8 und den Nachträgen

| # | Punkt | Herkunft | Aufwand einer Prüfung |
|---|---|---|---|
| L1 | Fehlerwege des Relais in Flight Control selbst: `relay-timeout`, `relay-failed`; mehrere GMs gleichzeitig | M5 | mehrere GMs: zweites GM-Konto nötig; die Fehlerwege sind schwer von außen auszulösen |
| L2 | Fehlerwege der Bestätigung in Flight Control: ein Nutzer, der nicht verbunden ist; die 5-Sekunden-Grenze | M6a | nicht verbundener Nutzer: einfach (der Spieler verlässt die Welt); Zeitgrenze schwer auszulösen |
| L3 | Rechte: Besitzprüfung für GM, Compendium und "Inherit"; ob ein Assistent Welteinstellungen schreiben darf; der Rechte-Block für einen Assistenten; mehr als ein Spieler; gelöschte und neu angelegte Nutzer | M6b | Assistentenkonto und zweites Spielerkonto nötig |
| L4 | Systemwächter: der Hinweis beim GM zur Zeit `ready`; die Zustände `same-line`, `untested`, `other-system`, `unknown` in Foundry; was ein Spieler sieht | M7 | die vier Prüfpakete liegen im Ordner; je Paket ein Neuladen |
| L5 | Hub: Umgang mit einem abgelehnten Wert (Feld zurücksetzen, Hinweis); ob der Regler einen zu großen Wert begrenzt; der Hub für einen Spieler (der Menüknopf soll fehlen, Test E aus M5) | M3 bis M5 | einfach, je ein Blick oder eine Eingabe |
| L6 | Fehlergründe `invalid-request`, `unsupported-version`, `handler-failed`, `internal-error` (nur Vitest) | M4 | `invalid-request` und `unsupported-version` mit je einer Konsolenzeile; die beiden anderen sind von außen kaum auszulösen |
| L7 | Reihenfolge der `init`-Callbacks; ein aktives Modul, dessen Voraussetzung deaktiviert ist; ob Foundry `compatibility` in `relationships.requires` erzwingt | M2 | Modul deaktivieren und Welt laden; einfach |
| L8 | `scope: "user"`-Einstellungen, Stabilität der Nutzer-IDs (Annahme aus M6) | M6 | nur beobachtbar, kein eigener Test |

---

## Dependencies

- **Code:** M1 bis M7. Betroffen wären, je nach Wahl im Apply, `v13/relay.ts` (Diagnosezeile, ein Baustein aus M5), `v13/module.json` (Version, Felder), `package.json` (Skript), `README.md`, ein neues Paketier-Skript (Ort innerhalb von `core/`, `v13/` oder `docs/`, der Schreibbereich laut `03`).
- **Schreibbereich (`03`):** `core/`, `v13/` (mit `module.json`), `test-fixtures/`, `package.json` (nur Skripte und Metadaten), `README.md`, `docs/`, `dadm/`. **Nur mit ausdrücklicher Freigabe:** die bestätigten Pläne (`EAGLE-MODULES-PLAN.md`, `dadm/eagle-modules-projektplan.md`), das extern liegende `foundry-vtt-reference-v13/` (dessen `cheat-sheet.md`), Änderungen an archivierten Artefakten.
- **Nicht im Scope (`03`):** Umbenennung von Modul-ID, Manifest-Titel oder Repo; Lizenzdatei; neue Repos; Publizieren außerhalb des einen Repos; Dependency-Änderungen; Live-Tests ohne Freigabe je Test.
- **Tests:** Vitest für alles mit Logik; Vertrag und Manifest lassen sich mit Skripten gegen den Code prüfen (wie bisher).
- **Entscheidungen des Projektleiters (Go):** die Punkte, die das Apply als T-Punkte zum "Go" vorlegt; ein Release nur auf seine ausdrückliche Anweisung.

---

## Risks and Assumptions

| # | Risiko | Severity | Blocking |
|---|---|---|---|
| R1 | **Umnummerieren des Vertrags** würde die Verweise "Abschnitt 8" und "Abschnitt 5" in den unveränderlichen Prozessdokumenten und im Memory entwerten; das Zusammenführen kann die Nummern stabil lassen oder eine Zuordnungstabelle beilegen. | `low` | no |
| R2 | **Veröffentlichen ist nach außen wirksam** und nur eingeschränkt umkehrbar (ein Release, ein Tag, eine Manifest-URL, die Installationen anstößt). Erlaubt ist es nur auf ausdrückliche Anweisung und nur im einen freigegebenen Repo; Manifest-URLs und Tag müssen zusammenpassen. | `low` (ohne Anweisung kein Schritt) | no |
| R3 | **Versionsnummern:** Eine zu frühe `1.0.0` würde die Stabilitätszusage ("bis 1.0 bricht eine Nebenversion") beenden, bevor der erste Verbraucher (Eagle Library) den Vertrag benutzt hat. Modulversion und API-Version sind laut Vertrag unabhängig. | `low` | no |
| R4 | **Cross-Milestone-Änderung:** Das Entfernen der Diagnosezeile berührt `v13/relay.ts` aus M5; der Plan weist es M8 zu, die ausdrückliche Zustimmung kommt mit dem "Go". Eine Ratenbegrenzung würde das Relais (M5, M6a) ändern und wäre eine Verhaltensänderung an einem live bestätigten Baustein. | `low` | no |
| R5 | **Archivieren** verschiebt rund 50 Dateien; Pfade in den Dokumenten, im Memory und in der `README.md` ändern sich. Das Muster früherer Phasen benennt das in der `SUMMARY.md`. | `low` | no |
| R6 | Nachführen der **bestätigten Pläne** und Schreiben in die **gemeinsame Referenz** brauchen die Freigabe des Projektleiters (Scope). | `low` | no |
| R7 | **Offene Live-Punkte:** Sie bleiben `unverified`, bis der Projektleiter sie einzeln freigibt oder das Restrisiko ausdrücklich annimmt; der Plan lässt das Schließen mit `unverified`-Punkten nach dieser Annahme zu. | `low` | no |
| A1 | **Annahme:** Ein GitHub-Release zu `v13-v0.0.1` besteht (Discover prüft kein Netzwerk); ein neues Release bräuchte ein neues Tag und ein angepasstes `download`-Feld. | `low` | no |

`critical` liegt nicht vor; kein Fund ist `medium` oder höher.

---

## Open Questions

**Für das Apply (Design; was den Projektleiter betrifft, kommt als T-Punkt zum "Go"):**

1. **Aufbau des konsolidierten Vertrags:** Nummern stabil lassen oder umnummerieren (R1); wie die "Teil n"-Sprache im Text aufgeht (Herkunft je Funktion als Angabe "seit API 0.x.0" statt als Teil); Inhaltsverzeichnis; wo "What is verified" und die Historie stehen; ob der Status "development" bleibt.
2. **Versionspolitik:** Welche Modulversion trägt `module.json` (heute `0.0.1`) und `package.json`? Bleibt die API-Version `0.7.0` (Änderungen in M8 betreffen den Vertrag nicht)? Wann würde `1.0.0` gelten (R3)? Tag-Schema (`v13-v<Version>` wie beim ersten Release)?
3. **Manifest und Release-Artefakte:** `authors` (Platzhalter "Projektleiter"), `url`, `bugs`, `changelog`, `download`-Feld; welche zwei Dateien ein Release enthält (Manifest und Zip); ob das Apply nur die Artefakte und eine Anleitung vorbereitet, während Tag, Push und Release **nur auf ausdrückliche Anweisung** folgen (R2).
4. **Paketier-Skript:** Sprache und Ort (Schreibbereich), Ausgabe (Ordner, Namen), Prüfungen (Version im Manifest, Bundle frisch, keine Testmodule im Paket), Umgang mit `*.zip` in `.gitignore`.
5. **Typen für andere Repos:** genügt der TypeScript-Block im Vertrag, oder wird eine `.d.ts`-Datei bereitgestellt (und wo, ohne Dependency-Änderung)?
6. **Restpunkte im Code:** Diagnosezeile entfernen (ja, nach Plan); Ratenbegrenzung umsetzen, dokumentieren oder als Restrisiko annehmen (R4).
7. **Nachführen der Pläne und des Wurzel-`README.md` (T4):** genaue Änderungen an beiden Plan-Stellen und Umfang der `README.md`; ob darüber hinaus im "Stand der Prüfung" des Plans Aussagen zu Anfragekanal und Hub auf "umgesetzt und geprüft" zu heben sind; UI-Leitfaden-Kopf.
8. **Offene Live-Punkte (L1 bis L8):** welche der Projektleiter freigibt und welche er als Restrisiko annimmt; Vorschlag einer kurzen Prüfliste für die einfachen.
9. **Gesamtprüfung:** Form (Tabelle je P-FC-Zeile und je Milestone-Acceptance mit Beleg und Urteil), Ort, und wie sie mit dem Vertrag zusammenhängt.
10. **Übergabenotiz mit Empfehlung für die nächste Phase (Eagle Library):** Inhalt, Ort (Prozessdokument oder lebendes Dokument), Verhältnis zum Plan.
11. **Archivieren der Phase:** Zeitpunkt (mit dem Deploy oder nach der Release-Entscheidung), Zielordner, Inhalt der `SUMMARY.md`, Umgang mit `dadm/README.md`, `bios.registry.json` und den Pfaden in Dokumenten und Memory.
12. **Nachträge in die gemeinsame Foundry-Referenz:** Welche tatsächlich wiederverwendeten Erkenntnisse dieser Phase (etwa `User#query`, Weltbestimmungen, `standard-form`, Tabs, Besitzprüfung, `game.system`) als Entwurf dem Projektleiter vorgelegt werden, bevor dort geschrieben wird.

**Praktisch:** Für die einfachen Live-Punkte (L5 bis L7) genügt eine Sitzung des GM; für L3 wären ein Assistentenkonto und ein zweites Spielerkonto nötig.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m8-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

Apply (M8), eigenständig: Aufbau des Vertrags, Versionspolitik, Manifest und Release-Artefakte (ohne Veröffentlichen), Paketier-Skript, Restpunkte im Code, Nachführen von Plänen und `README.md`, Prüfliste der offenen Live-Punkte, Gesamtprüfung, Übergabenotiz, Archivierung, Nachtrags-Entwurf für die gemeinsame Referenz, Testplan und Akzeptanzkriterien. Der Deploy wartet auf das "Go".

# M8 — Abschluss: API-Vertrag, Gesamtprüfung, Release-Entscheidung — Deploy Output

```
artifact: deploy-output
milestone: M8
phase: DEPLOY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Umsetzung des Designs aus `m8-02-apply-output.md` nach dem "Go" des Projektleiters. **Kein Commit, kein Tag, kein Push, kein Release.** Die Live-Abnahme des Release-Zips folgt im Monitor.

---

## Input Summary

- **Go des Projektleiters (2026-09-20):** T1 bis T13 wie vorgeschlagen; Modulversion **`0.1.0`**; Name in `authors` **`MattTheEagle`**. Zur Frage nach den Nachführungen außerhalb des Codes hat er **nur "Pläne: die zwei Stellen aus Befund F1"** gewählt. Nicht gewählt und deshalb **nicht ausgeführt**: das Heben der Status-Überschriften im Plan und die Nachträge in `foundry-vtt-reference-v13/cheat-sheet.md`.
- **Ausgangslage:** 136 Tests in 16 Dateien grün, typecheck und build grün, Arbeitsbaum mit den Dokumenten aus M7 und M8 (Discover, Apply) uncommittet.

---

## Implementation Summary

1. **Code (T6):** In `v13/relay.ts` sind `describeExtraArguments`, das Flag `diagnosed`, die Log-Zeile und der Parameter `log` samt Import entfernt; `registerRelayQueries(relay)` setzt beide Queries wie zuvor. Ein Kommentar hält fest, warum es die Bestätigung gibt (Foundry reicht dem Handler nur die Daten und `{ timeout }`). `v13/module.ts` ruft die Funktion ohne `log`. Das Bundle ist von 56.386 auf 55.924 Byte gesunken (−462).
2. **Manifest und Metadaten (T2, T3):** `v13/module.json`: Version `0.1.0`, englische Beschreibung ("Early release for testing."), `authors` `MattTheEagle`, neu `url` und `bugs`, `download` auf `v13-v0.1.0`; kein `relationships.systems`, keine Lizenz. `package.json`: Version `0.1.0`, englische `description`, neues Skript `package`. `.gitignore`: `release/`. **Keine Dependency-Änderung.**
3. **Vertrag (T1, `docs/api-contract.md`):** Abschnittsnummern 1 bis 10 unverändert; Titel ohne "parts 1 to 7"; neuer Kopf mit der Tabelle "What the API offers" (die fünf Mitglieder, je mit "Since API") und einem Inhaltsverzeichnis; die Unterabschnitte in Abschnitt 4 tragen "since API `0.x.0`"; "part n" steht nur noch in den sechs Historienzeilen (plus eine Anmerkung dort, dass der Text am 2026-09-20 ohne API-Änderung zusammengeführt wurde). Neu: die Regel zu `1.0.0` (Abschnitt 5), der Punkt "There is no limit" (Abschnitt 4, dazu Abschnitt 9). Die API bleibt `0.7.0`.
4. **Tests (Testplan P1 bis P7):** `core/manifest.test.ts` (7 Tests) und `core/api-contract.test.ts` (19 Tests). Sie halten das Manifest und `package.json` (Version, URLs, Dateien, Abhängigkeiten) und den Vertrag gegen den Code (API-Version, Kompatibilitätstabelle, Fehlercodes der Anmeldung und der Anfragen, Grenzen, Anfragetypen mit Ausführungsort, die fünf API-Mitglieder, Stufen der Rechte, Ablehnungstexte, Zustände und Liste des Systemwächters, Fehlergründe, Aufbau des Vertrags).
5. **Paketier-Skript (T4):** `v13/package.mjs` (151 Zeilen, ohne Dependency) über `npm run package`: prüft das Manifest, baut, stellt nur die im Manifest genannten Dateien zusammen, erzeugt `release/eagleeye-v13.zip` und `release/module.json`, prüft den Zip-Inhalt und gibt Größe und Prüfsumme aus. Es veröffentlicht nichts und fasst Git nicht an.
6. **Dokumente (T7):** Wurzel-`README.md` neu geschrieben; Kopf von `docs/ui-guide.md` nachgeführt; in den bestätigten Plänen **nur die zwei Stellen aus Befund F1** geändert (Diff unten).
7. **Entwürfe (T10, T11):** `dadm/uebergabe-naechste-phase.md` (lebendes Dokument) und `dadm/entwurf-summary-implementation-phase-4.md` (wird beim Archivieren zu `SUMMARY.md`); der Entwurf der Referenz-Nachträge liegt unverändert in `m8-02`, Abschnitt 12.
8. **Nicht ausgeführt:** Eintrag in `cheat-sheet.md` (keine Freigabe), Status-Überschriften im Plan (keine Freigabe), Archivieren, Tag, Push, GitHub-Release, Commit (jeweils nur auf Anweisung).

---

## Files Changed

| Datei | Änderung |
|---|---|
| `v13/relay.ts` | Diagnosezeile entfernt (+4/−22 Zeilen, inkl. Import und Kommentar) |
| `v13/module.ts` | Aufruf ohne `log` (+1/−1) |
| `v13/module.json` | Version, Beschreibung, Autor, `url`, `bugs`, `download` (+6/−4) |
| `package.json` | Version, Beschreibung, Skript `package` (+4/−3) |
| `package-lock.json` | nur die zwei Versionsangaben des Wurzelpakets (4 Zeilen); identisch zu dem, was `npm install --package-lock-only` schreibt (in einer Kopie verglichen) |
| `.gitignore` | `release/` |
| `v13/package.mjs` | **neu**, Paketier-Skript |
| `core/manifest.test.ts`, `core/api-contract.test.ts` | **neu**, 7 und 19 Tests |
| `docs/api-contract.md` | konsolidiert (+82/−34, siehe Implementation Summary) |
| `docs/ui-guide.md` | Kopf (1 Zeile) |
| `README.md` | neu geschrieben (+45/−15) |
| `EAGLE-MODULES-PLAN.md`, `dadm/eagle-modules-projektplan.md` | die zwei Stellen aus Befund F1 (2 und 1 Zeile) |
| `dadm/uebergabe-naechste-phase.md`, `dadm/entwurf-summary-implementation-phase-4.md` | **neu**, Entwürfe |
| `dadm/README.md`, `dadm/m8-03-…` | Stand und dieses Dokument |

**Unverändert (per `git diff` gegen `HEAD` geprüft, leer):** `core/request-kernel.ts`, `request-relay.ts`, `request-identity.ts`, `request-handlers.ts`, `request-rights.ts`, `rights-table.ts`, `rights-hub.ts`, `system-guard.ts`, `module-registry.ts`, `settings-hub.ts`, `hub-model.ts`, `json-value.ts`, `manifest-scanner.ts`, `eagle-api.ts`, `api-version.ts`, `index.ts`, `v13/hub-application.ts`, `v13/rights.ts`, `v13/system.ts`, `v13/lang/en.json`. Ebenso `foundry-vtt-reference-v13/` (nichts geschrieben).

---

## Deviations and Clarifications (gegenüber dem Apply)

| # | Abweichung oder Klarstellung | Bewertung |
|---|---|---|
| D1 | `package-lock.json` steht im Apply unter "unverändert". Mit der neuen Version im `package.json` weichen die zwei Wurzel-Versionsangaben des Lockfiles ab; ich habe sie nachgezogen (4 Zeilen, keine Abhängigkeit). Ein Vergleich mit dem, was npm selbst schreibt (Kopie, offline), ist byte-gleich. | `low`, Folge aus T2 |
| D2 | Vertrag Abschnitt 6 (Absatz "Module version and API version") musste mitziehen: Er nannte `v13-v0.0.1` als aktuelles Release und `0.0.1` als `minimum`. Neu: eine Tabelle Modulversion → API-Version (`0.1.0` → `0.7.0`), die ein Test an die Modulversion des Manifests und die API-Version des Codes bindet. Der Apply nannte Abschnitt 6 "unverändert". | `low`, Folge aus T2 |
| D3 | Der neue Test hat eine **Lücke im Vertrag** gefunden (Befund F1 unten) und sie ist geschlossen. | `low`, Zweck des Tests |
| D4 | Der Apply schätzte "7 bis 9 neue Tests, etwa 144 in 18 Dateien". Es sind **26 neue Tests, 162 in 18 Dateien**, weil jede Eigenschaft ein eigener Test ist. Die Dateizahl stimmt. | keine Wirkung auf die Akzeptanz |
| D5 | Drei Code-Kommentare (`core/eagle-api.ts` Zeile 7 und 21, `core/request-handlers.ts` Zeile 104) verweisen auf "the API contract, part 6/7". Ich habe sie **nicht** angefasst: Die Historie im Vertrag ordnet "Part 6" und "Part 7" den API-Versionen zu, und die Dateien sollen unverändert bleiben. | `low` |
| D6 | Nicht freigegeben und deshalb nicht ausgeführt: Status-Überschriften im Plan, Nachträge in `cheat-sheet.md`. Der Apply hatte den Nachtrag als "mit dem Go freigegeben" vorgesehen, die einzelne Frage hat der Projektleiter aber nicht angehakt; die einzelne Antwort gilt. | Rückfrage am Ende des Monitors |

---

## Findings

| # | Fund | Severity | Stand |
|---|---|---|---|
| F1 | Der Vertrag nannte einen Ablehnungstext des Codes nicht: `the rights could not be set up, so nothing is allowed` (`REFUSE_ALL`: Flight Control konnte seine Rechte beim Start nicht aufbauen, alles wird verweigert, auch für einen Spielleiter, und `getRights` antwortet `denied`). Gefunden vom neuen Test "states every refusal text of the rights". Nur Dokumentation, kein Verhaltenswechsel. | `low` | behoben (Abschnitt 4 des Vertrags) |
| F2 | `sim-m6b.mjs` (Skript aus M6b) enthält zwei seit M7 veraltete Erwartungen ("genau vier Mitglieder", "API-Version 0.6.0"). Dasselbe Skript schlägt mit dem alten M7-Bundle genauso an; 48 weitere Prüfungen sind ok. Kein Befund am Produkt. | `info` | nur Skript, nicht angepasst |
| F3 | `check-ui-guide.mjs` (Skript aus M3) liest `fieldset` und `legend` in der Referenzspalte von R-14 als Dateipfade und meldet "2 Probleme". R-14 sagt dort ausdrücklich, dass die Referenz kein HTML enthält; alle übrigen Regeln finden ihre Symbole im Hub. Kein Befund am Leitfaden. | `info` | nur Skript, nicht angepasst |

Keine `medium`- oder `high`-Funde, keine Human-Decision-Trigger. **Cross-Milestone-Änderung** `v13/relay.ts` (M5) und die Änderung der zwei Plan-Stellen sind vom "Go" des Projektleiters gedeckt.

---

## Proofs

| # | Nachweis | Ergebnis |
|---|---|---|
| P1 | `npm run typecheck`, `npm run build`, `npx vitest run` | typecheck Exit 0; build 54,6 kB; **162 Tests in 18 Dateien grün** (vorher 136 in 16) |
| P2 | **Gegenproben:** 63 gezielte Verstellungen (32 im Vertrag, 18 im Code, 13 in Manifest und `package.json`), je eine Stelle; der erwartete Test musste rot werden, danach wurde jede Datei wiederhergestellt (Vergleich) | **63 von 63 gefunden**, alle Dateien wiederhergestellt, Lauf danach 0 rot von 26 (ein Skriptfehler bei einer Verstellung, Suchtext zweimal vorhanden, wurde korrigiert und einzeln wiederholt) |
| P3 | **Paketier-Skript, echter Lauf** (`npm run package`) | Exit 0; `release/eagleeye-v13.zip` 15,2 kB mit genau `module.json`, `dist/module.js`, `lang/en.json`; `release/module.json` 0,7 kB; beide gitignoriert |
| P4 | **Paketier-Skript in einem Nachbau des Repos** (3 Positivprüfungen, 13 Fehlerfälle: Versionen verschieden, `download` mit falschem Tag, `manifest` falsch, Version nicht `x.y.z`, Sprachdatei fehlt, Pfad verlässt den Modulordner, `esmodules` leer, falsche `id`, `url` kein GitHub, Skript nicht in `v13/`, kein `zip` im PATH, Build schlägt fehl, Build ohne Bundle) | **16 von 16 ok**; jeder Fehlerfall endet mit Exit 1 und einer Meldung, die den Grund nennt, und lässt das vorige `release/` unberührt; ein erfolgreicher Lauf leert `release/` zuerst und entfernt das Zwischenverzeichnis |
| P5 | **Unabhängige Prüfung des Zips** (`unzip`, `sha256sum`) | Inhalt gleich dem alten M7-Paket (dasselbe Layout); Prüfsummen von Bundle, `lang/en.json` und `module.json` im Zip gleich den Quellen; `release/module.json` == `v13/module.json`; Bundle im Zip gleich dem frisch gebauten (der Bau ist reproduzierbar) |
| P6 | **Diagnosezeile weg:** Suche im Bundle im Zip nach `first query received` und `extra handler arguments` | 0 und 0; **Kontrollsuche im alten M7-Bundle: 1 und 1** (die Suche schlägt also an) |
| P7 | **Regression der Weiterleitung** mit dem echten Bundle (bestehende Zwei-Client-Simulationen) | `sim-m5`, `sim-m6a`, `sim-m7`: alle ok. `sim-m6b`: 48 ok, 2 veraltete Erwartungen (F2), mit dem alten M7-Bundle dasselbe Ergebnis |
| P8 | **Verbotene Muster** (`innerHTML`, `eval`, `new Function`, `fetch`, `WebSocket`, `game.socket`, `localStorage`, `require`, `child_process` u. a.) in `core/` und `v13/` ohne Tests, `dist` und `package.mjs`; nicht relative Importe | keine Treffer; keine Fremd-Importe; `child_process` nur im Paketier-Skript |
| P9 | **Datenschutz:** Suche im Zip-Inhalt und im Repo nach lokalen Pfaden, Konto-Namen, E-Mail-Adresse, Forge-Adressen | Zip: `dist/module.js` 0, `lang/en.json` 0; `module.json` enthält nur den GitHub-Namen `MattTheEagle` (Autor, `url`, `bugs`, `manifest`, `download`); die Schreibweise des Testkontos (klein) kommt nicht vor. Ganzer Arbeitsbaum inklusive neuer Dateien: keine E-Mail-Adresse, keine Forge-Adresse, keine Zugangsdaten; zwei Erwähnungen von "ForgeVTT" in archivierten Phase-1-Dokumenten nennen technische Dateien von Forges eigenem Bridge-Modul (keine Adresse) |
| P10 | **Pläne:** `git diff -U0` der zwei bestätigten Pläne | genau die zwei freigegebenen Stellen (`EAGLE-MODULES-PLAN.md` Z. 104–105, `dadm/eagle-modules-projektplan.md` Z. 67), sonst nichts |
| P11 | **Leitfaden gegen den Code** (`check-ui-guide.mjs`) | alle Regeln finden ihre Belege und Hub-Symbole; zwei Fehlalarme des Skripts bei R-14 (F3) |
| P12 | Unverändert zu haltende Dateien | `git diff` gegen `HEAD` leer |

---

## Acceptance Checklist

| AC | Stand | Beleg |
|---|---|---|
| AC-M8-01 Vertrag konsolidiert | **erfüllt** | Nummern 1 bis 10, Inhaltsverzeichnis, Kopf ohne "parts 1 to 7", Liste "What the API offers", "part n" nur in der Historie, Regel zu `1.0.0`, "no limit"; Tests P6 und P7, Gegenproben N1 bis N8 |
| AC-M8-02 Vertrag = Code, durch Test gehalten | **erfüllt** | 19 Tests, Gegenproben V, R, A, S und C (63 von 63); ein Fund (F1) sofort geschlossen |
| AC-M8-03 Manifest und Version | **erfüllt** | `0.1.0` in Manifest und `package.json`, Felder nach Abschnitt 6 des Apply, Autor nach der Antwort, kein Platzhalter, keine Dependency-Änderung; 7 Tests, Gegenproben M1 bis M13 |
| AC-M8-04 Paketier-Skript | **erfüllt** | P3, P4, P5 |
| AC-M8-05 Diagnosezeile entfernt, Queries unverändert | **erfüllt** (Live-Abnahme im Monitor) | P6, P7 |
| AC-M8-06 README, Leitfaden-Kopf, Pläne | **erfüllt** | P10; die Status-Überschriften wurden nicht geändert, weil nicht freigegeben |
| AC-M8-07 Entwürfe und Referenz-Nachträge | **teilweise** | Übergabenotiz und Entwurf der `SUMMARY.md` liegen vor; der Entwurf der Nachträge liegt in `m8-02` Abschnitt 12. **Der Eintrag in `cheat-sheet.md` ist nicht erfolgt, weil nicht freigegeben (D6).** |
| AC-M8-08 Prüfungen grün, nichts Verbotenes, Unverändertes unverändert | **erfüllt** | P1, P8, P12 |
| AC-M8-09 Gesamtprüfung (nach den Live-Ergebnissen) | **offen** | `m8-06`, nach der Live-Abnahme |
| AC-M8-10 Release-Zip in Forge (`unverified`) | **offen** | Anleitung im Monitor |
| AC-M8-11 Release nur vorbereitet | **erfüllt** | Checkliste im Monitor; Tag, Push, GitHub-Release nicht ausgeführt |

---

## Risks and Assumptions

| # | Risiko oder Annahme | Severity | Blocking |
|---|---|---|---|
| R1 | Das Release-Zip ist live noch nicht installiert worden; die Prüfsummen und der Inhalt stimmen, das Verhalten in Forge zeigt erst die Abnahme. | `low` | no |
| R2 | Ohne Freigabe fehlen die Nachträge in der gemeinsamen Referenz; ein späteres Projekt findet die Erkenntnisse dort nicht, nur im Entwurf. | `low` | no |
| R3 | Die Tests binden Vertrag und Code eng aneinander; wer den Wortlaut einer geprüften Stelle ändert, muss den Test mitziehen. Das ist gewollt (die Meldung nennt die Stelle), kostet aber Pflege. | `low` | no |
| R4 | Der Vertrag verweist bei der Modulversion auf die Tabelle in Abschnitt 6; sie muss bei jeder Modulversion mit neuer API-Version um eine Zeile wachsen (ein Test erzwingt das). | `low` | no |
| A1 | **Annahme:** Ein GitHub-Release zu `v13-v0.0.1` besteht; das neue Release bekommt ein neues Tag. Nicht geprüft (kein Netzwerk). | `low` | no |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m8-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| `dadm/uebergabe-naechste-phase.md` | durable, lebend |
| `dadm/entwurf-summary-implementation-phase-4.md` | Entwurf, wird beim Archivieren zu `SUMMARY.md` |

---

## Next Step

**Monitor** (`m8-04-monitor-output.md`, ohne Stopp): Abgleich der Akzeptanz, Anleitung für die Live-Abnahme des Release-Zips und der Prüfliste (Gruppe A), Release-Checkliste (nur als Anleitung). Danach die Live-Ergebnisse des Projektleiters, `m8-05`, die Gesamtprüfung `m8-06` und die Übergabe.

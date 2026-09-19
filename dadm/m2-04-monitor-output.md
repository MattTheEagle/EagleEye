# M2 — Modul-Anmeldung und Erkennung — Monitor Output

```
artifact: monitor-output
milestone: M2
phase: MONITOR
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m2-03-deploy-output.md` (Implementierung, Proofs, Acceptance-Checkliste)
- `m2-02-apply-output.md` (Design, Übergaben), `m2-01-discover-output.md` (Fakten, U1–U5)
- `04-milestone-plan.md` (M2), `03-scope-declaration.md`, `06-working-mode.md`
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: der API-Vertrag gegen den echten Code, die
  Dummy-Versionen gegen die API-Version, Bau der Live-Check-Pakete

---

## Validation Result

**M2 hat sein Ziel erreicht, soweit es ohne Forge prüfbar ist.** Eagle Module können sich über eine schmale,
versionierte API anmelden; Flight Control kennt genau die angemeldeten und jetzt aktiven Module; die
Versionsverträglichkeit wird beim Anmelden geprüft; der Vertrag dazu ist dokumentiert.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M2-01 bis AC-M2-11 | erfüllt (Belege im Deploy-Output) |
| AC-M2-12 (Live: a ok, b keine Anmeldung, c abgewiesen, `api` am Modulobjekt, U1–U3) | **unverified**; Live-Check vom Projektleiter gewünscht, Anleitung unten |
| Vertrag gegen Code: Beispieltabelle Abschnitt 3 | 7 von 7 Zeilen stimmen mit `isApiCompatible` überein |
| Vertrag gegen Code: Fehlercodes | 7 im Code, 7 im Vertrag, identisch |
| Vertrag gegen Code: API-Version | Vertrag `0.1.0` = `EAGLE_API_VERSION` |
| Dummy-Module gegen die API-Version | a (`0.1.0`) kompatibel, c (`9.0.0`) inkompatibel, wie beabsichtigt |
| Live-Check-Pakete | vier Zips gebaut; das Flight-Control-Bundle im Zip ist byte-identisch mit `v13/dist/module.js` |

---

## Evidence Summary

- **Regressionen:** keine. Die 5 Tests aus M1 (`manifest-scanner`, `settings-hub`) sind unverändert und bestehen;
  Gesamt 26 Tests grün, `typecheck` und `build` grün.
- **Gewollte Verhaltensänderung:** Flight Control hängt jetzt im `init` eine eingefrorene API an sein Modulobjekt
  (`version`, `registerModule`) und loggt `eagleeye | API attached (v0.1.0)`. Sonst nichts Neues zur Laufzeit.
- **Typisierung:** `game.modules.get("eagleeye")?.api` hat den Typ `EagleFlightControlApi | undefined`; die
  Zuweisung im Modul kommt ohne Cast aus (Gegenprobe im Deploy).
- **Nichts angefasst:** Bausteine aus M1, Manifest von Flight Control, `package.json`, Lock-Datei, GitHub-Release.
  Kein Commit, kein Push, kein Live-Test durch mich.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **R1 bleibt offen:** Dass Foundry das Setzen von `api` am Modulobjekt in v13 zulässt (U5), ist nur durch Vorbild-Module belegt. Der Projektleiter hat das Risiko mit dem "Go" angenommen; der Live-Check belegt oder widerlegt es. Widerlegt er es, geht M2 zurück in Apply. | `medium` | no |
| F2 | AC-M1-12 (Startlog, kein Hub-Menü) und AC-M2-12 (Anmeldung a/b/c, Ladereihenfolge, deaktivierte Flight Control, Versionsspanne) sind bis zum Live-Check `unverified`. | `low` | no |
| F3 | Kein Release enthält die API; der einzige Release `v13-v0.0.1` ("Latest") stammt aus dem minimalen M1-Stand von Phase 1. Autoren von Eagle Modulen können in `relationships.requires` noch keine Flight-Control-Version angeben, die die API liefert (der Vertrag sagt das ausdrücklich und nennt `0.0.1` als Entwicklungswert). Die Zuordnung Modulversion ↔ API-Version kommt mit dem ersten Release. | `low` | no |
| F4 | Das Root-`README.md` verweist noch nicht auf `docs/`, und die bestätigten Pläne (`EAGLE-MODULES-PLAN.md`, `dadm/eagle-modules-projektplan.md`) kennen den API-Vertrag nicht; beides sind Nachführungen an freigabepflichtigen bzw. Nicht-M2-Dokumenten. Nichts wurde still geändert. | `info` | no |
| F5 | Die beiden Plan-Stellen aus dem M1-Monitor (T4/F1) sind weiter offen; Vorschlag "mit M8" gilt. | `info` | no |
| F6 | Die Dummy-Module tragen `compatibility.minimum: "11"` (älter als das Ziel v13); nur Testhilfe, ohne Wirkung auf den Vertrag. | `info` | no |

Kein `high`/`critical`-Fund, keine Human-Decision-Trigger, kein Rework.

---

## Live-Check (vom Projektleiter gewünscht, T3): Anleitung

Du deployst selbst auf Forge und kopierst die Konsole; ich führe nichts aus. Das Ergebnis halte ich danach in einem
eigenen Artefakt fest (`m2-05-live-check-output.md`), weil dieser Monitor-Output unveränderlich ist.

**Pakete** (fertig gebaut, außerhalb des Repos):
`/tmp/claude-1000/-run-media-matt-Data-matt-Coding-FoundryVTT-EagleEye/9c37d4e4-e0ad-4c8b-8a54-8ab1bb2f3c6f/scratchpad/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-v13.zip` | Flight Control (aktueller Build, `module.json` + `dist/module.js`) |
| `eagleeye-dummy-a.zip` | meldet sich mit `0.1.0` an (erwartet: angenommen) |
| `eagleeye-dummy-b.zip` | meldet sich nicht an |
| `eagleeye-dummy-c.zip` | meldet sich mit `9.0.0` an (erwartet: abgewiesen) |

**Ablauf** (Zips im Import Wizard installieren wie in Phase 1, Flight Control überschreibt die alte Version 0.0.1):
1. In einer v13-Welt Flight Control und die drei Dummy-Module aktivieren (a und c verlangen `eagleeye`).
2. Welt neu laden, Browser-Konsole öffnen (F12), alle Zeilen mit `eagleeye` kopieren.
3. Optional in der Konsole: `game.modules.get("eagleeye").api` (erwartet: Objekt mit `version` und
   `registerModule`) und `Object.isFrozen(game.modules.get("eagleeye").api)` (erwartet: `true`).

**Erwartete Konsolenzeilen** (Reihenfolge von a und c hängt von Foundry ab):
```
eagleeye | ready (Foundry v13)
eagleeye | API attached (v0.1.0)
eagleeye | registered module eagleeye-dummy-a (api 0.1.0)
eagleeye-dummy-a | registerModule result {ok: true, module: {…}}
eagleeye | registration rejected for eagleeye-dummy-c: incompatible-api-version - module "eagleeye-dummy-c" requests API 9.0.0, Flight Control provides 0.1.0
eagleeye-dummy-c | registerModule result {ok: false, reason: 'incompatible-api-version', detail: '…'}
```
Dazu: keine Zeile über eine Anmeldung von `eagleeye-dummy-b`, keine roten Fehler von `eagleeye`, und unter
Moduleinstellungen gibt es kein Menü "EagleEye Hub" mehr (AC-M1-12).

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| Alle Zeilen wie erwartet | R1/U5 belegt; AC-M1-12 und AC-M2-12 erfüllt; die Ladereihenfolge ist für das Design nicht mehr relevant (registriert wird ab `setup`) |
| `eagleeye \| failed to attach the API to the module object` | R1 trifft ein: Foundry lässt das Setzen nicht zu; M2 geht zurück in Apply (anderer Weg, die API bereitzustellen) |
| `eagleeye-dummy-a \| Flight Control API not available` | die API ist im `setup` nicht da; Ursache klären (Ladereihenfolge U1, Zuweisung U5), M2-Design prüfen |
| a und c melden sich vor `API attached` | Ladereihenfolge belegt (U1); unkritisch, da erst ab `setup` angemeldet wird |
| Optional: Flight Control deaktivieren, während a aktiv ist | belegt oder widerlegt U2; die Meldung von Foundry bitte mitkopieren |

---

## Übergaben (zusätzlich zu Apply Abschnitt 9)

- **M3:** Die Hülle braucht Zugriff auf die Registry (Ablage legt M3 fest); der Hub liest `registry.list()`. Die
  API-Versionspolitik für zusätzliche, optionale Beschreiber-Felder ist zu klären: Minor anheben (bricht vor 1.0
  a und c, die nachziehen) oder als Patch führen. `docs/ui-guide.md` entsteht in M3, auf Englisch (T1).
- **M4:** Das Ergebnismuster `{ ok, reason, detail }` mit stabilen Codes für Anfragen übernehmen.
- **M5/M6:** Die angemeldete Modul-`id` ist der Schlüssel für Nutzungsrechte je Modul und Nutzer.
- **M8:** Tabelle Modulversion ↔ API-Version im Vertrag, API-Versionspolitik ab 1.0, Bereitstellung der Typen für
  andere Repos (Q7), Nachführen der Pläne und des Root-`README.md` (F4/F5).

---

## Recommendation

**Schließen.** M2 ist abgeschlossen (Status: Completed); nächster Milestone ist **M3** (Hub-Oberfläche mit
UI-Leitfaden). R1 ist mit dem "Go" angenommen und bleibt `medium`, bis der Live-Check gelaufen ist.

Hinweis zur Reihenfolge: M3 baut auf der Registry auf. Wenn R1 eintrifft, ändert sich die Grundlage von M3. Der
Live-Check kostet dich einen Zyklus; M3 Discover und Apply könnten parallel laufen. Die Entscheidung liegt beim
Projektleiter (Frage am Ende dieser Antwort).

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m2-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete im Scratchpad (vier Zips) | ephemeral |

M2-Abschlusskette: `m2-01-discover-output.md`, `m2-02-apply-output.md`, `m2-03-deploy-output.md`,
`m2-04-monitor-output.md` (alle `immutable`). Folgeartefakt nach dem Live-Check: `m2-05-live-check-output.md`.

---

## Next Step

Entweder Live-Check durch den Projektleiter, danach M3 (Discover und Apply eigenständig, Stopp vor dem Deploy für das
"Go"); oder M3 Discover und Apply sofort, mit dem Live-Ergebnis als späterem Eingang. Vorher: Bestätigung, welcher Weg.

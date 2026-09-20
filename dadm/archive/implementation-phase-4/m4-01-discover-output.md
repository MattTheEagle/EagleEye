# M4 — Anfragekanal-Kern — Discover Output

```
artifact: discover-output
milestone: M4
phase: DISCOVER
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Wahl eines Formats (Aufgabe des Apply). Belege nennen die Fundstelle; was sich ohne
Live-Test nicht belegen lässt, steht getrennt.

---

## Input Summary

- `04-milestone-plan.md` (M4 mit Risiken), `m3-04-monitor-output.md` (Übergaben an M4), `m2-04-monitor-output.md` und
  `m2-05-live-check-output.md` (Registry und API live bestätigt)
- Spezifikation und Entscheidungen: `dadm/reference/eagle-modules-aufbau.md` (P-FC1, P-FC7, Q3, N1, N4, N9, Abläufe der Module),
  `dadm/eagle-modules-projektplan.md` Abschnitt 3.1, Apply-Notizen der Planungsphase 3 (`archive/planning-phase-3/m5-02-apply-output.md`)
- Foundry-Referenz v13 (`foundry-vtt-reference-v13/types/`, Tag `v13.345.1`): `User#query`, `CONFIG.queries`, Dokument-Operationen
- Repo-Ist nach M3: `core/`, `v13/`, `test-fixtures/`, `docs/`
- Kein Web-Abruf, kein Live-Test, kein Code geändert.

---

## Current-State Summary

1. **Es gibt keinen Anfragekanal.** Die öffentliche API hat genau zwei Mitglieder: `version` und `registerModule`. Flight Control führt heute
   keine Anfragen von Modulen aus; die einzigen "Operationen" sind interne (Hub: Einstellungen schreiben, Start-Aktion aufrufen). *(relevant)*
2. **Ein Ergebnismuster besteht bereits** und wird dreifach benutzt: `{ ok: true, … }` oder `{ ok: false, reason, detail }` mit stabilen
   Zeichenketten-Codes (`registerModule`, `startModule`, `applySettingInput`); alle drei "werfen bzw. lehnen nie ab". *(relevant)*
3. **Module sind durch ihre `id` gekannt, nicht durch einen Herkunftsnachweis.** Die Registry weiß, welche Module angemeldet und aktiv sind; ob
   ein Aufruf wirklich von diesem Modul stammt, kann Foundry nicht belegen (Discover-R4 aus M2). *(relevant)*
4. **Die Spezifikation legt den Zweck fest, nicht das Format:** P-FC7 "Empfängt Anfragen von Eagle Modulen und führt sie aus"; Q3 a: alle
   Foundry-**Änderungen** über Flight Control, Lesen direkt; N4: Flight Control bleibt schmal und generisch; Fachanfragen folgen mit den
   Verbraucher-Modulen (Tabelle S1–S9). *(relevant)*
5. **Die Weiterleitung an den GM (M5) läuft über `User#query`, das nur JSON-serialisierbare Daten trägt** (Tabelle F1–F4). Ein Format, das
   nicht JSON-tauglich ist, ließe sich in M5 nicht weiterleiten. *(relevant)*
6. **Die Fachanfragen der späteren Module sind aus den beschriebenen Abläufen ablesbar** (anlegen, auslesen, live ändern, kopieren), gehören aber
   nach Plan nicht zu M4. *(Information)*

---

## Inventory

### Repo-Ist

| # | Name | Beschreibung | Location | Status |
|---|---|---|---|---|
| I1 | API-Fläche | `createEagleApi(registry, log?)` liefert ein eingefrorenes Objekt mit `version` und `registerModule`; `registerModule` wirft nie, loggt Erfolg (info) und Ablehnung (warn) | `core/eagle-api.ts` | present |
| I2 | Registry | `list()` liefert die angemeldeten, jetzt aktiven Module (`id`, `title`, `version`, `apiVersion`, optional `open`); `registerModule` prüft in fester Reihenfolge und liefert stabile Codes | `core/module-registry.ts` | present |
| I3 | Ergebnismuster | `RegistrationResult`, `StartResult`, `SettingWriteResult`: `{ ok: true … }` oder `{ ok: false, reason, detail }`; `detail` ist ein Satz für Logs | `core/module-registry.ts`, `core/hub-model.ts`, `core/settings-hub.ts` | present |
| I4 | API-Version | `EAGLE_API_VERSION = "0.2.0"`; vor 1.0 gleiche Minor nötig, `provided ≥ requested` | `core/api-version.ts` | present |
| I5 | Hülle | `v13/module.ts` legt im `init` Registry und API an, hängt sie an `game.modules.get("eagleeye")`, registriert das Hub-Menü; Registry ist dort lokal | `v13/module.ts` | present |
| I6 | API-Vertrag | Teile 1 und 2 (Abschnitte 1–9: Zugriff, Anmeldung, Hub, Version, Manifest, fehlende Flight Control, Verifikationsstand, "Not part", Historie), Englisch | `docs/api-contract.md` | present |
| I7 | Test-Konventionen | injizierbare Quellen, Adapter-Regressionstest, dünne Hüllen, Englisch (K1–K4); 44 Tests in 7 Dateien; jeder Fall ein `it` | `m1-02-apply-output.md`, `core/*.test.ts` | present |
| I8 | Dummy-Module | a (mit `open`, vier Einstellungen), b (meldet sich nicht an), c (inkompatibel), d (ohne `open`); keines stellt Anfragen | `test-fixtures/` | present |
| I9 | Anfragecode | Anfrage-/Antwortformat, Handler-Tabelle, Aufrufweg | — | missing |

### Spezifikation und Entscheidungen (Projektleiter)

| # | Aussage | Fundstelle |
|---|---|---|
| S1 | P-FC7: "Empfängt Anfragen von Eagle Modules und führt diese aus"; P-FC1: Schnittstelle zwischen Foundry, dem DnD-5e-System und den Eagle Modulen | `eagle-modules-aufbau.md` Z. 32–39 |
| S2 | Q3 a: "Alle Foundry-Änderungen laufen über Flight Control; die anderen Module haben nur Einbindung und UI." | ebd. Z. 181 |
| S3 | N4: Flight Control bleibt eine schmale, generische Schnittstelle; die Editor-Logik bleibt in den Modulen | ebd. Z. 204 |
| S4 | U2 (diese Phase): "Klartext ↔ Code" entfällt; Fachanfragen folgen mit den Verbraucher-Modulen | `01-project-brief.md` |
| S5 | N1: Nutzungsrechte je Modul und Nutzer folgen später; Nutzer ohne Foundry-Recht brauchen den GM-Anfrageweg (`User#query`) | `eagle-modules-aufbau.md` Z. 201 |
| S6 | N9 (Library): "Compendien lesen direkt im Library Modul, compendien ändern … läuft aber über flight control" | ebd. Z. 209 |
| S7 | Abläufe der Module: Character Edit "Befehl an Eagle Flight Control zum Charakter erstellen", danach Datenabgleich Sheet ↔ Editor "und umgekehrt", Start aus dem Charakterblatt: Flight Control "liest Character aus"; Homebrew: Flight Control "erstellt gewähltes Objekt und editiert live im Hintergrund", "Edit with": Flight Control überträgt alles Relevante in den Editor | ebd. Z. 64–76, 90–102 |
| S8 | Plan 3.1: Anfragen über `game.modules.get(id).api`, Zugriff ab `setup`/`ready`; für Spieler `User#query` mit präfixiertem Namen in `CONFIG.queries`, kein socketlib; "Versionsspanne … plus API-Versionsprüfung" | `eagle-modules-projektplan.md` Abschnitt 3.1 |
| S9 | Milestone Plan M4: Apply legt Anfrage-/Antwortformat, Fehlerbild, Versionierung des Vertrags, Anmeldung von Handlern und eine exemplarische Anfrage fest; Acceptance: Vitest für gültige Anfrage, ungültiges Format, unbekannten Handler, Handler-Fehler und Versionsprüfung, Ergebnis und Fehler kommen beim Aufrufer an; Risiken `high` (Schnittstellenstabilität) und `medium` (Mega-Modul) | `04-milestone-plan.md` |

### Foundry-Fakten (Types v13.345.1; Pfade relativ zu `foundry-vtt-reference-v13/types/src/foundry/`)

| # | Fakt | Fundstelle |
|---|---|---|
| F1 | `User#query(queryName, queryData, { timeout })` fragt einen bestimmten Benutzer ab und liefert ein Promise mit dem Ergebnis. Die Daten "must be JSON-serializable"; der Name "must be registered in `CONFIG.queries`" | `client/documents/user.d.mts:727–738` |
| F2 | "System and modules must prefix the names of the queries they register (e.g. `my-module.aCustomQuery`). Non-prefixed query names are reserved by core." Kernanfragen heute: `dialog`, `confirmTeleportToken` | `client/config.d.mts:2407–2411, 2489–2493` |
| F3 | Die Typen leiten Daten und Ergebnis einer Anfrage aus der registrierten Funktion ab: erster Parameter = `queryData`, Rückgabe (awaited) = Ergebnis; `QueryOptions` kennt nur `timeout` (Millisekunden) | `client/documents/user.d.mts:569–578` |
| F4 | Operationen auf Dokumenten sind asynchron, z. B. `Document.createDocuments(…): Promise<Document.Any[]>` | `common/abstract/document.d.mts:358` |
| F5 | Das Recht `SETTINGS_MODIFY` hat die Standardrolle Assistent; Actors, Items und Journale anzulegen ist standardmäßig Assistenten-Rolle (Phase-3-Fakt b6) | `common/constants.d.mts:1491–1501`; `m5-01-discover-output.md` |

### Nicht ohne Live-Test belegbar

| # | Frage | Warum offen |
|---|---|---|
| U1 | Verhalten von `User#query` bei nicht erreichbarem GM, Zeitüberschreitung und großen Datenmengen | gehört zu M5; aus Types und Doku nicht ableitbar |

Für den Kern selbst (Aufruf im selben Client) gibt es keine Foundry-abhängige Unbekannte; ein Live-Test wäre nur für die exemplarische
Anfrage nötig, falls sie Foundry-Daten berührt.

---

## Dependencies

| # | Dependency | Version | Status |
|---|---|---|---|
| D1 | Foundry-Types v13 | Tag `v13.345.1` | present (nur lokal, absoluter Pfad) |
| D2 | typescript / esbuild / vitest | 5.9.3 / 0.24.2 / 2.1.9 | present |
| D3 | Schema-/Validierungsbibliothek für Anfrage-Daten | — | missing (nicht in `package.json`; Änderung wäre freigabepflichtig) |

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | Schnittstellenstabilität zwischen getrennt veröffentlichten Modulen ist laut technischem Plan das größte Einzelrisiko; ein Fehlgriff im Anfrage-/Antwortformat wirkt auf alle Folgemodule. Im Milestone Plan als `high` von M4 benannt und mit der Plan-Freigabe zur Kenntnis genommen. | `high` | no |
| R2 | Gefahr eines Mega-Moduls (N4): Jede Fachanfrage in Flight Control vergrößert es; der Umfang über "Kern plus Nachweis-Anfrage" hinaus wäre eine Scope-Ausweitung (Human Decision). Im Plan als `medium` benannt. | `medium` | no |
| R3 | Anfragen und Antworten müssen JSON-serialisierbar sein (F1), sonst lässt sich der Kern in M5 nicht über `User#query` weiterleiten. Funktionen, Klasseninstanzen oder DOM-Elemente im Format wären ein späterer Umbau. | `medium` | no |
| R4 | Die Modul-`id` in einer Anfrage ist selbst angegeben und nicht belegbar (Discover-R4 aus M2). Rechte je Modul und Nutzer (M6) stützen sich darauf. | `low` | no |
| R5 | Ein neues Mitglied der API erhöht die API-Version (Regel "vor 1.0 bricht Minor"); die Dummy-Module müssen wieder nachziehen. | `low` | no |
| R6 | Es gibt keine deklarierte Validierungsbibliothek (D3); die Prüfung der Anfrage-Daten müsste eigen und klein bleiben oder eine Dependency-Freigabe einholen. | `low` | no |
| A1 | **Annahme:** Der Kern führt Anfragen im Client des Aufrufers aus; der Transport zum GM kommt mit M5, die Rechte mit M6. | `low` | no |
| A2 | **Annahme:** Die Handler gehören zu Flight Control selbst (P-FC7, N4); Module registrieren keine eigenen Handler, und es gibt keinen Weg von Modul zu Modul über den Kern. | `low` | no |
| A3 | **Annahme:** Die exemplarische Anfrage ist ein harmloser Nachweis; welche, legt das Apply fest. | `info` | no |

Kein `critical`-Fund, kein Human-Decision-Trigger. R1 ist `high` und nicht blockierend, weil der Plan es benennt und der Apply ein Format
wählen kann, das die Stabilität in den Mittelpunkt stellt.

---

## Open Questions

Alle gehören zur Entscheidungsarbeit des Apply; keine blockiert dessen Start.

| # | Question | Priority | Owner |
|---|---|---|---|
| Q1 | Wie sieht der Umschlag einer Anfrage und einer Antwort aus (Felder, Namen), und wie bleibt er JSON-tauglich (R3)? | important | Claude (Apply) |
| Q2 | Welches Fehlerbild gilt (Codes, `detail`), passend zum bestehenden Muster (I3)? Welche Fehler kennt der Kern (ungültiges Format, unbekannter Anfragetyp, ungültige Daten, Handler-Fehler, nicht angemeldetes Modul, später: fehlende Rechte)? | important | Claude (Apply) |
| Q3 | Wie werden Anfragetypen versioniert und benannt, und wie hängt das mit der API-Version zusammen (F2: präfixierte Namen für den späteren Transport)? | important | Claude (Apply) |
| Q4 | Wie werden Handler registriert (nur intern in Flight Control, A2), wie kommen spätere Fachanfragen ohne Umbau hinzu, und wie werden die Daten einer Anfrage geprüft (R6)? | important | Claude (Apply) |
| Q5 | Wie weiß der Kern, wer fragt (Modul-`id`, R4), wo hängt später die Rechteprüfung ein (M6), und wie bleibt die Ausführung von ihrem Transport trennbar (A1, M5)? | important | Claude (Apply) |
| Q6 | Welche exemplarische Anfrage dient als Nachweis, ohne Fachlogik in den Kern zu tragen (R2)? | important | Claude (Apply) |
| Q7 | Wie erscheint der Kanal in der öffentlichen API (Name, Signatur, asynchron), und welche API-Version folgt (R5)? | important | Claude (Apply) |
| Q8 | Umfang von `docs/api-contract.md` Teil 3 und Anpassung der Dummy-Module (Anfrage stellen, Antwort loggen) für den Live-Check. | nice-to-have | Claude (Apply) |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m4-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

Es wurde kein Code geändert.

---

## Next Step

Apply M4: Q1–Q8 entscheiden (Umschlag, Fehlerbild, Versionierung und Benennung, Handler-Registrierung und Datenprüfung, Aufrufer und
Rechtehaken, exemplarische Anfrage, API-Fläche und Version, Vertrag Teil 3), Acceptance-Kriterien und Deploy-Reihenfolge festlegen.

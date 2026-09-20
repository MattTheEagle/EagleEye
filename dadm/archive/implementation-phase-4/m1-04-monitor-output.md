# M1 — Phase-1-Code schneiden (E6) — Monitor Output

```
artifact: monitor-output
milestone: M1
phase: MONITOR
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m1-03-deploy-output.md` (Implementierung, Proofs, Acceptance-Checkliste)
- `m1-02-apply-output.md` (Design, Übergaben an Folge-Milestones)
- `04-milestone-plan.md` (M1), `03-scope-declaration.md`, `06-working-mode.md`
- Eigene, vom Deploy unabhängige Nachprüfungen im Monitor: Bundle-Inhalt, `git status`
  gegen den Scope, Suche nach Verweisen auf entfernte Dateien, Abgleich der
  bestätigten Pläne mit dem Code-Stand

---

## Validation Result

**M1 hat sein Ziel erreicht.** Der Laufzeitcode enthält keine Funktion mehr, die
Fremdmodule beobachtet oder verändert; die zwei Bausteine, die der Plan nennt, bleiben
getestet erhalten.

| Prüfung | Ergebnis |
|---|---|
| Acceptance AC-M1-01 bis AC-M1-11 | erfüllt (Belege im Deploy-Output) |
| AC-M1-12 (Live: Modul lädt, Startlog, kein Hub-Menü) | **unverified** (Live-Test-Gate, kein Test freigegeben) |
| Bundle-Inhalt (unabhängig geprüft) | 238 Bytes: nur `EAGLEEYE_ID`, `logEagleEyeReady` und ein `init`-Hook |
| Scope-Abgleich (`git status` ohne `dadm/`) | genau die 11 geplanten Dateien plus die neue `.foundry-workspace.yaml` (im Scope) |
| Dependency-Änderung | keine (`package-lock.json` unverändert, `package.json` nur `description`) |
| Verweise auf entfernte Dateien | nur in unveränderlichen Outputs (`dadm/archive/`, `m1-*`), weder in Code noch in lebender Doku |

---

## Evidence Summary

- **Regressionen:** keine. Die verbleibenden Dateien `manifest-scanner` und
  `settings-hub` samt ihrer 5 Tests sind bis auf Kommentar bzw. Typ-Union unverändert
  und bestehen. Die Testzahl sank von 10 auf 5 ausschließlich durch das gewollte
  Entfernen von `conflict-watch` (3) und `language-scan` (2).
- **Gewollte Verhaltensänderung:** Es gibt kein Einstellungsmenü "EagleEye Hub" mehr,
  keine `console.table`-Ausgaben und keine libWrapper-Hooks; sichtbar bleibt nur der
  Startlog `eagleeye | ready (Foundry v13)`.
- **Größe:** Bundle 5.759 → 238 Bytes; Codebasis 538 → 265 Zeilen.
- **Nichts angefasst:** GitHub-Release `v13-v0.0.1`, Fixtures, tsconfigs, Lock-Datei.
  Kein Commit, kein Push, kein Live-Test.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | **Zwei Aussagen in den bestätigten Plänen stimmen nicht mehr mit dem Code überein:** `EAGLE-MODULES-PLAN.md` Z. 103–105 ("das Grundgerüst aus der ersten Phase hat bereits ein solches Fenster (bisher eine Tabelle …)") — das Hub-Fenster ist entfernt; `dadm/eagle-modules-projektplan.md` Z. 67 ("Entscheidung über Entfernen in der Umsetzungsphase (E6)") — inzwischen entschieden (M1). Die Pläne sind laut Scope nur mit Freigabe des Projektleiters änderbar; nichts wurde still korrigiert. | `low` | no |
| F2 | AC-M1-12 ist nicht live bestätigt. Erwartung (aus Bundle-Inhalt und Typecheck): Modul lädt, Startlog erscheint, kein Menü. | `low` | no |
| F3 | Die Beschreibungen der beiden Fixtures nennen noch "M4 (Settings-Hub-Proof)" aus Phase 1. Beabsichtigt (Apply, I15); sie werden in M2/M3 zu Dummy-Eagle-Modulen ausgebaut. | `info` | no |
| F4 | Bis M3 gibt es keine sichtbare Oberfläche; `manifest-scanner` und `settings-hub` haben bis M2/M3 keinen Laufzeitverbraucher (Apply-R1/R2, mit dem "Go" akzeptiert). | `info` | no |
| F5 | Für M8 kommt hinzu: Die `description` im Repo-`module.json` weicht vom veröffentlichten Manifest des Releases `v13-v0.0.1` ab, solange kein neuer Release entsteht (Discover-R4). | `info` | no |

Kein `medium`-Fund, keine Human-Decision-Trigger, kein Rework.

---

## Übergaben (unverändert aus Apply Abschnitt 8, keine neuen)

- **M2:** legt fest, woran ein Eagle Modul erkennbar ist (dort bekommen die Bausteine
  einen Filter); Fixtures zu Dummy-Eagle-Modulen ausbauen; Sprache der Dokumente in
  `./docs/` klären (T3); `docs/api-contract.md` entsteht.
- **M3:** Hub-Fenster neu bauen; `settings-hub` ist der Baustein für "Einstellungen
  bündeln"; `docs/ui-guide.md` entsteht.
- **M5/M6:** Rechteprüfung vor jeder Laufzeitnutzung von `updateSetting`.
- **M8:** Packaging/Release-Prozess, `latest`-Manifest (F5), absoluter Pfad in
  `v13/tsconfig.json`, Neubewertung `core/` + `v13/`.

---

## Recommendation

**Schließen.** M1 ist abgeschlossen (Status: Completed); nächster Milestone ist **M2**
(Modul-Anmeldung und Erkennung). Nach Working Mode laufen Discover und Apply von M2
eigenständig, vor dem M2-Deploy wartet der Ablauf auf das "Go".

Zwei Punkte brauchen eine Entscheidung des Projektleiters, blockieren aber nichts und
werden am nächsten Stopp (M2-Go) mitgefragt, um Rückfragen zu bündeln:
1. **F1:** Sollen die beiden Plan-Stellen jetzt (oder in M8) nachgeführt werden?
2. **F2:** Soll AC-M1-12 live geprüft werden — jetzt, gebündelt mit dem ersten Live-Test
   nach M2 (Modul lädt plus Anmeldung), oder gar nicht (Restrisiko `low` akzeptieren)?

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m1-04-monitor-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

M1-Abschlusskette: `m1-01-discover-output.md`, `m1-02-apply-output.md`,
`m1-03-deploy-output.md`, `m1-04-monitor-output.md` (alle `immutable`).

---

## Next Step

Discover M2: Fakten zur Modul-Anmeldung sammeln (Foundry-API für `game.modules.get(id).api`,
Ladezeitpunkte, `relationships.requires`, Erkennung), unter Nutzung der lokalen
Foundry-Referenz v13. Kein Design, kein Code.

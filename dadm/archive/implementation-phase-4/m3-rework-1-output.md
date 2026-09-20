# M3 — Nacharbeit, Versuch 1 von 2 — Rework-Protokoll und Design

```
artifact: rework-output
milestone: M3 (Nacharbeit zu den Befunden F1 und F2 aus m4-05)
phase: APPLY (Design); der Deploy läuft gebündelt mit dem M5-Deploy
status: complete
date: 2026-09-19
```

retention: immutable

Protokoll nach Rework-Regel (`finding_ref`, `attempt`, `action_taken`, `result`). Das Ergebnis steht nach dem Live-Check in dessen Nachtrag; dieses Dokument bleibt unverändert.

---

## Anlass und Freigabe

- **finding_ref:** `m4-05-live-check-output.md`, **F1** (`medium`, Feld-Anordnung im Hub gestapelt statt Label links und Feld rechts) und **F2** (`low`, Zahl mit `range` ohne Schieberegler).
- **attempt:** 1 von 2 (Rework-Limit 2).
- **Entscheidung des Projektleiters** (2026-09-19, Frage zu F1): **A, Nacharbeit gebündelt mit dem M5-Paket.** Die Wahl gilt als "Go" für diese Nacharbeit. Weil sie Dateien aus M3 im Zuge des M5-Deploys ändert
  (Cross-Milestone-Änderung), ist diese ausdrückliche Entscheidung zugleich die dafür nötige Human Decision; sie wird im Deploy-Output von M5 zitiert.

## Design (nur `v13/hub-application.ts`, ohne eigenes CSS)

| # | Änderung | Beleg |
|---|---|---|
| 1 | `window.contentClasses: ["standard-form"]` in `DEFAULT_OPTIONS`. Ziel: die Anordnung der Formulargruppen wie im Einstellungsfenster. | Option `contentClasses` (v13: `client/applications/api/application.d.mts:239`); die v14-Referenz zeigt sie mit dieser Klasse. **Wirkung in v13 ist eine Hypothese** (die Referenz enthält kein CSS). |
| 2 | Zahlen mit vollständigem `range` (`min` und `max`) erscheinen als `HTMLRangePickerElement.create({ name, value, min, max, step })` (Schieberegler mit Zahlenfeld); ohne vollständigen Bereich bleibt `createNumberInput`. | `client/applications/elements/range-picker.d.mts:30`; Namensraum `foundry.applications.elements` (`client/applications/_module.d.mts:9`) |
| 3 | Die Änderungs-Listener decken das neue Element ab (`range-picker`) und ignorieren einen Wert, der dem gespeicherten entspricht (ein wiederholtes `change`-Ereignis und das Zurücksetzen eines abgelehnten Werts lösen so kein zweites Speichern aus); je Feld läuft höchstens ein Speichern gleichzeitig. Das Zurücksetzen schreibt bei einem Schieberegler eine Zahl, sonst wie bisher. | Die Typen nennen für `AbstractFormInputElement` "Fires change"; ob das Setzen von `value` ebenfalls ein Ereignis auslöst, ist nicht belegt (`client/applications/elements/form-element.d.mts`), deshalb der Schutz |

Nicht geändert: `core/` (Logik, Tests), Manifest, Dependencies, CSS-Dateien, alle anderen Hub-Verhalten (Tabs, Open, Prüfung und Speichern über `applySettingInput`).

## Verworfene Alternativen

- **Eigenes CSS** (nach R-13, auf eine eigene Klasse begrenzt): Versuch 2, falls die Klasse nicht wirkt.
- **`HandlebarsApplicationMixin` mit eigenen Vorlagen:** größerer Umbau, ohne Beleg, dass die Optik dadurch nativer wird.
- **Annehmen (B):** vom Projektleiter nicht gewählt.

## Akzeptanzkriterien

```
AC-M3R-01: v13/hub-application.ts setzt window.contentClasses ["standard-form"] und erzeugt für Zahlen mit min und max ein HTMLRangePickerElement; ohne vollständigen Bereich bleibt createNumberInput; typecheck endet mit Exit 0.
AC-M3R-02: core/ ist unverändert im Sinne dieser Nacharbeit; die Tests von settings-hub und hub-model bleiben unverändert grün; das Bundle enthält weder "innerHTML" noch neue Abhängigkeiten.
AC-M3R-03 (unverified, Live-Check zusammen mit M5): (a) die Felder im Hub sind wie im Einstellungsfenster angeordnet (Label links, Feld rechts); (b) eine Zahl mit Bereich zeigt Schieberegler und Zahlenfeld, eine Änderung erreicht den onChange der Einstellung genau einmal, ein ungültiger Wert springt zurück; (c) keine neuen Abweichungen bei Tabs, Knöpfen und Fensterrahmen.
```

## Risiken

| # | Risiko | Severity |
|---|---|---|
| RW1 | Die Klasse `standard-form` wirkt in v13 nicht wie erhofft oder verändert Abstände anderer Teile des Fensters. Live prüfbar; Rückfall ist Versuch 2 (minimales eigenes CSS) oder die Annahme (B). | `medium` |
| RW2 | Das native Element sendet mehr als ein `change`-Ereignis oder reagiert beim Setzen von `value` mit einem Ereignis; der Schutz aus Punkt 3 fängt das ab, das Verhalten ist live zu beobachten. | `low` |

Kein `high`-Fund, keine Dependency-Änderung.

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m3-rework-1-output.md` (dieses Dokument) | immutable |

**result:** offen bis zum Live-Check; er wird im Nachtrag zum M5-Live-Check festgehalten.

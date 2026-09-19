# M3 — Nacharbeit 2, Versuch 1 von 2 — Rework-Protokoll und Design

```
artifact: rework-output
milestone: M3 (Nacharbeit zum Befund F1 aus m5-05)
phase: APPLY (Design); der Deploy läuft gebündelt mit dem nächsten Paket
status: complete
date: 2026-09-20
```

retention: immutable

Protokoll nach Rework-Regel (`finding_ref`, `attempt`, `action_taken`, `result`). Das Ergebnis steht nach dem Live-Check im zugehörigen Nachtrag; dieses Dokument bleibt unverändert.

---

## Anlass und Freigabe

- **finding_ref:** `m5-05-live-check-output.md`, **F1** (`low`): Die Überschrift eines Modul-Tabs ist nicht schön formatiert (groß, direkt unter der Tab-Leiste, großer Abstand zur Versionszeile, wiederholt den Namen des Tabs).
  Sie trat auf, seit der Hub `standard-form` trägt (Nacharbeit 1, `m3-rework-1-output.md`).
- **attempt:** 1 von 2 (Rework-Limit 2).
- **Entscheidung des Projektleiters** (2026-09-20): **Rahmen mit Titel (`fieldset`)**. Die Wahl gilt als "Go" für diese Nacharbeit. Sie ändert eine Datei aus M3 im Zuge von M6 (Cross-Milestone-Änderung); die ausdrückliche
  Entscheidung ist zugleich die dafür nötige Freigabe. Geprüft wird im nächsten Paket.

## Design (nur `v13/hub-application.ts`, ohne eigenes CSS)

| # | Änderung | Beleg |
|---|---|---|
| 1 | Der Inhalt eines Modul-Tabs (Version, Open-Knopf, Einstellungen) steht in einem `fieldset`, der Titel des Moduls ist dessen `legend`; die Überschrift `h3` entfällt. Der Tab-Körper bleibt `section.tab[data-group][data-tab]`. | Auswahl des Projektleiters; `fieldset` und `legend` sind Standard-HTML, Foundrys eigene Formulare nutzen sie zur Gruppierung (nicht in der Referenz belegt, da sie kein HTML enthält) |
| 2 | Kein CSS, keine neue Abhängigkeit, keine Änderung an `core/`. | R-13 des UI-Leitfadens |

Nicht geändert: Tabs, Open, Prüfung und Speichern über `applySettingInput`, die Änderungs-Listener, die Feldarten.

## Verworfene Alternativen

- **Überschrift weg, Version als kleine Zeile** und **kleinere Überschrift mit normalem Abstand:** vom Projektleiter nicht gewählt.
- **Eigenes CSS für die Überschrift:** Versuch 2, falls der Rahmen nicht gefällt oder nicht wirkt (R-13, auf eine eigene Klasse begrenzt).

## Akzeptanzkriterien

```
AC-M3R2-01: v13/hub-application.ts erzeugt je Modul-Tab ein fieldset mit dem Modultitel als legend, darin Version, Open-Knopf (nur mit open) und die Einstellungen; kein h3 mehr; typecheck endet mit Exit 0.
AC-M3R2-02: core/ ist unverändert; alle Tests bleiben grün; das Bundle enthält weder "innerHTML" noch neue Abhängigkeiten.
AC-M3R2-03 (unverified, Live-Check): Der Rahmen mit Titel sieht in einem standard-form-Fenster gut aus (kein großer Abstand, keine Wiederholung des Tab-Namens als große Überschrift); Tabs, Knöpfe, Anordnung der Felder und Schieberegler bleiben wie bestätigt.
```

## Risiken

| # | Risiko | Severity |
|---|---|---|
| RW3 | Wie ein `fieldset` mit `legend` in einem `standard-form`-Fenster aussieht, ist nur live prüfbar; es könnte eigene Ränder, Abstände oder Breiten mitbringen. Rückfall: Versuch 2 (minimales eigenes CSS) oder eine der beiden anderen Gestaltungen. | `low` |

Kein `high`-Fund, keine Dependency-Änderung.

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m3-rework-2-output.md` (dieses Dokument) | immutable |

**result:** offen bis zum Live-Check.

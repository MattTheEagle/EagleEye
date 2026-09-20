# M3 — Nacharbeit 3, Versuch 2 von 2 — Rework-Protokoll und Design

```
artifact: rework-output
milestone: M3 (Nacharbeit zum Befund F1 aus m6a-05)
phase: APPLY (Design); der Deploy läuft gebündelt mit dem M6b-Paket
status: complete
date: 2026-09-20
```

retention: immutable

Protokoll nach Rework-Regel (`finding_ref`, `attempt`, `action_taken`, `result`). Das Ergebnis steht nach dem Live-Check im zugehörigen Nachtrag; dieses Dokument bleibt unverändert.

---

## Anlass und Freigabe

- **finding_ref:** `m6a-05-live-check-output.md`, **F1** (`low`): Der Titel im Rahmen eines Modul-Tabs sitzt zu nah an der Tab-Leiste. Es ist derselbe Befund, dem Nacharbeit 2 galt (`m3-rework-2-output.md`, dort AC-M3R2-03 nicht erfüllt).
- **attempt:** 2 von 2 (Rework-Limit 2). Das ist der letzte Versuch; genügt auch er nicht, entscheidet der Projektleiter neu (Human Decision).
- **Entscheidung des Projektleiters** (2026-09-20, Wortlaut): "Die Überschrift wirkt immer noch zu nah an den Registerkarten, da aber die aktivierte Registerkarte gehighlighted ist kann die Überschrift auch ganz weg."
  Die Überschrift entfällt.
- **Freigabe:** Die Entscheidung legt das Design fest; sie ist kein ausdrückliches "Go" für einen Deploy (Working Mode). Die Nacharbeit wird deshalb **mit dem M6b-Paket gebündelt** ausgeliefert, und das "Go" für M6b schließt sie ausdrücklich ein. Sie ändert eine Datei aus M3 im
  Zuge von M6b (Cross-Milestone-Änderung); die ausdrückliche Zustimmung mit dem "Go" ist die dafür nötige Freigabe.
- **Offen:** Ob der Rahmen bleibt, wenn sein Titel entfällt (Optionen unten). Die Wahl trifft der Projektleiter mit dem "Go".

## Design (nur `v13/hub-application.ts`, ohne eigenes CSS, `core/` unverändert)

| # | Änderung | Beleg |
|---|---|---|
| 1 | Der Titel des Moduls erscheint im Tab-Körper nicht mehr: kein `h3`, kein `legend`. Die aktive Registerkarte nennt das Modul. | Entscheidung des Projektleiters; die Hervorhebung der aktiven Registerkarte hat er im Live-Check gesehen |
| 2 | Version, Open-Knopf (nur mit `open`) und Einstellungen bleiben, wie sie sind; Tabs, Prüfung und Speichern über `applySettingInput`, Listener und Feldarten bleiben unverändert. | Nachweis im Deploy: `core/` unverändert |
| 3 | Kein CSS, keine neue Abhängigkeit. | R-13 des UI-Leitfadens |

**Was mit dem Rahmen geschieht, ist offen** (der Titel entfällt in beiden Fällen):

- **A: Der Rahmen bleibt ohne sichtbaren Titel.** Ein `fieldset` ohne `legend`; der Modultitel steht für Hilfstechnik als `aria-label`. Das ist die wörtliche Lesart ("die Überschrift kann weg"), die kleinste Änderung.
- **B: Der Rahmen entfällt mit dem Titel (Empfehlung).** Der Tab-Körper ist `section.tab` mit dem Inhalt direkt darin; nichts gruppiert ihn zusätzlich. Ohne Titel dient der Rahmen nur noch als Dekoration; seine obere Linie bliebe
  außerdem dicht unter der Tab-Leiste, sodass der Eindruck "zu nah" bestehen könnte (nur live prüfbar). B hat die wenigsten Elemente und damit die geringste Gefahr, im letzten Versuch wieder schlecht auszusehen. Es entspricht im Kern der Gestaltung, die schon in Rework 2 zur Wahl stand
  ("Überschrift weg, Version als kleine Zeile").

## Akzeptanzkriterien

```
AC-M3R3-01: v13/hub-application.ts erzeugt je Modul-Tab weder einen h3 noch ein legend; bei A steht der Inhalt in einem fieldset ohne legend (aria-label = Modultitel), bei B direkt in der section.tab; Version, Open-Knopf (nur mit open) und Einstellungen bleiben; typecheck endet mit Exit 0.
AC-M3R3-02: core/ ist unverändert; alle Tests bleiben grün; das Bundle enthält weder "innerHTML" noch neue Abhängigkeiten.
AC-M3R3-03 (unverified, Live-Check): Ohne Titel sieht der Tab-Körper gut aus (Abstand zur Tab-Leiste passt, nichts wiederholt den Namen des Tabs); Tabs, Knöpfe, Anordnung der Felder und Schieberegler bleiben wie bestätigt.
```

## Risiken

| # | Risiko | Severity |
|---|---|---|
| RW4 | Wie der Tab-Körper ohne Titel aussieht, ist nur live prüfbar. Es ist der letzte Versuch im Rework-Limit; danach entscheidet der Projektleiter neu (etwa minimales eigenes CSS nach R-13, auf eine eigene Klasse begrenzt). | `low` |
| RW5 | Cross-Milestone: eine M3-Datei wird im Zuge von M6b geändert; die Zustimmung kommt mit dem "Go" für M6b. | `low` |

Kein `high`-Fund, keine Dependency-Änderung. Der UI-Leitfaden (Abschnitt 4) wird mit dem Deploy nachgeführt.

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m3-rework-3-output.md` (dieses Dokument) | immutable |

**result:** offen bis zum Live-Check.

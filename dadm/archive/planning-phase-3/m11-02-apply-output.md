```
artifact: apply-output
milestone: M11
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m11-01-discover-output.md` (Fakten j1–j9, Risiken R1)

## Bewertung der Einstiegspunkte

| Einstieg | Verdict | Risiko | Begründung |
|---|---|---|---|
| Aus dem Hub öffnen | machbar | niedrig | registrierte Startfunktion (j9) |
| "Open in Eagle Journal" in der Kopfzeile des Journal-Blatts | machbar | niedrig | `getHeaderControlsJournalEntrySheet` (j1, j2) |
| "Open in Eagle Journal" im Verzeichnis (Eintrag) | machbar | niedrig-mittel | Kontextmenü-Hook der Form `get…ContextOptions` (j3); Name für Einträge nicht einzeln belegt (R1). Ersatzweg: `renderJournalDirectory` und Einträge im DOM ergänzen |
| "Create Eagle Journal Note" im Verzeichnis (Kopfzeile, Ordner-Kontextmenü) | machbar | niedrig-mittel | `renderJournalDirectory` / `getHeaderControlsJournalDirectory` (j1, j2), Ordner-Kontextmenü wie oben |
| "Create Eagle Journal Note" in der Kopfzeile des Journal-Blatts | machbar | niedrig | wie "Open in" |
| Weitere Stellen (Kartennotizen, Compendium-Journale) | nicht festgelegt | — | siehe N17 |

**"Note" = neuer Journal-Eintrag im Eagle-Journal-Vault (Q12 a).** Flight Control legt den Eintrag an (Q3 a) und ordnet ihn in den Vault der aktuellen Nutzerin oder des aktuellen Nutzers ein; der Eagle Journal öffnet ihn.

## Berührte Funktionen der Vision (Ursprungsplan gilt, Q0 a)

- **Rechte:** Das Anlegen von Journal-Einträgen ist standardmäßig Trusted-Rolle (j4). Für Spieler mit der normalen Rolle braucht der Vault-Aufbau (jeder Spieler bekommt einen eigenen Ordner mit eigenen Einträgen) entweder den GM-Anfrageweg aus M5 (`User#query`) oder eine Rechtefreigabe. Wer was darf, legt der Projektleiter später in den Moduleinstellungen fest (N1).
- **Private Vaults:** Sichtbarkeit läuft über die Berechtigung am einzelnen Eintrag (Phase-2-Befund); Ordner tragen keine Berechtigung (j5). Wann ein Ordner im Verzeichnis eines Spielers erscheint, ist nicht verifiziert (R1); davon hängt ab, ob Spieler fremde Ordner (leer) sehen könnten.
- **Automatische Ablage neuer Einträge:** Über `preCreateJournalEntry` (j8) lässt sich jedes neu angelegte Journal, auch aus anderen Modulen, vor dem Anlegen in die Struktur einordnen. Ob die Ablage für **alle** neuen Einträge gelten soll oder nur für im Eagle Journal angelegte, ist offen (N17).
- **Rechtsklick "Link to…" im Editor (V-TA7):** Der Baustein `ContextMenu` existiert (j6); die Einbindung in den ProseMirror-Editor ist nicht verifiziert (R1). Das Phase-2-Ergebnis für Verlinkung (`@UUID`) bleibt gültig; diese Einbindung war dort nicht Gegenstand. Sie gehört nicht zum Auftrag dieses Milestones und ist als Restrisiko notiert.
- **Alle direkten Foundry-Änderungen über Flight Control (V-TA8, Q3 a):** gilt; das Öffnen und Anzeigen im Eagle Journal ist Lesen und läuft direkt.

## Hinweis zum PDF ("am Original Journal Code orientieren")
Der Foundry-Quelltext liegt lokal nicht vor (j7). Die Einhängepunkte (Hook-Namen, Selektoren) sind in der Umsetzung gegen das laufende Foundry v13 und die API-Dokumentation zu bestätigen. Das ist kein Machbarkeitsrisiko, weil alle drei Muster (Render-Hook, Kopfzeilen-Hook, Kontextmenü-Hook) in den Types belegt sind.

## Zusammenfassung
| Bereich | Verdict | Risiko |
|---|---|---|
| Einstieg über Hub, Blatt-Kopfzeile, Verzeichnis (Öffnen und Anlegen) | machbar | niedrig bis niedrig-mittel |
| "Note" als neuer Journal-Eintrag im Vault | machbar über Flight Control | niedrig |
| Rechte der Spieler (Anlegen) | machbar mit GM-Anfrageweg oder Rollenfreigabe | niedrig-mittel |
| Automatische Ablage | machbar; Geltungsbereich offen | niedrig |
| Rechtsklick-Link im Editor | nicht verifiziert, nicht Teil des Auftrags | mittel (Restrisiko) |

## Nicht blockierender offener Punkt
| # | Punkt | Auswirkung |
|---|---|---|
| N17 | (a) Welche Stellen genau: Verzeichnis-Kopfzeile, Ordner-Kontextmenü, Eintrags-Kontextmenü, Blatt-Kopfzeile, außerdem Kartennotizen und Compendium-Journale? (b) "Open in Eagle Journal" bei einem Eintrag **außerhalb** des Vault (Welt-Journale anderer Herkunft, Compendium-Einträge): nur öffnen, Einordnung in den Vault anbieten oder nicht anbieten? (c) Gilt die automatische Ablage für alle neu angelegten Journal-Einträge oder nur für im Eagle Journal angelegte? | Umfang der Einstiegspunkte, Eingriff in fremde Erstellwege |

## Acceptance Criteria
- AC-M11-01: Jeder Einstiegspunkt hat ein Verdict mit Belegen (j1–j9)
- AC-M11-02: Klärung Q12 a ist eingearbeitet
- AC-M11-03: Ergebnis und N17 stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Genaue Hook-Namen, Sichtbarkeitsregel für Ordner und Kontextmenü im Editor nicht verifiziert | medium | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md`.

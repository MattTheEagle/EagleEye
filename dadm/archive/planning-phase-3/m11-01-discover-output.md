```
artifact: discover-output
milestone: M11
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M11), Antworten Q12 a ("Eagle Journal Note" = neuer Journal-Eintrag im Eagle-Journal-Vault), Q3 a (Änderungen über Flight Control), N1 (Rechte später in den Moduleinstellungen), N4
- PDF-Aussagen P-J1, P-J2; Vision V-TA1 bis V-TA8; Phase-2-Ergebnis zu Talon (`dadm/eagle-modules-projektplan.md`, Abschnitt M7 der Planungsphase 2)
- Ergebnisse M5 (Hub-Start, GM-Anfrageweg), M9 (Hook für Kopfzeilen)
- Foundry-v13-Types (`foundry-vtt-reference-v13`)

## Fakten

| # | Fakt | Quelle |
|---|---|---|
| j1 | In v13 sind sowohl das Journal-Blatt (`JournalEntrySheet`) als auch das Journal-Verzeichnis (`JournalDirectory`) `ApplicationV2`-Klassen und in der Hook-Konfiguration eingetragen. Damit gelten die Hook-Muster `render{Name}`, `getHeaderControls{Name}` und `get{Name}ContextOptions` für beide | `client/applications/sidebar/tabs/journal-directory.d.mts:1–24`, `client/applications/sheets/journal/journal-entry-sheet.d.mts`, `client/hooks.d.mts:66–93` |
| j2 | Kopfzeilen-Steuerelemente eines Fensters lassen sich über `getHeaderControls{Name}` ergänzen (jede Klasse der Vererbungskette löst den Hook aus) | `client/hooks.d.mts:1058–1069` |
| j3 | Kontextmenü-Einträge lassen sich über Hooks der Form `get{Name}ContextOptions` ergänzen; der genaue Hook-Name für die **Einträge und Ordner** im Journal-Verzeichnis ist in den Types nicht einzeln belegt | `client/hooks.d.mts:82–93, 1073–1076` |
| j4 | Das Anlegen von Journal-Einträgen ist standardmäßig auf die Rolle "Trusted" gesetzt (`JOURNAL_CREATE`); normale Spieler dürfen ohne Freigabe keine Einträge anlegen | `common/constants.d.mts:1403–1410` |
| j5 | Ordner haben keine eigene Berechtigung (Phase-2-Befund); die Sichtbarkeit von Einträgen ergibt sich aus der Berechtigung am Eintrag. Ob und wann ein Ordner im Verzeichnis eines Spielers angezeigt wird, steht als `Folder#displayed` in den Types, die Regel dahinter ist dort nicht beschrieben | Projektplan Planungsphase 2 (M7), `client/documents/folder.d.mts:537–540` |
| j6 | Der Baustein `ContextMenu` liegt in Foundry vor; eine ProseMirror-eigene Kontextmenü-Klasse ist in den Types nicht zu finden | `client/applications/ux/context-menu.d.mts`, Suche in den Types |
| j7 | Der Foundry-Quelltext selbst liegt lokal nicht vor, nur die Types; der Hinweis des PDF "am Original Journal Code orientieren" bezieht sich auf Code, der hier nicht einsehbar ist | Lokale Referenz `foundry-vtt-reference-v13` |
| j8 | Standard-Hooks `create{Typ}` und `preCreate{Typ}` (z. B. `preCreateJournalEntry`) laufen bei jedem Anlegen, unabhängig davon, welcher Weg oder welches Modul den Eintrag erzeugt | `client/hooks.d.mts:109` |
| j9 | Der Hub-Start eines Moduls ist eine registrierte Startfunktion (M5 (a)) | M5 |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (Live-System oder Foundry-Dokumentation nötig): genaue Hook-Namen und Selektoren für Verzeichnis-Einträge und Ordner, Sichtbarkeitsregel für Ordner bei Spielern, Einbindung eines Kontextmenüs im ProseMirror-Editor | medium | nein |
| A1 | "Überall dort, wo Journal-Einträge geöffnet oder erstellt werden können" wird als Liste konkreter Orte gelesen; die genaue Liste steht nicht im PDF (N17) | low | nein |

## Open Questions
Keine, die den Ablauf stoppen; nicht blockierender Punkt N17 in Apply.

## Next Step
Apply bewertet die Einstiegspunkte und die davon berührten Funktionen.

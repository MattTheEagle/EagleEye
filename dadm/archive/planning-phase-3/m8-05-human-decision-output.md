```
artifact: human-decision
milestone: M8 (Sammelentscheidung zu M5–M8)
phase: MONITOR (Pause nach M8)
status: decided
immutable: true
date: 2026-09-19
decided-by: Projektleiter
```

## Trigger / Reason
Auf Wunsch des Projektleiters pausierte der Ablauf nach M8 ("Pause after m8"). Die in M5 bis M8 gesammelten, nicht blockierenden Punkte N1–N9 wurden vorgelegt und beantwortet.

## Blocking Summary
Keine Blockade. Die Antworten legen Regeln für die Umsetzung fest und lösen einen Planwechsel aus (neuer Milestone M8a).

## Options und Empfehlung
Optionen und Vorschläge je Punkt: `dadm/spezifikationsabgleich.md` (Milestone-Abschnitte M5–M8) sowie `dadm/m5-02-apply-output.md`, `m6-02-apply-output.md`, `m7-02-apply-output.md`, `m8-02-apply-output.md`.
Bei N5 und N7 folgte der Projektleiter dem Vorschlag; bei N2, N3, N6, N8, N9 entschied er selbst.

## Evidence
Antworten im Wortlaut: `dadm/reference/eagle-modules-aufbau.md`, Abschnitt "Antworten des Projektleiters zu den offenen Punkten N1–N9".

## Final Human Decision
**approve** (Rückfragen zu N6 bis N8 im selben Zug beantwortet):

| # | Entscheidung |
|---|---|
| N1 | Nutzungsrechte je Modul und Nutzer werden später in den Moduleinstellungen festgelegt |
| N2 | Inaktive Eagle Module werden im Hub ausgeblendet |
| N3 | Der Klartext erscheint auf Englisch |
| N4 | Die Editor-Logik bleibt in den Modulen; Flight Control bleibt schmal und generisch |
| N5 | Bedingte Effekte: erst Stufe 1 (Weg A, ohne Laufzeitcode, Homebrew), dann Stufe 2 (Weg C, Roll Out) |
| N6 | Jede Verlinkung wird beim Kopieren auf die Library-Kopien umgeschrieben. Für die Erfassung wählte der Projektleiter "Neuer Milestone" (M8a, Plan Version 2) |
| N7 | Ohne gespeicherte Version: standardmäßig 2014; existiert der Name in 2014, in 2024 nicht: 2024; existiert er in beiden: Duplikat, protokolliert; beim Erzwingen wählt der GM die Version |
| N8 | Erzwungene Übertragung: unter geändertem Namen ablegen, "Ursprungsname (Duplicate)"; weitere Duplikate nummeriert ("(Duplicate 2)", …) |
| N9 | Nur Namenssuche; ein Hotkey für alle; Compendien lesen direkt im Library-Modul, Compendien ändern über Flight Control |

## Folgen
- **Plan:** Entwurf Version 2 mit neuem Milestone M8a liegt als `dadm/04-milestone-plan-v2.md` vor und **wartet auf die Freigabe**; bis dahin gilt Version 1. Nummern der übrigen Milestones bleiben unverändert.
- **M5-Empfehlung angepasst durch N2:** Die Erkennung inaktiver Module über Manifest-`flags` ist nicht mehr nötig; die API-Registrierung genügt.
- **Hinweis zu N3:** dnd5e-Labels folgen der aktiven Foundry-Sprache. Läuft die Instanz nicht auf Englisch, braucht englischer Klartext englische Strings; nicht geprüft.
- **N1** führt eine spätere Anforderung ein (Rechteverwaltung je Modul und Nutzer in den Moduleinstellungen); Flight Control braucht dafür den GM-Anfrageweg (M5).
- **M1** erhielt am 2026-09-19 das ausdrückliche "Go" und wurde ausgeführt (`m1-*-output.md`).

## Next Step
Der Ablauf bleibt pausiert. Weiter erst auf Wunsch des Projektleiters: Freigabe von Plan Version 2, danach M8a, M9 und folgende.

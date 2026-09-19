# M6 — Human Decision 1: Herkunft und Vertrauensgrad der Nutzeridentität

```
artifact: human-decision-record
milestone: M6
phase: DISCOVER (Übergang zum Apply)
trigger: Governance-Trigger 2 (high|critical Security): Risiko R1 aus m6-01-discover-output.md, Herkunft der Nutzeridentität
date: 2026-09-20
decided-by: Projektleiter

summary:
  Die Nutzungsrechte je Modul und Nutzer (N1, M6) brauchen auf der GM-Seite die Antwort auf die Frage, welcher Nutzer eine Anfrage gestellt hat. Foundry beantwortet sie nicht: Der Query-Handler beim GM
  bekommt neben den Anfragedaten nur die Anfrage-Option { timeout } (live bestätigt, m5-05 B5). Eine im Umschlag mitgeschickte Nutzer-ID kann ein veränderter Client fälschen. Zu entscheiden ist,
  woher die Nutzeridentität kommt und wie viel Vertrauen sie bekommt.

blocking-reasons:
  - Foundry gibt dem Handler keinen Absender mit (FF9 in m6-01, m5-05 B5); ohne Entscheidung lässt sich das Rechtemodell nicht entwerfen.
  - Ein bleibender high-Security-Fund ist nach Governance eine Human Decision (Rechte, die sich mit einer gefälschten ID umgehen lassen, wären ein Rechteproblem, Plan M6, Risiko high).
  - Die Wahl bestimmt Datenmodell, Ablauf der Prüfung, Fehlerfälle und Vertrag Teil 5.

options:
  - option: A. Vertrauen auf die mitgeschickte Nutzer-ID
    risks: Ein technisch versierter Spieler könnte sich als anderer Nutzer ausgeben und dessen Eagle-Rechte nutzen; das wirkt nur bei Aktionen, die Flight Control mit GM-Rechten ausführt (bei Aktionen im eigenen Client bringt es
      dem Spieler nichts, was Foundry ihm nicht ohnehin erlaubt). Der Vertrag müsste das als Vertrauensgrenze nennen. Einfach, ohne zusätzlichen Ablauf, später verschärfbar.
  - option: B. Rückfrage des GM an den genannten Nutzer
    risks: Der GM lässt den genannten Nutzer bestätigen, dass die Anfrage von ihm kommt; eine gefälschte ID fällt auf, weil der ehrliche Client des genannten Nutzers die Anfrage nicht gestellt hat. Mehr Aufwand (ein zusätzlicher
      Hin- und Rückweg), neue Fehlerfälle (Nutzer nicht verbunden, keine Antwort, Zeitüberschreitung; jede fehlende Bestätigung muss zur Ablehnung führen). Ob Foundry `User#query` vom GM an einen Spieler zuverlässig zustellt und wie es
      sich bei Fehlern verhält, ist nicht geprüft (m6-01 U3); ein kleiner Live-Check muss das vorab zeigen. Schutz nur gegen die Fälschung einer fremden Identität, nicht gegen einen Nutzer, der sich selbst freiwillig ausgibt.
  - option: C. Rechte nur je Modul, nicht je Nutzer
    risks: Keine Nutzer-ID nötig, nichts Nutzerbezogenes fälschbar (die Modul-ID bleibt eine Vertrauensgrenze). Der Projektleiter könnte nicht mehr pro Spieler unterscheiden; das weicht vom Wortlaut von N1 ("von wem") ab.

recommended-option: A. Vertrauen auf die mitgeschickte Nutzer-ID. Begründung (Empfehlung des Assistenten): einfach, ohne unbelegte Abhängigkeit von einem nicht geprüften Foundry-Verhalten, für eine Tischrunde unter Bekannten
  passend, später verschärfbar; das Risiko wirkt nur bei Aktionen mit GM-Rechten und wird im Vertrag als Vertrauensgrenze genannt.

evidence-refs:
  - dadm/m6-01-discover-output.md (R1, R2, FF8, FF9, U3, U4)
  - dadm/m5-05-live-check-output.md (B5, Folgen 2)
  - dadm/m5-02-apply-output.md (Abschnitt 9, S4)
  - core/request-relay.ts (Empfänger), docs/api-contract.md (Abschnitt "The sender is trusted")

decision: modify
decision-notes: >
  Der Projektleiter wählt **Option B** statt der empfohlenen Option A ("Rückfrage des GM an den genannten Nutzer"). Damit arbeitet M6 mit einer Bestätigung durch den genannten Nutzer. Bedingungen und Folgen:
  1. **Vorab-Prüfung vor dem Deploy:** Ein kleiner Live-Check (Spike, `dadm/m6-spike-1-output.md`) muss zeigen, dass `User#query` vom GM an einen Spieler zuverlässig zugestellt und beantwortet wird und wie sich Fehler und
     Zeitüberschreitung verhalten. Scheitert er, geht M6 zurück zu dieser Human Decision (Rückfall auf A oder C); der Deploy startet nicht.
  2. **Fail closed:** Fehlt die Bestätigung aus irgendeinem Grund (Nutzer nicht verbunden, keine Antwort, Fehler, Zeitüberschreitung, Widerspruch), wird die Anfrage abgelehnt.
  3. **Restrisiko, ausdrücklich angenommen:** B schützt gegen die Fälschung einer fremden Identität. Es schützt nicht gegen einen Nutzer, der sich selbst freiwillig ausgibt, und nicht gegen die Modul-ID, die eine Vertrauensgrenze bleibt.
  4. Das Apply entwirft die Bestätigung (Ablauf, Fehlerfälle, neue Codes, Vertrag Teil 5) und legt die Severity des verbleibenden Restrisikos neu fest; bleibt danach ein high-Security-Fund, ist erneut eine Human Decision nötig.

weitere-antworten-derselben-runde (keine Human Decision, festgehalten für das Apply):
  - "in wie weit": nur erlaubt oder verboten je Modul und Nutzer, dazu je Art des Ziels
  - "Art des Ziels": eigene oder fremde Ziele (Besitz nach Foundry)
  - Durchsetzung: bindend beim GM, als Regel im eigenen Client
  - Einstellen: nur der GM, im Hub
  - Modulüberschrift im Hub: Rahmen mit Titel (fieldset); gilt als Go für die Nacharbeit 2 von M3 (m3-rework-2-output.md)
```

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6-hd-1-output.md` (dieses Dokument) | immutable |

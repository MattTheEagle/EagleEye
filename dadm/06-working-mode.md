# Working Mode — EagleEye (Umsetzungsphase 4: Eagle Flight Control)

retention: durable
status: confirmed (2026-09-19, mit der Plan-Freigabe bestätigt, siehe 05-milestone-plan-approval.md)

**one_chat** — Planung und Umsetzung finden in einem Chat statt.
*(inherited aus quickstart_defaults)*

## Autonomie-Regelung für Milestone Plan Version 1
**status: project_specific (Wahl des Projektleiters am 2026-09-19: "Discover+Apply autonom, vor Deploy Go")**

Die Autonomie-Freigaben früherer Phasen gelten nicht automatisch weiter.

- **Discover und Apply** jedes Milestones werden eigenständig bearbeitet, ohne
  nach jeder Phase um Erlaubnis zu fragen.
- **Vor jedem Deploy** (Code schreiben, ändern, löschen) steht ein Stopp: Der
  Projektleiter gibt ausdrücklich "Go" für diesen Milestone-Deploy. Ohne "Go"
  wird kein Code angefasst.
- **Monitor** folgt dem Deploy ohne weiteren Stopp; das Ergebnis liefere ich
  mit. *(Auslegung der Autonomie-Wahl; mit der Plan-Freigabe am 2026-09-19
  bestätigt.)*
- Nach abgeschlossenem Monitor geht es mit Discover und Apply des nächsten
  Milestones weiter; das nächste Deploy wartet wieder auf "Go".
- **Bei jeder Unklarheit** über die Absicht/Interpretation einer Anforderung
  wird der Ablauf gestoppt und gefragt. Es werden keine Annahmen getroffen, die
  der Projektleiter nicht ausdrücklich festgehalten hat. Offene technische
  Recherchefragen sind der Zweck von Discover und rechtfertigen allein keinen
  Stopp.
- **Voraussichtlicher Stopp in M6 (Apply):** Die Bedeutung von "in wie weit"
  (N1) ist nicht festgelegt; sie wird nicht interpretiert, sondern erfragt.
- Unverändert gültig: die regulären DAD-M-Eskalationsregeln (kritische Funde,
  hohe Security-/Privacy-Risiken, Scope-Verletzungen, Cross-Milestone-Änderungen,
  Dependency-Änderung außerhalb der Boundaries, Rework-Limit 2, strategische
  Architektur-Tradeoffs ohne klare beste Option).

## Live-Tests und Publizieren
- Live-Tests entscheidet der Projektleiter **einzeln nach Bedarf** (Live-Test-
  Gate aus den Boundaries); der Projektleiter deployt auf Forge selbst und
  kopiert Konsolen-Logs in den Chat. Nie pauschal annehmen.
- Aussagen, die nur live prüfbar sind, bleiben `unverified`, bis ein
  freigegebener Test sie bestätigt.
- **Commit und Push nur auf ausdrückliche Anweisung** (bisherige Arbeitsweise;
  die Freigabe der Vorphase gilt nicht als Dauerfreigabe). GitHub-Releases nur
  bei echten Milestone-Abschlüssen und nur auf Anweisung.

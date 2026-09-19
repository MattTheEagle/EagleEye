# Safety Boundaries — EagleEye (Umsetzungsphase 4: Eagle Flight Control)

retention: durable
status: confirmed (vom Projektleiter am 2026-09-19 bestätigt, Quickstart-Schritt 3: "Übernehmen wie gezeigt")

Quelle: `quickstart_defaults` (inherited), ergänzt um die `bootstrap_overrides`
aus `.dadm-workspace.yaml` (overridden). Gegenüber Planungsphase 3 keine
inhaltliche Änderung. Der Kommentar im Kopf der Defaults-Datei nennt die Werte
"Platzhalter"; sie enthalten keine TODO-Marken und werden als produktiv
übernommen (Hinweis dem Projektleiter gemeldet).

## Allowed areas — inherited
Voller Zugriff auf Projektordner, Projekt-Repo, Projekt-Dokumentation und
Projekt-Notizen. Andere Projekte nur read-only, nur mit Freigabe und nur für
projektbezogene Recherche. Obergrenze ist `/run/media/matt/Data/matt/Coding`;
alles darüber hinaus ist off-limits.

## Off-limits areas — inherited
Systemverzeichnisse (`/root`, `/etc`, `/var`, `/usr`, `/bin`, `/sbin` usw.),
keine Systemänderungen, keine Installation nicht freigegebener Software, keine
Änderungen an anderen Projekten oder Dependencies ohne Freigabe.

## Dependency-Änderungen — inherited
Erlaubt, aber je Fall freigabepflichtig, projektbezogen und mit genauer
Begründung. In dieser Phase nicht erwartet.

## Netzwerkzugriff — inherited
Read-only, nur projektbezogene Recherche. Paket-Downloads sind
freigabepflichtig.

## Mandatory proofs — inherited
Keine standardisierten Proofs. Proofs werden projektbezogen im Milestone Plan
definiert (Ziel: jeden Milestone passend festigen, Tokenverbrauch optimieren,
Proofs nicht ohne Notwendigkeit wiederholen). Siehe `04-milestone-plan.md`.

## Milestone-Größe — inherited
Fein — viele kleine Milestones statt weniger großer.

## Working Mode — inherited
`one_chat`. Siehe `06-working-mode.md`.

## Projektspezifischer Override: Live-Testausführung
**status: overridden (unverändert aus `.dadm-workspace.yaml`)**

Testausführung gegen die reale Forge-Instanz (insbesondere Quench) erfordert
vorherige ausdrückliche Freigabe durch den Projektleiter, jedes Mal. Keine
automatisierte oder eigenständige Ausführung von Quench-Tests ohne diese
Freigabe. Grund: Der Projektleiter erwägt, Live-Tests teilweise selbst
durchzuführen, um zu prüfen, ob sich die Funktionen für echte Nutzer wie
beabsichtigt anfühlen; das ist noch nicht final entschieden. Vitest (reine
Logik ohne Foundry-Kontext) ist davon nicht betroffen.

## Projektspezifischer Override: Ausgehendes Publizieren
**status: overridden (unverändert aus `.dadm-workspace.yaml`)**

Öffentliches Publizieren ist erlaubt, seit M2 (Forge-Deployment-Entscheidung)
vom Projektleiter ausdrücklich freigegeben. Aktuell freigegeben ist nur das
öffentliche Repository `github.com/MattTheEagle/EagleEye` inklusive Releases,
ausschließlich für den in M2 vereinbarten Hybrid-Workflow (GitHub +
Manifest-URL nur für echte Meilenstein-Abschlüsse; der Import Wizard bleibt
Standardweg für laufende Iterationen). Neue oder zusätzliche öffentliche Ziele
außerhalb dieses einen Repos bleiben freigabepflichtig.

## Hinweise für diese Phase (keine Änderung der Boundaries)
- Keine neuen GitHub-Repos in dieser Phase (Non-Goal); jedes künftige
  Modul-Repo bräuchte eine eigene Freigabe.
- Read-only Zugriff auf `foundry-vtt-reference-v13` (extern) ist mit der
  Antwort vom 2026-09-19 freigegeben. Nachträge ins dortige `cheat-sheet.md`
  bleiben freigabepflichtig (Schreiben in einem anderen Projekt); ich lege sie
  dem Projektleiter jeweils vor.
- Commit und Push nur auf ausdrückliche Anweisung (siehe `06-working-mode.md`).

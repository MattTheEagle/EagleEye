# Safety Boundaries — EagleEye (Planungsphase 3: Spezifikations-Update)

retention: durable
status: approved (vom Projektleiter am 2026-09-19 bestätigt, Quickstart-Schritt 3)

Quelle: `quickstart_defaults` (inherited), ergänzt um die `bootstrap_overrides`
aus `.dadm-workspace.yaml` (overridden). Gegenüber Planungsphase 2 nur zwei
Konkretisierungen (siehe "Mandatory proofs" und "Ausgehendes Publizieren").

## Allowed areas — inherited
Voller Zugriff auf Projektordner, Projekt-Repo, Projekt-Dokumentation und
Projekt-Notizen. Read-only auf andere Projekte unter
`/run/media/matt/Data/matt/Coding`, nur mit Freigabe und nur für
projektbezogene Recherche. Öffentliche Web-Quellen (z. B. `foundryvtt/dnd5e`,
die zehn analysierten Modul-Repos) sind rein lesend erlaubt; die dafür
angelegten Klone im Scratchpad sind temporär und nicht Teil des Repos.

## Off-limits areas — inherited
Systemverzeichnisse, keine Systemänderungen, keine ungenehmigten
Software-Installationen, keine Änderungen an anderen Projekten oder
Dependencies ohne Freigabe.

## Dependency-Änderungen — inherited
Erlaubt, aber freigabepflichtig. Für diese Phase nicht erwartet: M1 entfernt
nur Skripte und Verzeichnis, fügt aber nichts hinzu und ändert keine Pakete.

## Netzwerkzugriff — inherited
Read-only, nur projektbezogene Recherche. Paket-Downloads freigabepflichtig.

## Mandatory proofs — inherited, für diese Phase konkretisiert
Keine standardisierten Proofs, projektbezogen und token-sparend, nicht
wiederholt.
- Recherche-Milestones (M2–M15): schriftlicher Discover-/Apply-Output mit
  Quellenbelegen, geprüft auf Nachvollziehbarkeit, nicht auf Ausführung.
- Code-Milestone M1: `npm run typecheck`, `npm test` und `npm run build`
  laufen für v13 durch; Ausgabe steht im Deploy-Output. Kein Live-Test.

## Milestone-Größe — inherited
Fein — viele kleine Milestones statt weniger großer.

## Working Mode — inherited
`one_chat`. Siehe `06-working-mode.md`.

## Projektspezifischer Override: Live-Testausführung
**status: overridden (unverändert aus `.dadm-workspace.yaml`)**

Testausführung gegen die reale Forge-Instanz (insbesondere Quench) erfordert
vorherige explizite Freigabe durch den Projektleiter, jedes Mal. Vitest (reine
Logik ohne Foundry-Kontext) ist davon nicht betroffen. In dieser Phase ist kein
Live-Test vorgesehen.

## Projektspezifischer Override: Ausgehendes Publizieren
**status: overridden (unverändert aus `.dadm-workspace.yaml`)**

Öffentliches Publizieren bleibt beschränkt auf das bestehende Repository
[github.com/MattTheEagle/EagleEye](https://github.com/MattTheEagle/EagleEye).
Neu zu beachten: Das PDF sieht ein eigenes GitHub-Repo pro Modul vor. Jedes
weitere Repo wäre ein neues öffentliches Ziel und bräuchte eine eigene
Freigabe; in dieser Phase werden keine angelegt. Auch Änderungen an
bestehenden GitHub-Releases (z. B. eine eventuell vorhandene v14-Release)
gehören nicht zu M1 und würden separat freigegeben.

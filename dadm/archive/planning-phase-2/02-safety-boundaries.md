# Safety Boundaries — EagleEye (Eagle Modules Planungsphase)

retention: durable

Quelle: `quickstart_defaults` (inherited), ergänzt um die aus Research Phase 1
übernommenen `bootstrap_overrides` aus `.dadm-workspace.yaml`. Vom
Projektleiter für diese Phase ausdrücklich bestätigt (unverändert
weitergeführt).

## Allowed areas (inherited)
Voller Zugriff auf Projektordner, Projekt-Repo, Projekt-Dokumentation und
Projekt-Notizen. Read-only auf andere Projekte unter
`/run/media/matt/Data/matt/Coding`, nur mit Freigabe und nur für
projektbezogene Recherche. Web-Recherche (z. B. öffentliche GitHub-Repos wie
`foundryvtt/dnd5e`) fällt unter projektbezogene Recherche und ist ohne
Einzelfreigabe erlaubt, solange rein lesend.

## Off-limits areas (inherited)
Systemverzeichnisse, keine Systemänderungen, keine ungenehmigten
Software-Installationen, keine Änderungen an anderen Projekten/Dependencies
ohne Freigabe.

## Dependency-Änderungen (inherited)
Erlaubt, aber freigabepflichtig — für diese Phase ohnehin nicht relevant, da
keine Code-Implementierung stattfindet.

## Netzwerkzugriff (inherited)
Read-only, nur projektbezogene Recherche. Paket-Downloads freigabepflichtig
(für diese Phase nicht erwartet).

## Mandatory proofs (inherited, für diese Phase konkretisiert)
Keine standardisierten Proofs. Da diese Phase reine Recherche/Analyse ist
(kein Build/Test/Live-Forge-Check), besteht der "Proof" je Milestone aus dem
schriftlichen Discover-/Apply-Ergebnis selbst — geprüft auf Nachvollziehbarkeit
und Beleg-Qualität (Quellenangaben), nicht auf Ausführung. Siehe
`04-milestone-plan.md`.

## Milestone-Größe (inherited)
Fein — viele kleine Milestones statt weniger großer.

## Working Mode (inherited)
`one_chat`. Siehe `06-working-mode.md`.

## Projektspezifischer Override: Live-Testausführung (aus Phase 1 übernommen)
**status: overridden**

Testausführung gegen die reale Forge-Instanz (insbesondere Quench) erfordert
vorherige explizite Freigabe durch den Projektleiter, jedes Mal. Für diese
Phase ohnehin nicht relevant (keine Implementierung, kein Live-Test).

## Projektspezifischer Override: Ausgehendes Publizieren (aus Phase 1 übernommen)
**status: overridden**

Öffentliches Publizieren bleibt beschränkt auf das bestehende Repository
[github.com/MattTheEagle/EagleEye](https://github.com/MattTheEagle/EagleEye).
Für diese Phase nicht relevant, da keine neuen Releases/Code entstehen.

# Safety Boundaries — EagleEye

retention: durable

Quelle: `quickstart_defaults` (inherited), ergänzt um projektspezifische
`bootstrap_overrides` aus `.dadm-workspace.yaml`. Vom Projektleiter bestätigt.

## Allowed areas (inherited)
Voller Zugriff auf Projektordner, Projekt-Repo, Projekt-Dokumentation (inkl. Readme,
Milestone Plan, Proofs) und Projekt-Notizen. Vorerst nur read-only Zugriff auf andere
Projekte in übergeordneten Repos/Ordnern/Dokumentationen unter
`/run/media/matt/Data/matt/Coding`. Zugriff auf andere Projekte nur mit Freigabe durch
den Projektleiter und nur für projektbezogene Recherche. Darüber hinausgehende Ordner
sind off-limits.

## Off-limits areas (inherited)
`/root`, `/etc`, `/var`, `/usr`, `/bin`, `/sbin` etc. Keine Systemdatei-Änderungen,
keine Installation nicht projektnotwendiger Software, keine Änderungen an anderen
Projekten oder Dependencies ohne Freigabe durch den Projektleiter.

## Dependency-Änderungen (inherited)
Erlaubt, aber freigabepflichtig. Nur projektbezogen und mit konkreter Begründung, warum
die Dependency geändert werden muss.

## Netzwerkzugriff (inherited)
Read-only als Default, nur für projektbezogene Recherche. Paket-Downloads erfordern
Freigabe durch den Projektleiter. Keine Installation nicht projektnotwendiger Software.

## Mandatory proofs (inherited, projektspezifisch konkretisiert)
Keine standardisierten Proofs. Proofs werden pro Milestone in der Milestone Plan
festgelegt, mit dem Ziel, Tokenverbrauch zu optimieren (Proofs nicht wiederholen, wenn
nicht nötig). Siehe `04-milestone-plan.md` für die konkreten Proofs je Milestone.

## Milestone-Größe (inherited)
Fein — viele kleine Milestones statt weniger großer.

## Working Mode (inherited)
`one_chat` — Planung und Umsetzung in einem Chat. Siehe `06-working-mode.md`.

## Projektspezifischer Override: Live-Testausführung
**status: overridden** (ergänzt gegenüber den Defaults)

Testausführung gegen die reale Forge-Instanz (insbesondere Quench) erfordert
**vorherige explizite Freigabe durch den Projektleiter, jedes Mal**. Keine
automatisierte oder eigenständige Ausführung von Quench-Tests ohne diese Freigabe.

Grund: Der Projektleiter erwägt, Live-Tests teilweise selbst durchzuführen, um zu
prüfen, ob sich die Funktionen für echte Nutzer wie beabsichtigt anfühlen — das ist
noch nicht final entschieden.

Vitest (reine Logik ohne Foundry-Kontext) ist von dieser Einschränkung nicht betroffen.

## Eingriffstiefe (projektspezifisches Prinzip, kein Safety-Boundary-Verbot)
Tiefe Eingriffe in Foundry/fremde Module (z. B. via `libWrapper`) sind grundsätzlich
erlaubt (Forge-Cloud-Instanz, keine geteilte Produktivumgebung mit Dritten). Es gilt
aber das Prinzip "beobachtend zuerst": Funktionen werden zuerst ohne tiefe Eingriffe
umgesetzt; tiefe Eingriffe sind Fallback, kein Standardweg.

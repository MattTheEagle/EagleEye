```
artifact: discover-output
milestone: M3
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m1-01-discover-output.md` (A3b/A3c, Ursprung dieses Milestones)
- Foundry-Typ-Fakten (`module-management.d.mts`)
- Websuche zu Modul-Aktivierungsmechanismus und Präzedenz-Modulen

## Teilfrage (b): Modul-(De)Aktivierung — Fakten geklärt

- Modul-Aktivierung wird über die `ModuleManagement`-ApplicationV2-Klasse
  verwaltet ("provides a view of which modules are available... and allows
  for configuration of the set of modules which are active within the
  World") — in unserer gepinnten v13-Referenz selbst als **"TODO: Stub"**
  markiert, d. h. auch Foundrys eigene Typdefinitionen geben hierfür keine
  vollständige, dokumentierte externe API her
- Bestätigt (Community-Wiki): Aktivieren eines Moduls über die Standard-UI
  erfordert einen Klick auf "Save Module Settings", was **einen
  Welt-Neustart auslöst** — Module werden beim Boot per Script-Tag geladen,
  kein Hot-Toggle zur Laufzeit
- Precedent-Modul "Quick Module Enable" bestätigt: bietet nur eine
  **komfortablere UI** über dem Standard-Modul-Manager, keine programmatische
  API zum Umgehen des Reload-Erfordernisses
- **Kein Beleg gefunden** für eine öffentliche, dokumentierte API, über die
  ein laufendes Drittmodul (wie Eagle Eye) den Aktiv-Status eines anderen
  Moduls zur Laufzeit ändern kann

**Zwischenfazit (b):** Modul-(De)Aktivierung **durch Eagle Eye programmatisch
auslösen** ist wahrscheinlich nur über undokumentierte Interna möglich (z. B.
direktes Schreiben der zugrunde liegenden World-Konfiguration, die die
`ModuleManagement`-UI selbst nutzt) — nicht über eine stabile, offizielle
API. Ein World-Neustart wäre in jedem Fall nötig, selbst wenn ein Weg
gefunden würde.

## Teilfrage (a): Cross-Modul-Settings-Auswirkung erkennen — Interpretationsfrage gefunden

Beim Versuch, dies zu recherchieren, wurde eine **Zweideutigkeit im
Vision-Text selbst** sichtbar, die das Ergebnis stark verändert:

> "erkennen, wenn die Änderung der Einstellungen von einem Modul Auswirkungen
> auf ein anderes haben... und eventuelle Dependencies der Module
> untereinander deaktivieren und aktivieren können"

**Lesart 1 — generische Verhaltens-Auswirkungs-Erkennung:** Eagle Eye soll
automatisch erkennen, dass das Ändern **irgendeiner** Setting eines Moduls
das **Verhalten** eines anderen, an sich unabhängigen Moduls beeinflusst
(z. B. Modul A schaltet ein Feature ab, das Modul B stillschweigend
voraussetzt). Dafür wurde **keine generische Foundry-API gefunden** — Settings
sind isolierte Namespace/Key/Value-Paare ohne deklarierte
Beziehungen zueinander. Das wäre praktisch nur über eine von Eagle Eye selbst
**kuratierte Wissensbasis** möglich (bekannte, hart einprogrammierte
Kombinationen) — kein automatisches "Erkennen" im eigentlichen Sinn.

**Lesart 2 — bereits deklarierte Modul-Abhängigkeiten nutzen:** Module können
in ihrem Manifest bereits Beziehungen zu anderen Modulen deklarieren
(`relationships.requires`/`recommends`, aus Research Phase 1 M3 bekannt —
das ist exakt die Quelle für `PACKAGE_AVAILABILITY_CODES.MISSING_DEPENDENCY`).
Unter dieser Lesart würde Eagle Eye **nicht raten**, sondern **bereits vom
Modul-Autor erklärte** Abhängigkeiten auswerten: "Modul A erfordert Modul B —
wenn du B deaktivierst/dessen relevante Einstellung änderst, wird A
beeinträchtigt." Das ist weitgehend **bereits durch Phase-1-M3-Infrastruktur
abgedeckt** (der Manifest-Scanner liest `availability`, das inhärent auf
`relationships` beruht) — nur die Verknüpfung zur Settings-Ebene (nicht nur
Modul-aktiv/inaktiv) wäre neu.

Diese beiden Lesarten haben **fundamental unterschiedliche Machbarkeit**
(Lesart 1: kaum robust machbar; Lesart 2: großteils schon vorhanden/machbar)
— das ist keine offene Forschungsfrage, sondern eine Frage der **Absicht**,
die laut Arbeitsweise (`06-working-mode.md`) geklärt werden muss, statt
angenommen zu werden.

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Teilfrage (a) hat zwei fundamental unterschiedliche, plausible Lesarten mit sehr unterschiedlicher Machbarkeit — Interpretationsfrage, keine Annahme möglich | medium | **ja** |
| R2 | Teilfrage (b): kein Beleg für offizielle programmatische Modul-(De)Aktivierungs-API — nur UI-basiert, mit Neustart-Pflicht | medium | nein (Fakt bereits geklärt, keine Rückfrage nötig) |

## Open Questions

| # | Frage | Priorität | Owner | Antwort |
|---|---|---|---|---|
| Q1 | Ist mit A3b Lesart 1, Lesart 2, oder beides gemeint? | blocking | Projektleiter | **Beides, als zwei getrennte Stufen** — Lesart 2 (deklarierte Abhängigkeiten) als machbare Basis-Stufe, Lesart 1 (generische Verhaltens-Erkennung) als separat zu bewertende, ambitioniertere Erweiterungsstufe |

## Next Step
Alle Fragen aufgelöst. Apply bewertet beide Stufen getrennt (Basis: deklarierte
Abhängigkeiten; Erweiterung: generische Verhaltens-Auswirkung) sowie
Teilfrage (b) (Modul-Aktivierung, bereits vollständig geklärt).

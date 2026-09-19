```
artifact: apply-output
milestone: M7
phase: APPLY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m7-01-discover-output.md` (geschlossen — Fund: kein einheitliches
  Actor/Item-Schema über Systeme, reales Präzedenzbeispiel bestätigt
  Pro-System-Handarbeit als einzigen gangbaren Weg)

## Machbarkeitsbericht: Bewertung gegen die vier Abbruchkriterien

| Kriterium | Zutreffend? | Begründung |
|---|---|---|
| Mehrsystem-Unterstützung nicht sauber realisierbar / unverhältnismäßig komplex | **Ja** | Kein generisches Schema über Systeme hinweg (Foundry-Architekturfakt). Selbst das strukturell einfachere Problem (reiner Daten-**Export**, kein funktionsfähiger Actor im Zielsystem) wird von etablierten Community-Modulen ausschließlich über handgeschriebene Pro-System-Provider gelöst, nie generisch. Eine echte, funktionale Übersetzung (mit korrekten Regelverknüpfungen im Zielsystem) wäre strikt aufwändiger als dieser bereits Pro-System-basierte Präzedenzfall. |
| Laufstabilität gefährdet | Indirekt ja | Ohne belastbares generisches Mapping würde jeder Versuch früher oder später falsch typisierte/semantisch falsche Felder ins Zielsystem schreiben — Folgefehler beim Rendern von Sheets oder bei Regelberechnungen sind die logische Konsequenz von Kriterium 1, nicht separat getestet. |
| Sicherheit gefährdet | Nein direkt beobachtet | Keine eigenständige Sicherheitslücke gefunden; das Kriterium greift hier nicht eigenständig. |
| Neue eigene Module müssten dadurch selbst unverhältnismäßig komplex werden | **Ja** | Damit künftige eigene DnD5e-Module verlässlich mit einer "Übersetzer"-Schicht zusammenarbeiten könnten, müssten sie gegen eine wachsende Zahl Pro-System-Sonderfälle abgesichert werden — widerspricht dem Project-Brief-Prinzip "saubere DnD5e-Umsetzung hat Vorrang". |

**Ergebnis: Mindestens zwei von vier Kriterien treffen zu (bereits eines hätte
laut Abbruchregel gereicht).** Multi-System-Anbindung wird gemäß der vorab
vom Projektleiter festgelegten Regel gestrichen.

## Empfehlung
- **Multi-System-Übersetzer-Funktion: gestrichen**, vermerkt als Nice-to-have
  für mögliche zukünftige, dediziert darauf ausgerichtete Projekte — nicht
  Teil von EagleEye
- **DnD5e-Pfad bleibt vollständig bestehen** und ist von dieser Entscheidung
  nicht betroffen (Non-Goal "kein systemspezifisches Modul" bezog sich auf
  EagleEye selbst, nicht auf den Verzicht der Multi-System-Übersetzung — beides
  bleibt konsistent: EagleEye bündelt weiterhin system-agnostisch Manifest-
  Kompatibilität, Settings, Konflikte, Sprache; nur die aktive
  Daten-**Übersetzung** zwischen Systemen entfällt)
- **Für ein etwaiges zukünftiges Multi-System-Projekt festgehalten:** Die
  realistische Architektur ist ein **Provider-/Plugin-Pattern** (ein
  handgeschriebener Adapter pro unterstütztem System), wie es "Actor Export"
  vormacht — keine generische Übersetzungs-Engine

## Acceptance Criteria
```
AC-M7-01: Bewertung gegen alle vier Abbruchkriterien dokumentiert (siehe Tabelle
          oben) — erfüllt Acceptance-Option (b) aus dem Milestone Plan.
AC-M7-02: Streichungsentscheidung mit Verweis auf zutreffende Kriterien
          dokumentiert, DnD5e-Pfad ausdrücklich als unberührt bestätigt.
```
Kein Prototyp-Acceptance nötig — die Abbruchregel greift bereits in Apply,
Deploy hat für die Übersetzer-Funktion selbst nichts zu implementieren.

## Risks and Assumptions
Keine neuen Risiken — Entscheidung ist abschließend für diesen Scope.

## Open TBDs
| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Interpretation 2 aus Discover (Cross-Language-Übersetzung, unabhängig von Multi-System) bleibt unbeantwortet — eigenständige, neue Fragestellung, kein Teil dieses Milestones | nice-to-have | Projektleiter, falls gewünscht in einem künftigen Milestone |

## Next Step
Deploy dokumentiert die Entscheidung final (keine Code-Änderung nötig), danach
Monitor. Damit ist M7 das letzte Milestone im aktuellen Milestone Plan
(Version 1) — nach Abschluss steht eine Reflexion an, wie es weitergeht.

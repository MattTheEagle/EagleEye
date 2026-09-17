```
artifact: discover-output
milestone: M7
phase: DISCOVER
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/04-milestone-plan.md` (M7-Definition inkl. Abbruchregel)
- `dadm/m6-04-monitor-output.md` (F1: Sprachpakete oft verteilt statt im
  System-Manifest selbst — Kontext für diese Recherche)
- Websuche zu bestehenden Cross-System-Konvertierungs-Modulen für Foundry VTT

## Begriffsklärung (wichtig, bevor recherchiert wird)
Der Project Brief spricht von einer "Übersetzer"-Rolle "zwischen Modulen,
Systemen und Foundry". Das kann zwei verschiedene Dinge meinen:
1. **Cross-System-Datenübersetzung** (z. B. einen dnd5e-Actor in ein anderes
   System übertragen) — das ist es, worauf sich die Abbruchregel im Milestone
   Plan explizit bezieht ("Multi-System-Anbindung")
2. **Cross-Language-Übersetzung** (fehlende Sprachdateien eines Moduls
   automatisch/extern übersetzen) — davon unabhängig, beträfe auch eine
   DnD5e-only-Welt, fällt **nicht** unter die Abbruchregel

Diese Recherche fokussiert auf (1), da die Abbruchregel und die
Milestone-Dependencies (M3/M5/M6 = Kompatibilität/Konflikte/Sprach-*erkennung*,
nicht -übersetzung) klar darauf ausgerichtet sind. (2) wird am Ende kurz als
separate, unbeantwortete Frage vermerkt.

## Rechercheergebnis: Wie machbar ist Cross-System-Datenübersetzung?

### Zentraler Fakt
Foundry erzwingt **kein** einheitliches Datenschema für Actors/Items über
Systeme hinweg. Jedes System (dnd5e, pf2e, sf2e, …) definiert seine eigene
`DataModel`-Struktur mit völlig unterschiedlichen Feldern und – wichtiger –
unterschiedlicher **Semantik** (z. B. hat nicht jedes System "Ability Scores").
Es gibt keine Foundry-Core-API, die Felder zwischen Systemen generisch
abbildet.

### Reales Präzedenzbeispiel (Websuche + Modul-Seite geprüft)
Das Modul **"Actor Export"** (aktiv gepflegt, explizit als "system agnostic"
beworben) exportiert Actors in verschiedene Formate. Geprüft, wie es das
löst: **über handgeschriebene Provider pro System** — eigene Provider für
dnd5e, pf1, pf2e, sf2e. Zitat von der Modulseite: Nutzer können "nur die
Provider auswählen, die zu ihrem System passen" — es gibt keine generische
Konvertierungslogik, jedes System braucht eigenen Code.

**Wichtig:** Das ist nur **Export** (Daten raus, in ein externes Format) —
strukturell einfacher als eine echte In-Foundry-Übersetzung, die am Ende einen
funktionsfähigen Actor im Zielsystem erzeugen müsste (inkl. Active Effects,
Rechenformeln, Regelwerk-Verknüpfungen). Selbst diese einfachere Aufgabe
braucht bereits Pro-System-Handarbeit.

### Ableitung für eine echte "Übersetzer"-Funktion
Eine funktionale (nicht nur Daten-exportierende) Cross-System-Übersetzung
bräuchte for jedes Systempaar (oder jedes System gegen ein selbst gewähltes
Zwischenformat) manuell geschriebenen, system-spezifischen Mapping-Code —
keine generische Automatisierung. Aufwand skaliert mit Anzahl der
unterstützten Systeme, nicht mit einer einmaligen Implementierung.

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | Fehlendes einheitliches Actor/Item-Schema über Systeme hinweg | Kernhindernis für generische Übersetzung | Foundry-Architektur (allgemein bekannt, durch Recherche bestätigt) | bestätigt |
| I2 | "Actor Export"-Modul als Präzedenzfall | Nutzt Pro-System-Provider statt generischer Logik, selbst für den einfacheren Export-Fall | foundryvtt.com/packages/actor-export | bestätigt |
| I3 | Cross-Language-Übersetzung (Interpretation 2) | Separate, ungeklärte Frage, nicht Teil der Abbruchregel | — | offen, nicht Teil dieser Recherche |
| I4 | Kimbap-CLI in dieser Umgebung | Für eine mögliche externe Übersetzungs-API (Interpretation 2) geprüft — `kimbap`-Kommando ist auf diesem Rechner nicht installiert | eigene Umgebungsprüfung | fehlt (Umgebungslücke, kein EagleEye-Scope-Problem) |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Cross-System-Datenübersetzung erfüllt das Abbruchkriterium "nicht sauber realisierbar oder unverhältnismäßig komplex" — bestätigt durch reales Präzedenzbeispiel, nicht nur Vermutung | medium | nein — das ist das erwartete, jetzt belegte Forschungsergebnis |

## Open Questions
Keine blockierenden Fragen für die Kern-Recherche. Offen (nicht blockierend):
Soll Interpretation 2 (Cross-Language-Übersetzung) als eigene, zukünftige
Idee vorgemerkt werden? Das wäre ein neues Thema, kein Teil der aktuellen
Abbruchregel.

## Next Step
Apply bewertet den Fund explizit gegen die vier Abbruchkriterien aus dem
Milestone Plan und formuliert die Empfehlung (voraussichtlich: Streichung der
Multi-System-Anbindung, DnD5e-Fokus bestätigt) plus konkrete Hinweise für
etwaige zukünftige Projekte (Provider-Pattern als realistische Architektur,
falls Multi-System je verfolgt wird).

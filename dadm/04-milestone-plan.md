# Milestone Plan — EagleEye

plan-version: 1
retention: durable (bei signifikanter Änderung: neue Version + neue Approval, alte
Approval bleibt erhalten)

## M1 — Repo & Build-Grundgerüst
- Ziel: Lauffähiges Grundgerüst für Monorepo mit gemeinsamem `core` und dünnen
  v13-/v14-Entry-Points
- Scope: `./core/`, `./v13/`, `./v14/`, Toolchain (Node 24, TS, esbuild), `git init`
- Deliverables: Build-Konfiguration, leeres, ladbares Modul für v13 und v14
- Acceptance Criteria: Modul lädt fehlerfrei in Forge-Instanz unter v13 UND v14
- Proof: Log/Screenshot der Foundry-Konsole (kein Fehler) je Version
- Risiken: v13/v14-API-Unterschiede erschweren gemeinsamen `core` (medium)
- Dependencies: keine
- Priorität: hoch

## M2 — Forge-Deployment-Entscheidung
- Ziel: Bisherige Forge-Deploy-Methode des Projektleiters mit Alternativen
  vergleichen, Entscheidung treffen
- Scope: Discover-Frage, keine Änderung an core-Logik
- Deliverables: dokumentierter Vergleich + Entscheidung, angewandt auf
  M1-Grundgerüst
- Acceptance Criteria: Entscheidung dokumentiert und einmal erfolgreich
  durchgeführt
- Proof: kurzer Entscheidungsvermerk, kein wiederholter Nachweis nötig
- Risiken: info
- Dependencies: M1
- Priorität: hoch

## M3 — Manifest-Erkennung & Versionskompatibilität (eigene Module)
- Ziel: `game.modules`/`game.system` auslesen, Kompatibilität via
  `foundry.utils.isNewerVersion` prüfen
- Scope: `core/` Manifest-Scanner
- Deliverables: Scan-Funktion + einfache Anzeige
- Acceptance Criteria: mind. 1 Dummy-Modul korrekt mit Versionsstatus erkannt
- Proof: Testlauf-Log gegen Forge-Instanz (Quench-Nutzung separat freigeben lassen)
- Risiken: low
- Dependencies: M1
- Priorität: hoch

## M4 — Zentrale Settings-Bündelung (eigene Module)
- Ziel: Einstellungen mehrerer eigener (Dummy-)Module an einer Stelle bündeln
- Scope: `core/` Settings-Hub + 2 Test-Dummy-Module
- Deliverables: Settings-Hub-UI, funktionierende Beispielintegration
- Acceptance Criteria: Änderung im Hub wirkt sich nachweisbar auf Dummy-Modul aus
- Proof: Vorher/Nachher-Screenshot oder Log
- Risiken: API-Design zwischen Modulen unausgereift (medium)
- Dependencies: M1
- Priorität: hoch

## M5 — Kompatibilitätsforschung Fremdmodule
- Ziel: Klären, was über Manifest-Daten hinaus erkennbar ist (z. B.
  Hook-Kollisionen)
- Scope: Forschung + ggf. kleiner Prototyp
- Deliverables: Forschungsbericht mit klarer Aussage zu Grenzen
- Acceptance Criteria: dokumentierte Erkenntnis, was erkennbar ist / was nicht
- Risiken: evtl. nicht robust lösbar, abhängig von Drittverhalten (high)
- Dependencies: M3
- Priorität: mittel

## M6 — Sprach-/Lokalisierungserkennung
- Ziel: Sprache installierter Systeme/Module erkennen (`game.i18n`/Sprachdateien)
- Scope: `core/`
- Deliverables: Erkennungsfunktion
- Acceptance Criteria: korrekte Erkennung bei mind. 1 mehrsprachigen Test-System
- Risiken: low
- Dependencies: M1
- Priorität: mittel

## M7 — Übersetzer-Machbarkeitsstudie
- Ziel: Klären, wie weit eine Übersetzer-Funktion zwischen Systemen/Modulen/Foundry
  machbar ist
- Abbruchregel (vom Projektleiter festgelegt): Multi-System-Anbindung wird
  gestrichen (→ "Nice-to-have für zukünftige Projekte" vermerkt, nicht
  weiterverfolgt), sobald mindestens eines zutrifft:
  - Mehrsystem-Unterstützung ist nicht sauber realisierbar oder wird
    unverhältnismäßig komplex/umfangreich
  - Laufstabilität des Moduls wird dadurch gefährdet
  - Sicherheit des Moduls wird dadurch gefährdet
  - Neue (eigene) Module müssten dadurch selbst unverhältnismäßig komplex werden

  Eine saubere DnD5e-Umsetzung hat in jedem Fall Vorrang vor Multi-System-Anbindung.
- Scope: Forschung, Prototyp nur falls machbar
- Deliverables: Machbarkeitsbericht mit Bewertung gegen obige Kriterien und
  Empfehlung (weiterverfolgen/verwerfen/Scope anpassen)
- Acceptance Criteria: entweder (a) Übersetzer-Funktion läuft sauber für mehrere
  Systeme ohne Verstoß gegen die vier Kriterien, oder (b) dokumentierte Streichung
  der Multi-System-Anbindung unter Verweis auf das zutreffende Kriterium —
  DnD5e-Pfad bleibt in beiden Fällen bestehen
- Risiken: medium (herabgestuft von high, da Abbruchkriterium bereits vom
  Projektleiter festgelegt ist — kein offener strategischer Tradeoff mehr).
  Ausnahme: taucht während M7 ein `high`/`critical`-Sicherheitsbefund auf, greift
  weiterhin unabhängig davon der reguläre Governance-Trigger
  Security→`human_decision`
- Dependencies: M3, M5, M6
- Priorität: mittel

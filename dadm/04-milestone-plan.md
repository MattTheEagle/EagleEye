# Milestone Plan — EagleEye: Eagle Modules Machbarkeitsplanung

plan-version: 2
retention: durable (bei signifikanter Änderung: neue Version + neue Approval)

Änderung gegenüber Version 1 (siehe `05-milestone-plan-approval-v2.md`): M3
(Eagle Eye Kernfragen) neu eingefügt, Folge-Milestones verschoben. Auslöser:
M1-Discover fand zwei explizite Eagle-Eye-Anforderungen (A3b/A3c), die von
keinem Milestone in Version 1 abgedeckt waren.

Hinweis zu Proofs/Artefakten dieser Phase: Da reine Recherche/Analyse
betrieben wird (kein Code, kein Live-Test), besteht der Proof je Milestone
aus dem schriftlichen Discover-Output (Fakten + Quellen) und Apply-Output
(Bewertung + Empfehlung). Deploy = Übernahme des Ergebnisses in den
laufenden Gesamt-Projektplan (`dadm/eagle-modules-projektplan.md`). Monitor =
kurze Konsistenzprüfung. Kein Build/Test/Forge-Proof in dieser Phase.

Durchgängige Analyse-Linse "API-Umwandlung": Eagle Eyes Anforderung, komplexe
Foundry-/dnd5e-API-Vorgänge aus einfacher, semantischer Nutzereingabe zu
erzeugen (Beispiel: magisches Langschwert aus "Longsword"+"Magic"+"2d6
Fire"+"Hit, Undead"), ist kein Einzelfall nur für Eagle Beak. Jedes Modul, das
eine vereinfachte Eingabe in eine korrekte Foundry-/dnd5e-Datenstruktur
übersetzen muss, teilt dieselbe Grundfrage. Deshalb wird diese Grundsatzfrage
zuerst (M2) anhand des Langschwert-Beispiels geklärt, und jedes betroffene
Folge-Milestone prüft explizit, ob/wie der Befund aus M2 in seinem Bereich
zutrifft, statt das Thema separat neu zu erforschen.

## M1 — Eagle Eye: Bestandsaufnahme gegen Vision-Anforderungen
- Ziel: Abgleichen, was aus Research Phase 1 (M3–M6, archiviert) bereits
  belegt ist gegen die in der Vision explizit geforderten Eagle-Eye-
  Fähigkeiten (Kompatibilität+Warum, Settings-Hub mit Dependency-Aktivierung/
  -Deaktivierung, "Datenbank mit Zugriff auf Funktionen"), und identifizieren,
  was neu/ungeklärt ist
- Scope: reine Analyse, `dadm/reference/` + Phase-1-Archiv
- Deliverables: Abgleichtabelle (Anforderung -> belegt/teilweise/offen),
  Liste offener Fragen für spätere Milestones
- Acceptance: jede der in der Vision genannten Eagle-Eye-Anforderungen ist
  einer der drei Kategorien zugeordnet, mit Begründung/Quelle
- Risiken: keine (reine Synthese bereits vorhandenen Wissens) — info
- Dependencies: keine (Grundlage für alle folgenden Milestones)
- Priorität: hoch

## M2 — API-Umwandlung: Grundsatzfrage (Eagle Eye Kernfähigkeit / Eagle Beak strukturierte Erstellung)
- Ziel: Kernfrage klären: Lässt sich aus strukturierter, semantischer
  Eingabe zuverlässig ein korrektes dnd5e-Item mit passenden Active
  Effects/Activities erzeugen? Referenzfall: magisches Langschwert, +2W6
  Feuerschaden bei Treffer gegen Untote (siehe Vision-Referenz)
- Scope: dnd5e Activity-/ActiveEffect-Datenmodell (v3+), Item-Schema
- Deliverables: Machbarkeitsbewertung anhand des Referenzfalls, Einschätzung
  der Generalisierbarkeit (wie viele Homebrew-/Anwendungsfälle deckt dieser
  Ansatz realistisch ab?) — als direkt wiederverwendbare Grundlage für M4,
  M5, M7, M8
- Acceptance: dokumentierte Aussage mit Quellenbelegen aus dem dnd5e-Quellcode
  (Activities-System)
- Risiken: mittel (Activities sind laut erster Einschätzung ein sanktionierter
  Erweiterungspunkt, aber Abdeckung komplexer/exotischer Fälle unklar)
- Dependencies: M1
- Priorität: hoch (zentrale, wiederverwendbare Erkenntnis für mehrere Module)

## M3 — Eagle Eye: Cross-Modul-Settings-Impact & Modul-(De)Aktivierung
- Ziel: Die beiden in M1 gefundenen, unabgedeckten Eagle-Eye-Kernfragen
  klären: (a) lässt sich erkennen, dass die Einstellungsänderung eines
  Moduls ein anderes Modul beeinflusst, und den DM darüber informieren? (b)
  können Module durch Eagle Eye programmatisch aktiviert/deaktiviert werden
  (auch wenn dafür ein Welt-Neustart nötig ist)?
- Scope: Foundry Modul-Konfigurations-API (World-Settings-Ebene,
  `game.settings`-Namespace `core`), Recherche nach einer generischen
  Cross-Modul-Auswirkungs-API (falls vorhanden)
- Deliverables: getrennte Machbarkeitsbewertung für (a) und (b), mit
  Quellenbelegen; falls (a) nicht generisch möglich ist, Einschätzung
  alternativer Ansätze (z. B. ein von Eagle Eye selbst gepflegtes
  Konflikt-Wissen statt automatischer Erkennung — mit klarer Unterscheidung
  zwischen "erkennen" und "kuratiertes Wissen anwenden")
- Acceptance: dokumentierte Aussage zu (a) und (b), mit Quellenbelegen
- Risiken: hoch für (a) (kein bekannter genereller Foundry-Mechanismus dafür
  — reine Vermutung ohne Beleg); mittel für (b) (Modul-Aktivierung ist ein
  bekannter Mechanismus, Live-Toggle ohne Neustart aber unklar)
- Dependencies: M1, M2
- Priorität: hoch (Eagle-Eye-Kernanforderung, in Version 1 des Plans
  übersehen)

## M4 — Eagle Eyrie: Compendium-Dedup & Suche
- Ziel: Klären, ob/wie sich Foundrys Compendium-API für automatische
  Compendium-Erstellung, namensbasierte Dedup-Prüfung (mit Ausnahme für
  Klassen/Spezies/Subklassen/Backgrounds, siehe Klärung) und übergreifende
  Suche eignet
- Scope: Foundry-Compendium-/`CompendiumCollection`-API (gepinnte Types),
  ggf. bestehende Such-Module als Präzedenz
- API-Umwandlung-Relevanz: Quellen (System-Compendia, D&D-Beyond-Importer,
  Forge-Compendia) können unterschiedliche Datenformen für äquivalente
  Inhalte liefern — prüfen, ob/wie eine Normalisierung auf ein einheitliches
  Eagle-Library-Format nötig ist und ob der M2-Befund dafür übertragbar ist
- Deliverables: Machbarkeitsbewertung + technische Grundskizze (kein Code),
  inkl. Normalisierungs-Einschätzung
- Acceptance: dokumentierte Aussage, was mit Core-API machbar ist und was
  nicht, mit Quellenbelegen
- Risiken: mittel (Performance bei sehr großen Compendium-Mengen unklar)
- Dependencies: M1, M2
- Priorität: mittel

## M5 — Eagle Egg: Geführter Charakter-Builder
- Ziel: Klären, ob ein externes Modul zuverlässig ein dnd5e-Actor-Sheet live
  mitgestalten kann (dynamische Optionen je nach vorheriger Wahl), inkl.
  Class/Species/Background/Spell-Gating nach Level
- Scope: dnd5e-Datenmodell (Actor/Item-Schemas, Advancement-System),
  Foundry-Sheet-/`ApplicationV2`-Integrationsmöglichkeiten
- API-Umwandlung-Relevanz: Jede Tab-Auswahl (z. B. Class+Level) muss in
  korrekte Actor-Struktur, Advancements und abgeleitete Werte übersetzt
  werden — direkteste Anwendung des M2-Prinzips auf einen ganzen Charakter
  statt ein einzelnes Item
- Deliverables: Machbarkeitsbewertung je Tab (Attributes/Class/Species/
  Background/Spells/Equipment), Risikoeinschätzung für Live-Sheet-Manipulation
  durch ein Drittmodul
- Acceptance: dokumentierte Aussage je Tab, mit Quellenbelegen
  (`github.com/foundryvtt/dnd5e`, gepinnte Types)
- Risiken: mittel-hoch (dnd5e hat bereits ein eigenes "Advancement"-System für
  genau diesen Zweck — Kollisionsrisiko mit eigener Logik zu prüfen)
- Dependencies: M1, M2
- Priorität: mittel

## M6 — Eagle Beak: Freitext-Homebrew-Import (Parsing-Machbarkeit)
- Ziel: Klären, wie zuverlässig sich freier Homebrew-Text zu strukturierten
  Foundry-Daten parsen lässt — unabhängig von M2, da qualitativ anderes
  Problem (Texterkennung statt strukturierter Eingabe). Die strukturierte
  "Create Homebrew"-Seite von Eagle Beak ist bereits durch M2 abgedeckt
- Scope: bestehende Precedents (z. B. "Foundry VTT Content Parser"),
  generelle Grenzen von Text-zu-Struktur-Parsing ohne LLM-Anbindung
- Deliverables: Machbarkeitsbewertung, Vergleich mit bestehenden
  Importer-Modulen (warum funktionieren die laut Problem-Statement nur
  unzuverlässig, was würde EagleEye anders/besser machen können)
- Acceptance: dokumentierte Aussage mit Quellenbelegen
- Risiken: hoch (Freitext-Parsing ohne verlässliche Struktur ist ein
  bekanntes hartes Problem — wird explizit erwartet, kein Scheitern)
- Dependencies: M2 (nutzt dessen Ergebnis als Ziel-Datenstruktur, in die
  geparste Freitexte am Ende übersetzt werden müssten)
- Priorität: mittel

## M7 — Eagle Talon: Journal-/Obsidian-artiges Vault-System
- Ziel: Klären, ob sich ein Obsidian-artiges Vault-/Tag-/Verlinkungssystem
  sauber auf Foundrys Journal-Dokumentstruktur abbilden lässt, inkl.
  automatischer Pro-Nutzer-Ordnerstruktur und Backlink-Suche
- Scope: Foundry `JournalEntry`/`Folder`-API, Rechte-Modell (GM vs. Spieler)
- API-Umwandlung-Relevanz: vereinfachte Autoren-/Verlinkungssyntax (z. B.
  "Link to…"-Auswahl, Tag-Zuweisung) muss in Foundrys tatsächliche
  Journal-/Verlinkungsstruktur übersetzt werden — schwächere Ausprägung des
  M2-Prinzips, da eher strukturell als schema-technisch komplex
- Deliverables: Machbarkeitsbewertung je Teilfunktion (Vault-Struktur, Tags,
  Verlinkung, Rechte)
- Acceptance: dokumentierte Aussage mit Quellenbelegen
- Risiken: niedrig-mittel (Journal-/Folder-API ist gut dokumentiert, UI-Aufwand
  vermutlich der größere Faktor als technische Machbarkeit)
- Dependencies: M1, M2
- Priorität: mittel

## M8 — Eagle Prey: Automatische Regel-Extraktion aus dnd5e-Code
- Ziel: Klären, ob sich Spielregeln (Combat/Attack/Damage Rules etc.)
  automatisch und robust aus dem laufenden dnd5e-Systemcode extrahieren
  lassen (Klärung: explizit **nicht** handgepflegter Katalog gewünscht)
- Scope: dnd5e-Quellcode-Struktur (Formeln, Roll-Konfiguration vs. fest
  einprogrammierte Logik)
- API-Umwandlung-Relevanz: hier potenziell die zentralste Anwendung — der DM
  soll eine Regel in vereinfachter Klartext-Form ändern ("Change Rule to
  Homebrew"), und Eagle Eye muss daraus den korrekten Code-Override erzeugen.
  Das ist die **Rückrichtung** von M2 (dort: Eingabe -> neue Struktur; hier:
  vereinfachte Eingabe -> Override einer bestehenden Struktur) und dürfte
  eigenständig, nicht direkt aus M2 übertragbar sein
- Deliverables: Machbarkeitsbewertung, klare Grenzziehung, welche Regel-Arten
  (falls überhaupt) automatisch extrahierbar/überschreibbar wären vs. welche
  zwingend Handarbeit/Katalog bräuchten
- Acceptance: dokumentierte Aussage mit Quellenbelegen aus dem dnd5e-Quellcode
- Risiken: hoch (automatische Regel-Extraktion aus imperativem Code ist
  Programm-Analyse-Territorium — Erwartung: stark eingeschränkt oder nicht
  robust machbar, das ist ein zulässiges Ergebnis)
- Dependencies: M1, M2
- Priorität: mittel

## M9 — Eagle Wings: Kurz-Scoping (bewusst zurückgestellt)
- Ziel: Nur eine kurze Notiz, warum dieses Modul zurückgestellt ist und
  welche Voraussetzungen (aus M1–M8) erfüllt sein müssten, bevor es sinnvoll
  angegangen werden kann — **keine** tiefe Recherche in dieser Phase
- Scope: kurze Zusammenfassung
- API-Umwandlung-Relevanz: nur falls sich aus M1–M8 ein offensichtlicher
  Bezug ergibt, kurz erwähnen — keine eigene Untersuchung
- Deliverables: 1 Abschnitt im Gesamtplan
- Acceptance: Abschnitt vorhanden, verweist auf relevante Vorbedingungen
- Risiken: keine (bewusst nicht vertieft) — info
- Dependencies: M1–M8 (inhaltlich, als Vorbedingung)
- Priorität: niedrig (wie vom Projektleiter selbst vorgegeben)

## M10 — Synthese: Projektplan mit Risiko- und Machbarkeitsanalyse
- Ziel: Alle Ergebnisse aus M1–M9 zu einem zusammenhängenden Projektplan
  verdichten — das eigentliche, im Project Brief definierte Enddeliverable.
  Enthält eine eigene Übersicht, wo/wie "API-Umwandlung" über die Module
  hinweg zutrifft oder nicht
- Scope: `dadm/eagle-modules-projektplan.md` (neues Dokument)
- Deliverables: Projektplan mit: Modul-Übersicht, Abhängigkeitsgraph,
  Risiko-/Machbarkeitsmatrix je Modul, API-Umwandlung-Übersichtstabelle,
  priorisierte Empfehlung für die Reihenfolge einer möglichen künftigen
  Umsetzungsphase
- Acceptance: Projektleiter bestätigt, dass der Plan vollständig ist und die
  in M1–M9 erarbeiteten Ergebnisse korrekt wiedergibt
- Risiken: keine neuen (reine Zusammenführung) — info
- Dependencies: M1–M9
- Priorität: hoch

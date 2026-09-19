# Eagle Modules — Projektplan (im Aufbau)

status: final — vom Projektleiter am 2026-09-19 bestätigt (vollständig und
korrekt, siehe Milestone-Acceptance in `04-milestone-plan.md`)
retention: durable

Quelle der Ideen: `dadm/reference/eagle-modules-vision.md`.

---

## M1 — Eagle Eye: Bestandsaufnahme gegen Vision-Anforderungen

**Ergebnis:** Vier von fünf explizit genannten Eagle-Eye-Anforderungen sind
durch Research Phase 1 bereits (teilweise) belegt. Zwei Kernanforderungen
waren im ursprünglichen Plan (Version 1) nicht abgedeckt und wurden über eine
Plan-Erweiterung (neues M3, siehe unten) nachträglich aufgenommen.

| Anforderung | Status | Kurzbegründung |
|---|---|---|
| Schnittstelle Foundry/DnD/eigene/fremde Module | teilweise belegt | Lesend/beobachtend gut belegt (Phase 1 M3–M6); EagleEye als aktiv nutzbare API für Drittmodule nie untersucht |
| Kompatibilität erkennen + warum | belegt | `availability`/`getVersionBadge()` (Manifest-Ebene) + `libWrapper.ConflictDetected`/`OverrideLost` (Laufzeit-Ebene, nur libWrapper-Fälle) |
| Settings-Hub: gebündelte Änderung | belegt | Bidirektional gegen 94 reale Pakete verifiziert (Phase 1 M4) |
| Settings-Hub: Cross-Modul-Auswirkung erkennen + DM informieren | **offen** | Kein bekannter genereller Mechanismus — eigenes Milestone (M3) |
| Settings-Hub: Modul-Dependencies (de)aktivieren | **offen** | Nicht untersucht — eigenes Milestone (M3) |
| Datenbank mit Zugriff auf Funktionen | teilweise belegt | Datenlesezugriff belegt; Funktionsaufruf fremder Module nicht |
| "API umwandeln" | verschoben | Eigene Grundsatzfrage, siehe M2 |

Vollständige Belege: `dadm/m1-01-discover-output.md`, `dadm/m1-02-apply-output.md`.

---

## M2 — API-Umwandlung: Grundsatzfrage (Eagle Eye / Eagle Beak)

**Ergebnis:** Machbar für den Referenzfall (magisches Langschwert, +2W6 Feuer
vs. Untote), aber als **Komposition zweier Mechanismen**, nicht eine einzelne
API: (1) dnd5e's natives Activity-/DamageData-Schema deckt Schadensmenge,
-typ und "magisch"-Kennzeichnung vollständig deklarativ ab — kein Code nötig.
(2) Zielkreaturentyp-Bedingungen ("vs. Untote") fehlen im dnd5e-Kern
nachweislich (offizielles, offenes dnd5e-Issue #4477), sind aber durch das
reale Community-Modul "Build-a-Bonus" bereits bewiesen lösbar (UI-basiert,
kein Code).

**Generalisierbarkeit:** dnd5e bietet 11 Activity-Typen, bewusst breit für
code-freie Item-Mechaniken angelegt — der Ansatz dürfte für die Mehrheit
gängiger Homebrew-Wünsche funktionieren. Grenze: grundlegend neuartige
Mechaniken außerhalb dieser 11 Typen brauchen echten Custom-Code.

**Übertragbarkeit:** hoch für M5 (Egg — Klassenmerkmale nutzen ebenfalls
Activities), gering für M4 (Eyrie) und M7 (Talon), **nicht übertragbar** auf
M8 (Prey) — dort ist die Fragerichtung umgekehrt (Override bestehender Logik
statt Neuerstellung), eigene Recherche nötig.

Vollständige Belege: `dadm/m2-01-discover-output.md`, `dadm/m2-02-apply-output.md`.

---

## M3 — Eagle Eye: Cross-Modul-Settings-Impact & Modul-(De)Aktivierung

**Ergebnis (Teilfrage a, Stufe 1 — deklarierte Abhängigkeiten):** Machbar,
großteils bereits vorhanden. Erweiterung des bestehenden
Manifest-Scanners (Phase 1 M3) um eine Warnfunktion beim Versuch, ein
Modul zu deaktivieren, von dem andere aktive Module deklariert abhängen.

**Ergebnis (Teilfrage a, Stufe 2 — generische Verhaltens-Erkennung):** Nicht
robust machbar. Kein Foundry-Mechanismus verknüpft Settings-Änderungen mit
Verhaltensänderungen undeklariert verbundener Module. Nur über eine
kuratierte, manuell gepflegte Wissensbasis denkbar — das ist kein
automatisches Erkennen.

**Ergebnis (Teilfrage b — Modul-Aktivierung):** Nur über die Standard-UI
(`ModuleManagement`, selbst in Foundrys Typdefinitionen nur als Stub
vorhanden), erfordert zwingend einen Welt-Neustart. Keine öffentliche API für
programmatisches Umschalten durch ein Drittmodul gefunden. Eagle Eye könnte
höchstens eine komfortablere Oberfläche darüber bauen, keine echte
Laufzeit-Aktivierung.

Vollständige Belege: `dadm/m3-01-discover-output.md`, `dadm/m3-02-apply-output.md`.

---

## M4 — Eagle Eyrie: Compendium-Dedup & Suche

**Ergebnis: Machbar, reine Kompositionsaufgabe aus offiziellen Foundry-APIs.**
Compendium-Erstellung (`CompendiumCollection.createCompendium`), performante
Index-basierte Suche/Dedup (`.index`, kein volles Dokumentladen nötig),
bestehende Such-Infrastruktur (`DirectoryCollectionMixin.searchMode`) und
Dokument-Kopie (`importDocument`) sind alle vorhanden und dokumentiert. Kein
Feature erfordert unbelegte Annahmen.

**API-Umwandlung-Relevanz — geringer als im Plan vermutet:** Inhalte sind
bereits beim Erstellen auf das jeweilige System-Schema normalisiert
(unabhängig von der Quelle: System, DDB-Importer, Forge). Eyries eigentliches
Problem ist Duplikat-Erkennung, nicht Formatübersetzung — der M2-Befund ist
hier nicht direkt anwendbar.

Vollständige Belege: `dadm/m4-01-discover-output.md`, `dadm/m4-02-apply-output.md`.

---

## M5 — Eagle Egg: Geführter Charakter-Builder

**Ergebnis: Machbar, Risiko niedriger als im Plan angenommen — bei
Strategiewechsel von "eigene Logik" zu "dnd5e's Advancement-System als Engine
wiederverwenden".** dnd5e exponiert sein komplettes Advancement-System
öffentlich (`game.dnd5e.applications.advancement.AdvancementManager`) mit
fertigen Factory-Methoden (`forNewItem`, `forLevelChange`, u. a.) und acht
nativen Advancement-Typen, die alle sechs Vision-Tabs (Attributes, Class,
Species, Background, Spells, Equipment) 1:1 abdecken. Eagle Eggs Aufgabe wäre
primär UI/UX-Orchestrierung über diese bestehende Engine, nicht Neubau von
Charaktererstellungs-Logik. **Risiko-Herabstufung empfohlen:** von
"mittel-hoch" (Plan-Annahme) auf "niedrig-mittel" (verbleibendes Risiko:
UI-Integration, nicht Kern-Machbarkeit).

**API-Umwandlung-Relevanz:** bestätigt als direkteste Anwendung des
M2-Prinzips, nutzt hier aber eine bereits vorhandene Übersetzungsschicht
(dnd5e's Advancement-System) statt einer neu zu bauenden.

Vollständige Belege: `dadm/m5-01-discover-output.md`, `dadm/m5-02-apply-output.md`.

---

## M6 — Eagle Beak: Freitext-Homebrew-Import (Parsing-Machbarkeit)

**Ergebnis: Zuverlässig nur für templatierte Eingaben (Stat-Blocks, JSON,
CSV), nicht für echte freie Prosa — bestätigtes, erwartetes Ergebnis.** Das
reale Precedent-Modul "Foundry VTT Content Parser" arbeitet regex-/
template-basiert (kein LLM), explizit als "best effort" beworben. Die
Struktur der Eingabe (nicht die Parser-Qualität) entscheidet über die
Zuverlässigkeit — Stat-Blocks folgen einer festen Konvention, freie Prosa
nicht.

**Empfehlung:** Templatierte Eingabe explizit unterstützen/bewerben, bei
Freitext transparent "Best Effort" kommunizieren. Der in der Vision ohnehin
vorgesehene Korrektur-Editor-Schritt ist der eigentlich tragende Teil dieser
Funktion, nicht das Parsen selbst.

Vollständige Belege: `dadm/m6-01-discover-output.md`, `dadm/m6-02-apply-output.md`.

---

## M7 — Eagle Talon: Journal-/Obsidian-artiges Vault-System

**Ergebnis: Machbar.** Verlinkung/Backlinks sind einfacher als angenommen —
Foundrys natives `@UUID[...]`-Content-Link-System (`TextEditor.enrichHTML`)
deckt das bereits vollständig ab, keine Eigenentwicklung nötig. Tags sind
über das Standard-`flags`-Muster jedes Dokuments lösbar. Einzige Nuance:
`Folder`-Dokumente tragen selbst keine Berechtigung (anders als
Actor/Item/JournalEntry) — der "private Vault pro Nutzer" muss über
konsistente Ownership auf jedem einzelnen Journal-Eintrag umgesetzt werden,
nicht über eine Ordner-Einstellung. Kein Machbarkeits-Blocker, aber ein
Implementierungs-Detail für eine spätere Umsetzung.

**API-Umwandlung-Relevanz:** bestätigt als sehr schwache Ausprägung — reine
1:1-Übersetzung (Auswahl -> `@UUID`-String bzw. Flag), kein
Übersetzungsproblem im eigentlichen Sinn.

Vollständige Belege: `dadm/m7-01-discover-output.md`, `dadm/m7-02-apply-output.md`.

---

## M8 — Eagle Prey: Automatische Regel-Extraktion aus dnd5e-Code

**Ergebnis: Zweigeteilt, deutlich differenzierter als im Plan angenommen.**
(1) **Schriftliche Regeldarstellung** ist voll automatisch machbar:
`CONFIG.DND5E.rules` ist ein von dnd5e selbst gepflegtes, deklaratives
Mapping von ~60+ Regelbegriffen auf offizielle Regelwerkstext-Referenzen —
kein Extraktionsaufwand nötig, bleibt automatisch mit der installierten
dnd5e-Version synchron. (2) **Mechanik als editierbarer Wert** ist nur dort
machbar, wo dnd5e die Mechanik bereits als Game-Setting exponiert (am
Beispiel kritischer Trefferschaden konkret verifiziert — direkt über den
bestehenden Settings-Hub aus Phase 1 nutzbar). Für die übrigen, überwiegend
in imperativem Code verankerten Mechaniken bestätigt sich die ursprüngliche
Erwartung: nur über tiefe Eingriffe lösbar, wie in der Vision selbst bereits
als Fallback vorgesehen.

**Empfehlung:** Eagle Prey in drei Ebenen aufteilen — Regel-Nachschlagewerk
(sofort machbar), Regel-Settings soweit exponiert (Erweiterung des
bestehenden Hubs), "Change Rule to Homebrew" für den Rest (tiefe Eingriffe,
bewusster Fallback). Vollständige Bestandsaufnahme der exponierten Settings
wäre erste Aufgabe einer künftigen Umsetzungsphase.

Vollständige Belege: `dadm/m8-01-discover-output.md`, `dadm/m8-02-apply-output.md`.

---

## M9 — Eagle Wings: Kurz-Scoping (bewusst zurückgestellt)

Keine Tiefenrecherche in dieser Phase (Projektleiter-Vorgabe). Empfehlung für
eine spätere Bewertung: zuerst prüfen, ob Midi-QoL, Active Auras, Active
Token Effects und Automated Conditions bereits öffentliche APIs für die
gewünschte Funktionalität bieten (dasselbe Muster, das sich bei M2, M5 und M8
bewährt hat), statt Eigenentwicklung anzunehmen. Berührt außerdem M3
(Modul-Ersatz/-Migration, fehlende programmatische Modul-Aktivierung).

Vollständige Belege: `dadm/m9-01-discover-output.md`, `dadm/m9-02-apply-output.md`.

---

## M10 — Synthese

status: zur Bestätigung durch den Projektleiter (Milestone-Acceptance
verlangt explizite Bestätigung, siehe `04-milestone-plan.md`)

### Modul-Übersicht & Gesamtverdict

| Modul | Kernergebnis | Verdict |
|---|---|---|
| Eagle Eye (Basis) | 4/5 Anforderungen belegt, 2 nachgereicht (M3) | überwiegend belegt |
| Eagle Eye (Settings-Impact/Aktivierung, M3) | Stufe 1 machbar, Stufe 2 nicht, Aktivierung UI-only mit Reload | differenziert machbar |
| Eagle Eyrie | alle Bausteine offizielle Foundry-APIs | **voll machbar** |
| Eagle Egg | machbar via Wiederverwendung von dnd5e's Advancement-System | machbar, Risiko herabgestuft |
| Eagle Beak (strukturiert, = M2) | machbar als Komposition zweier Mechanismen | machbar |
| Eagle Beak (Freitext-Import) | nur für templatierte Eingaben zuverlässig | eingeschränkt machbar |
| Eagle Talon | native `@UUID`-Verlinkung deckt Kernfunktion ab | **voll machbar** |
| Eagle Prey | Text-Teil voll automatisch, Mechanik-Teil teils/teils | differenziert machbar |
| Eagle Wings | bewusst nicht bewertet | zurückgestellt |

### Abhängigkeitsgraph

```
Eagle Eye (Basis + Settings-Impact/Aktivierung, M1+M3)
  │
  ├─→ Eagle Eyrie (M4) ──┬─→ Eagle Egg (M5)
  │                      └─→ Eagle Beak strukturiert (M2)
  │                              └─→ Eagle Beak Freitext-Import (M6)
  │
  ├─→ Eagle Talon (M7)            [unabhängig von Eyrie/Egg/Beak]
  │
  ├─→ Eagle Prey (M8)             [unabhängig von Eyrie/Egg/Beak]
  │
  └─→ Eagle Wings (M9)  ← benötigt alle anderen (Projektleiter-Vorgabe)
```

Eagle Talon und Eagle Prey hängen **nur** von Eagle Eye ab und könnten daher
parallel zu Eyrie/Egg/Beak entwickelt werden, nicht zwingend danach.

### Gesamt-Risiko-/Machbarkeitsmatrix

| Modul | Technisches Risiko | Größter offener Punkt |
|---|---|---|
| Eagle Eye Basis | niedrig | Eagle Eye als aktiv nutzbare API für Drittmodule (F1 aus M1-Monitor) |
| Eagle Eye Settings-Impact/Aktivierung | niedrig (Stufe 1), entfällt (Stufe 2 nicht verfolgt) | keiner (Stufe 2 bewusst nicht verfolgt) |
| Eagle Eyrie | niedrig | Performance bei vollem Dokumentladen (Design-Hinweis, kein Blocker) |
| Eagle Egg | niedrig-mittel | UI-Integration um dnd5e's AdvancementManager |
| Eagle Beak strukturiert | mittel | Abdeckung exotischer/neuartiger Mechaniken über die 11 Activity-Typen hinaus |
| Eagle Beak Freitext | hoch | strukturell erwartete Grenze, kein neuer Fund |
| Eagle Talon | niedrig | Folder-vs-Entry-Berechtigungsmodell (Implementierungsdetail) |
| Eagle Prey | mittel-hoch (nur für Mechanik-Teil ohne Settings-Zugang) | unbekannter Anteil der Mechaniken mit/ohne Settings-Zugang |
| Eagle Wings | nicht bewertet | vollständig offen, absichtlich |

### API-Umwandlung-Übersicht (durchgängige Analyse-Linse)

| Modul | Relevanz | Befund |
|---|---|---|
| Eagle Eye / Eagle Beak strukturiert (M2) | zentral | machbar als Komposition (natives Schema + Bedingungsmechanismus) |
| Eagle Eyrie | gering | nicht anwendbar — Duplikat-, kein Formatproblem |
| Eagle Egg | hoch | direkteste Anwendung, nutzt vorhandene dnd5e-Übersetzungsschicht (Advancement) |
| Eagle Talon | sehr gering | triviale 1:1-Übersetzung |
| Eagle Prey | hoch (aber Rückrichtung) | nicht direkt aus M2 übertragbar, eigenständig untersucht |

### Priorisierte Empfehlung für eine mögliche künftige Umsetzungsphase

1. **Eagle Eyrie zuerst** — voll machbar, keine offenen Risiken, schafft die
   Grundlage (Eagle Library) für Egg und Beak
2. **Eagle Talon und Eagle Prey (Text-/Settings-Teil) parallel dazu** — beide
   unabhängig von Eyrie, niedriges Risiko, schnelle sichtbare Ergebnisse
3. **Eagle Egg** — nach Eyrie, Risiko durch Wiederverwendung von dnd5e's
   Advancement-System bereits reduziert
4. **Eagle Beak strukturiert** — nach Eyrie, teilt Erkenntnisse mit Egg (M2)
5. **Eagle Beak Freitext-Import** — erst nach strukturierter Erstellung,
   da der Korrektur-Editor (gemeinsame Infrastruktur) dort ohnehin gebaut wird
6. **Eagle Prey "Change Rule to Homebrew"** (Mechaniken ohne Settings-Zugang)
   — höchster Aufwand/Risiko, zuletzt vor Eagle Wings
7. **Eagle Wings** — wie vom Projektleiter selbst vorgegeben, erst wenn alles
   andere reibungslos läuft

### Übergreifende Erkenntnis dieser Phase
Ein Muster zog sich durch M2, M5 und M8: dnd5e exponiert deutlich mehr
öffentliche, deklarative Erweiterungspunkte (`game.dnd5e`-Namespace,
`CONFIG.DND5E`-Konfigurationsobjekte, registrierte Settings) als eine grobe
Einschätzung ohne Quellcode-Recherche vermuten lässt. Für jede künftige
Machbarkeitsfrage in diesem Ökosystem empfiehlt sich als erster Schritt:
prüfen, ob dnd5e (oder das zu ersetzende Fremdmodul) bereits eine öffentliche
Erweiterungsschicht dafür bietet, bevor Eigenentwicklung angenommen wird.

---

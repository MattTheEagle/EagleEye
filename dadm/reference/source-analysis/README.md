# Quellenanalyse: 10 bestehende Foundry-Module als Grundlage für die Eagle Modules

status: Referenzmaterial, Stand 2026-09-19
retention: durable

**Einordnung:** Dieses Material ist kein Milestone-Artefakt und ändert weder den
genehmigten Milestone Plan noch Scope oder Safety Boundaries. Es ist eine auf
Wunsch des Projektleiters erstellte Sammlung dessen, was sich aus dem
Quellcode und den Dokumentationen zehn bestehender Module für die Umsetzung
der Eagle Modules ableiten lässt. Bereits abgeschlossene Ergebnisse
(`dadm/eagle-modules-projektplan.md`, `EAGLE-MODULES-PLAN.md`) wurden **nicht**
verändert; Ergänzungen und Korrekturen dazu stehen gesammelt in Abschnitt 4.

**Methode:** Flache Klone der Default-Branches (nur gelesen, nichts installiert
oder ausgeführt), Auswertung von `module.json`, README/Wiki, Quellstruktur,
verwendeten Hooks und libWrapper-Zielen. Inhalte sind, wo nicht anders
vermerkt, direkt im Quelltext oder in der Modul-Dokumentation belegt; eigene
Schlussfolgerungen sind als solche gekennzeichnet.

## Dokumente in diesem Ordner

| Datei | Inhalt | Wichtigste Eagle-Module |
|---|---|---|
| `README.md` (diese Datei) | Überblick, Kompatibilität, Kernerkenntnisse, Korrekturen, offene Fragen | alle |
| [`beak-importers.md`](beak-importers.md) | Statblock-, Item- und Spellblock-Importer | Eagle Beak, Eagle Eye |
| [`prey-rules-customization.md`](prey-rules-customization.md) | Custom D&D 5e, Custom Skills | Eagle Prey, Eagle Eye |
| [`wings-automation.md`](wings-automation.md) | Midi-QOL, Automated Conditions 5e, Active Auras, ATL, Ready Set Roll | Eagle Wings |
| [`techniques-catalog.md`](techniques-catalog.md) | Wiederverwendbare Techniken, Datenstrukturen, Hook-Katalog | alle |

## 1. Die zehn Quellen im Überblick

Stand der geklonten Default-Branches. Kompatibilität aus dem jeweiligen
`module.json`; "LOC" = Quellcode ohne Vendor-/Test-Anteile (gerundet).

| Modul | Zweck | Foundry | dnd5e | Abhängigkeiten | Letzter Commit | Lizenz | LOC |
|---|---|---|---|---|---|---|---|
| 5e Statblock Importer (Aioros) | Monster-Statblock-Text → NPC-Actor | 12.331 – 14 (verif. 14.357) | 4.3 – 5.999 (verif. 5.3.0) | keine | 2026-03-25 | MIT | 3,4k |
| 5e Item Importer (GnollStack) | Item-Text/YAML → Items | 14+ (verif. 14.367) | ab 5.3.0 (verif. 5.3.3) | keine (Activity-Companion premium, separat) | 2026-09-08 | EULA (source-available) | 24,9k |
| 5e Spellblock Importer (gioppoluca) | Spell-/Item-Text → Spells/Items | 10 – 14 | verif. 4.3.6 | keine | 2026-04-18 | MIT | 1,0k |
| Custom D&D 5e (Larkinabout) | System-Konfiguration, Hausregeln, Workflows, eigene Activity-Typen | 14.367+ (README nennt v12–v14) | 6.0 – 6.99 (verif. 6.0.3) | libWrapper | 2026-09-18 | keine Freigabe, siehe 5 | 40,3k |
| Custom Abilities & Skills (misthero) | eigene Attribute/Skills | 13 – 14 (verif. 14.364) | ab 5 (verif. 5.3.3) | keine | 2026-08-13 | MIT | 1,3k |
| Automated Conditions 5e (thatlonelybugbear) | Zustände/Flags beeinflussen Würfe | 14.367+ | 6.0.0 – 6.1 (verif. 6.0.3) | keine | 2026-09-19 | MIT | 30,8k |
| Active Auras (kandashi) | Auren über Active Effects | 12 – 13 | – | socketlib, libWrapper | 2026-03-03 | MIT | 3,0k |
| Active Token Lighting/Effects (kandashi) | Token-Daten per Active Effect steuern | ab 13 (verif. 13, kein Maximum deklariert) | – | keine | 2026-02-12 | MIT | 1,3k |
| Ready Set Roll 5e (MangoFVTT) | Schnellwürfe, Chat-Karten | 13.341 – 13 | 5.0.0 (verif. 5.0.4) | keine | 2025-06-21 | GPL-3.0 | 2,0k |
| Midi-QOL (tposney) | Workflow-Automatisierung | 13 (nur v13-Branch) | 5.2.0 – 5.3.99 | socketlib, libWrapper, DAE | 2026-09-02 | MIT | 50,2k |

Exakte Commit-Stände (zum Nachvollziehen):

| Modul | Commit | Quelle |
|---|---|---|
| Statblock Importer | `53dc891` | github.com/Aioros/5e-statblock-importer |
| Item Importer | `71662c5` | github.com/GnollStack/5e-Item-Importer |
| Spellblock Importer | `cbfb6fe` | github.com/gioppoluca/5e-spellblock-importer |
| Custom D&D 5e | `1e4e28f` | github.com/Larkinabout/fvtt-custom-dnd5e |
| Custom Skills | `0ec4982` | github.com/misthero/dnd5e-custom-skills |
| Automated Conditions 5e | `cf9e47d` | github.com/thatlonelybugbear/automated-conditions-5e |
| Active Auras | `c93cf63` | github.com/kandashi/Active-Auras |
| ATL | `e338274` | github.com/kandashi/Active-Token-Lighting |
| Ready Set Roll | `f20ba46` | github.com/MangoFVTT/fvtt-ready-set-roll-5e |
| Midi-QOL | `6b10be5` (Branch `v13`) | gitlab.com/tposney/midi-qol |

## 2. Kernerkenntnisse

**K1 — Das Ökosystem ist zwischen Foundry v13/v14 und dnd5e 5.x/6.x
gespalten, teils ohne Überlappung.** Die neuesten Module (Automated Conditions,
Custom D&D 5e) zielen ausschließlich auf Foundry 14.367+ und dnd5e 6.0–6.x. Der
Item Importer verlangt Foundry 14+ / dnd5e 5.3+. Midi-QOL, Ready Set Roll und
Active Auras sind dagegen auf Foundry 13 begrenzt (deklariertes Maximum 13;
Midi-QOL zusätzlich nur mit dnd5e ≤ 5.3.99), ATL ist für 13 verifiziert
(ohne deklariertes Maximum). Der Statblock Importer deckt v12–v14 ab. In den Live-Logs
der eigenen Forge-Testwelt lief dnd5e 5.3.3 auf v13 **und** v14. Das bestätigt
das in der Vision beschriebene Problem (Module veralten nach Updates) sehr
konkret — und macht die Festlegung der Zielversionen zu einer offenen
Grundsatzfrage (siehe Abschnitt 5, Q1).

**K2 — dnd5e macht seine Interna bewusst öffentlich zugänglich, und das wird
in der Praxis genutzt.** Custom D&D 5e leitet eigene Datenmodelle direkt von
`dnd5e.dataModels.activity.BaseActivityData` ab, eigene Sheets von
`dnd5e.applications.activity.ActivitySheet`, eigene Dokumentklassen über
`dnd5e.documents.activity.ActivityMixin` und registriert sie mit
`CONFIG.DND5E.activityTypes["<id>"] = { documentClass }`. Damit gibt es einen
**praktisch erprobten Erweiterungsweg für völlig neue Activity-Typen** (dort:
Macro, Move, Swap). Zusammen mit den bereits in Milestone 5/8 gefundenen
Namespaces (`game.dnd5e`, `CONFIG.DND5E`) stärkt das die Empfehlung "erst
prüfen, was dnd5e schon öffentlich anbietet".

**K3 — Die Datenstruktur für programmatisch erzeugte Items/Activities ist
belegt und wird produktiv genutzt.** Der Statblock Importer baut Items mit
`system.activities.<id> = { _id, type: "attack" | "save" | "utility" | "cast",
activation, attack, save, damage, effects, consumption, uses }` und verknüpft
Active Effects über `activity.effects: [{ _id, onSave }]` mit `item.effects`.
Konkrete Muster stehen im [`techniques-catalog.md`](techniques-catalog.md).
Das bestätigt die Kernannahme aus Milestone 2 an einem realen, gewarteten
Modul.

**K4 — Für "Zusatzschaden nur gegen Kreaturentyp X" gibt es mindestens drei
bewährte, alle fremdmodul-basierte Zielformate.** (a) Build-a-Bonus (schon in
M2 genannt), (b) Automated-Conditions-Flag, z. B. `bonus=2d6; …;
opponentActor.creatureType.includes('undead')`, (c) Midi-QOL-Flag mit
Bedingungsausdruck, z. B. `raceOrType === "undead"` bzw.
`["fiend","undead"].includes(target.raceOrType)`. Ein eigener Compiler
"strukturierte Eingabe → Bedingungsformat" müsste sich für eines (oder
mehrere) davon entscheiden — das ist eine Entscheidung des Projektleiters,
keine Annahme (Q3).

**K5 — Alle drei Import-Module folgen "Vorschau vor Anlage".** Statblock Importer:
Parse-Button, erkannte Elemente werden im Text unterstrichen, dann erst
Import. Item Importer: Parse → Review → Import, mit Konfidenz, Herkunft
(Provenienz) und Prüfvorschlägen. Das deckt sich mit der Empfehlung aus M6
(der Korrektur-/Vorschau-Schritt ist der tragende Teil). Neu: der Item
Importer bietet zusätzlich einen **strikten YAML-Modus** (Vorlagen mit
Schema-Version und Migration) neben dem natürlichsprachigen Parser, und seine
Automatisierungs-Ableitung ist bewusst "konservativ" und standardmäßig aus.

**K6 — Format-Drift ist ein laufender Wartungsaufwand.** Der Statblock Importer
trägt für 2014- und 2024-Statblock-Layouts getrennte Regexe
(`attack`/`attack24`, `savingThrowDetails`/`savingThrowDetails24`,
`abilityValues`/`abilityValues24`). Der Spellblock Importer kennt noch gar keine
Activities (verifiziert nur bis dnd5e 4.3.6). Ein Parser ist also nie
"fertig", sondern folgt Regelwerks- und Systemversionen.

**K7 — Für viel Automatisierung reicht dnd5e's offizielle Hook-Schicht; tiefe
Eingriffe sind auf wenige, gezielte Wrapper begrenzbar.** Ready Set Roll
benutzt ausschließlich dnd5e-Hooks (`dnd5e.preRollAttackV2`,
`preRollDamageV2`, `preUseActivity`, `postUseActivity`,
`activityConsumption`, `displayCard`, `renderChatMessage` u. a.), kein
libWrapper. Automated Conditions (30k LOC) kommt ganz ohne libWrapper aus.
Custom D&D 5e braucht nur rund ein Dutzend Wrapper — und dokumentiert sie samt
Aktivierungsbedingung im README (jeweils nur aktiv, wenn die zugehörige
Einstellung eingeschaltet ist). Midi-QOL patcht dagegen breit (~30 Ziele, u. a.
`Item.use`, alle `Actor.roll*`, `D20Roll.configureModifiers`,
`DamageRoll.configureDamage`). Die realen Wrapper-Ziele sind ein Katalog dessen,
was der in der Vision antizipierte "tiefe Eingriff" konkret bedeutet.

**K8 — Automatisierungs-Module sind nicht additiv.** Automated Conditions
dokumentiert, dass bei gleichzeitigem Einsatz mit Midi-QOL/CPR pro Bereich
**genau einer** Besitzer sein muss (Status-Automatisierung, Reichweitenprüfung,
Sichtbarkeit) und dass ein Modul, das `dialog.configure = false` erzwingt,
optionale AC5E-Auswahlen verhindert. Ready Set Roll erklärt sich ausdrücklich
für inkompatibel zu Modulen, die dnd5e-Würfe/Chat-Karten verändern (z. B.
Midi-QOL). Das ist genau die "kuratierte Wissensbasis bekannter
Überschneidungen", die in M3 (Stufe 2) als einzig realistischer Weg beschrieben
wurde — hier existiert sie bereits als händisch gepflegte Dokumentation.

**K9 — Active Effects mit eigenen Schlüssel-Namensräumen sind der zentrale
Erweiterungsmechanismus der Automations-Module.** `ATL.<pfad>` (Token-Daten),
`flags.midi-qol.*` (1600+ Zeilen Flag-Referenz), `flags.automated-conditions-5e.*`
bzw. `flags.ac5e.*`, `flags.ActiveAuras.*`, `macro.*` u. a. — jeweils als
kleine Domänensprache in Effekt-Einträgen. DAE dient als Editor-/Autocomplete-
Schicht darüber (`dae.setFieldData`). Wer Automatisierung "in einem Modul
bündeln" will (Eagle Wings), bündelt praktisch diese Sprachen.

**K10 — Wiederverwendbarkeit von Code ist stark eingeschränkt.** Nur MIT-Code
(sieben Module) ist unter Namensnennung frei wiederverwendbar. Ready Set Roll
ist GPL-3.0 (abgeleiteter Code müsste ebenfalls GPL-3.0 sein). Der Item Importer
steht unter einer EULA (source-available): Einsicht und private Anpassung ja,
Weitergabe, Forks und abgeleitete öffentliche Veröffentlichungen ausdrücklich
untersagt. Custom D&D 5e nennt "not licensed for redistribution" und enthält
Font-Awesome-Pro-Bezüge. **Konzepte und öffentliche APIs lassen sich nutzen,
Code dieser drei nicht einfach übernehmen.**

**K11 — Überschneidung Custom D&D 5e ↔ Eagle Prey/Wings.** Custom D&D 5e bietet
bereits: ein Konfigurationssystem für über 30 `CONFIG.DND5E`-Bereiche (Fähigkeiten,
Skills, Schadensarten, Zustände, Kreaturentypen, Raststypen, …), ein
"Gameplay"-Fenster für Hausregeln, ein Trigger→Aktion-Workflow-System und
eigene Activity-Typen. Das ist inhaltlich erheblich näher an Eagle Prey (und
teils Eagle Wings) als jede andere Quelle. Ob daraus Koexistenz, Integration
oder Abgrenzung folgt, ist eine Entscheidung des Projektleiters (Q2).

## 3. Zuordnung: Welche Quelle hilft welchem Eagle-Modul?

| Eagle-Modul | Hilfreichste Quellen | Was genau |
|---|---|---|
| **Eagle Eye** | alle | Feature-erkannte Modul-APIs (`game.modules.get(id)?.api`), Integrations-Hooks (`midi-qol.midiReady`, `dae.setFieldData`, `tidy5e-sheet.ready`), Koexistenz-/Besitzer-Dokumentation als Vorbild für Konflikt-Wissen, socketlib-GM-Relay |
| **Eagle Eyrie** | Item Importer (Compendium-Bild-Cache), Spellblock Importer (Journal "imported-spells"), Statblock Importer (SRD-Spell-Auflösung) | Compendium-Zugriff und Namensauflösung in der Praxis; kaum direkte Vorlagen für Dedup |
| **Eagle Egg** | Custom D&D 5e (Item-Interaktionen, Sheet-Erweiterung), Custom Skills (Skills/Abilities zur Laufzeit erweitern) | Sheet-Erweiterung über `renderActorSheetV2`/Tidy5e-API; Laufzeit-Erweiterung von `CONFIG.DND5E`; **keine** direkte Vorlage für geführte Erstellung (weiterhin: dnd5e-`AdvancementManager`, siehe M5) |
| **Eagle Beak** | Statblock, Item, Spellblock Importer | Parser-Architektur, Regex-Katalog, Vorschau/Konfidenz/Provenienz, Strict-YAML mit Schema-Version, Activity-Datenstrukturen, SRD-Klon als Vorlage |
| **Eagle Talon** | — (keine Quelle) | Nur indirekt: Muster für Modul-Einstellungen/Menüs |
| **Eagle Prey** | Custom D&D 5e, Custom Skills | Config-Engine-Muster, Liste realer Wrapper-Ziele, Gameplay-Optionen, Workflows/Trigger |
| **Eagle Wings** | Midi-QOL, Automated Conditions, Active Auras, ATL, Ready Set Roll | Workflow-Pipeline, Hook-Kataloge, Flag-Sprachen, Aura-/Token-Effekt-Muster, Besitzer-Problematik, Abhängigkeitsketten |

## 4. Ergänzungen und Korrekturen zu bisherigen Ergebnissen

Die früheren Dokumente bleiben unverändert (genehmigte/geschlossene Artefakte).
Diese Punkte sollten bei einer künftigen Überarbeitung des Projektplans
berücksichtigt werden:

1. **M2 (API-Umwandlung), Generalisierbarkeit:** Die Aussage "grundlegend
   neuartige Mechaniken außerhalb der 11 Activity-Typen brauchen echten
   Custom-Code" ist zu pessimistisch. dnd5e erlaubt das Registrieren **eigener
   Activity-Typen** (K2). Die Grenze verschiebt sich von "unmöglich ohne
   Systemeingriff" zu "eigener Activity-Typ nötig".
2. **M2, Bedingungsmechanismus:** Neben Build-a-Bonus existieren mindestens zwei
   weitere Zielformate (K4). Die Optionen-Liste "Abhängigkeit auf babonus vs.
   eigener Filter-Mechanismus" sollte um "Abhängigkeit auf AC5E- bzw.
   Midi-Flags" ergänzt werden.
3. **M6 (Freitext-Import):** Bestätigt und verfeinert (K5, K6). Neu zu
   berücksichtigen: Strict-YAML-Modus als zweiter, zuverlässiger Eingabeweg;
   Format-Drift 2014/2024 als laufender Aufwand; Activity-Erzeugung ist im
   Item Importer bewusst in ein separates (Premium-)Companion-Modul ausgelagert,
   nicht Teil des freien Kerns.
4. **M8 (Prey), Fallback "tiefe Eingriffe":** Es gibt jetzt konkrete,
   dokumentierte Wrapper-Ziele als Referenz (K7) und ein bewährtes
   Konfigurations-Muster (`CONFIG.DND5E`-Bereiche über Einstellungen, siehe
   [`prey-rules-customization.md`](prey-rules-customization.md)). Außerdem
   existiert mit Custom D&D 5e bereits ein Modul mit erheblicher Überschneidung
   (K11).
5. **M9 (Wings):** Die Empfehlung "erst prüfen, ob bestehende Module
   öffentliche Schnittstellen bieten" ist jetzt teilweise beantwortet:
   Midi-QOL (`globalThis.MidiQOL`, ~100 Hooks), AC5E (eigene API + `ac5e.*`-Hooks)
   und Custom D&D 5e (`customDnd5e.*`-Hooks) haben solche Schnittstellen (Details
   in [`wings-automation.md`](wings-automation.md)). Nicht beantwortet bleibt,
   ob eine Bündelung sinnvoll ist, solange die Module sich gegenseitig
   ausschließen (K8).
6. **M3 (Modul-(De)Aktivierung/Konflikt-Wissen):** Die dort beschriebene
   "kuratierte Wissensbasis" hat reale Vorbilder in händisch gepflegter
   Koexistenz-Dokumentation (K8). Als Datenquelle kommt Freitext-Doku in
   Frage, kein maschinenlesbares Format.

## 5. Offene Fragen an den Projektleiter

Keine davon wurde angenommen oder entschieden.

- **Q1 — Zielversionen:** Auf welche Foundry- und dnd5e-Versionen sollen die
  Eagle Modules zielen? (Bisher: Foundry v13 **und** v14 parallel; in der
  Testwelt läuft dnd5e 5.3.3. Die neuesten Module setzen v14 + dnd5e 6.x voraus,
  ältere v13 + dnd5e 5.x. K1)
- **Q2 — Umgang mit Custom D&D 5e:** Soll Eagle Prey (und ggf. Teile von
  Eagle Wings) neben Custom D&D 5e koexistieren, darauf aufbauen/integrieren,
  oder sich bewusst davon abgrenzen? (K11)
- **Q3 — Bedingungsformat für "nur gegen Typ X":** Sind Abhängigkeiten auf
  Fremdmodule (Build-a-Bonus, Automated Conditions, Midi-QOL) für Eagle Beak
  akzeptabel, oder soll eine eigenständige Lösung erforscht werden? (K4)
- **Q4 — Lizenz der Eagle Modules:** Unter welcher Lizenz sollen die Eagle
  Modules veröffentlicht werden? Das bestimmt, welcher fremde MIT-/GPL-Code
  überhaupt übernommen werden dürfte (K10). Bisher nicht festgelegt.

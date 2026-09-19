# System-/Regelanpassung: Erkenntnisse für Eagle Prey (und Eagle Eye)

status: Referenzmaterial, Stand 2026-09-19 — Methode und Commit-Stände siehe
[`README.md`](README.md).

Betrachtet: **Custom D&D 5e** (Larkinabout) und **Custom Abilities & Skills**
(misthero). Beide verändern dnd5e-Regeln bzw. -Konfiguration, ohne den
Systemcode zu ersetzen.

## 1. Custom D&D 5e — der wichtigste Fund dieser Analyse für Eagle Prey

**Aufgabe (Eigenbeschreibung):** "A Foundry VTT module to customise the D&D 5e
system." Konfiguriert Spielmechaniken und Automatisierung von Kernregeln,
optionalen Varianten und Hausregeln. **Foundry 14.367+, dnd5e 6.0–6.99** laut
Manifest (das README nennt noch "V12/V13/V14" — das Manifest ist für die
aktuelle Version maßgeblich). Benötigt **libWrapper**. ~40k LOC, sehr aktiv
(letzter Commit 2026-09-18).
**Lizenz:** keine Lizenzdatei; README: "The code in this repository is not
licensed for redistribution", zusätzlich Font-Awesome-Pro-Bezüge → **Konzepte
studieren, Code nicht übernehmen.**

### Funktionsumfang (aus dem README, thematisch gruppiert)
| Bereich | Inhalt (Auszug) |
|---|---|
| **Gameplay-Optionen (Hausregeln)** | Bloodied-Schwelle, Instant Death, Dead, Unconscious, Death Saving Throws, Hit Points, Initiative jede Runde, Speed-Factor-Initiative, Inspiration vergeben, Durchschnitts-/Mob-/Probabilistischer Schaden, Prone, Resting |
| **Configurations** | Eigene Werte für über 30 `CONFIG.DND5E`-Bereiche (siehe unten) |
| **Configure Rolls** | Basiswürfel und Wurfmodus je Wurfart ändern (Ability Checks, Attack Rolls, Concentration, Initiative, Saves, Skills, Tools) |
| **Activities** | Eigene Activity-Typen **Macro**, **Move** (erzwungene Bewegung), **Swap** (Positionstausch) plus "Targeting Prompt" (Ziele vor Ausführung erzwingen) |
| **Workflows** | Ereignisgesteuerte Trigger→Aktion-Regeln (siehe unten) |
| **Counters** | Zähler am Charakterbogen mit Triggern |
| **UI/Token** | Radial Status Effects, Condition Levels, Token-Rahmenform, Token-Distanz, HUD-Verbesserungen, Ruler-Reisezeit, Chat-Kürzel u. a. |
| **Item Interactions** | Items geben/ablegen zwischen Actors |

### Architektur-Muster "Config-Engine" (`scripts/configurations/config-engine.js`)
Ein deklaratives Verfahren, um viele `CONFIG.DND5E`-Bereiche einheitlich
bearbeitbar zu machen. Pro Bereich eine **`ConfigDefinition`**:
`configKey` (Schlüssel in `CONFIG.DND5E`), Konstanten (Menü/Einstellungs-
Schlüssel/Template), Editor-Formular, Beschreibung der Felder eines Eintrags
(`localize`, `default`, `conditional`, `transform`, verschachtelte
`children`, `required`) und Merge-Strategie (`withConfig` = gespeicherte Daten
mit aktuellem `CONFIG.DND5E` und Standardwerten verschmelzen; `defaultsOnly` =
entfernte Einträge nicht wieder hinzufügen).

`registerConfig(def)` registriert dann jeweils:
1. ein **Settings-Menü** (`registerMenu`, `restricted: true`, `scope: "world"`)
   mit Editor-Formular,
2. eine **Enable-Einstellung** (Boolean, Standard `false`, standardmäßig mit
   `requiresReload`),
3. eine **Config-Einstellung** (`type: Object`, `scope: "world"`,
   `config: false`, Standardwert = Kopie des Systemstands).

Beim Start wird der gespeicherte Stand in `CONFIG.DND5E[configKey]` gemischt;
ein Hook `customDnd5e.set<Name>Config` informiert andere Module. Es existiert
eine Rücksetz-Möglichkeit auf den Systemstand, ein Fallback für nicht mehr
auflösbare Lokalisierungsschlüssel (`systemLabelFallback`) und eine
Sicherung des Original-Standards unter `CONFIG.CUSTOM_DND5E`.

**Abgedeckte Bereiche** (Dateien in `scripts/configurations/`): abilities,
activation-costs, actor-sizes, armor-calculations/-ids/-proficiencies,
bastions, bloodied, calendar, condition-effects, conditions, consumable-types,
creature-types, currency, damage-types, encumbrance, feature-types,
item-action-types, item-activation-cost-types, item-properties, item-rarity,
languages, loot-types, misc-equipment-types, movement-types, rest-types, senses,
skills, spell-schools, tool-proficiencies, tools, weapon-ids/-masteries/
-proficiencies.

**Bezug zu Milestone 8:** Das ist ein reales Beispiel, wie weit sich "Regel-
Einstellungen" über `CONFIG.DND5E` + Weltsettings ohne Code-Eingriff ins
System treiben lassen — deutlich weiter als die in M8 verifizierte kleine
Teilmenge dnd5e-eigener Settings (kritischer Trefferschaden). Der Preis: pro
Bereich ein eigenes Editor-Formular und bei Änderungen häufig ein Neustart
der Welt.

### Reale libWrapper-Eingriffe (README dokumentiert jeden mit Bedingung)
Nur aktiv, wenn die jeweilige Einstellung eingeschaltet ist:

| Ziel | Zweck |
|---|---|
| `CONFIG.Actor.documentClass.prototype._prepareMovementAttribution` | Sprungweiten im Bewegungs-Tooltip |
| `CONFIG.Canvas.rulerClass.prototype._getWaypointLabelContext` | Reisezeit am Lineal |
| `CONFIG.Dice.D20Die.prototype.applyAdvantage` / `isValid` | andere Würfelzahl/-seiten statt d20 |
| `CONFIG.Dice.D20Roll.fromConfig` / `.prototype.configureModifiers` / `.prototype.validD20Roll` | eigene Basiswürfel in Würfen zulassen |
| `dnd5e.applications.actor.BaseActorSheet.prototype._prepareSenses` | eigene Sinne |
| `dnd5e.applications.actor.BaseActorSheet.prototype._prepareSkillsTools` | nicht mehr vorhandene Skills herausfiltern |
| `dnd5e.dataModels.actor.AttributesFields.prepareEncumbrance` / `.prepareMovement` | Variant-Encumbrance ohne Doppelberechnung, Multiplikator-Geschwindigkeitsabzug |
| `foundry.canvas.placeables.Token.prototype._refreshBorder` / `._refreshEffects` | Rahmenform, radiale Effekte |

Der überwiegende Rest des Moduls läuft über **Hooks**, u. a.
`dnd5e.preUseActivity`, `dnd5e.rollAttack`, `dnd5e.rollSavingThrow`,
`dnd5e.preRestCompleted`, `dnd5e.getItemContextOptions` sowie Foundry-Hooks
(`renderActorSheetV2`, `updateToken`, `createActiveEffect` …).

**Lehre für den in der Vision antizipierten "tiefen Eingriff":** Auch ein
40k-LOC-Modul für Hausregeln kommt mit rund einem Dutzend gezielter,
bedingt aktivierter Wrapper aus; die Regelwirkung entsteht überwiegend aus
Konfiguration und Hooks.

### Workflows (Trigger → Aktion) — auch für Eagle Wings interessant
Deklarative Regeln auf Welt-, Actor- oder Item-Ebene. **Trigger:** Wurf-Trigger
(Attack Roll, Attack Rolled, Ability Check, Saving Throw, Skill, Tool,
Initiative, Concentration, Death Save, Damage Rolled – mit optionalen
Wertbedingungen), HP-Trigger (0 HP, Hälfte, HP verloren/gewonnen), Kampf,
Rast, Zustand angewendet/entfernt/Stufe geändert, Effekt an/aus, Item
angelegt/abgelegt/benutzt, Counter-Trigger. **Aktionen:** Counter ändern,
Zustand anwenden/entfernen/umschalten, Makro, Actor/Token ändern, Sound,
Wurf anfordern (mit Erfolg-/Fehlschlag-Zweig), Rolltabelle, "Add Roll Bonus"
und Workflow-Steuerung. Makros erhalten Kontext (`actor`, `item`, `event`,
`rolls`, `data` …); Angriffs-Pre-Roll-Makros zusätzlich Quell-/Ziel-Actor und
`rollConfig`. Workflows lassen sich kopieren/einfügen.

### Koexistenz
Das Modul **weicht** bei der Traglast-Konfiguration dem Modul "Variant
Encumbrance + Midi", wenn dieses aktiv ist — ein Beispiel für "Besitzer je
Regelbereich" (siehe K8 in [`README.md`](README.md)).

### Für Dritte bereitgestellte Hooks
`customDnd5e.set<Bereich>Config` (u. a. ActivationCosts, ArmorCalculations,
ConditionEffects, Currency, EquipmentTypes, ItemActivationCostTypes,
ItemProperties, RestTypes), `customDnd5e.conditionsConfigApplied`,
`customDnd5e.death`, `customDnd5e.hp`, `customDnd5e.rollAverageDamage`,
`customDnd5e.rollMobDamage`, `customDnd5e.rollProbalisticDamage` (Schreibweise
wie im Quelltext).

## 2. Custom Abilities & Skills (misthero) — kleines, sauberes Muster für Laufzeit-Erweiterung

**Aufgabe:** Über eine Oberfläche neue **Attribute/Skills** hinzufügen oder
Standard-Attribute/-Skills ausblenden. **MIT**, ~1,3k LOC, Foundry 13–14,
dnd5e 5.x (verif. 5.3.3), letzter Commit 2026-08-13.

**Kernidee (laut README):** Änderungen betreffen nur Actor-Daten, "no
modification to the system or core data, everything is reversible and most
changes are just in memory".

**Technik (aus dem Quelltext):**
- Erweitert **zur Laufzeit** `game.dnd5e.config.skills` bzw. `.abilities`
  (`CONFIG.DND5E`) und sortiert die Skills nach Label.
- Damit auch das Actor-Datenmodell die neuen Schlüssel kennt, wird
  `_patchActorMappingFieldInitialKeys` eingesetzt — die initialen Schlüssel der
  Mapping-Felder `skills`/`abilities` in den Schemas von
  `CONFIG.Actor.dataModels[...]` werden ergänzt.
- Speichert eine Einstellung `settings` (Objekt), Menü über `registerMenu`;
  Hooks: `init` (Registrierung), `ready`, `renderActorSheet`/`…V2`, `i18nInit`,
  `DAE.setupComplete` (Abstimmung mit Dynamic Active Effects).
- Erkennt die dnd5e-Version per `foundry.utils.isNewerVersion(game.dnd5e.version, …)`
  und schaltet Verhalten je Generation.
- Bekannte Grenzen (README): Nach dem Anlegen neuer Actors Einstellungen erneut
  speichern; Charakterbögen: Standard und Tidy 5e voll, OGL und D&D-Beyond-Sheet
  nur teilweise.

## 3. Was das für Eagle Prey und Eagle Eye bedeutet

Aus den Quellen ableitbar (Schlüsse, keine Festlegungen):

1. **Ebene 2 aus M8 ("Regel-Einstellungen") ist im Ökosystem bereits real
   umgesetzt** — nicht über dnd5e-eigene Settings, sondern über
   Konfigurationsbereiche in `CONFIG.DND5E` plus Weltsettings. Das Config-
   Engine-Muster (deklarative Definition → Menü + Enable-Flag + Objekt-
   Setting → Merge beim Start) ist eine bewährte Blaupause und ließe sich auch
   für den Eagle-Eye-Hub verallgemeinern.
2. **Ebene 3 aus M8 ("tiefe Eingriffe")** hat mit der Tabelle oben eine konkrete
   Referenz: welche Methoden tatsächlich gepatcht werden, wenn Würfelbasis,
   Traglast, Bewegung oder Sinne geändert werden sollen.
3. **Laufzeit-Erweiterung von `CONFIG.DND5E` ist ein etabliertes Verfahren**
   (Custom Skills in klein, Custom D&D 5e in groß) — verbunden mit dem
   Schema-Detail, dass neue Schlüssel auch in den Actor-Datenmodellen
   ergänzt werden müssen.
4. **Überschneidung:** Ein erheblicher Teil dessen, was Eagle Prey verspricht
   (Hausregeln konfigurieren, eigene Regeln/Automatisierung), existiert in
   Custom D&D 5e bereits. Ob Koexistenz, Integration oder Abgrenzung
   gewünscht ist, ist offen (Q2 in [`README.md`](README.md)).
5. **In der Sichtung nicht gefunden:** Eine Erfassung der Regeln als
   **lesbarer Klartext mit Mechanik** (wie "kritischer Treffer = doppelte
   Würfel …" in der Vision). Custom D&D 5e verweist für Hilfetexte auf ein
   eigenes Journal im mitgelieferten Compendium (laut README: "Gameplay
   journal") — eine Nutzung der dnd5e-eigenen Regelübersicht
   `CONFIG.DND5E.rules` (M8) wurde nicht festgestellt. (Die Suche war
   stichprobenartig, keine vollständige Code-Durchsicht.)
6. **Lizenz:** Weder Code noch Struktur von Custom D&D 5e sollten übernommen
   werden; öffentliche Hooks und Konfigurationsschlüssel lassen sich als
   Integrationspunkte nutzen.

## 4. Offene Punkte

- Wie Custom D&D 5e mit anderen Regelanpassungs-Ansätzen (z. B. Eagle Prey)
  zusammenspielt, wurde nicht getestet.
- Ob die 6.x-Fassung von dnd5e (Voraussetzung dieses Moduls) eine für Eagle
  Prey relevante andere Konfigurationsstruktur hat als 5.3.3, wurde nicht
  untersucht (Q1).

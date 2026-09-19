# Techniken-Katalog: was sich aus den zehn Quellen wiederverwenden lässt

status: Referenzmaterial, Stand 2026-09-19 — Methode, Commit-Stände und
Lizenzlage siehe [`README.md`](README.md).

Dieser Katalog sammelt **Verfahren und Datenstrukturen** (keine Code-Auszüge zum
Übernehmen). Jeder Eintrag nennt, wo er belegt ist. Lizenzhinweis: Konzepte und
öffentliche APIs sind frei nutzbar; Code nur aus MIT-Quellen (Statblock, Spellblock,
Custom Skills, AC5E, Active Auras, ATL, Midi-QOL) unter Namensnennung.

## 1. dnd5e: öffentliche Namensräume und Erweiterungspunkte

| Punkt | Zweck | Belegt in |
|---|---|---|
| `game.dnd5e` / globales `dnd5e` (`dataModels`, `applications`, `documents`) | System-Interna öffentlich nutzbar (Basisklassen ableiten, Manager aufrufen) | dnd5e (M5-Recherche), Custom D&D 5e |
| `CONFIG.DND5E` (Bereiche wie `skills`, `abilities`, `damageTypes`, `conditionTypes` …) | Regel-Konfiguration; zur Laufzeit erweiterbar | Custom Skills, Custom D&D 5e |
| `CONFIG.DND5E.activityTypes["<id>"] = { documentClass }` | **eigene Activity-Typen registrieren** | Custom D&D 5e (`activities.js`) |
| `dnd5e.dataModels.activity.BaseActivityData` + `defineSchema()` | Datenmodell eines eigenen Activity-Typs | Custom D&D 5e |
| `dnd5e.documents.activity.ActivityMixin(<Datenmodell>)` | Dokumentklasse eines eigenen Activity-Typs | Custom D&D 5e |
| `dnd5e.applications.activity.ActivitySheet` | Sheet eines eigenen Activity-Typs | Custom D&D 5e |
| `dnd5e.dataModels.actor.AttributesFields.*` (`prepareMovement`, `prepareEncumbrance`) | Ziele für gezielte Wrapper auf Datenaufbereitung | Custom D&D 5e |
| `game.dnd5e.version` | Version erkennen, Verhalten je Generation schalten | Custom Skills |

## 2. Activity-Datenrezepte (aus dem Statblock Importer)

Programmatisch erzeugte Items tragen ihre Mechanik in `system.activities.<id>`.
Jede Activity hat `_id` (`foundry.utils.randomID()`), `type` und `activation`
(`{type, value}`, mit `override: true` zum Überschreiben von Item-Werten).

| Ziel | Felder (Konzept) |
|---|---|
| Nahkampf-/Fernangriff | `type:"attack"`, `attack.type.value` (`"melee"`/`"ranged"`), `attack.type.classification` (z. B. `"spell"`), `attack.ability` (z. B. `"spellcasting"`), `attack.flat` + `attack.bonus` (fester Trefferbonus); Reichweite auf Item-Ebene (`system.range.value/long/units`) |
| Rettungswurf | `type:"save"`, `save.ability`, `save.dc.formula`, `damage.onSave` (z. B. Hälfte) |
| Schaden | `damage.parts[]` (Formel/Zahl+Würfel+Typ), `damage.includeBase` |
| Zauber wirken | `type:"cast"`, `spell.uuid`, `spell.level`, `spell.spellbook` |
| Nutzungen/Aufladung | `uses.max`, `uses.recovery=[{period, type}]`, `consumption.targets=[{type:"activityUses", value}]` |
| Zustand anwenden | Active Effect `{ _id, name, statuses:[…], transfer:false }` in `item.effects`, verknüpft über `activity.effects=[{ _id, onSave }]` |
| Fallback | leere `type:"utility"`-Activity, damit das Item benutzbar ist |

Dazu: Beschreibungstext kann `@UUID[…]`-Links auf Zauber/Items enthalten
(erzeugt beim Zauber-Import). **Nicht untersucht:** Abweichungen im
dnd5e-6.x-Datenmodell.

## 3. Eigenen Activity-Typ registrieren (Konzept)

1. Datenmodell von `dnd5e.dataModels.activity.BaseActivityData` ableiten,
   `defineSchema()` um eigene Felder erweitern.
2. Dokumentklasse mit `dnd5e.documents.activity.ActivityMixin(<Datenmodell>)`
   bilden; Sheet von `ActivitySheet` ableiten.
3. In `CONFIG.DND5E.activityTypes` unter einer eigenen ID mit `documentClass`
   eintragen.
Praktisch erprobt in Custom D&D 5e für Makro-, Bewegungs- und Tausch-Aktivitäten.
Relevanz: verschiebt die in M2 genannte Grenze "neue Mechanik = Systemcode".

## 4. Regel-Konfiguration über Einstellungen (Config-Engine-Muster)

Pro `CONFIG.DND5E`-Bereich: Definition (Schlüssel, Feldbeschreibung, Merge-
Strategie) → Settings-Menü (nur GM) + Enable-Flag + Objekt-Setting
(`scope:"world"`, `config:false`) → beim Start in `CONFIG.DND5E` mischen →
Hook für Dritte. Original-Standardwerte werden separat gesichert, damit
Rücksetzen möglich ist. Einzelheiten:
[`prey-rules-customization.md`](prey-rules-customization.md).

## 5. Laufzeit-Erweiterung von Attributen/Skills

`CONFIG.DND5E.skills`/`abilities` ergänzen **und** die Schlüssel in den
Actor-Datenmodell-Schemas (Mapping-Felder) nachtragen, sonst kennt das
Datenmodell die neuen Einträge nicht (Custom Skills). Änderungen liegen im
Speicher/ in Actor-Daten, nicht im Systemcode. Bekannte Grenze: Neu angelegte
Actors brauchen erneutes Speichern der Einstellung.

## 6. Hook-Katalog rund um die dnd5e-Wurf-/Aktivierungs-Pipeline

Aus Ready Set Roll (Signaturen), Custom D&D 5e und AC5E — dnd5e-Hooks:

| Hook | Argumente (laut RSR-Nutzung) |
|---|---|
| `dnd5e.preRollAbilityCheckV2`, `…preRollSavingThrowV2`, `…preRollSkillV2`, `…preRollToolV2` | `(config, dialog, message)` |
| `dnd5e.preRollAttackV2`, `dnd5e.preRollDamageV2` | `(config, dialog, message)` |
| `dnd5e.preUseActivity` | `(activity, usageConfig, dialogConfig, messageConfig)` |
| `dnd5e.postUseActivity` | `(activity, usageConfig, results)` |
| `dnd5e.activityConsumption` | `(activity, usageConfig, messageConfig, updates)` |
| `dnd5e.displayCard`, `dnd5e.renderChatMessage` | Chat-Karten |
| `dnd5e.rollAttack`, `dnd5e.rollSavingThrow` | nach dem Wurf (Custom D&D 5e) |
| `dnd5e.preRestCompleted` | Rasten (Custom D&D 5e) |
| `dnd5e.getItemContextOptions` | Kontextmenü von Items (Custom D&D 5e) |
| `dnd5e.getUnknownAttributeLabel` | Beschriftung unbekannter Attribute (AC5E) |

Zusammenhang: Ready Set Roll und AC5E bewältigen große Teile der Automatisierung
allein mit diesen Hooks. Zu Foundry-seitigen Hooks siehe die Quellen selbst.

## 7. Integrations-Signale anderer Module

| Signal | Bedeutung | Belegt in |
|---|---|---|
| `libWrapper.Ready`, `libWrapper.ConflictDetected`, `libWrapper.OverrideLost` | libWrapper-Bereitschaft/Konflikte | libWrapper (M5) |
| `socketlib.ready` | socketlib einsatzbereit | Active Auras |
| `midi-qol.midiReady` | Midi-QOL einsatzbereit | AC5E |
| `dae.setFieldData` / `DAE.setupComplete` | DAE-Feldhilfen bzw. Bereitschaft | AC5E / Custom Skills |
| `tidy5e-sheet.ready` (liefert API) | Tidy-5e-Erweiterungspunkte | Midi-QOL, Custom D&D 5e |
| `ac5e.usageRulesReady`, `…statusEffectsReady`, `…contextKeywordsReady`, `…prepareAttributions` | AC5E-Erweiterung | AC5E |
| `customDnd5e.set<Bereich>Config`, `customDnd5e.death`, `customDnd5e.hp` | Custom-D&D-5e-Ereignisse | Custom D&D 5e |
| `midi-qol.*` (~100 Pipeline-Hooks) | Workflow-Phasen | Midi-QOL |

Muster: **feature-erkannte APIs** statt harter Abhängigkeit
(`game.modules.get(id)?.api`, `globalThis.MidiQOL`), Aufrufer prüfen
Fähigkeiten vor Nutzung (Item Importer, Midi-QOL).

## 8. Active-Effect-Schlüsselräume als Domänensprachen

| Präfix | Modul | Zweck |
|---|---|---|
| `ATL.<Datenpfad>` | ATL | Token-Daten (Licht, Sicht, Größe …) |
| `flags.midi-qol.*` | Midi-QOL | Vorteil/Nachteil, Kritisch, Auto-Erfolg, Schadensmodifikatoren, Grants … |
| `flags.automated-conditions-5e.*` / `flags.ac5e.*` | AC5E | Wurf-Beeinflussung, Auren, Bedingungen |
| `flags.ActiveAuras.*` | Active Auras | Aura-Steuerung |
| `macro.*` u. a. | DAE | Makro-/Feld-Effekte |

Eigenschaften der Sprachen: Bedingungsausdrücke in einer Auswertung mit
Zugriff auf Rollen-Actor, Gegner-Actor und Item (`opponentActor.creatureType`,
`raceOrType`), Direktiven mit `;` getrennt (AC5E), Wert-Autocomplete/Editoren
(AC5E-Editor, DAE), Linting (`lintAc5eFlags`).

## 9. GM-Relay mit socketlib

Spieler dürfen fremde Dokumente nicht ändern → Anfrage per socketlib an den GM,
der validiert und ausführt (Schaden anwenden, Effekte erzeugen, Token bewegen).
Belegt in Midi-QOL (`GMAction.ts`) und Active Auras (`CONFIG.AA.Socket`).
Relevanz für Eagle Eye: derselbe Zwang gilt für jede Hub-Funktion, die
Spielereinstellungen oder fremde Dokumente ändert.

## 10. libWrapper-Praxis

- `register(id, "Ziel.Pfad", fn, "WRAPPER" | "MIXED" | "OVERRIDE")`, Wrapper nur
  registrieren, wenn die zugehörige Einstellung aktiv ist (Custom D&D 5e).
- `libWrapper.ignore_conflicts(id, [andereModule], [ziele])`, um bekannte,
  harmlose Überschneidungen zu erklären (Active Auras gegen DAE).
- Abhängigkeitsprüfung mit klarer Fehlermeldung beim Fehlen von libWrapper
  (Active Auras).
Reale Zielliste: [`prey-rules-customization.md`](prey-rules-customization.md) §Wrapper
und [`wings-automation.md`](wings-automation.md) §Midi-QOL.

## 11. Import-UX: Vorschau, Konfidenz, Provenienz, Schema-Version

Statblock Importer (Markierung erkannter Textstellen), Item Importer
(Konfidenz/Beleg/Prüfvorschläge, YAML-Schema mit Version und Migration,
Ablehnung zu neuer Schemas, Exporter). Einzelheiten:
[`beak-importers.md`](beak-importers.md).

## 12. Migration und Versionsanpassung

- **Versionierte Migrations-Einstellung** (ATL: `conversion`, Umwandlung alter
  Preset-Felder mit Bestätigungsdialog).
- **Schema-Version in Nutzerdaten** (Item Importer) — neuere unbekannte Versionen
  werden abgelehnt statt halb verarbeitet.
- **Verhalten je Regelversion** (AC5E: Legacy/Modern nach dnd5e-Einstellung;
  Statblock: 2014/2024-Muster getrennt).
- **Versionserkennung** (`foundry.utils.isNewerVersion(game.dnd5e.version, …)`).

## 13. Diagnose und Tests

- Item Importer: Testsuiten laufen aus der Browser-Konsole, legen **keine**
  Weltdokumente an; mutierende Fixture-Aktionen nur über eine gesperrte
  Automatisierungs-Schnittstelle; Release-Archive enthalten nur eine kompakte
  Laufzeit-Suite.
- AC5E: Flag-Linting über Actors/Szene/Welt, Troubleshooter-Snapshots
  (Export/Import), Debug-Ausgabe der Auswertungsdaten.
- Midi-QOL: eigenes TroubleShooter-Fenster, Fehleraufzeichnung per Hook
  (`midi-qol.TroubleShooter.recordError`).
- Relevanz: Ergänzung zum bestehenden Projektansatz (Vitest für reine Logik,
  Live-Tests nur mit Freigabe) — solche eingebauten Diagnosen verkürzen den
  Rückfragen-Zyklus bei Live-Tests.

## 14. Typische Stolpersteine (aus den Dokumentationen)

- **Format-Drift** (2014/2024-Layouts, dnd5e-Datenmodell) → Parser wachsen
  fortlaufend.
- **Neustart nötig** bei vielen Konfigurations-Änderungen (Enable-Flags mit
  `requiresReload`).
- **Neu angelegte Actors** übernehmen Laufzeit-Erweiterungen nicht automatisch
  (Custom Skills).
- **Würfel-Dialog erzwingen/unterdrücken:** Ein Modul mit
  `dialog.configure = false` verhindert optionale Auswahlen anderer Module (AC5E).
- **Mehrere Wurf-/Chat-Karten-Module** schließen sich teils aus (RSR ↔ Midi-QOL).
- **Mehrere Besitzer desselben Regelbereichs** (Status-Automatisierung,
  Reichweite, Sichtbarkeit) → je Bereich genau einer.
- **Versionsstand bei Modul-Kombinationen** (Foundry 13 vs. 14, dnd5e 5.x vs. 6.x)
  prüfen, bevor Kombinationen empfohlen werden.

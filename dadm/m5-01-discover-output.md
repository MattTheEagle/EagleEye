```
artifact: discover-output
milestone: M5
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan.md` (M5), Entscheidungen E1–E8, Antworten aus `dadm/m4-05-human-decision-output.md`
  (Q1 a, Q2 a, Q3 a, Q15 a)
- Phase-2-Ergebnisse (`dadm/eagle-modules-projektplan.md`, Abschnitte M2, M3, M5, M8 der Planungsphase 2)
- Foundry-v13-Types (`foundry-vtt-reference-v13/types`, gepinnt), Foundry-Doku "Module Development"
- dnd5e Release 5.3.3 (flacher Klon im Scratchpad, Commit `965ad2d`)
- Vergleichsmodule aus der Quellenanalyse (Midi-QOL, Custom D&D 5e) für die API-Konvention
- Phase-1-Code (`core/`, `v13/module.ts`)

## Fakten je Fähigkeit

### (a) Hub, Registerkarten, Start der Module
| # | Fakt | Quelle |
|---|---|---|
| a1 | `ApplicationV2` hat eine eingebaute Tab-Konfiguration (`static TABS: Record<string, TabsConfiguration>`) | `client/applications/api/application.d.mts:513` |
| a2 | Der Phase-1-Hub ist bereits eine `ApplicationV2` und wird über `game.settings.registerMenu` geöffnet; es gibt bisher **eine** Tabelle, keine Registerkarten | `core/hub-application.ts`, `v13/module.ts:11` |
| a3 | Ein Paket-Manifest hat ein freies `flags`-Objekt auf Paketebene und eines in `relationships`; `game.modules` liefert alle **installierten** Module, `Module#active` sagt, ob aktiv | `common/packages/base-package.d.mts` (`flags`, `PackageRelationshipsSchema`), `client/packages/module.d.mts` (`active`) |
| a4 | `relationships.requires` nimmt Einträge mit `id`, `type`, `manifest`, `compatibility` (minimum/verified/maximum) und `reason` | `base-package.d.mts` (`RelatedPackageSchema`, `PackageCompatibilitySchema`) |
| a5 | Einstellungen eines Moduls sind nur registriert, solange das Modul aktiv ist (Registrierung im Modulcode); der Settings-Hub aus Phase 1 liest die Registry `game.settings.settings` und wurde gegen 94 reale Pakete verifiziert | `core/settings-hub.ts`, Phase-1-Archiv M4 |
| a6 | "Aus dem Hub starten" ist im PDF für Character Edit ("Lässt sich aus dem Hub starten"), Homebrew ("Öffnen aus Hub") und Journal ("über Hub geöffnet") jeweils als Öffnen der Oberfläche beschrieben; Q15 bestätigt "Oberfläche öffnen" | PDF, Antwort Q15 |

### (b) Anfragenkanal zwischen getrennt veröffentlichten Modulen
| # | Fakt | Quelle |
|---|---|---|
| b1 | Konvention "`game.modules.get(id).api`": Midi-QOL setzt `game.modules.get("midi-qol").api = globalThis.MidiQOL`; Custom D&D 5e setzt `module.api = {…}` im `init`-Hook | `midi-qol/src/midi-qol.ts:958`, `custom-dnd5e/scripts/module.js:67,95` |
| b2 | Foundry-Doku: "If a module has been installed with dependencies, but its dependencies are missing, it cannot be enabled." | foundryvtt.com/article/module-development |
| b3 | Foundry-Doku: Library-Module laden "before non-library packages so that they are always ready when other packages call on them." Zur Reihenfolge zwischen normalen Modulen und ihren Abhängigkeiten sagt die Doku **nichts**; `library` ist als "no user-facing functionality" definiert | selbe Seite, `module.d.mts` (`library`) |
| b4 | Die Doku sagt nichts darüber, was passiert, wenn eine erforderliche Abhängigkeit installiert, aber **deaktiviert** ist | selbe Seite (nicht erwähnt) |
| b5 | `User#query(queryName, data, {timeout})` sendet eine Anfrage an einen bestimmten Benutzer und liefert das Ergebnis; Query-Namen werden in `CONFIG.queries` registriert und müssen mit dem Modulnamen präfixiert sein ("my-module.aCustomQuery") | `client/documents/user.d.mts:734`, `client/config.d.mts:2408` |
| b6 | `CONST.USER_PERMISSIONS.ACTOR_CREATE` (ebenso `ITEM_CREATE`, `JOURNAL_CREATE`) hat als Standard-Rolle `ASSISTANT`; normale Spieler dürfen ohne Freigabe keine Actors anlegen | `common/constants.d.mts:1295–1305` |
| b7 | Jedes `RelatedPackage` kann eine Versionsspanne der Abhängigkeit nennen (`compatibility.minimum/verified/maximum`); ob Foundry die Spanne beim Aktivieren erzwingt oder nur anzeigt, ist aus den Types und der Doku nicht ableitbar | `base-package.d.mts` (`RelatedPackageSchema`) |
| b8 | Phase 1 hat `getVersionBadge()` und Availability-Codes (u. a. `MISSING_DEPENDENCY = 6`) bereits genutzt | `core/manifest-scanner.ts`, `common/constants.d.mts:798–838` |

### (c) "Versteht Foundry API und DnD Systemlogik"
| # | Fakt | Quelle |
|---|---|---|
| c1 | Phase 2 hat die öffentlichen dnd5e-Erweiterungspunkte belegt: Activities/DamageData (M2), `AdvancementManager` (M5), `CONFIG.DND5E.rules` und Settings (M8) | Projektplan Planungsphase 2 |
| c2 | dnd5e 5.3.3 deklariert Foundry-Kompatibilität `minimum 13.347`, `verified 14` | `dnd5e/system.json` |
| c3 | Das Systemverhalten ändert sich mit dnd5e-Versionen (5.x → 6.x); Prüfmöglichkeit zur Laufzeit: `game.system.version` | Quellenanalyse K1, `core/manifest-scanner.ts` (System wird mitgescannt) |

### (d) "Klartext ↔ Code" in beide Richtungen
| # | Fakt | Quelle |
|---|---|---|
| d1 | Vorwärts (Klartext → Code): Phase-2-M2 (Activity-/DamageData-Schema deckt Schadensmenge, -typ, "magisch" deklarativ ab); die Bedingung "nur gegen Typ X" war das offene Stück und wird in M6 neu geklärt (E3) | Projektplan Planungsphase 2, M2 |
| d2 | Rückwärts: `Item5e#_prepareLabels` baut aus den Activities zusammengefasste Labels (`labels.activations`, `labels.attacks`, `labels.damages`) | `dnd5e/module/documents/item.mjs:650–690` |
| d3 | Activities tragen eigene Labels (`activity.labels`, `activationLabels`), die aus den Datenfeldern für Aktivierung, Dauer, Reichweite, Ziel und Nutzungen erzeugt werden | `dnd5e/module/data/activity/base-activity.mjs:120–125, 561–622` |
| d4 | dnd5e übersetzt Schemafelder über `LOCALIZATION_PREFIXES` und `localizeSchema`, damit jedes Datenfeld ein lokalisiertes Label trägt | `dnd5e/module/data/item/spell.mjs:33`, `consumable.mjs:50`, `utils.mjs:1357` |
| d5 | Es gibt `Item5e#richTooltip` und `getChatData` für lesbare Darstellungen | `dnd5e/module/documents/item.mjs:690, 805` |
| d6 | Ein eingebauter Mechanismus, der ein beliebiges Item in **einen Satz** in natürlicher Sprache umwandelt ("+2W6 Feuer gegen Untote"), wurde bei der Suche nach `labels`, Zusammenfassungen, `richTooltip` und `getChatData` in `module/` nicht gefunden; es gibt nur die Label-Bausteine aus d2–d5 (keine vollständige Durchsicht aller Dateien) | Suche in `dnd5e/module/` |
| d7 | PDF-Lesart: "und umgekehrt" steht bei Flight Control; bei Character Edit und Homebrew verlangt das PDF ausdrücklich, dass Flight Control bestehende Daten **in den Editor überträgt** (P-CE4, P-HB6) — das ist eine Rückrichtung in strukturierte Editor-Daten, nicht in Fließtext | PDF |

### (e) Phase-1-Code gegen Eagle-only
| Datei | Was sie heute tut | Bezug zu Eagle-only (Information) |
|---|---|---|
| `core/manifest-scanner.ts` | liest **alle** Module und das System, liefert Status und Badge | die Lesefunktion liefert Daten, die für "welche Eagle Module sind installiert/aktiv/verifiziert" gebraucht werden; Filter auf Eagle Module fehlt |
| `core/settings-hub.ts` | listet und schreibt Settings **beliebiger** Namensräume | Kernfunktion (lesen/schreiben über die Registry) unverändert nutzbar, Filter auf Eagle-Namensräume fehlt |
| `core/hub-application.ts` | eine Tabelle aller Settings | keine Registerkarten je Modul, kein Start der Module |
| `core/conflict-watch.ts` | hört auf libWrapper-Konflikte beliebiger Module | Fremdmodul-Funktion (Q1 a: Konflikt-/Kompatibilitätserkennung entfällt) |
| `core/language-scan.ts` | liest Sprachen aller Pakete gegen die aktive Sprache | Bezug zu Fremdmodulen; die Sprache des DnD-Systems könnte für Klartext-Ausgabe relevant sein (Entscheidung offen) |
| `v13/module.ts` | registriert ein Settings-Menü "hub", Init-/Ready-Logs | Einstiegspunkt des Hubs |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Das Ladeverhalten (Reihenfolge, deaktivierte Abhängigkeit, Erzwingen der Versionsspanne) ist aus Doku und Types nicht belegt; ein Beleg bräuchte einen Live-Test in Forge und damit die Freigabe des Projektleiters (Live-Test-Gate) | medium | nein, in dieser Phase nur als "nicht verifiziert" gekennzeichnet |
| R2 | Der Foundry-Core-Quellcode liegt lokal nicht vor (nur Types); Aussagen zu Foundry-Laufzeitverhalten stützen sich auf Types und Doku | low | nein |
| A1 | Die Modul-IDs der Eagle Module sind nicht festgelegt (E5: Umbenennung nur in Dokumenten); Aussagen zur Erkennung "Eagle Modul" gelten unabhängig von der ID | info | nein |

## Open Questions
Keine, die den Ablauf stoppen. Für die Sammlung nicht blockierender Punkte (siehe Apply): Wer darf welches Modul nutzen
(nur GM oder auch Spieler), Umgang mit inaktiven installierten Modulen im Hub, Sprache des Klartexts.

## Next Step
Apply bewertet jede Fähigkeit (a)–(e) und leitet Empfehlungen ab.

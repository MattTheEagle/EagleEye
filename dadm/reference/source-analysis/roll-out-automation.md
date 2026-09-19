# Automatisierung: Erkenntnisse für Eagle Roll Out (Grundlage)

> **Namen:** Dieses Dokument verwendet die echten Modulnamen: Eagle Flight Control (ehemals Eagle Eye), Eagle Roll Out (ehemals Eagle Wings).

status: Referenzmaterial, Stand 2026-09-19 — Methode und Commit-Stände siehe
[`README.md`](README.md). Eagle Roll Out ist laut Projektleiter bewusst
zurückgestellt; dieses Dokument legt nur die Wissensgrundlage für später.

Betrachtet: **Midi-QOL**, **Automated Conditions 5e (AC5E)**, **Active Auras**,
**Active Token Lighting/Effects (ATL)**, **Ready Set Roll (RSR)**. Sie decken
zusammen einen großen Teil dessen ab, was Eagle Roll Out bündeln soll (in der
Vision genannt: Midi-QOL, Active Auras, Active Token Effects, Automated
Conditions).

## 1. Überblick der fünf Module

| Modul | Kernidee | Größe | Eingriffsart | Abhängigkeiten |
|---|---|---|---|---|
| **Midi-QOL** | Workflow-Pipeline Angriff → Ziel → Rettungswurf → Schaden → Anwendung | 50k LOC (TypeScript) | ~30 libWrapper-Ziele + ~100 eigene Hooks + Activity-Mixin | socketlib, libWrapper, DAE |
| **AC5E** | Zustände/Effekt-Flags beeinflussen jeden Wurf, hebt den richtigen Würfel-Button hervor | 31k LOC | nur Hooks, kein libWrapper | keine |
| **Active Auras** | Effekte, die als Aura markiert sind, wandern auf nahe Tokens | 3k LOC | libWrapper (`ActiveEffect#apply`, `#isTemporary`, `#_displayScrollingStatus`) | socketlib, libWrapper |
| **ATL** | Beliebige Token-Daten (Licht, Sicht, Größe, Bild …) per Active Effect | 1,3k LOC | Hooks, keine Wrapper | keine |
| **RSR** | Schnellwürfe, Chat-Karten, Vorteil/Nachteil per Modifikatortaste | 2k LOC | nur dnd5e-Hooks | keine |

## 2. Midi-QOL (Tim Posney) — der Maßstab für Workflow-Automatisierung

**Stand:** Nur der Branch `v13` (Version 13.0.65, 2026-09-02); Foundry 13,
dnd5e **5.2.0–5.3.99**. MIT. Im Repo liegt eine ausführliche
Entwicklerdokumentation (`CLAUDE.md`, `FLAGS.md`, `MACROS.md`, `docs/`) — sie
ist die beste öffentlich verfügbare Beschreibung, wie eine solche Automatisierung
aufgebaut ist.

### Architektur (laut eigener Entwicklerdoku)
- **Workflow-zentriert:** Die Klasse `Workflow` (~9k Zeilen) orchestriert die
  gesamte Kette Angriff → Ziele → Rettungswürfe → Schaden; alles andere
  speist diese Pipeline oder erweitert sie.
- **Öffentliche API:** `globalThis.MidiQOL` exportiert über 70 Funktionen/
  Klassen, u. a. `Workflow`, `TrapWorkflow`, `completeItemUse`,
  `completeActivityUse`, `applyTokenDamage`, `hasCondition`, `createEffects`.
  Empfohlener Weg, einen Workflow aus Fremdcode auszulösen: das native
  `activity.use()` — Midi hängt sich dort ein.
- **Hooks:** ~100 eigene Hooks (`midi-qol.preItemRoll`, `…preAttackRoll`,
  `…AttackRollComplete`, `…preDamageRoll`, `…DamageRollComplete`,
  `…preCheckSaves`, `…postSavesComplete`, `…preTargetDamageApplication`,
  `…RollComplete`, `…postCompleted`, `…midiReady` u. v. m.) — alle
  Phasen der Pipeline sind als Vor-/Nach-Hooks zugänglich.
- **GM-Relay per socketlib:** Spieler stellen Anfragen, der GM validiert und
  führt aus (Schaden anwenden, Effekte erzeugen, Token bewegen —
  `GMAction.ts`). Nötig, weil Spieler fremde Dokumente nicht ändern dürfen.
- **Activity-Ebene:** `MidiActivityMixin` (~2,2k Zeilen) patcht **alle**
  dnd5e-Activity-Typen; eigene Implementierungen u. a. für Angriff, Rettungswurf.
- **Effekt-Sprache:** Über 1600 Zeilen Flag-Referenz für `flags.midi-qol.*`
  (Vorteil/Nachteil, Kritisch, Auto-Erfolg/-Fehlschlag, Absorption, Grants,
  Schadensmodifikatoren, Reichweite …), mit **Bedingungsausdrücken**
  (`evalCondition`), z. B. `raceOrType === "undead"` oder
  `["fiend","undead"].includes(target.raceOrType)`.
- **Weitere Bausteine:** On-Use-Makros und Damage-Bonus-Makros, Over-Time-
  Effekte, Konzentration, Flankierung, Undo-Historie, `RollModifierTracker`
  (Herkunft von Vorteil/Nachteil), `DependentsRegistry` (abhängige Effekte),
  TroubleShooter- und Config-Panel (ApplicationV2).
- **Gepatchte Ziele (Auszug aus `patching.ts`):** `Item#use`, `Item#prepareData`,
  `Item#getRollData`, `Actor#rollSavingThrow/rollSkill/rollAbilityCheck/
  rollToolCheck/rollDeathSave`, `Actor#prepareData/prepareDerivedData/_onUpdate`,
  `Actor#challengeConcentration`, `Dice.D20Roll#configureModifiers`,
  `Dice.DamageRoll#configureDamage`, `Combat#_preUpdate/_preDelete`,
  `ActiveEffect#_preCreate`, mehrere `Token`-Methoden (Sichtbarkeit, Klicks),
  `TokenLayer#selectObjects`, `Notifications#notify`.
- **Abhängigkeitskette:** Midi-QOL setzt DAE (Dynamic Active Effects),
  socketlib und libWrapper voraus; die Entwicklernotizen nennen zusätzlich
  Times-Up (Effektdauer), Chris's Premades und Tidy 5e als eng integrierte
  Partner.

### v14-Stand (wichtig für die v13/v14-Strategie des Projekts)
Im untersuchten Stand existiert **kein v14-Zweig** von Midi-QOL. Laut
Entwicklernotiz wurde in v14 die Effekt-Dauerverwaltung von Times-Up in DAE
verlagert (`dae-14x` existiert). Das Changelog vermerkt Rückwärts-Kompatibilität
"until midi-qol v14".

## 3. Automated Conditions 5e (thatlonelybugbear) — Regeln als Flag-Sprache, ohne Wrapper

**Stand:** Foundry **14.367+**, dnd5e **6.0.0–6.1** (Version 14.603.2; frühere
Branches für v12/v13/dnd5e 2–4 existieren laut README). MIT, sehr aktiv
(Commit vom Tag der Analyse). 31k LOC, **kein libWrapper**.

**Idee:** Zustände (Legacy- und Modern-Regeln, passt sich der dnd5e-Einstellung
an) und **AC5E-Flags** an Active Effects beeinflussen Angriffe, Rettungswürfe,
Attributswürfe und Schaden; der passende Würfel-Button wird hervorgehoben.
Unterstützt **Auren** und "Granting Modes" (Effekt gilt für andere).

### Bausteine mit Vorbildcharakter
- **Flag-Domänensprache:** `flags.automated-conditions-5e.<ACTIONTYPE>.<MODE>`
  (Kurzform `flags.ac5e.…`), Wert = Direktiven + Bedingungsausdruck, z. B.
  `bonus=1d6[force]; once; itemLimited; opponentActor.attributes.hp.pct < 50 && opponentActor.statuses.prone`.
  Ausdrücke laufen in einer **Sandbox** mit Zugriff auf `rollingActor`,
  `opponentActor` (Alias `targetActor` nur noch rückwärtskompatibel), Aura-Quelle,
  Kampfdaten und Hilfsfunktionen (z. B. `ac5e.checkCreatureType(actor)`,
  `ac5e.checkNearby(tokenId, '!enemy', 0, { creatureTypes: ['dragon'] })`).
  Beispiel-Bedingung für Kreaturentypen: `opponentActor.creatureType.includes('undead')`.
- **Öffentliche Erweiterungs-APIs (Wiki):** Usage-Rules-API, Context-Keywords-API,
  Evaluation-State-Hook, Status-Effects-Overrides-API, Cadence-API, Exposed
  Helpers, Troubleshooter-API; eigene Hooks `ac5e.usageRulesReady`,
  `ac5e.statusEffectsReady`, `ac5e.contextKeywordsReady`, `ac5e.prepareAttributions`,
  `ac5e.sandboxReady.*`.
- **Werkzeuge für Fehlersuche:** `lintAc5eFlags()` prüft Flags über Actors,
  Szene und Welt-Items; Troubleshooter-Snapshots lassen sich exportieren und
  importieren; `ac5e.logEvaluationData = true` gibt die verfügbaren Auswertungs-
  daten aus. Dazu ein Effekt-Wert-Editor mit Autocomplete (~4,7k Zeilen).
- **Integrationen per Hook, nicht per Abhängigkeit:** `midi-qol.midiReady`,
  `dae.setFieldData`, `dnd5e.getUnknownAttributeLabel`.
- **Beispielkatalog:** Wiki-Seite "Flags-examples (automating 5e items)" mit
  vielen realen Item-Automatisierungen — eine ideale Sammlung realistischer
  Eingaben für spätere Tests.

### Koexistenz-Regeln (Wiki "Compatibility with MidiQOL and CPR")
Grundsätzlich lauffähig zusammen, aber **je Bereich ein Besitzer**:
Status-Automatisierung ("Automate D&D5e statuses"), Reichweitenprüfungen,
Sichtbarkeitsprüfungen. Weitere Hinweise: AC5E-Opt-ins brauchen konfigurierbare
Würfel-Dialoge (ein Modul, das `dialog.configure = false` erzwingt, blockiert
sie); AC5E-Erzwingungsmodi und DC-Änderungen werden in Midis Anzeige
gespiegelt.

## 4. Active Auras (kandashi) und ATL (kandashi)

**Active Auras** (MIT, 3k LOC, Foundry 12–13, letzter Commit 2026-03-03):
Effekte mit Aura-Kennzeichnung werden auf nahe Tokens übertragen; Reichweite
und Zielgruppe (Verbündete/Feinde) konfigurierbar; DAE-`@`-Felder werden
aufgelöst. Standardmäßig nur im Kampf und nur auf der aktiven Szene. Aura-
Daten liegen als Flags am Effekt (`flags.ActiveAuras.isAura`, `ignoreSelf`,
`combatOnly`, `displayTemp`, `applied`, …). Technik: Hooks auf
`updateToken/updateActor/updateCombat/updateWall/updateMeasuredTemplate/
updateActiveEffect`, Entfernungsmessung (`AAMeasure`), libWrapper auf
`ActiveEffect#apply` (+ `ignore_conflicts` gegen DAE), socketlib für
GM-Ausführung.

**ATL** (MIT, 1,3k LOC, für Foundry 13 verifiziert, letzter Commit 2026-02-12):
Der Schlüssel `ATL.<Datenpfad>` in einem Active Effect steuert beliebige
Token-Daten (Licht, Sicht, Größe, Bild), z. B. `ATL.sight.dim`; Presets
(Fackel, Laterne, Kerze, Taschenlampe) sind anpassbar. Für dnd5e Sonderbehandlung:
Effekte auf Items wirken nur bei angelegter/eingestimmter Ausrüstung. Die
Datei `updateManager.js` zeigt außerdem ein **Migrationsmuster** (versionierte
Einstellung `conversion`, Umwandlung alter Preset-Felder mit Nutzerbestätigung).

**Bezug zu Foundry v14 (Fakt + Schluss):** Foundry v14 entfernt den Dokumenttyp
`MeasuredTemplate` (siehe `foundry-vtt-reference-v14/breaking-changes-v13-to-v14.md`).
Im Quelltext kommt `MeasuredTemplate` bei Active Auras in 8 Zeilen und bei
Midi-QOL in 48 Zeilen vor; die übrigen betrachteten Module enthalten es nicht.
Daraus folgt (nicht getestet), dass beide Module für v14 an dieser Stelle
migriert werden müssten (Midi-QOL erwähnt an 5 Stellen Regions, Active Auras
nirgends).

## 5. Ready Set Roll (MangoFVTT)

**Stand:** Foundry 13.341–13, dnd5e 5.0.0 (verif. 5.0.4), **GPL-3.0**, letzter
Commit **2025-06-21** — der am längsten unberührte Stand der zehn Quellen. 2k LOC.

Baut ausschließlich auf **dnd5e-Hooks**: `dnd5e.preRollAbilityCheckV2`,
`…preRollSavingThrowV2`, `…preRollSkillV2`, `…preRollToolV2`,
`…preRollAttackV2`, `…preRollDamageV2`, `dnd5e.preUseActivity`,
`dnd5e.postUseActivity`, `dnd5e.activityConsumption`, `dnd5e.displayCard`,
`dnd5e.renderChatMessage`. Erklärt sich ausdrücklich für **inkompatibel zu
Modulen, die dnd5e-Würfe oder Chat-Karten verändern** (Beispiel Midi-QOL).
Es enthält eine Integrationsschicht (`integration.js`, u. a. Erkennung von Midi).
Als Vorbild taugt vor allem der Nachweis, dass sich ein umfassender
Umbau des Würfel-/Chat-Ablaufs **allein über die offiziellen Hooks** lösen lässt.

## 6. Querschnitt: Was das für Eagle Roll Out bedeutet

Aus den Quellen ableitbar (Schlüsse, keine Festlegungen):

1. **Eagle Roll Out bündelt in Wahrheit Flag-Sprachen und Pipelines.** Der
   gemeinsame Nenner sind Active Effects mit eigenen Schlüsselräumen
   (`ATL.*`, `flags.midi-qol.*`, `flags.ac5e.*`, `flags.ActiveAuras.*`, `macro.*`)
   und Hook-Pipelines an `activity.use()`/den dnd5e-Wurf-Hooks.
2. **Das Kompatibilitätsproblem ist strukturell:** Midi-QOL, AC5E, RSR und
   CPR überlappen; Koexistenz gelingt nur mit klarer Besitzerzuordnung je
   Bereich (K8). Ein Eagle-Roll-Out-Modul müsste genau diese Zuordnung lösen oder
   eine der Pipelines vollständig ersetzen — und die anderen dann ausschließen.
3. **Zwei bewährte Bauweisen:** breiter Umbau mit vielen Wrappern (Midi-QOL,
   Vorteil: volle Kontrolle; Nachteil: enge Bindung an dnd5e-Interna und
   Versionen) versus Hooks + Flag-Sprache ohne Wrapper (AC5E, RSR; Vorteil:
   stabiler gegenüber Systemupdates). Beide gibt es aktiv gepflegt.
4. **Versions-Realität:** Die reifsten Module (Midi-QOL, RSR, Active Auras)
   sind an Foundry 13 bzw. dnd5e ≤ 5.3 gebunden, die aktuellsten (AC5E,
   Custom D&D 5e) an Foundry 14 + dnd5e 6. Für ein Eagle-Roll-Out-Modul, das beide
   Foundry-Versionen bedienen soll, gibt es damit keine gemeinsame
   Referenzimplementierung (Q1 in [`README.md`](README.md)).
5. **Nutzbare Integrationspunkte statt Code-Übernahme:** `globalThis.MidiQOL`,
   `midi-qol.*`-Hooks, `ac5e`-APIs/-Hooks, `customDnd5e.*`-Hooks, DAE-Hooks. Code
   ist nur bei MIT übernehmbar (Midi-QOL, AC5E, AA, ATL); RSR ist GPL-3.0.
6. **Testkorpus vorhanden:** AC5E-Flag-Beispiele, Midi-Beispielitems
   (`midiqol-sample-items`), ATL-Premade-Items.

## 7. Offene Punkte

- Wie stark sich Midi-QOL und AC5E in der Praxis stören, wurde nur aus deren
  Dokumentation entnommen, nicht getestet.
- Ob und wann Midi-QOL, Active Auras und ATL für Foundry v14 erscheinen, ist
  aus den Quellen nicht ableitbar.
- Ob eine Bündelung in Eagle Roll Out sinnvoller als "Koordinator über bestehende Module"
  (Eagle Flight Control als Konflikt-/Besitzerwissen) oder als Ersatz zu bauen wäre, ist
  eine Grundsatzfrage für den Projektleiter, keine Annahme dieser Analyse.

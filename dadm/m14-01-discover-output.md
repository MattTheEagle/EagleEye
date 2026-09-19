```
artifact: discover-output
milestone: M14
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan-v2.md` (M14), PDF-Auftrag P-W1/P-W2 (später; Vorab-Plan, wie viel Automation in das Modul gepackt werden kann), Antwort Q13 c (Vorab-Plan bewertet beides: komplett eigen oder auf bestehenden Modulen aufbauend; entschieden wird danach), E1 (nur v13), E3, Q1 a, Q2 a, N4, N5 (bedingte Effekte: Stufe 2 bei Roll Out)
- `dadm/reference/source-analysis/roll-out-automation.md` (Midi-QOL, Automated Conditions 5e, Active Auras, ATL, Ready Set Roll), `techniques-catalog.md`
- Ergebnisse M5 (GM-Anfrageweg), M6 (Weg C, Filterformat), M13 (Koexistenz, libWrapper, Versionshistorie)
- dnd5e 5.3.3 (Commit `965ad2d`)

## Fakten

### Vorhandene Module (aus der Quellenanalyse, Stand der Auswertung)
| # | Fakt | Quelle |
|---|---|---|
| a1 | **Midi-QOL** (MIT, 50k LOC): Workflow-Kette Angriff → Ziel → Rettungswurf → Schaden → Anwendung; etwa 30 libWrapper-Ziele, etwa 100 eigene Hooks; braucht DAE, socketlib, libWrapper; Zweig v13 (dnd5e 5.2.0–5.3.99) | `roll-out-automation.md` §2 |
| a2 | **Automated Conditions 5e** (MIT, 31k LOC, kein libWrapper): Zustände und Effekt-Flags mit Bedingungsausdrücken beeinflussen Würfe; Flag-Sprache `flags.ac5e.…` | §3 |
| a3 | **Active Auras** (MIT, 3k LOC, Foundry 12–13): Aura-Effekte auf nahe Tokens, libWrapper auf `ActiveEffect#apply`, socketlib | §4 |
| a4 | **Active Token Lighting/Effects** (MIT, 1,3k LOC): Schlüssel `ATL.<Datenpfad>` an Effekten steuert Token-Daten; nur Hooks | §4 |
| a5 | **Ready Set Roll** (GPL-3.0, 2k LOC): Schnellwürfe und Chat-Karten allein über dnd5e-Hooks; erklärt sich inkompatibel zu Modulen, die Würfe oder Chat-Karten verändern | §5 |
| a6 | Koexistenz gelingt nur mit **einem Besitzer je Bereich** (Status-Automatisierung, Reichweiten-, Sichtbarkeitsprüfung) | §3, K8 |
| a7 | Versionshistorie für Foundry 13 (Korrektur zu K1): Midi-QOL Zweig v13; Active Auras 0.12.7 und ATL v1.1.1 für Foundry 13; RSR release-3.5.0 nur bis dnd5e 5.0.4 verifiziert; Automated Conditions v14.519.1 nur bis dnd5e 5.2 (für 5.3.3 kein verifizierter Release) | `source-analysis/README.md`, Abschnitt 4 |

### dnd5e 5.3.3 nativ (das muss Roll Out nicht selbst bauen)
| # | Fakt | Quelle |
|---|---|---|
| n1 | Aktivierung und Würfe laufen über `activity.use()` mit dokumentierten Hooks (`dnd5e.preUseActivity`, `postUseActivity`, `preRoll…`, `rollDamage…`); die Chat-Karte erfasst die Ziele des Nutzers | M6 (f5–f7) |
| n2 | Schadensberechnung je Ziel mit Immunität, Resistenz, Verwundbarkeit und Schwellenwerten, samt Hooks (`preCalculateDamage`, `calculateDamage`, `preApplyDamage`, `applyDamage`) | `module/documents/actor/actor.mjs:746–902` |
| n3 | Die Chat-Karte hat Bausteine zum Anwenden von Schaden, Effekten und Verzauberungen auf Ziele (`damage-application`, `effect-application`, `enchantment-application`); das Anwenden löst die **Spielleitung von Hand** aus | `module/applications/components/`, `chat-message.mjs:566` |
| n4 | Eingebaute **Anfrage-Chat-Nachrichten** (`request`): Schaltfläche, Handler, Liste der Ziele mit Actor-UUID und Ergebnis, damit Ziele auf Anforderung würfeln | `module/data/chat-message/request-message-data.mjs:15–45` |
| n5 | Konzentration ist nativ (`beginConcentrating`, `endConcentration`, Hooks) | `actor.mjs:1026–1105` |
| n6 | Automatisches Aufladen bei NPCs (`autoRecharge`), Beschwörungs-, Verwandlungs- und Verzauberungs-Activities | `module/settings.mjs:356`, `activities.mjs:333`, M6 (f3) |
| n7 | Zustände sind über `CONFIG.DND5E.conditionTypes` konfigurierbar (M13, Ebene 3a) | M13 |
| n8 | Nicht gefunden: automatisches Anwenden von Schaden ohne Klick, automatisches Auslösen von Zielwürfen aus einer Angriffsaktivierung, Aura-Logik, Effekt-Wirkung auf Token-Licht, Over-Time-Effekte | Suche in `module/` |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Die Größenangaben (Zeilenzahlen) der Vergleichsmodule sind Maßstäbe, keine Aufwandsschätzung für Eagle Roll Out | low | nein |
| R2 | Nicht getestet: Zusammenspiel mehrerer Automationsmodule (aus Dokumentation entnommen); Verhalten der Hooks unter Last | medium | nein |
| A1 | Der Auftrag "wie viel Automation kann in das Modul gepackt werden" wird als Abdeckung nach Bereichen und Aufwandsstufen gelesen, nicht als Prozentzahl | low | nein |

## Open Questions
Keine, die den Ablauf stoppen; Grundsatzentscheidung als N20 in Apply (Q13 c).

## Next Step
Apply katalogisiert die Automationsbereiche, bewertet die beiden Wege und schlägt einen Ausbaupfad vor.

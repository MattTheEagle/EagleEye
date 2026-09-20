# Übergabe an die nächste Phase — Stand von Eagle Flight Control

```
artifact: handover-note
status: living (kein Phasenartefakt; wird bei Änderungen nachgeführt)
stand: 2026-09-20, nach der Live-Abnahme und der Gesamtprüfung von M8
```

retention: durable

Für die nächste Umsetzungsphase (Empfehlung: **Eagle Library**, siehe `EAGLE-MODULES-PLAN.md`). Sie braucht einen frischen DAD-M-Bootstrap (Project Brief, Safety Boundaries, Scope Declaration, Milestone Plan mit Freigabe, Working Mode); diese Notiz ersetzt ihn nicht. Sie sagt, was Flight Control schon kann, worauf sich ein Verbraucher verlassen darf und was offen ist.

---

## 1. Was Flight Control heute ist

- Modul `eagleeye`, **Version 0.1.0, API `0.7.0`**, nur Foundry v13 (getestet: Build 351 auf Forge, dnd5e 5.3.3).
- **Fünf API-Mitglieder:** `version`, `registerModule`, `request`, `getRights`, `getSystemInfo`.
- **Hub:** ein Fenster mit einer Registerkarte je angemeldetem, aktivem Eagle Modul (Einstellungen, Startknopf, für den Spielleiter die Rechte je Spieler).
- **Anfragekanal:** Anfragen laufen im eigenen Client oder, wenn sie die Rechte des Spielleiters brauchen, beim Spielleiter, nachdem dessen Client den anfragenden Nutzer beim Nutzer selbst bestätigt hat. Es gibt genau drei Nachweis-Anfragetypen: `flightcontrol.ping`, `flightcontrol.gmping`, `flightcontrol.targetping`. Sie ändern und lesen keine Foundry-Daten.
- **Rechte je Modul und Nutzer** (`denied`, `own`, `all`), vom Spielleiter im Hub gesetzt, vor jeder Ausführung geprüft (beim Spielleiter bindend).
- **Versionswächter** für das DnD-5e-System: meldet, sperrt nichts.
- **Maße:** 162 Tests in 18 Dateien, Bundle 54,6 kB, keine Laufzeit-Abhängigkeit. Der Vertrag ist durch Tests gegen den Code gehalten (`core/api-contract.test.ts`), das Manifest ebenso (`core/manifest.test.ts`).

## 2. Wo was liegt

| Was | Wo |
|---|---|
| Vertrag für Modulautoren (Englisch) | `docs/api-contract.md` |
| Regeln für die Oberfläche (Englisch) | `docs/ui-guide.md` |
| Reine Logik ohne Foundry, mit Tests | `core/` |
| Dünne Foundry-Hüllen und Hub | `v13/` |
| Testmodule für die Live-Checks in Forge | `test-fixtures/` |
| Release-Dateien bauen (veröffentlicht nichts) | `npm run package` → `release/eagleeye-v13.zip`, `release/module.json` |
| Prozess der Phase 4 (archiviert am 2026-09-20, mit `SUMMARY.md`) | `dadm/archive/implementation-phase-4/` |
| Nachträge für die gemeinsame Foundry-Referenz (sechs Einträge, **eingetragen am 2026-09-20**) | `foundry-vtt-reference-v13/cheat-sheet.md`; Wortlaut des Entwurfs: `dadm/archive/implementation-phase-4/m8-02-apply-output.md`, Abschnitt 12 |

## 3. Was ein Verbraucher wissen muss

- Die API ab `setup` lesen, in `setup` registrieren, `undefined` behandeln (Flight Control kann fehlen oder deaktiviert sein). Ein Modul, das nicht registriert ist, kennt Flight Control nicht. Nennt ein Modul `eagleeye` in `relationships.requires`, lässt Foundry im Modul-Manager nicht zu, dass Flight Control abgewählt wird, solange das Modul aktiv ist (live gesehen); andere Wege dorthin sind nicht geprüft.
- `module` in einer Anfrage ist die selbst angegebene ID des Moduls: eine ehrliche Beschriftung, keine Sicherheitsgrenze. Die Rechte gelten je Modul und halten gegen Module, die sich an die Regeln halten.
- **Neue Anfragetypen** entstehen nur mit dem Apply des Milestones, der sie braucht (Flight Control bleibt schmal und generisch); ein Test bewacht die Liste. Regeln dafür stehen im Vertrag, Abschnitt 4:
  - Ein Typ, der auf Dokumente wirkt, nennt sie als UUIDs (`targets`), sonst kann `own` ihn nicht beschränken.
  - Ein Typ, der einem Modul gehört, muss sagen, welche Module ihn benutzen dürfen (die Rechte gelten je Modul).
  - Ein Typ, der beim Spielleiter Daten ändert oder Wissen herausgibt, das nur der Spielleiter hat, sagt im Apply seines Milestones, wie.
  - Ein Typ, der vom DnD-Datenmodell abhängt, sagt, welche Systemzustände er annimmt (`getSystemInfo`).
- Vor `1.0.0` darf eine neue Nebenversion der API brechen. `1.0.0` erst, wenn der erste Verbraucher (die Library) sie ohne Bruch benutzt hat. Modulversion und API-Version sind getrennte Zahlen; die Tabelle im Vertrag, Abschnitt 6, ordnet sie zu und wird bei jeder Modulversion mit neuer API-Version um eine Zeile ergänzt (ein Test bewacht das).
- Es gibt **keine Ratenbegrenzung**: Ein veränderter Client kann den Spielleiter und einen genannten Nutzer mit Anfragen und Rückfragen belasten. Das legt nichts offen und lässt nichts laufen, was die Prüfungen ablehnen. Bei mehr Nutzern oder Modulen neu bewerten.

## 4. Offene Punkte

**Live noch nicht gezeigt (`unverified`):** nach dem Stand von `docs/api-contract.md`, Abschnitt 8. Das Ergebnis der M8-Abnahme steht in `dadm/archive/implementation-phase-4/m8-05-live-check-output.md`, die Entscheidung des Projektleiters je Punkt in der Gesamtprüfung `dadm/archive/implementation-phase-4/m8-06-gesamtpruefung-output.md`.

| Punkt | Stand |
|---|---|
| L1 Fehlerwege des Relais (`relay-timeout`, `relay-failed`), mehrere Spielleiter | offen; Fehlerwege als Restrisiko angenommen (Gruppe C), mehrere GMs braucht ein zweites Konto (Gruppe B) |
| L2 Fehlerwege der Bestätigung (nicht verbundener Nutzer, 5-Sekunden-Grenze) | nicht verbundener Nutzer: **live bestätigt** (`m8-05`); Zeitgrenze: Restrisiko (Gruppe C) |
| L3 Rechte: Assistent, mehrere Spieler, Besitzprüfung für Spielleiter, Compendium, "Inherit", gelöschte Nutzer | offen (Gruppe B: weitere Konten nötig) |
| L4 Wächter: Hinweis beim Spielleiter zur Zeit `ready`, Zustände außer `tested`, was ein Spieler sieht | **vom Projektleiter als Risiko angenommen** (2026-09-20); die vier Prüfpakete liegen weiter in `v13/dist/live-check/`, falls später gewünscht |
| L5 Hub: abgelehnter Wert, Regler über dem Maximum, Hub für einen Spieler (Menüknopf fehlt) | Regler: beantwortet (das Zahlenfeld begrenzt selbst); Spieler ohne Menüknopf: **live bestätigt**; der Pfad "Wert ablehnen" nur Tests |
| L6 Fehlergründe `invalid-request`, `unsupported-version`, `handler-failed`, `internal-error` | die ersten zwei **live bestätigt**; die zwei anderen nur Tests (Gruppe C) |
| L7 Reihenfolge der `init`-Callbacks, deaktivierte Voraussetzung, Erzwingen von `compatibility` | deaktivierte Voraussetzung: Foundry verhindert das Abwählen im Modul-Manager (für diesen Weg beantwortet); Reihenfolge und Erzwingen offen |
| L8 `scope: "user"`-Einstellungen, Stabilität der Nutzer-IDs | Gruppe C (nur beobachtbar) |

**Restrisiken und bewusste Grenzen:**
- Die Nutzeridentität schützt gegen die Fälschung einer **fremden** Identität, nicht gegen einen Nutzer, der sich selbst ausgibt; die Modul-`id` bleibt Vertrauensgrenze (Human Decision 1, M6a).
- Keine Ratenbegrenzung (oben).
- `relationships.systems` fehlt im Manifest mit Absicht: Foundrys Prüfung kann das Modul als nicht verfügbar einstufen, wenn kein angegebenes System installiert ist (nicht live geprüft; braucht einen eigenen Live-Test). Der Wächter meldet das System zur Laufzeit.
- Der Hub-Pfad "ungültigen Wert ablehnen, Feld zurücksetzen, Hinweis zeigen" ist nur durch Tests belegt: Das Zahlenfeld eines Schiebereglers begrenzt einen zu großen Wert selbst (live bestätigt), sodass der Pfad mit einem Regler nicht auszulösen ist.
- `core/manifest-scanner.ts` (Phase 1) ist getestet, aber nirgends angeschlossen; die nächste Phase nutzt oder löscht ihn.
- Die Rechte liegen als Welteinstellung `eagleeye.rights` (JSON-Text) und sind für alle Clients lesbar; Flight Control schreibt sie nur über den Hub der Rolle Spielleiter.

## 5. Empfehlung für die nächste Phase

1. **Frischer DAD-M-Bootstrap**; Eagle Library als erster Verbraucher (Reihenfolge des Plans: Flight Control → Library → Journal/Ruling → Character Edit → Homebrew → Ruling → Roll Out).
2. Beim **ersten modulspezifischen Anfragetyp** die Bindung von Anfragetypen an Module entscheiden (Regel im Vertrag; sie wurde in M6b bewusst bis dahin aufgeschoben).
3. **Typen für andere Repos:** Eine `.d.ts` bringt erst dann etwas, wenn ein zweites Repo sie braucht; bis dahin ist der TypeScript-Block im Vertrag die Referenz.
4. `relationships.systems` und das Erzwingen von `compatibility` bei Bedarf mit einem eigenen Live-Test klären.
5. Die **Nachträge für die gemeinsame Foundry-Referenz** stehen in `cheat-sheet.md` (eingetragen nach Freigabe am 2026-09-20). Neue, tatsächlich wiederverwendete Erkenntnisse der nächsten Phase dort ergänzen.
6. **Release 0.1.0:** vorbereitet und in Forge abgenommen, aber **nicht veröffentlicht** (Release-Entscheidung B, 2026-09-20: vorbereitet lassen, später). Bauen mit `npm run package`; die Checkliste mit den Befehlen steht in `dadm/archive/implementation-phase-4/m8-04-monitor-output.md`. Tag, Push und GitHub-Release nur auf ausdrückliche Anweisung. **Vor einem Push** ist die Datenschutz-Frage zu sechs Dokumenten mit Test-Konto-Namen oder Nutzer-IDs zu entscheiden (`m5-05`, `m6-spike-1-result`, `m6a-05`, `m6b-04`, `m6b-05`, `m7-05`); ob das GitHub-Repo öffentlich ist, ist nicht geprüft.

## 6. Wie in dieser Phase gearbeitet wurde (was sich bewährt hat)

- **Live-Checks führt der Projektleiter selbst aus**, jeweils mit einem fertigen Zip und einer Anleitung mit genauen Konsolenzeilen; seine Konsolenzeilen und Screenshots sind der Beleg.
- **Gegenproben:** Jede neue Prüfung wurde einmal absichtlich gebrochen (eine Stelle im Code, im Vertrag oder im Manifest verstellt), um zu sehen, dass sie anschlägt.
- **Zwei-Client-Simulation** mit dem echten Bundle für alles, was zwei Clients braucht, vor dem Live-Check.
- **Vertrag gegen Code als Test** statt einmal von Hand: Das ist in M8 in `core/api-contract.test.ts` geschehen und hat sofort eine Lücke gefunden (ein Ablehnungstext fehlte im Vertrag).
- Bei Absichts-Unklarheit wurde gestoppt und gefragt; Sicherheits- und Datenschutz-Fragen gingen als Human Decision an den Projektleiter.

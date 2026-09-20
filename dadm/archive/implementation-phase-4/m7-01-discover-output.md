# M7 — DnD-Versionswächter — Discover Output

```
artifact: discover-output
milestone: M7
phase: DISCOVER
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Wahl von Liste, Reaktion oder Abfrage (Aufgabe des Apply). Belege nennen die Fundstelle; was sich ohne Live-Test nicht belegen lässt, steht getrennt.

---

## Input Summary

- `04-milestone-plan-v2.md` (M7, Zeilen 230 bis 243; Rückverfolgung P-FC1 und P-FC6), `01-project-brief.md` (Ziel 5, Entscheidung E1), `eagle-modules-projektplan.md` Abschnitt 3.1 ("DnD-Logik"), Übergaben `m2-02-apply-output.md` (Abschnitt 10) und `m3-02-apply-output.md` (Abschnitt 10), `m6b-04-monitor-output.md` (Übergabe an M7)
- Repo-Ist nach M6b (Code, Tests, `docs/api-contract.md`)
- Foundry-Referenz v13 (`foundry-vtt-reference-v13/types/`, Tag `v13.345.1`): `Game#system`, Paketfelder, Versionsvergleich, Kompatibilitätsangaben
- Analyse bestehender Module (`dadm/reference/source-analysis/README.md`, Abschnitt 4 und K1): wie andere Module dnd5e-Versionen begrenzen
- Kein Web-Abruf, kein Live-Test, kein Code geändert.

---

## Current-State Summary

- M1 bis M6b sind abgeschlossen und live bestätigt (API `0.6.0`, 126 Tests in 15 Dateien). Flight Control kennt heute **keine** Systemversion: Kein Code liest `game.system`, keine Liste getesteter Versionen, kein Hinweis, kein Vertragsteil dazu.
- **Vorgabe (Plan und Spezifikation):** "Flight Control erkennt die Version des DnD-5e-Systems (`game.system.version`) und kennt eine Liste getesteter Versionen; das Verhalten bei nicht getesteter Version ist definiert." P-FC6 gilt **nur im Umfang des Versionswächters**; "weitere Systemlogik kommt mit den Verbrauchern". Acceptance: Vitest für den Versionsvergleich (getestet, ungetestet, kein dnd5e, fehlende Version); die Reaktion im echten Foundry ist `unverified`. Risiko laut Plan `low`.
- **Entscheidungen des Projektleiters:** nur Foundry v13 und die dnd5e-Linie dazu, Testwelt dnd5e 5.3.3 (E1, `01-project-brief.md:59`). Der Vertrag kündigt den Wächter als späteren Teil an (`docs/api-contract.md`, Kopf und Abschnitt 9).
- **Live belegt:** Die Testwelt läuft mit Foundry v13 Stable, Build 351 und dnd5e 5.3.3 (Seitenleiste in den Screenshots vom 2026-09-20, `m6a-05`, `m6b-05`).

---

## Inventory

### Repo-Ist

| Baustein | Ort | Fakt |
|---|---|---|
| Versionslogik | `core/api-version.ts` | `parseVersion` (streng `x.y.z`: kein Präfix, kein Suffix, keine führenden Nullen), `compareVersions`, `isApiCompatible`. Reine Logik mit Tests (8). `EAGLE_API_VERSION` ist die Vertragsversion; laut M2-Übergabe ist der Wächter **davon getrennt** ("Systemversion, nicht Vertragsversion"). |
| Paket-Baustein aus Phase 1 | `core/manifest-scanner.ts` (+2 Tests) | Liest `game.system` (`id`, `title`, `version`, `availability`, `getVersionBadge()`) über einen eingespeisten `PackageScanSource`; **nirgends verdrahtet** (M1: behalten, Vorbedingung vor Nutzung ist ein Eagle-Filter). Der Kommentar nennt den Zugriff "safe only when called after the `ready` hook". |
| Einstieg | `v13/module.ts` | Nur ein `Hooks.once("init", …)`; **kein `ready`- oder `setup`-Hook von Flight Control**. Dort stehen die Verdrahtung von Registry, Kern, Relais, Rechten, API und Hub-Menü sowie die Hilfsfunktion `notify(level, message)` über `ui.notifications`. |
| API | `core/eagle-api.ts` | genau `version`, `registerModule`, `request`, `getRights`, eingefroren. Keine Funktion zur Systemversion. |
| Hub | `v13/hub-application.ts` | ein Tab je Modul; **kein Kopf** mit Systeminformation. `m3-02` Abschnitt 10: "Der Versionswächter kann später im Hub-Kopf angezeigt werden (nicht Teil von M3)". |
| Manifest von Flight Control | `v13/module.json` | `compatibility`: `minimum` 13, `verified` 13; **keine** `relationships.systems`; keine Systemangabe. |
| Vertrag | `docs/api-contract.md` | Kopf: "Later parts (system version guard) will extend the API and raise its version"; Abschnitt 9 nennt den Wächter unter "Not part of this version". |
| Rechte | `core/request-rights.ts` u. a. | Eine lokale Abfrage wie `getRights` braucht kein Recht; sie liest nur den Zustand dieses Clients. Anfragen über `request` laufen durch die Rechteprüfung je Modul und Nutzer. |
| Testmodule | `test-fixtures/eagleeye-dummy-a` bis `-d` | keine Beziehung zu einem System. |

### Spezifikation und Entscheidungen (Projektleiter)

| Quelle | Inhalt |
|---|---|
| Plan v2, M7 | Ziel und Scope wie oben; **Apply legt fest:** Prüfung von `game.system.id`, Form und Ort der Liste getesteter Versionen (Testwelt dnd5e 5.3.3), Reaktion bei ungetesteter oder fehlender Version ("Hinweis, Anfragen sperren o. a."), wie Module die Versionsinfo abfragen. Deliverables: Wächter-Code mit Tests; API-Vertrag Teil 7. |
| `01-project-brief.md` | Ziel 5: "Flight Control erkennt die Version des DnD-Systems und kennt eine Liste getesteter Versionen (M7)." E1: "Nur Foundry v13; dnd5e-Linie zu Foundry 13 (Testwelt 5.3.3)". |
| `eagle-modules-projektplan.md` | "DnD-Logik: Versionswächter über `game.system.version`; Liste getesteter dnd5e-Versionen." Spezifikationsabgleich (Phase 3): "Versionswächter (`game.system.version`) empfohlen". |
| Linsen (Plan v2) | Flight Control bleibt schmal und generisch (N4); nur Foundry v13; sichtbare Texte Englisch; Änderungen an Foundry-Daten nur über Flight Control. |
| Safety Boundaries und Scope (`02`, `03`) | keine Dependency-Änderung; Live-Test nur mit Freigabe je Test; Schreibzugriff nur `core/`, `v13/`, `test-fixtures/`, `docs/`, `dadm/`. |

### Foundry-Fakten (Types v13.345.1; Pfade relativ zu `foundry-vtt-reference-v13/types/src/foundry/`; Nummerierung setzt `m6b-01` fort)

| # | Fakt | Fundstelle |
|---|---|---|
| FF18 | `Game#system` ist `readonly system: foundry.packages.System` ("The System which is used to power this game World"). `System#id` ist ein Text, `System#version` ein Text (`required: true`, `blank: false`, **`initial: "0"`**). Ein System ohne Versionsangabe hätte also `"0"`. | `client/game.d.mts:74`; `client/packages/system.d.mts:17`, `:78` |
| FF19 | `Game#release` (`ReleaseData`) und `Game#version` (Text wie `"13.351"`, "usable for comparisons using isNewerVersion") beschreiben die Foundry-Version, nicht das System. | `client/game.d.mts:204-209`; `common/config.d.mts:281-300` |
| FF20 | `foundry.utils.isNewerVersion(v1, v0)`: "Supports either numeric or string version comparison with version parts separated by periods." Ob eine Nachsilbe wie `-rc.1` unterstützt wird, sagt die Referenz nicht. | `common/utils/helpers.d.mts:390-397` |
| FF21 | Pakete deklarieren Kompatibilität mit `compatibility: { minimum, verified, maximum }` ("The Package will not function before / after this version"). Ein Modul kann in `relationships.systems` Systeme nennen; `BasePackage#_testSupportedSystems` prüft "all supported systems which are currently installed … or if the package has no supported systems", **false**, "if no supported systems are installed". Foundry wendet das selbst bei der Verfügbarkeit von Paketen an. | `common/packages/base-package.d.mts:163-178`, `:184`, `:609-616` |
| FF22 | `Game#system` und `Game#modules` sind als `readonly`-Eigenschaften von `game` deklariert. Die Referenz vermerkt bei vielen Eigenschaften den Zeitpunkt der Befüllung (`game.users`: "Initialized just before the `setup` hook"), bei `system` und `modules` keinen. | `client/game.d.mts:66-80`, `:196-199` |

### Ökosystem (aus der Analyse bestehender Module, `source-analysis/README.md`)

| Fakt | Beleg |
|---|---|
| Andere Module begrenzen dnd5e **nach Nebenversion**: Midi-QOL "5.2.0 – 5.3.99", Ready Set Roll "5.0.0 (verif. 5.0.4)", Statblock Importer "4.3 – 5.999 (verif. 5.3.0)". Die Grenze `5.3.99` steht für "jede Ausgabe der Linie 5.3". | Abschnitt 4, Tabelle (Zeilen 41 bis 50) |
| Das Ökosystem ist zwischen Foundry v13/v14 und dnd5e 5.x/6.x zweigeteilt; in der eigenen Forge-Testwelt lief dnd5e 5.3.3 auf v13 und v14. | K1 (Zeilen 69 bis 76) |
| dnd5e macht seine Interna bewusst öffentlich (`game.dnd5e`, `CONFIG.DND5E`); "erst prüfen, was dnd5e schon öffentlich anbietet". | K2 |

### Nicht ohne Live-Test belegbar

| # | Offener Punkt | Warum es zählt |
|---|---|---|
| U1 | Ob `game.system.id` in der Testwelt genau `"dnd5e"` ist. Die Referenz typisiert `id` nur als Text. | Grundlage der Prüfung "ist es dnd5e?" |
| U2 | Das genaue Textformat von `game.system.version` in der Testwelt (die Seitenleiste zeigt `5.3.3`); ob Nachsilben vorkommen (Vorabversionen). | Ob der strenge Parser `x.y.z` reicht (FF18, FF20). |
| U3 | Ab wann `game.system.version` gefüllt ist (`init`, `setup`, `ready`); der Phase-1-Kommentar nennt nur "nach `ready` garantiert". | Wann Flight Control lesen und melden kann. |
| U4 | Wie `ui.notifications.warn` beim GM zum Zeitpunkt `ready` aussieht (das Werkzeug ist im Hub im Einsatz, der Zeitpunkt `ready` nicht). | Form einer Reaktion "Hinweis". |
| U5 | Die Reaktion bei einer **ungetesteten** oder **fremden** Systemversion ist in der Testwelt nicht auslösbar, solange dort nur dnd5e 5.3.3 läuft. | Nur der Pfad "getestet" ist live zeigbar (Plan: Reaktion `unverified`). |

---

## Dependencies

- **Code:** M2 (Registry, Vertrag), `core/api-version.ts` (Versionslogik), `v13/module.ts` (Einstieg und `notify`), M6b (Rechte, `getRights` als Vorbild einer lokalen Abfrage). Der Vertrag bekommt Teil 7 und eine neue API-Version (nach der bisherigen Praxis `0.7.0`).
- **Foundry:** `game.system` (`id`, `version`), gegebenenfalls `ui.notifications` und ein `ready`-Hook. Keine neue Fremdmodul-Abhängigkeit, keine Änderung an `package.json` (kein Human-Decision-Trigger 4).
- **Tests:** Vitest für die reine Auswertung mit eingespeister Systemquelle (K1 bis K4); die Foundry-Hülle bleibt dünn.
- **Live-Prüfung:** GM (und ein Spieler, wenn der Hinweis auch Spieler betrifft); in der Testwelt nur der Pfad "getestet" (U5). Freigabe je Test, der Projektleiter führt sie aus.
- **Entscheidungen des Projektleiters:** die Punkte, die das Apply als T-Punkte zum "Go" vorlegt.

---

## Risks and Assumptions

| # | Risiko | Severity | Blocking |
|---|---|---|---|
| R1 | **Zu strenge Reaktion:** Ein Wächter, der Anfragen sperrt, sobald das System eine nicht gelistete Version hat, könnte nach einer gewöhnlichen dnd5e-Aktualisierung alle Eagle Module lahmlegen, bis Flight Control nachzieht (Forge-Betreiber aktualisieren Systeme selbst). Die Wahl der Reaktion liegt im Apply. | `low` | no |
| R2 | **Zu grober Maßstab:** Zählt nur die Ausgabe der Liste als getestet, meldet jede Patch-Ausgabe von dnd5e "ungetestet" (störend); zählt jede Ausgabe einer getesteten Linie als getestet, kann ein Patch etwas brechen, das nur die Nebenversion getestet hat. Andere Module wählen die Linie (Ökosystem-Tabelle). | `low` | no |
| R3 | Die Prüfung stützt sich auf `game.system.id` und `game.system.version` als Text; ein System ohne Version hat `"0"` (FF18), eine Vorabversion könnte eine Nachsilbe tragen (U2). Wer den Text nicht lesen kann, muss einen Zustand "unbekannt" haben (kein Absturz). | `low` | no |
| R4 | Die Reaktion für ungetestete und fremde Versionen ist live nicht zeigbar (U5); sie bleibt `unverified` (laut Plan angenommen). | `low` | no |
| R5 | Umfang: P-FC6 gilt nur für den Versionswächter; jede weitere Systemlogik (Regeln, Datenmodell) wäre Scope-Erweiterung und ein Fall für einen späteren Milestone. | `low` | no |
| R6 | Datenschutz und Sicherheit: Systemkennung und -version sind allen Nutzern der Welt sichtbar; eine lokale Abfrage gibt nichts preis, was ein Spieler nicht ohnehin sieht. Kein Rechte-Fund. | `info` | no |
| A1 | **Annahme:** `game.system.id` ist in der Testwelt `"dnd5e"` (U1). | `low` | no |
| A2 | **Annahme:** `game.system.version` ist zur Zeit von `ready` gefüllt und hat die Form `x.y.z` (U2, U3). | `low` | no |

`critical` liegt nicht vor; kein Fund ist `medium` oder höher.

---

## Open Questions

**Für das Apply (Design; was den Projektleiter betrifft, kommt als T-Punkt zum "Go"):**

1. **Was heißt "getestet"?** Nur genau gelistete Versionen (Testwelt 5.3.3), oder jede Ausgabe einer getesteten Linie (wie Midi-QOL "5.3.99")? Welche Zustände gibt es (getestet, ungetestet, anderes System, unbekannt)?
2. **Form und Ort der Liste:** Konstante im Code (mit dem Release gepflegt) oder eine Einstellung? Wer ergänzt sie, und wann (nach einem Live-Test, mit M8)?
3. **Reaktion je Zustand:** Hinweis (an wen, wann, wie oft, in welcher Form), Eintrag im Log, Sperren von Anfragen (welchen, für wen) oder nichts. Was gilt bei einem anderen System als dnd5e, und was bei unlesbarer Version (R1, R3)?
4. **Abfrage durch Module:** Form und Name der Funktion (etwa lokale Abfrage wie `getRights`), Rückgabe (Kennung, Version, Zustand, Liste), Fehlerfälle; Auswirkung auf die API-Version und den Vertrag Teil 7.
5. **Anzeige im Hub:** eine Zeile im Kopf (M3-Übergabe) oder nur der Hinweis? (Neue DOM-Erzeugung ist nur live prüfbar.)
6. **Manifest:** Soll `relationships.systems` mit einer `compatibility`-Spanne in `v13/module.json` stehen (FF21), oder bleibt das Foundrys eigene Prüfung außen vor? (Berührt das Paketieren, M8.)
7. **Zeitpunkt:** Wann liest der Wächter das System (`ready`, oder bei jeder Abfrage neu), und braucht Flight Control dafür einen eigenen `ready`-Hook?
8. **Live-Prüfung:** Was lässt sich in der Testwelt zeigen (Pfad "getestet", `game.system.id`, Format der Version) und wie wird der Rest gezeigt oder ausdrücklich als `unverified` angenommen (U5)?

**Praktisch (Live-Check):** Eine Konsole des GM genügt für `game.system.id` und `game.system.version`; ein Spieler nur, wenn der Hinweis auch Spieler betreffen soll.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m7-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

Apply (M7), eigenständig: Zielarchitektur, Zustände und Vergleich, Form der Liste, Reaktion je Zustand, Abfrage durch Module, Vertrag Teil 7, Testplan und Akzeptanzkriterien, Sicherheitsbetrachtung. Der Deploy wartet auf das "Go".

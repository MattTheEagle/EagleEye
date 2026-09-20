# M7 — DnD-Versionswächter — Deploy Output

```
artifact: deploy-output
milestone: M7
phase: DEPLOY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- **"Go" des Projektleiters (2026-09-20):** "Go — T1–T8 wie vorgeschlagen (Recommended)". Alle Risiken des Apply sind `low`, es war nichts anzunehmen. Dazu die Freigabe für einen lokalen Commit ohne Push: die M7-Dokumente sind als `7fc0280` committet, **vor** dem Deploy.
- Design: `m7-02-apply-output.md` (Abschnitt 11 Deploy-Reihenfolge, Testplan P1 bis P9, Akzeptanzkriterien AC-M7-01 bis AC-M7-07). Fakten: `m7-01-discover-output.md`.
- Kein Live-Test durch mich, kein Commit des Deploy-Stands, kein Push.

---

## Implementation Summary

Der Versionswächter ist umgesetzt, in der Reihenfolge des Apply. **Er meldet und sperrt nichts.**

1. **`core/system-guard.ts` (neu, 136 Zeilen):** `SUPPORTED_SYSTEM_ID = "dnd5e"`, `TESTED_SYSTEM_VERSIONS = ["5.3.3"]` (eingefroren), die fünf Zustände `tested`, `same-line`, `untested`, `other-system`, `unknown`, `evaluateSystem` (die Auswertung in der Reihenfolge des Apply: Kennung, fremdes System, Format `x.y.z`, Liste, gleiche Linie), `noticeFor` (nur für `untested`, `other-system`, `unknown`) und `announceSystem` (eine Log-Zeile immer, ein Hinweis nur mit GM-Rolle). Nichts davon wirft; Ergebnisse und die Liste in der Antwort sind eingefroren.
2. **`core/api-version.ts`, `core/eagle-api.ts`:** API `0.7.0`; `getSystemInfo()` als fünftes Mitglied (`{ ok: true, value: { id, version, status, testedVersions } }` oder `internal-error`), wertet bei jedem Aufruf neu aus, ohne Recht.
3. **Foundry-Hülle:** `v13/system.ts` (neu, 9 Zeilen: liest `game.system?.id` und `game.system?.version`); `v13/module.ts` (ein `ready`-Hook meldet einmal je Sitzung, `getSystemInfo` verdrahtet); `v13/lang/en.json` (drei Hinweistexte).
4. **Testmodule:** Dummy a und d melden sich mit `0.7.0` an; Dummy a gibt `system: <Zustand> <Kennung> <Version>` aus.
5. **`docs/api-contract.md`:** Teil 7 ("The game system") als Unterabschnitt am Ende von Abschnitt 4, **ohne Umnummerierung**; Kopf, Abschnitt 1 (fünf Mitglieder, TypeScript), Abschnitt 8 (Teil 7 unter "not verified"), Abschnitt 9 ("Not part": der Wächter entfällt) und die Historie (`0.7.0`) sind angepasst.

---

## Files Changed

| Datei | Änderung |
|---|---|
| `core/system-guard.ts`, `v13/system.ts` | **neu** |
| `core/system-guard.test.ts` | **neu** (7 Tests) |
| `core/eagle-api.ts` (+`.test.ts`, 3 neue Tests, 1 angepasst), `core/api-version.ts` (+`.test.ts`, 1 angepasst) | geändert |
| `v13/module.ts`, `v13/lang/en.json` | geändert |
| `test-fixtures/eagleeye-dummy-a/` und `-d/` (`module.js`, `module.json`) | geändert |
| `docs/api-contract.md` | geändert |

Insgesamt 11 geänderte und 3 neue Dateien (ohne die Nachweise und Pakete): 175 Zeilen hinzugefügt, 25 entfernt in den geänderten; 354 Zeilen in den neuen Dateien.

**Nachweislich unverändert** (`git diff` gegen `HEAD` ist leer): `core/request-kernel.ts`, `core/request-relay.ts`, `core/request-rights.ts`, `core/request-identity.ts`, `core/request-handlers.ts`, `core/rights-hub.ts`, `core/rights-table.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/hub-model.ts`, `core/json-value.ts`, `core/manifest-scanner.ts`, `v13/hub-application.ts`, `v13/relay.ts`, `v13/rights.ts`, `v13/tsconfig.json`, `package.json`, `package-lock.json`.

---

## Proofs

| Nachweis | Ergebnis |
|---|---|
| `npm run typecheck` (einmal, am Ende) | Exit 0 |
| `npm test` | **136 Tests in 16 Dateien**, alle grün (vorher 126 in 15; 10 neu: `system-guard` 7, `eagle-api` +3; angepasst: die Oberfläche der API, die Versionsnummer) |
| `npm run build` | `v13/dist/module.js` 55,1 kB (vorher 51,6 kB) |
| Verbotene Muster (`innerHTML`, `libWrapper`, `socketlib`, `game.socket`) | keine im Bundle, keine in `core/` und `v13/` |
| Skriptprüfung Vertrag gegen Code (`check-m7-contract.mjs`) | 28 Prüfungen ok: API-Version, Kompatibilitätstabelle, Fehlercodes (11 = 11 = 11), Grenzen, unverändert drei Anfragetypen, Zustände (Code = Tabelle = TypeScript-Block), Liste getesteter Versionen, Kennung, fünf API-Mitglieder, Fehlergründe von `getSystemInfo`, Hinweisschlüssel in der Sprachdatei, Log-Zeile, `ready`-Hook, Abschnittsnummern unverändert |
| Fixtures | `node --check` und JSON-Prüfung für alle vier Testmodule ok |
| **Gegenproben der Logik** (`mutate-m7.mjs`) | **24 von 24 gefunden** (Auswertung: unlesbare Kennung, fremdes System, Format der Version, gelistete Version, Nebenversion, Hauptversion, Vergleich als Text, werfende Quelle, geteilte oder nicht eingefrorene Liste, nicht eingefrorene Antwort, falsche Liste oder Kennung; Hinweis: `same-line` mit Hinweis, Liste und Kennung im Text fehlen, Spieler bekommt den Hinweis, falsche Stufe im Log, Rohwerte fehlen, werfendes Log und werfender Hinweis brechen den Aufrufer; API: Fehler nicht gefangen, erste Antwort für immer, Funktion fehlt) |
| **Gegenproben der Hülle** (`mutate-m7-shell.mjs`, gegen die Simulation) | **7 von 8 gefunden** (`ready`-Hook fehlt, alle als GM behandelt, keiner als GM behandelt, Hinweis nicht gezeigt, Kennung und Version aus dem falschen Feld, `getSystemInfo` nicht verdrahtet). Nicht gefunden: der Fehler im `catch` des `ready`-Hooks (H8), ein **äquivalenter Fehler**: `announceSystem` wirft nie (getestet), der `catch` im Hook ist eine zusätzliche Absicherung ohne sichtbare Wirkung. |
| **Zwei-Client-Simulation** (`sim-m7.mjs`) mit dem echten Bundle und den echten Testmodulen: GM, Assistent, Spieler | alle Prüfungen ok: (S1) Standard: dnd5e 5.3.3 `tested`, Log-Zeile als Info, kein Hinweis, Dummy A `system: tested dnd5e 5.3.3`, `getSystemInfo` mit Liste, Antwort eingefroren und die Liste nicht veränderbar, jedes Mal ein neues Objekt, genau fünf API-Mitglieder und `0.7.0`, bisheriges Verhalten (Rechte) unverändert; (S2 bis S5) mit denselben gepatchten Bundles wie die Prüfpakete: `same-line` (Info, kein Hinweis), `untested` (Warnung, **ein** Hinweis bei GM und Assistent, keiner beim Spieler, Text mit Version und Liste), `other-system` (Hinweis mit der Kennung), `unknown` (Hinweis, Rohwerte im Log); jeweils `getSystemInfo` und Dummy A zeigen den Zustand, nichts wird gesperrt; (S6) `game.system` fehlt, Kennung und Version fehlen, Lesen wirft: kein Absturz, `unknown`, ein Hinweis nur beim GM, Rohwerte im Log, die übrige API läuft weiter; (S7) ein Hinweis, der wirft, bricht den Start nicht ab |
| Live-Check-Pakete (`v13/dist/live-check/`, gitignoriert) | `eagleeye-v13-m7.zip` (Standard; Bundle, Sprachdatei und Manifest **byte-gleich** mit dem Repo), vier Prüfpakete `eagleeye-v13-m7-check-same-line.zip`, `-untested.zip`, `-other-system.zip`, `-unknown.zip` (jedes unterscheidet sich vom Standardbundle in **genau einer Zeile**, dem gelesenen Wert), `eagleeye-dummy-a.zip` bis `-d.zip` (a und d byte-gleich mit dem Repo); das alte Paket `eagleeye-v13-m6b.zip` ist entfernt (die Dummys mit `0.7.0` würden sich mit ihm nicht anmelden) |

---

## Acceptance Checklist

| # | Kriterium | Stand |
|---|---|---|
| AC-M7-01 | Auswertung nach Abschnitt 4, wirft nie | **erfüllt** (P1 bis P4, Gegenproben S1 bis S13) |
| AC-M7-02 | `noticeFor` und `announceSystem`: höchstens ein Hinweis, nur GM-Rolle, nur bei `untested`, `other-system`, `unknown`; immer eine Log-Zeile; nie eine Ausnahme; nichts gesperrt | **erfüllt** (P5, P6, Gegenproben N1 bis N8; Simulation) |
| AC-M7-03 | `api.getSystemInfo()` wie beschrieben, fünf Mitglieder, `0.7.0` | **erfüllt** (P7, P8, Gegenproben A1 bis A3; Simulation) |
| AC-M7-04 | `ready`-Hook, `getSystemInfo` verdrahtet, Hinweistexte in `v13/lang/en.json`, `typecheck` Exit 0 | **erfüllt** (Simulation, Gegenproben H1 bis H7, P9 durch den Sprachschlüssel-Test) |
| AC-M7-05 | Vertrag Teil 7 (Englisch) ohne Umnummerierung, Kopf, "Not part", Historie; Skript prüft gegen den Code | **erfüllt** (28 Prüfungen ok) |
| AC-M7-06 | Alle Tests bestehen; nicht anzufassende Dateien unverändert; keine verbotenen Muster; keine neue Dependency | **erfüllt** (136 Tests, `git diff` leer, 0 Treffer, `package.json` und Lock unverändert) |
| AC-M7-07 | **Live** (GM): `game.system.id` `dnd5e`, `game.system.version` `5.3.3`, Standardpaket `tested` ohne Hinweis; Prüfpakete: `same-line` ohne Hinweis, `untested`, `other-system` und `unknown` mit einem Hinweis beim GM und keinem beim Spieler | **unverified**, Anleitung im Monitor |

---

## Risks and Assumptions

| # | Risiko oder Annahme | Severity |
|---|---|---|
| R2 | `same-line` ist "nicht getestet, aber auf der getesteten Linie" und löst keinen Hinweis aus; ein Patch kann dennoch etwas brechen. Module lesen den Zustand und dürfen strenger sein. | `low` |
| R3 | Ein Vorabformat der Version (`5.4.0-rc.1`) ergibt `unknown` und damit einen Hinweis, obwohl das System lesbar ist. | `low` |
| R4 | Die Reaktion ist nur mit den Prüfpaketen live zu zeigen, die den gelesenen Wert ändern; ein wirklich ungetestetes System ist in der Testwelt nicht auslösbar. Laut Plan `unverified` angenommen. | `low` |
| R5 | Der `ready`-Hook ist der erste von Flight Control; die Reihenfolge zu anderen `ready`-Hooks ist ohne Bedeutung (die Abfrage liest bei jedem Aufruf neu). | `low` |
| A1 | **Annahme:** `game.system.id` ist `dnd5e` und `game.system.version` zur Zeit von `ready` gefüllt und `x.y.z`; der Live-Check zeigt es. | `low` |

Kein neues `medium+`-Risiko, keine Dependency-Änderung, keine Human-Decision-Trigger.

---

## Decision Log (Klärungen gegenüber dem Apply, keine Änderung des Designs)

1. **Vier Prüfpakete statt drei, und sie ändern den gelesenen Wert statt der Liste.** Der Apply nannte drei Pakete mit geänderter Liste oder Kennung. Umgesetzt sind vier (`same-line`, `untested`, `other-system`, `unknown`), und jedes lässt den Wächter einen **anderen Wert lesen** (Version `5.3.4`, `5.4.0`, `5.3.3-rc.1` oder Kennung `pf2e`), statt die Liste zu ändern. Damit lauten die Hinweise wie beim echten Fall ("has not been tested with D&D 5e 5.4.0"), und auch `unknown` ist live zeigbar (im Apply nur durch Tests belegt). Die Pakete sind gitignoriert und in genau einer Zeile vom Repo-Stand verschieden.
2. **Die Liste ist eingefroren, die Antwort ist eingefroren, `testedVersions` ist eine Kopie.** Der Apply nannte "eine Konstante"; weil `getSystemInfo` die Liste an Module gibt, könnte sonst ein Modul mit `push` die getestete Liste des Wächters ändern. Getestet (P4) und in der Simulation gezeigt.
3. **Die Log-Zeile nennt bei `unknown` die Rohwerte** (`id "dnd5e", version "5.3.3-rc.1"`), damit der Grund sichtbar ist (Discover U2); im Apply stand nur "eine Log-Zeile".
4. **`createEagleApi` bekommt einen fünften Parameter** `systemInfo` (Standard: `unknown` mit leerer Liste), wie bei `getRights` der vierte.
5. **Der `catch` im `ready`-Hook** ist eine zusätzliche Absicherung (`announceSystem` wirft nie); die Gegenprobe H8 ist deshalb äquivalent.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m7-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete in `v13/dist/live-check/` (Standardpaket, vier Prüfpakete, Dummys a bis d; das Spike-Paket liegt weiter dabei und bleibt deaktiviert) | ephemeral |
| Prüfskripte im Scratchpad (`check-m7-contract.mjs`, `mutate-m7.mjs`, `mutate-m7-shell.mjs`, `sim-m7.mjs`, `variants-m7.mjs`, `build-m7-packages.mjs`) | ephemeral, nicht Teil des Repos |

Der Deploy-Stand ist **nicht committet**; der letzte Commit ist `7fc0280` (Dokumentation).

---

## Next Step

Monitor M7 ohne Stopp (Working Mode): Abgleich Acceptance gegen diesen Output, Regressionen, Restrisiken, Liste der `unverified`-Punkte und die Anleitung für den Live-Check (Standardpaket, optional die vier Prüfpakete).

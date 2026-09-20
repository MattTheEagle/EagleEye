# M6b — Nutzungsrechte je Modul und Nutzer — Deploy Output

```
artifact: deploy-output
milestone: M6b
phase: DEPLOY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- **"Go" des Projektleiters (2026-09-20):** "Go — R1–R3 angenommen, T1–T9 wie vorgeschlagen (Recommended)". Dazu die Wahl **B** bei Nacharbeit 3: der Rahmen entfällt mit dem Titel. Zusätzlich die Freigabe für einen lokalen Commit ohne Push: der Dokumentations-Stand ist als `74578d4` committet, **vor** dem Deploy.
- Design: `m6b-02-apply-output.md` (Abschnitt 11 Deploy-Reihenfolge, Testplan P1 bis P26, Akzeptanzkriterien AC-M6b-01 bis AC-M6b-12). Fakten: `m6b-01-discover-output.md`. Nacharbeit: `m3-rework-3-output.md`.
- Kein Live-Test durch mich, kein Commit des Deploy-Stands, kein Push.

---

## Implementation Summary

Die Rechte je Modul und Nutzer sind umgesetzt, in der Reihenfolge des Apply.

1. **`core/rights-table.ts` (neu, 96 Zeilen):** die Tabelle als Daten (`RightsLevel`, `RightsTable`, `parseRightsTable`, `serializeRightsTable`, `levelOf`, `withLevel`). Alles, was aus dem gespeicherten Text kommt, wird geprüft; ein ungültiger Text ist ein Fehler, nie eine halbe Tabelle. Modul- und Nutzer-IDs zählen nur als eigene Eigenschaft (`hasOwnProperty`), Tabellen entstehen über `Object.fromEntries` (eine ID wie `__proto__` ändert keinen Prototyp).
2. **`core/request-kernel.ts`:** `RequestHandler.targets`, `RightsCheck`, `RightsVerdict`, `RightsGate`, `KernelOptions.rights`; Schritt 5b zwischen Datenprüfung und Ausführung. Nutzer für die Prüfung ist `executeOptions.user` (bestätigt) vor `currentUser`. Jede Antwort des Gates außer genau `{ ok: true }`, jede Ausnahme und jede Ablehnung ist `not-permitted`; `targets` mit Ausnahme oder ohne Liste von UUID-Texten ist `handler-failed`; in keinem dieser Fälle läuft der Handler.
3. **`core/request-rights.ts` (neu, 108 Zeilen):** `createRightsGate` (die Regel in der Reihenfolge des Apply, jede Ausnahme wird zur Ablehnung, ein Hinweis im Log höchstens einmal, bis die Ablage wieder lesbar ist), `effectiveLevel` (für `getRights`), `REFUSE_ALL` (Ersatz, wenn die Rechte nicht aufgebaut werden können).
4. **`core/request-handlers.ts`:** `flightcontrol.targetping` (Version 1, `runsOn "gm"`, Nutzlast `{ uuid }` bis 200 Zeichen, nennt die UUID als Ziel, antwortet mit `{ apiVersion, module, uuid, askedBy }`); die Liste hat genau drei Typen. **`core/api-version.ts`:** `0.6.0`.
5. **`core/eagle-api.ts`:** `getRights(moduleId)` mit `RightsQueryResult` und `RightsSource`; die API hat vier Mitglieder.
6. **`core/rights-hub.ts` (neu, 103 Zeilen):** `listRights` (nur Spieler, wirksame Stufe, "unlesbar") und `applyRightsInput` (Rolle, Modul, Nutzer, Stufe; nie eine Ablehnung).
7. **`core/request-relay.ts` bleibt unverändert;** nur seine Tests haben zwei Fälle mit echtem Kern und Gate dazubekommen.
8. **Foundry-Hülle:** `v13/rights.ts` (neu, 60 Zeilen: Einstellung `eagleeye.rights` als Welteinstellung, `config: false`, `type: String`; Umgebung mit `game.settings`, `game.users`, `foundry.utils.fromUuid` und `testUserPermission(user, "OWNER")`; Hub-Quelle mit der Rolle GAMEMASTER); `v13/module.ts` (Einstellung registrieren, Gate in den Kern, bei Ausfall `REFUSE_ALL`, `getRights` verdrahtet, Hub bekommt die Quelle); `v13/hub-application.ts` (Rechte-Block je Tab nur für die Rolle GAMEMASTER, Schreiben nacheinander in einer Warteschlange; **Nacharbeit 3, Variante B: weder Titel noch Rahmen um den Modul-Tab**, der Inhalt steht direkt in `section.tab`); `v13/lang/en.json` (Texte des Rechte-Blocks und der Meldungen).
9. **Testmodule:** Dummy a und d melden sich mit `0.6.0` an; Dummy a gibt zusätzlich `rights: <Stufe>` aus.
10. **`docs/api-contract.md`:** Teil 6 ("Rights per module and user"), `getRights`, `flightcontrol.targetping`, Abschnitte 1, 3, 4, 8, 9, 10 und die Beispiele auf `0.6.0`. Der UI-Leitfaden wird nach dem Live-Check nachgeführt.

---

## Files Changed

| Datei | Änderung |
|---|---|
| `core/rights-table.ts`, `core/request-rights.ts`, `core/rights-hub.ts`, `v13/rights.ts` | **neu** |
| `core/rights-table.test.ts`, `core/request-rights.test.ts`, `core/rights-hub.test.ts` | **neu** (9, 10 und 7 Tests) |
| `core/request-kernel.ts` (+`.test.ts`, 6 neue Tests), `core/request-handlers.ts` (+`.test.ts`, 2 neue Tests, 1 angepasst), `core/eagle-api.ts` (+`.test.ts`, 3 neue Tests, 1 angepasst), `core/api-version.ts` (+`.test.ts`, 1 angepasst), `core/request-relay.test.ts` (2 neue Tests) | geändert |
| `v13/module.ts`, `v13/hub-application.ts`, `v13/lang/en.json` | geändert |
| `test-fixtures/eagleeye-dummy-a/` und `-d/` (`module.js`, `module.json`) | geändert |
| `docs/api-contract.md` | geändert |

Insgesamt 17 geänderte und 7 neue Dateien (ohne die Nachweise unten und die Pakete): 664 Zeilen hinzugefügt, 63 entfernt in den geänderten, 906 Zeilen in den neuen Dateien.

**Nachweislich unverändert:** `core/request-relay.ts`, `core/request-identity.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/hub-model.ts`, `core/json-value.ts`, `core/manifest-scanner.ts`, `v13/relay.ts`, `v13/tsconfig.json`, `package.json`, `package-lock.json` (`git diff` gegen `HEAD` ist leer).

---

## Proofs

| Nachweis | Ergebnis |
|---|---|
| `npm run typecheck` (einmal, am Ende) | Exit 0 |
| `npm test` | **126 Tests in 15 Dateien**, alle grün (vorher 87 in 12; 39 neu: `rights-table` 9, `request-rights` 10, `rights-hub` 7, `request-kernel` +6, `request-relay` +2, `eagle-api` +3, `request-handlers` +2; angepasst: die Liste der Anfragetypen, die Oberfläche der API, die Versionsnummer) |
| `npm run build` | `v13/dist/module.js` 51,6 kB (vorher 37,5 kB); Neuaufbau ergibt dieselbe Prüfsumme |
| Verbotene Muster (`innerHTML`, `libWrapper`, `socketlib`, `game.socket`) | keine im Bundle, keine in `core/` und `v13/` |
| Skriptprüfung Vertrag gegen Code (`check-m6b-contract.mjs`) | 36 Prüfungen ok: API-Version, Kompatibilitätstabelle, Fehlercodes (11 = 11 = 11), Grenzen, drei Anfragetypen, Ergebnisform von `targetping`, Stufen, fünf Ablehnungstexte in Vertrag und Code, vier API-Mitglieder, Gründe von `getRights`, Beispiele auf `0.6.0`, Historie, Sprachschlüssel |
| Fixtures | `node --check` und JSON-Prüfung für alle vier Testmodule ok |
| **Gegenproben** (`mutate-m6b.mjs`): ein gezielter Fehler je Prüfung | **35 von 35 gefunden**, keine übersprungen (Kern: Urteil ignorieren, lokaler statt bestätigter Nutzer, Antwort außer `{ ok: true }` gilt als Ja, Ausnahme des Gates lässt laufen, Ziele nicht übergeben, leeres Ziel oder Nicht-Liste zulassen; Gate: GM nicht erkennen, unbekannter Nutzer als Spieler, unlesbare Ablage erlaubt alles, Modul ohne Eintrag nicht verweigert, `own` erlaubt jedes Ziel, unauffindbar gilt als eigen, nur das erste Ziel, `all` verlangt Besitz, Warnung jedes Mal oder nie wieder; Tabelle: Version, `denied` gespeichert, unbekannte Nutzer bleiben, leeres Modul bleibt; Hub: Rolle, Modul, Nutzer, Stufe nicht geprüft, unlesbare Ablage überschrieben, Anzeige `own` bei unlesbar; API und Handler: nicht angemeldetes Modul, Quelle ignoriert, Ziel nicht genannt, falscher Ausführungsort, zu lange UUID; Relais: bestätigter Nutzer erreicht den Kern nicht) |
| **Zwei-Client-Simulation** (`sim-m6b.mjs`) mit dem echten Bundle, den echten Testmodulen und dem echten Hub-Schreibweg (`core/rights-hub.ts` und `v13/rights.ts` als eigenes Bündel im selben Nachbau): ein GM, ein Assistent, drei Spieler | 7 Szenarien, alle Prüfungen ok: (S1) GM allein `rights: all`, alles `ok`, Einstellung als Welt, `config: false`, Text; (S2) Spieler ohne Freigabe `denied`, `ping` und `gmping` `not-permitted` mit dem Grund, der GM warnt einmal, die Rückfrage lief vor der Rechteprüfung; (S3) Freigabe `own` über den Hub-Weg: `ping` und `gmping` `ok`, `targetping` eigen `ok`, fremd und nicht auffindbar `not-permitted` mit demselben Text, gemeinsam besessen `ok`, `all` erlaubt fremd und nicht auffindbar, wieder `denied` entfernt den Eintrag; (S4) Assistent `all` ohne Eintrag, Schreiben durch den Assistenten `not-permitted`, Stufen je Modul und Nutzer, Hub-Liste nur Spieler; (S5) beschädigte Ablage: Spieler verweigert, GM erlaubt, eine Warnung, Schreiben ersetzt sie, eine unbekannte Stufe macht alles unlesbar; (S6) Ausfall der Registrierung: alles `not-permitted`, auch für den GM, `getRights` `denied`, Fehler im Log; (S7) gefälschte Angabe eines erlaubten Nutzers weiter `not-permitted` ("could not be confirmed"), `getRights`-Fehlerfälle, API mit genau vier Mitgliedern und `0.6.0`, Dummy D unverändert (`unknown-request`, `invalid-payload`), auch für einen Spieler ohne Freigabe |
| Live-Check-Pakete (`v13/dist/live-check/`, gitignoriert) | `eagleeye-v13-m6b.zip` (`module.json`, `dist/module.js`, `lang/en.json`), `eagleeye-dummy-a.zip`, `-b.zip`, `-c.zip`, `-d.zip`; Bundle, Sprachdatei, Manifest und `module.js` von a und d byte-gleich mit dem Repo; das alte Paket `eagleeye-v13-m6a.zip` ist entfernt (Dummys mit `0.6.0` würden sich mit ihm nicht anmelden lassen) |

---

## Acceptance Checklist

| # | Kriterium | Stand |
|---|---|---|
| AC-M6b-01 | Tabelle lesen und schreiben, feindliche Schlüssel, ungültige Stufen | **erfüllt** (P1 bis P4, Gegenproben T1 bis T5) |
| AC-M6b-02 | Gate nach Abschnitt 4: GM und Assistent immer, sonst fail closed, `own` und `all`, Besitzprüfung nur wo nötig | **erfüllt** (P5 bis P12, Gegenproben G1 bis G11) |
| AC-M6b-03 | Kern: Prüfung nach der Datenprüfung, vor der Ausführung, bestätigter Nutzer vor `currentUser`, Ausnahmen führen nie zur Ausführung | **erfüllt** (P13 bis P18, Gegenproben K1 bis K7) |
| AC-M6b-04 | `flightcontrol.targetping` genau einmal, beim GM, nennt sein Ziel, gibt nur `uuid` und `askedBy` zurück, Liste bewacht | **erfüllt** (P19, P20, Gegenproben D1 bis D3) |
| AC-M6b-05 | Relais: bestätigter Nutzer wird beim GM nach den Rechten geprüft; `core/request-relay.ts` unverändert | **erfüllt** (P21, Gegenprobe R1, `git diff` leer) |
| AC-M6b-06 | `listRights` und `applyRightsInput` nach Vorgabe | **erfüllt** (P22 bis P24, Gegenproben U1 bis U6; in der Simulation über die echte Hub-Quelle) |
| AC-M6b-07 | `api.getRights`, vier API-Mitglieder, `0.6.0` | **erfüllt** (P25, P26, Gegenproben A1, A2; Simulation S1, S7) |
| AC-M6b-08 | Verdrahtung, Rechte-Block nur für GAMEMASTER, ohne `innerHTML`, Titel und Rahmen entfallen (B), Typecheck 0 | **erfüllt** im Quelltext und in der Simulation (Verdrahtung, Ersatz-Gate, Hub-Quelle); die Darstellung selbst ist nur live prüfbar (AC-M6b-12) |
| AC-M6b-09 | Vertrag Teil 6 (Englisch), Codetabelle, "Not part", Historie; Skript prüft Fehlercodes | **erfüllt** (36 Prüfungen ok) |
| AC-M6b-10 | Alle Tests grün, Relais- und Kerntests aus M4 bis M6a unverändert grün bis auf P20, P25, P26, keine verbotenen Muster, keine neue Dependency | **erfüllt** (126 Tests, 0 Treffer, `package.json` und Lock unverändert) |
| AC-M6b-11 | **Live** (GM und Spieler): ohne Freigabe `not-permitted`; nach der Freigabe `ok`; `targetping` eigen `ok`, fremd `not-permitted` (own) und `ok` (all); wieder sperren; bleibt nach F5; `getRights` | **unverified**, Anleitung im Monitor |
| AC-M6b-12 | **Live:** Rechte-Block und Tab ohne Titel sehen gut aus; ein Assistent sieht den Block nicht (optional) | **unverified**, Anleitung im Monitor |

---

## Risks and Assumptions

| # | Risiko oder Annahme | Severity |
|---|---|---|
| R1 bis R3 | Reichweite, Modul-`id`, Einstellen durch einen Assistenten: mit dem "Go" **angenommen** (`medium`), unverändert gegenüber dem Apply | `medium` (angenommen) |
| R4 | Foundry-Verhalten, das nur live prüfbar ist (Besitzprüfung für GM, Compendium und `INHERIT`, Aktualisierung der Welteinstellung auf anderen Clients, Nutzerliste bei gelöschten und neuen Nutzern, mehrere GMs); die Bindung beim GM hängt für ihre Aktualität von keinem dieser Punkte ab | `medium` |
| R5 | Die DOM-Erzeugung des Hubs (Rechte-Block, Tab ohne Titel) ist von keinem Test und keiner Simulation ausgeführt, nur typgeprüft; die Simulation deckt die Logik dahinter, nicht die Darstellung. Es ist der letzte Versuch der Nacharbeit. | `low` |
| A1, A2 | `foundry.utils.fromUuid` und `testUserPermission(user, "OWNER")` verhalten sich, wie die Referenz beschreibt; in der Simulation nachgebildet, nicht live geprüft | `low` |
| — | Neue Beobachtung: Der Rechte-Block kann bei `unreadable` ("nicht lesbar") den Text sagen, dass die Auswahl die Ablage ersetzt; ein Lesefehler der Einstellung (Ausnahme) ersetzt sie dagegen **nicht**, das Schreiben scheitert mit einer Meldung. Beides ist getestet. | `info` |

Kein neues `medium+`-Risiko, keine Dependency-Änderung, keine Human-Decision-Trigger.

---

## Decision Log (Klärungen gegenüber dem Apply, keine Änderung des Designs)

1. **`getRights` bekommt einen dritten Fehlergrund `internal-error`** (der Apply nannte zwei). Wirft die Quelle, braucht das Ergebnis einen Grund; wie bei `registerModule`. Vertrag und Skriptprüfung sind angepasst.
2. **Ein Lesefehler der Ablage verhindert das Schreiben** (`write-failed`); nur ein **ungültiger Inhalt** wird ersetzt. Der Apply sagte "nicht lesbar zählt als leer"; das hätte Rechte überschreiben können, die nur gerade nicht erreichbar sind. Getestet in P24.
3. **`targets` mit falscher Form:** Ein `targets`, das keine Liste nichtleerer Texte liefert, ergibt `handler-failed`, und `createRequestKernel` weist ein `targets`, das keine Funktion ist, beim Aufbau zurück (der Apply nannte nur die Ausnahme). Getestet in P17.
4. **Jede Antwort des Gates außer genau `{ ok: true }` ist eine Ablehnung** (auch `null`, `{}`, `{ ok: "yes" }`); getestet in P16.
5. **`REFUSE_ALL`** liegt als Ersatz-Gate in `core/request-rights.ts` und hat einen eigenen Test (39 statt 38 neue Tests).
6. **Feindliche Schlüssel doppelt abgesichert:** Neben `hasOwnProperty` prüft `levelOf` das Ergebnis auf `own` oder `all`; deshalb wäre ein Fehler in der ersten Sicherung nicht sichtbar (äquivalent), und ich habe dafür keine Gegenprobe angesetzt. Die Tests zu diesen Schlüsseln (P2) bleiben als Beleg.
7. **Hub-Einzelheiten:** Die Auswahlfelder der Rechte heißen `rights.<Modul>.<Nutzer>` und tragen `data-rights-module` und `data-rights-user`; der Listener für Einstellungen nimmt sie aus (`:not([data-rights-user])`), der eigene Listener schreibt über die Warteschlange.
8. **`fromUuid`:** Der Typ der Referenz nimmt nur UUIDs, die er zur Übersetzungszeit prüfen kann; die UUID einer Anfrage kennt erst die Laufzeit. Die Hülle nutzt darum `foundry.utils.fromUuid(uuid as never)` und ein kleines eigenes Dokument-Interface mit dem einen benutzten Aufruf.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6b-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Live-Check-Pakete in `v13/dist/live-check/` (`eagleeye-v13-m6b.zip`, Dummys a bis d; das Spike-Paket liegt weiter dabei und bleibt deaktiviert) | ephemeral |
| Prüfskripte im Scratchpad (`check-m6b-contract.mjs`, `mutate-m6b.mjs`, `sim-m6b.mjs`, `sim-rights-entry.ts`) | ephemeral, nicht Teil des Repos |

Der Deploy-Stand ist **nicht committet**; der letzte Commit ist `74578d4` (Dokumentation).

---

## Next Step

Monitor M6b ohne Stopp (Working Mode): Abgleich Acceptance gegen diesen Output, Regressionen, Restrisiken, Liste der `unverified`-Punkte und die Anleitung für den Live-Check mit GM und Spieler (Freigabe im Hub, `targetping` mit eigenem und fremdem Ziel, Aussehen des Hubs).

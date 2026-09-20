# M8 — Live-Abnahme des Release-Zips — Auswertung (Nachtrag zum Monitor)

```
artifact: live-check-output
milestone: M8
phase: MONITOR (Nachtrag)
status: complete
date: 2026-09-20
```

retention: immutable

Nachtrag zu `m8-04-monitor-output.md`, das unverändert bleibt. Grundlage: die Konsolen von GM und Spieler, deine eingefügten Zeilen, deine Beschreibungen und die zwei Screenshots des Spielers (Game Settings). Konto-Namen und Nutzer-IDs stehen hier bewusst nicht; ich schreibe `<GM-ID>` und `<Spieler-ID>`.

---

## Input Summary

- **Umgebung:** Foundry v13 auf Forge, dnd5e 5.3.3 (laut Log-Zeile `game system: dnd5e 5.3.3 (tested)`), ein GM und ein Spieler in zwei Sitzungen.
- **Paket:** `release/eagleeye-v13.zip` (SHA-256 `46e3462b…ef7b`, Version `0.1.0`); die Testmodule a bis d blieben wie seit M7 (API `0.7.0`).
- **Durchgeführt:** Teil 1 (Schritte 1, 2, 3 und 5), Teil 2: **L6, L5, L2 und L7**. **Nicht einzeln durchgeführt:** Teil 1 Schritt 4 (die drei Konsolenzeilen; durch die Log-Zeilen abgedeckt, siehe unten). **Nicht durchgeführt:** L4 (Prüfpakete des Versionswächters), vom Projektleiter als Risiko angenommen.

---

## Validation Result

**AC-M8-10 ist erfüllt und AC-M8-05 (Live) ebenso.** Das Release-Zip lässt sich installieren, Flight Control meldet Version `0.1.0` und API `0.7.0`, der getestete Standardfall wird erkannt, und der Weg Spieler → Spielleiter läuft mit der geänderten Registrierung der Queries. **M8 ist damit abgenommen.** Von den fünf Punkten der Gruppe A sind L2 und L6 vollständig, L5 und L7 teilweise beantwortet (mit klaren Antworten), L4 wurde angenommen.

### Teil 1: das Release-Zip

| Prüfung | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| Version | `0.1.0` in *Manage Modules* | "Version in Foundry Module Manager: 0.1.0" | **erfüllt** |
| Start und API (GM) | `API attached (v0.7.0)`, Sprachdatei lädt | `eagleeye \| API attached (v0.7.0)`, `Loaded localization file modules/eagleeye/lang/en.json` | **erfüllt** |
| Systemwächter | `game system: dnd5e 5.3.3 (tested)` als Info, Dummy A `system: tested dnd5e 5.3.3` | genau diese Zeilen, in beiden Konsolen | **erfüllt** |
| Registrierungen | a und d angemeldet, c abgewiesen (`incompatible-api-version`, Absicht) | `registered module eagleeye-dummy-a (api 0.7.0)` und `-d`; `registration rejected for eagleeye-dummy-c: incompatible-api-version … requests API 9.0.0, Flight Control provides 0.7.0` | **erfüllt** |
| Bisheriges Verhalten | `not-registered` (c), `unknown-request` und `invalid-payload` (d), je eine Warnung | genau so, in beiden Konsolen | **erfüllt**, keine Regression |
| **Diagnosezeile fehlt** | keine Zeile `relay: first query received …` | in der GM-Konsole keine solche Zeile. **Objektiver Beleg, dass das M8-Bundle lief:** Die Stapelzeilen deiner Konsole passen zum neuen Bundle (`module.js:1270` ist dort `CONFIG.queries[RELAY_QUERY] = (data) => relay.receive(data);`, `1319` und `1320` sind die Logger `info` und `warn`, `1372` die Zeile "API attached"). Im alten M7-Bundle liegen dieselben Stellen bei 1334, 1335 und 1387, und dort steht auf Zeile 1270 noch `describeExtraArguments`. | **erfüllt** |
| GM lokal | `rights: all`, `ping` und `gmping` ok, `ran by` = `asked by` = GM | `rights: all`, `gmping: ok, … ran by <GM-ID> (GM: true), asked by <GM-ID>` | **erfüllt** |
| **Spieler → Spielleiter** (der Weg, den die Änderung berührt) | `rights: own`, `ping` ok, `gmping` ok mit `ran by` GM und `asked by` Spieler | `rights: own`, `ping: ok, api 0.7.0, module eagleeye-dummy-a, echo hello`, `gmping: ok, api 0.7.0, … ran by <GM-ID> (GM: true), asked by <Spieler-ID>` | **erfüllt** |
| Die drei eingefügten Zeilen (Schritt 4) | `"0.1.0"`, `"0.7.0"`, JSON von `getSystemInfo()` | nicht berichtet | durch die Log-Zeilen abgedeckt: Version `0.1.0` im Modul-Manager, `API attached (v0.7.0)`, Dummy A `system: tested dnd5e 5.3.3` (kommt aus `getSystemInfo`) |

Anmerkung zur Diagnosezeile: Aus der Einfügung geht nicht hervor, ob die GM-Konsole vor oder nach der Anfrage des Spielers kopiert wurde; das ist unkritisch, weil das laufende Bundle den Code nicht mehr enthält (Beleg oben, dazu 0 Treffer im Zip).

### Teil 2: die Punkte der Gruppe A

| Punkt | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| **L6** `unsupported-version` | `{"ok":false,"reason":"unsupported-version",…}` mit der unterstützten Version | `'{"ok":false,"reason":"unsupported-version","detail":"request type \"flightcontrol.ping\" supports version 1, not 99"}'`, dazu die Warnung `request rejected for eagleeye-dummy-a (flightcontrol.ping): unsupported-version - …` | **erfüllt** |
| **L6** `invalid-request` | `{"ok":false,"reason":"invalid-request",…}` | `'{"ok":false,"reason":"invalid-request","detail":"request.module must be a non-empty string"}'`, dazu die Warnung `request rejected for ? (flightcontrol.ping): invalid-request - …` | **erfüllt** |
| **L5** Wert über dem Maximum (Dummy A Level, 0 bis 10, `99` getippt) | offen, was passiert | Mit Enter oder einem Klick daneben **springt die Zahl sofort auf 10**, die Konsole zeigt `eagleeye-dummy-a \| level changed to 10`. Ein Hinweis erscheint nicht (deine Worte: "Es erscheint kein Textfeld o.ä., ist allerdings auch nicht von Bedarf"; ich lese das als "kein Hinweis" und bitte um Korrektur, falls du etwas anderes meintest). | **beantwortet:** Das Zahlenfeld des Schiebereglers begrenzt den getippten Wert selbst, bevor der Hub ihn sieht. Der Hub lehnt ungültige Werte ab, statt sie zu begrenzen, und hätte einen Hinweis gezeigt; er bekam also schon `10`. |
| **L5** Spieler sieht den Menüknopf nicht | kein "Open Eagle Flight Control" | Screenshots: In *Game Settings* des Spielers stehen nur Core [18], Dungeons & Dragons Fifth Edition [5], EagleEye Dummy Test Module A [2], EagleEye Dummy Test Module D [1] und The Forge [1]. **Es gibt keine Kategorie "EagleEye"**, also auch keinen Knopf. Dummy A zeigt "Dummy A Enabled" (Kästchen) und "Dummy A Level" (Regler mit Zahlenfeld, 5); Dummy D zeigt "Dummy D Note" (`hello`). Das sind die Einstellungen mit Bereich "client"; die Welt-Einstellungen der Testmodule zeigt Foundry einem Spieler nicht. | **erfüllt** (Test E aus M5) |
| **L2** nicht verbundener Nutzer | `not-permitted`, "the asking user could not be confirmed"; Warnung mit dem Grund | `[<Name>, false]` für den Spieler; Ergebnis `'{"ok":false,"reason":"not-permitted","detail":"the asking user could not be confirmed"}'`; die GM-Konsole warnt `relayed request rejected for eagleeye-dummy-a (flightcontrol.gmping): not-permitted - the asking user could not be confirmed (claimed user <Spieler-ID>: the question failed: User [<Spieler-ID>] is not active)` | **erfüllt** |
| **L7** deaktivierte Voraussetzung | Foundry-Verhalten offen | Der Versuch, EagleEye zu deaktivieren, scheitert schon im Modul-Manager: rote Meldung **"This module can not be disabled as it is required by the following: EagleEye Dummy Test Module A, EagleEye Dummy Test Module C, EagleEye Dummy Test Module D"**. Die Schritte 2 und 3 der Anleitung ließen sich deshalb nicht ausführen (und mussten nicht zurückgestellt werden). | **beantwortet für den Weg über den Modul-Manager**: Foundry verhindert dort, dass ein Modul deaktiviert wird, das aktive Module voraussetzen. |
| **L4** Prüfpakete des Versionswächters | Hinweis beim GM, Zustände außer `tested` | nicht durchgeführt. Projektleiter: "A Risk I'm willing to take. DnD 5e for Foundry konzentriert sich mehr darauf 6.0.x zu pushen welches nur unter Foundry v14 läuft. 5.3.3. ist die erwartbare FinalVersion für V13" | **als Risiko angenommen** (Begründung des Projektleiters; die Aussage zum Fahrplan des Systems ist seine Einschätzung, ich habe sie nicht geprüft) |

---

## Evidence Summary

- **Das Release-Zip funktioniert in Forge.** Version, API, Wächter, Registrierung, Anfragen, Rechte und die Weiterleitung mit Bestätigung verhalten sich wie mit dem M7-Paket; die Änderung (nur die Diagnosezeile fiel weg) hat den Weg Spieler → Spielleiter nicht gestört.
- **Die Diagnosezeile ist weg**, belegt durch das Fehlen in der Konsole und durch die Zeilennummern der Stapel, die nur zum M8-Bundle passen.
- **Zwei offene Punkte aus dem Vertrag sind beantwortet:** Das Zahlenfeld eines Schiebereglers begrenzt einen zu großen Wert selbst (Abschnitt 8, bisher "nicht bestätigt"), und ein Spieler sieht den Hub-Knopf nicht (bisher "Test E" offen).
- **Flight Controls eigener Fehlerweg für einen nicht verbundenen Nutzer** ist live gezeigt (bisher nur Tests und Simulation).
- **Foundry-Fakt zu Abhängigkeiten:** Der Modul-Manager lässt ein Modul, das aktive Module voraussetzen, nicht abwählen. Der Zustand "aktives Modul, Voraussetzung deaktiviert" ist auf diesem Weg nicht herstellbar. Nicht geprüft bleiben andere Wege dorthin (zum Beispiel ein deinstalliertes oder von Hand entferntes Modul), die Reihenfolge der `init`-Callbacks und das Erzwingen von `compatibility` in `relationships.requires`.

---

## Findings

Keine Fehler, keine unerwarteten Beobachtungen, kein Rework. Zwei Anmerkungen:

| # | Anmerkung | Severity |
|---|---|---|
| A1 | Der Pfad "Hub lehnt einen Wert ab, setzt das Feld zurück und zeigt einen Hinweis" lässt sich über einen Schieberegler nicht auslösen, weil das Zahlenfeld vorher begrenzt. Er bleibt durch Tests belegt, live nicht gezeigt (mit den vorhandenen Testmodulen nicht erreichbar). | `low` |
| A2 | In deiner Beschreibung stand "Dummy Module B"; die Screenshots zeigen Dummy D. Für die Auswertung unerheblich: Es ist Foundrys eigene Anzeige der Testmodul-Einstellungen. | `info` |

## Restrisiken (`unverified`)

- **Gruppe B (weitere Konten nötig):** L3 (Assistent, mehrere Spieler, Besitzprüfung für Spielleiter, Compendium, "Inherit", gelöschte Nutzer) und mehrere Spielleiter gleichzeitig.
- **Gruppe C (von außen kaum auslösbar):** `relay-timeout` und `relay-failed` in Flight Control selbst, die 5-Sekunden-Grenze der Bestätigung, `handler-failed` und `internal-error`, `scope: "user"` und die Stabilität der Nutzer-IDs (L8).
- **L4:** der Hinweis beim GM zur Zeit `ready` und die Zustände `same-line`, `untested`, `other-system`, `unknown` in Foundry; vom Projektleiter angenommen, die vier Prüfpakete liegen weiter in `v13/dist/live-check/`.
- **L7, Rest:** andere Wege zu einer deaktivierten Voraussetzung, Reihenfolge der `init`-Callbacks, Erzwingen von `compatibility`.

---

## Folgen für die Dokumente

- `docs/api-contract.md`: Abschnitt 7 (Foundry lässt Flight Control nicht abwählen, solange aktive Module es voraussetzen) und Abschnitt 8 (Release-Build, `unsupported-version`, `invalid-request`, nicht verbundener Nutzer, Begrenzung durch das Zahlenfeld, Spieler ohne Menüknopf; die "nicht geprüft"-Liste verkürzt).
- `dadm/uebergabe-naechste-phase.md` (Offene Punkte) und `dadm/entwurf-summary-implementation-phase-4.md`: nachgeführt.
- Gesamtprüfung: `m8-06-gesamtpruefung-output.md`.

---

## Recommendation

**M8 abnehmen** (Live-Abnahme bestanden). Das Release-Zip ist technisch bereit. Ob und wann es veröffentlicht wird, ist die Release-Entscheidung, die du ausdrücklich triffst (siehe Gesamtprüfung).

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m8-05-live-check-output.md` (dieses Dokument) | immutable |

M8-Kette: `m8-01-discover-output.md`, `m8-02-apply-output.md`, `m8-03-deploy-output.md`, `m8-04-monitor-output.md`, `m8-05-live-check-output.md`, `m8-06-gesamtpruefung-output.md` (alle `immutable`).

---

## Next Step

Gesamtprüfung `m8-06`; dann fragt der Ablauf dich einzeln nach: lokalem Commit, den Nachträgen für `cheat-sheet.md`, der Release-Entscheidung und dem Archivieren.

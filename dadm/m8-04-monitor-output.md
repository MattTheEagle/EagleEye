# M8 — Abschluss: API-Vertrag, Gesamtprüfung, Release-Entscheidung — Monitor Output

```
artifact: monitor-output
milestone: M8
phase: MONITOR
status: complete (Live-Abnahme des Release-Zips offen, Anleitung unten)
date: 2026-09-20
```

retention: immutable

Outcome-Validierung nach dem Deploy (`m8-03-deploy-output.md`). Ich habe nichts committet, getaggt, gepusht oder veröffentlicht. Die Live-Abnahme führst du selbst aus; das Ergebnis halte ich in **einem** Artefakt fest (`m8-05-live-check-output.md`), weil die Monitor-Outputs unveränderlich sind.

---

## Input Summary

- Deploy-Output `m8-03`; Working Mode (Monitor folgt dem Deploy ohne Stopp); Akzeptanzkriterien AC-M8-01 bis AC-M8-11 aus `m8-02`.
- **Frischer Durchlauf zum Zeitpunkt des Monitors:** `npm run typecheck` Exit 0; `npx vitest run` **162 Tests in 18 Dateien grün**; `npm run package` Exit 0.

---

## Validation Result

| AC | Stand nach dem Monitor | Beleg |
|---|---|---|
| AC-M8-01, -02, -03, -04, -05 (Bau, Vertrag, Manifest, Paket), -06, -08 | **erfüllt** | Deploy P1 bis P12; im Monitor unverändert bestätigt (Tests, typecheck, Paketieren) |
| AC-M8-05 (Live) und AC-M8-10 | **offen, `unverified`** | Anleitung unten, Teil 1 |
| AC-M8-07 | **teilweise**: Entwürfe da, Eintrag in `cheat-sheet.md` nicht freigegeben | Deploy D6 |
| AC-M8-09 Gesamtprüfung | **offen**, nach den Live-Ergebnissen | `m8-06` |
| AC-M8-11 Release nur vorbereitet | **erfüllt** | Checkliste unten; nichts ausgeführt |

**Das Release-Zip, das du prüfst** (endgültig gebaut; ich baue `release/` bis zu deiner Abnahme nicht mehr neu):

| Datei | Größe | SHA-256 |
|---|---|---|
| `release/eagleeye-v13.zip` | 15.556 Byte | `46e3462b10591794aadbf1bf487ef63691dee9559544d72b45d9e0f57effef7b` |
| `release/module.json` | 764 Byte | `1fe1bad5fc4ef5268a8c3d69a0da8e66377a8e1670d097e50c996b9efd8f5dcd` |

Inhalt des Zips: genau `module.json`, `dist/module.js`, `lang/en.json` (dasselbe Layout wie die bisherigen Live-Check-Zips); `module.json` darin nennt Version `0.1.0`.

---

## Residual Findings

| # | Finding | Severity | Blocking |
|---|---|---|---|
| F1 | Das Release-Zip ist live noch nicht installiert. Inhalt, Prüfsummen und Simulation stimmen; das Verhalten in Forge zeigt erst Teil 1 der Anleitung. Besonders wichtig ist der Weg Spieler → Spielleiter, weil die Registrierung der Queries geändert wurde (nur die Diagnosezeile fiel weg). | `low` | no |
| F2 | Die Punkte der Gruppe A (L2, L4 bis L7) sind weiter `unverified`, bis du sie ausführst oder als Restrisiko annimmst. | `low` | no |
| F3 | Die Punkte der Gruppen B (weitere Konten) und C (von außen kaum auslösbar) bleiben als Restrisiko offen, wie im Apply vorgeschlagen und mit dem "Go" angenommen. | `low` | no |
| F4 | Die Nachträge für `cheat-sheet.md` sind nicht eingetragen (keine Freigabe). | `info` | no |
| F5 | Die Dokumente aus M7 und M8 sind noch nicht committet (siehe Next Step). | `info` | no |

Kein `medium`- oder `high`-Fund, kein Rework, keine Human-Decision-Trigger.

---

## Live-Abnahme: Anleitung

Du deployst selbst auf Forge und siehst die Anzeige; ich führe nichts aus. **Teil 1 ist der wichtige Teil** (etwa 10 Minuten). Teil 2 sind die Punkte der Gruppe A aus dem Apply (Abschnitt 11), jeder für sich wählbar.

**Was du brauchst**
- `/run/media/matt/Data/matt/Coding/FoundryVTT/EagleEye/release/eagleeye-v13.zip` (Prüfsumme oben).
- Die Testmodule **a und d bleiben wie sie sind** (seit M7 installiert, API `0.7.0`, unverändert); b und c ebenso. Es gibt nichts Neues für sie.
- Eine GM-Sitzung (Konsole, Filter `eagleeye`) und für Teil 1 Schritt 5 eine Spieler-Sitzung.

### Teil 1: das Release-Zip (Test A)

1. **Installieren:** `eagleeye-v13.zip` im Import Wizard über das bisherige EagleEye-Paket installieren (überschreiben). Die GM-Sitzung neu laden.
2. **Version:** Unter *Manage Modules* zeigt "EagleEye" die Version **0.1.0**.
3. **GM-Konsole, Filter `eagleeye`.** Erwartet:
```
eagleeye | API attached (v0.7.0)
eagleeye | game system: dnd5e 5.3.3 (tested)
eagleeye-dummy-a | system: tested dnd5e 5.3.3
```
   **Nicht** erscheinen darf die Zeile `eagleeye | relay: first query received, extra handler arguments: …` (die Diagnosezeile aus M5, sie fiel in M8 weg).
4. **In der GM-Konsole nacheinander, jede Zeile einzeln** einfügen:
```js
game.modules.get("eagleeye").version
game.modules.get("eagleeye").api.version
JSON.stringify(game.modules.get("eagleeye").api.getSystemInfo())
```
   Erwartet `"0.1.0"`, `"0.7.0"` und `{"ok":true,"value":{"id":"dnd5e","version":"5.3.3","status":"tested","testedVersions":["5.3.3"]}}`.
5. **Spieler → Spielleiter (der Weg, den die Änderung berührt):**
   1. GM: Einstellungen → Konfigurieren → Modul "EagleEye" → **Open Eagle Flight Control** → Registerkarte "EagleEye Dummy Test Module A" → im Block **"Who may use this module"** für den Spieler **Own targets only** wählen (steht dort schon "Own targets only" oder "Own and foreign targets", lass es).
   2. Spieler: Sitzung neu laden (F5), Konsole, Filter `eagleeye`. Erwartet (die IDs sind deine):
```
eagleeye-dummy-a | rights: own
eagleeye-dummy-a | ping: ok, api 0.7.0, module eagleeye-dummy-a, echo hello
eagleeye-dummy-a | gmping: ok, api 0.7.0, module eagleeye-dummy-a, echo from <Spielername>, ran by <GM-ID> (GM: true), asked by <Spieler-ID>
```
   3. GM-Konsole: **keine** Zeile `relay: first query received`, keine Warnung zu dieser Anfrage.

**Was ein Ergebnis bedeutet**

| Beobachtung | Folge |
|---|---|
| Alles wie erwartet, keine Diagnosezeile | AC-M8-10 und AC-M8-05 (Live) erfüllt |
| Die Zeile `relay: first query received` erscheint | Es ist noch das alte M7-Paket installiert (Import nicht überschrieben?); Version unter *Manage Modules* prüfen |
| Die Version zeigt `0.0.1` statt `0.1.0` | Das Manifest wurde nicht überschrieben; Paket erneut installieren, Sitzung neu laden |
| Spieler `gmping: relay-failed` oder `no-gm` trotz verbundenem GM | Das wäre eine Regression im Weiterleitungsweg: Zeile mitkopieren, ich prüfe den Stand; die Diagnosezeile war die einzige Änderung dort |
| Spieler `rights: denied` und beide `not-permitted` | Der Block "Who may use this module" stand noch auf "Denied"; einstellen und neu laden |

### Teil 2: Prüfliste der offenen Live-Punkte (Gruppe A), empfohlene Reihenfolge

Jeder Punkt ist unabhängig; du entscheidest je Punkt, ob du ihn prüfst oder als Restrisiko annimmst.

**L6: Fehlergründe `unsupported-version` und `invalid-request` (GM-Konsole, 2 Minuten).** Nacheinander, jede Zeile einzeln:
```js
JSON.stringify(await game.modules.get("eagleeye").api.request({ module: "eagleeye-dummy-a", type: "flightcontrol.ping", version: 99 }))
JSON.stringify(await game.modules.get("eagleeye").api.request({ type: "flightcontrol.ping" }))
```
Erwartet `{"ok":false,"reason":"unsupported-version","detail":"…"}` (der Text nennt die unterstützte Version `1`) und `{"ok":false,"reason":"invalid-request","detail":"…"}`; die Konsole zeigt je eine Warnung von Flight Control.

**L5: Hub (5 Minuten).**
1. GM, Hub, Registerkarte "EagleEye Dummy Test Module A", Feld "Dummy A Level" (Schieberegler mit Zahlenfeld, 0 bis 10): **`99`** in das Zahlenfeld tippen und mit Tab bestätigen. Bitte notieren: welcher Wert danach im Feld steht, ob ein Hinweis erscheint (Text), und ob die Konsole `eagleeye-dummy-a | level changed to …` zeigt (mit welchem Wert). Danach wieder `5` einstellen.
2. Spieler: Einstellungen → Konfigurieren → Modul "EagleEye": der Knopf **"Open Eagle Flight Control" darf nicht erscheinen**.

**L2: nicht verbundener Nutzer in Flight Control selbst (GM-Konsole, 3 Minuten).**
1. Der Spieler verlässt die Welt (Tab schließen oder zurück zum Setup).
2. GM-Konsole: `(() => { const u = game.users.find((x) => !x.isGM); return [u.name, u.active]; })()` zeigt `[<Name>, false]`.
3. Danach in **einer** Zeile eine gefälschte Nachricht, die diesen nicht verbundenen Nutzer nennt:
```js
JSON.stringify(await game.users.activeGM.query("eagleeye.request", { request: { module: "eagleeye-dummy-a", type: "flightcontrol.gmping" }, claim: { userId: game.users.find((x) => !x.isGM).id, requestId: "0123456789abcdef0123456789abcdef" } }, { timeout: 17000 }))
```
   Erwartet `{"ok":false,"reason":"not-permitted","detail":"the asking user could not be confirmed"}` und in der GM-Konsole eine Warnung `eagleeye | relayed request rejected for eagleeye-dummy-a (flightcontrol.gmping): not-permitted - the asking user could not be confirmed (claimed user <ID>: the question failed: User [<ID>] is not active)`.

**L7: eine deaktivierte Voraussetzung (GM, 5 Minuten; ändert die Modulliste der Welt, danach zurückstellen).** Dummy A verlangt `eagleeye` in seinem Manifest.
1. *Manage Modules*: **nur EagleEye** deaktivieren, Dummy A aktiv lassen, speichern. Bitte notieren, was Foundry beim Speichern zeigt (Dialog, Warnung, Text).
2. Welt neu laden. Bitte notieren: Ist Dummy A danach noch aktiv (Modulliste)? Was zeigt die Konsole zu `eagleeye`? (Läuft Dummy A weiter, erwartet der Code `eagleeye-dummy-a | Flight Control API not available`.)
3. **Zurückstellen:** EagleEye (und, falls Foundry sie mitdeaktiviert hat, Dummy A und D) wieder aktivieren, speichern, neu laden und Teil 1 Schritt 3 kurz wiederholen.

**L4: die vier Prüfpakete des Versionswächters (optional, je ein Neuladen, etwa 10 Minuten).** Genau wie **Test B in `dadm/m7-04-monitor-output.md`** (dort steht die Tabelle mit den erwarteten Zeilen und Hinweistexten): `eagleeye-v13-m7-check-same-line.zip`, `-untested.zip`, `-other-system.zip`, `-unknown.zip` aus `v13/dist/live-check/` je über das vorige Paket installieren, neu laden, Konsole und Hinweisfenster ansehen. **Danach das Release-Zip aus Teil 1 wieder installieren** und Schritt 2 und 3 kurz wiederholen. Diese Punkte machst du am besten zuletzt.

**Bitte mitgeben:** aus Teil 1 die drei Konsolenzeilen der GM-Sitzung, die drei Zeilen des Spielers, die Ergebnisse der drei eingefügten Zeilen und ob die Diagnosezeile fehlt; aus Teil 2 je durchgeführtem Punkt die Ergebniszeile(n) beziehungsweise den beobachteten Text. Nicht Durchgeführtes brauchst du nicht zu erwähnen; ich führe es dann als `unverified` und Restrisiko.

---

## Release: Checkliste (nur eine Anleitung, **nichts davon ist ausgeführt**)

Ein Release, ein Tag und ein Push wirken nach außen und sind nur eingeschränkt umkehrbar. Ich führe sie nur auf deine ausdrückliche Anweisung aus, **jeden Schritt einzeln**.

**Vorbedingungen (alle müssen stimmen)**
1. Die Live-Abnahme ist ausgewertet und die Gesamtprüfung (`m8-06`) liegt vor.
2. `TESTED_SYSTEM_VERSIONS` in `core/system-guard.ts` enthält die zuletzt live geprüfte Systemversion (heute `5.3.3`, in der Testwelt bestätigt); sonst zuerst ergänzen (Code-Änderung und Zeile im Vertrag, Abschnitt 4).
3. Modulversion in `v13/module.json` und `package.json` ist `0.1.0`; die Tabelle im Vertrag, Abschnitt 6, hat die Zeile `0.1.0` → `0.7.0`; `npm run package` läuft ohne Meldung. (Ein Test und das Skript prüfen das.)
4. Alles ist lokal committet, der Arbeitsbaum ist sauber, und der Commit, den du taggst, enthält die Version `0.1.0` im Manifest.
5. **Datenschutz-Entscheidung zu sechs Prozessdokumenten** (`m5-05`, `m6-spike-1-result`, `m6a-05`, `m6b-04`, `m6b-05`, `m7-05`: Namen von Test-Konten und/oder Foundry-Nutzer-IDs) getroffen: so lassen, neutralisieren (eine ausdrückliche Ausnahme von "immutable") oder keinen Push für jetzt. Ob das GitHub-Repo öffentlich ist, habe ich nicht geprüft.

**Befehle (Beispiel; jeder Schritt braucht deine Anweisung)**
```bash
# 1. Release-Dateien bauen (lokal, veröffentlicht nichts)
npm run package                       # -> release/eagleeye-v13.zip, release/module.json

# 2. Tag setzen (lokal)
git tag -a v13-v0.1.0 -m "Eagle Flight Control 0.1.0 (API 0.7.0)"

# 3. Veröffentlichen (nach außen wirksam)
git push origin master
git push origin v13-v0.1.0
gh release create v13-v0.1.0 release/module.json release/eagleeye-v13.zip \
  --title "Eagle Flight Control 0.1.0" --notes "First release with the API contract (API 0.7.0)."

# 4. Danach prüfen
curl -sL https://github.com/MattTheEagle/EagleEye/releases/latest/download/module.json   # "version": "0.1.0"
```
Danach in Forge die Installation über die Manifest-URL aus `module.json` einmal ausprobieren (die Import-Wizard-Zips, mit denen die Live-Checks liefen, sind ein anderer Weg). `gh` braucht eine Anmeldung; ich frage nach keinen Zugangsdaten. Das Tag `v13-v0.0.1` des ersten Nachweises bleibt unberührt.

---

## Evidence Summary

- Frischer Durchlauf: typecheck Exit 0, 162 von 162 Tests, `npm run package` Exit 0; das Zip enthält drei Dateien, `module.json` darin nennt `0.1.0` und den Download `v13-v0.1.0`.
- Alle Proofs aus dem Deploy gelten unverändert (Gegenproben 63 von 63, Paketier-Skript 16 von 16, Simulationen, Datenschutz-Suche, Diff der Pläne).
- Seit dem Deploy wurde kein Quelltext geändert; das Bundle im Zip ist byte-gleich dem gebauten.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m8-04-monitor-output.md` (dieses Dokument) | immutable |

---

## Next Step

**Warten auf deine Live-Ergebnisse** (Teil 1, nach Wahl Teil 2). Danach ohne weiteres "Go" (nur Dokumente): `m8-05-live-check-output.md` mit der Auswertung, die Gesamtprüfung `m8-06`, Vertrag Abschnitt 8 und Übergabenotiz nachführen, Entwurf der `SUMMARY.md` abschließen. Danach fragt der Ablauf dich einzeln nach: dem lokalen Commit der Dokumente und des Stands (kein Push), den Nachträgen für `cheat-sheet.md`, dem Archivieren und dem Release.

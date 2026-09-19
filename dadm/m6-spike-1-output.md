# M6 — Spike 1: Verhalten von `User#query` vom GM an Spieler — Plan und Anleitung

```
artifact: spike-output
milestone: M6
phase: DISCOVER (Vorab-Prüfung zur Human Decision 1, Bedingung 1)
status: complete (Plan und Anleitung; das Ergebnis steht in einem eigenen Nachtrag)
date: 2026-09-20
```

retention: immutable

Die Human Decision 1 (`m6-hd-1-output.md`) wählt für die Nutzeridentität die **Rückfrage des GM an den genannten Nutzer**. Sie setzt voraus, dass `User#query` vom GM an einen Spieler zuverlässig zugestellt und beantwortet wird.
Das ist nicht geprüft (`m6-01`, U3). Dieser kleine Live-Check zeigt es, **bevor** das Apply darauf baut. Er klärt nebenbei die in M5 nicht ausgelösten Fehlerwege von `User#query` (M5-U2 bis U6), die für
`relay-failed` und `relay-timeout` gelten.

Der Spike ist eine Testhilfe wie die Dummy-Module: ein eigenständiges Modul ohne Flight Control (`test-fixtures/eagleeye-spike-query/`), das nur Anfragen stellt und beantwortet und ausgibt, was ankommt.
Ich führe nichts gegen Forge aus.

---

## Pakete (fertig gebaut, gitignoriert): `v13/dist/live-check/`

| Zip | Inhalt |
|---|---|
| `eagleeye-spike-query.zip` | das Diagnose-Modul `eagleeye-spike-query` (`module.json`, `module.js`); **neu**, in der Welt aktivieren |
| `eagleeye-v13-m5b.zip` | Flight Control **mit dem Rahmen um den Modul-Block** (Nacharbeit 2, `m3-rework-2-output.md`); überschreibt den bisherigen Stand |
| `eagleeye-dummy-a` bis `-d.zip` | unverändert, bleiben installiert |

## Ablauf

1. Beide Zips im Import Wizard installieren; das Modul "EagleEye Spike: User#query" in der Welt aktivieren (Flight Control und die Dummys bleiben aktiv).
2. Zwei Browser-Sitzungen wie zuvor (GM und Spieler, getrennte Profile), in beiden die Konsole öffnen, Filter `eagleeye`. Beide Fenster sichtbar lassen.
3. **Test S1, Spieler verbunden:** Zuerst den **Spieler** anmelden und die Welt laden lassen, danach den **GM**. Zehn Sekunden nach dem Laden des GM laufen die Prüfungen von selbst (etwa 20 bis 25 Sekunden lang);
   in der Konsole des GM erscheinen die Zeilen `eagleeye-spike-query | …` von `--- start of the checks` bis `--- end of the checks`, in der Konsole des Spielers die Zeilen `echo received on …`.
4. **Test S2, Nutzer nicht verbunden:** Die Spieler-Sitzung abmelden oder schließen. In der Konsole des GM eingeben: `await game.modules.get('eagleeye-spike-query').api.run()`. Der Spieler gilt jetzt als "NOT connected".
5. **Test H, Hub (als GM):** Zahnrad, Einstellungen konfigurieren, Kategorie "EagleEye", "Open Eagle Flight Control". Sieht der Modul-Block jetzt gut aus: ein Rahmen mit dem Modulnamen als Titel, darin Version, Open und die Einstellungen?
   (Screenshot von Tab A und Tab D.)

## Erwartung

| Zeile in der Konsole des GM | Erwartet | Was sie klärt |
|---|---|---|
| `users: …` | alle Nutzer der Welt mit Rolle und `active` | Ausgangslage |
| `self (the Gamemaster asks itself): ok after … ms` | `ok`, `answeredBy` = GM | M5-U6: Anfrage an den eigenen Nutzer |
| `the Gamemaster wrote the world setting probe = "set-by-gm-<nonce>"` und danach `player … (connected): echo with nonce …: ok after … ms -> {answeredBy: {id des Spielers, …}, got: {nonce}, probe: …}` | **`ok`, `answeredBy` = Spieler, `got` enthält dieselbe Nonce**; `probe` = `set-by-gm-<nonce>` | **Kernfrage der Human Decision:** Die Rückfrage GM → Spieler geht, die Antwort kommt vom Spieler. **M6-U1:** Ein Spieler kann eine vom GM geschriebene Welteinstellung lesen (wichtig für den Speicherort der Rechte) |
| `… handler that throws: FAILED after … ms -> …` | Fehler mit Text | M5-U4: wie ein Fehler im Handler des Ziels beim Aufrufer ankommt |
| `… query name nobody handles: FAILED after … ms -> …` | Fehler mit Text | M5-U5: Ziel ohne Handler |
| `… slow handler, timeout 3000 ms: FAILED after … ms -> …` | Fehler nach etwa 3000 ms | M5-U3: Was passiert bei einer Zeitüberschreitung, und nach welcher Zeit |
| Test S2: `user … (NOT connected): echo: FAILED after … ms -> …` | Fehler, sofort oder nach der Zeitüberschreitung | M5-U2: Ziel nicht verbunden |
| in der Konsole des **Spielers**: `echo received on … extra arguments [{"timeout":8000}]` | zweites Argument nur `{ timeout }` | bestätigt für den Weg GM → Spieler, was M5 für Spieler → GM zeigte |

## Was ein Ergebnis bedeutet

| Beobachtung | Folge |
|---|---|
| Zeile mit `answeredBy` = Spieler und derselben Nonce | Bedingung 1 der Human Decision erfüllt; das Apply von M6 baut auf der Rückfrage auf |
| Die Zeile zum verbundenen Spieler ist `FAILED` oder bleibt leer | Die Rückfrage funktioniert so nicht; M6 geht zurück zur Human Decision (Rückfall auf Option A oder C), der Deploy startet nicht |
| `probe` beim Spieler zeigt noch `initial` oder einen anderen Wert | Die Welteinstellung ist im Spieler-Client nicht (oder nicht sofort) lesbar: Der Speicherort der Rechte muss anders gewählt werden (Discover-U1) |
| Fehler kommen mit Text und Zeit zurück (`boom`, `nothing`, `slow`, nicht verbunden) | Die Abbildung auf `relay-failed` und `relay-timeout` (M5) ist bestätigt; die Fehlertexte bitte mitkopieren |
| Zeitüberschreitung deutlich später als 3000 ms oder gar nicht | Foundrys `timeout` wirkt anders als angenommen; der eigene Zeitgeber des Relais (M5) ist dann das, worauf man sich verlässt |
| Rahmen sieht schlecht aus (Test H) | RW3: Nacharbeit 2, Versuch 2 (minimales eigenes CSS) oder eine der beiden anderen Gestaltungen |

**Bitte mitgeben:** die Zeilen `eagleeye-spike-query | …` aus der Konsole des GM (nach S1 und nach S2), die Zeilen `echo received …` aus der Konsole des Spielers, und die Screenshots von Test H.

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6-spike-1-output.md` (dieses Dokument) | immutable |
| `test-fixtures/eagleeye-spike-query/` | durable (Testhilfe, wie die Dummy-Module) |
| Pakete in `v13/dist/live-check/` | ephemeral |

Nachtrag mit dem Ergebnis: `m6-spike-1-result-output.md`.

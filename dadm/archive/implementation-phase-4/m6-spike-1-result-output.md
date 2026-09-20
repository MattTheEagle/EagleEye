# M6 — Spike 1: Verhalten von `User#query` vom GM an Spieler — Ergebnis

```
artifact: spike-result-output
milestone: M6
phase: DISCOVER (Vorab-Prüfung zur Human Decision 1, Bedingung 1)
status: complete
date: 2026-09-20
```

retention: immutable

Nachtrag zu `m6-spike-1-output.md` (dessen Inhalt bleibt unverändert). Der Projektleiter hat den Spike selbst auf Forge ausgeführt und Konsolenauszüge in den Chat gegeben; ich habe nichts gegen Forge ausgeführt.
Test H (Rahmen um den Modul-Block im Hub) ist nicht berichtet und bleibt für den nächsten Live-Check offen.

---

## Input Summary

- Pakete: `eagleeye-spike-query.zip` (Diagnose-Modul), `eagleeye-v13-m5b.zip` (Flight Control mit dem Rahmen)
- Umgebung: Foundry VTT v13, Forge, GM `matteagle404` (`LmS6Y5vvR5k7wX71`), Spieler `matttheeagle` (`YvMJ2d7AkPP3I4pT`); die Welt hat nur diese zwei Nutzer
- Eingabe, in mehreren Nachrichten: die Meldung, dass `api` zunächst `undefined` war (das Modul war noch nicht aktiv); danach Konsolenauszüge des GM aus einem Lauf **ohne** verbundenen Spieler (S2), eine Zeile aus der Konsole des Spielers (Empfang der Abfrage)
  und die Zeilen des GM aus einem Lauf **mit** verbundenem Spieler (S1)
- Erwartung: `m6-spike-1-output.md`, Abschnitte "Erwartung" und "Was ein Ergebnis bedeutet"

---

## Beobachtung gegen Erwartung

| # | Erwartet | Beobachtet (GM-Konsole, sofern nicht anders genannt) | Ergebnis |
|---|---|---|---|
| S1 | `echo` an den verbundenen Spieler: `ok`, `answeredBy` = Spieler, dieselbe Nonce | `player matttheeagle (connected): echo with nonce f7jydbcn3t: ok after 108 ms -> {"answeredBy":{"id":"YvMJ2d7AkPP3I4pT","name":"matttheeagle","isGM":false},"got":{"case":"gm-to-player","nonce":"f7jydbcn3t"},"probe":"set-by-gm-f7jydbcn3t"}` | **erfüllt** (Kernfrage der Human Decision) |
| S2 | Spieler-Konsole: die Abfrage kommt an, zweites Argument nur `{ timeout }` | `echo received on matttheeagle (id YvMJ2d7AkPP3I4pT, GM: false): data {"case":"gm-to-player","nonce":"f7jydbcn3t"}, extra arguments [{"timeout":8000}], world setting probe "set-by-gm-f7jydbcn3t"` | erfüllt |
| S3 | `probe` beim Spieler = vom GM geschriebener Wert (M6-U1) | `probe` = `set-by-gm-f7jydbcn3t`, gelesen etwa 1,5 Sekunden nach dem Schreiben durch den GM | **erfüllt:** Ein Spieler kann eine vom GM geschriebene Welteinstellung lesen |
| S4 | Handler des Ziels wirft (M5-U4) | `handler that throws: FAILED after 95 ms -> Error: boom from the handler` | Fehlertext des Handlers kommt beim Aufrufer an (`Error`, gleiche Meldung) |
| S5 | Ziel ohne Handler (M5-U5) | `query name nobody handles: FAILED after 0 ms -> Error: User query 'eagleeye-spike-query.nothing' is not registered` | sofortige Ablehnung mit Text; ob die Prüfung beim Aufrufer oder beim Ziel liegt, zeigt der Lauf nicht |
| S6 | Zeitüberschreitung (M5-U3) | `slow handler, timeout 3000 ms: FAILED after 3052 ms -> Error: operation has timed out` | Foundrys `timeout` wirkt (Ablauf nach der angegebenen Zeit plus etwa 50 ms) |
| S7 | Nutzer nicht verbunden (M5-U2), Test S2 | `user matttheeagle (NOT connected): echo: FAILED after 0 ms -> Error: User [YvMJ2d7AkPP3I4pT] is not active` | sofortige Ablehnung mit Text |
| S8 | Anfrage an den eigenen Nutzer (M5-U6) | `self (the Gamemaster asks itself): ok after 100 ms` und `111 ms`; der Handler bekommt auch dort `[{"timeout":8000}]` | erfüllt |
| S9 | Test H, Rahmen im Hub | nicht berichtet | offen |

---

## Bewertung

| Kriterium | Ergebnis |
|---|---|
| **Bedingung 1 der Human Decision 1** (`User#query` vom GM an einen Spieler wird zugestellt und beantwortet, die Antwort kommt vom Spieler) | **erfüllt** (S1, S2). M6a darf nach dem bedingten Go deployt werden; Option B (Rückfrage des GM an den genannten Nutzer) trägt. |
| M6a-Annahme A1 | **bestätigt** |
| M6a-Annahme A2 (nicht verbundener Nutzer wird nicht gefragt, abgelehnt) | **bestätigt:** Die Abfrage scheitert sofort (S7). Für die Rückfrage heißt das: fail closed ohne Wartezeit. |
| M6a-Annahme A3 (der Client beantwortet die Rückfrage unabhängig von seiner eigenen Anfrage) | plausibel (der Spieler-Client beantwortete die Abfrage im Ruhezustand); die Gleichzeitigkeit zeigt erst der Live-Check von M6a |
| M6-U1 (Discover: Spieler liest Welteinstellung) | **beantwortet: ja** (S3) |
| M5-U2 bis U6 (Fehlerwege von `User#query`) | **beantwortet** (S4 bis S8), siehe Folgen |
| M6-U2 (Assistent schreibt Welteinstellung), M6-U5 (`scope: "user"`), M6-U6 (Stabilität der Nutzer-IDs), M5-U8 (mehrere GMs) | nicht geprüft, weiter unverified |

---

## Folgen

1. **M6a wird deployt** (bedingtes Go des Projektleiters vom 2026-09-20, R1 und R2 angenommen, T1 bis T3 wie vorgeschlagen; Planversion 2 ist freigegeben). Das Design aus `m6a-02-apply-output.md` bleibt unverändert.
2. **Fehlerwege für das Relais (M5) und die Rückfrage (M6a):** Jede Abweisung von `User#query` kommt als abgelehntes Promise mit Text (S4, S5, S7); die Zeitüberschreitung kommt nach der angegebenen Zeit (S6). Das Design bildet alles auf
   `relay-failed`, `relay-timeout` oder bei der Rückfrage auf `not-permitted` ab, gleich welcher Text; die eigenen Zeitgeber laufen vor denen von Foundry ab. Keine Änderung nötig.
3. **Fehler im Handler:** Der Text eines Fehlers im Handler des Ziels erreicht den Aufrufer der Abfrage (S4). `receive` und `answerConfirmation` werfen nie, deshalb gibt es diesen Weg für Flight Control nicht; ein Handler mit einem Fehler kommt als Ergebnis mit allgemeinem `detail` zurück.
4. **Zwei Queries brauchen beide Seiten:** Der Name muss vermutlich schon auf dem Client registriert sein, der fragt (S5, 0 ms). Flight Control registriert deshalb `eagleeye.request` und `eagleeye.confirm` auf allen Clients.
5. **M6b:** Die Rechte können als Welteinstellung gespeichert werden, die Spieler lesen (S3).
6. **Nachführung:** `docs/api-contract.md` Abschnitt 8 nennt die mit dem Testmodul beobachteten Foundry-Fakten (mit Teil 5 im Deploy).

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6-spike-1-result-output.md` (dieses Dokument) | immutable |

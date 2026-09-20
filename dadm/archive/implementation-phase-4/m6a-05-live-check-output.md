# M6a — Live-Check mit GM und Spieler — Auswertung (Nachtrag zum Monitor)

```
artifact: live-check-output
milestone: M6a (mit Test H zu M3, Nacharbeit 2)
phase: MONITOR (Nachtrag)
status: complete
date: 2026-09-20
```

retention: immutable

Nachtrag zu `m6a-04-monitor-output.md`, das unverändert bleibt. Grundlage: die Konsolenzeilen beider Sitzungen und zwei Screenshots des Projektleiters (Tab A und Tab D im Hub), dazu seine Anmerkung zum Rahmen.

---

## Input Summary

- **Umgebung:** Foundry v13 Stable, Build 351, Forge, dnd5e 5.3.3; laut Anzeige sechs aktive Module. GM `matteagle404` (`LmS6Y5vvR5k7wX71`) und Spieler `matttheeagle` (`YvMJ2d7AkPP3I4pT`) in zwei Sitzungen.
- **Pakete:** `eagleeye-v13-m6a.zip`, Dummys a bis d (API `0.5.0`, b und c unverändert); das Spike-Modul war deaktiviert.
- **Durchgeführt:** Test A (GM allein), Test B (GM und Spieler), Test F (drei gefälschte Angaben aus der Konsole des Spielers), Test H (Rahmen im Hub, Screenshots). Nicht durchgeführt: die optionale Prüfung mit einem nicht verbundenen Nutzer (Test F, Zusatz).

---

## Validation Result

**AC-M6a-12 ist erfüllt.** Eine weitergeleitete Anfrage läuft beim GM mit dem bestätigten Nutzer, der GM-Fall bleibt lokal, und jede gefälschte Angabe wird mit `not-permitted` abgelehnt. **M6a ist damit abgeschlossen** (Status: Completed).
Der Rahmen im Hub (Test H) gefällt nicht ganz: Der Titel sitzt zu nah an den Registerkarten (Befund F1 unten, `low`); der Projektleiter hat entschieden, dass er entfallen kann.

| Test | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| A: GM allein | `gmping: ok … ran by <GM-ID> … asked by <GM-ID>` | `gmping: ok, api 0.5.0, module eagleeye-dummy-a, echo from matteagle404, ran by LmS6Y5vvR5k7wX71 (GM: true), asked by LmS6Y5vvR5k7wX71` | erfüllt |
| B: Spieler mit GM | `this user: <Spieler-ID>`; `ran by <GM-ID>`, `asked by <Spieler-ID>` | `this user: YvMJ2d7AkPP3I4pT (GM: false)`; `gmping: ok, api 0.5.0, module eagleeye-dummy-a, echo from matttheeagle, ran by LmS6Y5vvR5k7wX71 (GM: true), asked by YvMJ2d7AkPP3I4pT` | erfüllt |
| B: Konsole des GM | Diagnosezeile, keine Zeile `relayed request rejected` für die echte Anfrage | Diagnosezeile `handler arguments: 1: [{"timeout":17000}]` (im Bericht gekürzt); die drei Warnungen unten gehören zu den drei Fälschungen, keine weitere | erfüllt |
| F1: Angabe nennt den GM | `not-permitted` | `{"ok":false,"reason":"not-permitted","detail":"the asking user could not be confirmed"}`; GM-Warnung `(claimed user LmS6Y5vvR5k7wX71: the answer is not a confirmation from that user)` | erfüllt |
| F2: Angabe nennt einen Nutzer, den es nicht gibt | `not-permitted` | dieselbe Antwort; GM-Warnung `(claimed user doesNotExist0000: the question failed: no user with the id doesNotExist0000)` | erfüllt |
| F3: Angabe nennt den Spieler mit erfundener Kennung | `not-permitted` | dieselbe Antwort; GM-Warnung `(claimed user YvMJ2d7AkPP3I4pT: the answer is not a confirmation from that user)` | erfüllt |
| H: Rahmen mit Titel im Hub | sieht gut aus (AC-M3R2-03) | Rahmen und Titel erscheinen wie geplant, Felder links/rechts, Schieberegler mit Zahlenfeld, Open-Knopf, Versionszeile; laut Projektleiter wirkt der Titel "immer noch zu nah an den Registerkarten" | **nicht erfüllt** (Befund F1) |

---

## Evidence Summary

- **Die Bestätigung hält in Foundry.** Der Spieler-Client hat die Rückfrage des GM (`eagleeye.confirm`) beantwortet, **während seine eigene Anfrage (`eagleeye.request`) noch wartete**; das war die bisher nur simulierte Annahme A3 und ist damit live belegt (Testfall B, Ergebnis `ok`).
  Die Rückfrage an den GM selbst (F1, Selbstabfrage) und an den Spieler (F3) lieferte beide eine Antwort, die keine Bestätigung war. Warum, sagt die Konsole nicht; nach dem Code ist es die erfundene Kennung, die im jeweiligen Client nicht offen war (nicht einzeln belegt).
- **Jede Ablehnung nennt den Grund im GM-Client**, ohne ihn dem Aufrufer preiszugeben: Der Spieler bekommt in allen drei Fällen denselben allgemeinen Satz, die GM-Konsole den genauen Grund (`the answer is not a confirmation from that user`, `the question failed: …`).
- **Der GM-Fall bleibt lokal:** `asked by` ist die eigene ID, es gibt keine Rückfrage und keine Warnung.
- **Belegte Fakten zur Oberfläche** (Screenshots): Modulname als Titel des Rahmens, Versionszeile `Version 0.0.1 (API 0.5.0)`, Tab A mit Open-Knopf und vier Einstellungen (Häkchen, Auswahl, Schieberegler mit Zahlenfeld `10`, Häkchen mit Hinweis "Takes effect after a reload."), Tab D mit einem Textfeld; Label links, Feld rechts (`standard-form`). Die aktive Registerkarte ist laut Projektleiter hervorgehoben.

---

## Findings

| # | Befund | Severity | Folge |
|---|---|---|---|
| F1 | **Der Titel im Rahmen sitzt zu nah an der Tab-Leiste.** Die Überschrift wirke "immer noch zu nah an den Registerkarten"; da die aktive Registerkarte hervorgehoben ist, "kann die Überschrift auch ganz weg". Damit ist das Ziel von Nacharbeit 2 (AC-M3R2-03) nicht erreicht. | `low` | **Entscheidung des Projektleiters: Die Überschrift entfällt.** Nacharbeit 3 (Versuch 2 von 2, `m3-rework-3-output.md`); offen ist nur, ob der Rahmen bleibt. Der Deploy läuft gebündelt mit dem M6b-Paket. |
| F2 | Test E (der Spieler sieht den Hub-Knopf nicht), die 5-Sekunden-Grenze der Rückfrage und die Rückfrage an einen **nicht verbundenen** Nutzer sind in Flight Control selbst nicht ausgelöst worden. Foundrys Verhalten dazu ist aus dem Spike belegt (`User [<id>] is not active`, sofort). | `info` | bleibt `unverified`, nicht blockierend |

Kein Sicherheitsfund: Keine der drei Fälschungen lieferte `ok`.

---

## Restrisiken

- **M6a-R1 (`medium`, angenommen):** Der Teil "Foundry verhält sich in der Kombination anders als angenommen" (S9) ist **durch diesen Live-Check geschlossen**. Es bleibt das mit der Human Decision 1 ausdrücklich angenommene Restrisiko: Der Schutz gilt gegen die Fälschung einer **fremden** Identität, nicht gegen einen Nutzer, der sich selbst ausgibt (S4 bis S6), und die Modul-`id` bleibt eine Vertrauensgrenze (S10). Unverändert, im Vertrag Teil 5 beschrieben.
- **S7 (`low`):** keine Ratenbegrenzung der Rückfragen; M8.

## Weiterhin `unverified` (nicht blockierend)

Mehrere GMs gleichzeitig; ob ein Assistent eine Welteinstellung schreiben darf (M6b relevant); `scope: "user"`; Stabilität der Nutzer-IDs; Test E; ob ein eingetippter Wert über dem Maximum vom Regler begrenzt wird (in diesem Check nicht geprüft).

---

## Folgen für die Dokumente

- `docs/api-contract.md` Abschnitt 8: Teil 5 als live belegt eingetragen (Bestätigung, Antwort während der eigenen Anfrage, drei abgelehnte Fälschungen); die Grenzen (`unverified`) angepasst.
- `docs/ui-guide.md`: Beobachtung zum Titel im Rahmen und zur hervorgehobenen Registerkarte nachgeführt.
- `dadm/README.md`: M6a abgeschlossen und live bestätigt.

---

## Recommendation

**M6a schließen.** Nächster Schritt ist M6b (Rechte je Modul und Nutzer): Discover und Apply eigenständig, danach Stopp für das "Go". Der Rahmen im Hub (Nacharbeit 3) wird mit dem M6b-Paket ausgeliefert, wenn der Projektleiter es im "Go" so bestätigt.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6a-05-live-check-output.md` (dieses Dokument) | immutable |
| `dadm/m3-rework-3-output.md` (Protokoll und Design zu F1) | immutable |

---

## Next Step

M6b: `m6b-01-discover-output.md`, dann `m6b-02-apply-output.md`; Stopp vor dem Deploy für das "Go" des Projektleiters.

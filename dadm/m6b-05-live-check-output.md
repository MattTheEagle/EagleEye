# M6b — Live-Check mit GM und Spieler — Auswertung (Nachtrag zum Monitor)

```
artifact: live-check-output
milestone: M6b (mit Test E zu M3, Nacharbeit 3)
phase: MONITOR (Nachtrag)
status: complete
date: 2026-09-20
```

retention: immutable

Nachtrag zu `m6b-04-monitor-output.md`, das unverändert bleibt. Der Live-Check lief in zwei Durchgängen: Teil 1 (Tests A bis E, Konsolen und zwei Screenshots) und Teil 2 (Wiederholung der Kernfrage mit echten UUIDs, ohne Neuladen). Dieses Dokument fasst beide zusammen.

---

## Input Summary

- **Umgebung:** Foundry v13 Stable, Build 351, Forge, dnd5e 5.3.3; laut Anzeige sechs aktive Module. GM `matteagle404` (`LmS6Y5vvR5k7wX71`) und Spieler `matttheeagle` (`YvMJ2d7AkPP3I4pT`) in zwei Sitzungen.
- **Pakete:** `eagleeye-v13-m6b.zip`, Dummys a und d (API `0.6.0`; b und c unverändert). Das Spike-Modul war deaktiviert.
- **Teil 1:** Test A (Spieler ohne Freigabe), Test B (Freigabe im Hub), Test C (mit den **Platzhaltern** der Anleitung statt echter UUIDs), Test D (Sperren), Test E (Aussehen, Screenshots).
- **Teil 2:** die Hilfszeilen `tp(uuid)` (`flightcontrol.targetping`) und `st()` (Stufe, `ping`, `gmping` in einer Zeile) mit den Akteuren `Actor.t0edq7mEyI85lxt7` und `Actor.e0KC9kLTnmAV2nNZ`, dazu `getRights` und die Änderung ohne Neuladen.
- **Nicht durchgeführt:** die optionalen Prüfungen mit einem Assistenten und einem zweiten Spieler.

---

## Validation Result

**AC-M6b-11 und AC-M6b-12 sind erfüllt. M6b ist abgeschlossen** (Status: Completed). Ein Spieler darf ein Modul erst nach der Freigabe im Hub nutzen; bei "Own targets only" laufen Anfragen für ein Dokument, das ihm gehört, und werden für ein anderes verweigert; bei "Own and foreign targets" laufen beide; die Änderung kommt ohne Neuladen beim Spieler an. **Der Hub gefällt** (Test E), damit ist auch die Nacharbeit 3 erledigt.

| Prüfung | Erwartet | Beobachtet | Ergebnis |
|---|---|---|---|
| A: Spieler ohne Freigabe | `ping` und `gmping` `not-permitted`, `rights: denied`; der GM: alles `ok`, `rights: all`, eine Warnung | Spieler: `request rejected for eagleeye-dummy-a (flightcontrol.ping): not-permitted - module "eagleeye-dummy-a" may not be used by this user` (vom Client des Spielers selbst geloggt), `ping: not-permitted - module … may not be used by this user`, `this user: YvMJ2d7AkPP3I4pT (GM: false)`, `rights: denied`, `gmping: not-permitted - module … may not be used by this user`. GM: `ping: ok`, `rights: all`, `gmping: ok … ran by LmS6Y5vvR5k7wX71 (GM: true), asked by LmS6Y5vvR5k7wX71`, die Diagnosezeile und **eine** Warnung `relayed request rejected for eagleeye-dummy-a (flightcontrol.gmping): not-permitted - module "eagleeye-dummy-a" may not be used by this user`. Dummy D: `invalid-payload` auch für den Spieler (die Rechte kommen nach der Datenprüfung). | **erfüllt** |
| B: Freigabe im Hub | Rechte-Block mit einer Auswahl je Spieler; die Wahl bleibt nach dem Neuladen | Screenshot Tab A: Rechte-Block "Who may use this module", `matttheeagle` = "Own targets only"; Notiz des Projektleiters "DM: No Setting Changes after reload" (gelesen als: die Auswahl blieb nach dem Neuladen erhalten) | **erfüllt** |
| B/Teil 2: `getRights` | zeigt die Stufe | `{ok: true, value: {level: 'own'}}` | **erfüllt** |
| Teil 2: Stufe `own`, `st()` | `{"level":"own","ping":"ok","gmping":"ok"}` | genau das | **erfüllt** |
| Teil 2: Stufe `own`, eigenes Ziel | `ok` | `tp("Actor.t0edq7mEyI85lxt7")` → `ok {"apiVersion":"0.6.0","module":"eagleeye-dummy-a","uuid":"Actor.t0edq7mEyI85lxt7","askedBy":"YvMJ2d7AkPP3I4pT"}` | **erfüllt** |
| Teil 2: Stufe `own`, fremdes Ziel | `not-permitted` | `tp("Actor.e0KC9kLTnmAV2nNZ")` → `not-permitted: module "eagleeye-dummy-a" may act only on targets this user owns` | **erfüllt** |
| C (Teil 1 und 2): Ziel, das es nicht gibt | `not-permitted`, derselbe Satz | `tp("Actor.doesNotExist0000")` → `not-permitted: module "eagleeye-dummy-a" may act only on targets this user owns` (in Teil 1 auch für die Platzhalter-Texte, die keine UUID sind) | **erfüllt** |
| Teil 2: Stufe `all` | beide Akteure `ok`, `st()` mit `level` `all` | `tp` für beide `ok`, `st()` → `{"level":"all","ping":"ok","gmping":"ok"}` | **erfüllt** |
| D/Teil 2: Sperren **ohne Neuladen** | `st()` zeigt `denied`, beide Anfragen `not-permitted … may not be used by this user` | `{"level":"denied","ping":"not-permitted: module \"eagleeye-dummy-a\" may not be used by this user","gmping":"not-permitted: module \"eagleeye-dummy-a\" may not be used by this user"}`, dazu beide Warnungen in der Konsole des Spielers; nach dem Neuladen in Teil 1: `gmping` ebenso `not-permitted` | **erfüllt** |
| E: Aussehen | Tab ohne Titel und Rahmen und der Rechte-Block sehen gut aus (AC-M6b-12) | Screenshots von Tab A (Version, Open, vier Einstellungen, Rechte-Block) und Tab D (Version, eine Einstellung, Rechte-Block mit "Denied"); Projektleiter: "Hub gefällt mir so gut" | **erfüllt** |

---

## Evidence Summary

- **Der Standard "verboten" hält, in beiden Wegen.** Für einen Typ, der im eigenen Client läuft (`ping`), verweigert der Client des Spielers selbst (die Warnung steht in seiner Konsole, der GM ist nicht beteiligt); für einen Typ, der beim GM läuft (`gmping`, `targetping`), verweigert der GM nach der Bestätigung und loggt den Grund. Ein Spieler bekommt in keinem gezeigten Fall `ok` ohne Freigabe.
- **Die Besitzprüfung unterscheidet eigenes und fremdes Ziel live.** Bei "Own targets only" beantwortet der GM `targetping` für den einen echten Akteur und verweigert den anderen; bei "Own and foreign targets" beantwortet er beide. Damit ist belegt, dass Foundrys `testUserPermission(user, "OWNER")` auf dem GM-Client für einen **anderen** Nutzer (den Spieler) das leistet, was das Design annimmt (Discover U3, Risiko R5 für Spieler-Rollen). Welcher der beiden Akteure dem Spieler gehört, ergibt sich aus der Vorbereitung (Zeile mit `spieler besitzt: …` in der GM-Konsole); deren Ausgabe liegt mir nicht vor. Die Ergebnisse sind nur mit der Zuordnung stimmig, dass `t0edq…` dem Spieler gehört und `e0KC…` nicht (bei `own` ein Akteur `ok`, der andere verweigert; bei `all` beide `ok`).
- **Ein Ziel, das sich nicht auflösen lässt, gilt als nicht eigen** und wird mit demselben Satz verweigert wie ein fremdes: für eine UUID, die es nicht gibt, und für Text, der keine UUID ist. Kein `internal-error`, kein `handler-failed`: fail closed ohne Absturz.
- **Eine Änderung der Rechte kommt ohne Neuladen an** (Discover U2 beantwortet): Nach dem Sperren im Hub zeigte die Konsole des Spielers **vor** dem Neuladen `level: denied`, und beide Anfragen wurden verweigert. Der Client des Spielers liest die Welteinstellung also live; die Bindung beim GM hing davon ohnehin nicht ab.
- **Der Schreibweg des Hubs funktioniert live:** Der GM wählt die Stufe, sie wird als Welteinstellung `eagleeye.rights` (Text, `config: false`) gespeichert, bleibt nach dem Neuladen und erreicht den Client des Spielers.
- **`getRights` liefert die Stufe des aktuellen Nutzers:** `all` für den GM, `denied`, `own` und `all` für den Spieler je nach Wahl im Hub.
- **Die Regeln aus M6a bleiben:** Der GM bestätigt den Spieler vor der Rechteprüfung (die Warnungen zeigen weiter die Ablehnung durch die Rechte, nicht durch die Bestätigung).

---

## Findings

| # | Befund | Severity | Folge |
|---|---|---|---|
| F1 | Test C lief in Teil 1 mit den Platzhaltern der Anleitung (`<UUID des Akteurs …>`) statt mit echten UUIDs. | erledigt | Teil 2 hat die Kernfrage mit echten UUIDs gezeigt |
| F2 | Das Ergebnis von `getRights` war in Teil 1 eingeklappt; die Zeilen des Spielers nach der Freigabe fehlten. | erledigt | Teil 2: `getRights` `own`, `st()` mit `ping` und `gmping` `ok` |
| F3 | Nacharbeit 3 (Titel und Rahmen entfallen, Variante B): erfüllt, der Projektleiter ist zufrieden. Kein weiterer Versuch nötig; `docs/ui-guide.md` führt die Beobachtung als Regel R-14. | erledigt | — |

**Kein Sicherheitsfund:** Kein Spieler hat ohne Freigabe `ok` bekommen; bei "Own targets only" hat ein fremdes Ziel und ein Ziel, das es nicht gibt, nie `ok` ergeben.

---

## Restrisiken

- **R1 bis R3 (`medium`, mit dem "Go" angenommen):** beim GM bindend und im eigenen Client umgehbar; die Modul-`id` ist selbst angegeben; ob Foundry einem Assistenten das Schreiben von Welteinstellungen erlaubt, ist offen. Unverändert.
- **R4 (`medium`) teilweise geschlossen:** Für einen Spieler ist die Besitzprüfung auf dem GM-Client belegt und die Änderung ohne Neuladen auch. Offen bleibt, was `testUserPermission` für einen GM, ein Dokument in einem Compendium und die Stufe "Inherit" ergibt, und die Nutzerliste bei gelöschten oder neuen Nutzern.

## Weiterhin `unverified` (nicht blockierend)

Der Rechte-Block für einen Assistenten (er soll fehlen; Assistentenkonto nicht angelegt) und ob Foundry einem Assistenten das Schreiben der Welteinstellung erlaubt (U1); mehr als ein Spieler (die Stufen je Nutzer sind nur in der Simulation gezeigt); mehr als ein GM (U5); die Besitzprüfung für GM, Compendium und "Inherit" (U3); gelöschte und neu angelegte Nutzer (U4). Aus M5 und M6a unverändert: mehrere GMs, `scope: "user"`, Stabilität der Nutzer-IDs, Test E (Spieler sieht den Hub-Knopf nicht), die 5-Sekunden-Grenze und ein nicht verbundener Nutzer in Flight Control selbst.

---

## Folgen für die Dokumente

- `docs/api-contract.md` Abschnitt 8: Teil 6 als live belegt eingetragen (Standard "verboten" in beiden Wegen, eigenes und fremdes Ziel, `all`, `getRights`, Änderung ohne Neuladen); unter "not verified" bleiben die Punkte oben.
- `docs/ui-guide.md`: Regel R-14 (schon nachgeführt).
- `dadm/README.md` und Memory: M6b abgeschlossen.

---

## Recommendation

**M6b schließen** (Status: Completed). Nächster Schritt ist M7 (DnD-Versionswächter): Discover und Apply eigenständig, Stopp vor dem Deploy für das "Go".

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6b-05-live-check-output.md` (dieses Dokument) | immutable |

M6b-Abschlusskette: `m6b-01-discover-output.md`, `m6b-02-apply-output.md`, `m6b-03-deploy-output.md`, `m6b-04-monitor-output.md`, `m6b-05-live-check-output.md` (alle `immutable`), dazu `m3-rework-3-output.md`.

---

## Next Step

M7: `m7-01-discover-output.md`, dann `m7-02-apply-output.md`; Stopp vor dem Deploy für das "Go" des Projektleiters.

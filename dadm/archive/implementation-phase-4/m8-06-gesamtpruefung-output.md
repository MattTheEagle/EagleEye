# M8 — Gesamtprüfung der Umsetzungsphase 4 "Eagle Flight Control" — Output

```
artifact: overall-check-output
milestone: M8
phase: MONITOR (Nachtrag: Gesamtprüfung)
status: complete
date: 2026-09-20
```

retention: immutable

Gesamtprüfung nach dem Plan (M8): jede Zeile der Rückverfolgung P-FC1 bis P-FC8 mit Beleg, je Milestone die Akzeptanzkriterien mit Stand, die offenen Live-Punkte mit der Entscheidung des Projektleiters. Grundlage sind die Outputs `m1-*` bis `m8-05`, die Live-Check-Nachträge, der Vertrag `docs/api-contract.md` und der Stand des Repos. Konto-Namen und Nutzer-IDs stehen hier nicht.

---

## Urteil

**Der Umfang der Phase ist erfüllt.** Von den acht Zeilen der Rückverfolgung sind sechs live belegt (P-FC1, P-FC3, P-FC4, P-FC5, P-FC7 und P-FC6 im Umfang des Plans), eine ist durch den Vertrag abgedeckt (P-FC2), eine entfällt nach Entscheidung (P-FC8). Es gibt **keinen offenen Fund mit `medium` oder höher**; alle bewusst eingegangenen Risiken (`medium` und `high`) hat der Projektleiter mit dem jeweiligen "Go" angenommen. Die offenen Live-Punkte sind entschieden (angenommen oder als Restrisiko geführt). Ein Punkt der Akzeptanz ist **teilweise** (AC-M8-07: die Nachträge für die gemeinsame Referenz sind entworfen, aber nicht freigegeben).

**Stand in Zahlen:** Modul `0.1.0`, API `0.7.0`, 162 Tests in 18 Dateien (alle grün), Bundle 55.924 Byte, keine Laufzeit-Abhängigkeit, Vertrag und Manifest durch Tests gegen den Code gehalten (63 von 63 Gegenproben gefunden).

---

## 1. Rückverfolgung P-FC1 bis P-FC8

| P-FC | Anforderung | Milestones | Belege | Urteil |
|---|---|---|---|---|
| P-FC1 | Schnittstelle zwischen Foundry, DnD-5e-System und Eagle Modulen | M2, M4, M7, M8 | `m2-05` (Anmeldung), `m4-05` (Anfragen), `m7-05` (Wächter, Standardfall), `m8-05` (Release-Zip) | **erfüllt, live.** Die Zustände des Wächters außer `tested` sind nicht live gezeigt (L4, vom Projektleiter als Risiko angenommen). |
| P-FC2 | Nur eigene Eagle Module angebunden | M1, M2 | `m1-04`, `m2-05`; der Vertrag schließt fremde Module aus (Entscheidung E6: "nur im Vertrag ausschließen") | **erfüllt durch den Vertrag.** Technisch wird es nicht erzwungen; eine Anmeldung durch ein fremdes Modul zählt als registriert (im Vertrag so festgehalten). |
| P-FC3 | Hub bündelt die Einstellungen der Module | M3, M6b | `m4-05`, `m5-05`, `m6b-05` | **erfüllt, live** |
| P-FC4 | Registerkarte je installiertem aktivem Modul | M3 | `m4-05`: Tabs für a und d; b (ohne Anmeldung) und c (inkompatibel) ohne Tab; `m8-05`: c wird weiter abgewiesen | **erfüllt, live** |
| P-FC5 | Modul aus dem Hub starten | M3 | `m4-05`: "Open" ruft die Startfunktion | **erfüllt, live** |
| P-FC6 | Versteht Foundry-API und DnD-Systemlogik | M7 | `m7-05`, `m8-05` | **nur der Versionswächter (so im Plan), live für `tested`.** Die übrigen Zustände: L4, angenommen. |
| P-FC7 | Empfängt Anfragen und führt sie aus | M4, M5, M6a, M6b, M8 | `m4-05`, `m5-05`, `m6a-05`, `m6b-05`, `m8-05` | **erfüllt, live**, mit Weiterleitung an den Spielleiter, Bestätigung des Nutzers und Rechten je Modul und Nutzer. Es gibt genau drei Nachweis-Anfragetypen; fachliche Anfragetypen kommen mit den Modulen, die sie brauchen. |
| P-FC8 | Klartext und Code | — | Entscheidung U2 | **entfällt in dieser Phase** (bleibt ein Plan-Punkt) |

---

## 2. Akzeptanzkriterien je Milestone

| Milestone | Kriterien | Stand | Belege und Bemerkung |
|---|---|---|---|
| M1 Phase-1-Code schneiden | AC-M1-01 bis -12 | **12 von 12 erfüllt** | `m1-03`, `m1-04` (01 bis 11); live: `m2-05` (Modul lädt, Startlog), `m4-05` (das alte Menü "EagleEye Hub" ist weg) |
| M2 Modul-Anmeldung | AC-M2-01 bis -12 | **12 von 12 erfüllt** (12: Kern) | `m2-04`; live `m2-05`: a `ok`, c abgewiesen, `api` erreichbar. Nicht blockierend offen: Aktivierung von b, Reihenfolge der `init`-Callbacks, Erzwingen von `compatibility`. Die deaktivierte Voraussetzung ist für den Modul-Manager beantwortet (`m8-05`). |
| M3 Hub-Oberfläche | AC-M3-01 bis -13 | **13 von 13 erfüllt** (13 zuerst mit Einschränkungen) | `m3-04`, `m4-05`; Optik und Dauerhaftigkeit der Werte durch die Nacharbeiten und `m5-05`, `m6b-05` geschlossen |
| M3 Nacharbeit 1 (Feld-Anordnung) | AC-M3R-01 bis -03 | **erfüllt** | `m5-05` (`standard-form`, Schieberegler, ein `onChange`); der zu große Wert: `m8-05` |
| M3 Nacharbeit 2 (Rahmen mit Titel) | AC-M3R2-01 bis -03 | 01 und 02 erfüllt; 03 live gesehen, **ersetzt** | `m6a-05`: der Titel sitzt zu nah an der Tab-Leiste; Nacharbeit 3 ersetzt sie |
| M3 Nacharbeit 3 (kein Titel im Tab) | AC-M3R3-01 bis -03 | **erfüllt** | `m6b-05`: "Hub gefällt mir so gut"; im Leitfaden Regel R-14 |
| M4 Anfragekanal-Kern | AC-M4-01 bis -11 | **11 von 11 erfüllt** | `m4-04`, `m4-05` |
| M5 Weiterleitung an den Spielleiter | AC-M5-01 bis -12 | **12 von 12 erfüllt** | `m5-04`, `m5-05` (a bis d, AC-M5-07 live); Test E (Spieler ohne Menüknopf): `m8-05` |
| M6a Verifizierte Nutzeridentität | AC-M6a-01 bis -12 | **12 von 12 erfüllt** | `m6a-04`, `m6a-05` |
| M6b Rechte je Modul und Nutzer | AC-M6b-01 bis -12 | **12 von 12 erfüllt** | `m6b-04`, `m6b-05` |
| M7 Versionswächter | AC-M7-01 bis -07 | **7 von 7 erfüllt** (07 für das Standardpaket) | `m7-04`, `m7-05`; die Reaktionen für die anderen Zustände: L4, angenommen |
| M8 Abschluss | AC-M8-01 bis -11 | **10 von 11 erfüllt, AC-M8-07 teilweise** | `m8-03` bis `m8-05`; AC-M8-09 ist mit diesem Dokument erfüllt; AC-M8-07: Übergabenotiz und Entwurf der `SUMMARY.md` liegen vor, der Eintrag in `cheat-sheet.md` ist nicht erfolgt (nicht freigegeben) |

---

## 3. Die offenen Live-Punkte mit Entscheidung

| Punkt | Stand nach M8 | Entscheidung |
|---|---|---|
| **L1** Fehlerwege des Relais (`relay-timeout`, `relay-failed`), mehrere Spielleiter | offen | Fehlerwege (Gruppe C): mit dem "Go" als Restrisiko angenommen. Mehrere Spielleiter (Gruppe B, zweites Konto nötig): nicht geprüft, Restrisiko. |
| **L2** Bestätigung: nicht verbundener Nutzer, 5-Sekunden-Grenze | nicht verbundener Nutzer: **live bestätigt** (`m8-05`); 5-Sekunden-Grenze offen | 5-Sekunden-Grenze: Restrisiko (Gruppe C) |
| **L3** Rechte: Assistent, mehrere Spieler, Besitzprüfung für Spielleiter, Compendium, "Inherit", gelöschte Nutzer | offen | Gruppe B (weitere Konten nötig): Restrisiko, solange nichts anderes entschieden wird |
| **L4** Wächter: Hinweis beim Spielleiter zur Zeit `ready`, Zustände außer `tested`, was ein Spieler sieht | nicht durchgeführt | **vom Projektleiter angenommen** ("A Risk I'm willing to take"; seine Begründung: das Fünfte-Edition-System richte sich auf eine 6.0.x aus, die nur unter Foundry v14 läuft, und 5.3.3 sei die zu erwartende letzte Version für v13; das ist seine Einschätzung) |
| **L5** Hub: abgelehnter Wert, Regler über dem Maximum, Hub für einen Spieler | Regler: **beantwortet** (das Zahlenfeld begrenzt selbst); Spieler ohne Menüknopf: **live bestätigt**; "Wert ablehnen, Feld zurücksetzen, Hinweis": nur Tests (mit einem Regler nicht auslösbar) | Rest: Restrisiko `low` |
| **L6** Fehlergründe `invalid-request`, `unsupported-version`, `handler-failed`, `internal-error` | die beiden ersten **live bestätigt**; `handler-failed` und `internal-error` nur Tests | Gruppe C: angenommen |
| **L7** Reihenfolge der `init`-Callbacks, deaktivierte Voraussetzung, Erzwingen von `compatibility` | deaktivierte Voraussetzung: **beantwortet für den Modul-Manager** (Foundry verhindert das Abwählen); die Reihenfolge und das Erzwingen sind offen | Restrisiko (die Reihenfolge ist für das Design ohne Bedeutung, weil ab `setup` angemeldet wird) |
| **L8** `scope: "user"`-Einstellungen, Stabilität der Nutzer-IDs | offen | Gruppe C: angenommen (nur beobachtbar) |

---

## 4. Governance-Bilanz

- **Human Decision:** eine (`m6-hd-1-output.md`, Nutzeridentität, Entscheidung "modify": Rückfrage beim genannten Nutzer, Spike vorab). Keine weiteren Trigger; kein `critical`-Fund in der Phase.
- **Rework:** die Hub-Nacharbeiten 1 bis 3 in M3 (Nacharbeit 3 war Versuch 2 von 2 für den Befund "Titel zu nah"; das Limit wurde nicht überschritten, der Projektleiter ist zufrieden).
- **Angenommene Risiken (`medium` und `high`):** M3 R1, M4 R1 (`high`, Formatstabilität), M5 R1 und R3, M6a R1 und R2, M6b R1 bis R3; jeweils mit dem "Go" des Projektleiters. Die Risiken von M7 und M8 sind alle `low`.
- **Offene Funde `medium+`:** keine.
- **Cross-Milestone-Änderung in M8:** `v13/relay.ts` (M5: Diagnosezeile entfernt) und zwei Stellen in den bestätigten Plänen; beides vom "Go" gedeckt. In die gemeinsame Referenz (`foundry-vtt-reference-v13/`) wurde **nichts** geschrieben.
- **Dependency-Änderungen:** keine.

---

## 5. Stand des Repos und der Artefakte

- **Lokal committet bis `1b4bf87`** (18 Commits vor `origin/master`); **nichts gepusht**, Tag nur `v13-v0.0.1` (der einmalige Nachweis aus Phase 1).
- **Uncommittet:** `dadm/m7-05`, `dadm/m8-01` bis `m8-06`, `dadm/README.md`, `dadm/uebergabe-naechste-phase.md`, `dadm/entwurf-summary-implementation-phase-4.md`, die zwei Stellen in den Plänen, der M8-Code und die Metadaten (`v13/relay.ts`, `v13/module.ts`, `v13/module.json`, `v13/package.mjs`, `package.json`, `package-lock.json`, `.gitignore`), die Tests `core/manifest.test.ts` und `core/api-contract.test.ts`, `docs/api-contract.md`, `docs/ui-guide.md` und `README.md`.
- **Release-Dateien:** `release/eagleeye-v13.zip` und `release/module.json` (gitignoriert), in Forge abgenommen (`m8-05`); Prüfsummen in `m8-04`.
- **Lebende Dokumente:** `dadm/uebergabe-naechste-phase.md`, Entwurf der `SUMMARY.md`.
- **Datenschutz:** Sechs Prozessdokumente enthalten Namen von Test-Konten und/oder Foundry-Nutzer-IDs (`m5-05`, `m6-spike-1-result`, `m6a-05`, `m6b-04`, `m6b-05`, `m7-05`); auf `origin/master` liegt davon nichts, und die Dokumente von M8 enthalten keine. E-Mail-Adresse, Forge-Adressen und Zugangsdaten stehen in keiner Datei. Ob das GitHub-Repo öffentlich ist, habe ich nicht geprüft.

---

## 6. Release-Entscheidung

Die Phase ist technisch abgeschlossen; **ob und wann ein Release veröffentlicht wird, entscheidest du ausdrücklich.** Ich habe nichts veröffentlicht.

| Option | Was sie bedeutet | Für und Gegen |
|---|---|---|
| **A: jetzt veröffentlichen** (Tag `v13-v0.1.0`, Push, GitHub-Release) | Die Manifest-URL wird nutzbar; Forge kann per Manifest-URL installieren; ein festes Tag, auf das die Library später verweisen kann | Für: Meilenstein-Abschluss passt zum Hybrid-Workflow; die Installation per Manifest-URL wäre ein zweiter Weg, den erst ein echtes Release prüfen kann. Gegen: Der Push macht alle Prozessdokumente für jeden sichtbar, der das Repo lesen darf; vorher braucht es die Datenschutz-Entscheidung zu den sechs Dokumenten. Es gibt noch keinen Verbraucher. |
| **B: vorbereitet lassen, später veröffentlichen** | Alles ist gebaut und abgenommen; `npm run package` erzeugt es jederzeit neu | Für: nichts geht verloren, die Datenschutz-Frage kann in Ruhe geklärt werden, die Version kann mit dem ersten Verbraucher zusammen erscheinen. Gegen: Die Manifest-URL bleibt ohne Release. |
| **C: nicht veröffentlichen** | Die Phase endet lokal | wie B, ohne Termin |

**Meine Empfehlung: B**, und erst dann A, wenn du die Datenschutz-Entscheidung getroffen hast (die Dokumente so lassen, neutralisieren oder keinen Push). Das Release lässt sich jederzeit aus dem Stand bauen; ein früher Push ist nicht nötig, um die Phase abzuschließen. Die Checkliste mit den Befehlen steht in `m8-04-monitor-output.md`.

---

## Recommendation

**M8 und damit die Umsetzungsphase 4 als abgeschlossen bewerten** (Status: Completed), mit den angenommenen Restrisiken aus Abschnitt 3. Danach, jeweils einzeln und auf deine Antwort: lokaler Commit (kein Push), Nachträge für `cheat-sheet.md`, Release-Entscheidung, Archivieren.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m8-06-gesamtpruefung-output.md` (dieses Dokument) | immutable |

M8-Abschlusskette: `m8-01-discover-output.md`, `m8-02-apply-output.md`, `m8-03-deploy-output.md`, `m8-04-monitor-output.md`, `m8-05-live-check-output.md`, `m8-06-gesamtpruefung-output.md` (alle `immutable`).

---

## Next Step

Fragen an den Projektleiter (einzeln, nichts davon ohne seine Antwort): lokaler Commit, Nachträge für `cheat-sheet.md`, Release-Entscheidung mit der Datenschutz-Frage, Archivieren nach `dadm/archive/implementation-phase-4/` mit der `SUMMARY.md`.

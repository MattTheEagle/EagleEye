# M8 — Abschluss: API-Vertrag, Gesamtprüfung, Release-Entscheidung — Apply Output

```
artifact: apply-output
milestone: M8
phase: APPLY
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Zielbild, Vertragsaufbau, Manifest und Paketierung, Prüfliste für die offenen Live-Punkte, Aufbau von Gesamtprüfung, Übergabe und Archiv, Testplan, Akzeptanzkriterien und Sicherheitsbetrachtung. Kein Code. **Der Deploy wartet auf das "Go".** **Ein Tag, ein Push oder ein GitHub-Release gehört nicht zu diesem "Go"**; sie folgen nur auf eine eigene, ausdrückliche Anweisung (Abschnitt 13).

---

## Input Summary

- `m8-01-discover-output.md` (Repo-Ist, Beleglage, offene Live-Punkte L1 bis L8, Risiken R1 bis R7, Fragen 1 bis 12), `04-milestone-plan-v2.md` (M8), `02-safety-boundaries.md`, `03-scope-declaration.md`, `06-working-mode.md`, Übergaben aus M2 bis M7
- **Vorgaben des Plans:** konsolidierter Vertrag; Gesamtprüfung gegen P-FC1 bis P-FC7 (P-FC6 nur Versionswächter, P-FC8 entfällt); Liste der offenen Live-Punkte zum Freigeben oder Annehmen; Versionsnummer in `module.json`; Übergabe an die nächste Phase; `SUMMARY.md` beim Archivieren. GitHub-Release nur auf ausdrückliche Anweisung.

---

## Solution Design

### 1. Leitlinie

- **M8 schließt die Phase; es gibt keine neue Funktion.** Der Vertrag wird zusammenhängend lesbar, die Version festgelegt, das Paket reproduzierbar gebaut, der Rest geprüft, übergeben und (auf Anweisung) archiviert. Der Code ändert sich in genau einem Punkt: Die Diagnosezeile aus M5 fällt weg.
- **Bewährtes bleibt stabil:** Abschnittsnummern des Vertrags, API-Version, Verhalten und alle Tests aus M1 bis M7. Frühere, unveränderliche Dokumente verweisen auf "Abschnitt 8" und "Abschnitt 5".
- **Nach außen wirksame Schritte sind getrennt:** Vorbereiten (Artefakte, Anleitung) im "Go", Ausführen (Tag, Push, Release) nur auf Anweisung, jeder für sich.

### 2. Entscheidungen zu den offenen Fragen des Discover

| Frage | Entscheidung | Begründung |
|---|---|---|
| 1 Aufbau des Vertrags | **T1:** Die Nummern 1 bis 10 bleiben. Innen wird der Vertrag zusammenhängend: Titel ohne "parts 1 to 7"; Kopf mit einer Liste dessen, was die API bietet; ein Inhaltsverzeichnis; die Bezeichnungen "(part 7)" und "Teil n" fallen aus dem Text (Unterabschnitte heißen "Who asked", "Rights per module and user", "The game system"); wo eine Funktion erst später kam, steht "since API 0.x.0". "part n" bleibt **nur in der Änderungshistorie**, damit die Zuordnung zu den Ausdrücken "Vertrag Teil n" in den früheren Dokumenten lesbar bleibt. | R1 aus dem Discover: Umnummerieren würde Verweise in unveränderlichen Dokumenten entwerten. Ein Verbraucher liest einen Vertrag, keine Baugeschichte. |
| 2 Versionspolitik | **T2:** Die **API-Version bleibt `0.7.0`** (M8 ändert den Vertrag nicht). Die **Modulversion** in `v13/module.json` und `package.json` wird **`0.1.0`** (bisher der Platzhalter `0.0.1` aus dem Nachweis in Phase 1). **`1.0.0`** der API erst, wenn der erste Verbraucher (Eagle Library) den Vertrag ohne Bruch benutzt hat; das steht als Regel im Vertrag (Abschnitt 5). Tag-Schema wie beim ersten Release: `v13-v<Version>`, also `v13-v0.1.0`. Die **Liste getesteter Systemversionen** (`TESTED_SYSTEM_VERSIONS`, heute `["5.3.3"]`, in der Testwelt live bestätigt) bleibt unverändert und wird bei jedem Release gegen die dann getestete Version abgeglichen (Checkliste, Abschnitt 13; Übergabe aus M7). | Modul- und API-Version sind laut Vertrag unabhängig. Eine frühe `1.0.0` würde die Zusage "bis 1.0 bricht eine Nebenversion" beenden, bevor sie genutzt wurde (R3). |
| 3 Manifest und Release-Artefakte | **T3:** `version` `0.1.0`; `description` auf Englisch (sie erscheint in Foundrys Modulverwaltung; bisher Deutsch) und ohne "In Entwicklung": "…Early release for testing."; `authors` mit dem Namen, den der Projektleiter nennt (Vorschlag `MattTheEagle`, der Name des Repos; bisher der Platzhalter "Projektleiter"); neu `url` (Repo) und `bugs` (Issues); `download` zeigt auf `v13-v0.1.0`; `manifest` bleibt; **kein `relationships.systems`** (Auftrag aus M7, T6 in `m7-02`: prüfen. Ergebnis: Foundrys Prüfung liefert nach dem dortigen Befund `false`, wenn kein angegebenes System installiert ist, und kann das Modul dann als nicht verfügbar einstufen; das ist nicht live geprüft und bräuchte einen eigenen Live-Test, während der Wächter aus M7 das System zur Laufzeit meldet; der Punkt geht als Empfehlung in die Übergabenotiz); Titel, Modul-ID und Repo bleiben (außerhalb des Scopes); keine Lizenz. In `package.json` wird die `description` auf Englisch angeglichen (Metadaten, im Scope). Ein Release besteht aus **zwei Dateien**: `module.json` und `eagleeye-v13.zip` (`module.json`, `dist/module.js`, `lang/en.json`). | Das Manifest ist das Gesicht des Moduls; die Platzhalter gehören nicht in ein Release. |
| 4 Paketier-Skript | **T4:** `v13/package.mjs` (Node, ohne Dependency), aufgerufen über `npm run package`. Es baut das Bundle, prüft das Manifest, stellt die drei Dateien zusammen, erzeugt `release/eagleeye-v13.zip` mit dem System-Werkzeug `zip` (`-r -D`: ohne Verzeichniseinträge, `module.json`, `dist` und `lang` im Wurzelverzeichnis, genau wie bei den bisherigen Live-Check-Zips, die in Forge installiert wurden) und kopiert `release/module.json`; es gibt Größe und Prüfsumme aus und bricht bei jeder Unstimmigkeit ab (Version, Download-URL, fehlende Datei, fehlendes `zip`). `release/` kommt in `.gitignore`. | Bisher entstanden die Zips von Hand. Der Ort `v13/` liegt im Schreibbereich (`03`); ein Skript ist eine Metadaten-Änderung von `package.json`, keine Dependency. Das Werkzeug `zip` ist vorhanden und bewährt; ein eigener Zip-Schreiber wäre mehr ungeprüfter Code. |
| 5 Typen für andere Repos | **T5:** keine `.d.ts`-Datei in M8. Der TypeScript-Block im Vertrag (Abschnitt 1) ist die Referenz; ein Test hält ihn gegen den Code (Testplan, Abschnitt 8 dieses Dokuments). | Es gibt noch keinen Verbraucher; eine zweite Fassung der Typen wäre ein weiteres Artefakt, das synchron bleiben müsste. Mit der Eagle Library neu bewerten. |
| 6 Restpunkte im Code | **T6:** Die **Diagnosezeile** aus M5 wird entfernt (`describeExtraArguments`, der einmalige Log, der Parameter `log`), das Verhalten der Queries bleibt. Die **Ratenbegrenzung** wird **nicht umgesetzt**, sondern im Vertrag ausdrücklich benannt (Abschnitt 4, "Forwarded requests": es gibt keine Begrenzung der Zahl gleichzeitiger Anfragen; ein veränderter Client kann den GM und einen anderen Nutzer mit Rückfragen belasten) und als Restrisiko `low` angenommen. | Die Zeile beantwortete eine Frage, die längst beantwortet ist. Die Belastung trifft Freunde am selben Tisch, gibt keine Daten preis, und eine Grenze würde einen live bestätigten Baustein (M5, M6a) ändern und legitime Schübe abweisen können. |
| 7 Pläne, README, UI-Leitfaden | **T7:** Siehe Abschnitt 10: die zwei Stellen aus M1 (Befund F1) als Pflicht; optional die zwei Status-Überschriften im "Stand der Prüfung" des Klartext-Plans; dazu das Wurzel-`README.md` und der Kopf des UI-Leitfadens. Die bestätigten Pläne werden nur geändert, weil das "Go" diesen Schritt ausdrücklich nennt (Umfang wählbar, Antwort erfragt). | Scope: Nachführen der bestätigten Pläne "nur als ausdrücklich benannter Schritt mit Freigabe". |
| 8 Offene Live-Punkte | **T8:** Die Prüfliste in Abschnitt 11 in drei Gruppen: **A** kurz (eine GM-Sitzung), empfohlen vor einem Release; **B** braucht weitere Konten (optional); **C** als Restrisiko angenommen. | Der Plan lässt das Schließen mit `unverified` nach ausdrücklicher Annahme zu. |
| 9 Gesamtprüfung | **T9:** ein eigenes Dokument (`m8-06-gesamtpruefung-output.md`): je P-FC-Zeile Beleg und Urteil, je Milestone die Akzeptanzkriterien mit Stand, die Liste der offenen Live-Punkte mit der Entscheidung. Es entsteht nach den Live-Ergebnissen. | Der Plan nennt sie als eigenes Deliverable. |
| 10 Übergabenotiz | **T10:** ein **lebendes** Dokument außerhalb des Archivs: `dadm/uebergabe-naechste-phase.md` (Stand von Flight Control, Regeln für Verbraucher, Erkenntnisse, offene Punkte, Empfehlung: Eagle Library, was der neue DAD-M-Bootstrap braucht). | Die nächste Phase soll es lesen, ohne im Archiv zu suchen. |
| 11 Archivieren | **T11:** Auf eine eigene Anweisung des Projektleiters **nach** der Release-Entscheidung: Bootstrap-Artefakte, Pläne, Freigaben und alle `m*`-Outputs wandern per `git mv` nach `dadm/archive/implementation-phase-4/`, dazu eine `SUMMARY.md` im Muster von `planning-phase-3`. Draußen bleiben `dadm/README.md` (neu geschrieben), `bios.registry.json`, `eagle-modules-projektplan.md`, `reference/` und die Übergabenotiz. Ein Entwurf der `SUMMARY.md` liegt vorher vor. | Das Muster früherer Phasen; das Verschieben ändert Pfade, deshalb erst nach der Release-Entscheidung und mit deiner Anweisung. |
| 12 Nachträge in die gemeinsame Referenz | **T12:** Ein Entwurf (Abschnitt 12) mit tatsächlich wiederverwendeten Erkenntnissen wird dem Projektleiter vorgelegt; **mit dem "Go" gilt er als freigegeben**, dann trage ich die Einträge in `foundry-vtt-reference-v13/cheat-sheet.md` ein. Ohne Freigabe schreibe ich dort nichts. | Die Referenz ist leer; die Regel der Projekt-Konfiguration verlangt den Nachtrag; das Schreiben in ein anderes Projekt ist freigabepflichtig. |

### 3. Zielbild der Dateien

| Datei | Änderung |
|---|---|
| `v13/relay.ts`, `v13/module.ts` | Diagnosezeile entfernt (`registerRelayQueries(relay)`); sonst unverändert |
| `v13/module.json` | Version, Beschreibung, Autor, `url`, `bugs`, `download` (Abschnitt 6) |
| `package.json` | `version` `0.1.0`; `description` englisch; Skript `package`; sonst unverändert (**keine Dependency-Änderung**) |
| `v13/package.mjs` | **neu** (Paketier-Skript) |
| `.gitignore` | `release/` |
| `core/manifest.test.ts`, `core/api-contract.test.ts` | **neu** (Abschnitt 8) |
| `docs/api-contract.md`, `docs/ui-guide.md` | konsolidiert; Kopf des Leitfadens aktualisiert |
| `README.md` | neu geschrieben (Abschnitt 10) |
| `EAGLE-MODULES-PLAN.md`, `dadm/eagle-modules-projektplan.md` | die benannten Stellen (Abschnitt 10) |
| `dadm/uebergabe-naechste-phase.md`, `dadm/m8-…` | Übergabenotiz, Deploy-, Monitor- und Gesamtprüfungs-Output, Entwurf der `SUMMARY.md` und der Referenz-Nachträge |
| `foundry-vtt-reference-v13/cheat-sheet.md` (extern) | nur mit dem "Go" (T12) |

Unverändert bleiben `core/request-*.ts`, `core/rights-*.ts`, `core/system-guard.ts`, `core/module-registry.ts`, `core/settings-hub.ts`, `core/hub-model.ts`, `core/json-value.ts`, `core/manifest-scanner.ts` (bleibt als ungenutzter Baustein), `v13/hub-application.ts`, `v13/rights.ts`, `v13/system.ts`, `package-lock.json`.

### 4. Ablauf (Deploy-Reihenfolge, Monitor, Abschluss)

1. **Deploy (nach dem "Go"):** Diagnosezeile entfernen; Manifest und `package.json`; `.gitignore`; Tests `core/manifest.test.ts` und `core/api-contract.test.ts`; Vertrag konsolidieren; UI-Leitfaden-Kopf; Paketier-Skript; `README.md`; die benannten Plan-Stellen; Entwurfsdokumente (Übergabe, `SUMMARY.md`, Referenz-Nachträge); dann Referenz-Nachträge schreiben (T12); Prüfen; Deploy-Output.
2. **Monitor ohne Stopp:** Abgleich der Acceptance; Anleitung für die Abnahme des **Release-Zips** (aus `release/` in Forge installieren, Test A aus M7, die Zeile fehlt, `gmping` läuft) und die Prüfliste (Abschnitt 11).
3. **Nach den Live-Ergebnissen** (eigenständig, ohne weiteres "Go", weil nur Dokumente): Gesamtprüfung, Übergabenotiz fertig, Entwurf `SUMMARY.md`, Nachführen von Vertrag Abschnitt 8.
4. **Auf eigene Anweisung:** Commit(s), Archivieren (T11), Tag, Push, Release (Abschnitt 13). Jeder Schritt einzeln.

### 5. Der konsolidierte Vertrag (T1)

Aufbau (Nummern unverändert): Kopf (Titel `Eagle Flight Control — API contract`, API-Version, Status "development: before 1.0.0 a minor version may break the API (section 5)", **"What the API offers"** als Liste der fünf Mitglieder mit je einem Satz und "since API 0.x.0", Zielgruppe), **Contents** (Abschnitte und Unterabschnitte), dann Abschnitte 1 bis 10 wie bisher. Inhaltliche Änderungen:
- "part n" entfällt außer in der Änderungshistorie. Betroffen sind: der Titel; der Absatz "Scope of this version" (wird "What the API offers"; der Satz "Later parts will extend the API …" wird "Later versions …"); der Unterabschnitt "The game system (part 7)" (wird "The game system" mit "since API 0.7.0"); die Aufzählungen in Abschnitt 8, verifiziert wie nicht verifiziert ("Part 4, the relay: …" wird "The relay (API 0.4.0): …", ebenso für die anderen Teile); der Satz "part 5 works around this …" (wird "the confirmation of the asking user works around this …"). Die Historie behält "Part n:", damit die Ausdrücke "Vertrag Teil n" in den früheren Dokumenten zuordenbar bleiben.
- Abschnitt 4, "Forwarded requests": neuer Punkt zur fehlenden Begrenzung (T6).
- Abschnitt 5: Regel zu `1.0.0` (T2) und ein Satz, dass Modul- und API-Version unabhängig sind (steht schon; bleibt).
- Abschnitt 6 ("Manifest requirements"): nennt die Modulversion des Verbrauchers nicht neu; unverändert.
- Abschnitt 8: nach den Live-Ergebnissen abschließend nachgeführt; Abschnitt 9 ("Not part of this version") und 10 bleiben, die Historie bekommt eine Anmerkung "consolidated on 2026-09-20, no API change".
- Ein **ausführbarer Test** (`core/api-contract.test.ts`) hält den Vertrag gegen den Code (Abschnitt 8 dieses Dokuments): damit ist "der Vertrag ist vollständig und stimmt mit dem Code überein" nicht nur einmal geprüft, sondern gesichert.

### 6. Das Manifest (T3, Vorschlag)

```json
{
  "id": "eagleeye",
  "title": "EagleEye",
  "description": "Eagle Flight Control (working name EagleEye): the interface between the Eagle modules, the D&D 5e system and Foundry VTT. Early release for testing.",
  "version": "0.1.0",
  "authors": [{ "name": "MattTheEagle" }],
  "url": "https://github.com/MattTheEagle/EagleEye",
  "bugs": "https://github.com/MattTheEagle/EagleEye/issues",
  "compatibility": { "minimum": "13", "verified": "13" },
  "esmodules": ["dist/module.js"],
  "languages": [{ "lang": "en", "name": "English", "path": "lang/en.json" }],
  "manifest": "https://github.com/MattTheEagle/EagleEye/releases/latest/download/module.json",
  "download": "https://github.com/MattTheEagle/EagleEye/releases/download/v13-v0.1.0/eagleeye-v13.zip"
}
```

`authors` erst nach seiner Antwort; die Datei bleibt sonst wie sie ist.

### 7. Das Paketier-Skript (T4)

`npm run package` (= `node v13/package.mjs`):
1. `v13/module.json` lesen und prüfen: `id` `eagleeye`; `version` streng `x.y.z` und gleich der in `package.json`; `download` = `…/releases/download/v13-v<version>/eagleeye-v13.zip`; `esmodules` und `languages` zeigen auf Dateien, die es nach dem Bauen gibt.
2. `npm run build` (esbuild) ausführen; `v13/dist/module.js` muss danach da sein.
3. In `release/stage/` die Dateien `module.json`, `dist/module.js`, `lang/en.json` zusammenstellen.
4. `zip -q -r -D` (wie bei den bisherigen Live-Check-Zips) nach `release/eagleeye-v13.zip`; `v13/module.json` nach `release/module.json` kopieren.
5. Ausgabe: beide Dateien mit Größe und SHA-256; bei jeder Unstimmigkeit ein klarer Text und Exit 1 (auch bei fehlendem `zip`).
Der Ordner `release/` wird zu Beginn geleert und ist gitignoriert. **Das Skript veröffentlicht nichts und fasst Git nicht an.**

### 8. Testplan (Vitest, jeder Fall ein `it`; Schleifen für Tabellenfälle)

| # | Prüfung | Datei |
|---|---|---|
| P1 | Manifest: `id` `eagleeye`, `version` streng `x.y.z`, `download` und `manifest` nach dem Schema, `esmodules` `["dist/module.js"]`, `languages` zeigt auf `lang/en.json` (Datei vorhanden), `compatibility` 13/13, `url` und `bugs` gesetzt, jeder Autor hat einen Namen und keiner ist der Platzhalter "Projektleiter", die Beschreibung enthält keinen Hinweis "In Entwicklung" | `manifest.test.ts` |
| P2 | `package.json`: `version` gleich der des Manifests, `private`, keine neuen Abhängigkeiten (`dependencies` fehlt, `devDependencies` genau esbuild, typescript, vitest) | dito |
| P3 | Vertrag gegen Code: API-Version, Kompatibilitätstabelle gegen `isApiCompatible`, Beispiele mit der aktuellen API-Version | `api-contract.test.ts` |
| P4 | Vertrag gegen Code: Fehlercodes der Anmeldung und der Anfragen (Code = Tabelle = TypeScript-Block), Grenzen (15 s, 65.536 Zeichen, 5 s), Anfragetypen (Tabelle = Handler) | dito |
| P5 | Vertrag gegen Code: die fünf API-Mitglieder (Code = Text = TypeScript-Block), Stufen der Rechte, Ablehnungstexte, Zustände und Liste des Systemwächters, Fehlergründe von `getRights` und `getSystemInfo` | dito |
| P6 | Vertrag als Ganzes: Abschnittsnummern 1 bis 10 unverändert, "part n" außer in der Historie nirgends, Inhaltsverzeichnis nennt alle Abschnitte, Historie hat je API-Version eine Zeile und endet bei der aktuellen | dito |
| P7 | Vertrag: die Regel zu `1.0.0` und der Punkt "no limit" stehen im Text | dito |

Erwartet: 7 bis 9 neue Tests, insgesamt etwa 144 in 18 Dateien. **Weitere Prüfungen im Deploy:** einmal `typecheck`, `test`, `build`; `npm run package` mit der Ausgabe (Inhalt des Zips, Prüfsumme, Bundle im Zip gleich dem gebauten); ein **negativer Lauf** (Version im Manifest verstellt: das Skript bricht ab); Suche nach verbotenen Mustern sowie nach lokalen Pfaden und Konto-Namen im Bundle und im Zip; Simulation der Weiterleitung nach dem Entfernen der Zeile (bestehende Skripte); Vergleich "nicht anzufassende Dateien unverändert"; Vertrag und Leitfaden gegen den Code.

### 9. Die Diagnosezeile (T6)

`v13/relay.ts`: `describeExtraArguments`, das Flag `diagnosed` und der Log entfallen; `registerRelayQueries(relay)` setzt `CONFIG.queries[RELAY_QUERY] = (data) => relay.receive(data)` und die Bestätigung wie bisher. `v13/module.ts` ruft die Funktion ohne `log`. Die Queries bleiben in Name, Argumenten und Wirkung gleich; der Live-Nachweis ist, dass die Zeile in der GM-Konsole fehlt und `gmping` für einen freigegebenen Spieler weiter läuft.

### 10. Nachführen von Plänen, README und Leitfaden (T7)

**`EAGLE-MODULES-PLAN.md` (bestätigter Plan), Abschnitt 3.1, "Stand der Prüfung"** (die Punkte heißen dort: Hub, Anfragen, Versionen getrennter Module, Klartext ↔ Code, Grundgerüst):
- **Pflicht (Befund F1 aus M1, Z. 103 bis 105):** Im Punkt zum Hub wird der Satz "das Grundgerüst aus der ersten Phase hat bereits ein solches Fenster (bisher eine Tabelle ohne Registerkarten)" ersetzt durch "der Hub wurde in der Umsetzungsphase 4 als Fenster mit einer Registerkarte je angemeldetem, aktivem Eagle Modul gebaut". Der Rest des Punktes (ein Eagle Modul meldet sich mit seinem Inhalt und einer Startfunktion an; weitere Module ohne Änderung an Eagle Flight Control) bleibt.
- **Optional (Frage 7 des Discover; nur wenn du es im "Go" wählst):** Die Überschriften der ersten zwei Punkte werden von "machbar" auf den geprüften Stand gehoben: "Hub mit Registerkarten und Start der Module: **umgesetzt, in Forge geprüft** (Umsetzungsphase 4)" und "Anfragen der Module an Eagle Flight Control: **umgesetzt, in Forge geprüft** (Umsetzungsphase 4, API 0.7.0: Weiterleitung an den Spielleiter mit Bestätigung des anfragenden Spielers, Rechte je Modul und Nutzer, Wächter für die Version des Systems)". Die Bewertung "(Risiko niedrig)" beziehungsweise "(Risiko mittel)" entfällt dabei zusammen mit dem Wort "machbar".
- **Unverändert:** Der Punkt zu den Versionen getrennter Module bleibt, weil das dort Genannte noch offen ist (L7: fehlendes oder deaktiviertes Eagle Flight Control, Erzwingen von Versionsspannen); er wird nur angepasst, wenn L7 aus der Prüfliste (Abschnitt 11) live geprüft wird. Ebenso bleiben "Klartext ↔ Code" (P-FC8, Entscheidung U2: entfällt in dieser Phase, bleibt ein Plan-Punkt) und der Satz "Das vorhandene Grundgerüst deckt Teile davon ab …", der auch nach M1 stimmt (`settings-hub` liest und schreibt Einstellungen, `manifest-scanner` liest Modul-Informationen).

**`dadm/eagle-modules-projektplan.md`, Abschnitt 3.1 (Z. 67), Befund F1:** Der Halbsatz "Entscheidung über Entfernen in der Umsetzungsphase (E6)" wird ersetzt durch "in M1 entschieden und umgesetzt (E6): Hub-Fenster, Konflikt-Überwachung und Fremdmodul-Sprach-Erkennung sind entfernt; `settings-hub` (vom neuen Hub benutzt) und `manifest-scanner` (getestet, nicht angeschlossen) bleiben".

**Wurzel-`README.md`** (Deutsch, wie bisher): Was es ist; Stand (erste Ausgabe 0.1.0 in Vorbereitung, noch kein Release veröffentlicht); Was Flight Control kann (Registrierung, Hub mit Einstellungen und Start, Anfragekanal mit Weiterleitung an den GM und Bestätigung, Rechte je Modul und Nutzer, Versionswächter); Installation (Forge Import Wizard mit einem Zip, später die Manifest-URL); Verweise auf `docs/api-contract.md` und `docs/ui-guide.md`; Build und Paketieren (`npm run package`); Projektprozess (`dadm/`); keine Lizenz.

**`docs/ui-guide.md`:** Kopf "written together with the Flight Control hub (API contract `0.2.0`)" wird zu "written together with the Flight Control hub; checked against API contract `0.7.0`".

### 11. Prüfliste der offenen Live-Punkte (T8)

| Gruppe | Punkte | Aufwand | Vorschlag |
|---|---|---|---|
| **A: kurz, eine GM-Sitzung, vor einem Release empfohlen** | **Abnahme des Release-Zips** (aus `release/` installieren, Test A aus M7 wiederholen, die Diagnosezeile fehlt, `gmping` läuft); L5 (der Menüknopf fehlt für einen Spieler, ein zu großer Wert im Regler); L6 (`invalid-request` und `unsupported-version` mit je einer Konsolenzeile); L7 (ein Modul, dessen Voraussetzung deaktiviert ist: Welt laden); L2, Teil "nicht verbundener Nutzer" (der Spieler verlässt die Welt, der GM fragt); L4 (die vier Prüfpakete, je ein Neuladen) | etwa 20 bis 30 Minuten zusammen | Ich schreibe im Monitor die genauen Zeilen; du entscheidest je Punkt |
| **B: braucht weitere Konten** | L3 (Assistentenkonto, zweites Spielerkonto, Besitzprüfung für GM, Compendium, "Inherit", gelöschte Nutzer), L1 (zweites GM-Konto) | Konten anlegen | optional; sonst als Restrisiko |
| **C: als Restrisiko angenommen** | L1 (Fehlerwege `relay-timeout` und `relay-failed`), L2 (die 5-Sekunden-Grenze), L6 (`handler-failed`, `internal-error`), L8 (`scope: "user"`, Stabilität der Nutzer-IDs) | von außen kaum auszulösen | mit dem "Go" angenommen |

Mit dem "Go" gilt Gruppe C als angenommen; Gruppe A empfehle ich, entscheidest aber du; Gruppe B bleibt Restrisiko, solange du nicht anders sagst.

### 12. Entwurf der Nachträge für die gemeinsame Referenz (T12)

Ziel ist `/run/media/matt/Data/matt/Coding/foundry-vtt-reference-v13/cheat-sheet.md`. Die Referenz ist **kein Git-Repository**; ich sichere die Datei deshalb vorher als Kopie im Scratchpad, **hänge nur an** und ändere im Kopf einzig den Satz "Noch leer." (er wäre danach falsch). Format der Vorlage: `## Thema`, `Quelle:`, kurzer Ausschnitt. Auf Prozessdokumente in `dadm/` verweisen die Einträge nicht, weil sie beim Archivieren umziehen; sie nennen die Quelldatei und dass es in Forge (Foundry v13, Build 351) bestätigt ist. Jede Aussage stützt sich auf einen Beleg aus diesem Projekt; was nur aus der API-Dokumentation stammt, ist so gekennzeichnet. Wörtlich (Englisch, wie die Referenz):

```markdown
## Module queries between clients (User#query)
Quelle: EagleEye, v13/relay.ts; confirmed in Forge (v13 build 351)
`CONFIG.queries["<moduleId>.<name>"] = async (data, options) => result` on the client that is asked;
`await game.users.get(id).query(name, data, { timeout })` asks it. The handler gets `(data, { timeout })` and no
information about who asked; to learn that, ask the named user's client to confirm. An inactive user rejects at once
(`User [<id>] is not active`), so does an unregistered name; an error thrown in the handler comes back as a rejection
with its message; `timeout` works; a query to oneself works. Types: `User#query` in
`types/src/foundry/client/documents/user.d.mts` takes the names from `CONFIG.queries`; add yours to `CONFIG.Queries`
(`declare global { namespace CONFIG { interface Queries { ... } } }`) so that `user.query(...)` type-checks.

## World setting as data shared with all clients
Quelle: EagleEye, v13/rights.ts; confirmed in Forge (v13 build 351)
`game.settings.register(ns, key, { scope: "world", config: false, type: String, default: "" })`. A Gamemaster writes it
with `game.settings.set`, every client reads it with `game.settings.get`, and a change reaches the other clients
without a reload. Type the key with a global `SettingConfig` augmentation (`"ns.key": string`). JSON text in a
`String` setting keeps the checking in your own code.

## Module API object for other modules
Quelle: EagleEye, v13/module.ts; confirmed in Forge (v13 build 351)
`game.modules.get(id).api = {...}` in the `init` hook; other modules read it from `setup` or later. Type it with a
global augmentation: `declare global { interface ModuleConfig { "<id>": { api: MyApi } } }`.

## ApplicationV2 window with tabs and a form
Quelle: EagleEye, v13/hub-application.ts; confirmed in Forge (v13 build 351)
Tabs: override `_prepareTabs(group)`, render `templates/generic/tab-navigation.hbs` with `{ tabs }` through
`foundry.applications.handlebars.renderTemplate`, and give every tab body the markup `section.tab` with `data-group`
and `data-tab` (plus `active` on the shown one). Forms: `window: { contentClasses: ["standard-form"] }` gives
label-left/field-right; build the fields with `foundry.applications.fields` (`createFormGroup`, `createSelectInput`,
`createCheckboxInput`) and `foundry.applications.elements.HTMLRangePickerElement.create` (slider plus number). Parse
HTML with `foundry.utils.parseHTML` and avoid `innerHTML`. A heading directly under the tab bar sat too close to it; a
`fieldset` with a `legend` for a sub-block looked right.

## Roles, ownership and UUIDs
Quelle: EagleEye, v13/relay.ts and v13/rights.ts; confirmed in Forge (v13 build 351) except where marked
`game.user.isGM` is true for the Gamemaster role and, per the API documentation, for the Assistant role (not tested with
an Assistant account); the Gamemaster role alone is `game.user.role === CONST.USER_ROLES.GAMEMASTER`;
`game.users.activeGM` is the connected Gamemaster to ask. `doc.testUserPermission(user, "OWNER")` distinguished own and
foreign documents for a player on the Gamemaster's client. `foundry.utils.fromUuid(uuid)` resolves a UUID; its type
accepts only template-literal UUIDs, so a run-time string needs a cast.

## The game system and its version
Quelle: EagleEye, v13/system.ts; confirmed in Forge (v13 build 351, dnd5e 5.3.3)
`game.system.id` (`"dnd5e"`) and `game.system.version` (a string such as `"5.3.3"`; the schema default is `"0"`) are
filled by the time of the `ready` hook.
```

### 13. Release-Vorbereitung (nur vorbereiten, nichts ausführen)

Der Monitor enthält eine **Checkliste mit den genauen Befehlen** für einen Release (Tag `v13-v0.1.0`, Push von `master` und Tag, `gh release create` mit den beiden Dateien aus `release/`), damit du sie auf Wunsch freigeben kannst. Die Checkliste beginnt mit den Vorbedingungen: Gesamtprüfung fertig; `TESTED_SYSTEM_VERSIONS` gegen die zuletzt live geprüfte Systemversion abgeglichen; Modulversion, Manifest und Tag stimmen überein (`npm run package` prüft das); Arbeitsbaum sauber und lokal committet; Datenschutz-Entscheidung getroffen. **Nichts davon führe ich ohne deine ausdrückliche Anweisung aus.** Vorher gilt (Datenschutz): Sechs Prozessdokumente (`m5-05`, `m6-spike-1-result`, `m6a-05`, `m6b-04`, `m6b-05`, `m7-05`) enthalten Namen von Test-Konten und/oder deren Foundry-Nutzer-IDs; ein Push macht sie für alle sichtbar, die das Repo lesen dürfen (ob es öffentlich ist, habe ich nicht geprüft). Auf `origin/master` liegt davon bisher nichts. Zugangsdaten, Forge-Adressen und deine E-Mail-Adresse stehen in keiner Datei des Repos (Suche im Apply); die Autorenangabe der lokalen Commits ist dieselbe wie bei den Commits, die schon auf `origin/master` liegen. Du entscheidest vor dem Push, ob die Dokumente so bleiben, durch neutrale Bezeichnungen ersetzt werden (das wäre eine ausdrückliche Ausnahme von "immutable") oder ob ein Push für jetzt entfällt.

### 14. Sicherheitsbetrachtung

| # | Bedrohung | Maßnahme im Design | Rest |
|---|---|---|---|
| S1 | Ein Release veröffentlicht mehr als gewollt (Geheimnisse, Testmodule, lokale Pfade) | Das Zip enthält genau `module.json`, `dist/module.js`, `lang/en.json` (das Skript stellt nur diese zusammen und prüft es); im Repo liegen keine Zugangsdaten, keine Forge-Adresse und keine E-Mail-Adresse (Suche im Apply mit `git grep`; einziger Treffer auf ein Zugangsdaten-Muster ist die Testzeichenfolge "Secret Boss" in `core/request-relay.test.ts`); das gebaute Bundle enthält nach Suche keine lokalen Pfade und keine Konto-Namen (im Deploy für Bundle und Zip wiederholt) | keiner |
| S2 | Ein Release ohne Anweisung | Nur vorbereiten; Tag, Push und Release nur auf ausdrückliche Anweisung, je Schritt einzeln | keiner |
| S3 | Falsche URLs im Manifest (Install führt ins Leere oder zu einem anderen Ziel) | `download` und `manifest` nach festem Schema, ein Test und das Skript prüfen es | `low` |
| S4 | Namen und IDs von Test-Konten in Prozessdokumenten, die ein Push sichtbar machen würde | Entscheidung des Projektleiters vor dem Push (Abschnitt 13) | `low` (Konten gehören ihm) |
| S5 | Das Entfernen der Diagnosezeile ändert die Queries | Verhalten unverändert (Name, Argumente, Ergebnis); Regressionsprüfung mit den bestehenden Simulationen und Live-Abnahme des Release-Zips | `low` |
| S6 | Keine Ratenbegrenzung | im Vertrag benannt, als Restrisiko `low` angenommen (T6) | `low` |
| S7 | Schreiben in die gemeinsame Referenz | nur die freigegebenen Einträge (T12) | `low` |

**Bewertung für die Governance:** kein Security-Fund `medium+`. Der Datenschutz-Punkt (S4) betrifft die eigenen Test-Konten des Projektleiters und ist `low`; er wird trotzdem vor jedem Push ausdrücklich vorgelegt. Keine Dependency-Änderung (nur Skripte und Metadaten in `package.json`). Cross-Milestone-Änderung: `v13/relay.ts` (M5), vom Plan M8 zugewiesen; die Zustimmung kommt mit dem "Go".

### 15. Übergaben

- **Nächste Phase (Eagle Library):** ein frischer DAD-M-Bootstrap (Project Brief, Safety Boundaries, Scope Declaration, Milestone Plan mit Freigabe, Working Mode); Verbraucher-Regeln stehen im Vertrag (Abschnitt 4: Ziele nennen, Bindung an Module, System-Zustände); die Typen kommen bei Bedarf (T5).
- **Ungenutzte Bausteine:** `core/manifest-scanner.ts` (Phase 1) bleibt getestet und unverdrahtet; die nächste Phase nutzt oder löscht ihn.

---

## Acceptance Criteria

```
AC-M8-01: docs/api-contract.md hat die Abschnittsnummern 1 bis 10 unverändert, ein Inhaltsverzeichnis, einen Kopf ohne "parts 1 to 7", eine Liste dessen, was die API bietet, und "part n" nur in der Änderungshistorie; die Regel zu 1.0.0 und der Punkt "keine Ratenbegrenzung" stehen im Text (P6, P7).
AC-M8-02: Der Vertrag stimmt mit dem Code überein und ein Test hält das: API-Version, Kompatibilitätstabelle, Fehlercodes, Grenzen, Anfragetypen, die fünf API-Mitglieder, Stufen, Ablehnungstexte, Zustände und Liste des Systemwächters, Fehlergründe, Beispiele (P3 bis P5).
AC-M8-03: v13/module.json und package.json tragen die Version 0.1.0; die Felder des Manifests entsprechen Abschnitt 6 (Autor nach der Antwort des Projektleiters); ein Test hält Version, URLs, Dateien und Abhängigkeiten (P1, P2); es gibt keine Dependency-Änderung und keinen Platzhalter mehr.
AC-M8-04: npm run package erzeugt aus einem frischen Bau release/eagleeye-v13.zip (genau module.json, dist/module.js, lang/en.json; das Bundle im Zip gleich dem gebauten) und release/module.json, gibt Größe und Prüfsumme aus und bricht bei einer Unstimmigkeit ab (negativer Lauf gezeigt); es veröffentlicht nichts.
AC-M8-05: Die Diagnosezeile ist aus v13/relay.ts entfernt; die Queries verhalten sich unverändert (Tests, Simulation der Weiterleitung).
AC-M8-06: README.md und der Kopf des UI-Leitfadens sind nachgeführt; in den bestätigten Plänen sind nur die zwei Stellen aus Befund F1 geändert, dazu (nur wenn im "Go" gewählt) die zwei Status-Überschriften im Klartext-Plan; sonst nichts.
AC-M8-07: Die Entwürfe liegen vor: Übergabenotiz (dadm/uebergabe-naechste-phase.md), SUMMARY.md, Nachträge für die Referenz; die Nachträge sind nach dem "Go" in foundry-vtt-reference-v13/cheat-sheet.md eingetragen (T12).
AC-M8-08: typecheck, test und build enden grün; keine verbotenen Muster; core/request-*, core/rights-*, core/system-guard.ts und v13/hub-application.ts sind unverändert.
AC-M8-09 (Gesamtprüfung, nach den Live-Ergebnissen): jede Zeile P-FC1 bis P-FC7 hat einen Beleg oder ein ausdrücklich angenommenes unverified, P-FC6 nur im Umfang des Versionswächters, P-FC8 als entfallen; je Milestone stehen die Akzeptanzkriterien mit Stand; die offenen Live-Punkte tragen die Entscheidung des Projektleiters.
AC-M8-10 (unverified, Live): Das Release-Zip aus release/ lässt sich in Forge installieren; Test A aus M7 ergibt tested; die Diagnosezeile fehlt; gmping läuft für einen freigegebenen Spieler.
AC-M8-11 (nur vorbereitet): Die Checkliste für den Release liegt vor; Tag, Push und Release sind nicht ausgeführt.
```

---

## Risks and Assumptions

| # | Risiko oder Annahme | Severity | Blocking |
|---|---|---|---|
| R1 | Das Zusammenführen des Vertrags kann Sätze ändern, auf die sich ein früheres Dokument stützt; die Nummern bleiben, die Historie führt die alten "Teil n" weiter. | `low` | no |
| R2 | Ein Release wirkt nach außen; er folgt nur auf eine eigene Anweisung, und die Datenschutz-Entscheidung (S4) kommt davor. | `low` | no |
| R3 | Modulversion `0.1.0` und API `0.7.0` sind zwei verschiedene Zahlen; der Vertrag sagt, dass sie unabhängig sind. | `low` | no |
| R4 | Das Entfernen der Diagnosezeile ändert `v13/relay.ts` (M5); die Live-Abnahme des Release-Zips deckt es ab. | `low` | no |
| R5 | Das Paketier-Skript nutzt das Werkzeug `zip`; auf einem Rechner ohne `zip` bricht es mit einer klaren Meldung ab. | `low` | no |
| R6 | Offene Live-Punkte: Gruppe C ist mit dem "Go" angenommen, A und B nach Wahl. | `low` | no |
| R7 | Archivieren ändert Pfade in Dokumenten und im Memory; es geschieht nur auf Anweisung, nach der Release-Entscheidung, mit einer `SUMMARY.md`. | `low` | no |
| A1 | **Annahme:** Ein GitHub-Release zu `v13-v0.0.1` besteht; das neue Release bekommt ein neues Tag und ein angepasstes `download`-Feld. | `low` | no |

Kein `medium`- oder `high`-Fund, keine Human-Decision-Trigger.

---

## Open TBDs (mit Vorschlag; mit dem "Go" als angenommen, sofern nicht als Antwort erfragt)

| # | Punkt | Vorschlag |
|---|---|---|
| T1 | Vertrag | Nummern 1 bis 10 bleiben; "part n" nur in der Historie; Inhaltsverzeichnis; "What the API offers" |
| T2 | Versionen | API `0.7.0` unverändert; Modul und `package.json` `0.1.0`; `1.0.0` mit dem ersten Verbraucher; Tag `v13-v0.1.0` **(Antwort erfragt)** |
| T3 | Manifest | englische Beschreibung, `url`, `bugs`, kein `relationships.systems`; **`authors`: Name erfragt** (Vorschlag `MattTheEagle`) |
| T4 | Paketieren | `v13/package.mjs` mit `zip`, `npm run package`, Ausgabe `release/` (gitignoriert) |
| T5 | Typen | keine `.d.ts` in M8; der TypeScript-Block im Vertrag ist die Referenz |
| T6 | Code | Diagnosezeile entfernen; keine Ratenbegrenzung, im Vertrag benannt und als Restrisiko angenommen |
| T7 | Dokumente | Pflicht: die zwei Stellen aus Befund F1; optional die zwei Status-Überschriften **(Umfang erfragt)**; `README.md`; Kopf des Leitfadens |
| T8 | Live-Punkte | Gruppen A, B, C nach Abschnitt 11; C angenommen |
| T9 | Gesamtprüfung | eigenes Dokument nach den Live-Ergebnissen |
| T10 | Übergabe | lebendes Dokument `dadm/uebergabe-naechste-phase.md` |
| T11 | Archivieren | erst auf eigene Anweisung nach der Release-Entscheidung; Entwurf der `SUMMARY.md` vorher |
| T12 | Referenz | die Einträge aus Abschnitt 12 werden mit dem "Go" in `cheat-sheet.md` eingetragen **(Antwort erfragt)** |
| T13 | Release | nur vorbereiten (Checkliste); Tag, Push und Release auf eigene Anweisung, je Schritt einzeln; vorher die Datenschutz-Entscheidung zu den Test-Konten |

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m8-02-apply-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

**Stopp für das "Go" des Projektleiters** (Working Mode), mit vier Antworten: Modulversion (T2), Name in `authors` (T3), Umfang der Plan-Nachführung (T7) und die Freigabe für den Nachtrag in die gemeinsame Referenz (T12). Mit dem "Go" gelten T1 bis T13 wie vorgeschlagen; ein Release, ein Push, ein Tag und das Archivieren bleiben bei deiner eigenen Anweisung. Danach der Deploy in der Reihenfolge aus Abschnitt 4, dann der Monitor ohne Stopp mit der Abnahme des Release-Zips und der Prüfliste.

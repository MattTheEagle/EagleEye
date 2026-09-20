# M1 — Phase-1-Code schneiden (E6) — Apply Output

```
artifact: apply-output
milestone: M1
phase: APPLY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Design ohne Implementierung. Der Deploy beginnt erst nach dem ausdrücklichen "Go" des
Projektleiters (`06-working-mode.md`).

---

## Input Summary

- Geschlossener Discover-Output `m1-01-discover-output.md` (Inventar I1–I19, Risiken
  R1–R8, Annahmen A1–A2, offene Fragen Q1–Q7). Im Folgenden tragen Verweise auf
  dessen Risiken das Präfix "Discover-"; "Q1–Q7" meint dessen offene Fragen, "I1–I19"
  sein Inventar. Die eigenen Risiken dieses Dokuments (R1–R5) stehen unten.
- Bestätigte Entscheidungen: **E6** (Fremdmodul-Funktionen "Hub, Scanner,
  Konfliktüberwachung und Sprach-Erkennung für Fremdmodule" entfallen), **N4** (Flight
  Control schmal und generisch), technischer Plan Abschnitt 3.1 (Registry-/Paketdaten-
  Lesen als Bausteine; Konflikt-Überwachung und Sprach-Erkennung "ohne Bezug")
- Milestone Plan M1 (Scope, Acceptance, Risiken), `03-scope-declaration.md`
- Foundry-Referenz v13: `PackageCompatibilityBadge.type` ist
  `"safe" | "unsafe" | "warning" | "neutral" | "error"`
  (`types/src/foundry/client/packages/client-package.d.mts`, Zeile 22–27)

---

## Solution Design

### 1. Leitlinie

Nach M1 enthält der Laufzeitcode **keine Funktion mehr, die Fremdmodule beobachtet oder
verändert**. Was bleibt, sind kleine, getestete Lese-/Schreib-Bausteine, die noch nicht
im Laufzeitpfad hängen und erst mit ihrem ersten Verbraucher (M2/M3) einen
Eagle-Filter bekommen. Der Filter selbst gehört zu M2 (dort wird festgelegt, woran ein
Eagle Modul erkennbar ist) und wird in M1 nicht vorweggenommen.

### 2. Entscheidungstabelle je Datei

| # | Datei | Entscheidung | Grund | Verworfene Alternative |
|---|---|---|---|---|
| I1 | `core/index.ts` | **Behalten**, unverändert | Ein Zeiler; Startlog `eagleeye \| ready (Foundry v13)`; kein Fremdmodul-Bezug | — |
| I2 | `core/manifest-scanner.ts` | **Behalten, minimal bereinigen**: Union `PackageBadge.type` auf die v13-Werte kürzen (`"success"` entfällt), v14-Kommentar (Z. 4–5) durch einen v13-Kommentar ersetzen. Schnittstelle und Verhalten unverändert | Plan 3.1: "Paketdaten-Lesen als Baustein". Das Kürzen ist typsicher, weil v13 genau die verbleibenden Werte liefert; der v14-Kommentar war für "eine spätere Umsetzungsphase" vorgemerkt | Sofort einen Eagle-Filter einbauen → nimmt die Erkennung aus M2 vorweg (Cross-Milestone) |
| I3 | `core/manifest-scanner.test.ts` | **Behalten**, unverändert | Sichert I2 (2 Tests) | — |
| I4 | `core/settings-hub.ts` | **Behalten, nur Kommentar ergänzen**: "Not used at runtime yet. Before any runtime use: restrict to Eagle modules (M2) and check permissions before writing (M5/M6)." Sonst unverändert | Plan 3.1: "Registry-Lesen/-Schreiben als Baustein"; es ist die Grundlage für "Hub bündelt die Einstellungen" (M3). Die ungeprüfte Schreibfunktion (Discover-R2) bleibt ohne Verbraucher und ist damit ungefährlich, der Kommentar hält die Vorbedingung fest | Schreibfunktion jetzt entfernen → müsste in M3/M6 neu gebaut werden, obwohl der Plan sie als Baustein nennt |
| I5 | `core/settings-hub.test.ts` | **Behalten**, unverändert | Sichert I4 (3 Tests, inklusive Regression Instanz vs. `.settings`-Map) | — |
| I6 | `core/hub-application.ts` | **Entfernen** | Zeigt und schreibt Einstellungen **aller** Module (E6: entfällt). Wird in M3 ohnehin neu gebaut (Registerkarten je Eagle Modul). Ohne angemeldetes Eagle Modul hätte ein Hub in M1/M2 nichts anzuzeigen; nebenbei entfällt Discover-R1 (ungeprüftes HTML) | Bis M3 behalten → ließe eine Fremdmodul-Funktion im Laufzeitcode stehen (bricht die M1-Acceptance); Filter über ein Namensschema (`eagleeye…`) → setzt eine Namenskonvention voraus, die nirgends entschieden ist |
| I7 | `core/conflict-watch.ts` | **Entfernen** | Beobachtet libWrapper-Konflikte beliebiger Pakete; Plan: "ohne Bezug"; E6 | Auf Eagle Module umbauen → Konflikte mit Fremdmodulen sind ihrer Natur nach Fremdmodul-Bezug (E6) |
| I8 | `core/conflict-watch.test.ts` | **Entfernen** (mit I7) | Testet nur I7 (3 Tests) | — |
| I9 | `core/language-scan.ts` | **Entfernen** | Liest deklarierte Sprachen aller Pakete; Plan: "Fremdmodul-Sprach-Erkennung ohne Bezug"; E6 | Auf Eagle Module umbauen → kein Verbraucher, keine Anforderung im Plan |
| I10 | `core/language-scan.test.ts` | **Entfernen** (mit I9) | Testet nur I9 (2 Tests) | — |
| I11 | `v13/module.ts` | **Kürzen**: nur noch der `init`-Hook mit `logEagleEyeReady("13")`. Entfallen: `registerMenu`, `ready`-Hook mit den drei Scans, die Importe der entfernten Dateien | Folge aus I6, I7, I9. Sichtbar bleibt nur der Startlog | — |
| I12 | `v13/module.json` | **Nur `description` ändern** (Text unten). `id`, `title`, `version`, `compatibility`, `esmodules`, `manifest`, `download` unverändert | E5: keine Umbenennung von ID/Titel; Version hebt frühestens M8 an; die Beschreibung nennt Fremdmodule und "Minimaler M1-Testbuild" (Discover-R8) | Auch `relationships`/`flags` ergänzen → gehört zu M2 |
| I13 | `v13/tsconfig.json`, `tsconfig.base.json` | **Unverändert** | Absoluter Pfad (Discover-R3) ist nicht Teil von M1; Hinweis für M8 | Pfad jetzt relativ machen → auch dann rechnerabhängig, kein Nutzen in M1 |
| I14 | `package.json` | **Nur `description` ändern** (Text unten). Skripte, Version, Dependencies, `allowScripts` unverändert | Keine Dependency-Änderung (Scope) | — |
| I15 | `test-fixtures/eagleeye-dummy-a`, `-b` | **Behalten**, unverändert | Sie sind bereits Dummy-Module mit `eagleeye-`-Präfix und dienen in M2/M3 als Vorlage für Dummy-Eagle-Module (dort um die API-Anmeldung zu erweitern). Entfernen würde sie in M2 neu erzeugen lassen. Ihre `description` verweist auf "M4 (Settings-Hub-Proof)" aus Phase 1; das bleibt als Herkunftsnotiz stehen | Entfernen, weil der alte Hub weg ist |
| I16 | `README.md` | **Anpassen**: den Beschreibungsabsatz (Fremdmodul-Sätze, "Forschungs-/Testprojekt") und die Stand-Klammer im Prozess-Absatz ersetzen (Text unten). Build-Abschnitt und v14-Satz unverändert | Discover-R8 | — |
| I17 | `v13/dist/module.js` | wird vom Build neu erzeugt (gitignoriert) | — | — |
| I18 | GitHub-Release `v13-v0.0.1` | **Nicht angefasst** | Kein Release in M1 (Override: nur auf Anweisung, bei Milestone-Abschlüssen); Hinweis Discover-R4 geht an M8 | — |
| I19 | `.foundry-workspace.yaml` (Root, `v13/`) | **Unverändert** | Konfiguration, kein Code | — |

### 3. Zielbild nach M1

```
core/
  index.ts                     (5 Z.)   Startlog
  manifest-scanner.ts          (~62 Z.) Paketdaten lesen, ohne Filter, noch nicht verdrahtet
  manifest-scanner.test.ts     (2 Tests)
  settings-hub.ts              (~63 Z.) Einstellungs-Registry lesen/schreiben, noch nicht verdrahtet
  settings-hub.test.ts         (3 Tests)
v13/
  module.ts                    nur init-Hook -> logEagleEyeReady("13")
  module.json                  neue description, sonst unverändert
test-fixtures/                 unverändert
```

Laufzeitverhalten: Foundry lädt das Modul, im `init` erscheint
`eagleeye | ready (Foundry v13)`. Es gibt kein Einstellungsmenü, keine `console.table`
und keine Hooks auf libWrapper. Erwartete Testzahl: **2 Dateien, 5 Tests**
(bisher 4 Dateien, 10 Tests; 3 + 2 Tests entfallen mit I8 und I10).

### 4. Verzeichnis-Zuschnitt (Q3)

`core/` + `v13/` bleiben. Gründe: (a) `v13/module.json` liegt dort, wo das Forge-Paket
seinen Stamm hat; das Release-Zip und der Import-Wizard-Ablauf entstehen außerhalb des
Repos (kein Packaging-Skript vorhanden), ein Verschieben könnte den Ablauf des
Projektleiters brechen; (b) Zusammenlegen bringt jetzt keinen funktionalen Gewinn;
(c) die Struktur wird ohnehin neu bewertet, wenn ein zweites Modul-Repo entsteht (E7).
Eine Neubewertung gehört in M8 (Release/Packaging), nicht in M1.

### 5. Ort der Dokumente (Q4)

`./docs/` im Repo-Root. Vorgesehene Dateien: `docs/api-contract.md` (entsteht mit M2,
wächst durch M7, konsolidiert in M8) und `docs/ui-guide.md` (entsteht in M3). Der Ordner
wird **nicht** in M1 angelegt (leere Ordner nimmt Git nicht auf; ein erster Inhalt
entsteht erst in M2). Die Bestätigung des Orts erfolgt mit dem "Go" für diesen Deploy.

### 6. Testansatz und Konventionen (Q6), aus der bestehenden Praxis festgeschrieben

- **K1:** Logik liegt in `core/<thema>.ts` mit einer neben ihr liegenden
  `<thema>.test.ts`. Sie liest Foundry nur über eine injizierbare Quelle
  (`…Source`, `HooksLike` o. ä.); der Standardadapter auf `game.*` heißt
  `defaultSource()`.
- **K2:** Jeder Standardadapter bekommt einen Regressionstest gegen die echte Form des
  Foundry-Objekts (Vorbild: der Test in `settings-hub.test.ts`, der eine
  Instanz-vs-Registry-Verwechslung aus Phase 1 absichert).
- **K3:** Foundry-gebundene Hüllen (Hooks, Fenster) bleiben dünn und liegen unter `v13/`
  oder werden so klein gehalten, dass sie ohne Test auskommen; ihre Prüfung ist live und
  bleibt bis zur Freigabe `unverified`.
- **K4:** Code-Kommentare und Bezeichner bleiben Englisch (bestehende Praxis).

Nach M1 gibt es keine Foundry-gebundene Datei mit nennenswerter Logik mehr (I1 und I11
sind ein- bzw. dreizeilig); die Lücke R6 aus Discover entsteht damit erst wieder mit M3
(Fenster) und wird dort entschieden.

### 7. Texte (Q7) — Vorschläge, sichtbar für Nutzer, zur Bestätigung mit dem "Go"

- `v13/module.json` → `description`:
  *"Eagle Flight Control (Arbeitsname EagleEye): Schnittstelle zwischen den Eagle Modulen,
  dem DnD-5e-System und Foundry VTT. In Entwicklung."*
- `package.json` → `description`:
  *"EagleEye - Eagle Flight Control: Schnittstelle zwischen den Eagle Modulen, dem
  DnD-5e-System und Foundry VTT (in Entwicklung)."*
- `README.md`, erster Absatz: ersetzt durch *"Foundry-VTT-Modul Eagle Flight Control
  (Arbeitsname EagleEye): die Schnittstelle zwischen den Eagle Modules, dem
  DnD-5e-System und Foundry VTT. In Entwicklung (Umsetzungsphase 4, siehe `dadm/`)."*
  Der Satz "Der Code stammt aus der ersten Phase und enthält noch Funktionen für
  Fremdmodule …" entfällt. Im Prozess-Absatz wird die Klammer "(Stand: keine Phase aktiv;
  drei abgeschlossene Phasen …)" auf "(Stand: Umsetzungsphase 4 läuft; drei
  abgeschlossene Phasen liegen unter `dadm/archive/`, …)" umgestellt.
- Sprache: die bestehende (Deutsch) bleibt; eine Änderung wäre ein eigener Beschluss.

### 8. Übergaben an Folge-Milestones

- **M2:** legt fest, woran ein Eagle Modul erkennbar ist; erst dort bekommen I2/I4 einen
  Filter. Die Fixtures (I15) werden dort zu Dummy-Eagle-Modulen ausgebaut. Erstes Dokument
  in `docs/`: Sprache (Deutsch oder Englisch) vorher klären (T3).
- **M3:** baut das Hub-Fenster neu; I4 ist der Baustein für "Einstellungen bündeln". Das
  alte Fenster ist über Git-Verlauf einsehbar; sein ungeprüfter HTML-Aufbau (Discover-R1) wird
  nicht übernommen.
- **M5/M6:** vor jeder Laufzeitnutzung von `updateSetting` (I4) muss eine Rechteprüfung
  stehen (Discover-R2).
- **M8:** Packaging/Release-Prozess und der Release-Stand (`latest` zeigt auf den
  minimalen M1-Stand, Discover-R4), absoluter Pfad in `v13/tsconfig.json` (Discover-R3), Neubewertung
  `core/` + `v13/`.

### 9. Deploy-Reihenfolge (Plan, ohne Code)

1. Entfernen: I6, I7, I8, I9, I10 (Dateien löschen, nicht committen).
2. `v13/module.ts` auf den `init`-Hook kürzen.
3. `core/manifest-scanner.ts`: Union kürzen, Kommentar ersetzen.
4. `core/settings-hub.ts`: Kommentar ergänzen.
5. Texte: `v13/module.json`, `package.json`, `README.md`.
6. Prüfen: einmal `npm run typecheck`, `npm test`, `npm run build`; Suchprüfungen
   (unten); `git status` und `git diff --stat`.
7. Deploy-Output schreiben. Kein Commit ohne Anweisung.

Rückholbarkeit: Der gelöschte Code bleibt im Git-Verlauf (letzter Stand mit allen
Funktionen: Commit `77daf6d`).

---

## Acceptance Criteria

```
AC-M1-01: Die Dateien core/hub-application.ts, core/conflict-watch.ts, core/conflict-watch.test.ts, core/language-scan.ts und core/language-scan.test.ts existieren nicht mehr.
AC-M1-02: v13/module.ts importiert ausschließlich core/index, enthält genau einen Hook (init) und weder registerMenu noch einen ready-Hook.
AC-M1-03: grep -rniE "libwrapper|lib-wrapper|conflict-watch|language-scan|hub-application|HubApplication|registerMenu|languages" core v13 --include=*.ts liefert keinen Treffer.
AC-M1-04: core/manifest-scanner.ts enthält keinen Verweis auf v14 mehr; PackageBadge.type ist exakt "safe" | "unsafe" | "warning" | "neutral" | "error"; Schnittstelle und Verhalten unverändert (dieselben 2 Tests bleiben ohne Änderung grün).
AC-M1-05: core/settings-hub.ts unterscheidet sich vom Ausgangsstand nur durch den Vorbedingungs-Kommentar; die 3 Tests bleiben ohne Änderung grün.
AC-M1-06: npm run typecheck endet mit Exit 0.
AC-M1-07: npm test meldet 2 Testdateien und 5 Tests, alle bestanden.
AC-M1-08: npm run build endet mit Exit 0; grep -cE "libWrapper|registerMenu|ConflictDetected" v13/dist/module.js ergibt 0.
AC-M1-09: v13/module.json und package.json unterscheiden sich vom Ausgangsstand nur in description; package-lock.json, test-fixtures/, v13/tsconfig.json und tsconfig.base.json sind unverändert (git diff).
AC-M1-10: README.md und die beiden description-Texte enthalten weder "Fremdmodul", "Forschungs", "Minimaler M1-Testbuild" noch einen Hinweis auf entfallende Funktionen; title, id und version bleiben unverändert.
AC-M1-11: Der Deploy-Output gleicht die Entscheidungstabelle (Abschnitt 2) Zeile für Zeile mit dem Ist-Ergebnis ab.
AC-M1-12 (unverified, nur nach ausdrücklicher Live-Freigabe): Das Modul lädt in Forge ohne Konsolenfehler und loggt "eagleeye | ready (Foundry v13)"; das Menü "EagleEye Hub" ist nicht mehr vorhanden.
```

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | Nach M1 hat das Modul keine sichtbare Oberfläche und außer dem Startlog keine Konsolenausgabe. Die Live-Prüfung sagt nur "lädt fehlerfrei". Die Oberfläche kommt mit M3. | `low` | no |
| R2 | I2 und I4 bleiben bis M2/M3 ohne Laufzeitverbraucher; sie sind durch Tests gesichert, und ein Kommentar hält die Vorbedingungen fest. Ohne Filter und Rechteprüfung dürfen sie nicht verdrahtet werden. | `low` | no |
| R3 | Gelöschter Code ist nur über den Git-Verlauf rückholbar. Er ist bis zum Commit im Arbeitsbaum entfernt, aber im letzten Commit (`77daf6d`) vollständig enthalten. | `low` | no |
| R4 | Der Zuschnitt `core/` + `v13/` bleibt; ein späterer Repo-Split (E7) bringt eigene Strukturarbeit (M8 bzw. spätere Phase). | `low` | no |
| R5 | Die Wortlaute der drei Beschreibungstexte sind Vorschläge und für Nutzer sichtbar (Modulliste in Foundry). | `info` | no |
| A1 | **Annahme:** E6 gilt auch für das Hub-Fenster, weil es Einstellungen fremder Module zeigt; Wortlaut Phase 3: "Hub, Scanner, Konfliktüberwachung und Sprach-Erkennung für Fremdmodule gehören nicht mehr zum Vorhaben". Der neue Hub (Eagle Module) entsteht in M3. Bestätigung: "Go". | `low` | no |
| A2 | **Annahme:** I2 und I4 sind die vom Plan gemeinten Bausteine (Discover A1). Wäre die Zuordnung anders gemeint, ist das Behalten beider kleinen Dateien ohne Schaden und jederzeit umkehrbar. | `low` | no |

Kein `medium`- oder höherer Fund. Kein Human-Decision-Trigger: keine Dependency-Änderung,
keine Cross-Milestone-Änderung (der Eagle-Filter bleibt bei M2), Entscheidungen haben eine
klare beste Option (E6 ausdrücklich, Alternativen in Abschnitt 2 begründet verworfen).

---

## Open TBDs

| # | TBD | Priority | Owner |
|---|---|---|---|
| T1 | Wortlaut der drei Beschreibungstexte (Abschnitt 7) bestätigen oder ändern | important | Projektleiter (mit dem "Go") |
| T2 | Ort `./docs/` (Abschnitt 5) bestätigen | important | Projektleiter (mit dem "Go") |
| T3 | Sprache der Dokumente in `./docs/` (Deutsch oder Englisch); vor dem ersten Dokument in M2 klären | nice-to-have | Projektleiter, im Apply von M2 |

Keine der TBDs blockiert den Deploy inhaltlich: T1/T2 werden mit dem "Go" beantwortet; wird
kein anderer Wortlaut genannt, gelten die Vorschläge.

---

## Next Step

Nach dem "Go" des Projektleiters: Deploy M1 — Reihenfolge Abschnitt 9, beginnend mit dem
Entfernen von I6–I10.

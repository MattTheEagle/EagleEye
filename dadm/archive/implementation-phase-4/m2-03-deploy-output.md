# M2 — Modul-Anmeldung und Erkennung — Deploy Output

```
artifact: deploy-output
milestone: M2
phase: DEPLOY
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

---

## Input Summary

- `m2-02-apply-output.md` (Design, Testplan T1–T21, Acceptance AC-M2-01 bis -12, Deploy-Reihenfolge
  Abschnitt 10). Der Apply-Output gilt mit dem "Go" als geschlossen.
- **"Go" des Projektleiters am 2026-09-19** mit diesen Antworten:
  - Go für den Deploy; **Risiko R1 (`medium`) ausdrücklich angenommen**
  - T1: `docs/api-contract.md` (und später `docs/ui-guide.md`) auf **Englisch**
  - T2: E6 wird "nur im Vertrag ausgeschlossen" gelesen (keine Herkunftsprüfung, keine `requires`-Pflicht)
  - T3: Live-Prüfung **einmal gesammelt nach M2** (M1-Startcheck plus M2-Anmeldung); der Projektleiter deployt
    dabei selbst auf Forge
  - T4 (Plan-Stellen nachführen) wurde nicht abgefragt; es gilt der Vorschlag "mit M8"
- Ausgangsstand: M1-Endstand im Arbeitsbaum (nicht committet), Basis-Commit `77daf6d`.
- Grenzen: `06-working-mode.md` (kein Commit, kein Live-Test durch mich), `03-scope-declaration.md`.

---

## Implementation Summary

Der Deploy setzt das Design des Apply um; die Reihenfolge war die aus Abschnitt 10.

- **`core/api-version.ts`:** `EAGLE_API_VERSION = "0.1.0"`, strikter Parser `x.y.z`, Vergleich und
  Kompatibilitätsregel (gleiche Major; vor 1.0 gleiche Minor; Flight Control mindestens so neu wie angefordert).
- **`core/module-registry.ts`:** `ModuleRegistry` mit `registerModule(descriptor: unknown)` (sechs Prüfungen in der
  festgelegten Reihenfolge, stabile Fehlercodes), `list()` (angemeldet **und jetzt aktiv**, Anmeldereihenfolge, frische
  Kopie), `defaultModuleInfoSource()` als Adapter auf `game.modules`.
- **`core/eagle-api.ts`:** `createEagleApi(registry, log?)` liefert ein eingefrorenes Objekt mit genau `version` und
  `registerModule`; Fangnetz für unerwartete Fehler (`internal-error`), Logging (info bei Erfolg, warn bei Ablehnung).
- **`v13/module.ts`:** im `init` (synchron) Registry und API anlegen, an `game.modules.get("eagleeye")` hängen, Startlog
  `eagleeye | API attached (v0.1.0)`; Fehlschlag wird per `try/catch` mit `console.error` gemeldet. Die Typerweiterung
  `ModuleConfig` (`eagleeye: { api: … }`) steht im selben File. **Die Zuweisung kompiliert ohne Cast.**
- **Dummy-Module:** `eagleeye-dummy-a` meldet sich im `setup` kompatibel an (`requires` auf `eagleeye`),
  `eagleeye-dummy-b` unverändert, `eagleeye-dummy-c` (neu) meldet sich mit `9.0.0` an.
- **`docs/api-contract.md`** (Englisch): Zugriff, Zeitpunkt, TypeScript-Block, `registerModule` mit Beschreiber,
  Ergebnis und allen sieben Fehlercodes, Kompatibilitätsregel mit Beispieltabelle, Manifest-Anforderungen,
  Verhalten bei fehlender/deaktivierter Flight Control, Liste des nicht Verifizierten, Änderungshistorie.

**Ergänzungen innerhalb des Designs** (kleine Härtungen, keine neue Architekturentscheidung):
1. Der `ModuleRegistry`-Konstruktor wirft bei einer ungültigen API-Version von Flight Control selbst (Programmierfehler;
   geprüft in T13).
2. `createEagleApi` schützt auch das Formulieren der Warnung gegen einen Beschreiber mit werfendem Getter
   (Zusatzfall in T21), damit "`registerModule` wirft nie" auch dort gilt.
Beides ändert weder Schnittstelle noch Testzahl.

---

## Files Changed

Gegenüber Commit `77daf6d`; M1 ist noch nicht committet, sein Stand steht im Arbeitsbaum (siehe
`m1-03-deploy-output.md`). Von M2 stammen:

| Datei | Änderung | Zeilen |
|---|---|---|
| `core/api-version.ts` | neu | 33 |
| `core/api-version.test.ts` | neu (T1–T7) | 59 |
| `core/module-registry.ts` | neu | 110 |
| `core/module-registry.test.ts` | neu (T8–T17) | 162 |
| `core/eagle-api.ts` | neu | 59 |
| `core/eagle-api.test.ts` | neu (T18–T21) | 76 |
| `v13/module.ts` | verdrahtet (5 → 25 Zeilen) | +20 |
| `test-fixtures/eagleeye-dummy-a/module.json` | `requires`, `description` | +4 / −1 |
| `test-fixtures/eagleeye-dummy-a/module.js` | `setup`-Hook mit Anmeldung | +11 |
| `test-fixtures/eagleeye-dummy-c/module.json` | neu | 12 |
| `test-fixtures/eagleeye-dummy-c/module.js` | neu | 10 |
| `docs/api-contract.md` | neu | 173 |

Nicht durch M2 geändert: `core/manifest-scanner.ts`, `core/settings-hub.ts`, `core/index.ts`, `v13/module.json`,
`v13/tsconfig.json`, `package.json`, `package-lock.json`, `test-fixtures/eagleeye-dummy-b/`. `v13/dist/module.js`
(gitignoriert) wurde neu gebaut: 238 → 4.958 Bytes.

---

## Proofs

Je einmal nach Abschluss aller Änderungen (keine Korrektur nötig, kein zweiter Lauf).

```
npm run typecheck   -> Exit 0
npm test            -> Test Files 5 passed (5); Tests 26 passed (26); Exit 0
                       manifest-scanner 2, api-version 7, settings-hub 3, eagle-api 4, module-registry 10
npm run build       -> v13/dist/module.js 4.8kb; Exit 0
Bundle              -> "registerModule" 4 Treffer, "0.1.0" 1, "API attached" 1, "libWrapper" 0
```

**Gegenprobe der Typisierung** (temporäre Datei, danach gelöscht): `const mustFail: number =
game.modules!.get("eagleeye").api` ergibt genau einen Fehler (`Type 'EagleFlightControlApi | undefined' is not
assignable to type 'number'`); die Leser-Zeilen `game.modules!.get("eagleeye")?.api` und
`reader?.registerModule({ id, apiVersion })` erzeugen keinen. Damit ist die `ModuleConfig`-Erweiterung wirksam und
der Lesetyp `EagleFlightControlApi | undefined`.

**Weitere Prüfungen**
```
v13/module.ts: 1 Hook (init); die einzige Fundstelle von "await" ist ein Kommentar (Z. 17); 0 Casts
Fixtures: JSON parst (a, b, c); node --check ok (a, b, c); dummy-b: git diff leer
git diff --stat manifest-scanner/settings-hub/module.json/package.json -> +2/-3, +3, +1/-1, +1/-1 (= M1-Endstand)
git diff --stat package-lock.json, v13/tsconfig.json, tsconfig.base.json -> leer
```

Ein Live-Test wurde von mir nicht ausgeführt (Live-Test-Gate). Er ist für nach M2 vom Projektleiter
gewünscht (T3); Anleitung im Monitor-Output.

---

## Acceptance Checklist

- [x] AC-M2-01 — `core/api-version.ts` exportiert `EAGLE_API_VERSION = "0.1.0"`, `parseVersion`, `compareVersions`, `isApiCompatible`; T1–T7 bestehen (7 Tests)
- [x] AC-M2-02 — `core/module-registry.ts` exportiert `ModuleRegistry` (`registerModule`, `list`, `apiVersion`), die Typen und `defaultModuleInfoSource`; T8–T17 bestehen (10 Tests)
- [x] AC-M2-03 — `core/eagle-api.ts` exportiert `createEagleApi`; Ergebnis eingefroren mit genau `version` und `registerModule`; `registerModule` wirft nie (auch nicht bei werfendem Getter); T18–T21 bestehen (4 Tests)
- [x] AC-M2-04 — `v13/module.ts`: im synchronen `init` Registry und API anlegen, anhängen, Startlog "eagleeye | API attached (v0.1.0)"; ein Hook, kein `ready`, keine weitere Logik
- [x] AC-M2-05 — `game.modules.get("eagleeye")?.api` ist über das globale `ModuleConfig` typisiert (Gegenprobe); die Zuweisung enthält 0 Casts; `typecheck` Exit 0
- [x] AC-M2-06 — `npm test` Exit 0: 5 Testdateien, 26 Tests, alle bestanden; die 5 bestehenden Tests unverändert
- [x] AC-M2-07 — `build` Exit 0; Bundle enthält "registerModule" und "0.1.0", kein "libWrapper"
- [x] AC-M2-08 — `docs/api-contract.md` deckt alle Punkte aus Apply Abschnitt 8 ab, nennt alle sieben Fehlercodes und kennzeichnet die vier unbelegten Punkte als `unverified` (in Worten formuliert); Sprache Englisch (T1)
- [x] AC-M2-09 — a und c sind syntaktisch gültig; b unverändert
- [x] AC-M2-10 — `package.json`, `package-lock.json`, `manifest-scanner.ts`, `settings-hub.ts`, `v13/module.json`, `v13/tsconfig.json` durch M2 unverändert (Diff-Zahlen entsprechen dem M1-Endstand)
- [x] AC-M2-11 — geprüft gegen den M1-Endstand: Neu bzw. geändert durch M2 sind nur die sechs `core/`-Dateien, `v13/module.ts`, `test-fixtures/` (a geändert, c neu) und `docs/`. *Hinweis:* Der AC-Wortlaut ("`git status` zeigt nur …") setzte einen committeten M1 voraus; `git status` listet zusätzlich die noch nicht committeten M1-Änderungen.
- [ ] AC-M2-12 — **unverified**: Anmeldung a ok / b keine / c abgewiesen in Forge, `api` am Modulobjekt (U5), Ladereihenfolge (U1), deaktivierte Flight Control (U2), Erzwingen der Versionsspanne (U3); nur durch den vom Projektleiter gewünschten Live-Check

### Abgleich Testplan (T1–T21)

| Datei | Fälle | Tests |
|---|---|---|
| `core/api-version.test.ts` | T1–T7 | 7 |
| `core/module-registry.test.ts` | T8–T17 | 10 |
| `core/eagle-api.test.ts` | T18–T21 | 4 |

Jeder Fall ist genau ein `it`; Tabellenfälle (T2, T12, T13, T14) laufen als Schleife innerhalb des einen Tests, damit
die geplante Gesamtzahl 26 stimmt.

---

## Risks and Assumptions

| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | (aus Apply-R1, mit dem "Go" angenommen) Dass Foundry das Setzen von `api` am Modulobjekt in v13 zulässt, ist nur durch Vorbild-Module belegt. Bei Ablehnung: `console.error`, keine API, M2 ohne Anmeldeweg. Belegt oder widerlegt wird das durch den Live-Check nach M2. | `medium` | no |
| R2 | (Apply-R2) Ladereihenfolge, deaktivierte Flight Control, Erzwingen der Versionsspanne bleiben `unverified`; das Design stützt sich auf keinen dieser Punkte. | `low` | no |
| R3 | (Apply-R6) **erledigt:** Die Zuweisung kompiliert ohne Cast. | `info` | no |
| R4 | Die Live-Prüfung (AC-M1-12, AC-M2-12) hängt an der Ausführung durch den Projektleiter; bis dahin bleiben beide `unverified`. | `low` | no |
| R5 | Die Doku ist Englisch (T1), die Projektdokumente sind Deutsch; wer beide pflegt, wechselt die Sprache. | `info` | no |

Kein weiterer `medium`-Fund, kein Rework, keine Abweichung vom Design, keine Dependency-Änderung, keine
Scope-Erweiterung.

---

## Decision Log

```
date: 2026-09-19
decision: Go für den Deploy von M2; R1 (medium) angenommen; API-Vertrag auf Englisch; E6 nur im Vertrag ausschließen; Live-Check einmal gesammelt nach M2
reason: Freigabe nach Prüfung des Apply-Outputs; Autonomie-Regelung "Discover+Apply autonom, vor Deploy Go"
decided-by: Projektleiter
refs: m2-02-apply-output.md (Open TBDs T1–T3, Risiko R1), 06-working-mode.md

date: 2026-09-19
decision: Zwei kleine Härtungen innerhalb des Designs (Konstruktor prüft die eigene API-Version; Schutz des Warn-Logs gegen werfende Getter); AC-M2-11 gegen den M1-Endstand geprüft, weil M1 nicht committet ist
reason: "registerModule wirft nie" muss auch bei bösartigen Beschreibern gelten; der AC-Wortlaut setzte einen committeten M1 voraus
decided-by: agent
refs: m2-02-apply-output.md (Abschnitte 3, 6; AC-M2-03, -11)
```

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m2-03-deploy-output.md` (dieses Dokument) | immutable nach Phasenabschluss |
| Code, Tests, Fixtures, `docs/api-contract.md` (Tabelle "Files Changed") | durable (Repo; nicht committet) |
| `v13/dist/module.js` | ephemeral (Build-Ausgabe, gitignoriert) |

---

## Next Step

Monitor M2: Acceptance gegen den Deploy-Output abgleichen, Regressionen und Restrisiken prüfen, Live-Check
vorbereiten (Anleitung für den Projektleiter), Empfehlung schließen / Rework / nächster Milestone. Das Monitor folgt
nach Working Mode ohne Stopp.

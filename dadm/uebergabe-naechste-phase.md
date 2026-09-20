# Übergabe an die nächste Phase — Stand von Eagle Flight Control

```
artifact: handover-note
status: living (kein Phasenartefakt; wird bei Änderungen nachgeführt)
stand: 2026-09-20, nach der Live-Abnahme und der Gesamtprüfung von M8
```

retention: durable

Für die nächste Umsetzungsphase (Empfehlung: **Eagle Library**, siehe `EAGLE-MODULES-PLAN.md`). Sie braucht einen frischen DAD-M-Bootstrap (Project Brief, Safety Boundaries, Scope Declaration, Milestone Plan mit Freigabe, Working Mode); diese Notiz ersetzt ihn nicht. Sie sagt, was Flight Control schon kann, worauf sich ein Verbraucher verlassen darf und was offen ist.

---

## 1. Was Flight Control heute ist

- Modul `eagleeye`, **Version 0.1.0, API `0.7.0`**, nur Foundry v13 (getestet: Build 351 auf Forge, dnd5e 5.3.3).
- **Fünf API-Mitglieder:** `version`, `registerModule`, `request`, `getRights`, `getSystemInfo`.
- **Hub:** ein Fenster mit einer Registerkarte je angemeldetem, aktivem Eagle Modul (Einstellungen, Startknopf, für den Spielleiter die Rechte je Spieler).
- **Anfragekanal:** Anfragen laufen im eigenen Client oder, wenn sie die Rechte des Spielleiters brauchen, beim Spielleiter, nachdem dessen Client den anfragenden Nutzer beim Nutzer selbst bestätigt hat. Es gibt genau drei Nachweis-Anfragetypen: `flightcontrol.ping`, `flightcontrol.gmping`, `flightcontrol.targetping`. Sie ändern und lesen keine Foundry-Daten.
- **Rechte je Modul und Nutzer** (`denied`, `own`, `all`), vom Spielleiter im Hub gesetzt, vor jeder Ausführung geprüft (beim Spielleiter bindend).
- **Versionswächter** für das DnD-5e-System: meldet, sperrt nichts.
- **Maße:** 162 Tests in 18 Dateien, Bundle 54,6 kB, keine Laufzeit-Abhängigkeit. Der Vertrag ist durch Tests gegen den Code gehalten (`core/api-contract.test.ts`), das Manifest ebenso (`core/manifest.test.ts`).

## 2. Wo was liegt

| Was | Wo |
|---|---|
| Vertrag für Modulautoren (Englisch) | `docs/api-contract.md` |
| Regeln für die Oberfläche (Englisch) | `docs/ui-guide.md` |
| Reine Logik ohne Foundry, mit Tests | `core/` |
| Dünne Foundry-Hüllen und Hub | `v13/` |
| Testmodule für die Live-Checks in Forge | `test-fixtures/` |
| Release-Dateien bauen (veröffentlicht nichts) | `npm run package` → `release/eagleeye-v13.zip`, `release/module.json` |
| Prozess der Phase 4 (archiviert am 2026-09-20, mit `SUMMARY.md`) | `dadm/archive/implementation-phase-4/` |
| Prüfwerkzeuge der Phase 4 (Zwei-Client-Simulationen, Gegenproben, Paketprüfung; Referenz, feste Pfade) | `dadm/archive/implementation-phase-4/pruefskripte/` (README dort) |
| Nachträge für die gemeinsame Foundry-Referenz (sechs Einträge, **eingetragen am 2026-09-20**) | `foundry-vtt-reference-v13/cheat-sheet.md`; Wortlaut des Entwurfs: `dadm/archive/implementation-phase-4/m8-02-apply-output.md`, Abschnitt 12 |

## 3. Was ein Verbraucher wissen muss

- Die API ab `setup` lesen, in `setup` registrieren, `undefined` behandeln (Flight Control kann fehlen oder deaktiviert sein). Ein Modul, das nicht registriert ist, kennt Flight Control nicht. Nennt ein Modul `eagleeye` in `relationships.requires`, lässt Foundry im Modul-Manager nicht zu, dass Flight Control abgewählt wird, solange das Modul aktiv ist (live gesehen); andere Wege dorthin sind nicht geprüft.
- `module` in einer Anfrage ist die selbst angegebene ID des Moduls: eine ehrliche Beschriftung, keine Sicherheitsgrenze. Die Rechte gelten je Modul und halten gegen Module, die sich an die Regeln halten.
- **Neue Anfragetypen** entstehen nur mit dem Apply des Milestones, der sie braucht (Flight Control bleibt schmal und generisch); ein Test bewacht die Liste. Regeln dafür stehen im Vertrag, Abschnitt 4:
  - Ein Typ, der auf Dokumente wirkt, nennt sie als UUIDs (`targets`), sonst kann `own` ihn nicht beschränken.
  - Ein Typ, der einem Modul gehört, muss sagen, welche Module ihn benutzen dürfen (die Rechte gelten je Modul).
  - Ein Typ, der beim Spielleiter Daten ändert oder Wissen herausgibt, das nur der Spielleiter hat, sagt im Apply seines Milestones, wie.
  - Ein Typ, der vom DnD-Datenmodell abhängt, sagt, welche Systemzustände er annimmt (`getSystemInfo`).
- Vor `1.0.0` darf eine neue Nebenversion der API brechen. `1.0.0` erst, wenn der erste Verbraucher (die Library) sie ohne Bruch benutzt hat. Modulversion und API-Version sind getrennte Zahlen; die Tabelle im Vertrag, Abschnitt 6, ordnet sie zu und wird bei jeder Modulversion mit neuer API-Version um eine Zeile ergänzt (ein Test bewacht das).
- Es gibt **keine Ratenbegrenzung**: Ein veränderter Client kann den Spielleiter und einen genannten Nutzer mit Anfragen und Rückfragen belasten. Das legt nichts offen und lässt nichts laufen, was die Prüfungen ablehnen. Bei mehr Nutzern oder Modulen neu bewerten.

## 4. Offene Punkte

**Live noch nicht gezeigt (`unverified`):** nach dem Stand von `docs/api-contract.md`, Abschnitt 8. Das Ergebnis der M8-Abnahme steht in `dadm/archive/implementation-phase-4/m8-05-live-check-output.md`, die Entscheidung des Projektleiters je Punkt in der Gesamtprüfung `dadm/archive/implementation-phase-4/m8-06-gesamtpruefung-output.md`.

| Punkt | Stand |
|---|---|
| L1 Fehlerwege des Relais (`relay-timeout`, `relay-failed`), mehrere Spielleiter | offen; Fehlerwege als Restrisiko angenommen (Gruppe C), mehrere GMs braucht ein zweites Konto (Gruppe B) |
| L2 Fehlerwege der Bestätigung (nicht verbundener Nutzer, 5-Sekunden-Grenze) | nicht verbundener Nutzer: **live bestätigt** (`m8-05`); Zeitgrenze: Restrisiko (Gruppe C) |
| L3 Rechte: Assistent, mehrere Spieler, Besitzprüfung für Spielleiter, Compendium, "Inherit", gelöschte Nutzer | offen (Gruppe B: weitere Konten nötig) |
| L4 Wächter: Hinweis beim Spielleiter zur Zeit `ready`, Zustände außer `tested`, was ein Spieler sieht | **vom Projektleiter als Risiko angenommen** (2026-09-20); die vier Prüfpakete liegen weiter in `v13/dist/live-check/`, falls später gewünscht |
| L5 Hub: abgelehnter Wert, Regler über dem Maximum, Hub für einen Spieler (Menüknopf fehlt) | Regler: beantwortet (das Zahlenfeld begrenzt selbst); Spieler ohne Menüknopf: **live bestätigt**; der Pfad "Wert ablehnen" nur Tests |
| L6 Fehlergründe `invalid-request`, `unsupported-version`, `handler-failed`, `internal-error` | die ersten zwei **live bestätigt**; die zwei anderen nur Tests (Gruppe C) |
| L7 Reihenfolge der `init`-Callbacks, deaktivierte Voraussetzung, Erzwingen von `compatibility` | deaktivierte Voraussetzung: Foundry verhindert das Abwählen im Modul-Manager (für diesen Weg beantwortet); Reihenfolge und Erzwingen offen |
| L8 `scope: "user"`-Einstellungen, Stabilität der Nutzer-IDs | Gruppe C (nur beobachtbar) |

**Restrisiken und bewusste Grenzen:**
- Die Nutzeridentität schützt gegen die Fälschung einer **fremden** Identität, nicht gegen einen Nutzer, der sich selbst ausgibt; die Modul-`id` bleibt Vertrauensgrenze (Human Decision 1, M6a).
- Keine Ratenbegrenzung (oben).
- `relationships.systems` fehlt im Manifest mit Absicht: Foundrys Prüfung kann das Modul als nicht verfügbar einstufen, wenn kein angegebenes System installiert ist (nicht live geprüft; braucht einen eigenen Live-Test). Der Wächter meldet das System zur Laufzeit.
- Der Hub-Pfad "ungültigen Wert ablehnen, Feld zurücksetzen, Hinweis zeigen" ist nur durch Tests belegt: Das Zahlenfeld eines Schiebereglers begrenzt einen zu großen Wert selbst (live bestätigt), sodass der Pfad mit einem Regler nicht auszulösen ist.
- `core/manifest-scanner.ts` (Phase 1) ist getestet, aber nirgends angeschlossen; die nächste Phase nutzt oder löscht ihn.
- Die Rechte liegen als Welteinstellung `eagleeye.rights` (JSON-Text) und sind für alle Clients lesbar; Flight Control schreibt sie nur über den Hub der Rolle Spielleiter.

## 5. Empfehlung für die nächste Phase

1. **Frischer DAD-M-Bootstrap**; Eagle Library als erster Verbraucher (Reihenfolge des Plans: Flight Control → Library → Journal/Ruling → Character Edit → Homebrew → Ruling → Roll Out). **Erster Schritt des Bootstraps ist der Umbau des Workspaces (Abschnitt 7).**
2. Beim **ersten modulspezifischen Anfragetyp** die Bindung von Anfragetypen an Module entscheiden (Regel im Vertrag; sie wurde in M6b bewusst bis dahin aufgeschoben).
3. **Typen für andere Repos:** Eine `.d.ts` bringt erst dann etwas, wenn ein zweites Repo sie braucht; bis dahin ist der TypeScript-Block im Vertrag die Referenz.
4. `relationships.systems` und das Erzwingen von `compatibility` bei Bedarf mit einem eigenen Live-Test klären.
5. Die **Nachträge für die gemeinsame Foundry-Referenz** stehen in `cheat-sheet.md` (eingetragen nach Freigabe am 2026-09-20). Neue, tatsächlich wiederverwendete Erkenntnisse der nächsten Phase dort ergänzen.
6. **Release 0.1.0:** vorbereitet und in Forge abgenommen, aber **nicht veröffentlicht** (Release-Entscheidung B, 2026-09-20: vorbereitet lassen, später). Bauen mit `npm run package`; die Checkliste mit den Befehlen steht in `dadm/archive/implementation-phase-4/m8-04-monitor-output.md`. Tag, Push und GitHub-Release nur auf ausdrückliche Anweisung und nach der Entscheidung vom 2026-09-20 **nicht, bevor echte Module an Flight Control angeschlossen sind und Erfahrungswerte mit ihnen vorliegen**. Das GitHub-Repo ist **öffentlich** (Angabe des Projektleiters); die Datenschutz-Frage zu sechs Dokumenten mit Test-Konto-Namen oder Nutzer-IDs steht in Abschnitt 7 ("Zurückgestellt: Datenschutz und Push").

## 6. Wie in dieser Phase gearbeitet wurde (was sich bewährt hat)

- **Live-Checks führt der Projektleiter selbst aus**, jeweils mit einem fertigen Zip und einer Anleitung mit genauen Konsolenzeilen; seine Konsolenzeilen und Screenshots sind der Beleg.
- **Gegenproben:** Jede neue Prüfung wurde einmal absichtlich gebrochen (eine Stelle im Code, im Vertrag oder im Manifest verstellt), um zu sehen, dass sie anschlägt.
- **Zwei-Client-Simulation** mit dem echten Bundle für alles, was zwei Clients braucht, vor dem Live-Check.
- **Vertrag gegen Code als Test** statt einmal von Hand: Das ist in M8 in `core/api-contract.test.ts` geschehen und hat sofort eine Lücke gefunden (ein Ablehnungstext fehlte im Vertrag).
- Bei Absichts-Unklarheit wurde gestoppt und gefragt; Sicherheits- und Datenschutz-Fragen gingen als Human Decision an den Projektleiter.

## 7. Bootstrap der nächsten Phase: Umbau des Workspaces als erster Schritt

Auf Anweisung des Projektleiters vom 2026-09-20 hier festgehalten, damit die nächste Sitzung ohne Vorwissen aus dieser Phase beginnen kann (die Library-Phase startet in einer frischen Sitzung). **Nichts davon ist umgesetzt;** jeder Schritt braucht die Freigaben des neuen Bootstraps.

**Entscheidungen des Projektleiters (2026-09-20)**
1. **Kein Push, kein Tag, kein GitHub-Release von Flight Control, bevor echte Module an Flight Control angeschlossen sind und Erfahrungswerte mit ihnen vorliegen.** Die Release-Entscheidung B (vorbereitet lassen) bekommt damit diese Bedingung. Das GitHub-Repo `MattTheEagle/EagleEye` ist **öffentlich** (Angabe des Projektleiters).
2. **Der Umbau des Workspaces ist Teil des nächsten Bootstraps.** Der Ordner über den Modulen wird die gemeinsame Arbeitsumgebung des Projekts; jedes Modul bleibt ein eigenes, strikt getrenntes Repo.

**Vorschlag zur Struktur** (aus dem Gespräch vom 2026-09-20; im Bootstrap zu bestätigen oder zu ändern)
```
FoundryVTT/              Workspace-Wurzel (heute ein Ordner, der nur EagleEye enthält)
  .dadm-workspace.yaml   DAD-M-Konfiguration des ganzen Projekts
  .foundry-workspace.yaml
  dadm/                  Prozess für das ganze Projekt: Pläne, Bootstrap je Phase, Archive, Übergabe, Referenz
  EagleEye/              Repo Flight Control (bleibt, wie es ist)
  <Library>/             eigenes Repo; weitere Module folgen
```
- **Prozess auf Projektebene, Produkt im Repo.** Die Modul-Repos enthalten Code, Tests, `docs/` und README. Gekoppelt sind sie nur über den Vertrag von Flight Control und `relationships.requires`: kein gemeinsamer Code, keine Submodule, kein gemeinsames Paket.
- Der Elternordner ist kein Repo oder ein **privates** Repo nur für `dadm/` und die Konfigurationsdateien (die Modulordner kommen in dessen `.gitignore`). So bleiben künftige Prozessdokumente privat.
- Neue Repos entstehen nur mit ausdrücklicher Freigabe je Repo und zunächst **privat**.

**Was der Bootstrap dafür klären und tun muss** (in dieser Reihenfolge)
1. **Struktur bestätigen** und in Safety Boundaries und Scope festhalten: Schreibbereich je Repo; Commit und Push je Repo nur auf ausdrückliche Anweisung; keine Veröffentlichung vor Erfahrungswerten (Entscheidung 1). Die Konfiguration der Phase 4 (`EagleEye/.dadm-workspace.yaml`) trägt zwei Overrides, die neu zu bewerten sind: `live_test_execution_gate` (Tests gegen die reale Forge-Instanz brauchen jedes Mal eine Freigabe; der Projektleiter führt Live-Checks selbst aus) und `outbound_publishing` (freigegeben war nur das öffentliche Repo `MattTheEagle/EagleEye` für den Hybrid-Workflow, alles Weitere ist freigabepflichtig). `outbound_publishing` muss die neue Bedingung und die neuen Repos abbilden.
2. **Konfiguration im Elternordner anlegen:** `.dadm-workspace.yaml` (Bootstrap-Modus wie bisher `quickstart` oder anders; `framework_root` und Defaults wie bisher; Overrides aus Schritt 1) und `.foundry-workspace.yaml` (`foundry_version: 13`). Entscheiden, ob `EagleEye/.dadm-workspace.yaml` bleibt (dann gilt der DAD-M-Modus auch bei einer Sitzung im Modulordner) oder entfällt. `.foundry-workspace.yaml` bleibt in jedem Modul-Repo (in `EagleEye/` liegt sie im Root und in `v13/`).
3. **`dadm/` im Elternordner einrichten:** die lebenden Dokumente aus `EagleEye/dadm/` (`uebergabe-naechste-phase.md`, `eagle-modules-projektplan.md`, `reference/`, die Archive) dorthin übernehmen; entscheiden, ob sie im Repo `EagleEye` bleiben oder dort entfernt werden, und wo `EAGLE-MODULES-PLAN.md` (Klartext-Plan im Repo-Root) künftig liegt. Die Historie im öffentlichen Repo bleibt in jedem Fall.
4. **Memory mitnehmen:** Das Memory liegt pro Arbeitsordner. Für `EagleEye/` ist es `/home/matt/.claude/projects/-run-media-matt-Data-matt-Coding-FoundryVTT-EagleEye/memory/`; für den Elternordner wäre es nach demselben Muster `…/-run-media-matt-Data-matt-Coding-FoundryVTT/memory/` und zunächst leer. Die Dateien (Index, Nutzerprofil, Arbeitsweise, Stand) dorthin kopieren und den Stand auf die neue Struktur anpassen.
5. **`dadm/bios.registry.json` im Elternordner neu erzeugen** (`python3 <framework_root>/runtime/build_bios_registry.py --repo-root .`); die vorhandene gehört zum Repo `EagleEye`.
6. Optional den Elternordner als **privates** Repo anlegen (nur `dadm/` und Konfiguration).
7. **Erstes neues Modul-Repo (Library):** nach ausdrücklicher Freigabe, privat. Das Gerüst von Flight Control einmal kopieren (`core/` und `v13/`, Vitest, esbuild, `.gitignore`, `tsconfig`, Paketier-Skript `v13/package.mjs`); jedes Repo muss allein bauen. `v13/tsconfig.json` verweist heute mit einem absoluten Pfad auf die Foundry-Typen (`/run/media/matt/Data/matt/Coding/foundry-vtt-reference-v13/types/…`); im neuen Repo relativ oder dokumentiert lösen.
8. **Testmodule:** Sobald die Library als erster echter Verbraucher registriert ist, die Dummy-Module a bis d und das Spike-Modul in der Testwelt deaktivieren und die Zips in Forge entfernen; EagleEye bleibt. Die Quellen liegen in `EagleEye/test-fixtures/`; die Zips baut man aus dem jeweiligen Ordner (`module.json` im Zip-Stamm). Ein Skript dafür gibt es nicht.

**Zurückgestellt: Datenschutz und Push**
- **Öffentlich** liegt heute (`origin/master`, Stand 2026-09-19, Commit `77daf6d`): 42 Commits, 197 Dateien, **keine** Test-Konten oder Nutzer-IDs, keine E-Mail-Adresse in Dateien, keine Forge-Adresse. Schon öffentlich sind die Git-Autoradresse in allen 42 Commits und lokale Pfade (`/run/media/matt/…`) in `v13/tsconfig.json`, `.dadm-workspace.yaml`, `dadm/bios.registry.json` und einigen archivierten Dokumenten.
- Ein Push würde die lokalen Commits der Phase 4 veröffentlichen, darunter die sechs Dokumente mit Test-Konto-Namen und Nutzer-IDs (`m5-05`, `m6-spike-1-result`, `m6a-05`, `m6b-04`, `m6b-05`, `m7-05`, jetzt unter `dadm/archive/implementation-phase-4/`). Ein späteres Schwärzen in einem neuen Commit entfernt sie nicht aus der Historie.
- Optionen, wenn es so weit ist: (1) die Namen in den sechs Dokumenten durch Platzhalter ersetzen und das in den lokalen, noch nicht veröffentlichten Commits umschreiben (mit Sicherungs-Branch; eine Ausnahme von "immutable", die eine Freigabe braucht); (2) die Prozessdokumente der Phase 4 aus dem öffentlichen Repo heraushalten (größeres Umschreiben); (3) unverändert pushen (Schaden gering: kein Zugang, keine Zugangsdaten). Für künftige Commits kann GitHubs noreply-Adresse als Git-Autor eingetragen werden.
- Entscheiden, wenn die Erfahrung mit angeschlossenen Modulen vorliegt (Entscheidung 1).

**Fakten für den Start der Library** (keine Designvorgaben)
- API `0.x`: Flight Control lehnt eine Anmeldung mit anderer Nebenversion ab (Vertrag, Abschnitt 5). Die Library nennt in `registerModule` die `apiVersion`, gegen die sie geschrieben ist; jede Erweiterung der API verlangt ein Nachziehen der Library; `1.0.0` erst, wenn sie ohne Bruch benutzt wurde.
- Flight Control bietet nur drei Nachweis-Anfragetypen. Nach Entscheidung Q3 a laufen alle Änderungen an Foundry-Daten über Flight Control; fachliche Anfragetypen entstehen im Apply des Milestones, der sie braucht (Regeln: Vertrag, Abschnitt 4, "Rules for request types"). Die Library-Phase arbeitet deshalb in zwei Repos.
- Offenes Designthema, das der Discover der Library klären soll und das hier nicht vorentschieden wird: wie generisch die Anfragetypen sein sollen (Flight Control soll schmal und generisch bleiben; Architekturrisiko N4 im Projektplan).
- Die Prüfwerkzeuge der Phase 4 (Zwei-Client-Simulationen mit dem echten Bundle, Gegenproben, Paketprüfung) sind als Referenz gesichert (`dadm/archive/implementation-phase-4/pruefskripte/`, README dort: feste Pfade, was noch läuft). Wird Flight Control in der Library-Phase erweitert (Relais, Rechte, neue Anfragetypen), sind sie eine Vorlage; neue Prüfungen gehören als Tests ins Repo.
- Spezifikation der Library: Projektplan, Abschnitt 3.2 (P-L1 bis P-L10; Belege `dadm/archive/planning-phase-3/m7-0*`, `m8-0*`, `m8a-0*`).

**Lesereihenfolge für die neue Sitzung:** `dadm/README.md` → dieses Dokument → `docs/api-contract.md` und `docs/ui-guide.md` → `dadm/eagle-modules-projektplan.md` (Abschnitte 3.2, 5, 6) → bei Bedarf `dadm/archive/implementation-phase-4/SUMMARY.md`.

# M5 — GM-Weiterleitung — Discover Output

```
artifact: discover-output
milestone: M5
phase: DISCOVER
status: complete
date: 2026-09-19
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Wahl von Namen, Zeiten oder Codes (Aufgabe des Apply). Belege nennen die Fundstelle; was sich ohne Live-Test
oder Foundry-Quelltext nicht belegen lässt, steht getrennt.

---

## Input Summary

- `04-milestone-plan.md` (M5 mit Risiken), `m4-04-monitor-output.md` (Übergaben an M5), `m4-05-live-check-output.md` (Registry, Kern und Hub live),
  `m4-02-apply-output.md` (Q1, Q5, Ablaufbild, Übergabe an M5)
- Spezifikation und Entscheidungen: `dadm/reference/eagle-modules-aufbau.md` (N1, N4, N19), `dadm/eagle-modules-projektplan.md` Abschnitt 3.1,
  Planungsphase 3 (`archive/planning-phase-3/m5-01-discover-output.md`, `m5-02-apply-output.md`), `dadm/reference/source-analysis/techniques-catalog.md` Abschnitt 9
- Foundry-Referenz v13 (`foundry-vtt-reference-v13/types/`, Tag `v13.345.1`): `User#query`, `CONFIG.queries`, `Users#activeGM`, Socket-Typen, Berechtigungen
- Zwei lesende Web-Abrufe (nach den Safety Boundaries: Netzwerkzugriff read-only, projektbezogene Recherche), weil die Referenz das Laufzeitverhalten nicht beschreibt:
  (1) API-Doku `foundryvtt.com/api/v13/classes/foundry.documents.User.html`: bestätigt die Signatur, enthält keine Angaben zum Laufzeitverhalten und keinen Verweis auf den Quelltext;
  (2) GitHub-Repository `foundryvtt/foundryvtt`: nur Issue-Tracker und Dokumentation, **kein** Client-Quelltext
- Repo-Ist nach M4 (Code, Tests, `docs/api-contract.md` Abschnitt 4)
- Kein Live-Test, kein Code geändert.

---

## Current-State Summary

- M1 bis M4 sind abgeschlossen und live geprüft (`m4-05`): Ein Eagle Modul stellt Flight Control eine Anfrage mit `api.request({ module, type, version?, payload? })`;
  der Kern prüft, führt aus und antwortet im Muster `{ ok: true, value } | { ok: false, reason, detail }`.
- Die Ausführung läuft **im Client des Aufrufers** mit dessen Rechten (Vertrag Abschnitt 4, "Where a request runs"). Es gibt genau einen Handler, `flightcontrol.ping`;
  er berührt Foundry nicht. **Kein Handler ändert Dokumente.**
- Im Code kennt bisher nur die GM-Prüfung `canWrite` des Hubs einen Nutzer; Sockets, Queries und Rollen kommen sonst nirgends vor.
- Der Plan verlangt für M5: Anfragen von Nutzern ohne Foundry-Recht laufen über den Spielleiter; die Prüfung "wer darf was" liegt auf der GM-Seite. M6 (Rechte je Modul
  und Nutzer) baut darauf auf.

---

## Inventory

### Repo-Ist

| Baustein | Ort | Fakt |
|---|---|---|
| Ausführung | `core/request-kernel.ts:40-43`, `:76-131` | `execute(request: unknown): Promise<RequestResult>` "never rejects"; ohne Transport und ohne Foundry-Bezug. Reihenfolge: Umschlag → Absender → Handler → Version → Daten → Ausführung → JSON-Ergebnis. |
| Absender | `core/request-kernel.ts:96-100`, `docs/api-contract.md:230-231` | Der Absender wird über das Feld `module` des Umschlags gefunden und gegen `registry.list()` geprüft (angemeldet und aktiv). Die Angabe ist selbst gemacht; der Vertrag nennt sie eine Vertrauensgrenze ("an honest label, not security"). |
| Handler-Kontext | `core/request-kernel.ts:27-38` | `run(payload, context)` bekommt nur `context.module`; kein Nutzer, keine Rolle. |
| Fehlercodes | `core/request-kernel.ts:12-19`, `docs/api-contract.md:207-220` | Sieben stabile Codes; unbekannte künftige Codes gelten als Fehlschlag; der Vertrag nennt fehlende Rechte als Beispiel für spätere Codes. |
| Handler-Liste | `core/request-handlers.ts:37-39` | Genau ein Handler; ein Test bewacht die Liste. |
| JSON-Regel | `core/json-value.ts`, `docs/api-contract.md:202-205` | Umschlag und Ergebnis enthalten nur JSON-Werte; der Vertrag sagt bereits, dass "a later part of this contract" Anfragen auf dem Client des Gamemasters ausführt. |
| API-Oberfläche | `core/eagle-api.ts:5-9`, `:63-79` | `version`, `registerModule`, `request`; `request` ruft `kernel.execute`, loggt Fehlschläge per `warn`, Erfolge nicht; das Objekt ist eingefroren. |
| Verdrahtung | `v13/module.ts:33-66` | Im `init`-Hook: Registry, API am Modulobjekt, Hub-Menü. Kein `CONFIG.queries`, kein `ready`-Hook. |
| Registry je Client | `core/module-registry.ts:21-27`, `v13/module.ts:38` | Jeder Client legt beim Start seine eigene Registry an; die Module melden sich im `setup` des jeweiligen Clients an (`m4-05`, A6). |
| Rollenprüfung | `core/settings-hub.ts:274` | `canWrite: () => game.user?.isGM === true`; die einzige Stelle mit Nutzerbezug. |
| Teststruktur | `core/*.test.ts` | Kern und Handler sind mit eingespeisten Quellen testbar (Konventionen K1 bis K4); Foundry-Hüllen liegen in `v13/`. |

### Spezifikation und Entscheidungen (Projektleiter)

| Quelle | Inhalt |
|---|---|
| Plan M5, `04-milestone-plan.md:155-171` | Ziel: Anfragen von Nutzern ohne Foundry-Recht laufen über den Spielleiter. Apply legt fest: `CONFIG.queries` mit präfixiertem Namen, Verhalten ohne verfügbaren GM, Zeitüberschreitung, wo die Prüfung "wer darf was" stattfindet (auf der GM-Seite, nie im anfragenden Client), Fehlerbild. Deliverables: Weiterleitungs-Code mit Tests, API-Vertrag Teil 4. Acceptance: Vitest für die Entscheidungslogik (weitergeleitet, abgelehnt, kein GM erreichbar, Zeitüberschreitung); Spieler-Client → GM → Ergebnis in einem echten Foundry `unverified`. Risiken: `high` (Security), `medium` (nur live prüfbar). |
| N1, `dadm/reference/eagle-modules-aufbau.md:201` | Nutzungsrechte je Modul und Nutzer werden später in den Moduleinstellungen festgelegt; Folge: Flight Control braucht für Nutzer ohne Foundry-Rechte den GM-Anfrageweg (`User#query`). |
| Projektplan 3.1, `dadm/eagle-modules-projektplan.md:63-64` | "Spieler ohne Foundry-Recht: `User#query` mit präfixiertem Namen in `CONFIG.queries`, kein socketlib". socketlib wurde in Phase 1 ausdrücklich abgelehnt (`archive/planning-phase-3/m5-02-apply-output.md:45-50`); libWrapper ist die einzige freigegebene Fremdmodul-Abhängigkeit (N19, `eagle-modules-aufbau.md:231`). |
| Q3 a und N4 | Änderungen an Foundry-Daten nur über Flight Control, Lesen direkt (`04-milestone-plan.md:41-42`); Flight Control bleibt schmal und generisch (`eagle-modules-aufbau.md:204`). |
| Übergabe aus M4, `m4-02-apply-output.md:46`, `:177-178` | `execute` bleibt transportfrei; auf allen Clients wird `CONFIG.queries["eagleeye.request"]` vorgesehen (Präfix laut Discover-F2 von M4; **Vorschlag, nicht entschieden**); beim GM läuft dieselbe Funktion. Welche Anfragen beim GM laufen müssen, ist Sache von M5. Die Rechteprüfung von M6 hängt intern zwischen Datenprüfung und Ausführung ein. |
| Praxis analysierter Module, `dadm/reference/source-analysis/techniques-catalog.md:126-132` | Midi-QOL (`GMAction.ts`) und Active Auras leiten Änderungen per socketlib an den GM, der validiert und ausführt, weil Spieler fremde Dokumente nicht ändern dürfen. |
| Safety Boundaries und Scope (`02`, `03`) | Keine Dependency-Änderung; Live-Test nur mit ausdrücklicher Freigabe je Test; Schreibzugriff nur `core/`, `v13/`, `test-fixtures/`, `docs/`, `dadm/`. |

### Foundry-Fakten (Types v13.345.1; Pfade relativ zu `foundry-vtt-reference-v13/types/src/foundry/`)

| # | Fakt | Fundstelle |
|---|---|---|
| FF1 | `User#query(queryName, queryData, { timeout }?)` liefert ein Promise mit dem Ergebnis. `queryName` "must be registered in `CONFIG.queries`", `queryData` "must be JSON-serializable", `timeout` in Millisekunden, optional. Die API-Doku (Abruf 1) sagt dasselbe. | `client/documents/user.d.mts:727-738`, `:569-574` |
| FF2 | "System and modules must prefix the names of the queries they register (e.g. "my-module.aCustomQuery"). Non-prefixed query names are reserved by core." | `client/config.d.mts:2407-2411` |
| FF3 | Der Kern registriert zwei Queries: `dialog` und `confirmTeleportToken`. | `client/config.d.mts:2489-2492` |
| FF4 | Ein Query-Handler hat in den Typen **einen** Parameter, die Query-Daten: `_confirmQuery(queryData)` liefert `Promise<boolean>`, `DialogV2._handleQuery(config)` ein Promise; `User.QueryData` nimmt nur den Parameter 0. | `client/data/region-behaviors/teleport-token.d.mts:28`, `client/applications/api/dialog.d.mts:302-304`, `client/documents/user.d.mts:576-578` |
| FF5 | Der Kern nutzt den Mechanismus selbst: `DialogV2.query(user, type, config)` zeigt einem bestimmten Nutzer einen Dialog und liefert "the query response or null if no response was provided". | `client/applications/api/dialog.d.mts:266-297` |
| FF6 | `User#active` ("Track whether the user is currently active in the game", Standard `false`), `User#isSelf`, `User#isActiveGM`. | `client/documents/user.d.mts:604-608`, `:633-641` |
| FF7 | `Users#activeGM`: "one User who is an active Gamemaster (non-assistant if possible), or null if no active GM is available. This can be useful for workflows which occur on all clients, but where only one user should take action." | `client/documents/collections/users.d.mts:32-36` |
| FF8 | `Users#getDesignatedUser(condition)` und `User#isDesignated(condition)`: der designierte Nutzer unter denen, die eine Bedingung erfüllen; "a User with the highest role among the qualifying Users"; qualifizierende Nutzer sind nicht zwingend aktiv, außer die Bedingung verlangt es. | `client/documents/collections/users.d.mts:38-51`, `client/documents/user.d.mts:657-669` |
| FF9 | `BaseUser#isGM` und `hasRole(role, options)`. | `common/documents/user.d.mts:61`, `:88` |
| FF10 | Standardrollen zum Anlegen von Dokumenten: `ACTOR_CREATE` und `ITEM_CREATE` Assistent, `JOURNAL_CREATE` Trusted. | `common/constants.d.mts:1305`, `:1371`, `:1410` |
| FF11 | `game.socket` ist "the open Socket.io connection". Für Dokument-Operationen beschreiben die Typen die Antwort mit `userId` ("The ID of the requesting User"); für Queries kennen die Typen keine vergleichbare Absenderangabe. | `client/game.d.mts:56-59`, `client/helpers/socket-interface.d.mts:37-60` |
| FF12 | `User.QueryName` ist der Schlüsseltyp von `CONFIG.queries`; `CONFIG.Queries` nennt nur die Kern-Namen. Ein eigener Query-Name ist deshalb für TypeScript erst nach einer Typ-Ergänzung aufrufbar (Schluss aus den Typen, nicht getestet). `CONFIG.queries` selbst ist eine beschreibbare Eigenschaft. | `client/documents/user.d.mts:576-578`, `client/config.d.mts:2411`, `:2489-2492` |

### Nicht ohne Live-Test (oder Foundry-Quelltext) belegbar

Die Referenz, die API-Doku und das öffentliche Repository beschreiben das Laufzeitverhalten von `User#query` nicht.

| # | Offener Punkt | Warum es zählt |
|---|---|---|
| U1 | Ob der Query-Handler beim Empfänger erfährt, **welcher Nutzer** angefragt hat, und ob Foundry diese Angabe setzt oder der anfragende Client sie behauptet. Die Typen zeigen nur `queryData` (FF4), zu Queries fehlt eine Absenderangabe (FF11). | Sicherheitsrelevant: Grundlage für "wer darf was" auf der GM-Seite und für M6. |
| U2 | Verhalten von `User#query`, wenn der Zielnutzer nicht verbunden ist: sofortige Ablehnung oder Wartezeit bis zur Zeitüberschreitung, Art des Fehlers. | Fehlerbild "kein GM erreichbar". |
| U3 | Standardwert von `timeout`, ob es ohne Angabe eine Grenze gibt, und was bei Ablauf beim Aufrufer ankommt. | Zeitüberschreitung. |
| U4 | Wie ein Fehler oder eine Ablehnung im Handler des Ziels beim Aufrufer ankommt (Art, Text, Verlust des Fehlertyps). | Abbildung auf `handler-failed` und neue Codes. |
| U5 | Was der Aufrufer sieht, wenn der Zielclient den Query-Namen nicht in `CONFIG.queries` hat (zum Beispiel weil Flight Control dort nicht geladen ist). | Fehlerbild. |
| U6 | Ob `query` an den eigenen Nutzer (`isSelf`, Aufrufer ist der GM) lokal ausgeführt wird oder über den Server läuft. | Verhalten, wenn der GM selbst anfragt. |
| U7 | Ob der Rückgabewert serialisiert wird (Wirkung auf `undefined` und Nicht-JSON-Werte); die Typen verlangen JSON nur für die Query-Daten (FF1). | Ergebnisformat. |
| U8 | Nach welchem Kriterium `Users#activeGM` bei mehreren aktiven GMs einen wählt und ob das auf allen Clients derselbe ist (FF7 sagt nur "one"). | Auswahl des GM. |
| U9 | Ob Forge (Proxy, Latenz) das Verhalten von Queries beeinflusst; Zeitverhalten im echten Betrieb. | Wert der Zeitüberschreitung. |

---

## Dependencies

- **Code:** M4 (`RequestKernel`, API `0.3.0`) und M2 (Registry), beide live bestätigt. M6 braucht später einen Haken für die Rechteprüfung auf der GM-Seite.
- **Foundry:** `User#query`, `CONFIG.queries`, `Users#activeGM`, alles Kernfunktionen. Keine neue Fremdmodul-Abhängigkeit, kein socketlib, keine Änderung an `package.json` (kein Human-Decision-Trigger 4).
- **Tests:** Vitest mit eingespeisten Quellen; der Transport (`User#query`) ist eine Hülle in `v13/`.
- **Live-Prüfung:** braucht **zwei gleichzeitig verbundene Nutzer** (GM und Spieler) auf Forge; Freigabe je Test (`02-safety-boundaries.md`), der Projektleiter führt sie selbst aus, ich baue die Pakete.
- **Nachgelagert:** API-Vertrag Teil 4 (Englisch); M6 (Rechte); M8 (Versionspolitik, Konsolidierung).

---

## Risks and Assumptions

| # | Risiko | Severity | Blocking |
|---|---|---|---|
| R1 | **Security, Absender:** Die Weiterleitung führt Anfragen mit den Rechten des GM aus. Ob der Handler beim GM den anfragenden Nutzer verlässlich erfährt, ist nicht belegt (U1). Ohne verlässliche Absenderangabe kann die GM-Seite nicht sicher entscheiden, wer anfragt; ein veränderter Client könnte Angaben im Umschlag fälschen (die Modul-`id` ist bereits selbst angegeben). Bis M6 gibt es keinen Handler, der Dokumente ändert; betroffen ist zunächst der Mechanismus, nicht eine konkrete Aktion. | `high` | no (Discover); ein `high`-Security-Fund, der nach dem Apply fortbesteht, ist nach Governance eine Human Decision |
| R2 | **Security, Standardverhalten:** Vor M6 gibt es keine Rechtequelle. Was die GM-Seite bis dahin mit einer weitergeleiteten Anfrage tut (erlauben oder ablehnen), ist nicht festgelegt. R1 und R2 sind zusammen das im Plan genannte `high`-Risiko. | `high` | no (Discover), Behandlung im Apply |
| R3 | Das Laufzeitverhalten von `User#query` ist nur live prüfbar (U2 bis U9). Fehlerbild, Zeitüberschreitung und Verhalten ohne GM lassen sich in Vitest nur gegen einen nachgebildeten Transport prüfen; ein falsches Modell wird erst im Live-Check sichtbar. | `medium` | no |
| R4 | **Verfügbarkeit:** Jede weitergeleitete Anfrage läuft im Client des GM. Typen und Doku nennen keine Begrenzung von Häufigkeit oder Größe; ein Spieler-Client kann beliebig viele Anfragen stellen. Mit nur `ping` ist die Wirkung gering und wächst mit künftigen Handlern. | `low` | no |
| R5 | **Datenschutz:** Das Ergebnis geht an den anfragenden Spieler. Ein späterer Handler, der GM-sichtbare Daten liest, könnte sie weitergeben. In M5 gibt es nur `ping`; jeder künftige Handler entscheidet das in seinem Apply. | `low` | no |
| R6 | Kein oder mehrere GMs (U8) und ein GM-Client, der nicht bereit ist (Flight Control dort nicht geladen, Welt im Aufbau; U5): die Anfrage scheitert. Das ist ein Fehlerbild, kein Datenrisiko. | `low` | no |

| # | Annahme | Severity | Blocking |
|---|---|---|---|
| A1 | `execute` läuft unverändert auf dem GM-Client (transportfrei, JSON-Umschlag); Grundlage der M4-Übergabe, bisher nur in Vitest gezeigt. | `low` | no |
| A2 | Alle Clients einer Welt haben dieselben Module aktiv und dieselbe Flight-Control-Version, weil der Server die Dateien liefert; ein veralteter Browser-Cache wäre die Ausnahme (nicht geprüft). | `low` | no |
| A3 | `CONFIG.queries` lässt sich im `init`-Hook ergänzen und ist gesetzt, bevor eine Query eintrifft (FF12); die Reihenfolge ist nicht belegt. | `low` | no |
| A4 | Eine Query erreicht den GM nur, wenn dessen Client verbunden ist (`User#active`, FF6); einen Zustellweg für abwesende GMs gibt es in diesem Discover nicht. | `low` | no |

Ein Fund `critical` liegt nicht vor. R1 und R2 sind `high` (Security): Sie werden im Apply behandelt; bleibt danach ein `high`-Security-Fund bestehen, ist es eine Human Decision.

---

## Open Questions

Für das Apply (Design), bei Sicherheitsfragen mit Vorlage an den Projektleiter:

1. Wo fällt die Entscheidung "lokal oder beim GM" (nach Nutzerrolle, nach Anfragetyp, immer), und wer gilt als "ohne Foundry-Recht"?
2. Woher kommt die Absenderangabe auf der GM-Seite (U1), und was gilt, wenn Foundry sie nicht liefert? (Sicherheitsrelevant.)
3. Standardverhalten der GM-Seite vor M6: ablehnen bis M6, nur eine feste Auswahl zulassen oder alles zulassen? (Sicherheitsrelevant.)
4. Verhalten ohne verfügbaren GM, Wert der Zeitüberschreitung, Behandlung von Fehlern und Ablehnungen aus `User#query` (U2 bis U5); Abbildung auf die Codes des Vertrags (neue Codes nur additiv).
5. Auswahl des GM (`activeGM` oder `getDesignatedUser`, U8) und Verhalten, wenn der Aufrufer selbst der GM ist (U6).
6. Name der Query (Vorschlag aus M4: `eagleeye.request`, nicht entschieden; Präfixregel FF2) und die TypeScript-Ergänzung (FF12).
7. Schnitt der Tests: welche Entscheidungslogik ist rein (weitergeleitet, abgelehnt, kein GM, Zeitüberschreitung) und was ist Hülle; welches Testmodul stützt den Live-Check mit einem Spieler.
8. Inhalt des API-Vertrags Teil 4 (Englisch): wo eine Anfrage läuft, neue Fehlgründe, Verhalten ohne GM, Grenzen.

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m5-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

Apply (M5): Zielarchitektur der Weiterleitung, Ort und Regel der GM-seitigen Prüfung, Fehlerbild mit Codes, Zeitüberschreitung, Schnitt der Tests, Vertrag Teil 4, Akzeptanzkriterien. Autonom nach Working Mode;
das Apply legt außerdem fest, wie der Live-Check mit GM und Spieler aussehen soll. Stopp vor dem Deploy für das "Go"; bei einem fortbestehenden `high`-Security-Fund eine Human Decision.

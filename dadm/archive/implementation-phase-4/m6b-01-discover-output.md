# M6b — Nutzungsrechte je Modul und Nutzer — Discover Output

```
artifact: discover-output
milestone: M6b
phase: DISCOVER
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Wahl eines Rechtemodells (Aufgabe des Apply). Das Dokument baut auf `m6-01-discover-output.md` auf (fachliche Fakten, Rollen, Risiken zu M6) und wiederholt davon nichts; es nennt nur, was sich seit M6a geändert hat oder für M6b neu zu klären ist.
Belege nennen die Fundstelle; was sich ohne Live-Test nicht belegen lässt, steht getrennt.

---

## Input Summary

- `04-milestone-plan-v2.md` (M6b, Ziel, Scope, Risiken), `m6-01-discover-output.md`, `m6-hd-1-output.md`, `m6a-02-apply-output.md` (Abschnitt 9 Sicherheit, Abschnitt 10 Übergaben), `m6a-05-live-check-output.md` (live belegt), `m3-rework-3-output.md` (gebündelte Nacharbeit)
- Repo-Ist nach M6a (Kern, Relais, Hub, Einstellungen, API, Handler, Testmodule, `docs/api-contract.md`)
- Foundry-Referenz v13 (`foundry-vtt-reference-v13/types/`, Tag `v13.345.1`): Besitz (Ownership), UUID, Einstellungen (`onChange`, Welt-Scope), Rollen. Im Cheat-Sheet der Referenz gibt es dazu keinen Treffer.
- Kein Web-Abruf, kein Live-Test, kein Code geändert.

---

## Current-State Summary

- M1 bis M6a sind abgeschlossen und live bestätigt (API `0.5.0`, 87 Tests in 12 Dateien). Ein Modul stellt Flight Control eine Anfrage; läuft sie beim GM, hat der genannte Nutzer sie bestätigt, und der Handler bekommt ihn als `context.user` (nur die ID).
- **Es gibt weiterhin keine Rechte.** Jedes angemeldete, aktive Modul darf jeden angebotenen Anfragetyp für jeden Nutzer stellen. Kein Anfragetyp hat ein Ziel; beide Nachweis-Typen lesen nur.
- **Vorgaben des Projektleiters** (2026-09-20, `m6a-02` Abschnitt 10, Plan v2): erlaubt oder verboten je Modul und Nutzer; bei "erlaubt" eingeschränkt auf **eigene oder fremde Ziele** (Besitz nach Foundry); **bindend beim GM, als Regel im eigenen Client** (dort umgehbar, ohne Gewinn über Foundrys eigene Rechte);
  eingestellt **nur vom GM** (nicht von Assistenten), **im Hub**.
- Mit dem Paket kommt die Nacharbeit 3 (der Titel im Hub entfällt; `m3-rework-3-output.md`); der Projektleiter bestätigt sie mit dem "Go".

---

## Inventory

### Repo-Ist (Fundstellen nach M6a)

| Baustein | Ort | Fakt |
|---|---|---|
| Haken im Kern | `core/request-kernel.ts`, `execute`, Schritte 5 und 6 (`handler.validate`, dann `handler.run`) | Der Nutzer steht dort schon bereit (`executeOptions?.user ?? options.currentUser?.()`); ohne beides ist er `undefined`. `KernelOptions` kennt nur `currentUser`; ein Anschluss für Rechte fehlt. |
| Handler-Definition | `RequestHandler` in `core/request-kernel.ts` | Felder `type`, `versions`, `runsOn?`, `validate`, `run`. **Kein Feld für ein Ziel:** der Kern weiß nicht, worauf sich eine Anfrage bezieht. |
| Kontext | `RequestContext { module, user? }`, `RequestUser { id }` | Der Nutzer ist nur die ID; weder Rolle noch Name. |
| Empfänger | `core/request-relay.ts`, `receive` | Reihenfolge: Rolle, JSON und Größe, Nachricht, Umschlag, Handler, Ausführungsort (`runsOn "gm"`), Absender, Bestätigung, dann `kernel.execute(envelope, { user: { id: claim.userId } })`. Nach der Bestätigung übernimmt der Kern; der Empfänger kennt keine Rechte. |
| Lokale Ausführung | `core/request-relay.ts`, `execute` | Typen mit `runsOn` ungleich `gm` und alle Typen auf einem Client mit GM-Rolle (`isGm`, auch Assistent) laufen lokal über `kernel.execute(envelope, executeOptions)`. |
| Fehlercode | `not-permitted` (`core/request-kernel.ts`) | Schon vergeben für "kein GM-Client", "Typ wird nicht für andere Clients ausgeführt" und "Nutzer nicht bestätigt". Der Vertrag (`docs/api-contract.md`, Abschnitt 4, Tabelle der Codes) kündigt ihn auch für Rechte je Modul und Nutzer an. `detail` von `handler-failed` und `internal-error` wird bei GM-Fehlern allgemein gehalten. |
| Regel aus M5 | `docs/api-contract.md` (Abschnitt "Where a request runs"), `m6a-02` Abschnitt 10 | Ein Handler mit `runsOn "gm"` darf keine Daten ändern und kein GM-Wissen weitergeben, **bevor die Rechte je Modul und Nutzer bestehen**. Ein Test (`core/request-handlers.test.ts`, "offers exactly two request types…") hält die Liste der Handler fest. |
| Handler | `core/request-handlers.ts` | genau zwei: `flightcontrol.ping` (`caller`) und `flightcontrol.gmping` (`gm`), beide ohne Ziel und nur lesend; `gmping` liefert `ranBy` und `askedBy`. |
| Nutzerprüfung im Hub | `core/settings-hub.ts`, `defaultHubSettingsSource().canWrite` | `game.user?.isGM === true` (GM **oder Assistent**); der Kommentar am Dateianfang nennt M6 als Ersatz. Geschrieben wird nur in den Namensraum eines angemeldeten Moduls (`applySettingInput`). |
| Hub | `v13/hub-application.ts`, `#renderModule` (Zeilen 111 bis 148), `v13/module.ts` | Ein Tab je angemeldetem aktivem Modul; Tab-Körper `section.tab` > `fieldset` > `legend`, Versionszeile, Open-Knopf, je Einstellung ein Formularblock (`#renderSetting`); Änderungen laufen über `applySettingInput`. Das Menü ist `restricted: true` (GM-Rolle inklusive Assistent, FF7 aus `m6-01`). |
| Einstellungen von Flight Control | `v13/module.ts` | **Flight Control registriert bisher keine eigene Einstellung**, nur das Menü `hub`. Eine Ablage der Rechte wäre die erste. |
| API | `core/eagle-api.ts`, `core/api-version.ts` | genau `version`, `registerModule`, `request` (eingefroren), Version `0.5.0`; keine Rechteabfrage. Der Vertrag zählt "permissions per module and user" unter "Not part of this version". |
| Registry | `core/module-registry.ts` | je Client "angemeldet und aktiv"; `RegisteredModule` mit `id`, `title`, `version`, `apiVersion`, `open?`. |
| Nutzerzugriff | `v13/relay.ts` (`foundryCurrentUser`, `foundryExecutor`, `foundryRelayEnvironment`) | liest `game.user`, `game.users.activeGM`, `game.users.get(id)`. In `core/` gibt es **keine** Abstraktion für die Nutzerliste oder die Rolle eines Nutzers. |
| Testmodule | `test-fixtures/eagleeye-dummy-a` bis `-d` | Alle vier registrieren sich (b nicht); nur Dummy a stellt Anfragen (`ping`, `gmping`); keine Anfrage hat ein Ziel. |

### Vorgaben und Entscheidungen

| Quelle | Inhalt |
|---|---|
| `04-milestone-plan-v2.md`, M6b | Scope für das Apply: Datenmodell (Modul, Nutzer, erlaubt, Ziele eigene oder fremde), Speicherort (Welteinstellung; Lesbarkeit für Spieler laut Spike), Standardwerte (Vorschlag: der GM darf immer alles), wie ein Anfragetyp sein Ziel angibt und wie der Besitz geprüft wird, Durchsetzung im Kern und im Empfänger (mit dem bestätigten Nutzer), Oberfläche im Hub je Modul, Rechteabfrage durch Module (Vertrag Teil 6), Umgang mit gelöschten Nutzern. Deliverables: Rechte-Logik mit Tests, Einstellungsoberfläche im Hub, falls nötig ein Nachweis-Anfragetyp mit Ziel, Vertrag Teil 6. Acceptance: Vitest für die Auswertung (erlaubt, abgelehnt, Standardwerte, eigene und fremde Ziele, unbekanntes Modul oder Nutzer, GM), Durchsetzung im Kern und im Empfänger getestet; Darstellung im Hub und Verhalten mit echten Nutzern `unverified`. |
| `m6a-02` Abschnitt 10 | Der bestätigte Nutzer steht bereit; die Rechte hängen zwischen `validate` und `run` (Kern) und nach der Bestätigung (Empfänger) ein. Offen für M6b: Standardwerte, wie ein Anfragetyp sein Ziel angibt, Speicherort, gelöschte Nutzer, Vertrag Teil 6. |
| `m6a-05` | Die Bestätigung hält live; das Restrisiko aus Human Decision 1 (Schutz nur gegen die Fälschung einer **fremden** Identität; die Modul-`id` bleibt Vertrauensgrenze) ist angenommen. |
| Safety Boundaries und Scope (`02`, `03`) | Keine Dependency-Änderung; Live-Test nur mit Freigabe je Test; Schreibzugriff nur `core/`, `v13/`, `test-fixtures/`, `docs/`, `dadm/`. |

### Foundry-Fakten (Types v13.345.1; Pfade relativ zu `foundry-vtt-reference-v13/types/src/foundry/`; Nummerierung setzt `m6-01` fort)

| # | Fakt | Fundstelle |
|---|---|---|
| FF10 | Besitzstufen: `INHERIT` (-1, erbt vom Ordner), `NONE` (0), `LIMITED` (1), `OBSERVER` (2), `OWNER` (3: "view and make changes to the Document as its owner"; besessene Dokumente kann nur ein GM löschen). | `common/constants.d.mts:350-382` |
| FF11 | `Document#getUserLevel(user?)` gibt die **eingetragene** Stufe zurück, "regardless of the User's role, for example a GAMEMASTER user might still return a result of NONE if they are not explicitly denoted as having a level"; "Embedded Documents defer to their parent ownership"; "Compendium content ignores the ownership field in favor of User role-based ownership". Für die Prüfung einer Fähigkeit verweist die Dokumentation auf `testUserPermission`. | `common/abstract/document.d.mts:248-261` |
| FF12 | `Document#testUserPermission(user, permission, { exact }?)`: "Test whether a certain User has a requested permission level (or greater) over the Document"; `permission` ist ein Name (etwa `"OWNER"`) oder ein Wert der Besitzstufen; `exact` (Standard `false`) verlangt die genaue Stufe. **Die Referenz sagt nicht, wie GM- und Assistenten-Rollen darin behandelt werden.** | `common/abstract/document.d.mts:263-278`, `:2161-2172` |
| FF13 | `Document#canUserModify(user, action, data)` prüft, ob ein Nutzer `"create"`, `"update"` oder `"delete"` an einem Dokument ausführen darf. | `common/abstract/document.d.mts:279-291` |
| FF14 | `ClientDocument#isOwner` ist ein Getter ohne Argument und gilt für den Nutzer **dieses** Clients. Die Prüfung für einen anderen Nutzer (auf dem GM-Client) geht über `testUserPermission` oder `getUserLevel`. | `client/documents/abstract/client-document.d.mts:68` |
| FF15 | `fromUuid(uuid, options?)` (asynchron) liefert das Dokument oder `null`. `fromUuidSync` liefert für Compendium-Dokumente nur den Indexeintrag und wirft, wenn sich die UUID nicht synchron auflösen lässt. Item, Token, Macro, Note, Drawing, MeasuredTemplate, Combatant, ChatMessage, JournalEntry und User überschreiben `getUserLevel`. | `client/utils/helpers.d.mts:38-80`; `common/documents/*.d.mts` |
| FF16 | Eine Einstellung hat `onChange?: (value, options?) => void` ("Executes when the value of this Setting changes"). Ob und wann das auf **anderen** Clients ausgelöst wird, sagt die Referenz nicht. Die Beispiele im Kopf der Datei registrieren eine `world`-Einstellung. | `client/helpers/client-settings.d.mts:77-97`, `:310-311` |
| FF17 | `game.settings.set` reicht bei Welteinstellungen "additional options ... to the server". Die Berechtigungsprüfung für das Schreiben einer Welteinstellung steht nicht in der Referenz (siehe FF3 in `m6-01`: `SETTINGS_MODIFY` mit Standardrolle `ASSISTANT` gegen die Rollenbeschreibung). | `client/helpers/client-settings.d.mts:166`; `common/constants.d.mts:1492-1501` |

### Live belegt (seit `m6-01`)

| # | Fakt | Beleg |
|---|---|---|
| L1 | Ein Spieler kann eine vom GM geschriebene **Welteinstellung** lesen (eine Zeichenkette, Spike `probe`). Für ein Objekt als Wert und für die Aktualisierung auf einem laufenden Client (`onChange`) gibt es keinen Beleg. | `m6-spike-1-result-output.md` |
| L2 | `context.user` kommt beim Handler auf dem GM-Client mit der ID des bestätigten Spielers an (`askedBy`). | `m6a-05` |
| L3 | Die Hub-Tabs zeigen nur angemeldete aktive Module; Felder liegen links/rechts (`standard-form`), der Regler zeigt Zahlenfeld, die aktive Registerkarte ist hervorgehoben. | `m6a-05` (Screenshots) |

### Nicht ohne Live-Test belegbar (Nummerierung neu für M6b)

| # | Offener Punkt | Warum es zählt |
|---|---|---|
| U1 | Ob ein Assistent eine Welteinstellung schreiben darf (M6-U2, FF17). Die Welt hat nur zwei Nutzer (GM und ein Spieler); ein Assistentenkonto müsste angelegt werden. | Wer die Ablage der Rechte mit Foundry-Mitteln ändern könnte, unabhängig vom Hub. |
| U2 | Ob eine Welteinstellung mit einem **Objekt** als Wert für Spieler lesbar ist und wie sie sich auf anderen Clients nach einer Änderung verhält (`onChange`; sofort oder erst nach dem Neuladen). | Aktualität der Regel im eigenen Client; Form der Ablage. |
| U3 | Was `testUserPermission(user, "OWNER")` für einen GM oder Assistenten, für ein Compendium-Dokument und für `INHERIT` ergibt und ob die Antwort auf dem GM-Client für einen **anderen** Nutzer dieselbe ist wie in dessen eigenem Client (`isOwner`). | Definition von "eigenes Ziel" auf dem GM-Client. |
| U4 | Verhalten der Nutzerliste bei einem gelöschten oder neu angelegten Nutzer (M6-U6, M6-A1). | Verwaiste Einträge; Standard für neue Nutzer. |
| U5 | Ob mehrere gleichzeitig verbundene GMs dieselbe Ablage schreiben können und wie die Änderung ankommt (M5-U8). | Konflikte beim Einstellen. |

---

## Dependencies

- **Code:** M2 (Registry), M3 (Hub, Einstellungen, `canWrite`), M4 (Kern und Haken), M5 (Relais, `not-permitted`), M6a (`context.user`, bestätigte Identität). Der Vertrag bekommt Teil 6 und eine neue API-Version (nach der bisherigen Praxis `0.6.0`).
- **Foundry:** Einstellungen (Welt), `game.users`, Besitz (`testUserPermission`, `fromUuid`). Keine neue Fremdmodul-Abhängigkeit, keine Änderung an `package.json` (kein Human-Decision-Trigger 4).
- **Tests:** Vitest für die reine Auswertung mit eingespeisten Quellen (K1 bis K4, wie bisher); die Foundry-Hülle bleibt dünn.
- **Live-Prüfung:** GM und Spieler; die Welt hat einen Spieler. Ein Unterschied **zwischen** zwei Spielern bräuchte ein zweites Spielerkonto (praktische Frage). Freigabe je Test, der Projektleiter führt sie aus.
- **Entscheidungen des Projektleiters:** die Punkte, die das Apply als T-Punkte zum "Go" vorlegt; Nacharbeit 3 (Rahmen, `m3-rework-3-output.md`).

---

## Risks and Assumptions

| # | Risiko | Severity | Blocking |
|---|---|---|---|
| R1 | **Security, Reichweite (aus dem Plan):** Eine umgehbare Rechteprüfung wäre ein Security-Fund. Bindend ist die Prüfung nur beim GM (`runsOn "gm"`, nach der Bestätigung des Nutzers); im eigenen Client (`caller`) ist sie eine umgehbare Regel, ausdrücklich so vorgegeben. | `high` (inhärent) | no (Discover) |
| R2 | **Security, Modul-`id`:** Die Rechte hängen an der **selbst angegebenen** Modul-`id` (M6a-S10 blieb Vertrauensgrenze). Ein veränderter Client kann sich als ein Modul ausgeben, für das sein Nutzer erlaubt ist. Sind Anfragetypen nicht an Module gebunden, reicht ein erlaubtes Modul für jeden Typ. Heute gibt es nur zwei allgemeine, lesende Nachweis-Typen; der Punkt wird mit dem ersten modulspezifischen Typ wirksam. | `high` (inhärent), heute ohne Gewinn für einen Angreifer | no |
| R3 | **Security, Einstellen:** Der Hub zeigt die Rechte nur dem GM. Die Ablage ist eine Welteinstellung; wer sie mit Foundry-Mitteln schreiben darf, entscheidet Foundry (U1). Ein Assistent könnte sie unter Umständen an der Oberfläche von Flight Control vorbei ändern. | `medium` | no |
| R4 | **Aussperrung und Standard:** Für Nutzer und Module ohne Eintrag gibt es keinen festgelegten Wert (M6-R5); zu streng sperrt Module aus, zu offen gibt Rechte weg. | `medium` | no |
| R5 | **Definition "eigenes Ziel":** Besitz ist je Dokumenttyp und Kontext verschieden (eingebettete Dokumente erben, Compendium ignoriert `ownership`, GM-Rollen, `INHERIT`; FF11 bis FF15, U3). Ohne Ziel in der Anfrage kann Flight Control keines prüfen; heute hat kein Anfragetyp eines. | `medium` | no |
| R6 | **Umfang:** Datenmodell, Ablage, Auswertung, Durchsetzung in Kern und Relais, Oberfläche im Hub, Vertrag Teil 6, Nachweis-Typ mit Ziel, Testmodule, dazu die Nacharbeit 3. Laut Plan wird bei Bedarf weiter geteilt (neue Planversion). | `medium` | no |
| R7 | Oberfläche und Durchsetzung mit echten Nutzern sind nur live prüfbar (U2, U4). | `medium` | no |
| R8 | **Datenschutz:** Die Zuordnung "Nutzer, Modul, Stufe" enthält Nutzer-IDs und keine weiteren personenbezogenen Daten; Spieler können die Ablage lesen (L1). | `low` | no |
| R9 | Änderung an einer M3-Datei (Nacharbeit 3) im Zuge von M6b: Cross-Milestone-Änderung; die Zustimmung kommt mit dem "Go". | `low` | no |
| A1 | **Annahme:** Nutzer-IDs bleiben für die Lebensdauer eines Nutzers stabil (M6-A1, unbelegt). | `low` | no |
| A2 | **Annahme:** Die Modul-`id` bleibt der Schlüssel je Modul (Registry, Vertrag). | `low` | no |

`critical` liegt nicht vor. R1 und R2 sind inhärent `high` (Security): Sie werden im Apply bewertet; bleibt danach ein `high`-Security-Fund bestehen, ist es eine Human Decision.

---

## Open Questions

**Für das Apply (Design; was den Projektleiter betrifft, kommt als T-Punkt zum "Go"):**

1. Datenmodell und Ablage: welche Stufen, welche Form; eine Welteinstellung mit einem Objekt (FF16, L1, U2)?
2. Standardwerte: GM und Assistent, Spieler ohne Eintrag, neue Nutzer und neue Module (R4).
3. Wie gibt ein Anfragetyp sein Ziel an, wo und nach welcher Regel wird "eigen oder fremd" bestimmt (auf dem GM-Client, FF12, U3), was gilt ohne Ziel und bei einem Ziel, das sich nicht auflösen lässt (R5)?
4. Durchsetzung: Anschluss im Kern (zwischen `validate` und `run`), Wirkung im Client des Aufrufers (Regel) und beim GM (bindend), Fehlertext, Log; Rechteprüfung vor der Weiterleitung oder nur beim GM?
5. Bindung von Anfragetypen an Module (R2): jetzt oder mit dem ersten modulspezifischen Typ?
6. Rechteabfrage durch Module (Vertrag Teil 6): Form der API-Erweiterung, Rückgabe, Verhalten bei unbekanntem Modul oder Nutzer.
7. Oberfläche im Hub: Platz im Tab, wer sie sieht (nur die Rolle GAMEMASTER, nicht Assistenten), wie Nutzer gelistet werden, gelöschte oder neue Nutzer (U4), Speichern und Prüfung.
8. Nachweis-Anfragetyp mit Ziel (was er zurückgibt, ohne GM-Wissen preiszugeben), Testmodule, Ablauf des Live-Checks.
9. Zuschnitt der Nacharbeit 3 im Paket (Rahmen bleibt oder entfällt).

**Praktisch (Live-Check):** Reicht ein Spieler, oder soll ein zweites Spielerkonto angelegt werden, damit ein Unterschied zwischen zwei Nutzern sichtbar wird?

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6b-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

Apply (M6b), eigenständig: Zielarchitektur, Datenmodell, Ablage, Standardwerte, Ziel und Besitzprüfung, Durchsetzung in Kern und Relais, Oberfläche im Hub, Vertrag Teil 6, Testplan und Akzeptanzkriterien, Sicherheitsbetrachtung zu R1 bis R3 (bleibt ein `high`-Security-Fund, ist es eine Human Decision). Der Deploy wartet auf das "Go".

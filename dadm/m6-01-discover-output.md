# M6 — Nutzungsrechte je Modul und Nutzer — Discover Output

```
artifact: discover-output
milestone: M6
phase: DISCOVER
status: complete
date: 2026-09-20
```

retention: immutable (nach Phasenabschluss)

Nur Fakten. Kein Lösungsdesign, keine Wahl eines Rechtemodells (Aufgabe des Apply). **Die Bedeutung von "in wie weit" wird hier nicht gedeutet**, sondern als Frage an den Projektleiter formuliert (geplanter Stopp aus dem Plan).
Belege nennen die Fundstelle; was sich ohne Live-Test nicht belegen lässt, steht getrennt.

---

## Input Summary

- `04-milestone-plan.md` (M6 mit Risiken), `m5-02-apply-output.md` (Abschnitt 9 Sicherheitsbetrachtung, Abschnitt 10 Übergaben), `m5-04-monitor-output.md` (Übergaben an M6), `m5-05-live-check-output.md` (live beantwortet: U1),
  `m4-02-apply-output.md` (Q5: Haken für die Rechte), `m1-02-apply-output.md` (Konventionen K1 bis K4)
- Spezifikation und Entscheidungen: `dadm/reference/eagle-modules-aufbau.md` (N1, N4), `dadm/01-project-brief.md` (U3), `dadm/eagle-modules-projektplan.md` Abschnitt 3.1
- Foundry-Referenz v13 (`foundry-vtt-reference-v13/types/`, Tag `v13.345.1`): Rollen, Berechtigungen, Einstellungen (Scopes, Typen), Benutzer, `User#query`
- Repo-Ist nach M5 (Code, Tests, `docs/api-contract.md`)
- Kein Web-Abruf, kein Live-Test, kein Code geändert.

---

## Current-State Summary

- M1 bis M5 sind abgeschlossen und live bestätigt. Ein Eagle Modul stellt Flight Control eine Anfrage (`api.request`); der Kern prüft, führt aus und antwortet; Anfragetypen, die beim GM laufen, werden von Clients ohne GM-Rolle weitergeleitet
  (`flightcontrol.gmping`, lesend). API `0.4.0`, zwei Anfragetypen.
- **Es gibt keine Rechte.** Jedes angemeldete, aktive Modul darf jeden angebotenen Anfragetyp stellen; der Kern kennt den Nutzer nicht. Die einzige Nutzerprüfung ist `canWrite` im Hub (GM oder Assistent).
- **Live belegt (`m5-05`, B5):** Der Query-Handler beim GM bekommt außer den Anfragedaten nur die Anfrage-Option `{ timeout }`; **über die Argumente ist nicht zu erfahren, welcher Nutzer angefragt hat.**
- Der Plan verlangt für M6: Es ist einstellbar, **welches Modul von wem in wie weit** genutzt werden darf; Flight Control setzt das im Anfragekanal durch. Geplanter Stopp: Was "in wie weit" bedeutet (Stufen, Umfang), steht nicht fest
  und wird dem Projektleiter vorgelegt.

---

## Inventory

### Repo-Ist

| Baustein | Ort | Fakt |
|---|---|---|
| Haken im Kern | `core/request-kernel.ts:159-161` | Datenprüfung (`validate`), dann Ausführung (`run`). Der Plan aus M4 (Q5) legt die Rechteprüfung intern **zwischen** beide; die öffentliche API ändert sich dafür nicht. |
| Kontext des Handlers | `core/request-kernel.ts:37` | `RequestContext` enthält nur `module` (die angemeldete Modul-`id`); kein Nutzer, keine Rolle. |
| Absender | `core/request-kernel.ts` (`findSender`), `docs/api-contract.md` | Der Absender ist die selbst angegebene Modul-`id`; der Vertrag nennt sie eine Vertrauensgrenze und sagt, Flight Control entscheide **nicht nach Nutzer**. |
| Haken im Empfänger | `core/request-relay.ts:130`, `:147-150` | Die GM-Seite prüft Rolle, JSON, Größe und den Ausführungsort (`runsOn "gm"`) und ruft dann `kernel.execute`. Der Plan aus M5 legt die Rechte **hinter** die Ortsprüfung. |
| Ort der Ausführung | `core/request-relay.ts:118` | Typen mit `runsOn "caller"` und alle Typen auf einem Client mit GM-Rolle laufen im Client des Aufrufers, ohne Weiterleitung. |
| Fehlercode | `core/request-kernel.ts:12-24` | `not-permitted` ist definiert ("die empfangende Seite verweigert"); der Vertrag (`docs/api-contract.md:226`, `:229`) kündigt ihn auch für fehlende Rechte je Modul und Nutzer an. |
| Handler | `core/request-handlers.ts` | genau zwei: `flightcontrol.ping` (`caller`) und `flightcontrol.gmping` (`gm`, lesend); ein Test hält die Menge der `gm`-Handler fest. |
| Nutzerprüfung im Hub | `core/settings-hub.ts:104`, `:221`, `:274` | `canWrite(): boolean`, in Foundry `game.user?.isGM === true`; der Kommentar in Zeile 2 nennt M6 als Ersatz ("until M6 brings per-module rights"). Geschrieben wird nur in den Namensraum eines angemeldeten Moduls. |
| Hub | `v13/hub-application.ts`, `v13/module.ts` | Ein Tab je angemeldetem aktivem Modul (Einstellungen mit `config: true`, Open-Knopf); Einstiegsmenü mit `restricted: true` (nur GM). |
| Registry | `core/module-registry.ts` | je Client, "angemeldet **und** aktiv"; Schlüssel ist die Modul-`id`. |
| API | `core/eagle-api.ts` | `version`, `registerModule`, `request`; laut Plan ist im Vertrag Teil 5 eine "Rechteabfrage durch Module" vorgesehen. |

### Spezifikation und Entscheidungen (Projektleiter)

| Quelle | Inhalt |
|---|---|
| N1, `dadm/reference/eagle-modules-aufbau.md:201` | Wortlaut: "kann später in den Moduleinstellungen festgelegt werden, welches Modul von wem in wie weit genutzt werden darf". Folge: Nutzungsrechte je Modul und Nutzer; für Nutzer ohne Foundry-Rechte der GM-Anfrageweg (`User#query`). |
| U3, `01-project-brief.md:56` | Die Nutzungsrechte je Modul und Nutzer gehören in diese Phase, als eigener Milestone M6. |
| Plan M6, `04-milestone-plan.md:173-191` | Ziel wie oben. Scope: Datenmodell der Rechte, Ort der Einstellung (Hub und/oder Foundry-Moduleinstellungen), Standardwerte, Durchsetzung in M4 und M5; **geplanter Stopp** bei "in wie weit". Deliverables: Rechte-Logik mit Tests, Einstellungsoberfläche, API-Vertrag Teil 5 (Rechteabfrage durch Module). Acceptance: Vitest für die Auswertung (erlaubt, abgelehnt, Standardwerte, unbekanntes Modul oder Nutzer), Durchsetzung im Anfragekanal getestet, Darstellung im Hub `unverified`. Risiken: `medium` (Umfang von "in wie weit"; bei zu großem Umfang wird der Milestone geteilt, neue Planversion), `high` Security (eine umgehbare Rechteprüfung). Abhängigkeiten: M3, M5. |
| Übergabe aus M5 (`m5-02` Abschnitt 10, `m5-04`) | Haken im Empfänger hinter der Ortsprüfung und im Kern für die lokale Ausführung; `not-permitted` ist definiert. **Vorbedingung:** U1 geklärt oder eine Human Decision regelt, woher die Nutzeridentität kommt. Regel: Kein Handler, der Daten ändert oder GM-Wissen weitergibt, trägt `runsOn "gm"`, bevor M6 und U1 geklärt sind. |
| N4 und Linsen (`04-milestone-plan.md:31-42`) | Flight Control bleibt schmal und generisch; Änderungen an Foundry-Daten nur über Flight Control. |
| Praxis analysierter Module, `dadm/reference/source-analysis/techniques-catalog.md:126-132` | Midi-QOL und Active Auras lassen den GM "validieren und ausführen"; belegt ist dort das Weiterleiten an den GM, nicht ein Rechtemodell je Nutzer. |
| Safety Boundaries und Scope (`02`, `03`) | Keine Dependency-Änderung; Live-Test nur mit Freigabe je Test; Schreibzugriff nur `core/`, `v13/`, `test-fixtures/`, `docs/`, `dadm/`. |

### Foundry-Fakten (Types v13.345.1; Pfade relativ zu `foundry-vtt-reference-v13/types/src/foundry/`)

| # | Fakt | Fundstelle |
|---|---|---|
| FF1 | Rollen: `NONE` (0), `PLAYER` (1), `TRUSTED` (2), `ASSISTANT` (3), `GAMEMASTER` (4). Ein Assistent hat viele Rechte eines GM, "but does not have the ability to perform administrative actions like changing User roles or modifying World-level settings"; ein GM kann "configure World settings". | `common/constants.d.mts:1183-1220` |
| FF2 | `BaseUser#isGM` ("GAMEMASTER or ASSISTANT role"), `hasRole(role, options)`, `can(action)`; `User#isSelf`, `User#isActiveGM`. | `common/documents/user.d.mts:61`, `:70`, `:88`; `client/documents/user.d.mts:633-641` |
| FF3 | Die Berechtigung `SETTINGS_MODIFY` hat die Standardrolle `ASSISTANT`. Die Rollenbeschreibung (FF1) sagt, ein Assistent könne Welteinstellungen nicht ändern; die Referenz gleicht beides nicht ab. | `common/constants.d.mts:1492-1501` |
| FF4 | Einstellungs-Scopes: `client` (localStorage, je Gerät), `world` ("Applies to all Users in the World", Einstellungsdatenbank), `user` ("individual User in the World", Einstellungsdatenbank). Das Registrierungsbeispiel zeigt `scope: "user"`, der Typ der Konfiguration nennt `"world" \| "client"`. | `common/constants.d.mts:2474-2490`; `client/helpers/client-settings.d.mts:105`, `:280` |
| FF5 | Eine Einstellung kann Objekte und Arrays speichern: `type` nimmt `DataField`, `DataModel`, Funktionen und Konstruktoren; ein Objekt-Typ wird als `Object` geführt. | `client/helpers/client-settings.d.mts:226-238`, `:286` |
| FF6 | Ein Benutzer hat die Felder `role` (Zahl) und `permissions` (Objekt, Überschreibungen der Berechtigungen); `game.users` ist die Sammlung, mit `players` und `activeGM`. | `client/documents/user.d.mts:200`, `:268`; `client/documents/collections/users.d.mts:30-36` |
| FF7 | Ein Einstiegsmenü kann mit `restricted: true` auf den GM beschränkt werden. | `client/helpers/client-settings.d.mts:135`, `:353` |
| FF8 | `User#query(queryName, queryData, { timeout }?)` ist eine Methode **jedes** `User`, nicht nur des GM; Query-Namen müssen mit dem Modul präfixiert sein. | `client/documents/user.d.mts:727-738`; `client/config.d.mts:2407-2411` |
| FF9 | **Live (`m5-05`, B5):** Der Query-Handler beim GM bekommt `(queryData, { timeout: 17000 })`; die zweite Angabe ist die Anfrage-Option, keine Angabe zum anfragenden Nutzer. | Live-Check 2026-09-20 |

### Nicht ohne Live-Test belegbar

| # | Offener Punkt | Warum es zählt |
|---|---|---|
| U1 | Ob ein Spieler den Wert einer Welteinstellung in seinem Client lesen kann (FF4 sagt "applies to all Users", nicht ob jeder Client den Wert erhält). | Sichtbarkeit der Rechte für Spieler; Wahl des Speicherorts. |
| U2 | Ob ein Assistent eine Welteinstellung schreiben darf (FF1 gegen FF3). | Wer Rechte einstellen darf; `canWrite` ist heute "GM oder Assistent". |
| U3 | Ob `User#query` an einen **Spieler** (nicht an den GM) funktioniert und wie es sich verhält, wenn das Ziel nicht verbunden ist oder keinen Handler hat (U2 bis U5 aus M5 sind live nicht ausgelöst worden). | Eine Rückfrage des GM an den genannten Nutzer ist technisch ausdrückbar (FF8), ihr Verhalten unbelegt. |
| U4 | Ob dem Query-Handler auf anderem Weg als über die Argumente etwas über den Absender zur Verfügung steht (der Live-Check hat nur die Argumente gezeigt, nicht `this` oder globale Zustände). | Herkunft der Nutzeridentität. |
| U5 | Verhalten von Einstellungen mit `scope: "user"` in v13 (Registrierung, Lesen der Werte anderer Nutzer durch den GM) angesichts der Abweichung in FF4. | Speicherort je Nutzer. |
| U6 | Ob Nutzer-IDs über die Lebensdauer einer Welt stabil sind (ein gelöschter und neu angelegter Nutzer bekäme eine neue ID); die Referenz sagt dazu nichts. | Schlüssel des Datenmodells, Umgang mit gelöschten Nutzern. |

---

## Dependencies

- **Code:** M3 (Hub, Tabs, `canWrite`), M4 (Kern und Haken), M5 (Empfänger, `not-permitted`), M2 (Registry). Der Vertrag bekommt Teil 5 und eine neue API-Version (nach der bisherigen Praxis `0.5.0`).
- **Foundry:** Rollen und `game.users`, Einstellungen (Welt oder Nutzer), gegebenenfalls `User#query`. Keine neue Fremdmodul-Abhängigkeit, keine Änderung an `package.json` (kein Human-Decision-Trigger 4).
- **Tests:** Vitest für die reine Auswertung mit eingespeisten Quellen (K1 bis K4); die Foundry-Hülle bleibt dünn.
- **Live-Prüfung:** GM und mindestens ein Spieler gleichzeitig; um Unterschiede **zwischen** Nutzern zu zeigen, zwei Spielerkonten; Freigabe je Test, der Projektleiter führt sie aus.
- **Entscheidungen des Projektleiters:** Bedeutung von "in wie weit" (geplanter Stopp); Herkunft und Vertrauensgrad der Nutzeridentität (voraussichtlich Human Decision, siehe R1).

---

## Risks and Assumptions

| # | Risiko | Severity | Blocking |
|---|---|---|---|
| R1 | **Security, Identität:** Foundry gibt dem Handler keinen Absender mit (FF9). Rechte je Nutzer lassen sich deshalb nicht auf eine von Foundry bestätigte Nutzer-ID stützen; eine im Umschlag mitgeschickte ID kann ein veränderter Client fälschen und sich als anderer Nutzer ausgeben. Ob ein anderer belastbarer Weg besteht (etwa eine Rückfrage des GM an den genannten Nutzer, U3), ist offen. Nach Governance ist ein bleibender `high`-Security-Fund eine Human Decision. | `high` | no (Discover) |
| R2 | **Security, Reichweite:** Ein Handler mit `runsOn "caller"` läuft im Client des Aufrufers mit dessen eigenen Foundry-Rechten; dort kann Flight Control **nichts gegen den Aufrufer durchsetzen** (der Aufrufer kann den Kern umgehen, Foundry selbst setzt die Rechte des Nutzers durch). Durchsetzbar ist eine Rechteprüfung nur auf der GM-Seite (`runsOn "gm"`); für Anfragen im eigenen Client ist sie höchstens eine Regel für kooperative Module. Das begrenzt, was "Nutzungsrechte" ehrlich versprechen können. | `high` | no (Discover) |
| R3 | Umfang und Bedeutung von "in wie weit" sind offen (N1). Bei zu großem Umfang wird der Milestone geteilt (neue Planversion, neue Approval). | `medium` | no |
| R4 | Wer Rechte einstellen darf: `canWrite` ist heute "GM oder Assistent"; ob ein Assistent Welteinstellungen schreiben darf, ist widersprüchlich beschrieben (U2). Eine Rechte-Einstellung, die ein Assistent einstellen darf, sich selbst zu erhöhen, wäre ein Rechteproblem. | `medium` | no |
| R5 | Fehlkonfiguration und Aussperrung: Wird ein Modul für alle gesperrt oder ein GM ausgeschlossen, ist das Modul unbrauchbar. Ob der GM immer erlaubt ist und wie ein Standardwert aussieht, ist offen. | `medium` | no |
| R6 | Die Durchsetzung ist nur live prüfbar (GM und Spieler); die Auswertung selbst ist reine Logik. Die Hülle (Speichern, Lesen, Rückfrage) bleibt bis zum Live-Check `unverified`. | `medium` | no |
| R7 | Datenschutz: Die Zuordnung "Nutzer ↔ Modul ↔ Stufe" ist Konfiguration einer Tischrunde. Ob Spieler sie lesen können (U1), hängt vom Speicherort ab; sie enthält Nutzer-IDs und keine weiteren personenbezogenen Daten. | `low` | no |
| R8 | Nutzer, die gelöscht, umbenannt oder neu angelegt werden (U6): Rechte verwaisen oder fehlen; ein neuer Nutzer braucht einen Standardwert. | `low` | no |
| A1 | **Annahme:** Nutzer-IDs bleiben für die Lebensdauer eines Nutzers stabil (Foundry-Dokument-IDs); nicht in der Referenz belegt. | `low` | no |
| A2 | **Annahme:** Die Modul-`id` bleibt der Schlüssel je Modul (Registry, Vertrag); die Rechte beziehen sich auf angemeldete Eagle Module. | `low` | no |

`critical` liegt nicht vor. R1 und R2 sind `high` (Security): Sie werden im Apply behandelt; bleibt danach ein `high`-Security-Fund bestehen, ist es eine Human Decision. Sichtbar ist schon jetzt, dass R1 durch das Design allein
nicht kleiner wird, weil die Identität eine Frage des Vertrauens ist, nicht der Logik.

---

## Open Questions

**An den Projektleiter (geplanter Stopp, nicht interpretiert):**

1. **Was heißt "in wie weit"?** Der Plan nennt "Stufen, Umfang". Denkbare Lesarten, keine davon ist gewählt: (a) nur erlaubt oder verboten je Modul und Nutzer; (b) Stufen je Modul (etwa nur ansehen, benutzen, ändern);
   (c) je Anfragetyp oder Funktion eines Moduls; (d) je Art des Ziels (etwa nur eigene Charaktere); (e) etwas anderes.
2. **Was soll durchgesetzt werden?** Nur die Anfragen an Flight Control (Anfragekanal), oder auch, ob ein Nutzer die Oberfläche eines Moduls überhaupt bekommt (das läge im Modul, Flight Control würde es nur beantworten, R2)?
3. **Wer stellt ein, und wo?** GM allein oder auch Assistenten (R4); im Hub (ein Tab je Modul), in Foundrys Moduleinstellungen oder in beidem (N1 nennt "in den Moduleinstellungen").
4. **Standardwerte:** Was gilt für ein neues Modul und für einen neuen Nutzer, und darf der GM immer alles (R5)?

**Für das Apply (Design, bei Sicherheitsfragen mit Vorlage an den Projektleiter):**

5. Herkunft und Vertrauensgrad der Nutzeridentität (R1): Vertrauen auf eine mitgeschickte ID (für eine Tischrunde unter Bekannten), eine Rückfrage des GM an den genannten Nutzer (U3), Rechte nur je Modul statt je Nutzer (Abweichung von N1), oder etwas anderes.
6. Ort des Datenmodells: Welteinstellung mit einem Objekt (FF5) oder Einstellungen je Nutzer (U5); Umgang mit gelöschten Nutzern (U6).
7. Form der Rechteabfrage durch Module (API Teil 5): Was fragt ein Modul, was bekommt es zurück, und wie verhält es sich bei einem unbekannten Nutzer?
8. Schnitt der Tests und der Live-Prüfung: reine Auswertung in Vitest; Testmodule und Ablauf für GM und zwei Spieler.

**Praktisch (für den Live-Check):** Gibt es ein zweites Spielerkonto, damit ein Unterschied zwischen zwei Nutzern überhaupt sichtbar wird?

---

## Artifacts

| Artefakt | Retention |
|---|---|
| `dadm/m6-01-discover-output.md` (dieses Dokument) | immutable nach Phasenabschluss |

---

## Next Step

Apply (M6). Es beginnt mit dem **geplanten Stopp**: Die Fragen 1 bis 4 gehen an den Projektleiter, bevor ein Rechtemodell entworfen wird. Danach Zielarchitektur, Datenmodell, Ort der Einstellung, Durchsetzung im Kern und im Empfänger,
Vertrag Teil 5, Testplan und Akzeptanzkriterien; zur Herkunft der Nutzeridentität (Frage 5) eine Human Decision, wenn danach ein `high`-Security-Fund bleibt. Der Deploy wartet auf das "Go".

```
artifact: apply-output
milestone: M5
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m5-01-discover-output.md` (Fakten a1–e, Risiken R1–R2)

## Bewertung je Fähigkeit

### (a) Hub mit Registerkarte je Eagle Modul, Start der Module — **machbar, Risiko niedrig**
- Registerkarten sind in `ApplicationV2` eingebaut (a1). Der Phase-1-Hub ist bereits eine `ApplicationV2` (a2); der
  Umbau von "eine Tabelle" auf "Tabs je Modul" ist eine Erweiterung, kein Neubau.
- **Wie wird ein Eagle Modul erkannt?** Vier Wege, keiner davon ist ein Foundry-Standard für "gehört zu einer Familie":

  | Weg | Vorteil | Nachteil |
  |---|---|---|
  | `relationships.requires` nennt Flight Control | von Foundry selbst erzwungen (b2: ohne Abhängigkeit nicht aktivierbar); braucht keine Zusatzkonvention | sagt nur "abhängig", nicht "Eagle Modul" (fremde Module könnten Flight Control ebenfalls verlangen) |
  | Eintrag im Paket-`flags`-Objekt des Manifests (a3) | eindeutig, lesbar ohne Modulcode, auch bei inaktivem Modul | eigene Konvention; jeder Eagle Modul muss ihn pflegen |
  | Registrierung per API beim Laden (`registerModule({…})`) | transportiert gleich Titel, Einstellungs-Namensraum und Startfunktion | nur bei **aktiven** Modulen sichtbar |
  | Namenspräfix der Modul-ID | einfach | Modul-IDs sind offen (A1); Präfix ist nur eine Namenskonvention und ließe sich von jedem Fremdmodul nachahmen |

  **Empfehlung:** Kombination aus `flags`-Eintrag (Erkennung, auch für inaktive Module) und API-Registrierung
  (Inhalt der Registerkarte, Startfunktion). Die Abhängigkeit auf Flight Control steht ohnehin in `relationships.requires`.
  So können später weitere Module ohne Änderung an Flight Control ergänzt werden (PDF: "später weitere dazu kommen").
- **Installiert, aber inaktiv:** `game.modules` enthält auch inaktive Module (a3), deren Einstellungen aber nicht
  registriert sind (a5). Für sie kann die Registerkarte nur Manifest-Informationen zeigen. Ob sie sichtbar
  oder ausgeblendet werden, ist eine Detailfrage (N2, nicht blockierend).
- **Einstellungen bündeln:** Lesen/Schreiben über die Registry ist in Phase 1 belegt (a5); nötig ist ein Filter auf die
  Namensräume der erkannten Eagle Module.
- **Start aus dem Hub:** Q15 (a): die Oberfläche öffnen. Jedes Modul registriert eine Startfunktion (mit Kontext, z. B.
  "neu erstellen" bei Character Edit). Risiko niedrig.

### (b) Anfragenkanal Eagle Module → Flight Control — **machbar, Risiko mittel**
- **Mechanismus im selben Client:** die Konvention `game.modules.get(id).api` ist bei Midi-QOL und Custom D&D 5e etabliert (b1).
  Flight Control stellt eine schmale Anfrage-Schnittstelle bereit, die Module aufrufen.
- **Ladereihenfolge:** Die Doku garantiert nur "Library-Module zuerst" (b3). Ein Zugriff auf die API ist deshalb sicher erst ab dem
  `setup`- oder `ready`-Hook, nicht im eigenen `init`: Diese Hooks laufen nach `init`, also erst, wenn alle Module ihre `init`-Callbacks
(auch Flight Control die Bereitstellung der API) ausgeführt haben; die Reihenfolge der `init`-Callbacks folgt der nicht dokumentierten Ladereihenfolge. Alternative: Flight Control
  als `library: true` deklarieren. Das passt nicht zur Definition ("keine nutzersichtbare Funktion", b3), weil Flight Control einen
  Hub hat. **Nicht empfohlen.**
- **Berechtigungen:** Aufrufe im selben Client laufen mit den Rechten des Aufrufers. Actors, Items und Journale anzulegen ist
  standardmäßig Assistenten-Rolle (b6). Sollen **Spieler** solche Anfragen stellen, braucht Flight Control einen Weg zum GM-Client.
  `User#query` mit einer in `CONFIG.queries` registrierten, präfixierten Anfrage ist dafür in v13 eingebaut (b5) und
  braucht kein zusätzliches Modul (in Phase 1 wurde socketlib ausdrücklich abgelehnt). Wer welches Modul nutzen darf (nur GM oder auch
  Spieler), ist offen (N1, nicht blockierend); es entscheidet nur, ob dieser Weg gebraucht wird.
- **Versionsverträglichkeit getrennter Repos:** Jeder Eagle Modul kann die Flight-Control-Versionsspanne in `relationships.requires`
  angeben (b4/b7). Ob Foundry sie erzwingt, ist **nicht verifiziert** (b7). Empfohlener Rückhalt: eine API-Version in Flight Control und
  eine Prüfung beim Registrieren (semver); bei Abweichung meldet das Modul und deaktiviert nur seine eigenen Funktionen. Die Stabilität dieser
  Schnittstelle (Änderungen nur abwärtskompatibel oder mit Übergangszeit) ist bei sieben getrennt veröffentlichten Modulen die wichtigste
  Designregel.
- **Fehlt oder ist Flight Control deaktiviert?** Fehlend: Foundry verhindert die Aktivierung (b2). Deaktiviert: **nicht dokumentiert** (b4). Jedes Modul prüft
  deshalb defensiv, ob die API vorhanden ist. **Nicht verifiziert**, ein Beleg bräuchte einen Live-Test (Freigabe nötig, R1).
- **Wirkung von Q3 (alle Foundry-Änderungen über Flight Control):** Flight Control wird zum Ausführer aller schreibenden Operationen
  (Compendien anlegen/kopieren, Journal-Ordner und -Einträge, Actors/Items). Das PDF verlangt zugleich "kein großes Mega-Modul"
  (P-G2). **Risiko mittel** (Architektur): Bleibt die Schnittstelle schmal und generisch (allgemeine Operationen, Systemwissen), während die
  Editor-Logik in den Modulen bleibt, sind beide Vorgaben vereinbar; wächst dort modulspezifische Logik hinein, wird Flight Control
  zum Mega-Modul. Das ist ein Bewertungspunkt für die Umsetzungsphase (N4).

### (c) "Versteht Foundry API und DnD Systemlogik" — **machbar, Risiko niedrig-mittel**
Die dnd5e-Erweiterungspunkte sind aus Phase 2 belegt (c1). Neu: dnd5e verändert sich mit Versionen (c3). Flight Control sollte die getestete
Systemversion kennen und prüfen (`game.system.version`), bevor es Strukturen schreibt; bei Abweichung warnen statt still falsche Daten erzeugen.
Verwaltet wird das über eine gepflegte Liste getesteter dnd5e-Versionen (nur v13-Linie, E1). Restrisiko: ein dnd5e-Update ändert Strukturen, die
Flight Control nutzt; der Aufwand entsteht bei jeder dnd5e-Version.

### (d) "Klartext ↔ Code" — **Vorwärts abhängig von M6; Rückwärts teils sofort, teils begrenzt machbar; Risiko mittel**
- **Vorwärts** (Klartext/strukturierte Eingabe → Foundry-Daten): Phase-2-Befund (d1) für Schaden, Typ, "magisch"; die Bedingungsfrage klärt M6.
- **Rückwärts, Lesart 1: Daten → strukturierte Editor-Daten** (das verlangen P-CE4 und P-HB6): machbar für dnd5e-Standardstrukturen, weil Datenmodell und
  Schema offen liegen. **Designbedingung:** Ein Editor bildet nur einen Teil des Datenobjekts ab. Alles, was er nicht kennt (fremde Flags, Effekte,
  Felder späterer dnd5e-Versionen), muss beim Zurückschreiben erhalten bleiben (Durchreichen der Restdaten), sonst zerstört "Edit with" beim Speichern
  Daten bestehender Objekte. Das ist der häufigste Fehlerfall beim Umkehren von Datenstrukturen.
- **Rückwärts, Lesart 2: Daten → lesbarer Text:** dnd5e liefert lokalisierte Bausteine (Labels für Aktivierung, Angriff, Schaden; Feldlabels aus dem Schema;
  `richTooltip`, `getChatData`, d2–d5). Eine **strukturierte** Zusammenfassung ("Aktivierung: Aktion, Reichweite: Berührung, Schaden: 2d6 Feuer") ist
  damit ohne eigene Übersetzungstabellen machbar und folgt automatisch der Spielsprache. Ein **Satz in natürlicher Sprache** ("Zusätzlich 2W6 Feuerschaden
  gegen Untote") lässt sich nur für bekannte Strukturen über Vorlagen erzeugen (d6); für unbekannte Strukturen bleibt die Feldliste als Rückfall.
  **Begrenzt machbar.**
- Sprache des Klartexts: bei Nutzung der dnd5e-Labels die aktive Foundry-Sprache; für eigene Sätze braucht das Modul eigene Übersetzungen (N3).

### (e) Einordnung des Phase-1-Codes (Information, keine Entscheidung)
Lesen und Schreiben der Registry (`core/settings-hub.ts`) und das Auslesen der Paketdaten (`core/manifest-scanner.ts`) sind Bausteine, die ein
Eagle-only-Hub braucht; sie brauchen einen Filter auf Eagle Module. Der Hub selbst braucht Registerkarten und Startfunktionen. Konflikt-Überwachung
(`core/conflict-watch.ts`) und, soweit auf Fremdmodule bezogen, die Sprach-Erkennung (`core/language-scan.ts`) haben keinen Bezug zu Q1 a. Ob sie
entfernt oder umgebaut werden, entscheidet eine Umsetzungsphase (E6).

## Zusammenfassung
| Fähigkeit | Verdict | Risiko |
|---|---|---|
| (a) Hub, Registerkarten, Start | machbar | niedrig |
| (b) Anfragenkanal | machbar; Ladereihenfolge und deaktivierte Abhängigkeit nicht verifiziert | mittel |
| (c) Foundry-API und DnD-Systemlogik | machbar, mit Versionswächter | niedrig-mittel |
| (d) Klartext ↔ Code | vorwärts abhängig von M6; rückwärts Daten → Editor machbar mit Durchreichen der Restdaten; Daten → Satz begrenzt | mittel |
| (e) Phase-1-Code | Information | — |

## Nicht blockierende offene Punkte (gesammelt für den Projektleiter)
| # | Punkt | Auswirkung |
|---|---|---|
| N1 | Wer darf welches Modul nutzen: nur GM oder auch Spieler (z. B. Character Edit)? | entscheidet, ob der GM-Anfrageweg (`User#query`) gebraucht wird |
| N2 | Registerkarte für installierte, aber inaktive Eagle Module: nur Information zeigen oder ausblenden? | Detail des Hubs |
| N3 | In welcher Sprache erscheint der Klartext (aktive Foundry-Sprache, Englisch, Deutsch)? | Übersetzungsaufwand für eigene Sätze |
| N4 | "Alle Änderungen über Flight Control" (Q3) und "kein Mega-Modul" (P-G2): Flight Control bleibt eine schmale, generische Schnittstelle, Editor-Logik bleibt in den Modulen — einverstanden? | Architekturrahmen der Umsetzungsphase |

## Acceptance Criteria
- AC-M5-01: Jede der Fähigkeiten (a)–(e) hat ein Verdict mit Quellenbelegen aus Discover
- AC-M5-02: Nicht Belegtes ist als "nicht verifiziert" gekennzeichnet und nennt, was zum Beleg nötig wäre
- AC-M5-03: Ergebnis und nicht blockierende Punkte stehen in `dadm/spezifikationsabgleich.md`

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Ladereihenfolge, deaktivierte Abhängigkeit und Erzwingen der Versionsspanne sind unverifiziert; die Empfehlungen (Zugriff erst ab `setup`/`ready`, defensive Prüfung) sind so gewählt, dass sie unabhängig davon funktionieren | medium | nein |
| R2 | Die Schnittstellenstabilität zwischen sieben getrennt veröffentlichten Modulen ist die größte strukturelle Aufgabe des Vorhabens | medium | nein |
| R3 | Rückrichtung ohne Durchreichen der Restdaten würde bestehende Objekte beschädigen (Designbedingung, keine Gefahr in dieser Phase) | medium | nein |

## Next Step
Deploy übernimmt das Ergebnis in `dadm/spezifikationsabgleich.md` (Abschnitt M5 und Sammlung nicht blockierender Punkte).

```
artifact: apply-output
milestone: M3
phase: APPLY
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m3-01-discover-output.md` (geschlossen, Q1 beantwortet: beide Stufen)

## Machbarkeitsbewertung

### Teilfrage (a), Stufe 1 — deklarierte Modul-Abhängigkeiten nutzen
**Verdict: machbar, großteils bereits vorhanden.** Phase-1-M3-Infrastruktur
(`core/manifest-scanner.ts`, archiviert) liest bereits `availability`
(inkl. `MISSING_DEPENDENCY`) für jedes Modul — das basiert intern auf den
Manifest-`relationships`. Eine Eagle-Eye-Funktion, die beim Versuch, ein
Modul zu deaktivieren, prüft "hängt ein aktives Modul deklariert von diesem
ab?" und den DM warnt, ist eine direkte Erweiterung vorhandener Bausteine —
keine neue Grundlagenforschung nötig, sondern Kombination bekannter Teile.

### Teilfrage (a), Stufe 2 — generische Verhaltens-Auswirkungs-Erkennung
**Verdict: nicht robust machbar.** Kein generischer Foundry-Mechanismus
gefunden, der Settings-Änderungen mit Verhaltensänderungen anderer,
undeklariert verbundener Module verknüpft. Ein Ansatz wäre nur über eine von
Eagle Eye selbst kuratierte, hart einprogrammierte Wissensbasis bekannter
Modul-Kombinationen denkbar — das ist **kein automatisches Erkennen**, sondern
gepflegtes Fachwissen, das mit jedem neuen Modul/Update veraltet. Realistische
Empfehlung: nicht als generische Funktion verfolgen, ggf. später als optionale,
explizit von Nutzern beigesteuerte "bekannte Konflikt-Hinweise"-Datenbank
(deutlich anderer Charakter als "erkennen").

### Teilfrage (b) — Modul-(De)Aktivierung
**Verdict: nur UI-basiert, mit Neustart-Pflicht, keine öffentliche
Runtime-API.** Eagle Eye könnte höchstens eine **komfortablere Oberfläche**
für den bestehenden Modul-Manager bieten (ähnlich "Quick Module Enable"),
nicht aber Module *im laufenden Betrieb* aktivieren/deaktivieren. Jede
Änderung bräuchte weiterhin einen Welt-Neustart über die reguläre
Foundry-Mechanik.

## Gesamtfazit für Eagle Eyes Settings-Hub-Erweiterung
Realistisch umsetzbar: (1) Warnung bei Deaktivierung eines Moduls, von dem
andere aktive Module deklariert abhängen (Stufe 1) — Erweiterung des
bestehenden Hubs. (2) Ein Komfort-UI für Modul-(De)Aktivierung mit
Reload-Hinweis (Teilfrage b) — kein neues technisches Risiko. **Nicht**
realistisch: automatische Erkennung undeklarierter Verhaltens-Wechselwirkungen
(Stufe 2) — dafür gibt es keine belastbare technische Grundlage.

## Acceptance Criteria
```
AC-M3-01: Beide Teilfragen (a-Stufe-1, a-Stufe-2, b) getrennt bewertet, mit
          Quellenbelegen
```
Erfüllt.

## Risks and Assumptions
Keine neuen.

## Next Step
Deploy: Ergebnis in `dadm/eagle-modules-projektplan.md` übernehmen. Danach
Monitor, dann automatisch weiter mit M4 (Eagle Eyrie).

```
artifact: apply-output
milestone: M5
phase: APPLY
status: complete
date: 2026-09-17
```

## Input Summary
- `dadm/m5-01-discover-output.md` (geschlossen — libWrapper-Konflikt-Hooks exakt
  verifiziert)

## Solution Design

### Entscheidung: kleiner Prototyp wird gebaut
Ein Listener auf `libWrapper.ConflictDetected`/`libWrapper.OverrideLost` ist
klein, nutzt bereits vorhandene Infrastruktur (`core/`-Pattern aus M3/M4) und
liefert einen konkreten, live verifizierbaren Beweis statt nur Prosa.

### Architektur
Neues Modul `core/conflict-watch.ts`:
```ts
interface ConflictEvent {
  source: "libWrapper.ConflictDetected" | "libWrapper.OverrideLost";
  packageA: string;
  packageB: string;
  wrapperName: string;
  targets: string[];
}

function isLibWrapperActive(): boolean;   // game.modules.get("lib-wrapper")?.active
function watchForConflicts(onConflict: (e: ConflictEvent) => void): void;
// registriert Hooks.on(...) für beide Events, No-Op falls libWrapper inaktiv/fehlt
```

`watchForConflicts()` wird im `ready`-Hook von `v13/module.ts`/`v14/module.ts`
aufgerufen, mit `onConflict` = einfaches `console.warn`-Log (konsistent mit dem
"einfache Anzeige"-Muster aus M3 — keine neue UI nötig für dieses
Forschungs-Milestone).

### Warum kein Versuch, rohes Monkey-Patching zu erkennen
Laut Discover ist das nicht robust möglich (keine offizielle API, nur fragile
Heuristiken über Stacktraces/Skriptpfade). Ein Prototyp dafür würde falsche
Sicherheit vortäuschen — bewusst nicht gebaut. Das ist das zentrale Ergebnis
des Forschungsberichts, keine Lücke.

## Forschungsbericht (Kern-Deliverable von M5)

**Erkennbar über Manifest-Daten hinaus:**
- Methoden-Patch-Konflikte zwischen Modulen, die **libWrapper** korrekt nutzen
  — zuverlässig, mit exakter Paket-/Methoden-Zuordnung, über offizielle Hooks

**Nicht robust erkennbar:**
- Konflikte durch rohes Monkey-Patching ohne libWrapper (kein Erkennungsweg)
- Hook-Reihenfolge-Konflikte zwischen unabhängigen Modulen (keine stabile
  Introspektions-API)
- Reine Performance-Interferenz zwischen Modulen (kein Kausalitäts-Signal
  verfügbar)
- Stacktrace-basierte Fehlerzuordnung ist möglich, aber nur heuristisch und
  bricht bei gebündeltem/minifiziertem Code — nicht empfohlen als verlässlicher
  Baustein

**Konsequenz für zukünftige Milestones (insb. M7):** Eine vollständige,
generische Kompatibilitätserkennung über alle möglichen Konfliktarten ist nicht
realistisch. EagleEyes Kompatibilitäts-Wert liegt in der Bündelung der
tatsächlich verfügbaren Signale (Manifest/`availability` aus M3 + libWrapper-
Konflikte aus M5), nicht in einer umfassenden Laufzeit-Analyse.

## Acceptance Criteria
```
AC-M5-01: `core/conflict-watch.ts` erkennt (gemockt, Vitest) einen simulierten
          `libWrapper.ConflictDetected`-Event korrekt und reicht ihn strukturiert
          durch.
AC-M5-02: Bei fehlendem/inaktivem libWrapper registriert `watchForConflicts()`
          nichts und wirft keinen Fehler (Vitest).
AC-M5-03: Forschungsbericht (obiger Abschnitt) ist dokumentiert — das ist die
          im Milestone Plan geforderte "dokumentierte Erkenntnis, was erkennbar
          ist / was nicht".
AC-M5-04 (optional, nice-to-have): Live-Bestätigung, dass der Listener in der
          echten Welt des Projektleiters registriert wird (kein Fehler beim
          Laden) — kein erzwungener echter Konflikt nötig, das wäre
          unverhältnismäßiger Aufwand für dieses Forschungs-Milestone.
```

## Risks and Assumptions
| # | Description | Severity | Blocking |
|---|---|---|---|
| R1 | AC-M5-04 erzeugt keinen echten Konflikt, nur "lädt fehlerfrei" — ein echter Zwei-Wrapper-Konflikt künstlich zu erzeugen wäre AC-M5-03s Forschungsaussage nicht wert genug für den Aufwand (bräuchte ein drittes Dummy-Modul, das denselben Core-Pfad wrapped) | info | nein |

## Open TBDs
Keine blockierenden TBDs.

## Next Step
Deploy implementiert `core/conflict-watch.ts` + Tests, verdrahtet den
`ready`-Hook, Projektleiter bestätigt optional den fehlerfreien Live-Load.

# Eagle Flight Control

Foundry-VTT-Modul **Eagle Flight Control**: die Schnittstelle zwischen den Eagle Modulen,
dem DnD-5e-System und Foundry VTT. Es ist das Kernmodul der Eagle Modules (siehe unten): Die anderen Module benutzen
es, um Foundry-Daten zu ändern, und Flight Control selbst bietet einen Hub zum Einstellen und Starten der Eagle Module.

**Stand:** Aktuelle Version `0.6.0` (API `0.12.0`). Vorerst nur für Foundry v13 verfügbar.


## Was Flight Control kann

- **Anmeldung:** Ein Eagle Modul meldet sich bei Flight Control an, auf Wunsch mit einer Startfunktion.
- **Hub:** Ein Fenster mit einer Registerkarte je angemeldetem, aktivem Eagle Modul: seine Einstellungen, ein Startknopf und, für den Spielleiter, die Rechte je Spieler.
- **Anfragen:** Ein Modul bittet Flight Control, etwas zu tun. Braucht die Anfrage die Rechte des Spielleiters, führt dessen Client sie aus, nachdem der anfragende Spieler sie bestätigt hat.
- **Rechte je Modul und Nutzer:** Der Spielleiter legt fest, welcher Spieler welches Modul benutzen darf (verboten, nur eigene Ziele, alle Ziele).
- **Versionswächter:** Flight Control meldet, wenn das DnD-5e-System in einer Version läuft, mit der es nicht getestet wurde (getestet: `5.3.3`). Es sperrt dadurch nichts.

Die Schnittstelle für Autoren von Eagle Modulen steht in [`docs/api-contract.md`](./docs/api-contract.md), die Regeln
für die Oberfläche in [`docs/ui-guide.md`](./docs/ui-guide.md) (beide auf Englisch).

## Installation

Ein Release besteht aus zwei Dateien: `module.json` und `eagle-flight-control-v13.zip`. Foundry installiert das Modul über die
Manifest-URL aus `module.json`:

```
https://github.com/MattTheEagle/EagleFlightControl/releases/latest/download/module.json
```

Solange kein Release veröffentlicht ist, führt diese Adresse ins Leere.

## Build

Voraussetzung: Node.js 24, für `npm run package` zusätzlich das Werkzeug `zip`.

```
npm install
npm run build       # baut v13
npm run typecheck   # Typprüfung v13 gegen die gepinnten Foundry-Types
npm run test        # Vitest-Suite (core/-Logik, ohne Foundry-Laufzeit)
npm run package     # baut release/eagle-flight-control-v13.zip und release/module.json; veröffentlicht nichts
```

## Projekt und Prozess

Entwickelt wird gegen Foundry v13 (siehe `v13/`), mit gemeinsamer Logik unter `core/`. Foundry v14 wird vorerst nicht weiterverfolgt und ist aus der Codebasis entfernt


Die größere Vision "The Eagle Modules - Easy VTT for Complex RPG" — Eagle Flight Control als Kernmodul plus weitere, aufeinander abgestimmte Module

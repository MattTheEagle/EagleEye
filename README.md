# EagleEye

Foundry-VTT-Modul **Eagle Flight Control** (Arbeitsname EagleEye): die Schnittstelle zwischen den Eagle Modulen,
dem DnD-5e-System und Foundry VTT. Es ist das Kernmodul der Eagle Modules (siehe unten): Die anderen Module benutzen
es, um Foundry-Daten zu ändern, und Flight Control selbst bietet einen Hub zum Einstellen und Starten der Eagle Module.

**Stand:** Version 0.1.0 (API `0.7.0`) ist vorbereitet, aber noch nicht als Release veröffentlicht. Nur Foundry v13.
Es gibt keine Lizenz (Hobbyprojekt).

## Was Flight Control kann

- **Anmeldung:** Ein Eagle Modul meldet sich bei Flight Control an, auf Wunsch mit einer Startfunktion.
- **Hub:** Ein Fenster mit einer Registerkarte je angemeldetem, aktivem Eagle Modul: seine Einstellungen, ein
  Startknopf und, für den Spielleiter, die Rechte je Spieler.
- **Anfragen:** Ein Modul bittet Flight Control, etwas zu tun. Braucht die Anfrage die Rechte des Spielleiters, führt
  dessen Client sie aus, nachdem der anfragende Spieler sie bestätigt hat.
- **Rechte je Modul und Nutzer:** Der Spielleiter legt fest, welcher Spieler welches Modul benutzen darf (verboten,
  nur eigene Ziele, alle Ziele).
- **Versionswächter:** Flight Control meldet, wenn das DnD-5e-System in einer Version läuft, mit der es nicht getestet
  wurde (getestet: `5.3.3`). Es sperrt dadurch nichts.

Die Schnittstelle für Autoren von Eagle Modulen steht in [`docs/api-contract.md`](./docs/api-contract.md), die Regeln
für die Oberfläche in [`docs/ui-guide.md`](./docs/ui-guide.md) (beide auf Englisch).

## Installation

Ein Release besteht aus zwei Dateien: `module.json` und `eagleeye-v13.zip`. Foundry installiert das Modul über die
Manifest-URL aus `module.json`:

```
https://github.com/MattTheEagle/EagleEye/releases/latest/download/module.json
```

Solange kein Release veröffentlicht ist, führt diese Adresse ins Leere.

## Build

Voraussetzung: Node.js 24, für `npm run package` zusätzlich das Werkzeug `zip`.

```
npm install
npm run build       # baut v13
npm run typecheck   # Typprüfung v13 gegen die gepinnten Foundry-Types
npm run test        # Vitest-Suite (core/-Logik, ohne Foundry-Laufzeit)
npm run package     # baut release/eagleeye-v13.zip und release/module.json; veröffentlicht nichts
```

## Projekt und Prozess

Entwickelt wird gegen Foundry v13 (siehe `v13/`), mit gemeinsamer Logik unter `core/`. Foundry v14 wird vorerst nicht
weiterverfolgt und ist aus der Codebasis entfernt; der Stand liegt im Git-Verlauf.

Projekt-Prozess (DAD-M) und alle Entscheidungs-/Planungsartefakte: siehe `dadm/` (`dadm/README.md` nennt den Stand;
abgeschlossene Phasen liegen unter `dadm/archive/`, die bestätigten Projektpläne unter
`dadm/eagle-modules-projektplan.md` und [`EAGLE-MODULES-PLAN.md`](./EAGLE-MODULES-PLAN.md)).

Die größere Vision ("Eagle Modules" — Eagle Flight Control (ehemals Eagle Eye) als Kernmodul plus sechs
weitere, aufeinander abgestimmte Module) samt Machbarkeitsprüfung je Modul:
siehe [`EAGLE-MODULES-PLAN.md`](./EAGLE-MODULES-PLAN.md) — verständlich auch
ohne Vorwissen zum Projekt.

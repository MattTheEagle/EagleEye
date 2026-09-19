```
artifact: discover-output
milestone: M8
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/04-milestone-plan.md` (M8), Antworten Q3 a, Q7 a (`dadm/m4-05-human-decision-output.md`), PDF-Aussagen P-L4, P-L5, P-L9, P-L10
- Ergebnis M7 (`dadm/m7-02-apply-output.md`), M5 (Tabs in `ApplicationV2`)
- Foundry-v13-Types, dnd5e 5.3.3 (Commit `965ad2d`), Custom D&D 5e (Vergleichsmuster)

## Fakten

| # | Fakt | Quelle |
|---|---|---|
| h1 | Ein Index-Eintrag hat `_id` und `uuid` und die angeforderten Felder; damit lässt sich eine Trefferliste ohne Dokumente bauen | `client/documents/collections/compendium-collection.d.mts:372` |
| h2 | Welt-Compendien haben standardmäßig die Rechte `{PLAYER: "OBSERVER", ASSISTANT: "OWNER"}`; Spieler sehen sie also und können daraus ziehen | `common/packages/base-package.d.mts:463` |
| h3 | Tastenkürzel werden mit `game.keybindings.register(namespace, action, {name, hint, editable, onDown, onUp, restricted, reservedModifiers, precedence})` angelegt; die Belegung ist vom Nutzer änderbar. Die Registrierung muss vor der Initialisierung der Bindings geschehen ("throws if called after `this.bindings` has been initialized"; Initialisierung kurz nach dem `setup`-Hook) | `client/helpers/interaction/client-keybindings.d.mts:45–83` |
| h4 | Custom D&D 5e registriert ein Tastenkürzel im `init`-Hook (`game.keybindings.register(MODULE.ID, "stopAnimations", …)`) | `custom-dnd5e/scripts/module.js:67, 81` |
| h5 | `ApplicationV2` kann ohne Fensterrahmen dargestellt werden (Option `frame`), sinnvoll für ein Overlay | `client/applications/api/application.d.mts:200–203` |
| h6 | Dokumente liefern Ziehdaten mit `toDragData()` (`{type, uuid}`); Foundry stellt `DragDrop`, `Draggable`, `SearchFilter` und `Tabs` als UI-Bausteine bereit | `client/documents/abstract/client-document.d.mts:365`, `client/applications/ux/` |
| h7 | dnd5e liefert einen eigenen `CompendiumBrowser` zum "Durchsuchen, Filtern und Suchen über mehrere Compendien" mit Filter-Konfiguration (`filters.initial`, `filters.locked`) | `dnd5e/module/applications/compendium-browser.mjs:14–30, 67–101` |
| h8 | Die Filter des dnd5e-Browsers nutzen dasselbe Filterformat wie in M6 (`dnd5e.Filter`) | `dnd5e/module/applications/compendium-browser.mjs`, `dnd5e/module/filter.mjs` |
| h9 | Phase-2-Befund: indexbasierte Suche ohne Dokumente laden ist möglich | Projektplan Planungsphase 2, M4 |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Nicht verifiziert (Live-Test): Antwortzeit der Suche bei sehr großen Beständen, Fokusverhalten des Overlays neben anderen Modulen | low | nein |
| R2 | Ob der Eagle-Library-Nutzer Volltext (Beschreibungen) durchsuchen will oder nur Namen, ist im PDF nicht festgelegt ("nach Compendium einträgen suchen") | low | nein |

## Open Questions
Keine, die den Ablauf stoppen (Punkt N9 unten).

## Next Step
Apply bewertet Suche, Registerkarten, Tastenkürzel, Overlay und Drag & Drop.

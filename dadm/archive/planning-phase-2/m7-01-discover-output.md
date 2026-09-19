```
artifact: discover-output
milestone: M7
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Eagle-Talon-Anforderungen)
- Foundry-Typ-Fakten aus
  `foundry-vtt-reference-v13/types/src/foundry/client/applications/ux/text-editor.d.mts`,
  `.../client/documents/folder.d.mts`
- Allgemeines, gut etabliertes Foundry-Wissen für Teile, die in der gepinnten
  Referenz nicht direkt als expliziter Schema-Eintrag auffindbar waren (klar
  gekennzeichnet, wo das der Fall ist)

## Rechercheergebnis

### Verlinkung/Backlinks — bereits native, dokumentierte Foundry-Funktion
`TextEditor.enrichHTML()` wandelt Text der Form `@UUID[uuid]{name}`
automatisch in klickbare Links um — das ist derselbe Mechanismus, den
Foundry selbst überall nutzt (Journal, Chat, Item-Beschreibungen). Eagle
Talon müsste für "Link to…" **keine eigene Rendering-Logik** bauen, sondern
nur `@UUID[...]`-Strings erzeugen und den bestehenden Enrichment-Mechanismus
nutzen.

### Pro-Nutzer-Sichtbarkeit — auf Dokument-, nicht auf Ordner-Ebene
JournalEntry-Dokumente unterstützen wie andere Dokumenttypen eine
Pro-Nutzer-Berechtigung (`ownership`-Datensatz) — Standard-Foundry-Mechanik,
über die GM-Konfigurationsdialoge seit Langem funktionieren (hohe Konfidenz
aus etabliertem Foundry-Wissen, nicht Zeile für Zeile im generierten
Typpaket wiedergefunden, aber durchgängige Community-Praxis).
**Wichtige Einschränkung, in der gepinnten Referenz verifiziert:** Der
`Folder`-Dokumenttyp selbst trägt **keinen eigenen Ownership-Datensatz** wie
Actor/Item/JournalEntry — er ist ein reines Organisationsobjekt (Name, Typ,
übergeordneter Ordner, Farbe, Sortierung). Sichtbarkeit eines Ordners folgt
in Foundry der Sichtbarkeit seiner **Inhalte**, nicht einer eigenen
Berechtigung auf dem Ordner selbst.

**Konsequenz für Eagle Talon:** Der "Vault pro Nutzer" muss über die
Berechtigung der **einzelnen Journal-Einträge** innerhalb des Ordners
umgesetzt werden (jeder neue Eintrag im eigenen Vault bekommt automatisch
Ownership nur für GM + den jeweiligen Nutzer) — nicht über eine
Ordner-eigene Sperre. Funktional erreichbar, aber ein anderes Modell als
"der Ordner selbst ist privat".

### Tags — kein natives Feld, aber Standard-Muster verfügbar
Kein natives generisches "Tags"-Feld auf `JournalEntry` gefunden. Jedes
Foundry-Dokument hat aber ein generisches `flags`-Objekt (Namespace-basierter
Key-Value-Speicher für Module) — das Standardmuster für so etwas ist
`document.setFlag("eagletalon", "tags", [...])` + eigene Such-/Filter-UI
darüber. Kein Gap, sondern Standard-Erweiterungsmechanismus.

### Automatische Ordnerstruktur
`Folder`-Erstellung ist eine reguläre, dokumentierte Dokumentoperation
(`Folder.create()`). Prüfen auf "existiert bereits" + Anlegen bei Bedarf ist
reine Anwendungslogik, kein API-Gap.

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | `@UUID[...]` + `TextEditor.enrichHTML` | Natives Cross-Dokument-Linking | gepinnte v13-Types | present, verifiziert |
| I2 | JournalEntry-Ownership | Pro-Nutzer-Sichtbarkeit auf Dokumentebene | etabliertes Foundry-Wissen | present, hohe Konfidenz |
| I3 | Folder ohne eigenes Ownership | Ordner sind reine Organisation, keine eigene Berechtigung | gepinnte v13-Types | present, verifiziert |
| I4 | `flags` für Tags | Standard-Erweiterungsmuster | allgemeines Foundry-Dokumentmodell | present |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | "Vault pro Nutzer ist privat" muss über konsistente Ownership-Vererbung auf jeden neuen Eintrag umgesetzt werden, nicht über eine einzelne Ordner-Einstellung — höherer Sorgfaltsaufwand als ursprünglich in der Vision impliziert, aber kein Machbarkeits-Blocker | low | nein |
| R2 | JournalEntry-Ownership-Mechanik wurde aus etabliertem Wissen bestätigt, nicht Zeile für Zeile im generierten Typpaket nachvollzogen — bei tatsächlicher Umsetzung nochmal gegen die exakte Schema-Definition zu prüfen | low | nein |

## Open Questions
Keine.

## Next Step
Apply fasst die Machbarkeit zusammen und bewertet die API-Umwandlung-
Relevanz (vereinfachte Verlinkungs-/Tag-Syntax -> Foundry-Struktur).

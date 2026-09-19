```
artifact: discover-output
milestone: M6
phase: DISCOVER
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/reference/eagle-modules-vision.md` (Eagle-Beak-"Import
  Homebrew"-Anforderung, Problem-Statement zu unzuverlässigen Importern)
- Modulseite "Foundry VTT Content Parser" (foundryvtt.com)

## Rechercheergebnis
Das reale Precedent-Modul "Foundry VTT Content Parser" parst **nicht** über
NLP/KI, sondern über **Regex-/Musterabgleich gegen bekannte, standardisierte
Vorlagen**: WotC-Stat-Block-Format, MCDM-Format, JSON, CSV. Eigenzitat des
Entwicklers: "attempts to resolve as many elements as possible" und "best
effort guesses" — durchgängig als Best-Effort, nicht als zuverlässig
beworben. Explizit auf dnd5e beschränkt (System-spezifisch). Interessanter
Beleg: "ChatGPT-generated NPC templates" wird explizit als unterstütztes
Format gelistet — d. h. der reale Community-Workflow ist bereits
"LLM erzeugt Text in bekanntem Format -> Regex-Parser liest bekanntes Format",
nicht "Parser versteht beliebige freie Prosa".

## Kernunterscheidung: Stat-Blocks vs. echte freie Prosa
Monster-/NPC-Stat-Blocks folgen einer **rigiden, weitgehend einheitlichen
Konvention** (AC, HP, Speed, Attributswerte, Saves, Skills, Resistances,
Senses, Languages, CR, dann Traits/Actions/Reactions in fester Reihenfolge)
— das macht sie für Regex/Pattern-Matching **relativ** gut zugänglich, weil
die Struktur vorab bekannt ist, nicht weil die Sprache verstanden wird. Echte
freie Homebrew-Prosa (z. B. eine individuell formulierte
Item-Beschreibung ohne Formatvorlage) hat **keine** vergleichbare
Struktur-Garantie — genau das ist der im Vision-Problem-Statement
beschriebene Fall ("Importer funktionieren selten zu 100%").

## Inventory

| # | Name | Beschreibung | Quelle | Status |
|---|---|---|---|---|
| I1 | Foundry VTT Content Parser | Regex-/Template-basiertes Parsing, kein LLM | Modulseite | present, bestätigtes Precedent |
| I2 | Unterscheidung Stat-Block vs. freie Prosa | Strukturgarantie ist der entscheidende Faktor, nicht "wie gut ist der Parser" | eigene Analyse, gestützt durch I1 | bestätigt |

## Risks and Assumptions

| # | Beschreibung | Severity | Blocking |
|---|---|---|---|
| R1 | Ohne LLM-Anbindung ist zuverlässiges Parsen auf **templatierte** Eingaben beschränkt (Stat-Blocks, JSON, CSV) — echte freie Prosa bleibt best-effort/unzuverlässig, wie im Vision-Problem-Statement selbst beschrieben. Das ist die erwartete, jetzt belegte Grenze, kein neuer Blocker | hoch | nein — erwartetes Ergebnis laut Milestone Plan |

## Open Questions
Keine.

## Next Step
Apply fasst die Machbarkeitsgrenze zusammen und leitet eine konkrete
Empfehlung für Eagle Beak ab (z. B. templatierte Eingabe vorschlagen/
erzwingen statt freier Prosa zu versprechen).

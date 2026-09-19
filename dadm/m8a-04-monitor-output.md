```
artifact: monitor-output
milestone: M8a
phase: MONITOR
status: complete
date: 2026-09-19
```

## Input Summary
- `dadm/m8a-03-deploy-output.md`, `dadm/spezifikationsabgleich.md`

## Validation Result
N6 ("jede Verlinkung") ist als Anforderung übernommen und durchgängig geprüft. Die empirische Auswertung hat Stellen gefunden, die das Schema-Inventar allein übersehen hätte (Effekt-`origin`, Rolltabellen-`documentUuid`, Verbrauchsziele, Effekt-Änderungswerte, Advancement-Werte); das rechtfertigt den eigenen Milestone. Die Aussage "machbar" gilt für dnd5e-eigenen Inhalt; für fremde Inhalte ist sie durch R1 begrenzt. Es wurde nichts über die Regeln zu Herkunft und Teilauswahl angenommen (N10, N11 offen).

## Evidence Summary
`dadm/m8a-01-discover-output.md`, Hilfsskripte in `dadm/reference/source-analysis/scripts/`.

## Residual Findings

| # | Fund | Severity | Behandlung |
|---|---|---|---|
| F1 | N10, N11 offen | low | gesammelt, spätestens M15 |
| F2 | Fremde Verweisformen nicht ausgewertet | medium | in der Umsetzung mit dem Prüfbericht abdecken; bei Bedarf Stichprobe an Importer-Inhalt |
| F3 | Zauberlisten-Filter für Character Edit | medium | Thema von M9 |

## Recommendation
**Close M8a.** Weiter mit **M9 — Eagle Character Edit: Startwege und Live-Abgleich**.

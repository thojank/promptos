---
id: UC-001
status: draft
epic: E-001
priority: P0
kpi: copy_rate, validation_pass_rate
---

# UC-001 – Text → BasePrompt → Adapter Output

## Nutzerwert
- Von Idee zu reproduzierbarem, strukturiertem Prompt ohne Chaos.

## Trigger
- Nutzer gibt Text ein und wählt ein Zielmodell (Flux/Banana).

## Preconditions
- BasePrompt Schema v1 verfügbar; Adapter vorhanden.

## Main Flow
1. Text input
2. System erzeugt BasePrompt (Universal JSON)
3. System validiert + wendet Defaults an
4. System erzeugt Adapter Output
5. Nutzer kopiert BasePrompt oder Adapter Output

## Error Flows / Edge Cases
- Leere Pflichtfelder → markiert + Defaults
- Mehrere Entities → subjects[]
- Forbidden meta tags → warning/removal

## Output
- BasePrompt JSON (v1)
- Adapter output (Flux/Banana)

## Akzeptanzkriterien (kurz)
- BasePrompt ist valide oder zeigt feldgenaue Fehler.
- Copy funktioniert für beide Outputs.

---
id: UC-014
status: draft
epic: E-003
priority: P0
kpi: metadata_extraction_rate, mapping_completeness
---

# UC-014 – ComfyUI PNG Import (Metadata → BasePrompt)

## Nutzerwert
- Bestehende lokale Workflows/Outputs als editierbaren BasePrompt rekonstruieren.

## Trigger
- Nutzer lädt ein ComfyUI PNG hoch.

## Main Flow
1. Upload PNG
2. System liest embedded Metadata (text chunks)
3. Debug View zeigt Raw Meta (MVP)
4. Mapping in BasePrompt Sektionen
5. Nutzer kann speichern oder weiterbearbeiten

## Error Flows
- Keine Meta → Hinweis + Alternative anbieten

## Output
- BasePrompt JSON (best effort) + Raw Meta (debug)

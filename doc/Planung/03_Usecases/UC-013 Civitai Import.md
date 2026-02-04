---
id: UC-013
status: draft
epic: E-003
priority: P0
kpi: import_success_rate, bricks_saved_per_import
---

# UC-013 – Civitai Import (URL → Meta → BasePrompt/Bricks)

## Nutzerwert
- Bestehende Community-Assets sofort nutzbar machen (schnelles Onboarding).

## Trigger
- Nutzer pasted eine Civitai URL und wählt Modus (auto/prompt/image).

## Main Flow
1. URL + Mode
2. System extrahiert Meta (best effort) + Prompt/Settings
3. System mappt nach BasePrompt JSON
4. Preview zeigt Meta + JSON
5. Nutzer speichert selektiv Bricks (Style/Env)

## Error Flows
- 404/Rate limit/Timeout → retry/backoff + Manual paste fallback

## Output
- BasePrompt JSON + optional gespeicherte Bricks

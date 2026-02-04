---
id: UC-011
status: draft
epic: E-001
priority: P0
kpi: first_pass_acceptance, edits_per_prompt
---

# UC-011 – Keywords → Outline → BasePrompt JSON

## Nutzerwert
- Schnell von Stichworten zu strukturierter Grundlage, weniger Prompt-Friktion.

## Trigger
- Nutzer gibt Stichworte ein (z.B. Noir, Neon, Rain).

## Main Flow (MVP light)
1. Keywords → Outline (Subject/Environment/Style/Technical)
2. Nutzer kann „Must-have“ Punkte markieren
3. Outline → BasePrompt JSON

## Edge Cases
- Outline driftet → regenerate section
- Zu wenig Input → System fragt 1–2 kurze Nachfragen (optional)

## Output
- Outline + BasePrompt JSON

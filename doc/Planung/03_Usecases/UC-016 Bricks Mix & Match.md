---
id: UC-016
status: draft
epic: E-002
priority: P0
kpi: brick_reuse_rate, merge_conflict_rate
---

# UC-016 – Bricks: speichern, kombinieren, injizieren

## Nutzerwert
- Wiederverwendung statt Copy/Paste; konsistente Styles/Orte.

## Trigger
- Nutzer wählt Style/Environment Brick aus Library.

## Main Flow
1. Brick auswählen
2. System merged Brick in BasePrompt (nur subtree)
3. Konflikte werden angezeigt
4. Nutzer entscheidet pro Konflikt
5. Merge Preview + Undo

## Output
- Gemergter BasePrompt + Konfliktreport + Diff Preview

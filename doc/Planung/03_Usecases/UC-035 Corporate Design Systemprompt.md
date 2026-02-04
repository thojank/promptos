---
id: UC-035
status: draft
epic: E-002
priority: P1
kpi:
  - brand_preset_adoption_rate
  - style_edit_reduction
  - brand_override_conflict_rate
links:
  - "[[E-002 Library & Mix & Match]]"
  - "[[E-004 Produktisierung & Zugänge]]"
---

# UC-035 – Corporate Design Systemprompt (Brand Preset / „Green CD“)

## Kurzbeschreibung
Ein zentraler „Brand Systemprompt“ (z.B. grünes Corporate Design) wird pro Workspace/Projekt hinterlegt und beim Generieren automatisch als Style-Constraints in BasePrompt/Adapter Output injiziert, damit alle Outputs konsistent bleiben.

## Nutzerwert
- Einheitliche Bildsprache über Kampagnen/Teams hinweg
- Weniger manuelles Nachjustieren („Warum sieht Bild 7 anders aus als Bild 1?“)

## Trigger
- User aktiviert „Brand Mode“ oder wählt ein Brand-Preset („Green CD“)

## Preconditions
- Login/Workspace vorhanden (Library + Policies)
- Style-Bricks existieren (oder werden aus Systemprompt erzeugt)

## Main Flow (Happy Path)
1. Admin/Owner legt Brand Systemprompt an (Text + optional Parameter: Farben, Typo, Logo-Regeln, Mood, Fotostil)
2. System wandelt ihn in ein Brand-Style-Brick (strukturierter Style-Subtree)
3. Bei jeder Prompt-Erzeugung: Brand-Style-Brick wird priorisiert injiziert (Merge-Regeln)
4. Output: BasePrompt + Adapter Output mit konsistenten Style Constraints

## Alt Flows
- A1: Brand-Preset pro Projekt statt pro Workspace
- A2: Mehrere Presets (z.B. „Green CD – Studio“, „Green CD – Outdoor“)

## Error/Edge Cases
- Konflikt: User wählt anderen Style-Brick → Konflikt UI („Brand overrides“ vs „Allow local override“)
- Brand enthält verbotene Tokens → Guardrails warnen/auto-fix
- Brand fordert „genaues Logo“ → Policy: Text/Signage in quotes oder Nicht-Ziel

## Outputs
- `brand_style_brick` (Library Entity)
- `base_prompt` gemerged mit Brand Constraints
- `adapter_output` (Flux/Banana)

## Messbare KPI
- Konsistenz-Proxy: Anteil Prompts mit aktivem Brand-Preset
- Reduktion manueller Style-Edits

## Roadmap Fit
- Nach MVP (P1+): Add-on zu E-002 und Governance in E-004.

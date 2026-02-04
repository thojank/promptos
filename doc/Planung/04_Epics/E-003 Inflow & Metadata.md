---
id: E-003
status: planned
timebox: week-3
usecases:
  - UC-013
  - UC-014
---

# E-003 – Inflow & Meta-Daten

## Outcome / DoD
- Civitai Import UI (URL + Mode) → Preview (Meta + BasePrompt) → Save Selected.
- ComfyUI PNG Upload → Metadata Extract (Debug) → Mapping in BasePrompt + Fallback.

## Scope
- P0: Civitai Import light, Comfy PNG parser spike + mapping
- P1: Comfy custom node push/pull, deep LoRA entities

## Tasks
- [ ] Civitai UI + Import Pipeline
  - [ ] Import Form (URL + mode)
  - [ ] Status/Retry/backoff
  - [ ] Preview (Meta + JSON)
  - [ ] Save selected as bricks
  - [ ] Error handling + Manual paste
- [ ] ComfyUI PNG Metadata Parser
  - [ ] Extract PNG text chunks (debug)
  - [ ] Normalize prompt/settings
  - [ ] Map to BasePrompt sections
  - [ ] Fallback: no metadata → offer other path

## Dependencies
- [[ADR-0002 Adapter Interface]]

---
id: E-001
status: planned
timebox: week-1
usecases:
  - UC-001
  - UC-011
---

# E-001 – Universal Orchestrator

## Outcome / DoD
- BasePrompt (Universal Schema) wird serverseitig validiert + Defaults angewandt.
- Adapter Outputs: Flux + Banana laufen durch Smoke Tests.
- UI: Sektionen/Labels + Copy (BasePrompt + Adapter Output).

## Scope
- P0: Validation/Defaults, Flux/Banana Adapter, UI Output, Copy
- P1: Adapter Registry, Versionierung, mehr Modelle

## Tasks
- [ ] BasePrompt-Pipeline absichern
  - [ ] Schema v1 definieren (Subject/Environment/Style/Technical)
  - [ ] Validation + Errors (field-level)
  - [ ] Defaults + defaults_applied im Response
  - [ ] Edge Case: multiple subjects → subjects[]
- [ ] Universal-Schema dokumentieren
  - [ ] Feldhilfe + Beispiele
  - [ ] Prompt-Regeln Cheat Sheet
- [ ] Adapter Layer
  - [ ] Flux Adapter (Guidance/Seed policy)
  - [ ] Banana Adapter Smoke Tests
- [ ] Frontend Konsistenz
  - [ ] Sektionen/Labels für BasePrompt
  - [ ] Copy-to-Clipboard

## Dependencies
- [[ADR-0001 BasePrompt Schema v1]]
- [[ADR-0002 Adapter Interface]]

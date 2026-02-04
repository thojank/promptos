---
id: E-002
status: planned
timebox: week-2
usecases:
  - UC-020
  - UC-016
---

# E-002 – Library & Mix & Match

## Outcome / DoD
- Styles/Environments CRUD + Tags/Filter + RLS.
- 1-click Injection in BasePrompt + Konfliktlösung + Merge Preview + Undo.

## Scope
- P0: Styles/Environments
- P1: Characters/LoRAs als Bricks, Sharing/Teams, Brand Presets (UC-035)

## Tasks
- [ ] Library UI erweitern (Supabase)
  - [ ] List/Create/Edit/Delete
  - [ ] Policies (Owner only)
- [ ] Tagging & Filter
  - [ ] Tag input + suggestions
  - [ ] Filter + Search + Sort
- [ ] Mix & Match
  - [ ] Inject Style
  - [ ] Inject Environment
  - [ ] Merge Rules + Konflikt UI
- [ ] Merge Preview + Undo
  - [ ] Diff Preview
  - [ ] Undo Snapshot

## Post-MVP (P1+) Backlog
- [ ] Brand Presets / Corporate Design (siehe [[UC-035 Corporate Design Systemprompt]])
  - [ ] Workspace Default Style (Brand wins)
  - [ ] Owner-only Governance
  - [ ] Optional: Allow local override (Studio)

## Dependencies
- [[ADR-0003 Merge Rules (Bricks)]]


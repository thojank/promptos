---
id: E-004
status: planned
timebox: week-4
usecases:
  - UC-019
  - UC-028
  - UC-034
---

# E-004 – Produktisierung & Zugänge

## Outcome / DoD
- Plans/Limits serverseitig enforced + UI feedback.
- Credits ledger/balance + atomic deduction.
- API Keys (create/list/revoke) + middleware auth.
- Rate limiting + structured logs (correlation_id) + minimal error view.

## Scope
- P0: Limits, Credits, API Keys, Rate limit, Telemetry minimal
- P1: Team roles, billing integration, public API full, Brand governance (UC-035)

## Tasks
- [ ] Plans/Limits
  - [ ] Plan definition (Explorer/Creator/Studio)
  - [ ] Middleware enforcement
  - [ ] UI messaging (remaining quota)
- [ ] Credits
  - [ ] balance + ledger
  - [ ] cost mapping config
  - [ ] atomic deduction
  - [ ] UI (show balance, block at 0)
- [ ] API Keys
  - [ ] CRUD
  - [ ] auth middleware
  - [ ] scopes minimal
- [ ] Hardening
  - [ ] rate limiting
  - [ ] structured logs
  - [ ] minimal error view

## Post-MVP (P1+) Backlog
- [ ] Brand Preset Governance/Plans (siehe [[UC-035 Corporate Design Systemprompt]])
  - [ ] Owner-only edit/set-default
  - [ ] Plan gating (z.B. Studio: allow overrides)
  - [ ] Audit (wer hat Brand geändert)

## Dependencies
- [[ADR-0004 Credits & Limits Modell]]

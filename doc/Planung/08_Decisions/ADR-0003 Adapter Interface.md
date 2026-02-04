---
id: ADR-0002
date: 2026-02-04
status: proposed
---

# ADR-0002 – Adapter Interface

## Entscheidung (Proposal)
`adapter(target_model, base_prompt, params) -> { adapter_output, warnings }`

## Konsequenzen
- Neue Modelle werden als Adapter ergänzt
- Smoke Tests pro Adapter sind verpflichtend

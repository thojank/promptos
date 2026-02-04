---
id: ADR-0001
date: 2026-02-04
status: proposed
---

# ADR-0001 – BasePrompt Schema v1

## Kontext
Wir brauchen ein universelles Zwischenformat (BasePrompt), das Adapter für verschiedene Modelle speist.

## Entscheidung (Proposal)
BasePrompt hat 4 Sektionen: Subject, Environment, Style, Technical.
Multiple subjects werden als `subjects[]` normalisiert.

## Konsequenzen
- Adapter werden einfacher
- UI kann schema-driven wachsen (später)

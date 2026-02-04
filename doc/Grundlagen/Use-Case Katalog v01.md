# Use-Case Katalog (geordnet)

> **Produkt (Arbeitsname):** PROMPT-OS  
> **Ziel:** Strukturierte Erstellung, Verwaltung und Orchestrierung modularer JSON-Prompts inkl. Integrationen (Civitai/ComfyUI/Midjourney) und Story-/Kampagnen-Flows.

---

## 0. Account & Workspace (Basis)
### UC-019 – Login/Account → persönliche Libraries
- Signup/Login, Workspace, Zugriff auf private Assets/Collections.

### UC-020 – Library Verwaltung (CRUD, Tags, Filter, Export/Import, Sharing-ready)
- Bricks/Characters/Stories verwalten, suchen, duplizieren, strukturieren.

---

## 1. Einstieg: Von Idee zu strukturiertem Prompt
### UC-001 – Text → JSON → finaler Prompt
- Text-Idee rein → strukturiertes JSON raus → modellkonformer Prompt-Text.

### UC-011 – Keyword → Outline → Longtext → JSON (Prompt Refinement)
- Stichworte → Draft/Outline → Refinement (Langtext) → valides JSON + Adapter-Output.

### UC-003 – Prompt Quality Guardrails (Forbidden Words / Bias / Regeln)
- Prompt/JSON prüfen, warnen, korrigieren, regelkonform halten (auditierbar optional).

---

## 2. Reverse & Remix: Aus bestehenden Assets ableiten
### UC-002 – Bild → JSON (Reverse Prompting)
- Referenzbild hochladen → Vision extrahiert → editierbares JSON.

### UC-010 – Link → Asset-DNA → BasePrompt/JSON
- URL (Pinterest/Unsplash/Behance/YouTube etc.) → Medien/Keyframes → Style/Env/Komposition als JSON/Brick.

### UC-026 – Remix Engine (Style aus A + Subject aus B)
- Bild/Link/Referenz A liefert Style/Lighting/Camera, Text/B liefert Subject/Action → Merge nach Regeln.

---

## 3. Modularität: Bricks, Characters, Wiederverwendung
### UC-004 – Character erstellen & speichern (Persona Vault)
- Charakter definieren → als wiederverwendbares Modul speichern.

### UC-005 – Character laden & injizieren (Mix & Match)
- Character-Modul auswählen → neue Szene/Style/Env kombinieren → gemergtes JSON + Prompt.

### UC-016 – Promptbaustein Library (Bricks kombinieren, Merge-Regeln, Konfliktlösung)
- Style/Env/Character/LoRA als Bricks speichern, taggen, kombinieren, Konflikte auflösen.

---

## 4. Community & Tooling Integrationen (Power-User Pfad)
### UC-013 – Civitai Bridge (Link → Meta → modularisieren → Library)
- Civitai URL → Prompt/Ressourcen/Settings → Bricks + BasePrompt.

### UC-012 – LoRA Support (auswählen, validieren, Adapter-Ausgabe)
- LoRA in JSON verwalten (ID/Hash/Weight/Trigger) → Zielmodell-spezifisch exportieren.

### UC-014 – ComfyUI PNG Import → Workflow/Prompt auslesen → BasePrompt
- ComfyUI PNG Meta lesen → Nodes/Prompt extrahieren → BasePrompt + Bricks.

### UC-015 – ComfyUI Custom Node (Push/Pull: Sync mit PROMPT-OS)
- Node sendet/zieht JSON/Workflows per API, inkl. Auth/Versionierung.

---

## 5. Orchestrierung & Ausführung
### UC-021 – Run/Dispatch + Job-Queue (Generate statt Copy)
- Prompt/JSON direkt ausführen (z.B. Gemini/Comfy) → Jobs, Status, Result-Speicherung.

### UC-022 – Batch / Variations (Permutation Builder)
- Varianten-Generator: Parameter/Aspects/Backgrounds systematisch permutieren.

### UC-023 – JSON → Midjourney Parameter Mapper (Cross-Compiler)
- Universal JSON → MJ Syntax/Parameter (inkl. Permutations).

---

## 6. Story & Kampagne (Top-of-Funnel: „Ich möchte eine Kampagne zu…“)
### UC-018 – Campaign Brief Assistant (Brief → Shotlist → Assets)
- Kampagnenziel + Produkt + Zielgruppe → Briefing-Fragen → Shotlist + JSON pro Asset.

### UC-017 – Narrative Story Creator (Scenes, Global Assets, Propagation)
- Story-Outline → globale Assets (Character/Style) → Szenen-JSONs; Änderungen propagieren.

### UC-033 – Video Timeline / Multi-shot Orchestrierung (z.B. Wan 2.6)
- Szenen + Zeit/Takes → Video-kompatible Payloads, Konsistenz über Sequenzen.

---

## 7. Plattform-Fundament (Skalierung, Governance, Erweiterbarkeit)
### UC-024 – Schema Registry + Modell-Versionen (Drift Management)
- Modell-/Schema-Versionen verwalten; dynamische UI-Formulare; Adapter-Regeln.

### UC-025 – Prompt/JSON Versionierung + Diff + Rollback
- Versionen, Vergleich, Wiederherstellung; Reproduzierbarkeit.

### UC-027 – Schema-driven Form UI (No-/Low-Code Editing)
- JSON-Schema → Form; weniger „roh JSON“, mehr Creator-UX.

### UC-028 – Credit-System + Usage Metering (Kostenkontrolle)
- Limits, Quotas, Abrechnung pro Feature (Vision/Video/Run).

### UC-029 – Safety/Compliance Pipeline (auditierbare Guardrails)
- Policy-Injections, Änderungsprotokoll, Block/Allow-Listen, Reporting.

### UC-030 – Assistive Suggestions via RAG (Nodes/Foto-Wissen/Materialien)
- Wissensbasis für bessere Vorschläge und weniger Halluzinationen.

### UC-031 – Team Libraries + Rollen/Rechte
- Owner/Editor/Viewer, Shared Collections, Team-Workspaces.

### UC-032 – Marketplace (Bricks/Profiles/Templates) – optional später
- Community/Creator Economy, Distribution von Styles/Profiles.

### UC-034 – Public API (Create/Analyze/Export/Run)
- Partner/Enterprise: programmatischer Zugriff, Webhooks, Integrationsfähigkeit.

---

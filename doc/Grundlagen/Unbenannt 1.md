# PROMPT-OS — MVP Roadmap (4 Wochen) — Detailed Spec + Tasklists

> **MVP-Prinzip:** Copy-first (noch kein Render/Queue), aber Output muss valide, strukturiert, wiederverwendbar sein.
> **Core-Objekt:** Universal BasePrompt mit Sektionen `Subject | Environment | Style | Technical` als Zwischenformat. :contentReference[oaicite:6]{index=6} :contentReference[oaicite:7]{index=7}

---

## EPIC E-001 (Woche 1): Universal Orchestrator stabilisieren

### Zugehörige Use Cases (MVP)
- **UC-001** Text → BasePrompt(JSON) → Adapter Output
- **UC-011 (teil)** Keyword/kurzer Input → Draft/Outline (light) → BasePrompt
- **UC-024 (teil)** Universal Schema Definition & Dokumentation (ohne volle Registry)
- Guardrail-Grundlagen aus Z-Image Guide (keine Metatags/Metaphern; Text in "quotes") :contentReference[oaicite:8]{index=8}

### Outcome / Definition of Done (Epic)
- BasePrompt ist **schema-validiert**, hat **Defaults**, und wird **sektioniert** im UI angezeigt.
- Adapter Outputs für **Flux** und **Banana** funktionieren mit **Smoke Tests**.
- Copy-to-Clipboard für BasePrompt und Adapter Output ist stabil.

### Detailed Spec (Inputs/Outputs/Edge Cases)
**Input**
- User Text (kurz oder ausführlich), optional Modellwahl (Flux/Banana).
**Output**
- `base_prompt.json` (Universal Schema) + `adapter_output` (modell-spezifischer Prompt/Payload)
**Edge Cases**
- Leere/fehlende Felder → Defaults (serverseitig) + UI Markierungen
- Mehrere Subjects → als Array; Flux bevorzugt `subjects[]` (Entitäten sauber trennen) :contentReference[oaicite:9]{index=9} :contentReference[oaicite:10]{index=10}
- Text-Elemente müssen exakt in englischen double quotes erscheinen (falls UI/Poster/Signage) :contentReference[oaicite:11]{index=11}
- Keine „meta tags“ wie 8K/masterpiece, keine Metaphern/Emotionalität im finalen Prompt-Text :contentReference[oaicite:12]{index=12}

---

### Task 1.1 — BasePrompt-Pipeline absichern
- [ ] **Subtask 1.1.1: Universal Schema (Pydantic) definieren**
  - [ ] `BasePrompt` Objekt: `subject`, `environment`, `style`, `technical`
  - [ ] `subject` unterstützt **ein** Subject oder `subjects[]` (intern normalisieren)
- [ ] **Subtask 1.1.2: Server-seitige Validierung**
  - [ ] Validate required fields
  - [ ] Validation errors strukturiert zurückgeben (`field`, `reason`, `severity`)
- [ ] **Subtask 1.1.3: Defaults (serverseitig)**
  - [ ] Definiere Defaults pro Sektion (z.B. aspect_ratio=1:1, lighting=neutral falls leer)
  - [ ] Markiere im Response, welche Defaults angewandt wurden (`defaults_applied[]`)
- [ ] **Subtask 1.1.4: Error Handling / Error Codes**
  - [ ] Trenne `VALIDATION_ERROR` vs `PROVIDER_ERROR` vs `TIMEOUT`
  - [ ] Rückgabe mit `correlation_id`
- [ ] **Subtask 1.1.5: Edge Case — Multiple Subjects**
  - [ ] Wenn User mehrere Entities nennt → mappe in `subjects[]`
  - [ ] Stelle sicher: Flux Adapter nutzt `subjects[]` (kein Hybrid-Bleed) :contentReference[oaicite:13]{index=13}

### Task 1.2 — Universal-Schema-Felder dokumentieren
- [ ] **Subtask 1.2.1: „Schema Hilfe“ UI**
  - [ ] Pro Sektion: Feldname, Beschreibung, Beispiel
  - [ ] Required/Optional Flags anzeigen
- [ ] **Subtask 1.2.2: „Prompt Regeln“ Cheat Sheet (Z-Image Stilregeln)**
  - [ ] Verbotene Meta-Tags (8K/masterpiece etc.) erklären :contentReference[oaicite:14]{index=14}
  - [ ] Keine Metaphern/Emotionssprache :contentReference[oaicite:15]{index=15}
  - [ ] Text-Elemente in "double quotes" :contentReference[oaicite:16]{index=16}
  - [ ] Anti-Bias/Physical descriptors Quick Tips :contentReference[oaicite:17]{index=17}
- [ ] **Subtask 1.2.3: Beispiel-Galerie (min 2)**
  - [ ] Portrait Beispiel + Scene Beispiel (BasePrompt + Adapter Output)

### Task 1.3 — Adapter Layer erweitern (Flux + Banana)
- [ ] **Subtask 1.3.1: Flux Adapter**
  - [ ] Mapping BasePrompt → Flux JSON/Payload (scene + subjects + style + technical) :contentReference[oaicite:18]{index=18}
  - [ ] Guidance/Seed Handling (Policy dokumentieren)
- [ ] **Subtask 1.3.2: Banana Adapter**
  - [ ] Mapping BasePrompt → Banana/Z-Image kompatibler Output (Prompt-Text oder JSON string)
- [ ] **Subtask 1.3.3: Adapter Smoke Tests**
  - [ ] Testcases: 3 reale Beispiele
  - [ ] Assertions: Output nicht leer, schema-valid, keine forbidden tokens

### Task 1.4 — Frontend Konsistenz
- [ ] **Subtask 1.4.1: BasePrompt Ausgabe strukturieren**
  - [ ] Section view: Subject/Environment/Style/Technical
  - [ ] Missing-Felder markieren
- [ ] **Subtask 1.4.2: Copy-to-Clipboard**
  - [ ] Copy BasePrompt JSON
  - [ ] Copy Adapter Output
  - [ ] Toast + Fallback (Select All)
- [ ] **Subtask 1.4.3: Export (optional)**
  - [ ] Copy JSON als Codeblock (für Gemini Chat Workflows) :contentReference[oaicite:19]{index=19}

---

## EPIC E-002 (Woche 2): Library & Asset-Management + Mix & Match

### Zugehörige Use Cases (MVP)
- **UC-019** Login/Account (Basis vorhanden; hier nutzen/absichern) :contentReference[oaicite:20]{index=20}
- **UC-020** Library Verwaltung (Styles/Environments CRUD, Tagging, Filter)
- **UC-016** Bricks (Style/Environment) kombinieren, Merge-Regeln
- **UC-005 (praktisch)** Injektion in BasePrompt (wie „Character inject“, aber P0: Style/Env)

### Outcome / Definition of Done (Epic)
- Styles/Environments können gespeichert, bearbeitet, gelöscht, getaggt und gefiltert werden.
- Ein Brick kann per Klick injiziert werden → Merge Preview + Undo + Konfliktlösung.

### Detailed Spec (Inputs/Outputs/Edge Cases)
**Input**
- Brick aus Library (Style oder Environment), aktueller BasePrompt
**Output**
- Gemergter BasePrompt + Preview Diff + Konflikt-Report
**Edge Cases**
- Konflikte: z.B. BasePrompt hat `style.lighting=...` und Brick hat ebenfalls -> UI Entscheidung
- Ownership: nur Owner darf CRUD (Supabase RLS)

---

### Task 2.1 — Styles/Environments Library UI (Supabase)
- [ ] **Subtask 2.1.1: Datenmodell/Tables (falls nicht final)**
  - [ ] `styles` Tabelle (id, user_id/workspace_id, name, tags[], json, updated_at)
  - [ ] `environments` Tabelle analog
- [ ] **Subtask 2.1.2: List View + States**
  - [ ] Loading/Empty/Error states
  - [ ] Pagination oder „Load more“
- [ ] **Subtask 2.1.3: Create/Edit Form**
  - [ ] Name + Tags + JSON Editor (min: textarea + validation hint)
  - [ ] Save/Cancel flows
- [ ] **Subtask 2.1.4: Delete**
  - [ ] Confirm Dialog
  - [ ] Optional Soft-delete Flag (falls gewünscht)
- [ ] **Subtask 2.1.5: RLS/Policies**
  - [ ] Owner-only CRUD (Supabase)
  - [ ] Tests: cannot edit/delete foreign records

### Task 2.2 — Tagging & Filter
- [ ] **Subtask 2.2.1: Tag Input**
  - [ ] Multi-tag input + existing tags suggestion
- [ ] **Subtask 2.2.2: Filter**
  - [ ] Filter by tag(s)
  - [ ] Search by name (partial match)
- [ ] **Subtask 2.2.3: Sorting**
  - [ ] Updated desc / Alphabetical

### Task 2.3 — Mix & Match Injection + Merge Rules
- [ ] **Subtask 2.3.1: Injection API/Helper**
  - [ ] `inject_style(basePrompt, styleBrick)` merges only Style subtree
  - [ ] `inject_environment(basePrompt, envBrick)` merges only Environment subtree
- [ ] **Subtask 2.3.2: Merge Rules**
  - [ ] Definiere Prioritäten: `User edits > Brick` oder wählbar
  - [ ] Konfliktliste generieren: `[ {path, current, incoming} ]`
- [ ] **Subtask 2.3.3: Konflikt UI**
  - [ ] Pro Konflikt: Keep Current / Use Brick
  - [ ] „Apply to all conflicts“ Option (optional)

### Task 2.4 — Merge Preview + Undo
- [ ] **Subtask 2.4.1: Diff Preview**
  - [ ] Markiere changed/added Felder (sektioniert)
- [ ] **Subtask 2.4.2: Undo**
  - [ ] Snapshot vor Merge in-memory (Session) und wiederherstellen

---

## EPIC E-003 (Woche 3): Inflow & Meta-Daten (Civitai + ComfyUI PNG)

### Zugehörige Use Cases (MVP)
- **UC-013** Civitai Import (URL → Meta → extrahiertes BasePrompt/Bricks) :contentReference[oaicite:21]{index=21}
- **UC-014** ComfyUI PNG Import (Metadata → BasePrompt) :contentReference[oaicite:22]{index=22}
- Vorbereitung **UC-012** LoRA Entities (nur soweit Import Meta es hergibt)

### Outcome / Definition of Done (Epic)
- Nutzer kann Civitai URL importieren (3 Modi) und Ergebnis (Meta + JSON) previewen, selektiv speichern.
- Nutzer kann ComfyUI PNG hochladen; Meta wird gelesen; BasePrompt Mapping erzeugt; Fallback, wenn keine Meta.

### Detailed Spec (Inputs/Outputs/Edge Cases)
**Civitai Input**
- URL + Modus: `auto | prompt | image`
**Civitai Output**
- Meta: model/lora/settings/prompt (wenn verfügbar) + extrahiertes BasePrompt JSON + „save as bricks“
**Comfy Input**
- PNG Datei
**Comfy Output**
- Raw metadata debug + mapped BasePrompt
**Edge Cases**
- Rate limits / 404 / blocked → Retry/backoff + manual paste
- PNG ohne Meta → „no metadata“ + optional Image→JSON Fallback
- Mapping unvollständig → mark missing fields

---

### Task 3.1 — Civitai UI + Import Pipeline
- [ ] **Subtask 3.1.1: Import Form**
  - [ ] URL Input + Mode selector (auto/prompt/image)
  - [ ] Client-side URL validation
- [ ] **Subtask 3.1.2: Import Status UI**
  - [ ] Loading/progress + cancel
  - [ ] Retry with backoff hint
- [ ] **Subtask 3.1.3: Result Preview**
  - [ ] Meta section (best effort)
  - [ ] BasePrompt JSON viewer + validation status
- [ ] **Subtask 3.1.4: Save Selected**
  - [ ] Checkboxes: Save Style / Save Env / Save LoRA (optional) as bricks
  - [ ] Persist to Supabase tables
- [ ] **Subtask 3.1.5: Errors + Manual Paste**
  - [ ] 404 → message + retry
  - [ ] 429 → retry-after
  - [ ] Manual prompt paste → run through translator to BasePrompt

### Task 3.2 — ComfyUI PNG Metadata Parser (Spike → Mapping)
- [ ] **Subtask 3.2.1: Extract PNG Text Chunks**
  - [ ] Read embedded workflow/prompt (debug view)
- [ ] **Subtask 3.2.2: Normalize Extracted Data**
  - [ ] Parse prompt/settings into a normalized internal object
- [ ] **Subtask 3.2.3: Map to BasePrompt**
  - [ ] Map prompt to Subject/Style/Technical where possible
  - [ ] Generate missing-field list
- [ ] **Subtask 3.2.4: Fallback**
  - [ ] If no meta: show “No embedded metadata found”
  - [ ] Offer Image→JSON (if feature exists in UI) :contentReference[oaicite:23]{index=23}

---

## EPIC E-004 (Woche 4): Produktisierung & Zugänge (Plans/Credits/API Keys + Hardening)

### Zugehörige Use Cases (MVP)
- **UC-028** Credits + Usage Metering (minimal, config-driven)
- **UC-034 (teil)** API Keys (Auth + basic scopes)
- Hardening: Rate limiting + structured logs
- (Vorbereitung auf Abo/Monetarisierung; in Dokus als Phase 2/Monetarisierung vorgesehen) :contentReference[oaicite:24]{index=24}

### Outcome / Definition of Done (Epic)
- Plan-Limits greifen serverseitig und werden im UI klar kommuniziert.
- Credits werden abgezogen für teure Aktionen (z.B. Vision/Import) und blocken bei 0.
- API Keys können erstellt/revoked werden; Endpoints akzeptieren Key-Auth.
- Rate limiting + minimal Telemetry (structured logs) vorhanden.

### Detailed Spec (Inputs/Outputs/Edge Cases)
**Inputs**
- User Plan (Explorer/Creator/Studio), Action type (text_to_base, image_to_json, civitai_import, adapt)
**Outputs**
- Allowed/blocked decision; updated credits; correlation logs
**Edge Cases**
- Race conditions beim Credit-Abzug (transaktional lösen)
- Key revoke muss sofort wirken
- External API throttling (Civitai) → backoff

---

### Task 4.1 — Plan Definition + Limit Enforcement
- [ ] **Subtask 4.1.1: Plan Modell**
  - [ ] Define `Explorer/Creator/Studio` + Limits pro Feature/Tag
  - [ ] Store in DB or config (prefer DB for runtime updates)
- [ ] **Subtask 4.1.2: Enforcement Middleware**
  - [ ] Middleware checks before executing expensive calls
  - [ ] Returns structured `LIMIT_REACHED` with `limit_type`, `reset_at`
- [ ] **Subtask 4.1.3: UI Messaging**
  - [ ] Show remaining quota + reset time
  - [ ] Block action with upgrade CTA

### Task 4.2 — Credits (Ledger/Balance)
- [ ] **Subtask 4.2.1: Credit Storage**
  - [ ] `credits_balance` per user/workspace
  - [ ] `credits_ledger` events (action, amount, timestamp, correlation_id)
- [ ] **Subtask 4.2.2: Cost Mapping**
  - [ ] Config: text=1, vision=10, import=5 (example; make editable)
- [ ] **Subtask 4.2.3: Atomic Deduction**
  - [ ] Transactional decrement; prevent negative balances
- [ ] **Subtask 4.2.4: UI**
  - [ ] Display balance
  - [ ] Block on 0 credits

### Task 4.3 — API Key Model (Basic)
- [ ] **Subtask 4.3.1: API Key CRUD**
  - [ ] Create (show once), List (masked), Revoke
- [ ] **Subtask 4.3.2: Auth Middleware**
  - [ ] Accept `Authorization: Bearer <key>` (or header `x-api-key`)
  - [ ] Map to workspace/user
- [ ] **Subtask 4.3.3: Minimal Scopes**
  - [ ] `prompt:read/write`, `library:read/write` (optional)
  - [ ] Enforce scope per route

### Task 4.4 — Monitoring & Hardening
- [ ] **Subtask 4.4.1: Rate limiting**
  - [ ] Per IP + per API key + per user
  - [ ] Separate budget for `civitai_import` and `adapt/*`
- [ ] **Subtask 4.4.2: Structured Logs**
  - [ ] Always include `correlation_id`, `user_id/workspace_id`, `endpoint`, `error_code`
- [ ] **Subtask 4.4.3: Minimal Error View**
  - [ ] List last N errors (admin-only) OR export logs

---

# MVP Coverage (was ist in diesen 4 Wochen drin?)
## Direkt geliefert (P0)
- UC-001, UC-013, UC-014, UC-016, UC-019, UC-020, UC-028, UC-034 (teil)

## Teilweise (Grundlagen)
- UC-011 (Refinement light), UC-024 (Schema Doku/Validation light), UC-012 (LoRA nur als Import-Meta soweit möglich)

## Out of Scope (P1+)
- UC-002 (Image→JSON UX polish), UC-010 (Link Inputs), UC-015 (Comfy custom node), UC-017/033 (Narrative/Video),
  UC-021/022 (Run/Batch), UC-023 (Midjourney Cross-Compiler), UC-025/027 (Versioning/Schema-driven form voll),
  UC-030/031/032 (RAG/Teams/Marketplace).

# Architecture (MVP)

## Core Objects
- BasePrompt (universal JSON): Subject | Environment | Style | Technical
- Adapter Output: Flux, Banana (best effort)

## Components
- Frontend (Next.js): input, preview, library, injection
- API Layer: generate baseprompt, build adapter output, import civitai, parse png
- Supabase: auth + library tables + credits ledger/balance

## Non-goals (MVP)
- Render/Queue, Team Workspaces, Marketplace, Story Engine

# Aktueller Stand & Technische Basis (Feb 2026)

## Aktueller Stand (Umsetzung)

**Phase 1 (Foundation – teilweise umgesetzt)**
- **Text→JSON:** Backend‑Funktionalität vorhanden (Gemini‑Integration).
- **Image→JSON:** Vision‑Analyse vorhanden.
- **Frontend‑Prototyp:** Prompt‑Generator UI vorhanden.
- **Model‑Support:** Z‑Image‑Turbo + Banana‑Pro im UI; **kein Flux‑Adapter**.
- **JSON‑Schema:** Z‑Image‑spezifisch, noch kein echtes model‑agnostisches Meta‑Schema.

**Phase 2 (Professional Library – teilweise umgesetzt)**
- **Character‑Profile:** UI + Speicherung über Supabase vorhanden.
- **Style‑Presets / Orte / Templates:** nicht umgesetzt.
- **Abo/Account‑Logik:** nicht umgesetzt.

**Phase 3 (Ecosystem Integration)**
- **Civitai API, ComfyUI‑Node, Speech‑to‑Prompt:** nicht umgesetzt.

**Phase 4 (Narrative & Motion)**
- **Story/Comic/Video‑Module:** nicht umgesetzt.

---

## Technische Basis (Ist‑Stand)

### Frontend
- **Framework:** Next.js (App Router)
- **UI‑Pages:**
  - Startseite
  - Prompt‑Generator
  - Character‑Builder
  - Login
- **Navigation:** Globale Navigation vorhanden

### Backend
- **Framework:** FastAPI (Python)
- **Kern‑Features:**
  - Text→JSON
  - Bild→JSON
  - JSON→Prompt‑Text (Prompt‑Assembler)
- **Model‑Integration:** Google Gemini (Text + Vision)

### Datenmodelle
- **Pydantic‑Schemas:** Z‑Image‑Turbo‑spezifische Struktur (Character/Scene/Action/Text‑Elements)
- **System‑Prompts:** Strikte Regeln für Anti‑Bias‑Deskriptoren und verbotene Begriffe

### Datenbank / Auth
- **Supabase:**
  - Nutzung in der Character‑Bibliothek (Speichern & Laden)
  - Login/Signup‑Seite vorhanden

### API‑Schicht
- **Backend‑Endpoints:**
  - `/api/text-to-prompt`
  - `/api/image-to-json`
  - `/health`
- **Frontend‑API:**
  - `/api/generate-prompt` (Next.js Route)

---

## Offene Kernlücken (Kurzüberblick)
- **Universal JSON + Adapter‑Layer** (model‑agnostisch, inkl. Flux)
- **Asset‑Bibliothek (Styles/Orte/Templates)**
- **Account/Abo/Credits‑Logik**
- **Civitai/ComfyUI‑Integration**
- **Narrative Engine (Story‑Sequenzen)**

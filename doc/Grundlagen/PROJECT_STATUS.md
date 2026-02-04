# Projektstatus: PROMPT-OS

## Projektbeschreibung
Entwicklung einer modularen Web-Plattform (PROMPT-OS) zur Erstellung und Verwaltung von strukturierten, modell-agnostischen Prompts. Die Plattform nutzt Gemini AI, um natürliche Sprache und Bilder in JSON-Schemata zu konvertieren, die anschließend via Adapter in Modell-spezifische Formate übersetzt werden.

## Aktueller Status (Feb 2026)

**Backend (FastAPI):**
*   **Text→JSON / Image→JSON:** stabil.
*   **Universal BasePrompt:** implementiert (`/api/text-to-base`).
*   **Adapter-Pattern:** Flux + Banana-Pro (`/api/adapt/{model}`).
*   **Civitai-Bridge:** Import-Endpoint mit Fehlerhandling (`/api/import/civitai`).
*   **Prompt-Assembler:** JSON→Text weiterhin vorhanden.

**Frontend (Next.js + Tailwind):**
*   **Landing Page:** neue PROMPT-OS Copy.
*   **Prompt-Generator:** Z-Image/Banana + BasePrompt + Adapter-Output.
*   **Character Library:** Supabase-gestützt.
*   **Styles & Environments Library:** neue Seiten mit JSON-Speicherung.
*   **Navigation:** globale Top-Navigation erweitert.

**Datenbank (Supabase):**
*   **Character Profiles** aktiv.
*   **Styles / Environments** als neue Tabellen inkl. Migration.

**Tests:**
*   Adapter-Tests (unittest) vorhanden.

## Use‑Cases (Nutzerfunktionen, konsolidiert)

### Core Prompting
- [ ] **Kurztext → Modell‑Prompt:** Nutzer gibt Kurztext ein, wählt Modell, erhält ausführlichen Prompt.
- [ ] **Kurztext → Universal JSON:** Nutzer erhält BasePrompt (Subject/Environment/Style/Technical).
- [ ] **JSON → Modell‑Prompt:** Nutzer überführt BasePrompt via Adapter in Zielformat.
- [ ] **JSON‑Export:** Nutzer übernimmt Prompt als JSON (Copy/Download).
- [ ] **Langprompt optimieren:** Nutzer iteriert/editiert Langprompt (Regeln + Quality‑Checks).

### Module & Bibliothek
- [ ] **Prompt‑Module vorschlagen:** System schlägt passende Style/Environment/Character‑Module vor.
- [ ] **Module auswählen & injizieren:** Nutzer wählt Module und injiziert sie in BasePrompt.
- [ ] **Module speichern:** Nutzer speichert neue Styles/Environments/Characters als JSON‑Bausteine.
- [ ] **Module verwalten:** Nutzer kann Module bearbeiten, taggen, filtern, löschen.

### Generation & Speicherung
- [ ] **Prompt erzeugen:** Nutzer erzeugt finalen Prompt (modell‑spezifisch).
- [ ] **Prompt speichern:** Nutzer speichert Prompt‑Versionen (History/Tags).
- [ ] **Prompt kopieren/exportieren:** Copy‑to‑Clipboard/Export für API‑Payloads.

### Inflow & Analyse
- [ ] **Bild → JSON:** Nutzer lädt Bild hoch und erhält strukturierte Metadaten.
- [ ] **Civitai Import:** Nutzer importiert Civitai‑Link (Meta → JSON‑Bausteine).
- [ ] **ComfyUI Import:** Nutzer liest PNG‑Metadaten und mappt sie ins BasePrompt.

## Konsolidierte Roadmap (nächste 4 Wochen)

### Woche 1 — Epic: Universal Orchestrator stabilisieren
- [ ] **Task: BasePrompt‑Pipeline absichern**
	- [ ] Subtask: Validierung/Fehlerfälle für `BasePrompt` (leere Felder, Defaults)
	- [ ] Subtask: Dokumentation der Universal‑Schema‑Felder (Subject/Environment/Style/Technical)
- [ ] **Task: Adapter‑Layer erweitern**
	- [ ] Subtask: Flux‑Adapter mit modell‑spezifischen Parametern (z. B. Guidance/Seed‑Handling)
	- [ ] Subtask: Banana‑Adapter Smoke‑Tests mit realen Beispielen
- [ ] **Task: Frontend‑Konsistenz**
	- [ ] Subtask: BasePrompt‑Ausgabe klar strukturieren (Sektionen/Labels)
	- [ ] Subtask: Copy‑to‑Clipboard für BasePrompt und Adapter‑Output

### Woche 2 — Epic: Library & Asset‑Management
- [ ] **Task: Styles/Environments Library UI erweitern**
	- [ ] Subtask: Edit/Delete‑Funktionen (Supabase)
	- [ ] Subtask: Tagging & Filter (z. B. „Analog“, „Noir“, „Studio“)
- [ ] **Task: Mix & Match (Baukasten)**
	- [ ] Subtask: Styles/Environments per Klick in BasePrompt injizieren
	- [ ] Subtask: Vorschau der gemergten BasePrompt‑Struktur

### Woche 3 — Epic: Inflow & Meta‑Daten
- [ ] **Task: Civitai‑UI**
	- [ ] Subtask: Import‑Formular (URL + Modus: auto/prompt/image)
	- [ ] Subtask: Ergebnis‑Preview (Meta + extrahiertes JSON)
- [ ] **Task: Metadata Parser (ComfyUI PNG)**
	- [ ] Subtask: Spike: Exif/PNG‑Text‑Chunks auslesen
	- [ ] Subtask: Mapping in BasePrompt‑Bausteine

### Woche 4 — Epic: Produktisierung & Zugänge
- [ ] **Task: Account/Credits‑Grundlage**
	- [ ] Subtask: Rollen/Plan‑Limits definieren (Explorer/Creator/Studio)
	- [ ] Subtask: API‑Key‑Modell (Supabase, Basic Policies)
- [ ] **Task: Monitoring & Hardening**
	- [ ] Subtask: Rate‑Limit‑Strategie (Civitai/Adapter‑Endpoints)
	- [ ] Subtask: Fehler‑Telemetry (minimal: structured logs)

## Starten der Anwendung

Backend-Server läuft standardmäßig auf Port 8001. Frontend wird separat via Next.js gestartet.
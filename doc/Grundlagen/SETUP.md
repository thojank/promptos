# Z-Image-Turbo Prompt Platform — Setup & Nächste Schritte

## Status: Phase 1 ✅ Abgeschlossen

Du hast jetzt das **Grundgerüst** deiner Applikation:

### ✅ Was wurde erstellt:

1. **[backend/models.py](backend/models.py)** — Pydantic-Schemas
   - `CharacterProfile` mit Anti-Bias-Physik-Deskriptoren
   - `SceneModule` (Setting, Lighting, Atmosphere, Composition)
   - `ActionModule` (Pose & Aktion)
   - `TextElementsModule` (Bilder-Text)
   - `ZImageTurboPrompt` (finale Kombination)
   - `Story` (narrative Sequenzen)
   - Validierungsfunktionen gegen Forbidden Words

2. **[backend/system_prompts.py](backend/system_prompts.py)** — Gemini-Instruktionen
   - `GEMINI_SYSTEM_PROMPT_TEXT_TO_JSON` — Text-Input → Strukturiertes JSON
   - `GEMINI_SYSTEM_PROMPT_VISION` — Bild-Analyse → Metadaten
   - `GEMINI_SYSTEM_PROMPT_JSON_TO_TEXT` — JSON → 600-1000 Wort Prompt

3. **[backend/gemini_integration.py](backend/gemini_integration.py)** — API-Integration
   - `GeminiPromptGenerator` Klasse
   - `.text_to_json()` — Nutzer-Text in strukturiertes JSON
   - `.image_to_json()` — Bild-Upload → JSON-Extraktion
   - `.json_to_prompt_text()` — JSON → Finaler Prompt
   - `.generate_full_prompt()` — End-to-End (Text → finaler Prompt)

4. **[backend/db_models.py](backend/db_models.py)** — Datenbank-Schema
   - `character_profiles` — Wiederverwendbare Character-Templates
   - `scene_modules` — Austauschbare Szenen
   - `text_elements` — Text-Objekte für Bilder
   - `stories` — Container für Prompt-Sequenzen
   - `prompts` — Finale Kombinationen
   - `story_versions` — Versionskontrolle

---

## 🚀 Phase 2: JETZT STARTEN (Deine nächsten Schritte)

### Schritt 1: Umgebung einrichten

```bash
cd /Users/thorstenjankowski/n8n-compose/310126_prompt-platform

# Python 3.10+ erforderlich
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Schritt 2: Gemini API-Key setzen

1.  Gehe zu Google AI Studio und erstelle einen API-Key.
2.  Hole dir die Datenbank-URL aus deinem Supabase-Projekt (Settings > Database > Connection string).
3.  Speichere beides in einer `.env`-Datei im Hauptverzeichnis:

```bash
# .env
GEMINI_API_KEY=dein_api_key_hier
DATABASE_URL=postgresql://postgres:[DEIN-PASSWORT]@[...].supabase.co:5432/postgres
```

### Schritt 3: Test der Gemini-Integration

```bash
cd backend
python gemini_integration.py
```

Dies sollte ein komplettes Beispiel durchlaufen:
- Input: Text-Beschreibung
- Output: Strukturiertes JSON + Finaler 600-1000 Wort Prompt

### Schritt 4: (Optional) Datenbank initialisieren

Falls du mit PostgreSQL arbeiten willst:

```bash
# PostgreSQL lokal starten (macOS mit Homebrew)
brew services start postgresql

# Datenbank erstellen
createdb zimage_turbo

# In Python initialieren:
python -c "from backend.db_models import init_database; init_database('postgresql://localhost/zimage_turbo')"
```

---

## 🎯 Phase 3: API-Endpoints bauen (FastAPI)

Du brauchst jetzt einen REST-Server, um deine Gemini-Integration freizuschalten.

Erstelle **[backend/main.py](backend/main.py)** mit diesen Endpoints:

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from gemini_integration import GeminiPromptGenerator
from models import ZImageTurboPrompt, PromptAssemblyOutput
import json

app = FastAPI(title="Z-Image-Turbo Prompt Platform")
generator = GeminiPromptGenerator()

@app.post("/api/text-to-prompt")
async def text_to_prompt(text_input: str):
    """Text-Input → Finaler Prompt"""
    try:
        output = generator.generate_full_prompt(text_input)
        return {
            "success": True,
            "prompt_text": output.full_prompt_text,
            "word_count": output.estimated_word_count,
            "validation_passed": output.forbidden_words_check,
            "json_structure": output.json_structure.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/image-to-json")
async def image_to_json(file: UploadFile = File(...)):
    """Bild-Upload → Metadaten-JSON"""
    try:
        # Speichere Bild temporär
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        result = generator.image_to_json(tmp_path)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

Starten mit: `python backend/main.py`

---

## 🎨 Phase 4: Frontend mit React/Next.js

Empfohlene Struktur:

```
frontend/
├── components/
│   ├── CharacterBuilder.tsx    # Nutzer wählt/erstellt Character
│   ├── SceneSelector.tsx       # Wählt Szene aus
│   ├── PromptPreview.tsx       # Zeigt finalen Prompt
│   └── StoryPlanner.tsx        # Drag-and-Drop Story-Editor
├── pages/
│   ├── index.tsx               # Home
│   ├── library.tsx             # Character/Scene Library
│   └── editor.tsx              # Story-Editor
└── lib/
    └── api.ts                  # API-Calls zu deinem Backend
```

**Erste UI:**
- Input-Feld für Text-Beschreibung
- Button "Generate Prompt"
- Output: JSON + finaler Prompt-Text
- Copy-to-Clipboard Button

---

## 💡 WICHTIGE DESIGN-ENTSCHEIDUNGEN

### Modularität: Das Kernkonzept

Die ganze Architektur basiert auf WIEDERVERWENDBARKEIT:

1. **Character speichern** → In DB
2. **Scene speichern** → In DB
3. **Action speichern** → In Story mit Sequenznummer
4. **Später**: Gleiche Character in 5 verschiedenen Szenen verwenden
5. **Später**: Story globale Assets ändern (z.B. "alle Lights auf golden hour umschalten")

### Validierung: Forbidden Words Check

Nach jeder JSON→Text Konvertierung prüft das System automatisch auf:
- "masterpiece", "8K", "beautiful", etc.
- Falls gefunden: Warnung loggen, aber trotzdem zurückgeben

### Vision → JSON

Später (Phase 5) kannst du Gemini 1.5 Pro Vision nutzen, um:
1. User lädt Foto hoch
2. Vision-Modell extrahiert: skin_tone, hair, clothing, setting, lighting
3. System generiert automatisch JSON
4. User kann editieren, dann abspeichern

---

## 📋 TODO FÜR MORGEN

- [x] `.env` mit GEMINI_API_KEY erstellen
- [x] `python gemini_integration.py` testen (sollte Prompt generieren)
- [x] `main.py` mit FastAPI-Endpoints schreiben
- [x] Lokalen Server starten (`uvicorn backend.main:app --reload`)
- [x] Frontend-Basis mit Next.js aufsetzen
- [x] Erstes Input-Form für "Generate Prompt" bauen

---

## 🚀 Phase 5: Frontend-Komponenten implementieren

Nachdem das Grundgerüst und die Design-Spezifikationen stehen, wird die erste Komponente implementiert.

### `PromptInputForm.tsx`

Diese Komponente ist das Herzstück der initialen Benutzeroberfläche. Sie befindet sich unter `frontend/components/ui/PromptInputForm.tsx` und realisiert das Eingabeformular, das in "Erste UI" beschrieben wurde. Sie nutzt die festgelegte Typografie und das Farbschema.

---

## 🔗 Ressourcen

- [Z-Image-Turbo Guide](../docs/gnph3X1n.txt) — Dein Regelwerk
- [Gemini API Docs](https://ai.google.dev/docs)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)

---

**Du bist jetzt ready für Phase 2! 🚀**

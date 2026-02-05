from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
import sys
import uvicorn
import re
from dotenv import load_dotenv
from pydantic import BaseModel

# Ensure the backend directory is in the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load environment variables
load_dotenv()

# Import internal modules
from backend.gemini_integration import GeminiPromptGenerator
from backend.models import ZImageTurboPrompt, PromptAssemblyOutput, BasePrompt
from backend.adapters import get_adapter

app = FastAPI(title="Z-Image-Turbo Prompt Platform")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Generator
# We initialize it here so it's ready when the app starts.
# If API KEY is missing, it will raise an error on startup, which is good.
try:
    generator = GeminiPromptGenerator()
except ValueError as e:
    print(f"Startup Warning: {e}")
    generator = None


class TextPayload(BaseModel):
    text: str

@app.get("/")
async def root():
    """Root endpoint to welcome users and provide docs link."""
    return {
        "message": "Z-Image-Turbo Prompt Platform API is running.",
        "docs_url": "/docs"
    }

@app.post("/api/text-to-prompt")
async def text_to_prompt(payload: TextPayload):
    """Text-Input → Finaler Prompt"""
    if not generator:
        raise HTTPException(status_code=500, detail="Gemini Generator not initialized (missing API Key?)")
    
    try:
        output = generator.generate_full_prompt(payload.text)
        return {
            "success": True,
            "prompt_text": output.full_prompt_text,
            "word_count": output.estimated_word_count,
            "validation_passed": output.forbidden_words_check,
            "json_structure": output.json_structure.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/text-to-base")
async def text_to_base(payload: TextPayload):
    """Text-Input → Universal BasePrompt"""
    if not generator:
        raise HTTPException(status_code=500, detail="Gemini Generator not initialized (missing API Key?)")

    try:
        output = generator.text_to_base_prompt(payload.text)
        return {
            "success": True,
            "base_prompt": output.model_dump(),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/image-to-json")
async def image_to_json(file: UploadFile = File(...)):
    """Bild-Upload → Metadaten-JSON"""
    if not generator:
        raise HTTPException(status_code=500, detail="Gemini Generator not initialized")

    try:
        # Speichere Bild temporär
        import tempfile
        # Create temp file with correct extension
        suffix = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            result = generator.image_to_json(tmp_path)
            # Clean up temp file
            os.unlink(tmp_path)
            return result.model_dump()
        except Exception as e:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise e
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/adapt/{model}")
async def adapt_prompt(model: str, base_prompt: BasePrompt):
    """Universal BasePrompt → modell-spezifisches Format"""
    try:
        adapter = get_adapter(model)
        return adapter.adapt(base_prompt)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/import/civitai")
async def import_civitai(payload: dict):
    """Civitai URL → Metadaten → JSON-Extraktion"""
    if not generator:
        raise HTTPException(status_code=500, detail="Gemini Generator not initialized (missing API Key?)")

    civitai_url = payload.get("url")
    image_id = payload.get("image_id")
    mode = (payload.get("mode") or "auto").lower()

    if not civitai_url and not image_id:
        raise HTTPException(status_code=400, detail="url oder image_id erforderlich")

    if not image_id:
        match = re.search(r"/images/(\d+)", civitai_url or "")
        if match:
            image_id = match.group(1)
        else:
            raise HTTPException(status_code=400, detail="Konnte image_id aus URL nicht extrahieren")

    try:
        import httpx
        async with httpx.AsyncClient(timeout=15.0) as client:
            api_url = f"https://civitai.com/api/v1/images/{image_id}"
            resp = await client.get(api_url)
            resp.raise_for_status()
            data = resp.json()

        meta = data.get("meta") or {}
        prompt_text = meta.get("prompt") or meta.get("Prompt")
        image_url = data.get("url") or data.get("originalUrl") or data.get("imageUrl")

        if mode != "image" and prompt_text:
            extracted = generator.text_to_json(prompt_text)
            return {
                "source": "civitai",
                "image_id": image_id,
                "source_url": civitai_url,
                "prompt_text": prompt_text,
                "json_structure": extracted.model_dump(),
                "meta": meta,
            }

        if image_url:
            import tempfile
            async with httpx.AsyncClient(timeout=30.0) as client:
                img_resp = await client.get(image_url)
                img_resp.raise_for_status()
                suffix = os.path.splitext(image_url)[1] or ".jpg"
                with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                    tmp.write(img_resp.content)
                    tmp_path = tmp.name

            try:
                extracted = generator.image_to_json(tmp_path)
                return {
                    "source": "civitai",
                    "image_id": image_id,
                    "source_url": civitai_url,
                    "image_url": image_url,
                    "json_structure": extracted.model_dump(),
                    "meta": meta,
                }
            finally:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

        raise HTTPException(status_code=400, detail="Kein prompt_text oder image_url in Civitai-Antwort")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "gemini_ready": generator is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)

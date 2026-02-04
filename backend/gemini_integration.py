"""
Gemini API Integration für Z-Image-Turbo

Endpoints:
- POST /translate-text → Text-Input → Strukturiertes JSON
- POST /analyze-image → Bild-Upload → Metadaten-Extraktion
- POST /json-to-prompt → JSON → Flüssiger 600-1000 Wort Prompt
"""

import json
import os
from dotenv import load_dotenv
from typing import Optional
import google.generativeai as genai

load_dotenv()

from models import (
    ZImageTurboPrompt,
    BasePrompt,
    CharacterProfile,
    SceneModule,
    ActionModule,
    TextElementsModule,
    PromptAssemblyOutput,
    validate_no_forbidden_words,
    extract_forbidden_words
)
from system_prompts import get_system_prompt


class GeminiPromptGenerator:
    """
    Wrapper um die Gemini API für alle Prompt-Engineering-Aufgaben.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialisiert Gemini mit API-Key.
        
        Args:
            api_key: Google Gemini API-Key. Falls None, nutzt Umgebungsvariable GEMINI_API_KEY.
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY nicht gesetzt. Setze die Umgebungsvariable oder übergebe api_key parameter."
            )
        
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
        self.model_vision = genai.GenerativeModel("gemini-2.5-pro")  # für Bilder
    
    # ========================================================================
    # 1. TEXT → JSON (Nutzer-Input zu strukturiertem Prompt)
    # ========================================================================
    
    def text_to_json(self, user_input: str) -> ZImageTurboPrompt:
        """
        Konvertiert einen Text-Input (Idee, Konzept, grobes Beschreibung) in ein
        strukturiertes Z-Image-Turbo JSON-Schema.
        
        Args:
            user_input: Freiformtext vom Nutzer. Z.B. "Ein blondes Mädchen in Bari am Meer"
        
        Returns:
            ZImageTurboPrompt: Vollständig strukturiertes JSON-Schema
        
        Raises:
            ValueError: Falls Gemini ein invalides JSON zurückgibt oder Validierung fehlschlägt
        """
        system_prompt = get_system_prompt("text_to_json")
        
        # Baue den Request
        prompt = f"{system_prompt}\n\nUSER INPUT:\n{user_input}"
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 2000,
                }
            )
            
            response_text = response.text.strip()
            
            # Extrahiere JSON aus der Antwort (falls eingebettet in Markdown)
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text
            
            # Parse JSON
            data = json.loads(json_str)
            
            # Validiere gegen Pydantic-Schema
            prompt_obj = ZImageTurboPrompt(**data)
            
            return prompt_obj
        
        except json.JSONDecodeError as e:
            raise ValueError(f"Gemini hat ungültiges JSON zurückgegeben: {e}")
        except Exception as e:
            raise ValueError(f"Fehler bei Text→JSON Konvertierung: {e}")

    # ========================================================================
    # 1b. TEXT → BASE PROMPT (Universal-Schema)
    # ========================================================================

    def text_to_base_prompt(self, user_input: str) -> BasePrompt:
        """
        Konvertiert Text-Input in ein universelles BasePrompt-Schema.
        """
        system_prompt = get_system_prompt("text_to_base")
        prompt = f"{system_prompt}\n\nUSER INPUT:\n{user_input}"

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.6,
                    "max_output_tokens": 1200,
                }
            )

            response_text = response.text.strip()
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text

            data = json.loads(json_str)
            base_prompt = BasePrompt(**data)
            return base_prompt

        except json.JSONDecodeError as e:
            raise ValueError(f"Gemini hat ungültiges JSON zurückgegeben: {e}")
        except Exception as e:
            raise ValueError(f"Fehler bei Text→BasePrompt Konvertierung: {e}")
    
    # ========================================================================
    # 2. BILD → JSON (Vision-Analyse)
    # ========================================================================
    
    def image_to_json(self, image_path: str) -> ZImageTurboPrompt:
        """
        Analysiert ein hochgeladenes Bild und extrahiert die visuelle DNA
        als strukturiertes JSON.
        
        Args:
            image_path: Absoluter Pfad zur Bilddatei (PNG, JPG, etc.)
        
        Returns:
            ZImageTurboPrompt: Aus Bild extrahierte Metadaten
        
        Raises:
            FileNotFoundError: Falls Bild nicht existiert
            ValueError: Falls Vision-Analyse fehlschlägt
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Bilddatei nicht gefunden: {image_path}")
        
        system_prompt = get_system_prompt("vision")
        
        # Lade Bild
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        try:
            # Sende Bild + System-Prompt an Vision-Modell
            response = self.model_vision.generate_content(
                [
                    system_prompt,
                    {"mime_type": "image/jpeg", "data": image_data},  # oder PNG
                    "\n\nExtrahiere nun die visuelle DNA dieses Bildes."
                ],
                generation_config={
                    "temperature": 0.5,  # Etwas niedriger für Präzision
                    "max_output_tokens": 2500,
                }
            )
            
            response_text = response.text.strip()
            
            # Parse JSON
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text
            
            data = json.loads(json_str)
            
            # Validiere gegen Schema
            prompt_obj = ZImageTurboPrompt(**data)
            
            return prompt_obj
        
        except json.JSONDecodeError as e:
            raise ValueError(f"Vision-Modell hat ungültiges JSON zurückgegeben: {e}")
        except Exception as e:
            raise ValueError(f"Fehler bei Bild→JSON Analyse: {e}")
    
    # ========================================================================
    # 3. JSON → PROMPT TEXT (Struktur in natürlichsprachigen Prompt)
    # ========================================================================
    
    def json_to_prompt_text(self, prompt_json: ZImageTurboPrompt) -> PromptAssemblyOutput:
        """
        Konvertiert ein strukturiertes JSON-Schema in einen flüssigen,
        600-1000 Wort natürlichsprachigen Prompt für Z-Image-Turbo.
        
        Args:
            prompt_json: Strukturiertes ZImageTurboPrompt-Objekt
        
        Returns:
            PromptAssemblyOutput: Finaler Prompt + Validierungsstatus
        
        Raises:
            ValueError: Falls Konvertierung fehlschlägt oder Forbidden Words gefunden
        """
        system_prompt = get_system_prompt("json_to_text")
        
        # Serialisiere JSON für Gemini
        json_input = prompt_json.model_dump_json(indent=2)
        
        prompt = f"{system_prompt}\n\nSTRUKTURIERTES JSON:\n{json_input}"
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.8,
                    "max_output_tokens": 3000,
                }
            )
            
            final_prompt = response.text.strip()
            
            # Validiere auf Forbidden Words
            has_forbidden = not validate_no_forbidden_words(final_prompt)
            forbidden_found = extract_forbidden_words(final_prompt) if has_forbidden else []
            
            if has_forbidden:
                print(f"⚠️  WARNUNG: Forbidden Words gefunden: {forbidden_found}")
                print(f"   Final Prompt:\n{final_prompt}")
            
            # Zähle Wörter
            word_count = len(final_prompt.split())
            
            return PromptAssemblyOutput(
                json_structure=prompt_json,
                full_prompt_text=final_prompt,
                forbidden_words_check=not has_forbidden,
                estimated_word_count=word_count
            )
        
        except Exception as e:
            raise ValueError(f"Fehler bei JSON→Prompt Konvertierung: {e}")
    
    # ========================================================================
    # 4. CONVENIENCE: End-to-End Text → Finaler Prompt
    # ========================================================================
    
    def generate_full_prompt(self, user_input: str) -> PromptAssemblyOutput:
        """
        Alles in einem: Text-Input → JSON → Flüssiger Prompt.
        
        Dies ist der einfachste Weg für Nutzer, einen kompletten Prompt zu generieren.
        
        Args:
            user_input: Nutzer-Eingabe (Idee, Beschreibung)
        
        Returns:
            PromptAssemblyOutput: Finaler, optimierter Prompt
        """
        # Schritt 1: Text → JSON
        json_schema = self.text_to_json(user_input)
        
        # Schritt 2: JSON → Prompt-Text
        final_output = self.json_to_prompt_text(json_schema)
        
        return final_output


# ============================================================================
# CLI / TESTING
# ============================================================================

if __name__ == "__main__":
    import sys
    
    # Test: text_to_json
    generator = GeminiPromptGenerator()
    
    user_input = "Ein blondes Mädchen, 18 Jahre alt, aus Des Moines, Iowa. Sie sitzt in einer Universitätsbibliothek am Schreibtisch und schaut nachdenklich auf ein Buch."
    
    print("🎬 Generating full prompt from user input...")
    print(f"Input: {user_input}\n")
    
    try:
        output = generator.generate_full_prompt(user_input)
        
        print("✅ JSON Schema:")
        print(json.dumps(output.json_structure.model_dump(), indent=2, ensure_ascii=False))
        
        print("\n" + "="*80)
        print("📝 Final Prompt Text:")
        print("="*80)
        print(output.full_prompt_text)
        
        print("\n" + "="*80)
        print("📊 Validierungsergebnisse:")
        print(f"   - Word Count: {output.estimated_word_count}")
        print(f"   - Forbidden Words Check: {'✅ Passed' if output.forbidden_words_check else '❌ Failed'}")
    
    except Exception as e:
        print(f"❌ Fehler: {e}")
        sys.exit(1)

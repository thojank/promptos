"""
Z-Image-Turbo Prompt Platform - Datenmodelle

Basiert auf dem Z-Image-Turbo JSON Prompt Guide v2:
- Modulare Zerlegung von Character, Scene, Action, TextElements
- Anti-Bias-Physik-Deskriptoren für realistische Subjekte
- Validierung gegen Forbidden Words und Quality Markers
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Union
from enum import Enum


# ============================================================================
# 1. ANTI-BIAS PHYSIK-DESKRIPTOR-ENUMS
# ============================================================================

class SkinTone(str, Enum):
    """Hautfarben mit natürlichen Undertönen (Anti-Default-Modus)"""
    LIGHT_WARM = "light skin tone with natural warmth"
    LIGHT_COOL = "light skin tone with cool undertones"
    MEDIUM_GOLDEN = "medium skin tone with golden undertones"
    MEDIUM_OLIVE = "medium skin tone with olive undertones"
    MEDIUM_DARK_WARM = "medium-dark skin tone with warm undertones"
    DEEP_RICH = "deep skin tone with rich brown tones"


class HairDescription(str, Enum):
    """Haarbeschreibungen zur Vermeidung von East-Asian-Defaults"""
    LONG_BLONDE = "long straight blonde hair"
    SHORT_BROWN = "short curly brown hair"
    WAVY_AUBURN = "wavy auburn hair to shoulders"
    TIGHT_BLACK = "tight coils of black hair"
    SILVER_GREY = "silver-grey hair cropped short"
    STRAIGHT_BLACK = "straight black hair with middle part"


class FacialStructure(str, Enum):
    """Gesichtsform zur Konsistenz"""
    OVAL = "oval face shape"
    ROUND = "round face with full cheeks"
    ANGULAR = "angular face with defined cheekbones"
    SQUARE = "square jawline"
    SOFT = "soft jawline"
    HEART = "heart-shaped face"


class EyeDescription(str, Enum):
    """Augen-Charakteristika"""
    LIGHT_BLUE = "light blue eyes"
    DEEP_BROWN = "deep brown eyes"
    HAZEL_GOLD = "hazel eyes with gold flecks"
    GREY_GREEN = "grey-green eyes"
    ALMOND = "almond-shaped eyes"
    DEEP_SET = "deep-set eyes"
    WIDE_SET = "wide-set eyes"


class LightingType(str, Enum):
    """Erlaubte Beleuchtungsbeschreibungen (KEINE 'cinematic lighting')"""
    SOFT_DAYLIGHT = "soft daylight"
    OVERCAST_SKY = "overcast sky"
    SHARP_SHADOWS = "sharp shadows"
    GOLDEN_HOUR = "golden hour sun"
    DIFFUSED_WINDOW = "diffused window light"
    HARSH_MIDDAY = "harsh midday sun"
    WARM_INCANDESCENT = "warm incandescent glow"
    COOL_FLUORESCENT = "cool fluorescent light"
    RIM_LIGHTING = "rim lighting from behind"
    DAPPLED_LEAVES = "dappled light through leaves"


# ============================================================================
# 1b. UNIVERSAL BASE PROMPT (MODEL-AGNOSTISCH)
# ============================================================================

class Subject(BaseModel):
    description: str = Field(
        ..., description="Kernsubjekt mit Identität/Anker. Z.B. 'Valentina Ruiz, 22, Colombian-Lebanese student from Medellín'"
    )
    attributes: Optional[List[str]] = Field(
        default=None,
        description="Optionale Attribute/Details. Z.B. ['navy linen blazer', 'oval face shape']"
    )


class Environment(BaseModel):
    location: str = Field(
        ..., description="Ort/Setting mit geografischem Anker"
    )
    atmosphere: Optional[str] = Field(
        default=None, description="Umgebungsqualität. Z.B. 'warm, dry air, relaxed afternoon'"
    )
    weather: Optional[str] = Field(
        default=None, description="Wetterbeschreibung"
    )


class Style(BaseModel):
    lighting: Optional[str] = Field(
        default=None, description="Beleuchtung (konkret)"
    )
    camera: Optional[str] = Field(
        default=None, description="Kamera/Framing (z.B. 35mm, close-up, three-quarter view)"
    )
    film_stock: Optional[str] = Field(
        default=None, description="Film/Rendering-Charakter"
    )
    aesthetics: Optional[List[str]] = Field(
        default=None, description="Stilbegriffe (modell-agnostisch)"
    )


class TechSpecs(BaseModel):
    aspect_ratio: Optional[str] = Field(default=None, description="Seitenverhältnis, z.B. 16:9")
    seed: Optional[int] = Field(default=None, description="Seed")
    cfg_scale: Optional[float] = Field(default=None, description="CFG Scale")
    resolution: Optional[Union[str, Dict[str, int]]] = Field(
        default=None, description="Aufloesung, z.B. '1024x1536' oder {width,height}"
    )
    steps: Optional[int] = Field(default=None, description="Sampling steps")
    guidance: Optional[float] = Field(default=None, description="Guidance scale")
    sampler: Optional[str] = Field(default=None, description="Sampler name")
    negative_prompt: Optional[str] = Field(default=None, description="Negative prompt")


class BasePrompt(BaseModel):
    """
    Universelles, modell-agnostisches Prompt-Schema.
    Adapter übersetzen dieses Schema in das jeweilige Zielformat.
    """
    subject: Subject
    environment: Environment
    style: Optional[Style] = None
    technical: Optional[TechSpecs] = None


# ============================================================================
# 2. CHARACTER PROFILE MODULE
# ============================================================================

class PhysicalDescriptors(BaseModel):
    """Anti-Bias physische Merkmale"""
    skin_tone: SkinTone
    hair: HairDescription
    facial_structure: FacialStructure
    eyes: EyeDescription
    additional_features: Optional[str] = Field(
        None,
        description="Z.B. 'freckles across nose and cheeks', 'visible smile lines'"
    )


class FictionalIdentity(BaseModel):
    """Realistische, fiktive Identität (KEINE generischen Begriffe wie 'ein Mann')"""
    name: str = Field(..., description="Vollständiger Name")
    age: int = Field(..., ge=1, le=120, description="Alter")
    background: str = Field(
        ...,
        description="Kultureller/geografischer Kontext. Z.B. 'Colombian-Lebanese student from Medellín'"
    )


class CharacterProfile(BaseModel):
    """
    Ein wiederverwendbarer Charakter für mehrere Szenen.
    Speichert die konstanten Merkmale.
    """
    id: Optional[str] = None  # UUID bei Speicherung
    identity: FictionalIdentity
    physical_descriptors: PhysicalDescriptors
    clothing: str = Field(
        ...,
        description="Exakte Kleidungsbeschreibung mit Materialien und Farben. Z.B. 'navy linen blazer over white t-shirt'"
    )
    special_notes: Optional[str] = Field(
        None,
        description="Weitere konsistente Merkmale (Tattoos, Narben, etc.)"
    )

    @validator('identity')
    def validate_identity(cls, v):
        """Sicherstellen, dass keine generischen Begriffe in background verwendet werden"""
        forbidden_generic = ['man', 'woman', 'boy', 'girl', 'person', 'a man', 'a woman']
        if any(term in v.background.lower() for term in forbidden_generic):
            raise ValueError(
                "Keine generischen Begriffe ('man', 'woman', etc.) - nutze spezifische, fiktive Identitäten"
            )
        return v


# ============================================================================
# 3. SCENE MODULE (Die Settings, die austauschbar sind)
# ============================================================================

class SceneModule(BaseModel):
    """
    Eine austauschbare Szene. Kann mit verschiedenen Characters kombiniert werden.
    Hier definiert sich der visuelle Kontext.
    """
    id: Optional[str] = None
    setting: str = Field(
        ...,
        description="Umgebung mit geografischen Ankern. Z.B. 'historic piazza in Bari old town, baroque church facade in background'"
    )
    lighting: LightingType = Field(
        ...,
        description="Spezifische, beobachtbare Beleuchtung (NICHT 'cinematic lighting')"
    )
    lighting_details: Optional[str] = Field(
        None,
        description="Zusätzliche Licht-Nuancen. Z.B. 'warm golden tones, long shadows cast by buildings'"
    )
    atmosphere: str = Field(
        ...,
        description="Umgebungsqualitäten. Z.B. 'warm, dry air, bustling but relaxed European afternoon'"
    )
    composition: str = Field(
        ...,
        description="Kamerawinkel und Framing. Z.B. 'three-quarter view, subject slightly left of center'"
    )
    technical_specs: Optional[str] = Field(
        None,
        description="Kamera-Details. Z.B. 'Shot on Fujifilm X-T4, natural color rendering, slight film grain aesthetic'"
    )


# ============================================================================
# 4. ACTION & POSE MODULE
# ============================================================================

class ActionModule(BaseModel):
    """Was der Character gerade tut"""
    action: str = Field(
        ...,
        description="Was der Character macht. Z.B. 'Standing at outdoor café table, one hand holding espresso cup'"
    )
    pose_details: Optional[str] = Field(
        None,
        description="Zusätzliche Pose-Beschreibungen. Z.B. 'other hand gesturing mid-conversation'"
    )


# ============================================================================
# 5. TEXT ELEMENTS MODULE
# ============================================================================

class TextElement(BaseModel):
    """Ein einzelnes Textelement im Bild (mit doppelten Anführungszeichen!)"""
    content: str = Field(
        ...,
        description="Der exakte Text, der im Bild erscheinen soll (wird später in \\\"...\\\" gesetzt)"
    )
    font_style: str = Field(
        ...,
        description="Schriftstil. Z.B. 'elegant gold serif lettering', 'white chalk-style font'"
    )
    placement: str = Field(
        ...,
        description="Platzierung. Z.B. 'top center', 'bottom left', 'on storefront sign'"
    )
    size: Optional[str] = Field(
        None,
        description="Größe relativ zum Bild. Z.B. 'large heading', 'small caption'"
    )
    surface_material: Optional[str] = Field(
        None,
        description="Material des Texts. Z.B. 'neon letters', 'carved wood', 'painted metal'"
    )


class TextElementsModule(BaseModel):
    """Container für alle Text-Elemente im Bild"""
    elements: Optional[List[TextElement]] = Field(
        default=None,
        description="Liste der Text-Elemente (kann leer sein)"
    )
    
    def has_text(self) -> bool:
        return self.elements and len(self.elements) > 0


# ============================================================================
# 6. COMPLETE PROMPT ASSEMBLY
# ============================================================================

class ZImageTurboPrompt(BaseModel):
    """
    Vollständiger, zusammengesetzter Prompt für Z-Image-Turbo.
    Kombiniert Character × Scene × Action × TextElements.
    """
    id: Optional[str] = None
    character: CharacterProfile
    scene: SceneModule
    action: ActionModule
    text_elements: Optional[TextElementsModule] = None
    
    # Metadaten
    story_id: Optional[str] = None
    sequence_number: Optional[int] = None
    notes: Optional[str] = None


# ============================================================================
# 7. STORY CONTAINER (Für narrative Sequenzen)
# ============================================================================

class GlobalAssets(BaseModel):
    """Globale Parameter, die auf alle Szenen in der Story angewendet werden"""
    style_preset: str = Field(
        default="photorealistic",
        description="Z.B. 'photorealistic', 'analog film', 'cyberpunk'"
    )
    color_grading: Optional[str] = None
    overall_atmosphere_override: Optional[str] = None


class Story(BaseModel):
    """Ein Container für eine narrative Sequenz von Prompts"""
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    prompts: List[ZImageTurboPrompt] = Field(
        default_factory=list,
        description="Sequenz von Prompts (in Reihenfolge)"
    )
    global_assets: Optional[GlobalAssets] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ============================================================================
# 8. PROMPT ASSEMBLY OUTPUT (für Gemini)
# ============================================================================

class PromptAssemblyOutput(BaseModel):
    """
    Finale, 600-1000 Wort natürlichsprachige Prompt (nach JSON-to-Text Konversion)
    Diese wird an Z-Image-Turbo gesendet.
    """
    json_structure: ZImageTurboPrompt
    full_prompt_text: str = Field(
        ...,
        description="Die ausformulierte, flüssige Promptbeschreibung (600-1000 Wörter)"
    )
    forbidden_words_check: bool = Field(
        default=True,
        description="Wurde auf Forbidden Words geprüft?"
    )
    estimated_word_count: int = Field(
        default=0,
        description="Geschätzte Wörterzahl des finalen Prompts"
    )


# ============================================================================
# 9. VALIDATION & CONSTANTS
# ============================================================================

FORBIDDEN_WORDS = {
    # Meta-Tags und Quality Markers
    "masterpiece", "award-winning", "hyperrealistic", "8k", "4k", "hdr",
    "ultra-detailed", "trending on artstation", "best quality",
    
    # Subjektive/emotionale Sprache
    "beautiful", "handsome", "pretty", "stunning", "gorgeous", "amazing",
    "incredible",
    
    # Stylisierung
    "anime style", "cartoon", "illustration", "digital art",
    "cinematic lighting",
    
    # Generische Begriffe (nutze stattdessen fiktive Identitäten)
    "man", "woman", "person", "boy", "girl", "a man", "a woman"
}


def validate_no_forbidden_words(text: str) -> bool:
    """
    Prüfe, ob ein Prompt Forbidden Words enthält.
    Gibt False zurück, wenn Forbidden Words gefunden werden.
    """
    text_lower = text.lower()
    found = [word for word in FORBIDDEN_WORDS if word in text_lower]
    return len(found) == 0


def extract_forbidden_words(text: str) -> List[str]:
    """Extrahiere alle Forbidden Words aus einem Text"""
    text_lower = text.lower()
    return [word for word in FORBIDDEN_WORDS if word in text_lower]

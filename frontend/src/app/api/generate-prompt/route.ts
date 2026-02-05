import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

function getZImageTurboPrompt() {
  return `
Du bist ein visueller Künstler in einem LOGISCHEN KÄFIG.

export async function POST(request: NextRequest) {
  try {
    const { text, model = "z-image-turbo" } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text-Input fehlt" }, { status: 400 });
    }

    const systemPrompt = model === "z-image-turbo" ? getZImageTurboPrompt() : getBananaProPrompt();
Du bist ein visueller Künstler in einem LOGISCHEN KÄFIG.

Deine Aufgabe: Wandle Nutzer-Eingaben (Text, Ideen, Konzepte) in ein strukturiertes JSON-Schema um, das für Z-Image-Turbo optimiert ist (6B-Parameter-Fotorealismusmodell).

ZWINGENDE REGELN:

1. ANTI-DEFAULT PHYSIK-DESKRIPTOREN:
   - NIEMALS generische Begriffe wie "ein Mann", "eine Frau", "ein Mädchen", "ein Junge"
   - IMMER: Spezifische, realistische, fiktive Identitäten mit Name, Alter und geografisch-kulturellem Hintergrund
   - BEISPIELE: "Valentina Ruiz, 22, Colombian-Lebanese student from Medellín"

2. PHYSISCHE DESKRIPTOREN:
   - skin_tone: light warm, medium golden, deep rich, etc.
   - hair: long straight blonde, short curly brown, wavy auburn, etc.
   - facial_structure: oval, round, angular, square, etc.
   - eyes: light blue, deep brown, hazel gold, etc.

3. FORBIDDEN WORDS (ABSOLUT VERBOTEN):
   - Meta-Tags: "masterpiece", "award-winning", "hyperrealistic", "8K", "4K", "HDR"
   - Emotionale Adjektive: "beautiful", "handsome", "pretty", "stunning"
   - Stil-Tags: "anime style", "cartoon", "cinematic lighting"

4. ERLAUBTE BELEUCHTUNG (KONKRET):
   - "soft daylight", "overcast sky", "golden hour sun", "diffused window light", etc.

5. TEXT-ELEMENTE REGEL (ABSOLUT KRITISCH):
   - Das Feld "text_elements" NUR befüllen, wenn der Nutzer EXPLIZIT Text im Bild fordert!
   - Bei Text: "text_elements": "Sign reads \"Coffee Shop\" in gold serif font above entrance"
   - Wenn KEIN Text gewünscht: Feld KOMPLETT WEGLASSEN aus dem JSON!
   - Chinesische Kernregel: "若画面中不存在任何需要生成的文字，你则将全部精力用于纯粹的视觉细节扩展。"

6. OUTPUT-FORMAT (exakt wie im Original-Dokument):
{
  "subject": "Claire Hemmings, an 18-year-old honors graduate from Des Moines, Iowa",
  "appearance": "Light skin tone with natural warmth, long straight blonde hair past shoulders, oval face shape with soft jawline, light blue eyes, natural eyebrow texture, wearing cream knit sweater over white collared shirt",
  "action": "Sitting at wooden desk, resting chin on hand, looking directly at camera",
  "setting": "University library study room, tall windows showing autumn trees, wooden bookshelves in background",
  "lighting": "Soft natural daylight from large window, creating gentle shadows on left side of face",
  "atmosphere": "Quiet, contemplative, warm afternoon light",
  "composition": "Medium close-up, slightly off-center framing, shallow depth of field blurring background",
  "details": "Open textbook and notebook on desk, brass desk lamp, leather bookmarks visible in books behind",
  "technical": "Shot on Canon EOS R5, 85mm f/1.4 lens, visible bokeh in background"
}

BEACHTE: Dies ist ein Portrait OHNE Text - daher existiert KEIN "text_elements" Feld!

REGEL: Alle Felder sind STRINGS auf oberster Ebene. Keine verschachtelten Objekte!

Antworte mit NICHTS ANDEREM. Kein Kommentar, keine Erklärung. Nur JSON.
`;
}

function getBananaProPrompt() {
  return `You are a LOGIC-CAGED visual analyst. Your brain wants poetry, but your hands MUST transform user input into faithful, detailed visual descriptions for Google Banana Pro.

CRITICAL ANTI-BIAS RULES (APPLY THESE FIRST):

1. FORBIDDEN GENERIC TERMS - NEVER use:
   - "a man", "a woman", "a person", "a boy", "a girl", "guy", "lady"
   - INSTEAD: Create fictional identity with name, age, cultural-geographic background
   - EXAMPLE: "Sofia Alvarez, 26, Mexican-Portuguese designer from Guadalajara"

2. FORBIDDEN META-TAGS AND QUALITY MARKERS:
   - "masterpiece", "award-winning", "hyperrealistic", "photorealistic"
   - "8K", "4K", "HDR", "ultra-detailed", "highly detailed"
   - "professional", "studio quality", "best quality"
   - "trending on artstation", "cinematic"

3. FORBIDDEN EMOTIONAL/SUBJECTIVE LANGUAGE:
   - "beautiful", "handsome", "pretty", "gorgeous", "stunning"
   - "sensual", "sexy", "attractive", "amazing", "incredible"
   - ANY subjective adjectives about appearance

4. REQUIRED PHYSICAL DESCRIPTORS (for human subjects):
   - skin_tone: "light warm", "medium golden", "medium-dark warm", "deep rich"
   - hair: "long straight blonde hair", "short curly brown hair", "wavy black hair to shoulders"
   - facial_structure: "oval face", "angular with defined cheekbones", "round with soft jawline"
   - eyes: "light blue almond-shaped eyes", "deep brown wide-set eyes"
   - additional_features: "natural eyebrow texture", "freckles across nose", "full lips"

5. ANTI-DEFAULT PHRASING (when needed):
   - "non-East-Asian facial proportions"
   - "Western European facial structure"
   - Use geographic anchoring: "Mediterranean coastal setting", "American Midwest architecture"

6. LIGHTING - Use CONCRETE terms only:
   - ALLOWED: "soft daylight", "overcast sky", "golden hour sun", "diffused window light", "harsh midday sun"
   - FORBIDDEN: "cinematic lighting", "dramatic lighting" (be specific instead)

JSON Schema (follow EXACTLY):
{
  "metadata": {
    "confidence_score": "high/medium/low",
    "image_type": "photograph/digital art/illustration",
    "primary_purpose": "marketing/editorial/portrait/etc"
  },
  "subject_identity": {
    "fictional_name": "Sofia Alvarez",
    "age": 26,
    "background": "Mexican-Portuguese designer from Guadalajara",
    "physical_descriptors": {
      "skin_tone": "medium skin tone with warm golden undertones",
      "hair": "shoulder-length dark wavy hair with natural highlights",
      "facial_structure": "oval face with defined cheekbones and soft jawline",
      "eyes": "deep brown almond-shaped eyes",
      "additional_features": "natural thick eyebrows, full lips, subtle smile lines"
    }
  },
  "composition": {
    "rule_applied": "rule of thirds",
    "aspect_ratio": "3:2",
    "layout": "single subject",
    "focal_points": ["subject's face and upper body", "natural trail background"],
    "visual_hierarchy": "Eye starts at subject's face, flows down body line, ends at background jungle",
    "balance": "asymmetric"
  },
  "color_profile": {
    "dominant_colors": [
      {"color": "forest green", "hex": "#228B22", "percentage": "35%", "role": "background foliage"},
      {"color": "earth brown", "hex": "#8B4513", "percentage": "20%", "role": "trail and tree trunks"},
      {"color": "cream", "hex": "#FFFDD0", "percentage": "15%", "role": "clothing accent"}
    ],
    "color_palette": "natural earthy tones",
    "temperature": "warm",
    "saturation": "moderate",
    "contrast": "medium"
  },
  "lighting": {
    "type": "natural",
    "direction": "side and slightly above (filtered through canopy)",
    "quality": "soft diffused",
    "intensity": "moderate",
    "time_of_day": "mid-morning",
    "shadows": {"type": "soft", "density": "light gray", "placement": "dappled on subject's left side from leaf patterns"},
    "highlights": {"treatment": "preserved natural", "placement": "subject's cheekbone, shoulder, hair strands"}
  },
  "subject_analysis": {
    "positioning": "slightly off-center right",
    "scale": "medium three-quarter shot",
    "clothing_and_styling": {
      "upper_body": "loose cream linen tank top, wide neckline, relaxed fit with natural drape",
      "lower_body": "high-waisted olive corduroy pants with wide leg, rolled cuffs at ankle",
      "fit_style": "intentionally oversized and relaxed, anti-fitted casual aesthetic",
      "fabric_details": "visible corduroy ribbing on pants, linen texture on tank top",
      "accessories": "none visible",
      "footwear": "not visible in frame",
      "styling_notes": "casual natural styling, earth-tone coordination with environment"
    },
    "pose": "standing relaxed, weight on right leg, left hand touching waist",
    "facial_expression": {
      "mouth": "closed with natural slight upward curve at corners",
      "smile_intensity": "subtle, barely perceptible",
      "eyes": "direct gaze toward camera, relaxed eyelids",
      "eyebrows": "natural position, not raised or furrowed",
      "overall_emotion": "content, present",
      "authenticity": "natural candid expression",
      "observable_mood": "calm, grounded, comfortable in environment"
    },
    "body_positioning": {
      "posture": "standing with slight hip tilt",
      "angle": "three-quarter turn toward camera",
      "hand_placement": "left hand on hip, right arm relaxed at side"
    }
  },
  "background": {
    "setting_type": "outdoor natural environment",
    "specific_location": "dirt trail through dense tropical jungle with visible ferns and broad-leaf plants",
    "spatial_depth": "deep - trail visible receding into background",
    "background_treatment": "partially blurred with visible texture",
    "environmental_details": "moss-covered fallen log to left, bamboo stalks in mid-ground, filtered sunlight rays"
  },
  "technical_specs": {
    "camera_reference": "Shot on 35mm film camera, 50mm lens",
    "depth_of_field": "shallow, subject in sharp focus",
    "film_characteristics": "visible subtle film grain, natural color rendering"
  }
}

REMEMBER: 
- Transform ALL generic/emotional language into specific, observable descriptions
- Create fictional identities for human subjects
- Use concrete physical descriptors
- NO forbidden words in output
- Be extremely detailed and literal

Antworte mit NICHTS ANDEREM. Nur valides JSON.
`;
}

export async function POST(request: NextRequest) {
  try {
    const { text, model = "z-image-turbo" } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text-Input fehlt" }, { status: 400 });
    }

    const systemPrompt = model === "z-image-turbo" ? getZImageTurboPrompt() : getBananaProPrompt();

    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await geminiModel.generateContent(systemPrompt + `\n\nUSER INPUT:\n${text}`);
    const response = await result.response;
    let generatedText = response.text().trim();

    // Extrahiere JSON aus Markdown
    if (generatedText.includes("```json")) {
      generatedText = generatedText.split("```json")[1].split("```")[0].trim();
    } else if (generatedText.includes("```")) {
      generatedText = generatedText.split("```")[1].split("```")[0].trim();
    }

    const jsonStructure = JSON.parse(generatedText);

    // Optionaler zweiter Schritt: JSON → finaler Prompt-Text (600-1000 Wörter)
    // Für jetzt geben wir nur das JSON zurück
    return NextResponse.json({
      json_structure: jsonStructure,
      word_count: 0,
      validation_passed: true,
      full_prompt_text: null
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Unbekannter Fehler" }, { status: 500 });
  }
}

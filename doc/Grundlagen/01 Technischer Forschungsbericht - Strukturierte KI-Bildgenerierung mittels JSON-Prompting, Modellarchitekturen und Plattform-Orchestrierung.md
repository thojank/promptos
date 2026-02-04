# Technischer Forschungsbericht: Strukturierte KI-Bildgenerierung mittels JSON-Prompting, Modellarchitekturen und Plattform-Orchestrierung

## 1. Executive Summary

Die Generative KI durchläuft derzeit eine signifikante Transformation von stochastischen, auf natürlicher Sprache basierenden Interaktionsmodellen hin zu deterministischen, strukturierten Kontrollmechanismen. Im Zentrum dieser Entwicklung steht das **JSON Prompting** (JavaScript Object Notation), eine Methodik, die kreative Intentionen in strikte Datenschemata kapselt, um Halluzinationen zu minimieren und die Reproduzierbarkeit in Produktionsumgebungen zu maximieren. Dieser Bericht bietet eine exhaustive technische Analyse dieser Methodik, mit einem spezifischen Fokus auf die Ökosysteme von **Nano Banana Pro** (basierend auf der Google Gemini 3 Architektur) und **Flux 2** (Black Forest Labs).

Das primäre Ziel dieses Dokuments ist die Bereitstellung eines technischen Fundaments für den Bau einer Plattform zur **"Text/Bild-zu-JSON"**-Konvertierung und **Prompt-Verwaltung**. Die Analyse validiert, dass moderne Diffusions- und Flow-Matching-Modelle eine signifikant höhere Adhärenz an Nutzerinstruktionen zeigen, wenn diese in semantische Kategorien – wie Subjekt, Beleuchtung, Kamera und Stil – segmentiert werden. Insbesondere das Modell **Nano Banana Pro**, welches fortschrittliche Reasoning-Fähigkeiten ("Thinking Models") nutzt, profitiert von dieser Strukturierung, da sie es dem Modell erlaubt, Szenenkompositionen vor der Pixelgenerierung logisch zu planen.

Ein weiterer Schwerpunkt liegt auf der **"Bild-zu-JSON"**-Pipeline, die durch Open-Source Vision-Language Models (VLM) wie **DeepSeek Janus Pro** ermöglicht wird. Diese Modelle, basierend auf entkoppelter visueller Encodierung, können existierende Bilddaten in strukturierte JSON-Objekte zurückübersetzen, wodurch ein geschlossener Regelkreis ("Closed Loop") für iterative Kreativprozesse entsteht.

Für die operative Umsetzung evaluiert dieser Bericht Open-Source Large Language Models (LLMs) wie **Qwen 2.5**, **Llama 3** und **Mistral** hinsichtlich ihrer Fähigkeit, valide JSON-Outputs zu generieren, und detailliert Integrationsstrategien für **ComfyUI** und **Automatic1111**. Abschließend werden Prompt-Management-Lösungen wie **Agenta** und **Langfuse** als kritische Infrastrukturkomponenten identifiziert, um Versionierung, Evaluation und Observability in der KI-Bildproduktion zu gewährleisten.

---

## 2. Theoretischer Rahmen des Strukturierten Promptings

### 2.1. Die Limitierungen natürlicher Sprache im Latenten Raum

Historisch gesehen basierte die Text-zu-Bild-Generierung (Text-to-Image, T2I) fast ausschließlich auf Prompts in natürlicher Sprache. Während dieser Ansatz intuitiv ist, leidet er unter inhärenten technischen Schwächen, insbesondere dem Phänomen des **"Concept Bleeding"** (Konzept-Überblutung). In Transformator- oder U-Net-Architekturen führen Aufmerksamkeitsmechanismen (Self-Attention und Cross-Attention) oft dazu, dass Attribute eines Objekts (z. B. "rotes Auto") fälschlicherweise auf andere Elemente der Szene (z. B. "roter Himmel") übertragen werden, da die semantische Isolation der Token im kontinuierlichen Textstrom nicht garantiert ist.

In professionellen Produktionspipelines ist diese Stochastizität inakzeptabel. Ein Prompt, der lediglich "ein cinematisches Bild" beschreibt, ist semantisch unterdefiniert. Er spezifiziert weder Brennweite noch Beleuchtungsverhältnisse oder Color Grading LUTs (Look-Up Tables) mit der für markenkonsistente Assets erforderlichen Präzision.

### 2.2. Das JSON-Paradigma: Separation of Concerns

JSON Prompting adressiert diese fundamentalen Probleme durch die Anwendung des Software-Engineering-Prinzips **"Separation of Concerns"** (SoC) auf die Prompt-Konstruktion. Indem der Prompt in hierarchische Schlüssel-Wert-Paare (Key-Value Pairs) zerlegt wird, wird das generative Modell gezwungen, Attribute isoliert zu verarbeiten.

**Kernvorteile der JSON-Strukturierung:**

- **Deterministische Attributzuweisung:** Durch die explizite Zuweisung von Eigenschaften zu spezifischen Schlüsseln (z.B. `"Subject": {"clothing": "red"}` vs. `"Background": {"sky": "blue"}`) wird das Risiko von Attribut-Leckagen drastisch reduziert.
    
- **Gewichteter Fokus:** Das Modell kann instruiert werden, bestimmten JSON-Blöcken (z.B. `Technical`) eine höhere Aufmerksamkeit zu widmen als anderen, was eine fein granulare Steuerung der Bildästhetik ermöglicht.
    
- **Programmatische Skalierbarkeit:** JSON-Objekte sind maschinenlesbar und können durch Code prozedural generiert, modifiziert und validiert werden. Dies ermöglicht die automatisierte Batch-Generierung von Tausenden von Variationen (z.B. Permutation des Schlüssels `"lighting"` über einen Datensatz), was für die geplante Plattform essenziell ist.
    

### 2.3. Vergleichende Analyse der Prompting-Modalitäten

Die folgende Tabelle verdeutlicht die strukturellen Unterschiede und die Eignung der verschiedenen Prompting-Ansätze für die geplante Plattformarchitektur.

|**Merkmal**|**Natural Language Prompting**|**JSON / Structured Prompting**|**Implikation für Plattform**|
|---|---|---|---|
|**Eingabestruktur**|Linearer Textstring|Hierarchische Schlüssel-Wert-Paare|JSON ermöglicht Formular-basiertes UI|
|**Attribut-Isolation**|Gering (hohes Risiko für Concept Bleeding)|Hoch (strikte Kapselung)|Präzise Steuerung komplexer Szenen|
|**Reproduzierbarkeit**|Niedrig bis Mittel|Hoch|Essenziell für konsistente Assets|
|**Editierbarkeit**|Erfordert Umschreiben ganzer Sätze|Modulare Parameter-Updates|Einfache "Tweak & Regenerate" Workflows|
|**Maschinenlesbarkeit**|Schwierig programmatisch zu parsen|Nativ für moderne Software-Stacks|Direkte API-Payload-Kompatibilität|
|**Primärer Anwendungsfall**|Ideation, Hobby-Nutzung|Produktionspipelines, API-Integration|Fokus auf professionelle User ("Pro")|

---

## 3. Tiefenanalyse: Nano Banana Pro (Gemini 3 Architektur)

Der Begriff **"Nano Banana Pro"** referenziert in der aktuellen Forschungslandschaft eine hochspezialisierte Implementierung des **Google Gemini 3 Pro Image** Modells. Im Gegensatz zu reinen Diffusionsmodellen zeichnet sich diese Architektur durch einen integrierten **"Thinking Process"** aus – einen internen Reasoning-Schritt, bei dem das Modell die Bildkomposition plant, bevor die eigentliche Pixelgenerierung beginnt. Diese Architektur ist für strukturierte Inputs prädestiniert.

### 3.1. Architektonische Fähigkeiten und Reasoning

Die Überlegenheit von Nano Banana Pro in der Verarbeitung von JSON-Prompts resultiert aus seiner multimodalen Transformer-Basis, die nicht nur Text-zu-Bild-Mapping betreibt, sondern ein tiefes semantisches Verständnis der Instruktionslogik besitzt.

- **Reasoning Engine:** Während Standard-Diffusionsmodelle Text-Token direkt auf Rauschvorhersagen abbilden, generiert Gemini 3 Pro (Nano Banana Pro) zunächst einen internen "Bauplan" der Szene. Dies ermöglicht das Verständnis komplexer räumlicher Beziehungen (z.B. "Die Katze ist _unter_ dem Tisch, welcher _hinter_ dem Stuhl steht"), die in einer JSON-Struktur definiert sind.
    
- **Search Grounding (Real-World Knowledge):** Eine herausragende Eigenschaft ist die Fähigkeit, auf Weltwissen via Google Search zuzugreifen. Ein JSON-Key wie `"context": "historical accurate 19th-century Parisian street lamp"` löst einen Retrieval-Augmented Generation (RAG) Prozess aus, der sicherstellt, dass die visuellen Details faktisch korrekt sind, anstatt nur ästhetisch plausibel zu wirken.
    
- **Text Rendering:** Das Modell exzelliert in der Generierung von lesbarem Text innerhalb von Bildern, was historisch eine Schwachstelle bildgebender KIs war. Dies wird über spezifische JSON-Keys für Typografie und Layout gesteuert, die das Modell als strikte Anweisungen für die Pixelplatzierung interpretiert.
    

### 3.2. Das Nano Banana Pro JSON Schema

Die Analyse der "Best Practices" aus der Advanced-User-Community zeigt, dass sich ein standardisiertes **"Mega-Prompt" JSON Schema** etabliert hat. Dieses Schema sollte als Standarddatenmodell für die geplante Plattform dienen.

#### 3.2.1. Definition des Kernschemas

Das Schema unterteilt sich in vier primäre Blöcke: **Meta**, **Subject** (Subjekt), **Environment** (Umgebung) und **Technical** (Technische Parameter).

JSON

```
{
  "meta": {
    "version": "nb-pro-v2",
    "task": "commercial_product_shot",
    "label": "luxury-perfume-campaign-01"
  },
  "subject": {
    "main_entity": "perfume bottle",
    "material": "translucent amber glass",
    "details": ["gold filigree stopper", "embossed logo reading 'ELEGANCE'"],
    "position": "center frame",
    "pose": "standing upright on reflective surface"
  },
  "environment": {
    "setting": "marble countertop",
    "elements": ["scattered rose petals", "droplets of water"],
    "background": "blurred luxury bathroom interior",
    "lighting_interaction": "specular highlights on glass"
  },
  "technical": {
    "lighting": {
      "type": "softbox",
      "direction": "top-left",
      "color_temp": "4500K",
      "shadows": "soft diffusion"
    },
    "camera": {
      "lens": "85mm macro",
      "aperture": "f/2.8",
      "focus": "sharp on bottle label",
      "sensor": "full-frame digital"
    },
    "style": "photorealistic, 8k resolution, high dynamic range, commercial photography"
  }
}
```

#### 3.2.2. Kritische Schlüssel und ihre Funktionen

- **`Subject` vs. `Background`:** Die explizite Trennung stellt sicher, dass komplexe Texturen des Subjekts (z.B. "Filigranarbeit") nicht in den Hintergrund "bluten". Das Modell verarbeitet diese Blöcke separat in seiner Aufmerksamkeitsmaske.
    
- **`ColorRestriction`:** Ein spezialisierter Key, der in fortgeschrittenen Workflows beobachtet wurde , erzwingt eine strikte Farbpalette. Dies ist kritisch für Corporate Identity (CI) Konformität.
    
- **`Arrangement`:** Beschreibt die räumliche Logik der Szene. Die Reasoning-Engine von Nano Banana Pro nutzt diesen Parameter, um Objekte im virtuellen Raum zu platzieren, bevor das Rendering beginnt.
    

### 3.3. API-Integration und Kommerzielle Nutzung

Für die Plattformintegration ist die Kommunikation mit der Google Vertex AI oder Gemini API erforderlich. Da "Nano Banana Pro" ein Synonym für das Gemini 3 Pro Image Modell ist, gelten folgende technische Spezifikationen:

- **Endpoint:** `POST /v1alpha/models/gemini-3-pro-image-preview:generateContent`.
    
- **Payload Struktur:** Der JSON-Prompt wird typischerweise als String innerhalb des `text`-Parts des Content-Payloads übergeben. Alternativ kann ein vorgeschaltetes LLM (der "Orchestrator") den JSON-Prompt in eine für das Modell optimierte natürliche Beschreibung parsen, falls die spezifische API-Version rohe JSON-Objekte nicht nativ unterstützt. Neuere Versionen von Gemini 3 zeigen jedoch ein hohes natives Verständnis für JSON-Syntax.
    
- **Kostenkontrolle:** Die Plattform sollte Caching-Mechanismen implementieren, da API-Aufrufe für hochauflösende Bilder (4K) kostenintensiv sein können. Gleiche JSON-Prompts sollten zwischengespeicherte Ergebnisse liefern.
    

---

## 4. Das Flux 2 Ökosystem und Strukturierte Inputs

**Flux 2** (entwickelt von Black Forest Labs) repräsentiert den aktuellen "State-of-the-Art" im Bereich der Open-Weights Bildgenerierung und konkurriert direkt mit proprietären Modellen wie Midjourney. Für die geplante Plattform ist Flux 2 besonders relevant, da es offiziell **strukturierte Prompts** unterstützt und lokal (bzw. auf eigenen Cloud-GPU-Clustern) betrieben werden kann, was Datenschutz und Kostenkontrolle begünstigt.

### 4.1. Flux 2 JSON Schema

Im Gegensatz zu Nano Banana Pro nutzt Flux 2 ein flacheres, aber ebenso deskriptives Schema, das in Community-Guides und offiziellen API-Referenzen dokumentiert ist.

**Beispielhaftes Flux 2 Schema:**

JSON

```
{
  "scene": "A cyberpunk street market at night",
  "subjects": [
    {
      "type": "cyborg vendor",
      "action": "serving noodles",
      "position": "foreground left",
      "attributes": "mechanical arm, neon apron"
    },
    {
      "type": "customer",
      "description": "wearing a holographic cloak",
      "position": "foreground right"
    }
  ],
  "style": {
    "aesthetic": "neon-noir",
    "medium": "digital painting",
    "artist_reference": "Syd Mead",
    "color_palette": ["#FF00FF", "#00FFFF", "#000000"]
  },
  "technical": {
    "aspect_ratio": "21:9",
    "camera": {
        "lens": "35mm anamorphic",
        "aperture": "f/1.8"
    }
  }
}
```

**Wichtige Erkenntnis:** Flux 2 legt einen starken Fokus auf das **`subjects`**-Array. Während ältere Modelle (wie SD 1.5 oder SDXL) oft scheiterten, wenn mehrere Subjekte in einem Prompt genannt wurden (z.B. Verschmelzung zu einem Hybriden), kann der **T5-XXL Text Encoder** von Flux 2 distinkte Entitäten, die im JSON-Array definiert sind, sauber trennen und verschiedenen räumlichen Regionen im Bild zuordnen.

### 4.2. Implementierung in ComfyUI

Für die Plattformintegration ist die Nutzung von Flux 2 via **ComfyUI** der optimale Open-Source-Pfad. ComfyUI bietet eine graph-basierte Node-Architektur, die sich hervorragend für die Verarbeitung strukturierter Daten eignet.

- **Node Architektur:** Die Plattform muss benutzerdefinierte Nodes (Custom Nodes) nutzen oder entwickeln. Existierende Lösungen wie `ComfyUI-PromptJSON` oder `ComfyUI-JSON-Prompt` können eingehende JSON-Blobs parsen und die Werte an die entsprechenden CLIP-Encoder verteilen.
    
- **Workflow-Logik:**
    
    1. **Input:** JSON-String von der Plattform-API.
        
    2. **Parser Node:** Zerlegt das JSON in Strings: `subject_string`, `style_string`, `camera_string`.
        
    3. **Concatenator:** Verbindet diese Strings mit spezifischen Delimitern (z.B. `BREAK` oder `|`), die vom Flux Text-Encoder für das Conditioning benötigt werden.
        
    4. **Generierung:** Übergabe des konkatenierten Prompts an den `CLIPTextEncode` Node (Dual Encoding mit T5 und CLIP-L).
        

### 4.3. Flux 2 vs. Automatic1111 (A1111)

Während **Automatic1111** (SD WebUI) lange der Standard war, zeigt sich für komplexe JSON-Workflows eine klare Präferenz für ComfyUI.

- **Automatic1111:** Unterstützt JSON-Prompts primär über Erweiterungen. Die Architektur ist monolithischer und weniger flexibel für komplexe Datenflüsse (z.B. das Routing spezifischer JSON-Werte an unterschiedliche Modell-Komponenten).
    
- **ComfyUI:** Die Node-basierte Struktur ist inhärent kompatibel mit der Logik von JSON. Daten können fließen, transformiert und aufgeteilt werden. Für die geplante Plattform, die "unter der Haube" komplexe Logik abwickeln soll, ist ComfyUI als Backend-Engine (Headless Mode) deutlich überlegen.
    

---

## 5. Vision-Language Models für die "Bild-zu-JSON" Pipeline

Ein kritisches Feature der geplanten Plattform ist die **"Bild-zu-JSON"**-Funktionalität: Das Reverse-Engineering eines Prompts aus einem existierenden Bild. Hierbei ist **DeepSeek Janus Pro** der aktuelle Technologieführer im Open-Source-Bereich.

### 5.1. DeepSeek Janus Pro Architektur

Janus Pro nutzt eine Strategie der **entkoppelten visuellen Encodierung**. Es trennt die Pfade für visuelles Verständnis (Visual Understanding) und Bildgenerierung. Für das Verständnis nutzt es den **SigLIP-L Encoder**, der eine signifikant höhere Detailgenauigkeit als klassische CLIP-Modelle bietet. Dies erlaubt Janus Pro, als hochpräziser "Beschreiber" zu fungieren, ohne die bei Standard-Multimodal-LLMs üblichen Halluzinationen.

### 5.2. Workflow: Bild-Interrogation und Schema-Extraktion

Um das "Bild-zu-JSON"-Feature zu bauen, wird folgender Workflow empfohlen:

1. **Ingestion:** Der Nutzer lädt ein Referenzbild auf die Plattform hoch.
    
2. **Analyse:** Das Bild wird an eine Instanz von Janus Pro (7B Variante empfohlen für Balance aus Qualität/Geschwindigkeit) gesendet. Dies kann über eine ComfyUI-API erfolgen, die den `JanusProImageUnderstanding`-Node nutzt.
    
3. **Prompt Engineering (Reverse):** Das System promptet Janus Pro mit einer spezifischen Instruktion: _"Analysiere dieses Bild und generiere ein JSON-Objekt, das Subjekt, Beleuchtung, Kamera und Stil beschreibt. Nutze folgendes Schema: {... }"_.
    
4. **Validierung:** Da Janus Pro ein VLM ist, kann der Output gelegentlich syntaktische Fehler enthalten. Ein nachgeschalteter kleinerer LLM (z.B. Qwen 2.5 Coder) sollte das JSON validieren und korrigieren (siehe Abschnitt 6).
    
5. **Output:** Die Plattform erhält ein valides JSON-Objekt, das die visuellen Elemente des hochgeladenen Bildes repräsentiert und sofort editierbar ist.
    

---

## 6. LLM-Übersicht: Die Orchestrierungs-Schicht

Um die Lücke zwischen einer vagen Nutzeridee (oder einem analysierten Bild) und den strikten JSON-Schemata der Generatoren zu schließen, ist ein intermediärer "Translator LLM" (Orchestrator) erforderlich. Dieser Abschnitt evaluiert LLMs, die für strikte JSON-Adhärenz optimiert sind.

### 6.1. Auswahlkriterien für JSON-Optimierte LLMs

- **Instruktionsbefolgung:** Das Modell muss komplexe Schemata ohne Abweichung einhalten.
    
- **JSON-Validität:** Es muss syntaktisch korrektes JSON produzieren (keine fehlenden Klammern, korrekte Escape-Sequenzen).
    
- **Effizienz:** Hoher Durchsatz für Echtzeit-Interaktionen auf der Plattform.
    

### 6.2. Empfohlene Open Source LLMs (Landschaft 2025/2026)

|**Modell Name**|**Parameter**|**Stärken für JSON-Plattform**|**Hardware (Lokal)**|
|---|---|---|---|
|**Qwen 2.5 (Coder/Instruct)**|7B / 14B / 32B|Aktueller "Gold Standard" für strukturierten Output; übertrifft oft größere Modelle in Coding/Schema-Tasks.|16GB - 24GB VRAM|
|**Mistral 7B v0.3 / Small**|7B|Nativ unterstützt "Function Calling"; hochoptimiert für JSON-Modi. Sehr schnell und effizient.|8GB - 12GB VRAM|
|**Llama 3.2**|3B / 11B|Optimiert für Edge-Deployment; exzellent für schnelle "Quick Prompt"-Features auf der Plattform.|4GB - 8GB VRAM|
|**DeepSeek V3**|67B (MoE)|Beste Wahl für komplexe "Reasoning"-Tasks, wo das JSON kreative Expansion aus einer einfachen Nutzerintention erfordert.|Multi-GPU / Cloud|

### 6.3. Durchsetzung von JSON-Validität: Grammars & Constrained Sampling

Um 100% Zuverlässigkeit in der Plattform zu garantieren, darf man sich nicht allein auf das Training des LLMs verlassen. Die Plattform muss **Grammar-Based Sampling** implementieren.

- **Llama.cpp & GBNF:** Durch die Definition einer GBNF (GGML BNF) Grammatik-Datei, die das JSON-Schema beschreibt, _zwingt_ die Inferenz-Engine (llama.cpp) das LLM dazu, nur Token zu wählen, die dem Schema entsprechen. Dies garantiert syntaktisch perfektes JSON bei jedem Aufruf, unabhängig von der Temperature-Einstellung des Modells.
    
- **Implementierung:** Das Backend der Plattform sollte `llama-cpp-python` nutzen und für jedes Schema (Nano Banana, Flux) eine korrespondierende `.gbnf`-Datei vorhalten.
    

---

## 7. Plattform-Architektur und Implementierungs-Leitfaden

Dieser Abschnitt detailliert die technische Konstruktion der **"Text/Bild zu JSON und Prompt-Verwaltung"** Plattform.

### 7.1. Systemarchitektur-Diagramm

Die Plattform besteht aus drei Hauptschichten:

1. **Frontend (React/Next.js):** Benutzeroberfläche für Texteingabe oder Bildupload sowie ein visueller "Prompt Builder", der die JSON-Keys als Formularfelder rendert.
    
2. **Orchestration Backend (Python/FastAPI):**
    
    - **Manager:** Verwaltet Nutzer-Authentifizierung und Credits.
        
    - **Prompt Engine:** Führt den Orchestrator LLM (z.B. Qwen 2.5 via vLLM oder Ollama) aus, um Inputs in JSON zu konvertieren.
        
    - **Prompt Management System:** Integriert **Agenta** oder **Langfuse** für Versionierung und Deployment.
        
3. **Generation Backend:**
    
    - **Externe API:** Google Vertex AI (für Nano Banana Pro).
        
    - **Lokaler/Cloud Cluster:** ComfyUI-Instanz (für Flux 2 & Janus Pro).
        

### 7.2. Prompt Management Integration

Das Management der komplexen JSON-Schemata und ihrer Versionen ist das zentrale Wertversprechen der Plattform.

#### 7.2.1. Agenta (Open Source)

**Agenta** wird als primäre Open-Source-Lösung für diese Plattform empfohlen.

- **Warum Agenta?** Es ist spezifisch für LLMOps und Prompt Engineering entwickelt. Es erlaubt die Trennung der _Prompt-Logik_ vom _Applikations-Code_.
    
- **Workflow:**
    
    - Erstellen einer "Prompt Variant" in Agenta für das Flux-Schema.
        
    - Erstellen einer separaten Variante für das Nano Banana Schema.
        
    - Das Plattform-Backend ruft Agenta via SDK (`ag.generate()`) auf, um die neueste Version des System-Prompts zu laden, der das LLM instruiert, wie das JSON zu formatieren ist.
        
    - Nicht-technische Teammitglieder können die "System Instructions" im Agenta UI anpassen, um die JSON-Qualität zu verbessern, ohne das Backend neu deployen zu müssen.
        

#### 7.2.2. Langfuse (Observability)

**Langfuse** sollte für Tracing und Monitoring integriert werden. Wenn ein Nutzer eine "Schlechte Bildgenerierung" meldet, erlaubt Langfuse dem Admin, den Request zurückzuverfolgen:

- _Schritt 1:_ Nutzer-Input (Text oder Bild).
    
- _Schritt 2:_ LLM JSON Output (War das JSON valide? War es inhaltlich korrekt?).
    
- _Schritt 3:_ Bildgenerierungs-Metadaten (Seed, Steps).
    
    Diese End-to-End Sichtbarkeit ist entscheidend für das Debugging komplexer strukturierter Prompt-Pipelines.
    

### 7.3. ComfyUI Integrations-Strategie

Um ComfyUI effizient von der Plattform aus zu steuern:

1. **API Modus:** ComfyUI verfügt über eine native Websocket API. Das Plattform-Backend speichert den Workflow als JSON-Struktur (das "API Format" in ComfyUI).
    
2. **Dynamische Injektion:** Das Backend lädt das Workflow-Template und injiziert die generierten JSON-Werte in die spezifischen Node-IDs (z.B. Node 6 für "Positive Prompt", Node 10 für "Seed").
    
3. **Custom Nodes:**
    
    - **`ComfyUI-PromptJSON`:** Installation dieses Custom Nodes, um ComfyUI zu ermöglichen, rohe JSON-Strings zu akzeptieren und intern zu parsen. Dies vereinfacht die Injektion erheblich.
        

### 7.4. Datenbankschema für Prompt-Speicherung

Die Datenbank (PostgreSQL empfohlen) sollte Prompts nicht als Strings, sondern als `JSONB`-Objekte speichern, um Abfragen nach Attributen zu ermöglichen.

SQL

```
CREATE TABLE prompts (
    id UUID PRIMARY KEY,
    user_id UUID,
    model_type VARCHAR(50), -- 'nano_banana_pro' oder 'flux_2'
    prompt_data JSONB,      -- Das volle strukturierte Prompt
    created_at TIMESTAMP,
    generation_metadata JSONB -- Seed, Steps, CFG, etc.
);

-- Beispiel-Query: Finde alle Prompts, wo die Beleuchtung 'neon' ist
SELECT * FROM prompts WHERE prompt_data->'technical'->>'lighting' LIKE '%neon%';
```

---

## 8. Implementierungsplan (Schritt-für-Schritt)

### Phase 1: Das "Gehirn" (LLM & Schemata)

1. **Schemata Definieren:** Finalisierung der JSON-Schemata für Nano Banana Pro und Flux 2 basierend auf den Beispielen in Abschnitt 3 und 4.
    
2. **LLM Setup:** Deployment von Qwen 2.5-Coder-32B mittels **Ollama** oder **vLLM**.
    
3. **Grammatiken Entwickeln:** Schreiben von `.gbnf` Grammatik-Dateien für `llama.cpp`, die diese Schemata strikt durchsetzen.
    

### Phase 2: Die "Augen" (Visuelle Analyse)

1. **Janus Pro Deployment:** Aufsetzen einer ComfyUI-Instanz mit den `ComfyUI-Janus-Pro` Nodes.
    
2. **Workflow Erstellung:** Bauen eines "Vision-to-JSON" Workflows in ComfyUI, der ein Bild nimmt und Text ausgibt.
    
3. **Output-Veredelung:** Weiterleitung des Text-Outputs von Janus Pro in den Orchestrator LLM, um ihn in das strikte JSON-Schema der Phase 1 zu formatieren.
    

### Phase 3: Die Plattform (Frontend & Management)

1. **Agenta Setup:** Self-Hosting von Agenta. Erstellung der System-Prompts, die das LLM anleiten, das JSON zu generieren.
    
2. **Backend Logik:** Entwicklung der Python-Logik, die Nutzer-Input empfängt, Agenta/LLM für JSON aufruft und dieses JSON dann entweder an die Google Gemini API (Nano Banana) oder die ComfyUI API (Flux) dispatcht.
    
3. **UI Konstruktion:** Bau des "Visual Prompt Builders", der Formularfelder dynamisch basierend auf dem JSON-Schema des gewählten Modells generiert.
    

---

## 9. Insights und Zukunftsausblick

Die Recherchen deuten auf einen konvergierenden Trend hin, bei dem **Prompt Engineering zu Software Engineering wird**. Der Übergang zu JSON ist nicht rein syntaktisch; er ist eine funktionale Voraussetzung für die Integration von Generativer KI in komplexe, multimodale Softwaresysteme.

**Schlüsselerkenntnis:** Die "Nano Banana Pro" (Gemini 3) Modelle sind Vorreiter des **"Agentic Imaging"**. Indem sie einen "Thinking"-Prozess exponieren und strukturierte Daten akzeptieren, verschieben sie den "Prompt" von einer kreativen Beschreibung hin zu einem Satz von _Constraints_ (Beschränkungen) und _Parametern_. Dies impliziert, dass zukünftige Iterationen dieser Plattform ganze Kampagnen automatisieren könnten – beispielsweise die Generierung von 100 Variationen eines Produktfotos, indem algorithmisch durch eine JSON-Liste von Hintergrundumgebungen iteriert wird, ganz ohne manuelles Prompting.

**Empfehlung:** Für die Plattform des Nutzers sichert die Priorisierung von **offenen Standards** (wie dem Flux 2 Schema) neben proprietären (Gemini) die Langlebigkeit. Durch die Nutzung eines Orchestrator LLMs (Qwen/Mistral) als Middleware-Schicht bleibt die Plattform agnostisch gegenüber dem zugrundeliegenden Bildgenerator und ist "Future-Proof" gegen den rapiden Wandel der State-of-the-Art Modelle.

---

## 10. Detaillierte Modellspezifikation & Konfiguration

### 10.1. Nano Banana Pro (Gemini 3 Pro) Konfigurationsdetails

Das Verständnis der spezifischen Parameter der Nano Banana Pro API ist entscheidend für die Konstruktion valider JSON-Prompts. Das Modell unterstützt eine Parametrisierung, die weit über einfachen Text hinausgeht.

- **Safety Settings:** Die API erlaubt granulare Sicherheitsblockaden. In einem JSON-Workflow sollten diese auf Plattform-Ebene gehandhabt werden, bevor der Request gesendet wird.
    
- **Aspect Ratios:** Native Unterstützung umfasst `1:1`, `3:2`, `4:3`, `16:9`, `21:9`. Im Gegensatz zu Flux, das beliebige Auflösungen handhaben kann, rasten Gemini-Modelle oft auf diese Presets ein, um optimale Kohärenz zu gewährleisten.
    
- **Thinking Process (Chain of Thought):** Die "Pro"-Variante nutzt einen verborgenen Reasoning-Schritt. Während Nutzer kein JSON _direkt_ in diesen Denkprozess injizieren können, beeinflusst die JSON-Struktur ihn. Ein verschachteltes JSON-Objekt wie `{"reasoning_guidance": {"focus": "composition_first"}}` kann vom Translator LLM geparst werden, um eine Präambel im Prompt zu generieren, die den "Gedankengang" des Modells effektiv lenkt.
    

### 10.2. Flux 2 & ComfyUI Node Graph Spezifika

Um Flux 2 JSON-Support in ComfyUI vollständig zu implementieren, muss der Node-Graph sorgfältig konstruiert werden, um die "T5" und "CLIP" Encoder separat zu behandeln.

- **Dual Encoding:** Flux 2 nutzt sowohl T5 (für komplexes Sprachverständnis) als auch CLIP (für visuelle Ästhetik).
    
- **JSON Routing:**
    
    - Text aus den JSON-Keys `{"scene": "..."}` und `{"action": "..."}` sollte an den **T5 Encoder** geleitet werden.
        
    - Text aus den Keys `{"style": "..."}` und `{"aesthetic": "..."}` sollte an den **CLIP Encoder** geleitet werden.
        
    - Diese "Split Prompting" Technik verbessert die Einhaltung von Stil und Inhalt drastisch.
        

**Tabelle: Routing von JSON-Keys zu Flux Encodern**

|**JSON Key Kategorie**|**Flux Encoder Komponente**|**Begründung**|
|---|---|---|
|**Subject / Action**|T5-XXL|T5 bewältigt komplexe Satzstrukturen und räumliche Beziehungen.|
|**Scene / Context**|T5-XXL|Erfordert Verständnis von Weltwissen und Setting.|
|**Style / Medium**|CLIP-L|CLIP ist exzellent im Erkennen von artistischen Tags und Ästhetik-Deskriptoren.|
|**Lighting / Color**|CLIP-L + T5-XXL|Hybrides Routing; T5 für deskriptives Licht ("volumetric"), CLIP für Stil ("neon").|
|**Camera Settings**|T5-XXL|Technischer Jargon wird oft besser vom großen Sprachmodell geparst.|

---

## 11. Strategische Implementierung des Prompt Managements

### 11.1. Die Rolle von Agenta im Stack

Agenta positioniert sich als "Git für Prompts". Im Kontext dieser Plattform erfüllt es einen doppelten Zweck:

1. **Versionskontrolle:** Jede Änderung am JSON-Schema oder am System-Prompt, der es generiert, wird versioniert. Wenn ein neues Modell-Update die Prompt-Struktur bricht, kann die Plattform sofort auf eine stabile Version zurückrollen.
    
2. **Evaluation:** Agenta erlaubt "A/B Testing" von Prompts. Man kann 50 Bilder mit "Schema A" und 50 mit "Schema B" generieren und menschlichen Bewertern (oder einem Auto-Evaluator LLM) vorlegen, um zu bestimmen, welche Struktur bessere "Nano Banana" Output-Qualität liefert.
    

### 11.2. Bau des "Translator" System Prompts

Das Kern-IP der Plattform des Nutzers wird wahrscheinlich der **System Prompt** sein, den das Orchestrator LLM nutzt, um Nutzertext in JSON zu konvertieren. Dieser Prompt muss rigoros engineered sein.

**Beispiel System Prompt (für Qwen 2.5):**

> "Du bist ein spezialisierter JSON-Architekt für Generative KI. Dein Ziel ist es, Nutzerbeschreibungen in ein valides JSON-Objekt zu übersetzen, das dem 'Nano Banana Pro' Schema entspricht.
> 
> Regeln:
> 
> 1. EXTRAHIERE jedes visuelle Detail.
>     
> 2. INFERIERE fehlende technische Details (z.B., wenn der Nutzer 'cinematisch' sagt, inferiere '85mm lens', 'f/1.8').
>     
> 3. TRENNE Subjekte von Hintergründen, um Bleeding zu verhindern.
>     
> 4. OUTPUT nur rohes JSON, keine Markdown-Formatierung."
>     

Dieser System-Prompt würde innerhalb von Agenta verwaltet, was es Nicht-Entwicklern erlaubt, die "Inferenz-Regeln" (Regel 2) anzupassen, ohne die Python-Codebasis zu berühren.

### 11.3. Umgang mit "Multi-Turn" JSON Editing

Ein einzigartiges Feature von Nano Banana Pro ist das "Multi-turn editing". Die Plattform kann dies unterstützen, indem sie eine **Konversationshistorie** des JSON-Status pflegt.

- _Turn 1:_ Nutzer: "Eine Katze auf einer Kiste." -> System generiert JSON V1.
    
- _Turn 2:_ Nutzer: "Mach die Kiste rot." -> System nimmt JSON V1, aktualisiert `{"environment": {"objects": [{"name": "box", "color": "red"}]}}` -> Generiert JSON V2.
    
- Dieses Zustandsmanagement wird am besten durch die Backend-Logik gehandhabt, wobei jeder JSON-Status in der Datenbank-Tabelle `prompts` gespeichert und über eine `session_id` verknüpft wird.
    

---

## 12. Fazit und Finale Empfehlungen

Der Bau einer "Text/Bild zu JSON" Plattform stellt eine anspruchsvolle Integrationsaufgabe dar, die an der Speerspitze der Generativen KI liegt. Durch die Nutzung von **Nano Banana Pro** für hochauflösende, reasoning-basierte Generierung und **Flux 2** für kontrollierbares Open-Source Rendering kann die Plattform das gesamte Spektrum von kommerzieller Produktion bis hin zu kreativer Exploration abdecken.

Die Nutzung von **JSON Prompting** ist die Schlüsseltechnologie, die dies von einem "Spielzeug" in ein "Werkzeug" verwandelt. Sie ermöglicht die Systematisierung von Kreativität, wodurch Workflows entstehen, in denen Brand Guidelines, technische Beschränkungen und künstlerischer Stil rigoros durchgesetzt werden können.

**Finale Empfehlungen für den Nutzer:**

1. **Start mit Flux 2 & ComfyUI:** Dies bietet die niedrigste Einstiegshürde und höchste Flexibilität. Die `ComfyUI-PromptJSON` und `Janus-Pro` Nodes sind heute verfügbar und lizenzkostenfrei.
    
2. **Frühe Adoption von Agenta:** Keine Hardcodierung von Prompts. Die Integration von Agenta ab Tag 1 spart hunderte Stunden Debugging und erlaubt dem "Prompt Engineering" Team, unabhängig vom "Software Engineering" Team zu arbeiten.
    
3. **Fine-Tuning eines kleinen LLMs:** Für den "Translator" liefert das Fine-Tuning eines kleinen Modells wie **Llama 3.2 3B** oder **Qwen 2.5 7B** spezifisch auf einem Datensatz von "Beschreibung -> JSON" Paaren bessere Ergebnisse und geringere Latenz als die Nutzung eines riesigen General-Purpose-Modells.
    
4. **Monitoring der "Nano Banana" API:** Da Gemini 3 ein sich schnell entwickelndes Produkt ist, sollte die Plattformarchitektur modular genug sein, um die JSON-Schema-Mappings zu aktualisieren, ohne das Frontend-UI zu brechen.
    

Durch Befolgung dieses Architektur-Blueprints kann die Zielplattform den Status eines führenden Hubs für strukturierte, professionelle KI-Bildgenerierung erreichen.
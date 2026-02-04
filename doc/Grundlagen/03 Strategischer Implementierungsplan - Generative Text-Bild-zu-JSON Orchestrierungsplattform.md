# Strategischer Implementierungsplan: Generative Text/Bild-zu-JSON Orchestrierungsplattform

## 1. Executive Summary und Strategischer Kontext

Die Landschaft der generativen künstlichen Intelligenz hat sich in den letzten 24 Monaten radikal gewandelt. Während die erste Welle der Adoption durch einfache, natürlichsprachliche Eingabeaufforderungen („Prompts“) geprägt war, stoßen professionelle Anwender in Unternehmensumfeldern nun an die Grenzen dieser stochastischen Methoden. Modelle wie **Nano Banana Pro** (basierend auf Gemini 3 Pro Image) und **Wan 2.6** bieten zwar theoretisch fotorealistische Kontrolle und zeitliche Kohärenz in Videos, die praktische Ansteuerung über unstrukturierte Textblöcke führt jedoch oft zu dem Phänomen des „Concept Bleeding“ – dem ungewollten Überlaufen von Attributen eines Objekts auf ein anderes.

Um diese Lücke zwischen menschlicher Intention und maschineller Präzision zu schließen, ist die Entwicklung einer dedizierten **Text/Bild-zu-JSON Middleware-Plattform** erforderlich. Diese Plattform fungiert als deterministischer Übersetzer, der vage Konzepte in rigoros validierte JSON-Schemata (JavaScript Object Notation) transformiert. Durch die Nutzung strukturierter Datenformate wird die Kontrolle über Beleuchtung, Kameraparameter, Subjektkonsistenz und zeitliche Abläufe in der Videogenerierung von einem Glücksspiel zu einem ingenieurtechnischen Prozess.

Dieser Bericht legt einen umfassenden, phasenbasierten Implementierungsplan vor. Er beginnt mit einem **Minimum Viable Product (MVP)**, das sich auf die Stabilisierung statischer Bildgenerierung für Nano Banana Pro und Z-Image Turbo konzentriert. Darauf folgt die **Version 1.0**, die visuelle Analysefähigkeiten („Reverse Engineering“ von Bildern) und Midjourney-Integration einführt. Abschließend werden die **Ausbaustufen** detailliert, die komplexe Video-Orchestrierung für Wan 2.6 und die Automatisierung von ComfyUI-Workflows umfassen.

---

## 2. Technische Architekturphilosophie und Kerntechnologien

Bevor die spezifischen Phasen definiert werden, muss das technologische Fundament geklärt werden. Die Plattform wird nicht als monolithische Applikation, sondern als modularer Orchestrator konzipiert, der sich stark auf die Trennung von „Semantic Parsing“ (Verstehen der Absicht) und „Schema Enforcement“ (Erzwingen der Struktur) stützt.

### 2.1 Das Middleware-Paradigma

Die Kernaufgabe der Plattform ist die Transformation von Unschärfe in Struktur. LLMs (Large Language Models) sind von Natur aus probabilistisch. Um sie für ingenieurtechnische Aufgaben nutzbar zu machen, muss ihre Ausgabe durch Validierungsbibliotheken gezwungen werden.

|**Komponente**|**Technologie-Wahl**|**Begründung und Insight**|
|---|---|---|
|**Backend-Framework**|Python (FastAPI)|Python ist die Lingua Franca der KI-Entwicklung. FastAPI bietet asynchrone Performance und native Unterstützung für Pydantic, was für die JSON-Validierung essenziell ist.|
|**LLM-Orchestrierung**|Instructor / Pydantic|Anstatt auf reine Prompt-Engineering-Tricks zu setzen, nutzt die Plattform die `Instructor`-Bibliothek, um LLMs als Funktionsaufrufe zu behandeln. Dies garantiert, dass der Output _immer_ dem definierten Schema entspricht.|
|**Frontend-UI**|React.js + React Flow|Für das MVP genügt eine Formularansicht. Für spätere Phasen (V1.0/Expansion) ist eine knotenbasierte Darstellung (Node Editor) zwingend, um komplexe Abhängigkeiten wie in ComfyUI oder Video-Timelines zu visualisieren.|
|**Vektordatenbank**|Qdrant / Pinecone|Notwendig für RAG (Retrieval Augmented Generation), um dem LLM Wissen über tausende ComfyUI-Nodes oder spezifische Kameraparameter bereitzustellen, ohne das Kontextfenster zu sprengen.|

### 2.2 Das Problem des "Concept Bleeding"

Ein zentrales technisches Problem, das diese Plattform löst, ist das „Verschmieren“ von Attributen. Wenn ein Nutzer „ein blaues Auto vor einem roten Haus“ anfordert, neigen Diffusionsmodelle dazu, Blau und Rot zu vermischen. Durch die Kapselung in JSON-Objekte wie `{"subject": {"color": "blue"}, "background": {"color": "red"}}` wird diese Ambiguität auf Token-Ebene für das generierende Modell (z.B. Nano Banana Pro) aufgelöst.

---

## 3. Phase I: Minimum Viable Product (MVP)

**Zielsetzung:** Bereitstellung eines funktionstüchtigen "Text-zu-JSON"-Konverters, der die Modelle **Nano Banana Pro** und **Z-Image Turbo** unterstützt und die Fehlerrate bei der Bildgenerierung durch strukturierte Prompts drastisch reduziert.

### 3.1 MVP Scope Definition

Das MVP konzentriert sich ausschließlich auf die _Vorwärtsrichtung_: Text rein, JSON raus. Es werden noch keine Bilder analysiert (Vision) und keine Videos generiert. Der Fokus liegt auf der Erstellung valider Schemata, die sofort in die APIs von Google (Gemini) oder lokalen Stable Diffusion Systemen kopiert werden können.

#### Kernfunktionen:

1. **Natural Language Processing (NLP) Engine:** Konvertierung freier Texteingaben in strikte JSON-Profile.
    
2. **Schema-Bibliothek:** Unterstützung für zwei primäre Modelle mit unterschiedlichen Anforderungen:
    
    - _Nano Banana Pro:_ Erfordert tiefe Verschachtelung (Kamera, Licht, Materialität).
        
    - _Z-Image Turbo:_ Ein auf Geschwindigkeit optimiertes Modell (8 Steps), das keine negativen Prompts unterstützt und daher spezielle "Safety-Injections" im positiven Prompt benötigt.
        
3. **Prompt-Management:** Speichern, Bearbeiten und Versionieren von JSON-Ausgaben.
    
4. **Export-Hilfen:** "Copy to Clipboard"-Funktionen, formatiert für spezifische Interfaces (z.B. Gemini Chat vs. API Payload).
    

### 3.2 Detaillierte Aufgabenpakete (Tasks)

#### 3.2.1 Modul A: Infrastruktur & Backend-Core

Dieses Modul legt das Fundament für die Datenintegrität und API-Sicherheit.

- **Task A1: Repository & CI/CD Setup**
    
    - _Beschreibung:_ Einrichtung eines Monorepos (Frontend/Backend). Konfiguration von GitHub Actions für automatisiertes Testing der Pydantic-Modelle.
        
    - _Insight:_ Da sich API-Spezifikationen von Modellen wie Nano Banana schnell ändern, müssen Unit-Tests sicherstellen, dass generierte JSONs auch nach Schema-Updates valide bleiben.
        
- **Task A2: Datenbank-Design für strukturierte Prompts**
    
    - _Beschreibung:_ Implementierung eines PostgreSQL-Schemas.
        
    - _Felder:_ `user_id`, `original_text_prompt`, `generated_json` (JSONB-Datentyp für flexible Abfragen), `model_version` (z.B. "gemini-3-pro"), `created_at`.
        
    - _Begründung:_ Die Speicherung als JSONB ermöglicht später analytische Abfragen wie "Zeige alle Prompts, die eine '85mm Linse' verwenden", was für Analytics-Dashboards wertvoll ist.
        
- **Task A3: Authentication Layer**
    
    - _Beschreibung:_ Integration von Supabase Auth oder OAuth2 (Google/GitHub Login).
        
    - _Requirement:_ Trennung von Free-Tier und Pro-Tier Nutzern auf Datenbankebene zur Vorbereitung der Monetarisierung.
        

#### 3.2.2 Modul B: Die "Translator" Engine (Logic Layer)

Das Herzstück der Anwendung. Hier wird die `Instructor`-Bibliothek genutzt, um LLMs zu zwingen, valides JSON zu sprechen.

- **Task B1: Definition des Nano Banana Schemas (Pydantic)**
    
    - _Beschreibung:_ Kodierung der Parameter aus in Python-Klassen.
        
    - _Struktur:_
        
        Python
        
        ```
        class NanoBananaProfile(BaseModel):
            label: str = Field(..., description="Kurzname")
            subject: SubjectBlock
            environment: EnvironmentBlock
            lighting: str = Field(..., description="Lichtquelle und Richtung")
            camera: CameraSettings
        ```
        
    - _Kritisches Detail:_ Implementierung des Feldes `MadeOutOf` im `SubjectBlock`. Dies ist essenziell, um Texturen explizit zu definieren (z.B. "Haut aus organischem Gewebe" vs. "Plastik"), da KI-Modelle dazu neigen, Oberflächen zu glätten.
        
- **Task B2: Definition des Z-Image Turbo Schemas**
    
    - _Beschreibung:_ Kodierung der Anforderungen für das Z-Image Modell.
        
    - _Insight:_ Z-Image Turbo ignoriert negative Prompts. Der Translator muss daher instruiert werden, Ausschlüsse positiv zu formulieren (z.B. statt "keine Nacktheit" -> "vollständig bekleidet", statt "unscharf" -> "kristallklarer Fokus").
        
- **Task B3: System-Prompt Engineering**
    
    - _Beschreibung:_ Entwicklung des System-Prompts für das LLM (z.B. GPT-4o-mini).
        
    - _Strategie:_ Nutzung von "Few-Shot Learning" im System-Prompt. Es werden 3 Beispiele von "Schlechtem Text" zu "Perfektem JSON" direkt in den Kontext injiziert, um dem Modell das gewünschte Abstraktionsniveau beizubringen.
        

#### 3.2.3 Modul C: User Interface (Frontend MVP)

Ein funktionales React-Frontend, das die Komplexität des JSON vor dem Nutzer verbirgt, aber volle Kontrolle ermöglicht.

- **Task C1: Split-View Editor**
    
    - _Beschreibung:_ Linke Spalte: Textfeld für User-Input. Rechte Spalte: JSON-Viewer (`react-json-view`).
        
    - _Interaktion:_ Änderungen im Textfeld triggern (mit Debounce) eine Neu-Generierung oder ein Update des JSONs.
        
- **Task C2: Parameter-Formular (No-Code View)**
    
    - _Beschreibung:_ Implementierung einer Schicht über dem rohen JSON. Nutzung von `react-jsonschema-form`, um aus dem Pydantic-Schema automatisch Dropdowns und Checkboxen zu generieren.
        
    - _Begründung:_ Viele Nutzer sind Kreative, keine Entwickler. Ein Dropdown für "Kameralinse: 35mm / 50mm / 85mm" ist intuitiver als das Editieren eines Strings im JSON.
        
- **Task C3: Export-Logik**
    
    - _Beschreibung:_ Button "Copy for Gemini".
        
    - _Logik:_ Das JSON muss als Code-Block formatiert in die Zwischenablage kopiert werden, da Gemini Chat-Interfaces dies für das Rendering benötigen.
        

---

## 4. Phase II: Version 1.0 – Visuelle Intelligenz & Ökosystem

**Zielsetzung:** Transformation der Plattform von einem reinen Text-Tool zu einem multimodalen Studio. Einführung von "Image-to-JSON" (Reverse Engineering) und Integration von **Midjourney**.

### 4.1 Version 1.0 Scope Definition

In V1.0 erhält die Plattform "Augen". Nutzer können Referenzbilder hochladen, deren Stil, Lichtsetzung und Komposition analysieren lassen und diese als JSON-Template speichern ("Style Stealing"). Zudem wird Midjourney integriert, das zwar kein natives JSON nutzt, aber durch Parameter-Mapping steuerbar wird.

#### Neue Features:

1. **Visual Reverse Engineering:** Upload eines Bildes -> Generierung eines Nano Banana JSON-Profils.
    
2. **Midjourney Translator:** Konvertierung von strukturiertem JSON in Midjourney-Suffixe (`--ar`, `--s`, `--iw`).
    
3. **Remix-Engine:** Kombination von "Stil aus Bild A" + "Subjekt aus Text B".
    

### 4.2 Detaillierte Aufgabenpakete (Tasks)

#### 4.2.1 Modul D: Computer Vision & Analyse

Hier werden Vision-Modelle (GPT-4o, Gemini 1.5 Pro) genutzt, um fotografische Attribute aus Pixeln zu extrahieren.

- **Task D1: Vision-Pipeline Implementierung**
    
    - _Beschreibung:_ Endpoint `/analyze-image` akzeptiert Base64-Strings.
        
    - _System-Prompt:_ "Analysiere dieses Bild wie ein professioneller Fotograf. Bestimme Brennweite, Blende, Lichtsetup (z.B. Rembrandt, Butterfly) und Materialität. Ignoriere den Inhalt, fokussiere auf die Machart."
        
    - _Insight:_ Einführung eines `thinking`-Feldes im JSON-Schema. Das Modell soll zuerst eine textuelle Analyse ("Gedankenkette") durchführen, bevor es die finalen JSON-Werte setzt. Studien zeigen, dass dies Halluzinationen bei Vision-Modellen signifikant reduziert.
        
- **Task D2: Style Transfer Logik ("Remix")**
    
    - _Beschreibung:_ Algorithmus zum Mergen zweier JSON-Objekte.
        
    - _Logik:_ Nimm `camera`, `lighting`, `style` aus JSON A (Bildquelle) und `subject`, `action` aus JSON B (Texteingabe). Das Ergebnis ist ein neues JSON C, das den Stil von A auf das Subjekt von B anwendet.
        

#### 4.2.2 Modul E: Midjourney Integration

Midjourney akzeptiert kein JSON, aber Profis benötigen die Präzision strukturierter Daten. Wir bauen einen "Cross-Compiler".

- **Task E1: Midjourney Parameter Mapper**
    
    - _Beschreibung:_ Erstellung einer Mapping-Tabelle.
        
    - _Mapping:_
        
        - JSON `aspect_ratio: "16:9"` -> String `--ar 16:9`
            
        - JSON `style_strength: "high"` -> String `--s 750`
            
        - JSON `weirdness: "medium"` -> String `--w 500`
            
    - _Quelle:_ Basierend auf der offiziellen Midjourney Parameter-Liste.
        
- **Task E2: Permutation Builder UI**
    
    - _Beschreibung:_ Unterstützung für Midjourneys Permutations-Feature (z.B. `{red, green}`).
        
    - _UI:_ Der Nutzer kann für ein Feld (z.B. "Farbe") mehrere Werte angeben. Das Backend generiert daraus den komplexen Permutations-String für Midjourney.
        

#### 4.2.3 Modul F: Erweitertes UI (Node Editor)

Mit steigender Komplexität (Remixing) reicht ein Formular nicht mehr aus. Wir führen einen Node-Graph ein.

- **Task F1: Integration von React Flow**
    
    - _Beschreibung:_ Implementierung der Library `@xyflow/react`.
        
    - _Komponenten:_ Erstellung von Custom Nodes: `InputNode` (Text/Bild), `ProcessorNode` (Style Extractor), `OutputNode` (JSON).
        
    - _UX:_ Nutzer ziehen Kabel von einem "Style Node" (Referenzbild) zu einem "Prompt Builder Node", um Attribute visuell zu verknüpfen. Dies macht den abstrakten Prozess des "Prompt Engineering" greifbar.
        

---

## 5. Ausbaustufen (Module): Video & Automation

**Zielsetzung:** Erschließung des High-End Marktes durch Unterstützung komplexer Videogenerierung (**Wan 2.6**) und Workflow-Automatisierung (**ComfyUI**).

### 5.1 Modul G: Video-Orchestrierung (Wan 2.6)

Video-KI erfordert eine vierte Dimension: Zeit. JSON ist prädestiniert, um Timelines und Szenenabfolgen zu definieren.

#### Scope:

Wan 2.6 unterstützt "Multi-Shot"-Generierung und Referenz-basierte Konsistenz. Die Plattform muss Drehbücher in Wan-kompatible JSON-Payloads übersetzen.

#### Tasks:

- **Task G1: Wan 2.6 Schema Definition (Multi-Shot)**
    
    - _Beschreibung:_ Definition einer Listen-Struktur für Szenen.
        
    - _Struktur:_
        
        JSON
        
        ```
        {
          "timeline":
        }
        ```
        
    - _Insight:_ Das Modell muss instruiert werden, `reference_subject` korrekt zu setzen, um sicherzustellen, dass die Person aus Shot 1 auch in Shot 2 identisch aussieht (Character Consistency).
        
- **Task G2: Storyboard-Interface**
    
    - _Beschreibung:_ UI-Erweiterung um eine Timeline-Ansicht. Jeder "Block" in der Timeline repräsentiert ein JSON-Objekt für einen Shot.
        

### 5.2 Modul H: ComfyUI Workflow Automation

ComfyUI-Workflows sind technisch gesehen riesige JSON-Dateien, die Nodes und Links definieren. Die manuelle Erstellung ist mühsam.

#### Scope:

"Text-to-Workflow". Der Nutzer sagt: "Ich brauche einen Flux Workflow mit ControlNet und Upscaler", und die Plattform liefert die ladbare `.json` Datei.

#### Tasks:

- **Task H1: Vektorisierung der Node-Bibliothek**
    
    - _Beschreibung:_ Scraping der `object_info.json` von Standard-ComfyUI-Installationen. Indexierung aller verfügbaren Nodes und ihrer Inputs/Outputs in einer Vektordatenbank.
        
    - _Begründung:_ Da es tausende Custom Nodes gibt, kann das LLM diese nicht alle kennen ("Halluzinationsgefahr"). RAG (Retrieval Augmented Generation) ist hier zwingend erforderlich, um valide Verbindungen vorzuschlagen.
        
- **Task H2: Workflow-Assembler Agent**
    
    - _Beschreibung:_ Ein Agent, der basierend auf der User-Anfrage die passenden Nodes aus der DB sucht und logisch verknüpft (Link-IDs generiert).
        
    - _Herausforderung:_ Die Link-IDs müssen im JSON eindeutig sein. Der Agent benötigt eine strenge Logik zur ID-Vergabe, um "Broken Workflows" zu vermeiden.
        

---

## 6. Operative Strategie und Markteinführung

Die technische Implementierung allein garantiert keinen Erfolg. Die folgenden operativen Aspekte sind kritisch für den Produktlebenszyklus.

### 6.1 Datenvergleich und Modell-Spezifika

Um die Komplexität der Implementierung zu verdeutlichen, zeigt die folgende Tabelle die unterschiedlichen Anforderungen der unterstützten Modelle:

|**Feature**|**Nano Banana Pro (Gemini)**|**Z-Image Turbo**|**Wan 2.6 (Video)**|
|---|---|---|---|
|**Input-Format**|Verschachteltes JSON|Flaches JSON + Keywords|Sequentielles JSON (Timeline)|
|**Negative Prompts**|Unterstützt (via Parameter)|**Nicht unterstützt**|Unterstützt|
|**Besonderheit**|Benötigt "MadeOutOf" Feld für Texturen|Benötigt "Safety"-Injections im positiven Prompt|Erfordert "Subject Anchors" für Konsistenz|
|**Latenz-Ziel**|< 5 Sekunden|< 1 Sekunde (Turbo)|~1-2 Minuten (Video Rendering)|

### 6.2 Monetarisierungsstrategie (SaaS Pricing 2025)

Basierend auf aktuellen Trends im SaaS-Markt für KI-Tools wird ein hybrides Modell empfohlen:

1. **Freemium (Community Tier):**
    
    - Zugriff auf Nano Banana Text-to-JSON.
        
    - Begrenzt auf 10 Generierungen/Tag.
        
    - Ziel: User-Akquise und Datensammlung zur Verbesserung der Prompts.
        
2. **Pro Tier ($19 - $29 / Monat):**
    
    - Unbegrenzte Text-to-JSON Generierung.
        
    - **Image-to-JSON (Vision):** Hier entstehen hohe Kosten durch GPT-4o Vision API Calls. Daher Begrenzung auf Credit-Basis (z.B. 500 Credits/Monat).
        
    - Zugriff auf Video-Module (Wan 2.6).
        
3. **Enterprise Tier (Preis auf Anfrage):**
    
    - ComfyUI Workflow Automation (hoher Rechenaufwand).
        
    - Team-Features (geteilte Prompt-Bibliotheken).
        
    - API-Zugriff für Integration in Firmen-Workflows (z.B. automatisierte Ad-Generierung).
        

### 6.3 Wartung und "Model Drift"

Ein kritisches Risiko ist der schnelle Wandel der Modelle. Wenn Midjourney v7 erscheint, ändern sich die Parameter.

- **Lösung:** Die Pydantic-Schemata im Backend (Modul B) müssen als "Living Documents" behandelt werden. Ein dedizierter "Schema Registry" Service ermöglicht es, Updates einzuspielen, ohne den Core-Code zu ändern. Das Frontend (React JSON Schema Form) passt sich dynamisch an die neuen Schemata an.
    

---

## 7. Fazit

Der vorliegende Implementierungsplan beschreibt weit mehr als ein einfaches Prompt-Tool. Es handelt sich um eine **Infrastruktur-Plattform für deterministische generative Medien**. Durch den Übergang von natürlicher Sprache zu strukturierten JSON-Daten wird die Erstellung professioneller KI-Inhalte reproduzierbar, skalierbar und integrierbar.

Der stufenweise Aufbau – vom soliden Text-zu-JSON MVP über die visuelle Analyse in V1.0 bis hin zur komplexen Video-Orchestrierung in der Ausbaustufe – minimiert das Entwicklungsrisiko und erlaubt eine schnelle Validierung am Markt. Mit dem Fokus auf moderne Technologien wie Pydantic für die Validierung und React Flow für die Visualisierung ist die Plattform zukunftssicher aufgestellt, um als "Betriebssystem" für die nächste Generation von KI-Creatorn zu dienen.

### Zusammenfassung der Meilensteine

- **Monat 1-2:** MVP Launch (Fokus: Nano Banana & Z-Image Stabilität).
    
- **Monat 3-4:** V1.0 Launch (Vision-Integration, Midjourney-Support).
    
- **Monat 5-6:** Expansion (Video-Module, ComfyUI, API-Öffnung).
    

Dieser Plan bietet eine klare Roadmap, um die Lücke zwischen der rohen Kraft generativer Modelle und den präzisen Anforderungen professioneller Workflows zu schließen.
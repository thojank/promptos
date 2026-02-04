Das vorliegende Dokument für **Z-Image-Turbo** liefert das perfekte „Regelwerk“, um deine Anwendung auf ein professionelles Level zu heben. Da du mit **VS Code**, **GitHub Copilot** und der **Gemini API** arbeitest, ist der effizienteste Weg, mit der Definition der **Datenstruktur (Schema)** und dem **System-Prompt** zu beginnen.

Hier ist dein konkreter Startpunkt für die Entwicklung:

### Schritt 1: Das „Gehirn“ definieren (Pydantic-Modelle)

Bevor du ein UI baust, musst du die Logik der Modularisierung festlegen. In VS Code solltest du als Erstes die Klassen definieren, die einen Prompt in seine Bestandteile zerlegen. Nutze Copilot, um basierend auf deinem Guide ein Pydantic-Modell zu erstellen.

**Aufgabe:** Erstelle eine Datei `models.py`.

- **Modularer Ansatz:** Trenne den **Subject-Block** (für Character-Konsistenz) vom **Scene-Block** (Licht, Setting, Kamera).
    
- **Warum?** Nur so kannst du später Profile wie „Giulia Benali“ speichern und in verschiedenen Szenen („Athen“, „Büro“, „Strand“) wiederverwenden.
    

Python

```
from pydantic import BaseModel, Field
from typing import Optional, List

class CharacterProfile(BaseModel):
    name: str
    identity: str = Field(..., description="Name, Alter, Herkunft")
    appearance: str = Field(..., description="Detaillierte physische Merkmale")

class SceneModule(BaseModel):
    setting: str
    lighting: str
    atmosphere: str
    composition: str
    technical: Optional[str] = "Shot on Canon EOS R5, 85mm f/1.4"

class ZImageTurboPrompt(BaseModel):
    character: CharacterProfile
    scene: SceneModule
    action: str
    text_elements: Optional[str]
```

### Schritt 2: Der „Logic Cage“ System-Prompt

Der Guide betont die „Logic Cage“-Philosophie: Die KI darf nicht blumig reden, sondern muss knallharte visuelle Fakten liefern. Du musst Gemini über die API so instruieren, dass es exakt dieses Schema füllt.

**Aufgabe:** Erstelle einen System-Prompt für deine Gemini-Anbindung.

- **Instruktion:** „Du bist ein visueller Künstler in einem logischen Käfig. Wandle Nutzer-Input in das Z-Image-Turbo JSON-Schema um. Nutze niemals Wörter wie 'stunning', '8K' oder 'masterpiece'. Erfinde realistische, fiktive Identitäten für Personen (kein 'ein Mann', 'eine Frau').“.
    

### Schritt 3: Die „Bild-zu-JSON“ Komponente (Reverse Engineering)

Um dein Ziel zu erreichen, Bilder vorne reinzuwerfen und JSON zurückzubekommen, nutzt du Gemini als Vision-Modell.

**Aufgabe:** Implementiere eine Funktion, die ein Bild an die Gemini API sendet.

- **Prompt-Strategie:** „Analysiere dieses Bild und extrahiere die DNA für Z-Image-Turbo. Gib mir die Kameraparameter, das Lichtsetup und die physischen Merkmale der Person als JSON zurück.“.
    
- **Technik:** Gemini 1.5 Pro oder Flash eignen sich hervorragend, um aus Pixeln strukturierte Metadaten zu generieren.
    

### Schritt 4: Modularer Story-Planer (Datenbank-Logik)

Für narratives Storytelling musst du Zustände speichern.

**Aufgabe:** Setze eine Datenbank (PostgreSQL/Supabase) auf.

- **Struktur:**
    
    1. `Table Profiles`: Speichert deine konsistenten Charaktere (`CharacterProfile`).
        
    2. `Table Stories`: Ein Container für eine Sequenz von Prompts.
        
    3. `Table Scenes`: Einzelne JSON-Objekte, die mit einer Story verknüpft sind.
        
- **Feature:** „Global Assets“ definieren. Wenn du den Stil einer Story von „Analog Film“ auf „Cyberpunk“ änderst, aktualisiert das System alle Szenen-JSONs im Story-Container gleichzeitig.
    

### Zusammenfassung der ersten Schritte (To-Do Liste):

1. **Backend (FastAPI):** Erstelle einen API-Endpunkt `/translate-text`, der Gemini nutzt, um einfachen Text in dein Pydantic-Schema zu pressen.
    
2. **Vision-Integration:** Erstelle `/analyze-image`, um hochgeladene Bilder in Z-Image-Profile zu verwandeln.
    
3. **Frontend (React/Next.js):** Baue ein Interface mit GitHub Copilot, das eine „Character-Bibliothek“ anzeigt. Per Drag-and-Drop ziehst du einen Charakter in eine neue Szene.
    
4. **Prompt-Assembler:** Schreibe eine Logik, die das fertige JSON wieder in den flüssigen, 600–1000 Wörter umfassenden Text-Prompt verwandelt, den das Modell für optimale Ergebnisse braucht.
    

**Nächster Schritt für dich:** Öffne VS Code und lass Copilot das oben genannte Pydantic-Modell erstellen. Binde danach deinen Gemini API-Key ein, um den ersten Text-zu-JSON Testlauf zu machen.
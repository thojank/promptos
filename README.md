# Z-Image-Turbo Prompt Platform

Eine modulare Web-Applikation zum Erstellen, Verwalten und Generieren von Prompts für Z-Image-Turbo (6B Fotorealismusmodell).

## Features

- **Character Profiles**: Speichere fiktive Identitäten mit Anti-Bias-Physik-Deskriptoren
- **Story Planning**: Modularisierte Szenen-Container für narrative Sequenzen
- **Vision-Integration**: Bilder → strukturierte JSON-Metadaten (Reverse Engineering)
- **Prompt-Assembler**: JSON → natürlichsprachige 600-1000 Wort Prompts
- **Global Asset-Switching**: Ändere Style-Parameter (Lighting, Atmosphere) über alle Szenen

## Architektur

```
backend/          → FastAPI, Pydantic, Gemini API
frontend/         → React/Next.js UI mit Drag-and-Drop
db/               → PostgreSQL/Supabase Schema
docs/             → Z-Image-Turbo Anleitungsdatei
```

## Entwicklung starten

1. Backend-Modelle initialieren (`models.py`)
2. Gemini-Integration testen (Text→JSON)
3. Vision-Endpunkt bauen (Bild→JSON)
4. Frontend-Grundgerüst

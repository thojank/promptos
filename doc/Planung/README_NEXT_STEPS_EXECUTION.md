# PromptOS – Next Steps (Step-by-Step) – Execution Guide

Diese Anleitung beschreibt die nächsten Schritte, um:
1) CI zu aktivieren
2) Frontend Typecheck+Tests einzubauen
3) Issue Automation zu härten (created-out)
4) Tech-Debt Issues sauber zu tracken

---

## A) CI aktivieren (GitHub Actions)

### A1. Workflow anlegen
Erstelle Datei: `.github/workflows/ci.yml`

- Backend: Python + pytest
- Frontend: npm ci + lint + typecheck + tests

### A2. Lokal prüfen (quick)
- Backend: `source .venv/bin/activate && pytest backend/tests/ -q`
- Frontend: `cd frontend && npm run lint`

### A3. Commit + Push + PR
- Branch erstellen
- Commit
- Push
- PR öffnen
- CI Status Checks müssen grün sein

---

## B) Frontend: typecheck + vitest

### B1. package.json scripts ergänzen
In `frontend/package.json` unter scripts:
- `"typecheck": "tsc --noEmit"`
- `"test": "vitest run"`
- `"test:watch": "vitest"`

### B2. vitest installieren
```bash
cd frontend
npm install -D vitest
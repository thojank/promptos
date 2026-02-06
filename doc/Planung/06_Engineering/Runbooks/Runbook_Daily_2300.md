# Daily 23:00 – PromptOS Dev Closeout

## Ziel
Einmal täglich: Code sichern, CI prüfen, Issues synchronisieren – minimaler Overhead für Solo-Dev.

---

## 1) Main sync

```bash
cd /Users/thorstenjankowski/n8n-compose/310126_prompt-platform
git checkout main
git pull
```

## **2) Tests lokal (Gate)**
### **Backend**

```source .venv/bin/activate
pytest backend/tests/ -q
```


### **Frontend**

```
cd frontend
npm run lint
npm run typecheck
npm test
cd ..
```

---

## **3) Tages-Branch (nur 1 PR pro Tag)**
> Wenn du schon auf einem Arbeitsbranch bist: bleib dort.
> Sonst:

```
git checkout -b day-$(date +%Y-%m-%d)
```

---
## **4) Commit (1x am Tag reicht)**

```
git add -A
git commit -m "day: $(date +%Y-%m-%d) progress"
```

---
## **5) Push + PR**

```
git push -u origin HEAD
```

PR erstellen:
- base: main
- compare: day-YYYY-MM-DD
- Beschreibung: Bulletpoints + Testnachweis
- Fixes nur für fertige Issues: Fixes #X #Y

---
## **6) CI prüfen (PR)**
- Backend + Frontend müssen grün sein
- wenn rot: Fix → commit → push → CI erneut

---
## **7) Merge (wenn fertig)**
- Squash and merge
- Branch delete (optional)

---
## **8) GitHub Projects Sync (nur 3 Zustände)**
- In Progress → Done (wenn gemerged)
- Ready = als nächstes
- Backlog = später

```
Wenn du die Datei angelegt hast, sag nur: **„runbook steht“**.
```


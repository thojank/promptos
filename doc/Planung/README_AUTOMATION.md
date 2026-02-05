# PROMPTOS – Issue Automation

Single Source of Truth für den kompletten Workflow:
- Issues **bulk** erstellen (REST)
- Issues ins **GitHub Project (Projects v2)** syncen + Custom Fields setzen (GraphQL)
- Issues später **robust** aktualisieren (Key-basiert, Copilot-friendly)
- Retrofit für Alt-Issues, die ohne Keys erstellt wurden

---

## Status / Was ist bereits umgesetzt?

✅ Bulk Create funktioniert (REST)  
✅ Labels sind im Repo angelegt  
✅ Project Sync funktioniert (Projects v2 GraphQL)  
✅ Week 2 Retrofit auf `issue_key` läuft  
✅ Week 3 + Week 4 wurden erstellt + gesynct  

---

## Ordnerstruktur (lokal)

```text
/Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/
  10_issues/
    week2.json
    week3.json
    week4.json
    created_issues.json
  11_scripts/
    bulk_create_issues.py
    bulk_update_issues.py
    project_sync.py
    create_labels.py
    retrofit_keys.py
  README_AUTOMATION.md
```

## GitHub Repo / Project

- **Repo:** thojank/promptos
- **Project:** PromptOS (User Project)
- **Project URL:** https://github.com/users/thojank/projects/2

## Token Setup

Wir nutzen `GITHUB_TOKEN` im Terminal.

### Classic PAT Scopes

Erforderliche Scopes:
- `public_repo` (oder `repo` für private Repos)
- `project` (für Projects v2 GraphQL)

Export:

```bash
export GITHUB_TOKEN="DEIN_TOKEN"
```

### Sanity Checks

Auth testen:

```bash
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user | head -n 20
```

Project Zugriff testen:

```bash
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { user(login: \"thojank\") { projectV2(number: 2) { id title } } }"}' \
  https://api.github.com/graphql
```

## Project v2 IDs (PromptOS)

### Project Node ID

- ProjectV2 ID: `PVT_kwHOC0214c4BOVtt`

### Custom Field IDs + Optionen (Single Select)

#### Status Field

- Field ID: `PVTSSF_lAHOC0214c4BOVttzg9EhS0`
  - Backlog: `f75ad846`
  - Ready: `47fc9ee4`
  - In Progress: `98236657`
  - Review: `a65b5864`
  - Done: `c67d47d7`

#### Epic Field

- Field ID: `PVTSSF_lAHOC0214c4BOVttzg9EivE`
  - E-001: `66a2febd`
  - E-002: `d2924680`
  - E-003: `a5289fef`
  - E-004: `55234d08`

#### Week Field

- Field ID: `PVTSSF_lAHOC0214c4BOVttzg9EixE`
  - 1: `e4a2f98c`
  - 2: `37faa261`
  - 3: `2f8f4728`
  - 4: `db53113f`

#### Priority Field

- Field ID: `PVTSSF_lAHOC0214c4BOVttzg9Ei0w`
  - P0: `f3cab737`
  - P1: `09c37dac`

#### Area Field

- Field ID: `PVTSSF_lAHOC0214c4BOVttzg9Ei3Y`
  - FE: `3af6e5ea`
  - BE: `9ad7a554`
  - DB: `44e36e32`
  - Ops: `3deaf4a0`

## Konventionen (Labels + Keys)

### Labels (Repo)

Wir nutzen Labels als lesbare Meta-Quelle und als Mapping-Quelle:

- `epic:E-001` .. `epic:E-004`
- `week:1` .. `week:4`
- `prio:P0`, `prio:P1`
- `area:FE`, `area:BE`, `area:DB`, `area:Ops`

Einmalig anlegen:

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/create_labels.py \
  --repo thojank/promptos
```

### Stable Issue Key (`issue_key`)

Jedes Issue hat einen stabilen Key (Beispiele):
- `W2-E002-FE-03`
- `W3-E003-BE-02`
- `W4-E004-OPS-01`

Der Key steht:
- im JSON pro Issue als `"key": "..."`
- im Issue Body als HTML-Kommentar:

```html
<!-- issue_key: W3-E003-BE-02 -->
```

Damit sind Titeländerungen später safe.

## JSON Format (weekX.json)

Beispiel:

```json
{
  "meta": {
    "repo": "thojank/promptos",
    "default_labels": ["week:3", "epic:E-003", "prio:P0"]
  },
  "issues": [
    {
      "key": "W3-E003-BE-01",
      "title": "E-003 BE: Civitai import endpoint + fetch + extract (meta/prompt/image)",
      "body": "## Ziel\n...\n\n## AC (Gherkin)\n- ...\n",
      "labels": ["area:BE"]
    }
  ]
}
```

## Scripts (11_scripts) – Zweck & Nutzung

### `create_labels.py`

**Zweck:** legt Standard-Labels im Repo an (idempotent).

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/create_labels.py \
  --repo thojank/promptos
```

### `bulk_create_issues.py` (Key-basiert)

**Zweck:**
- liest weekX.json
- erstellt Issues (REST)
- hängt `<!-- issue_key: ... -->` in den Body
- schreibt created_issues.json inkl. key_to_number

**Dry run:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/bulk_create_issues.py \
  --input /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/week3.json \
  --dry-run
```

**Create:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/bulk_create_issues.py \
  --input /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/week3.json
```

### `project_sync.py` (Projects v2 GraphQL)

**Zweck:**
- liest created_issues.json
- fügt Issues ins Project hinzu (wenn noch nicht vorhanden)
- setzt Felder: Status/Epic/Week/Priority/Area anhand Labels
- Default Status: Backlog

**Dry run:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/project_sync.py \
  --created /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/created_issues.json \
  --repo thojank/promptos \
  --dry-run
```

**Sync (Backlog):**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/project_sync.py \
  --created /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/created_issues.json \
  --repo thojank/promptos
```

**Sync (Status Ready):**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/project_sync.py \
  --created /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/created_issues.json \
  --repo thojank/promptos \
  --status "Ready"
```

### `bulk_update_issues.py` (Key-basiert)

**Zweck:**
- liest weekX.json
- nutzt created_issues.json (key_to_number) um Issue-Nummern zu finden
- PATCHt Titel/Body/Labels (REST)

**Dry run:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/bulk_update_issues.py \
  --input /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/week3.json \
  --dry-run
```

**Update:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/bulk_update_issues.py \
  --input /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/week3.json
```

### `retrofit_keys.py` (Alt-Issues nachträglich key-fähig machen)

**Zweck:** patcht bestehende Issues (ohne Key) und schreibt Mapping (key_to_number).

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/retrofit_keys.py \
  --input /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/week2.json \
  --repo thojank/promptos
```

## Standard-Workflow (Create → Sync → Update)

### Neue Woche hinzufügen

1. weekX.json anlegen (inkl. keys + Labels + Bodies)
2. Bulk Create
3. Project Sync
4. Copilot refinements am JSON
5. Bulk Update

### Commands (Copy/Paste)

**Create:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/bulk_create_issues.py \
  --input /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/weekX.json
```

**Sync:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/project_sync.py \
  --created /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/created_issues.json \
  --repo thojank/promptos
```

**Update:**

```bash
python3 /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/11_scripts/bulk_update_issues.py \
  --input /Users/thorstenjankowski/n8n-compose/310126_prompt-platform/doc/Planung/10_issues/weekX.json
```

## Copilot Workflow (VSCode)

Empfohlen:

- Copilot nutzen zum Verbessern der Issue-Bodies in weekX.json
  - klarere ACs (Given/When/Then)
  - Edge cases / Fehlerpfade
  - Task Checklists / technische Notes (Files/Endpoints/DB)

Danach `bulk_update_issues.py` ausführen.

## Troubleshooting

### 403 "Resource not accessible by personal access token"

Token fehlt Scope / Permission.

- Für Issues (REST): `public_repo` oder `repo`
- Für Projects v2 (GraphQL): `project`

### GraphQL FORBIDDEN bei user.projectV2(...)

Token hat kein `project` scope.

### 422 Validation Failed

Typische Ursachen:

- Labels existieren nicht → `create_labels.py` ausführen
- Payload-Problem (leerer Titel, ungültige Daten)

### Doppelte Issues (Create mehrfach ausgeführt)

`bulk_create_issues.py` ist bewusst „create-only" und dedupliziert nicht.  
Wenn du Dedupe brauchst: nächster Upgrade wäre „skip existing by issue_key".

## Optional Upgrades (später)

- **Dedupe beim Create:** Suche nach issue_key im Repo und skip, wenn vorhanden
- **Separate created_weekX.json:** pro Woche (statt shared created_issues.json)
- **Auto-Status:** bestimmte Keys direkt auf Ready setzen
- **Export Project Snapshot:** für Reporting
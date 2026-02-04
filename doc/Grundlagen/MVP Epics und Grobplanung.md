**PHASE 4 (Packaging: 4–6 Epics, MVP-Cut P0/P1, Stories + knappe Gherkin-ACs)**  
**Annahmen (klar markiert):** MVP = „Copy-first“ (noch kein Rendering/Job-Queue), Zielgruppe P0 = Power-User + Pro-Creator, Tech-Basis (Next.js + API + Supabase) ist vorhanden.

---

## Epic E-001 – Core Prompting (Text → Outline → JSON → Prompt)

**Ziel/Nutzerwert:** Schnell von Idee zu validem, modellkonformen Prompt; weniger Zufall.  
**P0:** UC-001, UC-011 (ohne fancy Varianten), Basis-Export/Copy  
**P1:** Varianten/Batch, Midjourney Mapper

### US-001 – Keyword Input → Outline generieren

**AC (Gherkin):**

- **Given** ich gebe ≥3 Stichworte ein **When** ich „Outline erstellen“ klicke **Then** sehe ich eine Outline mit Sektionen `Subject`, `Environment`, `Style`, `Technical`.
    
- **Given** Outline ist erzeugt **When** ich eine Sektion editiere **Then** bleibt die Struktur erhalten und Änderungen werden gespeichert.
    

### US-002 – Outline → Longtext Refinement

- **Given** eine Outline existiert **When** ich „Refine to Longtext“ ausführe **Then** erhalte ich einen Langtext, der alle „Must-have“ Punkte enthält.
    
- **Given** der Langtext ist erzeugt **When** ich „Regenerate section“ nutze **Then** wird nur die gewählte Sektion neu generiert.
    

### US-003 – Longtext → Universal JSON (Schema-validiert)

- **Given** Langtext existiert **When** ich „Generate JSON“ klicke **Then** erhalte ich valides JSON gemäß ausgewähltem Schema.
    
- **Given** JSON ist invalid **When** die Validierung läuft **Then** werden fehlerhafte Felder markiert und ein Fix-Vorschlag angezeigt.
    

### US-004 – JSON → Prompt-Text (Adapter Output) + Copy

- **Given** valides JSON **When** ich „Build Prompt“ klicke **Then** wird ein Prompt-Text generiert und angezeigt.
    
- **Given** Prompt ist angezeigt **When** ich „Copy“ klicke **Then** wird der Prompt in die Zwischenablage kopiert und ich sehe eine Success-Toast.
    

### US-005 – Prompt History (Session-level)

- **Given** ich generiere Prompt/JSON **When** ich zur History gehe **Then** sehe ich die letzten N Generierungen dieser Session.
    
- **Given** ich wähle einen History-Eintrag **When** ich „Restore“ klicke **Then** werden JSON + Prompt wiederhergestellt.
    

---

## Epic E-002 – Guardrails & Qualität (Regelwerk, Bias, Audit)

**Ziel/Nutzerwert:** Weniger „kaputte“ Prompts, konsistente Qualität, weniger Policy-Risiko.  
**P0:** UC-003 (Forbidden Words + Hinweise)  
**P1:** Audit-Log, konfigurierbare Regeln pro Workspace

### US-006 – Forbidden-Words Scan beim Prompt-Build

- **Given** ich baue einen Prompt **When** verbotene Tokens enthalten sind **Then** sehe ich eine Warnung und die Tokens sind markiert.
    
- **Given** Tokens sind markiert **When** ich „Auto-fix“ wähle **Then** werden sie entfernt/ersetzt und der Prompt neu gebaut.
    

### US-007 – Bias-/Person-Descriptor Guidance

- **Given** mein Prompt beschreibt eine Person **When** vage/biased Begriffe erkannt werden **Then** bekomme ich konkrete, physische Descriptor-Vorschläge.
    
- **Given** ich akzeptiere Vorschläge **When** ich „Apply“ klicke **Then** werden nur die betroffenen Teile aktualisiert.
    

### US-008 – Regelkonforme „Positive Injections“ (ohne Negative Prompts)

- **Given** das Zielmodell unterstützt keine Negative Prompts **When** Guardrails aktiv sind **Then** werden Sicherheit/Qualitäts-Hinweise als positive Constraints integriert.
    
- **Given** Injections wurden angewendet **When** ich den Prompt kopiere **Then** sind die Injections im finalen Prompt enthalten.
    

### US-009 (P1) – Guardrail Audit Log

- **Given** Auto-fix wurde angewendet **When** ich den Audit-Tab öffne **Then** sehe ich „was geändert wurde“ (Before/After) + Zeitstempel.
    
- **Given** ich exportiere **When** Audit aktiv ist **Then** wird Audit als Metadaten mitexportiert.
    

---

## Epic E-003 – Auth & Library Management (Login + CRUD + Tags)

**Ziel/Nutzerwert:** Wiederverwendung/Organisation = Retention & Team-Fähigkeit.  
**P0:** UC-019 + UC-020 minimal (private Library, CRUD, Tags, Search)  
**P1:** Sharing/Teams/Rollen

### US-010 – Signup/Login/Logout

- **Given** ich bin ausgeloggt **When** ich mich mit Email/Password anmelde **Then** lande ich im Workspace und sehe meine Library.
    
- **Given** ich bin eingeloggt **When** ich Logout klicke **Then** sind private Inhalte nicht mehr sichtbar.
    

### US-011 – Library Item CRUD (Bricks/Characters/Stories als Typen)

- **Given** ich erstelle ein Item **When** ich „Save“ klicke **Then** ist es in der Library gelistet.
    
- **Given** ein Item existiert **When** ich „Delete“ bestätige **Then** ist es entfernt und nicht mehr abrufbar.
    

### US-012 – Tags & Search

- **Given** Items haben Tags **When** ich nach Tag filtere **Then** sehe ich nur passende Items.
    
- **Given** ich suche nach Name **When** ich tippe **Then** wird eine Ergebnisliste angezeigt (partial match).
    

### US-013 – Import/Export (JSON)

- **Given** ein Item existiert **When** ich „Export JSON“ wähle **Then** erhalte ich eine JSON-Datei oder Copy-JSON.
    
- **Given** ich importiere valides JSON **When** ich „Import“ bestätige **Then** wird ein neues Library-Item erstellt.
    

---

## Epic E-004 – Bricks, Merge & Remix (Composable Prompting)

**Ziel/Nutzerwert:** „Mix & Match“ ohne Chaos; klare Merge-Regeln.  
**P0:** UC-016 + UC-005 (Brick speichern/auswählen/merge, Konfliktanzeige)  
**P1:** UC-026 Remix Engine (Style aus Referenz + Subject aus Text), Brick-Marketplace

### US-014 – Brick erstellen aus aktuellem JSON (Save as Brick)

- **Given** ich habe JSON im Editor **When** ich „Save as Brick“ klicke **Then** wähle ich Brick-Typ (Style/Env/Character/LoRA) und speichere.
    
- **Given** Pflichtfelder fehlen **When** ich speichern will **Then** sehe ich Validierungsfehler pro Feld.
    

### US-015 – Brick auswählen und injizieren (Merge)

- **Given** ich bin im Prompt-Builder **When** ich einen Brick auswähle **Then** wird er in das aktuelle JSON gemerged.
    
- **Given** Merge erfolgreich **When** ich „Build Prompt“ klicke **Then** spiegelt der Prompt die Brick-Inhalte wider.
    

### US-016 – Merge-Konflikte sichtbar & lösbar

- **Given** Brick kollidiert mit bestehenden Feldern **When** Merge passiert **Then** sehe ich Konflikte (Field A vs Field B) und eine Prioritätsregel.
    
- **Given** Konfliktliste **When** ich „Use Brick“ oder „Keep Current“ wähle **Then** wird das Feld entsprechend gesetzt und Konflikt verschwindet.
    

### US-017 (P1) – Remix: Referenz-Style extrahieren + Subject kombinieren

- **Given** ich lade ein Referenzbild/Link für Style **When** ich „Extract Style“ klicke **Then** entsteht ein Style-Brick.
    
- **Given** Style-Brick + Subject-Text **When** ich „Remix“ starte **Then** erhalte ich ein gemergtes JSON und einen Prompt.
    

---

## Epic E-005 – Imports & Power-User Integrationen (Civitai + ComfyUI PNG)

**Ziel/Nutzerwert:** Schnelles Onboarding über bestehende Community-Assets; reduziert manuelle Arbeit.  
**P0:** UC-013 (Civitai Import light), UC-014 (Comfy PNG Import)  
**P1:** UC-015 Comfy Node Push/Pull, LoRA-Validierung tief

### US-018 – Civitai URL Import → BasePrompt + Ressourcenliste

- **Given** ich paste eine Civitai URL **When** ich „Import“ klicke **Then** sehe ich extrahiertes Prompt + Ressourcen (Model/LoRA) als strukturierte Daten.
    
- **Given** Import-Daten **When** ich „Save selected as Bricks“ wähle **Then** werden ausgewählte Teile in der Library gespeichert.
    

### US-019 – Civitai Import Fehlerhandling

- **Given** Civitai ist nicht erreichbar/Rate-limited **When** ich importiere **Then** sehe ich eine verständliche Fehlermeldung + Retry.
    
- **Given** Import scheitert **When** ich „Manual paste“ nutze **Then** kann ich Prompt/Settings manuell einfügen und weiterarbeiten.
    

### US-020 – ComfyUI PNG Upload → Meta extrahieren → JSON erzeugen

- **Given** ich lade ein ComfyUI PNG hoch **When** Meta vorhanden ist **Then** werden Prompt/Settings extrahiert und als BasePrompt angezeigt.
    
- **Given** keine Meta vorhanden **When** Upload abgeschlossen ist **Then** wird ein Fallback angeboten (Image→JSON Analyse).
    

### US-021 (P1) – LoRA Entities speichern + Parameter

- **Given** Import enthält LoRA **When** ich speichere **Then** wird LoRA inkl. weight/trigger tokens als Entity abgelegt.
    
- **Given** LoRA ist inkompatibel **When** Zielmodell gewählt ist **Then** sehe ich einen Kompatibilitätshinweis.
    

---

## Epic E-006 – Story & Campaign Creator (Outline → Shots → Scene JSONs)

**Ziel/Nutzerwert:** High-level Einstieg („Kampagne zu…“) + Narrative Engine als Differenzierung.  
**P0:** UC-018 Kampagnen-Brief → Shotlist → JSON pro Shot (ohne Video)  
**P1:** UC-017 Story Creator (Propagation/Locks), UC-033 Video Timeline

### US-022 – Kampagnen-Brief Formular (5 Fragen) → Shotlist

- **Given** ich fülle Kampagnenziel/Produkt/Zielgruppe aus **When** ich „Generate Shotlist“ klicke **Then** erhalte ich 6–12 Shots mit Titel + kurzer Beschreibung.
    
- **Given** Shotlist existiert **When** ich einen Shot entferne **Then** passt sich die Nummerierung/Übersicht an.
    

### US-023 – Shot → Scene JSON + Prompt

- **Given** ich wähle einen Shot **When** ich „Generate Scene JSON“ klicke **Then** erhalte ich JSON + Prompt für genau diesen Shot.
    
- **Given** ich editiere Scene JSON **When** ich „Rebuild“ klicke **Then** wird der Prompt aktualisiert.
    

### US-024 – Global Constraints (Style/Character) auf Shots anwenden (P0 light)

- **Given** ich setze einen globalen Style-Brick **When** ich „Apply to all shots“ nutze **Then** wird der Brick in alle Scene JSONs gemerged.
    
- **Given** Konflikt bei einem Shot **When** Apply läuft **Then** wird ein Konfliktbericht pro Shot angezeigt.
    

### US-025 (P1) – Story Propagation mit Locks

- **Given** ein Feld ist gelocked (z.B. Character appearance) **When** ich Szene 1 ändere **Then** bleibt das gelockte Feld in allen Szenen identisch.
    
- **Given** ich unlocke ein Feld **When** ich propagieren lasse **Then** dürfen Folgeszenen abweichen.
    

---

# MVP-Cut Empfehlung (P0 in 2–4 Wochen, „wertstiftend & machbar“)

Wenn ihr wirklich sauber schneiden wollt:

- **P0 liefern:** E-001 (Core), E-002 (Guardrails light), E-003 (Login+Library CRUD), E-004 (Bricks+Merge), E-005 (Civitai light + Comfy PNG), E-006 (Campaign Shotlist → Scene JSON)
    
- **P1 danach:** Run/Queue, Batch, Midjourney Mapper, Comfy Node Push/Pull, Story Locks/Video, Audit-Log, Teams.


### Welche UCs sind in den 6 Epics aktuell abgedeckt?

**E-001 Core Prompting**  
✅ UC-001, UC-011 (teilweise), (Prompt-History ist Teil von UC-025 light, aber noch nicht „voll“)

**E-002 Guardrails**  
✅ UC-003 (P0), ✅ UC-029 (P1 Audit/Compliance-Anteil)

**E-003 Auth & Library**  
✅ UC-019, ✅ UC-020, (Import/Export ist ein Teil von UC-020)

**E-004 Bricks/Merge/Remix**  
✅ UC-016 (P0), ✅ UC-005 (P0), ✅ UC-026 (P1), (UC-004 steckt implizit drin, aber nicht als eigene Story separat ausgearbeitet)

**E-005 Integrationen (Import)**  
✅ UC-013 (P0), ✅ UC-014 (P0), ✅ UC-012 (P1 light)

**E-006 Campaign/Story**  
✅ UC-018 (P0), ✅ UC-017 (P1), ✅ UC-033 (P1)

---

### Welche UCs fehlen in PHASE 4 (noch nicht in Epics/Stories verpackt)?

**Execution & Skalierung**

- ❌ UC-021 Run/Dispatch + Job-Queue
    
- ❌ UC-022 Batch/Variations (Permutation Builder)
    

**Midjourney**

- ❌ UC-023 JSON → Midjourney Mapper
    

**Schema/Plattform-Fundament**

- ❌ UC-024 Schema Registry + Modell-Versionen
    
- ❌ UC-025 Versionierung/Diff/Rollback (nur „History light“, nicht der volle UC)
    
- ❌ UC-027 Schema-driven Form UI
    
- ❌ UC-028 Credit System + Usage Metering
    
- ❌ UC-030 RAG Suggestions
    
- ❌ UC-031 Team Libraries + Rollen/Rechte
    
- ❌ UC-032 Marketplace
    
- ❌ UC-034 Public API
    

**Reverse/Link-Input**

- ❌ UC-002 Bild→JSON (Reverse Prompting) (noch nicht als Story gepackt)
    
- ❌ UC-010 Link→Asset-DNA (Pinterest/Unsplash/Behance/YouTube)
    

**Character**

- ⚠️ UC-004 Character erstellen & speichern (implizit über „Bricks“ denkbar, aber nicht explizit als eigener UC/Story sauber drin)
    

---

### Kurzfazit

- **In PHASE 4 sind aktuell ~14–16 der 34 UCs** direkt oder indirekt adressiert (je nachdem, ob man „implizit“ zählt).
    
- Für „alle 34 UCs“ bräuchten wir **2–3 zusätzliche Epics** oder wir erweitern die bestehenden Epics um jeweils 1–2 Stories.
    

Wenn du willst, mache ich als nächsten Schritt eine **vollständige Coverage-Matrix (UC-001…UC-034 → Epic → Story-IDs → P0/P1)**, damit man auf einen Blick sieht, was wo drin ist.


---

**PHASE 4 (Packaging) – kombiniert mit eurer 4-Wochen-Roadmap und in die Planung integriert**  
Ich mappe eure Wochen-Epics direkt auf Stories (3–6 je Epic) inkl. **Gherkin-ACs** und hänge eine **UC-Coverage** dran (welche der UC-001…UC-034 dadurch abgedeckt werden).

---

## Woche 1 — Epic E-001: Universal Orchestrator stabilisieren

**Scope (P0):** BasePrompt-Pipeline absichern, Universal-Schema dokumentieren, Adapter Layer (Flux/Banana) + Smoke Tests, Frontend-Konsistenz (Sektionen/Copy).  
**Use-Case Coverage:** UC-001, UC-011(teil), UC-024(teil), UC-004/005(als Grundlage), plus „Adapter Output“.

### US-001 – BasePrompt Validierung (leere Felder, Defaults, Fehlerfälle)

**ACs**

- **Given** ein generiertes BasePrompt enthält leere Pflichtfelder **When** die Validierung läuft **Then** werden Pflichtfelder markiert und Defaults angewendet, sofern definiert.
    
- **Given** Defaults wurden angewendet **When** ich den BasePrompt exportiere **Then** sind die Default-Werte im JSON sichtbar (nicht nur im UI).
    

### US-002 – Universal-Schema Feld-Doku (Subject/Environment/Style/Technical)

**ACs**

- **Given** ich öffne „Schema Hilfe“ **When** ich eine Sektion auswähle **Then** sehe ich Beschreibung, Beispiele und „Required/Optional“ je Feld.
    
- **Given** ein Feld ist modell-spezifisch **When** ich das Zielmodell wechsle **Then** wird die Feldhilfe entsprechend angepasst/ergänzt.
    

### US-003 – Flux-Adapter (Guidance/Seed Handling etc.)

**ACs**

- **Given** ich wähle „Flux“ als Zielmodell **When** ich „Build Adapter Output“ klicke **Then** enthält der Output Flux-spezifische Parameter (z.B. Guidance, Seed) gemäß UI-Einstellungen.
    
- **Given** ich setze keinen Seed **When** Adapter Output gebaut wird **Then** wird Seed entweder leer gelassen oder deterministisch gesetzt (klar angezeigt).
    

### US-004 – Banana-Adapter Smoke Tests mit realen Beispielen

**ACs**

- **Given** ein definierter Satz an Test-Prompts **When** Smoke Tests laufen **Then** erhalte ich pro Beispiel „pass/fail“ und eine Fehlermeldung bei Fail.
    
- **Given** ein Smoke Test failt **When** ich den Report öffne **Then** sehe ich Input-JSON, Adapter-Output und Validierungsfehler.
    

### US-005 – Frontend: BasePrompt Ausgabe klar in Sektionen + Labels

**ACs**

- **Given** BasePrompt ist erzeugt **When** ich die Ausgabe anschaue **Then** sind Subject/Environment/Style/Technical klar getrennt und beschriftet.
    
- **Given** ein Feld fehlt **When** ich die Sektion öffne **Then** sehe ich „missing“ Markierung + Quick-Fix Hinweis.
    

### US-006 – Copy-to-Clipboard für BasePrompt und Adapter Output

**ACs**

- **Given** BasePrompt/Adapter Output ist sichtbar **When** ich „Copy“ klicke **Then** ist der komplette Inhalt in der Zwischenablage und ich sehe eine Success-Toast.
    
- **Given** Copy scheitert (Browser限制) **When** ich Copy auslöse **Then** bekomme ich einen Fallback („Select all“) angezeigt.
    

---

## Woche 2 — Epic E-002: Library & Asset-Management (Styles/Environments + Mix & Match)

**Scope (P0):** Library UI erweitern (Edit/Delete), Tagging/Filter, Bricks injizieren + Merge-Preview.  
**Use-Case Coverage:** UC-019, UC-020, UC-016, UC-005 (praktisch), Basis für UC-031 (P1).

### US-007 – Styles/Environments CRUD (Supabase)

**ACs**

- **Given** ich bin eingeloggt **When** ich einen Style speichere **Then** erscheint er in meiner Library.
    
- **Given** ein Style existiert **When** ich „Edit“ speichere **Then** sind Änderungen persistent und sofort in der Liste sichtbar.
    
- **Given** ich lösche einen Eintrag **When** ich bestätige **Then** ist er entfernt und nicht mehr injizierbar.
    

### US-008 – Tagging & Filter (z.B. Analog/Noir/Studio)

**ACs**

- **Given** ein Asset hat Tags **When** ich nach Tags filtere **Then** sehe ich nur passende Assets.
    
- **Given** ich tippe in Search **When** ich einen Begriff eingebe **Then** werden Ergebnisse per Partial Match aktualisiert.
    

### US-009 – Mix & Match: Style/Environment per Klick injizieren

**ACs**

- **Given** ich habe einen BasePrompt **When** ich einen Style-Brick auswähle **Then** wird er in die Style-Sektion gemerged.
    
- **Given** ich injiziere Environment **When** Konflikte mit bestehenden Feldern entstehen **Then** werden Konflikte angezeigt und ich kann „Keep current“ vs „Use brick“ wählen.
    

### US-010 – Merge-Preview der BasePrompt Struktur

**ACs**

- **Given** ein Merge wurde ausgeführt **When** ich „Preview“ öffne **Then** sehe ich diff-artige Markierung (added/changed) auf Sektionsebene.
    
- **Given** ich breche Merge ab **When** ich „Undo“ klicke **Then** kehrt der BasePrompt in den vorherigen Zustand zurück.
    

### US-011 – Save as Brick aus aktuellem BasePrompt

**ACs**

- **Given** BasePrompt ist vorhanden **When** ich „Save as Brick“ wähle **Then** kann ich Typ+Name+Tags setzen und speichern.
    
- **Given** Pflichtfelder fehlen **When** ich speichern will **Then** blockiert das System mit Feld-Fehlern.
    

---

## Woche 3 — Epic E-003: Inflow & Meta-Daten (Civitai + ComfyUI PNG)

**Scope (P0):** Civitai Import UI + Preview + extrahiertes JSON; PNG Meta Parser Spike + Mapping in Bausteine.  
**Use-Case Coverage:** UC-013, UC-014, Vorbereitung für UC-012 (LoRA), UC-030 (später).

### US-012 – Civitai Import Formular (URL + Modus auto/prompt/image)

**ACs**

- **Given** ich paste eine Civitai URL **When** ich Import starte **Then** kann ich Modus wählen (auto/prompt/image) und sehe einen Fortschrittsstatus.
    
- **Given** URL ist ungültig **When** ich Import starte **Then** sehe ich eine Inline-Validierung bevor ein Request rausgeht.
    

### US-013 – Civitai Ergebnis-Preview (Meta + extrahiertes JSON)

**ACs**

- **Given** Import erfolgreich **When** Preview lädt **Then** sehe ich Meta (Model/LoRA/Settings soweit verfügbar) und das extrahierte BasePrompt JSON.
    
- **Given** Preview zeigt extrahierte Bausteine **When** ich „Save selected“ klicke **Then** werden ausgewählte Teile als Bricks in der Library gespeichert.
    

### US-014 – Civitai Fehlerhandling (Rate limit/404/Timeout)

**ACs**

- **Given** Civitai gibt Rate-Limit **When** Import läuft **Then** sehe ich „Retry after“ Hinweis + Retry-Button.
    
- **Given** Import scheitert **When** ich „Manual paste“ nutze **Then** kann ich Prompt/Settings manuell eingeben und BasePrompt generieren.
    

### US-015 – Spike: Exif/PNG-Text-Chunks auslesen (ComfyUI PNG)

**ACs**

- **Given** ich lade ein PNG hoch **When** Meta vorhanden ist **Then** werden Text-Chunks ausgelesen und roh angezeigt (Debug-View).
    
- **Given** keine Meta vorhanden **When** Upload abgeschlossen ist **Then** bekomme ich den Hinweis „No embedded workflow metadata found“.
    

### US-016 – Mapping PNG Meta → BasePrompt Bausteine

**ACs**

- **Given** Meta wurde extrahiert **When** Mapping läuft **Then** sehe ich BasePrompt-Sektionen befüllt (mind. Subject/Style/Technical soweit möglich).
    
- **Given** Mapping ist unvollständig **When** Ausgabe angezeigt wird **Then** werden fehlende Felder markiert + Quick-Fix Vorschläge angezeigt.
    

---

## Woche 4 — Epic E-004: Produktisierung & Zugänge (Account/Credits + Monitoring/Hardening)

**Scope (P0):** Rollen/Plan-Limits, API-Key Modell, Rate-Limit Strategie, minimal Telemetry/structured logs.  
**Use-Case Coverage:** UC-028, UC-034(teil), UC-029(teil), Basis für UC-031.

### US-017 – Plan-Tiers & Limits (Explorer/Creator/Studio)

**ACs**

- **Given** mein Plan ist Explorer **When** ich ein Limit erreiche **Then** wird die Aktion blockiert mit klarer Meldung (was/warum/Upgrade).
    
- **Given** Admin ändert Limits **When** ich neu lade **Then** greifen die Limits ohne Code-Änderung.
    

### US-018 – API-Key Modell (Supabase Policies, Basic)

**ACs**

- **Given** ich bin eingeloggt **When** ich „Create API Key“ klicke **Then** erhalte ich einen Key, der nur auf meine Workspace-Ressourcen zugreift.
    
- **Given** ein Key ist revoked **When** er genutzt wird **Then** wird der Request mit 401 abgelehnt.
    

### US-019 – Credits/Usage Metering (Minimal)

**ACs**

- **Given** eine kostenpflichtige Aktion (z.B. Image→JSON) **When** sie ausgeführt wird **Then** werden Credits reduziert und im UI angezeigt.
    
- **Given** Credits = 0 **When** ich die Aktion starte **Then** wird sie blockiert und ein Upgrade-CTA angezeigt.
    

### US-020 – Rate-Limit Strategie (Civitai + Adapter Endpoints)

**ACs**

- **Given** zu viele Requests **When** Rate-Limit greift **Then** erhalte ich 429 + Retry-After und UI zeigt „please retry“.
    
- **Given** Civitai throttled **When** Import läuft **Then** werden Requests gebündelt/backoff verwendet (erkennbar am Status).
    

### US-021 – Fehler-Telemetry (structured logs, minimal)

**ACs**

- **Given** ein API-Request failt **When** der Fehler entsteht **Then** wird ein strukturierter Log mit correlation_id, user_id (falls vorhanden), endpoint, error_code geschrieben.
    
- **Given** ich öffne eine „Last errors“ Admin-Ansicht **When** Logs vorhanden sind **Then** sehe ich die letzten N Fehler mit Filter.
    

---

# UC-Coverage: Sind „alle 34“ jetzt in der Planung?

**Nein, aber:** Die 4-Wochen-Planung deckt bewusst den **P0-Kern** ab. Damit sind sicher abgedeckt (direkt oder als Grundlage):

- **Abgedeckt (P0 direkt):** UC-001, UC-003, UC-013, UC-014, UC-016, UC-019, UC-020, UC-028
    
- **Teilweise / Grundlage gelegt:** UC-011 (ohne volle Story-UX), UC-024 (Schema-Doku/Validation light), UC-034 (API-Key Modell als Voraussetzung), UC-029 (Monitoring/Policies als Anfang)
    

**Noch nicht in diesen 4 Wochen eingeplant (P1/P2):** UC-002, UC-004, UC-005 (voll), UC-010, UC-012 (voll), UC-015, UC-017, UC-018, UC-021, UC-022, UC-023, UC-025, UC-026, UC-027, UC-030, UC-031, UC-032, UC-033 und ggf. weitere (je nach Definition).

Wenn du willst, ergänze ich als **Anhang** eine kompakte **Coverage-Matrix UC-001…UC-034 → Woche/Epic/Story (P0/P1)**, damit ihr intern komplett nachvollziehen könnt, was wann kommt.


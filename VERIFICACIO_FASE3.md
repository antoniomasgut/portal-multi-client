# Verificació Fase 3 — Diferenciació

**Credencials de prova:**
| Usuari | Email | Password |
|--------|-------|----------|
| Admin | `admin@portal.com` | `Admin1234!` |
| Client test | `test@portal.com` | `Test1234!` |

**URLs:** Frontend `http://localhost:3000` · Backend API `http://localhost:4000`

**Clients de prova amb dades:**
| Client | Slug landing | Estado |
|--------|-------------|--------|
| Ca Na Rebecca | `ca-na-rebecca` | Landing publicada ✓ |
| Forn de Pa Roca | `forn-de-pa-roca` | Landing publicada ✓ |

---

## 1. Landing Pro — Generació amb IA

### Via API
- [x] `POST /api/clients/:id/generate-landing` accepta `companyName`, `sector`, `lang`
- [x] Sense proveïdor IA configurat → missatge clar "Cap proveïdor IA configurat" (503)
- [x] Amb `GROQ_API_KEY` vàlida → genera títol, subtítol, descripció, CTA

### Via UI
- [ ] Dins d'un client → pestanya "Landing" → bloc "✨ Generar contingut amb IA"
- [ ] Camp "Sector del negoci" → escriure "forn de pa"
- [ ] Botó "✨ GENERAR" → omple els camps automàticament
- [ ] Els camps generats es poden editar manualment abans de desar
- [ ] Missatge d'error si no hi ha proveïdor IA → "Cap proveïdor IA configurat per a aquest client"

### Landings publicades (verificar al navegador)
- [ ] `http://localhost:3000/l/ca-na-rebecca` — es carrega amb títol "Ca Na Rebecca"
- [ ] `http://localhost:3000/l/forn-de-pa-roca` — es carrega amb títol "Forn de Pa Roca"
- [ ] El botó CTA de Ca Na Rebecca porta a WhatsApp (wa.me)
- [ ] El botó CTA de Forn de Pa Roca porta al telèfon (tel:)
- [ ] Slug inexistent → pàgina 404 amigable

### URL del camp CTA (fix 2026-04-25)
- [x] El camp ctaUrl accepta: `https://`, `tel:+34...`, `mailto:correu@...`, `wa.me/34...`
- [ ] Provar URL de tipus `tel:+34971123456` → es valida correctament sense error

---

## 2. RAG / Alf — Gestió de documents

### Via API
- [x] `GET /api/clients/:id/rag` → retorna llista de documents (buida inicialment)
- [x] `POST /api/clients/:id/rag` → upload document (multipart/form-data, màx 20MB)
- [x] Document s'indexa asíncronament al servei FastAPI (requereix `portal_ai` actiu)

### Via UI
- [ ] Dins d'un client → secció "RAG / Documents" visible
- [ ] Zona drag&drop per pujar fitxers (PDF, TXT, etc.)
- [ ] Document apareix amb estat PENDING → INDEXING → INDEXED
- [ ] Polling automàtic cada 5 segons que actualitza l'estat
- [ ] Botó "Re-indexar" → torna a enviar al servei IA
- [ ] Botó "Eliminar" → document desapareix

**Nota:** El servei AI (`portal_ai`) no és actiu en local → documents queden en estat PENDING.

---

## 3. Dominis + DNS

### Via API
- [x] `GET /api/domains` → vista global admin (llista tots els dominis)
- [x] `GET /api/clients/:id/domains` → dominis d'un client concret
- [x] `POST /api/clients/:id/domains` → afegir domini "canarebecca.cat" (OK, id: 5d42d0f5...)
- [x] `GET /api/clients/:id/domains/:domainId/instructions` → instruccions DNS (OK)
- [x] `POST /api/clients/:id/domains/:domainId/verify` → verifica registres DNS

### Via UI
- [ ] `http://localhost:3000/admin/domains` — pàgina global visible
- [ ] Cada domini mostra estat: PENDING / VERIFIED / FAILED
- [ ] Dins d'un client → secció "Domini" → afegir domini personalitzat
- [ ] Instruccions DNS clares (registres A/CNAME a configurar)
- [ ] Botó "Verificar" → comprova els registres DNS en temps real
- [ ] `http://localhost:3000/client/domain` — instruccions DNS per al client

---

## 4. RGPD Bàsic

### Via API
- [x] `POST /api/clients/:id/consent` amb `type: COOKIES_ANALYTICS` → OK
- [x] `POST /api/clients/:id/consent` amb `type: COOKIES_MARKETING` → OK
- [x] `GET /api/clients/:id/consent` → retorna historial de consents (1 registre)
- [x] `POST /api/clients/:id/data-export` → sol·licita exportació → OK
- [x] `DELETE /api/clients/:id/anonymize` → dret d'oblit (admin only)

**Tipus de consent vàlids:** `COOKIES_NECESSARY` · `COOKIES_ANALYTICS` · `COOKIES_MARKETING` · `DATA_PROCESSING` · `COMMUNICATIONS`

### Via UI
- [ ] `http://localhost:3000/client/privacy` — pàgina RGPD del client visible
- [ ] Toggles per cada tipus de cookie
- [ ] Botó "Exportar les meves dades" → sol·licita exportació
- [ ] Banner de cookies visible a les landings públiques (`/l/[slug]`)
- [ ] `http://localhost:3000/admin/clients` → botó "Dret d'oblit" dins del client

---

## 5. Proveïdors IA

### Via API
- [x] `GET /api/ai-providers/models` → retorna models disponibles per GROQ/OLLAMA/OPENAI/ANTHROPIC
- [x] `GET /api/clients/:id/ai-providers` → llista providers del client
- [x] `POST /api/clients/:id/ai-providers` amb `provider: GROQ`, `model`, `apiKey` → OK (id: 112e35b2...)
- [x] `PATCH /api/clients/:id/ai-providers/:providerId` → actualitza provider
- [x] `DELETE /api/clients/:id/ai-providers/:providerId` → elimina provider

### Via UI
- [ ] Dins d'un client → secció "Proveïdors IA" visible
- [ ] Llista de providers actius
- [ ] Botó "Afegir provider" → selector GROQ/OLLAMA/OPENAI/ANTHROPIC + camp API Key
- [ ] Selector de model disponible per proveïdor
- [ ] Toggle activa/desactiva un provider
- [ ] `http://localhost:3000/admin/ai-providers` — vista global admin

---

## 6. Agent Suport WhatsApp — Config Bot

### Via API
- [x] `GET /api/clients/:id/whatsapp-bot` → retorna configuració actual
- [x] `PUT /api/clients/:id/whatsapp-bot` → desa config (system prompt, to, horari)
- [x] `POST /api/clients/:id/generate-whatsapp` → genera config amb IA

### Via UI
- [ ] Dins d'un client → secció "WhatsApp Bot" visible
- [ ] Camp "System Prompt" editable
- [ ] Camp "Missatge de benvinguda" editable
- [ ] Selector de to: professional / amable / informal
- [ ] Editor de FAQs (pregunta + resposta, màx 20)
- [ ] Botó "Generar amb IA" → omple el bot automàticament per sector

### Configuració Ca Na Rebecca (via API)
- [x] System prompt: "Ets un assistent de Ca Na Rebecca..."
- [x] Benvinguda: "Hola! Sóc l'assistent virtual de Ca Na Rebecca..."
- [x] Idioma: català

---

## 7. Constructor Workflows IA

### Via API
- [x] `GET /api/automations/templates` → 10 templates disponibles
- [x] `POST /api/automations/templates` → crear template nou
- [x] `PATCH /api/automations/templates/:id` → editar template

### Via UI
- [ ] `http://localhost:3000/admin/automations` — llista de templates visible
- [ ] Botó "Nou template" → modal amb JSON editor
- [ ] Editor JSON amb highlighting i validació de sintaxi
- [ ] Auto-slug generat a partir del nom (ex: "Booking Confirmation" → "booking-confirmation")
- [ ] Categories disponibles com a filtre

---

## Credencials de proves afegides (Fase 3)

| Client | Credencial | Notes |
|--------|-----------|-------|
| Ca Na Rebecca | `ACCESS_TOKEN` (WhatsApp) | Valor de prova |
| Ca Na Rebecca | AI Provider GROQ | Clau de prova (placeholder) |
| Ca Na Rebecca | Domini `canarebecca.cat` | Pendent verificació DNS |

---

## Millores aplicades (2026-04-25)

- [x] **Fix ctaUrl**: validació accepta ara `tel:`, `mailto:`, `wa.me/` a més de `https://`
- [x] **Fix error IA**: missatge "Cap proveïdor IA configurat" visible quan no hi ha GROQ_API_KEY
- [x] **Rebuild backend Docker**: imatge actualitzada amb tots els mòduls Fase 2+3

---

*Última revisió: 2026-04-25 — Proves API: 18/18 ✓ · Proves UI: pendents verificació manual*

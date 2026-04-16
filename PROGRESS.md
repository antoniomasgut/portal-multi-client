# Progrés del Projecte
Última actualització: 2026-04-16

## Resum executiu
- Fase actual: **1 — MVP**
- Mòduls completats: **3 / 13** (Fase 1)
- Pròxim mòdul: **Mòdul 39 — Client de Prova**

---

## Estat per mòdul

### ✅ Mòduls completats
| Mòdul | Data | Notes |
|-------|------|-------|
| 0 — Docker + Caddy | 2026-04-15 | docker-compose, Dockerfiles, Caddyfile, .env.example, esqueleto backend/frontend/ai |
| 1 — Auth + Rols | 2026-04-15 | Login JWT, refresh token HttpOnly cookie, magic link, middleware requireAuth/requireRole, audit log, rate limiting |
| 2 — Clients + Plans + Polítiques | 2026-04-16 | CRUD clients, plans, serveis, subscripcions, pla personalitzat, preus auto-calculats, polítiques descompte/preus, ClientUsage, historial plans |

### 🔄 En progrés
*(cap)*

### ❌ Pendents — Fase 1 (MVP)
- [x] Mòdul 0  — Docker + Caddy + Infraestructura
- [x] Mòdul 1  — Auth + Rols
- [x] Mòdul 2  — Clients + Plans + Polítiques
- [ ] Mòdul 39 — Client de Prova
- [ ] Mòdul 11 — Storage GCS
- [ ] Mòdul 3  — Micro-Landing
- [ ] Mòdul 12 — Seguretat Bàsica
- [ ] Mòdul 33 — Catàleg de Serveis
- [ ] Mòdul 35 — Credencials
- [ ] Mòdul 36 — OAuth Connect
- [ ] Mòdul 34 — Flux de Setup
- [ ] Mòdul 4  — Facturació + Descomptes
- [ ] Mòdul 5  — Dashboard

### Pendents — Fase 2 (Creixement)
- [ ] Mòdul 6  — Automatitzacions n8n
- [ ] Mòdul 10 — Multiidioma
- [ ] Mòdul 13 — Notificacions Email
- [ ] Mòdul 26 — Agent Onboarding
- [ ] Mòdul 27 — Agent Reporting
- [ ] Mòdul 37 — Templates Automatitzacions

### Pendents — Fase 3 (Diferenciació)
- [ ] Mòdul 7  — Landing Pro (IA)
- [ ] Mòdul 8  — RAG / Alf
- [ ] Mòdul 9  — Dominis + DNS
- [ ] Mòdul 14 — RGPD Bàsic
- [ ] Mòdul 24 — Proveïdors IA
- [ ] Mòdul 25 — Agent Suport WhatsApp
- [ ] Mòdul 38 — Constructor Workflows IA

---

## Sessions recents

### Sessió 2026-04-16
**Tasca:** Completar Mòdul 1 i Mòdul 2 + disseny visual admin

**Mòdul 1 — Auth (completat)**
- Login amb JWT (access token + refresh token HttpOnly cookie)
- Magic link per accés sense contrasenya
- Middleware `requireAuth` i `requireRole`
- Registre d'accions a `audit_logs`
- Rate limiting al login (5 intents/IP/15 min)
- Fix CORS: accepta qualsevol port localhost en dev
- Pàgina login amb botó mostrar/ocultar contrasenya

**Mòdul 2 — Clients + Plans (completat)**
- CRUD complet de clients (empresa, contacte, domini, notes)
- Plans estàndard (Bàsic 49€, Pro 99€, Premium 199€, Empresarial 499€)
- Catàleg de 12 serveis amb `setupPrice` i `monthlyPrice`
- Subscripcions: pla estàndard, serveis extra, pla personalitzat
- Preus auto-calculats (suma de serveis), modificables per l'admin
- Models nous: `ClientUsage`, `PlanHistory`, `DiscountPolicy`, `ClientDiscount`, `PricingPolicy`
- Límits d'ús per pla: `maxConversations`, `maxTokens`, `maxAutomations`...
- Funcionalitats per pla: `hasRag`, `hasLandingPro`, `hasCustomDomain`...
- 5 polítiques de descompte inicials (nou client, anual, referits, manual)
- Endpoints: `/api/settings/discount-policies`, `/api/settings/pricing-policy`, `/api/plans`, `/api/clients/:id/usage`

**Disseny visual admin**
- Layout persistent amb sidebar 180px (brand, nav actiu, usuari/logout)
- Top bar 70px sticky amb backdrop-blur i breadcrumb
- Grid de fons subtil en tota l'àrea de contingut
- Totes les pàgines admin segueixen el design system AMG

**Problemes resolts**
- CORS bloquejava port 3001 (frontend arrencava al 3001 perquè 3000 estava ocupat)
- `BASE_URL=http://localhost:3000` al `.env` sobreescrivia la llista d'orígens permesos
- Conflicte de nom `getPlanHistory` importat i exportat al mateix controlador

**Branca:** `develop` — tots els canvis publicats

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projecte

SaaS multi-client (AMG Enginyeria Digital) per gestionar automatitzacions, landings i dominis amb IA integrada. Cada client rep un bot WhatsApp 24/7, landing page generada amb IA, i un panell web.

## Arquitectura

```
portal-multi-client/
  frontend/   → Next.js 14 App Router + TailwindCSS + Zustand + React Query
  backend/    → Node.js 20 + Express + Prisma + PostgreSQL
  ai/         → Python 3.11 + FastAPI + Groq/Ollama + Qdrant (RAG)
  n8n/        → Workflows d'automatització (self-hosted)
  docker/     → Dockerfiles + Caddyfile
  docs/       → Documentació del projecte i specs dels mòduls
  .claude/    → Agents i skills per a sessions de desenvolupament
```

**Ports:** Caddy 80/443 · Frontend 3000 · Backend 4000 · DB 5432 · AI 8000 · n8n 5678 · Qdrant 6333

**Rols d'usuari:** `ADMIN` (accés total) · `CLIENT` (panell propi) · `VISITOR` (landings públiques)

## Comandes

```bash
# Infraestructura
docker-compose up -d          # arrencar tots els serveis
docker-compose ps             # estat dels contenidors
docker-compose logs -f backend  # logs d'un servei

# Backend
cd backend
npm run dev        # servidor amb hot-reload (tsx watch)
npm run build      # compilar TypeScript → dist/
npm test           # Jest
npm run db:migrate # npx prisma migrate dev
npm run db:seed    # npx tsx prisma/seed.ts
npm run db:studio  # Prisma Studio (UI de la BD)

# Frontend
cd frontend
npm run dev    # Next.js dev server
npm run build  # build de producció
npm run lint   # ESLint

# AI
cd ai
uvicorn main:app --reload --port 8000
```

## Flux de treball per mòdul

```
1. git checkout develop && git checkout -b feature/nom-modul
2. Llegir docs/modules/XX-nom.md  →  prompt a Claude Code amb agents + skills corresponents
3. Claude genera codi  →  commits parcials (feat(modul): descripció)
4. docker-compose up -d  →  proves manuals + Playwright
5. Llegir .claude/agents/agent-integration.md  →  verificació de consistència
6. Checklist del mòdul al 100%  →  PR feature/nom → develop
7. Llegir .claude/agents/agent-tracker.md  →  actualitzar PROGRESS.md
```

Els prompts exactes per a cada mòdul estan a **`module_scripts.md`** (a l'arrel del projecte pare).

## Agents disponibles (`.claude/agents/`)

| Agent | Quan usar-lo |
|-------|-------------|
| `agent-backend` | Endpoints Express, serveis, middleware, Prisma |
| `agent-frontend` | Components Next.js, hooks, pàgines |
| `agent-database` | Esquemes Prisma, migracions, seeds |
| `agent-design` | Qualsevol component UI (design system AMG) |
| `agent-storage` | Operacions amb Google Cloud Storage |
| `agent-security` | Encriptació, rate limiting, auditoria |
| `agent-devops` | Docker, Caddy, GitHub Actions |
| `agent-n8n` | Workflows d'automatització |
| `agent-ai` | Groq/Ollama, FastAPI, pipeline RAG |
| `agent-integration` | Verificació E2E al final de cada mòdul (inclou Playwright) |
| `agent-tracker` | Actualitzar PROGRESS.md al final de cada sessió |

## Skills disponibles (`.claude/skills/`)

`skill-api-endpoint` · `skill-migration` · `skill-audit-log` · `skill-crud` · `skill-storage` · `skill-pdf` · `skill-notification` · `skill-component` · `skill-i18n`

## Convencions crítiques

**Backend**
- Resposta API sempre: `{ success: boolean, message: string, data: any }`
- Estructura: routes → controllers → services → db (mai Prisma directe als controllers)
- Validació: Zod a tots els inputs sense excepció
- Soft delete: `deletedAt DateTime?` — mai DELETE físic (excepte RGPD)
- Rate limiting a tots els endpoints; login màx 5 intents/IP/15min

**Base de dades**
- PKs: `String @id @default(uuid())`
- Timestamps: `createdAt` + `updatedAt` sempre presents
- Enums: MAJUSCULES · Taules: `@@map("snake_case_plural")`
- Totes les queries amb `where: { deletedAt: null }`

**Frontend**
- Únicament TailwindCSS — zero CSS inline
- Mai `fetch()` directe, sempre React Query
- Textos sempre via `useTranslation()` — idiomes: ca, es, en

**Storage**
- Cap fitxer al disc del servidor — tot a GCS directament
- Guardar `gcsPath` a la BD (no la URL completa)
- Landings: URL pública · PDFs i docs RAG: URL signada (1h)

**Seguretat**
- Credencials dels clients: AES-256-GCM (`ENCRYPTION_KEY` al .env)
- Passwords: bcrypt salt 12
- Accions importants: sempre a `audit_logs`
- Mai exposar stack traces en producció

## Design System AMG

- **Accent:** `#FF6B00` (taronja) — mai com a fons de pàgina
- **Fons dark:** `#0d0d1a` / `#13132a` / `#1a1a2e`
- **Fonts:** Orbitron (títols) · Rajdhani (text) · Share Tech Mono (labels/botons)
- **Border-radius màxim:** 4px — estètica angular
- **Classes:** `btn-primary` · `btn-outline` · `card` · `stat-card` · `badge` · `form-input` · `form-label` · `alert-{danger,warning,success}`
- Dark mode per defecte via classe `.dark` al `<html>`

## IA configurable per fase

```
Fase 1: IA_PROVIDER_QUALITY=groq  IA_PROVIDER_FAST=groq
Fase 2: IA_PROVIDER_QUALITY=groq  IA_PROVIDER_FAST=local (Ollama gemma3:4b)
Fase 3: IA_PROVIDER_QUALITY=groq  IA_PROVIDER_FAST=local (Ollama gemma4:12b)
```

## Estat actual

Veure **`PROGRESS.md`** per l'estat detallat de cada mòdul.

Fase actual: **1 — MVP** · Pròxim mòdul: **Mòdul 1 — Auth + Rols** (`feature/auth`)

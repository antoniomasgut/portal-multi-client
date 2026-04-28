# GEMINI.md

Aquest fitxer proporciona les directives i convencions per a Gemini CLI quan treballa en aquest repositori.

## El Projecte: Portal Multi-Client (AMG Enginyeria Digital)

SaaS multi-client per gestionar automatitzacions, landings i dominis amb IA integrada. Cada client rep un bot WhatsApp 24/7, landing page generada amb IA, i un panell web.

## Arquitectura

- **frontend/**: Next.js 14 App Router + TailwindCSS + Zustand + React Query.
- **backend/**: Node.js 20 + Express + Prisma + PostgreSQL.
- **ai/**: Python 3.11 + FastAPI + Groq/Ollama + Qdrant (RAG).
- **n8n/**: Workflows d'automatització (self-hosted).
- **docs/**: Documentació detallada del projecte.
- **.claude/**: Referència de patrons i skills originals.

## Mandats de Gemini CLI

1. **Recerca i Estratègia**: Abans de modificar res, analitza l'arquitectura existent i les convencions.
2. **Surgical Updates**: Realitza canvis mínims però complets, respectant el sistema de tipus i les convencions de naming.
3. **Validació**: Després de cada canvi, verifica la integritat (build/lint).
4. **Context d'Agents**: Utilitza les instruccions detallades a `.claude/agents/*.md` com a guies d'expert.

## Convencions Crítiques (Auditoria 2026-04-27)

### Backend (Node.js/Express)
- **Resposta API**: Sempre `{ success: boolean, message: string, data: any }`.
- **Estructura**: `routes` → `controllers` → `services` → `db`.
- **PROHIBIT**: No facis crides directes a `prisma` des dels controllers. Tota la persistència ha d'anar als `services`.
- **SOFT DELETE**: Obligatori incloure `where: { deletedAt: null }` a totes les consultes de models que tinguin aquest camp (Client, User, Subscription, ClientAutomation, Invoice, etc.).
- **Validació**: Zod obligatori a tots els inputs (`src/schemas/`). Utilitza `.parse()` dins el controller per validar el body.

### Frontend (Next.js/Tailwind)
- **Styling**: TailwindCSS pur, evitar CSS-in-JS.
- **I18n**: Tots els textos via `useTranslation()`.

## Comandes Principals

```bash
# Verificar entorn
npm run check-env (a l'arrel)

# Infraestructura
docker-compose up -d

# Backend
cd backend && npm run dev
```

## Workflow de Transició
S'ha realitzat una auditoria completa per assegurar que el projecte pot funcionar de forma **100% gratuïta** (usant Groq/Ollama i Resend/Mailtrap). S'han corregit múltiples desviacions arquitectòniques on es cridava Prisma directament des dels controllers.

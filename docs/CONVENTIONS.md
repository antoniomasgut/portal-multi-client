# Convencions de Codi

## General
- Idioma del codi: anglès
- Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Una branca per mòdul, merge a develop quan funciona

## Backend (Node.js / Express)
- Estructura: routes → controllers → services → db
- Autenticació: JWT (1h) + refresh token (7d)
- Validació: Zod per tots els inputs
- ORM: Prisma + PostgreSQL
- Errors: middleware centralitzat d'errors
- Resposta: sempre `{ success, message, data }`
- Rate limiting: express-rate-limit a tots els endpoints

## Frontend (Next.js)
- Components: PascalCase
- Hooks: prefix `use`
- Estils: TailwindCSS únicament
- Estat global: Zustand
- Formularis: React Hook Form + Zod
- Peticions: React Query (mai fetch directe)

## Base de dades
- Taules: snake_case plural
- PKs: uuid()
- Timestamps: createdAt + updatedAt sempre
- Soft delete: deletedAt nullable
- Enums: MAJUSCULES
- Logs d'auditoria: taula `audit_logs` per accions importants

## Seguretat
- Rate limiting per IP a tots els endpoints
- Logs d'auditoria per: login, canvis de pla, creació/eliminació de recursos
- Contrasenyes: mínim 8 caràcters, majúscula, número i símbol
- Headers de seguretat via Caddy

## Docker
- Variables d'entorn: sempre via .env
- Mai credencials hardcodades
- Health check per cada servei

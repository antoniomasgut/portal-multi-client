# Agent Integration — Verificació de Consistència

## Rol
Ets el verificador d'integració del Portal Multi-Client. Revisar que el codi generat és consistent entre frontend, backend i BD, i que segueix totes les convencions del projecte.

## Quan usar-me
Al final de cada mòdul, amb el prompt:
```
Llegeix .claude/agents/agent-integration.md
i verifica la consistència del mòdul [nom] acabat de generar.
```

## Checklist de verificació

### Consistència API ↔ Frontend
- [ ] Tots els endpoints documentats al mòdul estan implementats
- [ ] Les URLs al frontend coincideixen exactament amb les del backend
- [ ] El format de resposta `{ success, message, data }` es respecta arreu
- [ ] Els hooks React Query usen les queryKeys correctes
- [ ] Errors de l'API gestionats al frontend (toast/alert visible)

### Consistència BD ↔ Backend
- [ ] Tots els camps del schema Prisma estan als DTOs Zod
- [ ] Soft delete: totes les queries inclouen `where: { deletedAt: null }`
- [ ] Relacions: els `include` de Prisma coincideixen amb el que retorna l'API
- [ ] Seeds: els valors inicials coincideixen amb el business_plan.md
- [ ] Timestamps `createdAt`/`updatedAt` presents a tots els models nous

### Seguretat
- [ ] Tots els endpoints protegits amb `requireAuth` (excepte els públics)
- [ ] Endpoints d'admin protegits amb `requireRole('ADMIN')`
- [ ] Rate limiting actiu als endpoints nous
- [ ] Inputs validats amb Zod al backend
- [ ] Accions importants registrades a `audit_logs`

### Design System
- [ ] Cap color hardcodat al JSX (usar variables CSS)
- [ ] Botons usant classes `btn-primary` o `btn-outline`
- [ ] Cap text hardcodat (tot via i18n o constant)
- [ ] Dark mode funcionant als components nous
- [ ] Cap `border-radius > 4px`

### Storage
- [ ] Cap fitxer guardat al disc del servidor
- [ ] `gcsPath` guardat a la BD (no la URL completa)
- [ ] PDFs privats amb URL signada
- [ ] Landings públiques sense URL signada

### Docker
- [ ] Variables noves afegides al `.env.example`
- [ ] Serveis nous afegits al `docker-compose.yml` si escau
- [ ] Health check present

## Informe de verificació
Per cada problema trobat, indica:
1. **On:** fitxer i línia
2. **Problema:** descripció concisa
3. **Fix:** com corregir-ho

Si tot és correcte, escriu: `VERIFICACIÓ OK — Mòdul [nom] consistent.`

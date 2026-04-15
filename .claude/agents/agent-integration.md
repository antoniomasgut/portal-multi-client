# Agent Integration — Verificació de Consistència

## Rol
Ets el verificador d'integració del Portal Multi-Client. Revisar que el codi generat és consistent entre frontend, backend i BD, i que segueix totes les convencions del projecte.

## Quan usar-me
Al final de cada mòdul, amb el prompt:
```
Llegeix .claude/agents/agent-integration.md
i verifica la consistència del mòdul [nom] acabat de generar.
Usa Playwright per provar l'aplicació en http://localhost:3000 i http://localhost:4000.
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

## Verificació amb Playwright (proves E2E)

Després de passar la checklist estàtica, usar Playwright per verificar l'aplicació en execució.
Prerequisit: `docker-compose up -d` i tots els contenidors `healthy`.

### Proves generals (tots els mòduls)
```
- Navegar a http://localhost:3000 → ha de carregar sense errors de consola
- Fer captura de pantalla de la pàgina principal
- Verificar que http://localhost:4000/health retorna {"status":"ok"}
```

### Proves per mòdul

**Mòdul 0 — Docker**
```
- http://localhost:3000 → pàgina AMG visible
- http://localhost:4000/health → {"status":"ok"}
- http://localhost:8000/health → {"status":"ok"}
```

**Mòdul 1 — Auth**
```
- GET http://localhost:4000/api/auth/me sense token → 401
- POST http://localhost:4000/api/auth/login amb credencials incorrectes → 401
- POST http://localhost:4000/api/auth/login amb credencials correctes → token JWT
- 6è intent de login → 429 (rate limiting)
- Accedir a ruta admin sense token → redirigit al login
- Login d'admin → dashboard visible
- Login d'client → panell client visible (no admin)
```

**Mòdul 2 — Clients**
```
- Crear client des del formulari admin → apareix a la llista
- Client amb rol CLIENT no pot veure /admin/* → 403
- Codis referral generats automàticament
```

**Mòdul 3 — Micro-Landing**
```
- Crear client → GET /v/{slug} accessible sense autenticació
- La landing mostra el nom i sector del client
```

**Mòdul 4 — Facturació**
```
- Generar factura → PDF descarregable
- Factura mostra preu base, descomptes i total
```

**Mòdul 5 — Dashboard**
```
- Dashboard admin: stats de clients, ingressos i alertes visibles
- Panell client: pla actiu, barres de progrés d'ús, URL landing
- Toggle dark/light funciona
```

### Patró de captura per cada prova
Per cada prova important, fer:
1. Navegar a la URL
2. Captura de pantalla
3. Verificar l'element esperat (text, status code, component)
4. Reportar: ✅ OK o ❌ Error + descripció

---

## Informe de verificació
Per cada problema trobat, indica:
1. **On:** fitxer i línia
2. **Problema:** descripció concisa
3. **Fix:** com corregir-ho

Si tot és correcte, escriu: `VERIFICACIÓ OK — Mòdul [nom] consistent.`

# Progrés del Projecte
Última actualització: 2026-04-24

## Resum executiu
- Fase actual: **3 — Diferenciació** 🔄 EN PROGRÉS (Fase 2 completada)
- Mòduls completats Fase 1: **13 / 13** ✅
- Mòduls completats Fase 2: **6 / 6** ✅ FASE 2 COMPLETADA

---

## Estat per mòdul

### ✅ Mòduls completats
| Mòdul | Data | Notes |
|-------|------|-------|
| 0 — Docker + Caddy | 2026-04-15 | docker-compose, Dockerfiles, Caddyfile, .env.example, esqueleto backend/frontend/ai |
| 1 — Auth + Rols | 2026-04-15 | Login JWT, refresh token HttpOnly cookie, magic link, middleware requireAuth/requireRole, audit log, rate limiting |
| 2 — Clients + Plans + Polítiques | 2026-04-16 | CRUD clients, plans, serveis, subscripcions, pla personalitzat, preus auto-calculats, polítiques descompte/preus, ClientUsage, historial plans |
| 39 — Client de Prova | 2026-04-16 | isTest flag en Client i AuditLog, seed test client, badge TEST al frontend, filtrat de stats al dashboard, wiring isTest als audit logs |
| 12 — Seguretat Bàsica | 2026-04-16 | helmet, CORS regex, rate limiting global+login+magic-link, errorHandler, bcrypt 12, JWT Bearer + refresh HttpOnly, requireAuth/requireRole/requireOwnClient, Zod, soft delete |
| 33 — Catàleg de Serveis | 2026-04-16 | Fix preus (setupPrice/monthlyPrice no es desaven), endpoint /all per admin, toggle activar/desactivar serveis, UI amb badge INACTIU i botó ON/OFF |
| 35 — Credencials | 2026-04-16 | Model ClientCredential, AES-256-GCM encrypt/decrypt, CRUD endpoints /api/clients/:id/credentials, CredentialsPanel al ClientForm |
| 36 — OAuth Connect | 2026-04-16 | Model OAuthState (CSRF), flux start/callback Meta WhatsApp, ConnectionsPanel amb estat connectat/desconnectat, disconnect endpoint |
| 34 — Flux de Setup | 2026-04-16 | SetupWizard 4 passos (Verificar, Connexions, Credencials, Completat), botó SETUP a la llista de clients |
| 11 — Storage GCS   | 2026-04-16 | gcs.ts utility (upload/publicUrl/signedUrl/delete/ping), AES-256-GCM ready. **Pendent:** GCS_KEY_FILE real |
| 3  — Micro-Landing | 2026-04-19 | Model ClientLanding + slug auto, landing service (upsert/publish/unpublish), LandingEditor al ClientForm, pàgina pública /l/[slug]. **Rev.2:** fix formularis niats (GET natiu), logo hero centrat sense títol, títol opcional, keepDirtyValues+staleTime, 4 estils + 5 fonts |
| 4  — Facturació    | 2026-04-16 | Invoice+InvoiceItem models, numeració auto (YYYY-NNNN), càlcul de descomptes actius, stats, /admin/invoices page, modal generar, accions pagar/cancel·lar |
| 5  — Dashboard client | 2026-04-16 | Portal client /client/dashboard (subscripció, serveis, barres d'ús), /client/invoices, layout CLIENT amb auth guard, redirecció automàtica per rol |
| 40 — Activació Serveis | 2026-04-19 | Camp `active`+`activatedAt` a `subscription_services`, endpoint `PATCH /api/clients/:id/services/:serviceId/active`, `ClientServiceManager` amb toggle per servei, panels de config (Landing/WhatsApp/n8n) + tutorial colapsable per cada servei |

### 🔄 En progrés
*(cap)*

### ❌ Pendents — Fase 1 (MVP)
- [x] Mòdul 0  — Docker + Caddy + Infraestructura
- [x] Mòdul 1  — Auth + Rols
- [x] Mòdul 2  — Clients + Plans + Polítiques
- [x] Mòdul 39 — Client de Prova
- [x] Mòdul 11 — Storage GCS *(codi complet, pendent credentials GCS reals)*
- [x] Mòdul 3  — Micro-Landing
- [x] Mòdul 12 — Seguretat Bàsica
- [x] Mòdul 33 — Catàleg de Serveis
- [x] Mòdul 35 — Credencials
- [x] Mòdul 36 — OAuth Connect
- [x] Mòdul 34 — Flux de Setup
- [x] Mòdul 4  — Facturació + Descomptes
- [x] Mòdul 5  — Dashboard client

### Pendents — Fase 2 (Creixement)
- [x] Mòdul 6  — Automatitzacions n8n
- [x] Mòdul 10 — Multiidioma
- [x] Mòdul 13 — Notificacions Email
- [x] Mòdul 26 — Agent Onboarding
- [x] Mòdul 27 — Agent Reporting
- [x] Mòdul 37 — Templates Automatitzacions

### Pendents — Fase 3 (Diferenciació)
- [ ] Mòdul 7  — Landing Pro (IA)
- [ ] Mòdul 8  — RAG / Alf
- [x] Mòdul 9  — Dominis + DNS
- [x] Mòdul 14 — RGPD Bàsic
- [ ] Mòdul 24 — Proveïdors IA
- [ ] Mòdul 25 — Agent Suport WhatsApp
- [ ] Mòdul 38 — Constructor Workflows IA

---

## Sessions recents

### Sessió 2026-04-24 (Fase 3 — Mòduls 14 + 9)

**Mòdul 9 — Dominis + DNS (completat)**
- BD: model `ClientDomain` + enum `DomainStatus` (PENDING/VERIFIED/FAILED) → `prisma db push` ✅
- `domain.service.ts`: `addDomain`, `verifyDomain` (CNAME via `node:dns` + TXT fallback), `removeDomain`, `listAllDomains`, `getVerificationInstructions`
- Endpoints: `GET|POST /api/clients/:id/domains`, `POST .../verify`, `GET .../instructions`, `DELETE .../:domainId`, `GET /api/domains`
- `DomainsPanel.tsx` integrat a `ClientServiceManager` per slug `domini-*`
- Pàgina admin `/admin/domains` — vista global amb stats verificats/pendents/fallats
- Pàgina client `/client/domain` — instruccions DNS amb registres CNAME i TXT
- Nav admin + client ampliat. Variables `.env.example`: `PORTAL_CNAME`, `ADMIN_EMAIL`
- TypeScript: 0 errors backend + 0 errors frontend

### Sessió 2026-04-24 (Fase 3 — Mòdul 14)
**Tasca:** Mòdul 14 — RGPD Bàsic

**Mòdul 14 — RGPD Bàsic (completat)**
- BD: models `ConsentLog` + `DataExportRequest` + enums `ConsentType` / `ExportStatus` → `prisma db push` ✅
- `rgpd.service.ts`: `logConsent`, `getActiveConsents`, `requestDataExport` (async en background), `getExportDownloadUrl`, `anonymizeClient` (transacció: anonimitza client + usuaris + revoca consentiments)
- Exportació JSON: client, subscripcions, factures, automatitzacions, consentiments, audit log (últims 200)
- `GET|POST /api/clients/:id/consent` — gestió consentiments
- `POST|GET /api/clients/:id/data-export` — sol·licitar i llistar exportacions
- `GET /api/clients/:id/data-export/:exportId/download` — URL signada GCS (1h)
- `DELETE /api/clients/:id/anonymize` — dret d'oblit (admin)
- `CookieBanner.tsx` — banner inline styles (compatible Server Components), toggle analítiques/màrqueting, desa a localStorage
- Banner integrat a les landings públiques `/l/[slug]`
- Pàgina client `/client/privacy` — toggle consentiments, sol·licitar exportació, dret d'oblit via email
- Nav client ampliat amb "PRIVACITAT"
- TypeScript: 0 errors backend + 0 errors frontend



### Sessió 2026-04-24 (Fase 2 completada)
**Tasca:** Mòdul 26 (Onboarding) + Mòdul 27 (Reporting) + Mòdul 37 (Templates)

**Mòdul 26 — Agent Onboarding (completat)**
- `onboarding.service.ts` — seqüència dia 0/1/7/15/30, branching ACTIVE/INACTIVE dia 7
- `OnboardingProgress` model ja existent a Prisma (del context anterior)
- Plantilles email: ONBOARDING_DAY1, ONBOARDING_DAY7_ACTIVE, ONBOARDING_DAY7_INACTIVE, ONBOARDING_DAY15, ONBOARDING_DAY30
- `startOnboarding()` connectat a `client.controller.ts` (createClient)
- `markAccessed()` connectat a `auth.service.ts` (login + verifyMagicLink)
- Rutes: `GET /api/onboarding`, `GET /api/onboarding/process`, `GET /api/onboarding/:id`
- Pàgina admin `/admin/onboarding` amb taula de progrés per client, botó "PROCESSAR PENDENTS"

**Mòdul 27 — Agent Reporting (completat)**
- `reporting.service.ts` — PDFs amb PDFKit (admin setmanal + client mensual)
- Graceful si GCS no configurat (genera PDF però no el puja)
- Emails REPORT_ADMIN_WEEKLY, REPORT_CLIENT_MONTHLY connectats
- Rutes: `POST /api/reports/admin/weekly`, `POST /api/reports/clients/monthly`, `POST /api/reports/clients/:id/monthly`

**Mòdul 37 — Templates Automatitzacions (completat)**
- `listTemplatesWithUsage()` — count de clients per template via groupBy
- `createTemplate()`, `updateTemplate()`, `toggleTemplate()`, `testTemplate()` (crea+elimina workflow n8n)
- Endpoints: `GET /usage`, `POST /templates`, `PATCH /:templateId`, `PATCH /:templateId/active`, `POST /:templateId/test`
- Pàgina admin `/admin/automations` amb toggle actiu/inactiu, badge clients, test n8n, stats per categoria
- Nav admin ampliat: Onboarding + Automatitzacions (ja existia als i18n)
- TypeScript: 0 errors backend + 0 errors frontend

**Pendent configurar per producció:**
- `ADMIN_EMAIL` al .env per rebre informes setmanals
- GCS credentials per pujar PDFs



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

---

### Sessió 2026-04-24 (continuació)
**Tasca:** Mòdul 6 — Automatitzacions n8n

**Mòdul 6 — Automatitzacions n8n (completat)**
- BD: models `AutomationTemplate`, `ClientAutomation`, `AutomationExecution` + enums `AutomationStatus`, `ExecutionStatus` → `prisma db push` ✅
- Seed: 10 templates inicials (reserva cita, pressupost, recordatori, ressenyes, leads web, factura, benvinguda, recuperació, comanda, estoc) ✅
- `src/services/n8n.service.ts` — wrapper API n8n (create/activate/deactivate/delete/executions) amb graceful error si n8n no disponible
- `src/services/automation.service.ts` — lògica negoci (create, toggle, delete, recordExecution) amb notificació admin si 3 errors
- `src/controllers/automation.controller.ts` + `src/routes/automations.ts` — endpoints REST
- Rutes registrades: `GET/POST /api/clients/:id/automations`, `PATCH .../toggle`, `DELETE .../:autoId`, `POST /api/automations/webhook/execution`
- Frontend hook: `useAutomations.ts` (useClientAutomations, useCreateAutomation, useToggleAutomation, useDeleteAutomation, useAutomationTemplates)
- Frontend admin: `AutomationsPanel.tsx` integrat al `ClientServiceManager` per slug `automatitzacions`
- Frontend client: `/client/automations/page.tsx` — vista amb toggle pause/resume i historial execucions
- Layout client: nav ampliat amb "AUTOMATITZACIONS"
- TypeScript: 0 errors backend + 0 errors frontend

---

### Sessió 2026-04-24
**Tasca:** Mòdul 10 (Multiidioma) + Mòdul 13 (Notificacions Email)

**Mòdul 10 — Multiidioma (completat)**
- Fitxers de traducció JSON per ca/es/en: common, auth, admin, client
- `useI18nStore` (Zustand) — idioma persistent a localStorage
- `useTranslation(namespace)` — hook custom per App Router, imports estàtics (sense fetch)
- `LanguageSwitcher` — component UI integrat al sidebar admin i client
- Layouts admin i client migrats a `useTranslation` (nav, accions, títols)
- Backend: `src/utils/i18n.ts` amb funció `t(key, lang, vars)` per emails i PDFs (ca/es/en)

**Mòdul 13 — Notificacions Email (completat)**
- Model `Notification` + enums `NotificationEvent` / `NotificationStatus` → `prisma db push` ✅
- `src/services/emailTemplates.ts` — plantilles HTML inline per tots els events (WELCOME, INVOICE_GENERATED, PAYMENT_REMINDER, USAGE_WARNING, MAGIC_LINK, OAUTH_CONNECTED, PLAN_CHANGED)
- `src/services/notifications.ts` — servei `sendNotification()` amb 3 reintents + registre a BD
- Emails connectats: magic link (auth.service), benvinguda (client.controller), factura generada (invoice.controller)
- `.env.example` actualitzat: `SMTP_FROM`, `PORTAL_URL`
- TypeScript: 0 errors backend + 0 errors frontend

**Pendent configurar per producció:**
- Variables SMTP_USER / SMTP_PASS amb credencials reals (Mailtrap per dev ja configurat)

---

### Sessió 2026-04-19
**Tasca:** Fixes Micro-Landing + Sistema d'activació de serveis per client

**Mòdul 3 rev.2 — Micro-Landing (fixes)**
- **Fix crític:** `LandingEditor` estava dins el `<form>` de `ClientForm` — formularis niats fan que el navegador faci una petició GET nativa, ignorant React. Camps gestionats via `setValue` (fontPair, style, logoUrl) no s'enviaven. Solució: LandingEditor, ConnectionsPanel i CredentialsPanel moguts fora del `</form>`
- Logo com a hero: quan no hi ha títol i hi ha logo, es mostra gran i centrat com a element principal (`HeroLogo` h-24/h-36 + drop-shadow)
- Títol opcional: schema frontend (`z.string().optional()`) i backend (`z.string().max(100).optional()`) accepten títol buit
- `keepDirtyValues: true` al `reset()`: evita sobreescriure canvis de l'usuari quan React Query refetcha
- `staleTime: 5 * 60 * 1000`: evita refetch en segon pla durant 5 minuts
- Eliminat `brightness-0 invert` del HeroLogo que feia els logos invisibles en fons clars
- Pàgina de previsualització admin `/admin/landing-preview/[slug]` sense restricció de publicació
- `filterProvider` a `ConnectionsPanel` i `filterService` a `CredentialsPanel` per mostrar només el proveïdor/servei rellevant

**Mòdul 40 — Activació de serveis (nou)**
- BD: camp `active Boolean @default(false)` + `activatedAt DateTime?` a `subscription_services`
- Backend: `PATCH /api/clients/:clientId/services/:serviceId/active` (controller `serviceActivation.controller.ts`)
- Frontend hook: `useToggleService(clientId)` — invalida `['client', clientId]` i `['clients']`
- `ClientServiceManager`: llista tots els serveis contractats de la subscripció activa amb:
  - Toggle ACTIVAR / DESACTIVAR per servei
  - Badge ACTIU/INACTIU + EXTRA
  - Auto-expandeix el panel en activar
  - Botó CONFIGURAR ▼ per obrir/tancar
- Panels de configuració per slug:
  - `landing-page-*` → `LandingEditor` complet
  - `whatsapp-bot` → Connexió WhatsApp OAuth + connexió n8n + credencials n8n
  - `automatitzacions` → Connexió n8n + credencials n8n
  - Resta → "Configuració disponible pròximament"
- `ServiceTutorial`: acordió colapsable amb passos numerats específics per a Landing (5 passos), WhatsApp (4 passos) i Automatitzacions (4 passos)

**Branca:** `develop` — pendent de commit

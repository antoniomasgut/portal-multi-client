# Iteració d'auditoria i millores — 2026-04-27

Branca: `feature/audit-improvements`

## Estat general

| Mòdul | Playwright | Anàlisi codi | Millores | Commit |
|---|---|---|---|---|
| 1 — Auth + Login | ✅ OK | ✅ | ✅ | ed834b9 |
| 2 — Clients + Plans | ✅ OK | ✅ corregit | ✅ cerca+null | ed834b9 |
| 3 — Micro-Landing | ⏳ | ⏳ | ⏳ | — |
| 4 — Facturació | ✅ OK | ✅ corregit | ✅ label clar | ed834b9 |
| 5 — Dashboard client | ✅ OK | ✅ corregit | ✅ null state | ed834b9 |
| 7 — Landing Pro IA | ⏳ | ⏳ | ⏳ | — |
| 8 — RAG / Alf | ⏳ | ⏳ | ⏳ | — |
| 10 — Multiidioma | ✅ OK | ✅ corregit | ✅ categories | ed834b9 |
| 25 — WhatsApp Bot | ⏳ | ⏳ | ⏳ | — |
| 33 — Catàleg serveis | ✅ OK | ⚠️ semàntica | ⏳ pendent | — |
| 34 — Setup Wizard | ⏳ | ⏳ | ⏳ | — |
| 35 — Credencials | ⏳ | ⏳ | ⏳ | — |
| 36 — OAuth | ⏳ | ⏳ | ⏳ | — |
| 38 — Workflow Builder | ✅ OK | ✅ corregit | ✅ isActive | ed834b9 |
| 40 — Activació serveis | ⏳ | ⏳ | ⏳ | — |
| 41 — Telegram Bot | ⏳ | ⏳ | ⏳ | — |

Llegenda: ⏳ pendent · 🔧 corregint · ✅ OK · ⚠️ millores pendents · ❌ errors

---

## Bugs i millores identificades

### 🔴 CRÍTIQUES

| # | Fitxer | Problema |
|---|---|---|
| C1 | `backend/src/services/automation.service.ts:169` | DELETE físic en lloc de soft delete |
| C2 | `backend/src/routes/automations.ts:31` | Client pot veure automations d'altres clients (falta ownership check) |
| C3 | `backend/src/controllers/client.controller.ts:101` | Soft delete no neteja subscriptions/users/automations relacionades |

### 🟠 ALTES

| # | Fitxer | Problema |
|---|---|---|
| A1 | `frontend/.../automations/page.tsx` | 6 claus i18n sense traduir: `category_billing`, `category_booking`, `category_marketing`, `category_onboarding`, `category_retention`, `category_sales` |
| A2 | `frontend/.../clients/page.tsx:193` | Null-check faltant en `activeSub` (crash potencial) |
| A3 | `frontend/.../dashboard/page.tsx:10` | MRR: `Number(Decimal)` pot retornar NaN |
| A4 | `backend/src/services/automations.service.ts` | `updateTemplate` no accepta `isActive` |
| A5 | `backend/src/services/client.service.ts:32` | Queries sense `take` limit (problemes de rendiment) |

### 🟡 MITJANES

| # | Fitxer | Problema |
|---|---|---|
| M1 | `frontend/.../client/dashboard/page.tsx:47` | `if (!data) return null` → pàgina en blanc sense context |
| M2 | `frontend/.../admin/clients/page.tsx:29` | Errors de delete no es mostren a l'usuari |
| M3 | `frontend/.../admin/automations/page.tsx` | Modal sense `role="dialog"` (accessibilitat) |
| M4 | `frontend/.../admin/clients/page.tsx` | Columna "USU." truncada i poc clara |
| M5 | `frontend/.../admin/invoices/page.tsx` | Etiqueta "COBRAT TOTAL" confusa (mostra 0€ quan hi ha factures pendents) |
| M6 | `frontend/.../admin/clients/page.tsx` | Sense cerca/filtre de clients |
| M7 | `backend/src/services/automations.service.ts:194` | Webhook extern sense audit log |

---

## Millores implementades

### Commit ed834b9 — 2026-04-27

**Seguretat:**
- ✅ C2: ownership check — CLIENT no pot veure automations d'altres clients
- ✅ A2: optional chaining en `activeSub` — evita crash si client sense subscripció

**Integritat de dades:**
- ✅ C1: soft delete en `deleteAutomation` (`deletedAt` en lloc de DELETE físic)
- ✅ Schema: afegit `deletedAt DateTime?` a `ClientAutomation`

**Backend:**
- ✅ A4: `updateTemplate` ara accepta `isActive`, `slug`, `workflowJson`
- ✅ A5: límits `take` a queries de client (subscriptions: 10, users: 50)

**Frontend UX:**
- ✅ A3: MRR usa `parseFloat(String(...))` per evitar NaN amb Decimal de Prisma
- ✅ M1: dashboard client mostra missatge en lloc de pàgina en blanc
- ✅ M2: `handleDelete` mostra alert si falla l'eliminació
- ✅ M6: cerca de clients per nom/email al llistat admin (filtrat en temps real)
- ✅ M4: columna "USU." → "Usuaris/Usuarios/Users"
- ✅ M5: "COBRAT TOTAL" → "Cobrat (pagat)" per deixar clar que és PAID

**i18n (ca/es/en):**
- ✅ A1: 6 claus de categoria (`billing`, `booking`, `marketing`, `onboarding`, `retention`, `sales`) ara traduïdes
- ✅ Afegida clau `search_placeholder` i `dashboard.no_data`

**Verificació Playwright:** 4/4 tests ✅

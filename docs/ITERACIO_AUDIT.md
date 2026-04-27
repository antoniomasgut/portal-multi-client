# Iteració d'auditoria i millores — 2026-04-27

Branca: `feature/audit-improvements`

## Estat general

| Mòdul | Playwright | Anàlisi codi | Millores | Commit |
|---|---|---|---|---|
| 1 — Auth + Login | ✅ OK | ✅ | ✅ | — |
| 2 — Clients + Plans | ✅ OK | ⚠️ problemes | ⏳ | — |
| 3 — Micro-Landing | ⏳ | ⏳ | ⏳ | — |
| 4 — Facturació | ✅ OK | ⚠️ UX | ⏳ | — |
| 5 — Dashboard client | ✅ OK | ⚠️ null state | ⏳ | — |
| 7 — Landing Pro IA | ⏳ | ⏳ | ⏳ | — |
| 8 — RAG / Alf | ⏳ | ⏳ | ⏳ | — |
| 10 — Multiidioma | ⚠️ categories | ⚠️ isActive | ⏳ | — |
| 25 — WhatsApp Bot | ⏳ | ⏳ | ⏳ | — |
| 33 — Catàleg serveis | ✅ OK | ⚠️ semàntica | ⏳ | — |
| 34 — Setup Wizard | ⏳ | ⏳ | ⏳ | — |
| 35 — Credencials | ⏳ | ⏳ | ⏳ | — |
| 36 — OAuth | ⏳ | ⏳ | ⏳ | — |
| 38 — Workflow Builder | ⚠️ i18n bug | ⚠️ isActive | ⏳ | — |
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

*(s'omplirà durant la iteració)*

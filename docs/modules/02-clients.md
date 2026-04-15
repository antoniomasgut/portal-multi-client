# Mòdul 2 — Gestió de Clients i Plans

## Fase: 1 — MVP
## Branca Git: `feature/clients`

## Endpoints Clients
- GET    /api/clients
- GET    /api/clients/:id
- POST   /api/clients
- PUT    /api/clients/:id
- DELETE /api/clients/:id

## Endpoints Plans
- GET    /api/plans
- POST   /api/plans (admin)
- PUT    /api/plans/:id (admin)
- DELETE /api/plans/:id (admin)

## Endpoints Polítiques
- GET    /api/settings/discount-policies
- PUT    /api/settings/discount-policies/:id
- PATCH  /api/settings/discount-policies/:id/toggle
- GET    /api/settings/pricing-policies
- PUT    /api/settings/pricing-policies
- POST   /api/discount-policies/:clientId/manual

## Esquema Prisma
```prisma
model Client {
  id              String         @id @default(uuid())
  name            String
  email           String         @unique
  company         String?
  taxId           String?
  language        String         @default("ca")
  planId          String?
  plan            Plan?          @relation(fields: [planId], references: [id])
  lockedPrice     Float?
  status          ClientStatus   @default(ACTIVE)
  billingType     BillingType    @default(MONTHLY)
  referralCode    String?        @unique
  referredById    String?
  referredBy      Client?        @relation("Referrals", fields: [referredById], references: [id])
  referrals       Client[]       @relation("Referrals")
  planHistory     PlanHistory[]
  discounts       ClientDiscount[]
  priceChanges    ClientPriceChange[]
  usageStats      ClientUsage?
  landings        Landing[]
  domains         Domain[]
  invoices        Invoice[]
  deletedAt       DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model Plan {
  id                    String         @id @default(uuid())
  name                  String
  description           String?
  price                 Float
  currency              String         @default("EUR")
  isCustom              Boolean        @default(false)
  isArchived            Boolean        @default(false)

  /// Límits del pla
  maxConversations      Int?           // null = ilimitat
  maxTokens             Int?           // null = ilimitat
  maxAutomations        Int?
  maxIntegrations       Int?
  maxRagDocuments       Int?
  maxRagDocumentSizeMb  Int?
  maxWhatsappNumbers    Int            @default(1)

  /// Funcionalitats incloses
  hasLandingPro         Boolean        @default(false)
  hasCustomDomain       Boolean        @default(false)
  hasTelegram           Boolean        @default(false)
  hasEmailCorp          Boolean        @default(false)
  hasGoogleCalendar     Boolean        @default(false)
  hasGoogleSheets       Boolean        @default(false)
  hasRag                Boolean        @default(false)

  /// Preus d'excedents
  extraConversationPrice Float         @default(0.005)
  extraTokenPrice        Float         @default(0.0001)
  extraAutomationPrice   Float         @default(5.0)
  extraRagDocPrice       Float         @default(2.0)

  priceHistory          PlanPriceHistory[]
  clients               Client[]
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
}

/// Ús actual del client (reinicia cada mes)
model ClientUsage {
  id                    String   @id @default(uuid())
  clientId              String   @unique
  client                Client   @relation(fields: [clientId], references: [id])
  conversationsUsed     Int      @default(0)
  tokensUsed            Int      @default(0)
  automationsUsed       Int      @default(0)
  ragDocsUsed           Int      @default(0)
  periodStart           DateTime @default(now())
  periodEnd             DateTime
  updatedAt             DateTime @updatedAt
}

model PlanPriceHistory {
  id             String          @id @default(uuid())
  planId         String
  plan           Plan            @relation(fields: [planId], references: [id])
  oldPrice       Float
  newPrice       Float
  affectsClients PriceChangeScope
  noticeDays     Int
  reason         String?
  scheduledAt    DateTime?
  appliedAt      DateTime?
  createdBy      String
  createdAt      DateTime        @default(now())
}

model ClientPriceChange {
  id          String   @id @default(uuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])
  oldPrice    Float
  newPrice    Float
  notifiedAt  DateTime?
  appliesAt   DateTime
  appliedAt   DateTime?
  reason      String?
  createdAt   DateTime @default(now())
}

model PricingPolicy {
  id                    String   @id @default(uuid())
  minNoticeDays         Int      @default(30)
  allowImmediateChange  Boolean  @default(false)
  notifyClientsOnChange Boolean  @default(true)
  updatedBy             String?
  updatedAt             DateTime @updatedAt
  createdAt             DateTime @default(now())
}

model DiscountPolicy {
  id             String       @id @default(uuid())
  type           DiscountType @unique
  isActive       Boolean      @default(true)
  percentage     Float?
  monthsFree     Int?
  durationMonths Int?
  description    String?
  updatedBy      String?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}

model ClientDiscount {
  id          String       @id @default(uuid())
  clientId    String
  client      Client       @relation(fields: [clientId], references: [id])
  type        DiscountType
  percentage  Float?
  monthsFree  Int?
  appliedAt   DateTime     @default(now())
  expiresAt   DateTime?
  isActive    Boolean      @default(true)
  reason      String?
  appliedBy   String?
}

model PlanHistory {
  id        String   @id @default(uuid())
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id])
  planId    String
  planName  String
  price     Float
  reason    String?
  changedAt DateTime @default(now())
}

enum ClientStatus     { ACTIVE SUSPENDED CANCELLED }
enum BillingType      { MONTHLY ANNUAL }
enum PriceChangeScope { NEW_CLIENTS_ONLY ALL_CLIENTS }
enum DiscountType     {
  NEW_CLIENT
  ANNUAL_PAYMENT
  REFERRAL_REFERRER
  REFERRAL_NEW
  MANUAL
}
```

## Seeds inicials
```typescript
await prisma.plan.createMany({ data: [
  {
    name: 'Bàsic', price: 49,
    maxConversations: 1000, maxTokens: 1000000,
    maxAutomations: 3, maxIntegrations: 1,
    maxWhatsappNumbers: 1,
    hasRag: false, hasLandingPro: false,
    hasCustomDomain: false, hasTelegram: false,
    extraConversationPrice: 0.005,
  },
  {
    name: 'Pro', price: 99,
    maxConversations: 3000, maxTokens: 5000000,
    maxAutomations: 10, maxIntegrations: 5,
    maxRagDocuments: 10, maxRagDocumentSizeMb: 5,
    maxWhatsappNumbers: 1,
    hasRag: true, hasLandingPro: true,
    hasTelegram: true, hasEmailCorp: true,
    hasGoogleCalendar: true, hasGoogleSheets: true,
    extraConversationPrice: 0.005,
  },
  {
    name: 'Premium', price: 199,
    maxConversations: 10000, maxTokens: 20000000,
    maxAutomations: 50, maxIntegrations: 15,
    maxRagDocuments: 50, maxRagDocumentSizeMb: 10,
    maxWhatsappNumbers: 2,
    hasRag: true, hasLandingPro: true,
    hasCustomDomain: true, hasTelegram: true,
    hasEmailCorp: true, hasGoogleCalendar: true,
    hasGoogleSheets: true,
    extraConversationPrice: 0.005,
  },
  {
    name: 'Empresarial', price: 499,
    maxConversations: 200000, maxTokens: null,
    maxAutomations: null, maxIntegrations: null,
    maxRagDocuments: 200, maxRagDocumentSizeMb: 20,
    maxWhatsappNumbers: 5,
    isCustom: true,
    hasRag: true, hasLandingPro: true,
    hasCustomDomain: true, hasTelegram: true,
    hasEmailCorp: true, hasGoogleCalendar: true,
    hasGoogleSheets: true,
    extraConversationPrice: 0,
  },
]})
```

## Sistema d'alertes d'ús
```
0-80%  → Funcionament normal
80%    → Email avís al client
100%   → Email + badge al dashboard
100%+  → Cobra excedent automàticament
200%+  → Alerta a admin + suggeriment upgrade
500%+  → Alerta urgent admin → negociar pla empresarial
```

## Notes per Claude Code
- ClientUsage es reinicia el dia 1 de cada mes (cron job)
- Verificar límits abans d'executar cada automatització/conversa
- Registrar ús a ClientUsage en temps real
- Excedents calculats a la factura mensual
- Plans amb null = sense límit (Empresarial)

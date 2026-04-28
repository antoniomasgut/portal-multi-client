import { z } from 'zod'

export const planSchema = z.object({
  name:         z.string().min(2, 'El nom ha de tenir almenys 2 caràcters'),
  slug:         z.string().regex(/^[a-z0-9-]+$/, 'Slug invàlid (només lletres minúscules, números i guions)'),
  priceMonthly: z.number().min(0, 'El preu mensual no pot ser negatiu'),
  maxDomains:   z.number().int().default(1),
  maxUsers:     z.number().int().default(1),
  maxConversations: z.number().int().nullable().optional(),
  maxTokens:        z.number().int().nullable().optional(),
  maxAutomations:   z.number().int().nullable().optional(),
  maxIntegrations:  z.number().int().nullable().optional(),
  maxRagDocuments:  z.number().int().nullable().optional(),
  hasLandingPro:   z.boolean().default(false),
  hasCustomDomain: z.boolean().default(false),
  hasRag:          z.boolean().default(false),
  hasTelegram:     z.boolean().default(false),
  extraConversationPrice: z.number().min(0).default(0.005),
  extraTokenPrice:        z.number().min(0).default(0.0001),
  isActive: z.boolean().default(true),
})

export type PlanDTO = z.infer<typeof planSchema>

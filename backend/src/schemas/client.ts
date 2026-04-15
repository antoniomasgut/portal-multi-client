import { z } from 'zod'

const clientBaseSchema = z.object({
  companyName:        z.string().min(2).max(100),
  contactName:        z.string().min(2).max(100),
  contactEmail:       z.string().email(),
  contactPhone:       z.string().optional(),
  nif:                z.string().optional(),
  address:            z.string().optional(),
  domain:             z.string().optional(),
  notes:              z.string().optional(),
  planId:             z.string().uuid().optional(),
  isCustom:           z.boolean().optional(),
  customPriceMonthly: z.number().positive().optional(),
  customFeatures:     z.array(z.string()).optional(),
})

export const createClientSchema = clientBaseSchema
export const updateClientSchema = clientBaseSchema.partial()

export const assignPlanSchema = z.union([
  // Pla estàndard
  z.object({
    isCustom:           z.literal(false).optional(),
    planId:             z.string().uuid(),
    customPriceMonthly: z.undefined(),
    customFeatures:     z.undefined(),
  }),
  // Pla personalitzat
  z.object({
    isCustom:           z.literal(true),
    planId:             z.string().uuid().optional(),
    customPriceMonthly: z.number().positive('El preu ha de ser positiu'),
    customFeatures:     z.array(z.string()).min(1, 'Selecciona almenys un servei'),
  }),
])

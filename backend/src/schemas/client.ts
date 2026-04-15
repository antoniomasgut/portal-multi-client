import { z } from 'zod'

const clientBaseSchema = z.object({
  companyName:         z.string().min(2).max(100),
  contactName:         z.string().min(2).max(100),
  contactEmail:        z.string().email(),
  contactPhone:        z.string().optional(),
  nif:                 z.string().optional(),
  address:             z.string().optional(),
  domain:              z.string().optional(),
  notes:               z.string().optional(),
  planId:          z.string().uuid().optional(),
  isCustom:        z.boolean().optional(),
  priceMonthly:    z.number().min(0).optional(),
  priceSetup:      z.number().min(0).optional(),
  serviceIds:      z.array(z.string().uuid()).optional(),
  extraServiceIds: z.array(z.string().uuid()).optional(),
})

export const createClientSchema = clientBaseSchema
export const updateClientSchema = clientBaseSchema.partial()

export const assignPlanSchema = z.union([
  z.object({
    isCustom:        z.literal(false).optional(),
    planId:          z.string().uuid(),
    priceMonthly:    z.number().min(0).optional(),
    priceSetup:      z.number().min(0).optional(),
    extraServiceIds: z.array(z.string().uuid()).optional(),
    serviceIds:      z.undefined().optional(),
  }),
  z.object({
    isCustom:        z.literal(true),
    planId:          z.undefined().optional(),
    priceMonthly:    z.number().min(0),
    priceSetup:      z.number().min(0),
    serviceIds:      z.array(z.string().uuid()).min(1),
    extraServiceIds: z.undefined().optional(),
  }),
])

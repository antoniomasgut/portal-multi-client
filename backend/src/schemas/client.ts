import { z } from 'zod'

export const createClientSchema = z.object({
  companyName:  z.string().min(2).max(100),
  contactName:  z.string().min(2).max(100),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  nif:          z.string().optional(),
  address:      z.string().optional(),
  domain:       z.string().optional(),
  notes:        z.string().optional(),
  planId:       z.string().uuid().optional(),
})

export const updateClientSchema = createClientSchema.partial()

export const assignPlanSchema = z.object({
  planId: z.string().uuid(),
})

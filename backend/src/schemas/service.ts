import { z } from 'zod'
import { ServiceCategory } from '@prisma/client'

const SERVICE_CATEGORIES = Object.values(ServiceCategory) as [ServiceCategory, ...ServiceCategory[]]

export const createServiceSchema = z.object({
  name:         z.string().min(2).max(100),
  slug:         z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Només minúscules, números i guions'),
  description:  z.string().optional(),
  category:     z.enum(SERVICE_CATEGORIES).default('PRODUCTE'),
  setupPrice:   z.number().min(0).default(0),
  monthlyPrice: z.number().min(0).default(0),
})

export const updateServiceSchema = createServiceSchema.partial()

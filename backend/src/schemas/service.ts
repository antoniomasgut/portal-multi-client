import { z } from 'zod'

export const createServiceSchema = z.object({
  name:         z.string().min(2).max(100),
  slug:         z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Només minúscules, números i guions'),
  description:  z.string().optional(),
  setupPrice:   z.number().min(0).default(0),
  monthlyPrice: z.number().min(0).default(0),
})

export const updateServiceSchema = createServiceSchema.partial()

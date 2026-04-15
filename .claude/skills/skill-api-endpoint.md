# Skill: API Endpoint

## Ús
Crear un endpoint REST complet seguint les convencions del projecte.

## Patró complet

### 1. Ruta (`src/routes/[resource].ts`)
```typescript
import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { loginLimiter } from '../middleware/rateLimiter'
import * as controller from '../controllers/[resource]'

const router = Router()

// Admin only
router.get('/',        requireAuth, requireRole('ADMIN'), controller.list)
router.get('/:id',     requireAuth, requireRole('ADMIN'), controller.getOne)
router.post('/',       requireAuth, requireRole('ADMIN'), controller.create)
router.put('/:id',     requireAuth, requireRole('ADMIN'), controller.update)
router.delete('/:id',  requireAuth, requireRole('ADMIN'), controller.remove)

export default router
```

### 2. Schema Zod (`src/schemas/[resource].ts`)
```typescript
import { z } from 'zod'

export const CreateSchema = z.object({
  name:   z.string().min(1).max(255),
  email:  z.string().email(),
  planId: z.string().uuid(),
})

export const UpdateSchema = CreateSchema.partial()
export type CreateDTO = z.infer<typeof CreateSchema>
export type UpdateDTO = z.infer<typeof UpdateSchema>
```

### 3. Controller (`src/controllers/[resource].ts`)
```typescript
import { Request, Response, NextFunction } from 'express'
import { CreateSchema, UpdateSchema } from '../schemas/[resource]'
import * as service from '../services/[resource]'

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.findAll()
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = CreateSchema.parse(req.body)
    const data = await service.create(dto)
    res.status(201).json({ success: true, message: 'Creat correctament', data })
  } catch (err) { next(err) }
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = UpdateSchema.parse(req.body)
    const data = await service.update(req.params.id, dto)
    res.json({ success: true, message: 'Actualitzat', data })
  } catch (err) { next(err) }
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await service.softDelete(req.params.id)
    res.json({ success: true, message: 'Eliminat', data: null })
  } catch (err) { next(err) }
}
```

### 4. Service (`src/services/[resource].ts`)
```typescript
import { prisma } from '../db'
import type { CreateDTO, UpdateDTO } from '../schemas/[resource]'

export const findAll = () =>
  prisma.[resource].findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } })

export const findById = (id: string) =>
  prisma.[resource].findFirst({ where: { id, deletedAt: null } })

export const create = (data: CreateDTO) =>
  prisma.[resource].create({ data })

export const update = (id: string, data: UpdateDTO) =>
  prisma.[resource].update({ where: { id }, data })

export const softDelete = (id: string) =>
  prisma.[resource].update({ where: { id }, data: { deletedAt: new Date() } })
```

### 5. Registrar la ruta (`src/index.ts`)
```typescript
import [resource]Router from './routes/[resource]'
app.use('/api/[resources]', [resource]Router)
```

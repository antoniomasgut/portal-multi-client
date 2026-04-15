# Skill: Audit Log

## Ús
Registrar accions importants a la taula `audit_logs` del projecte.

## Quan registrar
Obligatori per:
- `LOGIN`, `LOGOUT`, `LOGIN_FAILED`
- `CREATE_CLIENT`, `UPDATE_CLIENT`, `DELETE_CLIENT`
- `CHANGE_PLAN`, `CREATE_INVOICE`, `CANCEL_INVOICE`
- `ACCESS_CREDENTIAL`, `CREATE_CREDENTIAL`, `UPDATE_CREDENTIAL`, `DELETE_CREDENTIAL`
- `GDPR_EXPORT`, `GDPR_DELETE`
- `ADMIN_ACTION` (qualsevol acció destructiva de l'admin)

## Implementació

### Middleware `auditLog`
```typescript
// middleware/auditLog.ts
import { prisma } from '../db'

export const auditLog = (action: string, entityType?: string) =>
  async (req: any, res: any, next: any) => {
    // Guardem la funció original de res.json
    const originalJson = res.json.bind(res)
    res.json = async (body: any) => {
      // Només registrar si la resposta és exitosa
      if (body?.success) {
        await prisma.auditLog.create({
          data: {
            userId:     req.user?.id ?? 'anonymous',
            action,
            entityType: entityType ?? null,
            entityId:   req.params?.id ?? body?.data?.id ?? null,
            details:    { method: req.method, path: req.path },
            ip:         req.ip,
          }
        }).catch(() => {}) // Silenciar errors d'audit per no blocar la resposta
      }
      return originalJson(body)
    }
    next()
  }
```

### Ús al router
```typescript
import { auditLog } from '../middleware/auditLog'

router.post('/', requireAuth, requireRole('ADMIN'),
  auditLog('CREATE_CLIENT', 'Client'),
  controller.create
)

router.delete('/:id', requireAuth, requireRole('ADMIN'),
  auditLog('DELETE_CLIENT', 'Client'),
  controller.remove
)
```

### Registre manual (als serveis)
```typescript
import { prisma } from '../db'

export const logAction = async (
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: object,
  ip?: string
) => {
  await prisma.auditLog.create({
    data: { userId, action, entityType, entityId, details, ip }
  }).catch(() => {}) // Silenciar: els audit logs no han d'interrompre el flux
}

// Exemple: login
await logAction(user.id, 'LOGIN', 'User', user.id, { email: user.email }, req.ip)
```

## Consultar audit logs (admin)
```typescript
// GET /api/audit-logs
const logs = await prisma.auditLog.findMany({
  where: {
    ...(userId   && { userId }),
    ...(action   && { action }),
    ...(from     && { createdAt: { gte: new Date(from) } }),
  },
  orderBy: { createdAt: 'desc' },
  take: 100,
})
```

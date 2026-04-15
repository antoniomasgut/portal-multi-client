# Agent Security — Seguretat i Encriptació

## Rol
Ets l'especialista en seguretat del Portal Multi-Client. Revisar i implementar mesures de seguretat: encriptació de credencials, protecció d'endpoints, headers, i compliment RGPD.

## Àrees de responsabilitat

### 1. Credencials dels clients (AES-256-GCM)
```typescript
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex') // 32 bytes hex

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (payload: string): string => {
  const [ivHex, tagHex, encHex] = payload.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  decipher.setAuthTag(tag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
```

**Regla:** El valor desencriptat MAI es retorna al frontend. Només s'usa en memòria per fer peticions externes.

### 2. Passwords
```typescript
import bcrypt from 'bcrypt'
const SALT_ROUNDS = 12
export const hashPassword = (pwd: string) => bcrypt.hash(pwd, SALT_ROUNDS)
export const verifyPassword = (pwd: string, hash: string) => bcrypt.compare(pwd, hash)
```

Validació Zod:
```typescript
z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/)
```

### 3. Rate limiting
```typescript
import rateLimit from 'express-rate-limit'

// Global (tots els endpoints)
export const globalLimiter = rateLimit({ windowMs: 15*60*1000, max: 100 })

// Login (estricte)
export const loginLimiter = rateLimit({
  windowMs: 15*60*1000, max: 5,
  message: { success: false, message: 'Massa intents. Torna a provar en 15 minuts.' }
})
```

### 4. Headers de seguretat (via Caddy)
Configurar al Caddyfile:
```
header {
  X-Content-Type-Options nosniff
  X-Frame-Options DENY
  X-XSS-Protection "1; mode=block"
  Referrer-Policy strict-origin-when-cross-origin
  Permissions-Policy "geolocation=(), microphone=()"
  -Server
}
```

### 5. Audit logs
```typescript
// Accions que SEMPRE s'han de registrar:
const AUDITED_ACTIONS = [
  'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
  'CREATE_CLIENT', 'UPDATE_CLIENT', 'DELETE_CLIENT',
  'CHANGE_PLAN', 'CREATE_INVOICE',
  'ACCESS_CREDENTIAL', 'UPDATE_CREDENTIAL',
  'GDPR_EXPORT', 'GDPR_DELETE',
  'ADMIN_ACCESS'
]
```

### 6. RGPD bàsic
- Dades exportables: tot el que identifica el client
- Dret a l'oblit: anonimitzar (no eliminar), conservar factures (obligació legal)
- Fitxers GCS: eliminar en sol·licitud d'oblit
- Vectors Qdrant: eliminar en sol·licitud d'oblit

## Checklist seguretat per mòdul
- [ ] Rate limiting actiu a tots els endpoints nous
- [ ] Inputs validats amb Zod
- [ ] Cap credencial ni token als logs
- [ ] Errors interns no exposats al client
- [ ] Accions importants registrades a audit_logs
- [ ] Credencials encriptades AES-256-GCM
- [ ] ENCRYPTION_KEY al .env (no hardcodat)

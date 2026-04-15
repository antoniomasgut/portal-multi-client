# Mòdul 1 — Auth + Rols

## Fase: 1 — MVP
## Branca Git: `feature/auth`

## Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET  /api/auth/me

## Esquema Prisma
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(CLIENT)
  clientId  String?
  lastLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role { ADMIN CLIENT VISITOR }
```

## Middleware a crear
- `requireAuth`: verifica JWT
- `requireRole(role)`: verifica rol
- `auditLog(action)`: registra acció a audit_logs

## Notes per Claude Code
- bcrypt per hash de passwords (salt 12)
- JWT secret des de .env
- Refresh token guardat a HttpOnly cookie
- Registrar login als audit_logs
- Rate limiting: màx 5 intents de login per IP cada 15 minuts

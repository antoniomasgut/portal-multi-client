# Skill: Migració Prisma

## Ús
Afegir o modificar models a la BD seguint les convencions del projecte.

## Procés

### 1. Modificar `prisma/schema.prisma`
```prisma
model NewModel {
  id          String      @id @default(uuid())
  // --- relació obligatòria si pertany a un client ---
  clientId    String
  client      Client      @relation(fields: [clientId], references: [id])
  // --- camps del model ---
  name        String
  description String?
  status      ModelStatus @default(ACTIVE)
  metadata    Json?
  // --- soft delete + timestamps (SEMPRE) ---
  deletedAt   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // --- índexs per camps filtrats freqüentment ---
  @@index([clientId])
  @@index([status])
  @@map("new_models")  // snake_case plural
}

enum ModelStatus {
  ACTIVE
  INACTIVE
  ARCHIVED
}
```

### 2. Executar migració
```bash
npx prisma migrate dev --name add_new_model
```

### 3. Actualitzar el client Prisma
```bash
npx prisma generate
```

### 4. Verificar
```bash
npx prisma studio  # UI per inspeccionar la BD
```

## Regles
- PKs: sempre `String @id @default(uuid())`
- Timestamps: `createdAt` + `updatedAt` **sempre** presents
- Soft delete: `deletedAt DateTime?` (mai DELETE real excepte RGPD)
- Taules: `@@map("snake_case_plural")`
- Enums: MAJUSCULES
- Relacions: `@relation` explícit amb `fields` i `references`
- Índexs: per camps usats en `where` freqüentment

## Si la migració afecta dades existents
```prisma
// Afegir camp nullable primer
newField  String?

// Migrar dades amb script
// Després fer el camp obligatori en una migració separada
newField  String
```

## Seed associat
Si el nou model necessita dades inicials, afegir a `prisma/seed.ts`:
```typescript
await prisma.newModel.upsert({
  where: { id: 'seed-id-known' },
  update: {},
  create: { id: 'seed-id-known', name: 'Valor inicial', clientId: TEST_CLIENT_ID }
})
```

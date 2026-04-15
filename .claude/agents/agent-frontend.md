# Agent Frontend — Next.js 14 / TailwindCSS

## Rol
Ets l'especialista en frontend del Portal Multi-Client. Generes components Next.js 14 amb App Router seguint el design system AMG i les convencions del projecte.

## Stack
- Next.js 14 (App Router)
- TailwindCSS (únic sistema d'estils)
- Zustand (estat global)
- React Query / TanStack Query (peticions API)
- React Hook Form + Zod (formularis)

## Regles obligatòries

### Estructura
- Components: PascalCase → `ClientCard.tsx`
- Hooks personalitzats: prefix `use` → `useClients.ts`
- Pàgines: dins `app/` seguint App Router
- Mai `fetch` directe → sempre React Query

### Estils
- **Únicament TailwindCSS**. Zero CSS inline ni CSS modules.
- Colors via variables del design system (no hardcodat `#FF6B00` directament).
- Dark mode per defecte amb classe `.dark` al `<html>`.
- Classes de design system disponibles: `btn-primary`, `btn-outline`, `card`, `stat-card`, `badge`, `section-tag`, `form-input`, `form-label`, `alert-danger`, `alert-warning`, `alert-success`.

### Formularis
```typescript
const schema = z.object({ email: z.string().email() })
const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(schema) })
```

### Peticions API
```typescript
// hook
export const useClients = () => useQuery({
  queryKey: ['clients'],
  queryFn: () => api.get('/clients').then(r => r.data.data)
})
```

### Estat global (Zustand)
Només per estat que necessita múltiples components (usuari autenticat, tema, idioma).

### Seguretat frontend
- Mai mostrar dades d'altres clients
- Verificar rol abans de renderitzar seccions admin
- No mostrar errors tècnics a l'usuari final

## Estructura de pàgines
```
app/
  (admin)/       → rutes admin (requireRole ADMIN)
  (client)/      → rutes client (requireRole CLIENT)
  (public)/      → rutes públiques (landings, OAuth)
  layout.tsx
  page.tsx
```

## No fer mai
- CSS inline (`style={{ color: '#FF6B00' }}`)
- `fetch()` directe sense React Query
- Gestió d'estat local per dades del servidor
- Text hardcodat (usar i18n)
- Colors hardcodats (usar variables CSS del design system)

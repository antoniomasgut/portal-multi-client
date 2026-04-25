# Verificació Fase 2 — Creixement

**Credencials de prova:**
| Usuari | Email | Password |
|--------|-------|----------|
| Admin | `admin@portal.com` | `Admin1234!` |
| Client test | `test@portal.com` | `Test1234!` |

**URLs:** Frontend `http://localhost:3000` · Backend API `http://localhost:4000`

---

## 1. Automatitzacions n8n — Templates

### Via API
- [x] `GET /api/automations/templates` → retorna 10 templates predefinits
- [x] Templates en categories: booking, sales, marketing, retention, onboarding, billing, ecommerce

### Via UI
- [ ] `http://localhost:3000/admin/automations` — pàgina visible amb llista de templates
- [ ] Cada template mostra nom, categoria i descripció
- [ ] Botó "Nou template" → modal amb camp JSON editor
- [ ] Crear template nou amb payload n8n vàlid → apareix a la llista
- [ ] Editar template existent → desar → canvis persisteixen
- [ ] Eliminar template → confirma i desapareix

### Per client
- [ ] Dins d'un client → pestanya "Automatitzacions"
- [ ] Llistar automatitzacions actives del client
- [ ] Activar una automatització → apareix a la llista del client

---

## 2. Multiidioma

### Via UI
- [ ] Canviador d'idioma visible al nav (ca / es / en)
- [ ] Canviar a castellà → tots els textos del menú canvien
- [ ] Canviar a anglès → textos en anglès
- [ ] La preferència es desa a localStorage (persisteix entre sessions)
- [ ] Login page disponible en els 3 idiomes
- [ ] Dashboard admin disponible en els 3 idiomes

---

## 3. Notificacions Email

### Via API
- [x] `POST /api/auth/magic-link` → genera i envia email (log als logs del backend)
- [x] Informe setmanal admin → `POST /api/reports/admin/weekly`
- [x] Informe mensual client → `POST /api/reports/clients/:id/monthly`

### Verificació manual (requereix Mailtrap o SMTP real)
- [ ] Rebre email de benvinguda quan es crea un client
- [ ] Rebre email de magic link (comprova logs backend si no hi ha SMTP real)
- [ ] Rebre informe mensual amb el resum de serveis i ús

---

## 4. Agent Onboarding

### Via API
- [x] `GET /api/onboarding` → llista clients amb progrés d'onboarding
- [x] `GET /api/onboarding?clientId=X` → progrés d'un client concret

### Via UI
- [ ] `http://localhost:3000/admin/onboarding` — pàgina visible
- [ ] Cada client mostra barres de progrés per pas
- [ ] Passos: Verificar DNS · Conectar WhatsApp · Configurar Bot · Publicar Landing
- [ ] Clic a "Completar pas" → actualitza el progrés
- [ ] Client amb onboarding 100% → badge "COMPLET"

---

## 5. Agent Reporting — Informes PDF

### Via API
- [x] `POST /api/reports/admin/weekly` → genera informe global (OK)
- [x] `POST /api/reports/clients/:id/monthly` → genera informe per client (OK)

### Via UI
- [ ] `http://localhost:3000/admin/invoices` o secció específica
- [ ] Botó "Generar informe" → descarrega PDF
- [ ] PDF conté: llista clients, factures, ús del mes, serveis actius

---

## 6. Templates Automatitzacions

### Via API
- [x] `GET /api/automations/templates` → 10 templates disponibles
- [x] Template crea un workflow n8n via webhook

### Via UI
- [ ] `http://localhost:3000/admin/automations` — modal de creació/edició visible
- [ ] Camp JSON editor amb validació de sintaxi
- [ ] Auto-slug generat a partir del nom
- [ ] Templates filtrables per categoria

---

## Dades de prova afegides (Fase 2)

| Client | Automatitzacions actives |
|--------|--------------------------|
| Ca Na Rebecca | Cap (client nou) |
| Forn de Pa Roca | Cap (client nou) |

---

*Última revisió: 2026-04-25 — Proves API: 6/6 ✓ · Proves UI: pendents*

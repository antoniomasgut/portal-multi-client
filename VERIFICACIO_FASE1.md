# Verificació Fase 1 — AMG Portal

**Credencials de prova:**
| Usuari | Email | Password |
|--------|-------|----------|
| Admin | `admin@portal.com` | `Admin1234!` |
| Client test | `test@portal.com` | `Test1234!` |

**URLs:** Frontend `http://localhost:3001` · Backend API `http://localhost:4000`

---

## 1. Landing page pública
- [x] `http://localhost:3001` — es carrega amb fons fosc
- [x] Les seccions es veuen bé (Hero, Features, Preus, Comparativa)
- [x] El botó "ACCEDIR AL PORTAL" porta a `/login`
- [x] El menú nav té els links "Plans" i "Serveis" que fan scroll

## 2. Login
- [x] `http://localhost:3001/login` — formulari visible
- [x] Login amb `admin@portal.com` / `Admin1234!` → redirigeix a `/admin/dashboard`
- [x] Login amb credencials incorrectes → missatge d'error
- [x] Botó mostrar/ocultar contrasenya funciona
- [x] Logout → torna al login

## 3. Magic Link
- [x] A la pàgina login hi ha opció "Accedir sense contrasenya"
- [x] Introduïr `admin@portal.com` → missatge "comprova el teu email"
- [x] Als logs del backend apareix el link `[magic-link] ...`
- [x] Obrir el link → inicia sessió automàticament

## 4. Dashboard Admin
- [x] `http://localhost:3001/admin/dashboard` — es carrega amb stats
- [x] Sidebar esquerra visible amb navegació
- [x] Top bar amb breadcrumb i botó logout

## 5. Gestió de clients
- [x] `http://localhost:3001/admin/clients` — llista de clients
- [x] Botó "Nou client" → formulari
- [x] Crear un client nou → apareix a la llista
- [x] Editar el client → canviar el nom → desar → els canvis persisteixen
- [x] El client TEST té un badge "TEST"
- [x] Eliminar client (✕) → confirma i desapareix

## 6. Plans i subscripcions
- [ ] Dins d'un client → secció "Subscripció" → assignar pla
- [ ] Els preus s'actualitzen automàticament (Bàsic 49€, Pro 99€...)
- [ ] Afegir serveis extra per sobre del pla
- [ ] Crear pla personalitzat amb preu manual
- [ ] Historial de canvis de pla visible

## 7. Catàleg de serveis
- [ ] `http://localhost:3001/admin/services` — llista els 12 serveis
- [ ] Crear un servei nou amb `setupPrice` i `monthlyPrice`
- [ ] Editar un servei existent
- [ ] Toggle activa/desactiva un servei → badge INACTIU apareix
- [ ] Serveis inactius no apareixen al selector de subscripcions

## 8. Credencials de client
- [ ] Dins d'un client → pestanya "Credencials"
- [ ] Afegir una credencial (ex: `META_TOKEN` / `valor_secret`)
- [ ] El valor es guarda encriptat (AES-256)
- [ ] Eliminar una credencial

## 9. Flux de Setup
- [ ] Dins d'un client → botó "SETUP"
- [ ] Wizard amb 4 passos: Verificar → Connexions → Credencials → Completat
- [ ] Es pot navegar entre passos

## 10. OAuth / Connexions
- [ ] Dins d'un client → pestanya "Connexions"
- [ ] Botó "Connectar WhatsApp" → inicia flux OAuth
- [ ] Botó "Desconnectar" apareix si hi ha connexió activa
- [ ] *(no cal completar si no tens credencials Meta reals)*

## 11. Micro-landing de client
- [ ] Dins d'un client → pestanya "Landing Page"
- [ ] Editor amb camps: títol, subtítol, CTA, color, logo
- [ ] Botó "Publicar" → la landing es fa pública
- [ ] `http://localhost:3001/l/[slug-del-client]` — landing pública visible
- [ ] Botó "Despublicar" → deixa de ser accessible

## 12. Facturació
- [ ] `http://localhost:3001/admin/invoices` — llista de factures
- [ ] Botó "Generar factura" → seleccionar client → crear
- [ ] Número automàtic format `2026-0001`
- [ ] Marcar com a pagada → estat PAID
- [ ] Marcar com a vençuda → estat OVERDUE
- [ ] Cancel·lar factura → estat CANCELLED

## 13. Dashboard client
- [ ] Login amb `test@portal.com` / `Test1234!` → redirigeix a `/client/dashboard`
- [ ] Subscripció activa i serveis contractats visibles
- [ ] Barres d'ús (converses, tokens, automatitzacions)
- [ ] `http://localhost:3001/client/invoices` — factures del client

## 14. Configuració
- [ ] `http://localhost:3001/admin/settings` — pàgina de configuració
- [ ] Polítiques de descompte visibles i togglejables
- [ ] Política de preus global editable

---

*Última revisió: 2026-04-17 — Punts completats: 5/14*

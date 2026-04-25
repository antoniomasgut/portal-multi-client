# Guia de configuració d'automatitzacions

Per a cada workflow n8n cal completar una sèrie de passos al portal i a n8n.
Aquest document detalla exactament **on clicar** i **què introduir** a cada pas.

---

## Panells disponibles al portal (per client)

Tots els panells s'accedeixen des de:
**Admin → Clients → [nom client] → pestanya del servei**

| Panell | Pestanya | Què configures |
|---|---|---|
| **Connexions** | Connexions | OAuth WhatsApp Meta |
| **Credencials** | Credencials | API keys, tokens, webhooks |
| **WhatsApp Bot** | Serveis → whatsapp-bot → Configurar | Nom bot, to, horari, FAQs |
| **Telegram Bot** | Serveis → bot-telegram → Configurar | Token BotFather, to, horari, FAQs |
| **Automatitzacions** | Serveis → automatitzacions → Configurar | Crear/pausar/esborrar workflows n8n |
| **Domains** | Serveis → gestio-domini → Configurar | DNS del domini del client |
| **RAG / Alf** | Serveis → agent-rag → Configurar | Pujar documents de coneixement |
| **Proveïdors IA** | Serveis → agent-rag → IA | Claus Groq/OpenAI/Anthropic |
| **Setup Wizard** | Botó SETUP a la llista | Assistent initial 4 passos |

---

## Configuració per workflow

---

### 📅 `reserva-cita` — Reserva de cita
**Flux:** WhatsApp → Google Calendar → confirmació automàtica

#### Al portal:
1. **Connexions** → clicar **CONNECTAR** a WhatsApp Business → seguir flux OAuth Meta
2. **Credencials** → clicar preset **WhatsApp** → introduir:
   - `PHONE_ID` — ID del número de telèfon de Meta Business
   - `WEBHOOK_TOKEN` — token de verificació del webhook
3. **Serveis → whatsapp-bot → Configurar**:
   - Nom del bot (ex: "Assistent Ca Na Rebecca")
   - Missatge de benvinguda
   - Horari d'atenció (ex: "L-V 9-18h")
   - Afegir FAQs sobre reserva

#### A n8n (un cop desplegat el workflow):
4. **Credentials → Google OAuth2** → crear credencial amb compte Google del client
5. **Workflow → node "Google Calendar"** → seleccionar la credencial → triar el calendari correcte

---

### 📅 `recordatori-cita` — Recordatori de cita
**Flux:** Scheduler diari → Google Calendar → WhatsApp 24h abans

#### Al portal:
1. **Connexions** → WhatsApp ha d'estar connectat (vegeu reserva-cita)

#### A n8n:
2. **Credentials → Google OAuth2** → mateixa credencial que reserva-cita
3. **Workflow → node "Google Calendar"** → seleccionar calendari
4. **Workflow → node "Enviar recordatori"** → introduir el número de WhatsApp del client (`+34XXXXXXXXX`)
5. **Workflow → node "Check diari"** → ajustar l'hora del scheduler (per defecte 08:00)

---

### 📅 `telegram-notificacio-cita` — Notificació de cita (Telegram)
**Flux:** Webhook reserva → missatge Telegram al client

#### Al portal:
1. **Serveis → bot-telegram → Configurar**:
   - **Token del bot** → obtenir de [@BotFather](https://t.me/BotFather) (`/newbot` → copiar el token)
   - Nom del bot
   - Missatge de benvinguda
   - Activar el bot (toggle ON)

#### A Telegram (pas previ):
2. Anar a [@BotFather](https://t.me/BotFather) → `/newbot` → posar nom → copiar el token `123456:ABC-DEF...`

#### A n8n:
3. **Credentials → Telegram API** → enganxar el token del bot
4. **Workflow → node "Enviar notificació Telegram"** → seleccionar credencial → introduir `chatId` del client

> **Com obtenir el chatId:** El client ha d'enviar un missatge al bot primer, llavors consultar `https://api.telegram.org/bot{TOKEN}/getUpdates`

---

### 💰 `pressupost-auto` — Pressupost automàtic
**Flux:** Formulari web → PDF pressupost → email

#### Al portal:
1. **Credencials** → secció SMTP:
   - `SMTP_HOST` — servidor de correu (ex: `smtp.gmail.com`)
   - `SMTP_USER` — compte de correu del client
   - `SMTP_PASS` — contrasenya d'app de Gmail (Google Account → Seguretat → Contrasenyes d'app)

#### A n8n:
2. **Credentials → SMTP** → introduir les dades de correu del client
3. **Workflow → node "Enviar pressupost"** → seleccionar credencial SMTP → confirmar correu de destinació

> **Gmail:** Cal activar la verificació en 2 passos i generar una "Contrasenya d'app" específica per a n8n

---

### 💰 `resposta-leads-web` — Resposta leads web
**Flux:** Formulari web → WhatsApp al lead + email al propietari

#### Al portal:
1. **Connexions** → connectar WhatsApp (OAuth Meta)
2. **Credencials** → preset WhatsApp → `PHONE_ID` + `WEBHOOK_TOKEN`
3. **Credencials** → SMTP per a l'email de notificació

#### A n8n:
4. **Workflow → node "Formulari web"** → copiar la URL del webhook → enganxar-la al formulari web del client
5. **Workflow → node "Notificar propietari"** → introduir l'email del propietari del negoci
6. **Workflow → node "WhatsApp al lead"** → configurar el missatge de resposta automàtica

---

### 💰 `telegram-alerta-lead` — Alerta de lead (Telegram)
**Flux:** Formulari web → alerta Telegram immediata al propietari

#### Al portal:
1. **Serveis → bot-telegram → Configurar** → introduir token del bot (de BotFather)

#### A Telegram (pas previ):
2. El propietari ha d'enviar `/start` al bot per activar la recepció de missatges
3. Obtenir el `chatId` del propietari: consultar `https://api.telegram.org/bot{TOKEN}/getUpdates`

#### A n8n:
4. **Credentials → Telegram API** → token del bot
5. **Workflow → node "Alerta Telegram propietari"** → introduir el `chatId` del propietari
6. **Workflow → node "Nou lead web"** → copiar URL webhook → enganxar al formulari

---

### ⭐ `recollida-ressenyes` — Recollida de ressenyes
**Flux:** Post-servei → WhatsApp → valoració → Google Sheets

#### Al portal:
1. **Connexions** → connectar WhatsApp

#### A n8n:
2. **Credentials → Google OAuth2** → compte Google del client
3. **Workflow → node "Guardar a Sheets"** → seleccionar credencial → introduir l'ID del Google Sheets:
   - Obrir el full → URL: `docs.google.com/spreadsheets/d/**{ID_AQUI}**/edit`
4. **Workflow → node "Trigger post-servei"** → copiar URL webhook → integrar al sistema de gestió del client

---

### 🛒 `confirmacio-comanda` — Confirmació de comanda
**Flux:** Nova comanda → WhatsApp → actualitza stock a Google Sheets

#### Al portal:
1. **Connexions** → connectar WhatsApp
2. **Credencials** → preset WhatsApp → `PHONE_ID` + `WEBHOOK_TOKEN`

#### A n8n:
3. **Credentials → Google OAuth2** → compte Google del client
4. **Workflow → node "Actualitzar stock"** → introduir ID del Google Sheets d'inventari
5. **Workflow → node "Nova comanda"** → copiar URL webhook → integrar a la plataforma de venda

---

### 🛒 `alerta-estoc` — Alerta d'estoc baix
**Flux:** Scheduler diari → comprova Sheets → alerta si estoc baix

#### Al portal:
1. **Connexions** → connectar WhatsApp
2. **Credencials** → SMTP per a l'email al proveïdor

#### A n8n:
3. **Credentials → Google OAuth2** → compte Google del client
4. **Workflow → node "Check diari estoc"** → ajustar hora del scheduler
5. **Workflow → node "Llegir Sheets"** → introduir ID del full d'inventari + rang de cel·les
6. **Workflow → afegir node "IF"** → condició: columna estoc < llindar (ex: `< 5`)
7. **Workflow → node "Alerta propietari"** → email del proveïdor o propietari

---

### 💸 `factura-servei` — Factura de servei
**Flux:** Servei completat → genera factura al portal → email al client

#### Al portal:
1. **Credencials** → la variable `WEBHOOK_SECRET` s'injecta automàticament des de `.env`
   - Verificar que `N8N_WEBHOOK_SECRET` té valor al servidor
2. **Credencials** → SMTP per enviar la factura PDF

#### A n8n:
3. **Workflow → node "Generar factura portal"** → la URL del portal s'injecta automàticament (`{{BASE_URL}}`)
4. **Workflow → node "Servei completat"** → copiar URL webhook → integrar al sistema de gestió
5. **Credentials → SMTP** → compte de correu per enviar la factura

---

### 🤝 `missatge-benvinguda` — Missatge de benvinguda
**Flux:** Primer contacte WhatsApp → resposta personalitzada

#### Al portal:
1. **Connexions** → connectar WhatsApp (OAuth Meta)
2. **Serveis → whatsapp-bot → Configurar**:
   - Missatge de benvinguda (ex: "Hola! Sóc l'assistent de Ca Na Rebecca...")
   - To de comunicació
   - Activar el bot (toggle ON)

#### A n8n:
3. El workflow s'activa automàticament via webhook de WhatsApp
4. No cal configuració addicional si el bot ja està actiu

---

### 🤝 `recuperacio-client` — Recuperació client inactiu
**Flux:** Scheduler setmanal → clients inactius 30 dies → WhatsApp de reactivació

#### Al portal:
1. **Connexions** → WhatsApp connectat

#### A n8n:
2. **Credentials → Google OAuth2** → compte Google del client
3. **Workflow → node "Llegir clients inactius"** → introduir ID del Sheets amb historial de clients
4. **Workflow → node "Check setmanal"** → ajustar dia i hora (per defecte dilluns 09:00)
5. **Workflow → node "Missatge reactivació"** → editar el text del missatge de WhatsApp

---

### 📊 `telegram-informe-diari` — Informe diari (Telegram)
**Flux:** Scheduler 08:00 → API portal → missatge Telegram amb resum

#### Al portal:
1. **Serveis → bot-telegram → Configurar** → token del bot actiu

#### A Telegram:
2. Crear un grup Telegram o usar el chat directe del propietari
3. Obtenir `chatId`: afegir el bot al grup → consultar `getUpdates` → copiar el `chat.id`

#### A n8n:
4. **Credentials → Telegram API** → token del bot
5. **Workflow → node "Trigger diari 8h"** → ajustar hora si cal
6. **Workflow → node "Obtenir estadístiques"** → URL s'injecta automàticament (`{{BASE_URL}}`)
7. **Workflow → node "Enviar informe Telegram"** → introduir el `chatId` de destí

---

## Procés d'alta complet d'un client nou amb automatitzacions

### Pas 1 — Setup inicial al portal
```
Admin → Clients → [client] → botó SETUP
```
L'assistent de 4 passos cobreix:
- Verificació de dades (pla, preu, domini)
- Connexions OAuth (WhatsApp)
- Credencials API manuals
- Confirmació

### Pas 2 — Activar els serveis
```
Admin → Clients → [client] → pestanya Serveis
```
Per a cada servei contractat: clicar **ACTIVAR** i després **CONFIGURAR ▼**

### Pas 3 — Configurar bots
- **WhatsApp:** Serveis → whatsapp-bot → Configurar → omplir nom, to, horari, FAQs → **DESAR**
- **Telegram:** Serveis → bot-telegram → Configurar → token BotFather + nom + to + FAQs → **DESAR**

### Pas 4 — Credencials addicionals
```
Admin → Clients → [client] → pestanya Credencials
```
Afegir les que no cobreix OAuth: SMTP, Sheets IDs, etc.

### Pas 5 — Crear workflows a n8n
```
Admin → Clients → [client] → Serveis → automatitzacions → Configurar
```
- Seleccionar template del desplegable
- Clicar **CREAR WORKFLOW**
- Obrir n8n → editar nodes específics (IDs de Sheets, chatIds, etc.)
- Activar el workflow

### Pas 6 — Verificació
- Fer una prova manual de cada workflow a n8n (botó "Test workflow")
- Comprovar que el client rep les notificacions correctament

---

## Resum de credencials per panell

| On configurar | Credencials |
|---|---|
| **Portal → Connexions** | WhatsApp Business (OAuth Meta) |
| **Portal → Credencials → preset WhatsApp** | `PHONE_ID`, `WEBHOOK_TOKEN` |
| **Portal → Credencials → manual** | SMTP host/user/pass, Sheets ID |
| **Portal → Config Telegram** | Token de BotFather |
| **n8n → Credentials** | Google OAuth2, Telegram API, SMTP |
| **n8n → cada workflow** | chatId Telegram, ID Google Sheets, horaris |
| **Servidor → .env** | `N8N_WEBHOOK_SECRET`, `N8N_API_KEY`, `N8N_API_URL` |

---

*Última actualització: 2026-04-25*

# Guia de proves d'automatitzacions

## Pas 0 — Configurar la API key de n8n (obligatori primer)

1. Obre http://localhost:5678 al navegador
2. Inicia sessió a n8n
3. Menú esquerra → Settings → API → Create API Key → copia la clau
4. Edita el `.env` del servidor:
   ```
   N8N_API_KEY=la_clau_que_has_copiat
   N8N_WEBHOOK_SECRET=qualsevol_string_secret_llarg
   ```
5. Reinicia el backend: `docker restart portal_backend`

---

## Mètode ràpid — Botó "Test" al portal

Admin → Automatitzacions → botó TEST a cada fila.
Verifica que la connexió portal ↔ n8n funciona.

---

## Workflows

### 1. `reserva-cita` — Reserva de cita
- [ ] Portal → Connexions → WhatsApp connectat
- [ ] Portal → Credencials → PHONE_ID + WEBHOOK_TOKEN
- [ ] n8n → Credentials → Google OAuth2 configurat
- [ ] n8n → workflow actiu
- **Prova:** n8n → Test workflow → Send Test Data al node webhook
- **Resultat esperat:** nova cita al Google Calendar del client

---

### 2. `recordatori-cita` — Recordatori de cita
- [ ] WhatsApp connectat (vegeu reserva-cita)
- [ ] n8n → Google OAuth2 configurat
- [ ] n8n → node Calendar apuntant al calendari correcte
- **Prova:** n8n → node ScheduleTrigger → Execute node
- **Resultat esperat:** WhatsApp enviat al número de la cita del dia següent

---

### 3. `telegram-notificacio-cita` — Notificació de cita (Telegram)
- [ ] Portal → Config Telegram → token BotFather + bot actiu
- [ ] n8n → Credentials → Telegram API configurat
- [ ] n8n → node Telegram → chatId del client introduït
- **Prova:** n8n → Test workflow → Execute
- **Resultat esperat:** missatge Telegram rebut al client

---

### 4. `pressupost-auto` — Pressupost automàtic
- [ ] Portal → Credencials → SMTP configurat
- [ ] n8n → Credentials → SMTP configurat
- [ ] n8n → node email → destinatari de prova
- **Prova:** n8n → Test workflow → Send Test Data
- **Resultat esperat:** correu rebut amb PDF de pressupost

---

### 5. `resposta-leads-web` — Resposta leads web
- [ ] Portal → Connexions → WhatsApp connectat
- [ ] Portal → Credencials → SMTP configurat
- [ ] n8n → node webhook → URL copiada al formulari web
- [ ] n8n → node email → email del propietari
- **Prova:** `curl -X POST {URL_WEBHOOK} -d '{"nom":"Test","email":"test@test.com"}'`
- **Resultat esperat:** WhatsApp al lead + email al propietari

---

### 6. `telegram-alerta-lead` — Alerta de lead (Telegram)
- [ ] Portal → Config Telegram → token actiu
- [ ] n8n → Credentials → Telegram API
- [ ] n8n → node Telegram → chatId del propietari
- [ ] n8n → node webhook → URL al formulari web
- **Prova:** `curl -X POST {URL_WEBHOOK} -d '{"nom":"Lead test"}'`
- **Resultat esperat:** missatge Telegram rebut al propietari

---

### 7. `recollida-ressenyes` — Recollida de ressenyes
- [ ] Portal → Connexions → WhatsApp connectat
- [ ] n8n → Credentials → Google OAuth2
- [ ] n8n → node Sheets → ID del full + rang correcte
- **Prova:** n8n → Test workflow → Send Test Data al webhook
- **Resultat esperat:** WhatsApp de sol·licitud enviat + nova fila al Sheets

---

### 8. `confirmacio-comanda` — Confirmació de comanda
- [ ] Portal → Connexions → WhatsApp connectat
- [ ] n8n → Credentials → Google OAuth2
- [ ] n8n → node Sheets → ID del full d'estoc
- [ ] n8n → node webhook → URL integrada al sistema de venda
- **Prova:** n8n → Test workflow → Send Test Data
- **Resultat esperat:** WhatsApp de confirmació + Sheets actualitzat

---

### 9. `alerta-estoc` — Alerta d'estoc baix
- [ ] Portal → Connexions → WhatsApp connectat
- [ ] Portal → Credencials → SMTP
- [ ] n8n → Credentials → Google OAuth2
- [ ] n8n → node Sheets → ID full inventari + rang
- [ ] n8n → node IF → llindar d'estoc mínim (ex: < 5)
- **Prova:** n8n → node ScheduleTrigger → Execute node (amb una fila de Sheets amb estoc baix)
- **Resultat esperat:** email + WhatsApp d'alerta rebuts

---

### 10. `factura-servei` — Factura de servei
- [ ] Portal → `.env` → N8N_WEBHOOK_SECRET configurat
- [ ] Portal → Credencials → SMTP
- [ ] n8n → node webhook → URL integrada al sistema de gestió
- **Prova:** `curl -X POST {URL_WEBHOOK} -H "Authorization: Bearer {SECRET}" -d '{"clientId":"..."}'`
- **Resultat esperat:** factura creada al portal + correu enviat

---

### 11. `missatge-benvinguda` — Missatge de benvinguda
- [ ] Portal → Connexions → WhatsApp connectat
- [ ] Portal → Config WhatsApp → missatge de benvinguda + bot actiu
- **Prova:** enviar un WhatsApp al número del client des d'un número nou
- **Resultat esperat:** resposta automàtica de benvinguda rebuda

---

### 12. `recuperacio-client` — Recuperació client inactiu
- [ ] Portal → Connexions → WhatsApp connectat
- [ ] n8n → Credentials → Google OAuth2
- [ ] n8n → node Sheets → ID full clients + rang
- [ ] n8n → node IF → condició dies inactius > 30
- **Prova:** n8n → node ScheduleTrigger → Execute node (amb un client inactiu al Sheets)
- **Resultat esperat:** WhatsApp de reactivació enviat

---

### 13. `telegram-informe-diari` — Informe diari (Telegram)
- [ ] Portal → Config Telegram → token actiu
- [ ] n8n → Credentials → Telegram API
- [ ] n8n → node Telegram → chatId de destí
- [ ] `.env` → N8N_WEBHOOK_SECRET configurat
- **Prova:** n8n → node ScheduleTrigger → Execute node
- **Resultat esperat:** missatge Telegram amb resum d'estadístiques rebut

---

## On veure errors

- **n8n** → workflow → Executions (icona rellotge) → verd OK / vermell error
- **Portal** → Serveis → automatitzacions → EXECUCIONS (desplegable)

---

*Última actualització: 2026-04-25*

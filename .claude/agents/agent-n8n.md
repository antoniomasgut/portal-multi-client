# Agent n8n — Workflows i Automatitzacions

## Rol
Ets l'especialista en n8n del Portal Multi-Client. Generes workflows, integres la n8n API des del backend, i gestiones les 10 automatitzacions base i les personalitzades.

## Stack
- n8n (self-hosted via Docker)
- n8n API (per crear/gestionar workflows per programa)
- Port intern: 5678

## Conceptes clau

### Arquitectura d'automatitzacions
Cada client té els seus workflows propis a n8n, creats des de templates base. Les variables del template (com `{{CLIENT_EMAIL}}`) es substitueixen en crear el workflow per al client.

### Templates base (10 inicials)
1. Reserva de cita (WhatsApp → Google Calendar)
2. Pressupost automàtic (formulari → email)
3. Recordatori de cita (24h abans)
4. Recollida de ressenyes (post-servei)
5. Resposta leads web (formulari → WhatsApp)
6. Factura de servei (completat → PDF → email)
7. Missatge de benvinguda (primer contacte)
8. Recuperació client inactiu (30 dies sense contacte)
9. Confirmació de comanda (e-commerce)
10. Alerta d'estoc baix

### Integració n8n API
```typescript
const N8N_URL = process.env.N8N_URL || 'http://n8n:5678'
const N8N_API_KEY = process.env.N8N_API_KEY

// Crear workflow per a un client
export const createClientWorkflow = async (
  templateJson: object,
  variables: Record<string, string>
): Promise<string> => {
  const workflowJson = substituteVariables(templateJson, variables)
  const response = await fetch(`${N8N_URL}/api/v1/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY!
    },
    body: JSON.stringify(workflowJson)
  })
  const data = await response.json()
  // Activar el workflow
  await fetch(`${N8N_URL}/api/v1/workflows/${data.id}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY! }
  })
  return data.id
}

// Substitució de variables
const substituteVariables = (json: object, vars: Record<string, string>): object => {
  let str = JSON.stringify(json)
  for (const [key, val] of Object.entries(vars)) {
    str = str.replaceAll(`{{${key}}}`, val)
  }
  return JSON.parse(str)
}
```

### Variables estàndard per templates
```
{{CLIENT_ID}}         → ID del client a la BD
{{CLIENT_EMAIL}}      → email del client
{{CLIENT_NAME}}       → nom del client
{{CLIENT_PHONE}}      → telèfon WhatsApp del client
{{WEBHOOK_SECRET}}    → secret per validar webhooks
{{N8N_BASE_URL}}      → URL base de n8n
{{PORTAL_API_URL}}    → URL de l'API del portal (per callbacks)
```

### Gestió d'errors
- Si un workflow falla 3 vegades seguides → estat `ERROR` + notificació admin
- Registrar cada execució a `AutomationExecution` (workflowId, status, tokens, error)
- Tokens consumits → actualitzar `ClientUsage.tokensUsed`

### Credencials n8n
Les credencials dels clients (Google, WhatsApp...) es guarden encriptades a la BD del portal, NO a n8n. Es passen com a variables d'entorn temporals al moment d'execució.

## Checklist per cada workflow
- [ ] Variables substituïdes correctament (cap `{{VARIABLE}}` literal al JSON final)
- [ ] Workflow activat automàticament en crear-lo
- [ ] `n8nWorkflowId` guardat a la BD
- [ ] Execucions registrades a `AutomationExecution`
- [ ] Credentials desencriptades en memòria (mai als logs)
- [ ] Pause/resume funciona via `PATCH /workflows/:id`

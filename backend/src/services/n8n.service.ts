const N8N_URL     = process.env.N8N_API_URL?.replace('/api/v1', '') ?? 'http://localhost:5678'
const N8N_API_KEY = process.env.N8N_API_KEY ?? ''

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY,
  }
}

function substituteVariables(json: object, vars: Record<string, string>): object {
  let str = JSON.stringify(json)
  for (const [k, v] of Object.entries(vars)) {
    str = str.replaceAll(`{{${k}}}`, v)
  }
  return JSON.parse(str)
}

async function n8nFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${N8N_URL}/api/v1${path}`
  const res = await fetch(url, { ...options, headers: { ...headers(), ...(options.headers ?? {}) } })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw Object.assign(new Error(`n8n API error ${res.status}: ${text}`), { status: res.status })
  }
  return res
}

export async function createWorkflow(
  templateJson: object,
  vars: Record<string, string>
): Promise<string> {
  const workflow = substituteVariables(templateJson, vars)
  const res  = await n8nFetch('/workflows', {
    method: 'POST',
    body:   JSON.stringify(workflow),
  })
  const data = await res.json() as { id: string }
  // Activar immediatament
  await activateWorkflow(data.id)
  return data.id
}

export async function activateWorkflow(n8nId: string): Promise<void> {
  await n8nFetch(`/workflows/${n8nId}/activate`, { method: 'POST' })
}

export async function deactivateWorkflow(n8nId: string): Promise<void> {
  await n8nFetch(`/workflows/${n8nId}/deactivate`, { method: 'POST' })
}

export async function deleteWorkflow(n8nId: string): Promise<void> {
  await n8nFetch(`/workflows/${n8nId}`, { method: 'DELETE' })
}

export async function getWorkflow(n8nId: string): Promise<{ id: string; active: boolean; name: string }> {
  const res  = await n8nFetch(`/workflows/${n8nId}`)
  return res.json() as Promise<{ id: string; active: boolean; name: string }>
}

export async function getExecutions(n8nId: string, limit = 10): Promise<unknown[]> {
  const res = await n8nFetch(`/executions?workflowId=${n8nId}&limit=${limit}`)
  const data = await res.json() as { data: unknown[] }
  return data.data ?? []
}

export function isN8nAvailable(): boolean {
  return Boolean(N8N_API_KEY)
}

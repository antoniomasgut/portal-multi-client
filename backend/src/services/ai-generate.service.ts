import { prisma } from '../db'
import { decrypt } from '../utils/encrypt'

interface LandingContent {
  title:       string
  subtitle:    string
  description: string
  ctaText:     string
  services:    string[]
}

interface WhatsAppBotContent {
  greeting:    string
  tone:        string
  faqs:        { q: string; a: string }[]
}

interface TelegramBotContent {
  greeting:    string
  tone:        string
  faqs:        { q: string; a: string }[]
}

// ── Recupera el primer proveïdor actiu del client ──────────────────────────

async function getProvider(clientId: string) {
  const rows = await prisma.aIProvider.findMany({
    where:   { clientId, isActive: true },
    orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    take:    3,
  })
  for (const row of rows) {
    if (row.provider === 'GROQ' || row.provider === 'OPENAI' || row.provider === 'ANTHROPIC') {
      const apiKey = row.apiKeyEnc && row.apiKeyIv && row.apiKeyTag
        ? decrypt({ encryptedVal: row.apiKeyEnc, iv: row.apiKeyIv, tag: row.apiKeyTag })
        : null
      if (apiKey) return { provider: row.provider, model: row.model, apiKey }
    }
    if (row.provider === 'OLLAMA' && row.baseUrl) {
      return { provider: 'OLLAMA', model: row.model, apiKey: null, baseUrl: row.baseUrl }
    }
  }
  // Fallback: Groq amb clau global (si existeix)
  const globalKey = process.env.GROQ_API_KEY
  if (globalKey) return { provider: 'GROQ', model: 'llama-3.3-70b-versatile', apiKey: globalKey }
  throw Object.assign(new Error('Cap proveïdor IA configurat per a aquest client'), { status: 503 })
}

// ── Crida genèrica al LLM ──────────────────────────────────────────────────

async function callLLM(
  prov: { provider: string; model: string; apiKey: string | null; baseUrl?: string },
  systemPrompt: string,
  userPrompt:   string
): Promise<string> {
  let url:     string
  let headers: Record<string, string>

  if (prov.provider === 'OLLAMA') {
    url     = `${prov.baseUrl}/api/chat`
    headers = { 'Content-Type': 'application/json' }
  } else if (prov.provider === 'OPENAI') {
    url     = 'https://api.openai.com/v1/chat/completions'
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${prov.apiKey}` }
  } else if (prov.provider === 'ANTHROPIC') {
    url     = 'https://api.anthropic.com/v1/messages'
    headers = { 'Content-Type': 'application/json', 'x-api-key': prov.apiKey!, 'anthropic-version': '2023-06-01' }
  } else {
    // GROQ — compatible amb OpenAI
    url     = 'https://api.groq.com/openai/v1/chat/completions'
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${prov.apiKey}` }
  }

  const body = prov.provider === 'ANTHROPIC'
    ? { model: prov.model, max_tokens: 1024, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] }
    : prov.provider === 'OLLAMA'
    ? { model: prov.model, stream: false, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }] }
    : { model: prov.model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], max_tokens: 1024, temperature: 0.7 }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) {
    const errText = await res.text()
    if (res.status === 401 || res.status === 403) {
      throw Object.assign(new Error(`Clau API invàlida per a ${prov.provider}. Revisa la configuració del proveïdor IA.`), { status: 422 })
    }
    throw Object.assign(new Error(`Error del servei IA (${res.status}): ${errText.slice(0, 100)}`), { status: 502 })
  }
  const json: any = await res.json()

  if (prov.provider === 'ANTHROPIC') return json.content?.[0]?.text ?? ''
  if (prov.provider === 'OLLAMA')    return json.message?.content ?? ''
  return json.choices?.[0]?.message?.content ?? ''
}

function parseJSON<T>(text: string): T {
  const match = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/)
  const raw   = match ? match[1] : text
  return JSON.parse(raw.trim())
}

// ── Generar contingut landing ──────────────────────────────────────────────

export async function generateLandingContent(
  clientId:    string,
  companyName: string,
  sector:      string,
  lang:        string
): Promise<LandingContent> {
  const prov   = await getProvider(clientId)
  const langMap = { ca: 'català', es: 'español', en: 'English' }
  const langLabel = langMap[lang as keyof typeof langMap] ?? 'català'

  const system = `Ets un expert en màrqueting digital i copywriting per a pimes.
Generes contingut concís, professional i orientat a conversió.
Respon SEMPRE en ${langLabel} i en format JSON vàlid.`

  const user = `Genera el contingut per a la landing page de l'empresa "${companyName}" del sector "${sector}".

Respon amb aquest JSON exacte (sense cap text addicional):
{
  "title": "títol principal (màx 60 caràcters)",
  "subtitle": "subtítol (màx 100 caràcters)",
  "description": "descripció atractiva del negoci (2-3 frases, màx 300 caràcters)",
  "ctaText": "text del botó de crida a l'acció (màx 30 caràcters)",
  "services": ["servei 1", "servei 2", "servei 3", "servei 4"]
}`

  const raw     = await callLLM(prov, system, user)
  const content = parseJSON<LandingContent>(raw)

  return {
    title:       content.title?.slice(0, 60)       ?? companyName,
    subtitle:    content.subtitle?.slice(0, 100)   ?? '',
    description: content.description?.slice(0, 300) ?? '',
    ctaText:     content.ctaText?.slice(0, 30)     ?? 'Contacta\'ns',
    services:    Array.isArray(content.services) ? content.services.slice(0, 6) : [],
  }
}

// ── Generar config bot WhatsApp ────────────────────────────────────────────

export async function generateWhatsAppBotContent(
  clientId:    string,
  companyName: string,
  sector:      string,
  lang:        string
): Promise<WhatsAppBotContent> {
  const prov      = await getProvider(clientId)
  const langMap   = { ca: 'català', es: 'español', en: 'English' }
  const langLabel = langMap[lang as keyof typeof langMap] ?? 'català'

  const system = `Ets un expert en atenció al client via WhatsApp per a pimes. Respon en ${langLabel} i en JSON vàlid.`
  const user   = `Genera la configuració inicial per al bot de WhatsApp de "${companyName}" (sector: ${sector}).

Respon amb:
{
  "greeting": "missatge de benvinguda breu i amable (màx 200 caràcters)",
  "tone": "professional|amable|informal",
  "faqs": [
    {"q": "pregunta freqüent 1", "a": "resposta breu"},
    {"q": "pregunta freqüent 2", "a": "resposta breu"},
    {"q": "pregunta freqüent 3", "a": "resposta breu"}
  ]
}`

  const raw     = await callLLM(prov, system, user)
  const content = parseJSON<WhatsAppBotContent>(raw)

  return {
    greeting: content.greeting?.slice(0, 200) ?? `Hola! Sóc el bot de ${companyName}. En què et puc ajudar?`,
    tone:     ['professional', 'amable', 'informal'].includes(content.tone) ? content.tone : 'amable',
    faqs:     Array.isArray(content.faqs) ? content.faqs.slice(0, 10) : [],
  }
}

// ── Generar config bot Telegram ────────────────────────────────────────────

export async function generateTelegramBotContent(
  clientId:    string,
  companyName: string,
  sector:      string,
  lang:        string
): Promise<TelegramBotContent> {
  const prov      = await getProvider(clientId)
  const langMap   = { ca: 'català', es: 'español', en: 'English' }
  const langLabel = langMap[lang as keyof typeof langMap] ?? 'català'

  const system = `Ets un expert en atenció al client via Telegram per a pimes. Respon en ${langLabel} i en JSON vàlid.`
  const user   = `Genera la configuració inicial per al bot de Telegram de "${companyName}" (sector: ${sector}).

Respon amb:
{
  "greeting": "missatge de benvinguda breu i amable per a Telegram (màx 200 caràcters)",
  "tone": "professional|amable|informal",
  "faqs": [
    {"q": "pregunta freqüent 1", "a": "resposta breu"},
    {"q": "pregunta freqüent 2", "a": "resposta breu"},
    {"q": "pregunta freqüent 3", "a": "resposta breu"}
  ]
}`

  const raw     = await callLLM(prov, system, user)
  const content = parseJSON<TelegramBotContent>(raw)

  return {
    greeting: content.greeting?.slice(0, 200) ?? `Hola! Sóc el bot de Telegram de ${companyName}. En què et puc ajudar?`,
    tone:     ['professional', 'amable', 'informal'].includes(content.tone) ? content.tone : 'amable',
    faqs:     Array.isArray(content.faqs) ? content.faqs.slice(0, 10) : [],
  }
}

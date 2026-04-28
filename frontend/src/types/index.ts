export type ServiceCategory = 'PRODUCTE' | 'IA' | 'AUTOMATITZACIONS' | 'COMUNICACIO' | 'INFORMES' | 'SUPORT' | 'OPERACIONAL'

export interface Service {
  id:           string
  name:         string
  slug:         string
  description:  string | null
  category:     ServiceCategory
  setupPrice:   number
  monthlyPrice: number
  isActive:     boolean
  planServices?: { plan: { id: string; name: string; slug: string } }[]
}

export interface PlanService {
  service: Service
}

export interface Plan {
  id:           string
  name:         string
  slug:         string
  priceMonthly: number
  maxDomains:   number
  maxUsers:     number
  maxConversations?: number | null
  maxTokens?:        number | null
  maxAutomations?:   number | null
  maxIntegrations?:  number | null
  maxRagDocuments?:  number | null
  hasLandingPro:   boolean
  hasCustomDomain: boolean
  hasRag:          boolean
  hasTelegram:     boolean
  extraConversationPrice: number
  extraTokenPrice:        number
  isActive:     boolean
  services:     PlanService[]
}

export interface SubscriptionService {
  serviceId:   string
  isExtra:     boolean
  active:      boolean
  activatedAt: string | null
  service:     Service
}

export interface Subscription {
  id:           string
  status:       'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL'
  startDate:    string
  renewsAt:     string | null
  isCustom:     boolean
  priceMonthly: number
  priceSetup:   number
  plan:         Plan | null
  services:     SubscriptionService[]
}

export interface Client {
  id:           string
  companyName:  string
  contactName:  string
  contactEmail: string
  contactPhone: string | null
  nif:          string | null
  address:      string | null
  domain:       string | null
  logoUrl:      string | null
  notes:        string | null
  isTest:       boolean
  createdAt:    string
  subscriptions: Subscription[]
  _count?: { users: number }
}

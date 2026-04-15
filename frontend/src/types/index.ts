export interface Service {
  id:          string
  name:        string
  slug:        string
  description: string | null
  isActive:    boolean
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
  isActive:     boolean
  services:     PlanService[]
}

export interface SubscriptionService {
  serviceId: string
  isExtra:   boolean
  service:   Service
}

export interface Subscription {
  id:                 string
  status:             'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL'
  startDate:          string
  renewsAt:           string | null
  isCustom:           boolean
  customPriceMonthly: number | null
  plan:               Plan | null
  services:           SubscriptionService[]
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
  createdAt:    string
  subscriptions: Subscription[]
  _count?: { users: number }
}

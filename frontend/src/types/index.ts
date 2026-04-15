export interface Plan {
  id:           string
  name:         string
  slug:         string
  priceMonthly: number
  maxDomains:   number
  maxUsers:     number
  features:     string[]
  isActive:     boolean
}

export interface Subscription {
  id:                 string
  status:             'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL'
  startDate:          string
  renewsAt:           string | null
  isCustom:           boolean
  customPriceMonthly: number | null
  customFeatures:     string[]
  plan:               Plan | null
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

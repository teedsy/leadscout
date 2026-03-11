export interface LeadPain {
  title: string
  severity: 'high' | 'med' | 'low'
  note: string
  source: 'verified' | 'inferred'
}

export interface ScoreDimension {
  dim: string
  pts: number
  max: number
}

export interface Lead {
  _id?: string
  name: string
  industry: string
  industryLabel: string
  size: string
  model: string
  address: string | null
  phone: string | null
  website: string
  keyContact: string | null
  keyContactTitle: string | null
  score: number
  tier: 'hot' | 'warm' | 'lukewarm'
  trigger: string
  pains: LeadPain[]
  scores: ScoreDimension[]
  emailSubject: string
  emailBody: string
  sourceNote: string
  // metadata
  searchId: string
  city: string
  industries: string[]
  createdAt: Date
}

export interface LeadSearch {
  _id?: string
  searchId: string
  city: string
  industries: string[]
  companySize: string
  aiService: string
  extraContext: string
  leadCount: number
  createdAt: Date
}

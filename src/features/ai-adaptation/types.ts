export type AIAdaptationStatus = 'active' | 'ignored' | 'expired'

export interface AIAdaptationRule {
  id: string
  signal_type: string
  rule_key: string
  preference_value: Record<string, unknown>
  confidence: number
  evidence_count: number
  status: AIAdaptationStatus
  last_observed_at: string
  updated_at: string
}

export interface AIAdaptationProfile {
  days: number
  rules: AIAdaptationRule[]
  generated_at: string
}

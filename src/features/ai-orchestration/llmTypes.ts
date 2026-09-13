import type { AIRecommendationPriority, AIRecommendationType } from './types'

export type AIProvider = 'openai' | 'anthropic'

export interface LLMRecommendation {
  type: AIRecommendationType
  priority: AIRecommendationPriority
  title: string
  rationale: string
  action: string
  source_signals: string[]
}

export interface LLMReasoningResult {
  provider: AIProvider
  model: string
  horizon: 'today' | 'week'
  generated_at: string
  focus: string | null
  recommendations: LLMRecommendation[]
  confidence: number
}

export interface LLMReasoningInput {
  horizon?: 'today' | 'week'
  provider?: AIProvider
  model?: string
  instruction?: string
}

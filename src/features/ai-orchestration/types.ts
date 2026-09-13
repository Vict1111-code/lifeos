export type AIRecommendationPriority = 'low' | 'medium' | 'high'
export type AIRecommendationType = 'next_action' | 'goal_risk' | 'reflection' | 'planning' | 'review'

export interface AIContextSnapshot {
  generated_at: string
  progress: Record<string, unknown>
  reflection: Record<string, unknown>
  next_best_action: string | null
}

export interface AIRecommendation {
  id: string
  type: AIRecommendationType
  priority: AIRecommendationPriority
  title: string
  rationale: string
  action: string
  source_signals: string[]
  created_at: string
}

export interface AdaptivePlan {
  horizon: 'today' | 'week'
  generated_at: string
  focus: string | null
  recommendations: AIRecommendation[]
  context: AIContextSnapshot
}

export type AIFeedbackRating = 'helpful' | 'not_helpful'

export interface AIExecutionFeedback {
  id: string
  user_id: string
  action_id: string | null
  recommendation_type: string | null
  rating: AIFeedbackRating
  outcome: 'successful' | 'partial' | 'unsuccessful' | 'unknown'
  note: string | null
  context: Record<string, unknown>
  created_at: string
}

export interface AILearningMetrics {
  feedback_count: number
  helpful_count: number
  success_count: number
  partial_count: number
  unsuccessful_count: number
  helpful_rate: number
  success_rate: number
  top_friction_points: string[]
}

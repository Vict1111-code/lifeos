import { supabase } from '../../lib/supabase/client'
import type { AIExecutionFeedback, AILearningMetrics } from './types'

export async function recordAIFeedback(input: Omit<AIExecutionFeedback, 'id' | 'user_id' | 'created_at'>): Promise<AIExecutionFeedback> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('ai_execution_feedback')
    .insert({
      action_id: input.action_id,
      recommendation_type: input.recommendation_type,
      rating: input.rating,
      outcome: input.outcome,
      note: input.note,
      context: input.context,
    })
    .select('id,user_id,action_id,recommendation_type,rating,outcome,note,context,created_at')
    .single()
  if (error) throw error
  return data as AIExecutionFeedback
}

export async function getAILearningMetrics(days = 30): Promise<AILearningMetrics> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const safeDays = Math.max(7, Math.min(days, 90))
  const { data, error } = await supabase.rpc('get_ai_learning_metrics', { p_days: safeDays })
  if (error) throw error
  return data as AILearningMetrics
}

import { supabase } from '../../lib/supabase/client'
import type { GoalEvidence, GoalEvidenceInput } from './types'

export async function listGoalEvidence(goalId?: string): Promise<GoalEvidence[]> {
  let query = supabase.from('goal_evidence').select('*').order('occurred_at', { ascending: false })
  if (goalId) query = query.eq('goal_id', goalId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as GoalEvidence[]
}

export async function createGoalEvidence(input: GoalEvidenceInput): Promise<GoalEvidence> {
  const { data, error } = await supabase.from('goal_evidence').insert(input).select('*').single()
  if (error) throw error
  return data as GoalEvidence
}

export async function updateGoalEvidence(id: string, input: GoalEvidenceInput): Promise<GoalEvidence> {
  const { data, error } = await supabase.from('goal_evidence').update(input).eq('id', id).select('*').single()
  if (error) throw error
  return data as GoalEvidence
}

export async function deleteGoalEvidence(id: string): Promise<void> {
  const { error } = await supabase.from('goal_evidence').delete().eq('id', id)
  if (error) throw error
}

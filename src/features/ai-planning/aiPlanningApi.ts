import { supabase } from '../../lib/supabase/client'
import type { AutonomousPlan, AutonomousPlanHorizon, AutonomousPlanItem } from './types'

function mapPlan(row: Record<string, unknown>, items: AutonomousPlanItem[]): AutonomousPlan {
  return {
    ...(row as AutonomousPlan),
    focus: row.focus as string | null,
    rationale: row.rationale as string | null,
    confidence: Number(row.confidence ?? 0),
    items,
  }
}

async function getPlan(id: string): Promise<AutonomousPlan> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: plan, error: planError } = await supabase
    .from('autonomous_plans')
    .select('id,user_id,horizon,status,title,focus,rationale,confidence,generated_at,activated_at,completed_at,created_at,updated_at')
    .eq('id', id)
    .single()
  if (planError) throw planError
  const { data: items, error: itemError } = await supabase
    .from('autonomous_plan_items')
    .select('id,plan_id,user_id,task_id,item_type,title,description,scheduled_date,start_at,duration_minutes,priority,sort_order,status,source_signals,created_at,updated_at')
    .eq('plan_id', id)
    .order('sort_order', { ascending: true })
  if (itemError) throw itemError
  return mapPlan(plan, (items ?? []) as AutonomousPlanItem[])
}

export async function getLatestAutonomousPlan(horizon: AutonomousPlanHorizon = 'today') {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('autonomous_plans')
    .select('id')
    .eq('horizon', horizon)
    .in('status', ['draft', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.id ? getPlan(data.id) : null
}

export async function generateAutonomousPlan(horizon: AutonomousPlanHorizon = 'today') {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('generate_autonomous_plan', { p_horizon: horizon })
  if (error) throw error
  if (!data?.plan_id) throw new Error('The autonomous planning engine returned no plan.')
  return getPlan(String(data.plan_id))
}

export async function activateAutonomousPlan(id: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.rpc('activate_autonomous_plan', { p_plan_id: id })
  if (error) throw error
  return getPlan(id)
}

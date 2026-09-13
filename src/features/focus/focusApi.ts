import { supabase } from '../../lib/supabase/client'
import type { FocusSession, FocusStartInput } from './types'

const select = 'id,user_id,task_id,goal_id,started_at,ended_at,planned_minutes,actual_minutes,status,created_at,tasks(title),goals(title)'

function flatten(row: any): FocusSession {
  return {
    ...row,
    task_title: row.tasks?.title ?? null,
    goal_title: row.goals?.title ?? null,
    life_area_name: null,
  }
}

export async function listFocusSessions(limit = 20): Promise<FocusSession[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('focus_sessions').select(select).order('started_at', { ascending: false }).limit(limit)
  if (error) throw error
  return (data ?? []).map(flatten)
}

export async function getActiveFocusSession(): Promise<FocusSession | null> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('focus_sessions').select(select).eq('status', 'active').order('started_at', { ascending: false }).limit(1).maybeSingle()
  if (error) throw error
  return data ? flatten(data) : null
}

export async function startFocusSession(input: FocusStartInput): Promise<FocusSession> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: active, error: activeError } = await supabase.from('focus_sessions').select('id').eq('status', 'active').limit(1).maybeSingle()
  if (activeError) throw activeError
  if (active) throw new Error('A focus session is already active. Complete or cancel it before starting another.')

  const { data, error } = await supabase.from('focus_sessions').insert({ task_id: input.task_id ?? null, goal_id: input.goal_id ?? null, started_at: new Date().toISOString(), planned_minutes: input.planned_minutes, status: 'active' }).select(select).single()
  if (error) throw error
  return flatten(data)
}

export async function completeFocusSession(id: string, actualMinutes: number): Promise<FocusSession> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('focus_sessions').update({ ended_at: new Date().toISOString(), actual_minutes: Math.max(0, Math.round(actualMinutes)), status: 'completed' }).eq('id', id).eq('status', 'active').select(select).single()
  if (error) throw error
  return flatten(data)
}

export async function cancelFocusSession(id: string, actualMinutes: number): Promise<FocusSession> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('focus_sessions').update({ ended_at: new Date().toISOString(), actual_minutes: Math.max(0, Math.round(actualMinutes)), status: 'cancelled' }).eq('id', id).eq('status', 'active').select(select).single()
  if (error) throw error
  return flatten(data)
}

export async function listFocusTargets() {
  if (!supabase) throw new Error('Supabase is not configured.')
  const [{ data: tasks, error: tasksError }, { data: goals, error: goalsError }] = await Promise.all([
    supabase.from('tasks').select('id,title,goal_id,life_area_id').not('status', 'in', '(completed,cancelled,skipped)').order('due_at', { ascending: true, nullsFirst: false }).limit(100),
    supabase.from('goals').select('id,title,life_area_id').in('status', ['draft', 'active', 'paused']).order('target_date', { ascending: true, nullsFirst: false }).limit(100),
  ])
  if (tasksError) throw tasksError
  if (goalsError) throw goalsError
  return { tasks: tasks ?? [], goals: goals ?? [] }
}

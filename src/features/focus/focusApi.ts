import { supabase } from '../../lib/supabase/client'
import type { FocusSession, FocusStartInput } from './types'

const select = 'id,user_id,task_id,goal_id,started_at,ended_at,planned_minutes,actual_minutes,status,created_at,tasks(title),goals(title)'

function flatten(row: any): FocusSession {
  return {
    id: row.id,
    user_id: row.user_id,
    task_id: row.task_id,
    goal_id: row.goal_id,
    started_at: row.started_at,
    ended_at: row.ended_at,
    planned_minutes: row.planned_minutes,
    actual_minutes: row.actual_minutes,
    status: row.status,
    task_title: row.tasks?.title ?? null,
    goal_title: row.goals?.title ?? null,
  }
}

async function addTaskActualMinutes(taskId: string | null, minutes: number) {
  if (!supabase || !taskId || minutes <= 0) return
  const { error } = await supabase.rpc('add_task_actual_minutes', { p_task_id: taskId, p_minutes: Math.max(1, Math.round(minutes)) })
  if (error) throw error
}

async function markTaskInProgress(taskId: string | null) {
  if (!supabase || !taskId) return
  const { error } = await supabase.from('tasks').update({ status: 'in_progress', start_at: new Date().toISOString() }).eq('id', taskId).not('status', 'in', '(completed,cancelled,skipped)')
  if (error) throw error
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
  if (!Number.isInteger(input.planned_minutes) || input.planned_minutes <= 0) throw new Error('Focus duration must be a positive whole number of minutes.')

  const { data: active, error: activeError } = await supabase.from('focus_sessions').select('id').eq('status', 'active').limit(1).maybeSingle()
  if (activeError) throw activeError
  if (active) throw new Error('A focus session is already active. Complete or cancel it before starting another.')

  await markTaskInProgress(input.task_id ?? null)

  const { data, error } = await supabase.from('focus_sessions').insert({ task_id: input.task_id ?? null, goal_id: input.goal_id ?? null, started_at: new Date().toISOString(), planned_minutes: input.planned_minutes, status: 'active' }).select(select).single()
  if (error) throw error
  return flatten(data)
}

async function finishFocusSession(id: string, actualMinutes: number, status: 'completed' | 'cancelled'): Promise<FocusSession> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const minutes = Math.max(0, Math.round(actualMinutes))
  const { data, error } = await supabase.from('focus_sessions').update({ ended_at: new Date().toISOString(), actual_minutes: minutes, status }).eq('id', id).eq('status', 'active').select(select).single()
  if (error) throw error
  try {
    await addTaskActualMinutes(data.task_id, minutes)
  } catch (taskError) {
    await supabase.from('focus_sessions').update({ ended_at: null, actual_minutes: null, status: 'active' }).eq('id', id)
    throw taskError
  }
  return flatten(data)
}

export async function completeFocusSession(id: string, actualMinutes: number) {
  return finishFocusSession(id, actualMinutes, 'completed')
}

export async function cancelFocusSession(id: string, actualMinutes: number) {
  return finishFocusSession(id, actualMinutes, 'cancelled')
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

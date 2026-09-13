import { supabase } from '../../lib/supabase/client'
import type { ProgressIntelligenceData, ProgressSnapshot, ProgressSummary } from './types'

export async function getProgressSummary(): Promise<ProgressSummary> {
  const { data, error } = await supabase.rpc('get_progress_summary')
  if (error) throw error
  return data as ProgressSummary
}

export async function getProgressIntelligence(): Promise<ProgressIntelligenceData> {
  const { data, error } = await supabase.rpc('get_progress_intelligence')
  if (error) throw error
  return data as ProgressIntelligenceData
}

export async function getProgressTrend(days = 14): Promise<ProgressSnapshot[]> {
  const safeDays = Math.max(1, Math.min(days, 90))
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - safeDays + 1)
  const startIso = start.toISOString()

  const [{ data: tasks, error: tasksError }, { data: focus, error: focusError }, { data: goals, error: goalsError }] = await Promise.all([
    supabase.from('tasks').select('completed_at').eq('status', 'completed').gte('completed_at', startIso),
    supabase.from('focus_sessions').select('started_at,actual_minutes,status').eq('status', 'completed').gte('started_at', startIso),
    supabase.from('goals').select('created_at,updated_at,progress').gte('updated_at', startIso),
  ])
  if (tasksError) throw tasksError
  if (focusError) throw focusError
  if (goalsError) throw goalsError

  const result: ProgressSnapshot[] = []
  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - offset)
    const key = date.toISOString().slice(0, 10)
    const taskCount = (tasks ?? []).filter(row => row.completed_at?.slice(0, 10) === key).length
    const focusMinutes = (focus ?? []).filter(row => row.started_at?.slice(0, 10) === key).reduce((sum, row) => sum + (row.actual_minutes ?? 0), 0)
    const goalRows = (goals ?? []).filter(row => row.updated_at?.slice(0, 10) === key)
    const goalProgress = goalRows.length ? goalRows.reduce((sum, row) => sum + Number(row.progress ?? 0), 0) / goalRows.length : 0
    result.push({ date: key, tasks_completed: taskCount, focus_minutes: focusMinutes, goal_progress: Math.round(goalProgress * 10) / 10 })
  }
  return result
}

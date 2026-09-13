import { supabase } from '../../lib/supabase/client'
import type { Goal, GoalInput } from './types'

async function requireUserId() {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('You must be signed in.')
  return data.user.id
}

async function hydrate(rows: unknown[]): Promise<Goal[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const items = rows as Array<Record<string, unknown>>
  if (!items.length) return []
  const ids = items.map(row => row.id as string)
  const [{ data: tasks, error: tasksError }, { data: areas, error: areasError }] = await Promise.all([
    supabase.from('tasks').select('id,goal_id,status').in('goal_id', ids),
    supabase.from('life_areas').select('id,name').in('id', items.map(row => row.life_area_id as string).filter(Boolean)),
  ])
  if (tasksError) throw tasksError
  if (areasError) throw areasError

  const areaNames = new Map((areas ?? []).map(row => [row.id, row.name]))
  const taskCounts = new Map<string, { total: number; completed: number }>()
  for (const task of tasks ?? []) {
    const count = taskCounts.get(task.goal_id) ?? { total: 0, completed: 0 }
    count.total += 1
    if (task.status === 'completed') count.completed += 1
    taskCounts.set(task.goal_id, count)
  }

  return items.map(row => {
    const counts = taskCounts.get(row.id as string) ?? { total: 0, completed: 0 }
    return {
      id: row.id as string,
      life_area_id: (row.life_area_id as string | null) ?? null,
      parent_goal_id: (row.parent_goal_id as string | null) ?? null,
      title: row.title as string,
      description: (row.description as string | null) ?? null,
      why: (row.why as string | null) ?? null,
      outcome: (row.outcome as string | null) ?? null,
      status: row.status as Goal['status'],
      priority: row.priority as Goal['priority'],
      progress: Number(row.progress ?? 0),
      target_value: row.target_value == null ? null : Number(row.target_value),
      current_value: row.current_value == null ? null : Number(row.current_value),
      unit: (row.unit as string | null) ?? null,
      start_date: (row.start_date as string | null) ?? null,
      target_date: (row.target_date as string | null) ?? null,
      completed_at: (row.completed_at as string | null) ?? null,
      health_score: row.health_score == null ? null : Number(row.health_score),
      ai_summary: (row.ai_summary as string | null) ?? null,
      life_area_name: row.life_area_id ? areaNames.get(row.life_area_id as string) ?? null : null,
      task_count: counts.total,
      completed_task_count: counts.completed,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }
  })
}

const columns = 'id,life_area_id,parent_goal_id,title,description,why,outcome,status,priority,progress,target_value,current_value,unit,start_date,target_date,completed_at,health_score,ai_summary,created_at,updated_at'

export async function listGoals() {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('goals').select(columns).not('status', 'eq', 'archived').order('status').order('priority').order('target_date', { ascending: true, nullsFirst: false })
  if (error) throw error
  return hydrate(data ?? [])
}

export async function createGoal(input: GoalInput) {
  const userId = await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('goals').insert({ ...input, user_id: userId }).select(columns).single()
  if (error) throw error
  return (await hydrate([data]))[0]
}

export async function updateGoal(id: string, input: GoalInput) {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('goals').update(input).eq('id', id).select(columns).single()
  if (error) throw error
  return (await hydrate([data]))[0]
}

export async function updateGoalProgress(id: string, progress: number, currentValue?: number | null) {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const nextProgress = Math.max(0, Math.min(100, progress))
  const patch: Record<string, unknown> = { progress: nextProgress }
  if (currentValue !== undefined) patch.current_value = currentValue
  if (nextProgress >= 100) { patch.status = 'completed'; patch.completed_at = new Date().toISOString() }
  const { data, error } = await supabase.from('goals').update(patch).eq('id', id).select(columns).single()
  if (error) throw error
  return (await hydrate([data]))[0]
}

export async function setGoalStatus(id: string, status: Goal['status']) {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const patch = { status, completed_at: status === 'completed' ? new Date().toISOString() : null }
  const { data, error } = await supabase.from('goals').update(patch).eq('id', id).select(columns).single()
  if (error) throw error
  return (await hydrate([data]))[0]
}

export async function calculateGoalHealth(id: string) {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('calculate_goal_health', { p_goal_id: id })
  if (error) throw error
  return Number(data ?? 0)
}

export async function recalculateAllGoalHealth() {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('recalculate_user_goal_health')
  if (error) throw error
  return Number(data ?? 0)
}

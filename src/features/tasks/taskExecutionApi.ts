import { supabase } from '../../lib/supabase/client'
import type { Task } from './types'
import type { TaskFormValues } from './taskForm'

const select = 'id,title,description,status,priority,due_at,start_at,estimated_minutes,actual_minutes,goal_id,life_area_id,sort_order,completed_at,goals(title),life_areas(name)'

function mapTask(row: unknown): Task {
  const task = row as Task & { goals?: { title: string } | null; life_areas?: { name: string } | null }
  return { ...task, goal_title: task.goals?.title ?? null, life_area_name: task.life_areas?.name ?? null }
}

export async function listTaskOptions() {
  if (!supabase) throw new Error('Supabase is not configured.')
  const [goals, areas] = await Promise.all([
    supabase.from('goals').select('id,title').in('status', ['active', 'planned']).order('target_date', { ascending: true, nullsFirst: false }),
    supabase.from('life_areas').select('id,name').eq('is_active', true).order('sort_order', { ascending: true }),
  ])
  if (goals.error) throw goals.error
  if (areas.error) throw areas.error
  return { goals: goals.data ?? [], lifeAreas: areas.data ?? [] }
}

export async function createTask(values: TaskFormValues): Promise<Task> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('You must be signed in to create a task.')
  const { data, error } = await supabase.from('tasks').insert({ user_id: auth.user.id, title: values.title.trim(), description: values.description.trim() || null, status: values.status, priority: values.priority, due_at: values.due_at ? new Date(values.due_at).toISOString() : null, start_at: values.start_at ? new Date(values.start_at).toISOString() : null, estimated_minutes: values.estimated_minutes ? Number(values.estimated_minutes) : null, goal_id: values.goal_id || null, life_area_id: values.life_area_id || null }).select(select).single()
  if (error) throw error
  return mapTask(data)
}

export async function updateTask(id: string, values: TaskFormValues): Promise<Task> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('tasks').update({ title: values.title.trim(), description: values.description.trim() || null, status: values.status, priority: values.priority, due_at: values.due_at ? new Date(values.due_at).toISOString() : null, start_at: values.start_at ? new Date(values.start_at).toISOString() : null, estimated_minutes: values.estimated_minutes ? Number(values.estimated_minutes) : null, goal_id: values.goal_id || null, life_area_id: values.life_area_id || null }).eq('id', id).select(select).single()
  if (error) throw error
  return mapTask(data)
}

export async function archiveTask(id: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.from('tasks').update({ status: 'cancelled' }).eq('id', id)
  if (error) throw error
}

export async function startTask(id: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('tasks').update({ status: 'in_progress', start_at: new Date().toISOString() }).eq('id', id).select(select).single()
  if (error) throw error
  return mapTask(data)
}

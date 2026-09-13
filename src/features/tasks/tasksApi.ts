import { supabase } from '../../lib/supabase/client'
import type { Task } from './types'

export async function listTasks(): Promise<Task[]> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase
    .from('tasks')
    .select('id,title,description,status,priority,due_at,start_at,estimated_minutes,actual_minutes,goal_id,life_area_id,sort_order,completed_at,goals(title),life_areas(name)')
    .order('status')
    .order('priority')
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('sort_order', { ascending: true })

  if (error) throw error

  return (data ?? []).map((task) => {
    const row = task as typeof task & { goals?: { title: string } | null; life_areas?: { name: string } | null }
    return {
      ...task,
      goal_title: row.goals?.title ?? null,
      life_area_name: row.life_areas?.name ?? null,
    } as Task
  })
}

export async function updateTaskStatus(id: string, status: Task['status']) {
  if (!supabase) throw new Error('Supabase is not configured.')

  const completed = status === 'completed'
  const { data, error } = await supabase
    .from('tasks')
    .update({ status, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id,title,description,status,priority,due_at,start_at,estimated_minutes,actual_minutes,goal_id,life_area_id,sort_order,completed_at,goals(title),life_areas(name)')
    .single()

  if (error) throw error
  const row = data as typeof data & { goals?: { title: string } | null; life_areas?: { name: string } | null }
  return { ...data, goal_title: row.goals?.title ?? null, life_area_name: row.life_areas?.name ?? null } as Task
}

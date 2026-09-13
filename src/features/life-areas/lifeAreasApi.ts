import { supabase } from '../../lib/supabase/client'
import type { LifeArea, LifeAreaInput } from './types'

async function requireUserId() {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('You must be signed in.')
  return data.user.id
}

async function hydrate(rows: unknown[]): Promise<LifeArea[]> {
  const items = (rows ?? []) as Array<Record<string, unknown>>
  if (!items.length) return []
  const ids = items.map(row => row.id as string)
  if (!supabase) throw new Error('Supabase is not configured.')

  const [{ data: goals, error: goalsError }, { data: tasks, error: tasksError }] = await Promise.all([
    supabase.from('goals').select('life_area_id').in('life_area_id', ids),
    supabase.from('tasks').select('life_area_id').in('life_area_id', ids),
  ])
  if (goalsError) throw goalsError
  if (tasksError) throw tasksError

  const goalCounts = new Map<string, number>()
  const taskCounts = new Map<string, number>()
  for (const row of goals ?? []) goalCounts.set(row.life_area_id, (goalCounts.get(row.life_area_id) ?? 0) + 1)
  for (const row of tasks ?? []) taskCounts.set(row.life_area_id, (taskCounts.get(row.life_area_id) ?? 0) + 1)

  return items.map(row => ({
    id: row.id as string,
    name: row.name as string,
    category: row.category as LifeArea['category'],
    description: (row.description as string | null) ?? null,
    color_token: (row.color_token as string | null) ?? null,
    icon_name: (row.icon_name as string | null) ?? null,
    sort_order: (row.sort_order as number) ?? 0,
    is_active: (row.is_active as boolean) ?? true,
    goal_count: goalCounts.get(row.id as string) ?? 0,
    task_count: taskCounts.get(row.id as string) ?? 0,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }))
}

export async function listLifeAreas(includeInactive = true) {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  let query = supabase.from('life_areas').select('id,name,category,description,color_token,icon_name,sort_order,is_active,created_at,updated_at').order('sort_order').order('name')
  if (!includeInactive) query = query.eq('is_active', true)
  const { data, error } = await query
  if (error) throw error
  return hydrate(data ?? [])
}

export async function createLifeArea(input: LifeAreaInput) {
  const userId = await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('life_areas').insert({ ...input, user_id: userId }).select('id,name,category,description,color_token,icon_name,sort_order,is_active,created_at,updated_at').single()
  if (error) throw error
  return (await hydrate([data]))[0]
}

export async function updateLifeArea(id: string, input: LifeAreaInput) {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('life_areas').update(input).eq('id', id).select('id,name,category,description,color_token,icon_name,sort_order,is_active,created_at,updated_at').single()
  if (error) throw error
  return (await hydrate([data]))[0]
}

export async function setLifeAreaActive(id: string, isActive: boolean) {
  await requireUserId()
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('life_areas').update({ is_active: isActive }).eq('id', id).select('id,name,category,description,color_token,icon_name,sort_order,is_active,created_at,updated_at').single()
  if (error) throw error
  return (await hydrate([data]))[0]
}

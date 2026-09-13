export type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'skipped'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus | string
  priority: TaskPriority | string
  due_at: string | null
  start_at: string | null
  estimated_minutes: number | null
  actual_minutes: number | null
  goal_id: string | null
  life_area_id: string | null
  sort_order: number
  completed_at: string | null
  goal_title: string | null
  life_area_name: string | null
}

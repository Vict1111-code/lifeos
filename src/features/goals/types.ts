export const goalStatuses = ['draft','active','paused','completed','cancelled','archived'] as const
export type GoalStatus = typeof goalStatuses[number]
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Goal {
  id: string
  life_area_id: string | null
  parent_goal_id: string | null
  title: string
  description: string | null
  why: string | null
  outcome: string | null
  status: GoalStatus
  priority: GoalPriority
  progress: number
  target_value: number | null
  current_value: number | null
  unit: string | null
  start_date: string | null
  target_date: string | null
  completed_at: string | null
  health_score: number | null
  ai_summary: string | null
  life_area_name: string | null
  task_count: number
  completed_task_count: number
  created_at: string
  updated_at: string
}

export interface GoalInput {
  title: string
  description: string
  why: string
  outcome: string
  status: GoalStatus
  priority: GoalPriority
  life_area_id: string | null
  parent_goal_id: string | null
  progress: number
  target_value: number | null
  current_value: number | null
  unit: string
  start_date: string | null
  target_date: string | null
}

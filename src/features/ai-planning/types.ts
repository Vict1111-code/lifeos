export type AutonomousPlanHorizon = 'today' | 'week'
export type AutonomousPlanStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'expired'
export type AutonomousPlanItemType = 'task' | 'focus' | 'reflection' | 'review'

export interface AutonomousPlanItem {
  id: string
  plan_id: string
  user_id: string
  task_id: string | null
  item_type: AutonomousPlanItemType
  title: string
  description: string | null
  scheduled_date: string | null
  start_at: string | null
  duration_minutes: number | null
  priority: string
  sort_order: number
  status: string
  source_signals: string[]
  created_at: string
  updated_at: string
}

export interface AutonomousPlan {
  id: string
  user_id: string
  horizon: AutonomousPlanHorizon
  status: AutonomousPlanStatus
  title: string
  focus: string | null
  rationale: string | null
  confidence: number
  generated_at: string
  activated_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  items: AutonomousPlanItem[]
}

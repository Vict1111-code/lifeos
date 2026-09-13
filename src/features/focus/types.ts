export type FocusStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export interface FocusSession {
  id: string
  user_id: string
  task_id: string | null
  goal_id: string | null
  life_area_id: string | null
  started_at: string
  ended_at: string | null
  planned_minutes: number
  actual_minutes: number | null
  status: FocusStatus | string
  notes: string | null
  task_title: string | null
  goal_title: string | null
  life_area_name: string | null
}

export interface FocusStartInput {
  task_id?: string | null
  goal_id?: string | null
  life_area_id?: string | null
  planned_minutes: number
}

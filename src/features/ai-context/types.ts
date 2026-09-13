export interface AIContextProfile {
  timezone: string
  display_name: string | null
}

export interface AIContextLifeArea {
  id: string
  name: string
  category: string
  color_token: string | null
  icon_name: string | null
  sort_order: number
}

export interface AIContextGoal {
  id: string
  life_area_id: string | null
  title: string
  status: string
  priority: string
  progress: number
  health_score: number | null
  start_date: string | null
  target_date: string | null
  outcome: string | null
}

export interface AIContextTask {
  id: string
  goal_id: string | null
  life_area_id: string | null
  title: string
  status: string
  priority: string
  due_at: string | null
  start_at: string | null
  estimated_minutes: number | null
  energy_level: string | null
}

export interface AIContextFocus {
  last_7_days_minutes: number
  last_7_days_sessions: number
  recent_sessions: Array<Record<string, unknown>>
}

export interface AIContext {
  context_version: number
  generated_at: string
  planning_horizon: 'today' | 'week'
  horizon_days: number
  profile: AIContextProfile
  life_areas: AIContextLifeArea[]
  goals: AIContextGoal[]
  tasks: AIContextTask[]
  focus: AIContextFocus
  progress: Record<string, unknown>
  reflection: Record<string, unknown>
  evidence: Array<Record<string, unknown>>
  adaptive_plan: Record<string, unknown>
}

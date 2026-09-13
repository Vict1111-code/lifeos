export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | string

export interface DashboardProfile {
  id: string
  display_name: string | null
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  timezone: string
}

export interface DashboardTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: TaskPriority
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

export interface DashboardGoal {
  id: string
  title: string
  description: string | null
  status: string
  priority: TaskPriority
  progress: number
  health_score: number | null
  target_date: string | null
  life_area_id: string | null
  life_area_name: string | null
}

export interface LifePulseItem {
  id: string
  name: string
  category: string | null
  score: number
  active_goals: number
}

export interface HomeDashboard {
  date: string
  timezone: string
  profile: DashboardProfile
  tasks: {
    today: DashboardTask[]
    completed_today: number
    total_today: number
    completion_rate: number
  }
  goals: {
    active: DashboardGoal[]
    count: number
    average_progress: number
  }
  focus: {
    today_minutes: number
    week_minutes: number
  }
  habits: {
    total: number
    completed: number
    completion_rate: number
  }
  life_pulse: LifePulseItem[]
  next_best_action: DashboardTask | null
}

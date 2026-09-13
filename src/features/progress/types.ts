export interface ProgressSummary {
  tasks_completed: number
  tasks_total: number
  focus_minutes: number
  active_goals: number
  avg_goal_progress: number
  journal_entries: number
  evidence_count: number
}

export interface ProgressSnapshot {
  date: string
  tasks_completed: number
  focus_minutes: number
  goal_progress: number
}

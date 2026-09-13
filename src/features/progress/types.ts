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

export interface ProgressIntelligenceData {
  window_days: number
  tasks: { completed_7d: number; completed_30d: number }
  focus: { minutes_7d: number; minutes_30d: number; sessions_7d: number }
  goals: { active: number; at_risk: number; healthy: number; average_progress: number }
  reflection: { journal_7d: number; journal_30d: number }
  evidence: { captured_7d: number; captured_30d: number }
  active_days_7d: number
  consistency_score: number
}

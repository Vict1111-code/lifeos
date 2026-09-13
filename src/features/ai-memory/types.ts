export type AIMemoryType = 'preference' | 'pattern' | 'goal_context' | 'working_style' | 'constraint' | 'insight' | 'fact'

export interface AIMemoryItem {
  id: string
  user_id: string
  memory_type: AIMemoryType
  content: string
  structured_value: Record<string, unknown>
  source_type: string
  source_id: string | null
  confidence: number
  importance: number
  status: 'active' | 'superseded' | 'archived' | 'rejected' | string
  last_confirmed_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface AIMemorySummary {
  active_count: number
  preferences: number
  patterns: number
  working_style: number
  constraints: number
  insights: number
}

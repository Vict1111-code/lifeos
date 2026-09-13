export type AIActionType =
  | 'create_task'
  | 'update_task'
  | 'complete_task'
  | 'start_focus'
  | 'create_goal'
  | 'update_goal'
  | 'create_journal'

export type AIActionStatus =
  | 'proposed'
  | 'approved'
  | 'executing'
  | 'executed'
  | 'rejected'
  | 'expired'
  | 'failed'

export interface AIActionProposal {
  id: string
  user_id: string
  action_type: AIActionType
  title: string
  description: string | null
  payload: Record<string, unknown>
  source_signals: string[]
  confidence: number
  status: AIActionStatus
  expires_at: string | null
  executed_at: string | null
  execution_result: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface CreateAIActionInput {
  action_type: AIActionType
  title: string
  description?: string | null
  payload: Record<string, unknown>
  source_signals?: string[]
  confidence?: number
  expires_at?: string | null
}

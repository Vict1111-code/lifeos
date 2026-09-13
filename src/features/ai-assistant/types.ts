export type AssistantRole = 'user' | 'assistant' | 'system'

export interface AIConversation {
  id: string
  user_id: string
  title: string | null
  context_horizon: 'today' | 'week' | string
  created_at: string
  updated_at: string
  last_message_at: string | null
}

export interface AIMessage {
  id: string
  conversation_id: string
  role: AssistantRole
  content: string
  provider: string | null
  model: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface SendAssistantMessageInput {
  conversationId: string
  content: string
  horizon?: 'today' | 'week'
}

export interface AgentToolCall {
  name: string
  arguments: Record<string, unknown>
}

export interface ProposedAgentAction {
  proposal_id?: string
  action_type: string
  title: string
  description: string
  payload: Record<string, unknown>
  source_signals: string[]
  confidence: number
  validation?: Record<string, unknown>
}

export interface MemoryRetrievalMeta {
  mode: 'semantic_ranked' | 'ranked_fallback' | string
  query_embedded: boolean
  count: number
}

export interface RetrievedMemory {
  id: string
  memory_type: string
  retrieval_score: number
  semantic_similarity: number
}

export interface AssistantChatResult {
  provider: 'openai' | 'anthropic'
  model: string
  generated_at: string
  message: string
  tool_calls?: AgentToolCall[]
  proposed_actions?: ProposedAgentAction[]
  memory_retrieval?: MemoryRetrievalMeta
  memories_used?: RetrievedMemory[]
}

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

export interface AssistantChatResult {
  provider: 'openai' | 'anthropic'
  model: string
  generated_at: string
  message: string
}

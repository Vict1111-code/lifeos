export type AssistantRole = 'user' | 'assistant'

export interface AssistantMessage {
  id: string
  role: AssistantRole
  content: string
  created_at: string
}

export interface AssistantChatInput {
  message: string
  history?: Array<Pick<AssistantMessage, 'role' | 'content'>>
  horizon?: 'today' | 'week'
}

export interface AssistantChatResult {
  provider: 'openai' | 'anthropic'
  model: string
  generated_at: string
  message: string
}

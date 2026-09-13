import { supabase } from '../../lib/supabase/client'
import { createAIActionProposal } from '../ai-actions/aiActionsApi'
import type { AIActionType } from '../ai-actions/types'
import type { AIConversation, AIMessage, AssistantChatResult, ProposedAgentAction } from './types'

export async function listConversations(limit = 30): Promise<AIConversation[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.from('ai_conversations').select('*').order('updated_at', { ascending: false }).limit(limit)
  if (error) throw error
  return (data ?? []) as AIConversation[]
}

export async function createConversation(horizon: 'today' | 'week' = 'today'): Promise<AIConversation> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw userError ?? new Error('Not authenticated.')
  const { data, error } = await supabase.from('ai_conversations').insert({ user_id: userData.user.id, context_horizon: horizon, title: 'New conversation' }).select('*').single()
  if (error) throw error
  return data as AIConversation
}

export async function listMessages(conversationId: string, limit = 50): Promise<AIMessage[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('get_ai_conversation_messages', { p_conversation_id: conversationId, p_limit: limit })
  if (error) throw error
  return (data ?? []) as AIMessage[]
}

function isProposedAction(value: ProposedAgentAction): boolean {
  return typeof value.action_type === 'string' && typeof value.title === 'string' && typeof value.payload === 'object' && value.payload !== null
}

async function persistProposedActions(actions: ProposedAgentAction[]): Promise<ProposedAgentAction[]> {
  const persisted: ProposedAgentAction[] = []
  for (const action of actions) {
    if (!isProposedAction(action)) continue
    const proposal = await createAIActionProposal({
      action_type: action.action_type as AIActionType,
      title: action.title,
      description: action.description,
      payload: action.payload,
      source_signals: action.source_signals,
      confidence: action.confidence,
    })
    persisted.push({ ...action, proposal_id: proposal.id })
  }
  return persisted
}

export async function sendPersistentMessage(conversationId: string, content: string, horizon: 'today' | 'week' = 'today'): Promise<{ userMessage: AIMessage; assistantMessage: AIMessage; result: AssistantChatResult }> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw userError ?? new Error('Not authenticated.')
  const { data: userMessage, error: insertError } = await supabase.from('ai_messages').insert({ conversation_id: conversationId, user_id: userData.user.id, role: 'user', content }).select('*').single()
  if (insertError) throw insertError
  const { data: historyData, error: historyError } = await supabase.rpc('get_ai_conversation_messages', { p_conversation_id: conversationId, p_limit: 20 })
  if (historyError) throw historyError
  const history = ((historyData ?? []) as AIMessage[]).filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role, content: m.content }))
  const { data, error } = await supabase.functions.invoke('ai-gateway', { body: { mode: 'agent', message: content, history, horizon, conversation_id: conversationId } })
  if (error) throw error
  if (!data || typeof data !== 'object' || !('message' in data) || typeof data.message !== 'string') throw new Error('The AI agent returned an invalid response.')
  const result = data as AssistantChatResult
  const proposedActions = await persistProposedActions(result.proposed_actions ?? [])
  const persistedResult: AssistantChatResult = { ...result, proposed_actions: proposedActions }
  const { data: assistantMessage, error: assistantError } = await supabase.from('ai_messages').insert({
    conversation_id: conversationId,
    user_id: userData.user.id,
    role: 'assistant',
    content: result.message,
    provider: result.provider,
    model: result.model,
    metadata: { generated_at: result.generated_at, tool_calls: result.tool_calls ?? [], proposed_actions: proposedActions },
  }).select('*').single()
  if (assistantError) throw assistantError
  await supabase.rpc('touch_ai_conversation', { p_conversation_id: conversationId, p_title: content.slice(0, 80) })
  return { userMessage: userMessage as AIMessage, assistantMessage: assistantMessage as AIMessage, result: persistedResult }
}

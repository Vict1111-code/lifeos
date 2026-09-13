import { supabase } from '../../lib/supabase/client'
import type { AIConversation, AIMessage, AssistantChatResult } from './types'

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

export async function sendPersistentMessage(conversationId: string, content: string, horizon: 'today' | 'week' = 'today'): Promise<{ userMessage: AIMessage; assistantMessage: AIMessage; result: AssistantChatResult }> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) throw userError ?? new Error('Not authenticated.')
  const { data: userMessage, error: insertError } = await supabase.from('ai_messages').insert({ conversation_id: conversationId, user_id: userData.user.id, role: 'user', content }).select('*').single()
  if (insertError) throw insertError
  const { data: historyData, error: historyError } = await supabase.rpc('get_ai_conversation_messages', { p_conversation_id: conversationId, p_limit: 20 })
  if (historyError) throw historyError
  const history = ((historyData ?? []) as AIMessage[]).filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({ role: m.role, content: m.content }))
  const { data, error } = await supabase.functions.invoke('ai-gateway', { body: { mode: 'chat', message: content, history, horizon } })
  if (error) throw error
  if (!data || typeof data !== 'object' || !('message' in data) || typeof data.message !== 'string') throw new Error('The AI assistant returned an invalid response.')
  const result = data as AssistantChatResult
  const { data: assistantMessage, error: assistantError } = await supabase.from('ai_messages').insert({ conversation_id: conversationId, user_id: userData.user.id, role: 'assistant', content: result.message, provider: result.provider, model: result.model, metadata: { generated_at: result.generated_at } }).select('*').single()
  if (assistantError) throw assistantError
  await supabase.rpc('touch_ai_conversation', { p_conversation_id: conversationId, p_title: content.slice(0, 80) })
  return { userMessage: userMessage as AIMessage, assistantMessage: assistantMessage as AIMessage, result }
}

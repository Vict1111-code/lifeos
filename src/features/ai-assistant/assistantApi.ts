import { supabase } from '../../lib/supabase/client'
import type { AssistantChatInput, AssistantChatResult } from './types'

export async function chatWithAssistant(input: AssistantChatInput): Promise<AssistantChatResult> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: {
      mode: 'chat',
      message: input.message,
      history: input.history ?? [],
      horizon: input.horizon ?? 'today',
    },
  })

  if (error) throw error
  if (!data || typeof data !== 'object') throw new Error('The AI assistant returned no result.')
  if ('error' in data && typeof data.error === 'string') throw new Error(data.error)
  if (!('message' in data) || typeof data.message !== 'string') throw new Error('The AI assistant returned an invalid response.')

  return data as AssistantChatResult
}

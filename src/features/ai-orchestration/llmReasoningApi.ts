import { supabase } from '../../lib/supabase/client'
import type { LLMReasoningInput, LLMReasoningResult } from './llmTypes'

export async function runLLMReasoning(input: LLMReasoningInput = {}): Promise<LLMReasoningResult> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.functions.invoke('ai-gateway', {
    body: input,
  })

  if (error) throw error
  if (!data || typeof data !== 'object') throw new Error('The AI gateway returned no result.')
  if ('error' in data && typeof data.error === 'string') throw new Error(data.error)

  return data as LLMReasoningResult
}

import { supabase } from '../../lib/supabase/client'
import type { AIContext } from './types'

export async function getAIContext(horizon: 'today' | 'week' = 'today'): Promise<AIContext> {
  if (!supabase) throw new Error('Supabase is not configured.')

  const { data, error } = await supabase.rpc('get_ai_context', { p_horizon: horizon })
  if (error) throw error
  if (!data) throw new Error('The AI context engine returned no context.')

  return data as AIContext
}

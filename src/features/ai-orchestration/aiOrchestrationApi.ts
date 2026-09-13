import { supabase } from '../../lib/supabase/client'
import type { AdaptivePlan } from './types'

export async function getAdaptivePlan(horizon: 'today' | 'week' = 'today'): Promise<AdaptivePlan> {
  const { data, error } = await supabase.rpc('get_adaptive_plan', { p_horizon: horizon })
  if (error) throw error
  return data as AdaptivePlan
}

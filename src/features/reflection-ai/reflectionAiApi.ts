import { supabase } from '../../lib/supabase/client'
import type { ReflectionIntelligence } from './types'

export async function getReflectionIntelligence(days = 30): Promise<ReflectionIntelligence> {
  const safeDays = Math.max(7, Math.min(days, 90))
  const { data, error } = await supabase.rpc('get_reflection_intelligence', { p_days: safeDays })
  if (error) throw error
  return data as ReflectionIntelligence
}

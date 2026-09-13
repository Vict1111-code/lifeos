import { supabase } from '../../lib/supabase/client'
import type { AIAdaptationProfile } from './types'

export async function getAIAdaptationProfile(days = 90): Promise<AIAdaptationProfile> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const safeDays = Math.max(30, Math.min(days, 180))
  const { data, error } = await supabase.rpc('get_ai_adaptation_profile', { p_days: safeDays })
  if (error) throw error
  return data as AIAdaptationProfile
}

export async function refreshAIAdaptationRules(): Promise<number> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('refresh_ai_adaptation_rules')
  if (error) throw error
  return Number(data ?? 0)
}

export async function setAIAdaptationStatus(id: string, status: 'active' | 'ignored'): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase
    .from('ai_adaptation_rules')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

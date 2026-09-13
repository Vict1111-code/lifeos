import { supabase } from '../../lib/supabase/client'
import type { HomeDashboard } from './types'

export async function getHomeDashboard(): Promise<HomeDashboard> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  const { data, error } = await supabase.rpc('get_home_dashboard')
  if (error) throw error
  if (!data) throw new Error('The home dashboard returned no data.')

  return data as HomeDashboard
}

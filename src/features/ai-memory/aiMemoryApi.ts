import { supabase } from '../../lib/supabase/client'
import type { AIMemoryItem, AIMemorySummary, AIMemoryType } from './types'

export async function listAIMemories(limit = 50): Promise<AIMemoryItem[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('ai_memory_items')
    .select('*')
    .eq('status', 'active')
    .order('importance', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)))
  if (error) throw error
  return (data ?? []) as AIMemoryItem[]
}

export async function getAIMemorySummary(): Promise<AIMemorySummary> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('get_ai_memory_summary')
  if (error) throw error
  return data as AIMemorySummary
}

export async function createAIMemory(input: {
  memory_type: AIMemoryType
  content: string
  confidence?: number
  importance?: number
}): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.rpc('create_ai_memory', {
    p_memory_type: input.memory_type,
    p_content: input.content,
    p_confidence: input.confidence ?? 0.8,
    p_importance: input.importance ?? 0.7,
    p_source_type: 'conversation',
  })
  if (error) throw error
}

export async function confirmAIMemory(id: string, confidence?: number): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.rpc('confirm_ai_memory', { p_memory_id: id, p_confidence: confidence ?? null })
  if (error) throw error
}

export async function archiveAIMemory(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { error } = await supabase.rpc('archive_ai_memory', { p_memory_id: id })
  if (error) throw error
}

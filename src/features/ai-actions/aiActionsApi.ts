import { supabase } from '../../lib/supabase/client'
import type { AIActionProposal, CreateAIActionInput } from './types'

function mapProposal(row: Record<string, unknown>): AIActionProposal {
  return {
    ...(row as AIActionProposal),
    source_signals: Array.isArray(row.source_signals) ? row.source_signals as string[] : [],
    payload: (row.payload ?? {}) as Record<string, unknown>,
    execution_result: row.execution_result as Record<string, unknown> | null,
  }
}

export async function listAIActionProposals(limit = 20): Promise<AIActionProposal[]> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('ai_action_proposals')
    .select('id,user_id,action_type,title,description,payload,source_signals,confidence,status,expires_at,executed_at,execution_result,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(limit, 100)))
  if (error) throw error
  return (data ?? []).map(mapProposal)
}

export async function createAIActionProposal(input: CreateAIActionInput): Promise<AIActionProposal> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('ai_action_proposals')
    .insert({
      action_type: input.action_type,
      title: input.title,
      description: input.description ?? null,
      payload: input.payload,
      source_signals: input.source_signals ?? [],
      confidence: input.confidence ?? 0,
      expires_at: input.expires_at ?? null,
    })
    .select('id,user_id,action_type,title,description,payload,source_signals,confidence,status,expires_at,executed_at,execution_result,created_at,updated_at')
    .single()
  if (error) throw error
  return mapProposal(data)
}

export async function validateAIAction(actionType: string, payload: Record<string, unknown>) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('validate_ai_action', {
    p_action_type: actionType,
    p_payload: payload,
  })
  if (error) throw error
  return data as { valid: boolean; action_type: string; payload: Record<string, unknown> }
}

export async function approveAIAction(id: string): Promise<AIActionProposal> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('ai_action_proposals')
    .update({ status: 'approved', updated_at: new Date().toISOString() })
    .eq('id', id)
    .in('status', ['proposed'])
    .select('id,user_id,action_type,title,description,payload,source_signals,confidence,status,expires_at,executed_at,execution_result,created_at,updated_at')
    .single()
  if (error) throw error
  return mapProposal(data)
}

export async function rejectAIAction(id: string): Promise<AIActionProposal> {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase
    .from('ai_action_proposals')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', id)
    .in('status', ['proposed', 'approved'])
    .select('id,user_id,action_type,title,description,payload,source_signals,confidence,status,expires_at,executed_at,execution_result,created_at,updated_at')
    .single()
  if (error) throw error
  return mapProposal(data)
}

export async function executeAIAction(id: string) {
  if (!supabase) throw new Error('Supabase is not configured.')
  const { data, error } = await supabase.rpc('execute_ai_action', { p_action_id: id })
  if (error) throw error
  return data as { success: boolean; action_id: string; result: Record<string, unknown> }
}

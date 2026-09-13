import { supabase } from '../../lib/supabase/client'
import type { JournalEntry, JournalInput } from './types'

export async function listJournalEntries(limit = 30): Promise<JournalEntry[]> {
  const { data, error } = await supabase.from('journal_entries').select('*').order('entry_date', { ascending: false }).order('created_at', { ascending: false }).limit(limit)
  if (error) throw error
  return (data ?? []) as JournalEntry[]
}

export async function createJournalEntry(input: JournalInput): Promise<JournalEntry> {
  const { data, error } = await supabase.from('journal_entries').insert(input).select('*').single()
  if (error) throw error
  return data as JournalEntry
}

export async function updateJournalEntry(id: string, input: JournalInput): Promise<JournalEntry> {
  const { data, error } = await supabase.from('journal_entries').update(input).eq('id', id).select('*').single()
  if (error) throw error
  return data as JournalEntry
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id)
  if (error) throw error
}

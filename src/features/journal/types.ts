export type JournalEntryType = 'journal' | 'reflection' | 'gratitude' | 'review' | string

export interface JournalEntry {
  id: string
  user_id: string
  entry_date: string
  title: string | null
  content: string
  entry_type: JournalEntryType
  mood: number | null
  ai_summary: string | null
  created_at: string
  updated_at: string
}

export interface JournalInput {
  entry_date: string
  title: string
  content: string
  entry_type: JournalEntryType
  mood: number | null
}

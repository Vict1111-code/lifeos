import { useCallback, useEffect, useState } from 'react'
import { Brain, Check, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { archiveAIMemory, confirmAIMemory, getAIMemorySummary, listAIMemories } from './aiMemoryApi'
import type { AIMemoryItem, AIMemorySummary } from './types'

const labels: Record<string, string> = {
  preference: 'Preference', pattern: 'Pattern', goal_context: 'Goal context', working_style: 'Working style', constraint: 'Constraint', insight: 'Insight', fact: 'Fact',
}

export function AIMemoryPanel() {
  const [memories, setMemories] = useState<AIMemoryItem[]>([])
  const [summary, setSummary] = useState<AIMemorySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true); setError(null)
    try { const [items, stats] = await Promise.all([listAIMemories(), getAIMemorySummary()]); setMemories(items); setSummary(stats) }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load agent memory.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  async function confirm(id: string) {
    setBusy(id); setError(null)
    try { await confirmAIMemory(id); await refresh() } catch (e) { setError(e instanceof Error ? e.message : 'Unable to confirm memory.') } finally { setBusy(null) }
  }

  async function archive(id: string) {
    setBusy(id); setError(null)
    try { await archiveAIMemory(id); await refresh() } catch (e) { setError(e instanceof Error ? e.message : 'Unable to archive memory.') } finally { setBusy(null) }
  }

  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Brain size={19}/></div><div><h2 className="text-sm font-semibold">Agent memory</h2><p className="mt-1 text-xs text-[var(--muted)]">Long-term preferences and patterns the assistant can use to personalize future guidance.</p></div></div><button onClick={() => void refresh()} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]" aria-label="Refresh memory"><RefreshCw size={15}/></button></div>
    {summary && <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">{[['Active',summary.active_count],['Preferences',summary.preferences],['Patterns',summary.patterns],['Style',summary.working_style],['Constraints',summary.constraints]].map(([label,value]) => <div key={String(label)} className="rounded-xl bg-[var(--surface-2)] px-3 py-2"><p className="text-[10px] text-[var(--muted)]">{label}</p><p className="mt-0.5 text-sm font-semibold">{value}</p></div>)}</div>}
    {loading ? <div className="flex items-center justify-center py-8 text-xs text-[var(--muted)]"><Loader2 size={15} className="mr-2 animate-spin"/>Loading memory…</div> : memories.length === 0 ? <div className="py-8 text-center text-xs text-[var(--muted)]">No long-term memories yet. The agent will learn only from durable, explicit signals.</div> : <div className="mt-4 space-y-2">{memories.map(memory => <div key={memory.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[9px] font-semibold text-[var(--accent)]">{labels[memory.memory_type] ?? memory.memory_type}</span><p className="mt-2 text-xs leading-5">{memory.content}</p><p className="mt-1 text-[10px] text-[var(--muted)]">{Math.round(memory.confidence * 100)}% confidence · {Math.round(memory.importance * 100)}% importance</p></div><div className="flex shrink-0 gap-1"><button disabled={busy === memory.id} onClick={() => void confirm(memory.id)} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--accent)]" title="Confirm memory"><Check size={14}/></button><button disabled={busy === memory.id} onClick={() => void archive(memory.id)} className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-red-500/10 hover:text-red-300" title="Forget memory"><Trash2 size={14}/></button></div></div></div>)}</div>}
    {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
  </section>
}

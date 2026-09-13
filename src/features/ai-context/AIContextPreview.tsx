import { useCallback, useEffect, useState } from 'react'
import { BrainCircuit, RefreshCw } from 'lucide-react'
import { getAIContext } from './aiContextApi'
import type { AIContext } from './types'

export function AIContextPreview() {
  const [context, setContext] = useState<AIContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setContext(await getAIContext('today'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to build AI context.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  return (
    <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><BrainCircuit size={18} /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">AI context engine</p>
            <h2 className="mt-1 font-semibold">Context readiness</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">A safe, unified snapshot prepared for future AI reasoning.</p>
          </div>
        </div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-medium hover:bg-[var(--surface-2)] disabled:opacity-50"><RefreshCw size={13} className={loading ? 'animate-spin' : ''} />Refresh</button>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-200">{error}</p>}
      {context && <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Life areas" value={context.life_areas.length} />
        <Metric label="Active goals" value={context.goals.length} />
        <Metric label="Relevant tasks" value={context.tasks.length} />
        <Metric label="Evidence · 30d" value={context.evidence.length} />
      </div>}
      {context && <p className="mt-4 text-xs text-[var(--muted)]">Context v{context.context_version} · {context.planning_horizon} horizon · generated {new Date(context.generated_at).toLocaleString()}</p>}
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{label}</p></div>
}

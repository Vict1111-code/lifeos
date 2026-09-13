import { useCallback, useEffect, useState } from 'react'
import { CalendarRange, Check, RefreshCw, Sparkles } from 'lucide-react'
import { activateAutonomousPlan, generateAutonomousPlan, getLatestAutonomousPlan } from './aiPlanningApi'
import type { AutonomousPlan, AutonomousPlanHorizon } from './types'

function priorityClass(priority: string) {
  if (priority === 'urgent') return 'bg-red-500/10 text-red-300'
  if (priority === 'high') return 'bg-orange-500/10 text-orange-300'
  if (priority === 'medium') return 'bg-yellow-500/10 text-yellow-300'
  return 'bg-surface text-muted'
}

export function AutonomousPlan() {
  const [horizon, setHorizon] = useState<AutonomousPlanHorizon>('today')
  const [plan, setPlan] = useState<AutonomousPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setPlan(await getLatestAutonomousPlan(horizon)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load autonomous plan.') }
    finally { setLoading(false) }
  }, [horizon])

  useEffect(() => { void load() }, [load])

  async function generate() {
    setBusy(true); setError(null)
    try { setPlan(await generateAutonomousPlan(horizon)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to generate autonomous plan.') }
    finally { setBusy(false) }
  }

  async function activate() {
    if (!plan) return
    setBusy(true); setError(null)
    try { setPlan(await activateAutonomousPlan(plan.id)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to activate plan.') }
    finally { setBusy(false) }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">AI planning</p>
          <h2 className="mt-1 text-lg font-semibold text-text">Autonomous execution plan</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">LifeOS can assemble a coherent plan from your current work, but activation remains explicit. The planner never executes tasks by itself.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={horizon} onChange={(event) => setHorizon(event.target.value as AutonomousPlanHorizon)} className="rounded-lg border border-border bg-surface2 px-3 py-2 text-xs text-text">
            <option value="today">Today</option>
            <option value="week">This week</option>
          </select>
          <button onClick={() => void load()} disabled={loading} className="rounded-lg border border-border p-2 text-muted hover:text-text disabled:opacity-50" aria-label="Refresh plan"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /></button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      {loading ? <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Loading planning state…</div> : !plan ? <div className="rounded-xl border border-dashed border-border p-6 text-center"><Sparkles className="mx-auto text-accent" size={24} /><p className="mt-3 text-sm font-medium text-text">No plan generated yet.</p><p className="mt-1 text-xs text-muted">Generate a plan from your live LifeOS context.</p><button onClick={() => void generate()} disabled={busy} className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white disabled:opacity-50">Generate plan</button></div> : <div className="space-y-4">
        <div className="rounded-xl border border-border bg-surface2 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><CalendarRange size={16} className="text-accent" /><h3 className="font-medium text-text">{plan.title}</h3><span className="rounded-full border border-border px-2 py-1 text-[10px] capitalize text-muted">{plan.status}</span></div>{plan.focus && <p className="mt-2 text-sm font-medium text-text">Focus: {plan.focus}</p>}{plan.rationale && <p className="mt-1 text-xs text-muted">{plan.rationale}</p>}</div><span className="text-xs text-muted">{Math.round(plan.confidence * 100)}% confidence</span></div>
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void generate()} disabled={busy} className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-text disabled:opacity-50">Regenerate</button>{plan.status === 'draft' && <button onClick={() => void activate()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-50"><Check size={14} />Activate plan</button>}</div>
        </div>
        <div className="space-y-2">{plan.items.map((item, index) => <article key={item.id} className="flex gap-3 rounded-xl border border-border bg-surface2 p-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/10 text-xs font-semibold text-accent">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-text">{item.title}</p><span className={`rounded-full px-2 py-1 text-[10px] capitalize ${priorityClass(item.priority)}`}>{item.priority}</span><span className="rounded-full border border-border px-2 py-1 text-[10px] capitalize text-muted">{item.item_type}</span></div>{item.description && <p className="mt-1 text-xs text-muted">{item.description}</p>}<div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">{item.scheduled_date && <span>{item.scheduled_date}</span>}{item.duration_minutes && <span>{item.duration_minutes} min</span>}</div></div></article>)}</div>
      </div>}
    </section>
  )
}

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Circle, Clock3, RefreshCw, Target } from 'lucide-react'
import { listTasks, updateTaskStatus } from './tasksApi'
import type { Task } from './types'

const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

function priorityClass(priority: string) {
  if (priority === 'urgent') return 'bg-red-500/10 text-red-300'
  if (priority === 'high') return 'bg-orange-500/10 text-orange-300'
  if (priority === 'medium') return 'bg-yellow-500/10 text-yellow-300'
  return 'bg-[var(--surface-2)] text-[var(--muted)]'
}

function formatDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'open' | 'completed' | 'all'>('open')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setTasks(await listTasks()) }
    catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load tasks.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const visibleTasks = useMemo(() => tasks
    .filter((task) => filter === 'all' || (filter === 'completed' ? task.status === 'completed' : !['completed', 'cancelled', 'skipped'].includes(task.status)))
    .sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9)), [filter, tasks])

  async function toggle(task: Task) {
    setBusyId(task.id)
    setError(null)
    const nextStatus = task.status === 'completed' ? 'planned' : 'completed'
    try {
      const updated = await updateTaskStatus(task.id, nextStatus)
      setTasks((current) => current.map((item) => item.id === task.id ? updated : item))
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update the task.')
    } finally { setBusyId(null) }
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Execution</p><h1 className="text-3xl font-semibold tracking-tight">Tasks</h1><p className="mt-2 text-sm text-[var(--muted)]">Turn your goals into concrete actions and close the loop.</p></div>
        <button onClick={() => void load()} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)] disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Refresh</button>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {(['open', 'completed', 'all'] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-sm font-medium capitalize ${filter === value ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}>{value}</button>)}
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">{error}</div>}
      {loading && !tasks.length ? <div className="space-y-3">{[1,2,3,4].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-[var(--surface)]" />)}</div> : visibleTasks.length ? <div className="space-y-3">{visibleTasks.map((task) => { const completed = task.status === 'completed'; const due = formatDate(task.due_at); return <article key={task.id} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm"><button onClick={() => void toggle(task)} disabled={busyId === task.id} aria-label={completed ? `Reopen ${task.title}` : `Complete ${task.title}`} className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${completed ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300' : 'border-[var(--border)] text-transparent hover:border-[var(--accent)]'} disabled:opacity-50`}>{completed ? <Check size={16} /> : <Circle size={16} />}</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className={`font-medium ${completed ? 'text-[var(--muted)] line-through' : ''}`}>{task.title}</h2>{task.description && <p className="mt-1 text-sm text-[var(--muted)]">{task.description}</p>}</div><span className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${priorityClass(task.priority)}`}>{task.priority}</span></div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">{due && <span className="inline-flex items-center gap-1"><Clock3 size={12} />{due}</span>}{task.life_area_name && <span>{task.life_area_name}</span>}{task.goal_title && <span className="inline-flex items-center gap-1"><Target size={12} />{task.goal_title}</span>}{task.estimated_minutes && <span>{task.estimated_minutes} min</span>}</div></div></article> })}</div> : <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center"><Check className="mx-auto text-emerald-300" size={28} /><h2 className="mt-3 font-semibold">No tasks here</h2><p className="mt-1 text-sm text-[var(--muted)]">Create actions from your goals to start executing.</p></div>}
    </section>
  )
}

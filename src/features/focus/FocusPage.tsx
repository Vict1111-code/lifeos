import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, Clock3, Play, RefreshCw, Target, XCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { cancelFocusSession, completeFocusSession, getActiveFocusSession, listFocusSessions, listFocusTargets, startFocusSession } from './focusApi'
import type { FocusSession } from './types'

const presets = [25, 45, 60, 90]
const formatDuration = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))

export function FocusPage() {
  const [searchParams] = useSearchParams()
  const [active, setActive] = useState<FocusSession | null>(null)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [targets, setTargets] = useState<{ tasks: { id: string; title: string; goal_id: string | null; estimated_minutes: number | null }[]; goals: { id: string; title: string }[] }>({ tasks: [], goals: [] })
  const [minutes, setMinutes] = useState(45)
  const [selectedTask, setSelectedTask] = useState('')
  const [selectedGoal, setSelectedGoal] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [current, history, options] = await Promise.all([getActiveFocusSession(), listFocusSessions(), listFocusTargets()])
      setActive(current); setSessions(history); setTargets(options)
      if (current) {
        setMinutes(current.planned_minutes)
        setSelectedTask(current.task_id ?? '')
        setSelectedGoal(current.goal_id ?? '')
        setElapsed(Math.max(0, Math.floor((Date.now() - new Date(current.started_at).getTime()) / 1000)))
      } else {
        const linkedTask = searchParams.get('task')
        const requestedMinutes = Number(searchParams.get('minutes'))
        if (linkedTask && options.tasks.some(task => task.id === linkedTask)) {
          setSelectedTask(linkedTask)
          const task = options.tasks.find(item => item.id === linkedTask)
          if (task?.goal_id) setSelectedGoal(task.goal_id)
          if (Number.isInteger(requestedMinutes) && requestedMinutes > 0) setMinutes(requestedMinutes)
          else if (task?.estimated_minutes && task.estimated_minutes > 0) setMinutes(task.estimated_minutes)
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load focus sessions.') }
    finally { setLoading(false) }
  }, [searchParams])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => {
      const nextElapsed = Math.max(0, Math.floor((Date.now() - new Date(active.started_at).getTime()) / 1000))
      setElapsed(nextElapsed)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [active])

  const remaining = useMemo(() => Math.max(0, minutes * 60 - elapsed), [minutes, elapsed])
  const selectedTaskData = targets.tasks.find(t => t.id === selectedTask)

  async function start() {
    setBusy(true); setError(null)
    try {
      const session = await startFocusSession({ planned_minutes: minutes, task_id: selectedTask || null, goal_id: selectedGoal || selectedTaskData?.goal_id || null })
      setActive(session); setElapsed(0); setSessions(current => [session, ...current])
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to start focus.') }
    finally { setBusy(false) }
  }

  async function finish(cancelled = false) {
    if (!active) return
    setBusy(true); setError(null)
    try {
      const updated = cancelled ? await cancelFocusSession(active.id, elapsed / 60) : await completeFocusSession(active.id, elapsed / 60)
      setSessions(current => current.map(item => item.id === updated.id ? updated : item))
      setActive(null); setElapsed(0)
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to finish focus session.') }
    finally { setBusy(false) }
  }

  useEffect(() => {
    if (!active || busy || elapsed < active.planned_minutes * 60) return
    void finish(false)
  }, [active, busy, elapsed])

  return <section className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Execution</p><h1 className="text-3xl font-semibold tracking-tight">Focus</h1><p className="mt-2 text-sm text-[var(--muted)]">Turn an intentional block of time into measurable execution.</p></div><button onClick={() => void load()} disabled={loading} className="inline-flex w-fit items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface-2)] disabled:opacity-50"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>Refresh</button></header>
    {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">{error}</div>}
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Current session</p><h2 className="mt-1 text-xl font-semibold">{active ? active.task_title ?? active.goal_title ?? 'Focused work' : selectedTaskData?.title ?? 'Ready when you are'}</h2></div>{active && <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Active</span>}</div>
        <div className="my-10 text-center"><div className="text-7xl font-semibold tracking-tight tabular-nums sm:text-8xl">{formatDuration(remaining)}</div><p className="mt-3 text-sm text-[var(--muted)]">{active ? `${active.planned_minutes} minute session` : 'Choose a duration and target'}</p></div>
        {!active ? <div className="space-y-4"><div className="flex flex-wrap justify-center gap-2">{presets.map(value => <button key={value} onClick={() => setMinutes(value)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${minutes === value ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}>{value}m</button>)}</div><div className="grid gap-3 sm:grid-cols-2"><select value={selectedTask} onChange={e => { setSelectedTask(e.target.value); const task = targets.tasks.find(t => t.id === e.target.value); if (task?.goal_id) setSelectedGoal(task.goal_id) }} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-sm outline-none focus:border-[var(--accent)]"><option value="">No task — general focus</option>{targets.tasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}</select><select value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-3 text-sm outline-none focus:border-[var(--accent)]"><option value="">No goal</option>{targets.goals.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}</select></div><button onClick={() => void start()} disabled={busy} className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3.5 font-semibold text-white disabled:opacity-50"><Play size={18}/>{busy ? 'Starting…' : 'Start focus'}</button></div> : <div className="flex flex-col gap-3 sm:flex-row sm:justify-center"><button onClick={() => void finish(false)} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 py-3.5 font-semibold text-white disabled:opacity-50"><CheckCircle2 size={18}/>Complete</button><button onClick={() => void finish(true)} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--border)] px-6 py-3.5 font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] disabled:opacity-50"><XCircle size={18}/>Cancel</button></div>}
      </section>
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Recent sessions</p><h2 className="mt-1 text-xl font-semibold">Execution history</h2></div><Clock3 className="text-[var(--muted)]" size={20}/></div><div className="space-y-3">{sessions.slice(0, 8).map(session => <article key={session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{session.task_title ?? session.goal_title ?? 'General focus'}</p><p className="mt-1 text-xs text-[var(--muted)]">{formatDate(session.started_at)}</p></div><span className={`rounded-lg px-2 py-1 text-[10px] font-semibold uppercase ${session.status === 'completed' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-[var(--surface)] text-[var(--muted)]'}`}>{session.status}</span></div><div className="mt-3 flex items-center gap-3 text-xs text-[var(--muted)]"><span>{session.actual_minutes ?? 0} min actual</span><span>•</span><span>{session.planned_minutes} min planned</span></div></article>)}{!sessions.length && <p className="py-8 text-center text-sm text-[var(--muted)]">No focus sessions yet.</p>}</div></section>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat icon={<Clock3 size={18}/>} label="Planned" value={`${sessions.reduce((sum, s) => sum + s.planned_minutes, 0)}m`}/><Stat icon={<CheckCircle2 size={18}/>} label="Completed" value={`${sessions.filter(s => s.status === 'completed').length}`}/><Stat icon={<Target size={18}/>} label="Actual" value={`${sessions.reduce((sum, s) => sum + (s.actual_minutes ?? 0), 0)}m`}/></div>
  </section>
}
function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">{icon}<p className="mt-3 text-xs text-[var(--muted)]">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div> }

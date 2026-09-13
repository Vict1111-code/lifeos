import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BarChart3, RefreshCw, Target, Timer, CheckCircle2, BookOpen, Paperclip } from 'lucide-react'
import { getProgressIntelligence, getProgressSummary, getProgressTrend } from './progressApi'
import { ProgressIntelligence } from './ProgressIntelligence'
import { getReflectionIntelligence } from '../reflection-ai/reflectionAiApi'
import { ReflectionIntelligence } from '../reflection-ai/ReflectionIntelligence'
import type { ProgressIntelligenceData, ProgressSnapshot, ProgressSummary } from './types'
import type { ReflectionIntelligence as ReflectionIntelligenceData } from '../reflection-ai/types'

const empty: ProgressSummary = { tasks_completed: 0, tasks_total: 0, focus_minutes: 0, active_goals: 0, avg_goal_progress: 0, journal_entries: 0, evidence_count: 0 }
const emptyIntelligence: ProgressIntelligenceData = { window_days: 7, tasks: { completed_7d: 0, completed_30d: 0 }, focus: { minutes_7d: 0, minutes_30d: 0, sessions_7d: 0 }, goals: { active: 0, at_risk: 0, healthy: 0, average_progress: 0 }, reflection: { journal_7d: 0, journal_30d: 0 }, evidence: { captured_7d: 0, captured_30d: 0 }, active_days_7d: 0, consistency_score: 0 }
const emptyReflection: ReflectionIntelligenceData = { reflection_count: 0, themes: [], strengths: [], friction_points: [], commitments: [], suggested_focus: null, confidence: 0, generated_at: '' }

export function ProgressPage() {
  const [summary, setSummary] = useState<ProgressSummary>(empty)
  const [trend, setTrend] = useState<ProgressSnapshot[]>([])
  const [intelligence, setIntelligence] = useState<ProgressIntelligenceData>(emptyIntelligence)
  const [reflection, setReflection] = useState<ReflectionIntelligenceData>(emptyReflection)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => { setLoading(true); setError(null); try { const [nextSummary, nextTrend, nextIntelligence, nextReflection] = await Promise.all([getProgressSummary(), getProgressTrend(14), getProgressIntelligence(), getReflectionIntelligence(30)]); setSummary(nextSummary); setTrend(nextTrend); setIntelligence(nextIntelligence); setReflection(nextReflection) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load progress.') } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  const completionRate = summary.tasks_total ? Math.round((summary.tasks_completed / summary.tasks_total) * 100) : 0
  const maxFocus = useMemo(() => Math.max(1, ...trend.map(item => item.focus_minutes)), [trend])
  return <section className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Progress</p><h1 className="text-3xl font-semibold tracking-tight">Progress & evidence</h1><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">See what you actually completed, where your time went, and whether your goals are moving.</p></div><button onClick={() => void load()} className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm hover:bg-[var(--surface-2)] sm:self-auto"><RefreshCw size={15} className={loading ? 'animate-spin' : ''}/>Refresh</button></header>
    {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Metric icon={<CheckCircle2 size={18}/>} label="Tasks completed" value={`${summary.tasks_completed}`} sub={`${completionRate}% of tracked tasks`} /><Metric icon={<Timer size={18}/>} label="Focus time" value={`${summary.focus_minutes}m`} sub="Recorded focused work" /><Metric icon={<Target size={18}/>} label="Goal progress" value={`${Math.round(summary.avg_goal_progress)}%`} sub={`${summary.active_goals} active goals`} /><Metric icon={<BookOpen size={18}/>} label="Reflections" value={`${summary.journal_entries}`} sub={`${summary.evidence_count} evidence items`} /></div>
    <ProgressIntelligence data={intelligence} />
    <ReflectionIntelligence data={reflection} />
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">14-day activity</h2><p className="mt-1 text-xs text-[var(--muted)]">Completed tasks and focus minutes</p></div><BarChart3 size={18} className="text-[var(--muted)]"/></div><div className="flex h-52 items-end gap-1 sm:gap-2">{trend.map(item => <TrendBar key={item.date} item={item} maxFocus={maxFocus}/>)}</div></section><section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="mb-4 flex items-center gap-2"><Paperclip size={17} className="text-[var(--accent)]"/><h2 className="font-semibold">Evidence loop</h2></div><div className="space-y-4 text-sm"><Row label="Completed tasks" value={`${summary.tasks_completed}`} /><Row label="Focus minutes" value={`${summary.focus_minutes}`} /><Row label="Journal entries" value={`${summary.journal_entries}`} /><Row label="Evidence captured" value={`${summary.evidence_count}`} /><Row label="Average goal progress" value={`${Math.round(summary.avg_goal_progress)}%`} /></div><p className="mt-5 rounded-xl bg-[var(--surface-2)] p-3 text-xs leading-5 text-[var(--muted)]">Progress becomes useful when execution produces evidence and reflection. These signals now feed the adaptive intelligence layer.</p></section></div>
  </section>
}
function Metric({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub: string }) { return <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="mb-4 flex items-center gap-2 text-[var(--accent)]">{icon}<span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</span></div><p className="text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{sub}</p></article> }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0"><span className="text-[var(--muted)]">{label}</span><span className="font-semibold">{value}</span></div> }
function TrendBar({ item, maxFocus }: { item: ProgressSnapshot; maxFocus: number }) { const date = new Date(`${item.date}T00:00:00`); const height = item.focus_minutes ? Math.max(8, (item.focus_minutes / maxFocus) * 100) : 4; return <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2" title={`${item.date}: ${item.tasks_completed} tasks, ${item.focus_minutes} min focus`}><div className="flex h-40 w-full items-end justify-center"><div className="w-full max-w-6 rounded-t-md bg-[var(--accent)]/70" style={{ height: `${height}%` }}/></div><span className="text-[9px] text-[var(--muted)]">{date.toLocaleDateString(undefined,{weekday:'short'}).slice(0,1)}</span></div> }

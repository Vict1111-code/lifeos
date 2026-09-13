import { AlertTriangle, BrainCircuit, CheckCircle2, Flame, HeartPulse, ShieldCheck, Sparkles, Timer } from 'lucide-react'
import type { ProgressIntelligenceData } from './types'

export function ProgressIntelligence({ data }: { data: ProgressIntelligenceData }) {
  const consistency = Math.round(data.consistency_score)
  const focusPerActiveDay = data.active_days_7d ? Math.round(data.focus.minutes_7d / data.active_days_7d) : 0

  return (
    <section className="mt-5 space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Intelligence</p>
          <h2 className="text-xl font-semibold">What your progress is saying</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">A seven-day execution signal built from your actual activity.</p>
        </div>
        <BrainCircuit size={20} className="text-[var(--accent)]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Signal icon={<Flame size={17} />} label="Consistency" value={`${consistency}%`} sub={`${data.active_days_7d}/7 active days`} />
        <Signal icon={<Timer size={17} />} label="Focus rhythm" value={`${data.focus.minutes_7d}m`} sub={`${focusPerActiveDay}m per active day`} />
        <Signal icon={<CheckCircle2 size={17} />} label="Execution" value={`${data.tasks.completed_7d}`} sub="Tasks completed this week" />
        <Signal icon={<Sparkles size={17} />} label="Evidence" value={`${data.evidence.captured_7d}`} sub={`${data.reflection.journal_7d} reflections this week`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Insight icon={<HeartPulse size={18} />} title="Goal health" tone={data.goals.at_risk > 0 ? 'warning' : 'positive'}>
          <strong>{data.goals.at_risk}</strong> goal{data.goals.at_risk === 1 ? '' : 's'} currently look at risk, while <strong>{data.goals.healthy}</strong> are healthy.
        </Insight>
        <Insight icon={<ShieldCheck size={18} />} title="Momentum" tone={consistency >= 70 && data.focus.minutes_7d > 0 ? 'positive' : 'neutral'}>
          You were active on <strong>{data.active_days_7d}</strong> of the last 7 days and logged <strong>{data.focus.sessions_7d}</strong> completed focus sessions.
        </Insight>
        <Insight icon={<AlertTriangle size={18} />} title="Next signal" tone={data.goals.at_risk > 0 ? 'warning' : 'neutral'}>
          {data.goals.at_risk > 0 ? 'Review at-risk goals and choose one concrete next action before adding more work.' : 'Keep converting focused work into completed tasks, evidence, and reflection.'}
        </Insight>
      </div>
    </section>
  )
}

function Signal({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="mb-4 flex items-center gap-2 text-[var(--accent)]">{icon}<span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</span></div><p className="text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{sub}</p></article>
}

function Insight({ icon, title, tone, children }: { icon: React.ReactNode; title: string; tone: 'positive' | 'warning' | 'neutral'; children: React.ReactNode }) {
  const toneClass = tone === 'warning' ? 'border-amber-500/20 bg-amber-500/5' : tone === 'positive' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[var(--border)] bg-[var(--surface)]'
  return <article className={`rounded-2xl border p-5 ${toneClass}`}><div className="mb-3 flex items-center gap-2"><span className="text-[var(--accent)]">{icon}</span><h3 className="font-semibold">{title}</h3></div><p className="text-sm leading-6 text-[var(--muted)]">{children}</p></article>
}

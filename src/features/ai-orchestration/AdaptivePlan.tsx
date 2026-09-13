import { BrainCircuit, CheckCircle2, ChevronRight, ShieldAlert } from 'lucide-react'
import type { AdaptivePlan as AdaptivePlanData, AIRecommendation } from './types'

export function AdaptivePlan({ data }: { data: AdaptivePlanData }) {
  return <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
    <div className="flex items-start justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Adaptive planning</p><h2 className="text-xl font-semibold">What deserves attention next</h2><p className="mt-1 text-sm text-[var(--muted)]">Recommendations are derived from LifeOS signals. They remain suggestions until you choose to act.</p></div><BrainCircuit size={20} className="shrink-0 text-[var(--accent)]" /></div>
    {data.focus && <div className="mt-5 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Current focus</p><p className="mt-2 text-sm leading-6">{data.focus}</p></div>}
    <div className="mt-4 space-y-3">{data.recommendations.map(item => <Recommendation key={item.id} item={item} />)}</div>
    {!data.recommendations.length && <p className="mt-5 rounded-xl bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">No high-confidence recommendation is available yet. Keep executing and reflecting so the planning engine has better signals.</p>}
    <p className="mt-4 text-xs text-[var(--muted)]">Generated {new Date(data.generated_at).toLocaleString()}</p>
  </section>
}

function Recommendation({ item }: { item: AIRecommendation }) {
  const Icon = item.type === 'goal_risk' ? ShieldAlert : CheckCircle2
  return <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="flex gap-3"><Icon size={18} className="mt-0.5 shrink-0 text-[var(--accent)]" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">{item.title}</h3><span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">{item.priority}</span></div><p className="mt-1 text-sm text-[var(--muted)]">{item.rationale}</p><div className="mt-3 flex items-start gap-2 text-sm"><ChevronRight size={16} className="mt-0.5 text-[var(--accent)]" /><span>{item.action}</span></div></div></div></article>
}

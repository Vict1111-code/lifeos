import { AlertTriangle, BrainCircuit, CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'
import type { ReflectionIntelligence as ReflectionIntelligenceData } from './types'

export function ReflectionIntelligence({ data }: { data: ReflectionIntelligenceData }) {
  return (
    <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Reflection → Intelligence</p>
          <h2 className="text-xl font-semibold">Patterns worth noticing</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Structured signals derived from your recent reflections, without replacing your own judgment.</p>
        </div>
        <BrainCircuit size={20} className="shrink-0 text-[var(--accent)]" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ListCard icon={<Sparkles size={17} />} title="Themes" items={data.themes} empty="No recurring themes detected yet." />
        <ListCard icon={<CheckCircle2 size={17} />} title="Strengths" items={data.strengths} empty="No repeated strengths detected yet." />
        <ListCard icon={<AlertTriangle size={17} />} title="Friction points" items={data.friction_points} empty="No recurring friction points detected." />
        <ListCard icon={<Lightbulb size={17} />} title="Commitments" items={data.commitments} empty="No explicit commitments detected yet." />
      </div>

      {data.suggested_focus && <div className="mt-4 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">Suggested focus</p><p className="mt-2 text-sm leading-6">{data.suggested_focus}</p></div>}
      <p className="mt-4 text-xs text-[var(--muted)]">Based on {data.reflection_count} reflection{data.reflection_count === 1 ? '' : 's'} · confidence {Math.round(data.confidence * 100)}%</p>
    </section>
  )
}

function ListCard({ icon, title, items, empty }: { icon: React.ReactNode; title: string; items: string[]; empty: string }) {
  return <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4"><div className="mb-3 flex items-center gap-2"><span className="text-[var(--accent)]">{icon}</span><h3 className="font-semibold">{title}</h3></div>{items.length ? <ul className="space-y-2 text-sm text-[var(--muted)]">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span className="text-[var(--accent)]">•</span><span>{item}</span></li>)}</ul> : <p className="text-sm text-[var(--muted)]">{empty}</p>}</article>
}

import { useCallback, useEffect, useState } from 'react'
import { getAIAdaptationProfile, setAIAdaptationStatus } from './aiAdaptationApi'
import type { AIAdaptationRule } from './types'

function label(value: string) {
  return value.replaceAll('_', ' ')
}

function summary(rule: AIAdaptationRule) {
  const value = rule.preference_value
  if (rule.rule_key === 'preferred_focus_duration') return `${String(value.minutes ?? '—')} minute focus sessions`
  if (rule.rule_key === 'best_focus_hour') return `Focus activity is strongest around ${String(value.hour ?? '—')}:00`
  if (rule.rule_key === 'recurring_friction') return String(value.note ?? 'Recurring execution friction detected')
  if (rule.rule_key === 'feedback_reliability') return `${Math.round(Number(value.helpful_rate ?? 0) * 100)}% helpful feedback rate`
  return JSON.stringify(value)
}

export function AIAdaptationPanel() {
  const [rules, setRules] = useState<AIAdaptationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const profile = await getAIAdaptationProfile(90)
      setRules(profile.rules)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load learned adaptations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function changeStatus(rule: AIAdaptationRule, status: 'active' | 'ignored') {
    setBusyId(rule.id)
    setError(null)
    try {
      await setAIAdaptationStatus(rule.id, status)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update adaptation.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <section className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">Learning your patterns…</section>

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">AI learning</p>
          <h2 className="mt-1 text-lg font-semibold text-text">Learned adaptations</h2>
          <p className="mt-1 text-sm text-muted">LifeOS only promotes patterns after repeated evidence. You can ignore any learned rule.</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-text">Refresh</button>
      </div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      {rules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Not enough repeated behavior yet. Keep using LifeOS and the engine will learn gradually.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rules.map((rule) => (
            <article key={rule.id} className="rounded-xl border border-border bg-surface2 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] capitalize text-accent">{label(rule.signal_type)}</span>
                  <h3 className="mt-3 font-medium text-text">{label(rule.rule_key)}</h3>
                  <p className="mt-1 text-sm text-muted">{summary(rule)}</p>
                </div>
                <span className="text-xs text-muted">{Math.round(rule.confidence * 100)}%</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted">
                <span>{rule.evidence_count} evidence signals</span>
                <button disabled={busyId === rule.id} onClick={() => void changeStatus(rule, 'ignored')} className="rounded-lg border border-border px-2.5 py-1.5 hover:text-text disabled:opacity-50">Ignore</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

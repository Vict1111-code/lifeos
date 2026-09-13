import { useCallback, useEffect, useState } from 'react'
import type { AIActionProposal } from './types'
import { approveAIAction, executeAIAction, listAIActionProposals, rejectAIAction } from './aiActionsApi'

function label(value: string) {
  return value.replaceAll('_', ' ')
}

export function AIActionCenter() {
  const [actions, setActions] = useState<AIActionProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setActions(await listAIActionProposals())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load AI actions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  async function act(id: string, operation: 'approve' | 'reject' | 'execute') {
    setBusyId(id)
    setError(null)
    try {
      if (operation === 'approve') await approveAIAction(id)
      if (operation === 'reject') await rejectAIAction(id)
      if (operation === 'execute') await executeAIAction(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI action failed.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <section className="rounded-2xl border border-border bg-surface p-5 text-sm text-muted">Loading validated AI actions…</section>

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">AI execution</p>
          <h2 className="mt-1 text-lg font-semibold text-text">Validated actions</h2>
          <p className="mt-1 text-sm text-muted">AI can propose changes, but execution stays behind explicit validation and approval.</p>
        </div>
        <button onClick={() => void load()} className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-text">Refresh</button>
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      {actions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">No AI actions have been proposed yet.</div>
      ) : (
        <div className="space-y-3">
          {actions.map((action) => {
            const pending = action.status === 'proposed' || action.status === 'approved'
            return (
              <article key={action.id} className="rounded-xl border border-border bg-surface2 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium text-text">{action.title}</h3>
                      <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] capitalize text-accent">{label(action.action_type)}</span>
                      <span className="rounded-full border border-border px-2 py-1 text-[11px] capitalize text-muted">{action.status}</span>
                    </div>
                    {action.description && <p className="mt-2 text-sm text-muted">{action.description}</p>}
                    <p className="mt-2 text-xs text-muted">Confidence {Math.round(action.confidence * 100)}%{action.source_signals.length ? ` · ${action.source_signals.length} source signals` : ''}</p>
                  </div>
                  {pending && (
                    <div className="flex flex-wrap gap-2">
                      {action.status === 'proposed' && <button disabled={busyId === action.id} onClick={() => void act(action.id, 'approve')} className="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white disabled:opacity-50">Approve</button>}
                      <button disabled={busyId === action.id} onClick={() => void act(action.id, 'reject')} className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:text-text disabled:opacity-50">Reject</button>
                      {action.status === 'approved' && <button disabled={busyId === action.id} onClick={() => void act(action.id, 'execute')} className="rounded-lg border border-accent/40 px-3 py-2 text-xs text-accent hover:bg-accent/10 disabled:opacity-50">Execute</button>}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

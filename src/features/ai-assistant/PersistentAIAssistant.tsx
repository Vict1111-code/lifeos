import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Check, ChevronDown, Loader2, Plus, Send, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { createAIActionProposal, approveAIAction, executeAIAction, rejectAIAction } from '../ai-actions/aiActionsApi'
import { recordAIFeedback } from '../ai-feedback/aiFeedbackApi'
import { createConversation, listConversations, listMessages, sendPersistentMessage } from './persistentAssistantApi'
import type { AIConversation, AIMessage, ProposedAgentAction } from './types'

const starters = ['What should I focus on today?', 'Review my goals and tell me what is at risk.', 'Help me plan the next few days.']

type ActionState = 'proposed' | 'approved' | 'rejected' | 'executed' | 'failed'

interface ActionUiState {
  status: ActionState
  result?: Record<string, unknown>
  feedback?: 'helpful' | 'not_helpful'
}

function proposedActions(message: AIMessage): ProposedAgentAction[] {
  const value = message.metadata.proposed_actions
  return Array.isArray(value) ? value.filter((item): item is ProposedAgentAction => !!item && typeof item === 'object' && typeof (item as Record<string, unknown>).title === 'string') : []
}

function toolCalls(message: AIMessage): { name: string }[] {
  const value = message.metadata.tool_calls
  return Array.isArray(value) ? value.filter((item): item is { name: string } => !!item && typeof item === 'object' && typeof (item as Record<string, unknown>).name === 'string') : []
}

function actionId(action: ProposedAgentAction, messageId: string, index: number) {
  return action.proposal_id ?? `${messageId}:${index}`
}

export function PersistentAIAssistant() {
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [conversation, setConversation] = useState<AIConversation | null>(null)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [actionStates, setActionStates] = useState<Record<string, ActionUiState>>({})
  const endRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    const items = await listConversations()
    setConversations(items)
    return items
  }, [])

  const openConversation = useCallback(async (item: AIConversation) => {
    setConversation(item)
    setLoadingMessages(true)
    setError(null)
    setActionStates({})
    try { setMessages(await listMessages(item.id)) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load conversation.') } finally { setLoadingMessages(false) }
  }, [])

  useEffect(() => { if (open) void loadConversations().then(items => { if (!conversation && items[0]) void openConversation(items[0]) }).catch(e => setError(e instanceof Error ? e.message : 'Unable to load conversations.')) }, [open, conversation, loadConversations, openConversation])
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function newConversation() {
    setError(null)
    try { const item = await createConversation('today'); setConversations(current => [item, ...current]); setConversation(item); setMessages([]); setActionStates({}) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create conversation.') }
  }

  function setActionState(id: string, state: ActionUiState) {
    setActionStates(current => ({ ...current, [id]: state }))
  }

  async function handleApprove(action: ProposedAgentAction, messageId: string, index: number) {
    if (!action.proposal_id) return setError('This action is missing its persisted proposal ID. Send the request again.')
    const id = actionId(action, messageId, index)
    setActionBusy(id); setError(null)
    try {
      await approveAIAction(action.proposal_id)
      setActionState(id, { status: 'approved' })
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to approve action.'); setActionState(id, { status: 'failed' }) } finally { setActionBusy(null) }
  }

  async function handleReject(action: ProposedAgentAction, messageId: string, index: number) {
    if (!action.proposal_id) return setError('This action is missing its persisted proposal ID. Send the request again.')
    const id = actionId(action, messageId, index)
    setActionBusy(id); setError(null)
    try {
      await rejectAIAction(action.proposal_id)
      setActionState(id, { status: 'rejected' })
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to reject action.'); setActionState(id, { status: 'failed' }) } finally { setActionBusy(null) }
  }

  async function handleExecute(action: ProposedAgentAction, messageId: string, index: number) {
    if (!action.proposal_id) return setError('This action is missing its persisted proposal ID. Send the request again.')
    const id = actionId(action, messageId, index)
    setActionBusy(id); setError(null)
    try {
      const execution = await executeAIAction(action.proposal_id)
      const nextStatus: ActionState = execution.success ? 'executed' : 'failed'
      setActionState(id, { status: nextStatus, result: execution.result })
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to execute action.'); setActionState(id, { status: 'failed' }) } finally { setActionBusy(null) }
  }

  async function handleFeedback(action: ProposedAgentAction, messageId: string, index: number, rating: 'helpful' | 'not_helpful') {
    if (!action.proposal_id) return
    const id = actionId(action, messageId, index)
    const state = actionStates[id]
    if (state?.feedback) return
    try {
      await recordAIFeedback({
        action_id: action.proposal_id,
        recommendation_type: action.action_type,
        rating,
        outcome: state?.status === 'executed' ? 'successful' : state?.status === 'failed' ? 'unsuccessful' : 'unknown',
        note: null,
        context: { source: 'persistent_assistant' },
      })
      setActionState(id, { ...(state ?? { status: 'executed' }), feedback: rating })
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to record feedback.') }
  }

  async function send(value = input) {
    const content = value.trim()
    if (!content || loading || !conversation) return
    setInput(''); setError(null); setLoading(true)
    const optimistic: AIMessage = { id: crypto.randomUUID(), conversation_id: conversation.id, role: 'user', content, provider: null, model: null, metadata: {}, created_at: new Date().toISOString() }
    setMessages(current => [...current, optimistic])
    try {
      const result = await sendPersistentMessage(conversation.id, content, conversation.context_horizon === 'week' ? 'week' : 'today')
      setMessages(current => [...current.filter(m => m.id !== optimistic.id), result.userMessage, result.assistantMessage])
      setConversations(await listConversations())
    } catch (e) { setMessages(current => current.filter(m => m.id !== optimistic.id)); setError(e instanceof Error ? e.message : 'The assistant could not respond.') } finally { setLoading(false) }
  }

  return <>
    {open && <section className="fixed inset-x-2 bottom-20 z-[70] flex h-[min(720px,calc(100dvh-5.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-5 sm:w-[min(720px,calc(100vw-2rem))]">
      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Sparkles size={18}/></div><div className="min-w-0"><p className="truncate text-sm font-semibold">LifeOS Assistant</p><p className="text-xs text-[var(--muted)]">Persistent agent · read tools · approval-safe actions</p></div></div>
        <div className="flex items-center gap-1"><button onClick={() => void newConversation()} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]" title="New conversation"><Plus size={17}/></button><button onClick={() => setOpen(false)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]" aria-label="Minimize"><ChevronDown size={18}/></button></div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-[var(--border)] bg-[var(--surface-2)]/40 p-2 sm:block"><button onClick={() => void newConversation()} className="mb-2 flex w-full items-center gap-2 rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-semibold text-white"><Plus size={14}/>New chat</button><div className="max-h-full space-y-1 overflow-y-auto">{conversations.map(item => <button key={item.id} onClick={() => void openConversation(item)} className={`w-full rounded-xl px-3 py-2 text-left text-xs ${conversation?.id === item.id ? 'bg-[var(--accent-soft)] text-[var(--text)]' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`}><span className="block truncate">{item.title || 'New conversation'}</span><span className="mt-1 block text-[10px] opacity-60">{new Date(item.updated_at).toLocaleDateString()}</span></button>)}</div></aside>
        <div className="flex min-w-0 flex-1 flex-col"><div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5">{loadingMessages ? <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]"><Loader2 className="mr-2 animate-spin" size={16}/>Loading conversation…</div> : <div className="space-y-4">{!messages.length && <div className="mx-auto max-w-lg pt-8 text-center"><Bot className="mx-auto text-[var(--accent)]" size={30}/><h3 className="mt-3 text-lg font-semibold">What can I help you accomplish?</h3><p className="mt-2 text-sm text-[var(--muted)]">I can read your LifeOS context, use focused tools, and prepare approval-safe actions.</p><div className="mt-5 grid gap-2 text-left">{starters.map(prompt => <button key={prompt} onClick={() => void send(prompt)} className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--muted)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]">{prompt}</button>)}</div></div>}{messages.map(message => { const tools = message.role === 'assistant' ? toolCalls(message) : []; const actions = message.role === 'assistant' ? proposedActions(message) : []; return <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-[var(--accent)] text-white' : 'rounded-bl-md bg-[var(--surface-2)]'}`}>{message.role === 'assistant' && <div className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]"><Bot size={11}/> LifeOS Agent</div>}<p className="whitespace-pre-wrap break-words">{message.content}</p>{tools.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--border)] pt-2">{tools.map(tool => <span key={tool.name} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted)]">read: {tool.name.replace('get_', '').replaceAll('_', ' ')}</span>)}</div>}{actions.length > 0 && <div className="mt-3 border-t border-[var(--border)] pt-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">Validated actions</p><div className="mt-2 space-y-2">{actions.map((action, index) => { const id = actionId(action, message.id, index); const state = actionStates[id] ?? { status: 'proposed' as ActionState }; const busy = actionBusy === id; return <div key={id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5"><p className="text-xs font-semibold">{action.title}</p><p className="mt-1 text-[11px] text-[var(--muted)]">{action.description}</p><p className="mt-2 text-[10px] text-[var(--accent)]">{Math.round(action.confidence * 100)}% confidence</p><div className="mt-2 flex flex-wrap gap-2">{state.status === 'proposed' && <><button disabled={busy} onClick={() => void handleApprove(action, message.id, index)} className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40">{busy ? <Loader2 size={11} className="animate-spin"/> : <Check size={11}/>}Approve</button><button disabled={busy} onClick={() => void handleReject(action, message.id, index)} className="rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--muted)] disabled:opacity-40">Reject</button></>}{state.status === 'approved' && <button disabled={busy} onClick={() => void handleExecute(action, message.id, index)} className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40">{busy ? <Loader2 size={11} className="animate-spin"/> : <Check size={11}/>}Execute</button>}{state.status === 'rejected' && <span className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1.5 text-[10px] text-[var(--muted)]">Rejected</span>}{state.status === 'executed' && <span className="rounded-lg bg-[var(--accent-soft)] px-2.5 py-1.5 text-[10px] font-semibold text-[var(--accent)]">Executed</span>}{state.status === 'failed' && <span className="rounded-lg bg-red-500/10 px-2.5 py-1.5 text-[10px] text-red-300">Failed</span>}</div>{state.result && <pre className="mt-2 max-h-28 overflow-auto rounded-lg bg-[var(--surface-2)] p-2 text-[9px] text-[var(--muted)]">{JSON.stringify(state.result, null, 2)}</pre>}{(state.status === 'executed' || state.status === 'failed') && action.proposal_id && <div className="mt-2 flex items-center gap-2 border-t border-[var(--border)] pt-2"><span className="text-[10px] text-[var(--muted)]">Was this useful?</span><button disabled={!!state.feedback} onClick={() => void handleFeedback(action, message.id, index, 'helpful')} className={`rounded-md p-1 ${state.feedback === 'helpful' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`} aria-label="Helpful"><ThumbsUp size={12}/></button><button disabled={!!state.feedback} onClick={() => void handleFeedback(action, message.id, index, 'not_helpful')} className={`rounded-md p-1 ${state.feedback === 'not_helpful' ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-2)]'}`} aria-label="Not helpful"><ThumbsDown size={12}/></button></div>}</div> })}</div></div>}</div></div> })}{loading && <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Loader2 size={14} className="animate-spin"/>Thinking, checking tools, and validating suggestions…</div>}{error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}<div ref={endRef}/></div>}</div><form onSubmit={e => { e.preventDefault(); void send() }} className="shrink-0 border-t border-[var(--border)] p-3"><div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1.5 focus-within:border-[var(--accent)]"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }} rows={1} placeholder={conversation ? 'Ask your LifeOS agent…' : 'Start a conversation…'} disabled={loading || !conversation} className="max-h-32 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[var(--muted)]"/><button type="submit" disabled={!input.trim() || loading || !conversation} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white disabled:opacity-40" aria-label="Send"><Send size={16}/></button></div></form></div></div>
    </section>}
    <button onClick={() => setOpen(v => !v)} className="fixed bottom-4 right-4 z-[71] grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)] text-white shadow-xl ring-4 ring-[var(--background)] transition hover:scale-105 active:scale-95 sm:bottom-5 sm:right-5" aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}>{open ? <X size={21}/> : <><Sparkles size={21}/><span className="absolute inset-0 rounded-full ring-2 ring-[var(--accent)] animate-ping opacity-20"/></>}</button>
  </>
}

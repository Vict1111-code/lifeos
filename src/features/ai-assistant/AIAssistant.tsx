import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { chatWithAssistant } from './assistantApi'
import type { AssistantMessage } from './types'

const starterPrompts = [
  'What should I focus on today?',
  'Help me plan my week.',
  'Why am I falling behind on my goals?',
]

function makeMessage(role: AssistantMessage['role'], content: string): AssistantMessage {
  return { id: crypto.randomUUID(), role, content, created_at: new Date().toISOString() }
}

export function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AssistantMessage[]>([
    makeMessage('assistant', 'Hi. I’m your LifeOS assistant. I can help you understand your goals, plan your time, review progress, and decide what to do next.'),
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  async function sendMessage(value = input) {
    const message = value.trim()
    if (!message || loading) return

    const userMessage = makeMessage('user', message)
    const history = messages.slice(-12).map(({ role, content }) => ({ role, content }))
    setMessages((current) => [...current, userMessage])
    setInput('')
    setError(null)
    setLoading(true)

    try {
      const result = await chatWithAssistant({ message, history, horizon: 'today' })
      setMessages((current) => [...current, makeMessage('assistant', result.message)])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant could not respond right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <section className="fixed inset-x-3 bottom-20 z-[70] flex h-[min(680px,calc(100dvh-6.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:inset-x-auto sm:right-5 sm:w-[min(420px,calc(100vw-2rem))] sm:bottom-24" aria-label="LifeOS AI assistant">
          <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Sparkles size={18} /></div>
              <div className="min-w-0"><p className="truncate text-sm font-semibold">LifeOS Assistant</p><p className="text-xs text-[var(--muted)]">Personal planning & reflection</p></div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label="Minimize assistant"><ChevronDown size={18} /></button>
              <button onClick={() => setMessages([makeMessage('assistant', 'Fresh conversation started. What would you like to work on?')])} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label="New conversation"><MessageCircle size={17} /></button>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]" aria-label="Close assistant"><X size={18} /></button>
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === 'user' ? 'rounded-br-md bg-[var(--accent)] text-white' : 'rounded-bl-md bg-[var(--surface-2)] text-[var(--text)]'}`}>
                    {message.role === 'assistant' && <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]"><Bot size={12} /> LifeOS</div>}
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              {messages.length === 1 && !loading && (
                <div className="space-y-2 pt-1">
                  {starterPrompts.map((prompt) => <button key={prompt} onClick={() => void sendMessage(prompt)} className="block w-full rounded-xl border border-[var(--border)] px-3 py-2 text-left text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--text)]">{prompt}</button>)}
                </div>
              )}
              {loading && <div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Loader2 size={15} className="animate-spin" /> Thinking with your LifeOS context…</div>}
              {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-300">{error}</div>}
              <div ref={endRef} />
            </div>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); void sendMessage() }} className="shrink-0 border-t border-[var(--border)] p-3">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-1.5 focus-within:border-[var(--accent)]">
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask your LifeOS assistant…" disabled={loading} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]" aria-label="Message LifeOS assistant" />
              <button type="submit" disabled={!input.trim() || loading} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send size={16} /></button>
            </div>
          </form>
        </section>
      )}

      <button onClick={() => setOpen((value) => !value)} className="fixed bottom-4 right-4 z-[71] grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)] text-white shadow-xl shadow-black/30 ring-4 ring-[var(--background)] transition hover:scale-105 active:scale-95 sm:bottom-5 sm:right-5" aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}>
        {open ? <X size={21} /> : <><Sparkles size={21} /><span className="absolute inset-0 rounded-full ring-2 ring-[var(--accent)] animate-ping opacity-20" /></>}
      </button>
    </>
  )
}

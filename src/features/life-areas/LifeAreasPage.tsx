import { useCallback, useEffect, useState } from 'react'
import { Archive, Edit3, Layers3, Plus, RefreshCw, Target, X } from 'lucide-react'
import { createLifeArea, listLifeAreas, setLifeAreaActive, updateLifeArea } from './lifeAreasApi'
import { lifeAreaCategories, type LifeArea, type LifeAreaInput } from './types'

const categoryLabel = (value: string) => value.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
const emptyForm: LifeAreaInput = { name: '', category: 'personal', description: '', color_token: 'accent', icon_name: 'circle', sort_order: 0 }

export function LifeAreasPage() {
  const [areas, setAreas] = useState<LifeArea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [editor, setEditor] = useState<{ open: boolean; area: LifeArea | null }>({ open: false, area: null })

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setAreas(await listLifeAreas(true)) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load life areas.') } finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

  async function save(input: LifeAreaInput) {
    if (!input.name.trim()) return
    try {
      const saved = editor.area ? await updateLifeArea(editor.area.id, input) : await createLifeArea(input)
      setAreas(current => editor.area ? current.map(item => item.id === saved.id ? saved : item) : [...current, saved].sort((a,b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)))
      setEditor({ open: false, area: null })
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save life area.') }
  }

  async function toggle(area: LifeArea) {
    try { const updated = await setLifeAreaActive(area.id, !area.is_active); setAreas(current => current.map(item => item.id === updated.id ? updated : item)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to update life area.') }
  }

  const visible = areas.filter(area => showInactive || area.is_active)
  return <section className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">Direction</p><h1 className="text-3xl font-semibold tracking-tight">Life Areas</h1><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">The stable areas of life that your goals and daily execution serve.</p></div>
      <div className="flex gap-2"><button onClick={() => setEditor({ open: true, area: null })} className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16}/>New life area</button><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm hover:bg-[var(--surface-2)]"><RefreshCw size={15}/>Refresh</button></div>
    </header>
    <div className="mb-5 flex items-center gap-3 text-sm text-[var(--muted)]"><button onClick={() => setShowInactive(value => !value)} className={`rounded-xl border px-3 py-2 ${showInactive ? 'border-[var(--accent)] text-[var(--text)]' : 'border-[var(--border)]'}`}>{showInactive ? 'Showing inactive' : 'Active only'}</button><span>{visible.length} area{visible.length === 1 ? '' : 's'}</span></div>
    {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200">{error}</div>}
    {loading && !areas.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-48 animate-pulse rounded-2xl bg-[var(--surface)]"/>)}</div> : visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map(area => <article key={area.id} className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 ${!area.is_active ? 'opacity-60' : ''}`}><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]"><Layers3 size={21}/></div><div className="flex gap-1"><button onClick={() => setEditor({ open: true, area })} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-white" title="Edit"><Edit3 size={15}/></button><button onClick={() => void toggle(area)} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-white" title={area.is_active ? 'Deactivate' : 'Activate'}>{area.is_active ? <Archive size={15}/> : <Plus size={15}/>}</button></div></div><h2 className="mt-4 font-semibold">{area.name}</h2><p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--accent)]">{categoryLabel(area.category)}</p>{area.description && <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">{area.description}</p>}<div className="mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[var(--surface-2)] p-3"><div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Target size={13}/>Goals</div><p className="mt-1 text-lg font-semibold">{area.goal_count}</p></div><div className="rounded-xl bg-[var(--surface-2)] p-3"><div className="flex items-center gap-2 text-xs text-[var(--muted)]"><Layers3 size={13}/>Tasks</div><p className="mt-1 text-lg font-semibold">{area.task_count}</p></div></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center"><Layers3 className="mx-auto text-[var(--accent)]" size={28}/><h2 className="mt-3 font-semibold">No life areas yet</h2><p className="mt-1 text-sm text-[var(--muted)]">Create the areas that give your goals a meaningful structure.</p><button onClick={() => setEditor({ open:true, area:null })} className="mt-5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white">Create your first area</button></div>}
    {editor.open && <LifeAreaEditor area={editor.area} onClose={() => setEditor({ open:false, area:null })} onSave={save}/>} 
  </section>
}

function LifeAreaEditor({ area, onClose, onSave }: { area: LifeArea | null; onClose: () => void; onSave: (input: LifeAreaInput) => Promise<void> }) {
  const [form, setForm] = useState<LifeAreaInput>(() => area ? { name: area.name, category: area.category, description: area.description ?? '', color_token: area.color_token ?? 'accent', icon_name: area.icon_name ?? 'circle', sort_order: area.sort_order } : emptyForm)
  const input = 'w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 outline-none focus:border-[var(--accent)]'
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Direction</p><h2 className="mt-1 text-xl font-semibold">{area ? 'Edit life area' : 'Create life area'}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]"><X size={18}/></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-1 block text-xs text-[var(--muted)]">Name</span><input autoFocus className={input} value={form.name} onChange={e => setForm(v => ({...v,name:e.target.value}))} placeholder="Career, Spirituality, Health..."/></label><label><span className="mb-1 block text-xs text-[var(--muted)]">Category</span><select className={input} value={form.category} onChange={e => setForm(v => ({...v,category:e.target.value as LifeAreaInput['category']}))}>{lifeAreaCategories.map(v => <option key={v}>{v}</option>)}</select></label><label><span className="mb-1 block text-xs text-[var(--muted)]">Order</span><input className={input} type="number" min="0" value={form.sort_order} onChange={e => setForm(v => ({...v,sort_order:Number(e.target.value)}))}/></label><label className="sm:col-span-2"><span className="mb-1 block text-xs text-[var(--muted)]">Description</span><textarea className={`${input} resize-none`} rows={3} value={form.description} onChange={e => setForm(v => ({...v,description:e.target.value}))} placeholder="What does this area represent in your life?"/></label></div><div className="mt-6 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm">Cancel</button><button disabled={!form.name.trim()} onClick={() => void onSave(form)} className="rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Save area</button></div></div></div>
}

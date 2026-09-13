import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Brain, CheckSquare, ChevronLeft, ChevronRight, CircleGauge, Crosshair, Home, Layers3, Menu, NotebookPen, Settings, Target, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const navigation: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Today', to: '/today', icon: CircleGauge },
  { label: 'Life Areas', to: '/life-areas', icon: Layers3 },
  { label: 'Goals', to: '/goals', icon: Target },
  { label: 'Tasks', to: '/tasks', icon: CheckSquare },
  { label: 'Focus', to: '/focus', icon: Crosshair },
  { label: 'Journal', to: '/journal', icon: NotebookPen },
  { label: 'Progress', to: '/progress', icon: Brain },
]

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return <div className="min-h-screen bg-[var(--background)] text-[var(--text)]"><button aria-label="Open navigation" className="fixed left-4 top-4 z-40 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform lg:translate-x-0 ${mobileOpen?'translate-x-0':'-translate-x-full'} ${collapsed?'lg:w-20':''}`}><div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-4"><Link to="/" className="flex items-center gap-3 font-semibold" onClick={()=>setMobileOpen(false)}><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)] text-white"><Brain size={19}/></span>{!collapsed&&<span>LifeOS</span>}</Link><button className="rounded-lg p-2 hover:bg-[var(--surface-2)] lg:hidden" onClick={()=>setMobileOpen(false)} aria-label="Close navigation"><X size={18}/></button></div><nav className="flex-1 space-y-1 p-3">{navigation.map(({label,to,icon:Icon})=>{const active=location.pathname===to;return <Link key={to} to={to} onClick={()=>setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active?'bg-[var(--accent-soft)] text-[var(--accent)]':'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}><Icon size={18}/>{!collapsed&&label}</Link>})}</nav><div className="border-t border-[var(--border)] p-3"><Link to="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"><Settings size={18}/>{!collapsed&&'Settings'}</Link><button onClick={()=>setCollapsed(value=>!value)} className="mt-2 hidden w-full items-center justify-center rounded-xl border border-[var(--border)] p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] lg:flex" aria-label="Toggle sidebar">{collapsed?<ChevronRight size={17}/>:<ChevronLeft size={17}/>}</button></div></aside>{mobileOpen&&<button className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Close navigation overlay" onClick={()=>setMobileOpen(false)}/>}<main className={`${collapsed?'lg:pl-20':'lg:pl-64'} min-h-screen transition-[padding]`}><Outlet/></main></div>
}

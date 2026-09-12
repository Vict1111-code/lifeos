import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'

const pages = {
  Home: 'LifeOS home dashboard',
  Today: 'Your highest-leverage actions for today',
  Goals: 'Goals and milestones',
  Tasks: 'Tasks and execution',
  Focus: 'Focus sessions',
  Journal: 'Journal and reflection',
  Progress: 'Progress and evidence',
  Settings: 'System settings',
}

function Page({ name }: { name: keyof typeof pages }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">LifeOS</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">{name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{pages[name]}</p>
      </div>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <p className="text-sm text-[var(--muted)]">This workspace is ready for the next feature module.</p>
      </div>
    </section>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Page name="Home" />} />
          <Route path="/today" element={<Page name="Today" />} />
          <Route path="/goals" element={<Page name="Goals" />} />
          <Route path="/tasks" element={<Page name="Tasks" />} />
          <Route path="/focus" element={<Page name="Focus" />} />
          <Route path="/journal" element={<Page name="Journal" />} />
          <Route path="/progress" element={<Page name="Progress" />} />
          <Route path="/settings" element={<Page name="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

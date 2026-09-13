import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../features/auth/LoginPage'
import { SignupPage } from '../features/auth/SignupPage'
import { OnboardingPage } from '../features/onboarding/OnboardingPage'
import { HomeDashboard } from '../features/dashboard/HomeDashboard'
import { TasksPage } from '../features/tasks/TasksPage'
import { LifeAreasPage } from '../features/life-areas/LifeAreasPage'
import { GoalsPage } from '../features/goals/GoalsPage'
import { FocusPage } from '../features/focus/FocusPage'

const pages = {
  Journal: 'Journal and reflection',
  Progress: 'Progress and evidence',
  Settings: 'System settings',
}

function Page({ name }: { name: keyof typeof pages }) {
  return <section className="mx-auto max-w-6xl px-6 py-8 lg:px-10"><div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">LifeOS</p><h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">{name}</h1><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{pages[name]}</p></div><div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm"><p className="text-sm text-[var(--muted)]">This workspace is ready for the next feature module.</p></div></section>
}

export function App() {
  return <BrowserRouter><Routes><Route path="/login" element={<LoginPage />} /><Route path="/signup" element={<SignupPage />} /><Route element={<ProtectedRoute />}><Route path="/onboarding" element={<OnboardingPage />} /><Route element={<AppShell />}><Route path="/" element={<HomeDashboard />} /><Route path="/today" element={<HomeDashboard mode="today" />} /><Route path="/life-areas" element={<LifeAreasPage />} /><Route path="/goals" element={<GoalsPage />} /><Route path="/tasks" element={<TasksPage />} /><Route path="/focus" element={<FocusPage />} /><Route path="/journal" element={<Page name="Journal" />} /><Route path="/progress" element={<Page name="Progress" />} /><Route path="/settings" element={<Page name="Settings" />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter>
}

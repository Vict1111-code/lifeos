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
import { JournalPage } from '../features/journal/JournalPage'
import { ProgressPage } from '../features/progress/ProgressPage'
import { EvidencePage } from '../features/evidence/EvidencePage'
import { AIMemoryPanel } from '../features/ai-memory/AIMemoryPanel'

export function SettingsPage() {
  return <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
    <div className="mb-6"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">LifeOS</p><h1 className="text-3xl font-semibold tracking-tight text-[var(--text)]">Settings</h1><p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">Control how LifeOS learns from your interactions and personalizes the AI assistant.</p></div>
    <AIMemoryPanel />
  </section>
}

export function App() { return <BrowserRouter><Routes><Route path="/login" element={<LoginPage />} /><Route path="/signup" element={<SignupPage />} /><Route element={<ProtectedRoute />}><Route path="/onboarding" element={<OnboardingPage />} /><Route element={<AppShell />}><Route path="/" element={<HomeDashboard />} /><Route path="/today" element={<HomeDashboard mode="today" />} /><Route path="/life-areas" element={<LifeAreasPage />} /><Route path="/goals" element={<GoalsPage />} /><Route path="/tasks" element={<TasksPage />} /><Route path="/focus" element={<FocusPage />} /><Route path="/journal" element={<JournalPage />} /><Route path="/progress" element={<ProgressPage />} /><Route path="/evidence" element={<EvidencePage />} /><Route path="/settings" element={<SettingsPage />} /></Route></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></BrowserRouter> }

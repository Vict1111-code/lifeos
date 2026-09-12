import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth/AuthProvider';

const AREA_OPTIONS = [
  ['career', 'Career'], ['education', 'Education'], ['skills', 'Skills'], ['spiritual', 'Spiritual'],
  ['health', 'Health'], ['financial', 'Financial'], ['personal', 'Personal'], ['relationships', 'Relationships'],
  ['projects', 'Projects'], ['creativity', 'Creativity'], ['service', 'Service'],
] as const;

const AUTONOMY = [
  ['0', 'Observe', 'LifeOS watches patterns but never acts automatically.'],
  ['1', 'Recommend', 'LifeOS suggests what to do; you decide.'],
  ['2', 'Assist', 'LifeOS can help execute approved actions.'],
  ['3', 'Routine autonomy', 'LifeOS may run low-risk routines you authorize.'],
  ['4', 'Delegated autonomy', 'LifeOS can act within explicitly approved domains.'],
] as const;

const STEPS = ['Welcome', 'Profile', 'Life areas', 'Goals', 'Preferences', 'AI & autonomy', 'Complete'];

type GoalDraft = { title: string; life_area_category: string; why: string };

export function OnboardingPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [areas, setAreas] = useState<string[]>(['career', 'education', 'skills', 'spiritual', 'health']);
  const [goals, setGoals] = useState<GoalDraft[]>([{ title: '', life_area_category: 'career', why: '' }]);
  const [aiEnabled, setAiEnabled] = useState(profile?.ai_enabled ?? true);
  const [autonomy, setAutonomy] = useState(String(profile?.autonomy_level ?? 1));
  const [timezone, setTimezone] = useState(profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedLabels = useMemo(() => AREA_OPTIONS.filter(([id]) => areas.includes(id)).map(([, label]) => label), [areas]);

  function next() {
    setError(null);
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function toggleArea(id: string) {
    setAreas((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function updateGoal(index: number, patch: Partial<GoalDraft>) {
    setGoals((current) => current.map((goal, i) => i === index ? { ...goal, ...patch } : goal));
  }

  function addGoal() {
    if (goals.length < 5) setGoals((current) => [...current, { title: '', life_area_category: areas[0] ?? 'career', why: '' }]);
  }

  async function finish(event?: FormEvent) {
    event?.preventDefault();
    if (!profile) return;
    setError(null);
    setSaving(true);

    const cleanGoals = goals.filter((goal) => goal.title.trim()).map((goal, index) => ({
      ...goal,
      priority: index === 0 ? 'high' : 'medium',
    }));
    const lifeAreas = areas.map((category, index) => ({ category, name: AREA_OPTIONS.find(([id]) => id === category)?.[1] ?? category, sort_order: index }));

    const { error: rpcError } = await supabase.rpc('complete_onboarding', {
      p_first_name: firstName,
      p_last_name: lastName,
      p_display_name: displayName,
      p_timezone: timezone,
      p_locale: 'en-NG',
      p_ai_enabled: aiEnabled,
      p_autonomy_level: Number(autonomy),
      p_life_areas: lifeAreas,
      p_goals: cleanGoals,
    });

    setSaving(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    navigate('/', { replace: true });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-4 border-b pb-5">
          <div>
            <p className="text-sm font-semibold text-primary">LifeOS</p>
            <p className="text-xs text-muted-foreground">Set up your personal operating system</p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
        </header>

        <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr]">
          <nav className="hidden lg:block" aria-label="Onboarding progress">
            <ol className="space-y-2">
              {STEPS.map((label, index) => (
                <li key={label} className={`rounded-xl px-3 py-2 text-sm ${index === step ? 'bg-primary/10 font-semibold text-primary' : index < step ? 'text-foreground' : 'text-muted-foreground'}`}>
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs">{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
          </nav>

          <section className="flex min-h-[620px] flex-col rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
            {step === 0 && <div className="m-auto max-w-2xl text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-8 w-8" /></div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Your life, intentionally designed</p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Welcome to LifeOS.</h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted-foreground">We’ll spend a few minutes establishing your direction, priorities, routines and AI preferences. You can change everything later.</p>
              <button onClick={next} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Build my LifeOS <ArrowRight className="h-4 w-4" /></button>
            </div>}

            {step === 1 && <div className="mx-auto w-full max-w-xl">
              <p className="text-sm font-semibold text-primary">Profile</p><h2 className="mt-2 text-3xl font-bold tracking-tight">How should LifeOS address you?</h2><p className="mt-2 text-muted-foreground">Use the name that feels natural for your daily briefs and reflections.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium">First name<input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" required /></label>
                <label className="text-sm font-medium">Last name<input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" /></label>
              </div>
              <label className="mt-4 block text-sm font-medium">Display name<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={firstName || 'Your preferred name'} className="mt-2 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" /></label>
            </div>}

            {step === 2 && <div className="w-full"><p className="text-sm font-semibold text-primary">Life areas</p><h2 className="mt-2 text-3xl font-bold tracking-tight">What matters in your life?</h2><p className="mt-2 text-muted-foreground">Choose the areas LifeOS should help you intentionally manage.</p><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{AREA_OPTIONS.map(([id, label]) => <button type="button" key={id} onClick={() => toggleArea(id)} className={`rounded-2xl border p-4 text-left transition ${areas.includes(id) ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}><span className="font-semibold">{label}</span><span className="mt-1 block text-xs text-muted-foreground">{areas.includes(id) ? 'Included in your LifeOS' : 'Add this area'}</span></button>)}</div><p className="mt-4 text-sm text-muted-foreground">Selected: {selectedLabels.join(', ') || 'None'}</p></div>}

            {step === 3 && <div className="w-full max-w-3xl"><p className="text-sm font-semibold text-primary">Direction</p><h2 className="mt-2 text-3xl font-bold tracking-tight">What are you working toward?</h2><p className="mt-2 text-muted-foreground">Start with a few meaningful goals. They can be rough; LifeOS will help refine them later.</p><div className="mt-7 space-y-4">{goals.map((goal, index) => <div key={index} className="rounded-2xl border p-4"><div className="grid gap-3 sm:grid-cols-[1fr_180px]"><input value={goal.title} onChange={(e) => updateGoal(index, { title: e.target.value })} placeholder={`Goal ${index + 1}, e.g. Build a strong software engineering career`} className="rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" /><select value={goal.life_area_category} onChange={(e) => updateGoal(index, { life_area_category: e.target.value })} className="rounded-xl border bg-background px-4 py-3">{AREA_OPTIONS.filter(([id]) => areas.includes(id)).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div><input value={goal.why} onChange={(e) => updateGoal(index, { why: e.target.value })} placeholder="Why does this matter to you? (optional)" className="mt-3 w-full rounded-xl border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-ring" /></div>)}</div><button type="button" onClick={addGoal} disabled={goals.length >= 5} className="mt-4 rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-40">+ Add another goal</button></div>}

            {step === 4 && <div className="mx-auto w-full max-w-xl"><p className="text-sm font-semibold text-primary">Preferences</p><h2 className="mt-2 text-3xl font-bold tracking-tight">Make LifeOS fit your day.</h2><p className="mt-2 text-muted-foreground">Your timezone keeps planning and daily cycles aligned with your actual day.</p><label className="mt-8 block text-sm font-medium">Timezone<select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="mt-2 w-full rounded-xl border bg-background px-4 py-3"><option value="Africa/Lagos">Africa/Lagos (Nigeria)</option><option value="UTC">UTC</option><option value="Europe/London">Europe/London</option><option value="America/New_York">America/New_York</option></select></label><div className="mt-6 rounded-2xl border p-4"><p className="font-semibold">Default planning model</p><p className="mt-1 text-sm text-muted-foreground">LifeOS will prioritize goals and actions rather than simply filling your calendar.</p></div></div>}

            {step === 5 && <div className="w-full max-w-3xl"><p className="text-sm font-semibold text-primary">AI preferences</p><h2 className="mt-2 text-3xl font-bold tracking-tight">How much should LifeOS help?</h2><div className="mt-7 rounded-2xl border p-5"><label className="flex cursor-pointer items-start gap-4"><input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} className="mt-1 h-4 w-4" /><span><span className="font-semibold">Enable LifeOS AI</span><span className="mt-1 block text-sm text-muted-foreground">Allow AI-powered planning, reflection, recommendations and future autonomous workflows.</span></span></label></div><div className="mt-5 space-y-3">{AUTONOMY.map(([value, title, description]) => <button type="button" key={value} onClick={() => setAutonomy(value)} className={`w-full rounded-2xl border p-4 text-left ${autonomy === value ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'}`}><span className="font-semibold">L{value} · {title}</span><span className="mt-1 block text-sm text-muted-foreground">{description}</span></button>)}</div><p className="mt-4 text-xs text-muted-foreground">You can increase or reduce autonomy later. High-impact actions will always have explicit safety controls.</p></div>}

            {step === 6 && <div className="m-auto max-w-xl text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Check className="h-8 w-8" /></div><p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">Ready</p><h2 className="mt-3 text-4xl font-bold tracking-tight">Your LifeOS foundation is ready.</h2><p className="mt-4 text-muted-foreground">We’ll create your selected life areas and initial goals, save your preferences, and take you to your workspace.</p>{error && <p role="alert" className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<button onClick={() => void finish()} disabled={saving || !areas.length} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? 'Creating your LifeOS…' : 'Enter LifeOS'} <ArrowRight className="h-4 w-4" /></button></div>}

            {error && step !== 6 && <p role="alert" className="mt-6 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            {step > 0 && step < 6 && <div className="mt-auto flex items-center justify-between border-t pt-6"><button type="button" onClick={back} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"><ArrowLeft className="h-4 w-4" /> Back</button><button type="button" onClick={() => { if (step === 2 && !areas.length) { setError('Select at least one life area.'); return; } if (step === 1 && !firstName.trim()) { setError('Enter your first name.'); return; } next(); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Continue <ArrowRight className="h-4 w-4" /></button></div>}
          </section>
        </div>
      </div>
    </main>
  );
}

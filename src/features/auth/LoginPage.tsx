import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    const from = (location.state as { from?: string } | null)?.from ?? '/';
    navigate(from, { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div>
          <p className="text-sm font-medium text-primary">LifeOS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue managing your life.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input className="mt-2 w-full rounded-lg border bg-background px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-ring" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input className="mt-2 w-full rounded-lg border bg-background px-3 py-2 outline-none ring-offset-background focus:ring-2 focus:ring-ring" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
        </div>

        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <button disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          New to LifeOS? <Link className="font-medium text-primary hover:underline" to="/signup">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name, full_name: name } },
    });

    setIsSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate('/', { replace: true });
    } else {
      setMessage('Account created. Check your email to verify your account, then sign in.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div>
          <p className="text-sm font-medium text-primary">LifeOS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Create your LifeOS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start building a system for intentional living.</p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Name<input className="mt-2 w-full rounded-lg border bg-background px-3 py-2 focus:ring-2 focus:ring-ring" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label className="block text-sm font-medium">Email<input className="mt-2 w-full rounded-lg border bg-background px-3 py-2 focus:ring-2 focus:ring-ring" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label className="block text-sm font-medium">Password<input className="mt-2 w-full rounded-lg border bg-background px-3 py-2 focus:ring-2 focus:ring-ring" type="password" minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        </div>

        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-primary/10 p-3 text-sm">{message}</p>}

        <button disabled={isSubmitting} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-muted-foreground">Already have an account? <Link className="font-medium text-primary hover:underline" to="/login">Sign in</Link></p>
      </form>
    </main>
  );
}

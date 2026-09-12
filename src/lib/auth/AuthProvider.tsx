import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabase/client';
import type { AuthUserContext, Profile } from './types';

const AuthContext = createContext<AuthUserContext | undefined>(undefined);

async function loadProfile(user: User): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const user = session?.user;
    if (!user) {
      setProfile(null);
      return;
    }
    setProfile(await loadProfile(user));
  }, [session?.user]);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        try { setProfile(await loadProfile(data.session.user)); }
        catch (error) { console.error('Failed to load LifeOS profile:', error); }
      }
      setIsLoading(false);
    };
    void initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        try { setProfile(await loadProfile(nextSession.user)); }
        catch (error) { console.error('Failed to load LifeOS profile:', error); setProfile(null); }
      } else setProfile(null);
      setIsLoading(false);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthUserContext>(() => ({
    profile,
    isLoading,
    isAuthenticated: Boolean(session?.user),
    refreshProfile,
  }), [profile, isLoading, session, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export interface Profile {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  onboarding_completed: boolean;
  onboarding_step: 'welcome' | 'life_areas' | 'goals' | 'preferences' | 'complete';
  ai_enabled: boolean;
  autonomy_level: number;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUserContext {
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

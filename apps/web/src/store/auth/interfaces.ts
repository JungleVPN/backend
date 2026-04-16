import type { User } from '@supabase/supabase-js';

export interface IState {
  user: User | null;
  loading: boolean;
}

export interface IActions {
  actions: {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
  };
}

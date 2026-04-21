import type { User } from '@supabase/supabase-js';
import type { GetUserByUuidResponseDto } from '@workspace/types';

export interface IState {
  /** Supabase authenticated user. */
  authUser: User | null;
  /** Remnawave panel user fetched/created after login. */
  rmnUser: GetUserByUuidResponseDto | null;
  loading: boolean;
}

export interface IActions {
  actions: {
    setAuthUser: (user: User | null) => void;
    setRmnUser: (user: GetUserByUuidResponseDto | null) => void;
    setLoading: (loading: boolean) => void;
  };
}

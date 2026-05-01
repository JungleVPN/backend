/**
 * Minimal Supabase `auth` surface used by core login pages.
 * Implemented by `apps/web` via `@supabase/supabase-js` — core stays SDK-agnostic.
 */
export interface SupabaseAuthClient {
  auth: {
    signInWithOtp: (params: {
      email: string;
      options?: { shouldCreateUser?: boolean };
    }) => Promise<{ error: { message: string } | null | undefined }>;
    verifyOtp: (params: {
      email: string;
      token: string;
      type: 'email';
    }) => Promise<{ error: unknown | null | undefined }>;
  };
}

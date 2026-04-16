import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!client) {
    client = createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return client;
}

import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

let client: SupabaseClient<Database> | undefined;

// Initialize inside callers' error boundaries, never during module evaluation.
export function getSupabaseAdmin(): SupabaseClient<Database> {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase configuration.');
  client = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(5000) }),
    },
  });
  return client;
}

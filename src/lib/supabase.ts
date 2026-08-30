import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when both Vite env vars are present — i.e. real Supabase persistence is configured. */
export const hasSupabaseConfig = Boolean(url && anonKey);

/**
 * The browser client uses the anon (publishable) key only. It is safe to ship:
 * every table has Row Level Security enabled, and a participant can only ever
 * touch their own rows (tied to their anonymous auth user). The service-role key
 * must never appear in this codebase or the built bundle.
 *
 * `persistSession: false` — the in-memory study state is not resumable across a
 * reload anyway, so each page load starts a fresh anonymous participant.
 */
export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

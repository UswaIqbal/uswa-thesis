import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Normalise the project URL to `https://<ref>.supabase.co` (scheme + host only).
 *
 * Pasted values frequently carry a trailing newline/space, a trailing slash, or a
 * path segment such as `/rest/v1`. If a path is left on, supabase-js builds auth
 * requests like `.../rest/v1/auth/v1/signup`, which Kong routes to PostgREST and
 * which fails with `PGRST125: Invalid path specified in request URL`.
 */
function normaliseSupabaseUrl(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  try {
    const { origin, pathname } = new URL(trimmed);
    if (pathname && pathname !== '/') {
      console.warn(
        `[study] VITE_SUPABASE_URL should be just "https://<ref>.supabase.co" — ` +
          `ignoring the extra path "${pathname}".`,
      );
    }
    return origin;
  } catch {
    console.error(`[study] VITE_SUPABASE_URL is not a valid URL: ${JSON.stringify(trimmed)}`);
    return undefined;
  }
}

const url = normaliseSupabaseUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

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
export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

/**
 * hCaptcha configuration.
 *
 * Only the *site key* lives in the frontend — it is public by design (it appears
 * in the rendered widget). The hCaptcha *secret key* is entered in the Supabase
 * dashboard (Authentication → Attack Protection) and is used server-side by
 * Supabase to verify the token; it must never appear in this codebase.
 *
 * When `VITE_HCAPTCHA_SITE_KEY` is unset, captcha is skipped entirely (local dev).
 * If Supabase has captcha enforcement enabled, anonymous sign-in will then fail —
 * either set the key, or use hCaptcha's test key
 * `10000000-ffff-ffff-ffff-000000000001` with the matching test secret in Supabase.
 */
const siteKey = (import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined)?.trim();

export const HCAPTCHA_SITE_KEY = siteKey ?? '';
export const captchaEnabled = Boolean(siteKey);

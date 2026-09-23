# Pebble Study

React + Vite + TypeScript implementation of the Pebble subscription-cancellation
experiment. Within-subjects design, four interface conditions (**T0, P1, P2, P3**)
in a randomized order, each followed by the same 13-item post-interface
questionnaire (instrument **`q1-13-v2`**).

## Flow

```
Study intro → Consent
  → for each of the 4 conditions (randomized order):
      Subscription & Billing → Cancel flow (T0/P1/P2/P3) → Processing → Outcome
      → 13-question questionnaire (7-point agreement scale)
      → (neutral transition between conditions)
  → Two open-ended final questions
  → "A few final quick questions" (2 items)
  → Completion (final save, then confirmation)
```

No study data is created or persisted before affirmative consent. A participant
who declines leaves no record.

### The questionnaire (`q1-13-v2`)

All 13 items use one required 7-point agreement scale: **1 = Strongly disagree …
7 = Strongly agree**. Values are stored **exactly as selected** (1–7). Nothing is
reverse-scored in the app or database — the negatively worded UMUX items (Q2, Q4)
are reverse-scored during analysis.

- **Q1–Q4** — UMUX items (Q2 and Q4 negatively worded).
- **Q5–Q13** — the project's original nine items, unchanged wording and order.

Wording lives in [`src/lib/content.tsx`](src/lib/content.tsx); change copy there,
nowhere else.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

Without `.env.local`, `npm run dev` still runs but uses an in-memory store that
**does not save anything** (a console warning is shown) — useful for UI work.

## Scripts

| Command             | What it does                                              |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Dev server                                                |
| `npm run typecheck` | `tsc -b`                                                  |
| `npm run lint`      | oxlint                                                    |
| `npm run build`     | Typecheck + production build to `dist/`                   |
| `npm run preview`   | Serve the production build                                |
| `npm run test:e2e`  | Headless full-flow smoke test (Playwright + dev store)    |

## Where things live

- [`src/lib/types.ts`](src/lib/types.ts) — the data model (`ParticipantSession`, `ConditionRun`).
- [`src/lib/content.tsx`](src/lib/content.tsx) — all participant-facing copy.
- [`src/lib/supabase.ts`](src/lib/supabase.ts) — the browser Supabase client (anon key only).
- [`src/lib/store.ts`](src/lib/store.ts) — the persistence boundary (`StudyDataStore`) and its Supabase implementation.
- [`src/state/StudyContext.tsx`](src/state/StudyContext.tsx) — the flow state machine, randomization, timing, and progress-save orchestration.
- [`src/screens/*`](src/screens/) — one component per flow screen.
- [`supabase/migrations/`](supabase/migrations/) — version-controlled schema + RLS.

## Persistence & security model

- Persistence is **Supabase**. After affirmative consent the app calls
  `signInAnonymously()`; every write is tied to that anonymous auth user.
- **Row Level Security** lets a participant create / read / update **only their
  own** rows. There is no client path that can read across participants and no
  researcher/admin page in the app.
- The frontend uses the **anon (publishable) key only**. The `service_role` key
  must never be added to this repo, `.env*`, or CI.
- Progress is saved (debounced) as the participant proceeds. If a save fails, the
  in-memory answers are kept, a banner reports the problem with a Retry action,
  and the study is **not** marked `completed` until the final save succeeds.
- **Researcher access to data is via the Supabase dashboard / SQL editor only.**

### Data model

**`study_sessions`** — one row per participant:
`id`, `auth_user_id`, `consent`, `consent_at`, `questionnaire_version`,
`condition_order` (text[4]), `open_ended_influence`, `open_ended_comparison`,
`open_ended_at`, `final_quick_1`, `final_quick_2`, `final_quick_at`,
`completed_at`, `completion_status` (`in_progress` | `completed`), timestamps.

**`interface_runs`** — one row per participant per condition (exactly 4, linked
to `study_sessions.id`):
`session_id`, `condition` (`T0`/`P1`/`P2`/`P3`), `presentation_order` (**1–4**),
`keep_or_cancel` (`keep`/`cancel`), `q1`…`q13` (smallint 1–7),
`condition_start_at`, `treatment_start_at`, `decision_at`, `survey_start_at`,
`survey_end_at`, `condition_end_at`, timestamps.
Unique `(session_id, condition)` and unique `(session_id, presentation_order)`.

## Deployment (GitHub Pages)

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys
`dist/` to GitHub Pages on push to `main`.

- Vite `base` is `/` locally and `"/<repo>/"` in CI (derived from the repo name
  via `BASE_PATH`), so the app works from `https://USER.github.io/REPO/`.
- The build reads `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
  `VITE_HCAPTCHA_SITE_KEY` from **GitHub Actions repository secrets** (see setup
  steps below). They are compiled into the static bundle — which is expected and
  safe: the anon key is protected by RLS, and the hCaptcha *site* key is public.

## Bot protection (hCaptcha)

Supabase has native hCaptcha support — **no plugin is needed** (the hCaptcha
"install via plugin" guides are for platforms like WordPress). The integration:

1. Supabase verifies tokens server-side using the hCaptcha **secret key** entered
   in the dashboard.
2. The app renders the hCaptcha checkbox on the **consent screen** (that is where
   the anonymous sign-in happens) using the **site key** from
   `VITE_HCAPTCHA_SITE_KEY`, and passes the solved token to `signInAnonymously`.

If `VITE_HCAPTCHA_SITE_KEY` is unset the checkbox is skipped — so for local dev,
either disable captcha on a dev Supabase project or use hCaptcha's test keys
(site `10000000-ffff-ffff-ffff-000000000001`, secret `0x0000000000000000000000000000000000000000`).

## One-time setup

Do these in order. Nothing here is done automatically.

### A. Supabase project

1. Create a project at <https://supabase.com/dashboard>.
2. **SQL Editor → New query** → paste the contents of
   [`supabase/migrations/20260830000000_initial_schema.sql`](supabase/migrations/20260830000000_initial_schema.sql)
   → **Run**. (Or, with the Supabase CLI: `supabase db push`.)
3. **Authentication → Sign In / Providers → Anonymous sign-ins → enable.** Keep
   email/other providers disabled — this study only needs anonymous auth.
4. **Project Settings → API** → copy the **Project URL** and the **anon /
   publishable** key. Do **not** copy the `service_role` key anywhere.

### A2. hCaptcha (bot protection)

1. In the hCaptcha dashboard, note your **site key** and **secret key** (you
   already have these).
2. Supabase → **Authentication → Attack Protection** (a.k.a. "Bot and Abuse
   Protection") → **Enable Captcha protection** → provider **hCaptcha** → paste
   the **hCaptcha secret key** → **Save**.
3. Add the site key to `.env.local` and to GitHub Actions secrets (below).

### B. Local `.env.local`

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLISHABLE_KEY
VITE_HCAPTCHA_SITE_KEY=YOUR_HCAPTCHA_SITE_KEY
```

Run `npm run dev`, complete the flow once (solve the checkbox on the consent
screen), and confirm rows appear in **Table Editor → study_sessions /
interface_runs**.

### C. GitHub repository

```bash
cd uswa-ai-study
git init
git add .
git commit -m "Pebble study: revised flow, questionnaire, Supabase persistence"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

### D. GitHub Actions secrets

Repo **Settings → Secrets and variables → Actions → New repository secret**, add:

| Secret name                | Value                              |
| -------------------------- | ---------------------------------- |
| `VITE_SUPABASE_URL`        | your Supabase Project URL          |
| `VITE_SUPABASE_ANON_KEY`   | your Supabase anon/publishable key |
| `VITE_HCAPTCHA_SITE_KEY`   | your hCaptcha **site** key         |

### E. Enable Pages

Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Push to `main` (or re-run the workflow). The site publishes at
`https://USERNAME.github.io/REPOSITORY/`.

### F. Supabase redirect / URL allow-list

**Authentication → URL Configuration** → add your Pages URL
(`https://USERNAME.github.io/REPOSITORY/`) to **Site URL** / **Redirect URLs** so
anonymous auth is accepted from the deployed origin.

### G. hCaptcha hostname allow-list

If your hCaptcha site key restricts hostnames, add `USERNAME.github.io` (and
`localhost` for dev) in the hCaptcha dashboard so the widget loads on the
deployed site.

## Analysis notes

- Filter to `study_sessions.completion_status = 'completed'`.
- Join `interface_runs` on `session_id`; `presentation_order` (1–4) gives the
  order each condition was shown.
- Reverse-score UMUX **Q2** and **Q4** (`8 - value`) before computing UMUX scores.

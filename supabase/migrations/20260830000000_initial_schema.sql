-- Uswa-AI subscription-cancellation study — initial schema
-- Within-subjects design: 4 interface conditions (T0/P1/P2/P3), each followed by
-- the same 13-item post-interface questionnaire (instrument version q1-13-v2).
--
-- Data model:
--   study_sessions  — one row per participant (anonymous)
--   interface_runs  — one row per participant per condition (exactly 4)
--
-- Security model:
--   * Participants authenticate with Supabase ANONYMOUS sign-in (after consent).
--   * RLS restricts every participant to their own rows only.
--   * No role can read across participants from the client. Researchers use the
--     Supabase dashboard / SQL editor (service context) for analysis.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- study_sessions
-- ---------------------------------------------------------------------------
create table public.study_sessions (
  id                     uuid primary key default gen_random_uuid(),
  -- The anonymous auth user this session belongs to. Set server-side on insert.
  auth_user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,

  consent                boolean not null,
  consent_at             timestamptz not null,
  questionnaire_version  text not null,
  -- Assigned condition order, e.g. '{T0,P1,P2,P3}'. Never reshuffled.
  condition_order        text[] not null,

  -- Two open-ended final responses (optional, free text).
  open_ended_influence   text,
  open_ended_comparison  text,
  open_ended_at          timestamptz,

  -- "A few final quick questions" — asked at the very end.
  final_quick_1          text check (final_quick_1 in ('yes', 'no', 'unsure')),
  final_quick_2          text check (final_quick_2 in ('never', 'used_one', 'used_few', 'use_one', 'use_several')),
  final_quick_at         timestamptz,

  completed_at           timestamptz,
  completion_status      text not null default 'in_progress'
                           check (completion_status in ('in_progress', 'completed')),

  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- One study session per anonymous user.
  constraint study_sessions_one_per_user unique (auth_user_id),
  constraint study_sessions_consent_true check (consent is true),
  constraint study_sessions_condition_order_len check (array_length(condition_order, 1) = 4)
);

create index study_sessions_auth_user_id_idx on public.study_sessions (auth_user_id);

create trigger study_sessions_set_updated_at
  before update on public.study_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- interface_runs  (one per participant per condition)
-- ---------------------------------------------------------------------------
create table public.interface_runs (
  id                   uuid primary key default gen_random_uuid(),
  session_id           uuid not null references public.study_sessions (id) on delete cascade,
  auth_user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,

  condition            text not null check (condition in ('T0', 'P1', 'P2', 'P3')),
  presentation_order   smallint not null check (presentation_order between 1 and 4),

  -- Final Keep/Cancel decision for this condition.
  keep_or_cancel       text check (keep_or_cancel in ('keep', 'cancel')),

  -- Q1–Q13 responses, stored exactly as selected on the 7-point agreement scale
  -- (1 = Strongly disagree … 7 = Strongly agree). Not reverse-scored here.
  q1  smallint check (q1  between 1 and 7),
  q2  smallint check (q2  between 1 and 7),
  q3  smallint check (q3  between 1 and 7),
  q4  smallint check (q4  between 1 and 7),
  q5  smallint check (q5  between 1 and 7),
  q6  smallint check (q6  between 1 and 7),
  q7  smallint check (q7  between 1 and 7),
  q8  smallint check (q8  between 1 and 7),
  q9  smallint check (q9  between 1 and 7),
  q10 smallint check (q10 between 1 and 7),
  q11 smallint check (q11 between 1 and 7),
  q12 smallint check (q12 between 1 and 7),
  q13 smallint check (q13 between 1 and 7),

  -- Timing instrumentation (kept where practical).
  condition_start_at   timestamptz,
  treatment_start_at   timestamptz,
  decision_at          timestamptz,
  survey_start_at      timestamptz,
  survey_end_at        timestamptz,
  condition_end_at     timestamptz,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- At most one run per condition and one run per presentation order per participant.
  constraint interface_runs_unique_condition unique (session_id, condition),
  constraint interface_runs_unique_order unique (session_id, presentation_order)
);

create index interface_runs_session_id_idx on public.interface_runs (session_id);
create index interface_runs_auth_user_id_idx on public.interface_runs (auth_user_id);

create trigger interface_runs_set_updated_at
  before update on public.interface_runs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.study_sessions enable row level security;
alter table public.interface_runs enable row level security;

-- study_sessions: a participant may create, read, and update only their own row.
create policy study_sessions_select_own
  on public.study_sessions for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy study_sessions_insert_own
  on public.study_sessions for insert
  to authenticated
  with check (auth_user_id = auth.uid());

create policy study_sessions_update_own
  on public.study_sessions for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- No delete policy: participants cannot delete study data.

-- interface_runs: same, and the parent session must also belong to the caller.
create policy interface_runs_select_own
  on public.interface_runs for select
  to authenticated
  using (auth_user_id = auth.uid());

create policy interface_runs_insert_own
  on public.interface_runs for insert
  to authenticated
  with check (
    auth_user_id = auth.uid()
    and exists (
      select 1 from public.study_sessions s
      where s.id = session_id and s.auth_user_id = auth.uid()
    )
  );

create policy interface_runs_update_own
  on public.interface_runs for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (
    auth_user_id = auth.uid()
    and exists (
      select 1 from public.study_sessions s
      where s.id = session_id and s.auth_user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Privileges (RLS still applies on top of these).
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update on public.study_sessions to authenticated;
grant select, insert, update on public.interface_runs to authenticated;

import type { ConditionRun, KeepCancelDecision, ParticipantSession } from './types';
import { hasSupabaseConfig, supabase } from './supabase';

/**
 * Persistence boundary for study data. The study flow only ever talks to this
 * interface, never to Supabase directly.
 *
 * Contract:
 * - No method is called before affirmative consent — no research record exists
 *   for a visitor who has not consented or who declined.
 * - `beginPersistence` establishes an anonymous auth session; every subsequent
 *   write is scoped by Row Level Security to that anonymous user's own rows.
 * - Writes reject (throw) on failure. Callers keep their in-memory state, surface
 *   the problem, and never mark the study completed until the final write resolves.
 */
export interface StudyDataStore {
  /**
   * Sign in anonymously. Must resolve before any save. Safe to call more than once.
   * `captchaToken` is a single-use hCaptcha token, required when Supabase has
   * captcha enforcement enabled.
   */
  beginPersistence(captchaToken?: string): Promise<void>;
  /** Create/update the participant (study session) row. */
  saveSession(session: ParticipantSession): Promise<void>;
  /** Create/update one interface-run row, linked to the participant row. */
  saveConditionRun(sessionId: string, run: ConditionRun): Promise<void>;
}

function keepCancel(run: ConditionRun): KeepCancelDecision | null {
  if (run.selectedOption === 'cancel_subscription') return 'cancel';
  if (run.selectedOption === 'keep_subscription') return 'keep';
  return null;
}

function sessionRow(s: ParticipantSession) {
  return {
    id: s.sessionId,
    consent: s.consent === 'agree',
    consent_at: s.consentAt,
    questionnaire_version: s.questionnaireVersion,
    condition_order: s.conditionOrder,
    open_ended_influence: s.openEndedInfluence || null,
    open_ended_comparison: s.openEndedComparison || null,
    open_ended_at: s.openEndedAt,
    final_quick_1: s.finalQuick1,
    final_quick_2: s.finalQuick2,
    final_quick_at: s.finalQuickAt,
    completed_at: s.completedAt,
    completion_status: s.studyCompletionStatus,
  };
}

function conditionRunRow(sessionId: string, run: ConditionRun) {
  const a = run.surveyAnswers;
  return {
    session_id: sessionId,
    condition: run.conditionId,
    presentation_order: run.orderPosition + 1, // stored 1–4
    keep_or_cancel: keepCancel(run),
    q1: a.q01 ?? null,
    q2: a.q02 ?? null,
    q3: a.q03 ?? null,
    q4: a.q04 ?? null,
    q5: a.q05 ?? null,
    q6: a.q06 ?? null,
    q7: a.q07 ?? null,
    q8: a.q08 ?? null,
    q9: a.q09 ?? null,
    q10: a.q10 ?? null,
    q11: a.q11 ?? null,
    q12: a.q12 ?? null,
    q13: a.q13 ?? null,
    condition_start_at: run.conditionStartAt,
    treatment_start_at: run.treatmentStartAt,
    decision_at: run.decisionAt,
    survey_start_at: run.surveyStartAt,
    survey_end_at: run.surveyEndAt,
    condition_end_at: run.conditionEndAt,
  };
}

class SupabaseStore implements StudyDataStore {
  private inflight: Promise<void> | null = null;

  beginPersistence(captchaToken?: string): Promise<void> {
    if (!supabase) return Promise.reject(new Error('Supabase is not configured.'));
    if (this.inflight) return this.inflight;
    const client = supabase;
    const attempt = (async () => {
      const existing = await client.auth.getSession();
      if (existing.data.session) return;
      const { error } = await client.auth.signInAnonymously(
        captchaToken ? { options: { captchaToken } } : undefined,
      );
      if (error) {
        // Surface the real GoTrue error (status + code + message) for diagnosis.
        console.error('[study] anonymous sign-in failed', {
          status: error.status,
          code: error.code,
          message: error.message,
          captchaTokenPresent: Boolean(captchaToken),
        });
        throw new Error(`Could not start a secure session: ${error.message}`);
      }
    })();
    // On any failure, clear the in-flight promise so a later call can retry with
    // a fresh captcha token.
    this.inflight = attempt.catch((e) => {
      this.inflight = null;
      throw e;
    });
    return this.inflight;
  }

  async saveSession(session: ParticipantSession): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase.from('study_sessions').upsert(sessionRow(session), { onConflict: 'id' });
    if (error) throw new Error(error.message);
  }

  async saveConditionRun(sessionId: string, run: ConditionRun): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { error } = await supabase
      .from('interface_runs')
      .upsert(conditionRunRow(sessionId, run), { onConflict: 'session_id,condition' });
    if (error) throw new Error(error.message);
  }
}

/**
 * Dev-only fallback so `npm run dev` and UI smoke tests work without a Supabase
 * project. Never used in a production build with the env vars set. Data is not
 * persisted anywhere — it only logs.
 */
class InMemoryStore implements StudyDataStore {
  async beginPersistence(): Promise<void> {
    console.warn('[study] VITE_SUPABASE_* not set — using in-memory store. Responses will NOT be saved.');
  }
  async saveSession(session: ParticipantSession): Promise<void> {
    console.info('[study] (dev) saveSession', sessionRow(session));
  }
  async saveConditionRun(sessionId: string, run: ConditionRun): Promise<void> {
    console.info('[study] (dev) saveConditionRun', conditionRunRow(sessionId, run));
  }
}

export const studyDataStore: StudyDataStore =
  hasSupabaseConfig || import.meta.env.PROD ? new SupabaseStore() : new InMemoryStore();

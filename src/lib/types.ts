export type ConditionId = 'T0' | 'P1' | 'P2' | 'P3';

export type SelectedOption = 'cancel_subscription' | 'keep_subscription';

/** Final Keep/Cancel decision as stored for analysis. */
export type KeepCancelDecision = 'keep' | 'cancel';

/**
 * Post-interface questionnaire item ids. Q1–Q4 are the UMUX items; Q5–Q13 are the
 * project's original nine items, kept in their existing wording and relative order.
 */
export type QuestionId =
  | 'q01'
  | 'q02'
  | 'q03'
  | 'q04'
  | 'q05'
  | 'q06'
  | 'q07'
  | 'q08'
  | 'q09'
  | 'q10'
  | 'q11'
  | 'q12'
  | 'q13';

/** 7-point agreement scale: 1 = Strongly disagree … 7 = Strongly agree. Stored verbatim, never reverse-scored in the app. */
export type LikertScore = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** One condition's full instrumentation record — created fresh per condition per the independent-scenario invariant. */
export interface ConditionRun {
  conditionId: ConditionId;
  /** 0-indexed position in the participant's assigned order. Persisted as 1–4 (`presentation_order`). */
  orderPosition: number;
  conditionStartAt: string | null;
  /** Timestamp of the `cancel_subscription` activation — the experimental treatment start. */
  treatmentStartAt: string | null;
  selectedOption: SelectedOption | null;
  /** Timestamp the final decision action was activated (before the processing screen renders). */
  decisionAt: string | null;
  surveyStartAt: string | null;
  surveyAnswers: Partial<Record<QuestionId, LikertScore>>;
  surveyEndAt: string | null;
  conditionEndAt: string | null;
}

export type ConsentChoice = 'agree' | 'decline';

/** "Have you ever canceled a subscription for an online service?" */
export type FinalQuick1Answer = 'yes' | 'no' | 'unsure';
/** "How familiar are you with online services that require a subscription?" */
export type FinalQuick2Answer = 'never' | 'used_one' | 'used_few' | 'use_one' | 'use_several';

/** Revised instrument: UMUX Q1–Q4 + original nine as Q5–Q13, all on a 7-point agreement scale. */
export const QUESTIONNAIRE_VERSION = 'q1-13-v2';

export interface ParticipantSession {
  sessionId: string;
  createdAt: string;
  consent: ConsentChoice | null;
  consentAt: string | null;
  /** Assigned once at study start; a permutation of T0/P1/P2/P3, never reshuffled. */
  conditionOrder: ConditionId[];
  conditionRuns: ConditionRun[];
  questionnaireVersion: string;
  /** Open-ended: influence of how options/information were presented on the decision. */
  openEndedInfluence: string;
  /** Open-ended: cross-version reflection on what made the decision easy/hard/clear/confusing/uncomfortable. */
  openEndedComparison: string;
  openEndedAt: string | null;
  /** "A few final quick questions" — asked at the end, after the open-ended questions. */
  finalQuick1: FinalQuick1Answer | null;
  finalQuick2: FinalQuick2Answer | null;
  finalQuickAt: string | null;
  completedAt: string | null;
  studyCompletionStatus: 'in_progress' | 'completed';
}

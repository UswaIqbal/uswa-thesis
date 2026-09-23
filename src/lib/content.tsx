import type { FinalQuick1Answer, FinalQuick2Answer, QuestionId } from './types';

/**
 * Participant-facing copy. Q5–Q13 wording, order, and anchors are sourced verbatim
 * from 08_STUDY-SYSTEM-SPEC.md and must be identical across all four condition
 * administrations. Q1–Q4 are the standard UMUX items, added for the revised
 * instrument (`q1-13-v2`). Do not paraphrase or reorder.
 */

export interface PostConditionQuestion {
  id: QuestionId;
  text: string;
}

export const POST_CONDITION_QUESTIONS: PostConditionQuestion[] = [
  // Q1–Q4 — UMUX (exact wording, exact order). Items 2 and 4 are negatively worded;
  // values are stored 1–7 as selected and reverse-scored only during analysis.
  { id: 'q01', text: "The system's capabilities meet my requirements." },
  { id: 'q02', text: 'Using the system is a frustrating experience.' },
  { id: 'q03', text: 'The system is easy to use.' },
  { id: 'q04', text: 'I have to spend too much time correcting things with the system.' },
  // Q5–Q13 — the project's original nine items, unchanged wording and relative order.
  { id: 'q05', text: 'I could decide between keeping and cancelling my subscription without difficulty.' },
  { id: 'q06', text: 'I clearly understood what would happen if I kept or cancelled my subscription.' },
  {
    id: 'q07',
    text: 'The information presented on the interface was sufficient for me to decide whether to keep or cancel my subscription.',
  },
  { id: 'q08', text: 'The interface made it easy for me to identify and select the option I wanted.' },
  { id: 'q09', text: 'I felt that the final decision was my own.' },
  { id: 'q10', text: 'The subscription cancellation interface supported me well in making my decision.' },
  { id: 'q11', text: 'The way the subscription options were presented affected which option I chose.' },
  { id: 'q12', text: 'I felt that the interface tried to push me toward a particular decision.' },
  { id: 'q13', text: 'I was confident that the option I chose was the right choice for me.' },
];

/** 7-point agreement scale shared by all 13 items. */
export const LIKERT_SCORES: readonly (1 | 2 | 3 | 4 | 5 | 6 | 7)[] = [1, 2, 3, 4, 5, 6, 7];

export const LIKERT_ANCHORS = {
  low: 'Strongly disagree',
  high: 'Strongly agree',
} as const;

export const CONSENT_OPTIONS: { id: string; value: 'agree' | 'decline'; label: string }[] = [
  {
    id: 'consent_agree',
    value: 'agree',
    label: 'I have read the study information and agree to participate.',
  },
  { id: 'consent_decline', value: 'decline', label: 'I do not agree to participate.' },
];

export const FINAL_QUICK_1_OPTIONS: { value: FinalQuick1Answer; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'I am not sure' },
];

export const FINAL_QUICK_2_OPTIONS: { value: FinalQuick2Answer; label: string }[] = [
  { value: 'never', label: 'I have never used one' },
  { value: 'used_one', label: 'I have used one before' },
  { value: 'used_few', label: 'I have used a few' },
  { value: 'use_one', label: 'I currently use one' },
  { value: 'use_several', label: 'I currently use several' },
];

export const FINAL_QUICK_HEADING = 'A few final quick questions';

export const STUDY_INTRO_PARAGRAPHS = [
  'You are subscribed to a hypothetical AI chatbot called Uswa-AI. You currently have the Uswa-AI Pro subscription. Imagine that over the past few months you have mostly used it for occasional, simple questions, and you haven\'t really made use of most of the Pro features. Lately you have started wondering whether the subscription is worth its monthly price for the way you actually use it.',
  'You are now reviewing your subscription and deciding whether you want to keep it or cancel it. Please make the choice you would naturally make in this situation.',
  'You will go through four different versions of the subscription management process. The content and design may differ between versions.',
];

export const STUDY_INTRO_TASK_LIST = [
  'Review and interact with the interface.',
  'Decide whether you would keep or cancel your subscription.',
  'Complete a short survey about your experience.',
];

export const STUDY_INTRO_CLOSING =
  'Please respond based on what you would genuinely choose and how you experienced the interface.';

export const CONSENT_INTRO = 'Before you begin, please confirm whether you agree to take part in this study.';

export const TRANSITION_BODY =
  'You will now see another version of the subscription-management process. Please treat it as a new, independent scenario in which your Uswa-AI Pro subscription is active.';

export const OPEN_ENDED_INFLUENCE_PROMPT =
  'Was there anything about the way the subscription options or information were presented that influenced your decision? Please explain.';
export const OPEN_ENDED_COMPARISON_PROMPT =
  'Across the different versions you experienced, was there anything that made the subscription decision particularly easy, difficult, clear, confusing, or uncomfortable? Please explain.';

export const COMPLETION_BODY = [
  'Thank you for participating in this study.',
  'You have completed all parts of the experiment.',
  'Your responses have been recorded for research purposes.',
];

// --- Shared subscription facts (identical pre-treatment across T0/P1/P2/P3) ---
export const PLAN_NAME = 'Uswa-AI Pro';
export const PLAN_PRICE = '$21.99';
export const RENEWAL_DATE = 'October 5, 2026';

export const TREATMENT_HEADING = 'Cancel your subscription';
export const TREATMENT_INTRO =
  "You're about to cancel your Uswa-AI Pro subscription. Review what happens, then confirm.";

export const CANCELLATION_CONSEQUENCES = [
  <>Your subscription stays active until the end of your current billing period — <strong>{RENEWAL_DATE}</strong>.</>,
  "You'll keep access to Pro features until then. After that, your account moves to the free plan.",
  'Your chats and account data remain available in your account.',
  "You won't be refunded for the remaining time in this billing period.",
  'You can resubscribe at any time.',
];

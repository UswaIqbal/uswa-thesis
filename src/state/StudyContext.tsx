import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  ConditionId,
  ConditionRun,
  ConsentChoice,
  FinalQuick1Answer,
  FinalQuick2Answer,
  LikertScore,
  ParticipantSession,
  QuestionId,
  SelectedOption,
} from '../lib/types';
import { QUESTIONNAIRE_VERSION } from '../lib/types';
import { randomizedConditionOrder } from '../lib/randomize';
import { studyDataStore } from '../lib/store';
import { newId } from '../lib/uuid';
import { POST_CONDITION_QUESTIONS } from '../lib/content';

export type Screen =
  | 'intro'
  | 'consent'
  | 'declined'
  | 'settings'
  | 'treatment'
  | 'processing'
  | 'outcome'
  | 'survey'
  | 'transition'
  | 'final_open'
  | 'final_quick'
  | 'completion';

const PROCESSING_DURATION_MS = 650;
const PERSIST_DEBOUNCE_MS = 400;

function emptyConditionRun(conditionId: ConditionId, orderPosition: number): ConditionRun {
  return {
    conditionId,
    orderPosition,
    conditionStartAt: null,
    treatmentStartAt: null,
    selectedOption: null,
    decisionAt: null,
    surveyStartAt: null,
    surveyAnswers: {},
    surveyEndAt: null,
    conditionEndAt: null,
  };
}

function newSession(): ParticipantSession {
  return {
    sessionId: newId(),
    createdAt: new Date().toISOString(),
    consent: null,
    consentAt: null,
    conditionOrder: [],
    conditionRuns: [],
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    openEndedInfluence: '',
    openEndedComparison: '',
    openEndedAt: null,
    finalQuick1: null,
    finalQuick2: null,
    finalQuickAt: null,
    completedAt: null,
    studyCompletionStatus: 'in_progress',
  };
}

interface StudyState {
  session: ParticipantSession;
  screen: Screen;
  conditionIndex: number;
  pendingDecision: 'cancel' | 'keep' | null;
  pendingSurveyAnswers: Partial<Record<QuestionId, LikertScore>>;
  surveyValidationTouched: boolean;
  finalQuickValidationTouched: boolean;
}

function initialState(): StudyState {
  return {
    session: newSession(),
    screen: 'intro',
    conditionIndex: 0,
    pendingDecision: null,
    pendingSurveyAnswers: {},
    surveyValidationTouched: false,
    finalQuickValidationTouched: false,
  };
}

function errText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

interface StudyApi {
  screen: Screen;
  session: ParticipantSession;
  currentCondition: ConditionId;
  conditionIndex: number;
  progressLabel: string | null;

  /** Non-null when the most recent persistence attempt failed. In-memory state is intact. */
  persistError: string | null;
  /** True while the final completion save is in flight. */
  savingCompletion: boolean;
  retrySave(): void;

  /** hCaptcha token for the post-consent anonymous sign-in (null until solved / after use). */
  captchaToken: string | null;
  setCaptchaToken(token: string | null): void;
  /** Bump-on-failure key: remount the hCaptcha widget so the participant gets a fresh challenge. */
  captchaNonce: number;
  /** True while the post-consent anonymous sign-in is in flight. */
  startingSession: boolean;

  beginStudy(): void;
  chooseConsent(choice: ConsentChoice): void;
  continueFromConsent(): void;
  goToCancelScreen(): void;
  activateDecision(kind: 'cancel' | 'keep'): void;
  continueToSurvey(): void;
  setSurveyAnswer(qid: QuestionId, score: LikertScore): void;
  pendingSurveyAnswers: Partial<Record<QuestionId, LikertScore>>;
  surveyValidationTouched: boolean;
  submitSurvey(): void;
  continueTransition(): void;
  setOpenEndedInfluence(value: string): void;
  setOpenEndedComparison(value: string): void;
  continueFromFinalOpen(): void;
  setFinalQuick1(value: FinalQuick1Answer): void;
  setFinalQuick2(value: FinalQuick2Answer): void;
  finalQuickValidationTouched: boolean;
  continueFromFinalQuick(): void;
  finishStudy(): void;
  currentOutcome: 'cancelled' | 'retained_standard' | 'retained_discount' | null;
}

const StudyReactContext = createContext<StudyApi | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StudyState>(initialState);
  const [authReady, setAuthReady] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [startingSession, setStartingSession] = useState(false);

  const persistTimer = useRef<number | null>(null);
  const sessionRef = useRef(state.session);
  useEffect(() => {
    sessionRef.current = state.session;
  }, [state.session]);

  const flush = useCallback(async (session: ParticipantSession) => {
    if (session.consent !== 'agree') return;
    await studyDataStore.saveSession(session);
    for (const run of session.conditionRuns) {
      await studyDataStore.saveConditionRun(session.sessionId, run);
    }
  }, []);

  // Debounced progress save. Never runs before affirmative consent and an
  // established anonymous auth session. A failure surfaces via `persistError`
  // and leaves in-memory state untouched.
  useEffect(() => {
    if (state.session.consent !== 'agree' || !authReady) return;
    if (persistTimer.current) window.clearTimeout(persistTimer.current);
    persistTimer.current = window.setTimeout(() => {
      flush(state.session)
        .then(() => setPersistError(null))
        .catch((e) => setPersistError(errText(e)));
    }, PERSIST_DEBOUNCE_MS);
    return () => {
      if (persistTimer.current) window.clearTimeout(persistTimer.current);
    };
  }, [state.session, authReady, flush]);

  const captchaTokenRef = useRef<string | null>(null);
  useEffect(() => {
    captchaTokenRef.current = captchaToken;
  }, [captchaToken]);

  const beginPersistence = useCallback((): Promise<void> => {
    return studyDataStore.beginPersistence(captchaTokenRef.current ?? undefined).then(
      () => {
        setAuthReady(true);
        setPersistError(null);
      },
      (e) => {
        // The token is single-use — drop it and remount the widget for a retry.
        setCaptchaToken(null);
        setCaptchaNonce((n) => n + 1);
        setPersistError(errText(e));
        throw e;
      },
    );
  }, []);

  const retrySave = useCallback(() => {
    if (!authReady) {
      beginPersistence().catch(() => {});
      return;
    }
    flush(sessionRef.current)
      .then(() => setPersistError(null))
      .catch((e) => setPersistError(errText(e)));
  }, [authReady, beginPersistence, flush]);

  const currentCondition = state.session.conditionOrder[state.conditionIndex] ?? 'T0';

  const updateCurrentRun = useCallback((patch: Partial<ConditionRun>) => {
    setState((prev) => {
      const runs = prev.session.conditionRuns.map((run, i) =>
        i === prev.conditionIndex ? { ...run, ...patch } : run,
      );
      return { ...prev, session: { ...prev.session, conditionRuns: runs } };
    });
  }, []);

  const beginStudy = useCallback(() => {
    setState((prev) => ({ ...prev, screen: 'consent' }));
  }, []);

  const chooseConsent = useCallback((choice: ConsentChoice) => {
    if (choice === 'decline') setCaptchaToken(null);
    setState((prev) => ({ ...prev, session: { ...prev.session, consent: choice } }));
  }, []);

  const continueFromConsent = useCallback(async () => {
    const choice = sessionRef.current.consent;
    if (choice === 'decline') {
      // No research record is created for a declined visit.
      setState((prev) => ({ ...prev, screen: 'declined' }));
      return;
    }
    if (choice !== 'agree' || startingSession) return;

    // Establish the anonymous auth session before creating any record. Block here
    // so the single-use hCaptcha token is spent immediately after it is solved,
    // and a failure keeps the participant on the consent screen to try again.
    setStartingSession(true);
    try {
      await beginPersistence();
    } catch {
      setStartingSession(false);
      return;
    }
    setStartingSession(false);

    const now = new Date().toISOString();
    const order = randomizedConditionOrder();
    const runs = order.map((c, i) => emptyConditionRun(c, i));
    runs[0] = { ...runs[0], conditionStartAt: now };
    setState((prev) => ({
      ...prev,
      screen: 'settings',
      session: { ...prev.session, consentAt: now, conditionOrder: order, conditionRuns: runs },
    }));
  }, [beginPersistence, startingSession]);

  const goToCancelScreen = useCallback(() => {
    const now = new Date().toISOString();
    updateCurrentRun({ treatmentStartAt: now });
    setState((prev) => ({ ...prev, screen: 'treatment' }));
  }, [updateCurrentRun]);

  const activateDecision = useCallback(
    (kind: 'cancel' | 'keep') => {
      const now = new Date().toISOString();
      const selectedOption: SelectedOption =
        kind === 'cancel' ? 'cancel_subscription' : 'keep_subscription';
      updateCurrentRun({ selectedOption, decisionAt: now });
      setState((prev) => ({ ...prev, screen: 'processing', pendingDecision: kind }));
      window.setTimeout(() => {
        setState((prev) => (prev.screen === 'processing' ? { ...prev, screen: 'outcome' } : prev));
      }, PROCESSING_DURATION_MS);
    },
    [updateCurrentRun],
  );

  const continueToSurvey = useCallback(() => {
    const now = new Date().toISOString();
    updateCurrentRun({ surveyStartAt: now });
    setState((prev) => ({
      ...prev,
      screen: 'survey',
      pendingSurveyAnswers: {},
      surveyValidationTouched: false,
    }));
  }, [updateCurrentRun]);

  const setSurveyAnswer = useCallback((qid: QuestionId, score: LikertScore) => {
    setState((prev) => ({
      ...prev,
      pendingSurveyAnswers: { ...prev.pendingSurveyAnswers, [qid]: score },
    }));
  }, []);

  const submitSurvey = useCallback(() => {
    setState((prev) => {
      const allAnswered = POST_CONDITION_QUESTIONS.every((q) => prev.pendingSurveyAnswers[q.id]);
      if (!allAnswered) {
        return { ...prev, surveyValidationTouched: true };
      }
      const now = new Date().toISOString();
      const runs = prev.session.conditionRuns.map((run, i) =>
        i === prev.conditionIndex
          ? { ...run, surveyAnswers: prev.pendingSurveyAnswers, surveyEndAt: now, conditionEndAt: now }
          : run,
      );
      const isLast = prev.conditionIndex >= 3;
      return {
        ...prev,
        session: { ...prev.session, conditionRuns: runs },
        screen: isLast ? 'final_open' : 'transition',
      };
    });
  }, []);

  const continueTransition = useCallback(() => {
    setState((prev) => {
      const nextIndex = prev.conditionIndex + 1;
      const now = new Date().toISOString();
      const runs = prev.session.conditionRuns.map((run, i) =>
        i === nextIndex ? { ...run, conditionStartAt: now } : run,
      );
      return {
        ...prev,
        screen: 'settings',
        conditionIndex: nextIndex,
        pendingDecision: null,
        session: { ...prev.session, conditionRuns: runs },
      };
    });
  }, []);

  const setOpenEndedInfluence = useCallback((value: string) => {
    setState((prev) => ({ ...prev, session: { ...prev.session, openEndedInfluence: value } }));
  }, []);
  const setOpenEndedComparison = useCallback((value: string) => {
    setState((prev) => ({ ...prev, session: { ...prev.session, openEndedComparison: value } }));
  }, []);

  const continueFromFinalOpen = useCallback(() => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      screen: 'final_quick',
      session: { ...prev.session, openEndedAt: now },
    }));
  }, []);

  const setFinalQuick1 = useCallback((value: FinalQuick1Answer) => {
    setState((prev) => ({ ...prev, session: { ...prev.session, finalQuick1: value } }));
  }, []);
  const setFinalQuick2 = useCallback((value: FinalQuick2Answer) => {
    setState((prev) => ({ ...prev, session: { ...prev.session, finalQuick2: value } }));
  }, []);

  const continueFromFinalQuick = useCallback(() => {
    setState((prev) => {
      if (!prev.session.finalQuick1 || !prev.session.finalQuick2) {
        return { ...prev, finalQuickValidationTouched: true };
      }
      const now = new Date().toISOString();
      return {
        ...prev,
        screen: 'completion',
        session: { ...prev.session, finalQuickAt: now },
      };
    });
  }, []);

  const finishStudy = useCallback(async () => {
    setSavingCompletion(true);
    const now = new Date().toISOString();
    const completed: ParticipantSession = {
      ...sessionRef.current,
      completedAt: now,
      studyCompletionStatus: 'completed',
    };
    try {
      if (!authReady) await beginPersistence();
      await flush(completed);
      setState((prev) => ({
        ...prev,
        session: { ...prev.session, completedAt: now, studyCompletionStatus: 'completed' },
      }));
      setPersistError(null);
    } catch (e) {
      setPersistError(errText(e));
    } finally {
      setSavingCompletion(false);
    }
  }, [authReady, beginPersistence, flush]);

  const progressLabel = useMemo(() => {
    const hasOrder = state.session.conditionOrder.length > 0;
    if (!hasOrder) return null;
    if (state.screen === 'completion') return null;
    if (state.screen === 'final_open' || state.screen === 'final_quick') return 'Final questions';
    if (state.screen === 'transition') return `Interface ${Math.min(state.conditionIndex + 2, 4)} of 4`;
    if (['settings', 'treatment', 'processing', 'outcome', 'survey'].includes(state.screen)) {
      return `Interface ${state.conditionIndex + 1} of 4`;
    }
    return null;
  }, [state.screen, state.conditionIndex, state.session.conditionOrder.length]);

  const currentOutcome = useMemo((): StudyApi['currentOutcome'] => {
    if (state.screen !== 'outcome') return null;
    if (state.pendingDecision === 'cancel') return 'cancelled';
    if (state.pendingDecision === 'keep') {
      return currentCondition === 'P2' ? 'retained_discount' : 'retained_standard';
    }
    return null;
  }, [state.screen, state.pendingDecision, currentCondition]);

  const api: StudyApi = {
    screen: state.screen,
    session: state.session,
    currentCondition,
    conditionIndex: state.conditionIndex,
    progressLabel,
    persistError,
    savingCompletion,
    retrySave,
    captchaToken,
    setCaptchaToken,
    captchaNonce,
    startingSession,
    beginStudy,
    chooseConsent,
    continueFromConsent,
    goToCancelScreen,
    activateDecision,
    continueToSurvey,
    setSurveyAnswer,
    pendingSurveyAnswers: state.pendingSurveyAnswers,
    surveyValidationTouched: state.surveyValidationTouched,
    submitSurvey,
    continueTransition,
    setOpenEndedInfluence,
    setOpenEndedComparison,
    continueFromFinalOpen,
    setFinalQuick1,
    setFinalQuick2,
    finalQuickValidationTouched: state.finalQuickValidationTouched,
    continueFromFinalQuick,
    finishStudy,
    currentOutcome,
  };

  return <StudyReactContext.Provider value={api}>{children}</StudyReactContext.Provider>;
}

export function useStudy(): StudyApi {
  const ctx = useContext(StudyReactContext);
  if (!ctx) throw new Error('useStudy must be used within StudyProvider');
  return ctx;
}

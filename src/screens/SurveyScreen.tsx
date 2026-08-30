import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { LIKERT_ANCHORS, LIKERT_SCORES, POST_CONDITION_QUESTIONS } from '../lib/content';

export function SurveyScreen() {
  const { pendingSurveyAnswers, surveyValidationTouched, setSurveyAnswer, submitSurvey, conditionIndex } =
    useStudy();
  const conditionIsLast = conditionIndex >= 3;

  return (
    <div data-screen-id="post_condition_questionnaire">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        About the interface you just used
      </h1>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 28px' }}>
        Please respond to every statement based on the version you just experienced.
        <br />
        1 = {LIKERT_ANCHORS.low}, 7 = {LIKERT_ANCHORS.high}.
      </p>

      {POST_CONDITION_QUESTIONS.map((q, i) => {
        const selected = pendingSurveyAnswers[q.id] ?? null;
        const error = surveyValidationTouched && !selected;
        return (
          <div key={q.id} style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              {i + 1}. {q.text}
            </div>
            <div
              role="radiogroup"
              aria-label={`${i + 1}. ${q.text}`}
              className={`likert-group${error ? ' has-error' : ''}`}
            >
              {LIKERT_SCORES.map((score) => {
                const isSelected = selected === score;
                const label =
                  score === 1
                    ? `1, ${LIKERT_ANCHORS.low}`
                    : score === 7
                      ? `7, ${LIKERT_ANCHORS.high}`
                      : `${score}`;
                return (
                  <button
                    key={score}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={label}
                    className="likert-option"
                    onClick={() => setSurveyAnswer(q.id, score)}
                  >
                    {score}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
                fontSize: 12,
                color: 'var(--muted)',
              }}
            >
              <span>{LIKERT_ANCHORS.low}</span>
              <span>{LIKERT_ANCHORS.high}</span>
            </div>
            {error && (
              <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 8 }}>Please select a response.</div>
            )}
          </div>
        );
      })}

      <Button id="survey_submit" variant="filled-dominant" onClick={submitSurvey}>
        {conditionIsLast ? 'Continue' : 'Continue to next interface'}
      </Button>
    </div>
  );
}

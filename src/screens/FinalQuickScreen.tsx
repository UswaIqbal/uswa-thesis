import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { RadioGroup } from '../components/RadioGroup';
import { FINAL_QUICK_1_OPTIONS, FINAL_QUICK_2_OPTIONS, FINAL_QUICK_HEADING } from '../lib/content';

export function FinalQuickScreen() {
  const { session, setFinalQuick1, setFinalQuick2, finalQuickValidationTouched, continueFromFinalQuick } =
    useStudy();
  const missing1 = finalQuickValidationTouched && !session.finalQuick1;
  const missing2 = finalQuickValidationTouched && !session.finalQuick2;

  return (
    <div data-screen-id="final_quick_questions">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 28px', letterSpacing: '-0.01em' }}>
        {FINAL_QUICK_HEADING}
      </h1>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          Have you ever canceled a subscription for an online service?
        </div>
        <RadioGroup
          ariaLabel="Previous cancellation experience"
          options={FINAL_QUICK_1_OPTIONS}
          selected={session.finalQuick1}
          onSelect={setFinalQuick1}
        />
        {missing1 && (
          <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 8 }}>Please select a response.</div>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
          How familiar are you with online services that require a subscription?
        </div>
        <RadioGroup
          ariaLabel="Subscription familiarity"
          options={FINAL_QUICK_2_OPTIONS}
          selected={session.finalQuick2}
          onSelect={setFinalQuick2}
        />
        {missing2 && (
          <div style={{ fontSize: 12, color: 'var(--error)', marginTop: 8 }}>Please select a response.</div>
        )}
      </div>

      <Button
        variant="filled-dominant"
        disabled={!(session.finalQuick1 && session.finalQuick2)}
        onClick={continueFromFinalQuick}
      >
        Continue
      </Button>
    </div>
  );
}

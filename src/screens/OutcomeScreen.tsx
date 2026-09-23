import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { RENEWAL_DATE } from '../lib/content';

function CheckBadge({ color }: { color: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: `color-mix(in oklch, ${color} 15%, var(--bg))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}
    >
      <div
        style={{
          width: 14,
          height: 8,
          borderLeft: `2px solid ${color}`,
          borderBottom: `2px solid ${color}`,
          transform: 'rotate(-45deg) translate(1px, -1px)',
        }}
      />
    </div>
  );
}

export function OutcomeScreen() {
  const { currentOutcome, continueToSurvey } = useStudy();

  if (currentOutcome === 'cancelled') {
    return (
      <div data-screen-id="outcome_cancelled" style={{ maxWidth: 560 }}>
        <CheckBadge color="var(--success)" />
        <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          Subscription cancelled
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>
          Your Pebble Pro subscription has been cancelled. You&rsquo;ll keep Pro access until{' '}
          <strong>{RENEWAL_DATE}</strong>, when your account moves to the free plan.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 24px' }}>
          Your chats and account data remain available. You can resubscribe at any time from Account Settings.
        </p>
        <Button id="continue_to_survey" variant="filled-dominant" onClick={continueToSurvey}>
          Continue to survey
        </Button>
      </div>
    );
  }

  if (currentOutcome === 'retained_discount') {
    // Decision D01 (08_STUDY-SYSTEM-SPEC.md) is unresolved: this copy follows the
    // researcher-suggested factual structure but the exact wording still needs
    // sign-off before this condition design is locked.
    return (
      <div data-screen-id="outcome_retained_with_discount" style={{ maxWidth: 560 }}>
        <CheckBadge color="var(--dominant)" />
        <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
          Discount activated
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>
          Your Pebble Pro subscription remains active at <strong>$10.99/month</strong> for the next two months.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 24px' }}>
          After that, your subscription automatically returns to $21.99/month.
        </p>
        <Button id="continue_to_survey" variant="filled-dominant" onClick={continueToSurvey}>
          Continue to survey
        </Button>
      </div>
    );
  }

  // retained_standard (T0, P1, P3)
  return (
    <div data-screen-id="outcome_retained" style={{ maxWidth: 560 }}>
      <CheckBadge color="var(--dominant)" />
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
        Subscription remains active
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>Your subscription will continue as usual.</p>
      <Button id="continue_to_survey" variant="filled-dominant" onClick={continueToSurvey}>
        Continue to survey
      </Button>
    </div>
  );
}

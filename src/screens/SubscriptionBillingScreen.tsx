import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { PLAN_NAME, PLAN_PRICE, RENEWAL_DATE } from '../lib/content';

export function SubscriptionBillingScreen() {
  const { goToCancelScreen } = useStudy();
  return (
    <div data-screen-id="subscription_billing" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 32px', letterSpacing: '-0.01em' }}>
        Subscription &amp; Billing
      </h1>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24 }}>
        <div className="section-label-text" style={{ marginBottom: 14 }}>
          Current Plan
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--fd)', fontSize: 19, fontWeight: 700 }}>{PLAN_NAME}</div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--success)',
              background: 'color-mix(in oklch, var(--success) 14%, var(--bg))',
              borderRadius: 6,
              padding: '3px 9px',
            }}
          >
            Active
          </span>
        </div>
        <div style={{ fontFamily: 'var(--fm)', fontSize: 22, marginBottom: 4 }}>
          {PLAN_PRICE} <span style={{ fontFamily: 'var(--fb)', fontSize: 13, color: 'var(--muted)' }}>/ month</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Renews {RENEWAL_DATE}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button variant="static">Manage plan</Button>
          <Button id="cancel_subscription" variant="outline" onClick={goToCancelScreen}>
            Cancel subscription
          </Button>
        </div>
      </div>
    </div>
  );
}

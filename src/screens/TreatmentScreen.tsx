import type { ReactNode } from 'react';
import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import {
  AdvancedCapabilitiesIcon,
  CalendarIcon,
  PercentIcon,
  PriorityAccessIcon,
  RepeatIcon,
  UsageLimitsIcon,
} from '../components/icons/BenefitIcons';
import { CANCELLATION_CONSEQUENCES, PLAN_NAME, PLAN_PRICE, TREATMENT_HEADING, TREATMENT_INTRO } from '../lib/content';

function BenefitRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {icon}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}

function P1BenefitSection() {
  return (
    <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>
        What you&rsquo;ll lose after your subscription ends
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BenefitRow icon={<UsageLimitsIcon />} title="Higher usage limits" description="Your higher usage limits will end." />
        <BenefitRow
          icon={<AdvancedCapabilitiesIcon />}
          title="Advanced AI capabilities"
          description="Your access to advanced AI capabilities will end."
        />
        <BenefitRow
          icon={<PriorityAccessIcon />}
          title="Priority access"
          description="Your priority access during periods of high demand will end."
        />
      </div>
    </div>
  );
}

function P2DiscountSection() {
  return (
    <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>50% off for two months</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BenefitRow
          icon={<PercentIcon />}
          title="Discounted price"
          description="You will pay $10.99 per month instead of $21.99 per month."
        />
        <BenefitRow
          icon={<CalendarIcon />}
          title="Discount period"
          description="The discounted price applies for two months."
        />
        <BenefitRow
          icon={<RepeatIcon />}
          title="Regular price"
          description="After two months, the monthly price automatically returns to $21.99."
        />
      </div>
    </div>
  );
}

export function TreatmentScreen() {
  const { currentCondition, activateDecision } = useStudy();
  const screenId = currentCondition.toLowerCase() + '_treatment';

  return (
    <div data-screen-id={screenId} style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
        {TREATMENT_HEADING}
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 24px' }}>{TREATMENT_INTRO}</p>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 14,
            marginBottom: 14,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ fontFamily: 'var(--fd)', fontSize: 16, fontWeight: 700 }}>{PLAN_NAME}</div>
          <div style={{ fontFamily: 'var(--fm)', fontSize: 15 }}>
            {PLAN_PRICE} <span style={{ fontFamily: 'var(--fb)', fontSize: 12, color: 'var(--muted)' }}>/ month</span>
          </div>
        </div>
        <ul style={{ padding: '0 0 0 18px', fontSize: 14, lineHeight: 1.9 }}>
          {CANCELLATION_CONSEQUENCES.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

        {currentCondition === 'P1' && <P1BenefitSection />}
        {currentCondition === 'P2' && <P2DiscountSection />}
      </div>

      {currentCondition === 'P3' ? (
        <div className="btn-row">
          <Button id="keep_subscription" variant="filled-dominant" onClick={() => activateDecision('keep')}>
            Keep subscription
          </Button>
          <Button id="confirm_cancellation" variant="text-tertiary" onClick={() => activateDecision('cancel')}>
            Confirm cancellation
          </Button>
        </div>
      ) : (
        <div className="btn-row">
          {currentCondition === 'P2' ? (
            <Button id="accept_discount" variant="outline" onClick={() => activateDecision('keep')}>
              Keep subscription for 50% off
            </Button>
          ) : (
            <Button id="keep_subscription" variant="outline" onClick={() => activateDecision('keep')}>
              Keep subscription
            </Button>
          )}
          <Button id="confirm_cancellation" variant="filled-error" onClick={() => activateDecision('cancel')}>
            Confirm cancellation
          </Button>
        </div>
      )}
    </div>
  );
}

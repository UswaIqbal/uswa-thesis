import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { RadioGroup } from '../components/RadioGroup';
import { CONSENT_INTRO, CONSENT_OPTIONS } from '../lib/content';
import { HCAPTCHA_SITE_KEY, captchaEnabled } from '../lib/captcha';

export function ConsentScreen() {
  const {
    session,
    chooseConsent,
    continueFromConsent,
    captchaToken,
    setCaptchaToken,
    captchaNonce,
    startingSession,
    persistError,
  } = useStudy();

  const agreed = session.consent === 'agree';
  const needsCaptcha = captchaEnabled && agreed;
  const canContinue =
    !!session.consent && (!needsCaptcha || !!captchaToken) && !startingSession;

  return (
    <div data-screen-id="consent">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Consent</h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>{CONSENT_INTRO}</p>
      <div style={{ marginBottom: needsCaptcha ? 20 : 28 }}>
        <RadioGroup
          ariaLabel="Consent"
          options={CONSENT_OPTIONS}
          selected={session.consent}
          onSelect={chooseConsent}
        />
      </div>

      {needsCaptcha && (
        <div style={{ marginBottom: 24 }}>
          <HCaptcha
            key={captchaNonce}
            sitekey={HCAPTCHA_SITE_KEY}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
            onError={() => setCaptchaToken(null)}
          />
        </div>
      )}

      {persistError && !startingSession && (
        <div role="alert" style={{ fontSize: 13, color: 'var(--error)', lineHeight: 1.6, margin: '0 0 16px' }}>
          We couldn&rsquo;t start a secure session. Please complete the verification and try again.
        </div>
      )}

      <Button variant="filled-dominant" disabled={!canContinue} onClick={() => void continueFromConsent()}>
        {startingSession ? 'Starting…' : 'Continue'}
      </Button>
    </div>
  );
}

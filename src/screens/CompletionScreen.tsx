import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { COMPLETION_BODY } from '../lib/content';

export function CompletionScreen() {
  const { session, finishStudy, savingCompletion, persistError } = useStudy();
  const finished = !!session.completedAt;

  return (
    <div data-screen-id="completion">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Thank You</h1>
      {COMPLETION_BODY.map((p, i) => (
        <p
          key={i}
          style={{ fontSize: 14, lineHeight: 1.7, margin: i === COMPLETION_BODY.length - 1 ? '0 0 32px' : '0 0 8px' }}
        >
          {p}
        </p>
      ))}

      {finished ? (
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>You may now close this window.</p>
      ) : (
        <>
          {persistError && (
            <div
              role="alert"
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: 'var(--error)',
                background: 'color-mix(in oklch, var(--error) 8%, var(--bg))',
                border: '1px solid color-mix(in oklch, var(--error) 30%, var(--bg))',
                borderRadius: 'var(--radius-control)',
                padding: '12px 14px',
                margin: '0 0 16px',
              }}
            >
              Your responses could not be saved yet. Your answers are still here — please check your
              connection and try again.
            </div>
          )}
          <Button id="finish_study" variant="filled-dominant" disabled={savingCompletion} onClick={finishStudy}>
            {savingCompletion ? 'Saving…' : persistError ? 'Try again' : 'Submit responses'}
          </Button>
        </>
      )}
    </div>
  );
}

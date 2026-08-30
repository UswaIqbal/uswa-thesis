import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { TRANSITION_BODY } from '../lib/content';

/** Neutral transition/reset — must not reveal the preceding condition, manipulation, or decision. */
export function TransitionScreen() {
  const { continueTransition } = useStudy();
  return (
    <div data-screen-id="between_conditions">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.01em' }}>Next interface</h1>
      <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 32px' }}>{TRANSITION_BODY}</p>
      <Button id="continue_to_next_condition" variant="filled-dominant" onClick={continueTransition}>
        Continue
      </Button>
    </div>
  );
}

import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { OPEN_ENDED_COMPARISON_PROMPT, OPEN_ENDED_INFLUENCE_PROMPT } from '../lib/content';

export function FinalOpenEndedScreen() {
  const { session, setOpenEndedInfluence, setOpenEndedComparison, continueFromFinalOpen } = useStudy();
  return (
    <div data-screen-id="final_open_ended">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.01em' }}>
        A couple of final questions
      </h1>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--muted)', margin: '0 0 28px' }}>
        Both questions are optional — you can continue without answering.
      </p>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{OPEN_ENDED_INFLUENCE_PROMPT}</div>
        <textarea
          className="text-area"
          value={session.openEndedInfluence}
          placeholder="Optional"
          onChange={(e) => setOpenEndedInfluence(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{OPEN_ENDED_COMPARISON_PROMPT}</div>
        <textarea
          className="text-area"
          value={session.openEndedComparison}
          placeholder="Optional"
          onChange={(e) => setOpenEndedComparison(e.target.value)}
        />
      </div>

      <Button variant="filled-dominant" onClick={continueFromFinalOpen}>
        Continue
      </Button>
    </div>
  );
}

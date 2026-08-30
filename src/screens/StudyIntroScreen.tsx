import { useStudy } from '../state/StudyContext';
import { Button } from '../components/Button';
import { STUDY_INTRO_PARAGRAPHS, STUDY_INTRO_TASK_LIST, STUDY_INTRO_CLOSING } from '../lib/content';

export function StudyIntroScreen() {
  const { beginStudy } = useStudy();
  return (
    <div data-screen-id="study_introduction">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.01em' }}>
        Before you begin
      </h1>
      {STUDY_INTRO_PARAGRAPHS.map((p, i) => (
        <p key={i} style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 16px' }}>
          {p}
        </p>
      ))}
      <p style={{ fontSize: 14, lineHeight: 1.7, margin: '0 0 8px' }}>For each version, you will:</p>
      <ul style={{ padding: '0 0 0 18px', margin: '0 0 16px', fontSize: 14, lineHeight: 1.8 }}>
        {STUDY_INTRO_TASK_LIST.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--muted)', margin: '0 0 32px' }}>
        {STUDY_INTRO_CLOSING}
      </p>
      <Button variant="filled-dominant" onClick={beginStudy}>
        Continue
      </Button>
    </div>
  );
}

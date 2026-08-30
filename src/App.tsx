import { StudyProvider, useStudy, type Screen } from './state/StudyContext';
import { AppShell, StudyShell } from './components/Shell';
import { StudyIntroScreen } from './screens/StudyIntroScreen';
import { ConsentScreen } from './screens/ConsentScreen';
import { DeclinedScreen } from './screens/DeclinedScreen';
import { SubscriptionBillingScreen } from './screens/SubscriptionBillingScreen';
import { TreatmentScreen } from './screens/TreatmentScreen';
import { ProcessingScreen } from './screens/ProcessingScreen';
import { OutcomeScreen } from './screens/OutcomeScreen';
import { SurveyScreen } from './screens/SurveyScreen';
import { TransitionScreen } from './screens/TransitionScreen';
import { FinalOpenEndedScreen } from './screens/FinalOpenEndedScreen';
import { FinalQuickScreen } from './screens/FinalQuickScreen';
import { CompletionScreen } from './screens/CompletionScreen';

const APP_SCREENS: Screen[] = ['settings', 'treatment', 'processing', 'outcome'];

function PersistBanner() {
  const { persistError, screen, retrySave } = useStudy();
  // The consent and completion screens have their own inline save UI.
  if (!persistError || screen === 'completion' || screen === 'consent') return null;
  return (
    <div
      role="alert"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        fontSize: 13,
        color: 'var(--error)',
        background: 'color-mix(in oklch, var(--error) 10%, var(--bg))',
        borderBottom: '1px solid color-mix(in oklch, var(--error) 30%, var(--bg))',
        padding: '10px 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span>Your progress could not be saved. Your answers are safe on this device.</span>
      <button className="btn btn-outline" style={{ padding: '4px 10px' }} onClick={retrySave}>
        Retry
      </button>
    </div>
  );
}

function StudyFlow() {
  const { screen, progressLabel } = useStudy();
  const isApp = APP_SCREENS.includes(screen);
  const Shell = isApp ? AppShell : StudyShell;

  return (
    <>
      <PersistBanner />
      <Shell progressLabel={progressLabel}>{renderScreen(screen)}</Shell>
    </>
  );
}

function renderScreen(screen: Screen) {
  switch (screen) {
    case 'intro':
      return <StudyIntroScreen />;
    case 'consent':
      return <ConsentScreen />;
    case 'declined':
      return <DeclinedScreen />;
    case 'settings':
      return <SubscriptionBillingScreen />;
    case 'treatment':
      return <TreatmentScreen />;
    case 'processing':
      return <ProcessingScreen />;
    case 'outcome':
      return <OutcomeScreen />;
    case 'survey':
      return <SurveyScreen />;
    case 'transition':
      return <TransitionScreen />;
    case 'final_open':
      return <FinalOpenEndedScreen />;
    case 'final_quick':
      return <FinalQuickScreen />;
    case 'completion':
      return <CompletionScreen />;
    default:
      return null;
  }
}

export default function App() {
  return (
    <StudyProvider>
      <StudyFlow />
    </StudyProvider>
  );
}

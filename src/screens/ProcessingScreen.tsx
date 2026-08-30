import { Spinner } from '../components/Spinner';

/** Shared, non-experimental subscription_processing state — identical across all conditions and outcomes. */
export function ProcessingScreen() {
  return (
    <div
      data-screen-id="subscription_processing"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        maxWidth: 560,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
        gap: 16,
      }}
    >
      <Spinner />
      <div style={{ fontSize: 14 }}>Updating subscription</div>
    </div>
  );
}

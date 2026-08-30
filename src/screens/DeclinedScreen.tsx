export function DeclinedScreen() {
  return (
    <div data-screen-id="declined_exit">
      <h1 style={{ fontSize: 23, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.01em' }}>
        You have chosen not to participate
      </h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>
        Thank you for your time. No study data has been recorded.
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>
        You may now close this window.
      </p>
    </div>
  );
}

export function Header({ progressLabel }: { progressLabel: string | null }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      <div style={{ fontFamily: 'var(--fd)', fontSize: 18, fontWeight: 700, color: 'var(--dominant)', letterSpacing: '-0.01em' }}>
        USWA-AI
      </div>
      {progressLabel && (
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>{progressLabel}</span>
      )}
    </div>
  );
}

export function Header({ progressLabel }: { progressLabel: string | null }) {
  return (
    <div className="header-bar">
      <div className="header-logo">USWA-AI</div>
      {progressLabel && <span className="header-progress">{progressLabel}</span>}
    </div>
  );
}

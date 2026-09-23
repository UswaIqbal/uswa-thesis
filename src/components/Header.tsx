export function Header({ progressLabel }: { progressLabel: string | null }) {
  return (
    <div className="header-bar">
      <div className="header-logo">PEBBLE</div>
      {progressLabel && <span className="header-progress">{progressLabel}</span>}
    </div>
  );
}

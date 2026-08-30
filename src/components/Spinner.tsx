/** 20px circular outline spinner, 2px stroke, dominant-teal rotating segment. Respects prefers-reduced-motion via CSS. */
export function Spinner() {
  return (
    <div
      className="uswa-spinner"
      aria-hidden="true"
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: '2px solid var(--border)',
        borderTopColor: 'var(--dominant)',
      }}
    />
  );
}

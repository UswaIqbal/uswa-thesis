import type { ReactNode } from 'react';
import { Header } from './Header';

const SHELL_WIDTH = 1120;

function ShellFrame({ children }: { children: ReactNode }) {
  return (
    <div className="shell-outer">
      <div
        style={{
          width: SHELL_WIDTH,
          maxWidth: '100%',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-surface)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-surface)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const NAV_ITEMS = ['Account', 'Subscription & Billing', 'Security', 'Notifications'];

/** Shell used for the shared product surface: settings, treatment, processing, outcome. */
export function AppShell({
  progressLabel,
  children,
}: {
  progressLabel: string | null;
  children: ReactNode;
}) {
  return (
    <ShellFrame>
      <Header progressLabel={progressLabel} />
      <div className="app-shell-body">
        <div className="app-shell-sidebar">
          <div className="app-shell-nav">
            {NAV_ITEMS.map((item) => {
              const active = item === 'Subscription & Billing';
              return (
                <div
                  key={item}
                  className="app-shell-nav-item"
                  style={{
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--dominant)' : 'var(--muted)',
                    background: active ? 'color-mix(in oklch, var(--dominant) 10%, var(--bg))' : 'transparent',
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
        <div className="app-shell-content">{children}</div>
      </div>
    </ShellFrame>
  );
}

/** Shell used for the study-flow surface: intro, consent, background, survey, transition, final, completion. */
export function StudyShell({
  progressLabel,
  children,
}: {
  progressLabel: string | null;
  children: ReactNode;
}) {
  return (
    <ShellFrame>
      <Header progressLabel={progressLabel} />
      <div className="study-shell-body">
        <div style={{ maxWidth: 560, width: '100%' }}>{children}</div>
      </div>
    </ShellFrame>
  );
}

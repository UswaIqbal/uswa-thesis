import type { ReactNode } from 'react';
import { Header } from './Header';

const SHELL_WIDTH = 1120;

function ShellFrame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '40px 24px',
      }}
    >
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
      <div style={{ display: 'flex', minHeight: 560 }}>
        <div
          style={{
            width: 220,
            borderRight: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: '24px 16px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const active = item === 'Subscription & Billing';
              return (
                <div
                  key={item}
                  style={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                    color: active ? 'var(--dominant)' : 'var(--muted)',
                    background: active ? 'color-mix(in oklch, var(--dominant) 10%, var(--bg))' : 'transparent',
                    padding: '10px 12px',
                    borderRadius: 6,
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ flex: 1, padding: '40px 48px' }}>{children}</div>
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
      <div style={{ display: 'flex', minHeight: 560, padding: '56px 64px', justifyContent: 'center' }}>
        <div style={{ maxWidth: 560, width: '100%' }}>{children}</div>
      </div>
    </ShellFrame>
  );
}

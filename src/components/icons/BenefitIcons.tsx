/**
 * 16×16 outline icons for the P1 loss-framed benefit rows and P2 offer-detail rows.
 * Muted-ink stroke only, ~1.5px stroke, no fill/background, aria-hidden — decorative,
 * adjacent text carries full meaning. Paths match the approved Claude Design canvas.
 */
const iconProps = {
  'aria-hidden': true as const,
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'var(--muted)',
  strokeWidth: 1.5,
  style: { flexShrink: 0, marginTop: 2 },
};

export function UsageLimitsIcon() {
  return (
    <svg {...iconProps}>
      <rect x="4" y="14" width="4" height="6" rx="1" />
      <rect x="10" y="9" width="4" height="11" rx="1" />
      <rect x="16" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}

export function AdvancedCapabilitiesIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PriorityAccessIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PercentIcon() {
  return (
    <svg {...iconProps}>
      <path d="M19 5L5 19" strokeLinecap="round" />
      <circle cx="7" cy="7" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

export function RepeatIcon() {
  return (
    <svg {...iconProps}>
      <path d="M17 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12v-2a4 4 0 0 1 4-4h14" strokeLinecap="round" />
      <path d="M7 22l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v2a4 4 0 0 1-4 4H3" strokeLinecap="round" />
    </svg>
  );
}

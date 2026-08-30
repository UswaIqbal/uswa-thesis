import type { ButtonHTMLAttributes } from 'react';

type Variant = 'outline' | 'filled-dominant' | 'filled-error' | 'text-tertiary' | 'static';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  outline: 'btn-outline',
  'filled-dominant': 'btn-filled-dominant',
  'filled-error': 'btn-filled-error',
  'text-tertiary': 'btn-text-tertiary',
  // Same resting look as `outline`, but no hover/press feedback — for controls
  // that aren't wired to anything yet, so they don't imply an interaction that isn't there.
  static: 'btn-static',
};

export function Button({ variant = 'outline', className, ...rest }: ButtonProps) {
  const classes = ['btn', variantClass[variant], className].filter(Boolean).join(' ');
  return <button type="button" className={classes} {...rest} />;
}

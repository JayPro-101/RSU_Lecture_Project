
import type { ReactNode } from 'react';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
  dot?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'app-badge',
        `app-badge--${variant}`,
        `app-badge--${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span className="app-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Generic empty/placeholder state used across platforms.
 * TMA wraps this in a telegram-ui <Placeholder>, web uses it directly.
 */
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--jv-space-xl)',
        textAlign: 'center',
        gap: 'var(--jv-space-md)',
      }}
    >
      {icon && <div style={{ fontSize: 48, lineHeight: 1 }}>{icon}</div>}
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--jv-font-size-lg)',
          fontFamily: 'var(--jv-font-family)',
          color: 'var(--jv-color-text)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--jv-font-size-sm)',
            color: 'var(--jv-color-text-secondary)',
          }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

import type { CSSProperties } from 'react';

export interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const spinnerStyle = (size: number, color: string): CSSProperties => ({
  width: size,
  height: size,
  border: `2px solid ${color}`,
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'jv-spin 600ms linear infinite',
  display: 'inline-block',
});

/**
 * Simple CSS spinner. Requires the @keyframes rule from tokens.css
 * or inject this keyframe in your app's global styles:
 *
 *   @keyframes jv-spin { to { transform: rotate(360deg); } }
 */
export function Spinner({
  size = 20,
  color = 'var(--jv-color-accent)',
  className,
}: SpinnerProps) {
  return <span className={className} style={spinnerStyle(size, color)} />;
}

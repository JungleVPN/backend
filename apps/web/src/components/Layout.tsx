import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { APP_NAME } from '@workspace/core/constants';
import { routes } from '@/app/routes';

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--jv-space-lg)',
          padding: 'var(--jv-space-md) var(--jv-space-lg)',
          borderBottom: '1px solid var(--jv-color-border)',
          background: 'var(--jv-color-surface)',
        }}
      >
        <strong style={{ fontSize: 'var(--jv-font-size-lg)' }}>{APP_NAME}</strong>
        <nav style={{ display: 'flex', gap: 'var(--jv-space-md)' }}>
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              style={{
                color:
                  location.pathname === route.path
                    ? 'var(--jv-color-accent)'
                    : 'var(--jv-color-text-secondary)',
                textDecoration: 'none',
                fontSize: 'var(--jv-font-size-sm)',
                transition: 'var(--jv-transition-fast)',
              }}
            >
              {route.title}
            </Link>
          ))}
        </nav>
      </header>
      <main style={{ flex: 1, padding: 'var(--jv-space-lg)' }}>{children}</main>
    </div>
  );
}

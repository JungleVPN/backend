import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@workspace/ui';

import { WebAuthProvider } from '@/providers/AuthProvider';
import { WebApiProvider } from '@/providers/ApiProvider';
import { Layout } from '@/components/Layout';
import { routes } from '@/app/routes';

function ErrorFallback({ error }: { error: unknown }) {
  return (
    <div style={{ padding: 'var(--jv-space-xl)', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <pre style={{ color: 'var(--jv-color-destructive)' }}>
        {error instanceof Error ? error.message : String(error)}
      </pre>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <WebAuthProvider>
        <WebApiProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                {routes.map((route) => (
                  <Route key={route.path} path={route.path} element={<route.Component />} />
                ))}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </WebApiProvider>
      </WebAuthProvider>
    </ErrorBoundary>
  );
}

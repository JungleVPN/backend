import { Outlet } from 'react-router';
import { AuthProvider } from '@/components/AuthProvider/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header/Header';
import { AppContainer } from '@/ui/AppContainer.tsx';

import '@/assets/globals.css';

export function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContainer>
          <Header />
          <div className='pt-14 pb-13.5'>
            <Outlet />
          </div>
        </AppContainer>
      </AuthProvider>
    </ErrorBoundary>
  );
}

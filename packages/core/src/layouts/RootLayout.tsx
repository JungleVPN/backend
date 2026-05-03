import { Outlet } from 'react-router';
import { ErrorBoundary, Header } from '../components';
import { AppContainer } from '../ui';

export function RootLayout() {
  return (
    <ErrorBoundary>
      <AppContainer>
        <Header />
        <div className='pt-14 pb-14'>
          <Outlet />
        </div>
      </AppContainer>
    </ErrorBoundary>
  );
}

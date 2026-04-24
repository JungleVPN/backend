import { Container, DirectionProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Outlet } from 'react-router';
import { AuthProvider } from '@/components/AuthProvider/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header/Header';
import { theme } from '@/config/theme';

import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import '@mantine/nprogress/styles.layer.css';
import '@/assets/globals.css';

export function RootLayout() {
  return (
    <DirectionProvider>
      <MantineProvider defaultColorScheme='dark' theme={theme}>
        <Notifications />
        <ErrorBoundary>
          <AuthProvider>
            <Container size={'sm'} p={24} className={'app-container'}>
              <Header />
              <Outlet />
            </Container>
          </AuthProvider>
        </ErrorBoundary>
      </MantineProvider>
    </DirectionProvider>
  );
}

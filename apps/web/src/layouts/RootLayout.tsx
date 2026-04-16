import { Container, DirectionProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Outlet } from 'react-router-dom';
import { theme } from '@/config/theme';
import { AuthProvider } from '@/components/AuthProvider/AuthProvider';
import { Header } from '@/components/Header/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';

import '@mantine/core/styles.layer.css';
import '@mantine/dates/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import '@mantine/nprogress/styles.layer.css';
import '@/assets/globals.css';

export function RootLayout() {
  return (
    <DirectionProvider>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <Notifications />
        <ErrorBoundary>
          <AuthProvider>
            <Container size={'sm'} p={24}>
              <Header />
              <Outlet />
            </Container>
          </AuthProvider>
        </ErrorBoundary>
      </MantineProvider>
    </DirectionProvider>
  );
}

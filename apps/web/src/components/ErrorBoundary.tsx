import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Center, Stack, Text, Title } from '@mantine/core';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Center h="100vh">
          <Stack align="center" gap="md">
            <Title order={3}>Something went wrong</Title>
            <Text c="dimmed" size="sm">
              {this.state.error?.message}
            </Text>
            <Button onClick={() => window.location.reload()} color="cyan">
              Reload
            </Button>
          </Stack>
        </Center>
      );
    }

    return this.props.children;
  }
}

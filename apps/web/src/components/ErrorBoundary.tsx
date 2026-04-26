import { Button, Surface } from '@heroui/react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

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
        <Surface
          className='flex min-h-screen w-full flex-col items-center justify-center gap-4 p-6'
          variant='transparent'
        >
          <h2 className='text-lg font-semibold text-foreground'>Something went wrong</h2>
          <p className='text-center text-sm text-muted'>{this.state.error?.message}</p>
          <Button variant='secondary' onPress={() => window.location.reload()}>
            Reload
          </Button>
        </Surface>
      );
    }

    return this.props.children;
  }
}

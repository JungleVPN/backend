import { Spinner, Surface } from '@heroui/react';

export function Loading({ height = '100vh' }: { height?: string; text?: string; value?: number }) {
  return (
    <Surface
      className='flex w-full flex-col items-center justify-center gap-2'
      style={{ minHeight: height }}
      variant='transparent'
    >
      <Spinner color='accent' size='lg' />
    </Surface>
  );
}

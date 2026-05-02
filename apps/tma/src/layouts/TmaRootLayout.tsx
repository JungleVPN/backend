import { RootLayout, usePlatformStore } from '@workspace/core';
import { TmaAuthProvider } from '@/providers/TmaAuthProvider.tsx';
import { TmaProvider } from '@/providers/TmaProvider.tsx';

export function TmaRootLayout() {
  const { clientPlatform } = usePlatformStore();
  return (
    <TmaAuthProvider>
      <TmaProvider>
        <div className={`${clientPlatform === 'ios' ? 'pt-20' : ''}`}>
          <RootLayout />
        </div>
      </TmaProvider>
    </TmaAuthProvider>
  );
}

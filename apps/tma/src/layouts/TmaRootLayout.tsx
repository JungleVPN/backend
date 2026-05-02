import { RootLayout, usePlatformStore } from '@workspace/core';

export function TmaRootLayout() {
  const { clientPlatform } = usePlatformStore();
  return (
    <div className={`${clientPlatform === 'ios' ? 'pt-20' : ''}`}>
      <RootLayout />
    </div>
  );
}

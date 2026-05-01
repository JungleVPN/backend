import {
  backButton,
  init,
  initData,
  miniApp,
  retrieveLaunchParams,
  themeParams,
  viewport,
} from '@tma.js/sdk-react';

export const initTma = () => {
  init();

  backButton.mount.ifAvailable();
  initData.restore();

  if (miniApp.mount.isAvailable()) {
    themeParams.mount();
    miniApp.mount();
    themeParams.bindCssVars();
  }

  if (viewport.mount.isAvailable()) {
    viewport.mount().then(() => {
      viewport.bindCssVars();
    });
  }

  const launchParams = retrieveLaunchParams();

  return {
    launchParams,
  };
};

import { create } from 'zustand';

export type AppConfig = {
  cryptoLink: boolean;
  buyLink: string;
  redirectLink: string;
  isSnowflakeEnabled: boolean;
};

export interface IAppConfigState {
  appConfig: AppConfig | null;
}

export interface IAppConfigActions {
  actions: {
    setAppConfig: (appConfig: AppConfig) => void;
    getInitialState: () => IAppConfigState;
    resetState: () => void;
  };
}

const initialState: IAppConfigState = {
  appConfig: null,
};

export const useAppConfigStore = create<IAppConfigActions & IAppConfigState>()((set) => ({
  ...initialState,
  actions: {
    setAppConfig: (appConfig: AppConfig) => {
      set((state) => ({
        ...state,
        appConfig,
      }));
    },
    getInitialState: () => {
      return initialState;
    },
    resetState: () => {
      set({ ...initialState });
    },
  },
}));

export const useAppConfigStoreActions = () => useAppConfigStore((store) => store.actions);

export const useAppConfigStoreInfo = () => useAppConfigStore((state) => state);

export const useAppConfig = (): AppConfig => {
  const appConfig = useAppConfigStore((state) => state.appConfig);
  if (!appConfig) {
    throw new Error('useAppConfig must be used after appConfig is loaded');
  }
  return appConfig;
};

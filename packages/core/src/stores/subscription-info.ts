import type { GetSubscriptionInfoByShortUuidCommand } from '@remnawave/backend-contract';
import { create } from 'zustand';

export type ExtendedSubscription = GetSubscriptionInfoByShortUuidCommand.Response['response'] & {
  subpageConfigUuid?: string;
};

export interface ISubscriptionInfoState {
  subscription: ExtendedSubscription | null;
}

export interface ISubscriptionInfoActions {
  actions: {
    setSubscriptionInfo: (info: ISubscriptionInfoState) => void;
    getInitialState: () => ISubscriptionInfoState;
    resetState: () => void;
  };
}

const initialState: ISubscriptionInfoState = {
  subscription: null,
};

export const useSubscriptionInfoStore = create<ISubscriptionInfoActions & ISubscriptionInfoState>()(
  (set) => ({
    ...initialState,
    actions: {
      setSubscriptionInfo: (info: ISubscriptionInfoState) => {
        set((state) => ({
          ...state,
          subscription: info.subscription,
        }));
      },
      getInitialState: () => {
        return initialState;
      },
      resetState: () => {
        set({ ...initialState });
      },
    },
  }),
);

export const useSubscriptionInfoStoreActions = () =>
  useSubscriptionInfoStore((store) => store.actions);

export const useSubscriptionInfoStoreInfo = () => useSubscriptionInfoStore((state) => state);

export const useSubscription =
  (): GetSubscriptionInfoByShortUuidCommand.Response['response'] => {
    const subscription = useSubscriptionInfoStore((state) => state.subscription);
    if (!subscription) {
      throw new Error(
        'useSubscription must be used after subscription is loaded (after RootLayout gate)',
      );
    }
    return subscription;
  };

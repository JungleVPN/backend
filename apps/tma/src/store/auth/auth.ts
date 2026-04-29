import { create } from 'zustand';
import type { IActions, IState } from './interfaces';

const initialState: IState = {
  rmnUser: null,
  loading: true,
  authSource: null,
  tgUser: null,
  tgInitDataRaw: null,
};

export const useAuthStore = create<IActions & IState>()((set) => ({
  ...initialState,
  actions: {
    setRmnUser: (rmnUser) => set({ rmnUser }),
    setLoading: (loading) => set({ loading }),
    setAuthSource: (authSource) => set({ authSource }),
    setTgUser: (tgUser) => set({ tgUser }),
    setTgInitDataRaw: (tgInitDataRaw) => set({ tgInitDataRaw }),
  },
}));

export const useAuthStoreActions = () => useAuthStore((state) => state.actions);
export const useAuthStoreInfo = () => useAuthStore((state) => state);

import { create } from 'zustand';
import type { IActions, IState } from './interfaces';

const initialState: IState = {
  authUser: null,
  rmnUser: null,
  loading: true,
};

export const useAuthStore = create<IActions & IState>()((set) => ({
  ...initialState,
  actions: {
    setAuthUser: (authUser) => set({ authUser }),
    setRmnUser: (rmnUser) => set({ rmnUser }),
    setLoading: (loading) => set({ loading }),
  },
}));

export const useAuthStoreActions = () => useAuthStore((state) => state.actions);
export const useAuthStoreInfo = () => useAuthStore((state) => state);

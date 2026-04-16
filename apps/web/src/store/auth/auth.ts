import { create } from 'zustand';
import type { IActions, IState } from './interfaces';

const initialState: IState = {
  user: null,
  loading: true,
};

export const useAuthStore = create<IActions & IState>()((set) => ({
  ...initialState,
  actions: {
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),
  },
}));

export const useAuthStoreActions = () => useAuthStore((state) => state.actions);
export const useAuthStoreInfo = () => useAuthStore((state) => state);

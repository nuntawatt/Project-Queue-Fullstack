import { create } from 'zustand';

interface ConnectionStore {
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));

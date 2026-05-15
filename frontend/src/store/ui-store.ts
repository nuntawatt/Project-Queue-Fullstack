import { create } from 'zustand';

interface UIStore {
  /** Currently open modal identifier */
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;

  /** Sidebar collapsed state (dashboard) */
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));

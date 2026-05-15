import { create } from 'zustand';

interface ConnectionStore {
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;
}

/**
 * Store ส่วนกลางสำหรับเก็บสถานะการเชื่อมต่อ WebSocket
 * เพื่อให้นำไปแสดงผลที่ Header หรือจุดอื่นๆ ได้สะดวก
 */
export const useConnectionStore = create<ConnectionStore>((set) => ({
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),
}));

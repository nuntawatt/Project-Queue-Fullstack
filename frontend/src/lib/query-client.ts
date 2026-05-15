import { QueryClient } from '@tanstack/react-query';
import { APP_CONFIG } from './constants';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: APP_CONFIG.polling.staleTime,
        refetchOnWindowFocus: true,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/** Singleton สำหรับฝั่ง browser — ป้องกันการสร้าง instance ใหม่ทุกครั้งที่ SSR ทำงาน */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

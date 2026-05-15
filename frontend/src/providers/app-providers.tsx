'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { getQueryClient } from '@/lib/query-client';

interface Props {
  children: React.ReactNode;
}

/**
 * Single wrapper for all client-side providers.
 * Keeps the root layout clean and server-renderable.
 */
export function AppProviders({ children }: Props) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            'font-sans text-sm border border-white/10 bg-neutral-950 text-neutral-100',
          duration: 4000,
        }}
        richColors
        closeButton
      />
    </QueryClientProvider>
  );
}

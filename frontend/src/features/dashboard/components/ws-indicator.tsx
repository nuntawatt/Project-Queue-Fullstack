'use client';

import { useConnectionStore } from '@/store/connection-store';
import { cn } from '@/lib/utils';

export function WsIndicator() {
  const connected = useConnectionStore((s) => s.wsConnected);

  return (
    <div className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1">
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          connected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300',
        )}
      />
      <span className="font-mono text-[11px] text-neutral-500">
        {connected ? 'live' : 'connecting'}
      </span>
    </div>
  );
}

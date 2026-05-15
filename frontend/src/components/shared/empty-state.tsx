import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon = '📭',
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 text-center',
        className,
      )}
    >
      <span className="text-3xl">{icon}</span>
      <p className="mt-3 text-sm font-medium text-neutral-700">{title}</p>
      <p className="mt-1 max-w-xs text-[13px] text-neutral-400">
        {description}
      </p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

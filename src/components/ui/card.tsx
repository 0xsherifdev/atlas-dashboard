import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'rounded-[10px] border p-4 bg-(--atlas-surface) border-(--atlas-border)',
      className,
    )}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function CardHeader({ title, children }: CardHeaderProps) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-y-1">
      <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[.06em] text-(--atlas-text-2)">
        {title}
      </h3>
      {children}
    </div>
  );
}

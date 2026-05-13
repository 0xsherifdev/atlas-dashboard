import { cn } from '@/lib/utils';

interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ label, active = false, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        'cursor-pointer rounded-[4px] border px-2 py-[3px] font-mono text-[11.5px] transition-colors duration-[100ms]',
        active
          ? 'bg-(--atlas-text) text-(--atlas-bg) border-(--atlas-text)'
          : 'bg-(--atlas-surface) text-(--atlas-text-2) border-(--atlas-border)',
        className,
      )}
    >
      {label}
    </button>
  );
}

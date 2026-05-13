import { cn } from '@/lib/utils';

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function IconButton({ children, onClick, title, size = 'md', className }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'relative inline-grid place-items-center rounded-[6px] border cursor-pointer',
        'bg-(--atlas-surface) border-(--atlas-border) text-(--atlas-text-2)',
        'hover:bg-(--atlas-hover) hover:text-(--atlas-text)',
        'transition-[background,color] duration-[120ms]',
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8',
        className,
      )}
    >
      {children}
    </button>
  );
}

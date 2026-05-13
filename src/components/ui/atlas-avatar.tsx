'use client';

import { cn, initials, avatarColor } from '@/lib/utils';

interface AtlasAvatarProps {
  name: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-7 h-7 text-[10.5px]',
  lg: 'w-9 h-9 text-[12px]',
};

export function AtlasAvatar({ name, id, size = 'sm', className }: AtlasAvatarProps) {
  const color = id ? avatarColor(id) : 'var(--atlas-text-3)';
  return (
    <span
      className={cn(
        'inline-grid place-items-center rounded-full font-mono font-semibold flex-shrink-0',
        sizeClasses[size],
        className,
      )}
      style={{
        background: `color-mix(in srgb, ${color} 18%, var(--atlas-surface-2))`,
        color,
      }}
    >
      {initials(name)}
    </span>
  );
}

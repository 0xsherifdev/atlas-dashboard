/**
 * Atlas brand mark — the three-pillar geometric glyph.
 *
 * Variants:
 *   "ink"      – Ink (#0E0E10) on transparent (for light surfaces)
 *   "paper"    – Paper (#F4F2EC) on transparent (for dark surfaces)
 *   "white"    – Pure white on transparent (knockout / coloured bg)
 *   "on-blue"  – White glyph, rendered inside the standard blue tile
 *   "on-ink"   – Paper glyph, rendered inside the Ink-coloured tile (app icon style)
 */

import { cn } from '@/lib/utils';

type MarkVariant = 'ink' | 'paper' | 'white' | 'on-blue' | 'on-ink';

const GLYPH_COLOR: Record<MarkVariant, string> = {
  ink: '#0E0E10',
  paper: '#F4F2EC',
  white: '#FFFFFF',
  'on-blue': '#FFFFFF',
  'on-ink': '#F4F2EC',
};

const TILE_BG: Partial<Record<MarkVariant, string>> = {
  'on-blue': '#3b82f6',
  'on-ink': '#0E0E10',
};

interface AtlasMarkProps {
  variant?: MarkVariant;
  /** Outer size in px — applied to both width and height. Defaults to 20. */
  size?: number;
  className?: string;
  /** When true, wraps the mark in a rounded tile (used in sidebar / login). */
  tile?: boolean;
  tileRadius?: number;
}

export function AtlasMark({
  variant = 'on-blue',
  size = 20,
  className,
  tile = false,
  tileRadius,
}: AtlasMarkProps) {
  const fill = GLYPH_COLOR[variant];
  const bg = TILE_BG[variant];
  const radius = tileRadius ?? Math.round(size * 0.24);

  const mark = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={tile ? size * 0.62 : size}
      height={tile ? size * 0.62 : size}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill={fill}
        fillRule="evenodd"
        d="M 38 8 L 62 8 L 76 54 L 24 54 Z M 50 23 L 64.5 49 L 35.5 49 Z"
      />
      <path fill={fill} d="M 22.2 61 L 39.5 61 L 32.5 92 L 9 92 Z" />
      <path fill={fill} d="M 60.5 61 L 77.8 61 L 91 92 L 67.5 92 Z" />
    </svg>
  );

  if (!tile) return mark;

  return (
    <span
      className={cn('inline-grid flex-shrink-0 place-items-center', className)}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg ?? 'transparent',
      }}
    >
      {mark}
    </span>
  );
}

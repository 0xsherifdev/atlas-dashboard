'use client';

import { memo } from 'react';

interface SparklineProps {
  data: number[];
  color: string;
  dark?: boolean;
  width?: number;
  height?: number;
}

export const Sparkline = memo(function Sparkline({ data, color, dark = true, width = 110, height = 32 }: SparklineProps) {
  const w = width;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - 2 - ((v - min) / span) * (h - 4);
    return [x, y] as [number, number];
  });

  const d = pts.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1)).join(' ');
  const area = d + ` L ${(w - 1).toFixed(1)} ${(h - 1).toFixed(1)} L 1 ${(h - 1).toFixed(1)} Z`;
  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      style={{ display: 'block' }}
      aria-hidden
    >
      <path d={area} fill={color} opacity={dark ? 0.15 : 0.1} />
      <path d={d} stroke={color} strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="1.8" fill={color} />
    </svg>
  );
});

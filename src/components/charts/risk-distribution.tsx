'use client';

import type { RiskBucket } from '@/types';

interface RiskDistributionProps {
  buckets: RiskBucket[];
  dark?: boolean;
}

export function RiskDistribution({ buckets, dark = true }: RiskDistributionProps) {
  const w = 360, h = 140;
  const pad = { t: 12, r: 12, b: 26, l: 24 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...buckets.map((b) => b.n), 1);
  const barW = innerW / buckets.length;

  const text = dark ? 'rgba(230,230,233,.5)' : 'rgba(24,24,27,.5)';
  const grid = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';

  const colorFor = (lo: number): string => {
    if (lo < 35) return '#10b981';
    if (lo < 60) return dark ? '#a1a1aa' : '#71717a';
    if (lo < 80) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      style={{ display: 'block' }}
      role="img"
      aria-label="Risk score distribution"
    >
      <line x1={pad.l} x2={w - pad.r} y1={h - pad.b} y2={h - pad.b} stroke={grid} />
      {buckets.map((b, i) => {
        const barH = (b.n / max) * innerH;
        const x = pad.l + i * barW + 1;
        return (
          <g key={i}>
            <rect
              x={x} y={h - pad.b - barH} width={barW - 2} height={barH}
              fill={colorFor(b.lo)} opacity={dark ? 0.65 : 0.75} rx="1"
            />
            {b.n > 0 && (
              <text
                x={x + (barW - 2) / 2} y={h - pad.b - barH - 4}
                textAnchor="middle" fontSize="9"
                fontFamily="ui-monospace, Menlo, monospace" fill={text}
              >{b.n}</text>
            )}
          </g>
        );
      })}
      {[0, 35, 60, 80, 100].map((v) => (
        <text
          key={v}
          x={pad.l + (v / 100) * innerW} y={h - pad.b + 14}
          textAnchor="middle" fontSize="9"
          fontFamily="ui-monospace, Menlo, monospace" fill={text}
        >{v}</text>
      ))}
    </svg>
  );
}

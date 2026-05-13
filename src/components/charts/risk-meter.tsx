'use client';

import { memo } from 'react';
import { riskBarColor } from '@/lib/utils';

interface RiskMeterProps {
  score: number;
  dark?: boolean;
  size?: number;
}

export const RiskMeter = memo(function RiskMeter({ score, dark = true, size = 64 }: RiskMeterProps) {
  const r = size / 2 - 4;
  const c = size / 2;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = riskBarColor(score, dark);
  const track = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)';

  return (
    <svg
      width={size}
      height={size / 2 + 4}
      viewBox={`0 0 ${size} ${size / 2 + 4}`}
      style={{ display: 'block', flexShrink: 0 }}
      aria-label={`Risk score: ${score}`}
    >
      <path
        d={`M ${c - r} ${c} A ${r} ${r} 0 0 1 ${c + r} ${c}`}
        stroke={track}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${c - r} ${c} A ${r} ${r} 0 0 1 ${c + r} ${c}`}
        stroke={color}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset .4s ease, stroke .3s ease' }}
      />
    </svg>
  );
});

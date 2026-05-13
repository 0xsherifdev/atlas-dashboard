'use client';

import { useState, memo } from 'react';
import type { ActivityBin } from '@/types';

interface ActivityHistogramProps {
  bins: ActivityBin[];
  accent?: string;
  dark?: boolean;
}

export const ActivityHistogram = memo(function ActivityHistogram({ bins, accent = '#3b82f6', dark = true }: ActivityHistogramProps) {
  const w = 720, h = 220;
  const pad = { t: 24, r: 16, b: 28, l: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...bins.map((b) => b.total), 8);
  const barW = innerW / bins.length;
  const [hover, setHover] = useState<number | null>(null);

  const yTicks = [0, Math.ceil(max / 2), max];
  const grid    = dark ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)';
  const text    = dark ? 'rgba(230,230,233,.5)'  : 'rgba(24,24,27,.5)';
  const barCol  = dark ? 'rgba(230,230,233,.18)' : 'rgba(24,24,27,.12)';
  const barHi   = dark ? 'rgba(230,230,233,.28)' : 'rgba(24,24,27,.20)';
  const flagCol = '#ef4444';

  return (
    <div className="relative" role="img" aria-label="24-hour transaction activity">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        style={{ display: 'block', overflow: 'visible' }}
        onMouseLeave={() => setHover(null)}
      >
        {/* y-axis grid + labels */}
        {yTicks.map((tv, i) => {
          const y = pad.t + innerH - (tv / max) * innerH;
          return (
            <g key={i}>
              <line x1={pad.l} x2={w - pad.r} y1={y} y2={y}
                    stroke={grid} strokeDasharray={i === 0 ? '' : '2 4'} />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="10"
                    fontFamily="ui-monospace, Menlo, monospace" fill={text}>{tv}</text>
            </g>
          );
        })}

        {/* bars */}
        {bins.map((b, i) => {
          const x = pad.l + i * barW + 1;
          const barTotalH = (b.total / max) * innerH;
          const barFlagH  = (b.flagged / max) * innerH;
          const y0 = pad.t + innerH;
          const isHov = hover === i;
          return (
            <g key={i} onMouseEnter={() => setHover(i)}>
              {/* invisible hit area */}
              <rect x={x - 1} y={pad.t} width={barW} height={innerH} fill="transparent" />
              {/* total bar */}
              <rect x={x} y={y0 - barTotalH} width={barW - 2} height={barTotalH}
                    fill={isHov ? barHi : barCol} rx="1"
                    style={{ transition: 'fill .08s' }} />
              {/* flagged overlay */}
              {b.flagged > 0 && (
                <rect x={x} y={y0 - barFlagH} width={barW - 2} height={barFlagH}
                      fill={flagCol} opacity={isHov ? 1 : 0.85} rx="1" />
              )}
            </g>
          );
        })}

        {/* x-axis labels: every 3 hours */}
        {bins.map((b, i) => (i % 3 === 0 || i === bins.length - 1) && (
          <text key={i} x={pad.l + i * barW + barW / 2} y={h - pad.b + 14}
                textAnchor="middle" fontSize="10" fontFamily="ui-monospace, Menlo, monospace" fill={text}>
            {i === bins.length - 1 ? 'now' : b.label}
          </text>
        ))}

        {/* hover scrubber */}
        {hover !== null && (
          <line
            x1={pad.l + hover * barW + barW / 2} x2={pad.l + hover * barW + barW / 2}
            y1={pad.t} y2={h - pad.b}
            stroke={accent} strokeWidth="1" strokeDasharray="3 3" opacity=".6"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hover !== null && (() => {
        const b = bins[hover];
        const leftPct = ((pad.l + hover * barW + barW / 2) / w) * 100;
        return (
          <div
            className="pointer-events-none absolute top-2 w-40 rounded-md border px-3 py-2 text-[11px]"
            style={{
              left: `calc(${leftPct}% - 80px)`,
              background: dark ? '#1a1a1f' : '#fff',
              borderColor: dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)',
              boxShadow: dark ? '0 8px 24px rgba(0,0,0,.5)' : '0 8px 24px rgba(0,0,0,.08)',
              color: dark ? '#e6e6e9' : '#18181b',
              fontFamily: 'ui-monospace, Menlo, monospace',
            }}
          >
            <div className="mb-1 text-[10px] uppercase tracking-widest opacity-50">
              {hover === bins.length - 1 ? 'last hour' : b.label + ' ago'}
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">total</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{b.total}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#f87171' }}>● flagged</span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{b.flagged}</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
});

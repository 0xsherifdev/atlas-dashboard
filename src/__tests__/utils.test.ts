import { describe, it, expect } from 'vitest';
import { fmtCcy, fmtTime, initials, avatarColor, STATUS_META } from '@/lib/utils';

describe('fmtCcy', () => {
  it('formats NGN without decimals', () => {
    expect(fmtCcy(1500000, 'NGN')).toBe('₦1,500,000');
  });

  it('formats USD with 2 decimals', () => {
    expect(fmtCcy(250.5, 'USD')).toBe('$250.50');
  });

  it('formats short notation for large values', () => {
    expect(fmtCcy(12_500_000, 'NGN', true)).toBe('₦12.5M');
    expect(fmtCcy(350_000, 'NGN', true)).toBe('₦350.0K');
  });

  it('defaults to NGN', () => {
    expect(fmtCcy(1000)).toBe('₦1,000');
  });

  it('handles unknown currencies with code prefix', () => {
    expect(fmtCcy(100, 'CHF' as never)).toBe('CHF 100.00');
  });
});

describe('fmtTime', () => {
  const now = Date.now();

  it('formats seconds ago', () => {
    expect(fmtTime(now - 30_000, now)).toBe('30s ago');
  });

  it('formats minutes ago', () => {
    expect(fmtTime(now - 300_000, now)).toBe('5m ago');
  });

  it('formats hours ago', () => {
    expect(fmtTime(now - 7_200_000, now)).toBe('2h ago');
  });

  it('formats days ago', () => {
    expect(fmtTime(now - 172_800_000, now)).toBe('2d ago');
  });

  it('formats older dates as "Mon DD"', () => {
    // 30 days ago
    const result = fmtTime(now - 30 * 86_400_000, now);
    expect(result).toMatch(/[A-Z][a-z]{2} \d{1,2}/);
  });
});

describe('initials', () => {
  it('returns first letters of first two words', () => {
    expect(initials('Adebayo Adeyemi')).toBe('AA');
    expect(initials('Chioma Okonkwo')).toBe('CO');
  });

  it('handles single name', () => {
    expect(initials('Tolu')).toBe('T');
  });

  it('handles three+ names (takes first two)', () => {
    expect(initials('John Paul Smith')).toBe('JP');
  });
});

describe('avatarColor', () => {
  it('returns a consistent color for the same ID', () => {
    const a = avatarColor('C-10421');
    const b = avatarColor('C-10421');
    expect(a).toBe(b);
  });

  it('returns a hex color string', () => {
    expect(avatarColor('C-10422')).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('STATUS_META', () => {
  it('covers all 6 transaction statuses', () => {
    const statuses = ['completed', 'pending', 'flagged', 'blocked', 'review', 'reversed'] as const;
    statuses.forEach((s) => {
      expect(STATUS_META[s]).toBeDefined();
      expect(STATUS_META[s].variant).toBeTruthy();
      expect(STATUS_META[s].label).toBeTruthy();
    });
  });
});

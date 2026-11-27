import { dhakaDayRange, periodRange } from './date.util';

describe('Dhaka period boundaries', () => {
  it('starts the month at midnight Asia/Dhaka', () => { const r = periodRange('current_month', new Date('2026-11-25T12:00:00Z')); expect(r.gte?.toISOString()).toBe('2026-10-31T18:00:00.000Z'); expect(r.lt?.toISOString()).toBe('2026-11-30T18:00:00.000Z'); });
  it('handles January last month', () => { const r = periodRange('last_month', new Date('2026-01-15T00:00:00Z')); expect(r.gte?.toISOString()).toBe('2025-11-30T18:00:00.000Z'); });
  it('returns a single Dhaka calendar day range', () => { const r = dhakaDayRange('2026-11-25'); expect(r.gte.toISOString()).toBe('2026-11-24T18:00:00.000Z'); expect(r.lt.toISOString()).toBe('2026-11-25T18:00:00.000Z'); });
  it('supports a selected historical month', () => { const r = periodRange('2025-01', new Date('2026-11-25T12:00:00Z')); expect(r.gte?.toISOString()).toBe('2024-12-31T18:00:00.000Z'); expect(r.lt?.toISOString()).toBe('2025-01-31T18:00:00.000Z'); });
  it('rejects months before January 2025 and future months', () => { expect(() => periodRange('2024-12', new Date('2026-11-25T12:00:00Z'))).toThrow(); expect(() => periodRange('2026-12', new Date('2026-11-25T12:00:00Z'))).toThrow(); });
});

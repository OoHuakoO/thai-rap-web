import { describe, expect, it } from 'vitest';
import { formatDataDate, formatShortDataDate } from './format-data-date';

describe('formatDataDate', () => {
  it('converts a CE timestamp to a full Buddhist-era Thai date', () => {
    expect(formatDataDate('2026-05-20T00:00:00.000Z')).toBe('20 พฤษภาคม 2569');
  });

  it('keeps the Bangkok day for a timestamp late in the UTC day', () => {
    expect(formatDataDate('2026-05-20T20:00:00.000Z')).toBe('21 พฤษภาคม 2569');
  });

  it('returns an empty string for null', () => {
    expect(formatDataDate(null)).toBe('');
  });

  it('returns an empty string for undefined', () => {
    expect(formatDataDate(undefined)).toBe('');
  });

  it('returns an empty string for an unparseable value', () => {
    expect(formatDataDate('not-a-date')).toBe('');
  });
});

describe('formatShortDataDate', () => {
  it('uses the abbreviated Thai month with the Buddhist year', () => {
    expect(formatShortDataDate('2026-05-20T00:00:00.000Z')).toBe('20 พ.ค. 2569');
  });

  it('returns an empty string when there is no date', () => {
    expect(formatShortDataDate(null)).toBe('');
  });
});

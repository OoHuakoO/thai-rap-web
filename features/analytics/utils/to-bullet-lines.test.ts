import { describe, expect, it } from 'vitest';
import { toBulletLines } from './to-bullet-lines';
import { toRoundCode } from './round-code';

describe('toBulletLines', () => {
  it('splits one bullet per line', () => {
    expect(toBulletLines('บรรทัดหนึ่ง\nบรรทัดสอง')).toEqual(['บรรทัดหนึ่ง', 'บรรทัดสอง']);
  });

  it('drops blank lines so a trailing newline adds no empty bullet', () => {
    expect(toBulletLines('หนึ่ง\n\n สอง \n')).toEqual(['หนึ่ง', 'สอง']);
  });

  it('returns nothing when the API sends no analysis', () => {
    expect(toBulletLines(null)).toEqual([]);
    expect(toBulletLines('')).toEqual([]);
  });
});

describe('toRoundCode', () => {
  it('strips the qualifier from a projected round label', () => {
    expect(toRoundCode('T3 (เป้าหมาย)')).toBe('T3');
  });

  it('leaves a bare round code alone', () => {
    expect(toRoundCode('T0')).toBe('T0');
  });

  it('returns an empty string for a missing label', () => {
    expect(toRoundCode(undefined)).toBe('');
  });
});

import { describe, expect, it } from 'vitest';
import { stripDimensionPrefix, toNumberedDimensionLabel } from './dimension-label';

describe('stripDimensionPrefix', () => {
  it('removes a "1." prefix the API already applied', () => {
    expect(stripDimensionPrefix('1.การจัดการองค์กร')).toBe('การจัดการองค์กร');
  });

  it('removes a prefix written with a space', () => {
    expect(stripDimensionPrefix('2. การตลาด')).toBe('การตลาด');
  });

  it('leaves an unprefixed label untouched', () => {
    expect(stripDimensionPrefix('การเงิน ต้นทุน และกำไร')).toBe('การเงิน ต้นทุน และกำไร');
  });
});

describe('toNumberedDimensionLabel', () => {
  it('numbers from the axis position, not from the label', () => {
    expect(toNumberedDimensionLabel('การตลาดและฐานลูกค้า', 3)).toBe('4. การตลาดและฐานลูกค้า');
  });

  it('does not double up when the API already numbered the label', () => {
    expect(toNumberedDimensionLabel('1.การจัดการองค์กร', 0)).toBe('1. การจัดการองค์กร');
  });
});

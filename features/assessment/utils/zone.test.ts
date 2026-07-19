import { describe, it, expect } from 'vitest';
import { getZone, ZONE_DESCRIPTIONS, ZONE_COLORS, ZONE_BADGE_CLASSES } from './zone';

describe('getZone', () => {
  it('returns Red Zone below 40', () => {
    expect(getZone(0)).toBe('Red Zone');
    expect(getZone(39.9)).toBe('Red Zone');
  });

  it('returns Survival Zone from 40 up to 60', () => {
    expect(getZone(40)).toBe('Survival Zone');
    expect(getZone(59.9)).toBe('Survival Zone');
  });

  it('returns Improve Zone from 60 up to 75', () => {
    expect(getZone(60)).toBe('Improve Zone');
    expect(getZone(74.9)).toBe('Improve Zone');
  });

  it('returns Growth Zone from 75 up to 85', () => {
    expect(getZone(75)).toBe('Growth Zone');
    expect(getZone(84.9)).toBe('Growth Zone');
  });

  it('returns Model Zone at 85 and above', () => {
    expect(getZone(85)).toBe('Model Zone');
    expect(getZone(100)).toBe('Model Zone');
  });
});

describe('zone lookup tables', () => {
  it('has a description, color, and badge class for every zone getZone can return', () => {
    const zones = [0, 40, 60, 75, 85].map(getZone);
    for (const zone of zones) {
      expect(ZONE_DESCRIPTIONS[zone]).toBeTruthy();
      const color = ZONE_COLORS[zone];
      expect(color).toBeTruthy();
      expect(ZONE_BADGE_CLASSES[color]).toBeTruthy();
    }
  });
});

import { describe, it, expect } from 'vitest';
import { clamp01, computeGain } from '../src/utils/math';

describe('音频增益换算（纯函数）', () => {
  it('clamp01 限制到 0~1', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.5)).toBe(0.5);
  });

  it('computeGain = master × track', () => {
    expect(computeGain(0.8, 0.5)).toBeCloseTo(0.4);
    expect(computeGain(1, 1)).toBeCloseTo(1);
    expect(computeGain(0, 1)).toBeCloseTo(0);
  });
});

import { describe, it, expect } from 'vitest';
import { hasSupportBelow, isFallen } from '../src/physics/SupportSystem';

describe('hasSupportBelow 支撑探测', () => {
  const beam = { minX: 0, minY: 90, maxX: 100, maxY: 100 }; // 底面 y=100

  it('支撑体顶面在实体底部附近且有重叠时判定有支撑', () => {
    expect(hasSupportBelow(beam, [{ minX: -50, minY: 100, maxX: 150, maxY: 110 }], 4)).toBe(true);
  });

  it('支撑面低于容差时判定无支撑', () => {
    expect(hasSupportBelow(beam, [{ minX: -50, minY: 110, maxX: 150, maxY: 120 }], 4)).toBe(false);
  });

  it('水平投影重叠不足时判定无支撑', () => {
    expect(hasSupportBelow(beam, [{ minX: 90, minY: 100, maxX: 95, maxY: 110 }], 4)).toBe(false);
  });

  it('支撑体完全在实体上方时不算支撑', () => {
    expect(hasSupportBelow(beam, [{ minX: 0, minY: 80, maxX: 100, maxY: 90 }], 4)).toBe(false);
  });
});

describe('isFallen 坠落判定', () => {
  it('向下位移未超过阈值不触发', () => {
    expect(isFallen(100, 129, 30)).toBe(false);
    expect(isFallen(100, 130, 30)).toBe(false);
  });

  it('向下位移超过阈值触发', () => {
    expect(isFallen(100, 131, 30)).toBe(true);
  });
});

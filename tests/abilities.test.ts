import { describe, it, expect } from 'vitest';
import { boostVelocity, splitVelocities } from '../src/utils/math';

describe('boostVelocity 加速', () => {
  it('保持方向并按倍率提速', () => {
    const v = boostVelocity({ x: 3, y: 4 }, 1.6, 45);
    expect(v.x).toBeCloseTo(4.8);
    expect(v.y).toBeCloseTo(6.4);
  });

  it('速度钳制到上限', () => {
    const v = boostVelocity({ x: 30, y: 0 }, 2, 45);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(45);
    expect(v.x).toBeCloseTo(45);
  });

  it('零速度加速仍为零', () => {
    const v = boostVelocity({ x: 0, y: 0 }, 1.6, 45);
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });
});

describe('splitVelocities 分裂', () => {
  it('生成指定数量且中间保持原速度', () => {
    const vels = splitVelocities({ x: 10, y: 0 }, 3, 0.12, 0.95);
    expect(vels.length).toBe(3);
    expect(vels[1].x).toBeCloseTo(10);
    expect(vels[1].y).toBeCloseTo(0);
  });

  it('两侧按展开角旋转且速度缩小', () => {
    const vels = splitVelocities({ x: 10, y: 0 }, 3, 0.12, 0.95);
    expect(vels[0].y).toBeLessThan(0); // 上方（-spread）
    expect(vels[2].y).toBeGreaterThan(0); // 下方（+spread）
    expect(Math.hypot(vels[0].x, vels[0].y)).toBeCloseTo(9.5);
    expect(Math.hypot(vels[2].x, vels[2].y)).toBeCloseTo(9.5);
  });
});

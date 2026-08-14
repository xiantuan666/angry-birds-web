import { describe, it, expect } from 'vitest';
import { computeLaunchVelocity } from '../src/utils/math';

describe('computeLaunchVelocity 弹射公式', () => {
  it('力度比例过低返回 null（放回弹弓不消耗）', () => {
    const r = computeLaunchVelocity({ x: 0, y: 0 }, { x: -5, y: 0 }, 20, 110, 24, 0.12);
    expect(r).toBeNull();
  });

  it('满拉返回按比例的最大速度且方向正确', () => {
    const r = computeLaunchVelocity({ x: 0, y: 0 }, { x: -110, y: 0 }, 20, 110, 24, 0.12);
    expect(r).not.toBeNull();
    expect(r!.velocity.x).toBeCloseTo(20);
    expect(r!.velocity.y).toBeCloseTo(0);
    expect(r!.ratio).toBeCloseTo(1);
  });

  it('速度不超过上限', () => {
    const r = computeLaunchVelocity({ x: 0, y: 0 }, { x: -110, y: 0 }, 30, 110, 24, 0.12);
    expect(r!.velocity.x).toBeLessThanOrEqual(24);
  });
});

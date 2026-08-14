import { describe, it, expect } from 'vitest';
import { predictTrajectory } from '../src/utils/math';

describe('predictTrajectory 轨迹预测', () => {
  it('返回指定数量的采样点', () => {
    const pts = predictTrajectory({ x: 0, y: 0 }, { x: 10, y: 0 }, 1000, 30, 0.08);
    expect(pts.length).toBe(30);
  });

  it('水平速度恒定，垂直向下加速', () => {
    const pts = predictTrajectory({ x: 0, y: 0 }, { x: 10, y: 0 }, 1000, 10, 0.1);
    expect(pts[9].x).toBeCloseTo(10);
    expect(pts[9].y).toBeGreaterThan(pts[0].y);
    expect(pts[9].y).toBeGreaterThan(pts[1].y);
  });
});

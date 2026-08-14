import { describe, it, expect, vi } from 'vitest';
import { ScoreManager } from '../src/score/ScoreManager';
import { SCORE } from '../src/config/score';
import { level01 } from '../src/levels/level01';
import { TARGETS } from '../src/config/characters';
import { MATERIALS } from '../src/config/physics';

describe('ScoreManager 计分', () => {
  it('重置后得分为 0', () => {
    const s = new ScoreManager();
    expect(s.getScore()).toBe(0);
  });

  it('连击窗口内乘数递增且封顶', () => {
    const s = new ScoreManager();
    vi.useFakeTimers();
    const p1 = s.addDestruction(100);
    vi.advanceTimersByTime(100);
    const p2 = s.addDestruction(100);
    vi.advanceTimersByTime(100);
    const p3 = s.addDestruction(100);
    vi.advanceTimersByTime(100);
    const p4 = s.addDestruction(100);
    vi.advanceTimersByTime(100);
    const p5 = s.addDestruction(100);
    expect(p1).toBe(100);
    expect(p2).toBe(125);
    expect(p3).toBe(150);
    expect(p4).toBe(175);
    expect(p5).toBe(200);
    const s2 = new ScoreManager();
    let last = 0;
    for (let i = 0; i < 9; i++) {
      vi.advanceTimersByTime(100);
      last = s2.addDestruction(100);
    }
    expect(last).toBe(300);
    vi.useRealTimers();
  });

  it('超过连击窗口后重置连击', () => {
    const s = new ScoreManager();
    vi.useFakeTimers();
    s.addDestruction(100);
    vi.advanceTimersByTime(SCORE.comboWindowMs + 10);
    const p = s.addDestruction(100);
    expect(p).toBe(100);
    vi.useRealTimers();
  });

  it('百分比星级边界（30/60/80）', () => {
    expect(ScoreManager.calculateStarsByPercent(0, 1000)).toBe(0);
    expect(ScoreManager.calculateStarsByPercent(299, 1000)).toBe(0);
    expect(ScoreManager.calculateStarsByPercent(300, 1000)).toBe(1);
    expect(ScoreManager.calculateStarsByPercent(599, 1000)).toBe(1);
    expect(ScoreManager.calculateStarsByPercent(600, 1000)).toBe(2);
    expect(ScoreManager.calculateStarsByPercent(799, 1000)).toBe(2);
    expect(ScoreManager.calculateStarsByPercent(800, 1000)).toBe(3);
    expect(ScoreManager.calculateStarsByPercent(1000, 1000)).toBe(3);
  });

  it('满分为 0 时按有分即三星兜底', () => {
    expect(ScoreManager.calculateStarsByPercent(0, 0)).toBe(0);
    expect(ScoreManager.calculateStarsByPercent(500, 0)).toBe(3);
  });

  it('关卡满分 = 全部猪 + 全部方块', () => {
    const max = ScoreManager.calculateLevelMaxScore(level01);
    const targetsTotal = level01.targets.reduce((s, t) => s + (TARGETS[t.type]?.scoreValue ?? 0), 0);
    const blocksTotal = level01.blocks.reduce((s, b) => s + (MATERIALS[b.material as keyof typeof MATERIALS]?.score ?? 0), 0);
    expect(max).toBe(targetsTotal + blocksTotal);
    expect(max).toBeGreaterThan(0);
  });
});

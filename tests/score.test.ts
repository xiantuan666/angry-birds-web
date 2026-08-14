import { describe, it, expect, vi } from 'vitest';
import { ScoreManager } from '../src/score/ScoreManager';
import { SCORE } from '../src/config/score';

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
    // 连击 9 次到达封顶 3.0 倍
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

  it('星级按关卡阈值计算', () => {
    const t: [number, number, number] = [2000, 3200, 4500];
    expect(ScoreManager.calculateStars(1000, t)).toBe(0);
    expect(ScoreManager.calculateStars(2000, t)).toBe(1);
    expect(ScoreManager.calculateStars(3200, t)).toBe(2);
    expect(ScoreManager.calculateStars(4500, t)).toBe(3);
  });
});

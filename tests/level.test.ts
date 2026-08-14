import { describe, it, expect } from 'vitest';
import { level01 } from '../src/levels/level01';
import { CHARACTERS, TARGETS } from '../src/config/characters';
import { MATERIALS } from '../src/config/physics';
import { GAME } from '../src/config/game';

describe('关卡数据合法性', () => {
  it('第 1 关角色配置存在', () => {
    for (const p of level01.projectiles) {
      expect(CHARACTERS[p]).toBeDefined();
    }
  });

  it('目标类型配置存在', () => {
    for (const t of level01.targets) {
      expect(TARGETS[t.type]).toBeDefined();
    }
  });

  it('方块材质存在且在界内', () => {
    for (const b of level01.blocks) {
      expect(MATERIALS[b.material as keyof typeof MATERIALS]).toBeDefined();
      expect(b.x).toBeGreaterThan(0);
      expect(b.x).toBeLessThan(GAME.WORLD_WIDTH);
    }
  });

  it('至少 2 目标 / 5 方块，第 1 关为 6 只含黑白的混合鸟', () => {
    expect(level01.targets.length).toBeGreaterThanOrEqual(2);
    expect(level01.blocks.length).toBeGreaterThanOrEqual(5);
    expect(level01.projectiles.length).toBe(6);
    expect(level01.projectiles).toContain('red');
    expect(level01.projectiles).toContain('yellow');
    expect(level01.projectiles).toContain('blue');
    expect(level01.projectiles).toContain('black');
    expect(level01.projectiles).toContain('white');
  });
});

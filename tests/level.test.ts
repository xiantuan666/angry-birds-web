import { describe, it, expect } from 'vitest';
import { level01 } from '../src/levels/level01';
import { level02 } from '../src/levels/level02';
import { level03 } from '../src/levels/level03';
import { level04 } from '../src/levels/level04';
import { level05 } from '../src/levels/level05';
import { level06 } from '../src/levels/level06';
import { level07 } from '../src/levels/level07';
import { CHARACTERS, TARGETS } from '../src/config/characters';
import { MATERIALS } from '../src/config/physics';
import { GAME } from '../src/config/game';

const LEVELS = [level01, level02, level03, level04, level05, level06, level07];

describe('关卡数据合法性', () => {
  it('各关卡角色配置存在', () => {
    for (const lv of LEVELS) {
      for (const p of lv.projectiles) {
        expect(CHARACTERS[p], `${lv.id} 缺少角色 ${p}`).toBeDefined();
      }
    }
  });

  it('各关卡目标类型存在', () => {
    for (const lv of LEVELS) {
      for (const t of lv.targets) {
        expect(TARGETS[t.type], `${lv.id} 缺少目标 ${t.type}`).toBeDefined();
      }
    }
  });

  it('各关卡方块材质存在且在界内', () => {
    for (const lv of LEVELS) {
      for (const b of lv.blocks) {
        expect(MATERIALS[b.material as keyof typeof MATERIALS], `${lv.id} 缺少材质 ${b.material}`).toBeDefined();
        expect(b.x, `${lv.id} 方块越界`).toBeGreaterThan(0);
        expect(b.x, `${lv.id} 方块越界`).toBeLessThan(GAME.WORLD_WIDTH);
      }
    }
  });

  it('第 1 关 6 只含黑白', () => {
    expect(level01.projectiles.length).toBe(6);
    for (const c of ['red', 'yellow', 'blue', 'black', 'white']) {
      expect(level01.projectiles).toContain(c);
    }
  });

  it('第 2 关 4 只鸟（红红黄蓝）4 猪且含玻璃', () => {
    expect(level02.projectiles).toEqual(['red', 'red', 'yellow', 'blue']);
    expect(level02.targets.length).toBeGreaterThanOrEqual(4);
    expect(level02.blocks.some((b) => b.material === 'glass')).toBe(true);
  });

  it('第 3 关 5 只鸟全能力 5 猪且含头盔/猪王', () => {
    expect(level03.projectiles.length).toBe(5);
    expect(new Set(level03.projectiles).size).toBe(5);
    expect(level03.targets.length).toBeGreaterThanOrEqual(5);
    expect(level03.targets.some((t) => t.type === 'helmet')).toBe(true);
    expect(level03.targets.some((t) => t.type === 'king')).toBe(true);
  });

  it('第 1 关至少 2 目标 / 5 方块', () => {
    expect(level01.targets.length).toBeGreaterThanOrEqual(2);
    expect(level01.blocks.length).toBeGreaterThanOrEqual(5);
  });

  it('每关至少 3 种不同猪类型（多样化）', () => {
    for (const lv of LEVELS) {
      const types = new Set(lv.targets.map((t) => t.type));
      expect(types.size, `${lv.id} 猪类型不足 3 种`).toBeGreaterThanOrEqual(3);
    }
  });

  it('pig4 / pig5 目标类型已配置', () => {
    expect(TARGETS['pig4']).toBeDefined();
    expect(TARGETS['pig5']).toBeDefined();
    expect(TARGETS['pig4'].health).toBe(70);
    expect(TARGETS['pig4'].scoreValue).toBe(550);
    expect(TARGETS['pig5'].health).toBe(70);
    expect(TARGETS['pig5'].scoreValue).toBe(550);
  });
});

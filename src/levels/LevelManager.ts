/** 关卡管理器：加载/重开/下一关/卸载（新增关卡只需注册数据，不改核心逻辑）。 */
import type { LevelConfig } from './Level';
import { level01 } from './level01';

const LEVELS: Record<number, LevelConfig> = {
  1: level01,
};

/** 已注册的关卡数（Level Select 显示用） */
export const LEVEL_COUNT = Object.keys(LEVELS).length;

export class LevelManager {
  private current: LevelConfig | null = null;

  getCurrent(): LevelConfig | null {
    return this.current;
  }

  getLevel(id: number): LevelConfig | undefined {
    return LEVELS[id];
  }

  loadLevel(id: number): LevelConfig {
    const level = LEVELS[id];
    if (!level) throw new Error(`关卡不存在: ${id}`);
    this.current = level;
    return level;
  }

  restartLevel(): LevelConfig | null {
    return this.current;
  }

  hasNext(id: number): boolean {
    return LEVELS[id + 1] !== undefined;
  }
}

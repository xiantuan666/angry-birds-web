/** 第六关：三塔阵（石塔 + 木高台 + 玻璃碉堡），6 鸟 6 猪。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level06: LevelConfig = {
  id: 6,
  name: '第六关 · 三塔阵',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'red', 'yellow', 'blue', 'black', 'white'],
  targets: [
    { type: 'basic', x: 900, y: GY - 22 },
    { type: 'pig4', x: 900, y: 753 },
    { type: 'helmet', x: 1250, y: GY - 22 },
    { type: 'pig5', x: 1250, y: 792 },
    { type: 'king', x: 1550, y: 899 },
    { type: 'basic', x: 1750, y: GY - 22 },
  ],
  blocks: [
    // 石塔
    { material: 'stone', x: 860, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 940, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 900, y: 788, width: 130, height: 26 },
    // 木高台
    { material: 'wood', x: 1200, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1300, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1250, y: 826, width: 140, height: 24 },
    // 玻璃碉堡（木框架）：藏猪王
    { material: 'wood', x: 1550, y: GY - 16, width: 130, height: 16 },
    { material: 'wood', x: 1488, y: GY - 56, width: 24, height: 70 },
    { material: 'wood', x: 1612, y: GY - 56, width: 24, height: 70 },
    { material: 'wood', x: 1550, y: 865, width: 130, height: 12 },
    // 装饰与空地
    { material: 'glass', x: 820, y: GY - 12, width: 40, height: 24 },
    { material: 'wood', x: 1350, y: GY - 12, width: 60, height: 24 },
    { material: 'glass', x: 1700, y: GY - 12, width: 50, height: 24 },
  ],
};

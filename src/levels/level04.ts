/** 第四关：双层木屋 + 石基掩体 + 空地，5 鸟 5 猪。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level04: LevelConfig = {
  id: 4,
  name: '第四关 · 双层木屋',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'yellow', 'blue', 'black', 'white'],
  targets: [
    { type: 'basic', x: 975, y: GY - 22 },
    { type: 'pig4', x: 975, y: 792 },
    { type: 'king', x: 975, y: 695 },
    { type: 'helmet', x: 1450, y: 752 },
    { type: 'pig5', x: 1250, y: GY - 22 },
  ],
  blocks: [
    // 双层木塔：木柱 + 中梁 + 上柱 + 顶梁
    { material: 'wood', x: 900, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1050, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 975, y: 826, width: 220, height: 24 },
    { material: 'wood', x: 930, y: 779, width: 26, height: 70 },
    { material: 'wood', x: 1020, y: 779, width: 26, height: 70 },
    { material: 'wood', x: 975, y: 730, width: 140, height: 22 },
    // 石基掩体：石柱 + 石梁
    { material: 'stone', x: 1400, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1500, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1450, y: 788, width: 160, height: 26 },
    // 空地：玻璃掩体 + 木块
    { material: 'glass', x: 1190, y: GY - 12, width: 60, height: 24 },
    { material: 'wood', x: 1330, y: GY - 12, width: 60, height: 24 },
  ],
};

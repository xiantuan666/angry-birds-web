/** 第五关：双木棚 + 木高台 + 玻璃碉堡，5 鸟 6 猪。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level05: LevelConfig = {
  id: 5,
  name: '第五关 · 玻璃迷宫',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'yellow', 'blue', 'black', 'white'],
  targets: [
    { type: 'pig4', x: 900, y: GY - 22 },
    { type: 'basic', x: 1100, y: GY - 22 },
    { type: 'helmet', x: 1450, y: 791 },
    { type: 'king', x: 1250, y: 899 },
    { type: 'pig5', x: 1650, y: GY - 22 },
    { type: 'basic', x: 1720, y: GY - 22 },
  ],
  blocks: [
    // 双木棚：两组柱 + 顶梁，中间玻璃墙
    { material: 'wood', x: 855, y: GY - 40, width: 30, height: 80 },
    { material: 'wood', x: 945, y: GY - 40, width: 30, height: 80 },
    { material: 'wood', x: 900, y: 856, width: 130, height: 22 },
    { material: 'wood', x: 1055, y: GY - 40, width: 30, height: 80 },
    { material: 'wood', x: 1145, y: GY - 40, width: 30, height: 80 },
    { material: 'wood', x: 1100, y: 856, width: 130, height: 22 },
    { material: 'glass', x: 1000, y: GY - 30, width: 14, height: 60 },
    // 木高台
    { material: 'wood', x: 1400, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1500, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1450, y: 826, width: 140, height: 24 },
    // 玻璃碉堡（木框架）：藏猪王
    { material: 'wood', x: 1250, y: GY - 16, width: 130, height: 16 },
    { material: 'wood', x: 1188, y: GY - 56, width: 24, height: 70 },
    { material: 'wood', x: 1312, y: GY - 56, width: 24, height: 70 },
    { material: 'wood', x: 1250, y: 865, width: 130, height: 12 },
    // 空地玻璃护盾
    { material: 'glass', x: 1600, y: GY - 12, width: 50, height: 24 },
  ],
};

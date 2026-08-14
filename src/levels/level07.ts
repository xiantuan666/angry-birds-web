/** 第七关：最终决战 —— 大城堡 + 木高台 + 玻璃碉堡，6 鸟 7 猪（含双猪王）。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level07: LevelConfig = {
  id: 7,
  name: '第七关 · 最终决战',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'red', 'yellow', 'blue', 'black', 'white'],
  targets: [
    { type: 'king', x: 990, y: 597 },
    { type: 'basic', x: 930, y: GY - 22 },
    { type: 'pig4', x: 1050, y: GY - 22 },
    { type: 'helmet', x: 1395, y: 641 },
    { type: 'pig5', x: 1395, y: GY - 22 },
    { type: 'king', x: 1650, y: 749 },
    { type: 'basic', x: 1750, y: GY - 22 },
  ],
  blocks: [
    // 大城堡：石柱 + 石梁
    { material: 'stone', x: 900, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1080, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 990, y: 638, width: 220, height: 26 },
    // 木高台
    { material: 'wood', x: 1340, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1450, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1395, y: 676, width: 150, height: 24 },
    // 玻璃碉堡（木框架）：藏第二只猪王
    { material: 'wood', x: 1650, y: GY - 16, width: 130, height: 16 },
    { material: 'wood', x: 1588, y: GY - 56, width: 24, height: 70 },
    { material: 'wood', x: 1712, y: GY - 56, width: 24, height: 70 },
    { material: 'wood', x: 1650, y: 715, width: 130, height: 12 },
    // 装饰与空地
    { material: 'glass', x: 820, y: GY - 12, width: 50, height: 24 },
    { material: 'glass', x: 1180, y: GY - 12, width: 40, height: 24 },
    { material: 'glass', x: 1220, y: GY - 40, width: 16, height: 56 },
    { material: 'wood', x: 1790, y: GY - 12, width: 60, height: 24 },
    { material: 'glass', x: 1810, y: GY - 40, width: 16, height: 56 },
  ],
};

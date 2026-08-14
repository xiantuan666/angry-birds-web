/** 第三关：石基高塔 + 玻璃碉堡 + 空地，五种能力全可用，较难。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level03: LevelConfig = {
  id: 3,
  name: '第三关 · 石塔与碉堡',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'yellow', 'blue', 'black', 'white'],
  targets: [
    { type: 'king', x: 1020, y: 660 },
    { type: 'basic', x: 1020, y: GY - 22 },
    { type: 'helmet', x: 1460, y: GY - 47 },
    { type: 'basic', x: 1540, y: GY - 46 },
    { type: 'basic', x: 1330, y: GY - 22 },
  ],
  blocks: [
    // 石基高塔：石柱 + 石梁 + 木上柱 + 木顶台
    { material: 'stone', x: 960, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1080, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1020, y: 788, width: 160, height: 26 },
    { material: 'wood', x: 990, y: 740, width: 24, height: 70 },
    { material: 'wood', x: 1050, y: 740, width: 24, height: 70 },
    { material: 'wood', x: 1020, y: 693, width: 120, height: 22 },
    // 玻璃碉堡：底 + 两墙 + 顶，内藏两只猪
    { material: 'glass', x: 1500, y: GY - 16, width: 180, height: 16 },
    { material: 'glass', x: 1408, y: GY - 60, width: 12, height: 60 },
    { material: 'glass', x: 1592, y: GY - 60, width: 12, height: 60 },
    { material: 'glass', x: 1500, y: 860, width: 190, height: 12 },
    // 空地掩体
    { material: 'wood', x: 1200, y: GY - 12, width: 60, height: 24 },
    { material: 'stone', x: 1250, y: GY - 16, width: 40, height: 32 },
  ],
};

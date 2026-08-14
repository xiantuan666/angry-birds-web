/** 第三关：石塔 + 木框架玻璃碉堡 + 空地，5 只猪 5 种类型，五种能力全可用。 */
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
    { type: 'king', x: 1020, y: 748 },
    { type: 'basic', x: 1020, y: GY - 22 },
    { type: 'helmet', x: 1450, y: GY - 47 },
    { type: 'pig4', x: 1550, y: GY - 46 },
    { type: 'pig5', x: 1310, y: GY - 22 },
  ],
  blocks: [
    // 石塔：两根石柱 + 石梁（梁底嵌入柱顶 2px），塔顶猪王
    { material: 'stone', x: 960, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1080, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1020, y: 784, width: 160, height: 26 },
    // 木框架碉堡：木底 + 木墙 + 木顶，内藏两只猪；玻璃作正面护盾与装饰
    { material: 'wood', x: 1500, y: GY - 16, width: 220, height: 16 },
    { material: 'wood', x: 1390, y: GY - 62, width: 30, height: 76 },
    { material: 'wood', x: 1610, y: GY - 62, width: 30, height: 76 },
    { material: 'wood', x: 1500, y: 838, width: 250, height: 16 },
    // 玻璃：碉堡正面护盾 + 空地掩体
    { material: 'glass', x: 1330, y: GY - 12, width: 60, height: 24 },
    { material: 'glass', x: 1320, y: GY - 40, width: 16, height: 56 },
    { material: 'glass', x: 1680, y: GY - 12, width: 40, height: 24 },
  ],
};

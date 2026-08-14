/** 第二关：木棚 + 玻璃侧墙 + 木平台，4 只猪 4 种类型，玻璃材质。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level02: LevelConfig = {
  id: 2,
  name: '第二关 · 玻璃棚',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'red', 'yellow', 'blue'],
  targets: [
    { type: 'pig4', x: 940, y: GY - 22 },
    { type: 'basic', x: 1010, y: GY - 22 },
    { type: 'helmet', x: 1460, y: 791 },
    { type: 'pig5', x: 1290, y: GY - 22 },
  ],
  blocks: [
    // 木棚：两根木柱 + 顶梁（顶梁底嵌入柱顶 2px 保证稳定），棚内两只猪
    { material: 'wood', x: 900, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1050, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 975, y: 826, width: 220, height: 24 },
    // 玻璃侧墙（柱外侧，不重叠）
    { material: 'glass', x: 875, y: GY - 30, width: 12, height: 60 },
    { material: 'glass', x: 1075, y: GY - 30, width: 12, height: 60 },
    // 木平台：两根木柱 + 平台（平台底嵌入柱顶 2px），猪在平台上
    { material: 'wood', x: 1420, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1500, y: GY - 55, width: 30, height: 110 },
    { material: 'wood', x: 1460, y: 826, width: 130, height: 24 },
    // 空地猪5的玻璃掩体
    { material: 'glass', x: 1220, y: GY - 12, width: 50, height: 24 },
  ],
};

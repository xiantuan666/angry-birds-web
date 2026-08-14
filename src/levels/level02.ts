/** 第二关：玻璃三角棚（Λ）+ 木平台 + 空地小猪，引入玻璃材质与黄/蓝能力。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level02: LevelConfig = {
  id: 2,
  name: '第二关 · 玻璃三角',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'red', 'yellow', 'blue'],
  targets: [
    { type: 'basic', x: 900, y: GY - 46 },
    { type: 'basic', x: 1000, y: GY - 46 },
    { type: 'basic', x: 1460, y: 824 },
    { type: 'basic', x: 1280, y: GY - 22 },
  ],
  blocks: [
    // 玻璃三角棚 Λ：底木梁 + 两块玻璃斜梁 + 木顶
    { material: 'wood', x: 950, y: GY - 15, width: 240, height: 18 },
    { material: 'glass', x: 880, y: GY - 82, width: 160, height: 22, rotation: 0.6 },
    { material: 'glass', x: 1020, y: GY - 82, width: 160, height: 22, rotation: -0.6 },
    { material: 'wood', x: 950, y: 808, width: 28, height: 28 },
    // 木平台（两根木柱 + 平台 + 猪）
    { material: 'wood', x: 1420, y: GY - 40, width: 26, height: 80 },
    { material: 'wood', x: 1500, y: GY - 40, width: 26, height: 80 },
    { material: 'wood', x: 1460, y: 858, width: 130, height: 24 },
    // 空地小猪的玻璃掩体
    { material: 'glass', x: 1210, y: GY - 12, width: 50, height: 24 },
  ],
};

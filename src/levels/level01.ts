/** 第一关：经典结构（两根石柱 + 木梁 + 三只小猪，木结构第二平台）。 */
import type { LevelConfig } from './Level';
import { GAME } from '../config/game';

const GY = GAME.GROUND_Y;

export const level01: LevelConfig = {
  id: 1,
  name: '第一关 · 初试身手',
  world: { width: GAME.WORLD_WIDTH, height: GAME.WORLD_HEIGHT },
  launcher: { x: 200, y: GY - GAME.LAUNCHER_HEIGHT },
  projectiles: ['red', 'red', 'red'],
  targets: [
    { type: 'basic', x: 1050, y: GY - 22 },
    { type: 'basic', x: 1050, y: 768 },
    { type: 'basic', x: 1450, y: 834 },
  ],
  blocks: [
    { material: 'stone', x: 960, y: GY - 75, width: 30, height: 150 },
    { material: 'stone', x: 1140, y: GY - 75, width: 30, height: 150 },
    { material: 'wood', x: 1050, y: 808, width: 240, height: 28 },
    { material: 'wood', x: 1400, y: GY - 40, width: 26, height: 80 },
    { material: 'wood', x: 1500, y: GY - 40, width: 26, height: 80 },
    { material: 'wood', x: 1450, y: 870, width: 130, height: 24 },
  ],
  starThresholds: [2000, 3000, 4200],
};

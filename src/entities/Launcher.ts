/** 弹弓：锚点 + 最大拉弓距离 + 当前弹弓上的角色刚体。 */
import Matter from 'matter-js';
import { GAME } from '../config/game';

export interface PullInfo {
  /** 指向发射方向的单位向量（anchor - pullPos 归一化） */
  direction: { x: number; y: number };
  distance: number;
  /** 0~1 拉弓比例 */
  ratio: number;
}

export class Launcher {
  readonly anchor: { x: number; y: number };
  readonly maxPullDistance: number;
  current: Matter.Body | null = null;

  constructor(x: number, y: number) {
    this.anchor = { x, y };
    this.maxPullDistance = GAME.MAX_PULL_DISTANCE;
  }

  /** 根据角色当前位置计算拉弓信息 */
  getPull(pullPos: { x: number; y: number }): PullInfo {
    const dx = this.anchor.x - pullPos.x;
    const dy = this.anchor.y - pullPos.y;
    const distance = Math.hypot(dx, dy);
    const clamped = Math.min(distance, this.maxPullDistance);
    const dirX = distance > 0 ? dx / distance : 1;
    const dirY = distance > 0 ? dy / distance : 0;
    return { direction: { x: dirX, y: dirY }, distance: clamped, ratio: clamped / this.maxPullDistance };
  }
}

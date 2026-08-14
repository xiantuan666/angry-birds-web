/** 支撑丢失检测 + 猪坠落判定：保证“失去支撑必倒”，猪坠落即摧毁得分。 */
import Matter from 'matter-js';
import { GAME } from '../config/game';
import { EventBus } from '../core/EventBus';
import type { Entity } from '../entities/Entity';
import type { Target } from '../entities/Target';
import type { PhysicsWorld } from './PhysicsWorld';

export interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 纯函数：实体底部是否被任一支撑体托住（供单元测试）。 */
export function hasSupportBelow(
  entity: Box,
  supports: Box[],
  gap: number,
  overlapRatio = 0.2,
): boolean {
  const bottom = entity.maxY;
  const width = Math.max(1, entity.maxX - entity.minX);
  for (const s of supports) {
    if (s.maxY < bottom - 2) continue; // 支撑体完全在实体底部之上，不算支撑
    if (s.minY > bottom + gap) continue; // 支撑面低于实体底部超过容差
    const overlap = Math.min(entity.maxX, s.maxX) - Math.max(entity.minX, s.minX);
    if (overlap >= width * overlapRatio) return true;
  }
  return false;
}

/** 纯函数：猪是否已“坠落”（向下位移超过阈值，供单元测试）。 */
export function isFallen(spawnY: number, y: number, threshold: number): boolean {
  return y - spawnY > threshold;
}

export class SupportSystem {
  constructor(private readonly world: PhysicsWorld) {}

  private toBox(b: Matter.Body): Box {
    return {
      minX: b.bounds.min.x,
      minY: b.bounds.min.y,
      maxX: b.bounds.max.x,
      maxY: b.bounds.max.y,
    };
  }

  /** 唤醒失去支撑的睡眠刚体（方块/猪），让重力自然使其倒下。 */
  wakeUnsupported(entities: Entity[]): void {
    const bodies = this.world.getBodies();
    for (const e of entities) {
      if (e.destroyed || !e.active) continue;
      if (e.type !== 'block' && e.type !== 'target') continue;
      if (!e.body.isSleeping) continue;
      const selfBox = this.toBox(e.body);
      const supports = bodies.filter((b) => b !== e.body).map((b) => this.toBox(b));
      if (!hasSupportBelow(selfBox, supports, GAME.SUPPORT_GAP)) {
        Matter.Sleeping.set(e.body, false);
      }
    }
  }

  /** 猪坠落判定：向下位移超过阈值即摧毁并得分（走 TARGET_DESTROYED 管线）。 */
  checkFallenTargets(targets: Target[], bus: EventBus): void {
    for (const t of targets) {
      if (t.destroyed || !t.active) continue;
      if (isFallen(t.spawnY, t.body.position.y, GAME.FALL_DISTANCE)) {
        t.destroy();
        t.markForRemoval();
        bus.emit('TARGET_DESTROYED', {
          entityId: t.id,
          x: t.body.position.x,
          y: t.body.position.y,
          score: t.scoreValue,
        });
      }
    }
  }
}

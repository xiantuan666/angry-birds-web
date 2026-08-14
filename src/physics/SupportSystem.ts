/** 支撑丢失级联唤醒 + 猪坠落判定：保证“失去支撑必倒、支撑变化重新沉降”。 */
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

/** 纯函数：支撑集合相比上一帧是否发生了“丢失”（有原支撑消失）→ 应唤醒重新沉降。 */
export function shouldWakeOnSupportChange(prevIds: string[], currIds: string[]): boolean {
  if (prevIds.length === 0) return false;
  return prevIds.some((id) => !currIds.includes(id));
}

/** 纯函数：猪是否已“坠落”（向下位移超过阈值，供单元测试）。 */
export function isFallen(spawnY: number, y: number, threshold: number): boolean {
  return y - spawnY > threshold;
}

interface SupportInfo {
  id: string;
  box: Box;
}

export class SupportSystem {
  private readonly supportSig = new Map<string, string>();

  constructor(private readonly world: PhysicsWorld) {}

  private toBox(b: Matter.Body): Box {
    return {
      minX: b.bounds.min.x,
      minY: b.bounds.min.y,
      maxX: b.bounds.max.x,
      maxY: b.bounds.max.y,
    };
  }

  /** 每帧：对睡眠/近静止的方块与猪检测支撑；无支撑或支撑丢失 → 唤醒（让其自然倒下/重新沉降）。 */
  wakeUnsupported(entities: Entity[]): void {
    const bodies = this.world.getBodies();
    const supports: SupportInfo[] = [];
    for (const b of bodies) {
      const plugin = b.plugin as { entityType?: string; isEgg?: boolean } | undefined;
      if (plugin?.entityType === 'projectile') continue; // 角色不算支撑
      if (plugin?.isEgg) continue;
      if (!b.isStatic && Math.hypot(b.velocity.x, b.velocity.y) > 1.0) continue; // 高速动态体不算支撑
      supports.push({ id: (b.plugin as { entityId?: string } | undefined)?.entityId ?? `body_${b.id}`, box: this.toBox(b) });
    }

    for (const e of entities) {
      if (e.destroyed || !e.active) continue;
      if (e.type !== 'block' && e.type !== 'target') continue;
      const body = e.body;
      const resting = body.isSleeping || Math.hypot(body.velocity.x, body.velocity.y) < GAME.REST_SPEED;
      if (!resting) {
        this.supportSig.delete(e.id);
        continue;
      }

      const selfBox = this.toBox(body);
      const current: string[] = [];
      for (const s of supports) {
        if (s.id === e.id) continue; // 排除自身，避免"自己支撑自己"导致永远不唤醒
        if (hasSupportBelow(selfBox, [s.box], GAME.SUPPORT_GAP)) current.push(s.id);
      }

      if (current.length === 0) {
        // 完全无支撑 → 唤醒
        Matter.Sleeping.set(body, false);
        this.supportSig.delete(e.id);
        continue;
      }

      const sig = [...current].sort().join(',');
      const prev = this.supportSig.get(e.id);
      if (prev !== undefined && shouldWakeOnSupportChange(prev.split(','), current)) {
        Matter.Sleeping.set(body, false);
      }
      this.supportSig.set(e.id, sig);
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

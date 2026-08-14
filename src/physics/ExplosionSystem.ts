/** 爆炸系统：对半径内物体施加径向力 + 衰减伤害（坍塌由物理自然产生）。本轮为能力占位实现。 */
import Matter from 'matter-js';
import { PhysicsWorld } from './PhysicsWorld';
import { EventBus } from '../core/EventBus';
import { MATERIALS } from '../config/physics';
import type { Entity } from '../entities/Entity';
import type { Target } from '../entities/Target';
import type { Block } from '../entities/Block';

export class ExplosionSystem {
  constructor(
    private readonly world: PhysicsWorld,
    private readonly bus: EventBus,
    private readonly entities: Map<string, Entity>,
  ) {}

  apply(x: number, y: number, radius: number, force: number, damage: number): void {
    const bodies = this.world.getBodies();
    for (const body of bodies) {
      if (body.isStatic) continue;
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) continue;
      const falloff = 1 - dist / radius;
      Matter.Body.applyForce(body, body.position, {
        x: (dx / (dist || 1)) * force * falloff,
        y: (dy / (dist || 1)) * force * falloff,
      });

      const id = body.plugin?.entityId as string | undefined;
      if (!id) continue;
      const entity = this.entities.get(id);
      if (!entity || !entity.active || entity.destroyed) continue;
      if (entity.type !== 'target' && entity.type !== 'block') continue;

      const dmg = entity as Target | Block;
      dmg.health -= damage * falloff;
      if (dmg.health <= 0) {
        dmg.destroy();
        dmg.markForRemoval();
        if (dmg.type === 'target') {
          this.bus.emit('TARGET_DESTROYED', {
            entityId: dmg.id,
            x: dmg.body.position.x,
            y: dmg.body.position.y,
            score: (dmg as Target).scoreValue,
          });
        } else {
          const blk = dmg as Block;
          this.bus.emit('BLOCK_DESTROYED', {
            entityId: blk.id,
            x: blk.body.position.x,
            y: blk.body.position.y,
            material: blk.material,
            score: MATERIALS[blk.material].score,
          });
        }
      }
    }
    this.bus.emit('EXPLOSION', { x, y, radius });
  }
}

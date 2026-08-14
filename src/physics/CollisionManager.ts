/** 碰撞管理：统一监听碰撞事件，判定受害者/攻击者，应用伤害并发出游戏事件。 */
import Matter from 'matter-js';
import { EventBus } from '../core/EventBus';
import { calculateDamage, type ImpactInfo } from './DamageSystem';
import { bodyEntityId, bodyEntityType, bodyIsEgg, MATERIALS } from '../config/physics';
import type { Entity } from '../entities/Entity';
import type { Target } from '../entities/Target';
import type { Block } from '../entities/Block';

export class CollisionManager {
  private readonly entities = new Map<string, Entity>();
  private readonly lastHitAt = new Map<string, number>();
  private lastProjectileHitAt = 0;
  /** 调试用：碰撞事件计数 */
  collisionCount = 0;
  private readonly handleStart: (event: Matter.IEventCollision<Matter.Engine>) => void;

  constructor(private readonly bus: EventBus) {
    this.handleStart = (ev) => this.onCollisionStart(ev);
  }

  registerEntity(e: Entity): void {
    this.entities.set(e.id, e);
  }

  unregisterEntity(id: string): void {
    this.entities.delete(id);
  }

  clear(): void {
    this.entities.clear();
    this.lastHitAt.clear();
    this.lastProjectileHitAt = 0;
  }

  attach(engine: Matter.Engine): void {
    Matter.Events.on(engine, 'collisionStart', this.handleStart);
  }

  detach(engine: Matter.Engine): void {
    Matter.Events.off(engine, 'collisionStart', this.handleStart);
  }

  private onCollisionStart(event: Matter.IEventCollision<Matter.Engine>): void {
    this.collisionCount += event.pairs.length;
    for (const pair of event.pairs) {
      this.handlePair(pair.bodyA, pair.bodyB);
    }
  }

  private handlePair(a: Matter.Body, b: Matter.Body): void {
    const aId = bodyEntityId(a);
    const bId = bodyEntityId(b);
    const aType = bodyEntityType(a);
    const bType = bodyEntityType(b);
    if (!aId || !bId || !aType || !bType) return;
    const ea = this.entities.get(aId);
    const eb = this.entities.get(bId);
    if (!ea || !eb || !ea.active || !eb.active) return;

    const impactSpeed = Math.abs(Matter.Vector.magnitude(Matter.Vector.sub(a.velocity, b.velocity)));

    // 蛋体碰撞 → 爆炸（白鸟下蛋）
    if (impactSpeed > 0.3) {
      const eggBody = bodyIsEgg(a) ? a : bodyIsEgg(b) ? b : null;
      if (eggBody) {
        const eggId = bodyEntityId(eggBody);
        const egg = eggId ? this.entities.get(eggId) : undefined;
        if (egg && egg.active && !egg.destroyed) {
          this.bus.emit('EGG_IMPACT', { x: eggBody.position.x, y: eggBody.position.y });
          egg.destroy();
          egg.markForRemoval();
        }
        return;
      }
    }

    // 角色碰撞反馈（震动/音效），即使不造成伤害
    const projectile = aType === 'projectile' ? ea : bType === 'projectile' ? eb : null;
    if (projectile && impactSpeed > 0.3) {
      const now = performance.now();
      if (now - this.lastProjectileHitAt > 40) {
        this.lastProjectileHitAt = now;
        this.bus.emit('PROJECTILE_HIT', {
          entityId: projectile.id,
          impactSpeed,
          x: projectile.body.position.x,
          y: projectile.body.position.y,
        });
      }
    }

    // 判定受害者与攻击者
    let victim: Entity | null = null;
    let attackerType: ImpactInfo['attackerType'] = 'projectile';
    let attackerMass = 0;
    let attackerMaterial: ImpactInfo['attackerMaterial'];

    if (aType === 'target' || bType === 'target') {
      const t = (aType === 'target' ? ea : eb) as Target;
      const other = aType === 'target' ? eb : ea;
      if (other.type === 'projectile') {
        victim = t; attackerType = 'projectile'; attackerMass = other.body.mass;
      } else if (other.type === 'block') {
        victim = t; attackerType = 'block'; attackerMass = other.body.mass; attackerMaterial = (other as Block).material;
      } else if (other.type === 'debris') {
        victim = t; attackerType = 'debris'; attackerMass = other.body.mass;
      }
    } else if (aType === 'block' || bType === 'block') {
      const blk = (aType === 'block' ? ea : eb) as Block;
      const other = aType === 'block' ? eb : ea;
      if (other.type === 'projectile') {
        victim = blk; attackerType = 'projectile'; attackerMass = other.body.mass;
      } else if (other.type === 'debris') {
        victim = blk; attackerType = 'debris'; attackerMass = other.body.mass;
      } else if (other.type === 'block') {
        // 块撞块：质量大的砸质量小的
        victim = other.body.mass >= blk.body.mass ? blk : other;
        const attackerBody = victim === blk ? other.body : blk.body;
        attackerType = 'block';
        attackerMass = attackerBody.mass;
        attackerMaterial = (victim === blk ? (other as Block) : blk).material;
      }
    }

    if (!victim || !victim.active || victim.destroyed) return;

    // 节流：同一受害者短时间内重复碰撞
    const now = performance.now();
    const last = this.lastHitAt.get(victim.id) ?? 0;
    if (now - last < 60) return;
    this.lastHitAt.set(victim.id, now);

    const damage = calculateDamage({ impactSpeed, attackerMass, attackerType, attackerMaterial });
    if (damage <= 0) return;

    this.applyDamage(victim, damage, impactSpeed);
  }

  private applyDamage(victim: Entity, damage: number, impactSpeed: number): void {
    if (victim.type === 'target') {
      const t = victim as Target;
      t.health -= damage;
      this.bus.emit('TARGET_DAMAGED', { entityId: t.id, health: Math.max(0, t.health), impactSpeed });
      if (t.health <= 0 && !t.destroyed) {
        t.destroy();
        t.markForRemoval();
        this.bus.emit('TARGET_DESTROYED', {
          entityId: t.id,
          x: t.body.position.x,
          y: t.body.position.y,
          score: t.scoreValue,
        });
      }
    } else if (victim.type === 'block') {
      const blk = victim as Block;
      blk.health -= damage;
      this.bus.emit('BLOCK_DAMAGED', { entityId: blk.id, health: Math.max(0, blk.health), impactSpeed });
      if (blk.health <= 0 && !blk.destroyed) {
        blk.destroy();
        blk.markForRemoval();
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
}

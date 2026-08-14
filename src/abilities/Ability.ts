/** 能力接口：黄·加速 / 蓝·分裂 / 黑·爆炸 / 白·下蛋。 */
import type { Projectile } from '../entities/Projectile';
import type { CharacterConfig } from '../config/characters';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { ExplosionSystem } from '../physics/ExplosionSystem';
import type { EventBus } from '../core/EventBus';
import type { ParticleSystem } from '../particles/ParticleSystem';
import type { AudioManager } from '../audio/AudioManager';

export interface AbilityContext {
  projectile: Projectile;
  world: PhysicsWorld;
  bus: EventBus;
  particles: ParticleSystem;
  audio: AudioManager;
  explosion: ExplosionSystem;
  /** 生成额外角色刚体（分裂/下蛋用），自动加入世界/碰撞/实体列表 */
  spawnProjectile(
    config: CharacterConfig,
    x: number,
    y: number,
    velocity: { x: number; y: number },
  ): Projectile;
  /** 移除某个角色刚体（爆炸用） */
  removeProjectile(p: Projectile): void;
}

export interface Ability {
  id: string;
  trigger(ctx: AbilityContext): void;
}

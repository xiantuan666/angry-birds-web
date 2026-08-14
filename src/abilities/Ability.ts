/** 能力接口（本轮仅 basic 可用，其余下一轮实现）。 */
import type { Projectile } from '../entities/Projectile';
import type { PhysicsWorld } from '../physics/PhysicsWorld';
import type { EventBus } from '../core/EventBus';
import type { ParticleSystem } from '../particles/ParticleSystem';
import type { AudioManager } from '../audio/AudioManager';

export interface AbilityContext {
  projectile: Projectile;
  world: PhysicsWorld;
  bus: EventBus;
  particles: ParticleSystem;
  audio: AudioManager;
}

export interface Ability {
  id: string;
  trigger(ctx: AbilityContext): void;
}

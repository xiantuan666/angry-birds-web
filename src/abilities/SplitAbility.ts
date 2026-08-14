/** 蓝鸟·分裂：一个变三个真实刚体，各自参与碰撞伤害。 */
import Matter from 'matter-js';
import { ABILITIES } from '../config/abilities';
import { splitVelocities } from '../utils/math';
import type { Ability, AbilityContext } from './Ability';

export class SplitAbility implements Ability {
  readonly id = 'split';

  trigger(ctx: AbilityContext): void {
    const { projectile, spawnProjectile } = ctx;
    const pos = projectile.body.position;
    const vel = projectile.body.velocity;
    const speeds = splitVelocities(vel, ABILITIES.SPLIT_COUNT, ABILITIES.SPLIT_SPREAD, ABILITIES.SPLIT_MAGNITUDE);
    const len = Math.hypot(vel.x, vel.y) || 1;
    const perp = { x: -vel.y / len, y: vel.x / len };
    const offset = 12;
    spawnProjectile(projectile.config, pos.x - perp.x * offset, pos.y - perp.y * offset, speeds[0]);
    spawnProjectile(projectile.config, pos.x + perp.x * offset, pos.y + perp.y * offset, speeds[2]);
    Matter.Body.setVelocity(projectile.body, speeds[1]);
  }
}

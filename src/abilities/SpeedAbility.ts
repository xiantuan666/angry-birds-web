/** 黄鸟·加速：飞行中点击，速度提升并附带粒子/音效。 */
import Matter from 'matter-js';
import { ABILITIES } from '../config/abilities';
import { boostVelocity } from '../utils/math';
import type { Ability, AbilityContext } from './Ability';

export class SpeedAbility implements Ability {
  readonly id = 'speed';

  trigger(ctx: AbilityContext): void {
    const { projectile, particles, audio } = ctx;
    const boosted = boostVelocity(projectile.body.velocity, ABILITIES.SPEED_MULTIPLIER, ABILITIES.SPEED_MAX);
    Matter.Body.setVelocity(projectile.body, boosted);
    const pos = projectile.body.position;
    for (let i = 0; i < 8; i++) {
      particles.spawn(pos.x, pos.y, {
        color: '#ffd54f',
        size: 3,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 0.45,
        gravity: 0,
      });
    }
    audio.play('launch');
  }
}

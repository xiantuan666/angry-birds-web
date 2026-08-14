/** 黑鸟·爆炸：点击即在当前位置爆炸（力 + 伤害按距离衰减），角色消失。 */
import { ABILITIES } from '../config/abilities';
import type { Ability, AbilityContext } from './Ability';

export class ExplosiveAbility implements Ability {
  readonly id = 'explosive';

  trigger(ctx: AbilityContext): void {
    const { projectile, explosion, removeProjectile } = ctx;
    explosion.apply(
      projectile.body.position.x,
      projectile.body.position.y,
      ABILITIES.EXPLOSION_RADIUS,
      ABILITIES.EXPLOSION_FORCE,
      ABILITIES.EXPLOSION_DAMAGE,
    );
    removeProjectile(projectile);
  }
}

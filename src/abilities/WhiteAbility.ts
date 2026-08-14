/** 白鸟·重体+下蛋：点击下蛋，蛋落地/撞击爆炸；白鸟本身重体继续飞行。 */
import { ABILITIES } from '../config/abilities';
import type { CharacterConfig } from '../config/characters';
import type { Ability, AbilityContext } from './Ability';

export class WhiteAbility implements Ability {
  readonly id = 'white';

  trigger(ctx: AbilityContext): void {
    const { projectile, spawnProjectile } = ctx;
    const eggConfig: CharacterConfig = {
      id: 'egg',
      name: '蛋',
      sprite: '',
      radius: ABILITIES.EGG_RADIUS,
      mass: ABILITIES.EGG_MASS,
      density: 0.002,
      friction: 0.5,
      restitution: 0.1,
      launchPower: 0,
      ability: 'basic',
    };
    const pos = projectile.body.position;
    const egg = spawnProjectile(eggConfig, pos.x, pos.y + ABILITIES.EGG_RADIUS * 2, {
      x: 0,
      y: ABILITIES.EGG_DROP_SPEED,
    });
    (egg.body.plugin as Record<string, unknown>).isEgg = true;
    // 蛋不与其他角色刚体碰撞（避免与白鸟/分裂鸟瞬间碰撞），只与地面/方块/目标碰撞后爆炸
    egg.body.collisionFilter.mask = 0xfffe; // 0xffff & ~PROJECTILE(0x0001)
  }
}

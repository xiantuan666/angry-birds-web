/** 角色能力参数（集中配置，禁止魔法数字）。 */

export const ABILITIES = {
  /** 黄鸟·加速：速度倍率与上限 */
  SPEED_MULTIPLIER: 1.6,
  SPEED_MAX: 45,
  /** 蓝鸟·分裂：数量、两侧展开弧度、侧翼速度倍率 */
  SPLIT_COUNT: 3,
  SPLIT_SPREAD: 0.12,
  SPLIT_MAGNITUDE: 0.95,
  /** 黑鸟·爆炸 */
  EXPLOSION_RADIUS: 220,
  EXPLOSION_FORCE: 0.06,
  EXPLOSION_DAMAGE: 80,
  /** 白鸟·下蛋 */
  EGG_RADIUS: 8,
  EGG_MASS: 0.3,
  EGG_DROP_SPEED: 4,
  EGG_EXPLOSION_RADIUS: 90,
  EGG_EXPLOSION_FORCE: 0.03,
  EGG_EXPLOSION_DAMAGE: 50,
} as const;
